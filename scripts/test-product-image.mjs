import { neon } from "@neondatabase/serverless";
import dotenv from "dotenv";

dotenv.config({ path: ".env" });

const sql = neon(process.env.DATABASE_URL);

async function test() {
  const rows = await sql`
    SELECT p.id, p.main_image_url, p.gallery_images
    FROM admin_products p
    JOIN admin_categories c
      ON LOWER(TRIM(c.name)) = LOWER(TRIM(p.category))
      AND c.active = TRUE
    JOIN admin_group_categories g
      ON g.id = c.group_id AND g.active = TRUE
    WHERE p.id = 4 AND p.status = 'active' AND p.main_image_url <> ''
    LIMIT 1
  `;
  console.log("Row found:", rows.length > 0);
  if (rows.length > 0) {
    const mainImg = rows[0].main_image_url;
    console.log("main_image starts with data:image?", mainImg.startsWith("data:image"));
    const match = mainImg.match(/^data:([^;]+);base64,(.+)$/s);
    if (match) {
      console.log("Matched contentType:", match[1]);
      const buf = Buffer.from(match[2], "base64");
      console.log("Decoded buffer byte length:", buf.length);
    }

    const gal0 = rows[0].gallery_images[0];
    console.log("gal0 starts with data:image?", gal0.startsWith("data:image"));
    const galMatch = gal0.match(/^data:([^;]+);base64,(.+)$/s);
    if (galMatch) {
      console.log("Matched gallery[0] contentType:", galMatch[1]);
      const bufGal = Buffer.from(galMatch[2], "base64");
      console.log("Decoded gallery[0] buffer byte length:", bufGal.length);
    }
  }
}
test().catch(console.error);

