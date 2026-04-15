"use client"

import { useState, useEffect } from "react"
import { Zap, Bell } from "lucide-react"
import { usePathname } from "next/navigation"
import { useTheme } from "@/components/theme-context"

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://api.theformulator.ai"

const PAGE_TITLES: Record<string, string> = {
  "/": "Morning Brief",
  "/morning-brief": "Morning Brief",
  "/new-formulation": "New Formulation",
  "/deformulate": "Deformulate",
  "/formula-output": "Formula Output",
  "/formulations": "My Formulations",
  "/partner": "Formulation Partner",
  "/ops": "Admin Dashboard",
}

function getPageTitle(pathname: string): string {
  if (PAGE_TITLES[pathname]) return PAGE_TITLES[pathname]
  if (pathname.startsWith("/formulations/")) return "Formulation Report"
  return "theformulator.ai"
}

async function fetchCredits(): Promise<number | null> {
  const token = localStorage.getItem("tf_access_token")
  if (!token) return null

  const res = await fetch(`${API_BASE}/api/user/credits`, {
    headers: { Authorization: `Bearer ${token}` },
  })

  if (res.ok) {
    const data = await res.json()
    return data.credits_remaining ?? null
  }

  if (res.status === 401) {
    const refreshToken = localStorage.getItem("tf_refresh_token")
    if (!refreshToken) return null

    const refreshRes = await fetch(`${API_BASE}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: refreshToken }),
    })

    if (!refreshRes.ok) return null

    const refreshData = await refreshRes.json()
    localStorage.setItem("tf_access_token", refreshData.access_token)
    localStorage.setItem("tf_refresh_token", refreshData.refresh_token)

    const retry = await fetch(`${API_BASE}/api/user/credits`, {
      headers: { Authorization: `Bearer ${refreshData.access_token}` },
    })

    if (retry.ok) {
      const data = await retry.json()
      return data.credits_remaining ?? null
    }
  }

  return null
}

export function Topbar() {
  const { dark } = useTheme()
  const pathname = usePathname()
  const title = getPageTitle(pathname)
  const [credits, setCredits] = useState<number | null>(null)

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const result = await fetchCredits()
        if (!cancelled) setCredits(result)
      } catch {
        // silently ignore — don't break the UI
      }
    }

    void load()

    const interval = setInterval(() => {
      void load()
    }, 60_000)

    return () => {
      cancelled = true
      clearInterval(interval)
    }
  }, [pathname])

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
            {credits !== null ? `${credits} credits` : "— credits"}
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
