import { kv } from "@vercel/kv"

export interface Job {
  id: string
  type: string
  data: any
  status: "pending" | "processing" | "completed" | "failed"
  progress: number
  result?: any
  error?: string
  createdAt: Date
  updatedAt: Date
  priority: "low" | "normal" | "high"
  maxRetries: number
  retryCount: number
}

export class JobQueue {
  private queueKey = "job_queue"
  private jobPrefix = "job:"

  async createJob(
    jobId: string,
    jobData: {
      type: string
      spec?: any
      data?: any
      priority?: "low" | "normal" | "high"
      maxRetries?: number
    },
  ): Promise<Job> {
    const job: Job = {
      id: jobId,
      type: jobData.type,
      data: jobData.spec || jobData.data || {},
      status: "pending",
      progress: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      priority: jobData.priority || "normal",
      maxRetries: jobData.maxRetries || 3,
      retryCount: 0,
    }

    // Store job data
    await kv.set(`${this.jobPrefix}${jobId}`, JSON.stringify(job))

    // Add to queue with priority
    const priority = this.getPriorityScore(job.priority)
    await kv.zadd(this.queueKey, { score: priority, member: jobId })

    return job
  }

  async getJob(jobId: string): Promise<Job | null> {
    const jobData = await kv.get(`${this.jobPrefix}${jobId}`)
    if (!jobData) return null

    const job = JSON.parse(jobData as string)
    job.createdAt = new Date(job.createdAt)
    job.updatedAt = new Date(job.updatedAt)
    return job
  }

  async updateJob(jobId: string, updates: Partial<Job>): Promise<void> {
    const job = await this.getJob(jobId)
    if (!job) throw new Error(`Job ${jobId} not found`)

    const updatedJob = {
      ...job,
      ...updates,
      updatedAt: new Date(),
    }

    await kv.set(`${this.jobPrefix}${jobId}`, JSON.stringify(updatedJob))
  }

  async getNextJob(): Promise<Job | null> {
    // Get highest priority job
    const result = await kv.zrevrange(this.queueKey, 0, 0)
    if (!result || result.length === 0) return null

    const jobId = result[0] as string
    const job = await this.getJob(jobId)

    if (!job || job.status !== "pending") {
      // Remove invalid job from queue
      await kv.zrem(this.queueKey, jobId)
      return this.getNextJob() // Try next job
    }

    // Mark as processing and remove from queue
    await this.updateJob(jobId, { status: "processing" })
    await kv.zrem(this.queueKey, jobId)

    return job
  }

  async completeJob(jobId: string, result?: any): Promise<void> {
    await this.updateJob(jobId, {
      status: "completed",
      progress: 100,
      result,
    })
  }

  async failJob(jobId: string, error: string): Promise<void> {
    const job = await this.getJob(jobId)
    if (!job) return

    if (job.retryCount < job.maxRetries) {
      // Retry job
      await this.updateJob(jobId, {
        status: "pending",
        retryCount: job.retryCount + 1,
        error,
      })

      // Re-add to queue with lower priority
      const priority = this.getPriorityScore(job.priority) - job.retryCount
      await kv.zadd(this.queueKey, { score: priority, member: jobId })
    } else {
      // Mark as failed
      await this.updateJob(jobId, {
        status: "failed",
        error,
      })
    }
  }

  async getQueueStats(): Promise<{
    pending: number
    processing: number
    completed: number
    failed: number
  }> {
    const pendingCount = await kv.zcard(this.queueKey)

    // This is a simplified version - in production you'd want more efficient counting
    return {
      pending: pendingCount,
      processing: 0, // Would need separate tracking
      completed: 0, // Would need separate tracking
      failed: 0, // Would need separate tracking
    }
  }

  private getPriorityScore(priority: "low" | "normal" | "high"): number {
    const now = Date.now()
    switch (priority) {
      case "high":
        return now + 1000000
      case "normal":
        return now
      case "low":
        return now - 1000000
      default:
        return now
    }
  }
}
