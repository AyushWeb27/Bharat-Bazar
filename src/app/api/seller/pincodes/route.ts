import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const pin = searchParams.get("pincode")?.trim() || "";
    const query = searchParams.get("query")?.trim() || "";

    if (pin) {
      const rows = await sql`
        SELECT 
          id, 
          pincode, 
          district_city, 
          state_name, 
          country_code, 
          office_name, 
          is_express_serviceable 
        FROM admin_pincodes 
        WHERE pincode = ${pin} AND active = TRUE 
        LIMIT 1;
      `;

      if (rows.length > 0) {
        const item = rows[0];
        return NextResponse.json({
          success: true,
          found: true,
          pincode: item.pincode,
          city: item.district_city,
          state: item.state_name,
          office: item.office_name,
          serviceable: Boolean(item.is_express_serviceable),
        });
      }

      return NextResponse.json({
        success: true,
        found: false,
        message: "Pincode not found in local hub directory.",
      });
    }

    const countryCode = searchParams.get("countryCode")?.trim() || "";
    const state = searchParams.get("state")?.trim() || "";
    if (countryCode || state) {
      if (!countryCode || !state) {
        return NextResponse.json(
          { success: false, message: "Both countryCode and state are required." },
          { status: 400 }
        );
      }

      const locationRows = await sql`
        SELECT pincodes.district_city, MIN(pincodes.pincode) AS pincode
        FROM admin_pincodes AS pincodes
        INNER JOIN admin_countries AS countries
          ON UPPER(BTRIM(countries.code)) = UPPER(BTRIM(pincodes.country_code))
        INNER JOIN admin_states AS states
          ON LOWER(BTRIM(states.name)) = LOWER(BTRIM(pincodes.state_name))
          AND states.country_code::text = countries.id::text
        WHERE pincodes.active = TRUE
          AND states.active = TRUE
          AND UPPER(BTRIM(countries.code)) = UPPER(BTRIM(${countryCode}))
          AND LOWER(BTRIM(states.name)) = LOWER(BTRIM(${state}))
          AND pincodes.district_city IS NOT NULL
          AND pincodes.pincode IS NOT NULL
        GROUP BY pincodes.district_city
        ORDER BY pincodes.district_city ASC;
      `;

      return NextResponse.json({
        success: true,
        locations: locationRows.map(row => ({
          city: String(row.district_city).trim(),
          pincode: String(row.pincode).trim(),
        })),
      });
    }

    if (query) {
      const searchPattern = `%${query}%`;
      const rows = await sql`
        SELECT 
          id, 
          pincode, 
          district_city, 
          state_name, 
          office_name 
        FROM admin_pincodes 
        WHERE (pincode LIKE ${searchPattern} OR district_city ILIKE ${searchPattern}) AND active = TRUE 
        ORDER BY pincode ASC 
        LIMIT 20;
      `;

      return NextResponse.json({
        success: true,
        results: rows.map(r => ({
          id: Number(r.id),
          pincode: r.pincode,
          city: r.district_city,
          state: r.state_name,
          office: r.office_name,
        })),
      });
    }

    // Default: return distinct popular cities & sample hubs
    const [hubsRows, citiesRows] = await Promise.all([
      sql`
        SELECT id, pincode, district_city, state_name, office_name 
        FROM admin_pincodes 
        WHERE active = TRUE 
        ORDER BY district_city ASC 
        LIMIT 100;
      `,
      sql`
        SELECT DISTINCT district_city, state_name 
        FROM admin_pincodes 
        WHERE active = TRUE 
        ORDER BY district_city ASC;
      `,
    ]);

    return NextResponse.json({
      success: true,
      hubs: hubsRows.map(r => ({
        id: Number(r.id),
        pincode: r.pincode,
        city: r.district_city,
        state: r.state_name,
        office: r.office_name,
      })),
      cities: citiesRows.map(r => ({
        city: r.district_city,
        state: r.state_name,
      })),
    });
  } catch (error: any) {
    console.error("GET /api/seller/pincodes error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to query pincodes.", error: error?.message },
      { status: 500 }
    );
  }
}
