import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

// Book type configurations
export const BOOK_TYPES = {
  // Learning & Educational (20 pages max)
  'alphabet': { 
    max: 20, 
    recommended: 16, 
    credits: 3,
    description: 'Alphabet Books',
    category: 'Learning & Educational'
  },
  'numbers': { 
    max: 20, 
    recommended: 16, 
    credits: 3,
    description: 'Number Books',
    category: 'Learning & Educational'
  },
  'shapes': { 
    max: 20, 
    recommended: 16, 
    credits: 2,
    description: 'Shapes & Patterns',
    category: 'Learning & Educational'
  },
  'educational-workbooks': { 
    max: 64, 
    recommended: 32, 
    credits: 4,
    description: 'Educational Workbooks',
    category: 'Learning & Educational'
  },
  'learning-books': { 
    max: 20, 
    recommended: 16, 
    credits: 3,
    description: 'Learning Concepts',
    category: 'Learning & Educational'
  },

  // Animals & Nature (32 pages max)
  'dinosaurs': { 
    max: 32, 
    recommended: 20, 
    credits: 4,
    description: 'Dinosaurs',
    category: 'Animals & Nature',
    popular: true
  },
  'farm-animals': { 
    max: 32, 
    recommended: 20, 
    credits: 3,
    description: 'Farm Animals',
    category: 'Animals & Nature',
    popular: true
  },
  'ocean-animals': { 
    max: 32, 
    recommended: 20, 
    credits: 3,
    description: 'Ocean/Underwater & Mermaids',
    category: 'Animals & Nature'
  },
  'zoo-animals': { 
    max: 32, 
    recommended: 20, 
    credits: 3,
    description: 'Zoo Animals',
    category: 'Animals & Nature',
    popular: true
  },

  // Stories & Adventures (32-64 pages)
  'story-book': { 
    max: 32, 
    recommended: 20, 
    credits: 4,
    description: 'Story Books',
    category: 'Stories & Adventures',
    popular: true
  },
  'fantasy': { 
    max: 64, 
    recommended: 32, 
    credits: 4,
    description: 'Fantasy & Magic',
    category: 'Stories & Adventures',
    popular: true
  },
  'holiday': { 
    max: 32, 
    recommended: 20, 
    credits: 3,
    description: 'Seasonal & Holiday',
    category: 'Stories & Adventures'
  },
  'space': { 
    max: 32, 
    recommended: 20, 
    credits: 4,
    description: 'Space Adventure',
    category: 'Stories & Adventures',
    popular: true
  },
  'sports': { 
    max: 32, 
    recommended: 20, 
    credits: 3,
    description: 'Sports & Activities',
    category: 'Stories & Adventures',
    popular: true
  },
  'vehicles': { 
    max: 32, 
    recommended: 20, 
    credits: 3,
    description: 'Vehicles/Things That Go',
    category: 'Stories & Adventures',
    popular: true
  },

  // Creative & Illustrated
  'coloring': { 
    max: 20, 
    recommended: 16, 
    credits: 2,
    description: 'Coloring Books',
    category: 'Creative & Illustrated'
  },
  'comic-books': { 
    max: 64, 
    recommended: 32, 
    credits: 5,
    description: 'Comic Books',
    category: 'Creative & Illustrated',
    popular: true
  },
  'poetry-rhymes': { 
    max: 32, 
    recommended: 20, 
    credits: 3,
    description: 'Poetry & Rhymes',
    category: 'Creative & Illustrated'
  },
  'activity-books': { 
    max: 20, 
    recommended: 16, 
    credits: 3,
    description: 'Activity Books',
    category: 'Creative & Illustrated'
  },
  'journal': { 
    max: 20, 
    recommended: 16, 
    credits: 2,
    description: 'Journals & Diaries',
    category: 'Creative & Illustrated'
  },

  // Special Art Styles
  'hyper-realistic': { 
    max: 64, 
    recommended: 24, 
    credits: 6,
    description: 'Hyper Realistic',
    category: 'Special Art Styles',
    popular: true
  },
  'bedtime-books': { 
    max: 32, 
    recommended: 20, 
    credits: 4,
    description: 'Bedtime Books',
    category: 'Special Art Styles',
    popular: true
  },

  // 3D Graphics Styles
  'cinematic-3d': { 
    max: 32, 
    recommended: 20, 
    credits: 5,
    description: 'Cinematic 3D Animation',
    category: '3D Graphics Styles',
    popular: true
  },
  'mobile-3d': { 
    max: 32, 
    recommended: 20, 
    credits: 5,
    description: 'Mobile 3D Characters',
    category: '3D Graphics Styles',
    popular: true
  },
  'action-3d': { 
    max: 32, 
    recommended: 20, 
    credits: 5,
    description: 'Action Gaming 3D',
    category: '3D Graphics Styles',
    popular: true
  },
}

