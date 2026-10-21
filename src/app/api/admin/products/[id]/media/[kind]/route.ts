import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { requireActiveAdmin } from "@/lib/categories";
import {
  loadProductMedia,
  type ProductMediaKind,
} from "@/lib/profile-storage";

export const runtime = "nodejs";

type RouteContext = { params: { id: string; kind: string } };

function failure(message: string, status: number) {
  return NextResponse.json({ success: false, message }, { status });
}

export async function GET(req: NextRequest, { params }: RouteContext) {
  try {
    if (!(await requireActiveAdmin(req))) return failure("Unauthorized.", 401);
    const productId = Number(params.id);
    if (!Number.isSafeInteger(productId) || productId < 1) return failure("Invalid product ID.", 400);

    const kind = params.kind;
    const indexValue = req.nextUrl.searchParams.get("index");
    const index = indexValue === null ? undefined : Number(indexValue);
    if (kind !== "main-image" && kind !== "gallery-image" && kind !== "video") {
      return failure("Invalid media type.", 400);
    }
    if (
      kind === "gallery-image" &&
      (!Number.isSafeInteger(index) || (index ?? -1) < 0 || (index ?? 6) > 5)
    ) return failure("Invalid gallery image index.", 400);

    const rows = await sql`
      SELECT id, main_image_url, gallery_images, video_file_url
      FROM admin_products
      WHERE id = ${productId}
      LIMIT 1
    `;
    if (!rows.length) return failure("Product not found.", 404);

    const url = kind === "main-image"
      ? rows[0].main_image_url
      : kind === "video"
        ? rows[0].video_file_url
        : Array.isArray(rows[0].gallery_images)
          ? rows[0].gallery_images[index ?? 0]
          : null;
    if (!url) return failure("Product media not found.", 404);

    const mediaKind: ProductMediaKind = kind;
    const object = await loadProductMedia(productId, mediaKind, index);
    if (!object.Body) return failure("Product media not found.", 404);
    const contentType = object.ContentType || "application/octet-stream";
    const allowedTypes = kind === "video"
      ? ["video/mp4", "video/webm"]
      : ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(contentType)) return failure("Product media has an unsupported format.", 415);

    const bytes = await object.Body.transformToByteArray();
    const body = new ArrayBuffer(bytes.byteLength);
    new Uint8Array(body).set(bytes);
    return new NextResponse(body, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "private, max-age=300",
        "X-Content-Type-Options": "nosniff",
        "Content-Disposition": "inline",
      },
    });
  } catch (error) {
    console.error("GET /api/admin/products/[id]/media/[kind] error:", error);
    return failure("Failed to load product media.", 500);
  }
}
