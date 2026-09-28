import { Request, Response } from "express";
import httpStatus from "http-status";
import { paginationFields } from "../../../constants/pagination";
import catchAsync from "../../../shared/catchAsync";
import pick from "../../../shared/pick";
import sendResponse from "../../../shared/sendResponse";
import { NotificationService } from "./notification.service";

const createNotification = catchAsync(async (req: Request, res: Response) => {
  const result = await NotificationService.createNotification(req.body);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Notification created successfully!",
    data: result,
  });
});

const getAllNotifications = catchAsync(async (req: Request, res: Response) => {
  const filters = pick(req.query, ["status", "searchTerm"]);
  const options = pick(req.query, paginationFields);

  const result = await NotificationService.getAllNotifications(filters as any, options);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Notifications retrieved successfully!",
    meta: result.meta,
    data: result.data,
  });
});

export const NotificationController = {
  createNotification,
  getAllNotifications,
};
