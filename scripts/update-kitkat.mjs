import { neon } from "@neondatabase/serverless";

const databaseUrl =
  process.env.DATABASE_URL ||
  process.env.POSTGRES_URL ||
  process.env.NEON_DATABASE_URL;

if (!databaseUrl) {
  console.error("No database URL provided in environment.");
  process.exit(1);
}

const sql = neon(databaseUrl);

async function updateKitKat() {
  console.log("Checking and setting up categories and brand...");

  // 1. Ensure Snacks & Confectionery category exists
  const existingCat = await sql`
    SELECT id, name FROM admin_categories
    WHERE LOWER(TRIM(name)) = LOWER('Snacks & Confectionery')
       OR slug = 'snacks-confectionery'
    LIMIT 1
  `;

  let categoryId;
  if (existingCat.length > 0) {
    categoryId = existingCat[0].id;
    console.log(`Found existing category "Snacks & Confectionery" (ID: ${categoryId})`);
  } else {
    const insertedCat = await sql`
      INSERT INTO admin_categories (name, slug, group_id, emoji, active)
      VALUES ('Snacks & Confectionery', 'snacks-confectionery', 5, '🍫', TRUE)
      RETURNING id
    `;
    categoryId = insertedCat[0].id;
    console.log(`Created category "Snacks & Confectionery" (ID: ${categoryId})`);
  }

  // 2. Ensure Chocolates subcategory exists under Snacks & Confectionery
  const existingSubcat = await sql`
    SELECT id, name FROM admin_subcategories
    WHERE parent_id = ${categoryId} AND LOWER(TRIM(name)) = LOWER('Chocolates')
    LIMIT 1
  `;

  if (existingSubcat.length > 0) {
    console.log(`Found existing subcategory "Chocolates" under Snacks & Confectionery (ID: ${existingSubcat[0].id})`);
  } else {
    await sql`
      INSERT INTO admin_subcategories (name, slug, parent_id, emoji, sort_order, active)
      VALUES ('Chocolates', 'snacks-confectionery-chocolates', ${categoryId}, '🍫', 1, TRUE)
      ON CONFLICT (slug) DO NOTHING
    `;
    console.log('Created subcategory "Chocolates" under Snacks & Confectionery');
  }

  // 3. Ensure Nestlé KITKAT brand exists
  const existingBrand = await sql`
    SELECT id, name FROM admin_brands
    WHERE LOWER(TRIM(name)) = LOWER('Nestlé KITKAT')
       OR slug = 'nestle-kitkat'
    LIMIT 1
  `;

  if (existingBrand.length > 0) {
    console.log(`Found existing brand "Nestlé KITKAT" (ID: ${existingBrand[0].id})`);
  } else {
    await sql`
      INSERT INTO admin_brands (name, slug, category, logo_color, country, country_flag, website, description, active)
      VALUES ('Nestlé KITKAT', 'nestle-kitkat', 'Snacks & Confectionery', '#da291c', 'India', '🇮🇳', 'https://www.kitkat.in', 'Have a break, have a KitKat', TRUE)
      ON CONFLICT (slug) DO NOTHING
    `;
    console.log('Created brand "Nestlé KITKAT"');
  }

  // 4. Detailed descriptions and specifications
  // Must be <= 160 chars for admin_products.short_description
  const shortDescription = "Crispy wafer fingers coated in smooth milk chocolate. Iconic 4-finger KITKAT bar ideal for a quick sweet snack or sharing during a break.";
  console.log("shortDescription length:", shortDescription.length);

  const fullDescription = `Enjoy the classic KITKAT experience with crispy wafer layers coated in smooth chocolate. This convenient four-finger bar is ideal for a quick snack or sharing during a break.

### Product Overview
Nestlé KITKAT 4 Fingers is the classic chocolate-coated wafer bar loved worldwide. Each finger is made of crispy wafer layers enrobed in smooth, delicious milk chocolate. Ideal for having a break, enjoying sweet moments, or sharing with friends and family.

### Multipack Options
- **Single Bar (1 × 38.5 g)**: ₹30.00
- **Twin Pack (2 × 38.5 g)**: ₹57.00 (Save ₹3)
- **Triple Pack (3 × 38.5 g)**: ₹84.00 (Save ₹6)
*(Multipacks subject to availability and location)*

### Ingredients
Sugar, Milk solids (16.2%), Fractionated vegetable fat, Hydrogenated vegetable fats, Refined wheat flour (maida), Cocoa solids (4.5%), Emulsifier (INS 322 / soya lecithin), Yeast, Raising agent (INS 500(ii)), Iodised salt, Flavouring substances, and other processing ingredients.

### Allergen & Dietary Information
- **Dietary**: 100% Vegetarian
- **Contains**: Wheat, Milk, Sesame, and Soy
- **May Contain**: Tree Nuts & Peanuts

### Storage & Handling Instructions
- Store in a cool, dry, and hygienic place.
- Temperature and humidity fluctuations during shipping or storage may cause a harmless whitish layer (fat bloom) to appear on the surface of the chocolate. This does not affect eating quality or food safety.`;

  const details = {
    hsn: "1806",
    moq: 1,
    maxCart: 20,
    condition: "New",
    madeIn: "India",
    manufacturer: "Nestlé India Limited",
    warranty: "Standard shelf life warranty against manufacturing defects",
    warrantyType: "Manufacturer",
    fssai: "10012011000168",
    returnable: false,
    returnDays: 7,
    tags: [
      "KitKat",
      "Nestle",
      "Chocolate",
      "Wafer Bar",
      "4 Fingers",
      "Snacks",
      "Vegetarian",
      "Confectionery"
    ],
    highlights: [
      "Crispy wafer fingers covered in smooth milk chocolate",
      "Iconic 4-finger break format — snap, break & enjoy",
      "100% Vegetarian product certified by FSSAI",
      "38.5 g single pack — ideal on-the-go snack",
      "Manufactured by Nestlé India Limited",
      "Multipack options available (2 × 38.5 g for ₹57, 3 × 38.5 g for ₹84)"
    ],
    seo: {
      title: "Nestlé KITKAT 4 Fingers Choco-Coated Wafer Bar 38.5 g",
      keywords: "KitKat, Nestle chocolate, 4 finger KitKat, chocolate wafer bar, 38.5g chocolate, choco coated wafer",
      alt: "Nestlé KITKAT 4 Fingers Choco-Coated Wafer Bar 38.5 g",
      metaDescription: "Enjoy the classic KITKAT experience with crispy wafer layers coated in smooth chocolate. This convenient four-finger bar is ideal for a quick snack or sharing during a break."
    },
    shipping: {
      weight: 0.0385,
      dimensions: {
        width: 6,
        height: 1.5,
        length: 15
      },
      delivery: "1-3",
      freeShip: false,
      cod: true
    },
    variants: [
      {
        id: 1,
        variationType: "Pack Size",
        title: "1 × 38.5 g (Single Bar)",
        price: "30.00",
        offerPrice: "30.00",
        stock: "100",
        status: "Active",
        images: []
      },
      {
        id: 2,
        variationType: "Pack Size",
        title: "2 × 38.5 g (Twin Pack)",
        price: "60.00",
        offerPrice: "57.00",
        stock: "50",
        status: "Active",
        images: []
      },
      {
        id: 3,
        variationType: "Pack Size",
        title: "3 × 38.5 g (Triple Pack)",
        price: "90.00",
        offerPrice: "84.00",
        stock: "30",
        status: "Active",
        images: []
      }
    ],
    hasVariants: true,
    sellerIds: [],
    isPopular: true,
    isDeal: false,
    specifications: [
      { key: "Product Name", value: "Nestlé KITKAT 4 Fingers Choco-Coated Wafer Bar" },
      { key: "Brand", value: "Nestlé KITKAT" },
      { key: "Manufacturer", value: "Nestlé India Limited" },
      { key: "Product Type", value: "Chocolate-coated wafer bar" },
      { key: "Main Category", value: "Food & Beverages" },
      { key: "Category", value: "Snacks & Confectionery" },
      { key: "Subcategory", value: "Chocolates" },
      { key: "Product Form", value: "Bar (4 Fingers)" },
      { key: "Flavour", value: "Chocolate / milk chocolate" },
      { key: "Net Quantity", value: "38.5 g" },
      { key: "Pack Contents", value: "1 bar, 4 fingers" },
      { key: "Country of Origin", "value": "India" },
      { key: "Dietary Preference", value: "Vegetarian" },
      { key: "FSSAI Licence Number", value: "10012011000168" },
      { key: "Shelf Life", value: "Approximately 9 months; confirm pack" },
      { key: "Storage Instructions", value: "Cool, dry, hygienic place" },
      { key: "Blinkit Product ID", value: "212722" },
      { key: "Ingredients", value: "Sugar, milk solids (16.2%), fractionated vegetable fat, hydrogenated vegetable fats, refined wheat flour (maida), cocoa solids (4.5%), emulsifier (INS 322 / soya lecithin), yeast, raising agent (INS 500(ii)), iodised salt, flavouring substances" },
      { key: "Allergens", value: "Contains wheat, milk, sesame and soy. May contain: Nuts." },
      { key: "Handling Note", value: "Temperature or humidity changes can cause a whitish layer to form on the chocolate (fat bloom). Safe to consume." },
      { key: "Energy (per 100g)", value: "438 kcal" },
      { key: "Protein (per 100g)", value: "6.4 g" },
      { key: "Carbohydrates (per 100g)", value: "47.4 g" },
      { key: "Total Sugars (per 100g)", value: "35.1 g" },
      { key: "Added Sugars (per 100g)", value: "28.9 g" },
      { key: "Total Fat (per 100g)", value: "24.8 g" },
      { key: "Saturated Fat (per 100g)", value: "24.5 g" },
      { key: "Trans Fat (per 100g)", value: "0.04 g" },
      { key: "Sodium (per 100g)", value: "97.4 mg" }
    ]
  };

  // 5. Update admin_products for ID 1
  console.log("Updating product ID 1 in admin_products...");
  const updatedRows = await sql`
    UPDATE admin_products
    SET name = 'Nestlé KITKAT 4 Fingers Choco-Coated Wafer Bar',
        short_description = ${shortDescription},
        full_description = ${fullDescription},
        category = 'Snacks & Confectionery',
        subcategory = 'Chocolates',
        brand = 'Nestlé KITKAT',
        mrp = 30.00,
        selling_price = 30.00,
        cost_price = NULL,
        stock = 100,
        low_stock_alert = 10,
        sku = 'KITKAT-4F-38.5G',
        barcode = '8901058000405',
        status = 'active',
        is_popular = TRUE,
        is_deal = FALSE,
        featured = TRUE,
        details = ${JSON.stringify(details)}::JSONB,
        tax_rule_id = NULL,
        tax_rate = 0.00,
        tax_amount = 0.00,
        price_with_tax = 30.00,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = 1
    RETURNING id, name, sku, category, subcategory, brand, mrp, selling_price, stock, status, details
  `;

  console.log("Product updated successfully:", JSON.stringify(updatedRows[0], null, 2));
}

updateKitKat().catch(err => {
  console.error("Update failed:", err);
  process.exit(1);
});
