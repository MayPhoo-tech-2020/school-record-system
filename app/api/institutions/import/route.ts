import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({
  adapter,
});

function parseCSVLine(line: string): string[] {
  const values: string[] = [];
  let current = "";
  let insideQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      if (insideQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        insideQuotes = !insideQuotes;
      }
    } else if (char === "," && !insideQuotes) {
      values.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }

  values.push(current.trim());

  return values;
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json(
        {
          success: false,
          message: "CSV file is required",
        },
        { status: 400 }
      );
    }

    const csvText = await file.text();

    const lines = csvText
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean);

    if (lines.length < 2) {
      return NextResponse.json(
        {
          success: false,
          message: "CSV must contain a header and at least one data row",
        },
        { status: 400 }
      );
    }

    const headers = parseCSVLine(lines[0]);

    const records = lines.slice(1).map((line) => {
      const values = parseCSVLine(line);

      const record: Record<string, string> = {};

      headers.forEach((header, index) => {
        record[header] = values[index] || "";
      });

      return record;
    });

    // MOE source ID
    const sourceId = 1;

    const source = await prisma.source.findUnique({
      where: {
        id: sourceId,
      },
    });

    if (!source) {
      return NextResponse.json(
        {
          success: false,
          message: "MOE source not found",
        },
        { status: 400 }
      );
    }

    let imported = 0;

    for (const record of records) {
      await prisma.institution.create({
        data: {
          name: record.name || "",
          type: record.type || null,
          address: record.address || null,
          region: record.region || null,
          township: record.township || null,
          phone: record.phone || null,
          email: record.email || null,
          website: record.website || null,
          latitude: record.latitude
            ? Number(record.latitude)
            : null,
          longitude: record.longitude
            ? Number(record.longitude)
            : null,
          schoolLevel: record.school_level || null,
          classes: record.classes || null,
          openingPeriod: record.opening_period || null,
          sourceId: source.id,
          rawData: record,
        },
      });

      imported++;
    }

    return NextResponse.json({
      success: true,
      message: "CSV imported successfully",
      count: imported,
    });
  } catch (error) {
    console.error("POST /api/institutions/import error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to import CSV",
      },
      { status: 500 }
    );
  }
}