// Character styles
export const CHARACTER_STYLES = {
  // 3D Rendered Styles
  'pixar-3d': {
    name: 'Pixar/Disney 3D',
    popular: true,
    positive: "SINGLE CHARACTER 3D RENDER. Pixar Animation Studios style, Disney 3D character design, perfect cartoon proportions, glossy smooth 3D surfaces, cinematic lighting rig",
    negative: "watercolor, gouache, oil paint, brush strokes, painterly, multiple characters"
  },
  'fortnite-style': {
    name: 'Fortnite Style',
    popular: true,
    positive: "SINGLE CHARACTER PORTRAIT. Stylized PBR video-game render, semi-realistic proportions, smaller eyes, defined jaw and nose, matte skin",
    negative: "anime, manga, disney, pixar, cartoon, chibi, big round eyes, multiple characters"
  },
  'brawlstars-style': {
    name: 'Brawl Stars Style',
    popular: true,
    positive: "SINGLE CHARACTER 3D RENDER. Cartoony 3D character, Brawl Stars aesthetic, exaggerated proportions, chunky hands, bold clean outlines",
    negative: "realistic textures, watercolor, painterly, multiple characters"
  },

  // 2D Illustrated Styles
  'story-book': {
    name: 'Storybook Style',
    popular: true,
    positive: "children's book illustration, clean digital art, bright colors, friendly character",
    negative: "watercolor, paint wash, rough sketches, blurry, dark themes"
  },
  'cartoon-2d': {
    name: 'Cartoon 2D',
    popular: true,
    positive: "flat vector illustration, clean line art, bold flat colors, minimal shading, crisp edges",
    negative: "watercolor, paint strokes, textured paper, realistic skin, photorealism"
  },
  'anime-manga': {
    name: 'Anime/Manga',
    popular: true,
    positive: "anime character portrait, clean cel shading, sharp linework, vibrant colors, large expressive eyes",
    negative: "watercolor, paint wash, western comic, photorealistic skin texture"
  },

  // Specialized Styles
  'hyper-realistic': {
    name: 'Hyper Realistic',
    positive: "photorealistic character portrait, sharp focus, professional lighting, high resolution, detailed skin texture",
    negative: "watercolor, cartoon, anime, painted, artistic filter"
  },
  'dreamy-soft': {
    name: 'Dreamy & Soft',
    popular: true,
    positive: "kawaii cute character, pastel colors, big sparkly eyes, chibi proportions, adorable expression, clean digital art",
    negative: "watercolor, dark colors, realistic proportions, scary, painterly wash"
  }
}

// Generate story content
export const generateStory = async (prompt: string, bookType: string, pages: number) => {
  const bookConfig = BOOK_TYPES[bookType as keyof typeof BOOK_TYPES]
  
  const systemPrompt = `You are a children's book author. Create a ${pages}-page story for a ${bookConfig.description.toLowerCase()} book. 
  Each page should have 1-3 sentences that are age-appropriate and engaging for children ages 3-8.
  Return a JSON array with ${pages} objects, each containing "pageNumber" and "content" fields.
  Make the story educational, fun, and suitable for the "${bookType}" category.`

  const completion = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: prompt }
    ],
    temperature: 0.8,
  })

  const content = completion.choices[0].message.content
  try {
    return JSON.parse(content || '[]')
  } catch (error) {
    console.error('Error parsing story content:', error)
    return []
  }
}

// Generate image
export const generateImage = async (prompt: string, style: string) => {
  const styleConfig = CHARACTER_STYLES[style as keyof typeof CHARACTER_STYLES]
  
  const enhancedPrompt = `${prompt}, ${styleConfig?.positive || ''}`
  const negativePrompt = styleConfig?.negative || "watercolor, paint wash, painterly, brush strokes, multiple characters"

  const response = await openai.images.generate({
    model: "dall-e-3",
    prompt: enhancedPrompt,
    size: "1024x1024",
    quality: "standard",
    n: 1,
  })

  return response.data[0].url
}

// Pricing constants
export const CREDIT_VALUE = 0.25 // $0.25 per credit

export const FEATURE_COSTS = {
  STORY_PAGE_ILLUSTRATED: 5,
  CHARACTER_BASIC: 10,
  COVER_PREMIUM: 30,
  PDF_EXPORT_BASE: 15,
  EPUB_EXPORT_BASE: 15,
}

export const CREDIT_PACKAGES = {
  starter: { credits: 40, price: 9.99, name: 'Starter Pack' },
  creator: { credits: 130, price: 29.99, name: 'Creator Pack', popular: true },
  professional: { credits: 320, price: 69.99, name: 'Professional Pack' },
  publisher: { credits: 750, price: 149.99, name: 'Publisher Pack' },
}