import jsPDF from "jspdf"
import { Buffer } from "buffer"

// Amazon KDP standard sizes (in inches, converted to points: 1 inch = 72 points)
export const KDP_SIZES = {
  "6x9": { width: 432, height: 648 }, // Most popular for children's books
  "7x10": { width: 504, height: 720 },
  "8x10": { width: 576, height: 720 },
  "8.5x8.5": { width: 612, height: 612 }, // Square format
  "8.5x11": { width: 612, height: 792 }, // Letter size
} as const

export type KDPSize = keyof typeof KDP_SIZES

export interface BookData {
  title: string
  subtitle?: string
  author?: string
  pages: Array<{
    pageNumber: number
    text?: string
    title?: string
    imageUrl?: string
    imagePrompt?: string
    activityType?: string
    instructions?: string
    error?: boolean
  }>
  metadata: {
    generatedAt: string
    pageCount: number
    wordCount: number
  }
}

export interface PDFOptions {
  trimSize: string
  includeBleed?: boolean
  bookType: "story" | "coloring" | "activity" | "mixed"
  fontSize?: number
  margins?: {
    top: number
    bottom: number
    left: number
    right: number
  }
}

export function validateTrimSize(size: string): boolean {
  return size in KDP_SIZES
}

async function fetchImageAsBase64(imageUrl: string): Promise<string | null> {
  try {
    const response = await fetch(imageUrl)
    if (!response.ok) return null

    const arrayBuffer = await response.arrayBuffer()
    const base64 = Buffer.from(arrayBuffer).toString("base64")
    const contentType = response.headers.get("content-type") || "image/jpeg"

    return `data:${contentType};base64,${base64}`
  } catch (error) {
    console.error("Failed to fetch image:", error)
    return null
  }
}

async function generateCoverArt(title: string, bookType: string): Promise<string | null> {
  try {
    if (typeof process === "undefined" || !process.env) {
      return null
    }

    const fal = await import("@fal-ai/serverless-client")
    fal.config({ credentials: process.env.FAL_KEY })

    const coverPrompt = `Professional book cover illustration for "${title}". ${
      bookType === "story"
        ? "Whimsical children's book style, colorful, engaging, suitable for cover art"
        : bookType === "coloring"
          ? "Simple line art style suitable for coloring book cover, black and white outlines"
          : "Educational activity book cover, fun and engaging design"
    }. High quality, professional book cover design.`

    const result = await fal.subscribe("fal-ai/flux/schnell", {
      input: {
        prompt: coverPrompt,
        image_size: "portrait_4_3",
        num_inference_steps: 4,
        enable_safety_checker: true,
      },
    })

    if (result.images?.[0]?.url) {
      return await fetchImageAsBase64(result.images[0].url)
    }
    return null
  } catch (error) {
    console.error("Failed to generate cover art:", error)
    return null
  }
}

export async function generateBookPDF(bookData: BookData, options: PDFOptions): Promise<Buffer> {
  const trimSize = options.trimSize as KDPSize
  const pageSize = KDP_SIZES[trimSize]

  if (!pageSize) {
    throw new Error(`Invalid trim size: ${options.trimSize}`)
  }

  const doc = new jsPDF({
    orientation: pageSize.width > pageSize.height ? "landscape" : "portrait",
    unit: "pt",
    format: [pageSize.width, pageSize.height],
  })

  const margins = options.margins || { top: 72, bottom: 72, left: 72, right: 72 }
  const fontSize = options.fontSize || 14

  await addEnhancedTitlePage(
    doc,
    bookData.title,
    bookData.subtitle || "",
    bookData.author || "",
    pageSize,
    options.bookType,
  )

  // Add content pages based on book type
  for (const page of bookData.pages) {
    doc.addPage()

    switch (options.bookType) {
      case "story":
        await addStoryPage(doc, page, pageSize, margins, fontSize)
        break
      case "coloring":
        await addColoringPage(doc, page, pageSize, margins)
        break
      case "activity":
        await addActivityPage(doc, page, pageSize, margins)
        break
      case "mixed":
        if (page.activityType) {
          await addActivityPage(doc, page, pageSize, margins)
        } else {
          await addStoryPage(doc, page, pageSize, margins, fontSize)
        }
        break
    }
  }

  doc.addPage()
  await addBackCover(doc, bookData, pageSize, margins)

  return Buffer.from(doc.output("arraybuffer"))
}

