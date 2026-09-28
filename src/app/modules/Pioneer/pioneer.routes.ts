import express from "express";
import { UserRole } from "@prisma/client";
import auth from "../../middlewares/auth";
import validateRequest from "../../middlewares/validateRequest";
import { PioneerController } from "./pioneer.controller";
import { PioneerValidation } from "./pioneer.validation";

const router = express.Router();

router.post(
  "/",
  auth(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  validateRequest(PioneerValidation.createPioneerSchema),
  PioneerController.createPioneer
);

router.get(
  "/",
  auth(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  PioneerController.getAllPioneers
);

router.get(
  "/:id",
  auth(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  PioneerController.getPioneerById
);

router.patch(
  "/:id",
  auth(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  validateRequest(PioneerValidation.updatePioneerSchema),
  PioneerController.updatePioneer
);

router.delete(
  "/:id",
  auth(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  PioneerController.deletePioneer
);

export const PioneerRoutes = router;
