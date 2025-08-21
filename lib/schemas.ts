import { z } from "zod"

export const StoryPageSchema = z.object({
  pageNumber: z.number().int().min(1),
  text: z.string().min(1),
  imagePrompt: z.string().min(10),
})

export const StorySpecSchema = z.object({
  title: z.string().min(1),
  pages: z.array(StoryPageSchema).min(1),
})

export const ColoringPageSchema = z.object({
  pageNumber: z.number().int().min(1),
  title: z.string().min(1),
  description: z.string().min(1),
  imagePrompt: z.string().min(10),
})

export const ColoringSpecSchema = z.object({
  title: z.string().min(1),
  pages: z.array(ColoringPageSchema).min(1),
})

export const ActivityPageSchema = z.object({
  pageNumber: z.number().int().min(1),
  title: z.string().min(1),
  description: z.string().min(1),
  activityType: z.string().min(1),
  imagePrompt: z.string().min(10),
})

export const ActivitySpecSchema = z.object({
  title: z.string().min(1),
  pages: z.array(ActivityPageSchema).min(1),
})

export type StorySpec = z.infer<typeof StorySpecSchema>
export type ColoringSpec = z.infer<typeof ColoringSpecSchema>
export type ActivitySpec = z.infer<typeof ActivitySpecSchema>
