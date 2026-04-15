"use client"

import { useTheme } from "@/components/theme-context"
import type {
  MorningBriefAlertCounts,
  MorningBriefFailingSource,
  MorningBriefRegulatoryAlert,
  MorningBriefSourceHealth,
} from "@/components/morning-brief/types"

const SEVERITY_STYLES = {
  critical: {
    border: "#EF4444",
    badgeBg: "#FEE2E2",
    badgeText: "#991B1B",
  },
  material: {
    border: "#F59E0B",
    badgeBg: "#FEF3C7",
    badgeText: "#92400E",
  },
  watch: {
    border: "#3B82F6",
    badgeBg: "#DBEAFE",
    badgeText: "#1D4ED8",
  },
  info: {
    border: "#9CA3AF",
    badgeBg: "#F3F4F6",
    badgeText: "#4B5563",
  },
} as const

function formatAlertDate(value: string) {
  const parsed = new Date(value)

  if (Number.isNaN(parsed.getTime())) {
    return ""
  }

  return parsed.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}

function getPanelAccent(alerts: MorningBriefRegulatoryAlert[], counts: MorningBriefAlertCounts) {
  if (counts.critical > 0) {
    return { border: "#FECACA", title: "#991B1B" }
  }

  if (alerts.length === 0) {
    return { border: "#BBF7D0", title: "#065F46" }
  }

  return { border: "#E5E7EB", title: "#6B7280" }
}

interface RegulatoryAlertsProps {
  regulatoryAlerts: MorningBriefRegulatoryAlert[]
  alertCounts: MorningBriefAlertCounts
  sourceHealth: MorningBriefSourceHealth
  failingSources: MorningBriefFailingSource[]
  marketsMonitored: string[]
}

export function RegulatoryAlerts({
  regulatoryAlerts,
  alertCounts,
  sourceHealth,
  failingSources,
  marketsMonitored,
}: RegulatoryAlertsProps) {
  const { dark } = useTheme()
  const panelAccent = getPanelAccent(regulatoryAlerts, alertCounts)
  const sourceHealthPercentage = sourceHealth.total > 0
    ? Math.round((sourceHealth.healthy / sourceHealth.total) * 100)
    : 0

  return (
    <div
      style={{
        backgroundColor: dark ? "#111827" : "#FFFFFF",
        border: `1px solid ${panelAccent.border}`,
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
          color: panelAccent.title,
          marginBottom: 12,
        }}
      >
        REGULATORY ALERTS
      </div>

      {regulatoryAlerts.length === 0 ? (
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: 10,
            padding: "2px 0 4px",
          }}
        >
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              backgroundColor: "#10B981",
              marginTop: 5,
              flexShrink: 0,
            }}
          />
          <div
            style={{
              fontSize: 12,
              color: "#6B7280",
              lineHeight: 1.6,
            }}
          >
            No regulatory changes detected in the last 30 days. Monitoring {marketsMonitored.length} markets.
          </div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {regulatoryAlerts.map((alert) => {
            const severityStyle = SEVERITY_STYLES[alert.severity]
            const formattedDate = formatAlertDate(alert.created_at)

            return (
              <div
                key={alert.id}
                style={{
                  backgroundColor: dark ? "#0D1B2A" : "#FFFFFF",
                  border: `1px solid ${dark ? "#1F2937" : "#E5E7EB"}`,
                  borderLeft: `3px solid ${severityStyle.border}`,
                  borderRadius: 8,
                  padding: "14px 16px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    gap: 10,
                  }}
                >
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 600,
                      color: dark ? "#F9FAFB" : "#0D1B2A",
                    }}
                  >
                    {alert.title}
                  </div>
                  <span
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: 10,
                      color: dark ? "#F9FAFB" : "#0D1B2A",
                      backgroundColor: dark ? "#1F2937" : "#F9FAFB",
                      border: `1px solid ${dark ? "#374151" : "#E5E7EB"}`,
                      borderRadius: 999,
                      padding: "3px 8px",
                      flexShrink: 0,
                    }}
                  >
                    {alert.market}
                  </span>
                </div>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    marginTop: 8,
                    flexWrap: "wrap",
                  }}
                >
                  <span
                    style={{
                      backgroundColor: severityStyle.badgeBg,
                      color: severityStyle.badgeText,
                      fontSize: 10,
                      fontWeight: 600,
                      letterSpacing: "0.04em",
                      textTransform: "uppercase",
                      borderRadius: 999,
                      padding: "3px 8px",
                    }}
                  >
                    {alert.severity}
                  </span>
                  <span
                    style={{
                      fontSize: 11,
                      color: "#6B7280",
                    }}
                  >
                    {alert.authority}
                    {formattedDate ? ` · ${formattedDate}` : ""}
                  </span>
                </div>

                <div
                  style={{
                    fontSize: 12,
                    color: "#6B7280",
                    lineHeight: 1.6,
                    marginTop: 8,
                  }}
                >
                  {alert.summary}
                </div>

                {alert.affected_inci.length > 0 && (
                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: 6,
                      marginTop: 10,
                    }}
                  >
                    {alert.affected_inci.map((inci) => (
                      <span
                        key={inci}
                        style={{
                          fontSize: 10,
                          color: dark ? "#9CA3AF" : "#6B7280",
                          backgroundColor: dark ? "#111827" : "#F9FAFB",
                          border: `1px solid ${dark ? "#374151" : "#E5E7EB"}`,
                          borderRadius: 999,
                          padding: "3px 8px",
                        }}
                      >
                        {inci}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      <div
        style={{
          height: 1,
          backgroundColor: dark ? "#1F2937" : "#F3F4F6",
          margin: "16px 0 14px",
        }}
      />

      <div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              backgroundColor: "#10B981",
              flexShrink: 0,
            }}
          />
          <span
            style={{
              fontSize: 12,
              fontWeight: 500,
              color: "#065F46",
            }}
          >
            {sourceHealth.healthy}/{sourceHealth.total} sources healthy
          </span>
        </div>

        <div
          style={{
            height: 8,
            borderRadius: 999,
            backgroundColor: dark ? "#1F2937" : "#ECFDF5",
            overflow: "hidden",
            marginTop: 10,
          }}
        >
          <div
            style={{
              width: `${sourceHealthPercentage}%`,
              height: "100%",
              backgroundColor: "#10B981",
            }}
          />
        </div>

        {failingSources.length > 0 && (
          <details
            style={{
              marginTop: 12,
              backgroundColor: dark ? "#0D1B2A" : "#F9FAFB",
              border: `1px solid ${dark ? "#1F2937" : "#E5E7EB"}`,
              borderRadius: 8,
              padding: "10px 12px",
            }}
          >
            <summary
              style={{
                cursor: "pointer",
                fontSize: 11,
                fontWeight: 500,
                color: "#6B7280",
                listStyle: "none",
              }}
            >
              {failingSources.length} failing source{failingSources.length === 1 ? "" : "s"}
            </summary>

            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 10 }}>
              {failingSources.map((source) => (
                <div
                  key={`${source.market}-${source.authority}`}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 12,
                    fontSize: 11,
                    color: "#6B7280",
                  }}
                >
                  <span>{source.authority} · {source.market}</span>
                  <span
                    style={{
                      fontFamily: "var(--font-mono)",
                      color: "#991B1B",
                      flexShrink: 0,
                    }}
                  >
                    {source.consecutive_failures} fail{source.consecutive_failures === 1 ? "" : "s"}
                  </span>
                </div>
              ))}
            </div>
          </details>
        )}
      </div>
    </div>
  )
}
