import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { PDFDocument, StandardFonts, rgb } from "pdf-lib"
import { classifyAndGenerateSpec, genreTemplates } from "@/lib/genre-classifier"

export const runtime = "nodejs"
export const maxDuration = 60

const OPENAI_API_KEY = process.env.OPENAI_API_KEY!
const SUPABASE_URL = process.env.SUPABASE_SUPABASE_SUPABASE_SUPABASE_SUPABASE_NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!
const BUCKET = "generated"

// ---------- Styles ----------
const STYLE_PRESETS: Record<string, string> = {
  "3d-animated": "3D animated, soft studio lighting, clean composition, kid-friendly",
  "realistic-photo": "photorealistic, natural lighting, 50mm lens, shallow depth of field, high detail",
  "flat-illustration": "flat vector illustration, simple shapes, bold clean lines, minimal shading",
  watercolor: "watercolor painting, soft edges, paper texture, gentle color gradients",
  sketch: "pencil sketch, cross-hatching, grayscale, hand-drawn look",
  "pixel-art": "pixel art, 32x32 game style, crisp pixels, limited palette",
  "line-art-coloring":
    "black outlines on white background, no shading, high-contrast line art, coloring page, empty interiors",
}

// ---------- Helpers ----------
function j(status: number, body: any) {
  return NextResponse.json(body, { status })
}
function safeSlug(s: string) {
  return String(s || "untitled")
    .toLowerCase()
    .replace(/[^a-z0-9._-]/g, "-")
}

async function openaiChatJSON(system: string, user: string, maxTokens = 1200) {
  const r = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      temperature: 0.6,
      response_format: { type: "json_object" },
      max_tokens: maxTokens,
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
    }),
  })
  if (!r.ok) {
    const text = await r.text().catch(() => "")
    throw new Error(`Chat failed: ${r.status} ${text}`)
  }
  const json = await r.json()
  const content = json?.choices?.[0]?.message?.content
  if (!content) throw new Error("Chat returned no content")
  return JSON.parse(content)
}

async function openaiImage(prompt: string, size: "256x256" | "512x512" | "1024x1024" = "1024x1024") {
  const r = await fetch("https://api.openai.com/v1/images/generations", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "dall-e-3",
      prompt,
      size,
      response_format: "b64_json",
    }),
  })
  if (!r.ok) {
    const text = await r.text().catch(() => "")
    throw new Error(`Image failed: ${r.status} ${text}`)
  }
  const json = await r.json()
  const b64 = json?.data?.[0]?.b64_json
  if (!b64) throw new Error("Image returned no data")
  return Buffer.from(b64, "base64")
}

async function uploadToSupabase(bytes: Buffer, key: string) {
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
  const up = await supabase.storage.from(BUCKET).upload(key, bytes, {
    contentType: key.endsWith(".png") ? "image/png" : "application/pdf",
    upsert: true,
  })
  if (up.error) throw new Error(`Supabase upload failed: ${up.error.message}`)
  return supabase.storage.from(BUCKET).getPublicUrl(key).data.publicUrl
}

// ---------- Book planners (JSON out) ----------
function plannerSystem(bookType: string) {
  return `You are a professional children's book creator and visual storytelling assistant.

Given a story idea or title, generate a complete ${bookType} book package with:

CRITICAL RULES - FOLLOW EXACTLY:
1. ALWAYS use the user's EXACT prompt to create the title and content
2. If user says "space adventure with astronauts", create a space adventure book with astronauts
3. If user says "alphabet A-Z", create exactly A, B, C... Z pages
4. NEVER generate random names like "larry et jerry" - use the user's actual request
5. Title must directly reflect what the user asked for
6. Content must match the user's specific request, not generic content

Respond **only** in this JSON format:
{
  "title": string (MUST reflect user's actual request),
  "subtitle": string (descriptive subtitle based on user prompt),
  "author": string,
  "storySummary": string,
  "imageStyle": "${bookType === "coloring" ? "line-art-coloring" : "flat-illustration"}",
  "layoutFormat": "8.5x11",
  "cover": {
    "front": {
      "title": string (same as main title),
      "subtitle": string,
      "tagline": string
    },
    "back": {
      "blurb": string
    }
  },
  "characters": [
    { "name": string, "description": string }
  ],
  "pages": [
    {
      "pageNumber": number,
      "kind": "${bookType}",
      ${
        bookType === "coloring"
          ? `
      "letter": string (for alphabet books),
      "word": string,
      "caption": string,
      "funNote": string,`
          : bookType === "story"
            ? `
      "title": string,
      "bodyMd": string,`
            : bookType === "recipe"
              ? `
      "title": string,
      "servings": number,
      "timeMinutes": number,
      "ingredients": [{"item": string, "qty": string}],
      "steps": [string],
      "tips": [string],
      "nutritionNote": string,`
              : `
      "title": string,
      "tools": [string],
      "steps": [string],
      "proTips": [string],`
      }
      "imagePrompt": string,
      "characters": [string]
    }
  ]
}`
}

