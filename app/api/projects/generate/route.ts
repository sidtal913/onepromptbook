import { type NextRequest, NextResponse } from "next/server"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"
export const maxDuration = 60

export async function POST(req: NextRequest) {
  try {
    console.log("[SERVER] [v0] Starting book generation...")

    let body
    try {
      body = await req.json()
      console.log("[SERVER] [v0] Request body parsed:", Object.keys(body))
    } catch (parseError: any) {
      console.error("[SERVER] [v0] JSON parse error:", parseError.message)
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
    }

    const {
      prompt,
      bookType = "story",
      pages = 10,
      title = "My Book",
      subtitle = "",
      author = "Anonymous",
      style = "3D Pixar-style animation",
      quality = "standard",
    } = body

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 })
    }

    const hasOpenAI = !!process.env.OPENAI_API_KEY
    const hasFAL = !!process.env.FAL_KEY
    console.log("[SERVER] [v0] Environment check - OpenAI:", hasOpenAI, "FAL:", hasFAL)

    if (!hasOpenAI && !hasFAL) {
      return NextResponse.json({ error: "No AI providers configured" }, { status: 500 })
    }

    console.log("[SERVER] [v0] Calling image generation...")
    const fetchUrl = `${req.nextUrl.origin}/api/generate-image`
    const fetchBody = {
      prompt,
      pages: Math.min(pages, 10), // Cap at 10 pages
      provider: hasOpenAI ? "openai" : "fal",
      size: "1024x1024",
      title,
      style,
    }

    console.log("[SERVER] [v0] Fetch URL:", fetchUrl)
    console.log("[SERVER] [v0] Fetch body:", JSON.stringify(fetchBody, null, 2))

    let imageGenResponse
    try {
      imageGenResponse = await fetch(fetchUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(fetchBody),
      })
      console.log("[SERVER] [v0] Fetch response status:", imageGenResponse.status)
      console.log("[SERVER] [v0] Fetch response headers:", Object.fromEntries(imageGenResponse.headers.entries()))
    } catch (fetchError: any) {
      console.error("[SERVER] [v0] Fetch network error:", fetchError.message)
      console.error("[SERVER] [v0] Fetch error stack:", fetchError.stack)
      return NextResponse.json(
        { error: "Network error calling image generation", detail: fetchError.message },
        { status: 500 },
      )
    }

    if (!imageGenResponse.ok) {
      const responseText = await imageGenResponse.text()
      console.error("[SERVER] [v0] Image generation HTTP error - Status:", imageGenResponse.status)
      console.error("[SERVER] [v0] Image generation HTTP error - Response text:", responseText)

      let errorData
      try {
        errorData = JSON.parse(responseText)
      } catch {
        errorData = { rawResponse: responseText }
      }

      return NextResponse.json(
        {
          error: "Image generation failed",
          status: imageGenResponse.status,
          detail: errorData,
        },
        { status: 500 },
      )
    }

    const imageData = await imageGenResponse.json()
    console.log("[SERVER] [v0] Generated", imageData.results?.length, "images")

    const bookPages =
      imageData.results?.map((result: any, index: number) => ({
        id: index + 1,
        content: result.text || `Page ${index + 1} content`,
        text: result.text || `Page ${index + 1} content`, // Added text property for preview component
        image: result.url, // Changed from imageUrl to image to match preview component expectations
      })) || []

    const response = {
      id: `book-${Date.now()}`,
      title,
      subtitle,
      author,
      bookType,
      pages: bookPages,
      metadata: {
        prompt,
        style,
        quality,
        generatedAt: new Date().toISOString(),
        provider: imageData.provider,
        generationTime: imageData.tookMs,
      },
    }

    console.log("[SERVER] [v0] Book generation completed successfully")
    return NextResponse.json(response)
  } catch (error: any) {
    console.error("[SERVER] [v0] Generation error:", error.message)
    console.error("[SERVER] [v0] Error stack:", error.stack)
    return NextResponse.json(
      {
        error: "Book generation failed",
        message: error.message,
        stack: error.stack,
      },
      { status: 500 },
    )
  }
}
