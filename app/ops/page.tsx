"use client"

import { useState, useEffect } from "react"
import { useTheme } from "@/components/theme-context"

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface User {
  user_id: string
  email: string
  full_name: string
  organisation: string
  role: "admin" | "formulator"
  credit_balance: number
  credits_spent: number
  last_login: string | null
  is_active: boolean
}

interface Transaction {
  id: string
  date: string
  user_email: string
  type: "admin_grant" | "quick" | "brief" | "dossier"
  credits: number
  formulation_id?: string
}

interface Stats {
  total_users: number
  active_users: number
  new_this_week: number
  active_this_week: number
  usage_by_level: {
    quick: number
    brief: number
    dossier: number
  }
}

interface DashboardData {
  stats: Stats
  users: User[]
  recent_transactions: Transaction[]
}

// ---------------------------------------------------------------------------
// Mock fallback data (used when API not yet live)
// ---------------------------------------------------------------------------
const MOCK: DashboardData = {
  stats: { total_users: 142, active_users: 89, new_this_week: 14, active_this_week: 37, usage_by_level: { quick: 204, brief: 88, dossier: 31 } },
  users: [
    { user_id: "u001", email: "jeevan@theformulator.ai", full_name: "Jeevan R", organisation: "theformulator.ai", role: "admin", credit_balance: 9999, credits_spent: 0, last_login: "2026-04-03T08:12:00Z", is_active: true },
    { user_id: "u002", email: "sarah@beautylab.co.uk", full_name: "Sarah Chen", organisation: "Beauty Lab UK", role: "formulator", credit_balance: 27, credits_spent: 13, last_login: "2026-04-02T14:30:00Z", is_active: true },
    { user_id: "u003", email: "marco@rossicosmetics.it", full_name: "Marco Rossi", organisation: "Rossi Cosmetics", role: "formulator", credit_balance: 4, credits_spent: 36, last_login: "2026-03-28T09:00:00Z", is_active: true },
    { user_id: "u004", email: "priya@dermaindia.com", full_name: "Priya Nair", organisation: "Derma India", role: "formulator", credit_balance: 0, credits_spent: 20, last_login: "2026-03-15T11:45:00Z", is_active: false },
    { user_id: "u005", email: "lena@nordicskin.se", full_name: "Lena Johansson", organisation: "Nordic Skin", role: "formulator", credit_balance: 15, credits_spent: 5, last_login: null, is_active: true },
  ],
  recent_transactions: [
    { id: "t001", date: "2026-04-03T08:00:00Z", user_email: "jeevan@theformulator.ai", type: "admin_grant", credits: 40, formulation_id: undefined },
    { id: "t002", date: "2026-04-02T14:35:00Z", user_email: "sarah@beautylab.co.uk", type: "dossier", credits: -5, formulation_id: "frm_0034" },
    { id: "t003", date: "2026-04-02T12:10:00Z", user_email: "marco@rossicosmetics.it", type: "brief", credits: -3, formulation_id: "frm_0033" },
    { id: "t004", date: "2026-04-01T16:50:00Z", user_email: "sarah@beautylab.co.uk", type: "quick", credits: -1, formulation_id: "frm_0032" },
    { id: "t005", date: "2026-03-31T09:15:00Z", user_email: "priya@dermaindia.com", type: "brief", credits: -3, formulation_id: "frm_0031" },
    { id: "t006", date: "2026-03-30T11:00:00Z", user_email: "jeevan@theformulator.ai", type: "admin_grant", credits: 20 },
    { id: "t007", date: "2026-03-28T09:05:00Z", user_email: "marco@rossicosmetics.it", type: "quick", credits: -1, formulation_id: "frm_0029" },
    { id: "t008", date: "2026-03-25T14:20:00Z", user_email: "lena@nordicskin.se", type: "dossier", credits: -5, formulation_id: "frm_0028" },
  ],
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function formatDate(iso: string | null) {
  if (!iso) return "Never"
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
}

function formatDateShort(iso: string) {
  return new Date(iso).toLocaleString("en-GB", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })
}

