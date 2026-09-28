import express from "express";
import { UserRole } from "@prisma/client";
import auth from "../../middlewares/auth";
import { ReportController } from "./report.controller";

const router = express.Router();

router.post("/", ReportController.createReport);

router.get(
  "/",
  auth(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  ReportController.getAllReports
);

router.patch(
  "/:id/resolve",
  auth(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  ReportController.resolveReport
);

export const ReportRoutes = router;
