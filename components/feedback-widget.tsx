"use client"

import { useState, useRef, useEffect } from "react"
import { ThumbsUp, ThumbsDown } from "lucide-react"
import { useTheme } from "@/components/theme-context"

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://api.theformulator.ai"

type Rating = "up" | "down" | null

interface Category {
  value: string
  label: string
}

const BASE_CATEGORIES: Category[] = [
  { value: "concentrations_wrong",    label: "Concentrations don't look right" },
  { value: "missing_ingredient",      label: "Missing a key ingredient" },
  { value: "wrong_ingredient",        label: "Ingredient I'd never use here" },
  { value: "regulatory_miss",         label: "Regulatory screening missed something" },
  { value: "preservation_wrong",      label: "Preservation system won't work" },
  { value: "phase_assignment_wrong",  label: "Wrong phase assignment" },
  { value: "other",                   label: "Other" },
]

const DEFORM_CATEGORY: Category = {
  value: "blend_groupings_wrong",
  label: "Blend groupings are wrong",
}

async function postFeedback(body: Record<string, unknown>): Promise<void> {
  const token = localStorage.getItem("tf_access_token") ?? localStorage.getItem("access_token")
  await fetch(`${API_BASE}/api/feedback`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  })
}

interface FeedbackWidgetProps {
  formulation_id: string
  report_level: string
  is_deformulation?: boolean
}

