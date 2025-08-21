import OpenAI from "openai"

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
})

export const MODELS = {
  PLANNER: "gpt-4o",
  TEXT_CONTENT: "gpt-4o-mini",
  IMAGES: "dall-e-3",
  SAFETY_FILTER: "gpt-4o-mini",
} as const

export async function sanitizePrompt(prompt: string): Promise<string> {
  const response = await openai.chat.completions.create({
    model: MODELS.SAFETY_FILTER,
    temperature: 0.0,
    messages: [
      {
        role: "system",
        content: "Rewrite to kid-safe, remove brands/IP (Pokémon, Paw Patrol, Roblox, etc.). Return text only.",
      },
      {
        role: "user",
        content: prompt,
      },
    ],
  })

  return response.choices[0].message.content?.trim() ?? ""
}

export async function generateBookPlan(spec: {
  trim: string
  bleed: boolean
  ageRange: string
  pages: number
  mode: string
  theme: string
}): Promise<any> {
  const systemPrompt = `You plan children's books. Output STRICT JSON only. 
Kinds: COVER,BACK,SPINE,COLORING,MAZE,WORDSEARCH,TRACING,STORY,INFO.
Validate exact page count and age suitability. No brands/IP.`

  const userPrompt = `
Trim: ${spec.trim}, Bleed: ${!!spec.bleed}
Age: ${spec.ageRange}
Total pages: ${spec.pages} (exact)
Mode: ${spec.mode}
Theme: "${spec.theme}"
Return {"trim","bleed","ageRange","pages":[...]} with pages.length === ${spec.pages}.`

  const response = await openai.chat.completions.create({
    model: MODELS.PLANNER,
    temperature: 0.4,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
  })

  return JSON.parse(response.choices[0].message.content!)
}

export async function generatePageContent(pageSpec: any): Promise<string> {
  const response = await openai.chat.completions.create({
    model: MODELS.TEXT_CONTENT,
    temperature: 0.6,
    messages: [
      {
        role: "system",
        content: "Generate age-appropriate content for children's book pages. Keep it simple, fun, and educational.",
      },
      {
        role: "user",
        content: `Generate content for: ${JSON.stringify(pageSpec)}`,
      },
    ],
  })

  return response.choices[0].message.content?.trim() ?? ""
}

export async function generateImage(prompt: string): Promise<string> {
  const response = await openai.images.generate({
    model: MODELS.IMAGES,
    prompt: `${prompt}. Simple line art style, black and white, suitable for children's coloring book, thick outlines, minimal detail`,
    size: "1024x1024",
    quality: "standard",
    n: 1,
  })

  return response.data[0].url!
}
