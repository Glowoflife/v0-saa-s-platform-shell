"use client"

import { useState } from "react"
import { useTheme } from "@/components/theme-context"

type StatusColor = "green" | "amber" | "red"

interface Market {
  name: string
  status: string
  color: StatusColor
}

interface Project {
  title: string
  sub: string
  markets: Market[]
}

const DOT_COLORS: Record<StatusColor, string> = {
  green: "#22C55E",
  amber: "#F59E0B",
  red: "#EF4444",
}

const projects: Project[] = [
  {
    title: "Brightening Serum",
    sub: "12 ingredients · v3 · Stability testing",
    markets: [
      { name: "EU", status: "Compliant", color: "green" },
      { name: "US", status: "Compliant", color: "green" },
      { name: "IN", status: "Review", color: "amber" },
    ],
  },
  {
    title: "SPF 50 Sunscreen",
    sub: "18 ingredients · v1 · Brief stage",
    markets: [
      { name: "EU", status: "Compliant", color: "green" },
      { name: "CN", status: "Data missing", color: "red" },
      { name: "JP", status: "Review", color: "amber" },
    ],
  },
  {
    title: "Natural Shampoo Bar",
    sub: "9 ingredients · v2 · Lab testing",
    markets: [
      { name: "EU", status: "Compliant", color: "green" },
      { name: "UK", status: "Compliant", color: "green" },
      { name: "IN", status: "Compliant", color: "green" },
    ],
  },
]

function ProjectCard({ project }: { project: Project }) {
  const [hovered, setHovered] = useState(false)
  const { dark } = useTheme()

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        flex: 1,
        backgroundColor: dark ? "#0D1B2A" : "#FFFFFF",
        border: `1px solid ${dark ? "#1B3A5C" : "#E5E7EB"}`,
        borderRadius: 10,
        padding: 16,
        boxShadow: dark ? "none" : "0 1px 3px rgba(0,0,0,0.06)",
        cursor: "pointer",
        position: "relative",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
        }}
      >
        <div
          style={{ fontSize: 13, fontWeight: 600, color: dark ? "#F9FAFB" : "#0D1B2A" }}
        >
          {project.title}
        </div>
        {hovered && (
          <span style={{ fontSize: 12, color: "#D4A843", flexShrink: 0 }}>
            → Open
          </span>
        )}
      </div>
      <div style={{ fontSize: 12, color: dark ? "#9CA3AF" : "#6B7280", marginTop: 2 }}>
        {project.sub}
      </div>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 6,
          marginTop: 12,
        }}
      >
        {project.markets.map((m) => (
          <div
            key={m.name}
            style={{ display: "flex", alignItems: "center", gap: 5 }}
          >
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                backgroundColor: DOT_COLORS[m.color],
                flexShrink: 0,
                display: "inline-block",
              }}
            />
            <span style={{ fontSize: 11, color: dark ? "#9CA3AF" : "#6B7280" }}>
              {m.name} · {m.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

export function ActiveProjects() {
  const { dark } = useTheme()

  return (
    <div>
      <div
        style={{
          fontSize: 11,
          fontWeight: 500,
          letterSpacing: "0.05em",
          textTransform: "uppercase",
          color: dark ? "#6B7280" : "#6B7280",
          marginBottom: 12,
        }}
      >
        Active Projects
      </div>
      <div style={{ display: "flex", gap: 12 }}>
        {projects.map((p) => (
          <ProjectCard key={p.title} project={p} />
        ))}
      </div>
    </div>
  )
}
