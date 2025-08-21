import { type NextRequest, NextResponse } from "next/server"
import { generateBookPlan } from "@/lib/openai"

export async function POST(req: NextRequest) {
  try {
    const spec = await req.json()

    // Validate required fields
    const requiredFields = ["trim", "ageRange", "pages", "mode", "theme"]
    for (const field of requiredFields) {
      if (!spec[field]) {
        return NextResponse.json({ error: `${field} is required` }, { status: 400 })
      }
    }

    const plan = await generateBookPlan(spec)

    return NextResponse.json(plan)
  } catch (error) {
    console.error("Error generating book plan:", error)
    return NextResponse.json({ error: "Failed to generate book plan" }, { status: 500 })
  }
}
