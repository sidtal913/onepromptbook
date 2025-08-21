"use client"

import type React from "react"
import { ThemeProvider } from "next-themes"
import { AuthProvider } from "@/lib/simple-auth"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
        {children}
      </ThemeProvider>
    </AuthProvider>
  )
}
