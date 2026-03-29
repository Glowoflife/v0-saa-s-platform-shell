"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useTheme } from "@/components/theme-context"
import { Search, SlidersHorizontal, Download, Link2, Archive } from "lucide-react"

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type ReportLevel = "quick" | "brief" | "dossier"
type Status = "complete" | "draft" | "archived"

interface Formulation {
  id: string
  name: string
  productType: string
  format: string
  markets: string[]
  reportLevel: ReportLevel
  status: Status
  credits: number
  date: string
}

// ---------------------------------------------------------------------------
// Mock Data
// ---------------------------------------------------------------------------

const MOCK_FORMULATIONS: Formulation[] = [
  { id: "frm_001", name: "Brightening Serum — Phase 1", productType: "Brightening Serum", format: "Gel", markets: ["EU", "IN", "UK"], reportLevel: "dossier", status: "complete", credits: 5, date: "Mar 29, 2026" },
  { id: "frm_002", name: "Sulphate-Free Cleansing Gel", productType: "Cleanser", format: "Gel", markets: ["UK", "US"], reportLevel: "brief", status: "draft", credits: 3, date: "Mar 27, 2026" },
  { id: "frm_003", name: "Retinol Night Cream 0.3%", productType: "Night Cream", format: "Emulsion", markets: ["EU"], reportLevel: "brief", status: "complete", credits: 3, date: "Mar 25, 2026" },
  { id: "frm_004", name: "SPF 50 Sunscreen Lotion", productType: "Sunscreen", format: "Lotion", markets: ["AU", "US", "CN"], reportLevel: "quick", status: "draft", credits: 1, date: "Mar 24, 2026" },
  { id: "frm_005", name: "Hyaluronic Acid Toner", productType: "Toner", format: "Liquid", markets: ["KR", "JP"], reportLevel: "quick", status: "complete", credits: 1, date: "Mar 22, 2026" },
  { id: "frm_006", name: "Anti-Dandruff Shampoo", productType: "Shampoo", format: "Liquid", markets: ["US"], reportLevel: "dossier", status: "archived", credits: 5, date: "Mar 18, 2026" },
]

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const REPORT_LEVEL_LABELS: Record<ReportLevel, string> = {
  quick: "Quick Formula",
  brief: "Intelligence Brief",
  dossier: "Dossier",
}

const REPORT_LEVEL_STYLES: Record<ReportLevel, { bg: string; text: string }> = {
  quick: { bg: "#F3F4F6", text: "#374151" },
  brief: { bg: "#EEF2FF", text: "#4338CA" },
  dossier: { bg: "#FEF9C3", text: "#92400E" },
}

const STATUS_STYLES: Record<Status, { bg: string; text: string; label: string }> = {
  complete: { bg: "#D1FAE5", text: "#065F46", label: "Complete" },
  draft: { bg: "#FEF3C7", text: "#92400E", label: "Draft" },
  archived: { bg: "#F3F4F6", text: "#9CA3AF", label: "Archived" },
}

const MARKETS = ["All markets", "EU", "UK", "USA", "China", "Japan", "Korea", "India", "Australia", "Canada", "Brazil"]
const LEVELS = ["All levels", "Quick Formula", "Intelligence Brief", "Dossier"]

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function IconButton({ children, dark, onClick }: { children: React.ReactNode; dark: boolean; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        width: 28,
        height: 28,
        borderRadius: 6,
        border: "none",
        backgroundColor: "transparent",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: dark ? "#9CA3AF" : "#6B7280",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = dark ? "#1F2937" : "#F3F4F6")}
      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
    >
      {children}
    </button>
  )
}

function Select({ options, value, onChange, dark }: { options: string[]; value: string; onChange: (v: string) => void; dark: boolean }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={{
        height: 36,
        borderRadius: 8,
        border: `1px solid ${dark ? "#1F2937" : "#E5E7EB"}`,
        backgroundColor: dark ? "#111827" : "#FFFFFF",
        color: dark ? "#F9FAFB" : "#0D1B2A",
        fontSize: 12,
        padding: "0 12px",
        outline: "none",
        cursor: "pointer",
      }}
    >
      {options.map((opt) => (
        <option key={opt} value={opt}>{opt}</option>
      ))}
    </select>
  )
}

function StatusPill({ label, active, dark, onClick }: { label: string; active: boolean; dark: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        height: 32,
        borderRadius: 6,
        border: active ? "none" : `1px solid ${dark ? "#1F2937" : "#E5E7EB"}`,
        backgroundColor: active ? "#0D1B2A" : dark ? "#111827" : "#FFFFFF",
        color: active ? "#FFFFFF" : dark ? "#9CA3AF" : "#6B7280",
        fontSize: 12,
        fontWeight: 500,
        padding: "0 12px",
        cursor: "pointer",
      }}
    >
      {label}
    </button>
  )
}

