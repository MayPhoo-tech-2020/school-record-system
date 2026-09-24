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

    let imported = 0;

    for (const record of records) {
      /*
       * ----------------------------------------
       * 1. School Type
       * ----------------------------------------
       */

      let schoolTypeId: number | null = null;

      if (record.school_type) {
        const schoolTypeName = record.school_type.trim();

        let schoolType = await prisma.schoolType.findFirst({
          where: {
            schoolType: schoolTypeName,
          },
        });

        if (!schoolType) {
          schoolType = await prisma.schoolType.create({
            data: {
              schoolType: schoolTypeName,
            },
          });
        }

        schoolTypeId = schoolType.id;
      }

      /*
       * ----------------------------------------
       * 2. Allowed School Level
       * ----------------------------------------
       */

      let allowedSchoolLevelId: number | null = null;

      if (record.school_level) {
        const schoolLevelName = record.school_level.trim();

        let schoolLevel =
          await prisma.allowedSchoolLevel.findFirst({
            where: {
              schoolLevel: schoolLevelName,
            },
          });

        if (!schoolLevel) {
          schoolLevel =
            await prisma.allowedSchoolLevel.create({
              data: {
                schoolLevel: schoolLevelName,
              },
            });
        }

        allowedSchoolLevelId = schoolLevel.id;
      }

      /*
       * ----------------------------------------
       * 3. Class To Be Taught
       * ----------------------------------------
       */

      let classToBeTaughtId: number | null = null;

      if (record.class_to_be_taught) {
        const className = record.class_to_be_taught.trim();

        let classToBeTaught =
          await prisma.classToBeTaught.findFirst({
            where: {
              classToBeTaught: className,
            },
          });

        if (!classToBeTaught) {
          classToBeTaught =
            await prisma.classToBeTaught.create({
              data: {
                classToBeTaught: className,
              },
            });
        }

        classToBeTaughtId = classToBeTaught.id;
      }

      /*
       * ----------------------------------------
       * 4. Create MOE record
       * ----------------------------------------
       */

      await prisma.mOE.create({
        data: {
          schoolName: record.school_name || "",
          schoolAddress: record.school_address || null,
          openingPeriod: record.opening_period || null,

          schoolTypeId,
          allowedSchoolLevelId,
          classToBeTaughtId,
        },
      });

      imported++;
    }

    return NextResponse.json({
      success: true,
      message: "MOE CSV imported successfully",
      count: imported,
    });
  } catch (error) {
    console.error("POST /api/moe/import error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to import MOE CSV",
      },
      { status: 500 }
    );
  }
}