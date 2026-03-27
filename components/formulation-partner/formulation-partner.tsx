"use client"

import { useState, useRef, useEffect } from "react"
import { Paperclip, Send } from "lucide-react"
import { useTheme } from "@/components/theme-context"

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type Role = "user" | "assistant"

interface Message {
  role: Role
  content: string
}

interface DiagnosisItem {
  title: string
  badge: string
  badgeBg: string
  badgeColor: string
  borderColor: string
  numberBg: string
  body: string
  fix: string
}

// ---------------------------------------------------------------------------
// Pre-populated seed messages
// ---------------------------------------------------------------------------

const SEED_MESSAGES: Message[] = [
  {
    role: "user",
    content:
      "My emulsion keeps breaking at 40°C during stability testing. Formula is a w/o moisturiser with 30% oil phase including 5% Shea Butter and 3% Caprylic/Capric Triglyceride. Using Polyglyceryl-3 Diisostearate at 3% as primary emulsifier.",
  },
  {
    role: "assistant",
    content: "__STRUCTURED__",
  },
]

const DEFAULT_DIAGNOSIS: DiagnosisItem[] = [
  {
    title: "Emulsifier Concentration",
    badge: "HIGH",
    badgeBg: "#FEE2E2",
    badgeColor: "#991B1B",
    borderColor: "#991B1B",
    numberBg: "#991B1B",
    body: "3% Polyglyceryl-3 Diisostearate insufficient for 30% oil phase at elevated temperature. Recommended: 4.5–6%.",
    fix: "→ Increase to 5% + Polyglyceryl-2 Sesquiisostearate 1% co-emulsifier",
  },
  {
    title: "Shea Butter Melt Point",
    badge: "MEDIUM",
    badgeBg: "#FEF3C7",
    badgeColor: "#92400E",
    borderColor: "#B45309",
    numberBg: "#B45309",
    body: "Solid Shea melts 32–38°C, destabilising oil phase structure at test temperature.",
    fix: "→ Substitute Hydrogenated Shea Butter (mp 55–60°C)",
  },
  {
    title: "Electrolyte Load",
    badge: "LOW",
    badgeBg: "#F3F4F6",
    badgeColor: "#6B7280",
    borderColor: "#6B7280",
    numberBg: "#6B7280",
    body: "Check water phase electrolytes — >0.5% can destabilise w/o interfacial film.",
    fix: "→ Reduce electrolyte concentration if applicable",
  },
]

// ---------------------------------------------------------------------------
// Helpers — attempt to parse HIGH/MEDIUM/LOW from AI prose
// ---------------------------------------------------------------------------

