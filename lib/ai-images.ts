import "server-only"

async function tryFal(prompt: string, size: "landscape_4_3" | "square_hd") {
  if (!process.env.FAL_KEY) return null
  const fal = await import("@fal-ai/serverless-client")
  fal.config({ credentials: process.env.FAL_KEY })
  const resp = await fal.subscribe("fal-ai/flux/schnell", {
    input: {
      prompt,
      image_size: size,
      num_inference_steps: 4,
      enable_safety_checker: true,
    },
  } as any)
  const url = resp?.images?.[0]?.url as string | undefined
  return url ?? null
}

async function tryOpenAI(prompt: string, size: "landscape_4_3" | "square_hd") {
  if (!process.env.OPENAI_API_KEY) return null
  const { default: OpenAI } = await import("openai")
  const oa = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! })
  const px = size === "square_hd" ? "1024x1024" : "1024x768"
  const r = await oa.images.generate({
    model: "dall-e-3",
    size: px as any,
    prompt,
  })
  const url = r.data[0]?.url
  return url ?? null
}

export async function generateIllustration(prompt: string, { mode }: { mode: "Story" | "Coloring" }) {
  const normalized =
    mode === "Coloring"
      ? `Coloring book line art (black & white, thick outlines, no shading). ${prompt}`
      : `Children's book illustration, friendly, bright colors: ${prompt}`

  const size = mode === "Coloring" ? "square_hd" : "landscape_4_3"
  return (
    (await tryFal(normalized, size)) ??
    (await tryOpenAI(normalized, size)) ??
    `/placeholder.svg?height=${size === "square_hd" ? 1024 : 768}&width=${
      size === "square_hd" ? 1024 : 1024
    }&text=${encodeURIComponent("Image unavailable")}`
  )
}
