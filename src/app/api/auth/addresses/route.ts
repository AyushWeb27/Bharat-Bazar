import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { USER_COOKIE_NAME, verifyUserSessionToken } from "@/lib/auth";

type AddressInput = {
  label: string;
  recipient: string;
  phone: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
};

function responseError(message: string, status: number) {
  return NextResponse.json({ success: false, message }, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}

async function getCustomerId(req: NextRequest) {
  const token = req.cookies.get(USER_COOKIE_NAME)?.value;
  if (!token) return null;
  const session = verifyUserSessionToken(token);
  if (!session?.id) return null;

  const rows = await sql`SELECT id FROM users WHERE id = ${session.id} AND status = 'active' LIMIT 1`;
  return rows.length ? Number(rows[0].id) : null;
}

function parseAddress(value: unknown): AddressInput | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const input = value as Record<string, unknown>;
  const fields = ["label", "recipient", "phone", "line1", "line2", "city", "state", "postalCode", "country"];
  if (fields.some(field => typeof input[field] !== "string") || typeof input.isDefault !== "boolean") return null;

  const address: AddressInput = {
    label: (input.label as string).trim(),
    recipient: (input.recipient as string).trim(),
    phone: (input.phone as string).trim(),
    line1: (input.line1 as string).trim(),
    line2: (input.line2 as string).trim(),
    city: (input.city as string).trim(),
    state: (input.state as string).trim(),
    postalCode: (input.postalCode as string).trim(),
    country: (input.country as string).trim(),
    isDefault: input.isDefault,
  };

  if (
    !address.label || address.label.length > 40 ||
    !address.recipient || address.recipient.length > 100 ||
    address.phone.length > 20 || !/^\+?[0-9\s()-]{7,20}$/.test(address.phone) ||
    !address.line1 || address.line1.length > 200 ||
    address.line2.length > 200 ||
    !address.city || address.city.length > 100 ||
    !address.state || address.state.length > 100 ||
    !/^[0-9A-Za-z -]{4,12}$/.test(address.postalCode) ||
    !address.country || address.country.length > 100
  ) return null;
  return address;
}

function mapAddress(row: Record<string, unknown>) {
  return {
    id: Number(row.id),
    label: String(row.label || ""),
    recipient: String(row.recipient || ""),
    phone: String(row.phone || ""),
    line1: String(row.line1 || ""),
    line2: String(row.line2 || ""),
    city: String(row.city || ""),
    state: String(row.state || ""),
    postalCode: String(row.postal_code || ""),
    country: String(row.country || ""),
    isDefault: Boolean(row.is_default),
  };
}

async function clearCustomerDefault(customerId: number, exceptId?: number) {
  if (exceptId) {
    await sql`
      UPDATE user_addresses SET is_default = FALSE, updated_at = CURRENT_TIMESTAMP
      WHERE user_id = ${customerId} AND is_default = TRUE AND id <> ${exceptId}
    `;
    return;
  }
  await sql`
    UPDATE user_addresses SET is_default = FALSE, updated_at = CURRENT_TIMESTAMP
    WHERE user_id = ${customerId} AND is_default = TRUE
  `;
}

