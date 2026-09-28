import {
  ContactMessageStatus,
  ProfileType,
  ReportStatus,
  SubmissionStatus,
  SubmissionType,
  SubscriptionPlanType,
  SubscriptionStatus,
  UserRole,
  VerificationStatus,
} from "@prisma/client";
import prisma from "../../../shared/prisma";
import { IDashboardStats, RecentActivityItem } from "./dashboard.interface";

const getDashboardStats = async (): Promise<IDashboardStats> => {
  const [
    totalUsersCount,
    activeUsersCount,
    futureUsersCount,
    pioneersCount,
    pendingVerifCount,
    activeSubscriptionsCount,
    activeMonthlySubs,
    activeAnnualSubs,
    missingPioneersCount,
    missingProductsCount,
    unresolvedReportsCount,
    unreadMessagesCount,
    recentActivityLogs,
  ] = await Promise.all([
    prisma.user.count({ where: { role: UserRole.USER } }),
    prisma.user.count({
      where: { role: UserRole.USER, profileType: ProfileType.ACTIVE_USER },
    }),
    prisma.user.count({
      where: { role: UserRole.USER, profileType: ProfileType.FUTURE_USER },
    }),
    prisma.pioneer.count(),
    prisma.verification.count({
      where: { status: VerificationStatus.PENDING },
    }),
    prisma.subscription.count({
      where: { status: SubscriptionStatus.ACTIVE },
    }),
    prisma.subscription.findMany({
      where: {
        status: SubscriptionStatus.ACTIVE,
        plan: SubscriptionPlanType.MONTHLY,
      },
      select: { amount: true },
    }),
    prisma.subscription.findMany({
      where: {
        status: SubscriptionStatus.ACTIVE,
        plan: SubscriptionPlanType.ANNUAL,
      },
      select: { amount: true },
    }),
    prisma.submission.count({
      where: {
        type: SubmissionType.MISSING_PIONEER,
        status: SubmissionStatus.PENDING,
      },
    }),
    prisma.submission.count({
      where: {
        type: SubmissionType.MISSING_PRODUCT,
        status: SubmissionStatus.PENDING,
      },
    }),
    prisma.report.count({
      where: { status: ReportStatus.OPEN },
    }),
    prisma.contactMessage.count({
      where: { status: ContactMessageStatus.UNREAD },
    }),
    prisma.activityLog.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const monthlyRevenueTotal = activeMonthlySubs.reduce(
    (sum, sub) => sum + sub.amount,
    0
  );
  const annualRevenueTotal = activeAnnualSubs.reduce(
    (sum, sub) => sum + sub.amount,
    0
  );

  const formattedActivities: RecentActivityItem[] = recentActivityLogs.map(
    (log) => ({
      id: log.id,
      title: log.title,
      subtitle: log.subtitle,
      timestamp: log.createdAt.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
      type: log.type.toLowerCase() as any,
    })
  );

  return {
    totalUsers: {
      label: "TOTAL USERS",
      value: totalUsersCount.toLocaleString(),
      subtext: "+12% vs last month",
      valueColor: "white",
    },
    activeUsers: {
      label: "ACTIVE USERS",
      value: activeUsersCount.toLocaleString(),
      subtext: "+8% vs last month",
      valueColor: "green",
    },
    futureUsers: {
      label: "FUTURE USERS",
      value: futureUsersCount.toLocaleString(),
      subtext: "+18% vs last month",
      valueColor: "blue",
    },
    pioneers: {
      label: "PIONEERS",
      value: pioneersCount.toLocaleString(),
      subtext: "+2 this month",
      valueColor: "white",
    },
    pendingVerif: {
      label: "PENDING VERIF.",
      value: pendingVerifCount.toLocaleString(),
      subtext: "Needs review",
      valueColor: "yellow",
    },
    activeSubscriptions: {
      label: "ACTIVE SUBSCRIPTIONS",
      value: activeSubscriptionsCount.toLocaleString(),
      subtext: "Pioneer accounts",
      valueColor: "green",
    },
    pioneerRevenue: {
      monthlyRevenue: {
        title: "Monthly Revenue",
        amount: `$${monthlyRevenueTotal.toLocaleString()}`,
        detail: "/month",
      },
      annualRevenue: {
        title: "Annual Revenue",
        amount: `$${annualRevenueTotal.toLocaleString()}`,
        detail: "/year",
      },
      activeMonthlyPlans: {
        title: "Active Monthly Plans",
        amount: activeMonthlySubs.length,
        detail: "plans",
      },
      activeAnnualPlans: {
        title: "Active Annual Plans",
        amount: activeAnnualSubs.length,
        detail: "plans",
      },
    },
    pendingActions: [
      {
        id: "act-1",
        title: "Pending Verifications",
        count: pendingVerifCount,
        badgeType: "yellow",
        link: "/verifications",
      },
      {
        id: "act-2",
        title: "Missing Pioneer Submissions",
        count: missingPioneersCount,
        badgeType: "purple",
        link: "/submissions",
      },
      {
        id: "act-3",
        title: "Missing Product Submissions",
        count: missingProductsCount,
        badgeType: "purple",
        link: "/submissions",
      },
      {
        id: "act-4",
        title: "Unresolved Reports",
        count: unresolvedReportsCount,
        badgeType: "red",
        link: "/reports",
      },
      {
        id: "act-5",
        title: "Unread Contact Messages",
        count: unreadMessagesCount,
        badgeType: "green",
        link: "/contact-genb",
      },
    ],
    recentActivities: formattedActivities,
  };
};

const getRecentActivities = async (limit = 10) => {
  const logs = await prisma.activityLog.findMany({
    take: limit,
    orderBy: { createdAt: "desc" },
  });

  return logs.map((log) => ({
    id: log.id,
    title: log.title,
    subtitle: log.subtitle,
    timestamp: log.createdAt.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }),
    type: log.type.toLowerCase() as any,
  }));
};

export const DashboardService = {
  getDashboardStats,
  getRecentActivities,
};
