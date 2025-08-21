export const PROMPT_TEMPLATES = {
  // Planner – page-by-page layout (JSON)
  PLANNER: {
    model: "gpt-4o",
    temperature: 0.4,
    maxTokens: 1200,
    system: `You are a layout planner for children's activity books. 
Output STRICT JSON only (no comments). Validate constraints: KDP trim size, page count, age suitability.
Do not include IP/trademarked brands; replace with generic equivalents.`,
    userTemplate: (theme: string, ageRange: string, kdpSize: string, pageCount: number) => `
Build a ${pageCount}-page activity book plan.

Theme: "${theme}"
Age range: ${ageRange}
KDP size: ${kdpSize}
Mix: 10 COLORING, 6 MAZE, 6 WORDSEARCH, 4 TRACING, 2 RIDDLE, 1 COVER, 1 INFO (copyright)

Rules:
- Coloring: thick-line black & white, simple shapes.
- Mazes: single solution; concept like "egg → nest".
- Word search: 6–8 words each, uppercase, kid-friendly.
- Tracing: A–H letters distributed; large letters, dotted lines.
- No brand/IP terms.

Return JSON only.`,
  },

  // Text generation – short, cheap content
  TEXT_GENERATION: {
    model: "gpt-4o-mini",
    temperature: 0.6,
    maxTokens: 400,

    RIDDLES: {
      system: `You write short, age-appropriate riddles for children. 
Keep language simple (CEFR A1–A2), no IP, no scary themes. Output an array of objects.`,
      userTemplate: (theme: string, ageRange: string, count: number) => `
Write ${count} riddles for ages ${ageRange} about ${theme}. 
Format: [{"riddle":"...","answer":"..."}, ...]
Max 18 words per riddle. One-word answer.`,
    },

    CAPTIONS: {
      system: `You write 1–2 sentence captions for coloring pages. Age 5–7, cheerful, simple verbs, no IP.
Return a string only.`,
      userTemplate: (subject: string) => `
Caption for a coloring page: "${subject}".
Limit 24 words. Present tense.`,
    },

    WORD_LISTS: {
      system: `Produce clean uppercase word lists for kid word searches. 
Only letters A–Z, 4–7 characters, age 5–7 vocabulary, no IP. Return JSON array of strings.`,
      userTemplate: (theme: string, count: number) => `
Give me ${count} words for the theme "${theme}" for kids: utensils, food, actions.`,
    },
  },

  // Image generation – coloring line art
  IMAGE_GENERATION: {
    model: "dall-e-3",
    size: "1024x1024",
    promptTemplate: (subject: string, ageRange: string) => `
Black and white coloring page, thick bold outlines, high contrast, no shading or greys, 
centered composition, minimal background clutter, suitable for ages ${ageRange}. 
Subject: ${subject}. 
Style: simple cartoon, clean edges, printable, no text, no watermark, no copyrighted characters or logos.`,
    negativePrompt:
      "photorealistic, grayscale shading, thin lines, complex background, text, watermark, logo, brand, IP",
  },

  // Safety / IP rewrite pre-filter
  SAFETY_FILTER: {
    model: "gpt-4o-mini",
    temperature: 0.0,
    system: `You are a content sanitizer. If the text includes any brands, characters, or trademarks 
(e.g., Pokémon, Paw Patrol, Roblox), replace with generic equivalents 
(e.g., monster buddies, puppy rescue team, block world). 
Return ONLY the sanitized text, no commentary.`,
    userTemplate: (text: string) => `
Sanitize this for kid-safe, brand-free generation:
"${text}"`,
  },
}

export const BOOK_SCHEMA = {
  kdpSize: ["8.5x11", "8x10", "6x9"] as const,
  ageRange: ["2-4", "5-7", "8-12"] as const,
  pageKinds: ["COVER", "COLORING", "MAZE", "WORDSEARCH", "TRACING", "RIDDLE", "MATH", "STORY", "INFO"] as const,
}
