import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const rows = await sql`
      SELECT deal.id AS deal_id, deal.discount_percent, deal.deal_date,
             deal.is_featured,
             product.id, product.name, product.short_description, product.category,
             product.subcategory, product.brand, product.selling_price, product.mrp,
             product.stock, product.main_image_url, product.details
      FROM admin_daily_deals AS deal
      JOIN admin_products AS product ON product.id = deal.product_id
      WHERE deal.deal_date = (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Kolkata')::DATE
        AND deal.is_active = TRUE
        AND deal.show_on_homepage = TRUE
        AND product.status = 'active'
        AND product.stock > 0
        AND product.selling_price > 0
        AND EXISTS (
          SELECT 1
          FROM admin_categories AS category
          JOIN admin_group_categories AS category_group
            ON category_group.id = category.group_id AND category_group.active = TRUE
          WHERE LOWER(TRIM(category.name)) = LOWER(TRIM(product.category))
            AND category.active = TRUE
        )
      ORDER BY deal.is_featured DESC, deal.id ASC
      LIMIT 4
    `;

    const products = rows.map(row => {
      const regularPrice = Number(row.selling_price) || 0;
      const discountPercent = Number(row.discount_percent) || 0;
      const price = Math.max(0, Math.round(regularPrice * (1 - discountPercent / 100) * 100) / 100);
      const id = Number(row.id);
      const image = row.main_image_url ? `/api/products/${id}/image` : "";
      let details: unknown = row.details;
      if (typeof details === "string") {
        try {
          details = JSON.parse(details);
        } catch {
          details = {};
        }
      }
      const savedDetails = details && typeof details === "object" && !Array.isArray(details)
        ? details as Record<string, unknown>
        : {};
      const rawVariants = Array.isArray(savedDetails.variants) ? savedDetails.variants : [];
      const variants = rawVariants.flatMap((variant, index) => {
        if (!variant || typeof variant !== "object" || Array.isArray(variant)) return [];
        const item = variant as Record<string, unknown>;
        if (item.status === "Inactive" || typeof item.title !== "string" || !item.title.trim()) return [];
        const baseVariantPrice = Number(item.price);
        const baseOfferPrice = Number(item.offerPrice);
        const variantMrp = Number.isFinite(baseVariantPrice) && baseVariantPrice > 0
          ? baseVariantPrice
          : Number(row.mrp) || regularPrice;
        const variantRegularPrice = Number.isFinite(baseOfferPrice) && baseOfferPrice > 0
          ? baseOfferPrice
          : variantMrp;
        return [{
          id: typeof item.id === "number" ? item.id : index + 1,
          title: item.title.trim(),
          price: variantMrp,
          offerPrice: Math.max(0, Math.round(variantRegularPrice * (1 - discountPercent / 100) * 100) / 100),
          stock: Number.isFinite(Number(item.stock)) ? Number(item.stock) : undefined,
          variationType: typeof item.variationType === "string" ? item.variationType : undefined,
          sku: typeof item.sku === "string" ? item.sku : undefined,
        }];
      });

      return {
        dealId: Number(row.deal_id),
        featured: Boolean(row.is_featured),
        product: {
          id,
          name: String(row.name || ""),
          brand: String(row.brand || ""),
          cat: String(row.category || ""),
          subcategory: String(row.subcategory || ""),
          price,
          mrp: Number(row.mrp) || regularPrice,
          rating: 0,
          reviews: 0,
          off: Math.max(0, Math.round(discountPercent)),
          cod: savedDetails.shipping && typeof savedDetails.shipping === "object" &&
            "cod" in savedDetails.shipping && savedDetails.shipping.cod === true,
          emi: false,
          freeShip: savedDetails.shipping && typeof savedDetails.shipping === "object" &&
            "freeShip" in savedDetails.shipping && savedDetails.shipping.freeShip === true,
          inStock: Number(row.stock) > 0,
          stock: Number(row.stock) || 0,
          tag: "Deal of the Day",
          tagClr: "#e11d48",
          img: image,
          img2: image,
          desc: String(row.short_description || ""),
          sizes: variants.map(variant => variant.title),
          variants,
          spec: {},
        },
      };
    });

    return NextResponse.json({
      success: true,
      dealDate: rows.length ? String(rows[0].deal_date).slice(0, 10) : "",
      deals: products,
    }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("GET /api/deal-of-day error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to load today's deals." },
      { status: 500, headers: { "Cache-Control": "no-store" } }
    );
  }
}
