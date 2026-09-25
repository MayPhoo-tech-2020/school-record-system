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

type SheetData = {
  name: string;
  records: ImportRecord[];
};

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

/*
 * Parse every worksheet dynamically.
 *
 * 1 sheet  -> 1 sheet
 * 2 sheets -> 2 sheets
 * 4 sheets -> 4 sheets
 * etc.
 */
function parseXLSX(
  buffer: ArrayBuffer
): SheetData[] {
  const workbook = XLSX.read(buffer, {
    type: "array",
  });

  if (workbook.SheetNames.length === 0) {
    throw new Error(
      "Excel file does not contain any worksheets."
    );
  }

  const sheets: SheetData[] = [];

  for (const sheetName of workbook.SheetNames) {
    const worksheet =
      workbook.Sheets[sheetName];

    if (!worksheet) {
      continue;
    }

    const rows =
      XLSX.utils.sheet_to_json<ImportRecord>(
        worksheet,
        {
          defval: "",
        }
      );

    if (rows.length === 0) {
      continue;
    }

    const records: ImportRecord[] = rows.map(
      (row) => {
        const record: ImportRecord = {};

        Object.entries(row).forEach(
          ([key, value]) => {
            record[normalizeHeader(key)] =
              value;
          }
        );

        return record;
      }
    );

    sheets.push({
      name: sheetName,
      records,
    });
  }

  return sheets;
}

function prepareRecord(
  record: ImportRecord
) {
  const schoolName = cleanString(
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

function createProgressStream(
  sheets: SheetData[]
): ReadableStream<Uint8Array> {
  const encoder =
    new TextEncoder();

  return new ReadableStream<Uint8Array>({
    async start(controller) {
      const send = (data: unknown) => {
        controller.enqueue(
          encoder.encode(
            JSON.stringify(data) + "\n"
          )
        );
      };

      let totalRecords = 0;

      sheets.forEach((sheet) => {
        totalRecords +=
          sheet.records.length;
      });

      let importedRecords = 0;

      send({
        type: "start",
        totalSheets: sheets.length,
        totalRecords,
      });

      try {
        for (
          let sheetIndex = 0;
          sheetIndex < sheets.length;
          sheetIndex++
        ) {
          const sheet =
            sheets[sheetIndex];

          send({
            type: "sheet_start",
            sheetIndex: sheetIndex + 1,
            totalSheets: sheets.length,
            sheetName: sheet.name,
            sheetRecords:
              sheet.records.length,
          });

          let sheetImported = 0;

          for (
            let recordIndex = 0;
            recordIndex <
            sheet.records.length;
            recordIndex++
          ) {
            const record =
              sheet.records[recordIndex];

            const prepared =
              prepareRecord(record);

            await prisma.mOE.create({
              data: {
                schoolName:
                  prepared.schoolName,

                schoolAddress:
                  prepared.schoolAddress,

                openingPeriod:
                  prepared.openingPeriod,

                schoolTypeId:
                  prepared.schoolTypeId,

                allowedSchoolLevelId:
                  prepared.allowedSchoolLevelId,

                classToBeTaughtId:
                  prepared.classToBeTaughtId,
              },
            });

            importedRecords++;
            sheetImported++;

            const percent =
              totalRecords > 0
                ? Math.round(
                    (importedRecords /
                      totalRecords) *
                      100
                  )
                : 100;

            send({
              type: "record_progress",
              sheetIndex:
                sheetIndex + 1,
              totalSheets:
                sheets.length,
              sheetName: sheet.name,
              currentRecord:
                recordIndex + 1,
              sheetRecords:
                sheet.records.length,
              importedRecords,
              totalRecords,
              percent,
            });
          }

          send({
            type: "sheet_complete",
            sheetIndex:
              sheetIndex + 1,
            totalSheets:
              sheets.length,
            sheetName: sheet.name,
            sheetImported,
            importedRecords,
            totalRecords,
          });
        }

        send({
          type: "complete",
          totalSheets: sheets.length,
          totalRecords,
          importedRecords,
        });

        controller.close();
      } catch (error) {
        console.error(
          "MOE import stream error:",
          error
        );

        send({
          type: "error",
          message:
            error instanceof Error
              ? error.message
              : "Failed to import MOE data.",
          importedRecords,
          totalRecords,
        });

        controller.close();
      } finally {
        await prisma.$disconnect();
      }
    },
  });
}

export async function POST(
  request: Request
) {
  try {
    const formData =
      await request.formData();

    const file =
      formData.get("file");

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

    const fileName =
      file.name.toLowerCase();

    let sheets: SheetData[] = [];

    /*
     * CSV
     */
    if (fileName.endsWith(".csv")) {
      const text =
        await file.text();

      const records =
        parseCSV(text);

      sheets = [
        {
          name: "CSV",
          records,
        },
      ];
    }

    /*
     * JSON
     */
    else if (
      fileName.endsWith(".json")
    ) {
      const text =
        await file.text();

      const records =
        parseJSON(text);

      sheets = [
        {
          name: "JSON",
          records,
        },
      ];
    }

    /*
     * XLSX
     *
     * All worksheets are processed.
     */
    else if (
      fileName.endsWith(".xlsx")
    ) {
      const buffer =
        await file.arrayBuffer();

      sheets =
        parseXLSX(buffer);
    }

    /*
     * Unsupported
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

    if (sheets.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message:
            "The uploaded file contains no data.",
        },
        { status: 400 }
      );
    }

    const totalRecords =
      sheets.reduce(
        (total, sheet) =>
          total + sheet.records.length,
        0
      );

    if (totalRecords === 0) {
      return NextResponse.json(
        {
          success: false,
          message:
            "The uploaded file contains no records.",
        },
        { status: 400 }
      );
    }

    return new Response(
      createProgressStream(sheets),
      {
        status: 200,
        headers: {
          "Content-Type":
            "application/x-ndjson; charset=utf-8",
          "Cache-Control":
            "no-cache, no-transform",
          Connection: "keep-alive",
        },
      }
    );
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
  }
}
