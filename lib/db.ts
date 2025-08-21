import { neon } from "@neondatabase/serverless"

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set")
}

export const sql = neon(process.env.DATABASE_URL)

// Database types
export interface Organization {
  id: string
  name: string
  slug: string
  plan: "free" | "pro" | "team"
  // stripe_customer_id?: string
  // stripe_subscription_id?: string
  // subscription_status: string
  created_at: string
  updated_at: string
}

export interface User {
  id: string
  email: string
  name?: string
  avatar_url?: string
  organization_id?: string
  role: "owner" | "admin" | "member"
  created_at: string
  updated_at: string
}

export interface Project {
  id: string
  title: string
  description?: string
  type: "ebook" | "coloring_book"
  status: "draft" | "generating" | "completed" | "failed"
  organization_id: string
  created_by: string
  settings: Record<string, any>
  created_at: string
  updated_at: string
}

export interface Page {
  id: string
  project_id: string
  page_number: number
  content?: string
  image_url?: string
  image_prompt?: string
  status: "pending" | "generating" | "completed" | "failed"
  created_at: string
  updated_at: string
}

export interface UsageTracking {
  id: string
  organization_id: string
  resource_type: "projects" | "pages" | "ai_requests"
  count: number
  period_start: string
  period_end: string
  created_at: string
}
