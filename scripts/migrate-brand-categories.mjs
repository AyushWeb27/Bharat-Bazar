import { neon } from "@neondatabase/serverless";
import dotenv from "dotenv";

dotenv.config({ path: ".env" });

const databaseUrl =
  process.env.DATABASE_URL ||
  process.env.POSTGRES_URL ||
  process.env.NEON_DATABASE_URL;

if (!databaseUrl) {
  console.error("DATABASE_URL, POSTGRES_URL, or NEON_DATABASE_URL is required.");
  process.exit(1);
}

const sql = neon(databaseUrl);

async function migrateBrandCategories() {
  console.log("Checking admin_brands table...");
  await sql`
    ALTER TABLE admin_brands
    ADD COLUMN IF NOT EXISTS categories JSONB NOT NULL DEFAULT '[]'::jsonb
  `;
  console.log("Added column 'categories' to admin_brands (if not exists).");

  const updateResult = await sql`
    UPDATE admin_brands
    SET categories = jsonb_build_array(category)
    WHERE (categories IS NULL OR categories = '[]'::jsonb)
      AND category IS NOT NULL
      AND category != ''
    RETURNING id, name, category, categories
  `;

  console.log(`Migrated ${updateResult.length} existing brand(s) to have categories array.`);

  const sample = await sql`
    SELECT id, name, category, categories
    FROM admin_brands
    LIMIT 5
  `;
  console.log("Sample records:", sample);
}

migrateBrandCategories().catch(err => {
  console.error("Migration failed:", err);
  process.exitCode = 1;
});

