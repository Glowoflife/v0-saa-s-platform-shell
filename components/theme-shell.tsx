"use client"

import { useTheme } from "@/components/theme-context"
import { Sidebar } from "@/components/sidebar"
import { Topbar } from "@/components/topbar"

export function ThemeShell({ children }: { children: React.ReactNode }) {
  const { dark } = useTheme()

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        minWidth: 1280,
        overflow: "hidden",
        backgroundColor: dark ? "#0A1628" : "#F4F6F9",
      }}
    >
      <Sidebar />
      <Topbar />
      <main
        style={{
          flex: 1,
          backgroundColor: dark ? "#0A1628" : "#F4F6F9",
          padding: 24,
          paddingTop: 56 + 24,
          overflowY: "auto",
          marginLeft: 240,
        }}
      >
        {children}
      </main>
    </div>
  )
}
