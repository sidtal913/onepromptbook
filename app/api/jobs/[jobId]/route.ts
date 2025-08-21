import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function GET(request: NextRequest, { params }: { params: { jobId: string } }) {
  try {
    const { jobId } = params

    const [job] = await sql`
      SELECT * FROM generation_jobs WHERE id = ${jobId}
    `

    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 })
    }

    const response = {
      status: job.status,
      pages:
        job.plan?.pages?.map((page: any, index: number) => ({
          index,
          thumbUrl: `/api/jobs/${jobId}/thumb/${index}`,
          pageId: `${jobId}_page_${index}`,
          kind: page.kind,
        })) || [],
      downloads:
        job.status === "COMPLETED"
          ? {
              interior: `/api/jobs/${jobId}/download/interior.pdf`,
              coverFront: `/api/jobs/${jobId}/download/cover_front.pdf`,
              coverWrap: `/api/jobs/${jobId}/download/cover_wrap.pdf`,
            }
          : null,
      usage: {
        tokens: job.tokens_used || 0,
        images: job.images_used || 0,
        creditsUsed: job.credits_used || 0,
      },
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error("Job status error:", error)
    return NextResponse.json({ error: "Failed to get job status" }, { status: 500 })
  }
}
