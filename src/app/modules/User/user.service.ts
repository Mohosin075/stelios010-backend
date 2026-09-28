import bcrypt from "bcryptjs";
import httpStatus from "http-status";
import { AccountStatus, ProfileType, User, UserRole, UserStatus, VerificationStatus } from "@prisma/client";
import ApiError from "../../../errors/ApiErrors";
import { IPaginationOptions } from "../../../interfaces/paginations";
import prisma from "../../../shared/prisma";
import { paginationHelpers } from "../../../utils/paginationHelper";
import { userSearchableFields } from "./user.constant";
import { IUserFilterRequest } from "./user.interface";
import { buildPrismaWhere } from "../../../utils/queryBuilder";
import { enumToUi, formatDate, getInitials, getIsYellowAvatar, uiToEnum } from "../../../utils/formatters";

// Helper to format user entity to frontend UserItem shape
const formatUserItem = (user: any) => ({
  id: user.id,
  name: user.name || "Anonymous",
  email: user.email,
  initials: getInitials(user.name),
  isYellowAvatar: getIsYellowAvatar(user.name),
  profileType: enumToUi(user.profileType) as "Active User" | "Future User",
  location: user.location || `${user.city || ""}, ${user.country || ""}`.trim().replace(/^,|,$/g, "") || "Global",
  country: user.country,
  region: user.region,
  city: user.city,
  age: user.age,
  bio: user.bio,
  bionicLookingFor: user.bionicLookingFor || "None specified",
  isBionicProduct: Boolean(user.isBionicProduct),
  verificationStatus: enumToUi(user.verificationStatus) as "Verified" | "Pending" | "Unverified",
  joinedDate: formatDate(user.createdAt),
  accountStatus: user.accountStatus === AccountStatus.SUSPENDED ? "Suspended" : "Active",
  suspensionReason: user.suspensionReason,
  bionicProducts: user.bionicProducts?.map((p: any) => ({
    id: p.id,
    name: p.name,
    brand: p.brand,
    category: p.category,
    status: enumToUi(p.status) as "Verified" | "Pending",
  })) || [],
  masterIndicators: user.masterIndicators
    ? {
        originOfAmputation: user.masterIndicators.originOfAmputation,
        anatomicalBaseline: user.masterIndicators.anatomicalBaseline,
      }
    : undefined,
});

const createUser = async (payload: any): Promise<any> => {
  const existingUser = await prisma.user.findUnique({
    where: { email: payload.email },
  });

  if (existingUser) {
    throw new ApiError(httpStatus.CONFLICT, "User with this email already exists!");
  }

  const hashedPassword = await bcrypt.hash(payload.password, 12);

  const newUser = await prisma.user.create({
    data: {
      ...payload,
      password: hashedPassword,
      role: payload.role || UserRole.USER,
      profileType: (uiToEnum(payload.profileType) as ProfileType) || ProfileType.ACTIVE_USER,
    },
    include: {
      bionicProducts: true,
      masterIndicators: true,
    },
  });

  return formatUserItem(newUser);
};

const getAllUsers = async (
  filters: IUserFilterRequest,
  options: IPaginationOptions
) => {
  const { limit, page, skip, sortBy, sortOrder } =
    paginationHelpers.calculatePagination(options);
  const { searchTerm, profileType, accountStatus, verificationStatus, ...otherFilters } = filters;

  // Normalize frontend query strings to DB Enums
  const normalizedFilters: Record<string, any> = {
    ...otherFilters,
    ...(profileType ? { profileType: uiToEnum(profileType) } : {}),
    ...(accountStatus ? { accountStatus: uiToEnum(accountStatus) } : {}),
    ...(verificationStatus ? { verificationStatus: uiToEnum(verificationStatus) } : {}),
  };

  const whereConditions = buildPrismaWhere(
    searchTerm,
    userSearchableFields,
    normalizedFilters,
    [{ status: { not: UserStatus.DELETED } }]
  );

  const [result, total] = await Promise.all([
    prisma.user.findMany({
      where: whereConditions,
      skip,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
      include: {
        bionicProducts: true,
        masterIndicators: true,
      },
    }),
    prisma.user.count({ where: whereConditions }),
  ]);

  return {
    meta: {
      page,
      limit,
      total,
      totalPage: Math.ceil(total / limit),
    },
    data: result.map(formatUserItem),
  };
};

const getUserById = async (id: string) => {
  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      bionicProducts: true,
      masterIndicators: true,
    },
  });

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found!");
  }

  return formatUserItem(user);
};

const updateUser = async (id: string, payload: any) => {
  const existingUser = await prisma.user.findUnique({ where: { id } });
  if (!existingUser) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found!");
  }

  if (payload.email && payload.email !== existingUser.email) {
    const emailTaken = await prisma.user.findUnique({ where: { email: payload.email } });
    if (emailTaken) {
      throw new ApiError(httpStatus.CONFLICT, "Email is already taken!");
    }
  }

  const normalizedData: any = { ...payload };
  if (payload.profileType) normalizedData.profileType = uiToEnum(payload.profileType);
  if (payload.verificationStatus) normalizedData.verificationStatus = uiToEnum(payload.verificationStatus);
  if (payload.accountStatus) normalizedData.accountStatus = uiToEnum(payload.accountStatus);

  const updatedUser = await prisma.user.update({
    where: { id },
    data: normalizedData,
    include: {
      bionicProducts: true,
      masterIndicators: true,
    },
  });

  return formatUserItem(updatedUser);
};

const suspendUser = async (id: string, reason: string) => {
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found!");
  }

  const updated = await prisma.user.update({
    where: { id },
    data: {
      accountStatus: AccountStatus.SUSPENDED,
      status: UserStatus.SUSPENDED,
      suspensionReason: reason,
    },
  });

  return {
    id: updated.id,
    name: updated.name,
    accountStatus: "Suspended",
    suspensionReason: updated.suspensionReason,
  };
};

const reactivateUser = async (id: string) => {
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found!");
  }

  const updated = await prisma.user.update({
    where: { id },
    data: {
      accountStatus: AccountStatus.ACTIVE,
      status: UserStatus.ACTIVE,
      suspensionReason: null,
    },
  });

  return {
    id: updated.id,
    name: updated.name,
    accountStatus: "Active",
  };
};

const deleteUser = async (id: string) => {
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found!");
  }

  await prisma.user.update({
    where: { id },
    data: { status: UserStatus.DELETED },
  });

  return { message: "User deleted successfully!" };
};

export const UserService = {
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
  suspendUser,
  reactivateUser,
  deleteUser,
};
