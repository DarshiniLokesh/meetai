import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";

// Get database URL - prefer pooler URL for better connection handling
// Neon pooler URLs typically end with ?pgbouncer=true or use a separate pooler endpoint
const databaseUrl = process.env.DATABASE_URL!;

if (!databaseUrl) {
  throw new Error("DATABASE_URL environment variable is not set");
}

// Configure Neon client with fetch options for better timeout handling
const sql = neon(databaseUrl, {
  fetchOptions: {
    cache: "no-store",
  },
});

export const db = drizzle(sql);