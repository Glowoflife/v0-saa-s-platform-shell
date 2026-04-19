"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useTheme } from "@/components/theme-context"
import { apiFetch } from "@/lib/api-client"

const LEVEL_STYLES: Record<string, { bg: string; text: string }> = {
  quick: { bg: "#DBEAFE", text: "#1D4ED8" },
  intelligence_brief: { bg: "#FEF3C7", text: "#92400E" },
  dossier: { bg: "#D1FAE5", text: "#065F46" },
}

const LEVEL_LABELS: Record<string, string> = {
  quick: "QUICK",
  intelligence_brief: "INTELLIGENCE BRIEF",
  dossier: "DOSSIER",
}

interface Formulation {
  formulation_id: string
  kind: string
  report_level: string
  credits_spent: number
  created_at: string
}

function formatDate(value: string): string {
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return ""
  return parsed.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
}

function FormulationCard({ formulation }: { formulation: Formulation }) {
  const [hovered, setHovered] = useState(false)
  const { dark } = useTheme()
  const levelStyle = LEVEL_STYLES[formulation.report_level] ?? LEVEL_STYLES.quick
  const levelLabel = LEVEL_LABELS[formulation.report_level] ?? formulation.report_level.toUpperCase().replace("_", " ")
  const shortId = formulation.formulation_id.slice(0, 8)
  const kindLabel = formulation.kind === "deformulation" ? "Deformulation" : "Formulation"

  return (
    <Link
      href={`/formulations/${formulation.formulation_id}`}
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
        {/* Top row — level + kind */}
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
            {levelLabel}
          </span>
          <span
            style={{
              fontSize: 10,
              fontWeight: 500,
              color: "#9CA3AF",
              textTransform: "uppercase",
              letterSpacing: "0.04em",
            }}
          >
            {kindLabel}
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
          Formula {shortId}
        </div>

        {/* Created date */}
        <div style={{ fontSize: 12, color: "#6B7280", marginTop: 3 }}>
          Created {formatDate(formulation.created_at)}
        </div>

        {/* Credits badge */}
        <div style={{ marginTop: 12 }}>
          <span
            style={{
              fontSize: 10,
              fontWeight: 600,
              color: "#92400E",
              backgroundColor: "#FEF3C7",
              borderRadius: 4,
              padding: "2px 8px",
            }}
          >
            {formulation.credits_spent} credit{formulation.credits_spent !== 1 ? "s" : ""}
          </span>
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
            justifyContent: "flex-end",
            alignItems: "center",
            marginTop: 10,
          }}
        >
          <span style={{ fontSize: 12, color: "#D4A843", fontWeight: 500 }}>Open →</span>
        </div>
      </div>
    </Link>
  )
}

function EmptyState({ dark }: { dark: boolean }) {
  return (
    <div
      style={{
        backgroundColor: dark ? "#111827" : "#FFFFFF",
        border: `1px solid ${dark ? "#1F2937" : "#E5E7EB"}`,
        borderRadius: 10,
        padding: "28px 20px",
        gridColumn: "1 / -1",
        textAlign: "center" as const,
      }}
    >
      <div style={{ fontSize: 14, color: dark ? "#9CA3AF" : "#6B7280", marginBottom: 14 }}>
        No formulations yet. Start your first one →
      </div>
      <Link
        href="/new-formulation"
        style={{
          backgroundColor: "#D4A843",
          color: "#0D1B2A",
          fontSize: 13,
          fontWeight: 600,
          padding: "9px 18px",
          borderRadius: 8,
          textDecoration: "none",
          display: "inline-block",
        }}
      >
        New Formulation
      </Link>
    </div>
  )
}

export function ActiveProjects() {
  const { dark } = useTheme()
  const [formulations, setFormulations] = useState<Formulation[]>([])
  const [count, setCount] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const res = await apiFetch("https://api.theformulator.ai/api/user/formulations?limit=20")
        if (cancelled) return
        if (res.ok) {
          const data = (await res.json()) as { count: number; formulations: Formulation[] }
          if (!cancelled) {
            setCount(data.count)
            setFormulations(data.formulations.slice(0, 3))
          }
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div style={{ marginTop: 16 }}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 16,
        }}
      >
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="animate-pulse"
              style={{
                backgroundColor: dark ? "#111827" : "#FFFFFF",
                border: `1px solid ${dark ? "#1F2937" : "#E5E7EB"}`,
                borderRadius: 10,
                padding: "18px 20px",
                minHeight: 160,
              }}
            />
          ))
        ) : count === 0 ? (
          <EmptyState dark={dark} />
        ) : (
          formulations.map((f) => <FormulationCard key={f.formulation_id} formulation={f} />)
        )}
      </div>
    </div>
  )
}
