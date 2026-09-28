import { Request, Response } from "express";
import httpStatus from "http-status";
import { paginationFields } from "../../../constants/pagination";
import catchAsync from "../../../shared/catchAsync";
import pick from "../../../shared/pick";
import sendResponse from "../../../shared/sendResponse";
import { ReportService } from "./report.service";

const createReport = catchAsync(async (req: Request, res: Response) => {
  const result = await ReportService.createReport(req.body);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Report submitted successfully!",
    data: result,
  });
});

const getAllReports = catchAsync(async (req: Request, res: Response) => {
  const filters = pick(req.query, ["status", "type", "searchTerm"]);
  const options = pick(req.query, paginationFields);

  const result = await ReportService.getAllReports(filters as any, options);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Reports retrieved successfully!",
    meta: result.meta,
    data: result.data,
  });
});

const resolveReport = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await ReportService.resolveReport(id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Report marked as resolved!",
    data: result,
  });
});

export const ReportController = {
  createReport,
  getAllReports,
  resolveReport,
};
