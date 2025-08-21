import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { constructWebhookEvent, SUBSCRIPTION_PLANS } from "@/lib/stripe"
import type Stripe from "stripe"

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get("stripe-signature")

    if (!signature) {
      return NextResponse.json({ error: "No signature" }, { status: 400 })
    }

    const event = constructWebhookEvent(body, signature)

    switch (event.type) {
      case "customer.subscription.created":
      case "customer.subscription.updated":
        await handleSubscriptionChange(event.data.object as Stripe.Subscription)
        break

      case "customer.subscription.deleted":
        await handleSubscriptionCancellation(event.data.object as Stripe.Subscription)
        break

      case "invoice.payment_succeeded":
        await handlePaymentSucceeded(event.data.object as Stripe.Invoice)
        break

      case "invoice.payment_failed":
        await handlePaymentFailed(event.data.object as Stripe.Invoice)
        break

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("Webhook error:", error)
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 400 })
  }
}

async function handleSubscriptionChange(subscription: Stripe.Subscription) {
  try {
    const customerId = subscription.customer as string
    const status = subscription.status
    const priceId = subscription.items.data[0]?.price.id

    // Find the plan based on price ID
    let plan = "free"
    for (const [planKey, planConfig] of Object.entries(SUBSCRIPTION_PLANS)) {
      if (planConfig.priceId === priceId) {
        plan = planKey
        break
      }
    }

    // Update organization subscription status
    await sql`
      UPDATE organizations 
      SET 
        subscription_status = ${status},
        subscription_plan = ${plan},
        stripe_subscription_id = ${subscription.id},
        subscription_current_period_start = ${new Date(subscription.current_period_start * 1000).toISOString()},
        subscription_current_period_end = ${new Date(subscription.current_period_end * 1000).toISOString()},
        updated_at = NOW()
      WHERE stripe_customer_id = ${customerId}
    `

    console.log(`Updated subscription for customer ${customerId} to plan ${plan} with status ${status}`)
  } catch (error) {
    console.error("Error handling subscription change:", error)
    throw error
  }
}

async function handleSubscriptionCancellation(subscription: Stripe.Subscription) {
  try {
    const customerId = subscription.customer as string

    // Update organization to free plan
    await sql`
      UPDATE organizations 
      SET 
        subscription_status = 'canceled',
        subscription_plan = 'free',
        stripe_subscription_id = NULL,
        subscription_current_period_start = NULL,
        subscription_current_period_end = NULL,
        updated_at = NOW()
      WHERE stripe_customer_id = ${customerId}
    `

    console.log(`Canceled subscription for customer ${customerId}`)
  } catch (error) {
    console.error("Error handling subscription cancellation:", error)
    throw error
  }
}

async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  try {
    const customerId = invoice.customer as string
    const subscriptionId = invoice.subscription as string

    // Log successful payment
    await sql`
      INSERT INTO payment_events (
        id, 
        organization_id, 
        stripe_invoice_id, 
        stripe_subscription_id,
        amount, 
        currency, 
        status, 
        created_at
      )
      SELECT 
        ${crypto.randomUUID()},
        o.id,
        ${invoice.id},
        ${subscriptionId},
        ${invoice.amount_paid},
        ${invoice.currency},
        'succeeded',
        NOW()
      FROM organizations o
      WHERE o.stripe_customer_id = ${customerId}
    `

    console.log(`Payment succeeded for customer ${customerId}, amount: ${invoice.amount_paid}`)
  } catch (error) {
    console.error("Error handling payment success:", error)
    throw error
  }
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  try {
    const customerId = invoice.customer as string
    const subscriptionId = invoice.subscription as string

    // Log failed payment
    await sql`
      INSERT INTO payment_events (
        id, 
        organization_id, 
        stripe_invoice_id, 
        stripe_subscription_id,
        amount, 
        currency, 
        status, 
        created_at
      )
      SELECT 
        ${crypto.randomUUID()},
        o.id,
        ${invoice.id},
        ${subscriptionId},
        ${invoice.amount_due},
        ${invoice.currency},
        'failed',
        NOW()
      FROM organizations o
      WHERE o.stripe_customer_id = ${customerId}
    `

    // Optionally downgrade to free plan after multiple failed payments
    if (invoice.attempt_count >= 3) {
      await sql`
        UPDATE organizations 
        SET 
          subscription_status = 'past_due',
          updated_at = NOW()
        WHERE stripe_customer_id = ${customerId}
      `
    }

    console.log(`Payment failed for customer ${customerId}, attempt: ${invoice.attempt_count}`)
  } catch (error) {
    console.error("Error handling payment failure:", error)
    throw error
  }
}
