"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { useTheme } from "@/components/theme-context"
import { Search, FlaskConical } from "lucide-react"

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface FormulationSummary {
  id: string
  name: string
  product_type: string
  report_level: "quick" | "brief" | "dossier"
  markets: string[]
  variant_count: number
  ingredient_count: number
  created_at: string
  updated_at: string
  status: "complete" | "generating" | "failed"
  confidence_score?: number
}

type SortKey = "newest" | "oldest" | "name" | "confidence"

// ---------------------------------------------------------------------------
// Mock Data
// NOTE: Replace with API call when backend is ready:
//   const res = await fetch(`${API_BASE}/api/formulations`, {
//     headers: { Authorization: `Bearer ${token}` }
//   })
//   const formulations: FormulationSummary[] = await res.json()
// ---------------------------------------------------------------------------

const MOCK_FORMULATIONS: FormulationSummary[] = [
  {
    id: "form_001",
    name: "Vitamin C Brightening Serum",
    product_type: "Facial Serum",
    report_level: "dossier",
    markets: ["EU", "US", "IN", "JP"],
    variant_count: 3,
    ingredient_count: 14,
    created_at: "2026-04-10T09:30:00Z",
    updated_at: "2026-04-10T09:32:00Z",
    status: "complete",
    confidence_score: 87,
  },
  {
    id: "form_002",
    name: "Sulphate-Free Volumizing Shampoo",
    product_type: "Shampoo",
    report_level: "brief",
    markets: ["EU", "IN"],
    variant_count: 2,
    ingredient_count: 18,
    created_at: "2026-04-08T14:15:00Z",
    updated_at: "2026-04-08T14:17:00Z",
    status: "complete",
    confidence_score: 91,
  },
  {
    id: "form_003",
    name: "Niacinamide Barrier Repair Cream",
    product_type: "Moisturiser",
    report_level: "quick",
    markets: ["EU"],
    variant_count: 1,
    ingredient_count: 12,
    created_at: "2026-04-07T11:00:00Z",
    updated_at: "2026-04-07T11:01:00Z",
    status: "complete",
    confidence_score: 78,
  },
  {
    id: "form_004",
    name: "Retinol Night Recovery Serum",
    product_type: "Facial Serum",
    report_level: "dossier",
    markets: ["EU", "US", "KR", "JP"],
    variant_count: 3,
    ingredient_count: 16,
    created_at: "2026-04-05T16:45:00Z",
    updated_at: "2026-04-05T16:48:00Z",
    status: "complete",
    confidence_score: 82,
  },
  {
    id: "form_005",
    name: "Gentle Micellar Cleansing Water",
    product_type: "Cleanser",
    report_level: "brief",
    markets: ["EU", "IN", "ASEAN"],
    variant_count: 2,
    ingredient_count: 10,
    created_at: "2026-04-03T08:20:00Z",
    updated_at: "2026-04-03T08:22:00Z",
    status: "complete",
    confidence_score: 94,
  },
  {
    id: "form_006",
    name: "SPF 50 Mineral Sunscreen",
    product_type: "Sunscreen",
    report_level: "dossier",
    markets: ["EU", "US", "AU", "JP", "KR"],
    variant_count: 3,
    ingredient_count: 22,
    created_at: "2026-04-01T13:10:00Z",
    updated_at: "2026-04-01T13:15:00Z",
    status: "complete",
    confidence_score: 72,
  },
  {
    id: "form_007",
    name: "Hyaluronic Acid Hydrating Toner",
    product_type: "Toner",
    report_level: "quick",
    markets: ["EU", "CN"],
    variant_count: 2,
    ingredient_count: 9,
    created_at: "2026-03-28T10:00:00Z",
    updated_at: "2026-03-28T10:01:00Z",
    status: "complete",
    confidence_score: 89,
  },
  {
    id: "form_008",
    name: "Peptide Eye Contour Cream",
    product_type: "Eye Cream",
    report_level: "brief",
    markets: ["EU", "US"],
    variant_count: 1,
    ingredient_count: 15,
    created_at: "2026-03-25T15:30:00Z",
    updated_at: "2026-03-25T15:32:00Z",
    status: "complete",
    confidence_score: 85,
  },
]

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const REPORT_LEVEL_BADGE: Record<
  FormulationSummary["report_level"],
  { label: string; bg: string; text: string }
