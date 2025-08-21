import { type NextRequest, NextResponse } from "next/server"
import { classifyAndGenerateSpec } from "@/lib/genre-classifier"

export const runtime = "nodejs"
export const maxDuration = 60

export async function POST(request: NextRequest) {
  try {
    const { prompt, title, subtitle, style } = await request.json()

    console.log("[v0] Generating professional book cover...")

    // Step 1: Classify genre and generate cover specification
    const coverSpec = await classifyAndGenerateSpec(prompt, title, subtitle)
    console.log("[v0] Cover spec generated:", coverSpec.genre)

    // Step 2: Generate cover image with enhanced prompt
    const enhancedPrompt = `Professional book cover design: ${coverSpec.imagePrompt}. 
    Style: ${coverSpec.style}. 
    Color scheme: ${coverSpec.colorScheme}. 
    High quality, commercial book cover, professional typography space, 
    ${coverSpec.genre.toLowerCase()} genre, suitable for print and digital.`

    console.log("[v0] Generating cover image...")

    const imageResponse = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "dall-e-3",
        prompt: enhancedPrompt,
        size: "1024x1024",
        quality: "hd",
        style: "vivid",
        n: 1,
      }),
    })

    if (!imageResponse.ok) {
      throw new Error(`Image generation failed: ${imageResponse.statusText}`)
    }

    const imageData = await imageResponse.json()
    const imageUrl = imageData.data[0].url

    console.log("[v0] Cover generated successfully")

    return NextResponse.json({
      success: true,
      coverSpec,
      imageUrl,
      enhancedPrompt,
    })
  } catch (error) {
    console.error("[v0] Cover generation error:", error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}
