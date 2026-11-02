import type { NextRequest } from "next/server";
import { sql } from "@/lib/db";
import { USER_COOKIE_NAME, verifyUserSessionToken } from "@/lib/auth";
import type { CartItem, Prod, ProductVariant } from "@/app/components/types";

type RecordValue = Record<string, unknown>;

function isRecord(value: unknown): value is RecordValue {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function parseRecord(value: unknown): RecordValue {
  if (typeof value === "string") {
    try {
      const parsed: unknown = JSON.parse(value);
      return isRecord(parsed) ? parsed : {};
    } catch {
      return {};
    }
  }
  return isRecord(value) ? value : {};
}

function parseArray(value: unknown): unknown[] {
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

function activeVariants(details: RecordValue): RecordValue[] {
  return Array.isArray(details.variants)
    ? details.variants.filter((value): value is RecordValue =>
      isRecord(value) && value.status !== "Inactive" && typeof value.title === "string" && Boolean(value.title.trim())
    )
    : [];
}

function toProduct(row: RecordValue, variantTitle: string): Prod {
  const details = parseRecord(row.details);
  const shipping = parseRecord(details.shipping);
  const variants = activeVariants(details).map((variant, index): ProductVariant => {
    const mrp = Number(variant.price);
    const offerPrice = Number(variant.offerPrice);
    const stock = Number(variant.stock);
    return {
      id: typeof variant.id === "number" ? variant.id : index + 1,
      title: String(variant.title).trim(),
      price: Number.isFinite(mrp) && mrp > 0 ? mrp : Number(row.mrp) || Number(row.selling_price) || 0,
      offerPrice: Number.isFinite(offerPrice) && offerPrice > 0
        ? offerPrice
        : Number.isFinite(mrp) && mrp > 0
          ? mrp
          : Number(row.selling_price) || 0,
      stock: Number.isFinite(stock) ? stock : undefined,
      variationType: typeof variant.variationType === "string" ? variant.variationType : undefined,
      sku: typeof variant.sku === "string" ? variant.sku : undefined,
    };
  });
  const selectedVariant = variants.find(variant => variant.title === variantTitle);
  const selectedStock = selectedVariant?.stock;
  const basePrice = Number(row.selling_price) || 0;
  const baseMrp = Number(row.mrp) || basePrice;
  const price = selectedVariant?.offerPrice ?? basePrice;
  const mrp = selectedVariant?.price ?? baseMrp;
  const imageId = Number(row.id);
  const gallery = parseArray(row.gallery_images);
  const galleryImages = gallery.flatMap((image, index) =>
    typeof image === "string" && image
      ? [`/api/products/${imageId}/image?kind=gallery&index=${index}`]
      : []
  );
  const available = row.product_active === true &&
    (!variantTitle || Boolean(selectedVariant)) &&
    Number(selectedStock ?? row.stock) > 0;

  return {
    id: imageId,
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
    inStock: available,
    stock: Number(selectedStock ?? row.stock) || 0,
    tag: row.is_deal ? "Deal" : row.featured ? "Featured" : row.is_popular ? "Popular" : "",
    tagClr: row.is_deal ? "#f97316" : "#009966",
    img: row.main_image_url ? `/api/products/${imageId}/image` : "",
    img2: galleryImages[0] || (row.main_image_url ? `/api/products/${imageId}/image` : ""),
    galleryImages,
    desc: String(row.full_description || row.short_description || ""),
    sizes: variants.map(variant => variant.title),
    variants,
    selectedSize: variantTitle || undefined,
    selectedVariant,
    spec: Object.fromEntries(parseArray(details.specifications).flatMap(value =>
      isRecord(value) && typeof value.key === "string" && typeof value.value === "string"
        ? [[value.key, value.value]]
        : []
    )),
    highlights: Array.isArray(details.highlights)
      ? details.highlights.filter((value): value is string => typeof value === "string")
      : [],
    sku: String(selectedVariant?.sku || row.sku || ""),
    condition: typeof details.condition === "string" ? details.condition : "",
    manufacturer: typeof details.manufacturer === "string" ? details.manufacturer : "",
    madeIn: typeof details.madeIn === "string" ? details.madeIn : "",
    warranty: typeof details.warranty === "string" ? details.warranty : "",
    deliveryDays: typeof shipping.delivery === "string" ? shipping.delivery : "",
  };
}

export async function getActiveCartUserId(req: NextRequest): Promise<number | null> {
  const token = req.cookies.get(USER_COOKIE_NAME)?.value;
  const session = token ? verifyUserSessionToken(token) : null;
  if (!session?.id) return null;

  const rows = await sql`
    SELECT id
    FROM users
    WHERE id = ${session.id} AND status = 'active'
    LIMIT 1
  `;
  return rows.length ? Number(rows[0].id) : null;
}

export async function loadCustomerCart(userId: number): Promise<CartItem[]> {
  const rows = await sql`
    SELECT ci.id AS cart_item_id, ci.quantity, ci.variant_title,
           p.id, p.name, p.short_description, p.full_description, p.category,
           p.subcategory, p.brand, p.mrp, p.selling_price, p.stock, p.sku,
           p.main_image_url, p.gallery_images, p.details, p.is_popular,
           p.is_deal, p.featured,
           (
             p.status = 'active'
             AND EXISTS (
               SELECT 1
               FROM admin_categories c
               JOIN admin_group_categories g ON g.id = c.group_id AND g.active = TRUE
               WHERE LOWER(TRIM(c.name)) = LOWER(TRIM(p.category))
                 AND c.active = TRUE
             )
           ) AS product_active
    FROM customer_cart_items ci
    JOIN admin_products p ON p.id = ci.product_id
    WHERE ci.user_id = ${userId}
    ORDER BY ci.created_at DESC, ci.id DESC
  `;

  return rows.map(row => ({
    id: Number(row.cart_item_id),
    quantity: Number(row.quantity),
    product: toProduct(row as RecordValue, String(row.variant_title || "")),
  }));
}

export async function loadOrderProduct(productId: number, variantTitle: string): Promise<Prod | null> {
  const rows = await sql`
    SELECT p.id, p.name, p.short_description, p.full_description, p.category,
           p.subcategory, p.brand, p.mrp, p.selling_price, p.stock, p.sku,
           p.main_image_url, p.gallery_images, p.details, p.is_popular,
           p.is_deal, p.featured, TRUE AS product_active
    FROM admin_products p
    WHERE p.id = ${productId}
      AND p.status = 'active'
      AND EXISTS (
        SELECT 1
        FROM admin_categories c
        JOIN admin_group_categories g ON g.id = c.group_id AND g.active = TRUE
        WHERE LOWER(TRIM(c.name)) = LOWER(TRIM(p.category))
          AND c.active = TRUE
      )
    LIMIT 1
  `;
  if (!rows.length) return null;
  return toProduct(rows[0] as RecordValue, variantTitle);
}

export async function getAvailableCartProduct(productId: number, variantTitle: string) {
  const rows = await sql`
    SELECT p.id, p.stock, p.mrp, p.selling_price, p.details
    FROM admin_products p
    WHERE p.id = ${productId}
      AND p.status = 'active'
      AND EXISTS (
        SELECT 1
        FROM admin_categories c
        JOIN admin_group_categories g ON g.id = c.group_id AND g.active = TRUE
        WHERE LOWER(TRIM(c.name)) = LOWER(TRIM(p.category))
          AND c.active = TRUE
      )
    LIMIT 1
  `;
  if (!rows.length) return null;

  const row = rows[0];
  const details = parseRecord(row.details);
  const variants = activeVariants(details);
  if (variantTitle && !variants.some(variant => String(variant.title).trim() === variantTitle)) {
    return { stock: 0, invalidVariant: true };
  }
  const variant = variants.find(item => String(item.title).trim() === variantTitle);
  const variantStock = variant ? Number(variant.stock) : Number(row.stock);
  const stock = Number.isFinite(variantStock) ? variantStock : Number(row.stock) || 0;
  return { stock, invalidVariant: false };
}
