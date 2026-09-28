import { z } from "zod";
import { ClaimedStatus, SubscriptionStatus, VerificationStatus, SubscriptionPlanType } from "@prisma/client";

const createPioneerSchema = z.object({
  body: z.object({
    name: z.string({ required_error: "Pioneer name is required" }),
    initials: z.string().optional(),
    logo: z.string().optional(),
    website: z.string().optional(),
    location: z.string().optional(),
    country: z.string().optional(),
    region: z.string().optional(),
    city: z.string().optional(),
    bio: z.string().optional(),
    claimedStatus: z.nativeEnum(ClaimedStatus).optional(),
    subscriptionStatus: z.nativeEnum(SubscriptionStatus).optional(),
    verificationStatus: z.nativeEnum(VerificationStatus).optional(),
    subscriptionPlan: z.nativeEnum(SubscriptionPlanType).optional(),
  }),
});

const updatePioneerSchema = z.object({
  body: z.object({
    name: z.string().optional(),
    initials: z.string().optional(),
    logo: z.string().optional(),
    website: z.string().optional(),
    location: z.string().optional(),
    country: z.string().optional(),
    region: z.string().optional(),
    city: z.string().optional(),
    bio: z.string().optional(),
    claimedStatus: z.nativeEnum(ClaimedStatus).optional(),
    subscriptionStatus: z.nativeEnum(SubscriptionStatus).optional(),
    verificationStatus: z.nativeEnum(VerificationStatus).optional(),
    subscriptionPlan: z.nativeEnum(SubscriptionPlanType).optional(),
  }),
});

export const PioneerValidation = {
  createPioneerSchema,
  updatePioneerSchema,
};
