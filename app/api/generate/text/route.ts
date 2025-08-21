import { NextResponse } from "next/server"
import { generateRiddles, generateCaption, generateWordList } from "@/lib/ai"

export async function POST(request: Request) {
  try {
    const { type, theme, subject, count } = await request.json()

    let result

    switch (type) {
      case "riddles":
        result = await generateRiddles(theme, count || 8)
        break
      case "caption":
        result = await generateCaption(subject)
        break
      case "wordlist":
        result = await generateWordList(theme, count || 8)
        break
      default:
        return NextResponse.json({ success: false, error: "Invalid type" }, { status: 400 })
    }

    return NextResponse.json({ success: true, content: result })
  } catch (error) {
    console.error("Text generation error:", error)
    return NextResponse.json({ success: false, error: "Generation failed" }, { status: 500 })
  }
}
