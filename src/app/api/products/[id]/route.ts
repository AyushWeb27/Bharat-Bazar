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
             p.is_deal, p.featured
      FROM admin_products p
      JOIN admin_categories c
        ON LOWER(TRIM(c.name)) = LOWER(TRIM(p.category))
        AND c.active = TRUE
      JOIN admin_group_categories g
        ON g.id = c.group_id AND g.active = TRUE
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
    const price = Number(row.selling_price) || 0;
    const mrp = Number(row.mrp) || price;
    const variants = rawVariants.flatMap((variant, index) => {
      if (!isRecord(variant) || variant.status === "Inactive" || typeof variant.title !== "string" || !variant.title.trim()) {
        return [];
      }
      const rawPrice = typeof variant.price === "number" ? variant.price : Number(variant.price);
      const rawOffer = typeof variant.offerPrice === "number" ? variant.offerPrice : Number(variant.offerPrice);
      const vMrp = Number.isFinite(rawPrice) && rawPrice > 0 ? rawPrice : mrp;
      const vOffer = Number.isFinite(rawOffer) && rawOffer > 0 ? rawOffer : (Number.isFinite(rawPrice) && rawPrice > 0 ? rawPrice : price);
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
          tag: row.is_deal ? "Deal" : row.featured ? "Featured" : row.is_popular ? "Popular" : "",
          tagClr: row.is_deal ? "#f97316" : "#009966",
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