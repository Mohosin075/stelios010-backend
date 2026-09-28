import express from "express";
import { UserRole } from "@prisma/client";
import auth from "../../middlewares/auth";
import { SubmissionController } from "./submission.controller";

const router = express.Router();

router.post("/", SubmissionController.createSubmission);

router.get(
  "/",
  auth(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  SubmissionController.getAllSubmissions
);

router.patch(
  "/:id/approve",
  auth(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  SubmissionController.approveSubmission
);

router.patch(
  "/:id/reject",
  auth(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  SubmissionController.rejectSubmission
);

export const SubmissionRoutes = router;
