"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useTheme } from "@/components/theme-context"

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface BriefState {
  // Layer 1
  productType: string
  format: string
  texture: string
  primaryFunctions: string[]
  targetSkinTypes: string[]
  // Layer 2
  targetMarkets: string[]
  claims: string[]
  targetRetailers: string[]
  regulatoryPriority: string
  // Layer 3
  mustInclude: string[]
  mustExclude: string[]
  preferNatural: boolean
  fragranceApproach: string
  colorantApproach: string
  // Layer 4
  budgetTier: string
  viscosityTarget: string
  phRange: { min: number; max: number } | null
  preservationStrategy: string
  packagingType: string
  shelfLifeMonths: number | null
  batchSize: string
  freeTextConstraints: string
  // Layer 5
  referenceProducts: string[]
  pricePositioning: string
  differentiators: string[]
  targetLaunchDate: string
}

interface IntelligenceCard {
  type: "amber" | "green" | "blue" | "red"
  category: string
  title: string
  body: string
}

// ---------------------------------------------------------------------------
// Static data
// ---------------------------------------------------------------------------

const DEFAULT_BRIEF: BriefState = {
  productType: "",
  format: "",
  texture: "",
  primaryFunctions: [],
  targetSkinTypes: [],
  targetMarkets: [],
  claims: [],
  targetRetailers: [],
  regulatoryPriority: "",
  mustInclude: [],
  mustExclude: [],
  preferNatural: false,
  fragranceApproach: "",
  colorantApproach: "",
  budgetTier: "",
  viscosityTarget: "",
  phRange: null,
  preservationStrategy: "",
  packagingType: "",
  shelfLifeMonths: null,
  batchSize: "",
  freeTextConstraints: "",
  referenceProducts: [],
  pricePositioning: "",
  differentiators: [],
  targetLaunchDate: "",
}

const DEFAULT_CARDS: IntelligenceCard[] = [
  {
    type: "blue",
    category: "GETTING STARTED",
    title: "Fill in your brief to receive intelligence",
    body: "As you complete the form, the intelligence panel will update in real-time with formulation guidance, regulatory flags, and market insights specific to your product.",
  },
]

const PRODUCT_TYPES = ["Serum", "Moisturiser", "Cleanser", "Toner", "Mask", "Eye Cream", "SPF", "Body Lotion", "Shampoo", "Conditioner", "Body Wash"]
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
  { code: "CA", label: "Canada" },
  { code: "BR", label: "Brazil" },
  { code: "ASEAN", label: "ASEAN" },
  { code: "MY", label: "Malaysia" },
  { code: "SG", label: "Singapore" },
]
const CLAIMS = ["Dermatologist Tested", "Hypoallergenic", "Non-Comedogenic", "Clinically Proven", "Fragrance-Free", "Cruelty-Free", "Vegan"]
const CERTIFICATIONS = ["COSMOS", "Ecocert", "USDA Organic", "Halal", "Vegan Society", "Leaping Bunny"]
const RETAILERS = ["Sephora Clean", "Credo Clean Standard", "Ulta Conscious Beauty", "Whole Foods Premium Body Care"]
const BUDGET_TIERS = ["Mass Market (<£8)", "Mid Range (£8–£25)", "Prestige (£25–£60)", "Luxury (>£60)"]
const VISCOSITY_OPTIONS = ["Water-thin", "Light lotion", "Medium cream", "Thick balm", "Paste"]
const PRESERVATION_OPTIONS = ["Conventional", "Natural/hurdle", "Self-preserving", "Formulator will specify"]
const PACKAGING_OPTIONS = ["Jar", "Pump", "Tube", "Dropper", "Airless", "Spray", "Sachet"]
const SHELF_LIFE_OPTIONS = [12, 18, 24, 36]
const BATCH_SIZE_OPTIONS = ["Lab (1–5 kg)", "Pilot (50–200 kg)", "Production (500+ kg)"]
const FRAGRANCE_OPTIONS = ["Fragrance-free", "Essential oils only", "Nature-identical", "No preference"]
const COLORANT_OPTIONS = ["No colorants", "Natural only", "No preference"]
const REGULATORY_PRIORITY_OPTIONS = ["Strictest market governs", "Per-market variants", "EU baseline"]
const PRICE_POSITIONING_OPTIONS = ["Below market", "At market", "Premium", "Ultra-premium"]
const DIFFERENTIATOR_OPTIONS = ["Novel actives", "Clean label", "Clinical claims", "Texture innovation", "Multi-functional", "Speed to market"]
const LAUNCH_DATE_OPTIONS = ["ASAP", "3 months", "6 months", "12+ months"]

// Preservative system mock data
const PRESERVATIVE_OPTIONS = [
  { inci: "Phenoxyethanol (and) Ethylhexylglycerin", phRange: "3–8", spectrum: "Broad", natural: 12 },
  { inci: "Sodium Benzoate (and) Potassium Sorbate", phRange: "2.5–5.5", spectrum: "Broad", natural: 95 },
  { inci: "Glyceryl Caprylate (and) Glyceryl Undecylenate", phRange: "3.5–6.5", spectrum: "Gram+/yeast", natural: 100 },
]
const PRESERVATIVE_BOOSTERS = [
  { inci: "1,2-Hexanediol", note: "Broad booster, skin feel" },
  { inci: "Caprylyl Glycol", note: "Moisturising, antimicrobial" },
]

