import { Request, Response } from "express";
import httpStatus from "http-status";
import { paginationFields } from "../../../constants/pagination";
import catchAsync from "../../../shared/catchAsync";
import pick from "../../../shared/pick";
import sendResponse from "../../../shared/sendResponse";
import { ContactService } from "./contact.service";

const createMessage = catchAsync(async (req: Request, res: Response) => {
  const result = await ContactService.createMessage(req.body);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Message submitted successfully!",
    data: result,
  });
});

const getAllMessages = catchAsync(async (req: Request, res: Response) => {
  const filters = pick(req.query, ["status", "type", "searchTerm"]);
  const options = pick(req.query, paginationFields);

  const result = await ContactService.getAllMessages(filters as any, options);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Messages retrieved successfully!",
    meta: result.meta,
    data: result.data,
  });
});

const getMessageById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await ContactService.getMessageById(id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Message retrieved successfully!",
    data: result,
  });
});

const updateMessageStatus = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;
  const result = await ContactService.updateMessageStatus(id, status);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Message status updated successfully!",
    data: result,
  });
});

export const ContactController = {
  createMessage,
  getAllMessages,
  getMessageById,
  updateMessageStatus,
};
