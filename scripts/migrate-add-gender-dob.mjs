import { neon } from "@neondatabase/serverless";
import fs from "fs";
import path from "path";

const envPath = path.resolve(process.cwd(), ".env");
const envContent = fs.readFileSync(envPath, "utf-8");
let databaseUrl = "";

for (const line of envContent.split(/\r?\n/)) {
  const trimmed = line.trim();
  if (trimmed.startsWith("DATABASE_URL=")) {
    databaseUrl = trimmed.substring("DATABASE_URL=".length).trim().replace(/^["']|["']$/g, "");
    break;
  }
}

if (!databaseUrl) {
  console.error("ERROR: DATABASE_URL not found in .env file");
  process.exit(1);
}

const sql = neon(databaseUrl);

async function migrate() {
  console.log("Running migration: add gender & date_of_birth to users table...");

  await sql`
    ALTER TABLE users
    ADD COLUMN IF NOT EXISTS gender VARCHAR(20) DEFAULT NULL,
    ADD COLUMN IF NOT EXISTS date_of_birth DATE DEFAULT NULL
  `;

  console.log("Migration complete! Columns added:");
  console.log("   - gender (VARCHAR 20, nullable)");
  console.log("   - date_of_birth (DATE, nullable)");

  // Verify columns exist
  const cols = await sql`
    SELECT column_name, data_type, is_nullable
    FROM information_schema.columns
    WHERE table_name = 'users'
      AND column_name IN ('gender', 'date_of_birth')
    ORDER BY column_name
  `;
  console.log("\nVerified columns in DB:");
  cols.forEach(c => console.log(`   - ${c.column_name}: ${c.data_type} (nullable: ${c.is_nullable})`));
}

migrate().catch(e => {
  console.error("Migration error:", e);
  process.exit(1);
});
