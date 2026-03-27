"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useTheme } from "@/components/theme-context"

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface BriefState {
  productType: string
  format: string
  texture: string
  primaryFunctions: string[]
  targetSkinTypes: string[]
  targetMarkets: string[]
  claims: string[]
  certificationTargets: string[]
  mustInclude: string[]
  mustExclude: string[]
  budgetTier: string
  phRange: { min: number; max: number } | null
  freeTextConstraints: string
}

interface IntelligenceCard {
  type: "amber" | "green" | "blue" | "red"
  category: string
  title: string
  body: string
}

// ---------------------------------------------------------------------------
// Default / static data
// ---------------------------------------------------------------------------

const DEFAULT_BRIEF: BriefState = {
  productType: "Serum",
  format: "Gel",
  texture: "Lightweight",
  primaryFunctions: ["Hydration", "Brightening"],
  targetSkinTypes: ["Sensitive", "Dry"],
  targetMarkets: [],
  claims: [],
  certificationTargets: [],
  mustInclude: [],
  mustExclude: [],
  budgetTier: "",
  phRange: null,
  freeTextConstraints: "",
}

const DEFAULT_CARDS: IntelligenceCard[] = [
  {
    type: "blue",
    category: "GETTING STARTED",
    title: "Fill in your brief to receive intelligence",
    body: "As you complete the form, the intelligence panel will update in real-time with formulation guidance, regulatory flags, and market insights specific to your product.",
  },
]

const PRODUCT_TYPES = ["Serum", "Moisturiser", "Cleanser", "Toner", "Mask", "Eye Cream", "SPF", "Body Lotion"]
const FORMATS = ["Gel", "Cream", "Oil", "Lotion", "Balm", "Mist", "Powder", "Stick"]
const TEXTURES = ["Lightweight", "Rich", "Watery", "Silky", "Matte", "Dewy"]
const FUNCTIONS = ["Hydration", "Brightening", "Anti-Ageing", "Acne Control", "SPF Protection", "Barrier Repair", "Soothing", "Firming"]
const SKIN_TYPES = ["All Skin", "Dry", "Oily", "Sensitive", "Combination", "Mature"]
const MARKETS = [
  { code: "GB", label: "UK" },
  { code: "EU", label: "EU" },
  { code: "US", label: "USA" },
  { code: "AU", label: "Australia" },
  { code: "CN", label: "China" },
  { code: "JP", label: "Japan" },
  { code: "IN", label: "India" },
  { code: "KR", label: "Korea" },
]
const CLAIMS = ["Dermatologist Tested", "Hypoallergenic", "Non-Comedogenic", "Clinically Proven", "Fragrance-Free", "Cruelty-Free", "Vegan"]
const CERTIFICATIONS = ["COSMOS", "Ecocert", "USDA Organic", "Halal", "Vegan Society", "Leaping Bunny"]
const BUDGET_TIERS = ["Mass Market (<£8)", "Mid Range (£8–£25)", "Prestige (£25–£60)", "Luxury (>£60)"]

// ---------------------------------------------------------------------------
// Card colour config
// ---------------------------------------------------------------------------

const CARD_STYLES: Record<
  IntelligenceCard["type"],
  { bg: string; bgDark: string; borderLeft: string; border: string; borderDark: string; label: string }
> = {
  amber: { bg: "#FFFBEB", bgDark: "#1C1207", borderLeft: "#B45309", border: "#FDE68A", borderDark: "#78350F", label: "#B45309" },
  green: { bg: "#F0FDF4", bgDark: "#071A0E", borderLeft: "#2D6A4F", border: "#BBF7D0", borderDark: "#14532D", label: "#2D6A4F" },
  blue:  { bg: "#EFF6FF", bgDark: "#071524", borderLeft: "#1E40AF", border: "#BFDBFE", borderDark: "#1E3A8A", label: "#1E40AF" },
  red:   { bg: "#FFF5F5", bgDark: "#1F0A0A", borderLeft: "#991B1B", border: "#FECACA", borderDark: "#7F1D1D", label: "#991B1B" },
}

