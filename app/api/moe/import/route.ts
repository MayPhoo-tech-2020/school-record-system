import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";
import * as XLSX from "xlsx";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({
  adapter,
});

type ImportRecord = Record<string, unknown>;

function normalizeHeader(value: string): string {
  return value
    .replace(/^\uFEFF/, "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_");
}

function cleanString(value: unknown): string {
  if (value === null || value === undefined) {
    return "";
  }

  return String(value).trim();
}

function parseInteger(value: unknown): number | null {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return null;
  }

  const number = Number(value);

  return Number.isInteger(number) ? number : null;
}

function parseCSVLine(line: string): string[] {
  const values: string[] = [];

  let current = "";
  let insideQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      if (
        insideQuotes &&
        line[i + 1] === '"'
      ) {
        current += '"';
        i++;
      } else {
        insideQuotes = !insideQuotes;
      }
    } else if (
      char === "," &&
      !insideQuotes
    ) {
      values.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }

  values.push(current.trim());

  return values;
}

function parseCSV(text: string): ImportRecord[] {
  const lines = text
    .replace(/^\uFEFF/, "")
    .split(/\r?\n/)
    .filter((line) => line.trim());

  if (lines.length < 2) {
    throw new Error(
      "CSV must contain a header and at least one data row."
    );
  }

  const headers = parseCSVLine(lines[0]).map(
    normalizeHeader
  );

  return lines.slice(1).map((line) => {
    const values = parseCSVLine(line);

    const record: ImportRecord = {};

    headers.forEach((header, index) => {
      record[header] = values[index] ?? "";
    });

    return record;
  });
}

function parseJSON(text: string): ImportRecord[] {
  const parsed = JSON.parse(text);

  if (Array.isArray(parsed)) {
    return parsed as ImportRecord[];
  }

  if (
    parsed &&
    typeof parsed === "object" &&
    Array.isArray(parsed.data)
  ) {
    return parsed.data as ImportRecord[];
  }

  if (
    parsed &&
    typeof parsed === "object" &&
    Array.isArray(parsed.records)
  ) {
    return parsed.records as ImportRecord[];
  }

  throw new Error(
    "JSON must be an array or contain a data or records array."
  );
}

function parseXLSX(
  buffer: ArrayBuffer
): ImportRecord[] {
  const workbook = XLSX.read(buffer, {
    type: "array",
  });

  if (workbook.SheetNames.length === 0) {
    throw new Error(
      "Excel file does not contain a worksheet."
    );
  }

  const sheetName = workbook.SheetNames[0];

  const worksheet = workbook.Sheets[sheetName];

  const rows =
    XLSX.utils.sheet_to_json<ImportRecord>(
      worksheet,
      {
        defval: "",
      }
    );

  return rows.map((row) => {
    const record: ImportRecord = {};

    Object.entries(row).forEach(
      ([key, value]) => {
        record[normalizeHeader(key)] = value;
      }
    );

    return record;
  });
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();

    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Please upload a CSV, XLSX, or JSON file.",
        },
        { status: 400 }
      );
    }

    const fileName = file.name.toLowerCase();

    let records: ImportRecord[] = [];

    /*
     * CSV
     */
    if (fileName.endsWith(".csv")) {
      const text = await file.text();

      records = parseCSV(text);
    }

    /*
     * JSON
     */
    else if (fileName.endsWith(".json")) {
      const text = await file.text();

      records = parseJSON(text);
    }

    /*
     * Excel
     */
    else if (fileName.endsWith(".xlsx")) {
      const buffer = await file.arrayBuffer();

      records = parseXLSX(buffer);
    }

    /*
     * Unsupported file
     */
    else {
      return NextResponse.json(
        {
          success: false,
          message:
            "Unsupported file format. Please use CSV, XLSX, or JSON.",
        },
        { status: 400 }
      );
    }

    if (records.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message:
            "The uploaded file contains no records.",
        },
        { status: 400 }
      );
    }

    /*
     * Prepare records.
     *
     * No data-quality validation is performed here.
     *
     * schoolName is required by Prisma,
     * so empty values become an empty string.
     *
     * Other optional fields become NULL.
     */
    const preparedRecords = records.map(
      (record) => {
        const schoolName =
          cleanString(
            record.school_name
          );

        const schoolAddress =
          cleanString(
            record.school_address
          ) || null;

        const openingPeriod =
          cleanString(
            record.opening_period
          ) || null;

        const schoolTypeId =
          parseInteger(
            record.school_type_id
          );

        const allowedSchoolLevelId =
          parseInteger(
            record.allowed_school_level_id
          );

        const classToBeTaughtId =
          parseInteger(
            record.class_to_be_taught_id
          );

        return {
          schoolName,
          schoolAddress,
          openingPeriod,
          schoolTypeId,
          allowedSchoolLevelId,
          classToBeTaughtId,
        };
      }
    );

    /*
     * Insert all records inside one transaction.
     */
    const result =
      await prisma.$transaction(
        async (transaction) => {
          let imported = 0;

          for (
            const record of preparedRecords
          ) {
            await transaction.mOE.create({
              data: {
                schoolName:
                  record.schoolName,

                schoolAddress:
                  record.schoolAddress,

                openingPeriod:
                  record.openingPeriod,

                schoolTypeId:
                  record.schoolTypeId,

                allowedSchoolLevelId:
                  record.allowedSchoolLevelId,

                classToBeTaughtId:
                  record.classToBeTaughtId,
              },
            });

            imported++;
          }

          return imported;
        }
      );

    return NextResponse.json({
      success: true,
      message:
        "MOE data imported successfully.",
      count: result,
    });
  } catch (error) {
    console.error(
      "POST /api/moe/import error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to import MOE data.",
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}