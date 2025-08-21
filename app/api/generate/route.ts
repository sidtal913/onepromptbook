import { type NextRequest, NextResponse } from "next/server"
import { generateBookPlan, sanitizePrompt, type BookSpec } from "@/lib/kdp-generator"
import { checkAndIncrementQuota } from "@/lib/quota-manager"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as BookSpec & { projectId?: string }

    // Get user/org info (simplified for demo)
    const orgId = "demo-org"
    const plan = "FREE" // Would come from database

    // Check quota
    const quotaCheck = await checkAndIncrementQuota(orgId, "pages", body.pages, plan)
    if (!quotaCheck.allowed) {
      return NextResponse.json(
        { error: "Quota exceeded", used: quotaCheck.used, limit: quotaCheck.limit },
        { status: 402 },
      )
    }

    // Sanitize prompt
    const sanitizedPrompt = await sanitizePrompt(body.prompt)

    // Generate book plan
    const plan_data = await generateBookPlan({
      ...body,
      prompt: sanitizedPrompt,
    })

    // Create job record
    const jobId = `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    // Store job in database (simplified)
    await sql`
      INSERT INTO generation_jobs (id, org_id, spec, plan, status, created_at)
      VALUES (${jobId}, ${orgId}, ${JSON.stringify(body)}, ${JSON.stringify(plan_data)}, 'RUNNING', NOW())
    `

    // Start background processing (would use Inngest or similar)
    processBookGeneration(jobId, plan_data).catch(console.error)

    return NextResponse.json({ jobId, status: "RUNNING" })
  } catch (error) {
    console.error("Generation error:", error)
    return NextResponse.json(
      { error: "Generation failed", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}

async function processBookGeneration(jobId: string, plan: any) {
  // Background job processing would happen here
  // For demo, just update status after delay
  setTimeout(async () => {
    await sql`
      UPDATE generation_jobs 
      SET status = 'COMPLETED', completed_at = NOW()
      WHERE id = ${jobId}
    `
  }, 5000)
}
