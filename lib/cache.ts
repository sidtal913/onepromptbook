import { Redis } from "@upstash/redis"

const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
})

export async function cacheGet<T>(key: string): Promise<T | null> {
  try {
    return await redis.get<T>(key)
  } catch {
    return null
  }
}

export async function cacheSet<T>(key: string, value: T, ttlSec = 86400) {
  try {
    await redis.set(key, value, { ex: ttlSec })
  } catch {}
}
