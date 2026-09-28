import { z } from "zod";
import { LimbCategory } from "@prisma/client";

const createVerificationSchema = z.object({
  body: z.object({
    productId: z.string().optional(),
    productName: z.string({ required_error: "Product name is required" }),
    brand: z.string({ required_error: "Brand is required" }),
    limb: z.nativeEnum(LimbCategory, { required_error: "Limb is required" }),
    videoUrl: z.string().optional(),
    videoDuration: z.string().optional(),
  }),
});

const rejectVerificationSchema = z.object({
  body: z.object({
    reason: z.string({ required_error: "Rejection reason is required" }).min(3, "Reason must be at least 3 characters"),
  }),
});

export const VerificationValidation = {
  createVerificationSchema,
  rejectVerificationSchema,
};
