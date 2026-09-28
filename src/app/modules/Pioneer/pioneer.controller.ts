import { Request, Response } from "express";
import httpStatus from "http-status";
import { paginationFields } from "../../../constants/pagination";
import catchAsync from "../../../shared/catchAsync";
import pick from "../../../shared/pick";
import sendResponse from "../../../shared/sendResponse";
import { pioneerFilterableFields } from "./pioneer.constant";
import { PioneerService } from "./pioneer.service";

const createPioneer = catchAsync(async (req: Request, res: Response) => {
  const result = await PioneerService.createPioneer(req.body);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Pioneer created successfully!",
    data: result,
  });
});

const getAllPioneers = catchAsync(async (req: Request, res: Response) => {
  const filters = pick(req.query, pioneerFilterableFields);
  const options = pick(req.query, paginationFields);

  const result = await PioneerService.getAllPioneers(filters, options);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Pioneers retrieved successfully!",
    meta: result.meta,
    data: result.data,
  });
});

const getPioneerById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await PioneerService.getPioneerById(id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Pioneer details retrieved successfully!",
    data: result,
  });
});

const updatePioneer = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await PioneerService.updatePioneer(id, req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Pioneer updated successfully!",
    data: result,
  });
});

const deletePioneer = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await PioneerService.deletePioneer(id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Pioneer deleted successfully!",
    data: result,
  });
});

export const PioneerController = {
  createPioneer,
  getAllPioneers,
  getPioneerById,
  updatePioneer,
  deletePioneer,
};
