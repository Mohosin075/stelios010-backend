import httpStatus from "http-status";
import { Submission, SubmissionStatus, SubmissionType } from "@prisma/client";
import ApiError from "../../../errors/ApiErrors";
import { IPaginationOptions } from "../../../interfaces/paginations";
import prisma from "../../../shared/prisma";
import { paginationHelpers } from "../../../utils/paginationHelper";
import { ISubmissionFilterRequest } from "./submission.interface";
import { buildPrismaWhere } from "../../../utils/queryBuilder";
import { formatDate, uiToEnum } from "../../../utils/formatters";

const submissionSearchableFields = ["pioneerName", "productName", "website"];

// Helper to format a submission item for the frontend
const formatSubmissionItem = (item: any) => ({
  id: item.id,
  type: item.type === SubmissionType.MISSING_PIONEER ? "Missing Pioneer" : "Missing Product",
  pioneerName: item.pioneerName,
  productName: item.productName,
  website: item.website,
  submittedBy: item.submittedBy?.name || item.submitterName || "Anonymous User",
  status: item.status === SubmissionStatus.APPROVED
    ? "Approved"
    : item.status === SubmissionStatus.REJECTED
    ? "Rejected"
    : "Pending",
  createdAt: formatDate(item.createdAt),
});

const createSubmission = async (payload: Partial<Submission>): Promise<any> => {
  const result = await prisma.submission.create({
    data: payload as any,
  });
  return formatSubmissionItem(result);
};

const getAllSubmissions = async (
  filters: ISubmissionFilterRequest,
  options: IPaginationOptions
) => {
  const { limit, page, skip, sortBy, sortOrder } =
    paginationHelpers.calculatePagination(options);
  const { searchTerm, type, status, ...otherFilters } = filters;

  const normalizedFilters: Record<string, any> = {
    ...otherFilters,
    ...(type ? { type: uiToEnum(type as any) } : {}),
    ...(status ? { status: uiToEnum(status as any) } : {}),
  };

  const whereConditions = buildPrismaWhere(
    searchTerm,
    submissionSearchableFields,
    normalizedFilters
  );

  const [result, total, counts] = await Promise.all([
    prisma.submission.findMany({
      where: whereConditions,
      skip,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
      include: {
        submittedBy: { select: { id: true, name: true, email: true } },
      },
    }),
    prisma.submission.count({ where: whereConditions }),
    prisma.$transaction([
      prisma.submission.count({
        where: { type: SubmissionType.MISSING_PIONEER, status: SubmissionStatus.PENDING },
      }),
      prisma.submission.count({
        where: { type: SubmissionType.MISSING_PRODUCT, status: SubmissionStatus.PENDING },
      }),
    ]),
  ]);

  return {
    meta: {
      page,
      limit,
      total,
      totalPage: Math.ceil(total / limit),
      pioneerPendingCount: counts[0],
      productPendingCount: counts[1],
    },
    data: result.map(formatSubmissionItem),
  };
};

const approveSubmission = async (id: string) => {
  const existing = await prisma.submission.findUnique({ where: { id } });
  if (!existing) {
    throw new ApiError(httpStatus.NOT_FOUND, "Submission not found!");
  }

  const updated = await prisma.submission.update({
    where: { id },
    data: { status: SubmissionStatus.APPROVED },
  });

  return formatSubmissionItem(updated);
};

const rejectSubmission = async (id: string) => {
  const existing = await prisma.submission.findUnique({ where: { id } });
  if (!existing) {
    throw new ApiError(httpStatus.NOT_FOUND, "Submission not found!");
  }

  const updated = await prisma.submission.update({
    where: { id },
    data: { status: SubmissionStatus.REJECTED },
  });

  return formatSubmissionItem(updated);
};

export const SubmissionService = {
  createSubmission,
  getAllSubmissions,
  approveSubmission,
  rejectSubmission,
};
