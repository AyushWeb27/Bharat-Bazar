import { neon } from "@neondatabase/serverless";
import fs from "fs";

const envFile = fs.readFileSync(".env", "utf8");
const dbMatch = envFile.match(/DATABASE_URL="?([^"\n\r]+)"?/);
const sql = neon(dbMatch[1]);

async function checkQuotes() {
  const p8 = await sql`SELECT id, name, category FROM admin_products WHERE id = 8`;
  const cat = await sql`SELECT id, name FROM admin_categories WHERE name ILIKE '%women%'`;
  console.log('Product 8 category:', p8[0]?.category, 'Char codes:', [...(p8[0]?.category || '')].map(c => c.charCodeAt(0)));
  console.log('Category matches:', cat.map(c => ({ name: c.name, charCodes: [...c.name].map(ch => ch.charCodeAt(0)) })));
}

checkQuotes().catch(console.error);
