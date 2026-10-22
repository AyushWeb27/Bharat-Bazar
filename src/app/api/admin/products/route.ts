import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { requireActiveAdmin } from "@/lib/categories";
import {
  deleteProductMedia,
  detectProfileImageType,
  saveProductMedia,
  type ProductMediaKind,
} from "@/lib/profile-storage";

export const runtime = "nodejs";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const MAX_VIDEO_SIZE = 100 * 1024 * 1024;
const MAX_GALLERY_IMAGES = 100;
const MAX_GALLERY_INDEX = 10000;

type ProductInput = {
  name: string;
  shortDescription: string;
  fullDescription: string;
  category: string;
  subcategory: string;
  brand: string;
  mrp: number | null;
  sellingPrice: number | null;
  costPrice: number | null;
  stock: number;
  lowStockAlert: number;
  sku: string | null;
  barcode: string;
  videoUrl: string;
  taxRuleId: number | null;
  isPopular: boolean;
  isDeal: boolean;
  featured: boolean;
  status: "draft" | "active" | "inactive";
  details: Record<string, unknown>;
};

function errorResponse(message: string, status: number) {
  return NextResponse.json({ success: false, message }, { status });
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function readText(value: unknown, maxLength: number): string | null {
  if (typeof value !== "string") return null;
  const text = value.trim();
  return text.length <= maxLength ? text : null;
}

function readAmount(value: unknown): number | null | undefined {
  if (value === "" || value === null || value === undefined) return null;
  if (typeof value !== "number" || !Number.isFinite(value) || value < 0) return undefined;
  return value;
}

function readCount(value: unknown, fallback: number): number | null {
  if (value === "" || value === null || value === undefined) return fallback;
  if (typeof value !== "number" || !Number.isSafeInteger(value) || value < 0) return null;
  return value;
}

function readBoolean(value: unknown): boolean | null {
  return typeof value === "boolean" ? value : null;
}

function parseProductInput(value: unknown): ProductInput | null {
  if (!isRecord(value)) return null;
  const name = readText(value.name, 200);
  const shortDescription = readText(value.shortDescription, 160);
  const fullDescription = readText(value.fullDescription, 50000);
  const category = readText(value.category, 120);
  const subcategory = readText(value.subcategory, 120);
  const brand = readText(value.brand, 120);
  const mrp = readAmount(value.mrp);
  const sellingPrice = readAmount(value.sellingPrice);
  const costPrice = readAmount(value.costPrice);
  const stock = readCount(value.stock, 0);
  const lowStockAlert = readCount(value.lowStockAlert, 0);
  const skuText = readText(value.sku, 100);
  const barcode = readText(value.barcode, 64);
  const videoUrl = readText(value.videoUrl, 2048);
  const isPopular = readBoolean(value.isPopular);
  const isDeal = readBoolean(value.isDeal);
  const featured = readBoolean(value.featured);
  const taxRuleId = value.taxRuleId === null
    ? null
    : typeof value.taxRuleId === "number" && Number.isSafeInteger(value.taxRuleId) && value.taxRuleId > 0
      ? value.taxRuleId
      : undefined;
  if (
    !name || shortDescription === null || fullDescription === null ||
    category === null || subcategory === null || brand === null ||
    mrp === undefined || sellingPrice === undefined || costPrice === undefined ||
    stock === null || lowStockAlert === null || skuText === null ||
    barcode === null || videoUrl === null ||
    isPopular === null || isDeal === null || featured === null ||
    taxRuleId === undefined ||
    !isRecord(value.details)
  ) return null;

  let status: ProductInput["status"];
  if (value.status === "draft" || value.status === "active" || value.status === "inactive") {
    status = value.status;
  } else {
    return null;
  }

  if (videoUrl) {
    try {
      const url = new URL(videoUrl);
      if (!["https:", "http:"].includes(url.protocol)) return null;
    } catch {
      return null;
    }
  }

  return {
    name, shortDescription, fullDescription, category, subcategory, brand,
    mrp, sellingPrice, costPrice, stock, lowStockAlert,
    sku: skuText || null, barcode, videoUrl,
    taxRuleId, isPopular, isDeal, featured, status, details: value.details,
  };
}

function isUniqueViolation(error: unknown) {
  return Boolean(error && typeof error === "object" && "code" in error && error.code === "23505");
}

function detectVideoType(bytes: Uint8Array): string | null {
  if (
    bytes.length >= 12 &&
    String.fromCharCode(bytes[4], bytes[5], bytes[6], bytes[7]) === "ftyp"
  ) return "video/mp4";
  if (
    bytes.length >= 4 &&
    bytes[0] === 0x1a && bytes[1] === 0x45 &&
    bytes[2] === 0xdf && bytes[3] === 0xa3
  ) return "video/webm";
  return null;
}

function mapAdminProduct(row: Record<string, unknown>) {
  const stock = Number(row.stock) || 0;
  const lowStockAlert = Number(row.low_stock_alert) || 0;
  const storedStatus = String(row.status);
  const status = storedStatus === "draft"
    ? "draft"
    : storedStatus !== "active"
      ? "inactive"
      : stock === 0
        ? "out_of_stock"
        : lowStockAlert > 0 && stock <= lowStockAlert
          ? "low_stock"
          : "active";

  return {
    id: Number(row.id),
    name: String(row.name || ""),
    sku: String(row.sku || ""),
    cat: String(row.category || ""),
    subcat: String(row.subcategory || ""),
    emoji: "📦",
    mrp: Number(row.mrp) || 0,
    price: Number(row.selling_price) || 0,
    stock,
    status,
    featured: Boolean(row.featured),
    imageUrl: row.main_image_url ? String(row.main_image_url) : "",
    taxRuleId: row.tax_rule_id === null ? null : Number(row.tax_rule_id),
    taxRate: Number(row.tax_rate) || 0,
    taxAmount: Number(row.tax_amount) || 0,
    priceWithTax: row.price_with_tax === null ? Number(row.selling_price) || 0 : Number(row.price_with_tax),
  };
}

function detectProductImageType(bytes: Uint8Array): string | null {
  const knownType = detectProfileImageType(bytes);
  if (knownType) return knownType;
  if (
    bytes.length >= 6 &&
    (String.fromCharCode(bytes[0], bytes[1], bytes[2], bytes[3], bytes[4], bytes[5]) === "GIF87a" ||
      String.fromCharCode(bytes[0], bytes[1], bytes[2], bytes[3], bytes[4], bytes[5]) === "GIF89a")
  ) return "image/gif";
  if (bytes.length >= 2 && bytes[0] === 0x42 && bytes[1] === 0x4d) return "image/bmp";
  if (
    bytes.length >= 8 &&
    ((bytes[0] === 0x49 && bytes[1] === 0x49 && bytes[2] === 0x2a && bytes[3] === 0x00) ||
      (bytes[0] === 0x4d && bytes[1] === 0x4d && bytes[2] === 0x00 && bytes[3] === 0x2a))
  ) return "image/tiff";
  if (
    bytes.length >= 12 &&
    String.fromCharCode(bytes[4], bytes[5], bytes[6], bytes[7]) === "ftyp" &&
    ["avif", "avis"].includes(String.fromCharCode(bytes[8], bytes[9], bytes[10], bytes[11]))
  ) return "image/avif";
  return null;
}

async function readImage(formData: FormData, field: string) {
  const file = formData.get(field);
  if (file === null) return null;
  if (!(file instanceof File)) throw new Error(`Invalid upload for ${field}.`);
  if (!file.size || file.size > MAX_IMAGE_SIZE) {
    throw new Error("Product images must be between 1 byte and 5 MB.");
  }
  const bytes = new Uint8Array(await file.arrayBuffer());
  const contentType = detectProductImageType(bytes);
  if (!contentType || (file.type && file.type !== contentType)) {
    throw new Error("Use a valid image file (JPEG, PNG, WebP, GIF, BMP, TIFF, or AVIF).");
  }
  return { bytes, contentType };
}

async function readVideo(formData: FormData) {
  const file = formData.get("video");
  if (file === null) return null;
  if (!(file instanceof File)) throw new Error("Invalid product video upload.");
  if (!file.size || file.size > MAX_VIDEO_SIZE) {
    throw new Error("Product videos must be between 1 byte and 100 MB.");
  }
  const bytes = new Uint8Array(await file.arrayBuffer());
  const contentType = detectVideoType(bytes);
  if (!contentType || (file.type && file.type !== contentType)) {
    throw new Error("Use a valid MP4 or WebM video.");
  }
  return { bytes, contentType };
}

async function readGallery(formData: FormData) {
  const gallery: Array<{ index: number; bytes: Uint8Array; contentType: string }> = [];
  const indexes = new Set<number>();
  const entries: Array<[string, FormDataEntryValue]> = [];
  formData.forEach((value, field) => entries.push([field, value]));
  for (const [field, value] of entries) {
    if (!field.startsWith("galleryImage_")) continue;
    const indexText = field.slice("galleryImage_".length);
    const index = Number(indexText);
    if (!/^\d+$/.test(indexText) || !Number.isSafeInteger(index) || index > MAX_GALLERY_INDEX || indexes.has(index)) {
      throw new Error("Invalid product gallery image index.");
    }
    if (!(value instanceof File)) throw new Error("Invalid product gallery image upload.");
    if (gallery.length >= MAX_GALLERY_IMAGES) {
      throw new Error(`A product can have up to ${MAX_GALLERY_IMAGES} gallery images.`);
    }
    const image = await readImage(formData, field);
    if (image) gallery.push({ index, ...image });
    indexes.add(index);
  }
  return gallery.sort((left, right) => left.index - right.index);
}

function readGalleryDeleteIndexes(formData: FormData): number[] | null {
  const value = formData.get("galleryDeleteIndexes");
  if (value === null) return [];
  if (typeof value !== "string") return null;
  let parsed: unknown;
  try {
    parsed = JSON.parse(value);
  } catch {
    return null;
  }
  if (!Array.isArray(parsed) || !parsed.every(index =>
    typeof index === "number" && Number.isSafeInteger(index) && index >= 0 && index <= MAX_GALLERY_INDEX
  )) return null;
  return Array.from(new Set(parsed as number[]));
}

export async function GET(req: NextRequest) {
  try {
    if (!(await requireActiveAdmin(req))) {
      return errorResponse("Unauthorized. Please log in as an administrator.", 401);
    }
    const requestedId = req.nextUrl.searchParams.get("id");
    if (requestedId !== null) {
      const id = Number(requestedId);
      if (!Number.isSafeInteger(id) || id < 1) return errorResponse("A valid product ID is required.", 400);
      const rows = await sql`
        SELECT id, name, short_description, full_description, category, subcategory, brand,
               mrp, selling_price, cost_price, stock, low_stock_alert, sku, barcode,
               main_image_url, gallery_images, video_url, video_file_url, status,
               is_popular, is_deal, featured, details, tax_rule_id, tax_rate,
               tax_amount, price_with_tax
        FROM admin_products
        WHERE id = ${id}
        LIMIT 1
      `;
      if (!rows.length) return errorResponse("Product not found.", 404);
      const row = rows[0];
      let details: unknown = row.details;
      let galleryImages: unknown = row.gallery_images;
      if (typeof details === "string") details = JSON.parse(details);
      if (typeof galleryImages === "string") galleryImages = JSON.parse(galleryImages);
      return NextResponse.json({
        success: true,
        product: {
          ...mapAdminProduct(row),
          shortDescription: String(row.short_description || ""),
          fullDescription: String(row.full_description || ""),
          brand: String(row.brand || ""),
          costPrice: row.cost_price === null ? null : Number(row.cost_price),
          lowStockAlert: Number(row.low_stock_alert) || 0,
          barcode: String(row.barcode || ""),
          videoUrl: String(row.video_url || ""),
          videoFileUrl: row.video_file_url ? String(row.video_file_url) : "",
          galleryImages: Array.isArray(galleryImages) ? galleryImages : [],
          details: isRecord(details) ? details : {},
          isPopular: Boolean(row.is_popular),
          isDeal: Boolean(row.is_deal),
          storedStatus: String(row.status),
        },
      });
    }
    const rows = await sql`
      SELECT id, name, sku, category, subcategory, mrp, selling_price,
             stock, low_stock_alert, status, featured, main_image_url,
             tax_rule_id, tax_rate, tax_amount, price_with_tax
      FROM admin_products
      ORDER BY created_at DESC, id DESC
    `;
    return NextResponse.json({ success: true, products: rows.map(mapAdminProduct) });
  } catch (error) {
    console.error("GET /api/admin/products error:", error);
    return errorResponse("Failed to load products.", 500);
  }
}

export async function POST(req: NextRequest) {
  let adminId: number | null;
  try {
    adminId = await requireActiveAdmin(req);
  } catch (error) {
    console.error("POST /api/admin/products authorization error:", error);
    return errorResponse("Failed to verify administrator access.", 500);
  }
  if (!adminId) {
    return errorResponse("Unauthorized. Please log in as an administrator.", 401);
  }

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return errorResponse("Request must use multipart/form-data.", 400);
  }

  let rawProduct: unknown;
  try {
    rawProduct = JSON.parse(String(formData.get("product") ?? ""));
  } catch {
    return errorResponse("Product details must be valid JSON.", 400);
  }
  const product = parseProductInput(rawProduct);
  if (!product) return errorResponse("Enter valid product details.", 400);

  let mainImage: Awaited<ReturnType<typeof readImage>>;
  let video: Awaited<ReturnType<typeof readVideo>>;
  let gallery: Array<{ index: number; bytes: Uint8Array; contentType: string }>;
  try {
    mainImage = await readImage(formData, "mainImage");
    video = await readVideo(formData);
    gallery = await readGallery(formData);
  } catch (error) {
    return errorResponse(error instanceof Error ? error.message : "Invalid media upload.", 400);
  }

  const rawStock = isRecord(rawProduct) ? rawProduct.stock : undefined;
  const stockWasProvided = rawStock !== "" && rawStock !== null && rawStock !== undefined;
  if (
    product.status !== "draft" &&
    (!product.shortDescription || !product.category || !product.subcategory ||
      !product.brand || !product.mrp || !product.sellingPrice ||
      !mainImage || !stockWasProvided)
  ) {
    return errorResponse("Published products need a description, image, category, subcategory, brand, price, and stock quantity.", 400);
  }
  if (product.mrp !== null && product.sellingPrice !== null && product.sellingPrice > product.mrp) {
    return errorResponse("Selling price cannot be greater than the MRP.", 400);
  }

  let productId: number | undefined;
  const savedMedia: Array<{ kind: ProductMediaKind; index?: number }> = [];
  try {
    let taxRate = 0;
    if (product.taxRuleId !== null) {
      const taxRules = await sql`
        SELECT id, rate
        FROM admin_tax_rules
        WHERE id = ${product.taxRuleId}
          AND active = TRUE
        LIMIT 1
      `;
      if (!taxRules.length) {
        return errorResponse("Choose an active tax rule.", 400);
      }
      if (taxRules[0].rate === null) {
        return errorResponse("This tax rule has no numeric rate configured and cannot be used for product pricing.", 400);
      }
      taxRate = Number(taxRules[0].rate);
    }
    const taxAmount = Math.round((((product.sellingPrice ?? 0) * taxRate / 100) + Number.EPSILON) * 100) / 100;
    const priceWithTax = Math.round((((product.sellingPrice ?? 0) + taxAmount) + Number.EPSILON) * 100) / 100;
    const rows = await sql`
      INSERT INTO admin_products (
        name, short_description, full_description, category, subcategory, brand,
        mrp, selling_price, cost_price, stock, low_stock_alert, sku, barcode,
        video_url, status, is_popular, is_deal, featured, details,
        tax_rule_id, tax_rate, tax_amount, price_with_tax
      )
      VALUES (
        ${product.name}, ${product.shortDescription}, ${product.fullDescription},
        ${product.category}, ${product.subcategory}, ${product.brand},
        ${product.mrp}, ${product.sellingPrice}, ${product.costPrice},
        ${product.stock}, ${product.lowStockAlert}, ${product.sku}, ${product.barcode},
        ${product.videoUrl}, ${product.status}, ${product.isPopular}, ${product.isDeal},
        ${product.featured}, ${JSON.stringify(product.details)}::JSONB,
        ${product.taxRuleId}, ${taxRate}, ${taxAmount}, ${priceWithTax}
      )
      RETURNING id
    `;
    productId = Number(rows[0].id);

    let mainImageUrl: string | null = null;
    if (mainImage) {
      await saveProductMedia(productId, "main-image", mainImage.bytes, mainImage.contentType);
      savedMedia.push({ kind: "main-image" });
      mainImageUrl = `/api/admin/products/${productId}/media/main-image`;
    }

    const galleryUrls: Array<string | null> = [];
    for (const image of gallery) {
      await saveProductMedia(productId, "gallery-image", image.bytes, image.contentType, image.index);
      savedMedia.push({ kind: "gallery-image", index: image.index });
      galleryUrls[image.index] = `/api/admin/products/${productId}/media/gallery-image?index=${image.index}`;
    }

    let videoFileUrl: string | null = null;
    if (video) {
      await saveProductMedia(productId, "video", video.bytes, video.contentType);
      savedMedia.push({ kind: "video" });
      videoFileUrl = `/api/admin/products/${productId}/media/video`;
    }

    const updated = await sql`
      UPDATE admin_products
      SET main_image_url = ${mainImageUrl},
          gallery_images = ${JSON.stringify(galleryUrls)}::JSONB,
          video_file_url = ${videoFileUrl},
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ${productId}
      RETURNING id, name, sku, category, subcategory, brand, mrp, selling_price,
                stock, status, featured, main_image_url, gallery_images, video_file_url,
                tax_rule_id, tax_rate, tax_amount, price_with_tax
    `;
    return NextResponse.json({
      success: true,
      product: {
        ...updated[0],
        galleryImages: galleryUrls,
      },
    }, { status: 201 });
  } catch (error) {
    if (productId) {
      for (const media of savedMedia) {
        try {
          await deleteProductMedia(productId, media.kind, media.index);
        } catch (cleanupError) {
          console.error("Failed to clean up product media after creation error:", cleanupError);
        }
      }

      try {
        await sql`DELETE FROM admin_products WHERE id = ${productId}`;
      } catch (cleanupError) {
        console.error("Failed to clean up product row after creation error:", cleanupError);
      }
    }
    if (isUniqueViolation(error)) {
      return errorResponse("A product with this SKU already exists.", 409);
    }
    console.error("POST /api/admin/products error:", error);
    return errorResponse("Failed to create product. Check the database and media storage configuration.", 500);
  }
}

