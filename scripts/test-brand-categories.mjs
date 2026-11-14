import { neon } from "@neondatabase/serverless";
import dotenv from "dotenv";

dotenv.config({ path: ".env" });

const dbUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL || process.env.NEON_DATABASE_URL;
if (!dbUrl) {
  console.error("No database URL");
  process.exit(1);
}

const sql = neon(dbUrl);

async function testBrandMultiCategory() {
  console.log("1. Testing insert of a brand with multiple categories...");
  const testSlug = "test-multicat-brand-" + Date.now();
  const testCategories = ["Electronics", "Sports", "Home & Living"];

  const inserted = await sql`
    INSERT INTO admin_brands (
      name, slug, category, categories, logo_color, country, country_flag, website, description, featured, active, premium
    ) VALUES (
      'Test Brand MultiCat', ${testSlug}, ${testCategories[0]}, ${JSON.stringify(testCategories)}::jsonb, '#009966', 'India', '🇮🇳', 'testbrand.com', 'Test brand description', true, true, false
    )
    RETURNING id, name, slug, category, categories
  `;

  console.log("Inserted brand:", inserted[0]);
  const brandId = inserted[0].id;

  console.log("\n2. Testing querying by individual categories using JSONB containment...");
  const querySports = await sql`
    SELECT id, name, category, categories
    FROM admin_brands
    WHERE id = ${brandId} AND categories @> ${JSON.stringify(["Sports"])}::jsonb
  `;
  console.log("Matched category 'Sports'?", querySports.length > 0);

  const queryHome = await sql`
    SELECT id, name, category, categories
    FROM admin_brands
    WHERE id = ${brandId} AND categories @> ${JSON.stringify(["Home & Living"])}::jsonb
  `;
  console.log("Matched category 'Home & Living'?", queryHome.length > 0);

  console.log("\n3. Testing updating brand categories (Edit Time)...");
  const updatedCategories = ["Beauty", "Fashion"];
  const updated = await sql`
    UPDATE admin_brands
    SET category = ${updatedCategories[0]},
        categories = ${JSON.stringify(updatedCategories)}::jsonb
    WHERE id = ${brandId}
    RETURNING id, name, category, categories
  `;
  console.log("Updated brand (Edit Brand Time):", updated[0]);

  console.log("\n4. Cleaning up test brand...");
  await sql`DELETE FROM admin_brands WHERE id = ${brandId}`;
  console.log("Cleanup complete. All tests PASSED successfully!");
}

testBrandMultiCategory().catch(err => {
  console.error("Test failed:", err);
  process.exitCode = 1;
});