async function addEnhancedTitlePage(
  doc: jsPDF,
  title: string,
  subtitle = "",
  author = "",
  pageSize: { width: number; height: number },
  bookType: string,
) {
  const { width, height } = pageSize
  const centerX = width / 2

  // Generate and add cover art
  const coverArt = await generateCoverArt(title, bookType)
  if (coverArt) {
    try {
      doc.addImage(coverArt, "JPEG", 40, 40, width - 80, height * 0.5)
    } catch (error) {
      console.error("Failed to add cover art:", error)
      // Fallback to colored background
      doc.setFillColor(100, 150, 200)
      doc.rect(40, 40, width - 80, height * 0.5, "F")
    }
  } else {
    // Fallback cover design
    doc.setFillColor(100, 150, 200)
    doc.rect(40, 40, width - 80, height * 0.5, "F")
  }

  const titleY = height * 0.6
  doc.setFontSize(28)
  doc.setFont("helvetica", "bold")
  doc.setTextColor(255, 255, 255)

  // Add text shadow effect
  doc.setTextColor(0, 0, 0)
  const titleLines = doc.splitTextToSize(title, width * 0.7)
  titleLines.forEach((line: string, index: number) => {
    doc.text(line, centerX + 2, titleY + 2 + index * 35, { align: "center" })
  })

  // Main title text
  doc.setTextColor(255, 255, 255)
  titleLines.forEach((line: string, index: number) => {
    doc.text(line, centerX, titleY + index * 35, { align: "center" })
  })

  if (subtitle) {
    doc.setFontSize(18)
    doc.setFont("helvetica", "normal")
    doc.setTextColor(220, 220, 220)
    const subtitleY = titleY + titleLines.length * 35 + 20
    const subtitleLines = doc.splitTextToSize(subtitle, width * 0.7)
    subtitleLines.forEach((line: string, index: number) => {
      doc.text(line, centerX, subtitleY + index * 25, { align: "center" })
    })
  }

  if (author) {
    doc.setFontSize(16)
    doc.setFont("helvetica", "normal")
    doc.setTextColor(200, 200, 200)
    doc.text(author, centerX, height - 100, { align: "center" })
  }

  // Publisher info
  doc.setFontSize(14)
  doc.setFont("helvetica", "normal")
  doc.setTextColor(240, 240, 240)
  doc.text("A OnePromptBook Creation", centerX, height - 60, { align: "center" })

  // Decorative border
  doc.setDrawColor(255, 255, 255)
  doc.setLineWidth(3)
  doc.rect(40, 40, width - 80, height - 80)
}

async function processImageData(imageUrl: string): Promise<string | null> {
  try {
    // Check if it's already base64 data
    if (imageUrl.startsWith("data:image/")) {
      return imageUrl
    }

    // If it's a URL, fetch it and convert to base64
    return await fetchImageAsBase64(imageUrl)
  } catch (error) {
    console.error("Failed to process image data:", error)
    return null
  }
}

async function addStoryPage(
  doc: jsPDF,
  page: any,
  pageSize: { width: number; height: number },
  margins: any,
  fontSize: number,
) {
  const { width, height } = pageSize
  const imageHeight = height * 0.6

  if (page.imageUrl && page.imageUrl.trim() !== "") {
    const imageData = await processImageData(page.imageUrl)
    if (imageData) {
      try {
        doc.addImage(imageData, "JPEG", margins.left, margins.top, width - margins.left - margins.right, imageHeight)
      } catch (error) {
        console.error("Failed to add image:", error)
        addImagePlaceholder(doc, pageSize, margins, imageHeight, "Generated Illustration")
      }
    } else {
      addImagePlaceholder(doc, pageSize, margins, imageHeight, "Generated Illustration")
    }
  } else {
    addImagePlaceholder(
      doc,
      pageSize,
      margins,
      imageHeight,
      page.error ? "Image Generation Failed" : "Generated Illustration",
    )
  }

  // Text content
  if (page.text) {
    const textY = margins.top + imageHeight + 40
    doc.setFontSize(fontSize)
    doc.setTextColor(0, 0, 0)
    doc.setFont("helvetica", "normal")

    const textLines = doc.splitTextToSize(page.text, width - margins.left - margins.right)
    textLines.forEach((line: string, index: number) => {
      doc.text(line, margins.left, textY + index * (fontSize + 4))
    })
  }

  // Page number
  doc.setFontSize(12)
  doc.setTextColor(100, 100, 100)
  doc.text(page.pageNumber.toString(), width / 2, height - margins.bottom / 2, { align: "center" })
}

