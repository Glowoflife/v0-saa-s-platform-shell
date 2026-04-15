"use client"

import { useTheme } from "@/components/theme-context"
import type { MorningBriefStats } from "@/components/morning-brief/types"

function getMarketSummary(marketsMonitored: string[]) {
  if (marketsMonitored.length === 0) {
    return "No markets configured"
  }

  if (marketsMonitored.length <= 3) {
    return marketsMonitored.join(" · ")
  }

  return `${marketsMonitored.slice(0, 3).join(" · ")} + ${marketsMonitored.length - 3} more`
}

interface StatRowProps {
  stats: MorningBriefStats
  marketsMonitored: string[]
}

export function StatRow({ stats, marketsMonitored }: StatRowProps) {
  const { dark } = useTheme()

  const cards = [
    {
      label: "FORMULATIONS",
      value: String(stats.formulations),
      sub: `${stats.recent_formulations_7d} in last 7 days`,
      isAlert: false,
    },
    {
      label: "CREDITS",
      value: String(stats.credits_remaining),
      sub: "Available now",
      isAlert: false,
    },
    {
      label: "REGULATORY ALERTS",
      value: String(stats.regulatory_alerts),
      sub: stats.critical_alerts > 0
        ? `${stats.critical_alerts} critical alerts`
        : stats.material_alerts > 0
          ? `${stats.material_alerts} material alerts`
          : "No critical alerts",
      isAlert: stats.critical_alerts > 0,
    },
    {
      label: "MARKETS",
      value: String(stats.markets_monitored),
      sub: getMarketSummary(marketsMonitored),
      isAlert: false,
      isMono: true,
    },
  ]

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        gap: 12,
      }}
    >
      {cards.map((card) => (
        <div
          key={card.label}
          style={{
            backgroundColor: card.isAlert
              ? dark ? "#1C0A0A" : "#FFF5F5"
              : dark ? "#111827" : "#FFFFFF",
            border: `1px solid ${card.isAlert
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
              color: card.isAlert ? "#991B1B" : dark ? "#F9FAFB" : "#0D1B2A",
              lineHeight: 1,
            }}
          >
            {card.value}
          </div>
          <div
            style={{
              fontSize: 10,
              fontWeight: 500,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: card.isAlert ? "#991B1B" : "#9CA3AF",
              marginTop: 4,
            }}
          >
            {card.label}
          </div>
          <div
            style={{
              fontSize: 11,
              color: card.isAlert ? "#991B1B" : "#6B7280",
              marginTop: 2,
              fontFamily: card.isMono ? "var(--font-mono)" : "inherit",
            }}
          >
            {card.sub}
          </div>
        </div>
      ))}
    </div>
  )
}
