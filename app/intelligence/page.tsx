"use client"

import { useState, useEffect, useCallback } from "react"
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

const TIME_WINDOWS = [
  { label: "Last 7 days", days: 7 },
  { label: "Last 30 days", days: 30 },
  { label: "Last 90 days", days: 90 },
]

const PAGE_SIZE = 25

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

function formatPublishedDate(value: string | null): string {
  if (!value) return ""
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return ""
  return parsed.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
}

export default function IntelligencePage() {
  const { dark } = useTheme()
  const [days, setDays] = useState(7)
  const [activeFilter, setActiveFilter] = useState("all")
  const [items, setItems] = useState<IntelligenceItem[]>([])
  const [total, setTotal] = useState(0)
  const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [offset, setOffset] = useState(0)
  const [selectedItem, setSelectedItem] = useState<IntelligenceItem | null>(null)

  const bg = dark ? "#0D1B2A" : "#F9FAFB"
  const cardBg = dark ? "#111827" : "#FFFFFF"
  const border = dark ? "#1F2937" : "#E5E7EB"
  const textPrimary = dark ? "#F9FAFB" : "#0D1B2A"
  const textMuted = "#6B7280"

  const fetchItems = useCallback(
    async (nextOffset: number, append: boolean) => {
      if (append) setLoadingMore(true)
      else setLoading(true)

      try {
        const catConfig = CATEGORY_CONFIG[activeFilter]
        const params = new URLSearchParams({
          days: String(days),
          limit: String(PAGE_SIZE),
          offset: String(nextOffset),
        })
        if (catConfig.apiValue) params.set("category", catConfig.apiValue)

        const res = await apiFetch(`https://api.theformulator.ai/api/intelligence?${params.toString()}`)
        if (!res.ok) return

        const data = (await res.json()) as {
          count: number
          total: number
          items: IntelligenceItem[]
          category_counts: Record<string, number>
        }

        if (append) {
          setItems((prev) => [...prev, ...(data.items ?? [])])
        } else {
          setItems(data.items ?? [])
        }
        setTotal(data.total ?? 0)
        if (data.category_counts && !append) {
          setCategoryCounts(data.category_counts)
        }
        setOffset(nextOffset + (data.items?.length ?? 0))
      } finally {
        if (append) setLoadingMore(false)
        else setLoading(false)
      }
    },
    [activeFilter, days]
  )

  useEffect(() => {
    setOffset(0)
    void fetchItems(0, false)
  }, [fetchItems])

  const allCount = Object.values(categoryCounts).reduce((s, n) => s + n, 0)
  const hasMore = items.length < total

  return (
    <>
      <IntelligenceSidePanel item={selectedItem} onClose={() => setSelectedItem(null)} />

      <div style={{ backgroundColor: bg, minHeight: "100vh", padding: "32px 0" }}>
        <div style={{ maxWidth: 860, margin: "0 auto", padding: "0 24px" }}>
          {/* Page header */}
          <div style={{ marginBottom: 28 }}>
            <div style={{ fontSize: 24, fontWeight: 700, color: textPrimary, marginBottom: 6 }}>
              Intelligence Feed
            </div>
            <div style={{ fontSize: 14, color: textMuted }}>
              Market, regulatory, and scientific intelligence from 30+ sources
            </div>
          </div>

          {/* Filter bar */}
          <div
            style={{
              backgroundColor: cardBg,
              border: `1px solid ${border}`,
              borderRadius: 12,
              padding: "16px 20px",
              marginBottom: 20,
              display: "flex",
              flexDirection: "column" as const,
              gap: 12,
            }}
          >
            {/* Time window */}
            <div style={{ display: "flex", gap: 6 }}>
              {TIME_WINDOWS.map((w) => (
                <button
                  key={w.days}
                  onClick={() => {
                    setDays(w.days)
                    setOffset(0)
                  }}
                  style={{
                    fontSize: 12,
                    fontWeight: 500,
                    padding: "5px 12px",
                    borderRadius: 6,
                    border: `1px solid ${w.days === days ? "#D4A843" : border}`,
                    backgroundColor: w.days === days ? "#D4A843" : "transparent",
                    color: w.days === days ? "#0D1B2A" : textMuted,
                    cursor: "pointer",
                    transition: "all 0.1s",
                  }}
                >
                  {w.label}
                </button>
              ))}
            </div>

            {/* Category pills */}
            <div style={{ display: "flex", gap: 5, flexWrap: "wrap" as const }}>
              {Object.entries(CATEGORY_CONFIG).map(([key, config]) => {
                const count = key === "all" ? allCount : (categoryCounts[key] ?? 0)
                const isActive = activeFilter === key

                return (
                  <button
                    key={key}
                    onClick={() => {
                      setActiveFilter(key)
                      setOffset(0)
                    }}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 4,
                      backgroundColor: isActive ? config.bg : dark ? "#1F2937" : "#F3F4F6",
                      color: isActive ? "#FFFFFF" : textMuted,
                      border: `1px solid ${isActive ? config.bg : border}`,
                      borderRadius: 999,
                      padding: "3px 10px",
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
                        color: isActive ? "#FFFFFF" : textMuted,
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
          </div>

          {/* Count label */}
          {!loading && (
            <div style={{ fontSize: 12, color: textMuted, marginBottom: 12 }}>
              Showing {items.length} of {total} items
            </div>
          )}

          {/* Feed */}
          <div
            style={{
              backgroundColor: cardBg,
              border: `1px solid ${border}`,
              borderRadius: 12,
              overflow: "hidden",
            }}
          >
            {loading ? (
              <div style={{ padding: "20px", display: "flex", flexDirection: "column" as const, gap: 12 }}>
                {Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="animate-pulse"
                    style={{
                      height: 80,
                      backgroundColor: dark ? "#1F2937" : "#F3F4F6",
                      borderRadius: 8,
                    }}
                  />
                ))}
              </div>
            ) : items.length === 0 ? (
              <div style={{ padding: "32px 20px", textAlign: "center" as const, color: textMuted, fontSize: 14 }}>
                No items found for this filter.
              </div>
            ) : (
              items.map((item, index) => {
                const catConfig = CATEGORY_CONFIG[item.category] ?? CATEGORY_CONFIG.industry
                const relTime = formatRelativeTime(item.published_at)
                const pubDate = formatPublishedDate(item.published_at)
                const isLast = index === items.length - 1

                return (
                  <div
                    key={item.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => setSelectedItem(item)}
                    onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") setSelectedItem(item) }}
                    style={{
                      padding: "16px 20px",
                      borderBottom: isLast ? "none" : `1px solid ${border}`,
                      cursor: "pointer",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = dark ? "#0D1B2A" : "#F9FAFB"
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "transparent"
                    }}
                  >
                    {/* Category badge + title */}
                    <div style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 8 }}>
                      <span
                        style={{
                          backgroundColor: catConfig.bg,
                          color: "#FFFFFF",
                          fontSize: 9,
                          fontWeight: 700,
                          letterSpacing: "0.06em",
                          textTransform: "uppercase" as const,
                          borderRadius: 3,
                          padding: "3px 6px",
                          flexShrink: 0,
                          marginTop: 2,
                        }}
                      >
                        {catConfig.label}
                      </span>
                      <span
                        style={{
                          fontSize: 15,
                          fontWeight: 600,
                          color: textPrimary,
                          lineHeight: 1.4,
                        }}
                      >
                        {item.title}
                      </span>
                    </div>

                    {/* Summary */}
                    {item.summary && (
                      <div
                        style={{
                          fontSize: 13,
                          color: textMuted,
                          lineHeight: 1.6,
                          marginBottom: 10,
                          display: "-webkit-box",
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: "vertical" as const,
                          overflow: "hidden",
                        }}
                      >
                        {item.summary}
                      </div>
                    )}

                    {/* Meta row */}
                    <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 12, color: "#9CA3AF" }}>
                      <span style={{ fontWeight: 500 }}>{item.source}</span>
                      {pubDate && <><span>·</span><span>{pubDate}</span></>}
                      {relTime && <><span>·</span><span>{relTime}</span></>}
                      {item.source_url && (
                        <><span>·</span><span style={{ color: dark ? "#60A5FA" : "#1D4ED8" }}>View source ↗</span></>
                      )}
                    </div>
                  </div>
                )
              })
            )}
          </div>

          {/* Load more */}
          {!loading && hasMore && (
            <div style={{ marginTop: 16, textAlign: "center" as const }}>
              <button
                onClick={() => void fetchItems(offset, true)}
                disabled={loadingMore}
                style={{
                  backgroundColor: "transparent",
                  border: `1px solid ${border}`,
                  color: textMuted,
                  fontSize: 13,
                  fontWeight: 500,
                  padding: "10px 24px",
                  borderRadius: 8,
                  cursor: "pointer",
                  opacity: loadingMore ? 0.6 : 1,
                }}
              >
                {loadingMore ? "Loading…" : `Load more (${total - items.length} remaining)`}
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
