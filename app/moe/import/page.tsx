"use client";

import Link from "next/link";

export default function MoePage() {
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
          maxWidth: "1000px",
          margin: "0 auto",
        }}
      >
        {/* Header */}
        <div
          style={{
            background: "#ffffff",
            borderRadius: "12px",
            padding: "30px",
            boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
          }}
        >
          <div
            style={{
              marginBottom: "30px",
            }}
          >
            <Link
              href="/"
              style={{
                color: "#2563eb",
                textDecoration: "none",
                fontSize: "14px",
              }}
            >
              ← Home
            </Link>

            <h1
              style={{
                marginTop: "15px",
                marginBottom: "8px",
                fontSize: "30px",
              }}
            >
              MOE School Data
            </h1>

            <p
              style={{
                margin: 0,
                color: "#666",
                fontSize: "16px",
              }}
            >
              Ministry of Education school information
            </p>
          </div>

          {/* Source Information */}
          <div
            style={{
              padding: "20px",
              borderRadius: "10px",
              background: "#eff6ff",
              border: "1px solid #bfdbfe",
              marginBottom: "25px",
            }}
          >
            <div
              style={{
                fontSize: "13px",
                color: "#64748b",
                marginBottom: "6px",
              }}
            >
              DATA SOURCE
            </div>

            <div
              style={{
                fontSize: "20px",
                fontWeight: "bold",
              }}
            >
              Ministry of Education (MOE)
            </div>

            <div
              style={{
                marginTop: "6px",
                color: "#555",
              }}
            >
              Myanmar school data
            </div>
          </div>

          {/* Actions */}
          <h2
            style={{
              fontSize: "20px",
              marginBottom: "15px",
            }}
          >
            MOE Data
          </h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(220px, 1fr))",
              gap: "15px",
            }}
          >
            {/* Import */}
            <Link
              href="/moe/import"
              style={{
                textDecoration: "none",
                color: "inherit",
              }}
            >
              <div
                style={{
                  padding: "22px",
                  borderRadius: "10px",
                  background: "#ffffff",
                  border: "1px solid #e2e8f0",
                  cursor: "pointer",
                }}
              >
                <div
                  style={{
                    fontSize: "28px",
                    marginBottom: "10px",
                  }}
                >
                  📥
                </div>

                <div
                  style={{
                    fontSize: "18px",
                    fontWeight: "bold",
                    marginBottom: "6px",
                  }}
                >
                  Import Data
                </div>

                <div
                  style={{
                    color: "#64748b",
                    fontSize: "14px",
                  }}
                >
                  Import MOE data from CSV, XLSX, or JSON files.
                </div>
              </div>
            </Link>

            {/* Schools */}
            <Link
              href="/moe/schools"
              style={{
                textDecoration: "none",
                color: "inherit",
              }}
            >
              <div
                style={{
                  padding: "22px",
                  borderRadius: "10px",
                  background: "#ffffff",
                  border: "1px solid #e2e8f0",
                  cursor: "pointer",
                }}
              >
                <div
                  style={{
                    fontSize: "28px",
                    marginBottom: "10px",
                  }}
                >
                  🏫
                </div>

                <div
                  style={{
                    fontSize: "18px",
                    fontWeight: "bold",
                    marginBottom: "6px",
                  }}
                >
                  View Schools
                </div>

                <div
                  style={{
                    color: "#64748b",
                    fontSize: "14px",
                  }}
                >
                  View and search school records imported from MOE.
                </div>
              </div>
            </Link>
          </div>

          {/* Data Fields */}
          <div
            style={{
              marginTop: "30px",
            }}
          >
            <h2
              style={{
                fontSize: "20px",
                marginBottom: "15px",
              }}
            >
              MOE Data Information
            </h2>

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(200px, 1fr))",
                gap: "10px",
              }}
            >
              <InfoBox label="Region / State" />
              <InfoBox label="Township" />
              <InfoBox label="Private School Name" />
              <InfoBox label="Allowed School Level" />
              <InfoBox label="Class to Be Taught" />
              <InfoBox label="School Address" />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

function InfoBox({
  label,
}: {
  label: string;
}) {
  return (
    <div
      style={{
        padding: "14px",
        borderRadius: "8px",
        background: "#f8fafc",
        border: "1px solid #e2e8f0",
        fontSize: "14px",
        color: "#475569",
      }}
    >
      {label}
    </div>
  );
}