import { Request, Response } from "express";
import httpStatus from "http-status";
import { paginationFields } from "../../../constants/pagination";
import catchAsync from "../../../shared/catchAsync";
import pick from "../../../shared/pick";
import sendResponse from "../../../shared/sendResponse";
import { verificationFilterableFields } from "./verification.constant";
import { VerificationService } from "./verification.service";

const getAllVerifications = catchAsync(async (req: Request, res: Response) => {
  const filters = pick(req.query, verificationFilterableFields);
  const options = pick(req.query, paginationFields);

  const result = await VerificationService.getAllVerifications(filters, options);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Verifications retrieved successfully!",
    meta: result.meta,
    data: result.data,
  });
});

const getVerificationById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await VerificationService.getVerificationById(id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Verification details retrieved successfully!",
    data: result,
  });
});

const approveVerification = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await VerificationService.approveVerification(id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Verification approved successfully!",
    data: result,
  });
});

const rejectVerification = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { reason } = req.body;
  const result = await VerificationService.rejectVerification(id, reason);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Verification marked unsuccessful!",
    data: result,
  });
});

export const VerificationController = {
  getAllVerifications,
  getVerificationById,
  approveVerification,
  rejectVerification,
};
