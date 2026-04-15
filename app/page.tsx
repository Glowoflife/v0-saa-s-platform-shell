"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Zap } from "lucide-react"
import { useTheme } from "@/components/theme-context"
import { apiFetch } from "@/lib/api-client"
import { StatRow } from "@/components/morning-brief/stat-row"
import { ActiveProjects } from "@/components/morning-brief/active-projects"
import { RegulatoryAlerts } from "@/components/morning-brief/regulatory-alerts"
import { IntelligenceFeed } from "@/components/morning-brief/intelligence-feed"
import { WhitespaceSignal } from "@/components/morning-brief/whitespace-signal"
import type { MorningBriefData } from "@/components/morning-brief/types"

const LOGIN_URL = "https://theformulator.ai"
const MORNING_BRIEF_URL = "https://api.theformulator.ai/api/morning-brief"

function getGreetingLabel(greetingTime: MorningBriefData["greeting_time"]) {
  if (greetingTime === "afternoon") {
    return "Good afternoon"
  }

  if (greetingTime === "evening") {
    return "Good evening"
  }

  return "Good morning"
}

function SkeletonBlock({
  width,
  height,
  dark,
  radius = 8,
}: {
  width: string | number
  height: number
  dark: boolean
  radius?: number
}) {
  return (
    <div
      className="animate-pulse"
      style={{
        width,
        height,
        borderRadius: radius,
        backgroundColor: dark ? "#1F2937" : "#E5E7EB",
      }}
    />
  )
}

function MorningBriefSkeleton({ dark }: { dark: boolean }) {
  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 24,
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <SkeletonBlock width={240} height={28} dark={dark} />
          <SkeletonBlock width={180} height={14} dark={dark} />
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <SkeletonBlock width={148} height={34} dark={dark} radius={20} />
          <SkeletonBlock width={152} height={40} dark={dark} />
        </div>
      </div>

      <div
        style={{
          fontSize: 11,
          fontWeight: 500,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: "#9CA3AF",
          marginBottom: 12,
        }}
      >
        YOUR WORK
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 12,
        }}
      >
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            style={{
              backgroundColor: dark ? "#111827" : "#FFFFFF",
              border: `1px solid ${dark ? "#1F2937" : "#E5E7EB"}`,
              borderRadius: 10,
              padding: "16px 20px",
            }}
          >
            <SkeletonBlock width={56} height={30} dark={dark} />
            <div style={{ marginTop: 8 }}>
              <SkeletonBlock width={108} height={12} dark={dark} />
            </div>
            <div style={{ marginTop: 8 }}>
              <SkeletonBlock width={132} height={12} dark={dark} />
            </div>
          </div>
        ))}
      </div>

      <div
        style={{
          marginTop: 16,
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 16,
        }}
      >
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={index}
            style={{
              backgroundColor: dark ? "#111827" : "#FFFFFF",
              border: `1px solid ${dark ? "#1F2937" : "#E5E7EB"}`,
              borderRadius: 10,
              padding: "18px 20px",
              minHeight: 180,
            }}
          >
            <SkeletonBlock width={90} height={18} dark={dark} />
            <div style={{ marginTop: 14 }}>
              <SkeletonBlock width="100%" height={16} dark={dark} />
            </div>
            <div style={{ marginTop: 10 }}>
              <SkeletonBlock width="70%" height={12} dark={dark} />
            </div>
          </div>
        ))}
      </div>

      <div
        style={{
          fontSize: 11,
          fontWeight: 500,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: "#9CA3AF",
          marginTop: 32,
          marginBottom: 12,
        }}
      >
        RECENT ACTIVITY
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "65% 35%",
          gap: 20,
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              style={{
                backgroundColor: dark ? "#111827" : "#FFFFFF",
                border: `1px solid ${dark ? "#1F2937" : "#E5E7EB"}`,
                borderRadius: 10,
                padding: "16px 20px",
              }}
            >
              <SkeletonBlock width={82} height={18} dark={dark} />
              <div style={{ marginTop: 10 }}>
                <SkeletonBlock width="100%" height={16} dark={dark} />
              </div>
              <div style={{ marginTop: 10 }}>
                <SkeletonBlock width="60%" height={12} dark={dark} />
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div
            style={{
              backgroundColor: dark ? "#111827" : "#FFFFFF",
              border: `1px solid ${dark ? "#1F2937" : "#E5E7EB"}`,
              borderRadius: 10,
              padding: "18px 20px",
              minHeight: 240,
            }}
          >
            <SkeletonBlock width={126} height={12} dark={dark} />
            <div style={{ marginTop: 16 }}>
              <SkeletonBlock width="100%" height={72} dark={dark} />
            </div>
            <div style={{ marginTop: 16 }}>
              <SkeletonBlock width="100%" height={12} dark={dark} />
            </div>
            <div style={{ marginTop: 8 }}>
              <SkeletonBlock width="100%" height={8} dark={dark} radius={999} />
            </div>
          </div>

          <div
            style={{
              backgroundColor: dark ? "#111827" : "#FFFFFF",
              border: `1px solid ${dark ? "#1F2937" : "#E5E7EB"}`,
              borderRadius: 10,
              padding: "18px 20px",
              minHeight: 170,
            }}
          >
            <SkeletonBlock width={118} height={12} dark={dark} />
            <div style={{ marginTop: 16 }}>
              <SkeletonBlock width="100%" height={16} dark={dark} />
            </div>
            <div style={{ marginTop: 10 }}>
              <SkeletonBlock width="70%" height={12} dark={dark} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function MorningBriefError({
  dark,
  onRetry,
}: {
  dark: boolean
  onRetry: () => void
}) {
  return (
    <div
      style={{
        backgroundColor: dark ? "#111827" : "#FFFFFF",
        border: `1px solid ${dark ? "#1F2937" : "#E5E7EB"}`,
        borderRadius: 12,
        padding: "28px 30px",
        maxWidth: 480,
      }}
    >
      <div
        style={{
          fontSize: 20,
          fontWeight: 700,
          color: dark ? "#F9FAFB" : "#0D1B2A",
        }}
      >
        Unable to load dashboard data
      </div>
      <div
        style={{
          fontSize: 13,
          color: "#6B7280",
          marginTop: 6,
        }}
      >
        There was a problem reaching the Morning Brief API. Please try again.
      </div>
      <button
        onClick={onRetry}
        style={{
          marginTop: 16,
          backgroundColor: "#D4A843",
          color: "#0D1B2A",
          fontSize: 13,
          fontWeight: 600,
          padding: "10px 18px",
          borderRadius: 8,
          border: "none",
          cursor: "pointer",
        }}
      >
        Retry
      </button>
    </div>
  )
}

