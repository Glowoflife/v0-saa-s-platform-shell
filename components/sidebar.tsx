"use client"

import {
  Sun,
  PlusCircle,
  Grid,
  FlaskConical,
  Beaker,
  Settings,
  Shield,
  LogOut,
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { useTheme } from "@/components/theme-context"
import { useState, useEffect } from "react"
import { apiFetch } from "@/lib/api-client"
import { useCredits } from "@/hooks/use-credits"

type NavItem = {
  icon: React.ElementType
  label: string
  href: string
}

const primaryNav: NavItem[] = [
  { icon: Sun, label: "Morning Brief", href: "/" },
  { icon: PlusCircle, label: "New Formulation", href: "/new-formulation" },
  { icon: Beaker, label: "Deformulate", href: "/deformulate" },
  { icon: Grid, label: "My Formulations", href: "/formulations" },
  { icon: FlaskConical, label: "Formulation Partner", href: "/partner" },
]

export function Sidebar() {
  const { dark, toggleDark } = useTheme()
  const pathname = usePathname()
  const [isAdmin, setIsAdmin] = useState(false)
  const credits = useCredits()

  useEffect(() => {
    try {
      const cached = localStorage.getItem("tf_user")
      if (cached) {
        const user = JSON.parse(cached)
        if (user?.role === "admin") { setIsAdmin(true); return }
      }
      const token = localStorage.getItem("tf_access_token")
      if (!token) return
      apiFetch("https://api.theformulator.ai/auth/me")
        .then((r) => r.ok ? r.json() : null)
        .then((user) => {
          if (!user) return
          localStorage.setItem("tf_user", JSON.stringify(user))
          if (user.role === "admin") setIsAdmin(true)
        })
        .catch(() => {})
    } catch {}
  }, [])

  const handleSignOut = () => {
    localStorage.removeItem("tf_access_token")
    localStorage.removeItem("tf_refresh_token")
    localStorage.removeItem("tf_user")
    window.location.href = "https://theformulator.ai"
  }

  return (
    <aside
      style={{ width: 240, backgroundColor: "#0D1B2A" }}
      className="flex h-screen flex-col flex-shrink-0"
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-5" style={{ height: 56 }}>
        <Image src="/logo.svg" alt="theformulator.ai" width={36} height={36} className="flex-shrink-0" style={{ width: 36, height: 36, objectFit: "contain" }} />
        <span className="text-white font-medium text-sm">theformulator.ai</span>
      </div>

      {/* Primary Nav */}
      <nav className="flex flex-col mt-4 px-0">
        {primaryNav.map((item) => {
          const isActive =
          item.href === "/"
            ? pathname === "/"
            : pathname === item.href || pathname.startsWith(item.href + "/")
          const Icon = item.icon
          return (
            <Link
              key={item.label}
              href={item.href}
              style={
                isActive
                  ? {
                      borderLeft: "3px solid #D4A843",
                      backgroundColor: "rgba(212,168,67,0.10)",
                      paddingLeft: 9,
                      textDecoration: "none",
                    }
                  : {
                      borderLeft: "3px solid transparent",
                      paddingLeft: 9,
                      textDecoration: "none",
                    }
              }
              className="flex items-center gap-3 h-11 pr-3 w-full group"
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
            </Link>
          )
        })}

        {/* Ops Console — only visible to admin role */}
        {isAdmin && (
          <>
            <div style={{ margin: "8px 12px 4px", borderTop: "1px solid rgba(255,255,255,0.08)" }} />
            <Link
              href="/ops"
              style={
                pathname === "/ops"
                  ? { borderLeft: "3px solid #D4A843", backgroundColor: "rgba(212,168,67,0.10)", paddingLeft: 9, textDecoration: "none" }
                  : { borderLeft: "3px solid transparent", paddingLeft: 9, textDecoration: "none" }
              }
              className="flex items-center gap-3 h-11 pr-3 w-full"
              onMouseEnter={(e) => {
                if (pathname !== "/ops") (e.currentTarget as HTMLElement).style.backgroundColor = "rgba(255,255,255,0.05)"
              }}
              onMouseLeave={(e) => {
                if (pathname !== "/ops") (e.currentTarget as HTMLElement).style.backgroundColor = "transparent"
              }}
            >
              <Shield size={18} style={{ color: "#D4A843", opacity: pathname === "/ops" ? 1 : 0.7 }} />
              <span style={{ color: pathname === "/ops" ? "#D4A843" : "rgba(212,168,67,0.70)", fontSize: 13, fontWeight: 500 }}>
                Ops Console
              </span>
            </Link>
          </>
        )}
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
                whiteSpace: "nowrap",
              }}
            >
              {credits !== null ? `${credits} credits` : "— credits"}
            </span>
          </div>
          <Settings size={16} style={{ color: "rgba(255,255,255,0.50)" }} />
        </div>

        {/* Dark mode toggle row */}
        <div className="flex items-center justify-between py-1" style={{ marginTop: 8 }}>
          <span style={{ color: "rgba(255,255,255,0.50)", fontSize: 11 }}>
            Dark mode
          </span>
          <button
            onClick={toggleDark}
            style={{
              width: 32,
              height: 18,
              borderRadius: 9,
              backgroundColor: dark ? "#D4A843" : "rgba(255,255,255,0.12)",
              position: "relative",
              cursor: "pointer",
              border: "none",
              padding: 0,
              flexShrink: 0,
            }}
          >
            <div
              style={{
                width: 14,
                height: 14,
                borderRadius: "50%",
                backgroundColor: "#FFFFFF",
                position: "absolute",
                top: 2,
                left: dark ? 16 : 2,
                transition: "left 0.15s ease",
              }}
            />
          </button>
        </div>

        {/* Sign out */}
        <button
          onClick={handleSignOut}
          style={{
            display: "flex", alignItems: "center", gap: 8,
            width: "100%", padding: "8px 0",
            background: "transparent", border: "none",
            color: "#6B7280", fontSize: 12, cursor: "pointer",
            textAlign: "left",
          }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "#9CA3AF" }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "#6B7280" }}
        >
          <LogOut size={14} style={{ color: "#6B7280" }} />
          Sign out
        </button>

        {/* CTA Button */}
        <Link
          href="/new-formulation"
          style={{ textDecoration: "none" }}
        >
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
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
            }}
          >
            <PlusCircle size={15} />
            New Formulation
          </button>
        </Link>
      </div>
    </aside>
  )
}
