import httpStatus from "http-status";
import { SubscriptionPlanType, SubscriptionStatus } from "@prisma/client";
import ApiError from "../../../errors/ApiErrors";
import { IPaginationOptions } from "../../../interfaces/paginations";
import prisma from "../../../shared/prisma";
import { paginationHelpers } from "../../../utils/paginationHelper";
import { ISubscriptionFilterRequest, ISubscriptionStats } from "./subscription.interface";
import { buildPrismaWhere } from "../../../utils/queryBuilder";
import { enumToUi, formatDate, uiToEnum } from "../../../utils/formatters";

// Helper to format a subscription item for the frontend
const formatSubscriptionItem = (item: any) => ({
  id: item.id,
  pioneerId: item.pioneerId,
  pioneerName: item.pioneer?.name || "Unknown",
  pioneerInitials: item.pioneer?.initials || "??",
  plan: enumToUi(item.plan) as "Monthly" | "Annual",
  amount: `$${item.amount.toLocaleString()}`,
  startDate: formatDate(item.startDate),
  renewalDate: formatDate(item.renewalDate),
  status: enumToUi(item.status) as "Active" | "Expired" | "Pending" | "None",
});

const getSubscriptionStats = async (): Promise<ISubscriptionStats> => {
  const [activeSubsCount, monthlySubs, annualSubs] = await Promise.all([
    prisma.subscription.count({ where: { status: SubscriptionStatus.ACTIVE } }),
    prisma.subscription.findMany({
      where: { status: SubscriptionStatus.ACTIVE, plan: SubscriptionPlanType.MONTHLY },
      select: { amount: true },
    }),
    prisma.subscription.findMany({
      where: { status: SubscriptionStatus.ACTIVE, plan: SubscriptionPlanType.ANNUAL },
      select: { amount: true },
    }),
  ]);

  const monthlyRev = monthlySubs.reduce((acc, curr) => acc + curr.amount, 0);
  const annualRev = annualSubs.reduce((acc, curr) => acc + curr.amount, 0);

  return {
    activeSubscriptions: activeSubsCount,
    monthlyPlans: monthlySubs.length,
    annualPlans: annualSubs.length,
    monthlyRevenue: `$${monthlyRev.toLocaleString()}`,
    annualRevenue: `$${annualRev.toLocaleString()}`,
  };
};

const getAllSubscriptions = async (
  filters: ISubscriptionFilterRequest,
  options: IPaginationOptions
) => {
  const { limit, page, skip, sortBy, sortOrder } =
    paginationHelpers.calculatePagination(options);
  const { searchTerm, plan, status, ...otherFilters } = filters;

  const normalizedFilters: Record<string, any> = {
    ...otherFilters,
    ...(plan ? { plan: uiToEnum(plan as any) } : {}),
    ...(status ? { status: uiToEnum(status as any) } : {}),
  };

  // Subscription search is on the related pioneer's name
  const customConditions: any[] = [];
  if (searchTerm) {
    customConditions.push({
      pioneer: { name: { contains: searchTerm, mode: "insensitive" } },
    });
  }

  const whereConditions = buildPrismaWhere(
    undefined, // searchTerm handled via customConditions above
    [],
    normalizedFilters,
    customConditions
  );

  const [result, total] = await Promise.all([
    prisma.subscription.findMany({
      where: whereConditions,
      skip,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
      include: {
        pioneer: {
          select: { id: true, name: true, initials: true },
        },
      },
    }),
    prisma.subscription.count({ where: whereConditions }),
  ]);

  return {
    meta: {
      page,
      limit,
      total,
      totalPage: Math.ceil(total / limit),
    },
    data: result.map(formatSubscriptionItem),
  };
};

const updateSubscription = async (
  id: string,
  payload: { status?: string; plan?: string; renewalDate?: Date }
) => {
  const existing = await prisma.subscription.findUnique({ where: { id } });
  if (!existing) {
    throw new ApiError(httpStatus.NOT_FOUND, "Subscription not found!");
  }

  const normalizedData: any = { ...payload };
  if (payload.status) normalizedData.status = uiToEnum(payload.status) as SubscriptionStatus;
  if (payload.plan) normalizedData.plan = uiToEnum(payload.plan) as SubscriptionPlanType;

  const updated = await prisma.subscription.update({
    where: { id },
    data: normalizedData,
    include: { pioneer: { select: { id: true, name: true, initials: true } } },
  });

  return formatSubscriptionItem(updated);
};

export const SubscriptionService = {
  getSubscriptionStats,
  getAllSubscriptions,
  updateSubscription,
};
