"use client"

import {
  Sun,
  PlusCircle,
  Grid,
  FlaskConical,
  Shield,
  BarChart2,
  BookOpen,
  Layers,
  TestTube,
  Settings,
} from "lucide-react"

type NavItem = {
  icon: React.ElementType
  label: string
  soon?: boolean
}

const primaryNav: NavItem[] = [
  { icon: Sun, label: "Morning Brief" },
  { icon: PlusCircle, label: "New Formulation" },
  { icon: Grid, label: "My Formulations" },
  { icon: FlaskConical, label: "Formulation Partner" },
  { icon: Shield, label: "Regulatory Database" },
  { icon: BarChart2, label: "Market Intelligence" },
]

const secondaryNav: NavItem[] = [
  { icon: BookOpen, label: "Lab Journal", soon: true },
  { icon: Layers, label: "Batch Tracking", soon: true },
  { icon: TestTube, label: "Stability Tests", soon: true },
]

export function Sidebar() {
  return (
    <aside
      style={{ width: 240, backgroundColor: "#0D1B2A" }}
      className="flex h-screen flex-col flex-shrink-0"
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5">
        <div
          style={{
            backgroundColor: "#D4A843",
            width: 32,
            height: 32,
            borderRadius: 8,
          }}
          className="flex items-center justify-center flex-shrink-0"
        >
          <span className="text-white font-bold text-sm leading-none">tf</span>
        </div>
        <span className="text-white font-medium text-sm">theformulator.ai</span>
      </div>

      {/* Primary Nav */}
      <nav className="flex flex-col mt-4 px-0">
        {primaryNav.map((item, i) => {
          const isActive = i === 0
          const Icon = item.icon
          return (
            <button
              key={item.label}
              style={
                isActive
                  ? {
                      borderLeft: "3px solid #D4A843",
                      backgroundColor: "rgba(212,168,67,0.10)",
                      paddingLeft: 9,
                    }
                  : {
                      borderLeft: "3px solid transparent",
                      paddingLeft: 9,
                    }
              }
              className="flex items-center gap-3 h-11 pr-3 w-full text-left group"
              onMouseEnter={(e) => {
                if (!isActive)
                  (e.currentTarget as HTMLElement).style.backgroundColor =
                    "rgba(255,255,255,0.05)"
              }}
              onMouseLeave={(e) => {
                if (!isActive)
                  (e.currentTarget as HTMLElement).style.backgroundColor =
                    "transparent"
              }}
            >
              <Icon
                size={18}
                style={{ color: isActive ? "#D4A843" : "rgba(255,255,255,0.70)" }}
              />
              <span
                style={{
                  color: isActive ? "#D4A843" : "rgba(255,255,255,0.70)",
                  fontSize: 13,
                  fontWeight: 500,
                }}
              >
                {item.label}
              </span>
            </button>
          )
        })}
      </nav>

      {/* Divider */}
      <div
        style={{
          height: 1,
          backgroundColor: "rgba(255,255,255,0.08)",
          margin: "16px 0",
        }}
      />

      {/* Secondary Nav — Coming Soon */}
      <nav className="flex flex-col px-0">
        {secondaryNav.map((item) => {
          const Icon = item.icon
          return (
            <div
              key={item.label}
              style={{ borderLeft: "3px solid transparent", paddingLeft: 9 }}
              className="flex items-center gap-3 h-11 pr-3 w-full"
            >
              <Icon size={18} style={{ color: "rgba(255,255,255,0.35)" }} />
              <span
                style={{
                  color: "rgba(255,255,255,0.35)",
                  fontSize: 13,
                  fontWeight: 500,
                  flex: 1,
                }}
              >
                {item.label}
              </span>
              <span
                style={{
                  backgroundColor: "rgba(255,255,255,0.08)",
                  color: "rgba(255,255,255,0.40)",
                  fontSize: 10,
                  fontWeight: 500,
                  padding: "2px 6px",
                  borderRadius: 4,
                }}
              >
                Soon
              </span>
            </div>
          )
        })}
      </nav>

      {/* Spacer */}
      <div className="flex-grow" />

      {/* Bottom Section */}
      <div className="flex flex-col gap-2 px-4 pb-4" style={{ gap: 0 }}>
        {/* User row */}
        <div className="flex items-center gap-2 py-2">
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: "50%",
              backgroundColor: "#1B3A5C",
            }}
            className="flex items-center justify-center flex-shrink-0"
          >
            <span className="text-white font-medium" style={{ fontSize: 11 }}>
              JR
            </span>
          </div>
          <div className="flex flex-col flex-1 min-w-0">
            <span className="text-white font-medium" style={{ fontSize: 13 }}>
              Jeevan
            </span>
            <span
              style={{
                color: "#D4A843",
                fontSize: 10,
                fontWeight: 500,
                letterSpacing: "0.05em",
                textTransform: "uppercase",
              }}
            >
              INTELLIGENCE · 27 CREDITS
            </span>
          </div>
          <Settings size={16} style={{ color: "rgba(255,255,255,0.50)" }} />
        </div>

        {/* Dark mode toggle row */}
        <div className="flex items-center justify-between py-1" style={{ marginTop: 8 }}>
          <span style={{ color: "rgba(255,255,255,0.50)", fontSize: 11 }}>
            Dark mode
          </span>
          {/* Non-functional toggle UI */}
          <div
            style={{
              width: 32,
              height: 18,
              borderRadius: 9,
              backgroundColor: "rgba(255,255,255,0.12)",
              position: "relative",
              cursor: "not-allowed",
            }}
          >
            <div
              style={{
                width: 14,
                height: 14,
                borderRadius: "50%",
                backgroundColor: "rgba(255,255,255,0.40)",
                position: "absolute",
                top: 2,
                left: 2,
              }}
            />
          </div>
        </div>

        {/* CTA Button */}
        <button
          style={{
            backgroundColor: "#D4A843",
            color: "#0D1B2A",
            fontWeight: 500,
            fontSize: 13,
            height: 40,
            borderRadius: 8,
            width: "100%",
            marginTop: 12,
            border: "none",
            cursor: "pointer",
          }}
          className="flex items-center justify-center gap-2"
        >
          <PlusCircle size={15} />
          New Formulation
        </button>
      </div>
    </aside>
  )
}
