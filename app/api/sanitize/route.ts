import { type NextRequest, NextResponse } from "next/server"
import { sanitizePrompt } from "@/lib/openai"

export async function POST(req: NextRequest) {
  try {
    const { prompt } = await req.json()

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 })
    }

    const sanitizedPrompt = await sanitizePrompt(prompt)

    return NextResponse.json({ prompt: sanitizedPrompt })
  } catch (error) {
    console.error("Error sanitizing prompt:", error)
    return NextResponse.json({ error: "Failed to sanitize prompt" }, { status: 500 })
  }
}
