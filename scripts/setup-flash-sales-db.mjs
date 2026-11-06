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

async function setupFlashSales() {
  await sql`
    CREATE TABLE IF NOT EXISTS admin_flash_sales (
      id SERIAL PRIMARY KEY,
      name VARCHAR(120) NOT NULL,
      discount_type VARCHAR(16) NOT NULL
        CHECK (discount_type IN ('percent', 'flat')),
      discount_value NUMERIC(12, 2) NOT NULL CHECK (discount_value > 0),
      start_at TIMESTAMP WITH TIME ZONE NOT NULL,
      end_at TIMESTAMP WITH TIME ZONE NOT NULL,
      is_active BOOLEAN NOT NULL DEFAULT TRUE,
      created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CHECK (end_at > start_at),
      CHECK (discount_type != 'percent' OR discount_value <= 100)
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS admin_flash_sale_products (
      sale_id INTEGER NOT NULL REFERENCES admin_flash_sales(id) ON DELETE CASCADE,
      product_id INTEGER NOT NULL REFERENCES admin_products(id) ON DELETE CASCADE,
      PRIMARY KEY (sale_id, product_id)
    )
  `;
  await sql`
    CREATE INDEX IF NOT EXISTS admin_flash_sales_active_dates_idx
    ON admin_flash_sales (is_active, start_at, end_at)
  `;
  await sql`
    CREATE INDEX IF NOT EXISTS admin_flash_sale_products_product_idx
    ON admin_flash_sale_products (product_id)
  `;

  console.log("Flash sales tables are ready.");
}

setupFlashSales().catch(error => {
  console.error("Failed to set up flash sales:", error);
  process.exitCode = 1;
});
