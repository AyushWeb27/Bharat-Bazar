import { neon } from "@neondatabase/serverless";
import fs from "fs";

const envFile = fs.readFileSync(".env", "utf8");
const dbMatch = envFile.match(/DATABASE_URL="?([^"\n\r]+)"?/);
const sql = neon(dbMatch[1]);

async function run() {
  const p8 = await sql`SELECT * FROM admin_products WHERE id = 8`;
  console.log('Product 8 full row:', JSON.stringify(p8, null, 2));

  // Now let's test why /api/products on Vercel returned only 2 products
  // Wait, could it be mapping or details parsing or JSON error or is Vercel connected to a different database or what?
}

run().catch(console.error);
