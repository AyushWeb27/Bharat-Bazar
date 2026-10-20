import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { verifyUserSessionToken, USER_COOKIE_NAME } from "@/lib/auth";

function unauthenticated(message: string) {
  return NextResponse.json(
    { authenticated: false, message },
    { headers: { "Cache-Control": "no-store" } }
  );
}

export async function GET(req: NextRequest) {
  try {
    const sessionCookie = req.cookies.get(USER_COOKIE_NAME)?.value;

    if (!sessionCookie) {
      return unauthenticated("No active user session.");
    }

    const payload = verifyUserSessionToken(sessionCookie);

    if (!payload || !payload.id) {
      return unauthenticated("Session expired or invalid.");
    }

    // Query Neon database to verify customer exists & active
    const rows = await sql`
      SELECT id, name, email, phone, avatar_url, email_verified, auth_provider,
             gender, date_of_birth::TEXT AS date_of_birth, status, created_at, last_login
      FROM users
      WHERE id = ${payload.id} AND status = 'active'
      LIMIT 1
    `;

    if (rows.length === 0) {
      return unauthenticated("User not found or deactivated.");
    }

    const user = rows[0];

    return NextResponse.json(
      {
        authenticated: true,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone || "",
          avatar_url: user.avatar_url || "",
          email_verified: Boolean(user.email_verified),
          auth_provider: user.auth_provider || "local",
          gender: user.gender || "",
          date_of_birth: user.date_of_birth ? String(user.date_of_birth).slice(0, 10) : "",
          created_at: user.created_at,
          last_login: user.last_login,
        },
      },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error: any) {
    console.error("GET /api/auth/me error:", error);
    return NextResponse.json(
      { authenticated: false, message: "Failed to verify session." },
      { status: 500, headers: { "Cache-Control": "no-store" } }
    );
  }
}
