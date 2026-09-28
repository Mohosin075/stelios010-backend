import httpStatus from "http-status";
import { ActivityType, LimbCategory, VerificationStatus } from "@prisma/client";
import ApiError from "../../../errors/ApiErrors";
import { IPaginationOptions } from "../../../interfaces/paginations";
import prisma from "../../../shared/prisma";
import { paginationHelpers } from "../../../utils/paginationHelper";
import { verificationSearchableFields } from "./verification.constant";
import { IVerificationFilterRequest } from "./verification.interface";
import { buildPrismaWhere } from "../../../utils/queryBuilder";
import { enumToUi, formatDate, getInitials, getIsYellowAvatar, uiToEnum } from "../../../utils/formatters";

const formatVerificationItem = (item: any) => ({
  id: item.id,
  userName: item.user?.name || "Anonymous User",
  userLocation: item.user?.location || `${item.user?.city || ""}, ${item.user?.country || ""}`.trim().replace(/^,|,$/g, "") || "Global",
  userInitials: getInitials(item.user?.name),
  isYellowAvatar: getIsYellowAvatar(item.user?.name),
  productName: item.productName,
  brand: item.brand,
  limb: item.limb === LimbCategory.UPPER_LIMB ? "Upper Limb" : "Lower Limb",
  submissionDate: formatDate(item.submissionDate),
  status:
    item.status === VerificationStatus.VERIFIED
      ? "Approved"
      : item.status === VerificationStatus.UNSUCCESSFUL
      ? "Unsuccessful"
      : "Pending",
  videoUrl: item.videoUrl,
  videoDuration: item.videoDuration,
  unsuccessfulReason: item.unsuccessfulReason,
  productHistory: item.user?.bionicProducts?.map((p: any) => ({
    name: p.name,
    status: enumToUi(p.status) as "Verified" | "Unsuccessful" | "Pending",
  })) || [
    { name: item.productName, status: enumToUi(item.status) as any },
  ],
});

const getAllVerifications = async (
  filters: IVerificationFilterRequest,
  options: IPaginationOptions
) => {
  const { limit, page, skip, sortBy, sortOrder } =
    paginationHelpers.calculatePagination(options);
  const { searchTerm, status, limb, ...filterData } = filters;

  const normalizedFilters: Record<string, any> = {
    ...filterData,
    ...(status ? { status: status === "Approved" ? VerificationStatus.VERIFIED : (uiToEnum(status as any) as VerificationStatus) } : {}),
    ...(limb ? { limb: uiToEnum(limb as any) } : {}),
  };

  const whereConditions = buildPrismaWhere(
    searchTerm,
    verificationSearchableFields,
    normalizedFilters
  );

  const [result, total, counts] = await Promise.all([
    prisma.verification.findMany({
      where: whereConditions,
      skip,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            location: true,
            city: true,
            country: true,
            bionicProducts: true,
          },
        },
      },
    }),
    prisma.verification.count({ where: whereConditions }),
    prisma.$transaction([
      prisma.verification.count({ where: { status: VerificationStatus.PENDING } }),
      prisma.verification.count({ where: { status: VerificationStatus.VERIFIED } }),
      prisma.verification.count({ where: { status: VerificationStatus.UNSUCCESSFUL } }),
    ]),
  ]);

  return {
    meta: {
      page,
      limit,
      total,
      totalPage: Math.ceil(total / limit),
      counts: {
        pending: counts[0],
        approved: counts[1],
        unsuccessful: counts[2],
      },
    },
    data: result.map(formatVerificationItem),
  };
};

const getVerificationById = async (id: string) => {
  const verification = await prisma.verification.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          avatar: true,
          location: true,
          city: true,
          country: true,
          bionicProducts: true,
        },
      },
    },
  });

  if (!verification) {
    throw new ApiError(httpStatus.NOT_FOUND, "Verification record not found!");
  }

  return formatVerificationItem(verification);
};

const approveVerification = async (id: string) => {
  const verification = await prisma.verification.findUnique({
    where: { id },
    include: { user: true },
  });

  if (!verification) {
    throw new ApiError(httpStatus.NOT_FOUND, "Verification not found!");
  }

  const updated = await prisma.$transaction(async (tx) => {
    const approved = await tx.verification.update({
      where: { id },
      data: {
        status: VerificationStatus.VERIFIED,
        unsuccessfulReason: null,
      },
    });

    await tx.user.update({
      where: { id: verification.userId },
      data: { verificationStatus: VerificationStatus.VERIFIED },
    });

    const existingProduct = await tx.userBionicProduct.findFirst({
      where: {
        userId: verification.userId,
        name: verification.productName,
      },
    });

    if (existingProduct) {
      await tx.userBionicProduct.update({
        where: { id: existingProduct.id },
        data: { status: VerificationStatus.VERIFIED },
      });
    } else {
      await tx.userBionicProduct.create({
        data: {
          userId: verification.userId,
          name: verification.productName,
          brand: verification.brand,
          category: verification.limb === LimbCategory.UPPER_LIMB ? "Upper Limb" : "Lower Limb",
          status: VerificationStatus.VERIFIED,
        },
      });
    }

    await tx.activityLog.create({
      data: {
        title: `Verification approved for ${verification.user.name || "User"}`,
        subtitle: `${verification.productName} (${verification.brand})`,
        type: ActivityType.VERIFICATION,
      },
    });

    return approved;
  });

  return formatVerificationItem(updated);
};

const rejectVerification = async (id: string, reason: string) => {
  const verification = await prisma.verification.findUnique({
    where: { id },
    include: { user: true },
  });

  if (!verification) {
    throw new ApiError(httpStatus.NOT_FOUND, "Verification not found!");
  }

  const updated = await prisma.$transaction(async (tx) => {
    const rejected = await tx.verification.update({
      where: { id },
      data: {
        status: VerificationStatus.UNSUCCESSFUL,
        unsuccessfulReason: reason,
      },
    });

    await tx.activityLog.create({
      data: {
        title: `Verification rejected for ${verification.user.name || "User"}`,
        subtitle: reason,
        type: ActivityType.VERIFICATION,
      },
    });

    return rejected;
  });

  return formatVerificationItem(updated);
};

export const VerificationService = {
  getAllVerifications,
  getVerificationById,
  approveVerification,
  rejectVerification,
};
