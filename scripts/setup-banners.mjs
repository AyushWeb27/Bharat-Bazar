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

async function setupBanners() {
  await sql`
    CREATE TABLE IF NOT EXISTS admin_banners (
      id SERIAL PRIMARY KEY,
      title VARCHAR(120) NOT NULL,
      badge VARCHAR(80) NOT NULL DEFAULT '',
      line_1 VARCHAR(80) NOT NULL DEFAULT '',
      line_2 VARCHAR(80) NOT NULL DEFAULT '',
      line_3 VARCHAR(80) NOT NULL DEFAULT '',
      offer VARCHAR(160) NOT NULL DEFAULT '',
      subtitle VARCHAR(240) NOT NULL DEFAULT '',
      cta VARCHAR(40) NOT NULL DEFAULT 'Shop Now',
      cta_sub VARCHAR(100) NOT NULL DEFAULT '',
      tags JSONB NOT NULL DEFAULT '[]'::JSONB,
      stats JSONB NOT NULL DEFAULT '[]'::JSONB,
      link VARCHAR(500) NOT NULL DEFAULT '/products',
      type VARCHAR(16) NOT NULL DEFAULT 'hero'
        CHECK (type IN ('hero', 'strip', 'popup')),
      status VARCHAR(16) NOT NULL DEFAULT 'active'
        CHECK (status IN ('active', 'scheduled', 'paused')),
      image_url TEXT NOT NULL DEFAULT '',
      product_image_url TEXT NOT NULL DEFAULT '',
      gradient_from VARCHAR(7) NOT NULL DEFAULT '#009966',
      gradient_to VARCHAR(7) NOT NULL DEFAULT '#0d9488',
      start_date DATE,
      end_date DATE,
      clicks INTEGER NOT NULL DEFAULT 0 CHECK (clicks >= 0),
      impressions INTEGER NOT NULL DEFAULT 0 CHECK (impressions >= 0),
      sort_order INTEGER NOT NULL DEFAULT 1 CHECK (sort_order > 0),
      created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CHECK (start_date IS NULL OR end_date IS NULL OR end_date >= start_date)
    )
  `;
  await sql`ALTER TABLE admin_banners ADD COLUMN IF NOT EXISTS badge VARCHAR(80) NOT NULL DEFAULT ''`;
  await sql`ALTER TABLE admin_banners ADD COLUMN IF NOT EXISTS line_1 VARCHAR(80) NOT NULL DEFAULT ''`;
  await sql`ALTER TABLE admin_banners ADD COLUMN IF NOT EXISTS line_2 VARCHAR(80) NOT NULL DEFAULT ''`;
  await sql`ALTER TABLE admin_banners ADD COLUMN IF NOT EXISTS line_3 VARCHAR(80) NOT NULL DEFAULT ''`;
  await sql`ALTER TABLE admin_banners ADD COLUMN IF NOT EXISTS offer VARCHAR(160) NOT NULL DEFAULT ''`;
  await sql`ALTER TABLE admin_banners ADD COLUMN IF NOT EXISTS cta_sub VARCHAR(100) NOT NULL DEFAULT ''`;
  await sql`ALTER TABLE admin_banners ADD COLUMN IF NOT EXISTS product_image_url TEXT NOT NULL DEFAULT ''`;
  await sql`ALTER TABLE admin_banners ADD COLUMN IF NOT EXISTS tags JSONB NOT NULL DEFAULT '[]'::JSONB`;
  await sql`ALTER TABLE admin_banners ADD COLUMN IF NOT EXISTS stats JSONB NOT NULL DEFAULT '[]'::JSONB`;
  await sql`UPDATE admin_banners SET line_1 = title WHERE line_1 = ''`;
  await sql`UPDATE admin_banners SET offer = subtitle WHERE offer = ''`;
  const stripBanners = [
    ["🪔 Diwali Bonanza", "Up to 70% off everything", "#78350f", "#f59e0b"],
    ["🥻 Ethnic Festival", "Sarees, Lehengas, Kurtas", "#500724", "#ec4899"],
    ["🌿 Ayurveda Sale", "100% Natural Products", "#003d28", "#00cc88"],
  ];
  for (const [index, [title, subtitle, gradientFrom, gradientTo]] of stripBanners.entries()) {
    await sql`
      INSERT INTO admin_banners (
        title, line_1, subtitle, cta, link, type, status, gradient_from, gradient_to, sort_order
      )
      SELECT ${title}, ${title}, ${subtitle}, 'Shop Now', '/products',
             'strip', 'active', ${gradientFrom}, ${gradientTo}, ${index + 1}
      WHERE NOT EXISTS (
        SELECT 1 FROM admin_banners WHERE type = 'strip' AND title = ${title}
      )
    `;
  }
  await sql`
    CREATE INDEX IF NOT EXISTS admin_banners_storefront_idx
    ON admin_banners (type, status, sort_order)
  `;

  const result = await sql`SELECT COUNT(*)::INT AS count FROM admin_banners`;
  console.log(`Banners table is ready (${result[0].count} records).`);
}

setupBanners().catch(error => {
  console.error("Failed to set up banners:", error);
  process.exitCode = 1;
});
