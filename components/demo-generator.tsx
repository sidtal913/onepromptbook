"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Loader2,
  Sparkles,
  BookOpen,
  Palette,
  PuzzleIcon,
  Download,
  Eye,
  RefreshCw,
  Clock,
  CheckCircle,
} from "lucide-react"
import Image from "next/image"

interface GeneratedPage {
  id: number
  type: "cover" | "coloring" | "activity" | "story"
  title: string
  image: string
  description: string
}

const samplePrompts = [
  "Cute baby forest animals having a picnic",
  "Friendly dinosaurs playing in a magical garden",
  "Ocean adventure with colorful sea creatures",
  "Space exploration with friendly aliens",
  "Farm animals learning to cook together",
]

const demoPages: GeneratedPage[] = [
  {
    id: 1,
    type: "cover",
    title: "Book Cover",
    image: "/images/samples/page1.png",
    description: "Beautiful cover with title and characters",
  },
  {
    id: 2,
    type: "coloring",
    title: "Forest Friends",
    image: "/images/samples/page2.png",
    description: "Adorable animals ready for coloring",
  },
  {
    id: 3,
    type: "coloring",
    title: "Picnic Time",
    image: "/images/samples/page3.png",
    description: "Fun picnic scene with detailed line art",
  },
  {
    id: 4,
    type: "activity",
    title: "Animal Maze",
    image: "/images/samples/page4.png",
    description: "Help the bunny find the carrots",
  },
  {
    id: 5,
    type: "coloring",
    title: "Tree House",
    image: "/images/samples/page6.png",
    description: "Magical tree house adventure",
  },
  {
    id: 6,
    type: "activity",
    title: "Word Search",
    image: "/images/samples/page7.png",
    description: "Find all the forest animal names",
  },
]

