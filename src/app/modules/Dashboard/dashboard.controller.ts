import { Request, Response } from "express";
import httpStatus from "http-status";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { DashboardService } from "./dashboard.service";

const getDashboardStats = catchAsync(async (req: Request, res: Response) => {
  const result = await DashboardService.getDashboardStats();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Dashboard statistics retrieved successfully!",
    data: result,
  });
});

const getRecentActivities = catchAsync(async (req: Request, res: Response) => {
  const limit = req.query.limit ? Number(req.query.limit) : 10;
  const result = await DashboardService.getRecentActivities(limit);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Recent activities retrieved successfully!",
    data: result,
  });
});

export const DashboardController = {
  getDashboardStats,
  getRecentActivities,
};