function FormulationCard({ formulation, dark }: { formulation: Formulation; dark: boolean }) {
  const router = useRouter()
  const [name, setName] = useState(formulation.name)
  const [isEditing, setIsEditing] = useState(false)

  const levelStyle = REPORT_LEVEL_STYLES[formulation.reportLevel]
  const statusStyle = STATUS_STYLES[formulation.status]
  const borderColor = dark ? "#1F2937" : "#E5E7EB"
  const textPrimary = dark ? "#F9FAFB" : "#0D1B2A"
  const textSecondary = dark ? "#9CA3AF" : "#6B7280"

  const marketsDisplay = formulation.markets.slice(0, 4)
  const marketsOverflow = formulation.markets.length > 4 ? formulation.markets.length - 4 : 0

  return (
    <div
      onClick={() => !isEditing && router.push(`/formulations/${formulation.id}`)}
      style={{
        backgroundColor: dark ? "#111827" : "#FFFFFF",
        border: `1px solid ${borderColor}`,
        borderRadius: 10,
        padding: 20,
        cursor: isEditing ? "default" : "pointer",
        transition: "box-shadow 0.15s ease",
      }}
      onMouseEnter={(e) => !isEditing && (e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.08)")}
      onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "none")}
    >
      {/* Row 1 — badges */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{
          backgroundColor: levelStyle.bg,
          color: levelStyle.text,
          fontSize: 11,
          fontWeight: 500,
          letterSpacing: "0.04em",
          textTransform: "uppercase",
          borderRadius: 4,
          padding: "2px 8px",
        }}>
          {REPORT_LEVEL_LABELS[formulation.reportLevel]}
        </span>
        <span style={{
          backgroundColor: statusStyle.bg,
          color: statusStyle.text,
          fontSize: 11,
          fontWeight: 500,
          borderRadius: 4,
          padding: "2px 8px",
        }}>
          {statusStyle.label}
        </span>
      </div>

      {/* Row 2 — name */}
      <div
        contentEditable={isEditing}
        suppressContentEditableWarning
        onClick={(e) => { e.stopPropagation(); setIsEditing(true) }}
        onBlur={(e) => { setName(e.currentTarget.textContent || name); setIsEditing(false) }}
        onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); e.currentTarget.blur() } }}
        style={{
          marginTop: 12,
          fontSize: 15,
          fontWeight: 600,
          color: textPrimary,
          lineHeight: 1.3,
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
          outline: "none",
          cursor: "text",
        }}
      >
        {name}
      </div>

      {/* Row 3 — descriptor */}
      <div style={{ marginTop: 4, fontSize: 12, color: textSecondary }}>
        {formulation.productType} · {formulation.format} · <span style={{ fontFamily: "var(--font-mono)" }}>{formulation.markets.join(" + ")}</span>
      </div>

      {/* Row 4 — market chips */}
      <div style={{ marginTop: 10, display: "flex", gap: 4, flexWrap: "wrap" }}>
        {marketsDisplay.map((m) => (
          <span key={m} style={{
            fontSize: 10,
            textTransform: "uppercase",
            fontWeight: 500,
            borderRadius: 4,
            border: `1px solid ${borderColor}`,
            backgroundColor: dark ? "#1F2937" : "#F9FAFB",
            color: dark ? "#D1D5DB" : "#374151",
            padding: "2px 6px",
          }}>
            {m}
          </span>
        ))}
        {marketsOverflow > 0 && (
          <span style={{
            fontSize: 10,
            fontWeight: 500,
            borderRadius: 4,
            border: `1px solid ${borderColor}`,
            backgroundColor: dark ? "#1F2937" : "#F9FAFB",
            color: textSecondary,
            padding: "2px 6px",
          }}>
            +{marketsOverflow} more
          </span>
        )}
      </div>

      {/* Row 5 — divider */}
      <div style={{ marginTop: 14, height: 1, backgroundColor: dark ? "#1F2937" : "#F3F4F6" }} />

      {/* Row 6 — meta row */}
      <div style={{ marginTop: 12, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ fontSize: 11, fontFamily: "var(--font-mono)" }}>
          <span style={{ color: "#D4A843", fontWeight: 500 }}>{formulation.credits} cr</span>
          <span style={{ color: textSecondary }}> · {formulation.date}</span>
        </div>
        <div style={{ display: "flex", gap: 4 }} onClick={(e) => e.stopPropagation()}>
          <IconButton dark={dark}><Download size={14} /></IconButton>
          <IconButton dark={dark}><Link2 size={14} /></IconButton>
          <IconButton dark={dark}><Archive size={14} /></IconButton>
        </div>
      </div>
    </div>
  )
}