function plannerUserPrompt(bookType: string, userPrompt: string, pages: number) {
  return `Create a ${pages}-page ${bookType} book based on this EXACT request: "${userPrompt}"

CRITICAL INSTRUCTIONS:
1. READ the user's request carefully: "${userPrompt}"
2. CREATE a ${bookType} book that directly fulfills their request
3. TITLE must reflect what they actually asked for
4. CONTENT must match their specific themes, characters, and settings

Examples of CORRECT behavior:
- User: "space adventure with astronauts" → Title: "Space Adventure with Astronauts" or "Journey to the Stars"
- User: "alphabet coloring book A to Z" → Title: "Alphabet Coloring Book" with pages A, B, C... Z
- User: "Niko the fox adventure" → Title: "Niko the Fox Adventure" with fox character named Niko

WRONG behavior (DO NOT DO):
- User: "space adventure" → Title: "larry et jerry" (WRONG - doesn't match request)
- User: "Niko the fox" → Title: "barry et larry" (WRONG - should be about Niko the fox)

Your task:
- Create exactly ${pages} items in "pages" array
- Each page includes a specific "imagePrompt" that matches the user's theme
- Keep language kid/family-friendly
- For "coloring": "imagePrompt" must describe LINE ART only (black outlines on white)
- For alphabet books: use format like "A is for Apple", "B is for Bear", etc.
- For "story": each page advances the plot based on user's request; end with closure
- Title should be creative but MUST reflect the user's actual request: "${userPrompt}"`
}

