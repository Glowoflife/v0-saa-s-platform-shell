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
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { useTheme } from "@/components/theme-context"

type NavItem = {
  icon: React.ElementType
  label: string
  href: string
  soon?: boolean
}

const primaryNav: NavItem[] = [
  { icon: Sun, label: "Morning Brief", href: "/" },
  { icon: PlusCircle, label: "New Formulation", href: "/new-formulation" },
  { icon: Grid, label: "My Formulations", href: "/formulations" },
  { icon: FlaskConical, label: "Formulation Partner", href: "/partner" },
  { icon: Shield, label: "Regulatory Database", href: "/regulatory" },
  { icon: BarChart2, label: "Market Intelligence", href: "/market" },
]

const secondaryNav: NavItem[] = [
  { icon: BookOpen, label: "Lab Journal", href: "/journal", soon: true },
  { icon: Layers, label: "Batch Tracking", href: "/batch", soon: true },
  { icon: TestTube, label: "Stability Tests", href: "/stability", soon: true },
]

export function Sidebar() {
  const { dark, toggleDark } = useTheme()
  const pathname = usePathname()

  return (
    <aside
      style={{ width: 240, backgroundColor: "#0D1B2A" }}
      className="flex h-screen flex-col flex-shrink-0"
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5">
        <Image src="/logo.svg" alt="theformulator.ai" width={36} height={36} className="flex-shrink-0" style={{ width: "auto", height: "auto" }} />
        <span className="text-white font-medium text-sm">theformulator.ai</span>
      </div>

      {/* Primary Nav */}
      <nav className="flex flex-col mt-4 px-0">
        {primaryNav.map((item) => {
          const isActive = pathname === item.href
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
                whiteSpace: "nowrap",
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
