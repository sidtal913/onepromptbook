import { createCanvas, loadImage } from "canvas"

interface CoverInput {
  title: string
  subtitle: string
  author: string
  imageUrl: string
  layout: {
    title: string
    subtitle: string
    author: string
  }
}

export async function drawCoverImage(input: CoverInput): Promise<Buffer> {
  const WIDTH = 1024
  const HEIGHT = 1536
  const canvas = createCanvas(WIDTH, HEIGHT)
  const ctx = canvas.getContext("2d")

  try {
    // Load and draw background image
    const background = await loadImage(input.imageUrl)
    ctx.drawImage(background, 0, 0, WIDTH, HEIGHT)

    // Add semi-transparent overlay for better text readability
    ctx.fillStyle = "rgba(0, 0, 0, 0.3)"
    ctx.fillRect(0, 0, WIDTH, HEIGHT)

    // Title style
    ctx.font = "bold 64px Arial, sans-serif"
    ctx.fillStyle = "#FFFFFF"
    ctx.textAlign = "center"
    ctx.lineWidth = 4
    ctx.strokeStyle = "#000000"

    // Draw title with word wrapping
    const titleY = positionFor(input.layout.title, HEIGHT, 0)
    drawWrappedText(ctx, input.title, WIDTH / 2, titleY, WIDTH - 100, 80)

    // Draw subtitle
    if (input.subtitle) {
      ctx.font = "bold 40px Arial, sans-serif"
      const subtitleY = positionFor(input.layout.subtitle, HEIGHT, 100)
      drawWrappedText(ctx, input.subtitle, WIDTH / 2, subtitleY, WIDTH - 100, 50)
    }

    // Draw author
    if (input.author) {
      ctx.font = "32px Arial, sans-serif"
      const authorY = positionFor(input.layout.author, HEIGHT, 0)
      drawText(ctx, `By ${input.author}`, WIDTH / 2, authorY)
    }

    return canvas.toBuffer("image/png")
  } catch (error) {
    console.error("Error generating cover:", error)
    throw new Error("Failed to generate cover image")
  }
}

function drawText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number) {
  ctx.strokeText(text, x, y)
  ctx.fillText(text, x, y)
}

function drawWrappedText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
) {
  const words = text.split(" ")
  let line = ""
  let currentY = y

  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + " "
    const metrics = ctx.measureText(testLine)
    const testWidth = metrics.width

    if (testWidth > maxWidth && n > 0) {
      drawText(ctx, line, x, currentY)
      line = words[n] + " "
      currentY += lineHeight
    } else {
      line = testLine
    }
  }
  drawText(ctx, line, x, currentY)
}

function positionFor(pos: string, height: number, offsetY: number): number {
  switch (pos) {
    case "top":
    case "top center":
      return 200 + offsetY
    case "center":
      return height / 2 + offsetY
    case "bottom":
    case "bottom center":
      return height - 200 + offsetY
    default:
      return height / 2 + offsetY
  }
}
