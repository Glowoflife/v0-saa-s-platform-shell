"use client"

import { Zap, Bell } from "lucide-react"
import { usePathname } from "next/navigation"
import { useTheme } from "@/components/theme-context"

const PAGE_TITLES: Record<string, string> = {
  "/": "Morning Brief",
  "/new-formulation": "New Formulation",
  "/formula-output": "Formula Output",
  "/formulations": "My Formulations",
  "/partner": "Formulation Partner",
  "/regulatory": "Regulatory Database",
  "/market": "Market Intelligence",
}

function getPageTitle(pathname: string): string {
  if (PAGE_TITLES[pathname]) return PAGE_TITLES[pathname]
  // Handle dynamic routes: /formulations/[id]
  if (pathname.startsWith("/formulations/")) return "My Formulations"
  return "theformulator.ai"
}

export function Topbar() {
  const { dark } = useTheme()
  const pathname = usePathname()
  const title = getPageTitle(pathname)

  return (
    <header
      style={{
        position: "fixed",
        top: 0,
        left: 240,
        right: 0,
        height: 56,
        backgroundColor: dark ? "#0D1B2A" : "#FFFFFF",
        borderBottom: `1px solid ${dark ? "#1B3A5C" : "#E5E7EB"}`,
        zIndex: 10,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 24px",
      }}
    >
      {/* Page title */}
      <span style={{ color: dark ? "#F9FAFB" : "#0D1B2A", fontSize: 15, fontWeight: 500 }}>
        {title}
      </span>

      {/* Right side */}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        {/* Credit counter pill */}
        <div
          style={{
            backgroundColor: dark ? "#1B3A5C" : "#F4F6F9",
            border: `1px solid ${dark ? "#1B3A5C" : "#E5E7EB"}`,
            borderRadius: 9999,
            padding: "6px 12px",
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          <Zap size={14} style={{ color: "#D4A843" }} />
          <span style={{ color: dark ? "#F9FAFB" : "#0D1B2A", fontSize: 13, fontWeight: 500 }}>
            27 / 40 credits
          </span>
        </div>

        {/* Notification bell with red dot */}
        <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Bell size={20} style={{ color: dark ? "#9CA3AF" : "#6B7280" }} />
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
