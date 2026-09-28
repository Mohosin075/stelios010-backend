import express, { Request, Response } from "express";
import httpStatus from "http-status";
import { upload } from "../../../helpars/file/fileUploader";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import config from "../../../config";

const router = express.Router();

router.post(
  "/single",
  upload.single("file"),
  catchAsync(async (req: Request, res: Response) => {
    if (!req.file) {
      return sendResponse(res, {
        statusCode: httpStatus.BAD_REQUEST,
        success: false,
        message: "No file was uploaded!",
        data: null,
      });
    }

    const fileUrl = `${config.url.image_url || "http://localhost:5000/uploads"}/${req.file.filename}`;

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "File uploaded successfully!",
      data: {
        filename: req.file.filename,
        originalName: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        url: fileUrl,
      },
    });
  })
);

router.post(
  "/multiple",
  upload.array("files", 10),
  catchAsync(async (req: Request, res: Response) => {
    const files = req.files as Express.Multer.File[];
    if (!files || files.length === 0) {
      return sendResponse(res, {
        statusCode: httpStatus.BAD_REQUEST,
        success: false,
        message: "No files were uploaded!",
        data: null,
      });
    }

    const uploadedFiles = files.map((file) => ({
      filename: file.filename,
      originalName: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      url: `${config.url.image_url || "http://localhost:5000/uploads"}/${file.filename}`,
    }));

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: `${files.length} files uploaded successfully!`,
      data: uploadedFiles,
    });
  })
);

export const UploadRoutes = router;
