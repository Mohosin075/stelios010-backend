import express from "express";
import { UserRole } from "@prisma/client";
import auth from "../../middlewares/auth";
import { DashboardController } from "./dashboard.controller";

const router = express.Router();

router.get(
  "/stats",
  auth(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  DashboardController.getDashboardStats
);

router.get(
  "/activities",
  auth(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  DashboardController.getRecentActivities
);

export const DashboardRoutes = router;