// ---------------------------------------------------------------------------
// Debounce helper — REMOVED, replaced with inline setTimeout
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function SelectField({
  label,
  value,
  options,
  dark,
  onChange,
}: {
  label: string
  value: string
  options: string[]
  dark: boolean
  onChange: (v: string) => void
}) {
  return (
    <div>
      <div style={{ fontSize: 11, fontWeight: 500, color: "#6B7280", letterSpacing: "0.04em", textTransform: "uppercase", marginBottom: 6 }}>
        {label}
      </div>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          width: "100%",
          height: 36,
          borderRadius: 6,
          border: `1px solid ${dark ? "#1B3A5C" : "#E5E7EB"}`,
          backgroundColor: dark ? "#0D1B2A" : "#FFFFFF",
          color: dark ? "#F9FAFB" : "#0D1B2A",
          fontSize: 13,
          padding: "0 10px",
          cursor: "pointer",
          appearance: "none",
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236B7280' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
          backgroundRepeat: "no-repeat",
          backgroundPosition: "right 10px center",
          paddingRight: 28,
        }}
      >
        <option value="">Select…</option>
        {options.map((o) => (
          <option key={o} value={o}>{o}</option>
        ))}
      </select>
    </div>
  )
}

function PillGroup({
  label,
  options,
  selected,
  dark,
  onToggle,
}: {
  label: string
  options: string[]
  selected: string[]
  dark: boolean
  onToggle: (v: string) => void
}) {
  return (
    <div>
      <div style={{ fontSize: 11, fontWeight: 500, color: "#6B7280", letterSpacing: "0.04em", textTransform: "uppercase", marginBottom: 6 }}>
        {label}
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
        {options.map((o) => {
          const active = selected.includes(o)
          return (
            <button
              key={o}
              onClick={() => onToggle(o)}
              style={{
                fontSize: 12,
                fontWeight: 500,
                padding: "5px 10px",
                borderRadius: 20,
                border: `1px solid ${active ? "#D4A843" : dark ? "#1B3A5C" : "#E5E7EB"}`,
                backgroundColor: active ? "#D4A843" : dark ? "#0D1B2A" : "#FFFFFF",
                color: active ? "#0D1B2A" : dark ? "#9CA3AF" : "#6B7280",
                cursor: "pointer",
              }}
            >
              {o}
            </button>
          )
        })}
      </div>
    </div>
  )
}

function MarketPills({
  selected,
  dark,
  onToggle,
}: {
  selected: string[]
  dark: boolean
  onToggle: (code: string) => void
}) {
  return (
    <div>
      <div style={{ fontSize: 11, fontWeight: 500, color: "#6B7280", letterSpacing: "0.04em", textTransform: "uppercase", marginBottom: 6 }}>
        Target Markets
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
        {MARKETS.map(({ code, label }) => {
          const active = selected.includes(code)
          return (
            <button
              key={code}
              onClick={() => onToggle(code)}
              style={{
                fontSize: 12,
                fontWeight: 500,
                padding: "5px 10px",
                borderRadius: 20,
                border: `1px solid ${active ? "#D4A843" : dark ? "#1B3A5C" : "#E5E7EB"}`,
                backgroundColor: active ? "#D4A843" : dark ? "#0D1B2A" : "#FFFFFF",
                color: active ? "#0D1B2A" : dark ? "#9CA3AF" : "#6B7280",
                cursor: "pointer",
              }}
            >
              {label}
            </button>
          )
        })}
      </div>
    </div>
  )
}