export async function PUT(req: NextRequest) {
  let adminId: number | null;
  try {
    adminId = await requireActiveAdmin(req);
  } catch (error) {
    console.error("PUT /api/admin/products authorization error:", error);
    return errorResponse("Failed to verify administrator access.", 500);
  }
  if (!adminId) return errorResponse("Unauthorized. Please log in as an administrator.", 401);

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return errorResponse("Request must use multipart/form-data.", 400);
  }
  let rawProduct: unknown;
  try {
    rawProduct = JSON.parse(String(formData.get("product") ?? ""));
  } catch {
    return errorResponse("Product details must be valid JSON.", 400);
  }
  if (!isRecord(rawProduct) || typeof rawProduct.id !== "number" ||
      !Number.isSafeInteger(rawProduct.id) || rawProduct.id < 1) {
    return errorResponse("A valid product ID is required.", 400);
  }
  const product = parseProductInput(rawProduct);
  if (!product) return errorResponse("Enter valid product details.", 400);

  const existingRows = await sql`
    SELECT id, main_image_url, gallery_images, video_file_url
    FROM admin_products
    WHERE id = ${rawProduct.id}
    LIMIT 1
  `;
  if (!existingRows.length) return errorResponse("Product not found.", 404);
  const existing = existingRows[0];

  let mainImage: Awaited<ReturnType<typeof readImage>>;
  let video: Awaited<ReturnType<typeof readVideo>>;
  let gallery: Array<{ index: number; bytes: Uint8Array; contentType: string }>;
  try {
    mainImage = await readImage(formData, "mainImage");
    video = await readVideo(formData);
    gallery = await readGallery(formData);
  } catch (error) {
    return errorResponse(error instanceof Error ? error.message : "Invalid media upload.", 400);
  }
  const galleryDeleteIndexes = readGalleryDeleteIndexes(formData);
  if (!galleryDeleteIndexes) return errorResponse("Invalid product gallery removals.", 400);
  if (
    product.status !== "draft" &&
    (!product.shortDescription || !product.category || !product.subcategory ||
      !product.brand || !product.mrp || !product.sellingPrice ||
      (!mainImage && !existing.main_image_url))
  ) {
    return errorResponse("Published products need a description, image, category, subcategory, brand, and price.", 400);
  }
  if (product.mrp !== null && product.sellingPrice !== null && product.sellingPrice > product.mrp) {
    return errorResponse("Selling price cannot be greater than the MRP.", 400);
  }

  try {
    let taxRate = 0;
    if (product.taxRuleId !== null) {
      const taxRules = await sql`
        SELECT id, rate
        FROM admin_tax_rules
        WHERE id = ${product.taxRuleId}
          AND active = TRUE
        LIMIT 1
      `;
      if (!taxRules.length) return errorResponse("Choose an active tax rule.", 400);
      if (taxRules[0].rate === null) {
        return errorResponse("This tax rule has no numeric rate configured and cannot be used for product pricing.", 400);
      }
      taxRate = Number(taxRules[0].rate);
    }
    const taxAmount = Math.round((((product.sellingPrice ?? 0) * taxRate / 100) + Number.EPSILON) * 100) / 100;
    const priceWithTax = Math.round((((product.sellingPrice ?? 0) + taxAmount) + Number.EPSILON) * 100) / 100;

    let galleryImages: unknown = existing.gallery_images;
    if (typeof galleryImages === "string") galleryImages = JSON.parse(galleryImages);
    const galleryUrls: Array<string | null> = Array.isArray(galleryImages) ? [...galleryImages] : [];
    const removedIndexes = new Set(galleryDeleteIndexes);
    if (galleryDeleteIndexes.some(index => !galleryUrls[index])) {
      return errorResponse("One or more selected gallery images no longer exist.", 400);
    }
    for (const index of galleryDeleteIndexes) galleryUrls[index] = null;
    if (galleryUrls.filter(Boolean).length + gallery.length > MAX_GALLERY_IMAGES) {
      return errorResponse(`A product can have up to ${MAX_GALLERY_IMAGES} gallery images.`, 400);
    }
    if (gallery.some(image => removedIndexes.has(image.index))) {
      return errorResponse("A gallery image cannot be removed and replaced in the same request.", 400);
    }
    if (gallery.some(image => galleryUrls[image.index])) {
      return errorResponse("A gallery image index is already in use.", 400);
    }
    if (mainImage) await saveProductMedia(rawProduct.id, "main-image", mainImage.bytes, mainImage.contentType);
    for (const image of gallery) {
      await saveProductMedia(rawProduct.id, "gallery-image", image.bytes, image.contentType, image.index);
      galleryUrls[image.index] = `/api/admin/products/${rawProduct.id}/media/gallery-image?index=${image.index}`;
    }
    if (video) await saveProductMedia(rawProduct.id, "video", video.bytes, video.contentType);

    const mainImageUrl = mainImage ? `/api/admin/products/${rawProduct.id}/media/main-image` : existing.main_image_url;
    const videoFileUrl = video ? `/api/admin/products/${rawProduct.id}/media/video` : existing.video_file_url;
    const rows = await sql`
      UPDATE admin_products
      SET name = ${product.name},
          short_description = ${product.shortDescription},
          full_description = ${product.fullDescription},
          category = ${product.category},
          subcategory = ${product.subcategory},
          brand = ${product.brand},
          mrp = ${product.mrp},
          selling_price = ${product.sellingPrice},
          cost_price = ${product.costPrice},
          stock = ${product.stock},
          low_stock_alert = ${product.lowStockAlert},
          sku = ${product.sku},
          barcode = ${product.barcode},
          video_url = ${product.videoUrl},
          video_file_url = ${videoFileUrl},
          main_image_url = ${mainImageUrl},
          gallery_images = ${JSON.stringify(galleryUrls)}::JSONB,
          status = ${product.status},
          is_popular = ${product.isPopular},
          is_deal = ${product.isDeal},
          featured = ${product.featured},
          details = ${JSON.stringify(product.details)}::JSONB,
          tax_rule_id = ${product.taxRuleId},
          tax_rate = ${taxRate},
          tax_amount = ${taxAmount},
          price_with_tax = ${priceWithTax},
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ${rawProduct.id}
      RETURNING id, name, sku, category, subcategory, mrp, selling_price,
                stock, low_stock_alert, status, featured, main_image_url,
                gallery_images,
                tax_rule_id, tax_rate, tax_amount, price_with_tax
    `;
    const cleanupWarnings: string[] = [];
    for (const index of Array.from(removedIndexes)) {
      try {
        await deleteProductMedia(rawProduct.id, "gallery-image", index);
      } catch (error) {
        console.error(`Failed to delete removed gallery image ${index} for product ${rawProduct.id}:`, error);
        cleanupWarnings.push(`Gallery image ${index + 1} could not be removed from storage.`);
      }
    }
    return NextResponse.json({
      success: true,
      product: {
        ...mapAdminProduct(rows[0]),
        galleryImages: galleryUrls,
      },
      ...(cleanupWarnings.length ? { cleanupWarnings } : {}),
    });
  } catch (error) {
    if (isUniqueViolation(error)) {
      return errorResponse("A product with this SKU already exists.", 409);
    }
    console.error("PUT /api/admin/products error:", error);
    return errorResponse("Failed to update product.", 500);
  }
}

