import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import {
  ADMIN_COOKIE_NAME,
  USER_COOKIE_NAME,
  verifySessionToken,
  verifyUserSessionToken,
} from "@/lib/auth";
import {
  detectProfileImageType,
  loadProfileImage,
  MAX_PROFILE_IMAGE_SIZE,
  saveProfileImage,
} from "@/lib/profile-storage";

export const runtime = "nodejs";

function unauthorized(message: string, status = 401) {
  return NextResponse.json({ success: false, message }, { status });
}

function getSignedInUserId(req: NextRequest) {
  const token = req.cookies.get(USER_COOKIE_NAME)?.value;
  const session = token ? verifyUserSessionToken(token) : null;
  return session?.id && Number.isSafeInteger(session.id) && session.id > 0
    ? session.id
    : null;
}

export async function POST(req: NextRequest) {
  try {
    const userId = getSignedInUserId(req);
    if (!userId) return unauthorized("Please sign in to update your profile image.");

    const formData = await req.formData();
    const file = formData.get("image");
    if (!(file instanceof File)) {
      return unauthorized("Choose an image file to upload.", 400);
    }
    if (file.size === 0 || file.size > MAX_PROFILE_IMAGE_SIZE) {
      return unauthorized("Image must be between 1 byte and 5 MB.", 400);
    }

    const bytes = new Uint8Array(await file.arrayBuffer());
    const detectedType = detectProfileImageType(bytes);
    if (!detectedType || file.type !== detectedType) {
      return unauthorized("Use a valid JPEG, PNG, or WebP image.", 400);
    }

    const activeUser = await sql`
      SELECT id
      FROM users
      WHERE id = ${userId} AND status = 'active'
      LIMIT 1
    `;
    if (activeUser.length === 0) {
      return unauthorized("User not found or inactive.", 404);
    }

    await saveProfileImage(userId, bytes, detectedType);
    const updatedUser = await sql`
      UPDATE users
      SET avatar_url = ${`/api/auth/profile/image?userId=${userId}`}
      WHERE id = ${userId} AND status = 'active'
      RETURNING id
    `;
    if (updatedUser.length === 0) {
      return unauthorized("User not found or inactive.", 404);
    }
    return NextResponse.json({
      success: true,
      message: "Profile image updated.",
      avatar_url: `/api/auth/profile/image?userId=${userId}`,
    });
  } catch (error) {
    console.error("POST /api/auth/profile/image error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to upload profile image." },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const userIdValue = req.nextUrl.searchParams.get("userId");
    const userId = userIdValue ? Number(userIdValue) : getSignedInUserId(req);
    if (!userId || !Number.isSafeInteger(userId) || userId < 1) {
      return unauthorized("Please sign in to view this profile image.");
    }

    const ownUserId = getSignedInUserId(req);
    const adminToken = req.cookies.get(ADMIN_COOKIE_NAME)?.value;
    const adminSession = adminToken ? verifySessionToken(adminToken) : null;
    if (ownUserId !== userId && !adminSession) {
      return unauthorized("You are not allowed to view this profile image.", 403);
    }

    const activeUser = await sql`
      SELECT id
      FROM users
      WHERE id = ${userId} AND status = 'active'
      LIMIT 1
    `;
    if (activeUser.length === 0) {
      return unauthorized("User not found or inactive.", 404);
    }

    const image = await loadProfileImage(userId);
    if (!image.Body) {
      return unauthorized("Profile image not found.", 404);
    }
    const contentType = image.ContentType || "application/octet-stream";
    if (!["image/jpeg", "image/png", "image/webp"].includes(contentType)) {
      return unauthorized("Profile image has an unsupported format.", 415);
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
    console.error("GET /api/auth/profile/image error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to load profile image." },
      { status: 500 }
    );
  }
}