async function addColoringPage(doc: jsPDF, page: any, pageSize: { width: number; height: number }, margins: any) {
  const { width, height } = pageSize

  if (page.imageUrl) {
    const imageData = await processImageData(page.imageUrl)
    if (imageData) {
      try {
        doc.addImage(
          imageData,
          "JPEG",
          margins.left,
          margins.top,
          width - margins.left - margins.right,
          height - margins.top - margins.bottom - 40,
        )
      } catch (error) {
        console.error("Failed to add coloring image:", error)
        // Fallback to placeholder
        addColoringPlaceholder(doc, page, pageSize, margins)
      }
    } else {
      addColoringPlaceholder(doc, page, pageSize, margins)
    }
  } else {
    addColoringPlaceholder(doc, page, pageSize, margins)
  }

  // Page number
  doc.setFontSize(12)
  doc.setTextColor(100, 100, 100)
  doc.text(page.pageNumber.toString(), width / 2, height - margins.bottom / 2, { align: "center" })
}

function addColoringPlaceholder(doc: jsPDF, page: any, pageSize: { width: number; height: number }, margins: any) {
  const { width, height } = pageSize

  doc.setFillColor(255, 255, 255)
  doc.setDrawColor(0, 0, 0)
  doc.setLineWidth(1)
  doc.rect(
    margins.left,
    margins.top,
    width - margins.left - margins.right,
    height - margins.top - margins.bottom - 40,
    "D",
  )

  doc.setFontSize(14)
  doc.setTextColor(100, 100, 100)
  doc.text("Coloring Page", width / 2, height / 2, { align: "center" })

  if (page.title) {
    doc.setFontSize(12)
    doc.text(page.title, width / 2, height / 2 + 30, { align: "center" })
  }
}

async function addActivityPage(doc: jsPDF, page: any, pageSize: { width: number; height: number }, margins: any) {
  const { width, height } = pageSize

  // Activity title
  if (page.title) {
    doc.setFontSize(18)
    doc.setFont("helvetica", "bold")
    doc.text(page.title, width / 2, margins.top + 30, { align: "center" })
  }

  // Instructions
  if (page.instructions) {
    doc.setFontSize(12)
    doc.setFont("helvetica", "normal")
    const instructionLines = doc.splitTextToSize(page.instructions, width - margins.left - margins.right)
    instructionLines.forEach((line: string, index: number) => {
      doc.text(line, margins.left, margins.top + 70 + index * 16)
    })
  }

  const activityY = margins.top + 120
  if (page.imageUrl) {
    const imageData = await processImageData(page.imageUrl)
    if (imageData) {
      try {
        doc.addImage(
          imageData,
          "JPEG",
          margins.left,
          activityY,
          width - margins.left - margins.right,
          height - activityY - margins.bottom - 40,
        )
      } catch (error) {
        addActivityPlaceholder(doc, page, pageSize, margins, activityY)
      }
    } else {
      addActivityPlaceholder(doc, page, pageSize, margins, activityY)
    }
  } else {
    addActivityPlaceholder(doc, page, pageSize, margins, activityY)
  }

  // Page number
  doc.setFontSize(12)
  doc.setTextColor(100, 100, 100)
  doc.text(page.pageNumber.toString(), width / 2, height - margins.bottom / 2, { align: "center" })
}

