"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useTheme } from "@/components/theme-context"
import { Download, Bookmark, Share2, Flag, Info, AlertTriangle, Check, ChevronDown } from "lucide-react"

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type Phase = "A" | "B" | "C" | "D"

interface FormulaRow {
  inci: string
  phase: Phase
  pct: string
  fn: string
  qs?: boolean
  note?: { text: string; color: "amber" | "grey" }
}

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------

const ROWS: FormulaRow[] = [
  { inci: "Aqua", phase: "A", pct: "to 100%", fn: "Solvent", qs: true },
  { inci: "Glycerin", phase: "A", pct: "5.00", fn: "Humectant" },
  { inci: "Propanediol", phase: "A", pct: "3.00", fn: "Humectant / solvent" },
  { inci: "Niacinamide", phase: "A", pct: "4.00", fn: "Brightening, pore-minimising" },
  { inci: "Sodium Hyaluronate", phase: "A", pct: "0.20", fn: "Film-former, humectant" },
  {
    inci: "Hydroxyethyl Acrylate/Sodium Acryloyldimethyl Taurate Copolymer",
    phase: "A",
    pct: "1.20",
    fn: "Rheology modifier",
  },
  { inci: "Centella Asiatica Extract", phase: "B", pct: "2.00", fn: "Soothing, anti-inflammatory" },
  { inci: "Bakuchiol", phase: "B", pct: "0.50", fn: "Retinol-alternative, anti-ageing" },
  { inci: "Panthenol", phase: "B", pct: "1.00", fn: "Hydration, barrier repair" },
  { inci: "Tocopheryl Acetate", phase: "B", pct: "0.50", fn: "Antioxidant" },
  {
    inci: "Phenoxyethanol, Ethylhexylglycerin",
    phase: "C",
    pct: "1.00",
    fn: "Preservation",
    note: { text: "COSMOS-listed grade required", color: "amber" },
  },
  {
    inci: "Sodium Hydroxide",
    phase: "C",
    pct: "0.30",
    fn: "pH adjuster",
    note: { text: "max 0.5%", color: "grey" },
  },
]

const PHASE_ROW_BG: Record<Phase, string> = {
  A: "rgba(219,234,254,0.15)",
  B: "rgba(187,247,208,0.15)",
  C: "rgba(253,230,138,0.12)",
  D: "rgba(221,214,254,0.12)",
}
const PHASE_DARK_ROW_BG: Record<Phase, string> = {
  A: "rgba(219,234,254,0.04)",
  B: "rgba(187,247,208,0.04)",
  C: "rgba(253,230,138,0.04)",
  D: "rgba(221,214,254,0.04)",
}
const PHASE_BADGE: Record<Phase, { bg: string; color: string }> = {
  A: { bg: "#1E3A8A", color: "#BFDBFE" },
  B: { bg: "#14532D", color: "#BBF7D0" },
  C: { bg: "#78350F", color: "#FDE68A" },
  D: { bg: "#4C1D95", color: "#DDD6FE" },
}

const MARKETS = [
  { flag: "🇪🇺", name: "EU", dot: "#2D6A4F", label: "Compliant", labelColor: "#2D6A4F" },
  { flag: "🇬🇧", name: "UK", dot: "#2D6A4F", label: "Compliant", labelColor: "#2D6A4F" },
  { flag: "🇮🇳", name: "India", dot: "#B45309", label: "Review needed", labelColor: "#B45309" },
  { flag: "🇺🇸", name: "US", dot: "#2D6A4F", label: "Compliant", labelColor: "#2D6A4F" },
  { flag: "🇨🇳", name: "China", dot: "#991B1B", label: "Data missing", labelColor: "#991B1B" },
]

const CONFIDENCE = [
  {
    label: "Stability",
    pct: 82,
    color: "#B45309",
    note: "Emulsifier at lower threshold for this oil load. Consider increasing to 5.5%.",
  },
  { label: "Performance", pct: 91, color: "#2D6A4F", note: null },
  {
    label: "Regulatory",
    pct: 76,
    color: "#B45309",
    note: "CDSCO India requires clinical substantiation for brightening claims.",
  },
]

