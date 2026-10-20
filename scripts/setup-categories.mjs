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

async function setupCategories() {
  await sql`
    CREATE TABLE IF NOT EXISTS admin_categories (
      id SERIAL PRIMARY KEY,
      name VARCHAR(120) NOT NULL,
      slug VARCHAR(120) NOT NULL UNIQUE,
      group_id INTEGER NOT NULL REFERENCES admin_group_categories(id) ON DELETE RESTRICT,
      emoji VARCHAR(16) NOT NULL DEFAULT '📦',
      image_url TEXT NOT NULL DEFAULT '',
      active BOOLEAN NOT NULL DEFAULT TRUE,
      created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `;
  await sql`
    CREATE INDEX IF NOT EXISTS admin_categories_group_id_idx
    ON admin_categories (group_id)
  `;

  const seeds = [
    ["Electronics", "electronics", "electronics-tech", "💻", true],
    ["Fashion", "fashion", "apparel-lifestyle", "👗", true],
    ["Home & Living", "home-living", "home-lifestyle", "🏠", true],
    ["Beauty", "beauty", "health-wellness", "💄", true],
    ["Sports", "sports", "sports-outdoors", "⚽", true],
    ["Books", "books", "education-media", "📚", true],
    ["Grocery", "grocery", "food-beverages", "🛒", true],
    ["Toys & Games", "toys-games", "kids-baby", "🎮", false],
    ["Furniture", "furniture", "home-lifestyle", "🛋️", true],
    ["Jewellery", "jewellery", "apparel-lifestyle", "💍", true],
  ];

  for (const [name, slug, groupSlug, emoji, active] of seeds) {
    await sql`
      INSERT INTO admin_categories (name, slug, group_id, emoji, active)
      SELECT ${name}, ${slug}, id, ${emoji}, ${active}
      FROM admin_group_categories
      WHERE slug = ${groupSlug}
      ON CONFLICT (slug) DO NOTHING
    `;
  }

  const result = await sql`SELECT COUNT(*)::INT AS count FROM admin_categories`;
  console.log(`Categories table is ready (${result[0].count} records).`);
}

setupCategories().catch(error => {
  console.error("Failed to set up categories:", error);
  process.exitCode = 1;
});
