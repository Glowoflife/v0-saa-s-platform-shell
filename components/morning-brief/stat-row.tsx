"use client"

import { useTheme } from "@/components/theme-context"

const stats = [
  {
    label: "FORMULATIONS",
    value: "27",
    sub: "4 this week",
    isAlert: false,
  },
  {
    label: "ACTIVE PROJECTS",
    value: "3",
    sub: "2 due this month",
    isAlert: false,
  },
  {
    label: "REGULATORY ALERTS",
    value: "2",
    sub: "Requires review",
    isAlert: true,
  },
  {
    label: "MARKETS TRACKED",
    value: "9",
    sub: "EU · UK · US + 6 more",
    isAlert: false,
    isMono: true,
  },
]

export function StatRow() {
  const { dark } = useTheme()

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        gap: 12,
      }}
    >
      {stats.map((s) => (
        <div
          key={s.label}
          style={{
            backgroundColor: s.isAlert
              ? dark ? "#1C0A0A" : "#FFF5F5"
              : dark ? "#111827" : "#FFFFFF",
            border: `1px solid ${s.isAlert
              ? dark ? "#7F1D1D" : "#FECACA"
              : dark ? "#1F2937" : "#E5E7EB"}`,
            borderRadius: 10,
            padding: "16px 20px",
          }}
        >
          <div
            style={{
              fontSize: 28,
              fontWeight: 700,
              color: s.isAlert ? "#991B1B" : dark ? "#F9FAFB" : "#0D1B2A",
              lineHeight: 1,
            }}
          >
            {s.value}
          </div>
          <div
            style={{
              fontSize: 10,
              fontWeight: 500,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: s.isAlert ? "#991B1B" : "#9CA3AF",
              marginTop: 4,
            }}
          >
            {s.label}
          </div>
          <div
            style={{
              fontSize: 11,
              color: s.isAlert ? "#991B1B" : "#6B7280",
              marginTop: 2,
              fontFamily: s.isMono ? "var(--font-mono)" : "inherit",
            }}
          >
            {s.sub}
          </div>
        </div>
      ))}
    </div>
  )
}
