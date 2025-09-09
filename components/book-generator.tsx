'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'
import { Sparkles, BookOpen, Download, Eye } from 'lucide-react'
import { BOOK_TYPES, CHARACTER_STYLES } from '@/lib/openai'

interface BookGeneratorProps {
  onGenerate?: (bookData: any) => void
}

export function BookGenerator({ onGenerate }: BookGeneratorProps) {
  const [prompt, setPrompt] = useState('')
  const [bookType, setBookType] = useState('')
  const [characterStyle, setCharacterStyle] = useState('')
  const [pages, setPages] = useState(10)
  const [isGenerating, setIsGenerating] = useState(false)
  const [progress, setProgress] = useState(0)
  const [generatedBook, setGeneratedBook] = useState<any>(null)

  const handleGenerate = async () => {
    if (!prompt || !bookType || !characterStyle) return

    setIsGenerating(true)
    setProgress(0)

    try {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90))
      }, 500)

      const response = await fetch('/api/generate-book', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          bookType,
          characterStyle,
          pages,
        }),
      })

      clearInterval(progressInterval)
      setProgress(100)

      if (!response.ok) {
        throw new Error('Failed to generate book')
      }

      const bookData = await response.json()
      setGeneratedBook(bookData)
      onGenerate?.(bookData)
    } catch (error) {
      console.error('Error generating book:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  const selectedBookType = BOOK_TYPES[bookType as keyof typeof BOOK_TYPES]
  const maxPages = selectedBookType?.max || 20
  const creditsRequired = selectedBookType ? selectedBookType.credits * pages + 30 : 0 // +30 for cover

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-purple-600" />
            <span>Create Your Book</span>
          </CardTitle>
          <CardDescription>
            Generate a complete children's book with AI-powered illustrations
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Book Prompt */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Book Idea</label>
            <Input
              placeholder="A brave little mouse who goes on an adventure to find cheese..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="min-h-[80px]"
            />
          </div>

          {/* Book Type Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Book Type</label>
            <Select value={bookType} onValueChange={setBookType}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a book type" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(BOOK_TYPES).map(([key, config]) => (
                  <SelectItem key={key} value={key}>
                    <div className="flex items-center justify-between w-full">
                      <span>{config.description}</span>
                      {config.popular && (
                        <span className="ml-2 text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">
                          Popular
                        </span>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedBookType && (
              <p className="text-xs text-gray-500">
                Category: {selectedBookType.category} • Max pages: {selectedBookType.max}
              </p>
            )}
          </div>

          {/* Character Style */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Art Style</label>
            <Select value={characterStyle} onValueChange={setCharacterStyle}>
              <SelectTrigger>
                <SelectValue placeholder="Choose an art style" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(CHARACTER_STYLES).map(([key, style]) => (
                  <SelectItem key={key} value={key}>
                    <div className="flex items-center justify-between w-full">
                      <span>{style.name}</span>
                      {style.popular && (
                        <span className="ml-2 text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">
                          Popular
                        </span>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Page Count */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Number of Pages</label>
            <div className="flex items-center space-x-4">
              <Input
                type="number"
                min="5"
                max={maxPages}
                value={pages}
                onChange={(e) => setPages(Math.min(parseInt(e.target.value) || 5, maxPages))}
                className="w-20"
              />
              <span className="text-sm text-gray-500">
                Max: {maxPages} pages
              </span>
            </div>
          </div>

          {/* Credits Required */}
          {creditsRequired > 0 && (
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-purple-700">
                  Credits Required
                </span>
                <span className="text-lg font-bold text-purple-700">
                  {creditsRequired}
                </span>
              </div>
              <p className="text-xs text-purple-600 mt-1">
                {pages} pages × {selectedBookType?.credits} + 30 (cover) = {creditsRequired} credits
              </p>
            </div>
          )}

          {/* Generate Button */}
          <Button
            onClick={handleGenerate}
            disabled={!prompt || !bookType || !characterStyle || isGenerating}
            className="w-full"
            variant="gradient"
            size="lg"
          >
            {isGenerating ? (
              <>
                <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                Generating Book...
              </>
            ) : (
              <>
                <BookOpen className="w-4 h-4 mr-2" />
                Generate Book ({creditsRequired} credits)
              </>
            )}
          </Button>

          {/* Progress Bar */}
          {isGenerating && (
            <div className="space-y-2">
              <Progress value={progress} className="w-full" />
              <p className="text-sm text-center text-gray-600">
                {progress < 30 && "Creating story outline..."}
                {progress >= 30 && progress < 60 && "Generating illustrations..."}
                {progress >= 60 && progress < 90 && "Formatting pages..."}
                {progress >= 90 && "Finalizing your book..."}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Generated Book Preview */}
      {generatedBook && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Your Book is Ready!</span>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm">
                  <Eye className="w-4 h-4 mr-1" />
                  Preview
                </Button>
                <Button variant="gradient" size="sm">
                  <Download className="w-4 h-4 mr-1" />
                  Download PDF
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {generatedBook.pages?.slice(0, 3).map((page: any, index: number) => (
                <div key={index} className="bg-white border rounded-lg p-4 shadow-sm">
                  {page.imageUrl && (
                    <img
                      src={page.imageUrl}
                      alt={`Page ${page.pageNumber}`}
                      className="w-full h-32 object-cover rounded mb-2"
                    />
                  )}
                  <p className="text-sm text-gray-700 line-clamp-3">
                    {page.content}
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    Page {page.pageNumber}
                  </p>
                </div>
              ))}
            </div>
            {generatedBook.pages?.length > 3 && (
              <p className="text-center text-gray-500 mt-4">
                +{generatedBook.pages.length - 3} more pages
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}