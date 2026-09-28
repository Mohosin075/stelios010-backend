import httpStatus from "http-status";
import { CommunityMeet, CommunityMeetStatus, SupportGroup, SupportGroupStatus } from "@prisma/client";
import ApiError from "../../../errors/ApiErrors";
import { IPaginationOptions } from "../../../interfaces/paginations";
import prisma from "../../../shared/prisma";
import { paginationHelpers } from "../../../utils/paginationHelper";
import { ICommunityMeetFilter, ISupportGroupFilter } from "./community.interface";
import { buildPrismaWhere } from "../../../utils/queryBuilder";
import { enumToUi } from "../../../utils/formatters";

const supportGroupSearchableFields = ["title", "description"];
const communityMeetSearchableFields = ["title", "host", "location"];

// ----------------- SUPPORT GROUPS -----------------

const getAllSupportGroups = async (
  filters: ISupportGroupFilter,
  options: IPaginationOptions
) => {
  const { limit, page, skip, sortBy, sortOrder } =
    paginationHelpers.calculatePagination(options);
  const { searchTerm, status, ...otherFilters } = filters;

  const normalizedFilters: Record<string, any> = {
    ...otherFilters,
    ...(status ? { status } : {}),
  };

  const whereConditions = buildPrismaWhere(
    searchTerm,
    supportGroupSearchableFields,
    normalizedFilters
  );

  const [result, total] = await Promise.all([
    prisma.supportGroup.findMany({
      where: whereConditions,
      skip,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
    }),
    prisma.supportGroup.count({ where: whereConditions }),
  ]);

  return {
    meta: { page, limit, total, totalPage: Math.ceil(total / limit) },
    data: result.map((g) => ({
      id: g.id,
      title: g.title,
      description: g.description,
      membersCount: g.membersCount,
      status: enumToUi(g.status) as "Active" | "Disabled",
    })),
  };
};

const createSupportGroup = async (payload: Partial<SupportGroup>) => {
  if (!payload.title) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Title is required");
  }

  const result = await prisma.supportGroup.create({
    data: {
      title: payload.title,
      description: payload.description || "",
      membersCount: payload.membersCount || 0,
      status: payload.status || SupportGroupStatus.ACTIVE,
    },
  });

  return result;
};

const toggleSupportGroupStatus = async (id: string) => {
  const existing = await prisma.supportGroup.findUnique({ where: { id } });
  if (!existing) {
    throw new ApiError(httpStatus.NOT_FOUND, "Support group not found!");
  }

  const newStatus =
    existing.status === SupportGroupStatus.ACTIVE
      ? SupportGroupStatus.DISABLED
      : SupportGroupStatus.ACTIVE;

  const updated = await prisma.supportGroup.update({
    where: { id },
    data: { status: newStatus },
  });

  return updated;
};

// ----------------- COMMUNITY MEETS -----------------

const getAllCommunityMeets = async (
  filters: ICommunityMeetFilter,
  options: IPaginationOptions
) => {
  const { limit, page, skip, sortBy, sortOrder } =
    paginationHelpers.calculatePagination(options);
  const { searchTerm, status, ...otherFilters } = filters;

  const normalizedFilters: Record<string, any> = {
    ...otherFilters,
    ...(status ? { status } : {}),
  };

  const whereConditions = buildPrismaWhere(
    searchTerm,
    communityMeetSearchableFields,
    normalizedFilters
  );

  const [result, total] = await Promise.all([
    prisma.communityMeet.findMany({
      where: whereConditions,
      skip,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
    }),
    prisma.communityMeet.count({ where: whereConditions }),
  ]);

  return {
    meta: { page, limit, total, totalPage: Math.ceil(total / limit) },
    data: result.map((m) => ({
      id: m.id,
      title: m.title,
      host: m.host,
      date: m.date,
      location: m.location,
      participantsCount: m.participantsCount,
      status: enumToUi(m.status) as "Upcoming" | "Completed",
    })),
  };
};

const createCommunityMeet = async (payload: Partial<CommunityMeet>) => {
  if (!payload.title || !payload.host || !payload.date || !payload.location) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Title, host, date, and location are required");
  }

  const result = await prisma.communityMeet.create({
    data: {
      title: payload.title,
      host: payload.host,
      date: payload.date,
      location: payload.location,
      participantsCount: payload.participantsCount || 0,
      status: payload.status || CommunityMeetStatus.UPCOMING,
    },
  });

  return result;
};

const deleteCommunityMeet = async (id: string) => {
  const existing = await prisma.communityMeet.findUnique({ where: { id } });
  if (!existing) {
    throw new ApiError(httpStatus.NOT_FOUND, "Meetup not found!");
  }

  await prisma.communityMeet.delete({ where: { id } });

  return { message: "Community meetup removed successfully!" };
};

export const CommunityService = {
  getAllSupportGroups,
  createSupportGroup,
  toggleSupportGroupStatus,
  getAllCommunityMeets,
  createCommunityMeet,
  deleteCommunityMeet,
};
