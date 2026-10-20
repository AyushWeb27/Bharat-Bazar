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

const sql = neon(databaseUrl);

async function migrate() {
  console.log("Migrating users table in Neon DB...");

  await sql`
    ALTER TABLE users
    ADD COLUMN IF NOT EXISTS auth_provider VARCHAR(50) DEFAULT 'local',
    ADD COLUMN IF NOT EXISTS last_login TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP;
  `;

  console.log("Migration complete!");
}

migrate().catch(e => {
  console.error("Migration error:", e);
  process.exit(1);
});
