import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { verifySellerSessionToken, SELLER_COOKIE_NAME } from "@/lib/auth";

export const runtime = "nodejs";

function toNum(v: unknown, fallback: number | null = null): number | null {
  if (v === null || v === undefined || v === "") return fallback;
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

function toStr(v: unknown, fallback = ""): string {
  return typeof v === "string" ? v.trim() : fallback;
}

export async function POST(req: NextRequest) {
  try {
    // 1. Check seller authentication (optional but preferred)
    let sellerInfo: { id: number; name: string; email: string } | null = null;
    const token = req.cookies.get(SELLER_COOKIE_NAME)?.value;
    if (token) {
      const session = verifySellerSessionToken(token);
      if (session?.id) {
        const rows = await sql`
          SELECT id, owner_name, email, store_name
          FROM sellers
          WHERE id = ${session.id}
          LIMIT 1
        `;
        if (rows.length > 0) {
          sellerInfo = {
            id: Number(rows[0].id),
            name: String(rows[0].store_name || rows[0].owner_name || "Merchant"),
            email: String(rows[0].email || ""),
          };
        }
      }
    }

    // 2. Parse request body
    let body: Record<string, unknown> = {};
    const contentType = req.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
      body = await req.json();
    } else if (contentType.includes("multipart/form-data") || contentType.includes("application/x-www-form-urlencoded")) {
      const formData = await req.formData();
      const rawProduct = formData.get("product");
      if (typeof rawProduct === "string") {
        try {
          body = JSON.parse(rawProduct);
        } catch {
          body = {};
        }
      }
      // Check for direct main image URL or base64
      const mainImageUrl = formData.get("mainImageUrl");
      if (typeof mainImageUrl === "string" && mainImageUrl) {
        body.mainImageUrl = mainImageUrl;
      }
    } else {
      return NextResponse.json({ success: false, message: "Invalid request format." }, { status: 400 });
    }

    const name = toStr(body.name);
    if (!name || name.length < 3) {
      return NextResponse.json({ success: false, message: "Product name must be at least 3 characters." }, { status: 400 });
    }

    const action = toStr(body.action, "draft"); // "publish" | "request" | "draft"
    const isPublish = action === "publish" || body.isPublish === true;
    const isRequest = !isPublish && (action === "request" || body.isRequest === true);

    const shortDescription = toStr(body.shortDescription);
    const fullDescription = toStr(body.fullDescription);
    const category = toStr(body.category);
    const subcategory = toStr(body.subcategory);
    const brand = toStr(body.brand);
    const mrp = toNum(body.mrp);
    const sellingPrice = toNum(body.sellingPrice);
    const costPrice = toNum(body.costPrice);
    const stock = Math.max(0, toNum(body.stock, 0) || 0);
    const lowStockAlert = Math.max(0, toNum(body.lowStockAlert, 0) || 0);
    const barcode = toStr(body.barcode);
    const videoUrl = toStr(body.videoUrl);
    const mainImageUrl = toStr(body.mainImageUrl) || null;
    const isPopular = Boolean(body.isPopular);
    const isDeal = Boolean(body.isDeal);
    const featured = Boolean(body.featured);

    // Generate or use SKU
    let sku = toStr(body.sku);
    if (!sku) {
      sku = `SKU-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    }

    // Gallery images
    const rawGallery = Array.isArray(body.gallery) ? body.gallery : [];
    const galleryImages = [
      rawGallery[0] ? String(rawGallery[0]) : null,
      rawGallery[1] ? String(rawGallery[1]) : null,
      rawGallery[2] ? String(rawGallery[2]) : null,
      rawGallery[3] ? String(rawGallery[3]) : null,
      rawGallery[4] ? String(rawGallery[4]) : null,
      rawGallery[5] ? String(rawGallery[5]) : null,
    ];

    // Status: if verified publish, set to active; if requested, set to inactive with pending; else draft
    const dbStatus = isPublish ? "active" : isRequest ? "inactive" : "draft";

    // Combine detailed metadata
    const details = {
      source: "seller_hub",
      submissionType: isPublish ? "product_published" : isRequest ? "product_request" : "product_draft",
      requestStatus: isPublish ? "approved" : isRequest ? "pending" : "draft",
      requestedAt: new Date().toISOString(),
      sellerId: sellerInfo?.id || body.sellerId || null,
      sellerName: sellerInfo?.name || toStr(body.sellerName) || "Merchant",
      sellerEmail: sellerInfo?.email || toStr(body.sellerEmail) || "",
      highlights: Array.isArray(body.highlights) ? body.highlights : [],
      tags: Array.isArray(body.tags) ? body.tags : [],
      condition: toStr(body.condition, "New"),
      moq: toNum(body.moq, 1),
      shipping: {
        weight: toStr(body.weight),
        dimensions: {
          length: toStr(body.dimL),
          width: toStr(body.dimW),
          height: toStr(body.dimH),
        },
        deliveryTime: toStr(body.deliveryTime, "3-5"),
        freeShipping: Boolean(body.freeShipping),
        cod: body.cod !== undefined ? Boolean(body.cod) : true,
      },
      seo: {
        title: toStr(body.seoTitle),
        keywords: toStr(body.seoKeywords),
        altText: toStr(body.seoAlt),
        metaDescription: toStr(body.seoMeta),
      },
      warranty: {
        period: toStr(body.warrantyPeriod),
        type: toStr(body.warrantyType, "Manufacturer"),
        manufacturer: toStr(body.manufacturer),
        countryOfOrigin: toStr(body.madeIn, "India"),
        hsn: toStr(body.hsn),
        fssai: toStr(body.fssai),
        maxCart: toStr(body.maxCart),
        returnable: body.returnable !== undefined ? Boolean(body.returnable) : true,
        returnDays: toStr(body.returnDays, "7"),
      },
      specifications: Array.isArray(body.specifications) ? body.specifications : [],
      variants: Array.isArray(body.variants) ? body.variants : [],
      taxRule: body.taxRule || null,
      rawDetails: body.details && typeof body.details === "object" ? body.details : {},
    };

    const detailsJson = JSON.stringify(details);
    const galleryJson = JSON.stringify(galleryImages);

    // Insert into admin_products
    const result = await sql`
      INSERT INTO admin_products (
        name,
        short_description,
        full_description,
        category,
        subcategory,
        brand,
        mrp,
        selling_price,
        cost_price,
        stock,
        low_stock_alert,
        sku,
        barcode,
        main_image_url,
        gallery_images,
        video_url,
        status,
        is_popular,
        is_deal,
        featured,
        details
      ) VALUES (
        ${name},
        ${shortDescription},
        ${fullDescription},
        ${category},
        ${subcategory},
        ${brand},
        ${mrp},
        ${sellingPrice},
        ${costPrice},
        ${stock},
        ${lowStockAlert},
        ${sku},
        ${barcode},
        ${mainImageUrl},
        ${galleryJson}::jsonb,
        ${videoUrl},
        ${dbStatus},
        ${isPopular},
        ${isDeal},
        ${featured},
        ${detailsJson}::jsonb
      )
      RETURNING id, name, sku, status
    `;

    const created = result[0];

    return NextResponse.json({
      success: true,
      message: isPublish
        ? "Product published live to BharatBazar store successfully! Status: Active."
        : isRequest
        ? "Product submitted for Admin Approval successfully! Status: Under Review."
        : "Product saved as draft successfully!",
      product: {
        id: Number(created.id),
        name: String(created.name),
        sku: String(created.sku),
        status: String(created.status),
        isPublish,
        isRequest,
      },
    });
  } catch (error: unknown) {
    console.error("POST /api/seller/products error:", error);
    const msg = error instanceof Error ? error.message : "Failed to save product.";
    return NextResponse.json({ success: false, message: msg }, { status: 500 });
  }
}

