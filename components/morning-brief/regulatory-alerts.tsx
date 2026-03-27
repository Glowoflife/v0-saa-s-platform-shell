const alerts = [
  {
    title: "EU Annex II Amendment",
    body: "Butylphenyl Methylpropional restricted. Check 3 saved formulations.",
    tag: "HIGH",
    borderColor: "#991B1B",
    bgColor: "#FFF5F5",
    borderCardColor: "#FECACA",
    tagBg: "#991B1B",
  },
  {
    title: "CDSCO India Update",
    body: "New clinical evidence requirements for brightening claims effective May 2026.",
    tag: "MEDIUM",
    borderColor: "#B45309",
    bgColor: "#FFFBEB",
    borderCardColor: "#FDE68A",
    tagBg: "#B45309",
  },
]

export function RegulatoryAlerts() {
  return (
    <div style={{ marginBottom: 24 }}>
      <div
        style={{
          fontSize: 11,
          fontWeight: 500,
          letterSpacing: "0.05em",
          textTransform: "uppercase",
          color: "#6B7280",
          marginBottom: 12,
        }}
      >
        Regulatory Alerts
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {alerts.map((a) => (
          <div
            key={a.title}
            style={{
              backgroundColor: a.bgColor,
              border: `1px solid ${a.borderCardColor}`,
              borderLeft: `3px solid ${a.borderColor}`,
              borderRadius: 8,
              padding: 12,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                gap: 8,
              }}
            >
              <span style={{ fontSize: 13, fontWeight: 600, color: "#0D1B2A" }}>
                {a.title}
              </span>
              <span
                style={{
                  backgroundColor: a.tagBg,
                  color: "#FFFFFF",
                  fontSize: 10,
                  fontWeight: 600,
                  borderRadius: 4,
                  padding: "2px 6px",
                  flexShrink: 0,
                }}
              >
                {a.tag}
              </span>
            </div>
            <p
              style={{
                fontSize: 12,
                color: "#6B7280",
                marginTop: 4,
                lineHeight: 1.5,
              }}
            >
              {a.body}
            </p>
          </div>
        ))}
      </div>
      <a
        href="#"
        style={{
          display: "block",
          marginTop: 8,
          fontSize: 12,
          color: "#D4A843",
          textDecoration: "none",
        }}
      >
        View all regulatory alerts →
      </a>
    </div>
  )
}