function EmptyState({ dark }: { dark: boolean }) {
  const router = useRouter()
  return (
    <div style={{ textAlign: "center", paddingTop: 60 }}>
      <div style={{ width: 48, height: 48, margin: "0 auto", color: "#D1D5DB" }}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M9 3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-4M14 3h7m0 0v7m0-7L10 14" />
        </svg>
      </div>
      <div style={{ marginTop: 16, fontSize: 16, fontWeight: 600, color: dark ? "#D1D5DB" : "#374151" }}>
        No formulations yet
      </div>
      <div style={{ marginTop: 4, fontSize: 13, color: "#6B7280" }}>
        Start your first formulation to see it here.
      </div>
      <button
        onClick={() => router.push("/new-formulation")}
        style={{
          marginTop: 16,
          backgroundColor: "#D4A843",
          color: "#0D1B2A",
          fontWeight: 600,
          fontSize: 13,
          height: 36,
          borderRadius: 8,
          border: "none",
          padding: "0 16px",
          cursor: "pointer",
        }}
      >
        New Formulation →
      </button>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export function MyFormulations() {
  const { dark } = useTheme()
  const router = useRouter()

  const [search, setSearch] = useState("")
  const [levelFilter, setLevelFilter] = useState("All levels")
  const [marketFilter, setMarketFilter] = useState("All markets")
  const [statusFilter, setStatusFilter] = useState<"all" | Status>("all")
  const [sortBy, setSortBy] = useState<"recent" | "oldest" | "name">("recent")

  const bgColor = dark ? "#0A0F1A" : "#F4F6F9"
  const textPrimary = dark ? "#F9FAFB" : "#0D1B2A"
  const textSecondary = dark ? "#9CA3AF" : "#6B7280"
  const borderColor = dark ? "#1F2937" : "#E5E7EB"

  // Filter formulations
  let filtered = MOCK_FORMULATIONS.filter((f) => {
    if (search && !f.name.toLowerCase().includes(search.toLowerCase())) return false
    if (levelFilter !== "All levels" && REPORT_LEVEL_LABELS[f.reportLevel] !== levelFilter) return false
    if (marketFilter !== "All markets" && !f.markets.includes(marketFilter === "USA" ? "US" : marketFilter)) return false
    if (statusFilter !== "all" && f.status !== statusFilter) return false
    return true
  })

  // Sort
  if (sortBy === "oldest") {
    filtered = [...filtered].reverse()
  } else if (sortBy === "name") {
    filtered = [...filtered].sort((a, b) => a.name.localeCompare(b.name))
  }

  return (
    <div style={{ backgroundColor: bgColor, minHeight: "100vh", padding: 24 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: textPrimary, margin: 0 }}>My Formulations</h1>
          <p style={{ fontSize: 13, color: textSecondary, marginTop: 2 }}>27 formulations across 9 projects</p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={() => router.push("/new-formulation")}
            style={{
              backgroundColor: "#D4A843",
              color: "#0D1B2A",
              fontWeight: 600,
              fontSize: 13,
              height: 36,
              borderRadius: 8,
              border: "none",
              padding: "0 16px",
              cursor: "pointer",
            }}
          >
            New Formulation →
          </button>
          <button
            style={{
              width: 36,
              height: 36,
              borderRadius: 8,
              border: `1px solid ${borderColor}`,
              backgroundColor: dark ? "#111827" : "#FFFFFF",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <SlidersHorizontal size={16} style={{ color: textSecondary }} />
          </button>
        </div>
      </div>

      {/* Filter bar */}
      <div style={{ marginTop: 20, display: "flex", gap: 8, alignItems: "center" }}>
        {/* Search */}
        <div style={{ position: "relative", width: 240 }}>
          <Search size={14} style={{ position: "absolute", left: 12, top: 11, color: textSecondary }} />
          <input
            type="text"
            placeholder="Search formulations..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: "100%",
              height: 36,
              borderRadius: 8,
              border: `1px solid ${borderColor}`,
              backgroundColor: dark ? "#111827" : "#FFFFFF",
              color: textPrimary,
              fontSize: 12,
              paddingLeft: 34,
              paddingRight: 12,
              outline: "none",
            }}
          />
        </div>

        <Select options={LEVELS} value={levelFilter} onChange={setLevelFilter} dark={dark} />
        <Select options={MARKETS} value={marketFilter} onChange={setMarketFilter} dark={dark} />

        {/* Status pills */}
        <div style={{ display: "flex", gap: 4, marginLeft: 8 }}>
          {(["all", "draft", "complete", "archived"] as const).map((s) => (
            <StatusPill
              key={s}
              label={s === "all" ? "All" : s.charAt(0).toUpperCase() + s.slice(1)}
              active={statusFilter === s}
              dark={dark}
              onClick={() => setStatusFilter(s)}
            />
          ))}
        </div>
      </div>

      {/* Sort bar */}
      <div style={{ marginTop: 12, fontSize: 12, color: textSecondary, display: "flex", alignItems: "center", gap: 8 }}>
        <span>Sorted by:</span>
        {(["recent", "oldest", "name"] as const).map((s) => (
          <button
            key={s}
            onClick={() => setSortBy(s)}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: 12,
              fontWeight: sortBy === s ? 600 : 400,
              color: sortBy === s ? textPrimary : textSecondary,
              padding: 0,
            }}
          >
            {s === "recent" ? "Most recent" : s === "oldest" ? "Oldest" : "Name A–Z"}
          </button>
        ))}
      </div>

      {/* Grid or empty state */}
      {filtered.length > 0 ? (
        <div style={{
          marginTop: 16,
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 16,
        }}>
          {filtered.map((f) => (
            <FormulationCard key={f.id} formulation={f} dark={dark} />
          ))}
        </div>
      ) : (
        <EmptyState dark={dark} />
      )}
    </div>
  )
}
