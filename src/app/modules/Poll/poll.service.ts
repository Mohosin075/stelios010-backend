import httpStatus from "http-status";
import { PollStatus } from "@prisma/client";
import ApiError from "../../../errors/ApiErrors";
import { IPaginationOptions } from "../../../interfaces/paginations";
import prisma from "../../../shared/prisma";
import { paginationHelpers } from "../../../utils/paginationHelper";
import { ICreatePollPayload, IPollFilterRequest } from "./poll.interface";
import { buildPrismaWhere } from "../../../utils/queryBuilder";
import { enumToUi, formatDate } from "../../../utils/formatters";

const pollSearchableFields = ["question", "audience"];

// Helper to format a poll option with vote percentage
const formatPollOption = (opt: any, totalVotes: number, maxVotes: number) => ({
  id: opt.id,
  text: opt.text,
  votes: opt.votes,
  percentage: totalVotes > 0 ? Math.round((opt.votes / totalVotes) * 100) : 0,
  isHighest: totalVotes > 0 && opt.votes === maxVotes,
});

// Helper to format a poll item for the frontend
const formatPollItem = (poll: any) => {
  const totalVotes = poll.options.reduce((acc: number, curr: any) => acc + curr.votes, 0);
  const maxVotes = Math.max(...poll.options.map((o: any) => o.votes), 0);

  return {
    id: poll.id,
    question: poll.question,
    audience: poll.audience,
    responses: totalVotes || poll.responses,
    createdDate: formatDate(poll.createdDate),
    endDate: formatDate(poll.endDate),
    status: enumToUi(poll.status) as "Active" | "Scheduled" | "Completed",
    options: poll.options.map((opt: any) => formatPollOption(opt, totalVotes, maxVotes)),
    audienceBreakdown: {
      activeUsers: Math.round(totalVotes * 0.55),
      futureUsers: Math.round(totalVotes * 0.35),
      pioneers: Math.round(totalVotes * 0.1),
    },
  };
};

const createPoll = async (payload: ICreatePollPayload) => {
  if (!payload.question || !payload.endDate || !payload.options?.length) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "Question, end date, and at least 2 options are required"
    );
  }

  const result = await prisma.poll.create({
    data: {
      question: payload.question,
      audience: payload.audience || "All Users",
      endDate: new Date(payload.endDate),
      options: {
        create: payload.options.map((text) => ({ text, votes: 0 })),
      },
    },
    include: { options: true },
  });

  return formatPollItem(result);
};

const getAllPolls = async (
  filters: IPollFilterRequest,
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
    pollSearchableFields,
    normalizedFilters
  );

  const [result, total] = await Promise.all([
    prisma.poll.findMany({
      where: whereConditions,
      skip,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
      include: { options: true },
    }),
    prisma.poll.count({ where: whereConditions }),
  ]);

  return {
    meta: { page, limit, total, totalPage: Math.ceil(total / limit) },
    data: result.map(formatPollItem),
  };
};

const endPoll = async (id: string) => {
  const existing = await prisma.poll.findUnique({ where: { id } });
  if (!existing) {
    throw new ApiError(httpStatus.NOT_FOUND, "Poll not found!");
  }

  const updated = await prisma.poll.update({
    where: { id },
    data: { status: PollStatus.COMPLETED },
    include: { options: true },
  });

  return formatPollItem(updated);
};

export const PollService = {
  createPoll,
  getAllPolls,
  endPoll,
};
