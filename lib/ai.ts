import "server-only"
import { openai } from "@ai-sdk/openai"
import { generateText, generateObject } from "ai"
import { z } from "zod"
import { PROMPT_TEMPLATES } from "./prompt-templates"

// Story generation schema
const StorySchema = z.object({
  title: z.string().describe("The title of the story"),
  description: z.string().describe("Brief description of the story"),
  targetAge: z.string().describe("Target age group"),
  pages: z
    .array(
      z.object({
        pageNumber: z.number(),
        text: z.string().describe("The text content for this page (keep it short for children)"),
        imagePrompt: z.string().describe("Detailed prompt for generating an illustration for this page"),
        imageStyle: z.enum(["illustration", "cartoon", "realistic", "watercolor"]).describe("Art style for the image"),
      }),
    )
    .min(8)
    .max(50)
    .describe("Array of story pages"),
  themes: z.array(z.string()).describe("Main themes covered in the story"),
})

// Coloring book schema
const ColoringBookSchema = z.object({
  title: z.string().describe("The title of the coloring book"),
  description: z.string().describe("Brief description of the coloring book"),
  targetAge: z.string().describe("Target age group"),
  pages: z
    .array(
      z.object({
        pageNumber: z.number(),
        title: z.string().describe("Title of this coloring page"),
        description: z.string().describe("Description of what to draw"),
        imagePrompt: z.string().describe("Detailed prompt for generating a black and white line art coloring page"),
        difficulty: z.enum(["easy", "medium", "hard"]).describe("Coloring difficulty level"),
      }),
    )
    .min(8)
    .max(50)
    .describe("Array of coloring pages"),
  themes: z.array(z.string()).describe("Main themes covered in the coloring book"),
})

// Activity book schema
const ActivityBookSchema = z.object({
  title: z.string().describe("The title of the activity book"),
  description: z.string().describe("Brief description of the activity book"),
  targetAge: z.string().describe("Target age group"),
  pages: z
    .array(
      z.object({
        pageNumber: z.number(),
        activityType: z.enum(["maze", "puzzle", "word-search", "crossword", "matching", "drawing", "coloring"]),
        title: z.string().describe("Title of this activity"),
        instructions: z.string().describe("Clear instructions for the activity"),
        imagePrompt: z.string().describe("Prompt for generating the activity layout"),
        difficulty: z.enum(["easy", "medium", "hard"]).describe("Activity difficulty level"),
      }),
    )
    .min(8)
    .max(50)
    .describe("Array of activity pages"),
  themes: z.array(z.string()).describe("Main themes covered in the activity book"),
})

const StoryPageSchema = z.object({
  pageNumber: z.number().int().min(1),
  text: z.string().min(1),
  imagePrompt: z.string().min(10),
})

const StorySpecSchema = z.object({
  title: z.string().min(1),
  pages: z.array(StoryPageSchema).min(1),
})

const ColoringPageSchema = z.object({
  pageNumber: z.number().int().min(1),
  title: z.string().min(1),
  description: z.string().min(1),
  imagePrompt: z.string().min(10),
})

const ColoringSpecSchema = z.object({
  title: z.string().min(1),
  pages: z.array(ColoringPageSchema).min(1),
})

// Deterministic fallback functions that never throw
function fallbackStorySpec(prompt: string, count: number) {
  const N = Math.max(1, Math.min(count || 10, 10))
  return {
    title: "Generated Story",
    pages: Array.from({ length: N }).map((_, i) => ({
      pageNumber: i + 1,
      text: `Page ${i + 1} of the story about ${prompt}. This is a placeholder story page that tells part of the adventure.`,
      imagePrompt: `Children's book illustration for page ${i + 1}: ${prompt}. Colorful, friendly, safe for children.`,
    })),
  }
}

function fallbackColoringSpec(prompt: string, count: number) {
  const N = Math.max(1, Math.min(count || 10, 10))
  return {
    title: "Coloring Book",
    pages: Array.from({ length: N }).map((_, i) => ({
      pageNumber: i + 1,
      title: `Page ${i + 1}`,
      description: `Simple line-art subject inspired by: ${prompt}`,
      imagePrompt: `Coloring book line art, thick black outlines, no shading, high contrast. Subject #${i + 1} related to "${prompt}". Centered composition, minimal background.`,
    })),
  }
}

