"use client"

import { useState } from "react"
import { useTheme } from "@/components/theme-context"
import { apiFetch } from "@/lib/api-client"

interface OnboardingModalProps {
  userName: string
  creditBalance: number
  onClose: () => void
}

const TOTAL_STEPS = 4

function ProgressDots({ step, dark }: { step: number; dark: boolean }) {
  return (
    <div style={{ display: "flex", gap: 6, justifyContent: "center", marginBottom: 28 }}>
      {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
        <div
          key={i}
          style={{
            width: i === step ? 20 : 8,
            height: 8,
            borderRadius: 999,
            backgroundColor: i <= step ? "#D4A843" : dark ? "#374151" : "#E5E7EB",
            transition: "all 0.2s ease",
          }}
        />
      ))}
    </div>
  )
}

function Heading({ children, dark }: { children: React.ReactNode; dark: boolean }) {
  return (
    <div
      style={{
        fontSize: 20,
        fontWeight: 700,
        color: dark ? "#F9FAFB" : "#0D1B2A",
        marginBottom: 14,
        lineHeight: 1.3,
      }}
    >
      {children}
    </div>
  )
}

function Body({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontSize: 14, color: "#6B7280", lineHeight: 1.7 }}>
      {children}
    </div>
  )
}

function CreditRow({ icon, label, credits, description }: { icon: string; label: string; credits: string; description: string }) {
  return (
    <div style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 12 }}>
      <span style={{ fontSize: 16, flexShrink: 0, marginTop: 1 }}>{icon}</span>
      <div>
        <span style={{ fontWeight: 600, color: "#374151" }}>{label}</span>
        <span style={{ color: "#D4A843", fontWeight: 600 }}> — {credits}</span>
        <span> · {description}</span>
      </div>
    </div>
  )
}

function OptionCard({ title, description, dark }: { title: string; description: string; dark: boolean }) {
  return (
    <div
      style={{
        backgroundColor: dark ? "#1F2937" : "#F9FAFB",
        border: `1px solid ${dark ? "#374151" : "#E5E7EB"}`,
        borderRadius: 10,
        padding: "16px",
        flex: 1,
      }}
    >
      <div style={{ fontSize: 14, fontWeight: 600, color: dark ? "#F9FAFB" : "#0D1B2A", marginBottom: 8 }}>
        {title}
      </div>
      <div style={{ fontSize: 13, color: "#6B7280", lineHeight: 1.6 }}>{description}</div>
    </div>
  )
}

function WelcomeScreen({ userName, creditBalance, dark }: { userName: string; creditBalance: number; dark: boolean }) {
  return (
    <>
      <Heading dark={dark}>Welcome to theformulator.ai, {userName}.</Heading>
      <Body>
        You have <strong style={{ color: "#D4A843" }}>{creditBalance} trial credits</strong> to explore the platform.
        Credits never expire — use them at your pace.
      </Body>
    </>
  )
}

function CreditsScreen({ dark }: { dark: boolean }) {
  return (
    <>
      <Heading dark={dark}>Three report levels, one credit system.</Heading>
      <Body>
        <CreditRow
          icon="⚡"
          label="Quick Formula"
          credits="1 credit"
          description="Core ingredient list with phases and % concentrations"
        />
        <CreditRow
          icon="📋"
          label="Intelligence Brief"
          credits="3 credits"
          description="Adds regulatory screening, safety scoring, preservation rationale"
        />
        <CreditRow
          icon="📁"
          label="Dossier"
          credits="5 credits"
          description="Full stability risk, manufacturing brief, supplier options, research citations"
        />
        <div style={{ marginTop: 4, paddingTop: 12, borderTop: `1px solid ${dark ? "#374151" : "#E5E7EB"}`, fontSize: 13, color: "#9CA3AF" }}>
          You can upgrade a report to a higher tier at any time — credits charged will equal the difference.
        </div>
      </Body>
    </>
  )
}

function StartScreen({ dark }: { dark: boolean }) {
  return (
    <>
      <Heading dark={dark}>Start from a brief or reverse-engineer an existing product.</Heading>
      <div style={{ display: "flex", gap: 12, marginTop: 4 }}>
        <OptionCard
          title="New Formulation"
          description="Describe your product idea, target markets, and claims. The platform generates 2–3 variants backed by 15 retrieval layers."
          dark={dark}
        />
        <OptionCard
          title="Deformulate"
          description="Paste an INCI list, search our 561K-product database, or upload a label photo. Get a probable bench-ready formula with blend detection."
          dark={dark}
        />
      </div>
    </>
  )
}

function IntelScreen({ dark }: { dark: boolean }) {
  return (
    <>
      <Heading dark={dark}>Your morning brief is your daily driver.</Heading>
      <Body>
        The dashboard shows your active formulations, credit balance, regulatory alerts across your target markets,
        and a curated intelligence feed from 30+ industry sources. Check it each morning — or set up email digests
        in Settings.
      </Body>
    </>
  )
}

export function OnboardingModal({ userName, creditBalance, onClose }: OnboardingModalProps) {
  const { dark } = useTheme()
  const [step, setStep] = useState(0)
  const [dismissing, setDismissing] = useState(false)

  async function dismiss() {
    if (dismissing) return
    setDismissing(true)
    try {
      await apiFetch("https://api.theformulator.ai/api/user/mark-onboarded", { method: "POST" })
    } finally {
      onClose()
    }
  }

  const isFirst = step === 0
  const isLast = step === TOTAL_STEPS - 1

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0,0,0,0.6)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      }}
    >
      <div
        style={{
          backgroundColor: dark ? "#0D1B2A" : "#FFFFFF",
          borderRadius: 16,
          maxWidth: 560,
          width: "calc(100% - 32px)",
          padding: "32px",
          position: "relative",
          boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
        }}
      >
        {/* Close button */}
        <button
          onClick={dismiss}
          disabled={dismissing}
          style={{
            position: "absolute",
            top: 16,
            right: 16,
            background: "none",
            border: "none",
            cursor: "pointer",
            fontSize: 22,
            color: "#9CA3AF",
            lineHeight: 1,
            padding: "4px 6px",
          }}
          aria-label="Close"
        >
          ×
        </button>

        <ProgressDots step={step} dark={dark} />

        {/* Screen content */}
        {step === 0 && <WelcomeScreen userName={userName} creditBalance={creditBalance} dark={dark} />}
        {step === 1 && <CreditsScreen dark={dark} />}
        {step === 2 && <StartScreen dark={dark} />}
        {step === 3 && <IntelScreen dark={dark} />}

        {/* Navigation */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: 28,
          }}
        >
          <div>
            {isFirst ? (
              <button
                onClick={dismiss}
                disabled={dismissing}
                style={{
                  fontSize: 13,
                  color: "#9CA3AF",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: 0,
                }}
              >
                Skip
              </button>
            ) : (
              <button
                onClick={() => setStep((s) => s - 1)}
                style={{
                  fontSize: 13,
                  color: "#6B7280",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: 0,
                }}
              >
                ← Back
              </button>
            )}
          </div>

          <button
            onClick={isLast ? dismiss : () => setStep((s) => s + 1)}
            disabled={dismissing}
            style={{
              backgroundColor: "#D4A843",
              color: "#0D1B2A",
              fontSize: 13,
              fontWeight: 600,
              padding: "10px 22px",
              borderRadius: 8,
              border: "none",
              cursor: "pointer",
              opacity: dismissing ? 0.7 : 1,
            }}
          >
            {isLast ? "Get started ✓" : "Next →"}
          </button>
        </div>
      </div>
    </div>
  )
}
