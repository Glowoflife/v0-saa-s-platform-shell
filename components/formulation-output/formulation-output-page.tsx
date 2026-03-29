"use client"

import React, { useState, useEffect } from "react"
import Image from "next/image"
import { useTheme } from "@/components/theme-context"
import { Copy, Share2, RotateCcw, ChevronDown, Check, FileText, Bookmark } from "lucide-react"

// ---------------------------------------------------------------------------
// Dev flag — set false before shipping
// ---------------------------------------------------------------------------
const IS_DEV = true

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
type ReportLevel = "quick" | "brief" | "dossier"
type ConfidenceLevel = "high" | "medium" | "low" | null
type RegStatus = "pass" | "warning" | "fail"

interface Ingredient {
  inci: string
  phase: "A" | "B" | "C"
  pct: string
  function: string
  safety_score: number | null
  confidence: ConfidenceLevel
  isSystem?: boolean
  systemComponents?: { inci: string; pct: string; note: string }[]
}

interface RegulatoryItem {
  market: string
  status: RegStatus
  notes: string
}

interface MarketIntelItem {
  ingredient: string
  coOccurrence: number
  market: string
  note: string
}

interface SafetyItem {
  inci: string
  score: number
  confidence: ConfidenceLevel
  note: string
}

interface Variant {
  id: string
  label: string
  approach: string | null
  generated: boolean
  ingredients: Ingredient[]
  regulatoryStatus?: RegulatoryItem[]
  formulationNotes?: string[]
  preservationRationale?: string
  marketIntelligence?: MarketIntelItem[]
  safetyOverview?: SafetyItem[]
}

interface FormulaData {
  id: string
  name: string
  reportLevel: ReportLevel
  version: number
  createdAt: string
  user: string
  organisation: string
  markets: string[]
  productType: string
  preservationStrategy: string
  variants: Variant[]
}

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------
const MOCK_FORMULA: FormulaData = {
  id: "frm_001",
  name: "Acne-Control Gel Cleanser",
  reportLevel: "brief",
  version: 1,
  createdAt: "2026-03-29",
  user: "Jeevan R.",
  organisation: "Aurentis Science",
  markets: ["EU", "IN"],
  productType: "Cleanser",
  preservationStrategy: "Natural/hurdle",
  variants: [
    {
      id: "var_a",
      label: "Variant A",
      approach: "Balanced formulation",
      generated: true,
      ingredients: [
        { inci: "Aqua", phase: "A", pct: "q.s.", function: "Solvent", safety_score: null, confidence: "high" },
        { inci: "Glycerin", phase: "A", pct: "3.00", function: "Humectant", safety_score: 1.2, confidence: "high" },
        { inci: "Sodium Cocoyl Isethionate", phase: "A", pct: "12.00", function: "Primary surfactant", safety_score: 2.1, confidence: "high" },
        { inci: "Cocamidopropyl Betaine", phase: "A", pct: "4.00", function: "Co-surfactant, foam booster", safety_score: 2.8, confidence: "medium" },
        { inci: "Salicylic Acid", phase: "B", pct: "1.50", function: "Keratolytic active", safety_score: 3.2, confidence: "high" },
        { inci: "Niacinamide", phase: "A", pct: "2.00", function: "Sebum regulation, brightening", safety_score: 1.4, confidence: "high" },
        { inci: "Allantoin", phase: "A", pct: "0.20", function: "Soothing, skin conditioner", safety_score: 1.0, confidence: "high" },
        { inci: "Gluconolactone", phase: "B", pct: "1.00", function: "PHA exfoliant, chelator", safety_score: 1.5, confidence: "medium" },
  { inci: "Sodium Benzoate (and) Potassium Sorbate", phase: "C", pct: "0.80", function: "Preservation system", safety_score: 2.0, confidence: "high", isSystem: true, systemComponents: [
      { inci: "Sodium Benzoate", pct: "0.50", note: "Primary organic acid preservative, effective below pH 5.5" },
      { inci: "Potassium Sorbate", pct: "0.30", note: "Synergistic booster, broadens spectrum against yeast and mould" },
    ] },
        { inci: "Citric Acid", phase: "C", pct: "0.20", function: "pH adjuster", safety_score: 1.0, confidence: "high" },
      ],
      regulatoryStatus: [
        { market: "EU", status: "pass", notes: "Salicylic Acid within 2% rinse-off limit" },
        { market: "IN", status: "pass", notes: "All ingredients CDSCO-compliant at stated concentrations" },
      ],
      formulationNotes: [
        "Heat Phase A to 75°C with mixing until homogeneous. Add Salicylic Acid in Phase B pre-dissolved in minimal propylene glycol at 40°C.",
        "Add Phase C (preservatives + citric acid) below 35°C. Adjust pH to 4.3–4.5 with citric acid solution.",
        "Sodium Benzoate and Potassium Sorbate effective at pH 4.5 — do not allow pH to exceed 5.0 in this system.",
        "Cocamidopropyl Betaine may cause mild irritation at >5% — keep at 4% or below for acne-prone and sensitive skin.",
        "Target viscosity 3,000–5,000 cPs. If thickening required, add Hydroxyethylcellulose at 0.3–0.5% to Phase A.",
      ],
      preservationRationale: "Natural/hurdle system selected per brief. **Sodium Benzoate (0.5%) + Potassium Sorbate (0.3%)** effective at **pH 4.3–4.5**. Gluconolactone provides chelation support. System validated for **EU Annex V** compliance at stated concentrations.",
      marketIntelligence: [
        { ingredient: "Niacinamide", coOccurrence: 67, market: "EU+IN", note: "Sebum regulation — complements Salicylic Acid" },
        { ingredient: "Zinc PCA", coOccurrence: 52, market: "IN", note: "Seborrhoea control — strong Indian market signal" },
        { ingredient: "Glycerin", coOccurrence: 89, market: "EU+IN", note: "Standard humectant, counteracts SA drying effect" },
        { ingredient: "Allantoin", coOccurrence: 41, market: "EU+IN", note: "Soothing — irritation mitigation alongside SA" },
      ],
      safetyOverview: [
        { inci: "Salicylic Acid", score: 3.2, confidence: "high", note: "CIR: safe at ≤2% rinse-off. EU: max 2% with mandatory 'Contains Salicylic Acid' warning label." },
        { inci: "Cocamidopropyl Betaine", score: 2.8, confidence: "medium", note: "CIR: safe at ≤5%. SCCS: noted sensitisation potential at higher concentrations." },
        { inci: "Sodium Benzoate (and) Potassium Sorbate", score: 2.0, confidence: "high", note: "EU Annex V: Sodium Benzoate max 0.5% leave-on / 2.5% rinse-off, Potassium Sorbate max 1.8% (EU). Combination system effective at pH 4.3–4.5. pH-dependent efficacy — maintain below pH 5.5." },
      ],
    },
    {
      id: "var_b",
      label: "Variant B",
      approach: null,
      generated: false,
      ingredients: [],
    },
    {
      id: "var_c",
      label: "Variant C",
      approach: null,
      generated: false,
      ingredients: [],
    },
  ],
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------
const LEVEL_LABEL: Record<ReportLevel, string> = {
  quick: "QUICK FORMULA",
  brief: "INTELLIGENCE BRIEF",
  dossier: "DOSSIER",
}
const LEVEL_CREDITS: Record<ReportLevel, string> = {
  quick: "1 credit used",
  brief: "3 credits used",
  dossier: "5 credits used",
}
const PHASE_COLORS: Record<string, { bg: string; text: string }> = {
  A: { bg: "#1B3A5C", text: "#FFFFFF" },
  B: { bg: "#2D6A4F", text: "#FFFFFF" },
  C: { bg: "#92400E", text: "#FFFFFF" },
}
const PHASE_ROW_BG: Record<string, string> = {
  A: "rgba(27,58,92,0.04)",
  B: "rgba(45,106,79,0.04)",
  C: "rgba(146,64,14,0.04)",
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function show(reportLevel: ReportLevel, minLevel: ReportLevel): boolean {
  const levels = { quick: 0, brief: 1, dossier: 2 }
  return levels[reportLevel] >= levels[minLevel]
}

function renderBold(text: string): React.ReactNode[] {
  const parts = text.split(/\*\*(.+?)\*\*/g)
  return parts.map((part, i) => i % 2 === 1 ? <strong key={i}>{part}</strong> : part)
}

function safetyDot(score: number | null): React.ReactNode {
  if (score === null) return <span style={{ color: "#9CA3AF" }}>—</span>
  const color = score <= 2.0 ? "#2D6A4F" : score <= 3.5 ? "#D4A843" : "#991B1B"
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
      <span style={{ width: 7, height: 7, borderRadius: "50%", backgroundColor: color, display: "inline-block" }} />
      <span style={{ fontSize: 12, color }}>{score.toFixed(1)}</span>
    </span>
  )
}

function confidenceDot(confidence: ConfidenceLevel): React.ReactNode {
  if (!confidence || confidence === "low") return null
  const color = confidence === "high" ? "#2D6A4F" : "#D4A843"
  return (
    <span style={{ display: "inline-flex", alignItems: "center" }}>
      {confidence === "high"
        ? <span style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: color, display: "inline-block" }} />
        : (
          <span style={{ width: 8, height: 8, borderRadius: "50%", display: "inline-block", background: `linear-gradient(90deg, ${color} 50%, transparent 50%)`, border: `1.5px solid ${color}` }} />
        )
      }
    </span>
  )
}