export default function Home() {
  const { dark } = useTheme()
  const [reloadKey, setReloadKey] = useState(0)
  const [data, setData] = useState<MorningBriefData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function loadMorningBrief() {
      setIsLoading(true)
      setHasError(false)

      try {
        const response = await apiFetch(MORNING_BRIEF_URL)

        if (cancelled) {
          return
        }

        if (response.status === 401) {
          window.location.href = LOGIN_URL
          return
        }

        if (!response.ok) {
          setHasError(true)
          return
        }

        const payload = await response.json() as MorningBriefData

        if (!cancelled) {
          setData(payload)
        }
      } catch {
        if (!cancelled) {
          setHasError(true)
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false)
        }
      }
    }

    void loadMorningBrief()

    return () => {
      cancelled = true
    }
  }, [reloadKey])

  if (isLoading && !data) {
    return <MorningBriefSkeleton dark={dark} />
  }

  if (hasError && !data) {
    return <MorningBriefError dark={dark} onRetry={() => setReloadKey((value) => value + 1)} />
  }

  if (!data) {
    return null
  }

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 24,
        }}
      >
        <div>
          <div
            style={{
              fontSize: 22,
              fontWeight: 700,
              color: dark ? "#FFFFFF" : "#0D1B2A",
            }}
          >
            {getGreetingLabel(data.greeting_time)}, Jeevan.
          </div>
          <div
            style={{
              fontSize: 13,
              color: "#6B7280",
              marginTop: 3,
            }}
          >
            {data.date}
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              backgroundColor: dark ? "#111827" : "#FFFFFF",
              border: `1px solid ${dark ? "#1F2937" : "#E5E7EB"}`,
              borderRadius: 20,
              padding: "6px 12px",
            }}
          >
            <Zap size={14} style={{ color: "#D4A843" }} />
            <span
              style={{
                fontSize: 12,
                fontFamily: "var(--font-mono)",
                color: "#6B7280",
              }}
            >
              {data.stats.credits_remaining} credits remaining
            </span>
          </div>
          <Link
            href="/new-formulation"
            style={{
              backgroundColor: "#D4A843",
              color: "#0D1B2A",
              fontSize: 13,
              fontWeight: 600,
              padding: "10px 18px",
              borderRadius: 8,
              textDecoration: "none",
            }}
          >
            New Formulation →
          </Link>
        </div>
      </div>

      <div
        style={{
          fontSize: 11,
          fontWeight: 500,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: "#9CA3AF",
          marginBottom: 12,
        }}
      >
        YOUR WORK
      </div>

      <StatRow stats={data.stats} marketsMonitored={data.markets_monitored} />
      <ActiveProjects />

      <div
        style={{
          fontSize: 11,
          fontWeight: 500,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: "#9CA3AF",
          marginTop: 32,
          marginBottom: 12,
        }}
      >
        RECENT ACTIVITY
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "65% 35%",
          gap: 20,
        }}
      >
        <IntelligenceFeed activities={data.recent_activity} />

        <div>
          <RegulatoryAlerts
            regulatoryAlerts={data.regulatory_alerts}
            alertCounts={data.alert_counts}
            sourceHealth={data.source_health}
            failingSources={data.failing_sources}
            marketsMonitored={data.markets_monitored}
          />
          <WhitespaceSignal />
        </div>
      </div>
    </div>
  )
}
