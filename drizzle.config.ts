import { config as loadEnv } from "dotenv";
import fs from "fs";

// Prefer .env.local (Next.js convention) and fall back to .env
const envPath = fs.existsSync(".env.local") ? ".env.local" : ".env";
loadEnv({ path: envPath });
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  out: "./drizzle",
  schema: "./src/db/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
