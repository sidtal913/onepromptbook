"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Sparkles } from "lucide-react"

export default function BookGenerator() {
  const [isGenerating, setIsGenerating] = useState(false)
  const [formData, setFormData] = useState({
    prompt: "",
    ageRange: "5-7" as const,
    trim: "8.5x11" as const,
    bleed: false,
    pages: 24,
    mode: "COLORING" as const,
    language: "EN" as const,
    noBrands: true,
  })

  const handleGenerate = async () => {
    if (!formData.prompt.trim()) return

    setIsGenerating(true)

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      const result = await response.json()

      if (response.ok) {
        // Redirect to job status page
        window.location.href = `/jobs/${result.jobId}`
      } else {
        alert(result.error || "Generation failed")
      }
    } catch (error) {
      console.error("Generation error:", error)
      alert("Generation failed")
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-500" />
            Generate Your KDP Book
          </CardTitle>
          <CardDescription>Create a complete, print-ready children's book from a single prompt</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="prompt">Book Theme / Prompt</Label>
            <Input
              id="prompt"
              placeholder="Cute baby forest animals having a picnic..."
              value={formData.prompt}
              onChange={(e) => setFormData((prev) => ({ ...prev, prompt: e.target.value }))}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Age Range</Label>
              <Select
                value={formData.ageRange}
                onValueChange={(value: any) => setFormData((prev) => ({ ...prev, ageRange: value }))}
              >
                <SelectTrigger>
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
              <Label>Trim Size</Label>
              <Select
                value={formData.trim}
                onValueChange={(value: any) => setFormData((prev) => ({ ...prev, trim: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="8.5x11">8.5" × 11"</SelectItem>
                  <SelectItem value="8x10">8" × 10"</SelectItem>
                  <SelectItem value="6x9">6" × 9"</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="pages">Number of Pages</Label>
              <Input
                id="pages"
                type="number"
                min="10"
                max="100"
                step="2"
                value={formData.pages}
                onChange={(e) => setFormData((prev) => ({ ...prev, pages: Number.parseInt(e.target.value) || 24 }))}
              />
              <p className="text-xs text-muted-foreground">Must be even number, minimum 10</p>
            </div>

            <div className="space-y-2">
              <Label>Book Type</Label>
              <Select
                value={formData.mode}
                onValueChange={(value: any) => setFormData((prev) => ({ ...prev, mode: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="COLORING">Coloring Book</SelectItem>
                  <SelectItem value="ACTIVITY">Activity Book</SelectItem>
                  <SelectItem value="STORY">Story Book</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="bleed"
              checked={formData.bleed}
              onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, bleed: !!checked }))}
            />
            <Label htmlFor="bleed">Add bleed area (+0.125")</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="noBrands"
              checked={formData.noBrands}
              onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, noBrands: !!checked }))}
            />
            <Label htmlFor="noBrands">Remove brands/IP references</Label>
          </div>

          <Button
            onClick={handleGenerate}
            disabled={!formData.prompt.trim() || isGenerating}
            className="w-full"
            size="lg"
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating Your Book...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Generate KDP Book
              </>
            )}
          </Button>

          <div className="text-xs text-muted-foreground text-center">
            This will generate exactly {formData.pages} pages including cover, back, spine, and interior pages.
            <br />
            Free tier: 5 pages remaining this month.
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
