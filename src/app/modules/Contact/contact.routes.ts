import express from "express";
import { UserRole } from "@prisma/client";
import auth from "../../middlewares/auth";
import { ContactController } from "./contact.controller";

const router = express.Router();

router.post("/", ContactController.createMessage);

router.get(
  "/",
  auth(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  ContactController.getAllMessages
);

router.get(
  "/:id",
  auth(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  ContactController.getMessageById
);

router.patch(
  "/:id/status",
  auth(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  ContactController.updateMessageStatus
);

export const ContactRoutes = router;
