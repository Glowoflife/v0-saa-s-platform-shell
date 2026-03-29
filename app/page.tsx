"use client"

import Link from "next/link"
import { Zap } from "lucide-react"
import { useTheme } from "@/components/theme-context"
import { StatRow } from "@/components/morning-brief/stat-row"
import { ActiveProjects } from "@/components/morning-brief/active-projects"
import { RegulatoryAlerts } from "@/components/morning-brief/regulatory-alerts"
import { IntelligenceFeed } from "@/components/morning-brief/intelligence-feed"
import { WhitespaceSignal } from "@/components/morning-brief/whitespace-signal"

function getTodayDate(): string {
  const d = new Date()
  return d.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  })
}

export default function Home() {
  const { dark } = useTheme()

  return (
    <div>
      {/* Page header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 24,
        }}
      >
        {/* Left — greeting */}
        <div>
          <div
            style={{
              fontSize: 22,
              fontWeight: 700,
              color: dark ? "#FFFFFF" : "#0D1B2A",
            }}
          >
            Good morning, Jeevan.
          </div>
          <div
            style={{
              fontSize: 13,
              color: "#6B7280",
              marginTop: 3,
            }}
          >
            {getTodayDate()} · 3 active projects · 27 formulations
          </div>
        </div>

        {/* Right — credit pill + button */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              backgroundColor: dark ? "#111827" : "#FFFFFF",
              border: `1px solid ${dark ? "#1F2937" : "#E5E7EB"}`,
              borderRadius: 20,
              padding: "6px 12px",
            }}
          >
            <Zap size={14} style={{ color: "#D4A843" }} />
            <span
              style={{
                fontSize: 12,
                fontFamily: "var(--font-mono)",
                color: "#6B7280",
              }}
            >
              27 credits remaining
            </span>
          </div>
          <Link
            href="/new-formulation"
            style={{
              backgroundColor: "#D4A843",
              color: "#0D1B2A",
              fontSize: 13,
              fontWeight: 600,
              padding: "10px 18px",
              borderRadius: 8,
              textDecoration: "none",
            }}
          >
            New Formulation →
          </Link>
        </div>
      </div>

      {/* Section 1 — Your Work */}
      <div
        style={{
          fontSize: 11,
          fontWeight: 500,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: "#9CA3AF",
          marginBottom: 12,
        }}
      >
        YOUR WORK
      </div>

      <StatRow />
      <ActiveProjects />

      {/* Section 2 — Intelligence Feed */}
      <div
        style={{
          fontSize: 11,
          fontWeight: 500,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: "#9CA3AF",
          marginTop: 32,
          marginBottom: 12,
        }}
      >
        INTELLIGENCE FEED
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "65% 35%",
          gap: 20,
        }}
      >
        {/* Left column — feed items */}
        <IntelligenceFeed />

        {/* Right column — alerts + whitespace */}
        <div>
          <RegulatoryAlerts />
          <WhitespaceSignal />
        </div>
      </div>
    </div>
  )
}