// ---------- PDF assembler (simple but decent) ----------
async function buildPdf(
  bookMeta: any,
  pages: any[],
  imageMap: Record<number, Buffer>,
  coverData?: { coverSpec: any; coverImageBuffer?: Buffer },
) {
  const pdf = await PDFDocument.create()
  const font = await pdf.embedFont(StandardFonts.Helvetica)
  const titleFont = await pdf.embedFont(StandardFonts.HelveticaBold)

  const coverPage = pdf.addPage()
  const { width, height } = coverPage.getSize()
  const margin = 36

  // Professional cover design
  if (coverData?.coverImageBuffer) {
    try {
      // Use generated cover image as background
      const coverImage = await pdf.embedPng(coverData.coverImageBuffer)
      const scale = Math.min(width / coverImage.width, height / coverImage.height)
      const imgW = coverImage.width * scale
      const imgH = coverImage.height * scale

      coverPage.drawImage(coverImage, {
        x: (width - imgW) / 2,
        y: (height - imgH) / 2,
        width: imgW,
        height: imgH,
      })

      // Add semi-transparent overlay for text readability
      coverPage.drawRectangle({
        x: 0,
        y: height * 0.6,
        width,
        height: height * 0.4,
        color: rgb(0, 0, 0),
        opacity: 0.3,
      })
    } catch (error) {
      console.error("[v0] Failed to embed cover image:", error)
      // Fall back to gradient background
    }
  }

  if (!coverData?.coverImageBuffer) {
    // Fallback gradient background based on genre
    const colors = [
      { r: 0.2, g: 0.6, b: 0.9 }, // Blue
      { r: 0.9, g: 0.4, b: 0.6 }, // Pink
      { r: 0.3, g: 0.8, b: 0.5 }, // Green
      { r: 0.9, g: 0.7, b: 0.2 }, // Yellow
    ]
    const bgColor = colors[Math.floor(Math.random() * colors.length)]

    coverPage.drawRectangle({
      x: 0,
      y: 0,
      width,
      height,
      color: rgb(bgColor.r, bgColor.g, bgColor.b),
    })
  }

  // Professional typography with better positioning
  const titleSize = Math.min(36, ((width - margin * 2) / bookMeta.title.length) * 2.5)
  const titleWidth = titleFont.widthOfTextAtSize(bookMeta.title, titleSize)

  // Title positioning based on cover spec or default
  const titleY = coverData?.coverSpec?.textPlacement?.title === "center" ? height * 0.5 : height * 0.75

  coverPage.drawText(bookMeta.title, {
    x: (width - titleWidth) / 2,
    y: titleY,
    size: titleSize,
    font: titleFont,
    color: rgb(1, 1, 1),
  })

  // Subtitle with better spacing
  if (bookMeta.subtitle) {
    const subtitleSize = 18
    const subtitleWidth = font.widthOfTextAtSize(bookMeta.subtitle, subtitleSize)
    const subtitleY = titleY - titleSize - 20

    coverPage.drawText(bookMeta.subtitle, {
      x: (width - subtitleWidth) / 2,
      y: subtitleY,
      size: subtitleSize,
      font: font,
      color: rgb(1, 1, 1),
    })
  }

  // Author with professional positioning
  const authorText = `by ${bookMeta.author}`
  const authorSize = 16
  const authorWidth = font.widthOfTextAtSize(authorText, authorSize)
  coverPage.drawText(authorText, {
    x: (width - authorWidth) / 2,
    y: height * 0.1,
    size: authorSize,
    font: font,
    color: rgb(1, 1, 1),
  })

  // Content pages
  for (let i = 0; i < pages.length; i++) {
    const p = pdf.addPage()
    const { width, height } = p.getSize()

    // Page title
    const pageTitle = pages[i].title || pages[i].caption || `Page ${i + 1}`
    p.drawText(pageTitle, { x: margin, y: height - margin - 16, size: 16, font: titleFont })

    // Image (if any)
    const imgBytes = imageMap[i]
    let yCursor = height - margin - 32
    if (imgBytes) {
      try {
        const png = await pdf.embedPng(imgBytes)
        const maxImgWidth = width - margin * 2
        const maxImgHeight = height * 0.5
        const scale = Math.min(maxImgWidth / png.width, maxImgHeight / png.height)
        const imgW = png.width * scale
        const imgH = png.height * scale

        p.drawImage(png, {
          x: (width - imgW) / 2,
          y: yCursor - imgH,
          width: imgW,
          height: imgH,
        })
        yCursor -= imgH + 12
      } catch {
        /* ignore image errors */
      }
    }

    const textBlocks: string[] = []
    const page = pages[i]

    if (page.kind === "coloring") {
      if (page.letter && page.word) {
        textBlocks.push(`${page.letter} is for ${page.word}`)
        textBlocks.push("")
      }
      if (page.caption) textBlocks.push(page.caption)
      if (page.funNote) textBlocks.push(page.funNote)
    } else if (page.kind === "recipe") {
      textBlocks.push(`Servings: ${page.servings}  ·  Time: ${page.timeMinutes} min`)
      textBlocks.push("")
      textBlocks.push("Ingredients:")
      page.ingredients?.forEach((ing: any) => textBlocks.push(`• ${ing.qty} ${ing.item}`))
      textBlocks.push("")
      textBlocks.push("Steps:")
      page.steps?.forEach((s: string, idx: number) => textBlocks.push(`${idx + 1}. ${s}`))
      if (page.tips?.length) {
        textBlocks.push("")
        textBlocks.push("Tips:")
        page.tips.forEach((t: string) => textBlocks.push(`– ${t}`))
      }
      if (page.nutritionNote) {
        textBlocks.push("")
        textBlocks.push(`Note: ${page.nutritionNote}`)
      }
    } else if (page.kind === "howto") {
      if (page.tools?.length) {
        textBlocks.push("Tools:")
        page.tools.forEach((t: string) => textBlocks.push(`• ${t}`))
        textBlocks.push("")
      }
      textBlocks.push("Steps:")
      page.steps?.forEach((s: string, idx: number) => textBlocks.push(`${idx + 1}. ${s}`))
      if (page.proTips?.length) {
        textBlocks.push("")
        textBlocks.push("Pro Tips:")
        page.proTips.forEach((t: string) => textBlocks.push(`– ${t}`))
      }
    } else {
      // story/intro generic body
      if (page.bodyMd) textBlocks.push(page.bodyMd.replace(/\n{3,}/g, "\n\n"))
    }

    // Render text blocks
    const lineHeight = 14
    let y = yCursor - 20
    const maxWidth = width - margin * 2
    const wrap = (s: string, max = 80) => s.replace(new RegExp(`(.{1,${max}})(\\s|$)`, "g"), "$1\n")

    textBlocks
      .join("\n")
      .split("\n")
      .forEach((line) => {
        const wrappedText = wrap(line)
        wrappedText.split("\n").forEach((l) => {
          if (!l.trim()) {
            y -= lineHeight
            return
          }
          if (y < margin + 24) return // overflow guard
          p.drawText(l, { x: margin, y, size: 12, font, color: rgb(0, 0, 0) })
          y -= lineHeight
        })
      })
  }

  return await pdf.save()
}

