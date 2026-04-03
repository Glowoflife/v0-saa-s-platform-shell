"use client"
import { useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Suspense } from "react"

function CallbackHandler() {
  const searchParams = useSearchParams()
  const router = useRouter()

  useEffect(() => {
    const access_token = searchParams.get('access_token')
    const refresh_token = searchParams.get('refresh_token')

    if (access_token && refresh_token) {
      localStorage.setItem('tf_access_token', access_token)
      localStorage.setItem('tf_refresh_token', refresh_token)
      router.replace('/morning-brief')
    } else {
      window.location.href = 'https://theformulator.ai'
    }
  }, [])

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      background: '#F4F6F9',
      color: '#6B7280',
      fontSize: 14,
      fontFamily: 'Inter, sans-serif'
    }}>
      Signing you in...
    </div>
  )
}

export default function AuthCallback() {
  return (
    <Suspense fallback={<div>Signing you in...</div>}>
      <CallbackHandler />
    </Suspense>
  )
}