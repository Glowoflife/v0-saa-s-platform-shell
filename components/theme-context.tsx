"use client"

import { createContext, useContext, useState } from "react"

interface ThemeContextValue {
  dark: boolean
  toggleDark: () => void
}

const ThemeContext = createContext<ThemeContextValue>({
  dark: false,
  toggleDark: () => {},
})

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [dark, setDark] = useState(false)
  return (
    <ThemeContext.Provider value={{ dark, toggleDark: () => setDark((d) => !d) }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  return useContext(ThemeContext)
}
