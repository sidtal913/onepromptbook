export async function generateImage(prompt: string, style = "cartoon"): Promise<string> {
  try {
    // Enhanced prompt with style
    const enhancedPrompt = `${prompt}, ${style} style, high quality, detailed, vibrant colors, professional illustration`

    const response = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "dall-e-3",
        prompt: enhancedPrompt,
        n: 1,
        size: "1024x1024",
        quality: "standard",
      }),
    })

    if (!response.ok) {
      throw new Error(`DALL-E API error: ${response.status}`)
    }

    const data = await response.json()
    const imageUrl = data.data[0]?.url

    if (!imageUrl) {
      throw new Error("No image URL received from DALL-E")
    }

    return imageUrl
  } catch (error) {
    console.error("Error generating image:", error)
    throw new Error("Failed to generate image")
  }
}

export async function generateCoverImage(prompt: string, style = "cartoon"): Promise<string> {
  const coverPrompt = `Book cover illustration: ${prompt}, ${style} style, vertical 2:3 aspect ratio, suitable for children's book cover, no text or letters, high quality, detailed`
  return generateImage(coverPrompt, style)
}