export async function DELETE(req: NextRequest) {
  try {
    if (!(await requireActiveAdmin(req))) {
      return errorResponse("Unauthorized. Please log in as an administrator.", 401);
    }
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return errorResponse("Request body must be valid JSON.", 400);
    }
    if (!isRecord(body) || !Array.isArray(body.ids) || body.ids.length < 1 || body.ids.length > 100) {
      return errorResponse("Select between 1 and 100 products to delete.", 400);
    }
    const ids = body.ids;
    if (!ids.every(id => typeof id === "number" && Number.isSafeInteger(id) && id > 0)) {
      return errorResponse("Product IDs must be positive integers.", 400);
    }
    const uniqueIds = Array.from(new Set(ids as number[]));
    const deletedRows = await sql`
      DELETE FROM admin_products
      WHERE id = ANY(${uniqueIds}::int[])
      RETURNING id, main_image_url, gallery_images, video_file_url
    `;
    const cleanupWarnings: string[] = [];
    for (const row of deletedRows) {
      const productId = Number(row.id);
      const mediaToDelete: Array<{ kind: ProductMediaKind; index?: number }> = [];
      if (row.main_image_url) mediaToDelete.push({ kind: "main-image" });
      if (row.video_file_url) mediaToDelete.push({ kind: "video" });
      let galleryImages = row.gallery_images;
      if (typeof galleryImages === "string") {
        try {
          galleryImages = JSON.parse(galleryImages);
        } catch (error) {
          console.error(`Could not parse gallery media for deleted product ${productId}:`, error);
          cleanupWarnings.push(`Gallery media for product ${productId} may remain in storage.`);
          galleryImages = null;
        }
      }
      if (Array.isArray(galleryImages)) {
        galleryImages.forEach((url, index) => {
          if (url) mediaToDelete.push({ kind: "gallery-image", index });
        });
      }
      for (const media of mediaToDelete) {
        try {
          await deleteProductMedia(productId, media.kind, media.index);
        } catch (error) {
          console.error(`Failed to delete ${media.kind} for deleted product ${productId}:`, error);
          cleanupWarnings.push(`Some media for product ${productId} could not be removed.`);
        }
      }
    }
    return NextResponse.json({
      success: true,
      deletedIds: deletedRows.map(row => Number(row.id)),
      cleanupWarnings: Array.from(new Set(cleanupWarnings)),
    });
  } catch (error) {
    console.error("DELETE /api/admin/products error:", error);
    return errorResponse("Failed to delete products.", 500);
  }
}
