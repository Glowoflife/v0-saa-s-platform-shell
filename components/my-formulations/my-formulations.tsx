"use client"

import { useState, useEffect, useMemo } from "react"
import Link from "next/link"
import { useTheme } from "@/components/theme-context"
import { apiFetch } from "@/lib/api-client"
import { Search, FlaskConical } from "lucide-react"

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Formulation {
  formulation_id: string
  kind: "formulation" | "deformulation"
  report_level: string
  credits_spent: number
  created_at: string
}

type SortKey = "newest" | "oldest"

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const LEVEL_CONFIG: Record<
  string,
  { label: string; bg: string; text: string; darkBg: string; darkText: string }
> = {
  quick: {
    label: "QUICK",
    bg: "#DBEAFE",
    text: "#1D4ED8",
    darkBg: "#1E3A5F",
    darkText: "#93C5FD",
  },
  brief: {
    label: "INTELLIGENCE BRIEF",
    bg: "#FEF3C7",
    text: "#92400E",
    darkBg: "#3B2A0A",
    darkText: "#FCD34D",
  },
  intelligence_brief: {
    label: "INTELLIGENCE BRIEF",
    bg: "#FEF3C7",
    text: "#92400E",
    darkBg: "#3B2A0A",
    darkText: "#FCD34D",
  },
  dossier: {
    label: "DOSSIER",
    bg: "#D1FAE5",
    text: "#065F46",
    darkBg: "#064E3B",
    darkText: "#6EE7B7",
  },
}

const DEFAULT_LEVEL_CFG = {
  label: "REPORT",
  bg: "#F3F4F6",
  text: "#6B7280",
  darkBg: "#1F2937",
  darkText: "#9CA3AF",
}

function getLevelCfg(level: string) {
  return LEVEL_CONFIG[level] ?? DEFAULT_LEVEL_CFG
}

// Normalize "brief" → "intelligence_brief" for filtering
function normalizeLevel(level: string) {
  return level === "brief" ? "intelligence_brief" : level
}

// ---------------------------------------------------------------------------
// Utilities
// ---------------------------------------------------------------------------

