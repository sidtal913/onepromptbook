import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export interface User {
  id: string
  email: string
  full_name?: string
  credits: number
  subscription_tier: 'free' | 'starter' | 'creator' | 'professional' | 'publisher'
  created_at: string
  updated_at: string
}

export interface Book {
  id: string
  user_id: string
  title: string
  description: string
  book_type: string
  character_style: string
  cover_style: string
  pages: BookPage[]
  cover_url?: string
  pdf_url?: string
  epub_url?: string
  status: 'generating' | 'completed' | 'failed'
  credits_used: number
  created_at: string
  updated_at: string
}

export interface BookPage {
  id: string
  book_id: string
  page_number: number
  content: string
  image_url?: string
  image_prompt?: string
  created_at: string
}

export interface Character {
  id: string
  user_id?: string
  name: string
  description: string
  style: string
  image_url: string
  is_public: boolean
  category: string
  created_at: string
}

export interface Cover {
  id: string
  user_id?: string
  title: string
  category: string
  style: string
  image_url: string
  is_template: boolean
  created_at: string
}

// Auth helpers
export const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

export const signOut = async () => {
  const { error } = await supabase.auth.signOut()
  return { error }
}