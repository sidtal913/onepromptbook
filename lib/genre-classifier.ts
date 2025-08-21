export interface BookCoverSpec {
  genre: string
  title: string
  subtitle: string
  imagePrompt: string
  style: string
  textPlacement: {
    title: string
    subtitle: string
  }
  colorScheme: string
}

export const classifyAndGenerateSpec = async (
  userPrompt: string,
  title: string,
  subtitle: string,
): Promise<BookCoverSpec> => {
  const system = `You are a professional book cover designer and genre classifier. 
Given a user's book description, identify the genre and create a detailed visual specification for a professional book cover.

Return JSON with this exact structure:
{
  "genre": "Children's Book" | "Recipe Book" | "Fiction" | "Bedtime Story" | "Travel Guide" | "Coloring Book" | "Educational",
  "title": "extracted or provided title",
  "subtitle": "extracted or provided subtitle", 
  "imagePrompt": "detailed visual description for professional book cover illustration",
  "style": "cartoon" | "photorealistic" | "watercolor" | "digital painting" | "flat vector" | "3d rendered",
  "textPlacement": {
    "title": "top" | "center" | "bottom",
    "subtitle": "below title" | "center" | "bottom"
  },
  "colorScheme": "vibrant" | "warm" | "cool" | "pastel" | "dark" | "bright"
}

Genre Guidelines:
- Children's Book: Cartoon style, vibrant colors, cute characters, playful scenes
- Recipe Book: Photorealistic food, ingredients, kitchen scenes, warm lighting
- Bedtime Story: Soft colors, dreamy scenes, night themes, calming imagery
- Fiction: Genre-appropriate (mystery=dark, romance=warm, sci-fi=futuristic)
- Coloring Book: Simple line art, clear outlines, age-appropriate subjects
- Educational: Clean, informative visuals, professional appearance

Make the imagePrompt very specific with details about composition, lighting, style, and mood.`

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4",
        messages: [
          { role: "system", content: system },
          { role: "user", content: `Book description: "${userPrompt}"\nTitle: "${title}"\nSubtitle: "${subtitle}"` },
        ],
        temperature: 0.7,
        max_tokens: 500,
      }),
    })

    const data = await response.json()
    const content = data.choices[0].message.content

    // Parse JSON response
    const spec = JSON.parse(content)
    return spec
  } catch (error) {
    console.error("Genre classification failed:", error)

    // Fallback to generic children's book
    return {
      genre: "Children's Book",
      title: title || "My Book",
      subtitle: subtitle || "A Story for Kids",
      imagePrompt:
        "Colorful cartoon illustration with cute characters, bright and cheerful, professional children's book cover style",
      style: "cartoon",
      textPlacement: {
        title: "top",
        subtitle: "below title",
      },
      colorScheme: "vibrant",
    }
  }
}

export const genreTemplates = {
  "Children's Book": {
    imagePrompt:
      "Cartoon illustration with cute animals or characters, bright vibrant colors, playful scene, professional children's book cover style",
    style: "cartoon",
    textPlacement: { title: "top", subtitle: "bottom" },
    colorScheme: "vibrant",
  },
  "Recipe Book": {
    imagePrompt:
      "Top-down view of fresh ingredients and cooking utensils, warm natural lighting, photorealistic food photography style",
    style: "photorealistic",
    textPlacement: { title: "center", subtitle: "below title" },
    colorScheme: "warm",
  },
  "Bedtime Story": {
    imagePrompt:
      "Peaceful nighttime scene with stars and moon, soft dreamy colors, child-friendly illustration, calming atmosphere",
    style: "digital painting",
    textPlacement: { title: "top", subtitle: "center" },
    colorScheme: "pastel",
  },
  "Coloring Book": {
    imagePrompt:
      "Simple black and white line art illustration, clear outlines, age-appropriate subject, designed for coloring",
    style: "flat vector",
    textPlacement: { title: "top", subtitle: "bottom" },
    colorScheme: "bright",
  },
  Educational: {
    imagePrompt:
      "Clean educational illustration with clear visual elements, professional appearance, informative design",
    style: "flat vector",
    textPlacement: { title: "center", subtitle: "below title" },
    colorScheme: "cool",
  },
}
