import { kv } from "@vercel/kv"

export interface QuotaLimits {
  pages: number
  images: number
  regens: number
}

export const QUOTA_LIMITS: Record<string, QuotaLimits> = {
  FREE: { pages: 5, images: 2, regens: 0 },
  PRO: { pages: 300, images: 200, regens: 50 },
  TEAM: { pages: 1000, images: 800, regens: 200 },
}

export async function checkAndIncrementQuota(
  orgId: string,
  key: "pages" | "images" | "regens",
  increment: number,
  plan = "FREE",
): Promise<{ allowed: boolean; used: number; limit: number }> {
  const monthKey = `${key}_month:${orgId}:${new Date().toISOString().slice(0, 7)}`
  const limit = QUOTA_LIMITS[plan]?.[key] || QUOTA_LIMITS.FREE[key]

  const currentUsed = (await kv.get<number>(monthKey)) || 0

  if (currentUsed + increment > limit) {
    return { allowed: false, used: currentUsed, limit }
  }

  const newUsed = await kv.incrby(monthKey, increment)
  await kv.expire(monthKey, 60 * 60 * 24 * 40) // 40 days

  return { allowed: true, used: newUsed, limit }
}

export async function getCurrentUsage(orgId: string): Promise<Record<string, number>> {
  const monthKey = new Date().toISOString().slice(0, 7)
  const [pages, images, regens] = await Promise.all([
    kv.get<number>(`pages_month:${orgId}:${monthKey}`) || 0,
    kv.get<number>(`images_month:${orgId}:${monthKey}`) || 0,
    kv.get<number>(`regens_month:${orgId}:${monthKey}`) || 0,
  ])

  return { pages, images, regens }
}