// Surfactant system mock data
const SURFACTANT_OPTIONS = [
  { inci: "Sodium Cocoyl Isethionate", mildness: 9, foam: "Rich, creamy" },
  { inci: "Disodium Laureth Sulfosuccinate", mildness: 8, foam: "Moderate, stable" },
  { inci: "Cocamidopropyl Betaine", mildness: 7, foam: "Light, boosting" },
]
const COSURFACTANT_OPTIONS = [
  { inci: "Lauryl Glucoside", note: "APG, gentle, cold process" },
  { inci: "Sodium Lauroyl Sarcosinate", note: "Mild, foam enhancer" },
]

// Silicone alternatives
const SILICONE_ALTS = {
  "Slip & Glide": ["Isodecyl Neopentanoate", "C12-15 Alkyl Benzoate"],
  "Skin Feel": ["Tapioca Starch", "Nylon-12"],
  "Film Forming": ["Hydroxypropyl Starch Phosphate", "Polyglyceryl-3 Methylglucose Distearate"],
}

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
// Sub-components
// ---------------------------------------------------------------------------

function SectionCard({ dark, title, children }: { dark: boolean; title: string; children: React.ReactNode }) {
  return (
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
        {title}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {children}
      </div>
    </div>
  )
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontSize: 11, fontWeight: 500, color: "#6B7280", letterSpacing: "0.04em", textTransform: "uppercase", marginBottom: 6 }}>
      {children}
    </div>
  )
}

function SelectField({
  label, value, options, dark, onChange,
}: {
  label: string; value: string; options: string[]; dark: boolean; onChange: (v: string) => void
}) {
  return (
    <div>
      <FieldLabel>{label}</FieldLabel>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          width: "100%", height: 36, borderRadius: 6,
          border: `1px solid ${dark ? "#1B3A5C" : "#E5E7EB"}`,
          backgroundColor: dark ? "#0D1B2A" : "#FFFFFF",
          color: value ? (dark ? "#F9FAFB" : "#0D1B2A") : "#9CA3AF",
          fontSize: 13, padding: "0 10px", cursor: "pointer", appearance: "none",
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236B7280' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
          backgroundRepeat: "no-repeat", backgroundPosition: "right 10px center", paddingRight: 28,
        }}
      >
        <option value="">Select…</option>
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  )
}

function PillGroup({
  label, options, selected, dark, onToggle,
}: {
  label: string; options: string[]; selected: string[]; dark: boolean; onToggle: (v: string) => void
}) {
  return (
    <div>
      <FieldLabel>{label}</FieldLabel>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
        {options.map((o) => {
          const active = selected.includes(o)
          return (
            <button key={o} onClick={() => onToggle(o)} style={{
              fontSize: 12, fontWeight: 500, padding: "5px 10px", borderRadius: 20,
              border: `1px solid ${active ? "#D4A843" : dark ? "#1B3A5C" : "#E5E7EB"}`,
              backgroundColor: active ? "#D4A843" : dark ? "#0D1B2A" : "#FFFFFF",
              color: active ? "#0D1B2A" : dark ? "#9CA3AF" : "#6B7280", cursor: "pointer",
            }}>
              {o}
            </button>
          )
        })}
      </div>
    </div>
  )
}

function MarketPills({ selected, dark, onToggle }: { selected: string[]; dark: boolean; onToggle: (code: string) => void }) {
  return (
    <div>
      <FieldLabel>Target Markets</FieldLabel>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
        {MARKETS.map(({ code, label }) => {
          const active = selected.includes(code)
          return (
            <button key={code} onClick={() => onToggle(code)} style={{
              fontSize: 12, fontWeight: 500, padding: "5px 10px", borderRadius: 20,
              border: `1px solid ${active ? "#D4A843" : dark ? "#1B3A5C" : "#E5E7EB"}`,
              backgroundColor: active ? "#D4A843" : dark ? "#0D1B2A" : "#FFFFFF",
              color: active ? "#0D1B2A" : dark ? "#9CA3AF" : "#6B7280", cursor: "pointer",
            }}>
              {label}
            </button>
          )
        })}
      </div>
    </div>
  )
}