export function FeedbackWidget({
  formulation_id,
  report_level,
  is_deformulation = false,
}: FeedbackWidgetProps) {
  const { dark } = useTheme()
  const [rating, setRating] = useState<Rating>(null)
  const [showPopover, setShowPopover] = useState(false)
  const [showThanks, setShowThanks] = useState(false)
  const [otherText, setOtherText] = useState("")
  const popoverRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const categories = is_deformulation
    ? [...BASE_CATEGORIES.slice(0, -1), DEFORM_CATEGORY, BASE_CATEGORIES[BASE_CATEGORIES.length - 1]]
    : BASE_CATEGORIES

  const disabled = rating !== null

  // Close popover on outside click
  useEffect(() => {
    if (!showPopover) return
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowPopover(false)
      }
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [showPopover])

  async function handleThumbsUp() {
    if (disabled) return
    setRating("up")
    setShowThanks(true)
    setTimeout(() => setShowThanks(false), 1500)
    try {
      await postFeedback({ formulation_id, rating: "up", report_level })
    } catch {
      // silent
    }
  }

  function handleThumbsDown() {
    if (disabled) return
    setShowPopover((prev) => !prev)
  }

  async function handleCategory(value: string) {
    if (value === "other") return // handled by Send button
    setRating("down")
    setShowPopover(false)
    try {
      await postFeedback({ formulation_id, rating: "down", category: value, report_level, is_deformulation })
    } catch {
      // silent
    }
  }

  async function handleOtherSend() {
    if (!otherText.trim()) return
    setRating("down")
    setShowPopover(false)
    try {
      await postFeedback({
        formulation_id,
        rating: "down",
        category: "other",
        free_text: otherText.trim(),
        report_level,
        is_deformulation,
      })
    } catch {
      // silent
    }
  }

  const border = dark ? "#1B3A5C" : "#E5E7EB"
  const bg = dark ? "#0D1B2A" : "#FFFFFF"
  const textSecondary = dark ? "#9CA3AF" : "#6B7280"

  return (
    <div ref={containerRef} style={{ position: "relative", display: "inline-flex" }}>
      {/* Pill container */}
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 2,
          backgroundColor: bg,
          border: `1px solid ${border}`,
          borderRadius: 999,
          padding: "5px 10px",
        }}
      >
        {/* Thumbs Up */}
        <div style={{ position: "relative" }}>
          <button
            onClick={handleThumbsUp}
            disabled={disabled}
            title="Helpful"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 30,
              height: 30,
              borderRadius: "50%",
              border: "none",
              backgroundColor: "transparent",
              cursor: disabled ? "default" : "pointer",
              transition: "background-color 0.1s",
            }}
            onMouseEnter={(e) => {
              if (!disabled) (e.currentTarget as HTMLButtonElement).style.backgroundColor = dark ? "#1B3A5C" : "#F3F4F6"
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.backgroundColor = "transparent"
            }}
          >
            <ThumbsUp
              size={15}
              style={{
                color: rating === "up" ? "#D4A843" : textSecondary,
                fill: rating === "up" ? "#D4A843" : "none",
                transition: "color 0.15s, fill 0.15s",
              }}
            />
          </button>

          {/* Thanks tooltip */}
          {showThanks && (
            <div
              style={{
                position: "absolute",
                bottom: "calc(100% + 6px)",
                left: "50%",
                transform: "translateX(-50%)",
                backgroundColor: "#0D1B2A",
                color: "#F9FAFB",
                fontSize: 11,
                fontWeight: 500,
                borderRadius: 6,
                padding: "4px 8px",
                whiteSpace: "nowrap",
                pointerEvents: "none",
                animation: "tf-fade-out 1.5s ease forwards",
              }}
            >
              Thanks
            </div>
          )}
        </div>

        {/* Divider */}
        <div style={{ width: 1, height: 16, backgroundColor: border, flexShrink: 0 }} />

        {/* Thumbs Down */}
        <button
          onClick={handleThumbsDown}
          disabled={disabled}
          title="Report an issue"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 30,
            height: 30,
            borderRadius: "50%",
            border: "none",
            backgroundColor: "transparent",
            cursor: disabled ? "default" : "pointer",
            transition: "background-color 0.1s",
          }}
          onMouseEnter={(e) => {
            if (!disabled) (e.currentTarget as HTMLButtonElement).style.backgroundColor = dark ? "#1B3A5C" : "#F3F4F6"
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.backgroundColor = "transparent"
          }}
        >
          <ThumbsDown
            size={15}
            style={{
              color: rating === "down" ? "#991B1B" : textSecondary,
              fill: rating === "down" ? "#991B1B" : "none",
              transition: "color 0.15s, fill 0.15s",
            }}
          />
        </button>
      </div>

      {/* Thumbs-down popover */}
      {showPopover && (
        <div
          ref={popoverRef}
          style={{
            position: "absolute",
            bottom: "calc(100% + 8px)",
            right: 0,
            width: 280,
            backgroundColor: bg,
            border: `1px solid ${border}`,
            borderRadius: 10,
            boxShadow: "0 8px 24px rgba(0,0,0,0.14)",
            zIndex: 50,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              fontSize: 11,
              fontWeight: 500,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              color: textSecondary,
              padding: "10px 14px 8px",
              borderBottom: `1px solid ${border}`,
            }}
          >
            What&apos;s the issue?
          </div>

          {categories.map((cat, index) => {
            if (cat.value === "other") {
              return (
                <div key="other" style={{ borderTop: `1px solid ${border}`, padding: "10px 14px" }}>
                  <div style={{ fontSize: 13, color: dark ? "#F9FAFB" : "#0D1B2A", marginBottom: 8 }}>
                    Other
                  </div>
                  <textarea
                    value={otherText}
                    onChange={(e) => setOtherText(e.target.value.slice(0, 280))}
                    placeholder="Describe the issue…"
                    rows={3}
                    style={{
                      width: "100%",
                      resize: "none",
                      fontSize: 12,
                      fontFamily: "var(--font-sans)",
                      color: dark ? "#F9FAFB" : "#0D1B2A",
                      backgroundColor: dark ? "#111827" : "#F9FAFB",
                      border: `1px solid ${border}`,
                      borderRadius: 6,
                      padding: "6px 8px",
                      outline: "none",
                      boxSizing: "border-box",
                    }}
                  />
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 6 }}>
                    <span style={{ fontSize: 11, color: textSecondary }}>{otherText.length}/280</span>
                    <button
                      onClick={handleOtherSend}
                      disabled={!otherText.trim()}
                      style={{
                        backgroundColor: otherText.trim() ? "#1B3A5C" : (dark ? "#1F2937" : "#E5E7EB"),
                        color: otherText.trim() ? "#FFFFFF" : textSecondary,
                        fontSize: 12,
                        fontWeight: 600,
                        border: "none",
                        borderRadius: 6,
                        padding: "5px 12px",
                        cursor: otherText.trim() ? "pointer" : "default",
                        transition: "background-color 0.1s",
                      }}
                    >
                      Send
                    </button>
                  </div>
                </div>
              )
            }

            return (
              <button
                key={cat.value}
                onClick={() => handleCategory(cat.value)}
                style={{
                  display: "block",
                  width: "100%",
                  textAlign: "left",
                  backgroundColor: "transparent",
                  border: "none",
                  borderBottom: index < categories.length - 1 ? `1px solid ${border}` : "none",
                  padding: "9px 14px",
                  fontSize: 13,
                  color: dark ? "#F9FAFB" : "#0D1B2A",
                  cursor: "pointer",
                  transition: "background-color 0.1s",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.backgroundColor = dark ? "#0F2033" : "#F9FAFB"
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.backgroundColor = "transparent"
                }}
              >
                {cat.label}
              </button>
            )
          })}
        </div>
      )}

      <style>{`
        @keyframes tf-fade-out {
          0%   { opacity: 1; }
          60%  { opacity: 1; }
          100% { opacity: 0; }
        }
      `}</style>
    </div>
  )
}
