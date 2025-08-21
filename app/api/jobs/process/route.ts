import { type NextRequest, NextResponse } from "next/server"
import { jobWorker } from "@/lib/job-worker"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

// This endpoint can be used to manually trigger job processing
// In production, you'd use a cron job or background service
export async function POST(req: NextRequest) {
  try {
    // Start job processing (this will run until stopped)
    jobWorker.start().catch(console.error)

    return NextResponse.json({ message: "Job processing started" })
  } catch (error) {
    console.error("Failed to start job processing:", error)
    return NextResponse.json({ error: "Failed to start job processing" }, { status: 500 })
  }
}

// Get job processing status
export async function GET(req: NextRequest) {
  try {
    // In a real implementation, you'd track worker status
    return NextResponse.json({
      status: "running",
      message: "Job worker is processing jobs",
    })
  } catch (error) {
    console.error("Failed to get job status:", error)
    return NextResponse.json({ error: "Failed to get job status" }, { status: 500 })
  }
}
