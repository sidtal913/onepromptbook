import { openai } from "@ai-sdk/openai"
import { generateText } from "ai"

export interface BookSpec {
  prompt: string
  ageRange: "2-4" | "5-7" | "8-12"
  trim: "8.5x11" | "8x10" | "6x9"
  bleed: boolean
  pages: number
  mode: "COLORING" | "ACTIVITY" | "STORY"
  language: "EN" | "FR"
}

export interface BookPage {
  index: number
  kind: "COVER" | "BACK" | "SPINE" | "COLORING" | "MAZE" | "WORDSEARCH" | "TRACING" | "STORY" | "INFO"
  title?: string
  subtitle?: string
  prompt?: string
  elements?: string[]
  blurb?: string
}

export interface BookPlan {
  trim: string
  bleed: boolean
  ageRange: string
  pages: BookPage[]
}

export function spineWidthInches(pageCount: number, paper: "WHITE" | "CREAM" = "WHITE"): number {
  const thickness = paper === "CREAM" ? 0.0025 : 0.0023
  return +(pageCount * thickness).toFixed(4)
}

export function calculateMargins(trim: string, pageCount: number) {
  const baseMargins = {
    outer: 0.25,
    top: 0.25,
    bottom: 0.25,
    inner: 0.375,
  }

  // Increase inner margin for thicker books
  if (pageCount > 100) baseMargins.inner = 0.5
  else if (pageCount > 50) baseMargins.inner = 0.4375

  return baseMargins
}

export async function sanitizePrompt(prompt: string): Promise<string> {
  const { text } = await generateText({
    model: openai("gpt-4o-mini"),
    temperature: 0.0,
    prompt: `Rewrite to generic, kid-safe; remove brands/IP (Pokémon, Paw Patrol, Roblox, etc.). Return text only: ${prompt}`,
  })
  return text
}

export async function generateBookPlan(spec: BookSpec): Promise<BookPlan> {
  const systemPrompt = `You plan children's books. Output STRICT JSON only, no comments.
Validate: trim size, exact page count, age suitability.
Kinds: COVER, BACK, SPINE, COLORING, MAZE, WORDSEARCH, TRACING, STORY, INFO.
No brands/IP terms. Use simple age-appropriate language.`

  const userPrompt = `Request:
- Trim: ${spec.trim} (${spec.bleed ? "with" : "no"} bleed)
- Age: ${spec.ageRange}
- Pages: ${spec.pages} (exact)
- Mode: ${spec.mode}
- Theme: "${spec.prompt}"
Rules:
- Include 1 COVER, 1 BACK, 1 SPINE, ${spec.pages - 3} ${spec.mode} pages.
- ${spec.mode === "COLORING" ? "Coloring pages: black/white, thick outlines, minimal background clutter." : ""}
Return JSON with exact structure:
{
  "trim":"${spec.trim}",
  "bleed":${spec.bleed},
  "ageRange":"${spec.ageRange}",
  "pages":[ 
    { "index":0,"kind":"COVER","title":"...","subtitle":"...","elements":["..."] }, 
    { "index":1,"kind":"SPINE","title":"..." },
    { "index":2,"kind":"BACK","blurb":"..." },
    { "index":3,"kind":"${spec.mode}","prompt":"..." }, 
    ... up to index ${spec.pages - 1}
  ]
}`

  const { text } = await generateText({
    model: openai("gpt-4o"),
    temperature: 0.4,
    system: systemPrompt,
    prompt: userPrompt,
  })

  const plan = JSON.parse(text) as BookPlan

  // Validate exact page count
  if (plan.pages.length !== spec.pages) {
    throw new Error(`Plan generated ${plan.pages.length} pages, expected ${spec.pages}`)
  }

  return plan
}

export async function generatePageContent(page: BookPage, ageRange: string): Promise<string> {
  if (page.kind === "STORY") {
    const { text } = await generateText({
      model: openai("gpt-4o-mini"),
      temperature: 0.6,
      prompt: `Write a short story snippet for age ${ageRange} about: ${page.prompt}. Keep to 2-3 sentences, simple vocabulary.`,
    })
    return text
  }

  if (page.kind === "COLORING" && page.prompt) {
    // Return image generation prompt
    return `Black and white coloring page, thick bold outlines, high contrast, no shading, no greys, centered subject, minimal background clutter, age ${ageRange}. Subject: ${page.prompt}. Style: simple cartoon, printable, no text, no watermark, no logos, no copyrighted characters.`
  }

  return page.title || ""
}
