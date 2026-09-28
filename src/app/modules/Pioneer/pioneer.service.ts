import httpStatus from "http-status";
import { ClaimedStatus, Pioneer, SubscriptionPlanType, SubscriptionStatus, VerificationStatus } from "@prisma/client";
import ApiError from "../../../errors/ApiErrors";
import { IPaginationOptions } from "../../../interfaces/paginations";
import prisma from "../../../shared/prisma";
import { paginationHelpers } from "../../../utils/paginationHelper";
import { pioneerSearchableFields } from "./pioneer.constant";
import { IPioneerFilterRequest } from "./pioneer.interface";
import { buildPrismaWhere } from "../../../utils/queryBuilder";
import { enumToUi, formatDate, getInitials, uiToEnum } from "../../../utils/formatters";

const formatPioneerItem = (p: any) => ({
  id: p.id,
  name: p.name,
  initials: p.initials || getInitials(p.name),
  website: p.website || "",
  location: p.location || `${p.city || ""}, ${p.country || ""}`.trim().replace(/^,|,$/g, "") || "Global",
  country: p.country,
  region: p.region,
  city: p.city,
  bio: p.bio,
  productCount: p._count?.products ?? (p.products?.length || 0),
  claimedStatus: p.claimedStatus === ClaimedStatus.CLAIMED ? "Claimed" : "Unclaimed",
  subscriptionStatus:
    p.subscriptionStatus === SubscriptionStatus.ACTIVE
      ? "Active"
      : p.subscriptionStatus === SubscriptionStatus.EXPIRED
      ? "Expired"
      : "None",
  verificationStatus: p.verificationStatus === VerificationStatus.VERIFIED ? "Verified" : "Unverified",
  subscriptionPlan: p.subscriptionPlan ? (p.subscriptionPlan === SubscriptionPlanType.ANNUAL ? "Annual" : "Monthly") : undefined,
  subscriptionStartDate: formatDate(p.subscriptionStartDate),
  subscriptionRenewalDate: formatDate(p.subscriptionRenewalDate),
  createdAt: formatDate(p.createdAt),
  products: p.products?.map((prod: any) => ({
    id: prod.id,
    name: prod.name,
    category: enumToUi(prod.limbCategory) || prod.category,
    status: prod.status === "ACTIVE" ? "Active" : "Inactive",
  })) || [],
});

const createPioneer = async (payload: Partial<Pioneer>): Promise<any> => {
  if (!payload.name) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Pioneer name is required");
  }

  const result = await prisma.pioneer.create({
    data: {
      ...payload,
      initials: payload.initials || getInitials(payload.name),
      claimedStatus: (uiToEnum(payload.claimedStatus as any) as any) || ClaimedStatus.UNCLAIMED,
      subscriptionStatus: (uiToEnum(payload.subscriptionStatus as any) as any) || SubscriptionStatus.NONE,
      verificationStatus: (uiToEnum(payload.verificationStatus as any) as any) || VerificationStatus.UNVERIFIED,
      subscriptionPlan: payload.subscriptionPlan ? (uiToEnum(payload.subscriptionPlan as any) as any) : undefined,
    } as any,
    include: { products: true },
  });

  return formatPioneerItem(result);
};

const getAllPioneers = async (
  filters: IPioneerFilterRequest,
  options: IPaginationOptions
) => {
  const { limit, page, skip, sortBy, sortOrder } =
    paginationHelpers.calculatePagination(options);
  const { searchTerm, claimedStatus, subscriptionStatus, verificationStatus, ...otherFilters } = filters;

  const normalizedFilters: Record<string, any> = {
    ...otherFilters,
    ...(claimedStatus ? { claimedStatus: uiToEnum(claimedStatus as any) } : {}),
    ...(subscriptionStatus ? { subscriptionStatus: uiToEnum(subscriptionStatus as any) } : {}),
    ...(verificationStatus ? { verificationStatus: uiToEnum(verificationStatus as any) } : {}),
  };

  const whereConditions = buildPrismaWhere(
    searchTerm,
    pioneerSearchableFields,
    normalizedFilters
  );

  const [result, total] = await Promise.all([
    prisma.pioneer.findMany({
      where: whereConditions,
      skip,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
      include: {
        _count: { select: { products: true } },
        products: true,
      },
    }),
    prisma.pioneer.count({ where: whereConditions }),
  ]);

  return {
    meta: {
      page,
      limit,
      total,
      totalPage: Math.ceil(total / limit),
    },
    data: result.map(formatPioneerItem),
  };
};

const getPioneerById = async (id: string) => {
  const pioneer = await prisma.pioneer.findUnique({
    where: { id },
    include: {
      products: true,
      subscriptions: {
        orderBy: { createdAt: "desc" },
        take: 5,
      },
    },
  });

  if (!pioneer) {
    throw new ApiError(httpStatus.NOT_FOUND, "Pioneer not found!");
  }

  return formatPioneerItem(pioneer);
};

const updatePioneer = async (id: string, payload: any) => {
  const existing = await prisma.pioneer.findUnique({ where: { id } });
  if (!existing) {
    throw new ApiError(httpStatus.NOT_FOUND, "Pioneer not found!");
  }

  const normalizedData: any = { ...payload };
  if (payload.claimedStatus) normalizedData.claimedStatus = uiToEnum(payload.claimedStatus);
  if (payload.subscriptionStatus) normalizedData.subscriptionStatus = uiToEnum(payload.subscriptionStatus);
  if (payload.verificationStatus) normalizedData.verificationStatus = uiToEnum(payload.verificationStatus);
  if (payload.subscriptionPlan) normalizedData.subscriptionPlan = uiToEnum(payload.subscriptionPlan);

  const updated = await prisma.pioneer.update({
    where: { id },
    data: normalizedData,
    include: { products: true },
  });

  return formatPioneerItem(updated);
};

const deletePioneer = async (id: string) => {
  const existing = await prisma.pioneer.findUnique({ where: { id } });
  if (!existing) {
    throw new ApiError(httpStatus.NOT_FOUND, "Pioneer not found!");
  }

  await prisma.pioneer.delete({ where: { id } });

  return { message: "Pioneer deleted successfully!" };
};

export const PioneerService = {
  createPioneer,
  getAllPioneers,
  getPioneerById,
  updatePioneer,
  deletePioneer,
};
