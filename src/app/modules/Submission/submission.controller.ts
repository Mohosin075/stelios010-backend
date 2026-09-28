import { Request, Response } from "express";
import httpStatus from "http-status";
import { paginationFields } from "../../../constants/pagination";
import catchAsync from "../../../shared/catchAsync";
import pick from "../../../shared/pick";
import sendResponse from "../../../shared/sendResponse";
import { SubmissionService } from "./submission.service";

const createSubmission = catchAsync(async (req: Request, res: Response) => {
  const result = await SubmissionService.createSubmission(req.body);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Submission received successfully!",
    data: result,
  });
});

const getAllSubmissions = catchAsync(async (req: Request, res: Response) => {
  const filters = pick(req.query, ["searchTerm", "type", "status"]);
  const options = pick(req.query, paginationFields);

  const result = await SubmissionService.getAllSubmissions(filters as any, options);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Submissions retrieved successfully!",
    meta: result.meta,
    data: result.data,
  });
});

const approveSubmission = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await SubmissionService.approveSubmission(id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Submission approved successfully!",
    data: result,
  });
});

const rejectSubmission = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await SubmissionService.rejectSubmission(id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Submission rejected successfully!",
    data: result,
  });
});

export const SubmissionController = {
  createSubmission,
  getAllSubmissions,
  approveSubmission,
  rejectSubmission,
};
