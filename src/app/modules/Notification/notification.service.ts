import httpStatus from "http-status";
import { Notification, NotificationStatus } from "@prisma/client";
import ApiError from "../../../errors/ApiErrors";
import { IPaginationOptions } from "../../../interfaces/paginations";
import prisma from "../../../shared/prisma";
import { paginationHelpers } from "../../../utils/paginationHelper";
import { buildPrismaWhere } from "../../../utils/queryBuilder";
import { enumToUi, formatDate } from "../../../utils/formatters";

const notificationSearchableFields = ["title", "description", "audience"];

// Helper to format a notification item for the frontend
const formatNotificationItem = (n: any) => ({
  id: n.id,
  title: n.title,
  description: n.description,
  audience: n.audience,
  date: formatDate(n.createdAt),
  scheduledAt: n.scheduledAt ? formatDate(n.scheduledAt) : undefined,
  status: enumToUi(n.status) as "Sent" | "Scheduled",
});

const createNotification = async (payload: Partial<Notification>) => {
  if (!payload.title || !payload.description) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Title and description are required");
  }

  const result = await prisma.notification.create({
    data: {
      title: payload.title,
      description: payload.description,
      audience: payload.audience || "All Users",
      status: payload.status || NotificationStatus.SENT,
      scheduledAt: payload.scheduledAt,
    },
  });

  return formatNotificationItem(result);
};

const getAllNotifications = async (
  filters: { status?: NotificationStatus; searchTerm?: string },
  options: IPaginationOptions
) => {
  const { limit, page, skip, sortBy, sortOrder } =
    paginationHelpers.calculatePagination(options);
  const { searchTerm, status } = filters;

  const normalizedFilters: Record<string, any> = {
    ...(status ? { status } : {}),
  };

  const whereConditions = buildPrismaWhere(
    searchTerm,
    notificationSearchableFields,
    normalizedFilters
  );

  const [result, total] = await Promise.all([
    prisma.notification.findMany({
      where: whereConditions,
      skip,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
    }),
    prisma.notification.count({ where: whereConditions }),
  ]);

  return {
    meta: { page, limit, total, totalPage: Math.ceil(total / limit) },
    data: result.map(formatNotificationItem),
  };
};

export const NotificationService = {
  createNotification,
  getAllNotifications,
};
