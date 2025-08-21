import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft, Download, Eye, Star } from "lucide-react"

export const metadata: Metadata = {
  title: "Gallery - StoryForge AI",
  description: "Explore our collection of AI-generated children's books and coloring pages",
}

const bookExamples = [
  {
    id: 1,
    title: "Playground Adventures",
    type: "Coloring Book",
    ageRange: "3-6",
    pages: 24,
    image: "/playground-dino-coloring.png",
    rating: 4.9,
    downloads: "2.1k",
    theme: "Playground Fun",
    description: "Join our friendly dinosaur on exciting playground adventures with swings, slides, and sandbox fun.",
    colors: "from-green-400 to-blue-500",
  },
  {
    id: 2,
    title: "Dinosaur Discovery",
    type: "Coloring Book",
    ageRange: "4-8",
    pages: 32,
    image: "/dinosaur-coloring-book.png",
    rating: 4.8,
    downloads: "3.5k",
    theme: "Prehistoric World",
    description: "Explore the world of dinosaurs with detailed coloring pages featuring T-Rex, Triceratops, and more.",
    colors: "from-orange-400 to-red-500",
  },
  {
    id: 3,
    title: "Restaurant Fun",
    type: "Activity Book",
    ageRange: "5-9",
    pages: 28,
    image: "/cat-chef-activity-book.png",
    rating: 4.7,
    downloads: "1.8k",
    theme: "Cooking & Food",
    description: "Learn about cooking and restaurants with our chef cat through mazes, word searches, and coloring.",
    colors: "from-yellow-400 to-orange-500",
  },
  {
    id: 4,
    title: "Cute Pets Collection",
    type: "Coloring Book",
    ageRange: "3-7",
    pages: 20,
    image: "/cute-pets-coloring-book.png",
    rating: 4.9,
    downloads: "4.2k",
    theme: "Animals & Pets",
    description: "Adorable pet characters including bunnies, cats, dogs, and birds for hours of coloring fun.",
    colors: "from-pink-400 to-purple-500",
  },
  {
    id: 5,
    title: "Soccer All-Stars",
    type: "Activity Book",
    ageRange: "6-10",
    pages: 36,
    image: "/soccer-activity-book-cover.png",
    rating: 4.6,
    downloads: "2.7k",
    theme: "Sports & Games",
    description: "Score big with soccer-themed activities, coloring pages, and fun facts about the beautiful game.",
    colors: "from-blue-400 to-green-500",
  },
  {
    id: 6,
    title: "Under the Sea",
    type: "Coloring Book",
    ageRange: "4-8",
    pages: 30,
    image: "/under-the-sea-coloring-book.png",
    rating: 4.8,
    downloads: "3.1k",
    theme: "Ocean Life",
    description: "Dive into underwater adventures with colorful fish, seahorses, and coral reef scenes.",
    colors: "from-cyan-400 to-blue-600",
  },
  {
    id: 7,
    title: "Outer Space Adventure",
    type: "Activity Book",
    ageRange: "5-9",
    pages: 32,
    image: "/outer-space-activity-book.png",
    rating: 4.7,
    downloads: "2.9k",
    theme: "Space & Astronomy",
    description: "Blast off to space with astronauts, rockets, planets, and stellar activities.",
    colors: "from-purple-500 to-indigo-600",
  },
  {
    id: 8,
    title: "Fairy Princess Magic",
    type: "Coloring Book",
    ageRange: "3-7",
    pages: 26,
    image: "/fairy-princess-coloring-book.png",
    rating: 4.9,
    downloads: "5.1k",
    theme: "Fantasy & Magic",
    description: "Enter a magical world of fairy princesses, castles, unicorns, and enchanted forests.",
    colors: "from-pink-400 to-rose-500",
  },
  {
    id: 9,
    title: "Playful Monsters",
    type: "Coloring Book",
    ageRange: "4-8",
    pages: 24,
    image: "/playful-monsters-coloring-book.png",
    rating: 4.6,
    downloads: "1.9k",
    theme: "Friendly Monsters",
    description: "Meet adorable, non-scary monsters who love to play, laugh, and have fun adventures.",
    colors: "from-teal-400 to-cyan-500",
  },
]

export default function GalleryPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900">
      {/* Header */}
      <div className="border-b border-white/10 bg-slate-900/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="ghost" size="sm" className="text-gray-100 hover:text-white">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Home
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-white">Gallery</h1>
                <p className="text-gray-300 text-sm">AI-generated children's books</p>
              </div>
            </div>
            <Link href="/generate">
              <Button className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700">
                Create Your Own
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-white mb-4">
            Discover Amazing{" "}
            <span className="bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
              AI-Generated
            </span>{" "}
            Books
          </h2>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto">
            Explore our collection of children's books and coloring pages, all created from simple prompts using
            advanced AI technology.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <div className="text-center">
            <div className="text-3xl font-bold text-white mb-2">50+</div>
            <div className="text-gray-300">Book Templates</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-white mb-2">25k+</div>
            <div className="text-gray-300">Downloads</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-white mb-2">4.8</div>
            <div className="text-gray-300">Average Rating</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-white mb-2">100%</div>
            <div className="text-gray-300">KDP Ready</div>
          </div>
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {bookExamples.map((book) => (
            <Card
              key={book.id}
              className="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/15 transition-all duration-300 group"
            >
              <CardContent className="p-0">
                {/* Book Cover */}
                <div className="relative overflow-hidden rounded-t-lg">
                  <div className={`absolute inset-0 bg-gradient-to-br ${book.colors} opacity-20`} />
                  <Image
                    src={book.image || "/placeholder.svg"}
                    alt={book.title}
                    width={400}
                    height={300}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-4 left-4">
                    <Badge variant="secondary" className="bg-white/90 text-gray-900">
                      {book.type}
                    </Badge>
                  </div>
                  <div className="absolute top-4 right-4">
                    <Badge variant="outline" className="bg-black/50 text-white border-white/30">
                      Ages {book.ageRange}
                    </Badge>
                  </div>
                </div>

                {/* Book Info */}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-white mb-2">{book.title}</h3>
                  <p className="text-gray-300 text-sm mb-4 line-clamp-2">{book.description}</p>

                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4 text-sm text-gray-300">
                      <span>{book.pages} pages</span>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span>{book.rating}</span>
                      </div>
                      <span>{book.downloads} downloads</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 border-white/30 text-white hover:bg-white/10 bg-transparent"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Preview
                    </Button>
                    <Button
                      size="sm"
                      className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* CTA Section */}
        <div className="text-center mt-16 py-12 border-t border-white/10">
          <h3 className="text-3xl font-bold text-white mb-4">Ready to Create Your Own?</h3>
          <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
            Join thousands of creators who are using StoryForge AI to bring their imagination to life. Start with a
            simple prompt and get a complete, print-ready book in minutes.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/generate">
              <Button
                size="lg"
                className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
              >
                Start Creating Now
              </Button>
            </Link>
            <Link href="/pricing">
              <Button
                size="lg"
                variant="outline"
                className="border-white/30 text-white hover:bg-white/10 bg-transparent"
              >
                View Pricing
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
