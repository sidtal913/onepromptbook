import { JobQueue, type Job } from "./job-queue"
import { generateStory, generateColoringBook, generateActivityBook } from "./ai"
import { generateBookPDF } from "./pdf-generator"

export class JobWorker {
  private queue: JobQueue
  private isRunning = false

  constructor() {
    this.queue = new JobQueue()
  }

  async start(): Promise<void> {
    if (this.isRunning) return

    this.isRunning = true
    console.log("[JobWorker] Starting job processing...")

    while (this.isRunning) {
      try {
        const job = await this.queue.getNextJob()

        if (job) {
          console.log(`[JobWorker] Processing job ${job.id} of type ${job.type}`)
          await this.processJob(job)
        } else {
          // No jobs available, wait before checking again
          await new Promise((resolve) => setTimeout(resolve, 5000))
        }
      } catch (error) {
        console.error("[JobWorker] Error in job processing loop:", error)
        await new Promise((resolve) => setTimeout(resolve, 10000)) // Wait longer on error
      }
    }
  }

  stop(): void {
    this.isRunning = false
    console.log("[JobWorker] Stopping job processing...")
  }

  private async processJob(job: Job): Promise<void> {
    try {
      switch (job.type) {
        case "kdp-generation":
          await this.processKDPGeneration(job)
          break
        case "story-generation":
          await this.processStoryGeneration(job)
          break
        case "coloring-generation":
          await this.processColoringGeneration(job)
          break
        case "activity-generation":
          await this.processActivityGeneration(job)
          break
        case "pdf-generation":
          await this.processPDFGeneration(job)
          break
        default:
          throw new Error(`Unknown job type: ${job.type}`)
      }
    } catch (error) {
      console.error(`[JobWorker] Job ${job.id} failed:`, error)
      await this.queue.failJob(job.id, error instanceof Error ? error.message : "Unknown error")
    }
  }

  private async processKDPGeneration(job: Job): Promise<void> {
    const { spec } = job.data

    // Update progress
    await this.queue.updateJob(job.id, { progress: 10 })

    // Step 1: Generate content based on mode
    let content
    if (spec.mode === "COLORING") {
      content = await generateColoringBook(spec.theme, spec.ageRange, spec.pageCount)
    } else if (spec.mode === "ACTIVITY") {
      content = await generateActivityBook(spec.theme, spec.ageRange, spec.pageCount)
    } else {
      content = await generateStory(spec.theme, spec.ageRange, spec.pageCount)
    }

    if (!content.success) {
      throw new Error("Content generation failed")
    }

    await this.queue.updateJob(job.id, { progress: 60 })

    // Step 2: Generate PDF
    const pdfBuffer = await generateBookPDF(
      {
        title: spec.theme,
        pages: content.story?.pages || content.coloringBook?.pages || content.activityBook?.pages || [],
        metadata: {
          generatedAt: new Date().toISOString(),
          pageCount: spec.pageCount,
          wordCount: 0,
        },
      },
      {
        trimSize: spec.kdpSize,
        bookType: spec.mode.toLowerCase(),
        includeBleed: false,
      },
    )

    await this.queue.updateJob(job.id, { progress: 90 })

    // Step 3: Store files (simplified - in production you'd upload to storage)
    const files = {
      interior: `/api/kdp/download/${spec.projectId}/interior.pdf`,
      coverFront: `/api/kdp/download/${spec.projectId}/cover_front.pdf`,
      coverWrap: `/api/kdp/download/${spec.projectId}/cover_wrap.pdf`,
      zip: `/api/kdp/download/${spec.projectId}/bundle.zip`,
    }

    await this.queue.completeJob(job.id, { files, content })
  }

  private async processStoryGeneration(job: Job): Promise<void> {
    const { prompt, ageGroup, pageCount } = job.data

    await this.queue.updateJob(job.id, { progress: 20 })

    const result = await generateStory(prompt, ageGroup, pageCount, (progress, status) => {
      this.queue.updateJob(job.id, { progress })
    })

    if (!result.success) {
      throw new Error("Story generation failed")
    }

    await this.queue.completeJob(job.id, result)
  }

  private async processColoringGeneration(job: Job): Promise<void> {
    const { prompt, ageGroup, pageCount } = job.data

    await this.queue.updateJob(job.id, { progress: 20 })

    const result = await generateColoringBook(prompt, ageGroup, pageCount, (progress, status) => {
      this.queue.updateJob(job.id, { progress })
    })

    if (!result.success) {
      throw new Error("Coloring book generation failed")
    }

    await this.queue.completeJob(job.id, result)
  }

  private async processActivityGeneration(job: Job): Promise<void> {
    const { prompt, ageGroup, pageCount } = job.data

    await this.queue.updateJob(job.id, { progress: 20 })

    const result = await generateActivityBook(prompt, ageGroup, pageCount, (progress, status) => {
      this.queue.updateJob(job.id, { progress })
    })

    if (!result.success) {
      throw new Error("Activity book generation failed")
    }

    await this.queue.completeJob(job.id, result)
  }

  private async processPDFGeneration(job: Job): Promise<void> {
    const { bookData, options } = job.data

    await this.queue.updateJob(job.id, { progress: 50 })

    const pdfBuffer = await generateBookPDF(bookData, options)

    await this.queue.completeJob(job.id, { pdfBuffer })
  }
}

// Export singleton instance
export const jobWorker = new JobWorker()