export async function GET(req: NextRequest) {
  try {
    const customerId = await getCustomerId(req);
    if (!customerId) return responseError("Please sign in to view your addresses.", 401);

    const rows = await sql`
      SELECT id, label, recipient, phone, line1, line2, city, state, postal_code, country, is_default
      FROM user_addresses
      WHERE user_id = ${customerId}
      ORDER BY is_default DESC, created_at DESC, id DESC
    `;
    return NextResponse.json(
      { success: true, addresses: rows.map(mapAddress) },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    console.error("GET /api/auth/addresses error:", error);
    return responseError("Failed to load saved addresses.", 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const customerId = await getCustomerId(req);
    if (!customerId) return responseError("Please sign in to save an address.", 401);

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return responseError("Request body must be valid JSON.", 400);
    }
    const address = parseAddress(body);
    if (!address) return responseError("Enter valid address details.", 400);

    const existing = await sql`SELECT id FROM user_addresses WHERE user_id = ${customerId} LIMIT 1`;
    const makeDefault = address.isDefault || existing.length === 0;
    if (makeDefault) await clearCustomerDefault(customerId);

    const rows = await sql`
      INSERT INTO user_addresses
        (user_id, label, recipient, phone, line1, line2, city, state, postal_code, country, is_default)
      VALUES
        (${customerId}, ${address.label}, ${address.recipient}, ${address.phone}, ${address.line1}, ${address.line2},
         ${address.city}, ${address.state}, ${address.postalCode}, ${address.country}, ${makeDefault})
      RETURNING id, label, recipient, phone, line1, line2, city, state, postal_code, country, is_default
    `;
    return NextResponse.json({ success: true, address: mapAddress(rows[0]) }, { status: 201 });
  } catch (error) {
    console.error("POST /api/auth/addresses error:", error);
    return responseError("Failed to save address.", 500);
  }
}

export async function PUT(req: NextRequest) {
  try {
    const customerId = await getCustomerId(req);
    if (!customerId) return responseError("Please sign in to update an address.", 401);

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return responseError("Request body must be valid JSON.", 400);
    }
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return responseError("Invalid address update.", 400);
    }
    const input = body as Record<string, unknown>;
    const id = Number(input.id);
    const address = parseAddress(input);
    if (!Number.isSafeInteger(id) || id < 1 || !address) {
      return responseError("Enter valid address details.", 400);
    }

    const owned = await sql`
      SELECT id, is_default FROM user_addresses
      WHERE id = ${id} AND user_id = ${customerId}
      LIMIT 1
    `;
    if (!owned.length) return responseError("Address not found.", 404);
    let makeDefault = address.isDefault;
    let replacementDefaultId: number | null = null;
    if (makeDefault) {
      await clearCustomerDefault(customerId, id);
    } else if (owned[0].is_default) {
      const replacement = await sql`
        SELECT id FROM user_addresses
        WHERE user_id = ${customerId} AND id <> ${id}
        ORDER BY created_at DESC, id DESC
        LIMIT 1
      `;
      if (replacement.length) replacementDefaultId = Number(replacement[0].id);
      else makeDefault = true;
    }

    const rows = await sql`
      UPDATE user_addresses
      SET label = ${address.label}, recipient = ${address.recipient}, phone = ${address.phone},
          line1 = ${address.line1}, line2 = ${address.line2}, city = ${address.city}, state = ${address.state},
          postal_code = ${address.postalCode}, country = ${address.country}, is_default = ${makeDefault},
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id} AND user_id = ${customerId}
      RETURNING id, label, recipient, phone, line1, line2, city, state, postal_code, country, is_default
    `;
    if (replacementDefaultId !== null) {
      await sql`
        UPDATE user_addresses SET is_default = TRUE, updated_at = CURRENT_TIMESTAMP
        WHERE id = ${replacementDefaultId} AND user_id = ${customerId}
      `;
    }
    return NextResponse.json({ success: true, address: mapAddress(rows[0]) });
  } catch (error) {
    console.error("PUT /api/auth/addresses error:", error);
    return responseError("Failed to update address.", 500);
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const customerId = await getCustomerId(req);
    if (!customerId) return responseError("Please sign in to remove an address.", 401);
    const id = Number(req.nextUrl.searchParams.get("id"));
    if (!Number.isSafeInteger(id) || id < 1) return responseError("A valid address ID is required.", 400);

    const removed = await sql`
      DELETE FROM user_addresses
      WHERE id = ${id} AND user_id = ${customerId}
      RETURNING is_default
    `;
    if (!removed.length) return responseError("Address not found.", 404);
    if (removed[0].is_default) {
      const next = await sql`
        SELECT id FROM user_addresses
        WHERE user_id = ${customerId}
        ORDER BY created_at DESC, id DESC
        LIMIT 1
      `;
      if (next.length) {
        await sql`
          UPDATE user_addresses SET is_default = TRUE, updated_at = CURRENT_TIMESTAMP
          WHERE id = ${next[0].id} AND user_id = ${customerId}
        `;
      }
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/auth/addresses error:", error);
    return responseError("Failed to remove address.", 500);
  }
}
