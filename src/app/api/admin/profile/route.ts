import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import {
  verifySessionToken,
  ADMIN_COOKIE_NAME,
  verifyPassword,
  hashPassword,
  createSessionToken,
} from "@/lib/auth";

// GET current admin profile
export async function GET(req: NextRequest) {
  try {
    const sessionCookie = req.cookies.get(ADMIN_COOKIE_NAME)?.value;
    const session = sessionCookie ? verifySessionToken(sessionCookie) : null;

    if (!session) {
      return NextResponse.json(
        { success: false, message: "Unauthorized. Please log in." },
        { status: 401 }
      );
    }

    const admins = await sql`
      SELECT id, name, email, phone, designation, bio, avatar_url, role, status, last_login, created_at, updated_at
      FROM admins
      WHERE id = ${session.id}
      LIMIT 1
    `;

    if (admins.length === 0) {
      return NextResponse.json(
        { success: false, message: "Admin account not found in database." },
        { status: 404 }
      );
    }

    const profile = admins[0];

    return NextResponse.json({
      success: true,
      profile: {
        id: profile.id,
        name: profile.name,
        email: profile.email,
        phone: profile.phone || "",
        designation: profile.designation || "Super Administrator",
        bio: profile.bio || "",
        avatar_url: profile.avatar_url || "",
        role: profile.role,
        status: profile.status,
        last_login: profile.last_login,
        created_at: profile.created_at,
        updated_at: profile.updated_at,
      },
    });
  } catch (error: any) {
    console.error("GET /api/admin/profile error:", error);
    return NextResponse.json(
      { success: false, message: error?.message || "Failed to load admin profile." },
      { status: 500 }
    );
  }
}

// PUT update admin profile / password
export async function PUT(req: NextRequest) {
  try {
    const sessionCookie = req.cookies.get(ADMIN_COOKIE_NAME)?.value;
    const session = sessionCookie ? verifySessionToken(sessionCookie) : null;

    if (!session) {
      return NextResponse.json(
        { success: false, message: "Unauthorized. Please log in." },
        { status: 401 }
      );
    }

    const body = await req.json();
    const {
      name,
      email,
      phone,
      designation,
      bio,
      avatar_url,
      currentPassword,
      newPassword,
    } = body;

    // Fetch existing admin record
    const existing = await sql`
      SELECT id, name, email, password_hash, role
      FROM admins
      WHERE id = ${session.id}
      LIMIT 1
    `;

    if (existing.length === 0) {
      return NextResponse.json(
        { success: false, message: "Admin account not found." },
        { status: 404 }
      );
    }

    const admin = existing[0];

    // Validate email
    const cleanEmail = email ? String(email).trim().toLowerCase() : admin.email;
    if (cleanEmail !== admin.email) {
      const emailConflict = await sql`
        SELECT id FROM admins WHERE LOWER(email) = ${cleanEmail} AND id != ${admin.id}
      `;
      if (emailConflict.length > 0) {
        return NextResponse.json(
          { success: false, message: "An admin with this email address already exists." },
          { status: 409 }
        );
      }
    }

    // Handle password change if requested
    let updatedPasswordHash = admin.password_hash;
    if (newPassword) {
      if (!currentPassword) {
        return NextResponse.json(
          { success: false, message: "Current password is required to set a new password." },
          { status: 400 }
        );
      }

      const isValidOld = await verifyPassword(currentPassword, admin.password_hash);
      if (!isValidOld) {
        return NextResponse.json(
          { success: false, message: "Current password does not match our records." },
          { status: 400 }
        );
      }

      if (String(newPassword).length < 6) {
        return NextResponse.json(
          { success: false, message: "New password must be at least 6 characters long." },
          { status: 400 }
        );
      }

      updatedPasswordHash = await hashPassword(newPassword);
    }

    const cleanName = name ? String(name).trim() : admin.name;
    const cleanPhone = phone !== undefined ? String(phone).trim() : "";
    const cleanDesignation = designation !== undefined ? String(designation).trim() : "Super Administrator";
    const cleanBio = bio !== undefined ? String(bio).trim() : "";
    const cleanAvatar = avatar_url !== undefined ? String(avatar_url).trim() : "";

    // Update in Neon PostgreSQL database
    const updated = await sql`
      UPDATE admins
      SET 
        name = ${cleanName},
        email = ${cleanEmail},
        phone = ${cleanPhone},
        designation = ${cleanDesignation},
        bio = ${cleanBio},
        avatar_url = ${cleanAvatar},
        password_hash = ${updatedPasswordHash},
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${admin.id}
      RETURNING id, name, email, phone, designation, bio, avatar_url, role, status, last_login, created_at, updated_at
    `;

    const profile = updated[0];

    // Issue refreshed session cookie
    const token = createSessionToken({
      id: profile.id,
      name: profile.name,
      email: profile.email,
      role: profile.role,
    });

    const response = NextResponse.json({
      success: true,
      message: "Admin profile successfully updated in Neon database.",
      profile: {
        id: profile.id,
        name: profile.name,
        email: profile.email,
        phone: profile.phone || "",
        designation: profile.designation || "Super Administrator",
        bio: profile.bio || "",
        avatar_url: profile.avatar_url || "",
        role: profile.role,
        status: profile.status,
        last_login: profile.last_login,
        created_at: profile.created_at,
        updated_at: profile.updated_at,
      },
    });

    response.cookies.set({
      name: ADMIN_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error: any) {
    console.error("PUT /api/admin/profile error:", error);
    return NextResponse.json(
      { success: false, message: error?.message || "Failed to update profile." },
      { status: 500 }
    );
  }
}
