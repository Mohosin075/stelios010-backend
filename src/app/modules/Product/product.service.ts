import httpStatus from "http-status";
import { LimbCategory, Product, ProductStatus, ProductType } from "@prisma/client";
import ApiError from "../../../errors/ApiErrors";
import { IPaginationOptions } from "../../../interfaces/paginations";
import prisma from "../../../shared/prisma";
import { paginationHelpers } from "../../../utils/paginationHelper";
import { productSearchableFields } from "./product.constant";
import { IProductFilterRequest } from "./product.interface";
import { buildPrismaWhere } from "../../../utils/queryBuilder";
import { enumToUi, uiToEnum } from "../../../utils/formatters";

const formatProductItem = (p: any) => ({
  id: p.id,
  name: p.name,
  pioneerName: p.pioneer?.name || p.pioneerName || "Independent",
  pioneerId: p.pioneerId,
  limbCategory: (enumToUi(p.limbCategory) as "Upper Limb" | "Lower Limb") || "Upper Limb",
  productType: (enumToUi(p.productType) as any) || "Bionic Hand",
  activeUsers: p.activeUsers || 0,
  status: p.status === ProductStatus.ACTIVE ? "Active" : "Inactive",
  description: p.description || "",
  tags: p.tags || [],
  verifiedReviewsCount: p.verifiedReviewsCount || 0,
  imageUrl: p.imageUrl,
  videoUrl: p.videoUrl,
});

const createProduct = async (payload: any): Promise<any> => {
  const pioneer = await prisma.pioneer.findUnique({
    where: { id: payload.pioneerId },
  });

  if (!pioneer) {
    throw new ApiError(httpStatus.NOT_FOUND, "Associated Pioneer not found!");
  }

  const result = await prisma.product.create({
    data: {
      ...payload,
      limbCategory: (uiToEnum(payload.limbCategory) as LimbCategory) || LimbCategory.UPPER_LIMB,
      productType: (uiToEnum(payload.productType) as ProductType) || ProductType.BIONIC_HAND,
      status: (uiToEnum(payload.status) as ProductStatus) || ProductStatus.ACTIVE,
    },
    include: {
      pioneer: {
        select: { id: true, name: true, location: true },
      },
    },
  });

  return formatProductItem(result);
};

const getAllProducts = async (
  filters: IProductFilterRequest,
  options: IPaginationOptions
) => {
  const { limit, page, skip, sortBy, sortOrder } =
    paginationHelpers.calculatePagination(options);
  const { searchTerm, pioneerName, limbCategory, productType, status, ...otherFilters } = filters;

  const normalizedFilters: Record<string, any> = {
    ...otherFilters,
    ...(limbCategory ? { limbCategory: uiToEnum(limbCategory as any) } : {}),
    ...(productType ? { productType: uiToEnum(productType as any) } : {}),
    ...(status ? { status: uiToEnum(status as any) } : {}),
  };

  const customConditions: any[] = [];
  if (pioneerName && pioneerName !== "ALL") {
    customConditions.push({
      pioneer: { name: { equals: pioneerName, mode: "insensitive" } },
    });
  }

  const whereConditions = buildPrismaWhere(
    searchTerm,
    productSearchableFields,
    normalizedFilters,
    customConditions
  );

  const [result, total, uniquePioneers] = await Promise.all([
    prisma.product.findMany({
      where: whereConditions,
      skip,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
      include: {
        pioneer: {
          select: { id: true, name: true, location: true, logo: true },
        },
      },
    }),
    prisma.product.count({ where: whereConditions }),
    prisma.pioneer.findMany({
      select: { id: true, name: true },
      distinct: ["name"],
    }),
  ]);

  return {
    meta: {
      page,
      limit,
      total,
      totalPage: Math.ceil(total / limit),
      pioneersList: uniquePioneers.map((p) => p.name),
    },
    data: result.map(formatProductItem),
  };
};

const getProductById = async (id: string) => {
  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      pioneer: true,
      verifications: {
        take: 5,
        orderBy: { submissionDate: "desc" },
        include: {
          user: {
            select: { id: true, name: true, email: true },
          },
        },
      },
    },
  });

  if (!product) {
    throw new ApiError(httpStatus.NOT_FOUND, "Product not found!");
  }

  return formatProductItem(product);
};

const updateProduct = async (id: string, payload: any) => {
  const existing = await prisma.product.findUnique({ where: { id } });
  if (!existing) {
    throw new ApiError(httpStatus.NOT_FOUND, "Product not found!");
  }

  if (payload.pioneerId) {
    const pioneer = await prisma.pioneer.findUnique({
      where: { id: payload.pioneerId },
    });
    if (!pioneer) {
      throw new ApiError(httpStatus.NOT_FOUND, "Associated Pioneer not found!");
    }
  }

  const normalizedData: any = { ...payload };
  if (payload.limbCategory) normalizedData.limbCategory = uiToEnum(payload.limbCategory);
  if (payload.productType) normalizedData.productType = uiToEnum(payload.productType);
  if (payload.status) normalizedData.status = uiToEnum(payload.status);

  const updated = await prisma.product.update({
    where: { id },
    data: normalizedData,
    include: {
      pioneer: { select: { id: true, name: true } },
    },
  });

  return formatProductItem(updated);
};

const deleteProduct = async (id: string) => {
  const existing = await prisma.product.findUnique({ where: { id } });
  if (!existing) {
    throw new ApiError(httpStatus.NOT_FOUND, "Product not found!");
  }

  await prisma.product.delete({ where: { id } });

  return { message: "Product deleted successfully!" };
};

export const ProductService = {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
};
