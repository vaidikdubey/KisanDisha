import "dotenv/config";
import { runIngestion } from "@/lib/runIngestion";
import { prisma } from "@/lib/prisma";

const STATES = ["Madhya Pradesh", "Uttar Pradesh"];

runIngestion(STATES)
  .then((result) => console.log("Done:", result))
  .catch((error) => {
    console.error("Ingestion script crashed:", error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());