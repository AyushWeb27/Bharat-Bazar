import { neon } from "@neondatabase/serverless";

const databaseUrl =
  process.env.DATABASE_URL ||
  process.env.POSTGRES_URL ||
  process.env.NEON_DATABASE_URL;

if (!databaseUrl) {
  console.error("DATABASE_URL, POSTGRES_URL, or NEON_DATABASE_URL is required.");
  process.exit(1);
}

const sql = neon(databaseUrl);

async function setupGroupCategories() {
  await sql`
    CREATE TABLE IF NOT EXISTS admin_group_categories (
      id SERIAL PRIMARY KEY,
      name VARCHAR(120) NOT NULL,
      slug VARCHAR(120) NOT NULL UNIQUE,
      color VARCHAR(7) NOT NULL DEFAULT '#009966',
      description TEXT NOT NULL DEFAULT '',
      active BOOLEAN NOT NULL DEFAULT TRUE,
      created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT admin_group_categories_color_format
        CHECK (color ~ '^#[0-9A-Fa-f]{6}$')
    )
  `;

  const seedGroups = [
    ["Electronics & Tech", "electronics-tech", "#3b82f6", true],
    ["Apparel & Lifestyle", "apparel-lifestyle", "#ec4899", true],
    ["Home & Lifestyle", "home-lifestyle", "#f59e0b", true],
    ["Health & Wellness", "health-wellness", "#10b981", true],
    ["Sports & Outdoors", "sports-outdoors", "#8b5cf6", true],
    ["Education & Media", "education-media", "#f97316", true],
    ["Food & Beverages", "food-beverages", "#009966", true],
    ["Kids & Baby", "kids-baby", "#ef4444", false],
  ];

  for (const [name, slug, color, active] of seedGroups) {
    await sql`
      INSERT INTO admin_group_categories (name, slug, color, active)
      VALUES (${name}, ${slug}, ${color}, ${active})
      ON CONFLICT (slug) DO NOTHING
    `;
  }

  const result = await sql`SELECT COUNT(*)::INT AS count FROM admin_group_categories`;
  console.log(`Group categories table is ready (${result[0].count} records).`);
}

setupGroupCategories().catch(error => {
  console.error("Failed to set up group categories:", error);
  process.exitCode = 1;
});
