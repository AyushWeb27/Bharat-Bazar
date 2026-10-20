import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { verifyUserSessionToken, USER_COOKIE_NAME } from "@/lib/auth";

export async function PUT(req: NextRequest) {
  try {
    const sessionCookie = req.cookies.get(USER_COOKIE_NAME)?.value;

    if (!sessionCookie) {
      return NextResponse.json(
        { success: false, message: "Not authenticated." },
        { status: 401 }
      );
    }

    const payload = verifyUserSessionToken(sessionCookie);
    if (!payload || !payload.id) {
      return NextResponse.json(
        { success: false, message: "Session expired or invalid." },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { name, phone, gender, date_of_birth } = body;

    // Validate
    if (name !== undefined && String(name).trim().length === 0) {
      return NextResponse.json(
        { success: false, message: "Name cannot be empty." },
        { status: 400 }
      );
    }

    const cleanName     = name        ? String(name).trim()                        : undefined;
    const cleanPhone    = phone       ? String(phone).trim()                       : undefined;
    const cleanGender   = gender      ? String(gender).trim()                      : null;
    const cleanDob      = date_of_birth && String(date_of_birth).trim() !== ""
                            ? String(date_of_birth).trim()
                            : null;

    // Build update query dynamically
    const updated = await sql`
      UPDATE users
      SET
        name          = COALESCE(${cleanName  ?? null}, name),
        phone         = COALESCE(${cleanPhone ?? null}, phone),
        gender        = ${cleanGender},
        date_of_birth = ${cleanDob}::DATE
      WHERE id = ${payload.id} AND status = 'active'
      RETURNING id, name, email, phone, gender, date_of_birth::TEXT AS date_of_birth, avatar_url, email_verified, auth_provider, created_at
    `;

    if (updated.length === 0) {
      return NextResponse.json(
        { success: false, message: "User not found or inactive." },
        { status: 404 }
      );
    }

    const user = updated[0];

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully.",
      user: {
        id:             user.id,
        name:           user.name,
        email:          user.email,
        phone:          user.phone || "",
        gender:         user.gender || "",
        date_of_birth:  user.date_of_birth ? String(user.date_of_birth).slice(0, 10) : "",
        avatar_url:     user.avatar_url || "",
        email_verified: Boolean(user.email_verified),
        auth_provider:  user.auth_provider || "local",
        created_at:     user.created_at,
      },
    });
  } catch (error: any) {
    console.error("PUT /api/auth/profile error:", error);
    return NextResponse.json(
      { success: false, message: error?.message || "Failed to update profile." },
      { status: 500 }
    );
  }
}
