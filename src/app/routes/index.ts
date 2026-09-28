import express from "express";
import { AuthRoutes } from "../modules/Auth/auth.routes";
import { UserRoutes } from "../modules/User/user.routes";
import { DashboardRoutes } from "../modules/Dashboard/dashboard.routes";
import { VerificationRoutes } from "../modules/Verification/verification.routes";
import { PioneerRoutes } from "../modules/Pioneer/pioneer.routes";
import { ProductRoutes } from "../modules/Product/product.routes";
import { SubmissionRoutes } from "../modules/Submission/submission.routes";
import { SubscriptionRoutes } from "../modules/Subscription/subscription.routes";
import { CommunityRoutes } from "../modules/Community/community.routes";
import { PollRoutes } from "../modules/Poll/poll.routes";
import { ReportRoutes } from "../modules/Report/report.routes";
import { ContactRoutes } from "../modules/Contact/contact.routes";
import { NotificationRoutes } from "../modules/Notification/notification.routes";
import { UploadRoutes } from "../modules/Upload/upload.routes";

const router = express.Router();

const moduleRoutes = [
  {
    path: "/auth",
    route: AuthRoutes,
  },
  {
    path: "/users",
    route: UserRoutes,
  },
  {
    path: "/dashboard",
    route: DashboardRoutes,
  },
  {
    path: "/verifications",
    route: VerificationRoutes,
  },
  {
    path: "/pioneers",
    route: PioneerRoutes,
  },
  {
    path: "/products",
    route: ProductRoutes,
  },
  {
    path: "/submissions",
    route: SubmissionRoutes,
  },
  {
    path: "/subscriptions",
    route: SubscriptionRoutes,
  },
  {
    path: "/community",
    route: CommunityRoutes,
  },
  {
    path: "/polls",
    route: PollRoutes,
  },
  {
    path: "/reports",
    route: ReportRoutes,
  },
  {
    path: "/contact-messages",
    route: ContactRoutes,
  },
  {
    path: "/notifications",
    route: NotificationRoutes,
  },
  {
    path: "/upload",
    route: UploadRoutes,
  },
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
