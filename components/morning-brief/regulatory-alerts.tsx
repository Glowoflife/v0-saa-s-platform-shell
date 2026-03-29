"use client"

import { useTheme } from "@/components/theme-context"

interface Alert {
  level: "action" | "monitor"
  heading: string
  body: string
  linkText: string
}

const alerts: Alert[] = [
  {
    level: "action",
    heading: "Kojic Acid — EU limit drops to 1%",
    body: "Affects Brightening Serum — Phase 1. Current draft uses 1.5%.",
    linkText: "Review formulation →",
  },
  {
    level: "monitor",
    heading: "TiO₂ nano — spray format ban",
    body: "No active projects affected. Future SPF sprays will need reformulation.",
    linkText: "Read update →",
  },
]

export function RegulatoryAlerts() {
  const { dark } = useTheme()

  return (
    <div
      style={{
        backgroundColor: dark ? "#111827" : "#FFFFFF",
        border: `1px solid ${dark ? "#7F1D1D" : "#FECACA"}`,
        borderRadius: 10,
        padding: "18px 20px",
      }}
    >
      <div
        style={{
          fontSize: 11,
          fontWeight: 500,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: "#991B1B",
          marginBottom: 12,
        }}
      >
        REGULATORY ALERTS
      </div>

      {alerts.map((alert, i) => (
        <div
          key={i}
          style={{
            paddingTop: i > 0 ? 12 : 0,
            paddingBottom: i < alerts.length - 1 ? 12 : 0,
            borderTop: i > 0 ? `1px solid ${dark ? "#1F2937" : "#F3F4F6"}` : "none",
          }}
        >
          {/* Level indicator */}
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                backgroundColor: alert.level === "action" ? "#EF4444" : "#F59E0B",
              }}
            />
            <span
              style={{
                fontSize: 11,
                fontWeight: 500,
                color: alert.level === "action" ? "#991B1B" : "#B45309",
              }}
            >
              {alert.level === "action" ? "Action required" : "Monitor"}
            </span>
          </div>

          {/* Heading */}
          <div
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: dark ? "#F9FAFB" : "#0D1B2A",
              marginTop: 6,
            }}
          >
            {alert.heading}
          </div>

          {/* Body */}
          <div
            style={{
              fontSize: 12,
              color: "#6B7280",
              marginTop: 4,
            }}
          >
            {alert.body}
          </div>

          {/* Link */}
          <a
            href="#"
            style={{
              display: "inline-block",
              fontSize: 11,
              color: "#D4A843",
              marginTop: 6,
              textDecoration: "none",
            }}
          >
            {alert.linkText}
          </a>
        </div>
      ))}
    </div>
  )
}