> = {
  quick: { label: "Quick", bg: "#F3F4F6", text: "#4B5563" },
  brief: { label: "Brief", bg: "#EEF2FF", text: "#1B3A5C" },
  dossier: { label: "Dossier", bg: "#FEF3C7", text: "#92400E" },
}

const REPORT_LEVEL_BADGE_DARK: Record<
  FormulationSummary["report_level"],
  { bg: string; text: string }
> = {
  quick: { bg: "#1F2937", text: "#9CA3AF" },
  brief: { bg: "#1E3A5F", text: "#93C5FD" },
  dossier: { bg: "#3B2A0A", text: "#FCD34D" },
}

// ---------------------------------------------------------------------------
// Utilities
// ---------------------------------------------------------------------------

function getRelativeDate(isoDate: string): string {
  const date = new Date(isoDate)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return "Today"
  if (diffDays === 1) return "Yesterday"
  if (diffDays < 7) return `${diffDays} days ago`
  if (diffDays < 14) return "1 week ago"
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
  if (diffDays < 60) return "1 month ago"
  return `${Math.floor(diffDays / 30)} months ago`
}

function getFullDate(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

function getConfidenceColor(score: number): string {
  if (score >= 85) return "#10B981"
  if (score >= 70) return "#F59E0B"
  return "#EF4444"
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
  options: string[]
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
        <option key={opt} value={opt}>
          {opt}
        </option>
      ))}
    </select>
  )
}

