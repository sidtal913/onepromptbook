import "server-only"
import type { ArtStyle, Quality } from "./constants"

export type ModelChoice = "fal-flux" | "openai-image"

export type StylePreset = {
  model: ModelChoice
  positive: string // appended to user prompt
  negative?: string // things to avoid
  size: "landscape_4_3" | "square_hd" | "portrait_4_5"
  targetPx: number // longest edge for OpenAI: 1024 or 2048 (if available)
}

export const QUALITY_PARAMS: Record<Quality, { basePx: number; steps: number; upscale: boolean }> = {
  draft: { basePx: 1024, steps: 8, upscale: false },
  standard: { basePx: 1408, steps: 18, upscale: true },
  ultra: { basePx: 1792, steps: 28, upscale: true },
}

export const STYLE_PRESETS: Record<ArtStyle, StylePreset> = {
  "3d-animated": {
    model: "fal-flux",
    positive:
      "3D animated children's illustration, cinematic lighting, subsurface scattering skin, soft DOF, global illumination, high detail, vibrant colors, glossy materials, Pixar/DreamWorks vibe, friendly and joyful, ultra clean render",
    negative: "lowres, blurry, flat shading, harsh outlines, text overlay, watermark, logo, copyrighted characters",
    size: "landscape_4_3",
    targetPx: 1024,
  },
  realistic: {
    model: "fal-flux",
    positive:
      "kid-safe photoreal style, soft cinematic lighting, shallow depth of field, natural colors, high detail, award-winning photography look",
    negative: "nsfw, gore, text, watermark, logo, copyrighted characters, uncanny, extra fingers, distorted anatomy",
    size: "landscape_4_3",
    targetPx: 1024,
  },
  watercolor: {
    model: "fal-flux",
    positive: "children's book watercolor painting, soft edges, textured paper, pastel palette, whimsical, charming",
    size: "portrait_4_5",
    targetPx: 1024,
  },
  manga: {
    model: "fal-flux",
    positive:
      "clean manga linework, expressive faces, screentone shading, dynamic composition, high contrast, kid-safe",
    size: "portrait_4_5",
    targetPx: 1024,
  },
  "line-art": {
    model: "fal-flux",
    positive:
      "coloring book line art, black and white, very thick clean outlines, no shading, no grey, minimal background",
    size: "square_hd",
    targetPx: 1024,
  },
}

export const STYLE_LABELS: Record<ArtStyle, string> = {
  "3d-animated": "3D Animated (Pixar-style)",
  realistic: "Realistic Photography",
  watercolor: "Watercolor Painting",
  manga: "Manga/Anime Style",
  "line-art": "Line Art (Coloring Book)",
}

// helper to merge user prompt with style
export function buildPrompt(userPrompt: string, style: ArtStyle) {
  const p = STYLE_PRESETS[style]
  const base = `${userPrompt.trim()}. ${p.positive}`
  const withNeg = p.negative ? `${base}. NEGATIVE: ${p.negative}` : base
  return { prompt: withNeg, preset: p }
}
