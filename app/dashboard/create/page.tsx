"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, BookOpen, Palette, Sparkles } from "lucide-react"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"

export default function CreateProjectPage() {
  const router = useRouter()
  const [isGenerating, setIsGenerating] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    prompt: "",
    type: "story" as "story" | "coloring-book",
    ageGroup: "",
    pageCount: 12,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.prompt || !formData.ageGroup) return

    setIsGenerating(true)
    try {
      const response = await fetch("/api/projects/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      const data = await response.json()
      if (data.success) {
        router.push(`/dashboard/projects/${data.project.id}`)
      } else {
        console.error("Generation failed:", data.error)
      }
    } catch (error) {
      console.error("Generation error:", error)
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Create New Project</h1>
          <p className="text-muted-foreground">Generate a children's story or coloring book with AI</p>
        </div>

        <Tabs
          value={formData.type}
          onValueChange={(value) => setFormData((prev) => ({ ...prev, type: value as "story" | "coloring-book" }))}
        >
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="story" className="flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              Story Book
            </TabsTrigger>
            <TabsTrigger value="coloring-book" className="flex items-center gap-2">
              <Palette className="w-4 h-4" />
              Coloring Book
            </TabsTrigger>
          </TabsList>

          <form onSubmit={handleSubmit} className="space-y-6">
            <TabsContent value="story">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-primary" />
                    Story Book Details
                  </CardTitle>
                  <CardDescription>Create an engaging children's story with illustrations</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="title">Title (Optional)</Label>
                    <Input
                      id="title"
                      placeholder="Leave blank to auto-generate"
                      value={formData.title}
                      onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                    />
                  </div>

                  <div>
                    <Label htmlFor="prompt">Story Prompt *</Label>
                    <Textarea
                      id="prompt"
                      placeholder="A brave little mouse who goes on an adventure to find the magical cheese..."
                      value={formData.prompt}
                      onChange={(e) => setFormData((prev) => ({ ...prev, prompt: e.target.value }))}
                      rows={3}
                      required
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="coloring-book">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Palette className="w-5 h-5 text-primary" />
                    Coloring Book Details
                  </CardTitle>
                  <CardDescription>Create fun coloring pages for children</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="title">Title (Optional)</Label>
                    <Input
                      id="title"
                      placeholder="Leave blank to auto-generate"
                      value={formData.title}
                      onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                    />
                  </div>

                  <div>
                    <Label htmlFor="prompt">Theme/Topic *</Label>
                    <Textarea
                      id="prompt"
                      placeholder="Ocean animals, farm life, space adventure, dinosaurs..."
                      value={formData.prompt}
                      onChange={(e) => setFormData((prev) => ({ ...prev, prompt: e.target.value }))}
                      rows={3}
                      required
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <Card>
              <CardHeader>
                <CardTitle>Settings</CardTitle>
                <CardDescription>Configure your project settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="ageGroup">Age Group *</Label>
                    <Select
                      value={formData.ageGroup}
                      onValueChange={(value) => setFormData((prev) => ({ ...prev, ageGroup: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select age group" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="toddlers (2-3 years)">Toddlers (2-3 years)</SelectItem>
                        <SelectItem value="preschool (4-5 years)">Preschool (4-5 years)</SelectItem>
                        <SelectItem value="early elementary (6-8 years)">Early Elementary (6-8 years)</SelectItem>
                        <SelectItem value="elementary (9-12 years)">Elementary (9-12 years)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="pageCount">Number of Pages</Label>
                    <Select
                      value={formData.pageCount.toString()}
                      onValueChange={(value) => setFormData((prev) => ({ ...prev, pageCount: Number.parseInt(value) }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="8">8 pages</SelectItem>
                        <SelectItem value="12">12 pages</SelectItem>
                        <SelectItem value="16">16 pages</SelectItem>
                        <SelectItem value="20">20 pages</SelectItem>
                        <SelectItem value="24">24 pages</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end gap-4">
              <Button type="button" variant="outline" onClick={() => router.back()} disabled={isGenerating}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isGenerating || !formData.prompt || !formData.ageGroup}
                className="min-w-[140px]"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Generate {formData.type === "story" ? "Story" : "Coloring Book"}
                  </>
                )}
              </Button>
            </div>
          </form>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
