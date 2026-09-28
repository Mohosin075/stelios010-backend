import express from "express";
import { UserRole } from "@prisma/client";
import auth from "../../middlewares/auth";
import { PollController } from "./poll.controller";

const router = express.Router();

router.post(
  "/",
  auth(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  PollController.createPoll
);

router.get("/", PollController.getAllPolls);

router.patch(
  "/:id/end",
  auth(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  PollController.endPoll
);

export const PollRoutes = router;