// ---------- Route ----------
export async function POST(req: Request) {
  const t0 = Date.now()
  try {
    if (!OPENAI_API_KEY) return j(500, { ok: false, error: "OPENAI_API_KEY missing" })

    const body = await req.json().catch(() => ({}))
    const {
      prompt,
      bookType = "story", // "recipe" | "coloring" | "story" | "howto"
      pages = 10,
      title = "",
      subtitle = "",
      author = "",
      style = "flat-illustration", // any key from STYLE_PRESETS
      size = "1024x1024",
      savePdf = true,
      saveImages = true,
    } = body

    if (!prompt) return j(400, { ok: false, error: "Missing 'prompt'" })
    if (!STYLE_PRESETS[style]) return j(400, { ok: false, error: `Unknown style '${style}'` })

    console.log(`[v0] Planning ${bookType} book: "${prompt}" (${pages} pages, ${style} style)`)

    const plannerPrompt = plannerUserPrompt(bookType, prompt, pages)
    const plan = await openaiChatJSON(plannerSystem(bookType), plannerPrompt, 3000)

    // Validate that the generated content actually matches the user's prompt
    const userPromptLower = prompt.toLowerCase()
    const generatedTitleLower = (plan.title || "").toLowerCase()

    // Extract key concepts from user prompt
    const promptKeywords = userPromptLower
      .split(/\s+/)
      .filter((word) => word.length > 2)
      .filter((word) => !["the", "and", "for", "with", "book", "story"].includes(word))

    const titleMatchesPrompt = promptKeywords.some(
      (keyword) =>
        generatedTitleLower.includes(keyword) ||
        generatedTitleLower.includes(keyword.substring(0, Math.max(3, keyword.length - 1))),
    )

    // If title doesn't match, create a proper title from the user's prompt
    if (!titleMatchesPrompt && !title) {
      console.log(`[v0] Generated title "${plan.title}" doesn't match prompt "${prompt}", creating proper title`)

      // Create a meaningful title from the user's prompt
      let fallbackTitle = prompt.charAt(0).toUpperCase() + prompt.slice(1)
      if (fallbackTitle.length > 50) {
        fallbackTitle = fallbackTitle.substring(0, 47) + "..."
      }

      // Add appropriate suffix based on book type
      if (bookType === "coloring" && !fallbackTitle.toLowerCase().includes("coloring")) {
        fallbackTitle += " Coloring Book"
      } else if (
        bookType === "story" &&
        !fallbackTitle.toLowerCase().includes("story") &&
        !fallbackTitle.toLowerCase().includes("adventure")
      ) {
        fallbackTitle = "The " + fallbackTitle
      }

      plan.title = fallbackTitle
      if (plan.cover?.front) {
        plan.cover.front.title = fallbackTitle
      }
    }

    // allow user-supplied title overrides
    const meta = {
      title: title || plan.title || "Untitled",
      subtitle: subtitle || plan.subtitle || "",
      author: author || plan.author || "Anonymous",
      bookType,
      style,
    }

    console.log(`[v0] Generated book plan: "${meta.title}" with ${plan.pages.length} pages`)

    const coverData = await generateProfessionalCover(meta, prompt, style)
    console.log(`[v0] Generated professional cover for ${coverData.coverSpec?.genre || "generic"} book`)

    // 2) Generate images per-page
    const results: Array<{
      index: number
      text: any
      image?: string
    }> = []

    const imageBytesMap: Record<number, Buffer> = {}
    const stylePrompt = STYLE_PRESETS[style]

    for (let i = 0; i < plan.pages.length; i++) {
      const p = plan.pages[i]
      const basePrompt = p.imagePrompt || ""
      let imageBase64: string | undefined

      try {
        const pageSpecificPrompt = `Page ${i + 1} of ${plan.pages.length}: ${basePrompt}`
        const imgPrompt =
          style === "line-art-coloring"
            ? `${pageSpecificPrompt}\nStyle: ${stylePrompt}. Pure black outlines, white background, no fill, no shading, high-contrast, suitable for coloring. Unique illustration for page ${i + 1}.`
            : `${pageSpecificPrompt}\nStyle: ${stylePrompt}. Unique illustration for page ${i + 1}.`

        console.log(`[v0] Generating unique image ${i + 1}/${plan.pages.length}`)
        console.log(`[v0] Page ${i + 1} prompt: ${imgPrompt.substring(0, 150)}...`)

        const uniquePrompt = `${imgPrompt} [Generated at ${Date.now()}]`
        const imageBuffer = await openaiImage(uniquePrompt, size)

        const bufferHash = imageBuffer.subarray(0, 32).toString("hex")
        console.log(`[v0] Generated image ${i + 1} - Size: ${imageBuffer.length} bytes, Hash: ${bufferHash}`)

        imageBytesMap[i] = imageBuffer
        imageBase64 = `data:image/png;base64,${imageBuffer.toString("base64")}`

        console.log(`[v0] Successfully generated unique image ${i + 1}`)
      } catch (e: any) {
        console.error(`[v0] Image generation failed for page ${i + 1}:`, e.message)
        // continue without image
      }

      results.push({
        index: i + 1,
        text: p,
        image: imageBase64,
      })
    }

    console.log(`[v0] Generated ${results.length} pages in ${Date.now() - t0}ms`)

    // 3) Build PDF with professional cover
    let pdfUrl: string | undefined
    if (savePdf) {
      try {
        const pdfBytes = await buildPdf(meta, plan.pages, imageBytesMap, coverData)
        console.log(`[v0] Generated PDF with professional cover, size: ${pdfBytes.length} bytes`)
        pdfUrl = `data:application/pdf;base64,${Buffer.from(pdfBytes).toString("base64")}`
      } catch (e: any) {
        console.error(`[v0] PDF generation failed:`, e.message)
      }
    }

    return j(200, {
      ok: true,
      meta: {
        ...meta,
        coverSpec: coverData.coverSpec,
      },
      pages: results.length,
      results,
      pdfUrl,
      coverImage: coverData.coverImageBuffer
        ? `data:image/png;base64,${coverData.coverImageBuffer.toString("base64")}`
        : undefined,
      tookMs: Date.now() - t0,
    })
  } catch (e: any) {
    console.error(`[v0] Book generation failed:`, e.message)
    return j(500, { ok: false, error: "Generation failed", detail: e?.message || String(e) })
  }
}