// ---------------------------------------------------------------------------
// Helper sub-components
// ---------------------------------------------------------------------------

function SectionLabel({ children }: { children: string }) {
  return (
    <div
      style={{
        fontSize: 11,
        fontWeight: 500,
        letterSpacing: "0.06em",
        textTransform: "uppercase",
        color: "#6B7280",
        marginBottom: 16,
      }}
    >
      {children}
    </div>
  )
}

function Card({ children, dark, style }: { children: React.ReactNode; dark: boolean; style?: React.CSSProperties }) {
  return (
    <div
      style={{
        backgroundColor: dark ? "#0D1B2A" : "#FFFFFF",
        border: `1px solid ${dark ? "#1B3A5C" : "#E5E7EB"}`,
        borderRadius: 10,
        ...style,
      }}
    >
      {children}
    </div>
  )
}

function IconBtn({ icon: Icon, dark }: { icon: React.ElementType; dark: boolean }) {
  return (
    <button
      style={{
        width: 32,
        height: 32,
        border: `1px solid ${dark ? "#1B3A5C" : "#E5E7EB"}`,
        borderRadius: 6,
        backgroundColor: dark ? "#0D1B2A" : "#FFFFFF",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Icon size={14} style={{ color: dark ? "#9CA3AF" : "#6B7280" }} />
    </button>
  )
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Testing Protocol expandable card
// ---------------------------------------------------------------------------

function MarketBadge({ label }: { label: string }) {
  return (
    <span style={{
      backgroundColor: "#F4F6F9",
      border: "1px solid #E5E7EB",
      borderRadius: 4,
      fontSize: 10,
      fontWeight: 500,
      color: "#6B7280",
      padding: "1px 6px",
      whiteSpace: "nowrap",
    }}>
      {label}
    </span>
  )
}

function TestRow({ name, market }: { name: string; market: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 6 }}>
      <span style={{ fontSize: 12, color: "#0D1B2A" }}>{name}</span>
      <MarketBadge label={market} />
    </div>
  )
}

function TestSection({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginTop: 8 }}>
      <div style={{
        fontSize: 10,
        fontWeight: 500,
        letterSpacing: "0.06em",
        textTransform: "uppercase" as const,
        color: "#6B7280",
        marginBottom: 2,
      }}>
        {label}
      </div>
      {children}
    </div>
  )
}

function TestingProtocolCard({ dark, textSecondary, textPrimary }: { dark: boolean; textSecondary: string; textPrimary: string }) {
  const [expanded, setExpanded] = useState(false)
  return (
    <Card dark={dark} style={{ padding: "16px 20px" }}>
      <button
        onClick={() => setExpanded((v) => !v)}
        style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", background: "none", border: "none", padding: 0, cursor: "pointer" }}
      >
        <span style={{ fontSize: 11, fontWeight: 500, letterSpacing: "0.06em", textTransform: "uppercase", color: "#6B7280" }}>
          Testing Protocol
        </span>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: 12, color: textSecondary }}>8 tests recommended · EU + IN</span>
          <ChevronDown
            size={14}
            style={{ color: textSecondary, transform: expanded ? "rotate(180deg)" : "rotate(0deg)" }}
          />
        </div>
      </button>

      {expanded && (
        <div style={{ marginTop: 12 }}>
          <TestSection label="Mandatory Safety">
            <TestRow name="Safety Assessment (EU Art. 10)" market="EU" />
            <TestRow name="Challenge Test (ISO 11930)" market="EU + IN" />
            <TestRow name="Stability: Accelerated + Freeze-Thaw" market="All markets" />
          </TestSection>

          <TestSection label="Claims Substantiation">
            <TestRow name="Corneometer CM825 (moisturisation 24h)" market="EU + IN" />
            <TestRow name="Mexameter MX18 (melanin index, brightening)" market="IN" />
            <TestRow name="Chromameter CR400 (skin tone)" market="IN" />
          </TestSection>

          <TestSection label="India (CDSCO)">
            <TestRow name="Clinical evidence for brightening claim" market="IN" />
            <TestRow name="Dermatologist-tested documentation" market="IN" />
          </TestSection>
        </div>
      )}
    </Card>
  )
}

