import { PrismaClient } from "@prisma/client";
import { seedSuperAdmin } from "../app/db/db";

const prisma = new PrismaClient();

// Handle connection
async function connectPrisma() {
  try {
    await prisma.$connect();
    console.log("Prisma connected to the database successfully!");

    // Seed super admin
    seedSuperAdmin().catch((err) => {
      console.warn("Seeding notice (database may need migration first):", err.message || err);
    });
  } catch (error) {
    console.error("Prisma connection warning:", error);
  }

  // Graceful shutdown
  process.on("SIGINT", async () => {
    await prisma.$disconnect();
    console.log("Prisma disconnected due to application termination.");
    process.exit(0);
  });
}

connectPrisma();

export default prisma;
