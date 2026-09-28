import { Request, Response } from "express";
import httpStatus from "http-status";
import { paginationFields } from "../../../constants/pagination";
import catchAsync from "../../../shared/catchAsync";
import pick from "../../../shared/pick";
import sendResponse from "../../../shared/sendResponse";
import { CommunityService } from "./community.service";

const getAllSupportGroups = catchAsync(async (req: Request, res: Response) => {
  const filters = pick(req.query, ["searchTerm", "status"]);
  const options = pick(req.query, paginationFields);

  const result = await CommunityService.getAllSupportGroups(filters as any, options);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Support groups retrieved successfully!",
    meta: result.meta,
    data: result.data,
  });
});

const createSupportGroup = catchAsync(async (req: Request, res: Response) => {
  const result = await CommunityService.createSupportGroup(req.body);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Support group created successfully!",
    data: result,
  });
});

const toggleSupportGroupStatus = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await CommunityService.toggleSupportGroupStatus(id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Support group status toggled successfully!",
    data: result,
  });
});

const getAllCommunityMeets = catchAsync(async (req: Request, res: Response) => {
  const filters = pick(req.query, ["searchTerm", "status"]);
  const options = pick(req.query, paginationFields);

  const result = await CommunityService.getAllCommunityMeets(filters as any, options);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Community meets retrieved successfully!",
    meta: result.meta,
    data: result.data,
  });
});

const createCommunityMeet = catchAsync(async (req: Request, res: Response) => {
  const result = await CommunityService.createCommunityMeet(req.body);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Community meetup created successfully!",
    data: result,
  });
});

const deleteCommunityMeet = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await CommunityService.deleteCommunityMeet(id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Community meetup deleted successfully!",
    data: result,
  });
});

export const CommunityController = {
  getAllSupportGroups,
  createSupportGroup,
  toggleSupportGroupStatus,
  getAllCommunityMeets,
  createCommunityMeet,
  deleteCommunityMeet,
};
