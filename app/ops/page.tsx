"use client"

import { useState, useEffect } from "react"
import { ClipboardCopy, Check } from "lucide-react"
import { useTheme } from "@/components/theme-context"
import { apiFetch } from "@/lib/api-client"

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface User {
  id: string
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
    { id: "u001", email: "jeevan@theformulator.ai", full_name: "Jeevan R", organisation: "theformulator.ai", role: "admin", credit_balance: 9999, credits_spent: 0, last_login: "2026-04-03T08:12:00Z", is_active: true },
    { id: "u002", email: "sarah@beautylab.co.uk", full_name: "Sarah Chen", organisation: "Beauty Lab UK", role: "formulator", credit_balance: 27, credits_spent: 13, last_login: "2026-04-02T14:30:00Z", is_active: true },
    { id: "u003", email: "marco@rossicosmetics.it", full_name: "Marco Rossi", organisation: "Rossi Cosmetics", role: "formulator", credit_balance: 4, credits_spent: 36, last_login: "2026-03-28T09:00:00Z", is_active: true },
    { id: "u004", email: "priya@dermaindia.com", full_name: "Priya Nair", organisation: "Derma India", role: "formulator", credit_balance: 0, credits_spent: 20, last_login: "2026-03-15T11:45:00Z", is_active: false },
    { id: "u005", email: "lena@nordicskin.se", full_name: "Lena Johansson", organisation: "Nordic Skin", role: "formulator", credit_balance: 15, credits_spent: 5, last_login: null, is_active: true },
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

// FastAPI returns ISO strings without a timezone suffix (e.g. "2026-04-03T14:22:00.000000").
// new Date() on a tz-less string is implementation-defined and produces "Invalid Date" in
// some environments. Appending Z normalises to UTC consistently.
function parseDate(iso: string): Date {
  if (!iso.endsWith("Z") && !/[+-]\d{2}:\d{2}$/.test(iso)) {
    return new Date(iso + "Z")
  }
  return new Date(iso)
}

function formatDate(iso: string | null) {
  if (!iso) return "Never"
  return parseDate(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
}

function formatDateShort(iso: string) {
  return parseDate(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
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
  const [grantErrors, setGrantErrors] = useState<Record<string, string>>({})
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const bg = dark ? "#060F1A" : "#F4F6F9"
  const cardBg = dark ? "#0D1B2A" : "#FFFFFF"
  const border = dark ? "#1B3A5C" : "#E5E7EB"
  const textPrimary = dark ? "#F9FAFB" : "#0D1B2A"
  const textSecondary = dark ? "#9CA3AF" : "#6B7280"

  // ⚠️ TEMPORARY: localStorage persistence for mock mode only.
  // Remove this entire useEffect when the real API (api.theformulator.ai) is fully wired.
  // The fallback chain is: live API → localStorage → MOCK constant.
  // Once the API is live, this block becomes dead code.
  useEffect(() => {
    if (data) {
      localStorage.setItem("tf_ops_dashboard_state", JSON.stringify(data))
    }
  }, [data])

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("tf_access_token") : null
    if (!token) {
      window.location.href = "https://theformulator.ai"
      return
    }

    apiFetch("https://api.theformulator.ai/admin/dashboard")
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
        json.recent_transactions = (json.recent_transactions || []).map((t: any) => ({
          id: t.id,
          date: t.created_at,
          user_email: t.email,
          type: t.reason,
          credits: t.delta,
          formulation_id: t.formulation_id,
        }))
        setData(json)
      })
      .catch((err) => {
        console.error("Dashboard fetch error:", err)
        const saved = localStorage.getItem("tf_ops_dashboard_state")
        setData(saved ? JSON.parse(saved) : MOCK)
      })
      .finally(() => setLoading(false))
  }, [])

  const handleGrant = async (userId: string, rawCredits: string) => {
    const credits = parseInt(rawCredits ?? "", 10)
    if (isNaN(credits) || credits <= 0) {
      setGrantErrors((e) => ({ ...e, [userId]: "Enter a valid credit amount" }))
      setGrantStatus((s) => ({ ...s, [userId]: "error" }))
      setTimeout(() => setGrantStatus((s) => ({ ...s, [userId]: null })), 2000)
      return
    }
    const token = localStorage.getItem("tf_access_token")
    const targetUser = data?.users.find((u: User) => u.id === userId)

    try {
      const res = await apiFetch("https://api.theformulator.ai/admin/grant-credits", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ user_id: userId, credits }),
      })
      if (!res.ok) {
        let detail = "Grant failed"
        try {
          const body = await res.json()
          if (body?.detail) detail = body.detail
        } catch {}
        setGrantErrors((e) => ({ ...e, [userId]: detail }))
        setGrantStatus((s) => ({ ...s, [userId]: "error" }))
        setTimeout(() => setGrantStatus((s) => ({ ...s, [userId]: null })), 3000)
        return
      }
      const newTx: Transaction = {
        id: `t${Date.now()}`,
        date: new Date().toISOString(),
        user_email: targetUser?.email ?? "",
        type: "admin_grant",
        credits,
      }
      setData((prev) => prev ? {
        ...prev,
        users: prev.users.map((u) => u.id === userId ? { ...u, credit_balance: u.credit_balance + credits } : u),
        recent_transactions: [newTx, ...prev.recent_transactions],
      } : prev)
      setGrantStatus((s) => ({ ...s, [userId]: "success" }))
      setGrantInputs((i) => ({ ...i, [userId]: "" }))
      setTimeout(() => setGrantStatus((s) => ({ ...s, [userId]: null })), 2000)
    } catch (err: any) {
      setGrantErrors((e) => ({ ...e, [userId]: err?.message ?? "Network error" }))
      setGrantStatus((s) => ({ ...s, [userId]: "error" }))
      setTimeout(() => setGrantStatus((s) => ({ ...s, [userId]: null })), 3000)
    }
  }

  const handleToggleActive = async (user: User) => {
    const token = localStorage.getItem("tf_access_token")
    const newIsActive = !user.is_active

    const applyToggle = () => {
      setData((prev) => prev ? {
        ...prev,
        stats: {
          ...prev.stats,
          active_users: prev.stats.active_users + (newIsActive ? 1 : -1),
        },
        users: prev.users.map((u) => u.id === user.id ? { ...u, is_active: newIsActive } : u),
      } : prev)
    }

    try {
      const res = await fetch("https://api.theformulator.ai/admin/set-active", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ user_id: user.id, is_active: newIsActive }),
      })
      if (!res.ok) throw new Error()
      applyToggle()
    } catch {
      // API not live — apply locally
      applyToggle()
    }
  }

  const handleDeleteUser = async (user: User) => {
    if (!confirm(`Permanently delete ${user.email}? This cannot be undone.`)) return
    const token = localStorage.getItem("tf_access_token")
    try {
      const res = await apiFetch("https://api.theformulator.ai/admin/delete-user", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ user_id: user.id }),
      })
      if (res.status === 404) {
        alert("Delete endpoint not yet implemented")
        return
      }
      if (!res.ok) {
        let detail = "Delete failed"
        try {
          const body = await res.json()
          if (body?.detail) detail = body.detail
        } catch {}
        alert(detail)
        return
      }
      setData((prev) => prev ? {
        ...prev,
        users: prev.users.filter((u) => u.id !== user.id),
        stats: {
          ...prev.stats,
          total_users: prev.stats.total_users - 1,
          active_users: prev.stats.active_users - (user.is_active ? 1 : 0),
        },
      } : prev)
    } catch (err: any) {
      alert(err?.message ?? "Network error")
    }
  }

  if (loading) {
    return (
      <div>
        <div style={{ color: textSecondary, fontSize: 14 }}>Loading...</div>
      </div>
    )
  }

  if (accessDenied) {
    return (
      <div>
        <div style={{ color: "#991B1B", fontSize: 15, fontWeight: 500 }}>Access denied — admin only. Redirecting...</div>
      </div>
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
    <div>
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
                <tr key={user.id} style={{ borderBottom: `1px solid ${border}` }}>
                  {/* User */}
                  <td style={{ padding: "12px 16px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                      <span style={{ fontSize: 13, fontWeight: 500, color: textPrimary }}>{user.email}</span>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(user.email)
                          setCopiedId(user.id)
                          setTimeout(() => setCopiedId(null), 1500)
                        }}
                        title="Copy email"
                        style={{
                          display: "flex", alignItems: "center", justifyContent: "center",
                          width: 22, height: 22, padding: 0, border: "none", borderRadius: 4,
                          backgroundColor: "transparent", cursor: "pointer",
                          color: copiedId === user.id ? "#065F46" : "#9CA3AF",
                          flexShrink: 0,
                        }}
                      >
                        {copiedId === user.id
                          ? <Check size={12} />
                          : <ClipboardCopy size={12} />
                        }
                      </button>
                    </div>
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
                          placeholder="10"
                          value={grantInputs[user.id] ?? ""}
                          onChange={(e) => setGrantInputs((s) => ({ ...s, [user.id]: e.target.value }))}
                          style={{
                            width: 60, height: 32, borderRadius: 6, border: `1px solid ${border}`,
                            padding: "0 8px", fontSize: 13, backgroundColor: dark ? "#1B3A5C" : "#F9FAFB",
                            color: textPrimary, outline: "none",
                          }}
                        />
                        <button
                          onClick={() => handleGrant(user.id, grantInputs[user.id])}
                          style={{
                            height: 32, padding: "0 12px", borderRadius: 6, border: "none",
                            backgroundColor: "#D4A843", color: "#0D1B2A",
                            fontSize: 12, fontWeight: 600, cursor: "pointer",
                          }}
                        >
                          Grant
                        </button>
                        {grantStatus[user.id] === "success" && (
                          <span style={{ fontSize: 12, color: "#065F46" }}>Granted</span>
                        )}
                        {grantStatus[user.id] === "error" && (
                          <span style={{ fontSize: 12, color: "#991B1B" }}>{grantErrors[user.id] ?? "Failed"}</span>
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
                        {/* Delete */}
                        <button
                          onClick={() => handleDeleteUser(user)}
                          style={{
                            height: 32, padding: "0 12px", borderRadius: 6, border: "none",
                            backgroundColor: "#B91C1C", color: "#FFFFFF",
                            fontSize: 12, fontWeight: 600, cursor: "pointer",
                          }}
                        >
                          Delete
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
    </div>
  )
}
