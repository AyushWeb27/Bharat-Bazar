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

async function setupCart() {
  await sql`
    CREATE TABLE IF NOT EXISTS customer_cart_items (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      product_id INTEGER NOT NULL REFERENCES admin_products(id) ON DELETE CASCADE,
      variant_title VARCHAR(200) NOT NULL DEFAULT '',
      quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity BETWEEN 1 AND 99),
      created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
      UNIQUE (user_id, product_id, variant_title)
    )
  `;
  await sql`
    CREATE INDEX IF NOT EXISTS customer_cart_items_user_created_idx
    ON customer_cart_items (user_id, created_at DESC)
  `;
  console.log("Customer cart table is ready.");
}

setupCart().catch(error => {
  console.error("Failed to set up customer cart:", error);
  process.exitCode = 1;
});
