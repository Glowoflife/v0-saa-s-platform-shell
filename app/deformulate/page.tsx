"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Search, Camera, X, FileImage } from "lucide-react"
import { useTheme } from "@/components/theme-context"
import { apiFetch } from "@/lib/api-client"

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface SearchProduct {
  id: string
  product_name: string
  brand: string
  category: string
  country: string
  ingredients: string[]
  ingredient_list: string
  claims: string
}

const MARKET_FLAGS: Record<string, string> = {
  US: "🇺🇸", CA: "🇨🇦", GB: "🇬🇧", UK: "🇬🇧", EU: "🇪🇺", FR: "🇫🇷",
  IN: "🇮🇳", KR: "🇰🇷", JP: "🇯🇵", CN: "🇨🇳", AU: "🇦🇺",
  BR: "🇧🇷", TH: "🇹🇭", MY: "🇲🇾", SG: "🇸🇬", TW: "🇹🇼", SA: "🇸🇦",
}

const TARGET_MARKETS = ["EU", "US", "UK", "JP", "KR", "CN", "IN", "AU", "ASEAN", "BR", "CA", "TH", "MY", "SG", "TW", "SA"]

const PRODUCT_TYPE_OPTIONS = [
  "Auto-detect", "Cleanser", "Toner", "Serum", "Moisturizer",
  "Sunscreen", "Mask", "Shampoo", "Conditioner", "Body Wash",
  "Body Lotion", "Eye Cream", "Lip Product", "Other",
]

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      fontSize: 11, fontWeight: 500, color: "#6B7280",
      letterSpacing: "0.04em", textTransform: "uppercase", marginBottom: 6,
    }}>
      {children}
    </div>
  )
}

function SectionCard({ dark, title, children }: { dark: boolean; title: string; children: React.ReactNode }) {
  return (
    <div style={{
      backgroundColor: dark ? "#0D1B2A" : "#FFFFFF",
      border: `1px solid ${dark ? "#1B3A5C" : "#E5E7EB"}`,
      borderRadius: 10, padding: 20, marginBottom: 16,
    }}>
      <div style={{ fontSize: 12, fontWeight: 600, color: dark ? "#F9FAFB" : "#0D1B2A", marginBottom: 16, letterSpacing: "0.02em" }}>
        {title}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {children}
      </div>
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
          outline: "none",
        }}
      >
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  )
}

function MarketPills({ selected, dark, onToggle }: { selected: string[]; dark: boolean; onToggle: (code: string) => void }) {
  return (
    <div>
      <FieldLabel>Target Markets <span style={{ color: "#D4A843" }}>*</span></FieldLabel>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
        {TARGET_MARKETS.map((code) => {
          const active = selected.includes(code)
          return (
            <button key={code} onClick={() => onToggle(code)} style={{
              fontSize: 12, fontWeight: 500, padding: "5px 10px", borderRadius: 20,
              border: `1px solid ${active ? "#D4A843" : dark ? "#1B3A5C" : "#E5E7EB"}`,
              backgroundColor: active ? "#D4A843" : dark ? "#0D1B2A" : "#FFFFFF",
              color: active ? "#0D1B2A" : dark ? "#9CA3AF" : "#6B7280", cursor: "pointer",
            }}>
              {MARKET_FLAGS[code] || ""} {code}
            </button>
          )
        })}
      </div>
    </div>
  )
}

function TagInput({
  label, tags, dark, placeholder, onAdd, onRemove, optional,
}: {
  label: string; tags: string[]; dark: boolean; placeholder: string;
  onAdd: (v: string) => void; onRemove: (v: string) => void; optional?: boolean
}) {
  const [input, setInput] = useState("")
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if ((e.key === "Enter" || e.key === ",") && input.trim()) {
      e.preventDefault(); onAdd(input.trim()); setInput("")
    }
  }
  return (
    <div>
      <FieldLabel>
        {label} {optional && <span style={{ color: "#9CA3AF", fontWeight: 400, textTransform: "none", fontSize: 11 }}>(optional)</span>}
      </FieldLabel>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: tags.length ? 6 : 0 }}>
        {tags.map((t) => (
          <span key={t} style={{
            fontSize: 11, fontWeight: 500, padding: "3px 8px", borderRadius: 4,
            backgroundColor: dark ? "#1B3A5C" : "#EFF6FF",
            color: dark ? "#93C5FD" : "#1E40AF",
            display: "flex", alignItems: "center", gap: 4,
          }}>
            {t}
            <button onClick={() => onRemove(t)} style={{
              background: "none", border: "none", cursor: "pointer",
              color: "inherit", padding: 0, fontSize: 12, lineHeight: 1,
            }}>×</button>
          </span>
        ))}
      </div>
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        style={{
          width: "100%", height: 34,
          border: `1px solid ${dark ? "#1B3A5C" : "#E5E7EB"}`,
          borderRadius: 6, backgroundColor: dark ? "#0D1B2A" : "#FFFFFF",
          color: dark ? "#F9FAFB" : "#0D1B2A", fontSize: 12,
          padding: "0 10px", outline: "none", boxSizing: "border-box",
        }}
      />
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------

