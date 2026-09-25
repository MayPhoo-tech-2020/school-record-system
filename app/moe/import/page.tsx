"use client";

import { ChangeEvent, useState } from "react";

type SheetResult = {
  sheetIndex: number;
  sheetName: string;
  sheetImported: number;
};

export default function MoeImportPage() {
  const [file, setFile] = useState<File | null>(null);

  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState("");
  const [percent, setPercent] = useState(0);

  const [totalSheets, setTotalSheets] = useState(0);
  const [currentSheet, setCurrentSheet] = useState(0);
  const [currentSheetName, setCurrentSheetName] = useState("");

  const [currentRecord, setCurrentRecord] = useState(0);
  const [currentSheetRecords, setCurrentSheetRecords] = useState(0);

  const [totalRecords, setTotalRecords] = useState(0);
  const [importedRecords, setImportedRecords] = useState(0);

  const [completedSheets, setCompletedSheets] = useState<
    SheetResult[]
  >([]);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const resetProgress = () => {
    setStatus("");
    setPercent(0);
    setTotalSheets(0);
    setCurrentSheet(0);
    setCurrentSheetName("");
    setCurrentRecord(0);
    setCurrentSheetRecords(0);
    setTotalRecords(0);
    setImportedRecords(0);
    setCompletedSheets([]);
    setError("");
    setSuccess(false);
  };

  const handleFileChange = (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    const selectedFile =
      event.target.files?.[0] ?? null;

    setFile(selectedFile);
    resetProgress();
  };

  const handleUpload = async () => {
    if (!file) {
      setError(
        "Please select a CSV, XLSX, or JSON file first."
      );
      return;
    }

    setUploading(true);
    resetProgress();
    setStatus("Uploading and preparing file...");

    try {
      const formData = new FormData();

      formData.append("file", file);

      const response = await fetch(
        "/api/moe/import",
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        const data = await response.json();

        throw new Error(
          data.message || "Upload failed."
        );
      }

      if (!response.body) {
        throw new Error(
          "The server did not return a progress stream."
        );
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      let buffer = "";

      while (true) {
        const { value, done } =
          await reader.read();

        if (done) {
          break;
        }

        buffer += decoder.decode(
          value,
          {
            stream: true,
          }
        );

        const lines = buffer.split("\n");

        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.trim()) {
            continue;
          }

          const data = JSON.parse(line);

          /*
           * Import started
           */
          if (data.type === "start") {
            setTotalSheets(data.totalSheets);
            setTotalRecords(data.totalRecords);

            setStatus(
              `Found ${data.totalSheets} sheet(s) and ${data.totalRecords.toLocaleString()} record(s).`
            );
          }

          /*
           * New sheet
           */
          else if (
            data.type === "sheet_start"
          ) {
            setCurrentSheet(
              data.sheetIndex
            );

            setTotalSheets(
              data.totalSheets
            );

            setCurrentSheetName(
              data.sheetName
            );

            setCurrentRecord(0);

            setCurrentSheetRecords(
              data.sheetRecords
            );

            setStatus(
              `Importing sheet ${data.sheetIndex} of ${data.totalSheets}: ${data.sheetName}`
            );
          }

          /*
           * Individual record progress
           */
          else if (
            data.type ===
            "record_progress"
          ) {
            setCurrentSheet(
              data.sheetIndex
            );

            setCurrentSheetName(
              data.sheetName
            );

            setCurrentRecord(
              data.currentRecord
            );

            setCurrentSheetRecords(
              data.sheetRecords
            );

            setImportedRecords(
              data.importedRecords
            );

            setTotalRecords(
              data.totalRecords
            );

            setPercent(data.percent);

            setStatus(
              `Importing ${data.sheetName} — ${data.currentRecord.toLocaleString()} / ${data.sheetRecords.toLocaleString()} records`
            );
          }

          /*
           * Sheet completed
           */
          else if (
            data.type ===
            "sheet_complete"
          ) {
            setCompletedSheets(
              (previous) => [
                ...previous,
                {
                  sheetIndex:
                    data.sheetIndex,
                  sheetName:
                    data.sheetName,
                  sheetImported:
                    data.sheetImported,
                },
              ]
            );

            setImportedRecords(
              data.importedRecords
            );

            setStatus(
              `✓ ${data.sheetName} completed — ${data.sheetImported.toLocaleString()} records imported`
            );
          }

          /*
           * All completed
           */
          else if (
            data.type === "complete"
          ) {
            setPercent(100);

            setImportedRecords(
              data.importedRecords
            );

            setTotalRecords(
              data.totalRecords
            );

            setTotalSheets(
              data.totalSheets
            );

            setSuccess(true);

            setStatus(
              "Import completed successfully."
            );
          }

          /*
           * Server error
           */
          else if (
            data.type === "error"
          ) {
            throw new Error(
              data.message ||
                "Import failed."
            );
          }
        }
      }
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Import failed."
      );

      setStatus("Import failed.");
    } finally {
      setUploading(false);
    }
  };

  const progressWidth = `${percent}%`;

  return (
    <main
      style={{
        minHeight: "100vh",
        padding: "40px 20px",
        background: "#f5f7fa",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div
        style={{
          maxWidth: "900px",
          margin: "0 auto",
        }}
      >
        {/* Header */}
        <div
          style={{
            marginBottom: "20px",
          }}
        >
          <a
            href="/moe"
            style={{
              color: "#2563eb",
              textDecoration: "none",
              fontSize: "14px",
            }}
          >
            ← Back to MOE
          </a>
        </div>

        <div
          style={{
            background: "#ffffff",
            borderRadius: "12px",
            padding: "30px",
            boxShadow:
              "0 2px 10px rgba(0,0,0,0.08)",
          }}
        >
          <h1
            style={{
              marginTop: 0,
              marginBottom: "8px",
              fontSize: "28px",
              color: "#111827",
            }}
          >
            MOE School Data Import
          </h1>

          <p
            style={{
              marginTop: 0,
              color: "#64748b",
              lineHeight: "1.5",
            }}
          >
            Upload CSV, XLSX, or JSON files.
            Excel files can contain one or
            multiple worksheets.
          </p>

          {/* File Input */}
          <div
            style={{
              marginTop: "25px",
            }}
          >
            <input
              type="file"
              accept=".csv,.xlsx,.json"
              onChange={handleFileChange}
              disabled={uploading}
            />
          </div>

          {/* Selected File */}
          {file && (
            <div
              style={{
                marginTop: "15px",
                padding: "12px",
                background: "#f1f5f9",
                borderRadius: "8px",
                color: "#334155",
              }}
            >
              <strong>
                Selected file:
              </strong>{" "}
              {file.name}
            </div>
          )}

          {/* Upload Button */}
          <button
            type="button"
            onClick={handleUpload}
            disabled={!file || uploading}
            style={{
              marginTop: "20px",
              padding: "12px 22px",
              border: "none",
              borderRadius: "8px",
              background:
                !file || uploading
                  ? "#aaa"
                  : "#111827",
              color: "#ffffff",
              cursor:
                !file || uploading
                  ? "not-allowed"
                  : "pointer",
              fontSize: "16px",
            }}
          >
            {uploading
              ? "Importing..."
              : "Upload & Import"}
          </button>

          {/* Progress */}
          {(uploading ||
            percent > 0 ||
            success) && (
            <div
              style={{
                marginTop: "30px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent:
                    "space-between",
                  marginBottom: "8px",
                }}
              >
                <strong>
                  Import Progress
                </strong>

                <strong>
                  {percent}%
                </strong>
              </div>

              <div
                style={{
                  width: "100%",
                  height: "18px",
                  background: "#e5e7eb",
                  borderRadius: "999px",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    width: progressWidth,
                    height: "100%",
                    background: "#2563eb",
                    transition:
                      "width 0.2s ease",
                  }}
                />
              </div>

              <p
                style={{
                  marginTop: "12px",
                  color: "#444",
                }}
              >
                {status}
              </p>
            </div>
          )}

          {/* Statistics */}
          {(totalSheets > 0 ||
            totalRecords > 0) && (
            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(180px, 1fr))",
                gap: "12px",
                marginTop: "25px",
              }}
            >
              <InfoBox
                label="Total Sheets"
                value={totalSheets}
              />

              <InfoBox
                label="Current Sheet"
                value={
                  totalSheets > 0
                    ? `${currentSheet} / ${totalSheets}`
                    : "-"
                }
              />

              <InfoBox
                label="Total Records"
                value={totalRecords.toLocaleString()}
              />

              <InfoBox
                label="Imported"
                value={importedRecords.toLocaleString()}
              />
            </div>
          )}

          {/* Current Sheet */}
          {currentSheetName && (
            <div
              style={{
                marginTop: "25px",
                padding: "18px",
                borderRadius: "8px",
                background: "#eff6ff",
                border:
                  "1px solid #bfdbfe",
              }}
            >
              <strong>
                Current Sheet
              </strong>

              <div
                style={{
                  marginTop: "6px",
                  fontSize: "18px",
                  color: "#111827",
                }}
              >
                {currentSheetName}
              </div>

              <div
                style={{
                  marginTop: "6px",
                  color: "#555",
                }}
              >
                Records:{" "}
                {currentRecord.toLocaleString()}{" "}
                /{" "}
                {currentSheetRecords.toLocaleString()}
              </div>
            </div>
          )}

          {/* Completed Sheets */}
          {completedSheets.length > 0 && (
            <div
              style={{
                marginTop: "25px",
              }}
            >
              <h2
                style={{
                  fontSize: "20px",
                }}
              >
                Sheet Progress
              </h2>

              <div>
                {completedSheets.map(
                  (sheet) => (
                    <div
                      key={
                        sheet.sheetIndex
                      }
                      style={{
                        display: "flex",
                        justifyContent:
                          "space-between",
                        alignItems:
                          "center",
                        padding:
                          "12px 15px",
                        marginBottom:
                          "8px",
                        borderRadius:
                          "8px",
                        background:
                          "#f0fdf4",
                        border:
                          "1px solid #bbf7d0",
                      }}
                    >
                      <span>
                        ✓{" "}
                        {sheet.sheetName}
                      </span>

                      <strong>
                        {sheet.sheetImported.toLocaleString()}{" "}
                        records
                      </strong>
                    </div>
                  )
                )}
              </div>
            </div>
          )}

          {/* Success */}
          {success && (
            <div
              style={{
                marginTop: "25px",
                padding: "18px",
                borderRadius: "8px",
                background: "#f0fdf4",
                border:
                  "1px solid #86efac",
                color: "#166534",
              }}
            >
              <strong>
                ✓ Import completed
                successfully
              </strong>

              <div
                style={{
                  marginTop: "8px",
                }}
              >
                Sheets processed:{" "}
                {totalSheets}
              </div>

              <div>
                Total records:{" "}
                {totalRecords.toLocaleString()}
              </div>

              <div>
                Successfully imported:{" "}
                {importedRecords.toLocaleString()}
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div
              style={{
                marginTop: "25px",
                padding: "18px",
                borderRadius: "8px",
                background: "#fef2f2",
                border:
                  "1px solid #fca5a5",
                color: "#991b1b",
              }}
            >
              <strong>
                ✕ Import failed
              </strong>

              <div
                style={{
                  marginTop: "8px",
                }}
              >
                {error}
              </div>

              {importedRecords > 0 && (
                <div
                  style={{
                    marginTop: "8px",
                  }}
                >
                  Records imported before
                  failure:{" "}
                  {importedRecords.toLocaleString()}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

function InfoBox({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div
      style={{
        padding: "16px",
        borderRadius: "8px",
        background: "#f8fafc",
        border: "1px solid #e2e8f0",
      }}
    >
      <div
        style={{
          fontSize: "13px",
          color: "#64748b",
          marginBottom: "5px",
        }}
      >
        {label}
      </div>

      <div
        style={{
          fontSize: "22px",
          fontWeight: "bold",
          color: "#111827",
        }}
      >
        {value}
      </div>
    </div>
  );
}