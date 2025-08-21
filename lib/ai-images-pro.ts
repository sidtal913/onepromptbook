import "server-only"
import { QUALITY_PARAMS, STYLE_PRESETS, type ArtStyle, type Quality } from "./image-styles"

function normalizePrompt(user: string, style: ArtStyle) {
  const s = STYLE_PRESETS[style]
  // Replace brand terms for safety
  const safe = user.replace(/(pokemon|roblox|paw patrol|brawl stars)/gi, "original characters")
  return {
    positive: `${safe}. ${s.positive}`,
    negative: s.negative,
    aspect: s.aspect,
  }
}

// FAL / FLUX-dev (high quality)
async function tryFalFluxDev(
  positive: string,
  negative: string,
  px: number,
  steps: number,
  aspect: "square" | "portrait" | "landscape",
) {
  if (!process.env.FAL_KEY) return null
  try {
    const fal = await import("@fal-ai/serverless-client")
    fal.config({ credentials: process.env.FAL_KEY })

    const image_size = aspect === "square" ? "square_hd" : aspect === "portrait" ? "portrait_4_5" : "landscape_4_3"

    const result: any = await fal.subscribe("fal-ai/flux/dev", {
      input: {
        prompt: `${positive} NEGATIVE: ${negative}`,
        image_size,
        guidance_scale: 3.5,
        num_inference_steps: steps,
        safety_tolerance: 2,
      },
    })

    return result?.images?.[0]?.url || null
  } catch (error) {
    console.error("[v0] FAL FLUX-dev error:", error)
    return null
  }
}

// OpenAI Images (reliable fallback)
async function tryOpenAI(positive: string, px: number) {
  if (!process.env.OPENAI_API_KEY) return null
  try {
    const { default: OpenAI } = await import("openai")
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! })
    const size = px >= 2048 ? "1024x1024" : "1024x1024" // OpenAI only supports 1024x1024 for DALL-E 3

    const res = await client.images.generate({
      model: "dall-e-3",
      prompt: positive,
      size,
      quality: px >= 1536 ? "hd" : "standard",
      style: "vivid",
    })

    return res.data[0]?.url || null
  } catch (error) {
    console.error("[v0] OpenAI Images error:", error)
    return null
  }
}

// FAL Upscaler (2x)
async function tryUpscale(url: string) {
  if (!process.env.FAL_KEY) return url
  try {
    const fal = await import("@fal-ai/serverless-client")
    fal.config({ credentials: process.env.FAL_KEY })

    const result: any = await fal.subscribe("fal-ai/esrgan", {
      input: { image_url: url, scale: 2 },
    })

    return result?.image?.url || url
  } catch (error) {
    console.error("[v0] Upscale error:", error)
    return url
  }
}

// Main entry point
export async function generateStyledImagePro(userPrompt: string, style: ArtStyle, quality: Quality = "standard") {
  const { positive, negative, aspect } = normalizePrompt(userPrompt, style)
  const { basePx, steps, upscale } = QUALITY_PARAMS[quality]

  console.log(`[v0] Generating image with style: ${style}, quality: ${quality}`)

  // Try FAL FLUX-dev first, then OpenAI as fallback
  let url: string | null = null

  url = await tryFalFluxDev(positive, negative, basePx, steps, aspect)
  if (!url) {
    url = await tryOpenAI(positive, basePx)
  }

  if (!url) {
    // Last resort placeholder
    return `/placeholder.svg?height=${basePx}&width=${basePx}&text=${encodeURIComponent("image unavailable")}`
  }

  // Optional upscale for standard/ultra quality
  if (upscale) {
    try {
      url = await tryUpscale(url)
    } catch (error) {
      console.error("[v0] Upscale failed:", error)
    }
  }

  return url
}
