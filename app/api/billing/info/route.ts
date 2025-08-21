import { type NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { sql } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get user's organization billing info
    const userOrg = await sql`
      SELECT 
        o.plan,
        o.subscription_status,
        o.current_period_end,
        o.usage_count,
        o.usage_limit
      FROM organizations o
      JOIN organization_members om ON o.id = om.organization_id
      WHERE om.user_id = ${session.user.id} AND om.role IN ('owner', 'admin', 'member')
      LIMIT 1
    `

    if (userOrg.length === 0) {
      return NextResponse.json({ error: "No organization found" }, { status: 404 })
    }

    const org = userOrg[0]
    return NextResponse.json({
      billing: {
        plan: org.plan || "free",
        status: org.subscription_status || "free",
        currentPeriodEnd: org.current_period_end,
        usageCount: org.usage_count || 0,
        usageLimit: org.usage_limit || 3,
      },
    })
  } catch (error) {
    console.error("Billing info error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
