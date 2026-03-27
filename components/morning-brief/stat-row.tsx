const stats = [
  {
    label: "FORMULATIONS",
    number: "12",
    sub: "27 credits remaining",
    redNumber: false,
    redSub: false,
  },
  {
    label: "SAVED",
    number: "38",
    sub: "7 pending review",
    redNumber: false,
    redSub: false,
  },
  {
    label: "REGULATORY ALERTS",
    number: "2",
    sub: "Require action",
    redNumber: true,
    redSub: true,
  },
  {
    label: "MARKETS",
    number: "9",
    sub: "of 13 planned",
    redNumber: false,
    redSub: false,
  },
]

export function StatRow() {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        gap: 12,
        marginBottom: 24,
      }}
    >
      {stats.map((s) => (
        <div
          key={s.label}
          style={{
            backgroundColor: "#FFFFFF",
            border: "1px solid #E5E7EB",
            borderRadius: 10,
            padding: 16,
            boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
          }}
        >
          <div
            style={{
              fontSize: 11,
              fontWeight: 500,
              letterSpacing: "0.05em",
              textTransform: "uppercase",
              color: "#6B7280",
              marginBottom: 6,
            }}
          >
            {s.label}
          </div>
          <div
            style={{
              fontSize: 28,
              fontWeight: 600,
              color: s.redNumber ? "#991B1B" : "#0D1B2A",
              lineHeight: 1,
              marginBottom: 6,
            }}
          >
            {s.number}
          </div>
          <div
            style={{
              fontSize: 12,
              color: s.redSub ? "#991B1B" : "#6B7280",
            }}
          >
            {s.sub}
          </div>
        </div>
      ))}
    </div>
  )
}