// Tags with free-text entry
function TagInput({
  label,
  tags,
  dark,
  placeholder,
  onAdd,
  onRemove,
}: {
  label: string
  tags: string[]
  dark: boolean
  placeholder: string
  onAdd: (v: string) => void
  onRemove: (v: string) => void
}) {
  const [input, setInput] = useState("")
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if ((e.key === "Enter" || e.key === ",") && input.trim()) {
      e.preventDefault()
      onAdd(input.trim())
      setInput("")
    }
  }
  return (
    <div>
      <div style={{ fontSize: 11, fontWeight: 500, color: "#6B7280", letterSpacing: "0.04em", textTransform: "uppercase", marginBottom: 6 }}>
        {label}
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: tags.length ? 6 : 0 }}>
        {tags.map((t) => (
          <span
            key={t}
            style={{
              fontSize: 11,
              fontWeight: 500,
              padding: "3px 8px",
              borderRadius: 4,
              backgroundColor: dark ? "#1B3A5C" : "#EFF6FF",
              color: dark ? "#93C5FD" : "#1E40AF",
              display: "flex",
              alignItems: "center",
              gap: 4,
            }}
          >
            {t}
            <button
              onClick={() => onRemove(t)}
              style={{ background: "none", border: "none", cursor: "pointer", color: "inherit", padding: 0, fontSize: 12, lineHeight: 1 }}
            >
              ×
            </button>
          </span>
        ))}
      </div>
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        style={{
          width: "100%",
          height: 34,
          border: `1px solid ${dark ? "#1B3A5C" : "#E5E7EB"}`,
          borderRadius: 6,
          backgroundColor: dark ? "#0D1B2A" : "#FFFFFF",
          color: dark ? "#F9FAFB" : "#0D1B2A",
          fontSize: 12,
          padding: "0 10px",
          outline: "none",
          boxSizing: "border-box",
        }}
      />
    </div>
  )
}

// Skeleton card shown while loading
function SkeletonCard({ dark }: { dark: boolean }) {
  return (
    <div
      style={{
        backgroundColor: dark ? "#1B3A5C" : "#F3F4F6",
        border: `1px solid ${dark ? "#1B3A5C" : "#E5E7EB"}`,
        borderLeft: `3px solid ${dark ? "#1B3A5C" : "#D1D5DB"}`,
        borderRadius: 8,
        padding: 12,
      }}
      className="animate-pulse"
    >
      <div style={{ width: "40%", height: 8, borderRadius: 4, backgroundColor: dark ? "#0D1B2A" : "#E5E7EB", marginBottom: 8 }} />
      <div style={{ width: "75%", height: 10, borderRadius: 4, backgroundColor: dark ? "#0D1B2A" : "#E5E7EB", marginBottom: 6 }} />
      <div style={{ width: "90%", height: 8, borderRadius: 4, backgroundColor: dark ? "#0D1B2A" : "#E5E7EB", marginBottom: 4 }} />
      <div style={{ width: "60%", height: 8, borderRadius: 4, backgroundColor: dark ? "#0D1B2A" : "#E5E7EB" }} />
    </div>
  )
}

// Individual intelligence card
function IntelCard({ card, dark }: { card: IntelligenceCard; dark: boolean }) {
  const s = CARD_STYLES[card.type]
  return (
    <div
      style={{
        backgroundColor: dark ? s.bgDark : s.bg,
        border: `1px solid ${dark ? s.borderDark : s.border}`,
        borderLeft: `3px solid ${s.borderLeft}`,
        borderRadius: 8,
        padding: 12,
      }}
    >
      <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: s.label, marginBottom: 4 }}>
        {card.category}
      </div>
      <p style={{ fontSize: 13, fontWeight: 600, color: dark ? "#F9FAFB" : "#0D1B2A", margin: 0, marginBottom: 6 }}>
        {card.title}
      </p>
      <p style={{ fontSize: 12, color: "#6B7280", lineHeight: 1.6, margin: 0 }}>
        {card.body}
      </p>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Completeness calculator
// ---------------------------------------------------------------------------