function formatDate(value: string): string {
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return ""
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(parsed)
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function FilterSelect({
  value,
  onChange,
  options,
  dark,
}: {
  value: string
  onChange: (v: string) => void
  options: { value: string; label: string }[]
  dark: boolean
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={{
        height: 34,
        borderRadius: 7,
        border: `1px solid ${dark ? "#1F2937" : "#E5E7EB"}`,
        backgroundColor: dark ? "#111827" : "#FFFFFF",
        color: dark ? "#D1D5DB" : "#374151",
        fontSize: 12,
        fontWeight: 500,
        padding: "0 28px 0 10px",
        outline: "none",
        cursor: "pointer",
        appearance: "none",
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236B7280' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
        backgroundRepeat: "no-repeat",
        backgroundPosition: "right 8px center",
      }}
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  )
}

function FormulationCard({ formulation, dark }: { formulation: Formulation; dark: boolean }) {
  const [hovered, setHovered] = useState(false)
  const levelCfg = getLevelCfg(formulation.report_level)
  const kindLabel = formulation.kind === "deformulation" ? "Deformulation" : "Formulation"
  const shortId = formulation.formulation_id.slice(0, 8)
  const borderColor = dark ? "#1F2937" : "#E5E7EB"

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
          border: `1px solid ${borderColor}`,
          borderRadius: 10,
          padding: 18,
          cursor: "pointer",
          boxShadow: hovered
            ? dark
              ? "0 4px 16px rgba(0,0,0,0.4)"
              : "0 4px 16px rgba(0,0,0,0.08)"
            : "none",
          transition: "box-shadow 0.15s ease",
        }}
      >
        {/* Top row: level badge + kind */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span
            style={{
              fontSize: 10,
              fontWeight: 600,
              letterSpacing: "0.04em",
              borderRadius: 4,
              padding: "2px 8px",
              backgroundColor: dark ? levelCfg.darkBg : levelCfg.bg,
              color: dark ? levelCfg.darkText : levelCfg.text,
            }}
          >
            {levelCfg.label}
          </span>
          <span
            style={{
              fontSize: 10,
              fontWeight: 500,
              color: "#9CA3AF",
              textTransform: "uppercase" as const,
              letterSpacing: "0.04em",
            }}
          >
            {kindLabel}
          </span>
        </div>

        {/* Title */}
        <div
          style={{
            fontSize: 14,
            fontWeight: 600,
            color: dark ? "#F9FAFB" : "#0D1B2A",
            marginTop: 10,
            fontFamily: "var(--font-mono)",
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

        {/* Open link */}
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
    <div style={{ textAlign: "center", paddingTop: 80, paddingBottom: 80 }}>
      <div
        style={{
          width: 44,
          height: 44,
          margin: "0 auto",
          color: dark ? "#374151" : "#D1D5DB",
        }}
      >
        <FlaskConical size={44} strokeWidth={1.25} />
      </div>
      <div
        style={{
          marginTop: 16,
          fontSize: 16,
          fontWeight: 600,
          color: dark ? "#D1D5DB" : "#374151",
        }}
      >
        No formulations yet
      </div>
      <div style={{ marginTop: 4, fontSize: 13, color: "#6B7280" }}>
        Start your first one to see it listed here.
      </div>
      <Link
        href="/new-formulation"
        style={{
          display: "inline-block",
          marginTop: 16,
          backgroundColor: "#D4A843",
          color: "#0D1B2A",
          fontWeight: 600,
          fontSize: 13,
          height: 36,
          lineHeight: "36px",
          borderRadius: 8,
          padding: "0 16px",
          textDecoration: "none",
        }}
      >
        New Formulation
      </Link>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export function MyFormulations() {
  const { dark } = useTheme()

  const [formulations, setFormulations] = useState<Formulation[]>([])
  const [count, setCount] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)

  const [search, setSearch] = useState("")
  const [levelFilter, setLevelFilter] = useState("all")
  const [kindFilter, setKindFilter] = useState("all")
  const [sortBy, setSortBy] = useState<SortKey>("newest")

  const textPrimary = dark ? "#F9FAFB" : "#0D1B2A"
  const textSecondary = dark ? "#9CA3AF" : "#6B7280"
  const borderColor = dark ? "#1F2937" : "#E5E7EB"
  const inputBg = dark ? "#111827" : "#FFFFFF"

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
            setFormulations(data.formulations)
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

  // Derived filter options from real data
  const hasMultipleKinds = useMemo(() => {
    const kinds = new Set(formulations.map((f) => f.kind))
    return kinds.size > 1
  }, [formulations])

  const levelOptions = useMemo(() => {
    const seen = new Set(formulations.map((f) => normalizeLevel(f.report_level)))
    const opts: { value: string; label: string }[] = [{ value: "all", label: "All levels" }]
    if (seen.has("quick")) opts.push({ value: "quick", label: "Quick" })
    if (seen.has("intelligence_brief")) opts.push({ value: "intelligence_brief", label: "Intelligence Brief" })
    if (seen.has("dossier")) opts.push({ value: "dossier", label: "Dossier" })
    return opts
  }, [formulations])

  const kindOptions = [
    { value: "all", label: "All types" },
    { value: "formulation", label: "Formulation" },
    { value: "deformulation", label: "Deformulation" },
  ]

  const sortOptions: { value: SortKey; label: string }[] = [
    { value: "newest", label: "Newest first" },
    { value: "oldest", label: "Oldest first" },
  ]

  // Filter + sort
  const filtered = useMemo(() => {
    let result = formulations.filter((f) => {
      if (search) {
        const shortId = f.formulation_id.slice(0, 8).toLowerCase()
        if (!shortId.includes(search.toLowerCase())) return false
      }
      if (levelFilter !== "all") {
        if (normalizeLevel(f.report_level) !== levelFilter) return false
      }
      if (kindFilter !== "all" && f.kind !== kindFilter) return false
      return true
    })

    if (sortBy === "oldest") {
      result = [...result].sort(
        (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      )
    } else {
      result = [...result].sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )
    }

    return result
  }, [formulations, search, levelFilter, kindFilter, sortBy])

  const isFiltered = search !== "" || levelFilter !== "all" || kindFilter !== "all"

  // Loading skeleton
  if (loading) {
    return (
      <>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 20,
          }}
        >
          <div>
            <h1
              style={{
                fontSize: 20,
                fontWeight: 700,
                color: textPrimary,
                margin: 0,
                lineHeight: 1.2,
              }}
            >
              My Formulations
            </h1>
            <div
              className="animate-pulse"
              style={{
                width: 120,
                height: 12,
                borderRadius: 6,
                backgroundColor: dark ? "#1F2937" : "#E5E7EB",
                marginTop: 6,
              }}
            />
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 14 }}>
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="animate-pulse"
              style={{
                backgroundColor: dark ? "#111827" : "#FFFFFF",
                border: `1px solid ${borderColor}`,
                borderRadius: 10,
                height: 180,
              }}
            />
          ))}
        </div>
      </>
    )
  }

  return (
    <>
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 20,
        }}
      >
        <div>
          <h1
            style={{
              fontSize: 20,
              fontWeight: 700,
              color: textPrimary,
              margin: 0,
              lineHeight: 1.2,
            }}
          >
            My Formulations
          </h1>
          <p style={{ fontSize: 12, color: textSecondary, margin: "3px 0 0" }}>
            {count !== null
              ? `${count} formulation${count !== 1 ? "s" : ""}`
              : ""}
          </p>
        </div>
        <Link
          href="/new-formulation"
          style={{
            backgroundColor: "#D4A843",
            color: "#0D1B2A",
            fontWeight: 600,
            fontSize: 13,
            height: 36,
            lineHeight: "36px",
            borderRadius: 8,
            border: "none",
            padding: "0 16px",
            textDecoration: "none",
            display: "inline-block",
            flexShrink: 0,
          }}
        >
          New Formulation →
        </Link>
      </div>

      {/* Filter + sort bar — hidden when no formulations */}
      {count !== 0 && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            flexWrap: "wrap",
            marginBottom: 16,
          }}
        >
          {/* Search */}
          <div style={{ position: "relative" }}>
            <Search
              size={13}
              style={{
                position: "absolute",
                left: 10,
                top: "50%",
                transform: "translateY(-50%)",
                color: textSecondary,
                pointerEvents: "none",
              }}
            />
            <input
              type="text"
              placeholder="Search by ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                height: 34,
                width: 180,
                borderRadius: 7,
                border: `1px solid ${borderColor}`,
                backgroundColor: inputBg,
                color: textPrimary,
                fontSize: 12,
                paddingLeft: 30,
                paddingRight: 10,
                outline: "none",
              }}
            />
          </div>

          {/* Level filter — only show if more than one level option exists */}
          {levelOptions.length > 1 && (
            <FilterSelect
              value={levelFilter}
              onChange={setLevelFilter}
              options={levelOptions}
              dark={dark}
            />
          )}

          {/* Kind filter — only if both kinds present in data */}
          {hasMultipleKinds && (
            <FilterSelect
              value={kindFilter}
              onChange={setKindFilter}
              options={kindOptions}
              dark={dark}
            />
          )}

          {/* Sort — pushed right */}
          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: 11, color: textSecondary, whiteSpace: "nowrap" }}>
              Sort:
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortKey)}
              style={{
                height: 34,
                borderRadius: 7,
                border: `1px solid ${borderColor}`,
                backgroundColor: inputBg,
                color: dark ? "#D1D5DB" : "#374151",
                fontSize: 12,
                fontWeight: 500,
                padding: "0 28px 0 10px",
                outline: "none",
                cursor: "pointer",
                appearance: "none",
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236B7280' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
                backgroundRepeat: "no-repeat",
                backgroundPosition: "right 8px center",
              }}
            >
              {sortOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Result count when filtered */}
      {isFiltered && formulations.length > 0 && (
        <div style={{ fontSize: 11, color: textSecondary, marginBottom: 12 }}>
          {filtered.length === 0
            ? "No results"
            : `${filtered.length} result${filtered.length !== 1 ? "s" : ""}`}
        </div>
      )}

      {/* Grid or empty states */}
      {count === 0 ? (
        <EmptyState dark={dark} />
      ) : filtered.length > 0 ? (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: 14,
          }}
        >
          {filtered.map((f) => (
            <FormulationCard key={f.formulation_id} formulation={f} dark={dark} />
          ))}
        </div>
      ) : (
        <div
          style={{
            fontSize: 13,
            color: textSecondary,
            textAlign: "center",
            marginTop: 48,
          }}
        >
          No formulations match your current filters.
        </div>
      )}
    </>
  )
}
