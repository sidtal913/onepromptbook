import { type NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { sql } from "@/lib/db"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const projectId = params.id

    // Get project with organization check
    const projects = await sql`
      SELECT p.*, o.name as organization_name
      FROM projects p
      JOIN organizations o ON p.organization_id = o.id
      JOIN organization_members om ON o.id = om.organization_id
      WHERE p.id = ${projectId} 
        AND om.user_id = ${session.user.id}
        AND om.role IN ('owner', 'admin', 'member')
    `

    if (projects.length === 0) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 })
    }

    return NextResponse.json({ project: projects[0] })
  } catch (error) {
    console.error("Get project error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const projectId = params.id
    const updates = await request.json()

    // Verify project ownership
    const projects = await sql`
      SELECT p.id
      FROM projects p
      JOIN organizations o ON p.organization_id = o.id
      JOIN organization_members om ON o.id = om.organization_id
      WHERE p.id = ${projectId} 
        AND om.user_id = ${session.user.id}
        AND om.role IN ('owner', 'admin', 'member')
    `

    if (projects.length === 0) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 })
    }

    // Update project
    const updatedProject = await sql`
      UPDATE projects 
      SET 
        title = COALESCE(${updates.title}, title),
        content = COALESCE(${updates.content ? JSON.stringify(updates.content) : null}, content),
        settings = COALESCE(${updates.settings ? JSON.stringify(updates.settings) : null}, settings),
        updated_at = NOW()
      WHERE id = ${projectId}
      RETURNING *
    `

    return NextResponse.json({ project: updatedProject[0] })
  } catch (error) {
    console.error("Update project error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const projectId = params.id

    // Verify project ownership and delete
    const result = await sql`
      DELETE FROM projects p
      USING organizations o, organization_members om
      WHERE p.organization_id = o.id
        AND o.id = om.organization_id
        AND p.id = ${projectId}
        AND om.user_id = ${session.user.id}
        AND om.role IN ('owner', 'admin', 'member')
      RETURNING p.id
    `

    if (result.length === 0) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Delete project error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