export function DemoGenerator() {
  const [isGenerating, setIsGenerating] = useState(false)
  const [generationStep, setGenerationStep] = useState(0)
  const [showResults, setShowResults] = useState(false)
  const [formData, setFormData] = useState({
    prompt: "",
    ageRange: "5-7" as const,
    bookType: "coloring" as const,
    pages: 12,
  })

  const generationSteps = [
    { label: "Analyzing your prompt", icon: <Sparkles className="h-4 w-4" /> },
    { label: "Planning book structure", icon: <BookOpen className="h-4 w-4" /> },
    { label: "Generating illustrations", icon: <Palette className="h-4 w-4" /> },
    { label: "Creating activities", icon: <PuzzleIcon className="h-4 w-4" /> },
    { label: "Finalizing pages", icon: <CheckCircle className="h-4 w-4" /> },
  ]

  const handleGenerate = async () => {
    if (!formData.prompt.trim()) return

    setIsGenerating(true)
    setShowResults(false)
    setGenerationStep(0)

    // Simulate generation process
    for (let i = 0; i < generationSteps.length; i++) {
      setGenerationStep(i)
      await new Promise((resolve) => setTimeout(resolve, 1500))
    }

    setIsGenerating(false)
    setShowResults(true)
  }

  const handleTryPrompt = (prompt: string) => {
    setFormData((prev) => ({ ...prev, prompt }))
  }

  const resetDemo = () => {
    setShowResults(false)
    setIsGenerating(false)
    setGenerationStep(0)
  }

  return (
    <div className="max-w-6xl mx-auto">
      {!showResults ? (
        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Input Form */}
          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Sparkles className="h-5 w-5 text-pink-400" />
                Create Your Demo Book
              </CardTitle>
              <CardDescription className="text-gray-300">
                Enter a simple prompt and watch the magic happen
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="prompt" className="text-white">
                  Book Theme / Prompt
                </Label>
                <Input
                  id="prompt"
                  placeholder="Describe your book idea..."
                  value={formData.prompt}
                  onChange={(e) => setFormData((prev) => ({ ...prev, prompt: e.target.value }))}
                  className="bg-white/10 border-white/30 text-white placeholder:text-gray-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-white">Age Range</Label>
                  <Select
                    value={formData.ageRange}
                    onValueChange={(value: any) => setFormData((prev) => ({ ...prev, ageRange: value }))}
                  >
                    <SelectTrigger className="bg-white/10 border-white/30 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2-4">2-4 years</SelectItem>
                      <SelectItem value="5-7">5-7 years</SelectItem>
                      <SelectItem value="8-12">8-12 years</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-white">Book Type</Label>
                  <Select
                    value={formData.bookType}
                    onValueChange={(value: any) => setFormData((prev) => ({ ...prev, bookType: value }))}
                  >
                    <SelectTrigger className="bg-white/10 border-white/30 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="coloring">Coloring Book</SelectItem>
                      <SelectItem value="activity">Activity Book</SelectItem>
                      <SelectItem value="story">Story Book</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button
                onClick={handleGenerate}
                disabled={!formData.prompt.trim() || isGenerating}
                className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
                size="lg"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Magic...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Generate Demo Book
                  </>
                )}
              </Button>

              {isGenerating && (
                <div className="space-y-3">
                  {generationSteps.map((step, index) => (
                    <div
                      key={index}
                      className={`flex items-center gap-3 p-3 rounded-lg transition-all ${
                        index === generationStep
                          ? "bg-pink-500/20 text-pink-300"
                          : index < generationStep
                            ? "bg-green-500/20 text-green-300"
                            : "bg-white/5 text-gray-400"
                      }`}
                    >
                      {index < generationStep ? (
                        <CheckCircle className="h-4 w-4" />
                      ) : index === generationStep ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        step.icon
                      )}
                      <span className="text-sm">{step.label}</span>
                    </div>
                  ))}
                </div>
              )}

              <div className="text-xs text-gray-400 text-center">
                <Clock className="h-3 w-3 inline mr-1" />
                Demo generation takes about 8 seconds
              </div>
            </CardContent>
          </Card>

          {/* Sample Prompts */}
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold text-white mb-4">Try These Sample Prompts</h3>
              <div className="space-y-3">
                {samplePrompts.map((prompt, index) => (
                  <Card
                    key={index}
                    className="bg-white/5 border-white/10 hover:bg-white/10 cursor-pointer transition-all"
                    onClick={() => handleTryPrompt(prompt)}
                  >
                    <CardContent className="p-4">
                      <p className="text-gray-300 text-sm">{prompt}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            <div className="bg-gradient-to-r from-pink-500/10 to-purple-500/10 rounded-lg p-6 border border-pink-500/20">
              <h4 className="text-white font-semibold mb-2">What You'll Get:</h4>
              <ul className="space-y-2 text-sm text-gray-300">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-400" />
                  Complete book with cover and interior pages
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-400" />
                  Age-appropriate content and difficulty
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-400" />
                  Print-ready PDF format
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-400" />
                  Professional illustrations
                </li>
              </ul>
            </div>
          </div>
        </div>
      ) : (
        /* Results View */
        <div className="space-y-8">
          {/* Header */}
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <CheckCircle className="h-8 w-8 text-green-400" />
              <h3 className="text-3xl font-bold text-white">Your Book is Ready!</h3>
            </div>
            <p className="text-gray-300 mb-6">
              Here's your AI-generated "{formData.prompt}" book for ages {formData.ageRange}
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button
                onClick={resetDemo}
                variant="outline"
                className="border-white/30 text-white hover:bg-white/10 bg-transparent"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Another
              </Button>
              <Button className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700">
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </Button>
            </div>
          </div>

          {/* Book Preview */}
          <Tabs defaultValue="preview" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-white/10">
              <TabsTrigger value="preview" className="data-[state=active]:bg-white/20">
                <Eye className="h-4 w-4 mr-2" />
                Page Preview
              </TabsTrigger>
              <TabsTrigger value="details" className="data-[state=active]:bg-white/20">
                <BookOpen className="h-4 w-4 mr-2" />
                Book Details
              </TabsTrigger>
            </TabsList>

            <TabsContent value="preview" className="mt-6">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {demoPages.map((page) => (
                  <Card
                    key={page.id}
                    className="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/15 transition-all"
                  >
                    <CardContent className="p-4">
                      <div className="relative mb-4">
                        <Image
                          src={page.image || "/placeholder.svg"}
                          alt={page.title}
                          width={300}
                          height={400}
                          className="w-full h-48 object-cover rounded-lg"
                        />
                        <Badge variant="secondary" className="absolute top-2 right-2 bg-black/50 text-white">
                          {page.type}
                        </Badge>
                      </div>
                      <h4 className="text-white font-semibold mb-2">{page.title}</h4>
                      <p className="text-gray-300 text-sm">{page.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="details" className="mt-6">
              <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                <CardContent className="p-6">
                  <div className="grid md:grid-cols-2 gap-8">
                    <div>
                      <h4 className="text-white font-semibold mb-4">Book Specifications</h4>
                      <div className="space-y-3 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-300">Theme:</span>
                          <span className="text-white">{formData.prompt}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-300">Age Range:</span>
                          <span className="text-white">{formData.ageRange} years</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-300">Type:</span>
                          <span className="text-white capitalize">{formData.bookType} Book</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-300">Pages:</span>
                          <span className="text-white">{formData.pages} pages</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-300">Format:</span>
                          <span className="text-white">8.5" × 11" PDF</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-white font-semibold mb-4">What's Included</h4>
                      <ul className="space-y-2 text-sm text-gray-300">
                        <li className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-400" />
                          Professional cover design
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-400" />
                          {Math.floor(formData.pages * 0.7)} coloring pages
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-400" />
                          {Math.floor(formData.pages * 0.3)} activity pages
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-400" />
                          Print-ready PDF format
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-400" />
                          Amazon KDP compatible
                        </li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* CTA Section */}
          <div className="text-center py-12 border-t border-white/10">
            <h3 className="text-2xl font-bold text-white mb-4">Love What You See?</h3>
            <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
              This is just a demo! Sign up for free to create unlimited books, access premium features, and download
              your creations.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
              >
                Start Creating Free
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white/30 text-white hover:bg-white/10 bg-transparent"
              >
                View Pricing
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
