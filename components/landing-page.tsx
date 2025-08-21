"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen, Sparkles, Users, Star, Heart, Wand2, ArrowRight } from "lucide-react"
import { ColoringBookShowcase } from "@/components/coloring-book-showcase"
import React, { useState, useEffect } from "react"
import Image from "next/image"
import { motion } from "framer-motion"
import { QUALITY_OPTIONS, type Quality } from "@/lib/constants"
import { BOOK_TYPES, BOOK_STYLES } from "@/lib/book-types"

export { LandingPage }
export default LandingPage

function LandingPage() {
  const [isGenerating, setIsGenerating] = useState(false)
  const [uiError, setUiError] = useState<string | null>(null)
  const [prompt, setPrompt] = useState("")
  const [zoomLevel, setZoomLevel] = useState(1)
  const [showPagesViewer, setShowPagesViewer] = useState(false)
  const [generatedPages, setGeneratedPages] = useState<any[]>([])
  const [showPreview, setShowPreview] = useState(false)

  const [formData, setFormData] = useState({
    title: "",
    subtitle: "",
    author: "By OnePromptBook",
    bookType: "story" as string,
    imageStyle: "flat-illustration" as string,
    quality: "ultra" as Quality,
    pages: 10,
    trimSize: "8.5x11",
    includeBleed: false,
  })

  const bookType = "Story"
  const includeBleed = formData.includeBleed

  const presetPrompts = [
    {
      title: "Space Adventure",
      prompt: "A thrilling space adventure with astronauts exploring distant planets and meeting alien civilizations",
      type: "Story",
    },
    {
      title: "Underwater World",
      prompt: "Animals in the jungle, space adventure, underwater world with colorful fish and coral reefs",
      type: "Coloring",
    },
    {
      title: "Recipe Collection",
      prompt: "A collection of healthy family recipes with step-by-step instructions and beautiful food photography",
      type: "Story",
    },
    {
      title: "Learning Activities",
      prompt: "Educational activities for children including puzzles, mazes, and word games about nature",
      type: "Activity",
    },
  ]

  const handleGenerateBook = async () => {
    if (!prompt.trim()) {
      setUiError("Please enter a story prompt to generate your book.")
      return
    }
    if (!formData.title.trim()) {
      setUiError("Please enter a book title.")
      return
    }

    setIsGenerating(true)
    setUiError("")
    setGeneratedPages([])

    try {
      console.log("[v0] Starting book generation...")
      const response = await fetch("/api/generate-book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: prompt.trim(),
          bookType: formData.bookType,
          pages: formData.pages,
          title: formData.title.trim(),
          subtitle: formData.subtitle.trim(),
          author: formData.author.trim(),
          style: formData.imageStyle,
          size: "1024x1024",
          savePdf: true,
          saveImages: true,
        }),
      })

      const data = await response.json()
      console.log("[v0] Response status:", response.status)

      if (!response.ok) {
        throw new Error(data.error || "Generation failed")
      }

      if (data.ok && data.results) {
        console.log("[v0] Book generated successfully:", data.meta.title)
        setGeneratedPages(data.results)
        setShowPreview(true)
      } else {
        throw new Error("Invalid response format")
      }
    } catch (error: any) {
      console.error("[v0] Generation error:", error)
      setUiError(error.message || "Failed to generate book. Please try again.")
    } finally {
      setIsGenerating(false)
    }
  }

  const formatPageContent = (pageData: any) => {
    if (!pageData) return ""

    switch (pageData.kind) {
      case "recipe":
        return `${pageData.title}\n\nServings: ${pageData.servings} | Time: ${pageData.timeMinutes} min\n\nIngredients:\n${pageData.ingredients?.map((ing: any) => `• ${ing.qty} ${ing.item}`).join("\n") || ""}\n\nSteps:\n${pageData.steps?.map((step: string, idx: number) => `${idx + 1}. ${step}`).join("\n") || ""}`

      case "coloring":
        return `${pageData.caption}\n\n${pageData.funNote || ""}`

      case "story":
        return `${pageData.title}\n\n${pageData.bodyMd || ""}`

      case "howto":
        return `${pageData.title}\n\nTools: ${pageData.tools?.join(", ") || "None"}\n\nSteps:\n${pageData.steps?.map((step: string, idx: number) => `${idx + 1}. ${step}`).join("\n") || ""}`

      case "intro":
        return `${pageData.title}\n\n${pageData.bodyMd || ""}`

      default:
        return pageData.title || pageData.caption || "Page content"
    }
  }

  // Enhanced EnhancedBookPreview to include cover and back cover
  function EnhancedBookPreview({
    pages,
    onClose,
    bookTitle,
    bookSubtitle,
    author,
  }: {
    pages: any[]
    onClose: () => void
    bookTitle?: string
    bookSubtitle?: string
    author?: string
  }) {
    const [currentPage, setCurrentPage] = useState(0)
    const [zoom, setZoom] = useState(1)

    const enhancedPages = React.useMemo(() => {
      const frontCover = {
        type: "cover",
        title: "Front Cover",
        bookTitle: bookTitle || "Generated Book",
        bookSubtitle: bookSubtitle || "",
        author: author || "By OnePromptBook",
        image: pages[0]?.image || "/placeholder.svg?height=600&width=400",
      }

      const backCover = {
        type: "back-cover",
        title: "Back Cover",
        bookTitle: bookTitle || "Generated Book",
        summary:
          pages.length > 0
            ? `Join us on an amazing adventure through ${pages.length} exciting pages! This book contains ${pages[0]?.text?.kind || "story"} content that will delight readers of all ages.`
            : "An amazing story awaits you in this beautifully illustrated book.",
        author: author || "By OnePromptBook",
      }

      return [frontCover, ...pages, backCover]
    }, [pages, bookTitle, bookSubtitle, author])

    const exportToPDF = async () => {
      try {
        console.log("[v0] Starting PDF export...")

        const response = await fetch("/api/export/pdf", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            pages,
            format: "8.5x11",
            bookTitle,
            bookSubtitle,
            author,
            bookType,
            includeBleed,
          }),
        })

        console.log("[v0] PDF response status:", response.status)
        console.log("[v0] PDF response headers:", Object.fromEntries(response.headers.entries()))

        if (response.ok) {
          const contentLength = response.headers.get("content-length")
          console.log("[v0] PDF content length:", contentLength)

          const blob = await response.blob()
          console.log("[v0] PDF blob size:", blob.size)

          const url = URL.createObjectURL(blob)
          const a = document.createElement("a")
          a.href = url
          a.download = `${bookTitle || "generated-book"}.pdf`
          document.body.appendChild(a)
          a.click()
          document.body.removeChild(a)
          URL.revokeObjectURL(url)

          console.log("[v0] PDF download initiated successfully")
        } else {
          const errorText = await response.text()
          console.error("[v0] PDF export failed:", response.status, errorText)
          alert(`PDF export failed: ${response.status} ${response.statusText}`)
        }
      } catch (error) {
        console.error("[v0] PDF export error:", error)
        alert(`PDF export failed: ${error instanceof Error ? error.message : "Unknown error"}`)
      }
    }

    const exportToKindle = async () => {
      try {
        const response = await fetch("/api/export/kindle", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            pages,
            format: "kindle",
            bookTitle,
            bookSubtitle,
            author,
          }),
        })

        if (response.ok) {
          const blob = await response.blob()
          const url = URL.createObjectURL(blob)
          const a = document.createElement("a")
          a.href = url
          a.download = `${bookTitle || "generated-book"}.mobi`
          a.click()
          URL.revokeObjectURL(url)
        } else {
          alert("Kindle export failed. Please try again.")
        }
      } catch (error) {
        console.error("[v0] Kindle export error:", error)
        alert("Kindle export failed. Please try again.")
      }
    }

    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-slate-800 rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
          <div className="flex items-center justify-between p-6 border-b border-white/10">
            <h3 className="text-xl font-bold text-white">Generated Book Preview</h3>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setZoom(Math.max(0.5, zoom - 0.25))}
                  className="text-white border-white/30 hover:border-white/50 hover:bg-white/10 bg-slate-700/50"
                >
                  Zoom Out
                </Button>
                <span className="text-white text-sm font-medium bg-slate-700/50 px-3 py-1 rounded">
                  {Math.round(zoom * 100)}%
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setZoom(Math.min(2, zoom + 0.25))}
                  className="text-white border-white/30 hover:border-white/50 hover:bg-white/10 bg-slate-700/50"
                >
                  Zoom In
                </Button>
              </div>
              <Button onClick={exportToPDF} className="bg-blue-600 hover:bg-blue-700 text-white">
                Export PDF
              </Button>
              <Button onClick={exportToKindle} className="bg-green-600 hover:bg-green-700 text-white">
                Export Kindle
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={onClose}
                className="text-white border-white/30 hover:border-white/50 hover:bg-white/10 bg-transparent"
              >
                ✕
              </Button>
            </div>
          </div>

          <div className="flex flex-1 overflow-hidden">
            <div className="w-64 bg-slate-900/50 border-r border-white/10 overflow-y-auto">
              <div className="p-4">
                <h4 className="text-white font-medium mb-3">Pages ({enhancedPages.length})</h4>
                <div className="space-y-2">
                  {enhancedPages.map((page, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentPage(index)}
                      className={`w-full text-left p-3 rounded-lg transition-colors ${
                        currentPage === index
                          ? "bg-purple-600 text-white"
                          : "bg-slate-700/50 text-gray-300 hover:bg-slate-600/50"
                      }`}
                    >
                      <div className="font-medium text-sm">
                        {page.type === "cover"
                          ? "Front Cover"
                          : page.type === "back-cover"
                            ? "Back Cover"
                            : `Page ${page.index || index}`}
                      </div>
                      {page.text && (
                        <div className="text-xs opacity-75 mt-1 line-clamp-2">
                          {typeof page.text === "string"
                            ? page.text
                            : page.text.title || page.text.bodyMd || "Story content"}
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-auto bg-gray-100">
              <div className="p-8 flex justify-center">
                <div
                  className="bg-white shadow-2xl"
                  style={{
                    transform: `scale(${zoom})`,
                    transformOrigin: "top center",
                    width: "8.5in",
                    height: "11in",
                    minHeight: "11in",
                  }}
                >
                  {enhancedPages[currentPage]?.type === "cover" ? (
                    <div className="w-full h-full bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700 flex flex-col justify-center items-center text-white p-8 relative overflow-hidden">
                      <div className="absolute inset-0 bg-black/20"></div>
                      <div className="relative z-10 text-center">
                        <h1 className="text-4xl font-bold mb-4 leading-tight">
                          {enhancedPages[currentPage].bookTitle}
                        </h1>
                        {enhancedPages[currentPage].bookSubtitle && (
                          <h2 className="text-xl mb-8 opacity-90">{enhancedPages[currentPage].bookSubtitle}</h2>
                        )}
                        <div className="w-64 h-64 bg-white/20 rounded-lg mb-8 mx-auto flex items-center justify-center">
                          <img
                            src={enhancedPages[currentPage].image || "/placeholder.svg"}
                            alt="Cover"
                            className="w-full h-full object-cover rounded-lg"
                            onError={(e) => {
                              e.currentTarget.style.display = "none"
                              e.currentTarget.nextElementSibling.style.display = "flex"
                            }}
                          />
                          <div className="hidden w-full h-full items-center justify-center text-white/60">📖</div>
                        </div>
                        <p className="text-lg font-medium">{enhancedPages[currentPage].author}</p>
                      </div>
                    </div>
                  ) : enhancedPages[currentPage]?.type === "back-cover" ? (
                    <div className="w-full h-full bg-gradient-to-br from-indigo-700 via-blue-600 to-purple-600 flex flex-col justify-center items-center text-white p-8">
                      <div className="text-center max-w-md">
                        <h3 className="text-2xl font-bold mb-6">About This Book</h3>
                        <p className="text-lg leading-relaxed mb-8 opacity-90">{enhancedPages[currentPage].summary}</p>
                        <p className="text-lg font-medium">{enhancedPages[currentPage].author}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="w-full h-full p-8 flex flex-col">
                      <div className="flex-1 flex">
                        <div className="w-1/2 pr-4">
                          <img
                            src={enhancedPages[currentPage]?.image || "/placeholder.svg?height=600&width=400"}
                            alt={`Page ${currentPage + 1}`}
                            className="w-full h-auto rounded-lg shadow-lg"
                            onError={(e) => {
                              e.currentTarget.src = "/placeholder.svg?height=600&width=400"
                            }}
                          />
                        </div>
                        <div className="w-1/2 pl-4 flex flex-col justify-center">
                          {enhancedPages[currentPage]?.text && (
                            <div className="space-y-4">
                              {typeof enhancedPages[currentPage].text === "string" ? (
                                <p className="text-lg leading-relaxed text-gray-800">
                                  {enhancedPages[currentPage].text}
                                </p>
                              ) : (
                                <>
                                  {enhancedPages[currentPage].text.title && (
                                    <h2 className="text-2xl font-bold text-gray-900 mb-4">
                                      {enhancedPages[currentPage].text.title}
                                    </h2>
                                  )}
                                  {enhancedPages[currentPage].text.bodyMd && (
                                    <div className="prose prose-lg text-gray-800">
                                      {enhancedPages[currentPage].text.bodyMd.split("\n").map((line, i) => (
                                        <p key={i} className="mb-3 leading-relaxed">
                                          {line}
                                        </p>
                                      ))}
                                    </div>
                                  )}
                                  {enhancedPages[currentPage].text.steps && (
                                    <div className="space-y-2">
                                      <h3 className="font-semibold text-gray-900">Story:</h3>
                                      {enhancedPages[currentPage].text.steps.map((step, i) => (
                                        <p key={i} className="text-gray-800 leading-relaxed">
                                          • {step}
                                        </p>
                                      ))}
                                    </div>
                                  )}
                                  {enhancedPages[currentPage].text.proTips && (
                                    <div className="space-y-2 mt-4">
                                      <h3 className="font-semibold text-gray-900">Fun Facts:</h3>
                                      {enhancedPages[currentPage].text.proTips.map((tip, i) => (
                                        <p key={i} className="text-gray-700 italic">
                                          💡 {tip}
                                        </p>
                                      ))}
                                    </div>
                                  )}
                                </>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="mt-4 text-center">
                        <span className="text-sm text-gray-500">
                          Page {enhancedPages[currentPage]?.index || currentPage + 1}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const samplePages = [
    "/images/samples/page1.png",
    "/images/samples/page2.png",
    "/images/samples/page3.png",
    "/images/samples/page4.png",
    "/images/samples/page5.png",
    "/images/samples/page6.png",
    "/images/samples/page7.png",
    "/images/samples/page8.png",
    "/images/samples/page9.png",
    "/images/samples/page10.png",
  ]

  const [currentSamplePage, setCurrentSamplePage] = useState(0)
  const [previewZoom, setPreviewZoom] = useState(1)
  const [selectedPreset, setSelectedPreset] = useState<string>("")

  const presetPromptsOld = [
    {
      id: "underwater",
      title: "Underwater Adventure",
      prompt: "Animals in the jungle, space adventure, underwater world with colorful fish and coral reefs",
      image: "/underwater-coloring-page.png",
    },
    {
      id: "space",
      title: "Space Explorer",
      prompt: "Astronauts exploring alien planets with rockets, stars, and mysterious creatures",
      image: "/sci-fi-novel-cover.png",
    },
    {
      id: "cookbook",
      title: "Recipe Collection",
      prompt: "Delicious family recipes with step-by-step cooking instructions and beautiful food photography",
      image: "/cookbook-cover.png",
    },
    {
      id: "business",
      title: "Business Guide",
      prompt: "Professional business strategies and entrepreneurship tips for modern success",
      image: "/business-guide-book-cover.png",
    },
    {
      id: "children",
      title: "Magical Tales",
      prompt: "Enchanting children's stories with friendly animals and magical adventures",
      image: "/magical-children-book-cover.png",
    },
    {
      id: "activity",
      title: "Fun Activities",
      prompt: "Creative puzzles, mazes, word searches and coloring pages for kids",
      image: "/colorful-activity-book.png",
    },
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSamplePage((prev) => (prev + 1) % samplePages.length)
    }, 3000)
    return () => clearInterval(interval)
  }, [samplePages.length])

  const handleExportPDF = async () => {
    try {
      const response = await fetch("/api/export/pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pages: generatedPages, format: formData.trimSize }),
      })
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = "generated-book.pdf"
      a.click()
    } catch (error) {
      console.error("[v0] Export error:", error)
    }
  }

  const handleExportKindle = async () => {
    try {
      const response = await fetch("/api/export/kindle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pages: generatedPages, format: formData.trimSize }),
      })
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = "generated-book.mobi"
      a.click()
    } catch (error) {
      console.error("[v0] Export error:", error)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <svg
        className="pointer-events-none absolute inset-0 -z-10 h-full w-full opacity-60"
        viewBox="0 0 1200 800"
        fill="none"
        aria-hidden
      >
        {/* Magical landscape elements */}
        <g filter="url(#magical-blur)">
          {/* Colorful trees - enhanced colors for dark theme */}
          <circle cx="200" cy="600" r="80" fill="#FF6B9D" />
          <circle cx="200" cy="520" r="60" fill="#E879F9" />
          <rect x="190" y="600" width="20" height="100" fill="#A855F7" />

          <circle cx="400" cy="580" r="90" fill="#34D399" />
          <circle cx="400" cy="490" r="70" fill="#10B981" />
          <rect x="390" y="580" width="20" height="120" fill="#059669" />

          <circle cx="800" cy="620" r="85" fill="#FBBF24" />
          <circle cx="800" cy="535" r="65" fill="#F59E0B" />
          <rect x="790" y="620" width="20" height="80" fill="#D97706" />

          <circle cx="1000" cy="590" r="75" fill="#60A5FA" />
          <circle cx="1000" cy="515" r="55" fill="#3B82F6" />
          <rect x="990" y="590" width="20" height="110" fill="#1D4ED8" />

          {/* Floating magical elements - brighter for dark theme */}
          <circle cx="150" cy="200" r="25" fill="#F472B6" />
          <circle cx="350" cy="150" r="30" fill="#C084FC" />
          <circle cx="650" cy="180" r="20" fill="#34D399" />
          <circle cx="950" cy="160" r="35" fill="#FBBF24" />

          {/* Stars - brighter yellow */}
          <polygon
            points="100,100 105,115 120,115 108,125 113,140 100,130 87,140 92,125 80,115 95,115"
            fill="#FDE047"
          />
          <polygon points="300,80 303,88 311,88 305,93 308,101 300,96 292,101 295,93 289,88 297,88" fill="#FDE047" />
          <polygon
            points="700,120 703,128 711,128 705,133 708,141 700,136 692,141 695,133 689,128 697,128"
            fill="#FDE047"
          />
          <polygon
            points="1100,90 1103,98 1111,98 1105,103 1108,111 1100,106 1092,111 1095,103 1089,98 1097,98"
            fill="#FDE047"
          />

          {/* Whimsical houses - enhanced colors */}
          <rect x="500" y="500" width="80" height="100" fill="#F97316" />
          <polygon points="500,500 540,450 580,500" fill="#DC2626" />
          <rect x="515" y="550" width="15" height="25" fill="#7C2D12" />
          <circle cx="535" cy="520" r="8" fill="#FEF3C7" />

          <rect x="600" y="520" width="60" height="80" fill="#A855F7" />
          <polygon points="600,520 630,480 660,520" fill="#7C3AED" />
          <rect x="610" y="560" width="12" height="20" fill="#581C87" />
          <circle cx="625" cy="540" r="6" fill="#FEF3C7" />
        </g>
        <defs>
          <filter
            id="magical-blur"
            x="0"
            y="0"
            width="1200"
            height="800"
            filterUnits="userSpaceOnUse"
            colorInterpolationFilters="sRGB"
          >
            <feGaussianBlur stdDeviation="2" />
          </filter>
        </defs>
      </svg>

      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute animate-bounce"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${3 + Math.random() * 2}s`,
            }}
          >
            <Sparkles className="h-4 w-4 text-yellow-300 opacity-80" />
          </div>
        ))}
      </div>

      {/* Header */}
      <header className="sticky top-0 z-20 backdrop-blur-md supports-[backdrop-filter]:bg-slate-900/80 border-b border-white/10 shadow-lg">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative h-10 w-10 rounded-2xl bg-gradient-to-br from-purple-500 via-pink-500 to-yellow-500 shadow-lg flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-black tracking-tight bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              OnePromptBook
            </span>
          </div>
          <nav className="hidden gap-6 text-sm md:flex">
            <Link href="/gallery" className="hover:text-purple-200 font-medium transition-colors text-gray-100">
              Gallery
            </Link>
            <Link href="/demo" className="hover:text-purple-200 font-medium transition-colors text-gray-100">
              Demo
            </Link>
            <Link href="/pricing" className="hover:text-purple-200 font-medium transition-colors text-gray-100">
              Pricing
            </Link>
            <a className="hover:text-purple-200 font-medium transition-colors text-gray-100" href="#features">
              Features
            </a>
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/auth/signin">
              <Button
                variant="ghost"
                className="rounded-xl px-4 py-2 text-sm font-semibold hover:bg-white/10 transition-all text-gray-100 hover:text-white"
              >
                Sign in
              </Button>
            </Link>
            <Link href="/auth/signin">
              <Button className="inline-flex items-center justify-center rounded-xl px-5 py-3 text-sm font-semibold transition transform-gpu hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-offset-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 focus:ring-purple-500 shadow-lg">
                <Wand2 className="h-4 w-4 mr-2" />
                Get started
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Prominent Prompt Section */}
      {/* Enhanced Prompt Section with Form Controls */}
      <section className="py-20 px-6 bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4">Create Something Magical</h2>
            <p className="text-xl text-purple-200">Describe your book idea and watch it come to life</p>
          </div>

          <div className="mb-8">
            <h3 className="text-lg font-semibold text-white mb-4">Quick Start Templates</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {presetPrompts.map((preset, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setPrompt(preset.prompt)
                    setFormData((prev) => ({ ...prev, bookType: preset.type }))
                  }}
                  className="p-4 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 hover:bg-white/20 transition-all text-left"
                >
                  <h4 className="text-white font-medium mb-2">{preset.title}</h4>
                  <p className="text-purple-200 text-sm line-clamp-3">{preset.prompt}</p>
                  <span className="inline-block mt-2 px-2 py-1 bg-purple-600 text-white text-xs rounded">
                    {preset.type}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Book Generator Form */}
            <div className="lg:col-span-1">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <div className="flex items-center gap-2 mb-6">
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                    ✨
                  </div>
                  <h3 className="text-xl font-bold text-white">Book Generator</h3>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-white font-medium mb-2">
                      Prompt/Theme <span className="text-red-400">*</span>
                    </label>
                    <textarea
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      placeholder="e.g., Animals in the jungle, space adventure, underwater world..."
                      className="w-full h-32 px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-purple-500"
                      maxLength={300}
                    />
                    <div className="text-right text-sm text-gray-400 mt-1">{prompt.length}/300</div>
                  </div>

                  <div>
                    <label className="block text-white font-medium mb-2">
                      Book Title <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                      placeholder="Enter your book title..."
                      className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      maxLength={100}
                    />
                  </div>

                  <div>
                    <label className="block text-white font-medium mb-2">Subtitle (optional)</label>
                    <input
                      type="text"
                      value={formData.subtitle}
                      onChange={(e) => setFormData((prev) => ({ ...prev, subtitle: e.target.value }))}
                      placeholder="Enter subtitle..."
                      className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      maxLength={100}
                    />
                  </div>

                  <div>
                    <label className="block text-white font-medium mb-2">Author Name</label>
                    <input
                      type="text"
                      value={formData.author}
                      onChange={(e) => setFormData((prev) => ({ ...prev, author: e.target.value }))}
                      placeholder="Author name..."
                      className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      maxLength={50}
                    />
                  </div>

                  <div>
                    <label className="block text-white font-medium mb-2">
                      Book Type <span className="text-red-400">*</span>
                    </label>
                    <select
                      value={formData.bookType}
                      onChange={(e) => setFormData((prev) => ({ ...prev, bookType: e.target.value }))}
                      className="w-full px-4 py-3 bg-slate-800 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 [&>option]:bg-slate-800 [&>option]:text-white"
                    >
                      {BOOK_TYPES.map((option) => (
                        <option key={option.value} value={option.value} className="bg-slate-800 text-white">
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-white font-medium mb-2">
                      Image Style <span className="text-red-400">*</span>
                    </label>
                    <select
                      value={formData.imageStyle}
                      onChange={(e) => setFormData((prev) => ({ ...prev, imageStyle: e.target.value }))}
                      className="w-full px-4 py-3 bg-slate-800 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 [&>option]:bg-slate-800 [&>option]:text-white"
                    >
                      {BOOK_STYLES.map((option) => (
                        <option key={option.value} value={option.value} className="bg-slate-800 text-white">
                          {option.label}
                        </option>
                      ))}
                    </select>
                    <p className="text-sm text-gray-400 mt-1">
                      {formData.imageStyle === "line-art-coloring" &&
                        "Perfect for coloring books - black outlines only"}
                      {formData.imageStyle === "3d-animated" && "Kid-friendly 3D animated style"}
                      {formData.imageStyle === "realistic-photo" && "Photorealistic images with natural lighting"}
                      {formData.imageStyle === "watercolor" && "Soft watercolor painting style"}
                    </p>
                  </div>

                  <div>
                    <label className="block text-white font-medium mb-2">
                      Image Quality <span className="text-red-400">*</span>
                    </label>
                    <select
                      value={formData.quality}
                      onChange={(e) => setFormData((prev) => ({ ...prev, quality: e.target.value as Quality }))}
                      className="w-full px-4 py-3 bg-slate-800 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 [&>option]:bg-slate-800 [&>option]:text-white"
                    >
                      {QUALITY_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value} className="bg-slate-800 text-white">
                          {option.label}
                        </option>
                      ))}
                    </select>
                    <p className="text-sm text-gray-400 mt-1">
                      {formData.quality === "draft" && "Fast generation with basic quality"}
                      {formData.quality === "standard" && "Balanced speed and quality"}
                      {formData.quality === "ultra" && "Best quality with upscaling (slower)"}
                    </p>
                  </div>

                  <div>
                    <label className="block text-white font-medium mb-2">
                      Number of Pages <span className="text-red-400">*</span>
                    </label>
                    <select
                      value={formData.pages}
                      onChange={(e) => setFormData((prev) => ({ ...prev, pages: Number.parseInt(e.target.value) }))}
                      className="w-full px-4 py-3 bg-slate-800 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 [&>option]:bg-slate-800 [&>option]:text-white"
                    >
                      {Array.from({ length: 50 }, (_, i) => i + 1).map((num) => (
                        <option key={num} value={num} className="bg-slate-800 text-white">
                          {num} {num === 1 ? "page" : "pages"}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-white font-medium mb-2">
                      Kindle Trim Size <span className="text-red-400">*</span>
                    </label>
                    <select
                      value={formData.trimSize}
                      onChange={(e) => setFormData((prev) => ({ ...prev, trimSize: e.target.value }))}
                      className="w-full px-4 py-3 bg-slate-800 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 [&>option]:bg-slate-800 [&>option]:text-white"
                    >
                      <option value="8.5x11" className="bg-slate-800 text-white">
                        8.5" x 11" (Letter)
                      </option>
                      <option value="8x10" className="bg-slate-800 text-white">
                        8" x 10"
                      </option>
                      <option value="7x10" className="bg-slate-800 text-white">
                        7" x 10"
                      </option>
                      <option value="6x9" className="bg-slate-800 text-white">
                        6" x 9"
                      </option>
                      <option value="5.5x8.5" className="bg-slate-800 text-white">
                        5.5" x 8.5"
                      </option>
                    </select>
                  </div>

                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="includeBleed"
                      checked={formData.includeBleed}
                      onChange={(e) => setFormData((prev) => ({ ...prev, includeBleed: e.target.checked }))}
                      className="w-4 h-4 text-purple-600 bg-white/5 border-white/20 rounded focus:ring-purple-500"
                    />
                    <label htmlFor="includeBleed" className="text-white">
                      Include Kindle Bleed (0.125" for print)
                    </label>
                  </div>

                  <Button
                    onClick={handleGenerateBook}
                    disabled={isGenerating || !prompt.trim() || !formData.title.trim()}
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium py-3 rounded-xl transition-all disabled:opacity-50"
                  >
                    {isGenerating ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Generating...
                      </div>
                    ) : (
                      "Generate Book"
                    )}
                  </Button>
                  {uiError && <div className="text-red-500 text-sm mt-2">{uiError}</div>}
                </div>
              </div>
            </div>

            {/* Preview Area */}
            <div className="lg:col-span-2">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 h-full">
                <h3 className="text-xl font-bold text-white mb-4">Book Preview</h3>
                <div className="bg-white/5 rounded-xl p-8 h-96 flex items-center justify-center">
                  {generatedPages.length > 0 ? (
                    <div className="text-center">
                      <img
                        src={generatedPages[0]?.image || "/placeholder.svg?height=300&width=200"}
                        alt="Generated page preview"
                        className="w-48 h-auto rounded-lg shadow-lg mb-4"
                      />
                      <Button onClick={() => setShowPagesViewer(true)} className="bg-purple-600 hover:bg-purple-700">
                        View All Pages ({generatedPages.length})
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center text-gray-400">
                      <div className="w-32 h-40 bg-white/10 rounded-lg mb-4 mx-auto flex items-center justify-center">
                        📖
                      </div>
                      <p>Preview of your generated pages will appear here after you click Generate.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <div className="flex items-center gap-2 px-4 py-2 bg-green-600/20 rounded-full border border-green-500/30">
              <span className="text-green-400">✓</span>
              <span className="text-white text-sm">KDP-ready format</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-blue-600/20 rounded-full border border-blue-500/30">
              <span className="text-blue-400">✓</span>
              <span className="text-white text-sm">Professional content</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-purple-600/20 rounded-full border border-purple-500/30">
              <span className="text-purple-400">✓</span>
              <span className="text-white text-sm">Age-appropriate content</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-orange-600/20 rounded-full border border-orange-500/30">
              <span className="text-orange-400">✓</span>
              <span className="text-white text-sm">Professional quality</span>
            </div>
          </div>
        </div>
      </section>

      {/* Hero Section */}
      <section className="relative py-20">
        <div className="absolute inset-0 bg-gradient-radial from-transparent via-transparent to-black/20 pointer-events-none" />

        <div className="container mx-auto px-4 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left column - Text content */}
          <div className="space-y-6">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight text-white">
              Turn your idea into a{" "}
              <span className="bg-gradient-to-r from-pink-400 via-purple-500 to-pink-600 bg-clip-text text-transparent animate-pulse">
                publish-ready
              </span>{" "}
              ebook with one prompt
            </h1>

            <p className="text-lg md:text-xl text-white leading-relaxed max-w-xl">
              From stories to coloring books to cookbooks — covers, chapters, illustrations, and export-ready PDFs in
              one click. Skip the hassle of juggling multiple tools for text, images, and formatting.
            </p>

            <div className="grid grid-cols-2 gap-4 pt-8">
              <div className="flex items-center gap-3 text-white">
                <Sparkles className="h-5 w-5 text-yellow-400" />
                <span>KDP-ready sizes</span>
              </div>
              <div className="flex items-center gap-3 text-white">
                <Sparkles className="h-5 w-5 text-pink-400" />
                <span>Professional content</span>
              </div>
              <div className="flex items-center gap-3 text-white">
                <Sparkles className="h-5 w-5 text-purple-400" />
                <span>Brand-safe artwork</span>
              </div>
              <div className="flex items-center gap-3 text-white">
                <Sparkles className="h-5 w-5 text-blue-400" />
                <span>One-click PDF export</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-8">
              <Button
                onClick={() => (window.location.href = "/demo")}
                className="group relative px-8 py-4 text-lg font-semibold rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 shadow-2xl hover:shadow-pink-500/25 transform hover:scale-105 transition-all duration-300"
              >
                <Sparkles className="h-5 w-5 mr-2 group-hover:animate-spin" />
                Try the magical demo
              </Button>
            </div>
          </div>

          {/* Right column - Visual elements only */}
          <div className="space-y-8">
            <div className="relative flex justify-center items-center">
              <div className="relative">
                <Image
                  src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/ChatGPT%20Image%20Aug%2018%2C%202025%2C%2012_32_44%20PM-Rr4kQxzD1KI91mZEt781JIdxXQ6BqJ.png"
                  alt="AI-generated children's book creation platform"
                  width={500}
                  height={200}
                  className="drop-shadow-2xl rounded-2xl"
                  priority
                />

                <div className="absolute top-[15%] right-[8%] w-[180px] h-[360px] bg-white rounded-2xl shadow-2xl overflow-hidden border-4 border-gray-800">
                  <div className="h-full overflow-y-auto snap-y snap-mandatory scrollbar-hide">
                    {samplePages.map((src, i) => (
                      <motion.div
                        key={i}
                        className="w-full h-full snap-start flex-shrink-0 relative"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{
                          opacity: i === currentSamplePage ? 1 : 0.7,
                          y: 0,
                          scale: i === currentSamplePage ? 1 : 0.95,
                        }}
                        transition={{ delay: i * 0.1, duration: 0.5 }}
                      >
                        <img
                          src={src || "/placeholder.svg"}
                          alt={`Sample page ${i + 1}`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.src = `/placeholder.svg?height=360&width=180&text=Page ${i + 1}`
                          }}
                        />
                      </motion.div>
                    ))}
                  </div>

                  <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex gap-1">
                    {samplePages.slice(0, 5).map((_, i) => (
                      <div
                        key={i}
                        className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                          i === currentSamplePage % 5 ? "bg-purple-500" : "bg-gray-400"
                        }`}
                      />
                    ))}
                  </div>
                </div>

                <div className="absolute -top-4 -left-4 animate-bounce">
                  <Sparkles className="h-8 w-8 text-yellow-400" />
                </div>
                <div className="absolute -bottom-4 -right-4 animate-bounce" style={{ animationDelay: "1s" }}>
                  <Sparkles className="h-6 w-6 text-pink-400" />
                </div>
                <div className="absolute top-1/2 -left-8 animate-bounce" style={{ animationDelay: "2s" }}>
                  <Sparkles className="h-5 w-5 text-purple-400" />
                </div>
              </div>

              <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 flex items-center gap-2 text-white">
                <Sparkles className="h-4 w-4 text-yellow-400" />
                <span className="text-sm font-medium">Flip through an AI-generated book</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      {/* Features Section with Book Covers */}
      <section id="features" className="py-16 md:py-24 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 left-10 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div
            className="absolute bottom-20 right-10 w-40 h-40 bg-pink-500/10 rounded-full blur-3xl animate-pulse"
            style={{ animationDelay: "1s" }}
          ></div>
        </div>

        <div className="container mx-auto px-4 relative">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-sm border border-white/20 rounded-full px-6 py-3 mb-8">
              <Sparkles className="h-5 w-5 text-purple-400" />
              <span className="text-sm font-semibold text-gray-200">Powered by AI Magic</span>
            </div>

            <h2 className="text-4xl md:text-5xl font-black tracking-tight text-white mb-6">
              Built for{" "}
              <span className="relative">
                <span className="bg-gradient-to-r from-purple-400 via-pink-500 to-purple-600 bg-clip-text text-transparent">
                  magical speed
                </span>
                <div className="absolute -top-2 -right-2 animate-bounce">
                  <Sparkles className="h-6 w-6 text-yellow-400" />
                </div>
              </span>
              , safety, and quality
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              🚀 Launch any type of ebook in minutes with professional content, brand-safe artwork, and KDP-ready
              formatting that readers love.
            </p>
          </div>

          <div className="grid gap-8 lg:gap-12">
            {/* Top row - Hero features with book covers */}
            <div className="grid md:grid-cols-2 gap-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-purple-600/20 via-purple-500/10 to-pink-600/20 backdrop-blur-sm border border-white/20 p-8 hover:shadow-2xl hover:shadow-purple-500/20 transition-all duration-500 hover:scale-[1.02]"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
                <div className="relative">
                  <div className="flex items-start gap-6 mb-6">
                    <img
                      src="/magical-children-book-cover.png"
                      alt="One-prompt builder example"
                      className="w-20 h-28 rounded-lg shadow-lg border border-white/20 group-hover:scale-105 transition-transform duration-300"
                    />
                    <div>
                      <h3 className="text-2xl font-bold text-white group-hover:text-purple-200 transition-colors duration-300">
                        One‑prompt builder
                      </h3>
                      <p className="text-purple-300 font-medium">The magic starts here</p>
                    </div>
                  </div>
                  <p className="text-gray-300 text-lg leading-relaxed">
                    Describe your idea once—get a complete book plan with chapters, illustrations, activities, and more.
                    No complex setup, just pure creative magic for any genre.
                  </p>
                  <div className="mt-6 flex items-center gap-2 text-sm text-purple-300">
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
                    <span>Try it now with any idea</span>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600/20 via-green-500/10 to-teal-600/20 backdrop-blur-sm border border-white/20 p-8 hover:shadow-2xl hover:shadow-blue-500/20 transition-all duration-500 hover:scale-[1.02]"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400/20 to-green-400/20 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
                <div className="relative">
                  <div className="flex items-start gap-6 mb-6">
                    <img
                      src="/cookbook-cover.png"
                      alt="KDP-ready PDFs example"
                      className="w-20 h-28 rounded-lg shadow-lg border border-white/20 group-hover:scale-105 transition-transform duration-300"
                    />
                    <div>
                      <h3 className="text-2xl font-bold text-white group-hover:text-blue-200 transition-colors duration-300">
                        KDP-ready PDFs
                      </h3>
                      <p className="text-blue-300 font-medium">Print-perfect quality</p>
                    </div>
                  </div>
                  <p className="text-gray-300 text-lg leading-relaxed">
                    Trim sizes, margins, and professional formatting embedded. Export as PDF for any ebook type. Amazon
                    KDP compliant from day one.
                  </p>
                  <div className="mt-6 flex items-center gap-2 text-sm text-blue-300">
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
                    <span>Ready for publishing</span>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Middle row - Feature grid with book examples */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  title: "Universal content",
                  description:
                    "Stories, coloring pages, activities, recipes, guides - any content type with professional quality.",
                  bookCover: "/sci-fi-novel-cover.png",
                  gradient: "from-pink-500 to-yellow-500",
                  delay: 0.2,
                },
                {
                  title: "Smart generation",
                  description:
                    "AI-powered content creation with guaranteed quality and coherent structure for any genre.",
                  bookCover: "/colorful-activity-book.png",
                  gradient: "from-yellow-500 to-orange-500",
                  delay: 0.3,
                },
                {
                  title: "Multilingual",
                  description: "English & French content with age-appropriate tone and simple reading levels.",
                  bookCover: "/bilingual-children-book-cover.png",
                  gradient: "from-green-500 to-blue-500",
                  delay: 0.4,
                },
                {
                  title: "Team & quotas",
                  description: "Org workspaces, roles, usage limits, and billing for predictable costs.",
                  bookCover: "/business-guide-book-cover.png",
                  gradient: "from-indigo-500 to-purple-500",
                  delay: 0.5,
                },
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: feature.delay }}
                  className="group relative overflow-hidden rounded-2xl bg-slate-800/60 backdrop-blur-sm border border-white/10 p-6 hover:bg-slate-800/80 hover:border-white/20 hover:shadow-xl transition-all duration-300 hover:scale-105"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative">
                    <div className="mb-4 flex justify-center">
                      <img
                        src={feature.bookCover || "/placeholder.svg"}
                        alt={`${feature.title} example`}
                        className="w-16 h-20 rounded-lg shadow-lg border border-white/20 group-hover:scale-110 transition-transform duration-300"
                      />
                    </div>
                    <h4 className="text-lg font-bold text-white mb-3 group-hover:text-gray-100 transition-colors duration-300 text-center">
                      {feature.title}
                    </h4>
                    <p className="text-sm text-gray-300 leading-relaxed group-hover:text-gray-200 transition-colors duration-300 text-center">
                      {feature.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Demo Section */}
      <section className="border-y border-white/10 bg-slate-800/50 py-14">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-black text-white mb-4">See a page come to life</h3>
            <p className="text-gray-300 max-w-2xl mx-auto">
              Explore our magical collection of AI-generated ebooks. Each one created from a simple prompt, ready for
              publishing and sharing with readers worldwide.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
            {[
              {
                title: "PLAYGROUND",
                subtitle: "coloring book",
                theme: "Playground Adventures",
                age: "3-6 years",
                pages: "24 pages",
                description: "Fun playground scenes with swings, slides, and happy children playing together.",
                imageUrl: "/playground-dino-coloring.png",
              },
              {
                title: "DINOSAUR",
                subtitle: "coloring book",
                theme: "Prehistoric Friends",
                age: "4-8 years",
                pages: "28 pages",
                description: "Friendly dinosaurs in various scenes, perfect for young paleontologists.",
                imageUrl: "/dinosaur-coloring-book.png",
              },
              {
                title: "RESTAURANT FUN",
                subtitle: "activity book",
                theme: "Culinary Adventures",
                age: "5-9 years",
                pages: "32 pages",
                description: "Kitchen adventures with cooking activities, mazes, and food-themed puzzles.",
                imageUrl: "/cat-chef-activity-book.png",
              },
              {
                title: "CUTE PETS",
                subtitle: "coloring book",
                theme: "Animal Friends",
                age: "3-7 years",
                pages: "26 pages",
                description: "Adorable pets including cats, dogs, rabbits, and birds in playful scenes.",
                imageUrl: "/cute-pets-coloring-book.png",
              },
              {
                title: "SOCCER ALL-STAR",
                subtitle: "activity book",
                theme: "Sports Champions",
                age: "6-10 years",
                pages: "30 pages",
                description: "Soccer-themed activities with field mazes, team puzzles, and action scenes.",
                imageUrl: "/soccer-activity-book-cover.png",
              },
              {
                title: "DINOSAUR",
                subtitle: "drawing book",
                theme: "Art & Creativity",
                age: "5-9 years",
                pages: "24 pages",
                description: "Step-by-step drawing guides for creating your own dinosaur masterpieces.",
                imageUrl: "/dinosaur-drawing-book-cover.png",
              },
              {
                title: "UNDER THE SEA",
                subtitle: "coloring book",
                theme: "Ocean Adventures",
                age: "4-8 years",
                pages: "28 pages",
                description: "Underwater scenes with fish, coral reefs, and marine life exploration.",
                imageUrl: "/under-the-sea-coloring-book.png",
              },
              {
                title: "OUTER SPACE",
                subtitle: "activity book",
                theme: "Cosmic Exploration",
                age: "6-10 years",
                pages: "32 pages",
                description: "Space adventures with astronauts, planets, and galaxy-themed puzzles.",
                imageUrl: "/outer-space-activity-book.png",
              },
              {
                title: "FAIRY PRINCESS",
                subtitle: "coloring book",
                theme: "Magical Kingdom",
                age: "4-8 years",
                pages: "26 pages",
                description: "Enchanted fairy tales with princesses, castles, and magical creatures.",
                imageUrl: "/fairy-princess-coloring-book.png",
              },
              {
                title: "PLAYFUL MONSTERS",
                subtitle: "coloring book",
                theme: "Friendly Creatures",
                age: "3-7 years",
                pages: "24 pages",
                description: "Cute and friendly monsters that spark imagination without being scary.",
                imageUrl: "/playful-monsters-coloring-book.png",
              },
            ].map((book, index) => (
              <div
                key={index}
                className="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 cursor-pointer"
              >
                <div className="h-48 relative overflow-hidden">
                  <img
                    src={book.imageUrl || "/placeholder.svg"}
                    alt={`${book.title} ${book.subtitle}`}
                    className="absolute inset-0 w-full h-full object-cover transform scale-110 group-hover:scale-125 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-all duration-300" />

                  {/* Title overlay */}
                  <div className="absolute top-4 left-4 right-4">
                    <h4 className="font-black text-sm text-white drop-shadow-lg leading-tight">{book.title}</h4>
                    <p className="text-xs text-white/90 font-medium drop-shadow-lg">{book.subtitle}</p>
                  </div>

                  {/* Sparkle icon */}
                  <div className="absolute bottom-4 right-4">
                    <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white">
                      <Sparkles className="h-4 w-4" />
                    </div>
                  </div>
                </div>

                {/* Hover overlay with details */}
                <div className="absolute inset-0 bg-slate-900/95 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-300 p-4 flex flex-col justify-center">
                  <h5 className="text-white font-bold text-sm mb-2">{book.theme}</h5>
                  <p className="text-gray-300 text-xs mb-3 leading-relaxed">{book.description}</p>
                  <div className="space-y-1 text-xs">
                    <div className="flex items-center gap-2 text-purple-300">
                      <Users className="h-3 w-3" />
                      <span>{book.age}</span>
                    </div>
                    <div className="flex items-center gap-2 text-blue-300">
                      <BookOpen className="h-3 w-3" />
                      <span>{book.pages}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center">
            <Link href="/dashboard/create">
              <Button className="inline-flex items-center justify-center rounded-xl px-6 py-4 text-base font-semibold transition transform-gpu hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-offset-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 focus:ring-purple-500 shadow-lg mr-4">
                <Wand2 className="h-5 w-5 mr-2" />
                Create your own magical book
              </Button>
            </Link>
            <a
              className="text-sm font-semibold underline underline-offset-4 text-purple-300 hover:text-purple-200 transition-colors"
              href="#"
            >
              View sample PDFs
            </a>
          </div>
        </div>
      </section>

      {/* Coloring Book Showcase Section */}
      <ColoringBookShowcase />

      {/* Pricing Preview */}
      <section className="container mx-auto px-4 py-24">
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 mb-6">
            <Heart className="h-4 w-4 text-pink-400" />
            <span className="text-sm font-medium text-gray-200">Simple Pricing</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Start Your{" "}
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Creative Journey
            </span>
          </h2>
          <p className="text-xl text-gray-300">
            Begin with our free plan, upgrade when you're ready to create more magic
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <Card className="border-white/20 hover:shadow-lg transition-all duration-300 bg-slate-800/90 backdrop-blur-sm">
            <CardHeader className="text-center pb-8">
              <CardTitle className="text-2xl mb-2 text-white">Free</CardTitle>
              <CardDescription className="text-4xl font-bold text-white mb-2">
                $0<span className="text-lg font-normal text-gray-300">/month</span>
              </CardDescription>
              <p className="text-sm text-gray-300">Perfect for trying out the magic</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-3 text-sm">
                <li className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-pink-400" />
                  <span className="text-gray-200">3 magical projects per month</span>
                </li>
                <li className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-pink-400" />
                  <span className="text-gray-200">Basic AI story generation</span>
                </li>
                <li className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-pink-400" />
                  <span className="text-gray-200">Standard illustration styles</span>
                </li>
                <li className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-pink-400" />
                  <span className="text-gray-200">PDF export</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-purple-400/50 relative hover:shadow-2xl transition-all duration-300 bg-slate-800/95 backdrop-blur-sm transform scale-105">
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <span className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg">
                ✨ Most Magical
              </span>
            </div>
            <CardHeader className="text-center pb-8 pt-8">
              <CardTitle className="text-2xl mb-2 text-white">Pro</CardTitle>
              <CardDescription className="text-4xl font-bold text-white mb-2">
                $19<span className="text-lg font-normal text-gray-300">/month</span>
              </CardDescription>
              <p className="text-sm text-gray-300">For serious storytellers</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-3 text-sm">
                <li className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-purple-400" />
                  <span className="text-gray-200">Unlimited magical projects</span>
                </li>
                <li className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-purple-400" />
                  <span className="text-gray-200">Advanced AI storytelling</span>
                </li>
                <li className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-purple-400" />
                  <span className="text-gray-200">Premium illustration styles</span>
                </li>
                <li className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-purple-400" />
                  <span className="text-gray-200">Priority magical support</span>
                </li>
                <li className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-purple-400" />
                  <span className="text-gray-200">Commercial publishing license</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-white/20 hover:shadow-lg transition-all duration-300 bg-slate-800/90 backdrop-blur-sm">
            <CardHeader className="text-center pb-8">
              <CardTitle className="text-2xl mb-2 text-white">Team</CardTitle>
              <CardDescription className="text-4xl font-bold text-white mb-2">
                $49<span className="text-lg font-normal text-gray-300">/month</span>
              </CardDescription>
              <p className="text-sm text-gray-300">For creative teams & educators</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-3 text-sm">
                <li className="flex items-center gap-2">
                  <Heart className="h-4 w-4 text-pink-400" />
                  <span className="text-gray-200">Everything in Pro</span>
                </li>
                <li className="flex items-center gap-2">
                  <Heart className="h-4 w-4 text-pink-400" />
                  <span className="text-gray-200">Team collaboration magic</span>
                </li>
                <li className="flex items-center gap-2">
                  <Heart className="h-4 w-4 text-pink-400" />
                  <span className="text-gray-200">Custom brand styling</span>
                </li>
                <li className="flex items-center gap-2">
                  <Heart className="h-4 w-4 text-pink-400" />
                  <span className="text-gray-200">Analytics & insights</span>
                </li>
                <li className="flex items-center gap-2">
                  <Heart className="h-4 w-4 text-pink-400" />
                  <span className="text-gray-200">Dedicated support wizard</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-10 text-sm">
        <div className="container mx-auto px-4 flex flex-col items-center justify-between gap-6 md:flex-row">
          <div className="flex items-center gap-2 text-gray-400">
            <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500" />
            <span>OnePromptBook</span>
            <span className="mx-2">•</span>
            <span className="text-gray-500">Create. Print. Play.</span>
          </div>
          <div className="flex items-center gap-6 text-gray-400">
            <a href="#" className="hover:text-gray-300 transition-colors">
              Privacy
            </a>
            <a href="#" className="hover:text-gray-300 transition-colors">
              Terms
            </a>
            <a href="#" className="hover:text-gray-300 transition-colors">
              Contact
            </a>
          </div>
        </div>
      </footer>

      {showPreview && generatedPages.length > 0 && (
        <EnhancedBookPreview
          pages={generatedPages}
          onClose={() => setShowPreview(false)}
          bookTitle={formData.title}
          bookSubtitle={formData.subtitle}
          author={formData.author}
        />
      )}
    </div>
  )
}
