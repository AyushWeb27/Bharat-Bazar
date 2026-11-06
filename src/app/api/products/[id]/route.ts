import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export const dynamic = "force-dynamic";

type RouteContext = { params: { id: string } };

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function notFound() {
  return NextResponse.json(
    { success: false, message: "This product is not available." },
    { status: 404 }
  );
}

export async function GET(_req: Request, { params }: RouteContext) {
  const id = Number(params.id);
  if (!Number.isSafeInteger(id) || id < 1) return notFound();

  try {
    const rows = await sql`
      SELECT p.id, p.name, p.short_description, p.full_description, p.category,
             p.subcategory, p.brand, p.mrp, p.selling_price, p.stock, p.sku,
             p.main_image_url, p.gallery_images, p.details, p.is_popular,
             p.is_deal, p.featured,
             flash_sale.name AS flash_sale_name,
             flash_sale.end_at AS flash_sale_end_at,
             flash_sale.discount_type AS flash_discount_type,
             flash_sale.discount_value AS flash_discount_value,
             daily_deal.discount_percent AS daily_discount_percent
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
      WHERE p.id = ${id} AND p.status = 'active'
      LIMIT 1
    `;
    if (!rows.length) return notFound();

    const row = rows[0];
    let details: unknown = row.details;
    let gallery: unknown = row.gallery_images;
    if (typeof details === "string") details = JSON.parse(details);
    if (typeof gallery === "string") gallery = JSON.parse(gallery);
    const savedDetails = isRecord(details) ? details : {};
    const shipping = isRecord(savedDetails.shipping) ? savedDetails.shipping : {};
    const rawVariants = Array.isArray(savedDetails.variants) ? savedDetails.variants : [];
    const sizes = rawVariants.flatMap(variant => {
      if (!isRecord(variant) || variant.status === "Inactive" || typeof variant.title !== "string") return [];
      return variant.title.trim() ? [variant.title.trim()] : [];
    });
    const productId = Number(row.id);
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
    const variants = rawVariants.flatMap((variant, index) => {
      if (!isRecord(variant) || variant.status === "Inactive" || typeof variant.title !== "string" || !variant.title.trim()) {
        return [];
      }
      const rawPrice = typeof variant.price === "number" ? variant.price : Number(variant.price);
      const rawOffer = typeof variant.offerPrice === "number" ? variant.offerPrice : Number(variant.offerPrice);
      const vMrp = Number.isFinite(rawPrice) && rawPrice > 0 ? rawPrice : mrp;
      const regularOffer = Number.isFinite(rawOffer) && rawOffer > 0
        ? rawOffer
        : Number.isFinite(rawPrice) && rawPrice > 0
          ? rawPrice
          : regularPrice;
      const variantDiscount = dailyDiscountPercent > 0
        ? regularOffer * dailyDiscountPercent / 100
        : row.flash_discount_type === "percent"
          ? regularOffer * flashDiscountValue / 100
          : row.flash_discount_type === "flat"
            ? flashDiscountValue
            : 0;
      const vOffer = Math.max(0, regularOffer - variantDiscount);
      const rawStock = typeof variant.stock === "number" ? variant.stock : Number(variant.stock);
      return [{
        id: typeof variant.id === "number" ? variant.id : index + 1,
        title: variant.title.trim(),
        price: vMrp,
        offerPrice: vOffer,
        stock: Number.isFinite(rawStock) ? rawStock : undefined,
        variationType: typeof variant.variationType === "string" ? variant.variationType : undefined,
      }];
    });
    const rawSpecifications = Array.isArray(savedDetails.specifications) ? savedDetails.specifications : [];
    const spec = Object.fromEntries(rawSpecifications.flatMap(value => {
      if (!isRecord(value) || typeof value.key !== "string" || typeof value.value !== "string") return [];
      return value.key.trim() ? [[value.key.trim(), value.value]] : [];
    }));
    const mainImage = row.main_image_url ? `/api/products/${productId}/image` : "";
    const galleryImages = Array.isArray(gallery)
      ? gallery.flatMap((image, index) =>
        typeof image === "string" && image
          ? [`/api/products/${productId}/image?kind=gallery&index=${index}`]
          : []
      )
      : [];
    const highlights = Array.isArray(savedDetails.highlights)
      ? savedDetails.highlights.filter((value): value is string => typeof value === "string")
      : [];

    return NextResponse.json(
      {
        success: true,
        product: {
          id: productId,
          name: String(row.name || ""),
          brand: String(row.brand || ""),
          cat: String(row.category || ""),
          subcategory: String(row.subcategory || ""),
          price,
          mrp,
          rating: 0,
          reviews: 0,
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
            : row.is_deal ? "Deal" : row.featured ? "Featured" : row.is_popular ? "Popular" : "",
          tagClr: dailyDiscount > 0 ? "#e11d48" : flashDiscount > 0 ? "#ef4444" : row.is_deal ? "#f97316" : "#009966",
          flashSaleName: flashDiscount > 0 ? String(row.flash_sale_name || "Flash Sale") : "",
          flashSaleEndDate: flashDiscount > 0 && row.flash_sale_end_at
            ? (row.flash_sale_end_at instanceof Date
              ? row.flash_sale_end_at.toISOString()
              : new Date(String(row.flash_sale_end_at)).toISOString())
            : "",
          img: mainImage,
          img2: galleryImages[0] || mainImage,
          galleryImages,
          desc: String(row.full_description || row.short_description || ""),
          sizes,
          variants,
          spec,
          highlights,
          condition: typeof savedDetails.condition === "string" ? savedDetails.condition : "",
          manufacturer: typeof savedDetails.manufacturer === "string" ? savedDetails.manufacturer : "",
          madeIn: typeof savedDetails.madeIn === "string" ? savedDetails.madeIn : "",
          warranty: typeof savedDetails.warranty === "string" ? savedDetails.warranty : "",
          deliveryDays: typeof shipping.delivery === "string" ? shipping.delivery : "",
        },
      },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    console.error(`GET /api/products/${id} error:`, error);
    return NextResponse.json(
      { success: false, message: "Failed to load product details." },
      { status: 500 }
    );
  }
}