"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useTheme } from "@/components/theme-context"
import { apiFetch } from "@/lib/api-client"
import { IntelligenceSidePanel } from "@/components/intelligence-side-panel"
import type { IntelligenceItem } from "@/components/morning-brief/types"

const CATEGORY_CONFIG: Record<string, { label: string; bg: string; apiValue: string }> = {
  all: { label: "ALL", bg: "#374151", apiValue: "" },
  regulatory: { label: "REG", bg: "#991B1B", apiValue: "regulatory" },
  science: { label: "SCIENCE", bg: "#1E40AF", apiValue: "science" },
  market: { label: "MARKET", bg: "#065F46", apiValue: "market" },
  ingredient: { label: "INGREDIENT", bg: "#B45309", apiValue: "ingredient" },
  industry: { label: "INDUSTRY", bg: "#4B5563", apiValue: "industry" },
  supply_chain: { label: "SUPPLY CHAIN", bg: "#6B21A8", apiValue: "supply_chain" },
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

export function IntelligenceFeed() {
  const { dark } = useTheme()
  const [activeFilter, setActiveFilter] = useState("all")
  const [items, setItems] = useState<IntelligenceItem[]>([])
  const [total, setTotal] = useState(0)
  const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)
  const [selectedItem, setSelectedItem] = useState<IntelligenceItem | null>(null)

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      try {
        const catConfig = CATEGORY_CONFIG[activeFilter]
        const params = new URLSearchParams({ days: "7", limit: "15" })
        if (catConfig.apiValue) params.set("category", catConfig.apiValue)

        const res = await apiFetch(`https://api.theformulator.ai/api/intelligence?${params.toString()}`)
        if (cancelled || !res.ok) return

        const data = (await res.json()) as {
          count: number
          total: number
          items: IntelligenceItem[]
          category_counts: Record<string, number>
        }

        if (!cancelled) {
          setItems(data.items ?? [])
          setTotal(data.total ?? 0)
          if (activeFilter === "all" && data.category_counts) {
            setCategoryCounts(data.category_counts)
          }
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [activeFilter])

  const uniqueSources = new Set(items.map((i) => i.source)).size
  const dividerColor = dark ? "#1F2937" : "#E5E7EB"
  const allCount = Object.values(categoryCounts).reduce((s, n) => s + n, 0)

  return (
    <>
      <IntelligenceSidePanel item={selectedItem} onClose={() => setSelectedItem(null)} />

      <div>
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
            LATEST INTELLIGENCE
          </span>
          {!loading && (
            <span style={{ fontSize: 11, color: "#9CA3AF" }}>
              {total} items in last 7 days · {uniqueSources} unique sources
            </span>
          )}
        </div>

        {/* Category filter pills */}
        <div style={{ display: "flex", gap: 5, flexWrap: "wrap" as const, marginBottom: 10 }}>
          {Object.entries(CATEGORY_CONFIG).map(([key, config]) => {
            const count = key === "all" ? allCount : (categoryCounts[key] ?? 0)
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
            minHeight: 80,
          }}
        >
          {loading ? (
            <div style={{ padding: "16px 14px", display: "flex", flexDirection: "column" as const, gap: 10 }}>
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="animate-pulse"
                  style={{
                    height: 48,
                    backgroundColor: dark ? "#1F2937" : "#F3F4F6",
                    borderRadius: 6,
                  }}
                />
              ))}
            </div>
          ) : items.length === 0 ? (
            <div style={{ padding: "16px 14px", fontSize: 13, color: "#6B7280" }}>
              No items in this category.
            </div>
          ) : (
            items.map((item, index) => {
              const catConfig = CATEGORY_CONFIG[item.category] ?? CATEGORY_CONFIG.industry
              const relTime = formatRelativeTime(item.published_at)
              const isLast = index === items.length - 1

              return (
                <div
                  key={item.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => setSelectedItem(item)}
                  onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") setSelectedItem(item) }}
                  style={{
                    padding: "10px 14px",
                    borderBottom: isLast ? "none" : `1px solid ${dividerColor}`,
                    cursor: "pointer",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = dark ? "#0D1B2A" : "#F9FAFB"
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "transparent"
                  }}
                >
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
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical" as const,
                        overflow: "hidden",
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
                </div>
              )
            })
          )}
        </div>

        {/* View all link */}
        {total > 15 && (
          <div style={{ marginTop: 8, textAlign: "right" as const }}>
            <Link
              href="/intelligence"
              style={{
                fontSize: 12,
                color: dark ? "#60A5FA" : "#1D4ED8",
                textDecoration: "none",
              }}
            >
              View all {total} items →
            </Link>
          </div>
        )}
      </div>
    </>
  )
}