export async function generateStorySpec(prompt: string, pageCount: number) {
  const N = Math.max(1, Math.min(pageCount || 10, 10))
  const safePrompt = prompt.replace(/(pokemon|paw patrol|roblox|brawl stars)/gi, "original characters")

  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const { object } = await generateObject({
        model: openai("gpt-4o-mini"),
        temperature: 0.2,
        maxTokens: 800,
        schema: StorySpecSchema,
        system:
          "You are a children's story planner. Return ONLY valid JSON for the requested schema. No extra text, no markdown.",
        prompt: `Create a ${N}-page children's story plan for this theme: "${safePrompt}".
        
Rules:
- pages.length MUST equal ${N}
- Age-appropriate, engaging content for children
- Each page needs short text and detailed imagePrompt
- Keep text concise and suitable for picture books`,
      })

      // Ensure exact page count
      if (object.pages.length !== N) {
        const fixed = { ...object, pages: object.pages.slice(0, N) }
        while (fixed.pages.length < N) {
          const i = fixed.pages.length
          fixed.pages.push({
            pageNumber: i + 1,
            text: `Page ${i + 1} continues the story about ${safePrompt}.`,
            imagePrompt: `Children's book illustration: ${safePrompt}. Colorful, friendly, safe for children.`,
          })
        }
        return StorySpecSchema.parse(fixed)
      }

      return object
    } catch (err) {
      console.warn(`[SERVER] Story spec attempt ${attempt} failed:`, (err as any)?.message || err)
    }
  }

  console.warn("[SERVER] Falling back to deterministic story spec")
  return fallbackStorySpec(prompt, pageCount)
}

export async function generateColoringSpec(prompt: string, pageCount: number) {
  const N = Math.max(1, Math.min(pageCount || 10, 10))
  const safePrompt = prompt.replace(/(pokemon|paw patrol|roblox|brawl stars)/gi, "original characters")

  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const { object } = await generateObject({
        model: openai("gpt-4o-mini"),
        temperature: 0.2,
        maxTokens: 800,
        schema: ColoringSpecSchema,
        system:
          "You are a planner for brand-safe kids coloring books. Return ONLY valid JSON for the requested schema. No extra text, no markdown.",
        prompt: `Create a ${N}-page coloring book plan for this theme: "${safePrompt}".
        
Rules:
- pages.length MUST equal ${N}
- Simple, kid-friendly line-art subjects
- No brands, trademarks, logos, or copyrighted characters
- Each page MUST include a short "title", "description", and a concrete "imagePrompt"`,
      })

      // Ensure exact page count
      if (object.pages.length !== N) {
        const fixed = { ...object, pages: object.pages.slice(0, N) }
        while (fixed.pages.length < N) {
          const i = fixed.pages.length
          fixed.pages.push({
            pageNumber: i + 1,
            title: `Page ${i + 1}`,
            description: `Simple line-art subject inspired by: ${safePrompt}`,
            imagePrompt: `Coloring book line art, thick black outlines, no shading. Subject #${i + 1} related to "${safePrompt}". Centered, minimal background.`,
          })
        }
        return ColoringSpecSchema.parse(fixed)
      }

      return object
    } catch (err) {
      console.warn(`[SERVER] Coloring spec attempt ${attempt} failed:`, (err as any)?.message || err)
    }
  }

  console.warn("[SERVER] Falling back to deterministic coloring spec")
  return fallbackColoringSpec(prompt, pageCount)
}

export async function generateStory(
  prompt: string,
  ageGroup: string,
  pageCount: number,
  onProgress?: (progress: number, status: string) => void,
) {
  const maxRetries = 3
  let attempt = 0

  while (attempt < maxRetries) {
    try {
      onProgress?.(10, "Analyzing your prompt...")

      const storySpec = await generateStorySpec(prompt, pageCount)

      onProgress?.(30, "Generating story structure...")

      const pagesWithImages = await Promise.all(
        storySpec.pages.map(async (page, index) => {
          onProgress?.(70 + (index / storySpec.pages.length) * 25, `Creating illustration ${index + 1}...`)

          try {
            const imageUrl = await generateImage(page.imagePrompt, "illustration")
            return { ...page, imageUrl }
          } catch (error) {
            console.error(`Failed to generate image for page ${page.pageNumber}:`, error)
            return { ...page, imageUrl: null }
          }
        }),
      )

      onProgress?.(100, "Story complete!")

      return {
        success: true,
        story: { ...storySpec, pages: pagesWithImages },
        metadata: {
          generatedAt: new Date().toISOString(),
          wordCount: storySpec.pages.reduce((acc, page) => acc + page.text.split(" ").length, 0),
          pageCount: storySpec.pages.length,
        },
      }
    } catch (error) {
      attempt++
      console.error(`Story generation attempt ${attempt} failed:`, error)

      if (attempt >= maxRetries) {
        return { success: false, error: "Failed to generate story after multiple attempts" }
      }

      onProgress?.(0, `Retrying... (attempt ${attempt + 1}/${maxRetries})`)
      await new Promise((resolve) => setTimeout(resolve, 1000 * attempt)) // Exponential backoff
    }
  }
}

