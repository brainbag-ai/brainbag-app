import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";
import dotenv from "dotenv";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

dotenv.config({
  path: ".env.local",
});

const generateMigration = async () => {
  if (!process.env.POSTGRES_URL) {
    throw new Error("POSTGRES_URL is not defined");
  }

  console.log("⏳ Generating migration...");

  try {
    // Run drizzle-kit generate to create the migration
    const { stdout, stderr } = await execAsync("npx drizzle-kit generate:pg");
    if (stderr) {
      console.error("Error generating migration:", stderr);
    } else {
      console.log("✅ Migration generated successfully");
      console.log(stdout);
    }
  } catch (error) {
    console.error("❌ Migration generation failed", error);
    process.exit(1);
  }
};

generateMigration().catch((err) => {
  console.error("❌ Migration generation failed");
  console.error(err);
  process.exit(1);
});