import { NextRequest, NextResponse } from "next/server";
import { requireActiveAdmin } from "@/lib/categories";
import {
  loadBannerImage,
  loadBannerProductImage,
  SUPPORTED_BANNER_IMAGE_TYPES,
} from "@/lib/profile-storage";

export const runtime = "nodejs";

type RouteContext = { params: { id: string } };

function failure(message: string, status: number) {
  return NextResponse.json({ success: false, message }, { status });
}

export async function GET(req: NextRequest, { params }: RouteContext) {
  try {
    if (!(await requireActiveAdmin(req))) return failure("Unauthorized.", 401);
    const id = Number(params.id);
    if (!Number.isSafeInteger(id) || id < 1) return failure("Invalid banner ID.", 400);
    const kind = req.nextUrl.searchParams.get("kind");
    if (kind && kind !== "product") return failure("Invalid banner image type.", 400);
    const object = kind === "product" ? await loadBannerProductImage(id) : await loadBannerImage(id);
    if (!object.Body) return failure("Banner image not found.", 404);
    const contentType = object.ContentType || "application/octet-stream";
    if (!SUPPORTED_BANNER_IMAGE_TYPES.has(contentType)) {
      return failure("Banner image has an unsupported format.", 415);
    }
    const bytes = await object.Body.transformToByteArray();
    const body = new ArrayBuffer(bytes.byteLength);
    new Uint8Array(body).set(bytes);
    return new NextResponse(body, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "private, no-store",
        "X-Content-Type-Options": "nosniff",
        "Content-Disposition": "inline",
      },
    });
  } catch (error) {
    console.error("GET /api/admin/banners/[id]/image error:", error);
    return failure("Failed to load banner image.", 500);
  }
}
