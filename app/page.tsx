"use client"

import { useTheme } from "@/components/theme-context"
import { StatRow } from "@/components/morning-brief/stat-row"
import { ActiveProjects } from "@/components/morning-brief/active-projects"
import { RegulatoryAlerts } from "@/components/morning-brief/regulatory-alerts"
import { IntelligenceFeed } from "@/components/morning-brief/intelligence-feed"

export default function Home() {
  const { dark } = useTheme()

  return (
    <div style={{ display: "flex", gap: 24, alignItems: "flex-start" }}>
      {/* Left column — 60% */}
      <div style={{ flex: "0 0 60%", minWidth: 0 }}>
        {/* Welcome header */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 20, fontWeight: 500, color: dark ? "#F9FAFB" : "#0D1B2A" }}>
            Good morning, Jeevan.
          </div>
          <div style={{ fontSize: 13, color: dark ? "#9CA3AF" : "#6B7280", marginTop: 4 }}>
            Friday, 27 March 2026 · 3 active projects · Alpha launch in 14 weeks
          </div>
        </div>

        {/* Stat row */}
        <StatRow />

        {/* Active projects */}
        <ActiveProjects />
      </div>

      {/* Right column — 40% */}
      <div style={{ flex: "0 0 calc(40% - 24px)", minWidth: 0 }}>
        <RegulatoryAlerts />
        <IntelligenceFeed />
      </div>
    </div>
  )
}
