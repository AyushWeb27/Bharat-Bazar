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

function serveDataUri(dataUri: string) {
  const commaIdx = dataUri.indexOf(",");
  if (commaIdx === -1) return null;
  const header = dataUri.slice(0, commaIdx);
  const base64Data = dataUri.slice(commaIdx + 1);
  const mimeMatch = header.match(/^data:([^;]+)/);
  const contentType = mimeMatch ? mimeMatch[1] : "image/jpeg";
  const buffer = Buffer.from(base64Data, "base64");
  return new NextResponse(buffer, {
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=86400, stale-while-revalidate=3600",
      "X-Content-Type-Options": "nosniff",
      "Content-Disposition": "inline",
    },
  });
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
      SELECT p.id, p.main_image_url, p.gallery_images
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

    let targetImage = "";
    if (gallery) {
      let galleryImages: unknown = rows[0].gallery_images;
      if (typeof galleryImages === "string") {
        try {
          galleryImages = JSON.parse(galleryImages);
        } catch {
          galleryImages = [];
        }
      }
      if (!Array.isArray(galleryImages) || typeof galleryImages[index ?? -1] !== "string" || !galleryImages[index ?? -1]) {
        return notFound();
      }
      targetImage = String(galleryImages[index ?? -1]).trim();
    } else {
      targetImage = String(rows[0].main_image_url || "").trim();
    }

    // 1. If stored as Base64 Data URI (e.g. uploaded directly via seller portal), serve it directly
    if (targetImage.startsWith("data:")) {
      const response = serveDataUri(targetImage);
      if (response) return response;
    }

    // 2. If stored as external HTTP/HTTPS URL, redirect
    if (targetImage.startsWith("http://") || targetImage.startsWith("https://")) {
      return NextResponse.redirect(targetImage, 307);
    }

    // 3. Otherwise try loading from S3 storage
    try {
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
    } catch (s3Error: unknown) {
      const isNotFound = Boolean(
        s3Error && typeof s3Error === "object" && (
          ("name" in s3Error && (s3Error.name === "NoSuchKey" || s3Error.name === "NotFound")) ||
          ("Code" in s3Error && s3Error.Code === "NoSuchKey") ||
          ("$metadata" in s3Error && (s3Error.$metadata as { httpStatusCode?: number })?.httpStatusCode === 404)
        )
      );
      if (isNotFound) {
        return notFound();
      }
      throw s3Error;
    }
  } catch (error) {
    console.error("GET /api/products/[id]/image error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to load product image." },
      { status: 500 }
    );
  }
}
