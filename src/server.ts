import { Server } from "http";
import app from "./app";
import config from "./config";
import { seedSuperAdmin } from "./app/db/db";

let server: Server;

// Main function to start the server
async function main() {
  try {
    await seedSuperAdmin();

    server = app.listen(config.port, () => {
      console.log(`🚀 Server is running on port ${config.port}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
  }
}

// Start the server
main();

process.on("unhandledRejection", (err) => {
  console.error(`😈 unhandledRejection detected, shutting down...`, err);
  if (server) {
    server.close(() => {
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
});

process.on("uncaughtException", (err) => {
  console.error(`😈 uncaughtException detected, shutting down...`, err);
  process.exit(1);
});
