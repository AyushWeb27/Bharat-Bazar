import { neon } from "@neondatabase/serverless";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error("❌ ERROR: DATABASE_URL is not defined in environment variables.");
  process.exit(1);
}

const sql = neon(databaseUrl);

async function migrate() {
  console.log("🚀 Checking and adding profile columns to 'admins' table in Neon database...");

  await sql`
    ALTER TABLE admins 
    ADD COLUMN IF NOT EXISTS phone VARCHAR(30) DEFAULT '',
    ADD COLUMN IF NOT EXISTS designation VARCHAR(100) DEFAULT 'Super Administrator',
    ADD COLUMN IF NOT EXISTS bio TEXT DEFAULT '',
    ADD COLUMN IF NOT EXISTS avatar_url TEXT DEFAULT '';
  `;

  console.log("✅ Profile columns (phone, designation, bio, avatar_url) verified/added successfully in Neon DB!");

  const sample = await sql`SELECT id, name, email, phone, designation, bio, role FROM admins LIMIT 2`;
  console.log("📊 Sample Admin records with profile fields:", sample);
}

migrate().catch(err => {
  console.error("❌ Migration error:", err);
  process.exit(1);
});