export async function generateColoringBook(
  prompt: string,
  ageGroup: string,
  pageCount: number,
  onProgress?: (progress: number, status: string) => void,
) {
  const maxRetries = 3
  let attempt = 0

  while (attempt < maxRetries) {
    try {
      onProgress?.(10, "Planning coloring book...")

      const coloringSpec = await generateColoringSpec(prompt, pageCount)

      onProgress?.(30, "Creating coloring pages...")

      const pagesWithImages = await Promise.all(
        coloringSpec.pages.map(async (page, index) => {
          onProgress?.(70 + (index / coloringSpec.pages.length) * 25, `Creating page ${index + 1}...`)

          try {
            const imageUrl = await generateColoringPageImage(page.imagePrompt)
            return { ...page, imageUrl }
          } catch (error) {
            console.error(`Failed to generate coloring page ${page.pageNumber}:`, error)
            return { ...page, imageUrl: null }
          }
        }),
      )

      onProgress?.(100, "Coloring book complete!")

      return {
        success: true,
        coloringBook: { ...coloringSpec, pages: pagesWithImages },
        metadata: {
          generatedAt: new Date().toISOString(),
          pageCount: coloringSpec.pages.length,
          difficulty: coloringSpec.pages[0]?.difficulty || "medium",
        },
      }
    } catch (error) {
      attempt++
      console.error(`Coloring book generation attempt ${attempt} failed:`, error)

      if (attempt >= maxRetries) {
        return { success: false, error: "Failed to generate coloring book after multiple attempts" }
      }

      onProgress?.(0, `Retrying... (attempt ${attempt + 1}/${maxRetries})`)
      await new Promise((resolve) => setTimeout(resolve, 1000 * attempt))
    }
  }
}

export async function generateActivityBook(
  prompt: string,
  ageGroup: string,
  pageCount: number,
  onProgress?: (progress: number, status: string) => void,
) {
  const maxRetries = 3
  let attempt = 0

  while (attempt < maxRetries) {
    try {
      onProgress?.(10, "Planning activities...")

      const enhancedPrompt = `Create an activity book for ${ageGroup} with exactly ${pageCount} pages based on this theme: "${prompt}".
      
      Guidelines:
      - Include variety: mazes, puzzles, word searches, matching games, drawing activities
      - Age-appropriate difficulty for ${ageGroup}
      - Educational and entertaining content
      - Clear, simple instructions for each activity
      - Engaging themes that children love
      - Progressive difficulty throughout the book
      - Include both mental and creative activities`

      onProgress?.(30, "Creating activities...")

      const { object } = await generateText({
        model: openai("gpt-4o"),
        prompt: enhancedPrompt,
      })

      const activityBook = JSON.parse(object)
      if (!Array.isArray(activityBook.pages)) throw new Error("Planner returned no pages")

      onProgress?.(70, "Generating activity layouts...")

      const pagesWithImages = await Promise.all(
        activityBook.pages.map(async (page, index) => {
          onProgress?.(70 + (index / activityBook.pages.length) * 25, `Creating activity ${index + 1}...`)

          try {
            const imageUrl = await generateActivityImage(page.imagePrompt, page.activityType)
            return { ...page, imageUrl }
          } catch (error) {
            console.error(`Failed to generate activity ${page.pageNumber}:`, error)
            return { ...page, imageUrl: null }
          }
        }),
      )

      onProgress?.(100, "Activity book complete!")

      return {
        success: true,
        activityBook: { ...activityBook, pages: pagesWithImages },
        metadata: {
          generatedAt: new Date().toISOString(),
          pageCount: activityBook.pages.length,
          activityTypes: [...new Set(activityBook.pages.map((p) => p.activityType))],
        },
      }
    } catch (error) {
      attempt++
      console.error(`Activity book generation attempt ${attempt} failed:`, error)

      if (attempt >= maxRetries) {
        return { success: false, error: "Failed to generate activity book after multiple attempts" }
      }

      onProgress?.(0, `Retrying... (attempt ${attempt + 1}/${maxRetries})`)
      await new Promise((resolve) => setTimeout(resolve, 1000 * attempt))
    }
  }
}

