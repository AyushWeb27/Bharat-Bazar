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

async function setupSubcategories() {
  await sql`
    CREATE TABLE IF NOT EXISTS admin_subcategories (
      id SERIAL PRIMARY KEY,
      name VARCHAR(120) NOT NULL,
      slug VARCHAR(120) NOT NULL UNIQUE,
      parent_id INTEGER NOT NULL REFERENCES admin_categories(id) ON DELETE RESTRICT,
      emoji VARCHAR(16) NOT NULL DEFAULT '📁',
      image_url TEXT NOT NULL DEFAULT '',
      sort_order INTEGER NOT NULL DEFAULT 1 CHECK (sort_order > 0),
      active BOOLEAN NOT NULL DEFAULT TRUE,
      created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `;
  await sql`
    CREATE INDEX IF NOT EXISTS admin_subcategories_parent_sort_idx
    ON admin_subcategories (parent_id, sort_order, id)
  `;

  const seeds = [
    ["Smartphones", "smartphones", "electronics", "📱", 1, true],
    ["Laptops", "laptops", "electronics", "💻", 2, true],
    ["Tablets", "tablets", "electronics", "📱", 3, true],
    ["Cameras", "cameras", "electronics", "📷", 4, true],
    ["Men's Clothing", "mens-clothing", "fashion", "👔", 1, true],
    ["Women's Clothing", "womens-clothing", "fashion", "👗", 2, true],
    ["Footwear", "footwear", "fashion", "👟", 3, true],
    ["Jewellery", "jewellery-sub", "fashion", "💍", 4, true],
    ["Furniture", "furniture-sub", "home-living", "🛋️", 1, true],
    ["Kitchen", "kitchen", "home-living", "🍳", 2, true],
    ["Skincare", "skincare", "beauty", "✨", 1, true],
    ["Haircare", "haircare", "beauty", "💇", 2, false],
    ["Cricket", "cricket", "sports", "🏏", 1, true],
    ["Fitness Equipment", "fitness", "sports", "🏋️", 2, true],
  ];

  for (const [name, slug, parentSlug, emoji, sortOrder, active] of seeds) {
    await sql`
      INSERT INTO admin_subcategories (name, slug, parent_id, emoji, sort_order, active)
      SELECT ${name}, ${slug}, id, ${emoji}, ${sortOrder}, ${active}
      FROM admin_categories
      WHERE slug = ${parentSlug}
      ON CONFLICT (slug) DO NOTHING
    `;
  }

  const result = await sql`SELECT COUNT(*)::INT AS count FROM admin_subcategories`;
  console.log(`Subcategories table is ready (${result[0].count} records).`);
}

setupSubcategories().catch(error => {
  console.error("Failed to set up subcategories:", error);
  process.exitCode = 1;
});
