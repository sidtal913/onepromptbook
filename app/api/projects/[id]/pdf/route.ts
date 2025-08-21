import { type NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { sql } from "@/lib/db"
import { generateProjectPDF, type KDPSize } from "@/lib/pdf-generator"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const projectId = params.id
    const { size, author, includeBleed } = await request.json()

    // Get project with organization check
    const projects = await sql`
      SELECT p.*, o.name as organization_name
      FROM projects p
      JOIN organizations o ON p.organization_id = o.id
      JOIN organization_members om ON o.id = om.organization_id
      WHERE p.id = ${projectId} 
        AND om.user_id = ${session.user.id}
        AND om.role IN ('owner', 'admin', 'member')
        AND p.status = 'generated'
    `

    if (projects.length === 0) {
      return NextResponse.json({ error: "Project not found or not ready" }, { status: 404 })
    }

    const project = projects[0]

    // Generate PDF
    const pdfBuffer = await generateProjectPDF(project, {
      size: size as KDPSize,
      author,
      includeBleed,
    })

    // Update download count
    await sql`
      UPDATE projects 
      SET download_count = COALESCE(download_count, 0) + 1
      WHERE id = ${projectId}
    `

    // Return PDF as response
    return new NextResponse(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${project.title.replace(/[^a-zA-Z0-9]/g, "_")}.pdf"`,
        "Content-Length": pdfBuffer.byteLength.toString(),
      },
    })
  } catch (error) {
    console.error("PDF generation error:", error)
    return NextResponse.json({ error: "Failed to generate PDF" }, { status: 500 })
  }
}
