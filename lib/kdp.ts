// KDP utility functions for sizing, margins, and spine calculations
export interface KDPSize {
  width: number
  height: number
  name: string
}

export interface KDPMargins {
  top: number
  bottom: number
  outer: number
  inner: number
}

export const KDP_SIZES: Record<string, KDPSize> = {
  "8.5x11": { width: 8.5, height: 11, name: "8.5×11 inches" },
  "8x10": { width: 8, height: 10, name: "8×10 inches" },
  "6x9": { width: 6, height: 9, name: "6×9 inches" },
}

export function getKdpSize(sizeKey: string): KDPSize {
  return KDP_SIZES[sizeKey] || KDP_SIZES["8.5x11"]
}

export function getMargins(sizeKey: string, pageCount: number): KDPMargins {
  const baseMargins = {
    top: 0.25,
    bottom: 0.25,
    outer: 0.25,
    inner: 0.375, // Base gutter margin
  }

  // Increase inner margin for thicker books
  if (pageCount > 100) {
    baseMargins.inner = 0.5
  } else if (pageCount > 50) {
    baseMargins.inner = 0.4375
  }

  return baseMargins
}

export function spineWidthInches(pageCount: number, paper: "WHITE" | "CREAM"): number {
  const THICKNESS = paper === "CREAM" ? 0.0025 : 0.0023
  return +(pageCount * THICKNESS).toFixed(4)
}

export function validatePageCount(count: number): boolean {
  return count >= 24 && count <= 828 && count % 2 === 0
}

export interface KDPSpec {
  projectId: string
  theme: string
  ageRange: "2-4" | "5-7" | "8-12"
  kdpSize: string
  pageCount: number
  paper: "WHITE" | "CREAM"
  mode: "COLORING" | "ACTIVITY" | "STORYBOOK"
  language: "EN" | "FR"
  pages: Array<{
    index: number
    kind: "COVER" | "COLORING" | "MAZE" | "WORDSEARCH" | "TRACING" | "RIDDLE" | "MATH" | "STORY" | "INFO"
    title?: string
    difficulty?: "easy" | "medium" | "hard"
    prompt?: string
    words?: string[]
    letters?: string[]
    objectives?: string[]
    constraints?: string[]
  }>
}
