/**
 * Reusable dynamic Prisma where-clause query builder.
 * Eliminates repetitive boilerplate loops across all service files.
 */
export const buildPrismaWhere = (
  searchTerm?: string,
  searchableFields: string[] = [],
  filterData: Record<string, any> = {},
  customConditions: any[] = []
): any => {
  const andConditions: any[] = [...customConditions];

  if (searchTerm && searchableFields.length > 0) {
    andConditions.push({
      OR: searchableFields.map((field) => {
        if (field.includes(".")) {
          const [relation, relField] = field.split(".");
          return {
            [relation]: {
              [relField]: { contains: searchTerm, mode: "insensitive" },
            },
          };
        }
        return {
          [field]: { contains: searchTerm, mode: "insensitive" },
        };
      }),
    });
  }

  // Automatically attach non-empty filter criteria
  Object.entries(filterData).forEach(([key, value]) => {
    if (
      value !== undefined &&
      value !== null &&
      value !== "" &&
      value !== "ALL" &&
      value !== "All"
    ) {
      andConditions.push({
        [key]: { equals: value },
      });
    }
  });

  return andConditions.length > 0 ? { AND: andConditions } : {};
};
