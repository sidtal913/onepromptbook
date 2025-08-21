export type ArtStyle = "3d-animated" | "realistic" | "watercolor" | "manga" | "line-art"
export type Quality = "draft" | "standard" | "ultra"

export const STYLE_MULTIPLIER: Record<ArtStyle, number> = {
  "3d-animated": 1.6, // priciest (complex renders)
  realistic: 1.5,
  watercolor: 1.2,
  manga: 1.2,
  "line-art": 1.0, // cheapest (good default for trials)
}

export const QUALITY_MULTIPLIER: Record<Quality, number> = {
  draft: 0.7,
  standard: 1.0,
  ultra: 1.35, // upscale/extra steps
}

// Base model costs in "credits" (abstract unit you sell)
export const BASE = {
  textPlanPerPageTokensIn: 1200, // planning/outline/input
  textPlanPerPageTokensOut: 800, // structured output
  imagePerGenCredits: 5, // one image gen at Standard style/quality
  tokenPer1kCredits: 0.05, // LLM text cost → credits
}

// Helper to convert tokens → credits
export function tokensToCredits(tokens: number) {
  return (tokens / 1000) * BASE.tokenPer1kCredits
}

export function estimateCredits({
  pages,
  style,
  quality,
  includeCovers = true,
}: {
  pages: number
  style: ArtStyle
  quality: Quality
  includeCovers?: boolean
}) {
  const sMul = STYLE_MULTIPLIER[style]
  const qMul = QUALITY_MULTIPLIER[quality]

  const images = pages + (includeCovers ? 2 : 0)
  const imageCredits = images * BASE.imagePerGenCredits * sMul * qMul

  const textIn = tokensToCredits(BASE.textPlanPerPageTokensIn * pages)
  const textOut = tokensToCredits(BASE.textPlanPerPageTokensOut * pages)

  const subtotal = imageCredits + textIn + textOut

  return {
    images,
    textInCredits: textIn,
    textOutCredits: textOut,
    imageCredits,
    totalCredits: Number(subtotal.toFixed(2)),
    breakdown: { pages, style, quality, includeCovers },
  }
}
