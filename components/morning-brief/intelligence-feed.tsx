"use client"

import { useTheme } from "@/components/theme-context"

type FeedType = "REG" | "TREND" | "WHITESPACE" | "SCIENCE"

interface FeedItem {
  type: FeedType
  date: string
  heading: string
  body: string
  markets?: string[]
  readMore?: boolean
}

const TYPE_STYLES: Record<FeedType, { borderLeft: string; pillBg: string; pillText: string }> = {
  REG: { borderLeft: "#991B1B", pillBg: "#FEE2E2", pillText: "#991B1B" },
  TREND: { borderLeft: "#1D4ED8", pillBg: "#DBEAFE", pillText: "#1D4ED8" },
  WHITESPACE: { borderLeft: "#065F46", pillBg: "#D1FAE5", pillText: "#065F46" },
  SCIENCE: { borderLeft: "#6D28D9", pillBg: "#EDE9FE", pillText: "#6D28D9" },
}

const feedItems: FeedItem[] = [
  {
    type: "REG",
    date: "Mar 29 2026",
    heading: "EU Commission limits Titanium Dioxide in leave-on cosmetics",
    body: "Regulation (EU) 2024/1234 restricts TiO₂ (nano) to 0% in sprayable leave-on formats effective June 2025. Non-nano TiO₂ in non-spray leave-on products remains permitted at current levels.",
    markets: ["EU", "UK"],
    readMore: true,
  },
  {
    type: "TREND",
    date: "Mar 28 2026",
    heading: "Polyglutamic Acid rising in Asia-Pacific hydration serums",
    body: "PGA appears in 847 products added to the corpus in Q1 2026, up 34% from Q1 2025. Co-occurrence with Sodium Hyaluronate in 91% of cases — increasingly positioned as a hyaluronate complement rather than alternative.",
    markets: ["KR", "JP", "CN"],
  },
  {
    type: "WHITESPACE",
    date: "Mar 27 2026",
    heading: "Bakuchiol + Azelaic Acid combination underserved in EU market",
    body: "Only 12 of 38,400 EU leave-on products in the corpus combine Bakuchiol with Azelaic Acid. Both ingredients are EU-permitted with no concentration conflict. Strong white space for a retinol-alternative + brightening positioning.",
    markets: ["EU", "UK"],
    readMore: true,
  },
  {
    type: "REG",
    date: "Mar 25 2026",
    heading: "SCCS finalises opinion on Kojic Acid — face products restricted to 1%",
    body: "SCCS/1234/24 restricts Kojic Acid to 1% in face care (down from 2%). Body care remains at 0.7%. EU implementation expected Q3 2026. Affects 2 formulations in your active projects.",
    markets: ["EU", "UK", "AU"],
    readMore: true,
  },
  {
    type: "TREND",
    date: "Mar 24 2026",
    heading: "Squalane replacing Cyclopentasiloxane in Indian premium serums",
    body: "Following India's 2025 guidance on silicone accumulation in wastewater, 23% of premium Indian serum launches in Q4 2025 substituted Cyclopentasiloxane with Squalane or Hemisqualane. Trend accelerating in Q1 2026.",
    markets: ["IN"],
  },
]

function FeedCard({ item, dark }: { item: FeedItem; dark: boolean }) {
  const style = TYPE_STYLES[item.type]

  return (
    <div
      style={{
        backgroundColor: dark ? "#111827" : "#FFFFFF",
        border: `1px solid ${dark ? "#1F2937" : "#E5E7EB"}`,
        borderLeft: `3px solid ${style.borderLeft}`,
        borderRadius: 10,
        padding: "16px 20px",
      }}
    >
      {/* Top row — type pill + date */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span
          style={{
            backgroundColor: style.pillBg,
            color: style.pillText,
            fontSize: 10,
            fontWeight: 600,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            borderRadius: 4,
            padding: "2px 8px",
          }}
        >
          {item.type}
        </span>
        <span
          style={{
            fontSize: 11,
            color: "#9CA3AF",
            fontFamily: "var(--font-mono)",
          }}
        >
          {item.date}
        </span>
      </div>

      {/* Heading */}
      <div
        style={{
          fontSize: 13,
          fontWeight: 600,
          color: dark ? "#F9FAFB" : "#0D1B2A",
          marginTop: 8,
        }}
      >
        {item.heading}
      </div>

      {/* Body */}
      <div
        style={{
          fontSize: 12,
          color: "#6B7280",
          lineHeight: 1.6,
          marginTop: 4,
        }}
      >
        {item.body}
      </div>

      {/* Market tags */}
      {item.markets && item.markets.length > 0 && (
        <div style={{ display: "flex", gap: 6, marginTop: 10 }}>
          {item.markets.map((m) => (
            <span
              key={m}
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 10,
                color: dark ? "#9CA3AF" : "#6B7280",
                backgroundColor: dark ? "#1F2937" : "#F9FAFB",
                border: `1px solid ${dark ? "#374151" : "#E5E7EB"}`,
                borderRadius: 4,
                padding: "2px 6px",
              }}
            >
              {m}
            </span>
          ))}
        </div>
      )}

      {/* Read more link */}
      {item.readMore && (
        <a
          href="#"
          style={{
            display: "inline-block",
            fontSize: 11,
            color: "#D4A843",
            marginTop: 8,
            textDecoration: "none",
          }}
        >
          Read more →
        </a>
      )}
    </div>
  )
}

export function IntelligenceFeed() {
  const { dark } = useTheme()

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {feedItems.map((item, i) => (
        <FeedCard key={i} item={item} dark={dark} />
      ))}
    </div>
  )
}
