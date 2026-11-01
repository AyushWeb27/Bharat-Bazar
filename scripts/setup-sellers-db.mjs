import { neon } from "@neondatabase/serverless";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error("❌ ERROR: DATABASE_URL is not defined in environment variables.");
  process.exit(1);
}

const sql = neon(databaseUrl);

async function setupSellers() {
  console.log("🚀 Creating 'sellers' table in Neon database if not exists...");

  await sql`
    CREATE TABLE IF NOT EXISTS sellers (
      id SERIAL PRIMARY KEY,
      
      -- Owner Credentials & Contact
      owner_name VARCHAR(150) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      mobile VARCHAR(30) NOT NULL,
      alt_phone VARCHAR(30) DEFAULT '',
      aadhaar VARCHAR(30) DEFAULT '',
      email_verified BOOLEAN DEFAULT FALSE,
      mobile_verified BOOLEAN DEFAULT FALSE,
      
      -- Business & Tax Identification
      business_name VARCHAR(200) NOT NULL,
      business_type VARCHAR(100) DEFAULT 'Sole Proprietorship',
      gstin VARCHAR(30) DEFAULT '',
      pan VARCHAR(20) DEFAULT '',
      business_category VARCHAR(100) DEFAULT 'Fashion',
      year_established VARCHAR(10) DEFAULT '',
      monthly_turnover VARCHAR(50) DEFAULT '₹5L–₹20L',
      
      -- Storefront Identity & Media (uses bucket 'seller-file')
      store_name VARCHAR(200) NOT NULL,
      store_slug VARCHAR(200) UNIQUE NOT NULL,
      store_description TEXT DEFAULT '',
      website_url TEXT DEFAULT '',
      product_count VARCHAR(50) DEFAULT '50',
      store_logo_url TEXT DEFAULT '',
      store_banner_url TEXT DEFAULT '',
      store_accent_color VARCHAR(30) DEFAULT '#009966',
      
      -- Pickup & Warehouse Address
      address_line1 TEXT NOT NULL,
      address_line2 TEXT DEFAULT '',
      city VARCHAR(100) NOT NULL,
      state VARCHAR(100) NOT NULL,
      pincode VARCHAR(20) NOT NULL,
      shipping_model VARCHAR(50) DEFAULT 'express',
      same_as_pickup BOOLEAN DEFAULT TRUE,
      return_address TEXT DEFAULT '',
      
      -- Bank Details (RBI Escrow Settlement)
      account_holder VARCHAR(150) DEFAULT '',
      bank_name VARCHAR(150) DEFAULT '',
      account_type VARCHAR(50) DEFAULT 'Current Account',
      account_number VARCHAR(100) DEFAULT '',
      ifsc VARCHAR(30) DEFAULT '',
      
      -- KYC Documents (stored in bucket 'seller-file')
      gst_doc_url TEXT DEFAULT '',
      pan_doc_url TEXT DEFAULT '',
      aadhaar_doc_url TEXT DEFAULT '',
      bank_doc_url TEXT DEFAULT '',
      trade_license_url TEXT DEFAULT '',
      
      -- Operational Settings & Admin Metadata
      allow_cod BOOLEAN DEFAULT TRUE,
      auto_approve BOOLEAN DEFAULT TRUE,
      status VARCHAR(50) DEFAULT 'Pending Verification',
      commission_rate NUMERIC(5,2) DEFAULT 10.00,
      rating NUMERIC(3,2) DEFAULT 5.00,
      revenue NUMERIC(15,2) DEFAULT 0.00,
      products_count INT DEFAULT 0,
      featured BOOLEAN DEFAULT FALSE,
      kyc_status VARCHAR(50) DEFAULT 'Pending',
      kyc_rejection_reason TEXT DEFAULT '',
      
      last_login TIMESTAMP WITH TIME ZONE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `;

  await sql`CREATE INDEX IF NOT EXISTS idx_sellers_email ON sellers(LOWER(email));`;
  await sql`CREATE INDEX IF NOT EXISTS idx_sellers_store_slug ON sellers(LOWER(store_slug));`;
  await sql`CREATE INDEX IF NOT EXISTS idx_sellers_status ON sellers(status);`;

  console.log("✅ 'sellers' table and indexes verified/created successfully in Neon DB.");

  const count = await sql`SELECT COUNT(*)::int as total FROM sellers`;
  console.log(`📊 Current registered seller count in Neon DB: ${count[0].total}`);
}

setupSellers().catch(err => {
  console.error("❌ Migration error:", err);
  process.exit(1);
});

