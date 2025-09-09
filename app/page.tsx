import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  BookOpen, 
  Sparkles, 
  Zap, 
  Download, 
  Star,
  ArrowRight,
  CheckCircle,
  Users,
  Clock,
  Palette
} from 'lucide-react'

export default function HomePage() {
  const features = [
    {
      icon: Zap,
      title: "One-Click Generation",
      description: "Transform a single prompt into a complete children's book with illustrations in minutes"
    },
    {
      icon: Palette,
      title: "Multiple Art Styles",
      description: "Choose from Pixar 3D, Storybook, Anime, and more professional illustration styles"
    },
    {
      icon: BookOpen,
      title: "Publication Ready",
      description: "Export as PDF or EPUB, optimized for Amazon KDP and other publishing platforms"
    },
    {
      icon: Download,
      title: "Instant Downloads",
      description: "Get your completed book immediately with high-quality formatting and layout"
    }
  ]

  const bookTypes = [
    { name: "Story Books", popular: true },
    { name: "Alphabet Books", popular: false },
    { name: "Dinosaurs", popular: true },
    { name: "Fantasy & Magic", popular: true },
    { name: "Farm Animals", popular: true },
    { name: "Space Adventure", popular: true },
    { name: "Comic Books", popular: true },
    { name: "Bedtime Stories", popular: true }
  ]

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Parent & Teacher",
      content: "OnePromptBook helped me create personalized stories for my classroom in minutes. The kids absolutely love them!",
      rating: 5
    },
    {
      name: "Mike Chen",
      role: "Independent Publisher",
      content: "I've published 12 books using OnePromptBook. The quality is amazing and it's so much faster than traditional methods.",
      rating: 5
    },
    {
      name: "Emma Davis",
      role: "Homeschool Mom",
      content: "Perfect for creating educational content that matches my children's interests. The variety of styles is incredible.",
      rating: 5
    }
  ]

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-pink-500/10 to-orange-500/10" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="text-center space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
                Create Amazing{' '}
                <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 bg-clip-text text-transparent">
                  Children's Books
                </span>
                {' '}in Minutes
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                Transform a single prompt into a complete, illustrated children's book. 
                AI-powered storytelling with professional-quality artwork, ready for publishing.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/generate-book">
                <Button variant="gradient" size="xl" className="text-lg px-8 py-4">
                  <Sparkles className="w-5 h-5 mr-2" />
                  Create Your First Book
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link href="/book-gallery">
                <Button variant="outline" size="xl" className="text-lg px-8 py-4">
                  <BookOpen className="w-5 h-5 mr-2" />
                  View Sample Books
                </Button>
              </Link>
            </div>

            <div className="flex items-center justify-center space-x-8 text-sm text-gray-500">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>No design skills needed</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Publication ready</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Multiple art styles</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900">
              Everything You Need to Create Amazing Books
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Professional-quality children's books with zero design experience required
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-600">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Book Types Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900">
              Create Any Type of Children's Book
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              From educational content to adventure stories, we support all popular book categories
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {bookTypes.map((type, index) => (
              <div
                key={index}
                className="bg-white rounded-lg p-4 text-center hover:shadow-md transition-shadow relative"
              >
                {type.popular && (
                  <div className="absolute -top-2 -right-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs px-2 py-1 rounded-full">
                    Popular
                  </div>
                )}
                <h3 className="font-medium text-gray-900">{type.name}</h3>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link href="/pricing">
              <Button variant="gradient" size="lg">
                View All Book Types & Pricing
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900">
              Loved by Creators Worldwide
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Join thousands of parents, teachers, and publishers creating amazing books
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center space-x-1 mb-2">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <CardDescription className="text-gray-700 italic">
                    "{testimonial.content}"
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div>
                    <p className="font-medium text-gray-900">{testimonial.name}</p>
                    <p className="text-sm text-gray-600">{testimonial.role}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gradient-to-r from-purple-600 to-pink-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold mb-2">50K+</div>
              <div className="text-purple-100">Books Created</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">15K+</div>
              <div className="text-purple-100">Happy Users</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">2 Min</div>
              <div className="text-purple-100">Average Creation Time</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">98%</div>
              <div className="text-purple-100">Satisfaction Rate</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gray-900 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
          <h2 className="text-3xl lg:text-4xl font-bold">
            Ready to Create Your First Book?
          </h2>
          <p className="text-xl text-gray-300">
            Join thousands of creators who are already making amazing children's books with AI
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth">
              <Button variant="gradient" size="xl" className="text-lg px-8 py-4">
                <Sparkles className="w-5 h-5 mr-2" />
                Start Creating Now
              </Button>
            </Link>
            <Link href="/pricing">
              <Button variant="outline" size="xl" className="text-lg px-8 py-4 border-gray-600 text-gray-300 hover:bg-gray-800">
                View Pricing Plans
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}