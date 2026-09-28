import { LimbCategory, ProductStatus, ProductType } from "@prisma/client";

export type IProductFilterRequest = {
  searchTerm?: string;
  limbCategory?: LimbCategory;
  productType?: ProductType;
  status?: ProductStatus;
  pioneerId?: string;
  pioneerName?: string;
};
