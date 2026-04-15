"use client"

import { useTheme } from "@/components/theme-context"
import type { MorningBriefRecentActivity } from "@/components/morning-brief/types"

const TYPE_STYLES: Record<string, { borderLeft: string; pillBg: string; pillText: string }> = {
  quick: { borderLeft: "#1D4ED8", pillBg: "#DBEAFE", pillText: "#1D4ED8" },
  brief: { borderLeft: "#B45309", pillBg: "#FEF3C7", pillText: "#92400E" },
  dossier: { borderLeft: "#065F46", pillBg: "#D1FAE5", pillText: "#065F46" },
  admin_grant: { borderLeft: "#065F46", pillBg: "#D1FAE5", pillText: "#065F46" },
}

const DEFAULT_STYLE = {
  borderLeft: "#6B7280",
  pillBg: "#F3F4F6",
  pillText: "#4B5563",
}

function getActivityStyle(type: string) {
  return TYPE_STYLES[type.toLowerCase()] ?? DEFAULT_STYLE
}

function formatTypeLabel(type: string) {
  return type
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ")
}

function formatRelativeTime(value: string) {
  const parsed = new Date(value)

  if (Number.isNaN(parsed.getTime())) {
    return "Just now"
  }

  const diffMs = parsed.getTime() - Date.now()
  const diffMinutes = Math.round(diffMs / 60000)
  const relativeFormatter = new Intl.RelativeTimeFormat("en", { numeric: "auto" })

  if (Math.abs(diffMinutes) < 60) {
    return relativeFormatter.format(diffMinutes, "minute")
  }

  const diffHours = Math.round(diffMinutes / 60)
  if (Math.abs(diffHours) < 24) {
    return relativeFormatter.format(diffHours, "hour")
  }

  const diffDays = Math.round(diffHours / 24)
  if (Math.abs(diffDays) < 30) {
    return relativeFormatter.format(diffDays, "day")
  }

  const diffMonths = Math.round(diffDays / 30)
  return relativeFormatter.format(diffMonths, "month")
}

function formatCreditLabel(credits: number) {
  if (credits === 0) {
    return "No credit change"
  }

  const absoluteCredits = Math.abs(credits)
  const suffix = absoluteCredits === 1 ? "credit" : "credits"

  if (credits > 0) {
    return `+${absoluteCredits} ${suffix} added`
  }

  return `-${absoluteCredits} ${suffix} used`
}

function normalizeDescription(description: string, type: string) {
  const trimmed = description.trim()

  if (!trimmed) {
    return formatTypeLabel(type)
  }

  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1)
}

function ActivityCard({ activity, dark }: { activity: MorningBriefRecentActivity; dark: boolean }) {
  const style = getActivityStyle(activity.type)
  const creditTone = activity.credits > 0 ? "#065F46" : activity.credits < 0 ? "#991B1B" : "#6B7280"

  return (
    <div
      style={{
        backgroundColor: dark ? "#111827" : "#FFFFFF",
        border: `1px solid ${dark ? "#1F2937" : "#E5E7EB"}`,
        borderLeft: `3px solid ${style.borderLeft}`,
        borderRadius: 10,
        padding: "16px 20px",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
        <span
          style={{
            backgroundColor: style.pillBg,
            color: style.pillText,
            fontSize: 10,
            fontWeight: 600,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            borderRadius: 4,
            padding: "2px 8px",
          }}
        >
          {formatTypeLabel(activity.type)}
        </span>
        <span
          style={{
            fontSize: 11,
            color: "#9CA3AF",
            fontFamily: "var(--font-mono)",
            flexShrink: 0,
          }}
        >
          {formatRelativeTime(activity.created_at)}
        </span>
      </div>

      <div
        style={{
          fontSize: 13,
          fontWeight: 600,
          color: dark ? "#F9FAFB" : "#0D1B2A",
          marginTop: 8,
        }}
      >
        {normalizeDescription(activity.description, activity.type)}
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          marginTop: 8,
        }}
      >
        <span
          style={{
            fontSize: 11,
            color: "#6B7280",
          }}
        >
          Recent account activity
        </span>
        <span
          style={{
            fontSize: 11,
            fontWeight: 600,
            color: creditTone,
            fontFamily: "var(--font-mono)",
          }}
        >
          {formatCreditLabel(activity.credits)}
        </span>
      </div>
    </div>
  )
}

interface ActivityFeedProps {
  activities: MorningBriefRecentActivity[]
}

export function ActivityFeed({ activities }: ActivityFeedProps) {
  const { dark } = useTheme()

  if (activities.length === 0) {
    return (
      <div
        style={{
          backgroundColor: dark ? "#111827" : "#FFFFFF",
          border: `1px solid ${dark ? "#1F2937" : "#E5E7EB"}`,
          borderRadius: 10,
          padding: "20px 22px",
        }}
      >
        <div
          style={{
            fontSize: 14,
            fontWeight: 600,
            color: dark ? "#F9FAFB" : "#0D1B2A",
          }}
        >
          No recent activity yet
        </div>
        <div
          style={{
            fontSize: 12,
            color: "#6B7280",
            marginTop: 4,
          }}
        >
          Your latest formulation and credit events will appear here.
        </div>
      </div>
    )
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {activities.map((activity, index) => (
        <ActivityCard key={`${activity.type}-${activity.created_at}-${index}`} activity={activity} dark={dark} />
      ))}
    </div>
  )
}
