import app from "./app";
import { config } from "./config";
import prisma from "./config/database";

async function main() {
  try {
    // Verify database connection
    await prisma.$connect();
    console.log("[DB] Connected to PostgreSQL");

    app.listen(config.port, () => {
      console.log(`[SERVER] Running on http://localhost:${config.port}`);
      console.log(`[SERVER] Environment: ${config.nodeEnv}`);
    });
  } catch (error) {
    console.error("[SERVER] Failed to start:", error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on("SIGINT", async () => {
  await prisma.$disconnect();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  await prisma.$disconnect();
  process.exit(0);
});

main();
