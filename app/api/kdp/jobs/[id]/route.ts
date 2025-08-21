import { type NextRequest, NextResponse } from "next/server"

// Mock job storage (use Redis in production)
const jobs = new Map<string, any>()

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const jobId = params.id

  const job = jobs.get(jobId)
  if (!job) {
    return NextResponse.json({ error: "Job not found" }, { status: 404 })
  }

  return NextResponse.json({
    id: job.id,
    status: job.status,
    progress: job.progress,
    files: job.files,
    error: job.error,
  })
}
