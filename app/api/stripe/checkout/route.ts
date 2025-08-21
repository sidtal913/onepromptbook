import { type NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { sql } from "@/lib/db"
import { createCheckoutSession, createOrRetrieveCustomer, SUBSCRIPTION_PLANS } from "@/lib/stripe"

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id || !session.user.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { plan } = await request.json()

    if (!plan || !SUBSCRIPTION_PLANS[plan as keyof typeof SUBSCRIPTION_PLANS]) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 })
    }

    const planConfig = SUBSCRIPTION_PLANS[plan as keyof typeof SUBSCRIPTION_PLANS]
    if (!planConfig.priceId) {
      return NextResponse.json({ error: "Plan not available for purchase" }, { status: 400 })
    }

    // Get user's organization
    const userOrg = await sql`
      SELECT o.id, o.stripe_customer_id
      FROM organizations o
      JOIN organization_members om ON o.id = om.organization_id
      WHERE om.user_id = ${session.user.id} AND om.role IN ('owner', 'admin')
      LIMIT 1
    `

    if (userOrg.length === 0) {
      return NextResponse.json({ error: "No organization found or insufficient permissions" }, { status: 403 })
    }

    const org = userOrg[0]

    // Create or retrieve Stripe customer
    let customerId = org.stripe_customer_id
    if (!customerId) {
      const customer = await createOrRetrieveCustomer(session.user.email, session.user.name || undefined)
      customerId = customer.id

      // Update organization with customer ID
      await sql`
        UPDATE organizations 
        SET stripe_customer_id = ${customerId}
        WHERE id = ${org.id}
      `
    }

    // Create checkout session
    const checkoutSession = await createCheckoutSession(
      customerId,
      planConfig.priceId,
      `${request.nextUrl.origin}/dashboard/billing?success=true`,
      `${request.nextUrl.origin}/dashboard/billing?canceled=true`,
    )

    return NextResponse.json({ url: checkoutSession.url })
  } catch (error) {
    console.error("Checkout error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
