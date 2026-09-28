import { z } from "zod";
import { LimbCategory, ProductStatus, ProductType } from "@prisma/client";

const createProductSchema = z.object({
  body: z.object({
    pioneerId: z.string({ required_error: "Pioneer ID is required" }),
    name: z.string({ required_error: "Product name is required" }),
    limbCategory: z.nativeEnum(LimbCategory, { required_error: "Limb category is required" }),
    productType: z.nativeEnum(ProductType, { required_error: "Product type is required" }),
    activeUsers: z.number().optional(),
    status: z.nativeEnum(ProductStatus).optional(),
    description: z.string().optional(),
    tags: z.array(z.string()).optional(),
    verifiedReviewsCount: z.number().optional(),
    imageUrl: z.string().optional(),
    videoUrl: z.string().optional(),
  }),
});

const updateProductSchema = z.object({
  body: z.object({
    pioneerId: z.string().optional(),
    name: z.string().optional(),
    limbCategory: z.nativeEnum(LimbCategory).optional(),
    productType: z.nativeEnum(ProductType).optional(),
    activeUsers: z.number().optional(),
    status: z.nativeEnum(ProductStatus).optional(),
    description: z.string().optional(),
    tags: z.array(z.string()).optional(),
    verifiedReviewsCount: z.number().optional(),
    imageUrl: z.string().optional(),
    videoUrl: z.string().optional(),
  }),
});

export const ProductValidation = {
  createProductSchema,
  updateProductSchema,
};
