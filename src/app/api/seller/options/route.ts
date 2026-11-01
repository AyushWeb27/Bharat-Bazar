import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export const dynamic = "force-dynamic";

export interface DbBusinessType {
  id: number;
  name: string;
  code: string | null;
  description: string | null;
}

export interface DbTurnoverRange {
  id: number;
  label: string;
  displayText: string;
  minValue: number;
  maxValue: number | null;
}

export interface DbCountry {
  id: number;
  name: string;
  code: string;
  phoneCode: string;
  currency: string;
  flagEmoji: string;
  isDefault: boolean;
}

export interface DbState {
  id: number;
  name: string;
  code: string | null;
  gstCode: string | null;
  type: string;
  countryCode: string;
}

export async function GET() {
  try {
    const [businessTypesRows, turnoverRows, countriesRows, statesRows] = await Promise.all([
      sql`
        SELECT id, name, code, description 
        FROM admin_business_types 
        WHERE active = TRUE 
        ORDER BY sort_order ASC, name ASC;
      `,
      sql`
        SELECT id, label, display_text, min_value, max_value 
        FROM admin_turnover_ranges 
        WHERE active = TRUE 
        ORDER BY sort_order ASC, id ASC;
      `,
      sql`
        SELECT id, name, code, phone_code, currency, flag_emoji, is_default 
        FROM admin_countries 
        ORDER BY sort_order ASC, name ASC;
      `,
      sql`
        SELECT
          states.id,
          states.name,
          states.state_code,
          states.gst_code,
          states.type,
          countries.code AS country_code
        FROM admin_states AS states
        INNER JOIN admin_countries AS countries
          ON countries.id::text = states.country_code::text
        WHERE states.active = TRUE
        ORDER BY states.sort_order ASC, states.name ASC;
      `,
    ]);

    const businessTypes: DbBusinessType[] = businessTypesRows.map(r => ({
      id: Number(r.id),
      name: String(r.name).trim(),
      code: r.code ? String(r.code).trim() : null,
      description: r.description ? String(r.description).trim() : null,
    }));

    const turnoverRanges: DbTurnoverRange[] = turnoverRows.map(r => ({
      id: Number(r.id),
      label: String(r.label).trim(),
      displayText: String(r.display_text).trim(),
      minValue: Number(r.min_value || 0),
      maxValue: r.max_value !== null ? Number(r.max_value) : null,
    }));

    const countries: DbCountry[] = countriesRows.map(r => ({
      id: Number(r.id),
      name: String(r.name).trim(),
      code: String(r.code).trim(),
      phoneCode: String(r.phone_code || "+91").trim(),
      currency: String(r.currency || "INR").trim(),
      flagEmoji: String(r.flag_emoji || "🇮🇳").trim(),
      isDefault: Boolean(r.is_default),
    }));

    const states: DbState[] = statesRows.map(r => ({
      id: Number(r.id),
      name: String(r.name).trim(),
      code: r.state_code ? String(r.state_code).trim() : null,
      gstCode: r.gst_code ? String(r.gst_code).trim() : null,
      type: String(r.type || "State").trim(),
      countryCode: String(r.country_code || "IN").trim(),
    }));

    return NextResponse.json(
      {
        success: true,
        businessTypes,
        turnoverRanges,
        countries,
        states,
      },
      {
        headers: {
          "Cache-Control": "public, max-age=60, s-maxage=300",
        },
      }
    );
  } catch (error: any) {
    console.error("GET /api/seller/options error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch registration options from database.",
        error: error?.message,
      },
      { status: 500 }
    );
  }
}
