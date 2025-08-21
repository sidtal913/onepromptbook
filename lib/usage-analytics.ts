import { kv } from "@vercel/kv"
import { sql } from "./db"

export interface UsageMetrics {
  totalRequests: number
  successfulGenerations: number
  failedGenerations: number
  averageProcessingTime: number
  popularPrompts: Array<{ prompt: string; count: number }>
  peakUsageHours: Array<{ hour: number; requests: number }>
}

export async function trackRequest(
  orgId: string,
  action: string,
  metadata: {
    success: boolean
    processingTime?: number
    prompt?: string
    error?: string
  },
) {
  const timestamp = new Date()
  const hour = timestamp.getHours()
  const date = timestamp.toISOString().slice(0, 10) // YYYY-MM-DD

  // Track daily metrics
  const dailyKey = `analytics:${orgId}:${date}`
  await kv.hincrby(dailyKey, "total_requests", 1)
  await kv.hincrby(dailyKey, metadata.success ? "successful_requests" : "failed_requests", 1)
  await kv.expire(dailyKey, 60 * 60 * 24 * 90) // 90 days

  // Track hourly distribution
  const hourlyKey = `analytics:${orgId}:${date}:hourly`
  await kv.hincrby(hourlyKey, hour.toString(), 1)
  await kv.expire(hourlyKey, 60 * 60 * 24 * 30) // 30 days

  // Track processing times
  if (metadata.processingTime) {
    const timingKey = `analytics:${orgId}:${date}:timing`
    await kv.lpush(timingKey, metadata.processingTime)
    await kv.ltrim(timingKey, 0, 999) // Keep last 1000 entries
    await kv.expire(timingKey, 60 * 60 * 24 * 7) // 7 days
  }

  // Track popular prompts
  if (metadata.prompt && metadata.success) {
    const promptKey = `analytics:${orgId}:prompts`
    await kv.zincrby(promptKey, 1, metadata.prompt.slice(0, 100)) // Truncate long prompts
    await kv.expire(promptKey, 60 * 60 * 24 * 30) // 30 days
  }

  // Store detailed record in database for long-term analytics
  try {
    await sql`
      INSERT INTO usage_events (
        id, org_id, action, success, processing_time, prompt, error, created_at
      ) VALUES (
        ${crypto.randomUUID()}, ${orgId}, ${action}, ${metadata.success}, 
        ${metadata.processingTime || null}, ${metadata.prompt || null}, 
        ${metadata.error || null}, ${timestamp.toISOString()}
      )
    `
  } catch (error) {
    console.error("Failed to store usage event:", error)
  }
}

export async function getUsageAnalytics(orgId: string, days = 30): Promise<UsageMetrics> {
  const dates = Array.from({ length: days }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() - i)
    return date.toISOString().slice(0, 10)
  })

  // Get daily metrics
  const dailyMetrics = await Promise.all(
    dates.map(async (date) => {
      const key = `analytics:${orgId}:${date}`
      return await kv.hgetall(key)
    }),
  )

  // Calculate totals
  let totalRequests = 0
  let successfulGenerations = 0
  let failedGenerations = 0

  dailyMetrics.forEach((metrics) => {
    totalRequests += Number(metrics?.total_requests || 0)
    successfulGenerations += Number(metrics?.successful_requests || 0)
    failedGenerations += Number(metrics?.failed_requests || 0)
  })

  // Get processing times
  const timingKey = `analytics:${orgId}:${dates[0]}:timing`
  const processingTimes = await kv.lrange(timingKey, 0, -1)
  const averageProcessingTime =
    processingTimes.length > 0
      ? processingTimes.reduce((sum, time) => sum + Number(time), 0) / processingTimes.length
      : 0

  // Get popular prompts
  const promptKey = `analytics:${orgId}:prompts`
  const popularPromptsData = await kv.zrevrange(promptKey, 0, 9, { withScores: true })
  const popularPrompts = []
  for (let i = 0; i < popularPromptsData.length; i += 2) {
    popularPrompts.push({
      prompt: popularPromptsData[i] as string,
      count: popularPromptsData[i + 1] as number,
    })
  }

  // Get peak usage hours
  const hourlyData = await Promise.all(
    dates.slice(0, 7).map(async (date) => {
      const key = `analytics:${orgId}:${date}:hourly`
      return await kv.hgetall(key)
    }),
  )

  const hourlyTotals: Record<number, number> = {}
  hourlyData.forEach((dayData) => {
    Object.entries(dayData || {}).forEach(([hour, count]) => {
      hourlyTotals[Number(hour)] = (hourlyTotals[Number(hour)] || 0) + Number(count)
    })
  })

  const peakUsageHours = Object.entries(hourlyTotals)
    .map(([hour, requests]) => ({ hour: Number(hour), requests }))
    .sort((a, b) => b.requests - a.requests)
    .slice(0, 5)

  return {
    totalRequests,
    successfulGenerations,
    failedGenerations,
    averageProcessingTime,
    popularPrompts,
    peakUsageHours,
  }
}
