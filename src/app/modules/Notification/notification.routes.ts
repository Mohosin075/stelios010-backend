import express from "express";
import { UserRole } from "@prisma/client";
import auth from "../../middlewares/auth";
import { NotificationController } from "./notification.controller";

const router = express.Router();

router.post(
  "/",
  auth(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  NotificationController.createNotification
);

router.get(
  "/",
  auth(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  NotificationController.getAllNotifications
);

export const NotificationRoutes = router;
