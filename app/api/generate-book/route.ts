import { NextRequest, NextResponse } from 'next/server'
import { generateStory, generateImage, BOOK_TYPES, CHARACTER_STYLES } from '@/lib/openai'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { prompt, bookType, characterStyle, pages } = await request.json()

    // Validate input
    if (!prompt || !bookType || !characterStyle || !pages) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check if book type exists
    const bookConfig = BOOK_TYPES[bookType as keyof typeof BOOK_TYPES]
    if (!bookConfig) {
      return NextResponse.json(
        { error: 'Invalid book type' },
        { status: 400 }
      )
    }

    // Check if character style exists
    const styleConfig = CHARACTER_STYLES[characterStyle as keyof typeof CHARACTER_STYLES]
    if (!styleConfig) {
      return NextResponse.json(
        { error: 'Invalid character style' },
        { status: 400 }
      )
    }

    // Validate page count
    if (pages > bookConfig.max || pages < 1) {
      return NextResponse.json(
        { error: `Page count must be between 1 and ${bookConfig.max}` },
        { status: 400 }
      )
    }

    // Get current user (you'll need to implement proper auth middleware)
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // For now, we'll simulate the generation process
    // In production, you'd want to use a queue system for long-running tasks

    // Generate story content
    const storyPages = await generateStory(prompt, bookType, pages)
    
    // Generate cover image
    const coverPrompt = `Book cover for "${prompt}", ${bookConfig.description.toLowerCase()} style, colorful, child-friendly`
    const coverUrl = await generateImage(coverPrompt, characterStyle)

    // Generate images for each page (in production, do this in batches)
    const pagesWithImages = await Promise.all(
      storyPages.map(async (page: any, index: number) => {
        const imagePrompt = `${page.content}, ${styleConfig.positive}, children's book illustration`
        const imageUrl = await generateImage(imagePrompt, characterStyle)
        
        return {
          ...page,
          imageUrl,
          imagePrompt
        }
      })
    )

    // Calculate credits used
    const creditsUsed = (pages * 5) + 30 // 5 per page + 30 for cover

    // Create book record in database
    const bookData = {
      title: `Generated Book: ${prompt.substring(0, 50)}...`,
      description: prompt,
      book_type: bookType,
      character_style: characterStyle,
      cover_url: coverUrl,
      pages: pagesWithImages,
      credits_used: creditsUsed,
      status: 'completed'
    }

    // In production, you'd save this to the database
    // const { data: book, error } = await supabase
    //   .from('books')
    //   .insert([bookData])
    //   .select()
    //   .single()

    return NextResponse.json({
      success: true,
      book: bookData,
      creditsUsed
    })

  } catch (error) {
    console.error('Error generating book:', error)
    return NextResponse.json(
      { error: 'Failed to generate book' },
      { status: 500 }
    )
  }
}