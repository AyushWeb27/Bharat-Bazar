import { neon } from "@neondatabase/serverless";
import fs from "fs";
import path from "path";

// Read .env manually
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
  console.error("DATABASE_URL not found in .env");
  process.exit(1);
}

const sql = neon(databaseUrl);

async function setupOtpsTable() {
  console.log("Connecting to Neon PostgreSQL database...");

  // 1. Create otps table
  await sql`
    CREATE TABLE IF NOT EXISTS otps (
      id SERIAL PRIMARY KEY,
      identifier VARCHAR(255) NOT NULL,
      type VARCHAR(50) NOT NULL,
      otp_code VARCHAR(10) NOT NULL,
      expires_at TIMESTAMPTZ NOT NULL,
      verified BOOLEAN DEFAULT FALSE,
      attempts INTEGER DEFAULT 0,
      ip_address VARCHAR(100),
      created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
    );
  `;

  // 2. Create indexes
  await sql`CREATE INDEX IF NOT EXISTS idx_otps_identifier ON otps(identifier);`;
  await sql`CREATE INDEX IF NOT EXISTS idx_otps_code ON otps(otp_code);`;
  await sql`CREATE INDEX IF NOT EXISTS idx_otps_type ON otps(type);`;
  await sql`CREATE INDEX IF NOT EXISTS idx_otps_created_at ON otps(created_at DESC);`;

  console.log("✓ 'otps' table and indexes created successfully in Neon database!");

  // 3. Verify columns
  const cols = await sql`
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name = 'otps'
    ORDER BY ordinal_position;
  `;
  console.log("Columns in 'otps' table:");
  cols.forEach(c => console.log(`  - ${c.column_name} (${c.data_type})`));
}

setupOtpsTable().catch(e => {
  console.error("Error setting up otps table:", e);
  process.exit(1);
});