export async function improveStoryPage(pageText: string, feedback: string) {
  try {
    const { text } = await generateText({
      model: openai("gpt-4o-mini"),
      prompt: `Improve this story page text based on the feedback provided:
      
      Original text: "${pageText}"
      Feedback: "${feedback}"
      
      Return only the improved text, keeping it appropriate for children and concise.`,
    })

    return { success: true, improvedText: text }
  } catch (error) {
    console.error("Story improvement error:", error)
    return { success: false, error: "Failed to improve story page" }
  }
}

export async function generateRiddles(theme: string, count = 8) {
  try {
    const { text } = await generateText({
      model: openai("gpt-4o-mini"),
      temperature: PROMPT_TEMPLATES.TEXT_GENERATION.temperature,
      maxTokens: PROMPT_TEMPLATES.TEXT_GENERATION.maxTokens,
      system: PROMPT_TEMPLATES.TEXT_GENERATION.RIDDLES.system,
      prompt: PROMPT_TEMPLATES.TEXT_GENERATION.RIDDLES.userTemplate(theme, "6-8", count),
    })

    return JSON.parse(text)
  } catch (error) {
    console.error("Riddle generation error:", error)
    throw new Error("Failed to generate riddles")
  }
}

export async function generateCaption(subject: string) {
  try {
    const { text } = await generateText({
      model: openai("gpt-4o-mini"),
      temperature: PROMPT_TEMPLATES.TEXT_GENERATION.temperature,
      maxTokens: PROMPT_TEMPLATES.TEXT_GENERATION.maxTokens,
      system: PROMPT_TEMPLATES.TEXT_GENERATION.CAPTIONS.system,
      prompt: PROMPT_TEMPLATES.TEXT_GENERATION.CAPTIONS.userTemplate(subject),
    })

    return text
  } catch (error) {
    console.error("Caption generation error:", error)
    throw new Error("Failed to generate caption")
  }
}

export async function generateWordList(theme: string, count = 8) {
  try {
    const { text } = await generateText({
      model: openai("gpt-4o-mini"),
      temperature: PROMPT_TEMPLATES.TEXT_GENERATION.temperature,
      maxTokens: PROMPT_TEMPLATES.TEXT_GENERATION.maxTokens,
      system: PROMPT_TEMPLATES.TEXT_GENERATION.WORD_LISTS.system,
      prompt: PROMPT_TEMPLATES.TEXT_GENERATION.WORD_LISTS.userTemplate(theme, count),
    })

    return JSON.parse(text)
  } catch (error) {
    console.error("Word list generation error:", error)
    throw new Error("Failed to generate word list")
  }
}

export async function sanitizeContent(text: string) {
  try {
    const { text: sanitized } = await generateText({
      model: openai("gpt-4o-mini"),
      temperature: PROMPT_TEMPLATES.SAFETY_FILTER.temperature,
      system: PROMPT_TEMPLATES.SAFETY_FILTER.system,
      prompt: PROMPT_TEMPLATES.SAFETY_FILTER.userTemplate(text),
    })

    return sanitized
  } catch (error) {
    console.error("Content sanitization error:", error)
    throw new Error("Failed to sanitize content")
  }
}

async function generateImage(prompt: string, style = "illustration"): Promise<string> {
  try {
    if (typeof process === "undefined" || !process.env) {
      throw new Error("Image generation must run in Node.js server environment")
    }

    if (!process.env.FAL_KEY) {
      throw new Error("FAL_KEY environment variable is not configured")
    }

    const fal = await import("@fal-ai/serverless-client")

    fal.config({
      credentials: process.env.FAL_KEY,
    })

    const styleMap = {
      illustration: "illustration style, colorful, child-friendly, storybook art",
      cartoon: "cartoon style, bright colors, simple shapes, animated look",
      realistic: "realistic style, detailed, photographic quality",
      watercolor: "watercolor style, soft colors, artistic, painted texture",
    }

    const enhancedPrompt = `${prompt}, ${styleMap[style as keyof typeof styleMap] || styleMap.illustration}, high quality, suitable for children's book, safe for kids, G-rated content`

    console.log("[v0] Generating image with fal:", enhancedPrompt)

    const result = await fal.subscribe("fal-ai/flux/schnell", {
      input: {
        prompt: enhancedPrompt,
        image_size: "portrait_4_3", // Good for book pages
        num_inference_steps: 4,
        num_images: 1,
        enable_safety_checker: true,
      },
    })

    const imageUrl = result.images?.[0]?.url
    if (!imageUrl) {
      throw new Error("No image generated from fal")
    }

    console.log("[v0] Successfully generated image:", imageUrl)
    return imageUrl
  } catch (error) {
    console.error("Image generation error:", error)
    // Fallback to placeholder if fal fails
    return `/placeholder.svg?height=400&width=300&text=${encodeURIComponent(prompt.slice(0, 50))}`
  }
}