async function generateProfessionalCover(
  bookMeta: any,
  userPrompt: string,
  style: string,
): Promise<{ coverSpec: any; coverImageBuffer?: Buffer }> {
  try {
    // Use genre classifier to create professional cover specification
    const coverSpec = await classifyAndGenerateSpec(userPrompt, bookMeta.title, bookMeta.subtitle)

    // Generate cover image with enhanced prompt
    const enhancedPrompt = `Professional book cover design: ${coverSpec.imagePrompt}. 
    Style: ${coverSpec.style}. 
    Color scheme: ${coverSpec.colorScheme}. 
    High quality, commercial book cover, professional typography space, 
    ${coverSpec.genre.toLowerCase()} genre, suitable for print and digital.
    Leave space for title text overlay.`

    console.log(`[v0] Generating professional ${coverSpec.genre} cover...`)

    const coverImageBuffer = await openaiImage(enhancedPrompt, "1024x1024")

    return { coverSpec, coverImageBuffer }
  } catch (error) {
    console.error("[v0] Professional cover generation failed:", error)

    // Fallback to genre template
    const fallbackGenre = "Children's Book"
    const template = genreTemplates[fallbackGenre]
    const fallbackPrompt = `${template.imagePrompt}. Professional book cover design, leave space for title text.`

    try {
      const coverImageBuffer = await openaiImage(fallbackPrompt, "1024x1024")
      return {
        coverSpec: {
          genre: fallbackGenre,
          title: bookMeta.title,
          subtitle: bookMeta.subtitle,
          style: template.style,
          colorScheme: template.colorScheme,
          textPlacement: template.textPlacement,
        },
        coverImageBuffer,
      }
    } catch {
      return { coverSpec: null }
    }
  }
}
