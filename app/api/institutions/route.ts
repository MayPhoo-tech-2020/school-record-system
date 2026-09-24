import { sql } from "@vercel/postgres";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const { rows } = await sql`
      SELECT
        id,
        name,
        type,
        address,
        region,
        township,
        phone,
        email,
        website,
        latitude,
        longitude,
        school_level,
        classes,
        opening_period,
        source_id,
        raw_data,
        created_at,
        updated_at
      FROM institutions
      ORDER BY id;
    `;

    return NextResponse.json({
      success: true,
      count: rows.length,
      data: rows,
    });
  } catch (error) {
    console.error("GET /api/institutions error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch institutions",
      },
      { status: 500 }
    );
  }
}