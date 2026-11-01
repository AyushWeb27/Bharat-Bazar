import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { loadProductMedia } from "@/lib/profile-storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = { params: { id: string } };

function notFound() {
  return NextResponse.json(
    { success: false, message: "Product image not found." },
    { status: 404 }
  );
}

export async function GET(req: Request, { params }: RouteContext) {
  try {
    const id = Number(params.id);
    if (!Number.isSafeInteger(id) || id < 1) return notFound();
    const url = new URL(req.url);
    const gallery = url.searchParams.get("kind") === "gallery";
    const indexParam = url.searchParams.get("index");
    const index = indexParam === null ? undefined : Number(indexParam);
    if (gallery && (!Number.isSafeInteger(index) || (index ?? -1) < 0 || (index ?? 10001) > 10000)) {
      return notFound();
    }

    const rows = await sql`
      SELECT p.id, p.gallery_images
      FROM admin_products p
      JOIN admin_categories c
        ON LOWER(TRIM(c.name)) = LOWER(TRIM(p.category))
        AND c.active = TRUE
      JOIN admin_group_categories g
        ON g.id = c.group_id AND g.active = TRUE
      WHERE p.id = ${id} AND p.status = 'active' AND p.main_image_url <> ''
      LIMIT 1
    `;
    if (!rows.length) return notFound();
    if (gallery) {
      let galleryImages: unknown = rows[0].gallery_images;
      if (typeof galleryImages === "string") galleryImages = JSON.parse(galleryImages);
      if (!Array.isArray(galleryImages) || typeof galleryImages[index ?? -1] !== "string" || !galleryImages[index ?? -1]) {
        return notFound();
      }
    }

    const image = await loadProductMedia(id, gallery ? "gallery-image" : "main-image", index);
    if (!image.Body) return notFound();
    const contentType = image.ContentType || "application/octet-stream";
    if (!["image/jpeg", "image/png", "image/webp", "image/gif", "image/bmp", "image/tiff", "image/avif"].includes(contentType)) {
      return NextResponse.json(
        { success: false, message: "Unsupported product image." },
        { status: 415 }
      );
    }

    const bytes = await image.Body.transformToByteArray();
    const body = new ArrayBuffer(bytes.byteLength);
    new Uint8Array(body).set(bytes);
    return new NextResponse(body, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=300, stale-while-revalidate=60",
        "X-Content-Type-Options": "nosniff",
        "Content-Disposition": "inline",
      },
    });
  } catch (error) {
    console.error("GET /api/products/[id]/image error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to load product image." },
      { status: 500 }
    );
  }
}
