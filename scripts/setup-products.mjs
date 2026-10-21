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

async function setupProducts() {
  await sql`
    CREATE TABLE IF NOT EXISTS admin_products (
      id SERIAL PRIMARY KEY,
      name VARCHAR(200) NOT NULL,
      short_description VARCHAR(160) NOT NULL DEFAULT '',
      full_description TEXT NOT NULL DEFAULT '',
      category VARCHAR(120) NOT NULL DEFAULT '',
      subcategory VARCHAR(120) NOT NULL DEFAULT '',
      brand VARCHAR(120) NOT NULL DEFAULT '',
      mrp NUMERIC(12, 2),
      selling_price NUMERIC(12, 2),
      cost_price NUMERIC(12, 2),
      stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
      low_stock_alert INTEGER NOT NULL DEFAULT 0 CHECK (low_stock_alert >= 0),
      sku VARCHAR(100) UNIQUE,
      barcode VARCHAR(64) NOT NULL DEFAULT '',
      main_image_url TEXT,
      gallery_images JSONB NOT NULL DEFAULT '[null, null, null, null, null, null]'::JSONB,
      video_url TEXT NOT NULL DEFAULT '',
      video_file_url TEXT,
      status VARCHAR(16) NOT NULL DEFAULT 'draft'
        CHECK (status IN ('draft', 'active', 'inactive')),
      is_popular BOOLEAN NOT NULL DEFAULT FALSE,
      is_deal BOOLEAN NOT NULL DEFAULT FALSE,
      featured BOOLEAN NOT NULL DEFAULT FALSE,
      details JSONB NOT NULL DEFAULT '{}'::JSONB,
      created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `;
  await sql`
    CREATE INDEX IF NOT EXISTS admin_products_status_created_idx
    ON admin_products (status, created_at DESC)
  `;
  await sql`
    CREATE INDEX IF NOT EXISTS admin_products_category_idx
    ON admin_products (category)
  `;

  const result = await sql`SELECT COUNT(*)::INT AS count FROM admin_products`;
  console.log(`Products table is ready (${result[0].count} records).`);
}

setupProducts().catch(error => {
  console.error("Failed to set up products:", error);
  process.exitCode = 1;
});
