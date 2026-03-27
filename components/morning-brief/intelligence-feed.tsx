interface FeedItem {
  pill: string
  pillBg: string
  pillColor: string
  headline: string
  source: string
  time: string
}

const items: FeedItem[] = [
  {
    pill: "REG",
    pillBg: "#FEE2E2",
    pillColor: "#991B1B",
    headline: "SCCS adopts opinion on Salicylic Acid concentration limits",
    source: "EUR-Lex",
    time: "2 hours ago",
  },
  {
    pill: "SCIENCE",
    pillBg: "#DBEAFE",
    pillColor: "#1E40AF",
    headline: "New study: Bakuchiol efficacy vs retinol in Asian skin types",
    source: "J. Cosmetic Science",
    time: "5 hours ago",
  },
  {
    pill: "MARKET",
    pillBg: "#D1FAE5",
    pillColor: "#065F46",
    headline: "Niacinamide + Centella combination up 34% in Korea Q1 2026",
    source: "Innova Market Intelligence",
    time: "8 hours ago",
  },
  {
    pill: "INGREDIENT",
    pillBg: "#FEF3C7",
    pillColor: "#92400E",
    headline: "DSM launches next-gen Vitamin C derivative with 48h stability",
    source: "In-Cosmetics Global",
    time: "Yesterday",
  },
  {
    pill: "REG",
    pillBg: "#FEE2E2",
    pillColor: "#991B1B",
    headline: "China NMPA updates positive list: 23 new permitted preservatives",
    source: "NMPA",
    time: "Yesterday",
  },
]

export function IntelligenceFeed() {
  return (
    <div>
      <div
        style={{
          fontSize: 11,
          fontWeight: 500,
          letterSpacing: "0.05em",
          textTransform: "uppercase",
          color: "#6B7280",
          marginBottom: 12,
        }}
      >
        {"Today's Intelligence"}
      </div>
      <div>
        {items.map((item, i) => (
          <div
            key={i}
            style={{
              padding: "12px 0",
              borderBottom: i < items.length - 1 ? "1px solid #F3F4F6" : "none",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span
                style={{
                  backgroundColor: item.pillBg,
                  color: item.pillColor,
                  fontSize: 10,
                  fontWeight: 600,
                  borderRadius: 4,
                  padding: "2px 6px",
                  flexShrink: 0,
                }}
              >
                {item.pill}
              </span>
              <span
                style={{
                  fontSize: 12,
                  color: "#0D1B2A",
                  fontWeight: 500,
                  lineHeight: 1.4,
                }}
              >
                {item.headline}
              </span>
            </div>
            <div style={{ fontSize: 11, color: "#9CA3AF", marginTop: 4 }}>
              {item.source} · {item.time}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
