import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { ADMIN_COOKIE_NAME, verifySessionToken } from "@/lib/auth";

// ─── Auth helper ──────────────────────────────────────────────────────────────

async function requireAdmin(req: NextRequest): Promise<number | null> {
  const token = req.cookies.get(ADMIN_COOKIE_NAME)?.value;
  const session = token ? verifySessionToken(token) : null;
  if (!session?.id || !Number.isSafeInteger(session.id) || session.id < 1) return null;

  const rows = await sql`
    SELECT id FROM admins WHERE id = ${session.id} AND status = 'active' LIMIT 1
  `;
  return rows.length ? session.id : null;
}

function unauthorized() {
  return NextResponse.json(
    { success: false, message: "Unauthorized. Please log in as an administrator." },
    { status: 401 }
  );
}

// ─── GET – fetch all store settings ───────────────────────────────────────────

export async function GET(req: NextRequest) {
  try {
    if (!(await requireAdmin(req))) return unauthorized();

    const rows = await sql`
      SELECT key, value, type, label, section, description, updated_at
      FROM store_settings
      ORDER BY section ASC, key ASC
    `;

    // Group into a flat object for easy consumption { key: value, ... }
    const settings: Record<string, string> = {};
    const meta: Array<{
      key: string; value: string; type: string; label: string;
      section: string; description: string; updated_at: string;
    }> = [];

    for (const row of rows) {
      settings[String(row.key)] = String(row.value);
      meta.push({
        key: String(row.key),
        value: String(row.value),
        type: String(row.type),
        label: String(row.label),
        section: String(row.section),
        description: String(row.description || ""),
        updated_at: String(row.updated_at),
      });
    }

    return NextResponse.json({ success: true, settings, meta });
  } catch (error) {
    console.error("GET /api/admin/store-settings error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to load store settings." },
      { status: 500 }
    );
  }
}

// ─── PUT – update one or many settings ────────────────────────────────────────

export async function PUT(req: NextRequest) {
  try {
    if (!(await requireAdmin(req))) return unauthorized();

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { success: false, message: "Request body must be valid JSON." },
        { status: 400 }
      );
    }

    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return NextResponse.json(
        { success: false, message: "Body must be an object of { key: value } pairs." },
        { status: 400 }
      );
    }

    const updates = body as Record<string, unknown>;
    const entries = Object.entries(updates);

    if (entries.length === 0) {
      return NextResponse.json(
        { success: false, message: "No settings provided to update." },
        { status: 400 }
      );
    }

    // Validate each value is a string (coerce booleans / numbers to string)
    const sanitized: Array<{ key: string; value: string }> = [];
    for (const [k, v] of entries) {
      if (typeof k !== "string" || !k.trim()) continue;
      sanitized.push({ key: k.trim(), value: String(v ?? "") });
    }

    if (sanitized.length === 0) {
      return NextResponse.json(
        { success: false, message: "No valid key-value pairs found." },
        { status: 400 }
      );
    }

    // Upsert each setting individually to avoid batch size issues
    for (const { key, value } of sanitized) {
      await sql`
        UPDATE store_settings
        SET value = ${value}, updated_at = NOW()
        WHERE key = ${key}
      `;
    }

    // Return updated rows
    const keys = sanitized.map(s => s.key);
    const updated = await sql`
      SELECT key, value, type, label, section, description, updated_at
      FROM store_settings
      WHERE key = ANY(${keys})
    `;

    return NextResponse.json({ success: true, updated });
  } catch (error) {
    console.error("PUT /api/admin/store-settings error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update store settings." },
      { status: 500 }
    );
  }
}

// ─── POST – upsert / create a custom setting ──────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    if (!(await requireAdmin(req))) return unauthorized();

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { success: false, message: "Request body must be valid JSON." },
        { status: 400 }
      );
    }

    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return NextResponse.json(
        { success: false, message: "Invalid request body." },
        { status: 400 }
      );
    }

    const input = body as Record<string, unknown>;
    const key   = typeof input.key   === "string" ? input.key.trim()   : "";
    const value = typeof input.value === "string" ? input.value        : String(input.value ?? "");
    const type  = typeof input.type  === "string" ? input.type.trim()  : "text";
    const label = typeof input.label === "string" ? input.label.trim() : key;
    const section = typeof input.section === "string" ? input.section.trim() : "general";
    const description = typeof input.description === "string" ? input.description.trim() : "";

    if (!key || !/^[a-z_][a-z0-9_]{0,118}$/.test(key)) {
      return NextResponse.json(
        { success: false, message: "Key must be lowercase letters/numbers/underscores (max 120 chars)." },
        { status: 400 }
      );
    }

    const rows = await sql`
      INSERT INTO store_settings (key, value, type, label, section, description)
      VALUES (${key}, ${value}, ${type}, ${label}, ${section}, ${description})
      ON CONFLICT (key) DO UPDATE
        SET value = EXCLUDED.value,
            type = EXCLUDED.type,
            label = EXCLUDED.label,
            section = EXCLUDED.section,
            description = EXCLUDED.description,
            updated_at = NOW()
      RETURNING *
    `;

    return NextResponse.json({ success: true, setting: rows[0] }, { status: 201 });
  } catch (error) {
    console.error("POST /api/admin/store-settings error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to upsert store setting." },
      { status: 500 }
    );
  }
}

// ─── DELETE – reset a setting to its default (or remove custom settings) ──────

export async function DELETE(req: NextRequest) {
  try {
    if (!(await requireAdmin(req))) return unauthorized();

    const key = req.nextUrl.searchParams.get("key");

    if (key) {
      // Reset a specific setting by key (set value to empty string)
      const rows = await sql`
        SELECT key FROM store_settings WHERE key = ${key} LIMIT 1
      `;
      if (!rows.length) {
        return NextResponse.json(
          { success: false, message: `Setting "${key}" not found.` },
          { status: 404 }
        );
      }
      await sql`
        UPDATE store_settings SET value = '', updated_at = NOW() WHERE key = ${key}
      `;
      return NextResponse.json({ success: true, message: `Setting "${key}" has been reset.` });
    }

    // If no key provided, reset all settings to empty (dangerous – require explicit confirm)
    const confirm = req.nextUrl.searchParams.get("confirm");
    if (confirm !== "yes") {
      return NextResponse.json(
        { success: false, message: "To reset ALL settings, add ?confirm=yes to the request." },
        { status: 400 }
      );
    }

    await sql`UPDATE store_settings SET value = '', updated_at = NOW()`;
    return NextResponse.json({ success: true, message: "All store settings have been reset." });
  } catch (error) {
    console.error("DELETE /api/admin/store-settings error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to reset store setting." },
      { status: 500 }
    );
  }
}