async function generateColoringPageImage(prompt: string): Promise<string> {
  try {
    if (typeof process === "undefined" || !process.env) {
      throw new Error("Image generation must run in Node.js server environment")
    }

    if (!process.env.FAL_KEY) {
      throw new Error("FAL_KEY environment variable is not configured")
    }

    const fal = await import("@fal-ai/serverless-client")

    fal.config({
      credentials: process.env.FAL_KEY,
    })

    const enhancedPrompt = `${prompt}, black and white line art, coloring book style, simple clear outlines, no shading, no fill, bold black lines on white background, suitable for children to color, clean line drawing`

    console.log("[v0] Generating coloring page with fal:", enhancedPrompt)

    const result = await fal.subscribe("fal-ai/flux/schnell", {
      input: {
        prompt: enhancedPrompt,
        image_size: "square_hd", // Square format works well for coloring pages
        num_inference_steps: 4,
        num_images: 1,
        enable_safety_checker: true,
      },
    })

    const imageUrl = result.images?.[0]?.url
    if (!imageUrl) {
      throw new Error("No coloring page generated from fal")
    }

    console.log("[v0] Successfully generated coloring page:", imageUrl)
    return imageUrl
  } catch (error) {
    console.error("Coloring page generation error:", error)
    // Fallback to placeholder if fal fails
    return `/placeholder.svg?height=400&width=300&text=${encodeURIComponent("Coloring: " + prompt.slice(0, 40))}`
  }
}

async function generateActivityImage(prompt: string, activityType: string): Promise<string> {
  try {
    if (typeof process === "undefined" || !process.env) {
      throw new Error("Image generation must run in Node.js server environment")
    }

    if (!process.env.FAL_KEY) {
      throw new Error("FAL_KEY environment variable is not configured")
    }

    const fal = await import("@fal-ai/serverless-client")

    fal.config({
      credentials: process.env.FAL_KEY,
    })

    const activityStyles = {
      maze: "maze layout, black lines on white background, clear paths, simple design",
      puzzle: "puzzle pieces layout, black outlines, educational content",
      "word-search": "word search grid, letters in boxes, clean typography",
      crossword: "crossword puzzle grid, numbered boxes, black and white",
      matching: "matching game layout, items to connect, simple illustrations",
      drawing: "drawing activity template, guidelines and examples, instructional",
      coloring: "coloring activity, line art, simple outlines for coloring",
    }

    const stylePrompt =
      activityStyles[activityType as keyof typeof activityStyles] || "activity layout, educational, child-friendly"
    const enhancedPrompt = `${prompt}, ${stylePrompt}, black and white, clear instructions, suitable for children, educational activity`

    console.log("[v0] Generating activity image with fal:", enhancedPrompt)

    const result = await fal.subscribe("fal-ai/flux/schnell", {
      input: {
        prompt: enhancedPrompt,
        image_size: "portrait_4_3", // Good for activity pages
        num_inference_steps: 4,
        num_images: 1,
        enable_safety_checker: true,
      },
    })

    const imageUrl = result.images?.[0]?.url
    if (!imageUrl) {
      throw new Error("No activity image generated from fal")
    }

    console.log("[v0] Successfully generated activity image:", imageUrl)
    return imageUrl
  } catch (error) {
    console.error("Activity image generation error:", error)
    // Fallback to placeholder if fal fails
    return `/placeholder.svg?height=400&width=300&text=${encodeURIComponent(activityType + ": " + prompt.slice(0, 30))}`
  }
}

export async function validateAndSanitizeContent(content: any, contentType: string) {
  try {
    const { text } = await generateText({
      model: openai("gpt-4o-mini"),
      system: `You are a content safety validator for children's books. Analyze the provided ${contentType} content and ensure it meets these criteria:
      - Age-appropriate language and themes
      - No violence, scary content, or inappropriate material
      - Inclusive and diverse representation
      - Educational value when possible
      - Positive messaging and values
      
      Return "APPROVED" if the content is safe, or "REJECTED: [reason]" if it needs changes.`,
      prompt: `Validate this ${contentType} content: ${JSON.stringify(content)}`,
    })

    const isApproved = text.trim().startsWith("APPROVED")
    return {
      isValid: isApproved,
      feedback: text,
      sanitizedContent: isApproved ? content : null,
    }
  } catch (error) {
    console.error("Content validation error:", error)
    return {
      isValid: false,
      feedback: "Unable to validate content safety",
      sanitizedContent: null,
    }
  }
}
