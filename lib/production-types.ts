export type PageStatus = "PENDING" | "READY" | "FAILED"
export type JobStatus = "QUEUED" | "RUNNING" | "COMPLETED" | "FAILED"
export type Plan = "FREE" | "PRO" | "TEAM"

export interface PageAsset {
  pageId: string
  index: number
  kind: string
  status: PageStatus
  thumbUrl?: string
  imageUrl?: string
  text?: string
  svg?: string
  error?: string
}

export interface JobRecord {
  jobId: string
  orgId: string
  plan: Plan
  spec: any
  requestedPages: number
  status: JobStatus
  pages: PageAsset[]
  downloads?: {
    interior?: string
    coverFront?: string
    coverWrap?: string
  }
  createdAt: number
  updatedAt: number
}

export interface Character {
  id: string
  name?: string
  species: string
  ageHint?: string
  traits?: string[]
  outfit?: string[]
  colors?: {
    primary?: string
    secondary?: string
    accessory?: string
  }
  refImageUrl?: string
  seed?: number
}

export const PLAN_LIMITS: Record<Plan, { pages: number; images: number; regens: number; tokens: number }> = {
  FREE: { pages: 5, images: 2, regens: 2, tokens: 60_000 },
  PRO: { pages: 300, images: 200, regens: 50, tokens: 2_000_000 },
  TEAM: { pages: 1000, images: 800, regens: 200, tokens: 8_000_000 },
}
