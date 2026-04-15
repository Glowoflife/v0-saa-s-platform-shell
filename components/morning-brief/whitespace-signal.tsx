"use client"

import { useTheme } from "@/components/theme-context"

export function WhitespaceSignal() {
  const { dark } = useTheme()

  return (
    <div
      style={{
        backgroundColor: dark ? "#111827" : "#FFFFFF",
        border: `1px solid ${dark ? "#166534" : "#BBF7D0"}`,
        borderRadius: 10,
        padding: "18px 20px",
      }}
    >
      <div
        style={{
          fontSize: 11,
          fontWeight: 500,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: "#065F46",
        }}
      >
        WHITE SPACE SIGNAL
      </div>

      <div
        style={{
          fontSize: 14,
          fontWeight: 600,
          color: dark ? "#F9FAFB" : "#0D1B2A",
          marginTop: 8,
        }}
      >
        Bakuchiol + Azelaic Acid · EU
      </div>

      <div
        style={{
          fontSize: 12,
          color: "#6B7280",
          marginTop: 4,
        }}
      >
        Only 12 EU products match this combination across 38,400 leave-on references.
      </div>

      {/* Mini stat row */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 16,
          marginTop: 12,
        }}
      >
        <div>
          <div style={{ fontSize: 22, fontWeight: 700, color: "#065F46" }}>12</div>
          <div style={{ fontSize: 10, color: "#9CA3AF" }}>products in corpus</div>
        </div>
        <div>
          <div style={{ fontSize: 22, fontWeight: 700, color: dark ? "#F9FAFB" : "#0D1B2A" }}>38,400</div>
          <div style={{ fontSize: 10, color: "#9CA3AF" }}>EU leave-on total</div>
        </div>
      </div>

      {/* CTA button */}
      <button
        style={{
          width: "100%",
          height: 36,
          marginTop: 14,
          backgroundColor: "transparent",
          border: "1px solid #D4A843",
          borderRadius: 8,
          color: "#D4A843",
          fontSize: 12,
          fontWeight: 500,
          cursor: "pointer",
        }}
      >
        Formulate this →
      </button>
    </div>
  )
}