function TagInput({
  label, tags, dark, placeholder, onAdd, onRemove,
}: {
  label: string; tags: string[]; dark: boolean; placeholder: string; onAdd: (v: string) => void; onRemove: (v: string) => void
}) {
  const [input, setInput] = useState("")
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if ((e.key === "Enter" || e.key === ",") && input.trim()) {
      e.preventDefault(); onAdd(input.trim()); setInput("")
    }
  }
  return (
    <div>
      <FieldLabel>{label}</FieldLabel>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: tags.length ? 6 : 0 }}>
        {tags.map((t) => (
          <span key={t} style={{
            fontSize: 11, fontWeight: 500, padding: "3px 8px", borderRadius: 4,
            backgroundColor: dark ? "#1B3A5C" : "#EFF6FF", color: dark ? "#93C5FD" : "#1E40AF",
            display: "flex", alignItems: "center", gap: 4,
          }}>
            {t}
            <button onClick={() => onRemove(t)} style={{ background: "none", border: "none", cursor: "pointer", color: "inherit", padding: 0, fontSize: 12, lineHeight: 1 }}>×</button>
          </span>
        ))}
      </div>
      <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={handleKeyDown} placeholder={placeholder}
        style={{
          width: "100%", height: 34, border: `1px solid ${dark ? "#1B3A5C" : "#E5E7EB"}`, borderRadius: 6,
          backgroundColor: dark ? "#0D1B2A" : "#FFFFFF", color: dark ? "#F9FAFB" : "#0D1B2A",
          fontSize: 12, padding: "0 10px", outline: "none", boxSizing: "border-box",
        }}
      />
    </div>
  )
}

function ToggleSwitch({ label, checked, dark, onChange }: { label: string; checked: boolean; dark: boolean; onChange: (v: boolean) => void }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
      <span style={{ fontSize: 13, color: dark ? "#F9FAFB" : "#0D1B2A" }}>{label}</span>
      <button
        onClick={() => onChange(!checked)}
        style={{
          width: 36, height: 20, borderRadius: 10,
          backgroundColor: checked ? "#D4A843" : dark ? "#1B3A5C" : "#E5E7EB",
          border: "none", cursor: "pointer", position: "relative", flexShrink: 0,
        }}
      >
        <div style={{
          width: 16, height: 16, borderRadius: "50%", backgroundColor: "#FFFFFF",
          position: "absolute", top: 2, left: checked ? 18 : 2, transition: "left 0.15s ease",
        }} />
      </button>
    </div>
  )
}

function NumberInput({ label, value, min, max, step, dark, onChange, placeholder }: {
  label: string; value: number | ""; min?: number; max?: number; step?: number; dark: boolean;
  onChange: (v: number | null) => void; placeholder?: string
}) {
  return (
    <div>
      <FieldLabel>{label}</FieldLabel>
      <input type="number" value={value} min={min} max={max} step={step} placeholder={placeholder}
        onChange={(e) => onChange(e.target.value ? parseFloat(e.target.value) : null)}
        style={{
          width: "100%", height: 36, borderRadius: 6, border: `1px solid ${dark ? "#1B3A5C" : "#E5E7EB"}`,
          backgroundColor: dark ? "#0D1B2A" : "#FFFFFF", color: dark ? "#F9FAFB" : "#0D1B2A",
          fontSize: 13, padding: "0 10px", outline: "none", boxSizing: "border-box",
        }}
      />
    </div>
  )
}

// Skeleton and intel cards
function SkeletonCard({ dark }: { dark: boolean }) {
  return (
    <div style={{
      backgroundColor: dark ? "#1B3A5C" : "#F3F4F6",
      border: `1px solid ${dark ? "#1B3A5C" : "#E5E7EB"}`,
      borderLeft: `3px solid ${dark ? "#1B3A5C" : "#D1D5DB"}`,
      borderRadius: 8, padding: 12,
    }} className="animate-pulse">
      <div style={{ width: "40%", height: 8, borderRadius: 4, backgroundColor: dark ? "#0D1B2A" : "#E5E7EB", marginBottom: 8 }} />
      <div style={{ width: "75%", height: 10, borderRadius: 4, backgroundColor: dark ? "#0D1B2A" : "#E5E7EB", marginBottom: 6 }} />
      <div style={{ width: "90%", height: 8, borderRadius: 4, backgroundColor: dark ? "#0D1B2A" : "#E5E7EB", marginBottom: 4 }} />
      <div style={{ width: "60%", height: 8, borderRadius: 4, backgroundColor: dark ? "#0D1B2A" : "#E5E7EB" }} />
    </div>
  )
}

function IntelCard({ card, dark }: { card: IntelligenceCard; dark: boolean }) {
  const s = CARD_STYLES[card.type]
  return (
    <div style={{
      backgroundColor: dark ? s.bgDark : s.bg,
      border: `1px solid ${dark ? s.borderDark : s.border}`,
      borderLeft: `3px solid ${s.borderLeft}`,
      borderRadius: 8, padding: 12,
    }}>
      <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: s.label, marginBottom: 4 }}>
        {card.category}
      </div>
      <p style={{ fontSize: 13, fontWeight: 600, color: dark ? "#F9FAFB" : "#0D1B2A", margin: 0, marginBottom: 6 }}>{card.title}</p>
      <p style={{ fontSize: 12, color: "#6B7280", lineHeight: 1.6, margin: 0 }}>{card.body}</p>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Conditional selection cards
// ---------------------------------------------------------------------------

