import httpStatus from "http-status";
import { Report, ReportStatus, ReportType } from "@prisma/client";
import ApiError from "../../../errors/ApiErrors";
import { IPaginationOptions } from "../../../interfaces/paginations";
import prisma from "../../../shared/prisma";
import { paginationHelpers } from "../../../utils/paginationHelper";
import { buildPrismaWhere } from "../../../utils/queryBuilder";
import { enumToUi, formatDate } from "../../../utils/formatters";

const reportSearchableFields = ["reportedItem", "reason"];

// Helper to format a report item for the frontend
const formatReportItem = (r: any) => ({
  id: r.id,
  reportedItem: r.reportedItem,
  type: enumToUi(r.type) as "Profile" | "Support Discussion",
  reportedBy: r.reportedBy?.name || r.reporterName || "Anonymous User",
  reason: r.reason,
  date: formatDate(r.createdAt),
  status: enumToUi(r.status) as "Open" | "Resolved",
});

const createReport = async (payload: Partial<Report>) => {
  const result = await prisma.report.create({
    data: payload as any,
  });
  return formatReportItem(result);
};

const getAllReports = async (
  filters: { status?: ReportStatus; type?: ReportType; searchTerm?: string },
  options: IPaginationOptions
) => {
  const { limit, page, skip, sortBy, sortOrder } =
    paginationHelpers.calculatePagination(options);
  const { searchTerm, status, type } = filters;

  const normalizedFilters: Record<string, any> = {
    ...(status ? { status } : {}),
    ...(type ? { type } : {}),
  };

  const whereConditions = buildPrismaWhere(
    searchTerm,
    reportSearchableFields,
    normalizedFilters
  );

  const [result, total, counts] = await Promise.all([
    prisma.report.findMany({
      where: whereConditions,
      skip,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
      include: {
        reportedBy: { select: { id: true, name: true, email: true } },
      },
    }),
    prisma.report.count({ where: whereConditions }),
    prisma.$transaction([
      prisma.report.count({ where: { status: ReportStatus.OPEN } }),
      prisma.report.count({ where: { status: ReportStatus.RESOLVED } }),
    ]),
  ]);

  return {
    meta: {
      page,
      limit,
      total,
      totalPage: Math.ceil(total / limit),
      openCount: counts[0],
      resolvedCount: counts[1],
    },
    data: result.map(formatReportItem),
  };
};

const resolveReport = async (id: string) => {
  const existing = await prisma.report.findUnique({ where: { id } });
  if (!existing) {
    throw new ApiError(httpStatus.NOT_FOUND, "Report not found!");
  }

  const updated = await prisma.report.update({
    where: { id },
    data: { status: ReportStatus.RESOLVED },
    include: { reportedBy: { select: { id: true, name: true } } },
  });

  return formatReportItem(updated);
};

export const ReportService = {
  createReport,
  getAllReports,
  resolveReport,
};
