import Stripe from "stripe"

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY is not set")
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2024-06-20",
})

export const SUBSCRIPTION_PLANS = {
  free: {
    name: "Free",
    price: 0,
    priceId: null,
    features: ["3 projects per month", "Basic templates", "Standard PDF export", "Community support"],
    limits: {
      projects: 3,
      pages: 12,
      images: 5,
      regens: 0,
      tokens: 10000,
    },
  },
  pro: {
    name: "Pro",
    price: 19,
    priceId: process.env.STRIPE_PRO_PRICE_ID,
    features: [
      "Unlimited projects",
      "Premium templates",
      "High-quality PDF export",
      "Priority support",
      "Commercial license",
    ],
    limits: {
      projects: -1, // unlimited
      pages: 300,
      images: 200,
      regens: 50,
      tokens: 2000000,
    },
  },
  team: {
    name: "Team",
    price: 49,
    priceId: process.env.STRIPE_TEAM_PRICE_ID,
    features: [
      "Everything in Pro",
      "Team collaboration",
      "Custom branding",
      "Analytics dashboard",
      "Dedicated support",
    ],
    limits: {
      projects: -1, // unlimited
      pages: 1000,
      images: 800,
      regens: 200,
      tokens: 8000000,
    },
  },
} as const

export type SubscriptionPlan = keyof typeof SUBSCRIPTION_PLANS

export async function createCheckoutSession(
  customerId: string,
  priceId: string,
  successUrl: string,
  cancelUrl: string,
) {
  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    payment_method_types: ["card"],
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    mode: "subscription",
    success_url: successUrl,
    cancel_url: cancelUrl,
    allow_promotion_codes: true,
  })

  return session
}

export async function createBillingPortalSession(customerId: string, returnUrl: string) {
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  })

  return session
}

export async function createOrRetrieveCustomer(email: string, userId: string) {
  // Check if customer already exists
  const existingCustomers = await stripe.customers.list({
    email: email,
    limit: 1,
  })

  if (existingCustomers.data.length > 0) {
    return existingCustomers.data[0]
  }

  // Create new customer
  const customer = await stripe.customers.create({
    email: email,
    metadata: {
      userId: userId,
    },
  })

  return customer
}

export function constructWebhookEvent(body: string, signature: string) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  if (!webhookSecret) {
    throw new Error("STRIPE_WEBHOOK_SECRET is not set")
  }

  return stripe.webhooks.constructEvent(body, signature, webhookSecret)
}

export async function getSubscription(subscriptionId: string) {
  return await stripe.subscriptions.retrieve(subscriptionId)
}

export async function cancelSubscription(subscriptionId: string) {
  return await stripe.subscriptions.cancel(subscriptionId)
}

export async function updateSubscription(subscriptionId: string, priceId: string) {
  const subscription = await stripe.subscriptions.retrieve(subscriptionId)

  return await stripe.subscriptions.update(subscriptionId, {
    items: [
      {
        id: subscription.items.data[0].id,
        price: priceId,
      },
    ],
  })
}