function SelectionCard({ dark, title, children }: { dark: boolean; title: string; children: React.ReactNode }) {
  return (
    <div style={{
      backgroundColor: dark ? "#0D1B2A" : "#FFFFFF",
      border: `1px solid ${dark ? "#1B3A5C" : "#E5E7EB"}`,
      borderLeft: "3px solid #D4A843",
      borderRadius: 10, padding: 20, marginBottom: 16,
    }}>
      <div style={{ fontSize: 12, fontWeight: 600, color: dark ? "#F9FAFB" : "#0D1B2A", marginBottom: 14, letterSpacing: "0.02em" }}>
        {title}
      </div>
      {children}
    </div>
  )
}

function PreservativeCard({ dark, brief, selectedPreservative, setSelectedPreservative, selectedBoosters, toggleBooster }: {
  dark: boolean; brief: BriefState; selectedPreservative: string; setSelectedPreservative: (v: string) => void;
  selectedBoosters: string[]; toggleBooster: (v: string) => void
}) {
  const show = brief.preservationStrategy &&
    brief.preservationStrategy !== "Formulator will specify" &&
    brief.format !== "Powder" && brief.format !== "Stick"
  if (!show) return null
  return (
    <SelectionCard dark={dark} title="PRESERVATIVE SYSTEM — SELECT ONE">
      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 14 }}>
        {PRESERVATIVE_OPTIONS.map((p) => {
          const selected = selectedPreservative === p.inci
          return (
            <button key={p.inci} onClick={() => setSelectedPreservative(p.inci)} style={{
              textAlign: "left", padding: 12, borderRadius: 8, cursor: "pointer",
              border: `1px solid ${selected ? "#D4A843" : dark ? "#1B3A5C" : "#E5E7EB"}`,
              borderLeft: `3px solid ${selected ? "#D4A843" : "transparent"}`,
              backgroundColor: selected ? (dark ? "#1C1207" : "#FFFBEB") : (dark ? "#0D1B2A" : "#F9FAFB"),
            }}>
              <div style={{ fontSize: 12, fontWeight: 600, fontFamily: "var(--font-mono)", color: dark ? "#F9FAFB" : "#0D1B2A", marginBottom: 4 }}>
                {p.inci}
              </div>
              <div style={{ display: "flex", gap: 12 }}>
                <span style={{ fontSize: 11, color: "#6B7280" }}>pH {p.phRange}</span>
                <span style={{ fontSize: 11, color: "#6B7280" }}>{p.spectrum}</span>
                <span style={{ fontSize: 11, color: p.natural === 100 ? "#2D6A4F" : "#B45309" }}>{p.natural}% natural origin</span>
              </div>
            </button>
          )
        })}
      </div>
      <div style={{ fontSize: 11, fontWeight: 500, color: "#6B7280", letterSpacing: "0.04em", textTransform: "uppercase", marginBottom: 8 }}>Boosters</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {PRESERVATIVE_BOOSTERS.map((b) => {
          const checked = selectedBoosters.includes(b.inci)
          return (
            <label key={b.inci} style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
              <input type="checkbox" checked={checked} onChange={() => toggleBooster(b.inci)}
                style={{ width: 14, height: 14, accentColor: "#D4A843", cursor: "pointer" }} />
              <span style={{ fontSize: 12, fontFamily: "var(--font-mono)", color: dark ? "#F9FAFB" : "#0D1B2A" }}>{b.inci}</span>
              <span style={{ fontSize: 11, color: "#6B7280" }}>— {b.note}</span>
            </label>
          )
        })}
      </div>
    </SelectionCard>
  )
}

function SurfactantCard({ dark, brief, selectedSurf, setSelectedSurf, selectedCoSurf, toggleCoSurf }: {
  dark: boolean; brief: BriefState; selectedSurf: string; setSelectedSurf: (v: string) => void;
  selectedCoSurf: string[]; toggleCoSurf: (v: string) => void
}) {
  const cleansers = ["Cleanser", "Shampoo", "Body Wash", "Conditioner"]
  if (!cleansers.includes(brief.productType)) return null
  return (
    <SelectionCard dark={dark} title="SURFACTANT SYSTEM — SELECT PRIMARY">
      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 14 }}>
        {SURFACTANT_OPTIONS.map((s) => {
          const selected = selectedSurf === s.inci
          return (
            <button key={s.inci} onClick={() => setSelectedSurf(s.inci)} style={{
              textAlign: "left", padding: 12, borderRadius: 8, cursor: "pointer",
              border: `1px solid ${selected ? "#D4A843" : dark ? "#1B3A5C" : "#E5E7EB"}`,
              borderLeft: `3px solid ${selected ? "#D4A843" : "transparent"}`,
              backgroundColor: selected ? (dark ? "#1C1207" : "#FFFBEB") : (dark ? "#0D1B2A" : "#F9FAFB"),
            }}>
              <div style={{ fontSize: 12, fontWeight: 600, fontFamily: "var(--font-mono)", color: dark ? "#F9FAFB" : "#0D1B2A", marginBottom: 4 }}>{s.inci}</div>
              <div style={{ display: "flex", gap: 12 }}>
                <span style={{ fontSize: 11, color: "#6B7280" }}>Mildness {s.mildness}/10</span>
                <span style={{ fontSize: 11, color: "#6B7280" }}>Foam: {s.foam}</span>
              </div>
            </button>
          )
        })}
      </div>
      <div style={{ fontSize: 11, fontWeight: 500, color: "#6B7280", letterSpacing: "0.04em", textTransform: "uppercase", marginBottom: 8 }}>Co-Surfactants</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {COSURFACTANT_OPTIONS.map((c) => {
          const checked = selectedCoSurf.includes(c.inci)
          return (
            <label key={c.inci} style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
              <input type="checkbox" checked={checked} onChange={() => toggleCoSurf(c.inci)}
                style={{ width: 14, height: 14, accentColor: "#D4A843", cursor: "pointer" }} />
              <span style={{ fontSize: 12, fontFamily: "var(--font-mono)", color: dark ? "#F9FAFB" : "#0D1B2A" }}>{c.inci}</span>
              <span style={{ fontSize: 11, color: "#6B7280" }}>— {c.note}</span>
            </label>
          )
        })}
      </div>
    </SelectionCard>
  )
}

