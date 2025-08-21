import { kv } from "@vercel/kv"

export interface RateLimitConfig {
  requests: number
  window: number // seconds
  burst?: number // allow burst requests
}

export const RATE_LIMITS: Record<string, Record<string, RateLimitConfig>> = {
  FREE: {
    generation: { requests: 3, window: 3600 }, // 3 per hour
    api: { requests: 100, window: 3600 }, // 100 per hour
    export: { requests: 5, window: 3600 }, // 5 per hour
  },
  PRO: {
    generation: { requests: 50, window: 3600 }, // 50 per hour
    api: { requests: 1000, window: 3600 }, // 1000 per hour
    export: { requests: 100, window: 3600 }, // 100 per hour
  },
  TEAM: {
    generation: { requests: 200, window: 3600 }, // 200 per hour
    api: { requests: 5000, window: 3600 }, // 5000 per hour
    export: { requests: 500, window: 3600 }, // 500 per hour
  },
}

export async function checkRateLimit(
  identifier: string,
  action: string,
  plan = "FREE",
): Promise<{ allowed: boolean; remaining: number; resetTime: number }> {
  const config = RATE_LIMITS[plan]?.[action] || RATE_LIMITS.FREE[action]
  if (!config) {
    return { allowed: true, remaining: Number.POSITIVE_INFINITY, resetTime: 0 }
  }

  const now = Math.floor(Date.now() / 1000)
  const window = Math.floor(now / config.window)
  const key = `rate_limit:${identifier}:${action}:${window}`

  const current = (await kv.get<number>(key)) || 0

  if (current >= config.requests) {
    const resetTime = (window + 1) * config.window
    return { allowed: false, remaining: 0, resetTime }
  }

  const newCount = await kv.incrby(key, 1)
  await kv.expire(key, config.window)

  const resetTime = (window + 1) * config.window
  return {
    allowed: true,
    remaining: Math.max(0, config.requests - newCount),
    resetTime,
  }
}

export async function getRateLimitStatus(
  identifier: string,
  action: string,
  plan = "FREE",
): Promise<{ current: number; limit: number; remaining: number; resetTime: number }> {
  const config = RATE_LIMITS[plan]?.[action] || RATE_LIMITS.FREE[action]
  if (!config) {
    return { current: 0, limit: Number.POSITIVE_INFINITY, remaining: Number.POSITIVE_INFINITY, resetTime: 0 }
  }

  const now = Math.floor(Date.now() / 1000)
  const window = Math.floor(now / config.window)
  const key = `rate_limit:${identifier}:${action}:${window}`

  const current = (await kv.get<number>(key)) || 0
  const resetTime = (window + 1) * config.window

  return {
    current,
    limit: config.requests,
    remaining: Math.max(0, config.requests - current),
    resetTime,
  }
}
