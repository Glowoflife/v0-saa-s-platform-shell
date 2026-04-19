"use client"

import { useEffect } from "react"
import { useTheme } from "@/components/theme-context"
import type { IntelligenceItem } from "@/components/morning-brief/types"

const CATEGORY_CONFIG: Record<string, { label: string; bg: string }> = {
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

function getRelevanceStyle(score: number): { bg: string; text: string } {
  if (score >= 8) return { bg: "#D1FAE5", text: "#065F46" }
  if (score >= 5) return { bg: "#FEF3C7", text: "#92400E" }
  return { bg: "#F3F4F6", text: "#6B7280" }
}

function Pill({ label, dark }: { label: string; dark: boolean }) {
  return (
    <span
      style={{
        fontSize: 11,
        color: dark ? "#9CA3AF" : "#6B7280",
        backgroundColor: dark ? "#1F2937" : "#F3F4F6",
        border: `1px solid ${dark ? "#374151" : "#E5E7EB"}`,
        borderRadius: 999,
        padding: "3px 10px",
        display: "inline-block",
      }}
    >
      {label}
    </span>
  )
}

export interface IntelligenceSidePanelProps {
  item: IntelligenceItem | null
  onClose: () => void
}

export function IntelligenceSidePanel({ item, onClose }: IntelligenceSidePanelProps) {
  const { dark } = useTheme()

  useEffect(() => {
    if (!item) return

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose()
    }

    document.addEventListener("keydown", handleKeyDown)
    document.body.style.overflow = "hidden"

    return () => {
      document.removeEventListener("keydown", handleKeyDown)
      document.body.style.overflow = ""
    }
  }, [item, onClose])

  if (!item) return null

  const catConfig = CATEGORY_CONFIG[item.category] ?? { label: "INDUSTRY", bg: "#4B5563" }
  const relTime = formatRelativeTime(item.published_at)
  const relevanceStyle = getRelevanceStyle(item.relevance_score)
  const hasAffectedInci = item.affected_inci.length > 0
  const hasAffectedMarkets = item.affected_markets.length > 0
  const hasTags = item.tags.length > 0
  const hasSourceUrl = typeof item.source_url === "string" && item.source_url.length > 0

  const panelBg = dark ? "#0D1B2A" : "#FFFFFF"
  const textPrimary = dark ? "#F9FAFB" : "#0D1B2A"
  const border = dark ? "#1F2937" : "#E5E7EB"

  const sectionLabel: React.CSSProperties = {
    fontSize: 10,
    fontWeight: 600,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    color: "#9CA3AF",
    marginBottom: 8,
    display: "block",
  }

  return (
    <>
      <style>{`
        @keyframes tf-slide-right {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
      `}</style>

      {/* Overlay */}
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          backgroundColor: "rgba(0,0,0,0.4)",
          zIndex: 200,
        }}
      />

      {/* Panel */}
      <div
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          bottom: 0,
          width: "min(480px, 100vw)",
          backgroundColor: panelBg,
          boxShadow: "-4px 0 32px rgba(0,0,0,0.18)",
          zIndex: 201,
          overflowY: "auto",
          animation: "tf-slide-right 0.2s ease-out",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Sticky header */}
        <div
          style={{
            padding: "20px 24px 16px",
            borderBottom: `1px solid ${border}`,
            position: "sticky",
            top: 0,
            backgroundColor: panelBg,
            zIndex: 1,
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
            <span
              style={{
                backgroundColor: catConfig.bg,
                color: "#FFFFFF",
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                borderRadius: 4,
                padding: "3px 8px",
              }}
            >
              {catConfig.label}
            </span>
            <button
              onClick={onClose}
              aria-label="Close panel"
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                fontSize: 22,
                color: "#9CA3AF",
                lineHeight: 1,
                padding: "0 4px",
                flexShrink: 0,
              }}
            >
              ×
            </button>
          </div>

          <div
            style={{
              fontSize: 22,
              fontWeight: 700,
              color: textPrimary,
              lineHeight: 1.35,
              marginTop: 12,
            }}
          >
            {item.title}
          </div>

          <div style={{ fontSize: 12, color: "#6B7280", marginTop: 6 }}>
            {item.source}
            {relTime ? ` · ${relTime}` : ""}
          </div>
        </div>

        {/* Scrollable body */}
        <div
          style={{
            padding: "20px 24px",
            flex: 1,
            display: "flex",
            flexDirection: "column",
            gap: 20,
          }}
        >
          {/* Summary */}
          <div
            style={{
              fontSize: 14,
              color: dark ? "#E5E7EB" : "#374151",
              lineHeight: 1.75,
            }}
          >
            {item.summary}
          </div>

          {/* Affected INCI */}
          {hasAffectedInci && (
            <div>
              <span style={sectionLabel}>AFFECTED INCI</span>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {item.affected_inci.map((inci) => (
                  <Pill key={inci} label={inci} dark={dark} />
                ))}
              </div>
            </div>
          )}

          {/* Markets */}
          {hasAffectedMarkets && (
            <div>
              <span style={sectionLabel}>MARKETS</span>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {item.affected_markets.map((mkt) => (
                  <Pill key={mkt} label={mkt} dark={dark} />
                ))}
              </div>
            </div>
          )}

          {/* Tags */}
          {hasTags && (
            <div>
              <span style={sectionLabel}>TAGS</span>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {item.tags.map((tag) => (
                  <Pill key={tag} label={tag} dark={dark} />
                ))}
              </div>
            </div>
          )}

          {/* Relevance */}
          <div>
            <span style={sectionLabel}>RELEVANCE</span>
            <span
              style={{
                fontSize: 12,
                fontWeight: 700,
                backgroundColor: relevanceStyle.bg,
                color: relevanceStyle.text,
                borderRadius: 999,
                padding: "4px 12px",
                display: "inline-block",
              }}
            >
              {item.relevance_score}/10
            </span>
          </div>
        </div>

        {/* Footer — source link */}
        {hasSourceUrl && (
          <div
            style={{
              padding: "16px 24px",
              borderTop: `1px solid ${border}`,
              flexShrink: 0,
            }}
          >
            <a
              href={item.source_url!}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                backgroundColor: "#D4A843",
                color: "#0D1B2A",
                fontSize: 13,
                fontWeight: 600,
                padding: "10px 20px",
                borderRadius: 8,
                textDecoration: "none",
              }}
            >
              Read full article ↗
            </a>
          </div>
        )}
      </div>
    </>
  )
}