interface UploadedFile {
  name: string
  url: string
  id: string
}

export default function DeformulatePage() {
  const { dark } = useTheme()
  const router = useRouter()

  // Zone 1 — search
  const [searchQuery, setSearchQuery] = useState("")
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<SearchProduct | null>(null)
  const [notFoundMsg, setNotFoundMsg] = useState("")
  const [searchResults, setSearchResults] = useState<SearchProduct[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)

  // Zone 2 — INCI input
  const [activeTab, setActiveTab] = useState<"paste" | "upload">("paste")
  const [inciText, setInciText] = useState("")
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Zone 3 — metadata
  const [targetMarkets, setTargetMarkets] = useState<string[]>([])
  const [knownConcentrations, setKnownConcentrations] = useState<string[]>([])
  const [reportLevel, setReportLevel] = useState<"quick" | "brief" | "dossier">("brief")
  const [productTypeOverride, setProductTypeOverride] = useState("Auto-detect")

  // Action
  const [isDetecting, setIsDetecting] = useState(false)

  // Debounced search effect
  useEffect(() => {
    const query = searchQuery.trim()
    if (query.length < 2) {
      setSearchResults([])
      setIsSearching(false)
      return
    }
    setIsSearching(true)
    const timer = setTimeout(async () => {
      try {
        const res = await apiFetch(`https://api.theformulator.ai/api/products/search?q=${encodeURIComponent(query)}&limit=8`)
        const data = await res.json()
        setSearchResults(data.products ?? [])
      } catch {
        setSearchResults([])
      } finally {
        setIsSearching(false)
      }
    }, 300)
    return () => clearTimeout(timer)
  }, [searchQuery])

  const parsedIngredients = inciText.trim()
    ? inciText.split(",").map((s) => s.trim()).filter(Boolean)
    : []

  const canGenerate = parsedIngredients.length >= 3 && targetMarkets.length >= 1

  // Handlers
  function handleSearchChange(val: string) {
    setSearchQuery(val)
    setDropdownOpen(true)
    setNotFoundMsg("")
    if (selectedProduct && val !== selectedProduct.product_name) {
      setSelectedProduct(null)
    }
  }

  function handleSearchBlur() {
    setTimeout(() => setDropdownOpen(false), 150)
  }

  function selectProduct(product: SearchProduct) {
    setSelectedProduct(product)
    setSearchQuery(product.product_name)
    setDropdownOpen(false)
    setNotFoundMsg("")
    setInciText(product.ingredient_list)
    setActiveTab("paste")
  }

  function handleSearchEnter() {
    if (searchResults.length === 0 && searchQuery.trim().length > 0) {
      setNotFoundMsg("Product not found in our database. Paste the INCI list or upload a label photo below.")
      setDropdownOpen(false)
    } else if (searchResults.length > 0) {
      selectProduct(searchResults[0])
    }
  }

  function toggleMarket(code: string) {
    setTargetMarkets((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]
    )
  }

  function addConcentration(v: string) {
    setKnownConcentrations((prev) => [...prev, v])
  }
  function removeConcentration(v: string) {
    setKnownConcentrations((prev) => prev.filter((c) => c !== v))
  }

  function handleFiles(files: FileList | null) {
    if (!files) return
    const accepted = Array.from(files)
      .filter((f) => /\.(jpe?g|png|heic)$/i.test(f.name))
      .slice(0, 3 - uploadedFiles.length)
    const newFiles: UploadedFile[] = accepted.map((f) => ({
      name: f.name,
      url: URL.createObjectURL(f),
      id: Math.random().toString(36).slice(2),
    }))
    setUploadedFiles((prev) => [...prev, ...newFiles].slice(0, 3))
  }

  function removeFile(id: string) {
    setUploadedFiles((prev) => prev.filter((f) => f.id !== id))
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    handleFiles(e.dataTransfer.files)
  }, [uploadedFiles])

  async function handleGenerate() {
    if (!canGenerate || isDetecting) return
    setIsDetecting(true)

    try {
      const concObj: Record<string, number> = {}
      knownConcentrations.forEach(c => {
        const match = c.match(/^(.+?):\s*([\d.]+)%?$/)
        if (match) concObj[match[1].trim()] = parseFloat(match[2])
      })

      const response = await apiFetch('https://api.theformulator.ai/api/deformulate', {
        method: 'POST',
        body: JSON.stringify({
          inci_input: inciText,
          product_id: selectedProduct?.id || null,
          product_name: selectedProduct?.product_name || null,
          brand: selectedProduct?.brand || null,
          target_markets: targetMarkets,
          report_level: reportLevel,
          known_concentrations: Object.keys(concObj).length > 0 ? concObj : null,
          product_type_override: productTypeOverride !== "Auto-detect" ? productTypeOverride.toLowerCase() : null,
        })
      })

      if (!response.ok) {
        const err = await response.json()
        alert(err.detail || 'Deformulation failed')
        setIsDetecting(false)
        return
      }

      const data = await response.json()
      router.push(`/formulations/${data.formulation_id}`)
    } catch {
      alert('Network error — please try again')
      setIsDetecting(false)
    }
  }

  // Styles
  const inputStyle = {
    height: 36, borderRadius: 6,
    border: `1px solid ${dark ? "#1B3A5C" : "#E5E7EB"}`,
    backgroundColor: dark ? "#0D1B2A" : "#FFFFFF",
    color: dark ? "#F9FAFB" : "#0D1B2A",
    fontSize: 13, padding: "0 10px", outline: "none",
    boxSizing: "border-box" as const,
  }

  const reportCards = [
    {
      key: "quick" as const,
      label: "Quick",
      desc: "2 variants, essential analysis",
      credits: 1,
    },
    {
      key: "brief" as const,
      label: "Brief",
      desc: "3 variants, full analysis",
      credits: 3,
    },
    {
      key: "dossier" as const,
      label: "Dossier",
      desc: "3 variants, comprehensive analysis with testing protocol",
      credits: 5,
    },
  ]

  return (
    <div style={{ maxWidth: 900, margin: "0 auto" }}>

      {/* ------------------------------------------------------------------ */}
      {/* Page header                                                         */}
      {/* ------------------------------------------------------------------ */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 20, fontWeight: 500, color: dark ? "#F9FAFB" : "#0D1B2A" }}>
          Deformulate
        </div>
        <div style={{ fontSize: 13, color: "#6B7280", marginTop: 4 }}>
          Reverse-engineer any product&apos;s INCI declaration into a probable bench-ready formula
        </div>
      </div>

      {/* ================================================================== */}
      {/* ZONE 1 — Product Search                                             */}
      {/* ================================================================== */}
      <div style={{
        backgroundColor: dark ? "#0D1B2A" : "#FFFFFF",
        border: `1px solid ${dark ? "#1B3A5C" : "#E5E7EB"}`,
        borderRadius: 10, padding: 20, marginBottom: 16,
      }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: dark ? "#F9FAFB" : "#0D1B2A", marginBottom: 16, letterSpacing: "0.02em" }}>
          PRODUCT LOOKUP
        </div>

        {/* Search bar */}
        <div ref={searchRef} style={{ position: "relative" }}>
          <div style={{ position: "relative" }}>
            <Search
              size={16}
              style={{
                position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)",
                color: "#6B7280", pointerEvents: "none",
              }}
            />
            <input
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              onFocus={() => searchQuery.trim().length >= 2 && setDropdownOpen(true)}
              onBlur={handleSearchBlur}
              onKeyDown={(e) => e.key === "Enter" && handleSearchEnter()}
              placeholder="Search by product name or brand..."
              style={{
                ...inputStyle,
                width: "100%",
                height: 44,
                paddingLeft: 40,
                fontSize: 14,
                borderRadius: 8,
              }}
            />
            {searchQuery && (
              <button
                onClick={() => { setSearchQuery(""); setSelectedProduct(null); setNotFoundMsg(""); setInciText("") }}
                style={{
                  position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
                  background: "none", border: "none", cursor: "pointer", color: "#6B7280", padding: 0,
                  display: "flex", alignItems: "center",
                }}
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Dropdown */}
          {dropdownOpen && (isSearching || searchResults.length > 0) && searchQuery.length >= 2 && (
            <div style={{
              position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0, zIndex: 50,
              backgroundColor: dark ? "#0D1B2A" : "#FFFFFF",
              border: `1px solid ${dark ? "#1B3A5C" : "#E5E7EB"}`,
              borderRadius: 8, overflow: "hidden",
              boxShadow: "0 8px 24px rgba(0,0,0,0.3)",
            }}>
              {isSearching ? (
                <div style={{ padding: "12px 14px", fontSize: 12, color: "#9CA3AF" }}>
                  Searching 561K products...
                </div>
              ) : (
                searchResults.map((p) => (
                  <button
                    key={p.id}
                    onMouseDown={() => selectProduct(p)}
                    style={{
                      width: "100%", display: "flex", alignItems: "center", gap: 12,
                      padding: "10px 14px", border: "none", textAlign: "left",
                      backgroundColor: "transparent", cursor: "pointer",
                      borderBottom: `1px solid ${dark ? "#1B3A5C" : "#F3F4F6"}`,
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.backgroundColor = dark ? "#1B3A5C" : "#F9FAFB"
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.backgroundColor = "transparent"
                    }}
                  >
                    {/* Flag */}
                    <span style={{ fontSize: 18, flexShrink: 0 }}>{MARKET_FLAGS[p.country] || "🌐"}</span>

                    {/* Name + brand */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: dark ? "#F9FAFB" : "#0D1B2A", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {p.product_name}
                      </div>
                      <div style={{ fontSize: 11, color: "#9CA3AF", marginTop: 1 }}>{p.brand}</div>
                    </div>

                    {/* Category pill */}
                    <span style={{
                      fontSize: 11, fontWeight: 500, padding: "2px 8px", borderRadius: 20, flexShrink: 0,
                      backgroundColor: dark ? "#1B3A5C" : "#EFF6FF",
                      color: dark ? "#93C5FD" : "#1E40AF",
                      border: `1px solid ${dark ? "#2A4A6C" : "#BFDBFE"}`,
                    }}>
                      {p.category}
                    </span>

                    {/* Ingredient count */}
                    <span style={{ fontSize: 11, color: "#9CA3AF", flexShrink: 0, marginLeft: 4 }}>
                      {p.ingredients.length} inci
                    </span>
                  </button>
                ))
              )}
            </div>
          )}
        </div>

        {/* Selected product info strip */}
        {selectedProduct && (
          <div style={{
            marginTop: 10,
            padding: "8px 12px",
            borderRadius: 6,
            backgroundColor: dark ? "#071524" : "#EFF6FF",
            border: `1px solid ${dark ? "#1E3A8A" : "#BFDBFE"}`,
            borderLeft: "3px solid #1E40AF",
            display: "flex", alignItems: "center", gap: 8,
          }}>
            <span style={{ fontSize: 14 }}>{MARKET_FLAGS[selectedProduct.country] || "🌐"}</span>
            <span style={{ fontSize: 12, color: dark ? "#93C5FD" : "#1E40AF", fontWeight: 500 }}>
              {selectedProduct.product_name}
            </span>
            <span style={{ fontSize: 11, color: "#9CA3AF", marginLeft: "auto" }}>
              {selectedProduct.brand} · {selectedProduct.category} · {selectedProduct.country}
            </span>
          </div>
        )}

        {/* Not-found / no-inci message */}
        {notFoundMsg && (
          <div style={{
            marginTop: 10, padding: "8px 12px", borderRadius: 6,
            backgroundColor: dark ? "#1C1207" : "#FFFBEB",
            border: `1px solid ${dark ? "#78350F" : "#FDE68A"}`,
            borderLeft: "3px solid #B45309",
            fontSize: 12, color: dark ? "#FCD34D" : "#92400E", lineHeight: 1.5,
          }}>
            {notFoundMsg}
          </div>
        )}
      </div>

      {/* ================================================================== */}
      {/* ZONE 2 — INCI Input                                                 */}
      {/* ================================================================== */}
      <div style={{
        backgroundColor: dark ? "#0D1B2A" : "#FFFFFF",
        border: `1px solid ${dark ? "#1B3A5C" : "#E5E7EB"}`,
        borderRadius: 10, padding: 20, marginBottom: 16,
      }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: dark ? "#F9FAFB" : "#0D1B2A", marginBottom: 16, letterSpacing: "0.02em" }}>
          INCI INPUT
        </div>

        {/* Tab row */}
        <div style={{
          display: "flex", gap: 0, marginBottom: 16,
          borderBottom: `1px solid ${dark ? "#1B3A5C" : "#E5E7EB"}`,
        }}>
          {(["paste", "upload"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: "8px 16px", border: "none", cursor: "pointer",
                fontSize: 13, fontWeight: activeTab === tab ? 600 : 400,
                backgroundColor: "transparent",
                color: activeTab === tab ? "#D4A843" : "#9CA3AF",
                borderBottom: `2px solid ${activeTab === tab ? "#D4A843" : "transparent"}`,
                marginBottom: -1,
                transition: "color 0.15s ease",
              }}
            >
              {tab === "paste" ? "Paste INCI List" : "Upload Label Photo"}
            </button>
          ))}
        </div>

        {/* ---- TAB: Paste ---- */}
        {activeTab === "paste" && (
          <div>
            <textarea
              value={inciText}
              onChange={(e) => setInciText(e.target.value)}
              placeholder="Paste the full INCI / ingredient list here..."
              rows={6}
              style={{
                width: "100%", borderRadius: 6,
                border: `1px solid ${dark ? "#1B3A5C" : "#E5E7EB"}`,
                backgroundColor: dark ? "#071524" : "#F9FAFB",
                color: dark ? "#F9FAFB" : "#0D1B2A",
                fontSize: 13, padding: "10px 12px", outline: "none",
                boxSizing: "border-box", resize: "vertical",
                lineHeight: 1.6, fontFamily: "inherit",
              }}
            />

            {/* Live parser preview */}
            {inciText.trim().length > 0 && (
              <div style={{
                marginTop: 12,
                backgroundColor: dark ? "#071524" : "#F9FAFB",
                border: `1px solid ${dark ? "#1B3A5C" : "#E5E7EB"}`,
                borderRadius: 8,
              }}>
                {/* Header */}
                <div style={{
                  display: "flex", alignItems: "center", gap: 8,
                  padding: "10px 14px",
                  borderBottom: `1px solid ${dark ? "#1B3A5C" : "#E5E7EB"}`,
                }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: dark ? "#F9FAFB" : "#0D1B2A", letterSpacing: "0.02em" }}>
                    Parsed Ingredients
                  </span>
                  <span style={{
                    fontSize: 11, fontWeight: 600, padding: "1px 7px", borderRadius: 20,
                    backgroundColor: parsedIngredients.length > 0 ? "#D4A843" : (dark ? "#1B3A5C" : "#E5E7EB"),
                    color: parsedIngredients.length > 0 ? "#0D1B2A" : "#9CA3AF",
                  }}>
                    {parsedIngredients.length}
                  </span>
                </div>

                {/* Warnings */}
                {parsedIngredients.length < 3 && parsedIngredients.length > 0 && (
                  <div style={{
                    margin: "8px 14px", padding: "6px 10px", borderRadius: 6,
                    backgroundColor: dark ? "#1C1207" : "#FFFBEB",
                    border: `1px solid ${dark ? "#78350F" : "#FDE68A"}`,
                    fontSize: 11, color: dark ? "#FCD34D" : "#92400E",
                  }}>
                    Minimum 3 ingredients required
                  </div>
                )}
                {parsedIngredients.length > 60 && (
                  <div style={{
                    margin: "8px 14px", padding: "6px 10px", borderRadius: 6,
                    backgroundColor: dark ? "#1C1207" : "#FFFBEB",
                    border: `1px solid ${dark ? "#78350F" : "#FDE68A"}`,
                    fontSize: 11, color: dark ? "#FCD34D" : "#92400E",
                  }}>
                    Long INCI list (60+) — may include fragrance/colorant decomposition
                  </div>
                )}

                {/* Ingredient list */}
                <div style={{ padding: "8px 14px 12px", maxHeight: 220, overflowY: "auto" }}>
                  {parsedIngredients.map((ing, i) => (
                    <div key={i} style={{
                      display: "flex", alignItems: "center", gap: 10,
                      padding: "4px 0",
                      borderBottom: i < parsedIngredients.length - 1
                        ? `1px solid ${dark ? "rgba(27,58,92,0.5)" : "#F3F4F6"}`
                        : "none",
                    }}>
                      <span style={{
                        fontSize: 10, fontWeight: 600, color: "#9CA3AF",
                        width: 22, textAlign: "right", flexShrink: 0,
                      }}>
                        {i + 1}
                      </span>
                      <span style={{ fontSize: 12, color: dark ? "#E5E7EB" : "#374151" }}>
                        {ing}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ---- TAB: Upload ---- */}
        {activeTab === "upload" && (
          <div>
            {/* Drop zone */}
            <div
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              style={{
                border: `2px dashed ${isDragging ? "#D4A843" : dark ? "#1B3A5C" : "#D1D5DB"}`,
                borderRadius: 8, padding: "36px 24px",
                display: "flex", flexDirection: "column", alignItems: "center", gap: 10,
                cursor: "pointer",
                backgroundColor: isDragging
                  ? dark ? "rgba(212,168,67,0.05)" : "rgba(212,168,67,0.04)"
                  : dark ? "#071524" : "#F9FAFB",
                transition: "border-color 0.15s ease, background-color 0.15s ease",
              }}
            >
              <Camera size={28} style={{ color: isDragging ? "#D4A843" : "#6B7280" }} />
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 13, fontWeight: 500, color: dark ? "#E5E7EB" : "#374151" }}>
                  Drop label photo here or click to upload
                </div>
                <div style={{ fontSize: 11, color: "#9CA3AF", marginTop: 4 }}>
                  JPG, PNG, HEIC · up to 3 images
                </div>
              </div>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".jpg,.jpeg,.png,.heic"
              multiple
              style={{ display: "none" }}
              onChange={(e) => handleFiles(e.target.files)}
            />

            {/* Thumbnails */}
            {uploadedFiles.length > 0 && (
              <div style={{ display: "flex", gap: 10, marginTop: 12, flexWrap: "wrap" }}>
                {uploadedFiles.map((f) => (
                  <div key={f.id} style={{
                    position: "relative", width: 80, height: 80, borderRadius: 6, overflow: "hidden",
                    border: `1px solid ${dark ? "#1B3A5C" : "#E5E7EB"}`,
                    flexShrink: 0,
                  }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={f.url} alt={f.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    <button
                      onClick={(e) => { e.stopPropagation(); removeFile(f.id) }}
                      style={{
                        position: "absolute", top: 3, right: 3,
                        width: 18, height: 18, borderRadius: "50%",
                        backgroundColor: "rgba(0,0,0,0.7)", border: "none",
                        cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                        color: "#FFFFFF", fontSize: 10, fontWeight: 700, lineHeight: 1,
                      }}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Disabled extract button */}
            <div style={{ marginTop: 14 }}>
              <button
                disabled
                style={{
                  width: "100%", height: 40, borderRadius: 8, border: "none",
                  fontWeight: 600, fontSize: 13,
                  backgroundColor: dark ? "#1B3A5C" : "#E5E7EB",
                  color: "#9CA3AF", cursor: "not-allowed",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                }}
              >
                <FileImage size={14} />
                Extract INCI — Vision extraction coming soon
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ================================================================== */}
      {/* ZONE 3 — Metadata & Controls                                        */}
      {/* ================================================================== */}
      <div style={{
        backgroundColor: dark ? "#0D1B2A" : "#FFFFFF",
        border: `1px solid ${dark ? "#1B3A5C" : "#E5E7EB"}`,
        borderRadius: 10, padding: 20, marginBottom: 24,
      }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: dark ? "#F9FAFB" : "#0D1B2A", marginBottom: 16, letterSpacing: "0.02em" }}>
          ANALYSIS PARAMETERS
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 28 }}>

          {/* ---- Left column ---- */}
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <MarketPills selected={targetMarkets} dark={dark} onToggle={toggleMarket} />
            <TagInput
              label="Known Concentrations"
              tags={knownConcentrations}
              dark={dark}
              placeholder="e.g. Niacinamide: 10%"
              onAdd={addConcentration}
              onRemove={removeConcentration}
              optional
            />
          </div>

          {/* ---- Right column ---- */}
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {/* Report Level — radio cards */}
            <div>
              <FieldLabel>Report Level <span style={{ color: "#D4A843" }}>*</span></FieldLabel>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {reportCards.map((card) => {
                  const active = reportLevel === card.key
                  return (
                    <button
                      key={card.key}
                      onClick={() => setReportLevel(card.key)}
                      style={{
                        width: "100%", textAlign: "left", padding: "11px 14px",
                        borderRadius: 8, cursor: "pointer",
                        border: `1px solid ${active ? "#D4A843" : dark ? "#1B3A5C" : "#E5E7EB"}`,
                        backgroundColor: active
                          ? dark ? "rgba(212,168,67,0.08)" : "rgba(212,168,67,0.06)"
                          : dark ? "#071524" : "#F9FAFB",
                        boxShadow: active ? `0 0 0 1px #D4A843` : "none",
                        transition: "border-color 0.15s ease, box-shadow 0.15s ease",
                        display: "flex", alignItems: "center", gap: 10,
                      }}
                    >
                      {/* Radio dot */}
                      <div style={{
                        width: 16, height: 16, borderRadius: "50%", flexShrink: 0,
                        border: `2px solid ${active ? "#D4A843" : dark ? "#1B3A5C" : "#D1D5DB"}`,
                        backgroundColor: active ? "#D4A843" : "transparent",
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}>
                        {active && <div style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: "#0D1B2A" }} />}
                      </div>

                      {/* Labels */}
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <span style={{ fontSize: 13, fontWeight: 600, color: active ? "#D4A843" : dark ? "#F9FAFB" : "#0D1B2A" }}>
                            {card.label}
                          </span>
                          {card.key === "brief" && (
                            <span style={{
                              fontSize: 10, fontWeight: 600, padding: "1px 6px", borderRadius: 4,
                              backgroundColor: "rgba(212,168,67,0.2)", color: "#D4A843",
                              letterSpacing: "0.04em",
                            }}>
                              DEFAULT
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize: 11, color: "#9CA3AF", marginTop: 2 }}>{card.desc}</div>
                      </div>

                      {/* Credit badge */}
                      <span style={{
                        fontSize: 11, fontWeight: 700, padding: "3px 8px", borderRadius: 20, flexShrink: 0,
                        backgroundColor: active ? "#D4A843" : dark ? "#1B3A5C" : "#F3F4F6",
                        color: active ? "#0D1B2A" : "#9CA3AF",
                      }}>
                        {card.credits} cr
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Product Type Override */}
            <SelectField
              label="Product Type Override"
              value={productTypeOverride}
              options={PRODUCT_TYPE_OPTIONS}
              dark={dark}
              onChange={setProductTypeOverride}
            />
          </div>
        </div>
      </div>

      {/* ================================================================== */}
      {/* Generate button                                                     */}
      {/* ================================================================== */}
      <div style={{ marginBottom: 40 }}>
        <button
          onClick={handleGenerate}
          disabled={!canGenerate || isDetecting}
          style={{
            width: "100%", height: 48, borderRadius: 8, border: "none",
            fontWeight: 600, fontSize: 14,
            cursor: !canGenerate || isDetecting ? "not-allowed" : "pointer",
            backgroundColor: !canGenerate || isDetecting ? (dark ? "#1B3A5C" : "#E5E7EB") : "#D4A843",
            color: !canGenerate || isDetecting ? "#9CA3AF" : "#0D1B2A",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            transition: "background-color 0.15s ease, color 0.15s ease",
          }}
        >
          {isDetecting ? (
            <>
              <svg
                width="16" height="16" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2"
                style={{ animation: "spin 0.8s linear infinite" }}
              >
                <path d="M21 12a9 9 0 1 1-6.219-8.56" />
              </svg>
              Detecting blends...
            </>
          ) : (
            "Detect Blends & Generate →"
          )}
        </button>

        {!canGenerate && !isDetecting && (
          <p style={{ textAlign: "center", fontSize: 12, color: "#9CA3AF", marginTop: 8 }}>
            {parsedIngredients.length < 3 && targetMarkets.length < 1
              ? "Paste at least 3 ingredients and select a target market to continue"
              : parsedIngredients.length < 3
              ? "Paste at least 3 ingredients to continue"
              : "Select at least one target market to continue"}
          </p>
        )}
      </div>

      {/* Spin keyframe (global, injected once) */}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
