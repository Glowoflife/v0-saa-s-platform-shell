import { Zap, Bell } from "lucide-react"

interface TopbarProps {
  title?: string
}

export function Topbar({ title = "Morning Brief" }: TopbarProps) {
  return (
    <header
      style={{
        height: 56,
        minHeight: 56,
        flexShrink: 0,
        backgroundColor: "#FFFFFF",
        borderBottom: "1px solid #E5E7EB",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        paddingLeft: 24,
        paddingRight: 24,
      }}
    >
      {/* Page title */}
      <span
        style={{ color: "#0D1B2A", fontSize: 15, fontWeight: 500 }}
      >
        {title}
      </span>

      {/* Right side */}
      <div className="flex items-center" style={{ gap: 12 }}>
        {/* Credit counter pill */}
        <div
          style={{
            backgroundColor: "#F4F6F9",
            border: "1px solid #E5E7EB",
            borderRadius: 20,
            padding: "6px 12px",
          }}
          className="flex items-center gap-1"
        >
          <Zap size={14} style={{ color: "#D4A843" }} />
          <span style={{ color: "#0D1B2A", fontSize: 13, fontWeight: 500 }}>
            27 / 40 credits
          </span>
        </div>

        {/* Notification bell with red dot */}
        <div className="relative flex items-center justify-center">
          <Bell size={20} style={{ color: "#6B7280" }} />
          <span
            style={{
              position: "absolute",
              top: -1,
              right: -1,
              width: 8,
              height: 8,
              borderRadius: "50%",
              backgroundColor: "#991B1B",
              border: "1.5px solid #FFFFFF",
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
          }}
          className="flex items-center justify-center"
        >
          <span
            className="text-white font-medium"
            style={{ fontSize: 12 }}
          >
            JR
          </span>
        </div>
      </div>
    </header>
  )
}
