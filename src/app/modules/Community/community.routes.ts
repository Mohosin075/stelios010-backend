import express from "express";
import { UserRole } from "@prisma/client";
import auth from "../../middlewares/auth";
import { CommunityController } from "./community.controller";

const router = express.Router();

// Support Groups
router.get("/support-groups", CommunityController.getAllSupportGroups);

router.post(
  "/support-groups",
  auth(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  CommunityController.createSupportGroup
);

router.patch(
  "/support-groups/:id/toggle",
  auth(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  CommunityController.toggleSupportGroupStatus
);

// Community Meets
router.get("/meets", CommunityController.getAllCommunityMeets);

router.post(
  "/meets",
  auth(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  CommunityController.createCommunityMeet
);

router.delete(
  "/meets/:id",
  auth(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  CommunityController.deleteCommunityMeet
);

export const CommunityRoutes = router;
