import express from "express";
import { UserRole } from "@prisma/client";
import auth from "../../middlewares/auth";
import { SubscriptionController } from "./subscription.controller";

const router = express.Router();

router.get(
  "/stats",
  auth(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  SubscriptionController.getSubscriptionStats
);

router.get(
  "/",
  auth(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  SubscriptionController.getAllSubscriptions
);

router.patch(
  "/:id",
  auth(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  SubscriptionController.updateSubscription
);

export const SubscriptionRoutes = router;