function RegChip({ status, market, notes }: { status: RegStatus; market: string; notes: string }) {
  const [hovered, setHovered] = useState(false)
  const cfg = {
    pass: { bg: "#DCFCE7", text: "#166534", icon: "✓" },
    warning: { bg: "#FEF3C7", text: "#92400E", icon: "⚠" },
    fail: { bg: "#FEE2E2", text: "#991B1B", icon: "✗" },
  }[status]
  return (
    <div style={{ position: "relative", display: "inline-block" }}
      onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
      <span style={{
        backgroundColor: cfg.bg, color: cfg.text, fontSize: 12, fontWeight: 600,
        borderRadius: 6, padding: "4px 10px", cursor: "default",
      }}>
        {market} {cfg.icon} {status === "pass" ? "Compliant" : status === "warning" ? "Review" : "Non-compliant"}
      </span>
      {hovered && (
        <div style={{
          position: "absolute", bottom: "calc(100% + 6px)", left: 0, zIndex: 20,
          backgroundColor: "#0D1B2A", color: "#F9FAFB", fontSize: 11, borderRadius: 6,
          padding: "6px 10px", whiteSpace: "nowrap", maxWidth: 280,
          boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
        }}>
          {notes}
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Section wrapper
// ---------------------------------------------------------------------------
function Section({ label, dark, children, printHide }: {
  label: string; dark: boolean; children: React.ReactNode; printHide?: boolean
}) {
  return (
    <div className={printHide ? "no-print" : ""} style={{
      backgroundColor: dark ? "#0F2033" : "#FFFFFF",
      border: `1px solid ${dark ? "#1B3A5C" : "#E5E7EB"}`,
      borderRadius: 10, padding: 20, marginBottom: 16,
    }}>
      <div style={{
        fontSize: 11, fontWeight: 500, letterSpacing: "0.08em",
        textTransform: "uppercase", color: "#6B7280", marginBottom: 14,
      }}>
        {label}
      </div>
      {children}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Formula Table
// ---------------------------------------------------------------------------
function FormulaTable({ variant, reportLevel, dark }: {
  variant: Variant; reportLevel: ReportLevel; dark: boolean
}) {
  const showSafety = show(reportLevel, "brief")
  const textPrimary = dark ? "#F9FAFB" : "#0D1B2A"
  const textSecondary = dark ? "#9CA3AF" : "#6B7280"
  const borderColor = dark ? "#1B3A5C" : "#E5E7EB"
  const [expandedSystems, setExpandedSystems] = useState<Set<number>>(new Set())
  const toggleSystem = (i: number) => setExpandedSystems(prev => {
    const next = new Set(prev); next.has(i) ? next.delete(i) : next.add(i); return next
  })

  return (
    <Section label="Formula" dark={dark}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
        <thead>
          <tr style={{ borderBottom: `2px solid ${borderColor}` }}>
            <th style={{ textAlign: "left", padding: "6px 0", fontSize: 11, fontWeight: 500, color: "#6B7280", paddingRight: 16 }}>INCI Name</th>
            <th style={{ textAlign: "center", padding: "6px 8px", fontSize: 11, fontWeight: 500, color: "#6B7280", width: 48 }}>Phase</th>
            <th style={{ textAlign: "right", padding: "6px 0", fontSize: 11, fontWeight: 500, color: "#6B7280", width: 64 }}>%</th>
            <th style={{ textAlign: "left", padding: "6px 16px", fontSize: 11, fontWeight: 500, color: "#6B7280" }}>Function</th>
            {showSafety && <>
              <th style={{ textAlign: "center", padding: "6px 8px", fontSize: 11, fontWeight: 500, color: "#6B7280", width: 72 }}>Safety</th>
              <th style={{ textAlign: "center", padding: "6px 0", fontSize: 11, fontWeight: 500, color: "#6B7280", width: 52 }}>Conf.</th>
            </>}
          </tr>
        </thead>
        <tbody>
          {variant.ingredients.map((ing, i) => {
              const isQS = ing.pct === "q.s."
              const phaseBg = PHASE_ROW_BG[ing.phase] ?? "transparent"
              const isExpanded = expandedSystems.has(i)
              return (
                <React.Fragment key={i}>
                  <tr style={{ backgroundColor: phaseBg, borderBottom: `1px solid ${borderColor}` }}>
                    <td style={{ padding: "9px 0", paddingRight: 16 }}>
                      <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: textPrimary, fontStyle: isQS ? "italic" : "normal" }}>
                        {ing.inci}
                      </span>
                      {ing.isSystem && (
                        <span style={{ marginLeft: 8, backgroundColor: "#1B3A5C", color: "#FFFFFF", fontSize: 9, fontWeight: 600, borderRadius: 4, padding: "1px 4px", verticalAlign: "middle", letterSpacing: "0.04em" }}>
                          SYSTEM
                        </span>
                      )}
                    </td>
                    <td style={{ textAlign: "center", padding: "9px 8px" }}>
                      <span style={{ backgroundColor: PHASE_COLORS[ing.phase]?.bg ?? "#6B7280", color: PHASE_COLORS[ing.phase]?.text ?? "#FFF", fontSize: 10, fontWeight: 600, borderRadius: 4, padding: "2px 6px" }}>
                        {ing.phase}
                      </span>
                    </td>
                    <td style={{ textAlign: "right", padding: "9px 0", color: isQS ? textSecondary : textPrimary, fontFamily: isQS ? "inherit" : "var(--font-mono)", fontSize: 12 }}>
                      {isQS ? "q.s." : ing.pct}
                    </td>
                    <td style={{ padding: "9px 16px", fontSize: 12, color: textSecondary }}>{ing.function}</td>
                    {showSafety && <>
                      <td style={{ textAlign: "center", padding: "9px 8px" }}>{safetyDot(ing.safety_score)}</td>
                      <td style={{ textAlign: "center", padding: "9px 0" }}>{confidenceDot(ing.confidence)}</td>
                    </>}
                    {ing.isSystem && (
                      <td style={{ padding: "9px 0 9px 8px", textAlign: "right", width: 24 }}>
                        <button onClick={() => toggleSystem(i)} style={{ background: "none", border: "none", cursor: "pointer", padding: 0, color: textSecondary }}>
                          <ChevronDown size={14} style={{ transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)" }} />
                        </button>
                      </td>
                    )}
                  </tr>
                  {ing.isSystem && isExpanded && ing.systemComponents?.map((sub, j) => (
                    <tr key={`${i}-sub-${j}`} style={{ backgroundColor: phaseBg, borderBottom: `1px solid ${borderColor}` }}>
                      <td colSpan={showSafety ? 6 : 4} style={{ paddingLeft: 16, paddingTop: 4, paddingBottom: 4, borderTop: `1px solid #E5E7EB` }}>
                        <div style={{ display: "flex", alignItems: "baseline", gap: 16 }}>
                          <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: textSecondary }}>{sub.inci}</span>
                          <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: textSecondary }}>{sub.pct}%</span>
                          <span style={{ fontSize: 11, color: "#9CA3AF" }}>{sub.note}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </React.Fragment>
              )
            })}
        </tbody>
        <tfoot>
          <tr style={{ borderTop: `2px solid ${borderColor}` }}>
            <td colSpan={showSafety ? 6 : 4} style={{ textAlign: "right", padding: "10px 0", fontWeight: 700, fontSize: 13, color: textPrimary, fontFamily: "var(--font-mono)" }}>
              <span style={{ marginRight: showSafety ? 90 : 0 }}>
                100.00<span style={{ fontWeight: 400, color: textSecondary }}>%</span>
              </span>
            </td>
          </tr>
        </tfoot>
      </table>
      {showSafety && (
        <p style={{ fontSize: 11, color: "#6B7280", marginTop: 10, lineHeight: 1.5, margin: "10px 0 0" }}>
          Scores shown for medium and high confidence data only. Low confidence ingredients show no score — insufficient data for reliable hazard assessment.
        </p>
      )}
    </Section>
  )
}

// ---------------------------------------------------------------------------
// Regulatory Status
// ---------------------------------------------------------------------------
function RegulatorySection({ variant, reportLevel, dark }: {
  variant: Variant; reportLevel: ReportLevel; dark: boolean
}) {
  const status = variant.regulatoryStatus ?? []
  const textSecondary = dark ? "#9CA3AF" : "#6B7280"
  const borderColor = dark ? "#1B3A5C" : "#E5E7EB"
  const textPrimary = dark ? "#F9FAFB" : "#0D1B2A"
  const expanded = show(reportLevel, "brief")

  return (
    <Section label="Regulatory Status" dark={dark}>
      {!expanded ? (
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          {status.map((s) => <RegChip key={s.market} {...s} />)}
        </div>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
          <thead>
            <tr style={{ borderBottom: `2px solid ${borderColor}` }}>
              {["Market", "Status", "Notes"].map((h) => (
                <th key={h} style={{ textAlign: "left", padding: "6px 12px 6px 0", fontSize: 11, fontWeight: 500, color: "#6B7280" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {status.length === 0 ? (
              <tr><td colSpan={3} style={{ padding: "12px 0", color: textSecondary }}>No restrictions identified</td></tr>
            ) : status.map((s) => (
              <tr key={s.market} style={{ borderBottom: `1px solid ${borderColor}` }}>
                <td style={{ padding: "10px 12px 10px 0" }}><RegChip {...s} /></td>
                <td style={{ padding: "10px 12px 10px 0", color: textPrimary }}>{s.market}</td>
                <td style={{ padding: "10px 0", color: textSecondary, lineHeight: 1.5 }}>{s.notes}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </Section>
  )
}

// ---------------------------------------------------------------------------
// Formulation Notes
// ---------------------------------------------------------------------------
function FormulationNotesSection({ variant, dark }: { variant: Variant; dark: boolean }) {
  const notes = variant.formulationNotes ?? []
  const textColor = dark ? "#D1D5DB" : "#374151"
  return (
    <Section label="Formulation Notes" dark={dark}>
      <ol style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 10 }}>
        {notes.map((note, i) => (
          <li key={i} style={{
            display: "flex", gap: 12, paddingLeft: 12,
            borderLeft: "3px solid #1B3A5C",
          }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "#1B3A5C", minWidth: 18, paddingTop: 1 }}>{i + 1}.</span>
            <span style={{ fontSize: 12, lineHeight: 1.7, color: textColor }}>{note}</span>
          </li>
        ))}
      </ol>
    </Section>
  )
}

// ---------------------------------------------------------------------------
// Safety Overview
// ---------------------------------------------------------------------------
function SafetySection({ variant, dark }: { variant: Variant; dark: boolean }) {
  const items = variant.safetyOverview ?? []
  const borderColor = dark ? "#1B3A5C" : "#E5E7EB"
  const textPrimary = dark ? "#F9FAFB" : "#0D1B2A"
  const textSecondary = dark ? "#9CA3AF" : "#6B7280"
  return (
    <Section label="Safety Overview" dark={dark}>
      <p style={{ fontSize: 11, color: "#6B7280", marginBottom: 12, lineHeight: 1.5 }}>
        Scores shown for medium and high confidence data only. Low confidence ingredients show no score — insufficient data for reliable hazard assessment.
      </p>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
        <thead>
          <tr style={{ borderBottom: `2px solid ${borderColor}` }}>
            {["INCI Name", "Score", "Conf.", "Notes"].map((h) => (
              <th key={h} style={{ textAlign: "left", padding: "6px 12px 6px 0", fontSize: 11, fontWeight: 500, color: "#6B7280" }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.inci} style={{ borderBottom: `1px solid ${borderColor}` }}>
              <td style={{ padding: "10px 12px 10px 0", fontFamily: "var(--font-mono)", fontSize: 12, color: textPrimary }}>{item.inci}</td>
              <td style={{ padding: "10px 12px 10px 0" }}>{safetyDot(item.score)}</td>
              <td style={{ padding: "10px 12px 10px 0" }}>{confidenceDot(item.confidence)}</td>
              <td style={{ padding: "10px 0", fontSize: 11, color: textSecondary, lineHeight: 1.5 }}>{item.note}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Section>
  )
}

// ---------------------------------------------------------------------------
// Market Intelligence
// ---------------------------------------------------------------------------
function MarketIntelSection({ variant, dark, productType, markets }: {
  variant: Variant; dark: boolean; productType: string; markets: string[]
}) {
  const items = variant.marketIntelligence ?? []
  const borderColor = dark ? "#1B3A5C" : "#E5E7EB"
  const textPrimary = dark ? "#F9FAFB" : "#0D1B2A"
  const textSecondary = dark ? "#9CA3AF" : "#6B7280"
  return (
    <Section label="Market Intelligence" dark={dark}>
      <p style={{ fontSize: 11, color: "#6B7280", marginBottom: 12 }}>
        Common co-formulation patterns from 561,937 products in the theformulator.ai corpus
        for <strong style={{ color: textPrimary }}>{productType}</strong> targeting <strong style={{ color: textPrimary }}>{markets.join(" + ")}</strong>
      </p>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
        <thead>
          <tr style={{ borderBottom: `2px solid ${borderColor}` }}>
            {["Ingredient", "Co-occurrence %", "Market", "Signal"].map((h) => (
              <th key={h} style={{ textAlign: "left", padding: "6px 12px 6px 0", fontSize: 11, fontWeight: 500, color: "#6B7280" }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.ingredient} style={{ borderBottom: `1px solid ${borderColor}` }}>
              <td style={{ padding: "10px 12px 10px 0", fontFamily: "var(--font-mono)", fontSize: 12, color: textPrimary }}>{item.ingredient}</td>
              <td style={{ padding: "10px 12px 10px 0" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 80, height: 6, backgroundColor: dark ? "#1B3A5C" : "#E5E7EB", borderRadius: 3 }}>
                    <div style={{ width: `${item.coOccurrence}%`, height: "100%", backgroundColor: "#D4A843", borderRadius: 3 }} />
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 600, color: textPrimary }}>{item.coOccurrence}%</span>
                </div>
              </td>
              <td style={{ padding: "10px 12px 10px 0", color: textSecondary }}>{item.market}</td>
              <td style={{ padding: "10px 0", color: textSecondary, fontSize: 11 }}>{item.note}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Section>
  )
}

// ---------------------------------------------------------------------------
// Preservation Rationale
// ---------------------------------------------------------------------------
function PreservationSection({ variant, dark }: { variant: Variant; dark: boolean }) {
  const text = variant.preservationRationale ?? ""
  const textColor = dark ? "#D1D5DB" : "#374151"
  return (
    <Section label="Preservation Rationale" dark={dark}>
      <p style={{ fontSize: 13, lineHeight: 1.7, color: textColor, margin: 0 }}>
        {renderBold(text)}
      </p>
    </Section>
  )
}

// ---------------------------------------------------------------------------
// Stability Risk Assessment (Dossier)
// ---------------------------------------------------------------------------
const STABILITY_RISKS = [
  "Salicylic Acid: pH-sensitive — confirm pH ≤ 5.0 throughout shelf life",
  "Sodium Benzoate: efficacy drops sharply above pH 5.5 — critical to monitor during stability",
]
const STABILITY_PROTOCOL = [
  { timepoint: "0 months", conditions: "Ambient", parameters: "Appearance, pH, viscosity, microbial" },
  { timepoint: "1 month", conditions: "40°C/75%RH, 4°C", parameters: "All parameters" },
  { timepoint: "3 months", conditions: "40°C/75%RH, ambient, 4°C", parameters: "All parameters + actives assay" },
  { timepoint: "6 months", conditions: "All conditions", parameters: "Full panel" },
  { timepoint: "12 months", conditions: "Ambient, 4°C", parameters: "Full panel" },
]

function StabilitySection({ dark }: { dark: boolean }) {
  const borderColor = dark ? "#1B3A5C" : "#E5E7EB"
  const textPrimary = dark ? "#F9FAFB" : "#0D1B2A"
  const textSecondary = dark ? "#9CA3AF" : "#6B7280"
  return (
    <Section label="Stability Risk Assessment" dark={dark}>
      <div style={{ marginBottom: 18 }}>
        <div style={{ fontSize: 11, fontWeight: 500, color: "#6B7280", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 10 }}>Risk Flags</div>
        {STABILITY_RISKS.map((r, i) => (
          <div key={i} style={{ display: "flex", gap: 10, padding: "8px 12px", borderLeft: "3px solid #D4A843", marginBottom: 8, backgroundColor: dark ? "#1C1207" : "#FFFBEB", borderRadius: "0 6px 6px 0" }}>
            <span style={{ fontSize: 12, color: dark ? "#D1D5DB" : "#374151" }}>{r}</span>
          </div>
        ))}
      </div>
      <div style={{ fontSize: 11, fontWeight: 500, color: "#6B7280", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 10 }}>Recommended Protocol</div>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
        <thead>
          <tr style={{ borderBottom: `2px solid ${borderColor}` }}>
            {["Timepoint", "Conditions", "Parameters"].map((h) => (
              <th key={h} style={{ textAlign: "left", padding: "6px 12px 6px 0", fontSize: 11, fontWeight: 500, color: "#6B7280" }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {STABILITY_PROTOCOL.map((row) => (
            <tr key={row.timepoint} style={{ borderBottom: `1px solid ${borderColor}` }}>
              <td style={{ padding: "9px 12px 9px 0", fontWeight: 600, color: textPrimary }}>{row.timepoint}</td>
              <td style={{ padding: "9px 12px 9px 0", color: textSecondary }}>{row.conditions}</td>
              <td style={{ padding: "9px 0", color: textSecondary }}>{row.parameters}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Section>
  )
}

// ---------------------------------------------------------------------------
// Manufacturing Brief (Dossier)
// ---------------------------------------------------------------------------
const MFG_STEPS = [
  { step: 1, text: "Heat Phase A to 75°C with moderate stirring until homogeneous.", temp: "75°C" },
  { step: 2, text: "Pre-dissolve Salicylic Acid in minimal propylene glycol at 40°C. Add to Phase A with mixing.", temp: "40°C" },
  { step: 3, text: "Cool batch to 40°C. Add Phase B actives (Niacinamide, Allantoin, Gluconolactone) with gentle mixing.", temp: "40°C" },
  { step: 4, text: "Cool to below 35°C. Add Phase C preservatives and citric acid.", temp: "<35°C" },
  { step: 5, text: "Adjust pH to 4.3–4.5 using citric acid solution. Verify with calibrated pH meter.", temp: null },
  { step: 6, text: "Check viscosity 3,000–5,000 cPs. If out of spec, add Hydroxyethylcellulose at 0.3–0.5% to Phase A on next batch.", temp: null },
]

function ManufacturingSection({ dark }: { dark: boolean }) {
  const textSecondary = dark ? "#9CA3AF" : "#6B7280"
  return (
    <Section label="Manufacturing Brief" dark={dark}>
      <div style={{ marginBottom: 18 }}>
        <div style={{ fontSize: 11, fontWeight: 500, color: "#6B7280", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 10 }}>Equipment</div>
        <p style={{ fontSize: 12, color: textSecondary, lineHeight: 1.7, margin: 0 }}>
          High-shear mixer recommended for Phase A/B emulsification. Planetary mixer sufficient for gel systems at lab scale. Avoid prolonged high-shear for Salicylic Acid systems — heat generation can degrade efficacy.
        </p>
      </div>
      <div style={{ fontSize: 11, fontWeight: 500, color: "#6B7280", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 10 }}>Processing Sequence</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {MFG_STEPS.map((s) => (
          <div key={s.step} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
            <span style={{ minWidth: 22, height: 22, borderRadius: "50%", backgroundColor: "#1B3A5C", color: "#FFFFFF", fontSize: 11, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>{s.step}</span>
            <span style={{ fontSize: 12, lineHeight: 1.6, color: dark ? "#D1D5DB" : "#374151" }}>
              {s.text}{s.temp && <> <span style={{ backgroundColor: dark ? "#1C1207" : "#FEF3C7", color: "#92400E", fontSize: 11, fontWeight: 600, borderRadius: 4, padding: "1px 6px", marginLeft: 4 }}>{s.temp}</span></>}
            </span>
          </div>
        ))}
      </div>
    </Section>
  )
}

// ---------------------------------------------------------------------------
// Technical Ingredient Data (Dossier)
// ---------------------------------------------------------------------------
const MOCK_TECHNICAL_DATA = [
  {
    inci: "Sodium Cocoyl Isethionate",
    hlb: "N/A (anionic)",
    solubility: "Dispersible in water, soluble above CMC",
    phase: "A (heated, 70–75°C)",
    typical_use: "8–20%",
    skin_benefits: "Mild cleansing, skin-compatible pH, low irritation potential",
    notes: "Requires adequate water phase temperature for full dispersion"
  },
  {
    inci: "Niacinamide",
    hlb: "N/A (water-soluble)",
    solubility: "Freely soluble in water",
    phase: "A (heated or ambient)",
    typical_use: "2–10%",
    skin_benefits: "Sebum regulation, barrier support, brightening, anti-inflammatory",
    notes: "Thermally stable to 120°C. No cold-process restriction."
  },
  {
    inci: "Salicylic Acid",
    hlb: "N/A (oil/water partition dependent on pH)",
    solubility: "Slightly soluble in water; solubility increases below pH 4.0",
    phase: "B (pre-dissolve in propylene glycol or ethanol at 40°C)",
    typical_use: "0.5–2.0%",
    skin_benefits: "Keratolytic, comedolytic, antimicrobial, mild anti-inflammatory",
    notes: "Optimal efficacy at pH 3.0–4.0 (protonated form). Mandatory EU label warning above 0.5%."
  },
]

function TechnicalDataRow({ label, value, textSecondary, textPrimary }: { label: string; value: string; textSecondary: string; textPrimary: string }) {
  return (
    <div style={{ display: "flex", borderBottom: "1px solid #E5E7EB", padding: "6px 0" }}>
      <div style={{ width: 140, fontSize: 11, color: textSecondary, flexShrink: 0 }}>{label}</div>
      <div style={{ fontSize: 12, color: textPrimary, flex: 1 }}>{value}</div>
    </div>
  )
}

function TechnicalIngredientSection({ dark }: { dark: boolean }) {
  const textPrimary = dark ? "#F9FAFB" : "#0D1B2A"
  const textSecondary = dark ? "#9CA3AF" : "#6B7280"
  return (
    <Section label="Technical Ingredient Data" dark={dark}>
      {MOCK_TECHNICAL_DATA.map((ing) => (
        <div key={ing.inci} style={{ marginBottom: 24 }}>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 13, fontWeight: 600, color: textPrimary, marginBottom: 10 }}>{ing.inci}</div>
          <div style={{ backgroundColor: dark ? "#0D1B2A" : "#F9FAFB", border: `1px solid ${dark ? "#1B3A5C" : "#E5E7EB"}`, borderRadius: 8, padding: 14 }}>
            <TechnicalDataRow label="Phase of Addition" value={ing.phase} textSecondary={textSecondary} textPrimary={textPrimary} />
            <TechnicalDataRow label="Solubility" value={ing.solubility} textSecondary={textSecondary} textPrimary={textPrimary} />
            <TechnicalDataRow label="Typical Use Level" value={ing.typical_use} textSecondary={textSecondary} textPrimary={textPrimary} />
            <TechnicalDataRow label="Skin Benefits" value={ing.skin_benefits} textSecondary={textSecondary} textPrimary={textPrimary} />
            <TechnicalDataRow label="Technical Notes" value={ing.notes} textSecondary={textSecondary} textPrimary={textPrimary} />
            {!ing.hlb.startsWith("N/A") && (
              <TechnicalDataRow label="HLB" value={ing.hlb} textSecondary={textSecondary} textPrimary={textPrimary} />
            )}
          </div>
        </div>
      ))}
      <div style={{ fontSize: 11, color: textSecondary, fontStyle: "italic", marginTop: 8 }}>
        Technical specifications sourced from ingredient TDS documentation. Verify all parameters with your chosen supplier before formulation.
      </div>
    </Section>
  )
}

// ---------------------------------------------------------------------------
// Research Citations (Dossier)
// ---------------------------------------------------------------------------
const CITATIONS = [
  {
    pmid: "PMID:16920571",
    author: "Zander E & Weisman S",
    year: 1992,
    title: "Treatment of acne vulgaris with salicylic acid pads.",
    journal: "Clinical Therapeutics.",
    relevance: "Establishes 2% salicylic acid as effective keratolytic in rinse-off cleansers for acne-prone skin.",
  },
  {
    pmid: "PMID:29393326",
    author: "Levin J & Momin SB",
    year: 2011,
    title: "How much do we really know about our favorite cosmeceutical ingredients?",
    journal: "J Clin Aesthet Dermatol.",
    relevance: "Niacinamide mechanism: inhibits melanosome transfer, reduces sebum excretion at 2–4% concentration.",
  },
  {
    pmid: "PMID:26917440",
    author: "Draelos ZD et al.",
    year: 2016,
    title: "The effect of 2% niacinamide on facial sebum production.",
    journal: "J Cosmet Laser Ther.",
    relevance: "Supports 2% niacinamide inclusion for acne-control positioning — statistically significant sebum reduction.",
  },
]

function CitationsSection({ dark }: { dark: boolean }) {
  const textSecondary = dark ? "#9CA3AF" : "#6B7280"
  const textPrimary = dark ? "#F9FAFB" : "#0D1B2A"
  return (
    <Section label="Research Citations" dark={dark}>
      <ol style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 14 }}>
        {CITATIONS.map((c, i) => (
          <li key={i} style={{ display: "flex", gap: 14 }}>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "#6B7280", minWidth: 130, flexShrink: 0, paddingTop: 1 }}>{c.pmid}</span>
            <div>
              <div style={{ fontSize: 12, color: textPrimary, lineHeight: 1.5 }}>
                {c.author} ({c.year}). &ldquo;{c.title}&rdquo; <em>{c.journal}</em>
              </div>
              <div style={{ fontSize: 11, color: textSecondary, fontStyle: "italic", marginTop: 3 }}>{c.relevance}</div>
            </div>
          </li>
        ))}
      </ol>
    </Section>
  )
}

// ---------------------------------------------------------------------------
// Upgrade Panel
// ---------------------------------------------------------------------------
function UpgradePanel({ reportLevel, dark }: { reportLevel: ReportLevel; dark: boolean }) {
  const [toast, setToast] = useState(false)
  if (reportLevel === "dossier") return null

  const handleUpgrade = () => {
    setToast(true)
    setTimeout(() => setToast(false), 2500)
  }

  const options = reportLevel === "quick"
    ? [
      { label: "Intelligence Brief", credits: "+2 credits", desc: "Safety scores, regulatory detail, market intelligence, 3 variants, preservation rationale" },
      { label: "Dossier", credits: "+4 credits", desc: "Everything in Brief plus stability protocol, manufacturing brief, supplier options, research citations, PDF export" },
    ]
    : [
      { label: "Dossier", credits: "+2 credits", desc: "Stability protocol, manufacturing brief, supplier options, research citations, cover page PDF" },
    ]

  return (
    <div className="no-print" style={{
      border: `1px solid ${dark ? "#1B3A5C" : "#E5E7EB"}`,
      borderLeft: "3px solid #D4A843",
      borderRadius: 10, padding: 16, marginBottom: 16,
      backgroundColor: dark ? "#0F2033" : "#FFFFFF",
      position: "relative",
    }}>
      <div style={{ fontSize: 11, fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase", color: "#6B7280", marginBottom: 12 }}>Unlock More</div>
      {options.map((opt) => (
        <div key={opt.label} style={{ marginBottom: 12, paddingBottom: 12, borderBottom: `1px solid ${dark ? "#1B3A5C" : "#F3F4F6"}` }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: dark ? "#F9FAFB" : "#0D1B2A" }}>{opt.label}</span>
            <span style={{ fontSize: 11, color: "#D4A843", fontWeight: 600 }}>{opt.credits}</span>
          </div>
          <p style={{ fontSize: 11, color: "#6B7280", lineHeight: 1.5, margin: "0 0 10px" }}>{opt.desc}</p>
          <button onClick={handleUpgrade} style={{
            backgroundColor: "#D4A843", color: "#0D1B2A", fontWeight: 600,
            fontSize: 12, height: 32, borderRadius: 6, border: "none",
            cursor: "pointer", paddingLeft: 16, paddingRight: 16,
          }}>
            Upgrade →
          </button>
        </div>
      ))}
      {toast && (
        <div style={{
          position: "fixed", bottom: 24, right: 24, zIndex: 100,
          backgroundColor: "#0D1B2A", color: "#F9FAFB", fontSize: 13,
          fontWeight: 500, borderRadius: 8, padding: "10px 16px",
          boxShadow: "0 4px 16px rgba(0,0,0,0.3)",
        }}>
          Upgrade coming soon
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Formula Actions Sidebar
// ---------------------------------------------------------------------------
function FormulaActions({ reportLevel, formulaName, dark }: {
  reportLevel: ReportLevel; formulaName: string; dark: boolean
}) {
  const [pdfLoading, setPdfLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleExport = () => {
    if (reportLevel === "dossier") {
      setPdfLoading(true)
      setTimeout(() => setPdfLoading(false), 2000)
    } else {
      window.print()
    }
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(window.location.href).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div style={{
      border: `1px solid ${dark ? "#1B3A5C" : "#E5E7EB"}`,
      borderRadius: 10, padding: 16,
      backgroundColor: dark ? "#0F2033" : "#FFFFFF",
    }}>
      <div style={{ fontSize: 11, fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase", color: "#6B7280", marginBottom: 12 }}>Actions</div>
      <div style={{ fontSize: 12, color: "#6B7280", marginBottom: 14 }}>{LEVEL_CREDITS[reportLevel]}</div>

      <button onClick={handleExport} style={{
        width: "100%", height: 38, borderRadius: 8, marginBottom: 8,
        backgroundColor: "#D4A843", color: "#0D1B2A", fontWeight: 600,
        fontSize: 13, border: "none", cursor: "pointer",
        display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
      }}>
        {pdfLoading
          ? <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation: "spin 0.8s linear infinite" }}><path d="M21 12a9 9 0 1 1-6.219-8.56" /></svg> Generating PDF…</>
          : <><FileText size={14} /> Export PDF</>
        }
      </button>

      <button style={{
        width: "100%", height: 38, borderRadius: 8, marginBottom: 8,
        backgroundColor: "transparent",
        border: `1px solid ${dark ? "#1B3A5C" : "#E5E7EB"}`,
        color: dark ? "#F9FAFB" : "#0D1B2A", fontWeight: 500,
        fontSize: 13, cursor: "pointer",
        display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
      }}>
        <Bookmark size={14} /> Save to My Formulations
      </button>

      <button onClick={handleCopy} style={{
        width: "100%", height: 38, backgroundColor: "transparent",
        border: "none", cursor: "pointer", fontSize: 13,
        color: "#D4A843", fontWeight: 500,
        display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
      }}>
        {copied ? <><Check size={14} /> Copied!</> : <><Copy size={14} /> Share Link</>}
      </button>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Generate Variant Confirmation
// ---------------------------------------------------------------------------
function GenerateVariantConfirm({ variantLabel, dark, onCancel }: {
  variantLabel: string; dark: boolean; onCancel: () => void
}) {
  return (
    <div style={{
      backgroundColor: dark ? "#0F2033" : "#FFFFFF",
      border: `1px solid ${dark ? "#1B3A5C" : "#E5E7EB"}`,
      borderRadius: 10, padding: 24, textAlign: "center",
    }}>
      <div style={{ fontSize: 15, fontWeight: 600, color: dark ? "#F9FAFB" : "#0D1B2A", marginBottom: 10 }}>
        Generate {variantLabel}?
      </div>
      <p style={{ fontSize: 13, color: dark ? "#9CA3AF" : "#6B7280", lineHeight: 1.6, maxWidth: 420, margin: "0 auto 20px" }}>
        The backend will create an alternative formulation approach based on your brief. This uses your existing credit allocation — no additional charge.
      </p>
      <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
        <button style={{
          backgroundColor: "#D4A843", color: "#0D1B2A", fontWeight: 600,
          fontSize: 13, height: 38, borderRadius: 8, border: "none",
          cursor: "pointer", paddingLeft: 20, paddingRight: 20,
        }}>
          Generate {variantLabel} →
        </button>
        <button onClick={onCancel} style={{
          backgroundColor: "transparent", color: dark ? "#9CA3AF" : "#6B7280",
          fontSize: 13, height: 38, border: "none", cursor: "pointer",
        }}>
          Cancel
        </button>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------
export function FormulationOutputPage() {
  const { dark } = useTheme()
  const [formula, setFormula] = useState(MOCK_FORMULA)
  const [reportLevel, setReportLevel] = useState<ReportLevel>(MOCK_FORMULA.reportLevel)
  const [activeVariantId, setActiveVariantId] = useState(MOCK_FORMULA.variants[0].id)
  const [pendingGenerate, setPendingGenerate] = useState<string | null>(null)
  const [editingName, setEditingName] = useState(false)
  const [nameValue, setNameValue] = useState(formula.name)

  // Hydrate from real API result if present
  useEffect(() => {
    try {
      const stored = localStorage.getItem("tf_last_formulation")
      if (!stored) return
      const data = JSON.parse(stored)

      // Map API response fields onto formula state
      const level: ReportLevel =
        data.report_level === "dossier" ? "dossier" :
        data.report_level === "brief" ? "brief" : "quick"

      const mappedIngredients: Ingredient[] = (data.formulation ?? []).map((row: Record<string, unknown>) => ({
        inci: String(row.inci ?? row.ingredient ?? ""),
        phase: (String(row.phase ?? "A").toUpperCase() as "A" | "B" | "C"),
        pct: String(row.percentage ?? row.pct ?? "q.s."),
        function: String(row.function ?? row.role ?? ""),
        safety_score: row.safety_score != null ? Number(row.safety_score) : null,
        confidence: (row.confidence as ConfidenceLevel) ?? "medium",
      }))

      const mappedRegulatory: RegulatoryItem[] = (data.regulatory_flags ?? []).map((r: Record<string, unknown>) => ({
        market: String(r.market ?? ""),
        status: (r.status as RegStatus) ?? "warning",
        notes: String(r.notes ?? r.detail ?? ""),
      }))

      setFormula((prev) => ({
        ...prev,
        id: data.formulation_id ?? prev.id,
        name: data.product_name ?? prev.name,
        reportLevel: level,
          variants: [
            {
              ...prev.variants[0],
              generated: true,
              ingredients: mappedIngredients.length > 0 ? mappedIngredients : prev.variants[0].ingredients,
              regulatoryStatus: mappedRegulatory.length > 0 ? mappedRegulatory : prev.variants[0].regulatoryStatus,
              formulationNotes: data.processing_instructions
                ? [data.processing_instructions, ...(data.expected_ph ? [`Expected pH: ${data.expected_ph}`] : [])]
                : prev.variants[0].formulationNotes,
            },
            ...prev.variants.slice(1),
          ],
      }))
      setReportLevel(level)
      setNameValue(data.product_name ?? formula.name)
    } catch {
      // malformed stored data — fall back to mock
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const activeVariant = formula.variants.find((v) => v.id === activeVariantId) ?? formula.variants[0]
  const visibleVariants = reportLevel === "quick" ? formula.variants.slice(0, 2) : formula.variants
  const textPrimary = dark ? "#F9FAFB" : "#0D1B2A"
  const textSecondary = dark ? "#9CA3AF" : "#6B7280"
  const borderColor = dark ? "#1B3A5C" : "#E5E7EB"

  const handleTabClick = (v: Variant) => {
    if (!v.generated) {
      setPendingGenerate(v.id)
    } else {
      setActiveVariantId(v.id)
      setPendingGenerate(null)
    }
  }

  const handleSaveName = () => {
    setFormula({ ...formula, name: nameValue })
    setEditingName(false)
  }

  return (
    <div style={{ fontFamily: "var(--font-sans)" }}>
      {/* Dev Switcher */}
      {IS_DEV && (
        <div className="no-print" style={{
          display: "flex", justifyContent: "flex-end", marginBottom: 12,
        }}>
          <div style={{
            display: "inline-flex", border: `1px solid ${borderColor}`,
            borderRadius: 6, overflow: "hidden",
          }}>
            {(["quick", "brief", "dossier"] as ReportLevel[]).map((level) => (
              <button key={level} onClick={() => setReportLevel(level)} style={{
                padding: "4px 12px", fontSize: 11, fontWeight: 500,
                backgroundColor: reportLevel === level ? "#1B3A5C" : "transparent",
                color: reportLevel === level ? "#FFFFFF" : textSecondary,
                border: "none", cursor: "pointer",
                borderRight: level !== "dossier" ? `1px solid ${borderColor}` : "none",
                textTransform: "capitalize",
              }}>
                {level}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Dossier Cover (print only) */}
      {reportLevel === "dossier" && (
        <div className="dossier-cover" style={{ display: "none" }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 24 }}>
            <Image src="/logo.svg" alt="theformulator.ai" width={80} height={80} style={{ width: "auto", height: "auto" }} />
          </div>
          <div style={{ height: 2, backgroundColor: "#D4A843", margin: "16px 0" }} />
          <div style={{ fontSize: 24, fontWeight: 700, color: "#0D1B2A", marginBottom: 8 }}>{formula.name}</div>
          <div style={{ fontSize: 14, color: "#6B7280", marginBottom: 4 }}>{formula.organisation}</div>
          <div style={{ fontSize: 14, color: "#6B7280", marginBottom: 4 }}>Prepared by: {formula.user}</div>
          <div style={{ fontSize: 14, color: "#6B7280", marginBottom: 16 }}>Date: {formula.createdAt}</div>
          <div style={{ display: "flex", gap: 8 }}>
            {formula.markets.map((m) => (
              <span key={m} style={{ backgroundColor: "#0D1B2A", color: "#FFFFFF", fontSize: 12, fontWeight: 600, borderRadius: 4, padding: "3px 10px" }}>{m}</span>
            ))}
          </div>
        </div>
      )}

      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 8 }}>
          {/* Editable name */}
          {editingName ? (
            <input
              autoFocus
              value={nameValue}
              onChange={(e) => setNameValue(e.target.value)}
              onBlur={handleSaveName}
              onKeyDown={(e) => e.key === "Enter" && handleSaveName()}
              style={{
                fontSize: 22, fontWeight: 700, color: textPrimary,
                border: `1px solid #D4A843`, borderRadius: 6, padding: "2px 8px",
                backgroundColor: "transparent", outline: "none", fontFamily: "inherit",
              }}
            />
          ) : (
            <div
              onClick={() => setEditingName(true)}
              style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}
              title="Click to edit"
            >
              <h1 style={{ fontSize: 22, fontWeight: 700, color: textPrimary, margin: 0 }}>{formula.name}</h1>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={textSecondary} strokeWidth="2" style={{ opacity: 0.5 }}><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
            </div>
          )}
          <span style={{ backgroundColor: "#1B3A5C", color: "#FFFFFF", fontSize: 11, fontWeight: 600, borderRadius: 4, padding: "2px 8px" }}>
            v{formula.version}
          </span>
          <span style={{ border: "1px solid #D4A843", color: "#D4A843", fontSize: 11, fontWeight: 600, borderRadius: 4, padding: "2px 8px", letterSpacing: "0.04em" }}>
            {LEVEL_LABEL[reportLevel]}
          </span>
          {formula.markets.map((m) => (
            <span key={m} style={{ backgroundColor: "#0D1B2A", color: "#FFFFFF", fontSize: 11, fontWeight: 600, borderRadius: 4, padding: "2px 8px" }}>{m}</span>
          ))}
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
          <span style={{ fontSize: 12, color: textSecondary }}>Generated {formula.createdAt}</span>
          <div className="no-print" style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <button style={{ height: 32, paddingLeft: 14, paddingRight: 14, borderRadius: 6, border: `1px solid #D4A843`, backgroundColor: "transparent", color: "#D4A843", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
              Export PDF
            </button>
            <button style={{ height: 32, paddingLeft: 14, paddingRight: 14, borderRadius: 6, border: `1px solid ${borderColor}`, backgroundColor: "transparent", color: textPrimary, fontSize: 12, fontWeight: 500, cursor: "pointer", display: "flex", alignItems: "center", gap: 5 }}>
              <Share2 size={13} /> Share
            </button>
            <button style={{ height: 32, backgroundColor: "transparent", border: "none", color: "#D4A843", fontSize: 12, fontWeight: 500, cursor: "pointer", display: "flex", alignItems: "center", gap: 5 }}>
              <RotateCcw size={12} /> Rework Brief →
            </button>
          </div>
        </div>
      </div>

      {/* Variant Tabs */}
      <div className="no-print" style={{ display: "flex", gap: 0, borderBottom: `2px solid ${borderColor}`, marginBottom: 20 }}>
        {visibleVariants.map((v) => {
          const isActive = v.id === activeVariantId
          return (
            <button key={v.id} onClick={() => handleTabClick(v)} style={{
              padding: "10px 20px", background: "none", border: "none",
              borderBottom: isActive ? "2px solid #D4A843" : "2px solid transparent",
              marginBottom: -2, cursor: "pointer", textAlign: "left",
            }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: v.generated ? (isActive ? "#D4A843" : textPrimary) : textSecondary }}>
                {v.label}
              </div>
              {v.generated && v.approach && (
                <div style={{ fontSize: 11, color: textSecondary, marginTop: 2 }}>{v.approach}</div>
              )}
              {!v.generated && (
                <div style={{ fontSize: 11, color: "#D4A843", marginTop: 2 }}>Generate →</div>
              )}
            </button>
          )
        })}
      </div>

      {/* Two-column layout */}
      <div style={{ display: "flex", gap: 24, alignItems: "flex-start" }}>
        {/* Left — main content */}
        <div style={{ flex: "0 0 68%", minWidth: 0 }}>
          {/* Pending generate confirmation */}
          {pendingGenerate && !formula.variants.find((v) => v.id === pendingGenerate)?.generated && (
            <div style={{ marginBottom: 16 }}>
              <GenerateVariantConfirm
                variantLabel={formula.variants.find((v) => v.id === pendingGenerate)?.label ?? "Variant"}
                dark={dark}
                onCancel={() => setPendingGenerate(null)}
              />
            </div>
          )}

          {/* Only show content sections when no pending generate, or active variant is generated */}
          {(!pendingGenerate || activeVariant.generated) && (
            <>
              <FormulaTable variant={activeVariant} reportLevel={reportLevel} dark={dark} />
              <RegulatorySection variant={activeVariant} reportLevel={reportLevel} dark={dark} />
              {show(reportLevel, "brief") && <FormulationNotesSection variant={activeVariant} dark={dark} />}
              {show(reportLevel, "brief") && <SafetySection variant={activeVariant} dark={dark} />}
              {show(reportLevel, "brief") && (
                <MarketIntelSection
                  variant={activeVariant} dark={dark}
                  productType={formula.productType} markets={formula.markets}
                />
              )}
              {show(reportLevel, "brief") && <PreservationSection variant={activeVariant} dark={dark} />}
              {show(reportLevel, "dossier") && <StabilitySection dark={dark} />}
              {show(reportLevel, "dossier") && <ManufacturingSection dark={dark} />}
              {show(reportLevel, "dossier") && <TechnicalIngredientSection dark={dark} />}
              {show(reportLevel, "dossier") && <CitationsSection dark={dark} />}
            </>
          )}
        </div>

        {/* Right — sticky sidebar */}
        <div className="no-print" style={{ flex: "0 0 calc(32% - 24px)", minWidth: 0, position: "sticky", top: 80 }}>
          <UpgradePanel reportLevel={reportLevel} dark={dark} />
          <FormulaActions reportLevel={reportLevel} formulaName={formula.name} dark={dark} />
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg) } }
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; color: black !important; }
          * { box-shadow: none !important; }
          @page { size: A4; margin: 20mm; }
          table { font-size: 11px; }
          tr { padding: 4px 0 !important; }
          .dossier-cover { display: block !important; page-break-after: always; }
          footer::after {
            content: "Generated by theformulator.ai · ${MOCK_FORMULA.name} · ${MOCK_FORMULA.createdAt}";
            display: block; font-size: 10px; color: #6B7280;
            text-align: center; margin-top: 12px;
          }
        }
      `}</style>
    </div>
  )
}
