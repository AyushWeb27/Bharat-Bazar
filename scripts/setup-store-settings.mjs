import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL || process.env.POSTGRES_URL || process.env.NEON_DATABASE_URL || "");

async function setup() {
  console.log("Setting up store_settings table...");

  await sql`
    CREATE TABLE IF NOT EXISTS store_settings (
      key         VARCHAR(120) PRIMARY KEY,
      value       TEXT         NOT NULL DEFAULT '',
      type        VARCHAR(30)  NOT NULL DEFAULT 'text',
      label       VARCHAR(200) NOT NULL DEFAULT '',
      section     VARCHAR(80)  NOT NULL DEFAULT 'general',
      description TEXT,
      updated_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
    )
  `;

  console.log("store_settings table created.");

  const defaults = [
    { key: "store_name",         value: "BharatBazar",                                  type: "text",    label: "Store Name",             section: "identity",  description: "Display name of the store" },
    { key: "store_tagline",      value: "India's favourite online supermarket",          type: "text",    label: "Tagline",                section: "identity",  description: "Short tagline shown in branding" },
    { key: "support_email",      value: "support@bharatbazar.com",                       type: "email",   label: "Support Email",          section: "identity",  description: "Customer-facing support email" },
    { key: "support_phone",      value: "+91 1800-BB-STORE",                             type: "text",    label: "Support Phone",          section: "identity",  description: "Customer support phone number" },
    { key: "business_address",   value: "BharatBazar HQ, Sector 62, Noida, UP 201301",  type: "textarea",label: "Business Address",        section: "identity",  description: "Registered business address" },
    { key: "gst_number",         value: "29ABCDE1234F1ZX",                               type: "text",    label: "GST Number",             section: "identity",  description: "GSTIN for tax invoices" },
    { key: "logo_url",           value: "",                                               type: "text",    label: "Logo URL",               section: "identity",  description: "URL of the store logo image" },
    { key: "favicon_url",        value: "",                                               type: "text",    label: "Favicon URL",            section: "identity",  description: "URL of the store favicon" },
    { key: "currency",           value: "INR",                                            type: "select",  label: "Currency",               section: "locale",    description: "Default store currency" },
    { key: "timezone",           value: "Asia/Kolkata",                                   type: "select",  label: "Timezone",               section: "locale",    description: "Store timezone for order timestamps" },
    { key: "language",           value: "English (India)",                                type: "select",  label: "Language",               section: "locale",    description: "Default store language" },
    { key: "min_order_amount",   value: "99",                                             type: "number",  label: "Minimum Order (Rs)",     section: "delivery",  description: "Minimum cart value to place an order" },
    { key: "delivery_charge",    value: "49",                                             type: "number",  label: "Delivery Charge (Rs)",   section: "delivery",  description: "Standard delivery fee per order" },
    { key: "free_delivery_above",value: "499",                                            type: "number",  label: "Free Delivery Above (Rs)",section:"delivery",  description: "Cart value above which delivery is free" },
    { key: "maintenance_mode",   value: "false",                                          type: "boolean", label: "Maintenance Mode",       section: "features",  description: "Show maintenance page to all visitors" },
    { key: "guest_checkout",     value: "true",                                           type: "boolean", label: "Guest Checkout",         section: "features",  description: "Allow orders without registration" },
    { key: "reviews_enabled",    value: "true",                                           type: "boolean", label: "Product Reviews",        section: "features",  description: "Let customers leave product reviews" },
    { key: "multiple_addresses", value: "true",                                           type: "boolean", label: "Multiple Addresses",     section: "features",  description: "Customers can save multiple delivery addresses" },
  ];

  for (const d of defaults) {
    await sql`
      INSERT INTO store_settings (key, value, type, label, section, description)
      VALUES (${d.key}, ${d.value}, ${d.type}, ${d.label}, ${d.section}, ${d.description})
      ON CONFLICT (key) DO NOTHING
    `;
  }

  console.log("Seeded " + defaults.length + " default store settings.");
  console.log("Done!");
}

setup().catch(err => {
  console.error("Error:", err);
  process.exit(1);
});
