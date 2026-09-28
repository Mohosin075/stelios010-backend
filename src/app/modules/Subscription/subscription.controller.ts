import { Request, Response } from "express";
import httpStatus from "http-status";
import { paginationFields } from "../../../constants/pagination";
import catchAsync from "../../../shared/catchAsync";
import pick from "../../../shared/pick";
import sendResponse from "../../../shared/sendResponse";
import { SubscriptionService } from "./subscription.service";

const getSubscriptionStats = catchAsync(async (req: Request, res: Response) => {
  const result = await SubscriptionService.getSubscriptionStats();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Subscription statistics retrieved successfully!",
    data: result,
  });
});

const getAllSubscriptions = catchAsync(async (req: Request, res: Response) => {
  const filters = pick(req.query, ["plan", "status", "pioneerId", "searchTerm"]);
  const options = pick(req.query, paginationFields);

  const result = await SubscriptionService.getAllSubscriptions(filters as any, options);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Subscriptions retrieved successfully!",
    meta: result.meta,
    data: result.data,
  });
});

const updateSubscription = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await SubscriptionService.updateSubscription(id, req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Subscription updated successfully!",
    data: result,
  });
});

export const SubscriptionController = {
  getSubscriptionStats,
  getAllSubscriptions,
  updateSubscription,
};
