"use client"

import { useState } from "react"
import Link from "next/link"
import { useTheme } from "@/components/theme-context"

type StatusColor = "green" | "amber" | "red"

interface Market {
  code: string
  status: StatusColor
}

interface Project {
  id: string
  name: string
  level: "Quick" | "Brief" | "Dossier"
  status: "Draft" | "Complete"
  format: string
  functions: string
  markets: Market[]
  updatedDate: string
}

const LEVEL_STYLES: Record<string, { bg: string; text: string }> = {
  Quick: { bg: "#DBEAFE", text: "#1D4ED8" },
  Brief: { bg: "#FEF3C7", text: "#92400E" },
  Dossier: { bg: "#D1FAE5", text: "#065F46" },
}

const DOT_COLORS: Record<StatusColor, string> = {
  green: "#10B981",
  amber: "#F59E0B",
  red: "#EF4444",
}

const projects: Project[] = [
  {
    id: "frm_001",
    name: "Brightening Serum — Phase 1",
    level: "Dossier",
    status: "Draft",
    format: "Gel",
    functions: "Brightening + Hydration",
    markets: [
      { code: "EU", status: "green" },
      { code: "IN", status: "green" },
      { code: "UK", status: "green" },
    ],
    updatedDate: "Mar 29 2026",
  },
  {
    id: "frm_002",
    name: "Sulphate-Free Cleansing Gel",
    level: "Brief",
    status: "Draft",
    format: "Foam",
    functions: "Cleansing",
    markets: [
      { code: "UK", status: "green" },
      { code: "US", status: "green" },
      { code: "AU", status: "amber" },
    ],
    updatedDate: "Mar 27 2026",
  },
  {
    id: "frm_003",
    name: "Retinol Night Cream 0.3%",
    level: "Brief",
    status: "Complete",
    format: "Cream",
    functions: "Anti-ageing",
    markets: [
      { code: "EU", status: "green" },
      { code: "UK", status: "green" },
      { code: "US", status: "amber" },
    ],
    updatedDate: "Mar 25 2026",
  },
]

function ProjectCard({ project }: { project: Project }) {
  const [hovered, setHovered] = useState(false)
  const { dark } = useTheme()
  const levelStyle = LEVEL_STYLES[project.level]

  return (
    <Link
      href={`/formulations/${project.id}`}
      style={{ textDecoration: "none", display: "block" }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div
        style={{
          backgroundColor: dark ? "#111827" : "#FFFFFF",
          border: `1px solid ${dark ? "#1F2937" : "#E5E7EB"}`,
          borderRadius: 10,
          padding: "18px 20px",
          cursor: "pointer",
          boxShadow: hovered ? "0 4px 12px rgba(0,0,0,0.06)" : "none",
          transition: "box-shadow 0.15s ease",
        }}
      >
        {/* Top row — level + status badges */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span
            style={{
              backgroundColor: levelStyle.bg,
              color: levelStyle.text,
              fontSize: 10,
              fontWeight: 600,
              borderRadius: 4,
              padding: "2px 8px",
              letterSpacing: "0.04em",
            }}
          >
            {project.level === "Brief" ? "Intelligence Brief" : project.level}
          </span>
          <span
            style={{
              fontSize: 10,
              fontWeight: 500,
              color: project.status === "Complete" ? "#10B981" : "#9CA3AF",
              textTransform: "uppercase",
              letterSpacing: "0.04em",
            }}
          >
            {project.status}
          </span>
        </div>

        {/* Formula name */}
        <div
          style={{
            fontSize: 14,
            fontWeight: 600,
            color: dark ? "#F9FAFB" : "#0D1B2A",
            marginTop: 10,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {project.name}
        </div>

        {/* Product descriptor */}
        <div style={{ fontSize: 12, color: "#6B7280", marginTop: 3 }}>
          {project.format} · {project.functions}
        </div>

        {/* Compliance row */}
        <div style={{ marginTop: 12 }}>
          <div
            style={{
              fontSize: 10,
              fontWeight: 500,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "#9CA3AF",
              marginBottom: 6,
            }}
          >
            COMPLIANCE
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            {project.markets.map((m) => (
              <div
                key={m.code}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                  backgroundColor: dark ? "#1F2937" : "#F9FAFB",
                  border: `1px solid ${dark ? "#374151" : "#E5E7EB"}`,
                  borderRadius: 4,
                  padding: "3px 8px",
                }}
              >
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 10,
                    color: dark ? "#F9FAFB" : "#0D1B2A",
                  }}
                >
                  {m.code}
                </span>
                <span
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    backgroundColor: DOT_COLORS[m.status],
                  }}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div
          style={{
            height: 1,
            backgroundColor: dark ? "#1F2937" : "#F3F4F6",
            marginTop: 14,
          }}
        />

        {/* Bottom row */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: 10,
          }}
        >
          <span
            style={{
              fontSize: 11,
              color: "#9CA3AF",
              fontFamily: "var(--font-mono)",
            }}
          >
            Updated {project.updatedDate}
          </span>
          <span style={{ fontSize: 12, color: "#D4A843", fontWeight: 500 }}>
            Open →
          </span>
        </div>
      </div>
    </Link>
  )
}

export function ActiveProjects() {
  const { dark } = useTheme()

  return (
    <div style={{ marginTop: 16 }}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 16,
        }}
      >
        {projects.map((p) => (
          <ProjectCard key={p.id} project={p} />
        ))}
      </div>
    </div>
  )
}
