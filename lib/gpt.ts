const COVER_PROMPT_TEMPLATE = `You are a professional book cover designer assistant.

Given a short book idea or story description, generate a complete professional front cover metadata object.

Respond only in this JSON format:

{
  "title": "",
  "subtitle": "",
  "author": "",
  "tagline": "",
  "imagePrompt": "",
  "visualStyle": "cartoon",
  "textPlacement": {
    "title": "top",
    "subtitle": "center", 
    "author": "bottom"
  }
}

Ensure that the imagePrompt includes character(s), setting, lighting, color tone, and visual style. It should describe art for a 2:3 vertical book cover.

Generate the metadata for this book idea: "{user_input}"`

export async function generateCoverMetadata(userInput: string) {
  try {
    const prompt = COVER_PROMPT_TEMPLATE.replace("{user_input}", userInput)

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
        max_tokens: 500,
      }),
    })

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`)
    }

    const data = await response.json()
    const content = data.choices[0]?.message?.content

    if (!content) {
      throw new Error("No content received from OpenAI")
    }

    return JSON.parse(content)
  } catch (error) {
    console.error("Error generating cover metadata:", error)
    throw new Error("Failed to generate cover metadata")
  }
}

export async function generateStoryContent(prompt: string, pages = 10) {
  try {
    const storyPrompt = `Create a ${pages}-page children's story based on: "${prompt}"

Return a JSON object with:
{
  "title": "Story Title",
  "pages": [
    {
      "pageNumber": 1,
      "text": "Page content...",
      "imagePrompt": "Detailed image description for this page"
    }
  ]
}

Make each page engaging with 1-2 sentences of story text and a detailed image prompt.`

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4",
        messages: [{ role: "user", content: storyPrompt }],
        temperature: 0.8,
        max_tokens: 2000,
      }),
    })

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`)
    }

    const data = await response.json()
    const content = data.choices[0]?.message?.content

    if (!content) {
      throw new Error("No content received from OpenAI")
    }

    return JSON.parse(content)
  } catch (error) {
    console.error("Error generating story content:", error)
    throw new Error("Failed to generate story content")
  }
}
