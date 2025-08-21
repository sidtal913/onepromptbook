import { NextResponse } from "next/server"
export const runtime = "nodejs"
export const maxDuration = 60

const OPENAI_API_KEY = process.env.OPENAI_API_KEY || ""
const FAL_KEY = process.env.FAL_KEY || ""

function j(status: number, body: any) {
  return NextResponse.json(body, { status })
}

function serializeError(err: any) {
  return {
    name: err?.name,
    message: err?.message || String(err),
    status: err?.status || err?.response?.status,
    data: err?.response?.data,
    headers: err?.response?.headers,
    requestId: err?.response?.headers?.["x-request-id"] || err?.response?.headers?.["openai-organization-request-id"],
    stack: err?.stack,
  }
}

async function generateWithOpenAI(prompt: string, size: "256x256" | "512x512" | "1024x1024") {
  const response = await fetch("https://api.openai.com/v1/images/generations", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "dall-e-3",
      prompt,
      size,
      response_format: "b64_json",
    }),
  })

  if (!response.ok) {
    const text = await response.text().catch(() => "")
    throw new Error(`OpenAI REST failed: ${response.status} ${text}`)
  }

  const json = await response.json()
  const b64 = json?.data?.[0]?.b64_json
  if (!b64) throw new Error("OpenAI REST returned no image data")
  return `data:image/png;base64,${b64}`
}

async function generateWithFal(prompt: string, size: "256x256" | "512x512" | "1024x1024") {
  const { fal } = await import("@fal-ai/serverless-client")
  if (!FAL_KEY) throw new Error("FAL_KEY missing")
  fal.config({ credentials: FAL_KEY })

  // Map standard sizes to FAL format
  const falSize = size === "1024x1024" ? "square_hd" : "square"

  const out: any = await fal.run("fal-ai/flux/dev", {
    input: {
      prompt,
      image_size: falSize,
      num_inference_steps: 28,
      guidance_scale: 3.5,
    },
  })
  const url = out?.images?.[0]?.url
  if (!url) throw new Error("FAL returned no image url")
  return url
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    runtime,
    hasOPENAI: !!OPENAI_API_KEY,
    hasFAL: !!FAL_KEY,
    timestamp: new Date().toISOString(),
  })
}

export async function POST(req: Request) {
  const t0 = Date.now()
  try {
    const body = await req.json().catch(() => ({}))
    const {
      prompt,
      pages = 1,
      provider = OPENAI_API_KEY ? "openai" : "fal",
      size = "1024x1024" as "256x256" | "512x512" | "1024x1024",
      title = "untitled",
      style = "3D Pixar-style animation",
      bookType = "story",
    } = body

    if (!prompt) return j(400, { ok: false, error: "Missing 'prompt'" })
    if (provider === "openai" && !OPENAI_API_KEY) return j(500, { ok: false, error: "OPENAI_API_KEY missing" })
    if (provider === "fal" && !FAL_KEY) return j(500, { ok: false, error: "FAL_KEY missing" })

    console.log(`[v0] Provider=${provider} Size=${size} Pages=${pages}`)

    const storyPages = []
    for (let i = 1; i <= pages; i++) {
      let pageContent = ""
      if (bookType === "story") {
        pageContent = `Page ${i}: ${prompt}. This is part ${i} of ${pages} of an engaging children's story.`
      } else if (bookType === "coloring") {
        pageContent = `Coloring page ${i}: Simple line art of ${prompt}. Clean outlines perfect for coloring.`
      } else {
        pageContent = `Activity page ${i}: Fun ${prompt} activity for children to enjoy and learn.`
      }
      storyPages.push(pageContent)
    }

    const results: { page: number; url: string; text: string; error?: any }[] = []
    const errors: { page: number; error: any }[] = []

    for (let i = 1; i <= pages; i++) {
      const storyText = storyPages[i - 1]

      let pagePrompt = ""
      if (bookType === "story") {
        pagePrompt = `${style} illustration: ${storyText}. Professional children's book illustration with vibrant colors, engaging characters, and clear storytelling elements. Include space for text overlay.`
      } else if (bookType === "coloring") {
        pagePrompt = `Black and white line art: ${prompt}. Simple, clean outlines perfect for coloring books. Bold lines, no shading, child-friendly design.`
      } else {
        pagePrompt = `${style} illustration: ${storyText}. Educational activity book illustration with clear, engaging visuals suitable for children.`
      }

      console.log(`[v0] Generating image ${i}: ${pagePrompt.substring(0, 100)}...`)

      try {
        let imageUrl: string
        if (provider === "openai") {
          imageUrl = await generateWithOpenAI(pagePrompt, size)
        } else {
          imageUrl = await generateWithFal(pagePrompt, size)
        }

        results.push({
          page: i,
          url: imageUrl,
          text: storyText,
        })

        console.log(`[v0] Generated image ${i} successfully`)
      } catch (e: any) {
        const detail = serializeError(e)
        console.error(`[v0] Image generation failed for page ${i}:`, detail)

        errors.push({ page: i, error: detail })

        results.push({
          page: i,
          url: "",
          text: storyText,
          error: detail,
        })
      }
    }

    console.log(
      `[v0] Generated ${results.filter((r) => r.url).length}/${pages} images successfully in ${Date.now() - t0}ms`,
    )

    return j(200, {
      ok: true,
      provider,
      pages: results.length,
      results,
      errors: errors.length > 0 ? errors : undefined,
      successCount: results.filter((r) => r.url).length,
      failureCount: errors.length,
      tookMs: Date.now() - t0,
    })
  } catch (e: any) {
    const detail = serializeError(e)
    console.error("[v0] Route error", detail)
    return j(500, { ok: false, error: "Server error in generate-image", detail, tookMs: Date.now() - t0 })
  }
}
