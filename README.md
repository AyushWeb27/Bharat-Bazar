# Bharat-Bazar (Next.js)

India's #1 Online Marketplace web application built with **Next.js (App Router)**, React 18, Tailwind CSS, Lucide icons, and Radix UI.

## Features
- **Next.js App Router**: Optimized route groups `(store)`, `(auth)`, `admin`, and `seller`.
- **E-Commerce Customer Portal**: Dynamic homepage, categories, product listing, product detail with image gallery & zoom, cart, wishlist, multi-step checkout, order confirmation, and order tracking.
- **Admin Portal**: Comprehensive admin dashboard with analytics, inventory, order processing, seller KYC, coupons, flash sales, and reports.
- **Seller Portal**: Dedicated seller dashboard with catalog management, POS orders, sales reports, wallet, withdrawal, and support.
- **Vernacular & Indianized UX**: Rupee pricing (₹), PIN code delivery estimator, COD, EMI, multilingual assistance, and Diwali/festival banners.

## Getting Started

1. **Install dependencies**:
   ```bash
   npm install --legacy-peer-deps
   ```

2. **Run development server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) to view the store in your browser.

3. **Create the admin group-categories table in Neon** (requires `DATABASE_URL` in `.env`):
   ```bash
   npm run db:group-categories
   ```

4. **Create and seed the admin categories table in Neon**:
   ```bash
   npm run db:categories
   ```
   Configure the S3-compatible Neon storage environment variables in `.env`, including `AWS_CATEGORY_IMAGES_BUCKET_NAME=category-images`, to enable category image uploads.

5. **Create and seed the admin subcategories table in Neon**:
   ```bash
   npm run db:subcategories
   ```
   Configure `AWS_SUBCATEGORIES_IMAGES_BUCKET_NAME=subcategories-images` for subcategory image uploads.

6. **Create and seed the admin brands table in Neon**:
   ```bash
   npm run db:brands
   ```
   Configure the S3-compatible Neon storage environment variables in `.env`, including `AWS_BRANDS_IMAGES_BUCKET_NAME=brands-images`, to enable brand logo uploads.

7. **Create the admin products table in Neon**:
   ```bash
   npm run db:products
   ```
   Main and gallery product images, plus uploaded MP4/WebM videos, use the S3-compatible Neon storage bucket configured by `AWS_PRODUCTS_MEDIA_BUCKET_NAME=product-main-image-video`.

8. **Create the admin tax rules table and product tax columns in Neon**:
   ```bash
   npm run db:taxes
   ```
   Run this after `npm run db:products`. The setup seeds the supplied GST, CGST, SGST, UTGST, IGST, and Compensation Cess rules. Variable-rate rules retain their descriptive rate label and stay unavailable for product calculations until a numeric rate is configured. Product selling prices are stored before tax, with the selected active tax rule rate and the calculated tax-inclusive price stored separately. Tax category/scope labels describe tax applicability; admins must choose the correct rule for the sale.

9. **Build for production**:
   ```bash
   npm run build
   npm run start
   ```