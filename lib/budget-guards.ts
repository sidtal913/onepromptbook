import { kv } from "@vercel/kv"

const PERIOD = () => new Date().toISOString().slice(0, 10) // daily
const HARD_DAILY_TOKENS = 2_000_000
const HARD_DAILY_IMAGES = 400

export async function recordTokens(n: number) {
  const k = `budget:tokens:${PERIOD()}`
  const used = await kv.incrby(k, n)
  await kv.expire(k, 60 * 60 * 36)
  if (used > HARD_DAILY_TOKENS) {
    throw new Error("budget_exceeded:todays_tokens")
  }
  return used
}

export async function recordImages(n: number) {
  const k = `budget:images:${PERIOD()}`
  const used = await kv.incrby(k, n)
  await kv.expire(k, 60 * 60 * 36)
  if (used > HARD_DAILY_IMAGES) {
    throw new Error("budget_exceeded:todays_images")
  }
  return used
}

export function assertServiceOn() {
  if (process.env.OPB_EMERGENCY_STOP === "1") {
    throw new Error("service_paused")
  }
}

export async function getBudgetStatus() {
  const period = PERIOD()
  const [tokens, images] = await Promise.all([
    kv.get<number>(`budget:tokens:${period}`) || 0,
    kv.get<number>(`budget:images:${period}`) || 0,
  ])

  return {
    tokens: { used: tokens, limit: HARD_DAILY_TOKENS, remaining: Math.max(0, HARD_DAILY_TOKENS - tokens) },
    images: { used: images, limit: HARD_DAILY_IMAGES, remaining: Math.max(0, HARD_DAILY_IMAGES - images) },
  }
}