function SiliconeAltsCard({ dark, brief, selectedAlts, toggleAlt }: {
  dark: boolean; brief: BriefState; selectedAlts: string[]; toggleAlt: (v: string) => void
}) {
  const siliconeTerms = ["silicone", "dimethicone", "cyclomethicone", "cyclopentasiloxane"]
  const excluded = brief.mustExclude.some((e) => siliconeTerms.some((t) => e.toLowerCase().includes(t)))
  const freeText = siliconeTerms.some((t) => brief.freeTextConstraints.toLowerCase().includes(t))
  if (!excluded && !freeText) return null
  return (
    <SelectionCard dark={dark} title="SILICONE ALTERNATIVES — SELECT REPLACEMENTS">
      {Object.entries(SILICONE_ALTS).map(([group, alts]) => (
        <div key={group} style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 11, fontWeight: 500, color: "#6B7280", letterSpacing: "0.04em", textTransform: "uppercase", marginBottom: 6 }}>{group}</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {alts.map((a) => {
              const checked = selectedAlts.includes(a)
              return (
                <label key={a} style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
                  <input type="checkbox" checked={checked} onChange={() => toggleAlt(a)}
                    style={{ width: 14, height: 14, accentColor: "#D4A843", cursor: "pointer" }} />
                  <span style={{ fontSize: 12, fontFamily: "var(--font-mono)", color: dark ? "#F9FAFB" : "#0D1B2A" }}>{a}</span>
                </label>
              )
            })}
          </div>
        </div>
      ))}
    </SelectionCard>
  )
}

// ---------------------------------------------------------------------------
// Completeness calculator (14 fields)
// ---------------------------------------------------------------------------

function calcCompleteness(b: BriefState): number {
  let filled = 0
  if (b.productType) filled++
  if (b.format) filled++
  if (b.primaryFunctions.length > 0) filled++
  if (b.targetSkinTypes.length > 0) filled++
  if (b.targetMarkets.length > 0) filled++
  if (b.regulatoryPriority) filled++
  if (b.mustInclude.length > 0 || b.mustExclude.length > 0) filled++
  if (b.fragranceApproach) filled++
  if (b.budgetTier) filled++
  if (b.viscosityTarget) filled++
  if (b.preservationStrategy) filled++
  if (b.packagingType) filled++
  if (b.pricePositioning) filled++
  if (b.targetLaunchDate) filled++
  return Math.round((filled / 13) * 100)
}

