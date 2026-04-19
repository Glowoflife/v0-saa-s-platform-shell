"use client"

import { useState, useEffect } from "react"

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://api.theformulator.ai"

async function fetchCredits(): Promise<number | null> {
  const token = localStorage.getItem("tf_access_token")
  if (!token) return null

  const res = await fetch(`${API_BASE}/api/user/credits`, {
    headers: { Authorization: `Bearer ${token}` },
  })

  if (res.ok) {
    const data = await res.json()
    return data.credits_remaining ?? null
  }

  if (res.status === 401) {
    const refreshToken = localStorage.getItem("tf_refresh_token")
    if (!refreshToken) return null

    const refreshRes = await fetch(`${API_BASE}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: refreshToken }),
    })

    if (!refreshRes.ok) return null

    const refreshData = await refreshRes.json()
    localStorage.setItem("tf_access_token", refreshData.access_token)
    localStorage.setItem("tf_refresh_token", refreshData.refresh_token)

    const retry = await fetch(`${API_BASE}/api/user/credits`, {
      headers: { Authorization: `Bearer ${refreshData.access_token}` },
    })

    if (retry.ok) {
      const data = await retry.json()
      return data.credits_remaining ?? null
    }
  }

  return null
}

export function useCredits(): number | null {
  const [credits, setCredits] = useState<number | null>(null)

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const result = await fetchCredits()
        if (!cancelled) setCredits(result)
      } catch {
        // silently ignore — don't break the UI
      }
    }

    void load()

    const interval = setInterval(() => {
      void load()
    }, 60_000)

    return () => {
      cancelled = true
      clearInterval(interval)
    }
  }, [])

  return credits
}
