import { kv } from "@vercel/kv"
import { sql } from "./db"
import { PLAN_LIMITS, type Plan } from "./production-types"

const PERIOD = () => new Date().toISOString().slice(0, 7) // "YYYY-MM"

function k(orgId: string, name: "pages" | "images" | "regens" | "tokens") {
  return `usage:${orgId}:${PERIOD()}:${name}`
}

export async function getUsage(orgId: string, plan: Plan, name: keyof (typeof PLAN_LIMITS)["FREE"]) {
  const used = Number(await kv.get(k(orgId, name as any))) || 0
  const limit = PLAN_LIMITS[plan][name]
  return { used, limit, remaining: Math.max(0, limit - used) }
}

export async function consume(
  orgId: string,
  plan: Plan,
  metric: "pages" | "images" | "regens" | "tokens",
  amount: number,
) {
  const key = k(orgId, metric)
  const used = await kv.incrby(key, amount)
  await kv.expire(key, 60 * 60 * 24 * 45) // ~45 days
  const limit = PLAN_LIMITS[plan][metric as any]
  const over = used > limit

  await trackConsumption(orgId, metric, amount, used, limit)

  return { used, limit, over }
}

export async function assertCanGenerate(
  orgId: string,
  plan: Plan,
  kind: "pages" | "images" | "regens" | "tokens",
  need = 1,
) {
  const u = await getUsage(orgId, plan, kind)
  if (u.used + need > u.limit) {
    throw new Error(`quota_exceeded:${kind}`)
  }
}

async function trackConsumption(orgId: string, metric: string, amount: number, totalUsed: number, limit: number) {
  const timestamp = new Date().toISOString()
  const consumptionKey = `consumption:${orgId}:${PERIOD()}:${metric}`

  await kv.lpush(
    consumptionKey,
    JSON.stringify({
      amount,
      totalUsed,
      limit,
      timestamp,
      percentUsed: Math.round((totalUsed / limit) * 100),
    }),
  )

  await kv.ltrim(consumptionKey, 0, 999) // Keep last 1000 entries
  await kv.expire(consumptionKey, 60 * 60 * 24 * 45)
}

export async function getUserUsageStats(orgId: string, plan: Plan) {
  const [pages, images, regens, tokens] = await Promise.all([
    getUsage(orgId, plan, "pages"),
    getUsage(orgId, plan, "images"),
    getUsage(orgId, plan, "regens"),
    getUsage(orgId, plan, "tokens"),
  ])

  // Get consumption patterns
  const consumptionPatterns = await getConsumptionPatterns(orgId)

  return {
    pages,
    images,
    regens,
    tokens,
    patterns: consumptionPatterns,
  }
}

async function getConsumptionPatterns(orgId: string) {
  const metrics = ["pages", "images", "regens", "tokens"]
  const patterns: Record<string, any> = {}

  for (const metric of metrics) {
    const key = `consumption:${orgId}:${PERIOD()}:${metric}`
    const history = await kv.lrange(key, 0, 99) // Last 100 entries

    if (history.length > 0) {
      const data = history.map((entry) => JSON.parse(entry as string))
      patterns[metric] = {
        totalConsumptions: data.length,
        averageConsumption: data.reduce((sum, item) => sum + item.amount, 0) / data.length,
        peakUsage: Math.max(...data.map((item) => item.totalUsed)),
        trend: calculateTrend(data),
      }
    }
  }

  return patterns
}

function calculateTrend(data: Array<{ totalUsed: number; timestamp: string }>) {
  if (data.length < 2) return "stable"

  const recent = data.slice(0, Math.floor(data.length / 2))
  const older = data.slice(Math.floor(data.length / 2))

  const recentAvg = recent.reduce((sum, item) => sum + item.totalUsed, 0) / recent.length
  const olderAvg = older.reduce((sum, item) => sum + item.totalUsed, 0) / older.length

  const change = ((recentAvg - olderAvg) / olderAvg) * 100

  if (change > 20) return "increasing"
  if (change < -20) return "decreasing"
  return "stable"
}

export async function flushToDb(orgId: string) {
  const period = PERIOD()
  const [pages, images, regens, tokens] = await Promise.all([
    kv.get<number>(k(orgId, "pages")),
    kv.get<number>(k(orgId, "images")),
    kv.get<number>(k(orgId, "regens")),
    kv.get<number>(k(orgId, "tokens")),
  ])

  // Upsert usage record
  const existing = await sql`
    SELECT id FROM "Usage" WHERE "orgId" = ${orgId} AND period = ${period}
  `

  if (existing.length > 0) {
    await sql`
      UPDATE "Usage" 
      SET pages = ${pages || 0}, images = ${images || 0}, regens = ${regens || 0}, tokens = ${tokens || 0}, "updatedAt" = ${new Date().toISOString()}
      WHERE "orgId" = ${orgId} AND period = ${period}
    `
  } else {
    await sql`
      INSERT INTO "Usage" (id, "orgId", period, pages, images, regens, tokens)
      VALUES (${crypto.randomUUID()}, ${orgId}, ${period}, ${pages || 0}, ${images || 0}, ${regens || 0}, ${tokens || 0})
    `
  }
}