const COMPLETENESS_HINTS = [
  "Add more fields to unlock intelligence",
  "Getting started — keep going",
  "Good progress — add markets",
  "Nearly there — add technical constraints",
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

  // Paste & parse state
  const [rawBrief, setRawBrief] = useState("")
  const [isParsing, setIsParsing] = useState(false)
  const [parseStatus, setParseStatus] = useState<"idle" | "success" | "error">("idle")

  // Conditional selection state
  const [selectedPreservative, setSelectedPreservative] = useState("")
  const [selectedBoosters, setSelectedBoosters] = useState<string[]>([])
  const [selectedSurf, setSelectedSurf] = useState("")
  const [selectedCoSurf, setSelectedCoSurf] = useState<string[]>([])
  const [selectedAlts, setSelectedAlts] = useState<string[]>([])

  useEffect(() => {
    const timer = setTimeout(async () => {
      setIsLoadingIntelligence(true)
      try {
        const res = await fetch("/api/brief-intelligence", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(brief),
        })
        const cards = await res.json()
        if (Array.isArray(cards) && cards.length > 0) setIntelligenceCards(cards)
      } catch {
        // keep existing cards on error
      } finally {
        setIsLoadingIntelligence(false)
      }
    }, 600)
    return () => clearTimeout(timer)
  }, [brief])

  const toggle = (field: keyof BriefState, value: string) => {
    const arr = brief[field] as string[]
    setBrief({ ...brief, [field]: arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value] })
  }
  const addTag = (field: keyof BriefState, value: string) => {
    const arr = brief[field] as string[]
    if (!arr.includes(value)) setBrief({ ...brief, [field]: [...arr, value] })
  }
  const removeTag = (field: keyof BriefState, value: string) => {
    const arr = brief[field] as string[]
    setBrief({ ...brief, [field]: arr.filter((v) => v !== value) })
  }
  const set = <K extends keyof BriefState>(field: K, value: BriefState[K]) =>
    setBrief({ ...brief, [field]: value })

  const parseBrief = async () => {
    if (!rawBrief.trim()) return
    setIsParsing(true)
    setParseStatus("idle")
    try {
      const res = await fetch("/api/brief-intelligence", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: "parse", rawText: rawBrief }),
      })
      const data = await res.json()
      if (data.success && data.fields) {
        setBrief((prev) => ({ ...prev, ...data.fields }))
        setParseStatus("success")
      } else {
        setParseStatus("error")
      }
    } catch {
      setParseStatus("error")
    } finally {
      setIsParsing(false)
    }
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
          <div style={{ fontSize: 20, fontWeight: 500, color: dark ? "#F9FAFB" : "#0D1B2A" }}>New Formulation Brief</div>
          <div style={{ fontSize: 13, color: dark ? "#9CA3AF" : "#6B7280", marginTop: 4 }}>
            Answer these questions and the intelligence panel will update in real-time.
          </div>
        </div>

        {/* Completeness bar */}
        <div style={{
          backgroundColor: dark ? "#0D1B2A" : "#FFFFFF",
          border: `1px solid ${dark ? "#1B3A5C" : "#E5E7EB"}`,
          borderRadius: 10, padding: 16, marginBottom: 16,
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <span style={{ fontSize: 12, fontWeight: 500, color: dark ? "#9CA3AF" : "#6B7280" }}>Brief completeness</span>
            <span style={{ fontSize: 12, fontWeight: 600, color: completeness >= 75 ? "#2D6A4F" : "#B45309" }}>{completeness}%</span>
          </div>
          <div style={{ height: 4, backgroundColor: dark ? "#1B3A5C" : "#E5E7EB", borderRadius: 2, overflow: "hidden" }}>
            <div style={{
              height: "100%", width: `${completeness}%`,
              backgroundColor: completeness >= 75 ? "#2D6A4F" : "#D4A843",
              borderRadius: 2, transition: "width 0.3s ease",
            }} />
          </div>
          <div style={{ fontSize: 11, color: dark ? "#6B7280" : "#9CA3AF", marginTop: 6 }}>
            {COMPLETENESS_HINTS[hintIndex]}
          </div>
        </div>

        {/* Paste Your Brief card */}
        <SectionCard dark={dark} title="PASTE YOUR BRIEF">
          <div>
            <textarea
              rows={6}
              value={rawBrief}
              onChange={(e) => { setRawBrief(e.target.value); setParseStatus("idle") }}
              placeholder="Paste your formulation brief here — e.g. 'A lightweight brightening serum for dry and sensitive skin, EU and India markets, Sephora Clean compliant, no silicones, natural preservation, pH 4.5–5.5, premium positioning targeting The Ordinary and Allies of Skin...'"
              style={{
                width: "100%",
                border: `1px solid ${parseStatus === "success" ? "#2D6A4F" : parseStatus === "error" ? "#991B1B" : dark ? "#1B3A5C" : "#E5E7EB"}`,
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
            {parseStatus === "success" && (
              <div style={{ fontSize: 12, color: "#2D6A4F", marginTop: 6 }}>
                Brief parsed — review and adjust below
              </div>
            )}
            {parseStatus === "error" && (
              <div style={{ fontSize: 12, color: "#991B1B", marginTop: 6 }}>
                Could not parse brief — fill the form below
              </div>
            )}
          </div>
          <button
            onClick={parseBrief}
            disabled={isParsing || !rawBrief.trim()}
            style={{
              backgroundColor: isParsing || !rawBrief.trim() ? "#E5E7EB" : "#D4A843",
              color: isParsing || !rawBrief.trim() ? "#9CA3AF" : "#0D1B2A",
              fontWeight: 600,
              fontSize: 13,
              height: 38,
              borderRadius: 8,
              border: "none",
              cursor: isParsing || !rawBrief.trim() ? "not-allowed" : "pointer",
              paddingLeft: 20,
              paddingRight: 20,
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            {isParsing && (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation: "spin 0.8s linear infinite" }}>
                <path d="M21 12a9 9 0 1 1-6.219-8.56" />
              </svg>
            )}
            {isParsing ? "Parsing…" : "Parse Brief →"}
          </button>
          <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
        </SectionCard>

        {/* Layer 1 — Product Definition */}
        <SectionCard dark={dark} title="PRODUCT DEFINITION">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
            <SelectField label="Product Type" value={brief.productType} options={PRODUCT_TYPES} dark={dark} onChange={(v) => set("productType", v)} />
            <SelectField label="Format" value={brief.format} options={FORMATS} dark={dark} onChange={(v) => set("format", v)} />
            <SelectField label="Texture" value={brief.texture} options={TEXTURES} dark={dark} onChange={(v) => set("texture", v)} />
          </div>
          <PillGroup label="Primary Functions" options={FUNCTIONS} selected={brief.primaryFunctions} dark={dark} onToggle={(v) => toggle("primaryFunctions", v)} />
          <PillGroup label="Target Skin Types" options={SKIN_TYPES} selected={brief.targetSkinTypes} dark={dark} onToggle={(v) => toggle("targetSkinTypes", v)} />
        </SectionCard>

        {/* Layer 2 — Markets & Regulatory */}
        <SectionCard dark={dark} title="MARKETS &amp; REGULATORY">
          <MarketPills selected={brief.targetMarkets} dark={dark} onToggle={(v) => toggle("targetMarkets", v)} />
          <PillGroup label="Claims" options={CLAIMS} selected={brief.claims} dark={dark} onToggle={(v) => toggle("claims", v)} />
          <PillGroup label="Target Retailers" options={RETAILERS} selected={brief.targetRetailers} dark={dark} onToggle={(v) => toggle("targetRetailers", v)} />
          <SelectField label="Regulatory Priority" value={brief.regulatoryPriority} options={REGULATORY_PRIORITY_OPTIONS} dark={dark} onChange={(v) => set("regulatoryPriority", v)} />
        </SectionCard>

        {/* Layer 3 — Ingredient Preferences */}
        <SectionCard dark={dark} title="INGREDIENT PREFERENCES">
          <TagInput label="Must Include" tags={brief.mustInclude} dark={dark} placeholder="Type an ingredient and press Enter…" onAdd={(v) => addTag("mustInclude", v)} onRemove={(v) => removeTag("mustInclude", v)} />
          <TagInput label="Must Exclude" tags={brief.mustExclude} dark={dark} placeholder="e.g. SLS, Parabens, Silicones…" onAdd={(v) => addTag("mustExclude", v)} onRemove={(v) => removeTag("mustExclude", v)} />
          <ToggleSwitch label="Prefer Natural Origin" checked={brief.preferNatural} dark={dark} onChange={(v) => set("preferNatural", v)} />
          <SelectField label="Fragrance Approach" value={brief.fragranceApproach} options={FRAGRANCE_OPTIONS} dark={dark} onChange={(v) => set("fragranceApproach", v)} />
          <SelectField label="Colorant Approach" value={brief.colorantApproach} options={COLORANT_OPTIONS} dark={dark} onChange={(v) => set("colorantApproach", v)} />
        </SectionCard>

        {/* Layer 4 — Technical Constraints */}
        <SectionCard dark={dark} title="TECHNICAL CONSTRAINTS">
          <SelectField label="Budget Tier" value={brief.budgetTier} options={BUDGET_TIERS} dark={dark} onChange={(v) => set("budgetTier", v)} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <SelectField label="Viscosity Target" value={brief.viscosityTarget} options={VISCOSITY_OPTIONS} dark={dark} onChange={(v) => set("viscosityTarget", v)} />
            <SelectField label="Preservation Strategy" value={brief.preservationStrategy} options={PRESERVATION_OPTIONS} dark={dark} onChange={(v) => set("preservationStrategy", v)} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <NumberInput label="pH Min" value={brief.phRange?.min ?? ""} min={2} max={10} step={0.1} dark={dark} placeholder="e.g. 4.5" onChange={(v) => set("phRange", v !== null ? { min: v, max: brief.phRange?.max ?? v } : null)} />
            <NumberInput label="pH Max" value={brief.phRange?.max ?? ""} min={2} max={10} step={0.1} dark={dark} placeholder="e.g. 6.5" onChange={(v) => set("phRange", v !== null ? { min: brief.phRange?.min ?? v, max: v } : null)} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <SelectField label="Packaging Type" value={brief.packagingType} options={PACKAGING_OPTIONS} dark={dark} onChange={(v) => set("packagingType", v)} />
            <div>
              <FieldLabel>Shelf Life (months)</FieldLabel>
              <select value={brief.shelfLifeMonths ?? ""} onChange={(e) => set("shelfLifeMonths", e.target.value ? parseInt(e.target.value) : null)} style={{
                width: "100%", height: 36, borderRadius: 6, border: `1px solid ${dark ? "#1B3A5C" : "#E5E7EB"}`,
                backgroundColor: dark ? "#0D1B2A" : "#FFFFFF", color: brief.shelfLifeMonths ? (dark ? "#F9FAFB" : "#0D1B2A") : "#9CA3AF",
                fontSize: 13, padding: "0 10px", cursor: "pointer", appearance: "none",
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236B7280' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
                backgroundRepeat: "no-repeat", backgroundPosition: "right 10px center", paddingRight: 28,
              }}>
                <option value="">Select…</option>
                {SHELF_LIFE_OPTIONS.map((m) => <option key={m} value={m}>{m} months</option>)}
              </select>
            </div>
          </div>
          <SelectField label="Batch Size" value={brief.batchSize} options={BATCH_SIZE_OPTIONS} dark={dark} onChange={(v) => set("batchSize", v)} />
          <div>
            <FieldLabel>Additional Constraints or Notes</FieldLabel>
            <textarea rows={3} value={brief.freeTextConstraints} onChange={(e) => set("freeTextConstraints", e.target.value)}
              placeholder="e.g. sulphate free, no silicones, must work at pH 4.5, vegan, no animal testing…"
              style={{
                width: "100%", border: `1px solid ${dark ? "#1B3A5C" : "#E5E7EB"}`, borderRadius: 6,
                backgroundColor: dark ? "#0D1B2A" : "#FFFFFF", color: dark ? "#F9FAFB" : "#0D1B2A",
                fontSize: 13, padding: "10px 12px", resize: "vertical", outline: "none",
                fontFamily: "inherit", lineHeight: 1.5, boxSizing: "border-box",
              }}
            />
          </div>
        </SectionCard>

        {/* Conditional selection cards */}
        <PreservativeCard dark={dark} brief={brief}
          selectedPreservative={selectedPreservative} setSelectedPreservative={setSelectedPreservative}
          selectedBoosters={selectedBoosters} toggleBooster={(v) => setSelectedBoosters((prev) => prev.includes(v) ? prev.filter((b) => b !== v) : [...prev, v])}
        />
        <SurfactantCard dark={dark} brief={brief}
          selectedSurf={selectedSurf} setSelectedSurf={setSelectedSurf}
          selectedCoSurf={selectedCoSurf} toggleCoSurf={(v) => setSelectedCoSurf((prev) => prev.includes(v) ? prev.filter((b) => b !== v) : [...prev, v])}
        />
        <SiliconeAltsCard dark={dark} brief={brief}
          selectedAlts={selectedAlts} toggleAlt={(v) => setSelectedAlts((prev) => prev.includes(v) ? prev.filter((b) => b !== v) : [...prev, v])}
        />

        {/* Layer 5 — Competitive Context */}
        <SectionCard dark={dark} title="COMPETITIVE CONTEXT">
          <TagInput label="Reference Products" tags={brief.referenceProducts} dark={dark} placeholder="e.g. The Ordinary Buffet, Tatcha Dewy Skin…" onAdd={(v) => addTag("referenceProducts", v)} onRemove={(v) => removeTag("referenceProducts", v)} />
          <SelectField label="Price Positioning" value={brief.pricePositioning} options={PRICE_POSITIONING_OPTIONS} dark={dark} onChange={(v) => set("pricePositioning", v)} />
          <PillGroup label="Key Differentiators" options={DIFFERENTIATOR_OPTIONS} selected={brief.differentiators} dark={dark} onToggle={(v) => toggle("differentiators", v)} />
          <SelectField label="Target Launch" value={brief.targetLaunchDate} options={LAUNCH_DATE_OPTIONS} dark={dark} onChange={(v) => set("targetLaunchDate", v)} />
        </SectionCard>

        {/* Generate button */}
        <button
          onClick={() => router.push("/formula-output")}
          style={{
            backgroundColor: "#D4A843", color: "#0D1B2A", fontWeight: 600, fontSize: 14,
            height: 44, borderRadius: 8, width: "100%", border: "none", cursor: "pointer",
          }}
        >
          Generate Formulation →
        </button>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Right panel — Live Intelligence                                     */}
      {/* ------------------------------------------------------------------ */}
      <div style={{ flex: "0 0 calc(40% - 24px)", minWidth: 0, position: "sticky", top: 80 }}>
        <div style={{
          backgroundColor: dark ? "#0D1B2A" : "#FFFFFF",
          border: `1px solid ${dark ? "#1B3A5C" : "#E5E7EB"}`,
          borderRadius: 10, padding: 20,
        }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: dark ? "#F9FAFB" : "#0D1B2A", letterSpacing: "0.02em" }}>LIVE INTELLIGENCE</div>
              <div style={{ fontSize: 11, color: dark ? "#6B7280" : "#9CA3AF", marginTop: 2 }}>Updates as you fill the brief</div>
            </div>
            {isLoadingIntelligence && (
              <div style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: "#D4A843" }} className="animate-pulse" />
            )}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {isLoadingIntelligence
              ? [0, 1, 2].map((i) => <SkeletonCard key={i} dark={dark} />)
              : intelligenceCards.map((card, i) => <IntelCard key={i} card={card} dark={dark} />)
            }
          </div>
          <div style={{
            marginTop: 16, paddingTop: 12,
            borderTop: `1px solid ${dark ? "#1B3A5C" : "#F3F4F6"}`,
            fontSize: 11, color: dark ? "#6B7280" : "#9CA3AF", lineHeight: 1.5,
          }}>
            Powered by theformulator.ai intelligence engine · 550,000+ product corpus
          </div>
        </div>
      </div>
    </div>
  )
}