export function FormulaOutput() {
  const { dark } = useTheme()
  const router = useRouter()
  const [activeVariant, setActiveVariant] = useState<"A" | "B" | "C">("A")
  const [tooltip, setTooltip] = useState(false)

  const bg = dark ? "#0A1628" : "#F4F6F9"
  const cardBg = dark ? "#0D1B2A" : "#FFFFFF"
  const cardBorder = dark ? "#1B3A5C" : "#E5E7EB"
  const textPrimary = dark ? "#F9FAFB" : "#0D1B2A"
  const textSecondary = dark ? "#9CA3AF" : "#6B7280"

  return (
    <div style={{ backgroundColor: bg }}>
      {/* ------------------------------------------------------------------ */}
      {/* Action bar                                                           */}
      {/* ------------------------------------------------------------------ */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 20,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 18, fontWeight: 500, color: textPrimary }}>
            Brightening Serum — Variant A
          </span>
          <span
            style={{
              backgroundColor: dark ? "#1B3A5C" : "#F3F4F6",
              color: textSecondary,
              fontSize: 11,
              borderRadius: 4,
              padding: "2px 8px",
            }}
          >
            v1
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <IconBtn icon={Download} dark={dark} />
          <IconBtn icon={Bookmark} dark={dark} />
          <IconBtn icon={Share2} dark={dark} />
          <button
            onClick={() => router.push("/new-formulation")}
            style={{
              backgroundColor: "#D4A843",
              color: "#0D1B2A",
              fontSize: 13,
              fontWeight: 500,
              height: 32,
              borderRadius: 6,
              padding: "0 16px",
              border: "none",
              cursor: "pointer",
            }}
          >
            Rework this formulation →
          </button>
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Badge row                                                            */}
      {/* ------------------------------------------------------------------ */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
        <span style={{ backgroundColor: "#D1FAE5", color: "#065F46", fontSize: 11, borderRadius: 4, padding: "3px 8px" }}>
          NATURAL
        </span>
        <div style={{ position: "relative" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 5,
              backgroundColor: dark ? "#1B3A5C" : "#F3F4F6",
              color: textSecondary,
              fontSize: 11,
              borderRadius: 4,
              padding: "3px 8px",
              cursor: "default",
            }}
            onMouseEnter={() => setTooltip(true)}
            onMouseLeave={() => setTooltip(false)}
          >
            <Flag size={10} />
            <span>COSMOS TARGET</span>
            <Info size={10} />
          </div>
          {tooltip && (
            <div
              style={{
                position: "absolute",
                top: "calc(100% + 6px)",
                left: 0,
                zIndex: 20,
                backgroundColor: dark ? "#1B3A5C" : "#0D1B2A",
                color: "#FFFFFF",
                fontSize: 11,
                lineHeight: 1.5,
                borderRadius: 6,
                padding: "8px 12px",
                width: 280,
                boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
              }}
            >
              Targeting COSMOS Natural. Certification requires Ecocert-certified ingredient grades and finished product assessment.
            </div>
          )}
        </div>
        <span style={{ backgroundColor: "#DBEAFE", color: "#1E40AF", fontSize: 11, borderRadius: 4, padding: "3px 8px" }}>
          EU · UK · IN
        </span>
        <span style={{ backgroundColor: dark ? "#1B3A5C" : "#F3F4F6", color: textSecondary, fontSize: 11, borderRadius: 4, padding: "3px 8px" }}>
          LEAVE-ON
        </span>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Variant tab bar                                                      */}
      {/* ------------------------------------------------------------------ */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 0 }}>
            {(["A", "B", "C"] as const).map((v) => {
              const isActive = activeVariant === v
              return (
                <button
                  key={v}
                  onClick={() => setActiveVariant(v)}
                  style={{
                    fontSize: 13,
                    fontWeight: isActive ? 500 : 400,
                    color: isActive ? textPrimary : textSecondary,
                    background: "none",
                    border: "none",
                    borderBottom: isActive ? "2px solid #D4A843" : "2px solid transparent",
                    padding: "6px 16px 8px",
                    cursor: "pointer",
                  }}
                >
                  Variant {v}
                </button>
              )
            })}
          </div>
          <span style={{ fontSize: 12, color: "#D4A843", cursor: "pointer" }}>
            Compare variants →
          </span>
        </div>
        <div style={{ marginTop: 6, fontSize: 11, color: "#9CA3AF" }}>
          All 3 variants generated from 1 credit · switch freely at no cost
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Two-column layout                                                    */}
      {/* ------------------------------------------------------------------ */}
      <div style={{ display: "flex", gap: 24, alignItems: "flex-start" }}>

        {/* ============================================================== */}
        {/* LEFT COLUMN — 58%                                               */}
        {/* ============================================================== */}
        <div style={{ flex: "0 0 58%", minWidth: 0 }}>

          {/* INCI Formula Table */}
          <Card dark={dark} style={{ overflow: "hidden" }}>
            {/* Table header */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 56px 80px 1fr",
                backgroundColor: dark ? "#071422" : "#F9FAFB",
                borderBottom: `1px solid ${cardBorder}`,
                padding: "10px 16px",
              }}
            >
              {["INCI NAME", "PHASE", "%", "FUNCTION"].map((h) => (
                <span
                  key={h}
                  style={{
                    fontSize: 11,
                    fontWeight: 500,
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                    color: "#6B7280",
                  }}
                >
                  {h}
                </span>
              ))}
            </div>

            {/* Rows */}
            {ROWS.map((row, i) => (
              <div
                key={i}
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 56px 80px 1fr",
                  padding: "10px 16px",
                  backgroundColor: dark ? PHASE_DARK_ROW_BG[row.phase] : PHASE_ROW_BG[row.phase],
                  borderBottom: i < ROWS.length - 1 ? `1px solid ${dark ? "rgba(27,58,92,0.5)" : "#F3F4F6"}` : "none",
                  alignItems: "flex-start",
                }}
              >
                {/* INCI name */}
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                    <span
                      style={{
                        fontFamily: "var(--font-mono, 'JetBrains Mono', monospace)",
                        fontSize: 12,
                        color: textPrimary,
                      }}
                    >
                      {row.inci}
                    </span>
                    {row.qs && (
                      <span
                        style={{
                          backgroundColor: dark ? "#374151" : "#F3F4F6",
                          color: textSecondary,
                          fontSize: 9,
                          borderRadius: 3,
                          padding: "1px 5px",
                        }}
                      >
                        q.s.
                      </span>
                    )}
                  </div>
                  {row.note && (
                    <div
                      style={{
                        fontSize: 10,
                        marginTop: 2,
                        color: row.note.color === "amber" ? "#B45309" : "#9CA3AF",
                      }}
                    >
                      {row.note.text}
                    </div>
                  )}
                </div>

                {/* Phase badge */}
                <div>
                  <span
                    style={{
                      backgroundColor: PHASE_BADGE[row.phase].bg,
                      color: PHASE_BADGE[row.phase].color,
                      fontSize: 10,
                      fontWeight: 600,
                      borderRadius: 4,
                      padding: "2px 6px",
                    }}
                  >
                    {row.phase}
                  </span>
                </div>

                {/* Percentage */}
                <span
                  style={{
                    fontSize: 13,
                    fontVariantNumeric: "tabular-nums",
                    color: textPrimary,
                  }}
                >
                  {row.pct}
                </span>

                {/* Function */}
                <span style={{ fontSize: 12, color: textSecondary }}>
                  {row.fn}
                </span>
              </div>
            ))}

            {/* Footer */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                borderTop: `1px solid ${cardBorder}`,
                padding: "10px 16px",
                backgroundColor: dark ? "#071422" : "#F9FAFB",
              }}
            >
              <span style={{ fontSize: 11, fontWeight: 500, letterSpacing: "0.06em", textTransform: "uppercase", color: "#6B7280" }}>
                TOTAL
              </span>
              <span style={{ fontSize: 13, fontWeight: 600, color: textPrimary }}>
                100.00<span style={{ fontWeight: 400, color: "#6B7280" }}>%</span>
              </span>
            </div>
          </Card>

          {/* Processing Protocol */}
          <Card dark={dark} style={{ padding: 20, marginTop: 16 }}>
            <SectionLabel>Processing Protocol</SectionLabel>

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>

              {/* Step 1 */}
              <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                <div style={{ width: 20, height: 20, borderRadius: "50%", backgroundColor: dark ? "#1B3A5C" : "#F3F4F6", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>
                  <span style={{ fontSize: 11, color: "#6B7280" }}>1</span>
                </div>
                <p style={{ fontSize: 13, color: dark ? "#D1D5DB" : "#4B5563", margin: 0, lineHeight: 1.6 }}>
                  Heat Phase A water to 75°C with moderate stirring. Disperse{" "}
                  <span style={{ fontFamily: "var(--font-mono, 'JetBrains Mono', monospace)", fontSize: 12 }}>
                    Hydroxyethyl Acrylate/Sodium Acryloyldimethyl Taurate Copolymer
                  </span>{" "}
                  in glycerin before adding to water phase — pre-disperse in{" "}
                  <span style={{ fontFamily: "var(--font-mono, 'JetBrains Mono', monospace)", fontSize: 12 }}>
                    Propanediol
                  </span>{" "}
                  to avoid lumping.
                </p>
              </div>

              {/* Step 2 */}
              <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                <div style={{ width: 20, height: 20, borderRadius: "50%", backgroundColor: dark ? "#1B3A5C" : "#F3F4F6", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>
                  <span style={{ fontSize: 11, color: "#6B7280" }}>2</span>
                </div>
                <p style={{ fontSize: 13, color: dark ? "#D1D5DB" : "#4B5563", margin: 0, lineHeight: 1.6 }}>
                  Combine Phase B ingredients —{" "}
                  <span style={{ fontFamily: "var(--font-mono, 'JetBrains Mono', monospace)", fontSize: 12 }}>Centella Asiatica Extract</span>,{" "}
                  <span style={{ fontFamily: "var(--font-mono, 'JetBrains Mono', monospace)", fontSize: 12 }}>Bakuchiol</span>,{" "}
                  <span style={{ fontFamily: "var(--font-mono, 'JetBrains Mono', monospace)", fontSize: 12 }}>Panthenol</span>,{" "}
                  <span style={{ fontFamily: "var(--font-mono, 'JetBrains Mono', monospace)", fontSize: 12 }}>Tocopheryl Acetate</span>. Mix at 40°C until uniform.
                </p>
              </div>

              {/* Step 3 — CRITICAL amber */}
              <div
                style={{
                  borderLeft: "3px solid #B45309",
                  backgroundColor: dark ? "#1C1207" : "#FFFBEB",
                  borderRadius: 6,
                  padding: "10px 12px",
                  display: "flex",
                  gap: 10,
                  alignItems: "flex-start",
                }}
              >
                <AlertTriangle size={14} style={{ color: "#B45309", flexShrink: 0, marginTop: 2 }} />
                <p style={{ fontSize: 13, color: dark ? "#FDE68A" : "#92400E", margin: 0, lineHeight: 1.6 }}>
                  Add Phase B to Phase A with high-shear mixing at 5,000–8,000 RPM for minimum 3 minutes. Insufficient shear is the primary cause of instability in this system.
                </p>
              </div>

              {/* Step 4 */}
              <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                <div style={{ width: 20, height: 20, borderRadius: "50%", backgroundColor: dark ? "#1B3A5C" : "#F3F4F6", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>
                  <span style={{ fontSize: 11, color: "#6B7280" }}>4</span>
                </div>
                <p style={{ fontSize: 13, color: dark ? "#D1D5DB" : "#4B5563", margin: 0, lineHeight: 1.6 }}>
                  Cool to below 40°C before Phase C addition. Do not add preservative system above 40°C.
                </p>
              </div>

              {/* Step 5 */}
              <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                <div style={{ width: 20, height: 20, borderRadius: "50%", backgroundColor: dark ? "#1B3A5C" : "#F3F4F6", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>
                  <span style={{ fontSize: 11, color: "#6B7280" }}>5</span>
                </div>
                <p style={{ fontSize: 13, color: dark ? "#D1D5DB" : "#4B5563", margin: 0, lineHeight: 1.6 }}>
                  Add{" "}
                  <span style={{ fontFamily: "var(--font-mono, 'JetBrains Mono', monospace)", fontSize: 12 }}>Phenoxyethanol/Ethylhexylglycerin</span>. Mix gently until homogeneous. Add NaOH solution dropwise to adjust pH.
                </p>
              </div>

              {/* Step 6 — QC green */}
              <div
                style={{
                  borderLeft: "3px solid #2D6A4F",
                  backgroundColor: dark ? "#071A0E" : "#F0FDF4",
                  borderRadius: 6,
                  padding: "10px 12px",
                  display: "flex",
                  gap: 10,
                  alignItems: "flex-start",
                }}
              >
                <Check size={14} style={{ color: "#2D6A4F", flexShrink: 0, marginTop: 2 }} />
                <p style={{ fontSize: 13, color: dark ? "#BBF7D0" : "#166534", margin: 0, lineHeight: 1.6 }}>
                  Quality check: pH 5.5–6.0 · Viscosity 4,000–8,000 cPs · Appearance homogeneous · No phase separation
                </p>
              </div>

            </div>
          </Card>
        </div>

        {/* ============================================================== */}
        {/* RIGHT COLUMN — 42%                                              */}
        {/* ============================================================== */}
        <div style={{ flex: "0 0 calc(42% - 24px)", minWidth: 0, display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Confidence Scores */}
          <Card dark={dark} style={{ padding: 20 }}>
            <SectionLabel>Confidence Scores</SectionLabel>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {CONFIDENCE.map((c) => (
                <div key={c.label}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                    <span style={{ fontSize: 13, fontWeight: 500, color: textPrimary }}>{c.label}</span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: textPrimary }}>{c.pct}%</span>
                  </div>
                  <div style={{ height: 6, borderRadius: 3, backgroundColor: dark ? "#1B3A5C" : "#F3F4F6" }}>
                    <div style={{ width: `${c.pct}%`, height: "100%", borderRadius: 3, backgroundColor: c.color }} />
                  </div>
                  {c.note && (
                    <div style={{ fontSize: 11, color: "#6B7280", marginTop: 5, lineHeight: 1.5 }}>{c.note}</div>
                  )}
                </div>
              ))}
            </div>
          </Card>

          {/* Regulatory Status */}
          <Card dark={dark} style={{ padding: 20 }}>
            <SectionLabel>Regulatory Status</SectionLabel>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {MARKETS.map((m) => (
                <div key={m.name} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 16, lineHeight: 1 }}>{m.flag}</span>
                  <span style={{ fontSize: 13, color: textPrimary, flex: 1 }}>{m.name}</span>
                  <span
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      backgroundColor: m.dot,
                      flexShrink: 0,
                    }}
                  />
                  <span style={{ fontSize: 13, color: m.labelColor, minWidth: 100, textAlign: "right" }}>{m.label}</span>
                </div>
              ))}
            </div>
            <a href="#" style={{ display: "block", marginTop: 12, fontSize: 12, color: "#D4A843", textDecoration: "none" }}>
              View full regulatory report →
            </a>
          </Card>

          {/* Market Intelligence */}
          <Card dark={dark} style={{ padding: 20 }}>
            <SectionLabel>Market Intelligence</SectionLabel>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {/* Blue */}
              <div style={{ borderLeft: "3px solid #1E40AF", backgroundColor: dark ? "#071524" : "#EFF6FF", borderRadius: 6, padding: 12 }}>
                <p style={{ fontSize: 12, color: dark ? "#BFDBFE" : "#4B5563", margin: 0, lineHeight: 1.6 }}>
                  3,847 Asia-Pacific brightening products with Niacinamide — 78% include Centella Asiatica ✓ · 64% include Sodium Hyaluronate at 0.1–0.3% ✓
                </p>
              </div>
              {/* Amber */}
              <div style={{ borderLeft: "3px solid #B45309", backgroundColor: dark ? "#1C1207" : "#FFFBEB", borderRadius: 6, padding: 12 }}>
                <p style={{ fontSize: 12, color: dark ? "#FDE68A" : "#4B5563", margin: 0, lineHeight: 1.6, marginBottom: 6 }}>
                  Bakuchiol +340% new product launch mentions in 18 months. Your 0.50% is within 75th percentile of premium serums.
                </p>
                <a href="#" style={{ fontSize: 11, color: "#D4A843", textDecoration: "none" }}>
                  Increase to 1.0% for stronger positioning →
                </a>
              </div>
              {/* Green */}
              <div style={{ borderLeft: "3px solid #2D6A4F", backgroundColor: dark ? "#071A0E" : "#F0FDF4", borderRadius: 6, padding: 12 }}>
                <p style={{ fontSize: 12, color: dark ? "#BBF7D0" : "#4B5563", margin: 0, lineHeight: 1.6, marginBottom: 6 }}>
                  No mainstream India product (natural, brightening) combines Centella + Bakuchiol + Niacinamide. Open market opportunity.
                </p>
                <a href="#" style={{ fontSize: 11, color: "#D4A843", textDecoration: "none" }}>
                  Note this white space →
                </a>
              </div>
            </div>
          </Card>

          {/* Projected Claims */}
          <Card dark={dark} style={{ padding: 20 }}>
            <SectionLabel>Projected Claims</SectionLabel>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {/* Row 1 */}
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: "#2D6A4F", flexShrink: 0 }} />
                  <span style={{ fontSize: 13, color: textPrimary, flex: 1 }}>Deep Moisturisation (24h)</span>
                  <span style={{ backgroundColor: "#D1FAE5", color: "#065F46", fontSize: 10, fontWeight: 600, borderRadius: 4, padding: "2px 6px" }}>STRONG</span>
                </div>
              </div>
              {/* Row 2 */}
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: "#B45309", flexShrink: 0 }} />
                  <span style={{ fontSize: 13, color: textPrimary, flex: 1 }}>Visibly Brighter Skin in 14 Days</span>
                  <span style={{ backgroundColor: "#FEF3C7", color: "#92400E", fontSize: 10, fontWeight: 600, borderRadius: 4, padding: "2px 6px" }}>MODERATE</span>
                </div>
                <div style={{ fontSize: 11, color: "#6B7280", marginTop: 3, marginLeft: 16 }}>
                  Niacinamide at 5%+ strengthens this claim
                </div>
              </div>
              {/* Row 3 */}
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: "#2D6A4F", flexShrink: 0 }} />
                  <span style={{ fontSize: 13, color: textPrimary, flex: 1 }}>No prohibited substances detected · EU Annex II clear</span>
                  <span style={{ backgroundColor: "#D1FAE5", color: "#065F46", fontSize: 10, fontWeight: 600, borderRadius: 4, padding: "2px 6px" }}>VERIFIED</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Testing Protocol — expandable */}
          <TestingProtocolCard dark={dark} textSecondary={textSecondary} textPrimary={textPrimary} />

        </div>
      </div>
    </div>
  )
}
