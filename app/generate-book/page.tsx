'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { BookGenerator } from '@/components/book-generator'
import { getCurrentUser } from '@/lib/supabase'
import { toast } from 'sonner'

export default function GenerateBookPage() {
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const currentUser = await getCurrentUser()
        if (!currentUser) {
          router.push('/auth')
          return
        }
        setUser(currentUser)
      } catch (error) {
        console.error('Auth check failed:', error)
        router.push('/auth')
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [router])

  const handleBookGenerated = (bookData: any) => {
    toast.success('Book generated successfully!')
    // Optionally redirect to the book view or my-books page
    // router.push(`/my-books/${bookData.id}`)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Create Your Book
          </h1>
          <p className="text-gray-600">
            Transform your idea into a complete children's book with AI-powered illustrations
          </p>
        </div>

        <BookGenerator onGenerate={handleBookGenerated} />
      </div>
    </div>
  )
}