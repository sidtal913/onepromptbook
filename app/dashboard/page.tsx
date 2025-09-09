'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  BookOpen, 
  PlusCircle, 
  Sparkles, 
  TrendingUp,
  Clock,
  Download,
  Eye,
  Star,
  Users,
  Zap
} from 'lucide-react'
import { supabase, getCurrentUser } from '@/lib/supabase'
import { toast } from 'sonner'

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null)
  const [userProfile, setUserProfile] = useState<any>(null)
  const [recentBooks, setRecentBooks] = useState<any[]>([])
  const [stats, setStats] = useState({
    totalBooks: 0,
    totalCredits: 0,
    booksThisMonth: 0,
    favoriteStyle: 'Story Book'
  })
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const currentUser = await getCurrentUser()
        if (!currentUser) {
          router.push('/auth')
          return
        }

        setUser(currentUser)

        // Get user profile
        const { data: profile } = await supabase
          .from('users')
          .select('*')
          .eq('id', currentUser.id)
          .single()

        if (profile) {
          setUserProfile(profile)
          setStats(prev => ({
            ...prev,
            totalCredits: profile.credits
          }))
        }

        // Get recent books
        const { data: books } = await supabase
          .from('books')
          .select('*')
          .eq('user_id', currentUser.id)
          .order('created_at', { ascending: false })
          .limit(6)

        if (books) {
          setRecentBooks(books)
          setStats(prev => ({
            ...prev,
            totalBooks: books.length,
            booksThisMonth: books.filter(book => {
              const bookDate = new Date(book.created_at)
              const now = new Date()
              return bookDate.getMonth() === now.getMonth() && 
                     bookDate.getFullYear() === now.getFullYear()
            }).length
          }))
        }
      } catch (error) {
        console.error('Error loading dashboard:', error)
        toast.error('Failed to load dashboard')
      } finally {
        setIsLoading(false)
      }
    }

    loadDashboard()
  }, [router])

  const quickActions = [
    {
      title: 'Create New Book',
      description: 'Start with a simple prompt',
      icon: PlusCircle,
      href: '/generate-book',
      color: 'from-purple-500 to-pink-500'
    },
    {
      title: 'One-Click Story',
      description: 'Generate instantly',
      icon: Zap,
      href: '/one-click-story',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      title: 'Browse Gallery',
      description: 'Get inspired',
      icon: Eye,
      href: '/book-gallery',
      color: 'from-green-500 to-emerald-500'
    },
    {
      title: 'My Books',
      description: 'View your library',
      icon: BookOpen,
      href: '/my-books',
      color: 'from-orange-500 to-red-500'
    }
  ]

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Sparkles className="w-8 h-8 animate-spin text-purple-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {userProfile?.full_name || user?.email}!
          </h1>
          <p className="text-gray-600">
            Ready to create your next amazing children's book?
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Available Credits</p>
                  <p className="text-2xl font-bold text-purple-600">{stats.totalCredits}</p>
                </div>
                <Sparkles className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Books</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.totalBooks}</p>
                </div>
                <BookOpen className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">This Month</p>
                  <p className="text-2xl font-bold text-green-600">{stats.booksThisMonth}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Favorite Style</p>
                  <p className="text-lg font-bold text-orange-600">{stats.favoriteStyle}</p>
                </div>
                <Star className="w-8 h-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action, index) => (
              <Link key={index} href={action.href}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
                  <CardContent className="p-6">
                    <div className={`w-12 h-12 bg-gradient-to-r ${action.color} rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                      <action.icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-1">{action.title}</h3>
                    <p className="text-sm text-gray-600">{action.description}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Books */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Recent Books</h2>
            <Link href="/my-books">
              <Button variant="outline" size="sm">
                View All
              </Button>
            </Link>
          </div>

          {recentBooks.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recentBooks.map((book) => (
                <Card key={book.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg line-clamp-1">{book.title}</CardTitle>
                      <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                        book.status === 'completed' ? 'bg-green-100 text-green-700' :
                        book.status === 'generating' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {book.status}
                      </div>
                    </div>
                    <CardDescription className="line-clamp-2">
                      {book.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                      <span>{book.book_type.replace('-', ' ')}</span>
                      <span>{new Date(book.created_at).toLocaleDateString()}</span>
                    </div>
                    
                    {book.status === 'completed' && (
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm" className="flex-1">
                          <Eye className="w-4 h-4 mr-1" />
                          Preview
                        </Button>
                        <Button variant="gradient" size="sm" className="flex-1">
                          <Download className="w-4 h-4 mr-1" />
                          Download
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No books yet</h3>
                <p className="text-gray-600 mb-6">
                  Create your first book to get started!
                </p>
                <Link href="/generate-book">
                  <Button variant="gradient">
                    <PlusCircle className="w-4 h-4 mr-2" />
                    Create Your First Book
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Tips & Resources */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-purple-600" />
                <span>Pro Tips</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-purple-600 rounded-full mt-2" />
                <div>
                  <p className="font-medium">Be specific in your prompts</p>
                  <p className="text-sm text-gray-600">Include character details, setting, and main conflict</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-purple-600 rounded-full mt-2" />
                <div>
                  <p className="font-medium">Choose the right art style</p>
                  <p className="text-sm text-gray-600">Match your story's tone with the illustration style</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-purple-600 rounded-full mt-2" />
                <div>
                  <p className="font-medium">Keep it age-appropriate</p>
                  <p className="text-sm text-gray-600">Consider your target age group (3-8 years)</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-blue-600" />
                <span>Community</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="font-medium mb-2">Join our community</p>
                <p className="text-sm text-gray-600 mb-4">
                  Connect with other creators, share your books, and get feedback
                </p>
                <Button variant="outline" size="sm">
                  Join Discord
                </Button>
              </div>
              <div>
                <p className="font-medium mb-2">Need help?</p>
                <p className="text-sm text-gray-600 mb-4">
                  Check our tutorials and documentation
                </p>
                <Button variant="outline" size="sm">
                  View Tutorials
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}