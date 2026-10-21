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

async function setupBrands() {
  await sql`
    CREATE TABLE IF NOT EXISTS admin_brands (
      id SERIAL PRIMARY KEY,
      name VARCHAR(120) NOT NULL,
      slug VARCHAR(120) NOT NULL UNIQUE,
      category VARCHAR(120) NOT NULL,
      logo_color VARCHAR(7) NOT NULL DEFAULT '#009966',
      logo_url TEXT,
      country VARCHAR(100) NOT NULL DEFAULT 'India',
      country_flag VARCHAR(16) NOT NULL DEFAULT '🇮🇳',
      website VARCHAR(255) NOT NULL DEFAULT '',
      description TEXT NOT NULL DEFAULT '',
      products INTEGER NOT NULL DEFAULT 0 CHECK (products >= 0),
      featured BOOLEAN NOT NULL DEFAULT FALSE,
      active BOOLEAN NOT NULL DEFAULT TRUE,
      premium BOOLEAN NOT NULL DEFAULT FALSE,
      created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `;
  await sql`ALTER TABLE admin_brands ADD COLUMN IF NOT EXISTS description TEXT NOT NULL DEFAULT ''`;
  await sql`CREATE INDEX IF NOT EXISTS admin_brands_category_idx ON admin_brands (category)`;
  await sql`CREATE INDEX IF NOT EXISTS admin_brands_status_idx ON admin_brands (active, featured, premium)`;

  const seeds = [
    ["Apple", "apple", "Electronics", "#1d1d1f", "USA", "🇺🇸", "apple.com", 342, true, true, true],
    ["Samsung", "samsung", "Electronics", "#1428a0", "South Korea", "🇰🇷", "samsung.com", 891, true, true, true],
    ["OnePlus", "oneplus", "Electronics", "#eb0029", "China", "🇨🇳", "oneplus.com", 124, false, true, false],
    ["boAt", "boat", "Electronics", "#111111", "India", "🇮🇳", "boat-lifestyle.com", 234, false, true, false],
    ["Realme", "realme", "Electronics", "#f5a623", "China", "🇨🇳", "realme.com", 98, false, true, false],
    ["Fabindia", "fabindia", "Fashion", "#8B4513", "India", "🇮🇳", "fabindia.com", 1240, true, true, false],
    ["Manyavar", "manyavar", "Fashion", "#722f37", "India", "🇮🇳", "manyavar.com", 567, true, true, false],
    ["W for Woman", "w-for-woman", "Fashion", "#e91e8c", "India", "🇮🇳", "wforwoman.com", 678, false, true, false],
    ["Himalaya", "himalaya", "Beauty", "#2d6a4f", "India", "🇮🇳", "himalayawellness.com", 432, false, true, false],
    ["Mamaearth", "mamaearth", "Beauty", "#52b788", "India", "🇮🇳", "mamaearth.in", 289, true, true, false],
    ["Nike", "nike", "Sports", "#111111", "USA", "🇺🇸", "nike.com", 623, true, true, true],
    ["Adidas", "adidas", "Sports", "#111111", "Germany", "🇩🇪", "adidas.com", 534, true, true, true],
    ["Decathlon", "decathlon", "Sports", "#0082c3", "France", "🇫🇷", "decathlon.in", 891, false, true, false],
    ["Prestige", "prestige", "Home & Living", "#c41e3a", "India", "🇮🇳", "prestigeindia.com", 234, false, true, false],
    ["Asian Paints", "asian-paints", "Home & Living", "#ff6600", "India", "🇮🇳", "asianpaints.com", 123, false, true, false],
    ["Amul", "amul", "Grocery", "#ef4444", "India", "🇮🇳", "amul.com", 156, true, true, false],
    ["Nestlé India", "nestle", "Grocery", "#0052cc", "Switzerland", "🇨🇭", "nestle.in", 98, false, true, false],
    ["Puma", "puma", "Sports", "#111111", "Germany", "🇩🇪", "puma.com", 342, false, false, false],
  ];

  for (const [name, slug, category, color, country, flag, website, products, featured, active, premium] of seeds) {
    await sql`
      INSERT INTO admin_brands
        (name, slug, category, logo_color, country, country_flag, website, products, featured, active, premium)
      VALUES
        (${name}, ${slug}, ${category}, ${color}, ${country}, ${flag}, ${website}, ${products}, ${featured}, ${active}, ${premium})
      ON CONFLICT (slug) DO NOTHING
    `;
  }

  const result = await sql`SELECT COUNT(*)::INT AS count FROM admin_brands`;
  console.log(`Brands table is ready (${result[0].count} records).`);
}

setupBrands().catch(error => {
  console.error("Failed to set up brands:", error);
  process.exitCode = 1;
});
