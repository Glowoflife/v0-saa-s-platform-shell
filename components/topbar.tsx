import { Zap, Bell } from "lucide-react"

interface TopbarProps {
  title?: string
}

export function Topbar({ title = "Morning Brief" }: TopbarProps) {
  return (
    <header
      style={{
        position: "fixed",
        top: 0,
        left: 240,
        right: 0,
        height: 56,
        backgroundColor: "#FFFFFF",
        borderBottom: "1px solid #E5E7EB",
        zIndex: 10,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 24px",
      }}
    >
      {/* Page title */}
      <span style={{ color: "#0D1B2A", fontSize: 15, fontWeight: 500 }}>
        {title}
      </span>

      {/* Right side */}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        {/* Credit counter pill */}
        <div
          style={{
            backgroundColor: "#F4F6F9",
            border: "1px solid #E5E7EB",
            borderRadius: 9999,
            padding: "6px 12px",
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          <Zap size={14} style={{ color: "#D4A843" }} />
          <span style={{ color: "#0D1B2A", fontSize: 13, fontWeight: 500 }}>
            27 / 40 credits
          </span>
        </div>

        {/* Notification bell with red dot */}
        <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Bell size={20} style={{ color: "#6B7280" }} />
          <span
            style={{
              position: "absolute",
              top: 0,
              right: 0,
              width: 8,
              height: 8,
              borderRadius: "50%",
              backgroundColor: "#991B1B",
            }}
          />
        </div>

        {/* Avatar */}
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: "50%",
            backgroundColor: "#1B3A5C",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <span style={{ fontSize: 12, fontWeight: 500, color: "#FFFFFF" }}>
            JR
          </span>
        </div>
      </div>
    </header>
  )
}
