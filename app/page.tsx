import Link from "next/link";

export default function Home() {
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
          <h1
            style={{
              marginTop: 0,
              marginBottom: "8px",
              fontSize: "32px",
            }}
          >
            School Record System
          </h1>

          <p
            style={{
              margin: 0,
              color: "#666",
              fontSize: "16px",
            }}
          >
            Manage and organize school information from
            different data sources.
          </p>
        </div>

        {/* Data Sources */}
        <div style={{ marginTop: "25px" }}>
          <h2
            style={{
              fontSize: "22px",
              marginBottom: "15px",
            }}
          >
            Data Sources
          </h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(260px, 1fr))",
              gap: "16px",
            }}
          >
            {/* MOE */}
            <div
              style={{
                background: "#ffffff",
                borderRadius: "12px",
                padding: "22px",
                border: "1px solid #e2e8f0",
                boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
              }}
            >
              <div
                style={{
                  fontSize: "14px",
                  color: "#64748b",
                  marginBottom: "8px",
                }}
              >
                SOURCE 01
              </div>

              <h3
                style={{
                  margin: "0 0 8px 0",
                  fontSize: "22px",
                }}
              >
                Ministry of Education
              </h3>

              <p
                style={{
                  color: "#666",
                  lineHeight: "1.5",
                  marginBottom: "18px",
                }}
              >
                Manage school data provided by the Ministry
                of Education.
              </p>

              <Link
                href="/moe"
                style={{
                  display: "inline-block",
                  padding: "10px 16px",
                  background: "#111",
                  color: "#fff",
                  textDecoration: "none",
                  borderRadius: "7px",
                  fontSize: "14px",
                }}
              >
                Open MOE
              </Link>
            </div>

            {/* Google Maps */}
            <div
              style={{
                background: "#ffffff",
                borderRadius: "12px",
                padding: "22px",
                border: "1px solid #e2e8f0",
                boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
              }}
            >
              <div
                style={{
                  fontSize: "14px",
                  color: "#64748b",
                  marginBottom: "8px",
                }}
              >
                SOURCE 02
              </div>

              <h3
                style={{
                  margin: "0 0 8px 0",
                  fontSize: "22px",
                }}
              >
                Google Maps
              </h3>

              <p
                style={{
                  color: "#666",
                  lineHeight: "1.5",
                  marginBottom: "18px",
                }}
              >
                Collect and manage school information
                from Google Maps.
              </p>

              <button
                type="button"
                disabled
                style={{
                  padding: "10px 16px",
                  background: "#e5e7eb",
                  color: "#6b7280",
                  border: "none",
                  borderRadius: "7px",
                  fontSize: "14px",
                  cursor: "not-allowed",
                }}
              >
                Coming Soon
              </button>
            </div>

            {/* Directories */}
            <div
              style={{
                background: "#ffffff",
                borderRadius: "12px",
                padding: "22px",
                border: "1px solid #e2e8f0",
                boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
              }}
            >
              <div
                style={{
                  fontSize: "14px",
                  color: "#64748b",
                  marginBottom: "8px",
                }}
              >
                SOURCE 03
              </div>

              <h3
                style={{
                  margin: "0 0 8px 0",
                  fontSize: "22px",
                }}
              >
                Directories
              </h3>

              <p
                style={{
                  color: "#666",
                  lineHeight: "1.5",
                  marginBottom: "18px",
                }}
              >
                Manage school information from Yangon
                Directory and Mandalay Directory.
              </p>

              <button
                type="button"
                disabled
                style={{
                  padding: "10px 16px",
                  background: "#e5e7eb",
                  color: "#6b7280",
                  border: "none",
                  borderRadius: "7px",
                  fontSize: "14px",
                  cursor: "not-allowed",
                }}
              >
                Coming Soon
              </button>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div style={{ marginTop: "35px" }}>
          <h2
            style={{
              fontSize: "22px",
              marginBottom: "15px",
            }}
          >
            Quick Actions
          </h2>

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "12px",
            }}
          >
            <Link
              href="/moe"
              style={{
                padding: "12px 18px",
                background: "#ffffff",
                color: "#111",
                textDecoration: "none",
                borderRadius: "8px",
                border: "1px solid #d1d5db",
              }}
            >
              MOE Dashboard
            </Link>

            <Link
              href="/moe/import"
              style={{
                padding: "12px 18px",
                background: "#111",
                color: "#fff",
                textDecoration: "none",
                borderRadius: "8px",
              }}
            >
              Import MOE Data
            </Link>

            <Link
              href="/moe/schools"
              style={{
                padding: "12px 18px",
                background: "#ffffff",
                color: "#111",
                textDecoration: "none",
                borderRadius: "8px",
                border: "1px solid #d1d5db",
              }}
            >
              View MOE Schools
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}