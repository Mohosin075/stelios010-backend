import { Request, Response } from "express";
import httpStatus from "http-status";
import { paginationFields } from "../../../constants/pagination";
import catchAsync from "../../../shared/catchAsync";
import pick from "../../../shared/pick";
import sendResponse from "../../../shared/sendResponse";
import { PollService } from "./poll.service";

const createPoll = catchAsync(async (req: Request, res: Response) => {
  const result = await PollService.createPoll(req.body);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Poll created successfully!",
    data: result,
  });
});

const getAllPolls = catchAsync(async (req: Request, res: Response) => {
  const filters = pick(req.query, ["status", "searchTerm"]);
  const options = pick(req.query, paginationFields);

  const result = await PollService.getAllPolls(filters as any, options);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Polls retrieved successfully!",
    meta: result.meta,
    data: result.data,
  });
});

const endPoll = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await PollService.endPoll(id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Poll ended successfully!",
    data: result,
  });
});

export const PollController = {
  createPoll,
  getAllPolls,
  endPoll,
};
