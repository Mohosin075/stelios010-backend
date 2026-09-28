import express from "express";
import { UserRole } from "@prisma/client";
import auth from "../../middlewares/auth";
import validateRequest from "../../middlewares/validateRequest";
import { VerificationController } from "./verification.controller";
import { VerificationValidation } from "./verification.validation";

const router = express.Router();

router.get(
  "/",
  auth(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  VerificationController.getAllVerifications
);

router.get(
  "/:id",
  auth(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  VerificationController.getVerificationById
);

router.patch(
  "/:id/approve",
  auth(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  VerificationController.approveVerification
);

router.patch(
  "/:id/reject",
  auth(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  validateRequest(VerificationValidation.rejectVerificationSchema),
  VerificationController.rejectVerification
);

export const VerificationRoutes = router;
