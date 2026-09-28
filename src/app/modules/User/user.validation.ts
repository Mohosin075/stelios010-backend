import { z } from "zod";
import {
  AccountStatus,
  ProfileType,
  UserRole,
  UserStatus,
  VerificationStatus,
} from "@prisma/client";

const createUserValidationSchema = z.object({
  body: z.object({
    name: z.string().optional(),
    email: z.string({ required_error: "Email is required" }).email("Invalid email format"),
    password: z.string({ required_error: "Password is required" }).min(6, "Password must be at least 6 characters"),
    role: z.nativeEnum(UserRole).optional(),
    avatar: z.string().optional(),
    profileType: z.nativeEnum(ProfileType).optional(),
    location: z.string().optional(),
    country: z.string().optional(),
    region: z.string().optional(),
    city: z.string().optional(),
    age: z.number().optional(),
    bio: z.string().optional(),
  }),
});

const updateUserValidationSchema = z.object({
  body: z.object({
    name: z.string().optional(),
    email: z.string().email().optional(),
    role: z.nativeEnum(UserRole).optional(),
    status: z.nativeEnum(UserStatus).optional(),
    avatar: z.string().optional(),
    profileType: z.nativeEnum(ProfileType).optional(),
    verificationStatus: z.nativeEnum(VerificationStatus).optional(),
    accountStatus: z.nativeEnum(AccountStatus).optional(),
    location: z.string().optional(),
    country: z.string().optional(),
    region: z.string().optional(),
    city: z.string().optional(),
    age: z.number().optional(),
    bio: z.string().optional(),
    bionicLookingFor: z.string().optional(),
    isBionicProduct: z.boolean().optional(),
  }),
});

const suspendUserValidationSchema = z.object({
  body: z.object({
    reason: z.string({ required_error: "Suspension reason is required" }).min(3, "Reason must be at least 3 characters"),
  }),
});

export const UserValidation = {
  createUserValidationSchema,
  updateUserValidationSchema,
  suspendUserValidationSchema,
};
