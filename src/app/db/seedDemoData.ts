import {
  ActivityType,
  ClaimedStatus,
  CommunityMeetStatus,
  ContactMessageStatus,
  ContactMessageType,
  LimbCategory,
  PollStatus,
  ProductStatus,
  ProductType,
  ProfileType,
  ReportStatus,
  ReportType,
  SubmissionStatus,
  SubmissionType,
  SubscriptionPlanType,
  SubscriptionStatus,
  SupportGroupStatus,
  UserRole,
  VerificationStatus,
} from "@prisma/client";
import bcrypt from "bcryptjs";
import prisma from "../../shared/prisma";

export const seedDemoData = async () => {
  try {
    const pioneerCount = await prisma.pioneer.count();
    if (pioneerCount > 0) {
      console.log("ℹ️ Demo data already seeded.");
      return;
    }

    console.log("🌱 Seeding realistic demo data for Stelios Dashboard...");

    const defaultPassword = await bcrypt.hash("password123", 12);

    // 1. Seed Pioneers
    const openBionics = await prisma.pioneer.create({
      data: {
        name: "Open Bionics",
        initials: "OB",
        website: "https://openbionics.com",
        location: "Bristol, United Kingdom",
        country: "United Kingdom",
        region: "England",
        city: "Bristol",
        bio: "Developing affordable, assistive 3D-printed bionic limbs. Creators of the world-famous Hero Arm for adults and children.",
        claimedStatus: ClaimedStatus.CLAIMED,
        subscriptionStatus: SubscriptionStatus.ACTIVE,
        verificationStatus: VerificationStatus.VERIFIED,
        subscriptionPlan: SubscriptionPlanType.ANNUAL,
        subscriptionStartDate: new Date("2023-06-01"),
        subscriptionRenewalDate: new Date("2027-06-01"),
      },
    });

    const ottobock = await prisma.pioneer.create({
      data: {
        name: "Ottobock",
        initials: "OB",
        website: "https://ottobock.com",
        location: "Duderstadt, Germany",
        country: "Germany",
        region: "Lower Saxony",
        city: "Duderstadt",
        bio: "Global healthtech pioneer in prosthetics, orthotics, and human mobility technology.",
        claimedStatus: ClaimedStatus.CLAIMED,
        subscriptionStatus: SubscriptionStatus.ACTIVE,
        verificationStatus: VerificationStatus.VERIFIED,
        subscriptionPlan: SubscriptionPlanType.ANNUAL,
        subscriptionStartDate: new Date("2022-01-15"),
        subscriptionRenewalDate: new Date("2027-01-15"),
      },
    });

    const ossur = await prisma.pioneer.create({
      data: {
        name: "Össur",
        initials: "OS",
        website: "https://ossur.com",
        location: "Reykjavik, Iceland",
        country: "Iceland",
        region: "Capital Region",
        city: "Reykjavik",
        bio: "Global leader in non-invasive orthopaedics and life without limitations.",
        claimedStatus: ClaimedStatus.CLAIMED,
        subscriptionStatus: SubscriptionStatus.ACTIVE,
        verificationStatus: VerificationStatus.VERIFIED,
        subscriptionPlan: SubscriptionPlanType.MONTHLY,
        subscriptionStartDate: new Date("2024-03-01"),
        subscriptionRenewalDate: new Date("2026-10-01"),
      },
    });

    const steeper = await prisma.pioneer.create({
      data: {
        name: "Steeper Group",
        initials: "SG",
        website: "https://steepergroup.com",
        location: "Leeds, United Kingdom",
        country: "United Kingdom",
        region: "Yorkshire",
        city: "Leeds",
        bio: "Leading creator of upper-limb and lower-limb assistive devices.",
        claimedStatus: ClaimedStatus.UNCLAIMED,
        subscriptionStatus: SubscriptionStatus.NONE,
        verificationStatus: VerificationStatus.UNVERIFIED,
      },
    });

    // 2. Seed Products
    const heroArm = await prisma.product.create({
      data: {
        pioneerId: openBionics.id,
        name: "Hero Arm",
        limbCategory: LimbCategory.UPPER_LIMB,
        productType: ProductType.BIONIC_HAND,
        activeUsers: 342,
        status: ProductStatus.ACTIVE,
        description:
          "Advanced multi-grip myoelectric bionic arm with light and durable 3D-printed construction.",
        tags: ["Lightweight", "Custom Covers", "Multi-grip", "Water-resistant"],
        verifiedReviewsCount: 128,
      },
    });

    const michelangeloHand = await prisma.product.create({
      data: {
        pioneerId: ottobock.id,
        name: "Michelangelo Hand",
        limbCategory: LimbCategory.UPPER_LIMB,
        productType: ProductType.BIONIC_HAND,
        activeUsers: 195,
        status: ProductStatus.ACTIVE,
        description:
          "High performance prosthetic hand with natural movement and active thumb positioning.",
        tags: ["High Precision", "Active Thumb", "Natural Feel"],
        verifiedReviewsCount: 84,
      },
    });

    const cleg = await prisma.product.create({
      data: {
        pioneerId: ottobock.id,
        name: "C-Leg 4",
        limbCategory: LimbCategory.LOWER_LIMB,
        productType: ProductType.BIONIC_KNEE,
        activeUsers: 512,
        status: ProductStatus.ACTIVE,
        description:
          "Microprocessor-controlled knee joint that sets the standard in stability and dynamic gait.",
        tags: ["Microprocessor", "Stumble Recovery", "All-Terrain"],
        verifiedReviewsCount: 310,
      },
    });

    const rheoKnee = await prisma.product.create({
      data: {
        pioneerId: ossur.id,
        name: "Rheo Knee",
        limbCategory: LimbCategory.LOWER_LIMB,
        productType: ProductType.BIONIC_KNEE,
        activeUsers: 284,
        status: ProductStatus.ACTIVE,
        description:
          "Adaptive microprocessor knee with real-time responsiveness to changing gait speeds.",
        tags: ["Adaptive", "Magnetorheological", "Weatherproof"],
        verifiedReviewsCount: 142,
      },
    });

    // 3. Seed Users
    const marcus = await prisma.user.create({
      data: {
        name: "Marcus Chen",
        email: "marcus.chen@example.com",
        password: defaultPassword,
        role: UserRole.USER,
        profileType: ProfileType.ACTIVE_USER,
        location: "San Francisco, CA",
        country: "United States",
        region: "California",
        city: "San Francisco",
        age: 34,
        bio: "Upper limb amputee. Avid tech enthusiast and bionic technology advocate.",
        bionicLookingFor: "Hero Arm",
        isBionicProduct: true,
        verificationStatus: VerificationStatus.VERIFIED,
        bionicProducts: {
          create: [
            {
              name: "Hero Arm",
              brand: "Open Bionics",
              category: "Upper Limb",
              status: VerificationStatus.VERIFIED,
            },
          ],
        },
        masterIndicators: {
          create: {
            originOfAmputation: "Traumatic",
            anatomicalBaseline: "Transradial",
          },
        },
      },
    });

    const ryan = await prisma.user.create({
      data: {
        name: "Ryan Torres",
        email: "ryan.torres@example.com",
        password: defaultPassword,
        role: UserRole.USER,
        profileType: ProfileType.ACTIVE_USER,
        location: "Austin, TX",
        country: "United States",
        region: "Texas",
        city: "Austin",
        age: 29,
        bio: "Passionate bionic tester and mechanical engineer.",
        bionicLookingFor: "C-Leg 4",
        isBionicProduct: true,
        verificationStatus: VerificationStatus.PENDING,
        bionicProducts: {
          create: [
            {
              name: "C-Leg 4",
              brand: "Ottobock",
              category: "Lower Limb",
              status: VerificationStatus.PENDING,
            },
          ],
        },
        masterIndicators: {
          create: {
            originOfAmputation: "Congenital",
            anatomicalBaseline: "Transfemoral",
          },
        },
      },
    });

    const sarah = await prisma.user.create({
      data: {
        name: "Sarah Jenkins",
        email: "sarah.j@example.com",
        password: defaultPassword,
        role: UserRole.USER,
        profileType: ProfileType.FUTURE_USER,
        location: "Seattle, WA",
        country: "United States",
        region: "Washington",
        city: "Seattle",
        age: 26,
        bio: "Researching upcoming upper-limb bionic options.",
        bionicLookingFor: "Hero Arm",
        isBionicProduct: false,
        verificationStatus: VerificationStatus.UNVERIFIED,
        masterIndicators: {
          create: {
            originOfAmputation: "Elective",
            anatomicalBaseline: "Transhumeral",
          },
        },
      },
    });

    // 4. Seed Verifications
    await prisma.verification.create({
      data: {
        userId: ryan.id,
        productId: cleg.id,
        productName: "C-Leg 4",
        brand: "Ottobock",
        limb: LimbCategory.LOWER_LIMB,
        status: VerificationStatus.PENDING,
        videoDuration: "0:12",
        videoUrl: "https://example.com/videos/verif-cleg.mp4",
      },
    });

    await prisma.verification.create({
      data: {
        userId: marcus.id,
        productId: heroArm.id,
        productName: "Hero Arm",
        brand: "Open Bionics",
        limb: LimbCategory.UPPER_LIMB,
        status: VerificationStatus.VERIFIED,
        videoDuration: "0:10",
        videoUrl: "https://example.com/videos/verif-hero.mp4",
      },
    });

    // 5. Seed Subscriptions
    await prisma.subscription.create({
      data: {
        pioneerId: openBionics.id,
        plan: SubscriptionPlanType.ANNUAL,
        amount: 3500,
        startDate: new Date("2024-01-01"),
        renewalDate: new Date("2027-01-01"),
        status: SubscriptionStatus.ACTIVE,
      },
    });

    await prisma.subscription.create({
      data: {
        pioneerId: ottobock.id,
        plan: SubscriptionPlanType.ANNUAL,
        amount: 4800,
        startDate: new Date("2023-06-01"),
        renewalDate: new Date("2027-06-01"),
        status: SubscriptionStatus.ACTIVE,
      },
    });

    await prisma.subscription.create({
      data: {
        pioneerId: ossur.id,
        plan: SubscriptionPlanType.MONTHLY,
        amount: 350,
        startDate: new Date("2024-03-01"),
        renewalDate: new Date("2026-10-01"),
        status: SubscriptionStatus.ACTIVE,
      },
    });

    // 6. Seed Submissions
    await prisma.submission.create({
      data: {
        type: SubmissionType.MISSING_PIONEER,
        pioneerName: "Psyonic Inc",
        website: "https://psyonic.io",
        submittedById: marcus.id,
        submitterName: marcus.name,
        status: SubmissionStatus.PENDING,
      },
    });

    await prisma.submission.create({
      data: {
        type: SubmissionType.MISSING_PRODUCT,
        productName: "Ability Hand",
        pioneerName: "Psyonic",
        website: "https://psyonic.io/ability-hand",
        submittedById: ryan.id,
        submitterName: ryan.name,
        status: SubmissionStatus.PENDING,
      },
    });

    // 7. Seed Community
    await prisma.supportGroup.create({
      data: {
        title: "Upper Limb Amputee Support",
        description:
          "A supportive community for upper limb amputees sharing advice on daily tasks, bionics, and rehabilitation.",
        membersCount: 1420,
        status: SupportGroupStatus.ACTIVE,
      },
    });

    await prisma.supportGroup.create({
      data: {
        title: "Bionic Pioneers & Tech",
        description:
          "Discussions about future bionic releases, sensor research, and firmware updates.",
        membersCount: 890,
        status: SupportGroupStatus.ACTIVE,
      },
    });

    await prisma.communityMeet.create({
      data: {
        title: "Global Bionic Summit 2026",
        host: "Open Bionics & GENB",
        date: "Nov 15, 2026",
        location: "Virtual & London",
        participantsCount: 420,
        status: CommunityMeetStatus.UPCOMING,
      },
    });

    // 8. Seed Polls
    await prisma.poll.create({
      data: {
        question: "Which bionic limb feature matters most in daily usage?",
        audience: "All Users",
        responses: 384,
        status: PollStatus.ACTIVE,
        endDate: new Date("2026-11-30"),
        options: {
          create: [
            { text: "Battery Life (24h+)", votes: 165 },
            { text: "Water & Dust Resistance", votes: 120 },
            { text: "Haptic Feedback", votes: 75 },
            { text: "Lightweight Design", votes: 24 },
          ],
        },
      },
    });

    // 9. Seed Reports
    await prisma.report.create({
      data: {
        reportedItem: "Spam Profile @tech_bot",
        type: ReportType.PROFILE,
        reportedById: marcus.id,
        reporterName: marcus.name,
        reason: "Commercial solicitation spam in discussions",
        status: ReportStatus.OPEN,
      },
    });

    // 10. Seed Contact Messages
    await prisma.contactMessage.create({
      data: {
        sender: "Dr. Alexander Wright",
        email: "alex.wright@clinics.org",
        type: ContactMessageType.SUGGESTION,
        messagePreview: "Suggestion to add pediatric limb sizing filter...",
        fullMessage:
          "It would be very beneficial for clinicians if you added specialized filters for pediatric limb dimensions and growth-compatible sockets.",
        status: ContactMessageStatus.UNREAD,
      },
    });

    await prisma.contactMessage.create({
      data: {
        sender: "Emily Watson",
        email: "emily.w@example.com",
        type: ContactMessageType.BUG,
        messagePreview: "Video playback stalling during verification...",
        fullMessage:
          "When uploading my 10s video on iOS Safari, the preview stalls at 50%. Works fine on desktop Chrome.",
        status: ContactMessageStatus.UNREAD,
      },
    });

    // 11. Seed Activity Logs
    await prisma.activityLog.create({
      data: {
        title: "New verification submitted by Ryan Torres",
        subtitle: "Ottobock C-Leg 4",
        type: ActivityType.VERIFICATION,
      },
    });

    await prisma.activityLog.create({
      data: {
        title: "Annual Subscription renewed by Open Bionics",
        subtitle: "Annual Plan ($3,500/year)",
        type: ActivityType.SUBSCRIPTION,
      },
    });

    console.log("✅ Demo data seeded successfully!");
  } catch (error) {
    console.error("Failed to seed demo data:", error);
  }
};