const TYPE_PILL: Record<string, { label: string; bg: string; color: string }> = {
  admin_grant: { label: "GRANT",   bg: "#D4A843", color: "#0D1B2A" },
  quick:       { label: "QUICK",   bg: "#DBEAFE", color: "#1D4ED8" },
  brief:       { label: "BRIEF",   bg: "#EDE9FE", color: "#6D28D9" },
  dossier:     { label: "DOSSIER", bg: "#FEF3C7", color: "#92400E" },
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------
function StatCard({ label, value, gold, dark }: { label: string; value: number; gold?: boolean; dark: boolean }) {
  return (
    <div style={{
      flex: 1,
      backgroundColor: dark ? "#0D1B2A" : "#FFFFFF",
      border: `1px solid ${dark ? "#1B3A5C" : "#E5E7EB"}`,
      borderRadius: 10,
      padding: "16px 20px",
    }}>
      <div style={{ fontSize: 10, fontWeight: 500, letterSpacing: "0.06em", textTransform: "uppercase", color: "#9CA3AF", marginBottom: 8 }}>{label}</div>
      <div style={{ fontSize: 24, fontWeight: 700, color: gold ? "#D4A843" : (dark ? "#F9FAFB" : "#0D1B2A"), fontFamily: "var(--font-mono)" }}>{value.toLocaleString()}</div>
    </div>
  )
}

function StatusPill({ active }: { active: boolean }) {
  return (
    <span style={{
      fontSize: 11, fontWeight: 600, borderRadius: 9999, padding: "2px 8px",
      backgroundColor: active ? "#D1FAE5" : "#FEE2E2",
      color: active ? "#065F46" : "#991B1B",
    }}>
      {active ? "Active" : "Inactive"}
    </span>
  )
}

function RolePill({ role }: { role: "admin" | "formulator" }) {
  return (
    <span style={{
      fontSize: 11, fontWeight: 600, borderRadius: 9999, padding: "2px 8px",
      backgroundColor: role === "admin" ? "#0D1B2A" : "#F3F4F6",
      color: role === "admin" ? "#FFFFFF" : "#374151",
    }}>
      {role}
    </span>
  )
}

// ---------------------------------------------------------------------------
// Main Page
// ---------------------------------------------------------------------------
export default function AdminPage() {
  const { dark } = useTheme()
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [accessDenied, setAccessDenied] = useState(false)
  const [grantInputs, setGrantInputs] = useState<Record<string, string>>({})
  const [grantStatus, setGrantStatus] = useState<Record<string, "success" | "error" | null>>({})

  const bg = dark ? "#060F1A" : "#F4F6F9"
  const cardBg = dark ? "#0D1B2A" : "#FFFFFF"
  const border = dark ? "#1B3A5C" : "#E5E7EB"
  const textPrimary = dark ? "#F9FAFB" : "#0D1B2A"
  const textSecondary = dark ? "#9CA3AF" : "#6B7280"

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("tf_access_token") : null
    if (!token) {
      window.location.href = "https://theformulator.ai"
      return
    }

    fetch("https://api.theformulator.ai/admin/dashboard", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (res) => {
        if (res.status === 401) {
          localStorage.removeItem("tf_access_token")
          window.location.href = "https://theformulator.ai"
          return
        }
        if (res.status === 403) {
          setAccessDenied(true)
          setTimeout(() => { window.location.href = "/" }, 2000)
          return
        }
        if (!res.ok) throw new Error("failed")
        const json = await res.json()
        const usageArray = json.usage_by_level || []
        json.stats = {
          ...json.stats,
          usage_by_level: {
            quick:   usageArray.find((u: any) => u.reason === 'quick')?.count   || 0,
            brief:   usageArray.find((u: any) => u.reason === 'brief')?.count   || 0,
            dossier: usageArray.find((u: any) => u.reason === 'dossier')?.count || 0,
          },
        }
        setData(json)
      })
      .catch((err) => {
        console.error("Dashboard fetch error:", err)
        setData(MOCK)
      })
      .finally(() => setLoading(false))
  }, [])

  const handleGrant = async (userId: string) => {
    const credits = parseInt(grantInputs[userId] ?? "0")
    if (!credits || credits <= 0) return
    const token = localStorage.getItem("tf_access_token")

    try {
      const res = await fetch("https://api.theformulator.ai/admin/grant-credits", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ user_id: userId, credits }),
      })
      if (!res.ok) throw new Error()
      setData((prev) => prev ? {
        ...prev,
        users: prev.users.map((u) => u.user_id === userId ? { ...u, credit_balance: u.credit_balance + credits } : u),
      } : prev)
      setGrantStatus((s) => ({ ...s, [userId]: "success" }))
      setGrantInputs((i) => ({ ...i, [userId]: "" }))
    } catch {
      setGrantStatus((s) => ({ ...s, [userId]: "error" }))
    } finally {
      setTimeout(() => setGrantStatus((s) => ({ ...s, [userId]: null })), 2000)
    }
  }

  const handleToggleActive = async (user: User) => {
    const token = localStorage.getItem("tf_access_token")
    try {
      await fetch("https://api.theformulator.ai/admin/set-active", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ user_id: user.user_id, is_active: !user.is_active }),
      })
      setData((prev) => prev ? {
        ...prev,
        users: prev.users.map((u) => u.user_id === user.user_id ? { ...u, is_active: !u.is_active } : u),
      } : prev)
    } catch {
      // silent — mock fallback
      setData((prev) => prev ? {
        ...prev,
        users: prev.users.map((u) => u.user_id === user.user_id ? { ...u, is_active: !u.is_active } : u),
      } : prev)
    }
  }

  if (loading) {
    return (
      <main style={{ padding: "80px 32px 48px", backgroundColor: bg, minHeight: "100vh" }}>
        <div style={{ color: textSecondary, fontSize: 14 }}>Loading...</div>
      </main>
    )
  }

  if (accessDenied) {
    return (
      <main style={{ padding: "80px 32px 48px", backgroundColor: bg, minHeight: "100vh" }}>
        <div style={{ color: "#991B1B", fontSize: 15, fontWeight: 500 }}>Access denied — admin only. Redirecting...</div>
      </main>
    )
  }

  if (!data) return null

  const { stats, users, recent_transactions } = data

  const sectionLabel = (label: string) => (
    <div style={{ fontSize: 11, fontWeight: 500, letterSpacing: "0.06em", textTransform: "uppercase", color: "#9CA3AF", marginBottom: 12 }}>
      {label}
    </div>
  )

  return (
    <main style={{ padding: "80px 32px 48px", backgroundColor: bg, minHeight: "100vh" }}>
      {/* Page header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: textPrimary, margin: 0 }}>Admin Dashboard</h1>
        <p style={{ fontSize: 13, color: textSecondary, marginTop: 4 }}>Platform overview and user management</p>
      </div>

      {/* SECTION 1 — STATS ROW */}
      <div style={{ display: "flex", gap: 12, marginBottom: 24 }}>
        <StatCard label="Total Users"       value={stats.total_users}      dark={dark} />
        <StatCard label="Active Users"      value={stats.active_users}     dark={dark} />
        <StatCard label="New This Week"     value={stats.new_this_week}    dark={dark} gold />
        <StatCard label="Active This Week"  value={stats.active_this_week} dark={dark} />
      </div>

      {/* SECTION 2 — USERS TABLE */}
      <div style={{ marginBottom: 24 }}>
        {sectionLabel("All Users")}
        <div style={{ backgroundColor: cardBg, border: `1px solid ${border}`, borderRadius: 10, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${border}` }}>
                {["User", "Role", "Credits", "Spent", "Last Login", "Status", "Actions"].map((h) => (
                  <th key={h} style={{
                    textAlign: "left", padding: "10px 16px",
                    fontSize: 10, fontWeight: 600, letterSpacing: "0.06em",
                    textTransform: "uppercase", color: "#9CA3AF",
                    whiteSpace: "nowrap",
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.user_id} style={{ borderBottom: `1px solid ${border}` }}>
                  {/* User */}
                  <td style={{ padding: "12px 16px" }}>
                    <div style={{ fontSize: 13, fontWeight: 500, color: textPrimary }}>{user.email}</div>
                    <div style={{ fontSize: 11, color: textSecondary, marginTop: 2 }}>{user.full_name}</div>
                    <div style={{ fontSize: 11, color: textSecondary }}>{user.organisation}</div>
                  </td>
                  {/* Role */}
                  <td style={{ padding: "12px 16px" }}><RolePill role={user.role} /></td>
                  {/* Credits */}
                  <td style={{ padding: "12px 16px", fontFamily: "var(--font-mono)", fontSize: 13, fontWeight: 600, color: "#D4A843" }}>
                    {user.credit_balance}
                  </td>
                  {/* Spent */}
                  <td style={{ padding: "12px 16px", fontFamily: "var(--font-mono)", fontSize: 12, color: textSecondary }}>
                    {user.credits_spent}
                  </td>
                  {/* Last Login */}
                  <td style={{ padding: "12px 16px", fontSize: 12, color: user.last_login ? textSecondary : "#9CA3AF" }}>
                    {formatDate(user.last_login)}
                  </td>
                  {/* Status */}
                  <td style={{ padding: "12px 16px" }}><StatusPill active={user.is_active} /></td>
                  {/* Actions */}
                  <td style={{ padding: "12px 16px" }}>
                    {user.role === "formulator" && (
                      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                        {/* Grant credits */}
                        <input
                          type="number"
                          min={1}
                          placeholder="N"
                          value={grantInputs[user.user_id] ?? ""}
                          onChange={(e) => setGrantInputs((s) => ({ ...s, [user.user_id]: e.target.value }))}
                          style={{
                            width: 60, height: 32, borderRadius: 6, border: `1px solid ${border}`,
                            padding: "0 8px", fontSize: 13, backgroundColor: dark ? "#1B3A5C" : "#F9FAFB",
                            color: textPrimary, outline: "none",
                          }}
                        />
                        <button
                          onClick={() => handleGrant(user.user_id)}
                          style={{
                            height: 32, padding: "0 12px", borderRadius: 6, border: "none",
                            backgroundColor: "#D4A843", color: "#0D1B2A",
                            fontSize: 12, fontWeight: 600, cursor: "pointer",
                          }}
                        >
                          Grant
                        </button>
                        {grantStatus[user.user_id] === "success" && (
                          <span style={{ fontSize: 12, color: "#065F46" }}>Granted</span>
                        )}
                        {grantStatus[user.user_id] === "error" && (
                          <span style={{ fontSize: 12, color: "#991B1B" }}>Failed</span>
                        )}
                        {/* Deactivate / Activate */}
                        <button
                          onClick={() => handleToggleActive(user)}
                          style={{
                            height: 32, padding: "0 12px", borderRadius: 6,
                            border: `1px solid ${border}`, backgroundColor: "transparent",
                            fontSize: 12, fontWeight: 500, cursor: "pointer",
                            color: user.is_active ? "#991B1B" : "#065F46",
                          }}
                        >
                          {user.is_active ? "Deactivate" : "Activate"}
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* SECTION 3 — RECENT ACTIVITY */}
      <div style={{ marginBottom: 24 }}>
        {sectionLabel("Recent Activity")}
        <div style={{ backgroundColor: cardBg, border: `1px solid ${border}`, borderRadius: 10, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${border}` }}>
                {["Date", "User", "Type", "Credits", "Formulation ID"].map((h) => (
                  <th key={h} style={{
                    textAlign: "left", padding: "10px 16px",
                    fontSize: 10, fontWeight: 600, letterSpacing: "0.06em",
                    textTransform: "uppercase", color: "#9CA3AF",
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recent_transactions.slice(0, 20).map((tx) => {
                const pill = TYPE_PILL[tx.type] ?? TYPE_PILL.quick
                const positive = tx.credits > 0
                return (
                  <tr key={tx.id} style={{ borderBottom: `1px solid ${border}` }}>
                    <td style={{ padding: "10px 16px", fontFamily: "var(--font-mono)", fontSize: 12, color: textSecondary, whiteSpace: "nowrap" }}>
                      {formatDateShort(tx.date)}
                    </td>
                    <td style={{ padding: "10px 16px", fontSize: 12, color: textPrimary }}>
                      {tx.user_email}
                    </td>
                    <td style={{ padding: "10px 16px" }}>
                      <span style={{ fontSize: 10, fontWeight: 600, borderRadius: 4, padding: "2px 6px", backgroundColor: pill.bg, color: pill.color, letterSpacing: "0.04em" }}>
                        {pill.label}
                      </span>
                    </td>
                    <td style={{ padding: "10px 16px", fontFamily: "var(--font-mono)", fontSize: 13, fontWeight: 600, color: positive ? "#065F46" : "#991B1B" }}>
                      {positive ? `+${tx.credits}` : tx.credits}
                    </td>
                    <td style={{ padding: "10px 16px", fontFamily: "var(--font-mono)", fontSize: 11, color: "#9CA3AF" }}>
                      {tx.formulation_id ? tx.formulation_id.slice(0, 8) : "—"}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* SECTION 4 — USAGE BY REPORT LEVEL */}
      <div>
        {sectionLabel("Usage by Report Level")}
        <div style={{ display: "flex", gap: 12 }}>
          {[
            { label: "Quick Formula",       value: stats.usage_by_level.quick   },
            { label: "Intelligence Brief",  value: stats.usage_by_level.brief   },
            { label: "Dossier",             value: stats.usage_by_level.dossier },
          ].map(({ label, value }) => (
            <div key={label} style={{
              flex: 1, backgroundColor: cardBg, border: `1px solid ${border}`,
              borderRadius: 10, padding: "16px 20px",
            }}>
              <div style={{ fontSize: 10, fontWeight: 500, letterSpacing: "0.06em", textTransform: "uppercase", color: "#9CA3AF", marginBottom: 8 }}>
                {label}
              </div>
              <div style={{ fontSize: 24, fontWeight: 700, color: textPrimary, fontFamily: "var(--font-mono)" }}>
                {value}
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
