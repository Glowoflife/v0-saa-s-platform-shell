"use client"

import { useState } from "react"
import { useTheme } from "@/components/theme-context"
import type { IntelligenceItem, IntelligenceStats } from "@/components/morning-brief/types"

const CATEGORY_CONFIG: Record<string, { label: string; bg: string }> = {
  all: { label: "ALL", bg: "#374151" },
  regulatory: { label: "REG", bg: "#991B1B" },
  science: { label: "SCIENCE", bg: "#1E40AF" },
  market: { label: "MARKET", bg: "#065F46" },
  ingredient: { label: "INGREDIENT", bg: "#B45309" },
  industry: { label: "INDUSTRY", bg: "#4B5563" },
  supply_chain: { label: "SUPPLY CHAIN", bg: "#6B21A8" },
}

function formatRelativeTime(value: string | null): string {
  if (!value) return ""
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return ""

  const diffMs = parsed.getTime() - Date.now()
  const diffMinutes = Math.round(diffMs / 60000)
  const fmt = new Intl.RelativeTimeFormat("en", { numeric: "auto" })

  if (Math.abs(diffMinutes) < 60) return fmt.format(diffMinutes, "minute")
  const diffHours = Math.round(diffMinutes / 60)
  if (Math.abs(diffHours) < 24) return fmt.format(diffHours, "hour")
  const diffDays = Math.round(diffHours / 24)
  if (Math.abs(diffDays) < 30) return fmt.format(diffDays, "day")
  return fmt.format(Math.round(diffDays / 30), "month")
}

interface IntelligenceFeedProps {
  intelligence_items: IntelligenceItem[]
  intelligence_stats: IntelligenceStats
}

export function IntelligenceFeed({ intelligence_items, intelligence_stats }: IntelligenceFeedProps) {
  const { dark } = useTheme()
  const [activeFilter, setActiveFilter] = useState("all")

  const filtered =
    activeFilter === "all"
      ? intelligence_items
      : intelligence_items.filter((item) => item.category === activeFilter)

  const displayed = filtered.slice(0, 15)

  const categoryCounts = intelligence_items.reduce<Record<string, number>>((acc, item) => {
    acc[item.category] = (acc[item.category] ?? 0) + 1
    return acc
  }, {})

  const dividerColor = dark ? "#1F2937" : "#E5E7EB"

  return (
    <div style={{ marginTop: 16 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 10 }}>
        <span
          style={{
            fontSize: 11,
            fontWeight: 500,
            letterSpacing: "0.05em",
            textTransform: "uppercase" as const,
            color: "#6B7280",
          }}
        >
          TODAY&apos;S INTELLIGENCE
        </span>
        <span style={{ fontSize: 11, color: "#9CA3AF" }}>
          {intelligence_stats.items_this_week} items this week · {intelligence_stats.unique_sources} sources
        </span>
      </div>

      {/* Category filter pills */}
      <div style={{ display: "flex", gap: 5, flexWrap: "wrap" as const, marginBottom: 10 }}>
        {Object.entries(CATEGORY_CONFIG).map(([key, config]) => {
          const count = key === "all" ? intelligence_items.length : (categoryCounts[key] ?? 0)
          const isActive = activeFilter === key

          return (
            <button
              key={key}
              onClick={() => setActiveFilter(key)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
                backgroundColor: isActive ? config.bg : dark ? "#1F2937" : "#F3F4F6",
                color: isActive ? "#FFFFFF" : dark ? "#9CA3AF" : "#6B7280",
                border: `1px solid ${isActive ? config.bg : dark ? "#374151" : "#E5E7EB"}`,
                borderRadius: 999,
                padding: "3px 8px",
                fontSize: 10,
                fontWeight: 600,
                letterSpacing: "0.04em",
                textTransform: "uppercase" as const,
                cursor: "pointer",
                transition: "all 0.1s",
              }}
            >
              {config.label}
              <span
                style={{
                  backgroundColor: isActive ? "rgba(255,255,255,0.2)" : dark ? "#374151" : "#E5E7EB",
                  color: isActive ? "#FFFFFF" : dark ? "#9CA3AF" : "#6B7280",
                  borderRadius: 999,
                  padding: "0 5px",
                  fontSize: 9,
                  fontWeight: 700,
                  lineHeight: "16px",
                }}
              >
                {count}
              </span>
            </button>
          )
        })}
      </div>

      {/* Items list */}
      <div
        style={{
          border: `1px solid ${dividerColor}`,
          borderRadius: 10,
          overflow: "hidden",
          backgroundColor: dark ? "#111827" : "#FFFFFF",
        }}
      >
        {displayed.length === 0 ? (
          <div style={{ padding: "16px 14px", fontSize: 13, color: "#6B7280" }}>
            No items in this category.
          </div>
        ) : (
          displayed.map((item, index) => {
            const catConfig = CATEGORY_CONFIG[item.category] ?? CATEGORY_CONFIG.industry
            const relTime = formatRelativeTime(item.published_at)
            const isLast = index === displayed.length - 1

            const inner = (
              <>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 4 }}>
                  <span
                    style={{
                      backgroundColor: catConfig.bg,
                      color: "#FFFFFF",
                      fontSize: 9,
                      fontWeight: 700,
                      letterSpacing: "0.06em",
                      textTransform: "uppercase" as const,
                      borderRadius: 3,
                      padding: "2px 5px",
                      flexShrink: 0,
                      marginTop: 1,
                    }}
                  >
                    {catConfig.label}
                  </span>
                  <span
                    style={{
                      fontSize: 13,
                      fontWeight: 500,
                      color: dark ? "#F9FAFB" : "#0D1B2A",
                      lineHeight: 1.4,
                    }}
                  >
                    {item.title}
                  </span>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 12 }}>
                  <div
                    style={{
                      fontSize: 12,
                      color: "#6B7280",
                      lineHeight: 1.5,
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical" as const,
                      overflow: "hidden",
                      flex: 1,
                    }}
                  >
                    {item.summary}
                  </div>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column" as const,
                      alignItems: "flex-end",
                      gap: 2,
                      flexShrink: 0,
                    }}
                  >
                    <span style={{ fontSize: 11, color: "#9CA3AF" }}>{item.source}</span>
                    {relTime && <span style={{ fontSize: 11, color: "#9CA3AF" }}>{relTime}</span>}
                  </div>
                </div>
              </>
            )

            const rowStyle = {
              padding: "10px 14px",
              borderBottom: isLast ? "none" : `1px solid ${dividerColor}`,
              display: "block",
              color: "inherit",
              textDecoration: "none",
            }

            if (item.source_url) {
              return (
                <a
                  key={item.id}
                  href={item.source_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ ...rowStyle, cursor: "pointer" }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = dark ? "#0D1B2A" : "#F9FAFB"
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "transparent"
                  }}
                >
                  {inner}
                </a>
              )
            }

            return (
              <div key={item.id} style={rowStyle}>
                {inner}
              </div>
            )
          })
        )}
      </div>

      {/* View all link */}
      {intelligence_stats.total_items > 15 && (
        <div style={{ marginTop: 8, textAlign: "right" as const }}>
          <span
            style={{
              fontSize: 12,
              color: dark ? "#60A5FA" : "#1D4ED8",
              cursor: "pointer",
            }}
          >
            View all {intelligence_stats.total_items} items →
          </span>
        </div>
      )}
    </div>
  )
}
