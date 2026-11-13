import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";

export const dynamic = "force-dynamic";

type JsonRecord = Record<string, unknown>;

function record(value: unknown): JsonRecord {
  if (typeof value === "string") {
    try {
      const parsed: unknown = JSON.parse(value);
      return parsed && typeof parsed === "object" && !Array.isArray(parsed)
        ? parsed as JsonRecord
        : {};
    } catch {
      return {};
    }
  }
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as JsonRecord
    : {};
}

function arrayValue(value: unknown): unknown[] {
  if (typeof value === "string") {
    try {
      const parsed: unknown = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return Array.isArray(value) ? value : [];
}

export async function GET(req: NextRequest) {
  const category = req.nextUrl.searchParams.get("category")?.trim() || null;

  try {
    const rows = await sql`
      SELECT p.id, p.name, p.short_description, p.full_description,
             p.category, p.subcategory, p.brand, p.mrp, p.selling_price,
             p.stock, p.sku, p.main_image_url, p.gallery_images, p.details,
             p.is_popular, p.is_deal, p.featured,
             flash_sale.name AS flash_sale_name,
             flash_sale.end_at AS flash_sale_end_at,
             flash_sale.discount_type AS flash_discount_type,
             flash_sale.discount_value AS flash_discount_value,
             daily_deal.discount_percent AS daily_discount_percent,
             COALESCE(review_summary.rating, 0) AS rating,
             COALESCE(review_summary.reviews, 0) AS reviews
      FROM admin_products p
      JOIN admin_categories c
        ON LOWER(TRIM(c.name)) = LOWER(TRIM(p.category))
        AND c.active = TRUE
      JOIN admin_group_categories g
        ON g.id = c.group_id AND g.active = TRUE
      LEFT JOIN LATERAL (
        SELECT sale.name, sale.end_at, sale.discount_type, sale.discount_value
        FROM admin_flash_sales AS sale
        JOIN admin_flash_sale_products AS linked ON linked.sale_id = sale.id
        WHERE linked.product_id = p.id
          AND sale.is_active = TRUE
          AND sale.start_at <= CURRENT_TIMESTAMP
          AND sale.end_at > CURRENT_TIMESTAMP
        ORDER BY sale.start_at DESC, sale.id DESC
        LIMIT 1
      ) AS flash_sale ON TRUE
      LEFT JOIN LATERAL (
        SELECT deal.discount_percent
        FROM admin_daily_deals AS deal
        WHERE deal.product_id = p.id
          AND deal.deal_date = (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Kolkata')::DATE
          AND deal.is_active = TRUE
        LIMIT 1
      ) AS daily_deal ON TRUE
      LEFT JOIN LATERAL (
        SELECT COUNT(*)::INT AS reviews,
               COALESCE(AVG(review.rating), 0)::NUMERIC(3, 2) AS rating
        FROM customer_product_reviews AS review
        WHERE review.product_id = p.id AND review.status = 'approved'
      ) AS review_summary ON TRUE
      WHERE p.status = 'active'
        AND (${category}::text IS NULL
          OR LOWER(TRIM(c.name)) = LOWER(TRIM(${category}))
          OR LOWER(TRIM(c.slug)) = LOWER(TRIM(${category})))
      ORDER BY p.is_popular DESC, p.featured DESC, p.created_at DESC, p.id DESC
    `;

    return NextResponse.json(
      {
        success: true,
        products: rows.map(row => {
          const id = Number(row.id);
          const details = record(row.details);
          const shipping = record(details.shipping);
          const variants = Array.isArray(details.variants) ? details.variants : [];
          const sizes = variants.flatMap(variant => {
            const value = record(variant);
            return value.status !== "Inactive" && typeof value.title === "string" && value.title.trim()
              ? [value.title.trim()]
              : [];
          });
          const specifications = Array.isArray(details.specifications) ? details.specifications : [];
          const spec = Object.fromEntries(specifications.flatMap(item => {
            const value = record(item);
            return typeof value.key === "string" && value.key.trim() && typeof value.value === "string"
              ? [[value.key.trim(), value.value]]
              : [];
          }));
          const galleryImages = arrayValue(row.gallery_images).flatMap((image, index) =>
            typeof image === "string" && image
              ? [`/api/products/${id}/image?kind=gallery&index=${index}`]
              : []
          );
          const regularPrice = Number(row.selling_price) || 0;
          const dailyDiscountPercent = Number(row.daily_discount_percent) || 0;
          const flashDiscountValue = Number(row.flash_discount_value) || 0;
          const flashDiscount = dailyDiscountPercent > 0
            ? 0
            : row.flash_discount_type === "percent"
              ? regularPrice * flashDiscountValue / 100
              : row.flash_discount_type === "flat"
                ? flashDiscountValue
                : 0;
          const dailyDiscount = regularPrice * dailyDiscountPercent / 100;
          const price = Math.max(0, regularPrice - dailyDiscount - flashDiscount);
          const mrp = Number(row.mrp) || regularPrice;
          const image = row.main_image_url ? `/api/products/${id}/image` : "";

          return {
            id,
            name: String(row.name || ""),
            brand: String(row.brand || ""),
            cat: String(row.category || ""),
            subcategory: String(row.subcategory || ""),
            price,
            mrp,
            rating: Number(row.rating) || 0,
            reviews: Number(row.reviews) || 0,
            off: mrp > 0 ? Math.max(0, Math.round((1 - price / mrp) * 100)) : 0,
            cod: shipping.cod === true,
            emi: false,
            freeShip: shipping.freeShip === true,
            inStock: Number(row.stock) > 0,
            stock: Number(row.stock) || 0,
            sku: String(row.sku || ""),
            tag: dailyDiscount > 0
              ? "Deal of the Day"
              : flashDiscount > 0
                ? "Flash Sale"
                : row.is_deal
                  ? "Deal"
                  : row.featured
                    ? "Featured"
                    : row.is_popular
                      ? "Popular"
                      : "",
            tagClr: dailyDiscount > 0 ? "#e11d48" : flashDiscount > 0 ? "#ef4444" : row.is_deal ? "#f97316" : "#009966",
            flashSaleName: flashDiscount > 0 ? String(row.flash_sale_name || "Flash Sale") : "",
            flashSaleEndDate: flashDiscount > 0 && row.flash_sale_end_at
              ? (row.flash_sale_end_at instanceof Date
                ? row.flash_sale_end_at.toISOString()
                : new Date(String(row.flash_sale_end_at)).toISOString())
              : "",
            img: image,
            img2: galleryImages[0] || image,
            galleryImages,
            desc: String(row.full_description || row.short_description || ""),
            sizes,
            variants: variants.flatMap((variant, index) => {
              const value = record(variant);
              if (value.status === "Inactive" || typeof value.title !== "string" || !value.title.trim()) return [];
              const variantPrice = Number(value.price);
              const offerPrice = Number(value.offerPrice);
              const stock = Number(value.stock);
              return [{
                id: typeof value.id === "number" ? value.id : index + 1,
                title: value.title.trim(),
                price: Number.isFinite(variantPrice) && variantPrice > 0 ? variantPrice : mrp,
                offerPrice: Number.isFinite(offerPrice) && offerPrice > 0 ? offerPrice : regularPrice,
                stock: Number.isFinite(stock) ? stock : undefined,
                variationType: typeof value.variationType === "string" ? value.variationType : undefined,
                sku: typeof value.sku === "string" ? value.sku : undefined,
              }];
            }),
            spec,
            highlights: Array.isArray(details.highlights)
              ? details.highlights.filter((value): value is string => typeof value === "string")
              : [],
            condition: typeof details.condition === "string" ? details.condition : "",
            manufacturer: typeof details.manufacturer === "string" ? details.manufacturer : "",
            madeIn: typeof details.madeIn === "string" ? details.madeIn : "",
            warranty: typeof details.warranty === "string" ? details.warranty : "",
            deliveryDays: typeof shipping.delivery === "string" ? shipping.delivery : "",
          };
        }),
      },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    console.error("GET /api/products error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to load products." },
      { status: 500 }
    );
  }
}