function addActivityPlaceholder(
  doc: jsPDF,
  page: any,
  pageSize: { width: number; height: number },
  margins: any,
  activityY: number,
) {
  const { width, height } = pageSize

  doc.setFillColor(250, 250, 250)
  doc.setDrawColor(200, 200, 200)
  doc.rect(
    margins.left,
    activityY,
    width - margins.left - margins.right,
    height - activityY - margins.bottom - 40,
    "FD",
  )

  doc.setFontSize(14)
  doc.setTextColor(150, 150, 150)
  doc.text(`${page.activityType || "Activity"} will be generated here`, width / 2, activityY + 100, { align: "center" })
}

async function addBackCover(doc: jsPDF, bookData: BookData, pageSize: { width: number; height: number }, margins: any) {
  const { width, height } = pageSize
  const centerX = width / 2

  // Background
  doc.setFillColor(245, 245, 245)
  doc.rect(0, 0, width, height, "F")

  // Title
  doc.setFontSize(24)
  doc.setFont("helvetica", "bold")
  doc.setTextColor(50, 50, 50)
  doc.text(bookData.title, centerX, margins.top + 50, { align: "center" })

  // Summary section
  doc.setFontSize(16)
  doc.setFont("helvetica", "bold")
  doc.setTextColor(80, 80, 80)
  doc.text("Story Summary", centerX, margins.top + 120, { align: "center" })

  // Generate summary from first few pages
  const summaryText =
    bookData.pages
      .slice(0, 3)
      .map((page) => page.text)
      .filter(Boolean)
      .join(" ")
      .substring(0, 300) + "..."

  doc.setFontSize(12)
  doc.setFont("helvetica", "normal")
  doc.setTextColor(60, 60, 60)
  const summaryLines = doc.splitTextToSize(summaryText, width - margins.left - margins.right - 40)
  summaryLines.forEach((line: string, index: number) => {
    doc.text(line, margins.left + 20, margins.top + 160 + index * 16)
  })

  // Book details
  const detailsY = height - 200
  doc.setFontSize(11)
  doc.setTextColor(100, 100, 100)
  doc.text(`Pages: ${bookData.metadata.pageCount}`, centerX, detailsY, { align: "center" })
  doc.text(`Generated: ${new Date(bookData.metadata.generatedAt).toLocaleDateString()}`, centerX, detailsY + 20, {
    align: "center",
  })
  doc.text("Created with OnePromptBook", centerX, detailsY + 40, { align: "center" })

  // Decorative border
  doc.setDrawColor(150, 150, 150)
  doc.setLineWidth(2)
  doc.rect(20, 20, width - 40, height - 40)
}

// Utility function to generate PDF
export async function generateProjectPDF(project: any, options: Partial<PDFOptions> = {}): Promise<Uint8Array> {
  const pdfOptions: PDFOptions = {
    trimSize: "6x9",
    includeBleed: false,
    bookType: "story",
    fontSize: 14,
    margins: { top: 72, bottom: 72, left: 72, right: 72 },
    ...options,
  }

  const bookData = {
    title: project.meta?.title || project.title || "Generated Book",
    subtitle: project.meta?.subtitle || "",
    author: project.meta?.author || "By OnePromptBook",
    pages: project.content?.pages || project.pages || [],
    metadata: {
      generatedAt: new Date().toISOString(),
      pageCount: project.content?.pages?.length || project.pages?.length || 0,
      wordCount: 0,
    },
  }

  const buffer = await generateBookPDF(bookData, {
    trimSize: pdfOptions.trimSize,
    bookType: project.type === "coloring-book" ? "coloring" : "story",
    includeBleed: pdfOptions.includeBleed,
    fontSize: pdfOptions.fontSize,
    margins: pdfOptions.margins,
  })

  return new Uint8Array(buffer)
}

// Helper function for consistent image placeholders
function addImagePlaceholder(
  doc: jsPDF,
  pageSize: { width: number; height: number },
  margins: any,
  imageHeight: number,
  message: string,
) {
  const { width } = pageSize

  doc.setFillColor(240, 240, 240)
  doc.setDrawColor(200, 200, 200)
  doc.setLineWidth(1)
  doc.rect(margins.left, margins.top, width - margins.left - margins.right, imageHeight, "FD")

  doc.setFontSize(12)
  doc.setTextColor(120, 120, 120)
  doc.text(message, width / 2, margins.top + imageHeight / 2, { align: "center" })
}
