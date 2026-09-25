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
          maxWidth: "1100px",
          margin: "0 auto",
        }}
      >
        {/* Header */}
        <div style={{ marginBottom: "30px" }}>
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
              fontSize: "32px",
              color: "#111827",
            }}
          >
            MOE School Data
          </h1>

          <p
            style={{
              margin: 0,
              color: "#64748b",
              fontSize: "16px",
            }}
          >
            Ministry of Education school information
          </p>
        </div>

        {/* Source Card */}
        <div
          style={{
            background: "#ffffff",
            borderRadius: "12px",
            padding: "24px",
            marginBottom: "25px",
            border: "1px solid #e2e8f0",
            boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
          }}
        >
          <div
            style={{
              fontSize: "13px",
              fontWeight: "bold",
              color: "#64748b",
              marginBottom: "8px",
            }}
          >
            DATA SOURCE
          </div>

          <div
            style={{
              fontSize: "21px",
              fontWeight: "bold",
              color: "#111827",
            }}
          >
            Ministry of Education (MOE)
          </div>

          <div
            style={{
              marginTop: "6px",
              color: "#64748b",
            }}
          >
            Myanmar school information
          </div>
        </div>

        {/* Main Actions */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(300px, 1fr))",
            gap: "20px",
            marginBottom: "30px",
          }}
        >
          {/* Import Data */}
          <Link
            href="/moe/import"
            style={{
              textDecoration: "none",
              color: "inherit",
            }}
          >
            <div
              style={{
                background: "#ffffff",
                borderRadius: "12px",
                padding: "25px",
                border: "1px solid #e2e8f0",
                boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                height: "100%",
                boxSizing: "border-box",
              }}
            >
              <div
                style={{
                  fontSize: "32px",
                  marginBottom: "15px",
                }}
              >
                📥
              </div>

              <h2
                style={{
                  margin: "0 0 8px",
                  fontSize: "20px",
                  color: "#111827",
                }}
              >
                Import MOE Data
              </h2>

              <p
                style={{
                  margin: "0 0 18px",
                  color: "#64748b",
                  lineHeight: "1.5",
                }}
              >
                Import school data from CSV, XLSX, or JSON
                files. Excel files can contain multiple
                worksheets.
              </p>

              <div
                style={{
                  color: "#2563eb",
                  fontWeight: "bold",
                  fontSize: "14px",
                }}
              >
                Open Import →
              </div>
            </div>
          </Link>

          {/* View Schools */}
          <Link
            href="/moe/schools"
            style={{
              textDecoration: "none",
              color: "inherit",
            }}
          >
            <div
              style={{
                background: "#ffffff",
                borderRadius: "12px",
                padding: "25px",
                border: "1px solid #e2e8f0",
                boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                height: "100%",
                boxSizing: "border-box",
              }}
            >
              <div
                style={{
                  fontSize: "32px",
                  marginBottom: "15px",
                }}
              >
                🏫
              </div>

              <h2
                style={{
                  margin: "0 0 8px",
                  fontSize: "20px",
                  color: "#111827",
                }}
              >
                View MOE Schools
              </h2>

              <p
                style={{
                  margin: "0 0 18px",
                  color: "#64748b",
                  lineHeight: "1.5",
                }}
              >
                View, search, and manage school records
                imported from the Ministry of Education.
              </p>

              <div
                style={{
                  color: "#2563eb",
                  fontWeight: "bold",
                  fontSize: "14px",
                }}
              >
                View Schools →
              </div>
            </div>
          </Link>
        </div>

        {/* Data Structure */}
        <div
          style={{
            background: "#ffffff",
            borderRadius: "12px",
            padding: "25px",
            border: "1px solid #e2e8f0",
            boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
          }}
        >
          <h2
            style={{
              marginTop: 0,
              marginBottom: "8px",
              fontSize: "21px",
              color: "#111827",
            }}
          >
            MOE School Data
          </h2>

          <p
            style={{
              marginTop: 0,
              marginBottom: "20px",
              color: "#64748b",
            }}
          >
            Information currently recorded from the MOE
            source.
          </p>

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(220px, 1fr))",
              gap: "12px",
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
        padding: "16px",
        borderRadius: "8px",
        background: "#f8fafc",
        border: "1px solid #e2e8f0",
        color: "#475569",
        fontSize: "14px",
      }}
    >
      {label}
    </div>
  );
}