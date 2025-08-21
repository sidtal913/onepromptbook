import { type NextRequest, NextResponse } from "next/server"
import { generateBookPDF, validateTrimSize, type BookData, type PDFOptions } from "@/lib/pdf-generator"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      pages,
      format,
      bookType = "story",
      includeBleed = false,
      title = "Generated Book",
      subtitle = "",
      author = "",
      bookTitle,
      bookSubtitle,
    } = body

    console.log("[v0] PDF Export - Received pages:", pages?.length || 0)
    console.log("[v0] PDF Export - Sample page structure:", pages?.[0] ? Object.keys(pages[0]) : "No pages")

    const finalTitle = bookTitle || title
    const finalSubtitle = bookSubtitle || subtitle

    if (!pages || !Array.isArray(pages)) {
      return NextResponse.json({ error: "Invalid pages data" }, { status: 400 })
    }

    if (!validateTrimSize(format)) {
      return NextResponse.json({ error: "Invalid trim size format" }, { status: 400 })
    }

    const extractTextFromPage = (page: any): string => {
      console.log("[v0] Extracting text from page:", Object.keys(page))
      console.log("[v0] Page data:", JSON.stringify(page, null, 2))

      // Handle direct text properties
      if (typeof page.text === "string" && page.text.trim()) return page.text
      if (typeof page.content === "string" && page.content.trim()) return page.content
      if (typeof page.bodyMd === "string" && page.bodyMd.trim()) return page.bodyMd

      // Handle nested text object (common in book generation API responses)
      if (page.text && typeof page.text === "object") {
        const textObj = page.text
        if (typeof textObj.bodyMd === "string" && textObj.bodyMd.trim()) return textObj.bodyMd
        if (typeof textObj.content === "string" && textObj.content.trim()) return textObj.content
        if (typeof textObj.text === "string" && textObj.text.trim()) return textObj.text

        // Handle coloring book structure
        if (textObj.letter && textObj.word) {
          const parts = [`${textObj.letter} is for ${textObj.word}`]
          if (textObj.caption) parts.push(textObj.caption)
          if (textObj.funNote) parts.push(textObj.funNote)
          return parts.join(". ")
        }

        // Handle recipe structure
        if (textObj.ingredients && Array.isArray(textObj.ingredients)) {
          const parts = []
          if (textObj.title) parts.push(textObj.title)
          parts.push("Ingredients:")
          parts.push(...textObj.ingredients.map((ing: any) => `${ing.qty} ${ing.item}`))
          if (textObj.steps && Array.isArray(textObj.steps)) {
            parts.push("Steps:")
            parts.push(...textObj.steps.map((step: string, idx: number) => `${idx + 1}. ${step}`))
          }
          return parts.join(" ")
        }

        // Handle how-to structure
        if (textObj.tools && Array.isArray(textObj.tools)) {
          const parts = []
          if (textObj.title) parts.push(textObj.title)
          parts.push("Tools needed:")
          parts.push(...textObj.tools.map((tool: string) => `• ${tool}`))
          if (textObj.steps && Array.isArray(textObj.steps)) {
            parts.push("Steps:")
            parts.push(...textObj.steps.map((step: string, idx: number) => `${idx + 1}. ${step}`))
          }
          return parts.join(" ")
        }

        // Try to extract any string values from the object
        const stringValues = Object.values(textObj).filter((val) => typeof val === "string" && val.trim())
        if (stringValues.length > 0) return stringValues.join(". ")
      }

      const parts: string[] = []

      // Handle direct page properties (original logic)
      if (page.letter && page.word) parts.push(`${page.letter} is for ${page.word}`)
      if (page.caption) parts.push(page.caption)
      if (page.funNote) parts.push(page.funNote)
      if (page.title) parts.push(page.title)

      // Handle recipe pages
      if (page.ingredients && Array.isArray(page.ingredients)) {
        parts.push("Ingredients:")
        parts.push(...page.ingredients.map((ing: any) => `${ing.qty} ${ing.item}`))
      }
      if (page.steps && Array.isArray(page.steps)) {
        parts.push("Steps:")
        parts.push(...page.steps.map((step: string, idx: number) => `${idx + 1}. ${step}`))
      }

      // Handle how-to pages
      if (page.tools && Array.isArray(page.tools)) {
        parts.push("Tools needed:")
        parts.push(...page.tools.map((tool: string) => `• ${tool}`))
      }
      if (page.proTips && Array.isArray(page.proTips)) {
        parts.push("Pro Tips:")
        parts.push(...page.proTips.map((tip: string) => `• ${tip}`))
      }

      if (parts.length === 0) {
        // Try to find any string properties that might contain content
        const allStringValues = Object.entries(page)
          .filter(
            ([key, value]) =>
              typeof value === "string" &&
              value.trim() &&
              !["id", "index", "pageNumber", "imageUrl", "image", "imagePrompt"].includes(key),
          )
          .map(([key, value]) => value as string)

        if (allStringValues.length > 0) {
          parts.push(...allStringValues)
        }
      }

      const result = parts.join(" ")
      console.log("[v0] Extracted text length:", result.length)
      console.log("[v0] Extracted text preview:", result.substring(0, 100))
      return result || `Page ${page.index || page.pageNumber || "Unknown"} content`
    }

    const bookData: BookData = {
      title: finalTitle,
      subtitle: finalSubtitle,
      author,
      pages: pages.map((page: any, index: number) => {
        let imageUrl = page.imageUrl || page.image

        // Handle nested image object
        if (!imageUrl && page.image && typeof page.image === "object") {
          imageUrl = page.image.url || page.image.imageUrl
        }

        console.log(`[v0] Page ${index + 1} image URL:`, imageUrl ? "Present" : "Missing")
        console.log(`[v0] Page ${index + 1} full structure:`, Object.keys(page))

        return {
          pageNumber: index + 1,
          text: extractTextFromPage(page),
          title: page.title || page.caption || (page.text && page.text.title) || `Page ${index + 1}`,
          imageUrl: imageUrl,
          imagePrompt: page.imagePrompt || page.prompt || (page.text && page.text.imagePrompt),
          activityType: page.activityType || page.kind || (page.text && page.text.kind),
          instructions: page.instructions || (page.text && page.text.instructions),
        }
      }),
      metadata: {
        generatedAt: new Date().toISOString(),
        pageCount: pages.length,
        wordCount: pages.reduce((acc: number, page: any) => {
          const text = extractTextFromPage(page)
          return acc + (text ? text.split(" ").length : 0)
        }, 0),
      },
    }

    console.log("[v0] Book data prepared - Pages:", bookData.pages.length, "Word count:", bookData.metadata.wordCount)

    const pdfOptions: PDFOptions = {
      trimSize: format,
      includeBleed,
      bookType: bookType as "story" | "coloring" | "activity" | "mixed",
      fontSize: bookType === "story" ? 14 : 12,
      margins: {
        top: bookType === "coloring" ? 36 : 72,
        bottom: bookType === "coloring" ? 36 : 72,
        left: bookType === "coloring" ? 36 : 72,
        right: bookType === "coloring" ? 36 : 72,
      },
    }

    console.log("[v0] Generating PDF with options:", pdfOptions)
    const pdfBuffer = await generateBookPDF(bookData, pdfOptions)
    console.log("[v0] PDF generated successfully, size:", pdfBuffer.length, "bytes")

    const filename = `${finalTitle.replace(/[^a-zA-Z0-9]/g, "-").toLowerCase()}-${format}.pdf`

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store, no-cache, must-revalidate",
        "Content-Length": pdfBuffer.length.toString(),
        "Accept-Ranges": "bytes",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    })
  } catch (error) {
    console.error("[v0] PDF generation error:", error)
    return NextResponse.json(
      { error: "Failed to generate PDF", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}