function calcCompleteness(b: BriefState): number {
  let filled = 0
  if (b.productType) filled++
  if (b.format) filled++
  if (b.texture) filled++
  if (b.primaryFunctions.length > 0) filled++
  if (b.targetSkinTypes.length > 0) filled++
  if (b.targetMarkets.length > 0) filled++
  if (b.budgetTier) filled++
  if (b.freeTextConstraints.trim() || b.mustInclude.length > 0 || b.mustExclude.length > 0) filled++
  return Math.round((filled / 8) * 100)
}

const COMPLETENESS_HINTS = [
  "Add more fields to unlock intelligence",
  "Getting started — keep going",
  "Good progress — add markets",
  "Nearly there — add constraints",
  "Brief complete",
]

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function BriefInterview() {
  const { dark } = useTheme()
  const router = useRouter()
  const [brief, setBrief] = useState<BriefState>(DEFAULT_BRIEF)
  const [intelligenceCards, setIntelligenceCards] = useState<IntelligenceCard[]>(DEFAULT_CARDS)
  const [isLoadingIntelligence, setIsLoadingIntelligence] = useState(false)

  useEffect(() => {
    console.log("[v0] Brief updated:", JSON.stringify(brief))
    const timer = setTimeout(async () => {
      setIsLoadingIntelligence(true)
      console.log("[v0] Fetching intelligence for:", brief)
      try {
        const res = await fetch("/api/brief-intelligence", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(brief),
        })
        console.log("[v0] API response status:", res.status)
        const cards = await res.json()
        console.log("[v0] Cards received:", JSON.stringify(cards))
        if (Array.isArray(cards) && cards.length > 0) {
          setIntelligenceCards(cards)
        }
      } catch (error) {
        console.log("[v0] API error:", error)
      } finally {
        setIsLoadingIntelligence(false)
      }
    }, 600)
    return () => clearTimeout(timer)
  }, [brief])

  // Helpers
  const toggle = (field: keyof BriefState, value: string) => {
    const arr = brief[field] as string[]
    setBrief({
      ...brief,
      [field]: arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value],
    })
  }

  const addTag = (field: keyof BriefState, value: string) => {
    const arr = brief[field] as string[]
    if (!arr.includes(value)) setBrief({ ...brief, [field]: [...arr, value] })
  }

  const removeTag = (field: keyof BriefState, value: string) => {
    const arr = brief[field] as string[]
    setBrief({ ...brief, [field]: arr.filter((v) => v !== value) })
  }

  const completeness = calcCompleteness(brief)
  const hintIndex = Math.min(Math.floor(completeness / 25), COMPLETENESS_HINTS.length - 1)

  return (
    <div style={{ display: "flex", gap: 24, alignItems: "flex-start" }}>
      {/* ------------------------------------------------------------------ */}
      {/* Left panel — the form                                               */}
      {/* ------------------------------------------------------------------ */}
      <div style={{ flex: "0 0 60%", minWidth: 0 }}>
        {/* Header */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 20, fontWeight: 500, color: dark ? "#F9FAFB" : "#0D1B2A" }}>
            New Formulation Brief
          </div>
          <div style={{ fontSize: 13, color: dark ? "#9CA3AF" : "#6B7280", marginTop: 4 }}>
            Answer these questions and the intelligence panel will update in real-time.
          </div>
        </div>

        {/* Completeness bar */}
        <div
          style={{
            backgroundColor: dark ? "#0D1B2A" : "#FFFFFF",
            border: `1px solid ${dark ? "#1B3A5C" : "#E5E7EB"}`,
            borderRadius: 10,
            padding: 16,
            marginBottom: 16,
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <span style={{ fontSize: 12, fontWeight: 500, color: dark ? "#9CA3AF" : "#6B7280" }}>
              Brief completeness
            </span>
            <span style={{ fontSize: 12, fontWeight: 600, color: completeness >= 75 ? "#2D6A4F" : "#B45309" }}>
              {completeness}%
            </span>
          </div>
          <div style={{ height: 4, backgroundColor: dark ? "#1B3A5C" : "#E5E7EB", borderRadius: 2, overflow: "hidden" }}>
            <div
              style={{
                height: "100%",
                width: `${completeness}%`,
                backgroundColor: completeness >= 75 ? "#2D6A4F" : "#D4A843",
                borderRadius: 2,
                transition: "width 0.3s ease",
              }}
            />
          </div>
          <div style={{ fontSize: 11, color: dark ? "#6B7280" : "#9CA3AF", marginTop: 6 }}>
            {COMPLETENESS_HINTS[hintIndex]}
          </div>
        </div>

        {/* Layer 1 — Product Definition */}
        <div
          style={{
            backgroundColor: dark ? "#0D1B2A" : "#FFFFFF",
            border: `1px solid ${dark ? "#1B3A5C" : "#E5E7EB"}`,
            borderRadius: 10,
            padding: 20,
            marginBottom: 16,
          }}
        >
          <div style={{ fontSize: 12, fontWeight: 600, color: dark ? "#F9FAFB" : "#0D1B2A", marginBottom: 16, letterSpacing: "0.02em" }}>
            PRODUCT DEFINITION
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
              <SelectField label="Product Type" value={brief.productType} options={PRODUCT_TYPES} dark={dark} onChange={(v) => setBrief({ ...brief, productType: v })} />
              <SelectField label="Format" value={brief.format} options={FORMATS} dark={dark} onChange={(v) => setBrief({ ...brief, format: v })} />
              <SelectField label="Texture" value={brief.texture} options={TEXTURES} dark={dark} onChange={(v) => setBrief({ ...brief, texture: v })} />
            </div>
            <PillGroup label="Primary Functions" options={FUNCTIONS} selected={brief.primaryFunctions} dark={dark} onToggle={(v) => toggle("primaryFunctions", v)} />
            <PillGroup label="Target Skin Types" options={SKIN_TYPES} selected={brief.targetSkinTypes} dark={dark} onToggle={(v) => toggle("targetSkinTypes", v)} />
            {/* Free text constraints */}
            <div>
              <div style={{ fontSize: 11, fontWeight: 500, color: "#6B7280", letterSpacing: "0.04em", textTransform: "uppercase", marginBottom: 6 }}>
                Additional constraints or notes
              </div>
              <textarea
                rows={3}
                value={brief.freeTextConstraints}
                onChange={(e) => setBrief({ ...brief, freeTextConstraints: e.target.value })}
                placeholder="e.g. sulphate free, no silicones, must work at pH 4.5, vegan, no animal testing..."
                style={{
                  width: "100%",
                  border: `1px solid ${dark ? "#1B3A5C" : "#E5E7EB"}`,
                  borderRadius: 6,
                  backgroundColor: dark ? "#0D1B2A" : "#FFFFFF",
                  color: dark ? "#F9FAFB" : "#0D1B2A",
                  fontSize: 13,
                  padding: "10px 12px",
                  resize: "vertical",
                  outline: "none",
                  fontFamily: "inherit",
                  lineHeight: 1.5,
                  boxSizing: "border-box",
                }}
              />
            </div>
          </div>
        </div>

        {/* Layer 2 — Markets & Regulatory */}
        <div
          style={{
            backgroundColor: dark ? "#0D1B2A" : "#FFFFFF",
            border: `1px solid ${dark ? "#1B3A5C" : "#E5E7EB"}`,
            borderRadius: 10,
            padding: 20,
            marginBottom: 16,
          }}
        >
          <div style={{ fontSize: 12, fontWeight: 600, color: dark ? "#F9FAFB" : "#0D1B2A", marginBottom: 16, letterSpacing: "0.02em" }}>
            MARKETS &amp; REGULATORY
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <MarketPills selected={brief.targetMarkets} dark={dark} onToggle={(v) => toggle("targetMarkets", v)} />
            <PillGroup label="Claims" options={CLAIMS} selected={brief.claims} dark={dark} onToggle={(v) => toggle("claims", v)} />
            <PillGroup label="Certification Targets" options={CERTIFICATIONS} selected={brief.certificationTargets} dark={dark} onToggle={(v) => toggle("certificationTargets", v)} />
          </div>
        </div>

        {/* Layer 3 — Formulation Constraints */}
        <div
          style={{
            backgroundColor: dark ? "#0D1B2A" : "#FFFFFF",
            border: `1px solid ${dark ? "#1B3A5C" : "#E5E7EB"}`,
            borderRadius: 10,
            padding: 20,
            marginBottom: 16,
          }}
        >
          <div style={{ fontSize: 12, fontWeight: 600, color: dark ? "#F9FAFB" : "#0D1B2A", marginBottom: 16, letterSpacing: "0.02em" }}>
            FORMULATION CONSTRAINTS
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <TagInput
              label="Must Include"
              tags={brief.mustInclude}
              dark={dark}
              placeholder="Type an ingredient and press Enter…"
              onAdd={(v) => addTag("mustInclude", v)}
              onRemove={(v) => removeTag("mustInclude", v)}
            />
            <TagInput
              label="Must Exclude"
              tags={brief.mustExclude}
              dark={dark}
              placeholder="e.g. SLS, Parabens, Silicones…"
              onAdd={(v) => addTag("mustExclude", v)}
              onRemove={(v) => removeTag("mustExclude", v)}
            />
            <SelectField label="Budget Tier" value={brief.budgetTier} options={BUDGET_TIERS} dark={dark} onChange={(v) => setBrief({ ...brief, budgetTier: v })} />
          </div>
        </div>

        {/* Generate button */}
        <button
          onClick={() => router.push("/formula-output")}
          style={{
            backgroundColor: "#D4A843",
            color: "#0D1B2A",
            fontWeight: 600,
            fontSize: 14,
            height: 44,
            borderRadius: 8,
            width: "100%",
            border: "none",
            cursor: "pointer",
          }}
        >
          Generate Formulation →
        </button>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Right panel — Live Intelligence                                     */}
      {/* ------------------------------------------------------------------ */}
      <div style={{ flex: "0 0 calc(40% - 24px)", minWidth: 0, position: "sticky", top: 80 }}>
        <div
          style={{
            backgroundColor: dark ? "#0D1B2A" : "#FFFFFF",
            border: `1px solid ${dark ? "#1B3A5C" : "#E5E7EB"}`,
            borderRadius: 10,
            padding: 20,
          }}
        >
          {/* Panel header */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: dark ? "#F9FAFB" : "#0D1B2A", letterSpacing: "0.02em" }}>
                LIVE INTELLIGENCE
              </div>
              <div style={{ fontSize: 11, color: dark ? "#6B7280" : "#9CA3AF", marginTop: 2 }}>
                Updates as you fill the brief
              </div>
            </div>
            {isLoadingIntelligence && (
              <div
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  backgroundColor: "#D4A843",
                }}
                className="animate-pulse"
              />
            )}
          </div>

          {/* Cards */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {isLoadingIntelligence
              ? [0, 1, 2].map((i) => <SkeletonCard key={i} dark={dark} />)
              : intelligenceCards.map((card, i) => (
                  <IntelCard key={i} card={card} dark={dark} />
                ))}
          </div>

          {/* Footer */}
          <div
            style={{
              marginTop: 16,
              paddingTop: 12,
              borderTop: `1px solid ${dark ? "#1B3A5C" : "#F3F4F6"}`,
              fontSize: 11,
              color: dark ? "#6B7280" : "#9CA3AF",
              lineHeight: 1.5,
            }}
          >
            Powered by theformulator.ai intelligence engine · 550,000+ product corpus
          </div>
        </div>
      </div>
    </div>
  )
}
