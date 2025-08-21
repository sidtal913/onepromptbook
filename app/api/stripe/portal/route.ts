import { type NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { sql } from "@/lib/db"
import { createBillingPortalSession } from "@/lib/stripe"

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get user's organization with Stripe customer ID
    const userOrg = await sql`
      SELECT o.stripe_customer_id
      FROM organizations o
      JOIN organization_members om ON o.id = om.organization_id
      WHERE om.user_id = ${session.user.id} 
        AND om.role IN ('owner', 'admin')
        AND o.stripe_customer_id IS NOT NULL
      LIMIT 1
    `

    if (userOrg.length === 0) {
      return NextResponse.json({ error: "No billing account found" }, { status: 404 })
    }

    const portalSession = await createBillingPortalSession(
      userOrg[0].stripe_customer_id,
      `${request.nextUrl.origin}/dashboard/billing`,
    )

    return NextResponse.json({ url: portalSession.url })
  } catch (error) {
    console.error("Portal error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
