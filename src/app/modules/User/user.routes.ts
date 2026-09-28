import express from "express";
import { UserRole } from "@prisma/client";
import auth from "../../middlewares/auth";
import validateRequest from "../../middlewares/validateRequest";
import { UserController } from "./user.controller";
import { UserValidation } from "./user.validation";

const router = express.Router();

// Register new user (public)
router.post(
  "/register",
  validateRequest(UserValidation.createUserValidationSchema),
  UserController.createUser
);

// Get all users (SUPER_ADMIN, ADMIN only)
router.get(
  "/",
  auth(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  UserController.getAllUsers
);

// Get single user
router.get("/:id", auth(), UserController.getUserById);

// Update user
router.patch(
  "/:id",
  auth(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  validateRequest(UserValidation.updateUserValidationSchema),
  UserController.updateUser
);

// Suspend user
router.patch(
  "/:id/suspend",
  auth(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  validateRequest(UserValidation.suspendUserValidationSchema),
  UserController.suspendUser
);

// Reactivate user
router.patch(
  "/:id/reactivate",
  auth(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  UserController.reactivateUser
);

// Delete user (SUPER_ADMIN, ADMIN only)
router.delete(
  "/:id",
  auth(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  UserController.deleteUser
);

export const UserRoutes = router;