function ConfidenceBar({ score, dark }: { score: number; dark: boolean }) {
  const color = getConfidenceColor(score)
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <div
        style={{
          width: 56,
          height: 4,
          borderRadius: 2,
          backgroundColor: dark ? "#1F2937" : "#F3F4F6",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${score}%`,
            height: "100%",
            backgroundColor: color,
            borderRadius: 2,
          }}
        />
      </div>
      <span
        style={{
          fontSize: 11,
          fontFamily: "var(--font-mono)",
          fontWeight: 600,
          color,
        }}
      >
        {score}%
      </span>
    </div>
  )
}

function StatusDot({ status }: { status: FormulationSummary["status"] }) {
  if (status === "complete") return null
  const isGenerating = status === "generating"
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        fontSize: 11,
        fontWeight: 500,
        color: isGenerating ? "#F59E0B" : "#EF4444",
      }}
    >
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: "50%",
          backgroundColor: isGenerating ? "#F59E0B" : "#EF4444",
          display: "inline-block",
          animation: isGenerating ? "pulse 1.5s ease-in-out infinite" : "none",
        }}
      />
      {isGenerating ? "Generating..." : "Failed"}
    </span>
  )
}

function FormulationCard({
  formulation,
  dark,
}: {
  formulation: FormulationSummary
  dark: boolean
}) {
  const isClickable = formulation.status === "complete"
  const isFailed = formulation.status === "failed"

  const levelBadge = REPORT_LEVEL_BADGE[formulation.report_level]
  const levelBadgeDark = REPORT_LEVEL_BADGE_DARK[formulation.report_level]

  const cardBg = dark ? "#111827" : "#FFFFFF"
  const textPrimary = dark ? "#F9FAFB" : "#0D1B2A"
  const textSecondary = dark ? "#9CA3AF" : "#6B7280"
  const borderColor = isFailed
    ? dark
      ? "#7F1D1D"
      : "#FECACA"
    : dark
    ? "#1F2937"
    : "#E5E7EB"
  const chipBg = dark ? "#1F2937" : "#F3F4F6"
  const chipText = dark ? "#9CA3AF" : "#6B7280"
  const chipBorder = dark ? "#374151" : "#E5E7EB"

  const inner = (
    <div
      style={{
        backgroundColor: cardBg,
        border: `1px solid ${borderColor}`,
        borderRadius: 10,
        padding: 18,
        cursor: isClickable ? "pointer" : "default",
        opacity: formulation.status === "generating" ? 0.65 : 1,
        transition: "box-shadow 0.15s ease, border-color 0.15s ease",
      }}
      onMouseEnter={(e) => {
        if (!isClickable) return
        e.currentTarget.style.boxShadow = dark
          ? "0 4px 16px rgba(0,0,0,0.4)"
          : "0 4px 16px rgba(0,0,0,0.08)"
        e.currentTarget.style.borderColor = dark ? "#374151" : "#D1D5DB"
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = "none"
        e.currentTarget.style.borderColor = borderColor
      }}
    >
      {/* Row 1 — name + report level badge */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
        <span
          style={{
            flex: 1,
            fontSize: 14,
            fontWeight: 600,
            color: textPrimary,
            lineHeight: 1.35,
            overflow: "hidden",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
          }}
        >
          {formulation.name}
        </span>
        <span
          style={{
            flexShrink: 0,
            fontSize: 10,
            fontWeight: 600,
            letterSpacing: "0.05em",
            textTransform: "uppercase",
            borderRadius: 4,
            padding: "3px 7px",
            backgroundColor: dark
              ? levelBadgeDark.bg
              : levelBadge.bg,
            color: dark ? levelBadgeDark.text : levelBadge.text,
          }}
        >
          {levelBadge.label}
        </span>
      </div>

      {/* Row 2 — product type */}
      <div style={{ marginTop: 5, fontSize: 12, color: textSecondary }}>
        {formulation.product_type}
      </div>

      {/* Row 3 — metadata chips */}
      <div
        style={{
          marginTop: 10,
          display: "flex",
          gap: 5,
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        {/* Markets */}
        <span
          style={{
            fontSize: 11,
            fontWeight: 500,
            color: chipText,
            backgroundColor: chipBg,
            border: `1px solid ${chipBorder}`,
            borderRadius: 4,
            padding: "3px 8px",
          }}
        >
          {formulation.markets.join(" · ")}
        </span>
        {/* Variant count */}
        <span
          style={{
            fontSize: 11,
            fontWeight: 500,
            color: chipText,
            backgroundColor: chipBg,
            border: `1px solid ${chipBorder}`,
            borderRadius: 4,
            padding: "3px 8px",
            fontFamily: "var(--font-mono)",
          }}
        >
          {formulation.variant_count}{" "}
          {formulation.variant_count === 1 ? "variant" : "variants"}
        </span>
        {/* Ingredient count */}
        <span
          style={{
            fontSize: 11,
            fontWeight: 500,
            color: chipText,
            backgroundColor: chipBg,
            border: `1px solid ${chipBorder}`,
            borderRadius: 4,
            padding: "3px 8px",
            fontFamily: "var(--font-mono)",
          }}
        >
          {formulation.ingredient_count} ingredients
        </span>
      </div>

      {/* Divider */}
      <div
        style={{
          marginTop: 13,
          height: 1,
          backgroundColor: dark ? "#1F2937" : "#F3F4F6",
        }}
      />

      {/* Row 4 — confidence + date / status */}
      <div
        style={{
          marginTop: 11,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        {/* Left: confidence or status */}
        <div>
          {formulation.status === "complete" &&
          formulation.confidence_score !== undefined ? (
            <ConfidenceBar score={formulation.confidence_score} dark={dark} />
          ) : (
            <StatusDot status={formulation.status} />
          )}
        </div>

        {/* Right: relative date with tooltip */}
        <span
          title={getFullDate(formulation.updated_at)}
          style={{
            fontSize: 11,
            color: textSecondary,
            fontFamily: "var(--font-mono)",
            cursor: "default",
          }}
        >
          {getRelativeDate(formulation.updated_at)}
        </span>
      </div>
    </div>
  )

  if (!isClickable) return inner

  return (
    <Link
      href={`/formulations/${formulation.id}`}
      style={{ textDecoration: "none", display: "block" }}
    >
      {inner}
    </Link>
  )
}

function EmptyState({ dark }: { dark: boolean }) {
  return (
    <div
      style={{
        textAlign: "center",
        paddingTop: 80,
        paddingBottom: 80,
      }}
    >
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
      <div
        style={{
          marginTop: 4,
          fontSize: 13,
          color: "#6B7280",
        }}
      >
        Start by creating your first formulation.
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
        Start your first formulation →
      </Link>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export function MyFormulations() {
  const { dark } = useTheme()

  const [search, setSearch] = useState("")
  const [levelFilter, setLevelFilter] = useState("All")
  const [typeFilter, setTypeFilter] = useState("All")
  const [marketFilter, setMarketFilter] = useState("All")
  const [sortBy, setSortBy] = useState<SortKey>("newest")

  const textPrimary = dark ? "#F9FAFB" : "#0D1B2A"
  const textSecondary = dark ? "#9CA3AF" : "#6B7280"
  const borderColor = dark ? "#1F2937" : "#E5E7EB"
  const inputBg = dark ? "#111827" : "#FFFFFF"

  // Derive unique product types from data
  const productTypes = useMemo(() => {
    const types = Array.from(
      new Set(MOCK_FORMULATIONS.map((f) => f.product_type))
    ).sort()
    return ["All", ...types]
  }, [])

  const allMarkets = [
    "All",
    "EU",
    "US",
    "IN",
    "CN",
    "JP",
    "KR",
    "AU",
    "ASEAN",
  ]
  const levelOptions = ["All", "Quick", "Brief", "Dossier"]
  const sortOptions: { value: SortKey; label: string }[] = [
    { value: "newest", label: "Newest first" },
    { value: "oldest", label: "Oldest first" },
    { value: "name", label: "Name A–Z" },
    { value: "confidence", label: "Confidence ↓" },
  ]

  // Filter
  const filtered = useMemo(() => {
    let result = MOCK_FORMULATIONS.filter((f) => {
      if (
        search &&
        !f.name.toLowerCase().includes(search.toLowerCase())
      )
        return false
      if (levelFilter !== "All" && f.report_level !== levelFilter.toLowerCase())
        return false
      if (typeFilter !== "All" && f.product_type !== typeFilter) return false
      if (marketFilter !== "All" && !f.markets.includes(marketFilter))
        return false
      return true
    })

    // Sort
    if (sortBy === "oldest") {
      result = [...result].sort(
        (a, b) =>
          new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime()
      )
    } else if (sortBy === "name") {
      result = [...result].sort((a, b) => a.name.localeCompare(b.name))
    } else if (sortBy === "confidence") {
      result = [...result].sort(
        (a, b) => (b.confidence_score ?? 0) - (a.confidence_score ?? 0)
      )
    } else {
      // newest
      result = [...result].sort(
        (a, b) =>
          new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
      )
    }

    return result
  }, [search, levelFilter, typeFilter, marketFilter, sortBy])

  return (
    <>
      {/* Pulse animation for generating status */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
      `}</style>

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
            {MOCK_FORMULATIONS.length} formulations
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

      {/* Filter + sort bar */}
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
            placeholder="Search formulations..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              height: 34,
              width: 220,
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

        {/* Report Level */}
        <FilterSelect
          value={levelFilter}
          onChange={setLevelFilter}
          options={levelOptions}
          dark={dark}
        />

        {/* Product Type */}
        <FilterSelect
          value={typeFilter}
          onChange={setTypeFilter}
          options={productTypes}
          dark={dark}
        />

        {/* Market */}
        <FilterSelect
          value={marketFilter}
          onChange={setMarketFilter}
          options={allMarkets}
          dark={dark}
        />

        {/* Sort — pushed to the right */}
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

      {/* Result count when filtered */}
      {(search || levelFilter !== "All" || typeFilter !== "All" || marketFilter !== "All") && (
        <div style={{ fontSize: 11, color: textSecondary, marginBottom: 12 }}>
          {filtered.length === 0
            ? "No results"
            : `${filtered.length} result${filtered.length !== 1 ? "s" : ""}`}
        </div>
      )}

      {/* Grid or empty state */}
      {filtered.length > 0 ? (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: 14,
          }}
        >
          {filtered.map((f) => (
            <FormulationCard key={f.id} formulation={f} dark={dark} />
          ))}
        </div>
      ) : (
        <EmptyState dark={dark} />
      )}
    </>
  )
}
