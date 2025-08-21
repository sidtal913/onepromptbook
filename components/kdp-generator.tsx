"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, Download, FileText, ImageIcon } from "lucide-react"
import { validatePageCount } from "@/lib/kdp"

interface GenerationJob {
  id: string
  status: "pending" | "processing" | "completed" | "failed"
  progress: number
  files?: {
    interior: string
    coverFront: string
    coverWrap?: string
    zip: string
  }
}

export function KDPGenerator() {
  const [formData, setFormData] = useState({
    theme: "",
    ageRange: "5-7" as const,
    kdpSize: "8.5x11",
    pageCount: 30,
    paper: "WHITE" as const,
    mode: "COLORING" as const,
    language: "EN" as const,
    ipAgreement: false,
  })

  const [job, setJob] = useState<GenerationJob | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)

  const handleGenerate = async () => {
    if (!formData.theme.trim() || !formData.ipAgreement) return
    if (!validatePageCount(formData.pageCount)) {
      alert("Page count must be between 24-828 and even number")
      return
    }

    setIsGenerating(true)
    try {
      const response = await fetch("/api/kdp/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (!response.ok) throw new Error("Generation failed")

      const jobData = await response.json()
      setJob(jobData)

      // Poll for job status
      const pollInterval = setInterval(async () => {
        const statusResponse = await fetch(`/api/kdp/jobs/${jobData.id}`)
        const updatedJob = await statusResponse.json()
        setJob(updatedJob)

        if (updatedJob.status === "completed" || updatedJob.status === "failed") {
          clearInterval(pollInterval)
          setIsGenerating(false)
        }
      }, 2000)
    } catch (error) {
      console.error("Generation error:", error)
      setIsGenerating(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          1-Click KDP Generator
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300">
          Generate complete, print-ready children's books for Amazon KDP with a single prompt
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Book Configuration</CardTitle>
            <CardDescription>Configure your book settings and generate KDP-ready PDFs</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="theme">Theme / Prompt *</Label>
              <Textarea
                id="theme"
                placeholder="e.g., Cute Baby Forest Animals for ages 5-7"
                value={formData.theme}
                onChange={(e) => setFormData({ ...formData, theme: e.target.value })}
                className="min-h-[80px]"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Age Range</Label>
                <Select
                  value={formData.ageRange}
                  onValueChange={(value: any) => setFormData({ ...formData, ageRange: value })}
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
                  value={formData.kdpSize}
                  onValueChange={(value) => setFormData({ ...formData, kdpSize: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="8.5x11">8.5×11 inches</SelectItem>
                    <SelectItem value="8x10">8×10 inches</SelectItem>
                    <SelectItem value="6x9">6×9 inches</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="pageCount">Page Count</Label>
                <Input
                  id="pageCount"
                  type="number"
                  min="24"
                  max="828"
                  step="2"
                  value={formData.pageCount}
                  onChange={(e) => setFormData({ ...formData, pageCount: Number.parseInt(e.target.value) || 30 })}
                />
                <p className="text-xs text-gray-500">Must be even (24-828)</p>
              </div>

              <div className="space-y-2">
                <Label>Paper Type</Label>
                <Select
                  value={formData.paper}
                  onValueChange={(value: any) => setFormData({ ...formData, paper: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="WHITE">White</SelectItem>
                    <SelectItem value="CREAM">Cream</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Book Mode</Label>
                <Select value={formData.mode} onValueChange={(value: any) => setFormData({ ...formData, mode: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="COLORING">Coloring Book</SelectItem>
                    <SelectItem value="ACTIVITY">Activity Book</SelectItem>
                    <SelectItem value="STORYBOOK">Story Book</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Language</Label>
                <Select
                  value={formData.language}
                  onValueChange={(value: any) => setFormData({ ...formData, language: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="EN">English</SelectItem>
                    <SelectItem value="FR">French</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="ipAgreement"
                checked={formData.ipAgreement}
                onCheckedChange={(checked) => setFormData({ ...formData, ipAgreement: !!checked })}
              />
              <Label htmlFor="ipAgreement" className="text-sm">
                I understand IP restrictions (no brand characters)
              </Label>
            </div>

            <Button
              onClick={handleGenerate}
              disabled={!formData.theme.trim() || !formData.ipAgreement || isGenerating}
              className="w-full"
              size="lg"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                "Generate KDP Book"
              )}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Generation Status</CardTitle>
            <CardDescription>Track your book generation progress and download files</CardDescription>
          </CardHeader>
          <CardContent>
            {!job ? (
              <div className="text-center py-8 text-gray-500">
                <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Configure your book and click Generate to start</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Status:</span>
                  <span
                    className={`px-2 py-1 rounded text-sm ${
                      job.status === "completed"
                        ? "bg-green-100 text-green-800"
                        : job.status === "failed"
                          ? "bg-red-100 text-red-800"
                          : "bg-blue-100 text-blue-800"
                    }`}
                  >
                    {job.status}
                  </span>
                </div>

                {job.status === "processing" && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span>{job.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${job.progress}%` }}
                      />
                    </div>
                  </div>
                )}

                {job.status === "completed" && job.files && (
                  <div className="space-y-3">
                    <h4 className="font-medium text-green-800">✅ Your KDP bundle is ready!</h4>
                    <div className="space-y-2">
                      <Button variant="outline" size="sm" className="w-full justify-start bg-transparent" asChild>
                        <a href={job.files.interior} download>
                          <FileText className="w-4 h-4 mr-2" />
                          Download Interior PDF
                        </a>
                      </Button>
                      <Button variant="outline" size="sm" className="w-full justify-start bg-transparent" asChild>
                        <a href={job.files.coverFront} download>
                          <ImageIcon className="w-4 h-4 mr-2" />
                          Download Cover Front PDF
                        </a>
                      </Button>
                      {job.files.coverWrap && (
                        <Button variant="outline" size="sm" className="w-full justify-start bg-transparent" asChild>
                          <a href={job.files.coverWrap} download>
                            <ImageIcon className="w-4 h-4 mr-2" />
                            Download Full Wrap PDF
                          </a>
                        </Button>
                      )}
                      <Button size="sm" className="w-full" asChild>
                        <a href={job.files.zip} download>
                          <Download className="w-4 h-4 mr-2" />
                          Download ZIP (All Files)
                        </a>
                      </Button>
                    </div>
                  </div>
                )}

                {job.status === "failed" && (
                  <div className="text-red-600 text-sm">Generation failed. Please try again or contact support.</div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