function parseDiagnosisFromText(text: string): DiagnosisItem[] | null {
  const highMatch = /HIGH[^\n]*\n([^\n]+)/i.exec(text)
  const medMatch = /MEDIUM[^\n]*\n([^\n]+)/i.exec(text)
  const lowMatch = /LOW[^\n]*\n([^\n]+)/i.exec(text)
  if (!highMatch && !medMatch && !lowMatch) return null

  const items: DiagnosisItem[] = []

  if (highMatch) {
    items.push({
      title: highMatch[1]?.trim().slice(0, 60) ?? "High priority issue",
      badge: "HIGH",
      badgeBg: "#FEE2E2",
      badgeColor: "#991B1B",
      borderColor: "#991B1B",
      numberBg: "#991B1B",
      body: text.slice(highMatch.index, highMatch.index + 200).replace(/HIGH[^\n]*/i, "").trim().slice(0, 160),
      fix: "",
    })
  }
  if (medMatch) {
    items.push({
      title: medMatch[1]?.trim().slice(0, 60) ?? "Medium priority issue",
      badge: "MEDIUM",
      badgeBg: "#FEF3C7",
      badgeColor: "#92400E",
      borderColor: "#B45309",
      numberBg: "#B45309",
      body: text.slice(medMatch.index, medMatch.index + 200).replace(/MEDIUM[^\n]*/i, "").trim().slice(0, 160),
      fix: "",
    })
  }
  if (lowMatch) {
    items.push({
      title: lowMatch[1]?.trim().slice(0, 60) ?? "Low priority issue",
      badge: "LOW",
      badgeBg: "#F3F4F6",
      badgeColor: "#6B7280",
      borderColor: "#6B7280",
      numberBg: "#6B7280",
      body: text.slice(lowMatch.index, lowMatch.index + 200).replace(/LOW[^\n]*/i, "").trim().slice(0, 160),
      fix: "",
    })
  }

  return items.length > 0 ? items : null
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function TypingIndicator({ dark }: { dark: boolean }) {
  return (
    <div style={{ display: "flex", justifyContent: "flex-start" }}>
      <div>
        <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.06em", color: "#9CA3AF", marginBottom: 4 }}>
          Formulation Partner
        </div>
        <div
          style={{
            backgroundColor: dark ? "#1B3A5C" : "#FFFFFF",
            border: `1px solid ${dark ? "#1B3A5C" : "#E5E7EB"}`,
            borderRadius: "12px 12px 12px 4px",
            padding: "12px 16px",
            display: "flex",
            gap: 5,
            alignItems: "center",
          }}
        >
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              style={{
                width: 7,
                height: 7,
                borderRadius: "50%",
                backgroundColor: "#9CA3AF",
                animation: `bounce 1.2s ${i * 0.2}s infinite`,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

function StructuredAIMessage({ dark }: { dark: boolean }) {
  const cardBg = dark ? "#111827" : "#F9FAFB"
  const textPrimary = dark ? "#F9FAFB" : "#0D1B2A"
  const textSecondary = dark ? "#9CA3AF" : "#6B7280"

  return (
    <div
      style={{
        backgroundColor: dark ? "#1B3A5C" : "#FFFFFF",
        border: `1px solid ${dark ? "#233d57" : "#E5E7EB"}`,
        borderRadius: "12px 12px 12px 4px",
        padding: 14,
        maxWidth: "88%",
        fontSize: 13,
        lineHeight: 1.6,
        color: textPrimary,
      }}
    >
      <p style={{ margin: 0, marginBottom: 8 }}>
        {"I've analysed this against 2,573 similar w/o systems in the knowledge base. Three likely causes, ranked by probability:"}
      </p>

      {/* Diagnosis 1 — HIGH */}
      <div style={{ backgroundColor: cardBg, borderRadius: 6, padding: "10px 12px", marginTop: 8, borderLeft: "3px solid #991B1B" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: textPrimary, flex: 1 }}>Emulsifier concentration insufficient</span>
          <span style={{ backgroundColor: "#FEE2E2", color: "#991B1B", fontSize: 10, fontWeight: 600, borderRadius: 4, padding: "2px 6px", flexShrink: 0 }}>HIGH</span>
        </div>
        <p style={{ fontSize: 12, color: textSecondary, margin: 0, marginBottom: 6 }}>
          Polyglyceryl-3 Diisostearate at 3% is below the recommended 4–6% for a 30% oil phase w/o system. The HLB demand of your oil phase exceeds the emulsifier capacity at elevated temperature.
        </p>
        <div style={{ backgroundColor: dark ? "#0D2A1A" : "#F0FDF4", borderRadius: 4, padding: "5px 8px", fontSize: 10, color: dark ? "#6EE7B7" : "#166534" }}>
          → Increase to 5% and re-test. Consider adding Polyglyceryl-2 Sesquiisostearate at 1% as co-emulsifier.
        </div>
      </div>

      {/* Diagnosis 2 — MEDIUM */}
      <div style={{ backgroundColor: cardBg, borderRadius: 6, padding: "10px 12px", marginTop: 8, borderLeft: "3px solid #B45309" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: textPrimary, flex: 1 }}>Shea Butter melting point interference</span>
          <span style={{ backgroundColor: "#FEF3C7", color: "#92400E", fontSize: 10, fontWeight: 600, borderRadius: 4, padding: "2px 6px", flexShrink: 0 }}>MEDIUM</span>
        </div>
        <p style={{ fontSize: 12, color: textSecondary, margin: 0, marginBottom: 6 }}>
          Shea Butter melts at 32–38°C. At 40°C the oil phase viscosity drops sharply, reducing the physical stability of the interfacial film.
        </p>
        <div style={{ backgroundColor: dark ? "#0D2A1A" : "#F0FDF4", borderRadius: 4, padding: "5px 8px", fontSize: 10, color: dark ? "#6EE7B7" : "#166534" }}>
          → Replace 2% Shea Butter with Hydrogenated Shea Butter (mp 55–60°C) to maintain oil phase structure at test temperature.
        </div>
      </div>

      {/* Diagnosis 3 — LOW */}
      <div style={{ backgroundColor: cardBg, borderRadius: 6, padding: "10px 12px", marginTop: 8, borderLeft: "3px solid #6B7280" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: textPrimary, flex: 1 }}>Electrolyte interference from water phase</span>
          <span style={{ backgroundColor: "#F3F4F6", color: "#6B7280", fontSize: 10, fontWeight: 600, borderRadius: 4, padding: "2px 6px", flexShrink: 0 }}>LOW</span>
        </div>
        <p style={{ fontSize: 12, color: textSecondary, margin: 0, marginBottom: 6 }}>
          If water phase contains electrolytes (NaCl, preservative salts), these can destabilise the interfacial film in w/o systems.
        </p>
        <div style={{ backgroundColor: dark ? "#0D2A1A" : "#F0FDF4", borderRadius: 4, padding: "5px 8px", fontSize: 10, color: dark ? "#6EE7B7" : "#166534" }}>
          → Check water phase electrolyte load. Reduce if {">"}0.5%.
        </div>
      </div>

      <p style={{ margin: 0, marginTop: 10, fontSize: 12, color: textSecondary }}>
        Cross-reference: 94% of stable w/o systems in this oil load range use emulsifier concentrations of 4.5–6%. Your current 3% is at the 8th percentile.
      </p>
    </div>
  )
}

function ProseAIMessage({ content, dark }: { content: string; dark: boolean }) {
  const textPrimary = dark ? "#F9FAFB" : "#0D1B2A"
  return (
    <div
      style={{
        backgroundColor: dark ? "#1B3A5C" : "#FFFFFF",
        border: `1px solid ${dark ? "#233d57" : "#E5E7EB"}`,
        borderRadius: "12px 12px 12px 4px",
        padding: 14,
        maxWidth: "88%",
        fontSize: 13,
        lineHeight: 1.6,
        color: textPrimary,
        whiteSpace: "pre-wrap",
      }}
    >
      {content}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Diagnosis panel card
// ---------------------------------------------------------------------------

function DiagnosisCard({ item, index, dark }: { item: DiagnosisItem; index: number; dark: boolean }) {
  const textPrimary = dark ? "#F9FAFB" : "#0D1B2A"
  const textSecondary = dark ? "#9CA3AF" : "#6B7280"
  const cardBg = dark ? "#0D1B2A" : "#FFFFFF"
  const cardBorder = dark ? "#1B3A5C" : "#E5E7EB"

  return (
    <div
      style={{
        backgroundColor: cardBg,
        border: `1px solid ${cardBorder}`,
        borderRadius: 8,
        padding: "12px 14px",
        marginBottom: 8,
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
        <div
          style={{
            width: 20,
            height: 20,
            borderRadius: "50%",
            backgroundColor: item.numberBg,
            color: "#FFFFFF",
            fontSize: 11,
            fontWeight: 700,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            marginTop: 1,
          }}
        >
          {index + 1}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: textPrimary, flex: 1 }}>{item.title}</span>
            <span style={{ backgroundColor: item.badgeBg, color: item.badgeColor, fontSize: 10, fontWeight: 600, borderRadius: 4, padding: "2px 5px", flexShrink: 0 }}>
              {item.badge}
            </span>
          </div>
          <p style={{ fontSize: 12, color: textSecondary, margin: 0, marginBottom: 6, lineHeight: 1.5 }}>{item.body}</p>
          {item.fix && (
            <div style={{ fontSize: 11, color: dark ? "#6EE7B7" : "#166534", backgroundColor: dark ? "#0D2A1A" : "#F0FDF4", borderRadius: 4, padding: "4px 8px" }}>
              {item.fix}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function FormulationPartner() {
  const { dark } = useTheme()
  const [messages, setMessages] = useState<Message[]>(SEED_MESSAGES)
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [diagnosis, setDiagnosis] = useState<DiagnosisItem[]>(DEFAULT_DIAGNOSIS)
  const conversationRef = useRef<HTMLDivElement>(null)

  const bg = dark ? "#0A1628" : "#FFFFFF"
  const border = dark ? "#1B3A5C" : "#E5E7EB"
  const textPrimary = dark ? "#F9FAFB" : "#0D1B2A"
  const textSecondary = dark ? "#9CA3AF" : "#6B7280"
  const inputBg = dark ? "#0D1B2A" : "#FFFFFF"

  useEffect(() => {
    if (conversationRef.current) {
      conversationRef.current.scrollTop = conversationRef.current.scrollHeight
    }
  }, [messages, isLoading])

  async function sendMessage() {
    const text = input.trim()
    if (!text || isLoading) return

    const userMsg: Message = { role: "user", content: text }
    const newMessages = [...messages.filter((m) => m.content !== "__STRUCTURED__"), userMsg]
    // Send only real text messages to API (not the structured placeholder)
    const apiMessages = messages
      .filter((m) => m.content !== "__STRUCTURED__")
      .concat(userMsg)
      .map((m) => ({ role: m.role, content: m.content }))

    setMessages([...messages, userMsg])
    setInput("")
    setIsLoading(true)

    try {
      const res = await fetch("/api/formulation-partner", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: apiMessages }),
      })
      const data = await res.json()
      const aiText: string = data.response ?? ""

      setMessages((prev) => [...prev, { role: "assistant", content: aiText }])

      // Try to update diagnosis panel
      const parsed = parseDiagnosisFromText(aiText)
      if (parsed) setDiagnosis(parsed)
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "I encountered an error. Please try again." },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <>
      <style>{`
        @keyframes bounce {
          0%, 80%, 100% { transform: translateY(0); opacity: 0.4; }
          40% { transform: translateY(-6px); opacity: 1; }
        }
      `}</style>

      <div style={{ display: "flex", gap: 24, height: "100%", alignItems: "flex-start" }}>

        {/* ── LEFT: Chat interface ─────────────────────────────────── */}
        <div
          style={{
            flex: "0 0 58%",
            minWidth: 0,
            backgroundColor: bg,
            border: `1px solid ${border}`,
            borderRadius: 10,
            display: "flex",
            flexDirection: "column",
            height: "calc(100vh - 56px - 48px)",
          }}
        >
          {/* Conversation area */}
          <div
            ref={conversationRef}
            style={{
              flex: 1,
              overflowY: "auto",
              padding: 20,
              display: "flex",
              flexDirection: "column",
              gap: 16,
            }}
          >
            {messages.map((msg, i) =>
              msg.role === "user" ? (
                <div key={i} style={{ display: "flex", justifyContent: "flex-end" }}>
                  <div>
                    <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.06em", color: "#9CA3AF", textAlign: "right", marginBottom: 4 }}>
                      You
                    </div>
                    <div
                      style={{
                        backgroundColor: dark ? "#1B3A5C" : "#0D1B2A",
                        color: "#FFFFFF",
                        borderRadius: "12px 12px 4px 12px",
                        padding: "10px 14px",
                        maxWidth: "80%",
                        fontSize: 13,
                        lineHeight: 1.6,
                      }}
                    >
                      {msg.content}
                    </div>
                  </div>
                </div>
              ) : (
                <div key={i} style={{ display: "flex", justifyContent: "flex-start" }}>
                  <div>
                    <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.06em", color: "#9CA3AF", marginBottom: 4 }}>
                      Formulation Partner
                    </div>
                    {msg.content === "__STRUCTURED__" ? (
                      <StructuredAIMessage dark={dark} />
                    ) : (
                      <ProseAIMessage content={msg.content} dark={dark} />
                    )}
                  </div>
                </div>
              )
            )}
            {isLoading && <TypingIndicator dark={dark} />}
          </div>

          {/* Suggestion chips */}
          <div
            style={{
              padding: "8px 20px",
              borderTop: `1px solid ${dark ? "#1B3A5C" : "#F3F4F6"}`,
              display: "flex",
              flexWrap: "wrap",
              gap: 8,
            }}
          >
            {[
              "Generate substitution options ↗",
              "Show stability risk register ↗",
              "Scale-up considerations ↗",
              "Compare to marketed products ↗",
            ].map((chip) => (
              <button
                key={chip}
                onClick={() => { setInput(chip.replace(" ↗", "")); }}
                style={{
                  border: `1px solid ${border}`,
                  borderRadius: 20,
                  padding: "5px 12px",
                  fontSize: 12,
                  color: textSecondary,
                  backgroundColor: "transparent",
                  cursor: "pointer",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "#D4A843"
                  e.currentTarget.style.color = "#D4A843"
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = border
                  e.currentTarget.style.color = textSecondary
                }}
              >
                {chip}
              </button>
            ))}
          </div>

          {/* Input area */}
          <div style={{ padding: "16px 20px", borderTop: `1px solid ${border}` }}>
            <div style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
              <button
                style={{
                  width: 32,
                  height: 36,
                  border: `1px solid ${border}`,
                  borderRadius: 6,
                  backgroundColor: inputBg,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  flexShrink: 0,
                }}
              >
                <Paperclip size={15} style={{ color: "#6B7280" }} />
              </button>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Describe a problem, paste a formula, or brainstorm freely..."
                style={{
                  flex: 1,
                  minHeight: 36,
                  maxHeight: 120,
                  border: `1px solid ${border}`,
                  borderRadius: 6,
                  padding: "8px 12px",
                  fontSize: 13,
                  resize: "none",
                  backgroundColor: inputBg,
                  color: textPrimary,
                  outline: "none",
                  fontFamily: "inherit",
                  lineHeight: 1.5,
                }}
              />
              <button
                onClick={sendMessage}
                disabled={isLoading || !input.trim()}
                style={{
                  width: 36,
                  height: 36,
                  backgroundColor: isLoading || !input.trim() ? "#6B7280" : "#0D1B2A",
                  borderRadius: 6,
                  border: "none",
                  cursor: isLoading || !input.trim() ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <Send size={15} style={{ color: "#FFFFFF" }} />
              </button>
            </div>
            <p style={{ margin: 0, marginTop: 8, fontSize: 11, color: "#9CA3AF", textAlign: "center" }}>
              Formulation Partner has access to 51,780+ ingredient records, 8,000+ reference formulations, and 550,000+ marketed products.
            </p>
          </div>
        </div>

        {/* ── RIGHT: Live analysis panel ──────────────────────────── */}
        <div
          style={{
            flex: "0 0 calc(42% - 24px)",
            minWidth: 0,
            backgroundColor: bg,
            border: `1px solid ${border}`,
            borderRadius: 10,
            padding: 20,
            position: "sticky",
            top: 24,
          }}
        >
          <div style={{ fontSize: 11, fontWeight: 500, letterSpacing: "0.06em", textTransform: "uppercase", color: "#6B7280", marginBottom: 16 }}>
            Failure Diagnosis
          </div>

          {diagnosis.map((item, i) => (
            <DiagnosisCard key={i} item={item} index={i} dark={dark} />
          ))}

          {/* Divider */}
          <div style={{ height: 1, backgroundColor: dark ? "#1B3A5C" : "#E5E7EB", margin: "16px 0" }} />

          {/* Cross-reference */}
          <div style={{ fontSize: 11, fontWeight: 500, letterSpacing: "0.06em", textTransform: "uppercase", color: "#6B7280", marginBottom: 8 }}>
            Cross-Reference
          </div>
          <div
            style={{
              backgroundColor: dark ? "#0D1B2A" : "#F9FAFB",
              borderRadius: 6,
              padding: 12,
            }}
          >
            <p style={{ fontSize: 12, fontWeight: 500, color: textPrimary, margin: 0 }}>
              2,573 w/o emulsion systems analysed
            </p>
            <p style={{ fontSize: 12, color: textSecondary, margin: 0, marginTop: 4 }}>
              94% of stable systems at this oil load use 4.5–6% emulsifier
            </p>
            <p style={{ fontSize: 11, color: "#991B1B", margin: 0, marginTop: 4 }}>
              Your system: 8th percentile for emulsifier concentration
            </p>
          </div>

          {/* Divider */}
          <div style={{ height: 1, backgroundColor: dark ? "#1B3A5C" : "#E5E7EB", margin: "16px 0" }} />

          {/* CTA */}
          <button
            style={{
              width: "100%",
              height: 36,
              border: "1px solid #D4A843",
              color: "#D4A843",
              backgroundColor: "transparent",
              borderRadius: 6,
              fontSize: 13,
              fontWeight: 500,
              cursor: "pointer",
            }}
          >
            START FROM THIS ANALYSIS →
          </button>
          <p style={{ fontSize: 11, color: "#9CA3AF", textAlign: "center", margin: 0, marginTop: 4 }}>
            Transfer to new formulation brief
          </p>
        </div>
      </div>
    </>
  )
}
