import { UserRole } from "@prisma/client";
import bcrypt from "bcryptjs";
import prisma from "../../shared/prisma";

export const seedSuperAdmin = async () => {
  try {
    const superAdminEmail = process.env.SUPER_ADMIN_EMAIL || "admin@example.com";
    const superAdminPassword = process.env.SUPER_ADMIN_PASSWORD || "admin123";

    const existingSuperAdmin = await prisma.user.findUnique({
      where: { email: superAdminEmail },
    });

    if (existingSuperAdmin) {
      return;
    }

    const hashedPassword = await bcrypt.hash(superAdminPassword, 12);

    await prisma.user.create({
      data: {
        name: "Super Admin",
        email: superAdminEmail,
        password: hashedPassword,
        role: UserRole.SUPER_ADMIN,
      },
    });

    console.log(`✅ Super Admin seeded successfully (${superAdminEmail})`);
  } catch (error) {
    console.error("Failed to seed super admin:", error);
  }
};
