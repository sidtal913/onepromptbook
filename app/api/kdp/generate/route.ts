import { type NextRequest, NextResponse } from "next/server"
import { nanoid } from "nanoid"
import type { KDPSpec } from "@/lib/kdp"
import { JobQueue } from "@/lib/job-queue"

const jobQueue = new JobQueue()

export async function POST(req: NextRequest) {
  try {
    const formData = await req.json()

    // Validate input
    if (!formData.theme?.trim() || !formData.ipAgreement) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 })
    }

    const jobId = nanoid()
    const spec: KDPSpec = {
      projectId: jobId,
      theme: formData.theme,
      ageRange: formData.ageRange,
      kdpSize: formData.kdpSize,
      pageCount: formData.pageCount,
      paper: formData.paper,
      mode: formData.mode,
      language: formData.language,
      pages: [], // Will be populated by planner
    }

    await jobQueue.createJob(jobId, {
      type: "kdp-generation",
      spec,
      priority: "normal",
      maxRetries: 3,
    })

    return NextResponse.json({ id: jobId, status: "pending", progress: 0 })
  } catch (error) {
    console.error("Generation error:", error)
    return NextResponse.json({ error: "Generation failed" }, { status: 500 })
  }
}

async function processJob(jobId: string) {
  const job = await jobQueue.getJob(jobId)
  if (!job) return

  try {
    // Update status
    job.status = "processing"
    job.progress = 10

    // Step 1: Sanitize prompt
    job.progress = 20
    const sanitizedTheme = await sanitizePrompt(job.spec.theme)

    // Step 2: Generate plan
    job.progress = 40
    const plan = await generatePlan(sanitizedTheme, job.spec)
    job.spec.pages = plan.pages

    // Step 3: Generate assets
    job.progress = 60
    await generateAssets(job.spec)

    // Step 4: Compile PDFs
    job.progress = 80
    const files = await compilePDFs(job.spec)

    // Complete
    job.status = "completed"
    job.progress = 100
    job.result = { files }
    await jobQueue.updateJob(jobId, job)
  } catch (error) {
    console.error("Job processing error:", error)
    job.status = "failed"
    job.error = error.message
    await jobQueue.updateJob(jobId, job)
  }
}

async function sanitizePrompt(theme: string): Promise<string> {
  // Use GPT-4o-mini to sanitize prompt
  // For now, return as-is (implement with AI SDK)
  return theme
}

async function generatePlan(theme: string, spec: KDPSpec): Promise<{ pages: any[] }> {
  // Use GPT-4o to generate page plan
  // For now, return mock plan
  const pages = []

  // Add cover
  pages.push({
    index: 0,
    kind: "COVER",
    title: theme,
    prompt: `Cover design for ${theme}`,
  })

  // Add content pages based on mode
  for (let i = 1; i < spec.pageCount; i++) {
    if (spec.mode === "COLORING") {
      pages.push({
        index: i,
        kind: "COLORING",
        prompt: `Coloring page: ${theme} scene ${i}`,
        constraints: ["thick outlines", "no shading", "simple shapes"],
      })
    }
    // Add other modes...
  }

  return { pages }
}

async function generateAssets(spec: KDPSpec): Promise<void> {
  // Generate text content and images
  // Implement with AI SDK
}

async function compilePDFs(spec: KDPSpec): Promise<any> {
  // Compile PDFs using React-PDF
  // For now, return mock URLs
  return {
    interior: `/api/kdp/download/${spec.projectId}/interior.pdf`,
    coverFront: `/api/kdp/download/${spec.projectId}/cover_front.pdf`,
    coverWrap: `/api/kdp/download/${spec.projectId}/cover_wrap.pdf`,
    zip: `/api/kdp/download/${spec.projectId}/bundle.zip`,
  }
}

// Get job status
export async function GET(req: NextRequest) {
  const url = new URL(req.url)
  const jobId = url.searchParams.get("id")

  if (!jobId) {
    return NextResponse.json({ error: "Job ID required" }, { status: 400 })
  }

  const job = await jobQueue.getJob(jobId)
  if (!job) {
    return NextResponse.json({ error: "Job not found" }, { status: 404 })
  }

  return NextResponse.json({
    id: job.id,
    status: job.status,
    progress: job.progress,
    files: job.result?.files,
    error: job.error,
  })
}
