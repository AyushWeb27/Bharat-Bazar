import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { ADMIN_COOKIE_NAME, verifySessionToken } from "@/lib/auth";
import {
  detectProfileImageType,
  loadAdminProfileImage,
  MAX_PROFILE_IMAGE_SIZE,
  saveAdminProfileImage,
} from "@/lib/profile-storage";

export const runtime = "nodejs";

function getAdminId(req: NextRequest) {
  const token = req.cookies.get(ADMIN_COOKIE_NAME)?.value;
  const session = token ? verifySessionToken(token) : null;
  return session?.id && Number.isSafeInteger(session.id) && session.id > 0
    ? session.id
    : null;
}

function errorResponse(message: string, status: number) {
  return NextResponse.json({ success: false, message }, { status });
}

export async function POST(req: NextRequest) {
  try {
    const adminId = getAdminId(req);
    if (!adminId) return errorResponse("Please sign in as an administrator.", 401);

    const formData = await req.formData();
    const file = formData.get("image");
    if (!(file instanceof File)) {
      return errorResponse("Choose an image file to upload.", 400);
    }
    if (file.size === 0 || file.size > MAX_PROFILE_IMAGE_SIZE) {
      return errorResponse("Image must be between 1 byte and 5 MB.", 400);
    }

    const bytes = new Uint8Array(await file.arrayBuffer());
    const contentType = detectProfileImageType(bytes);
    if (!contentType || file.type !== contentType) {
      return errorResponse("Use a valid JPEG, PNG, or WebP image.", 400);
    }

    const admin = await sql`
      SELECT id
      FROM admins
      WHERE id = ${adminId} AND status = 'active'
      LIMIT 1
    `;
    if (admin.length === 0) {
      return errorResponse("Administrator not found or inactive.", 404);
    }

    await saveAdminProfileImage(adminId, bytes, contentType);
    const avatarUrl = `/api/admin/profile/image?adminId=${adminId}`;
    const updated = await sql`
      UPDATE admins
      SET avatar_url = ${avatarUrl}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ${adminId} AND status = 'active'
      RETURNING id
    `;
    if (updated.length === 0) {
      return errorResponse("Administrator not found or inactive.", 404);
    }

    return NextResponse.json({
      success: true,
      message: "Administrator profile image saved.",
      avatar_url: avatarUrl,
    });
  } catch (error) {
    console.error("POST /api/admin/profile/image error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to save administrator profile image." },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const adminId = getAdminId(req);
    if (!adminId) return errorResponse("Please sign in as an administrator.", 401);

    const requestedAdminId = req.nextUrl.searchParams.get("adminId");
    if (requestedAdminId && Number(requestedAdminId) !== adminId) {
      return errorResponse("You are not allowed to view this profile image.", 403);
    }

    const admin = await sql`
      SELECT id
      FROM admins
      WHERE id = ${adminId} AND status = 'active'
      LIMIT 1
    `;
    if (admin.length === 0) {
      return errorResponse("Administrator not found or inactive.", 404);
    }

    const image = await loadAdminProfileImage(adminId);
    if (!image.Body) return errorResponse("Profile image not found.", 404);

    const contentType = image.ContentType || "application/octet-stream";
    if (!["image/jpeg", "image/png", "image/webp"].includes(contentType)) {
      return errorResponse("Profile image has an unsupported format.", 415);
    }

    const bytes = await image.Body.transformToByteArray();
    const body = new ArrayBuffer(bytes.byteLength);
    new Uint8Array(body).set(bytes);
    return new NextResponse(body, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "private, no-store",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    console.error("GET /api/admin/profile/image error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to load administrator profile image." },
      { status: 500 }
    );
  }
}
