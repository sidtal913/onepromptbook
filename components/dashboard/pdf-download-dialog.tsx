"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Download, Loader2 } from "lucide-react"

interface PDFDownloadDialogProps {
  projectId: string
  projectTitle: string
  children?: React.ReactNode
}

export function PDFDownloadDialog({ projectId, projectTitle, children }: PDFDownloadDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [options, setOptions] = useState({
    size: "6x9" as const,
    author: "",
    includeBleed: false,
  })

  const handleDownload = async () => {
    setIsGenerating(true)
    try {
      const response = await fetch(`/api/projects/${projectId}/pdf`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(options),
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `${projectTitle.replace(/[^a-zA-Z0-9]/g, "_")}.pdf`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
        setIsOpen(false)
      } else {
        console.error("Failed to generate PDF")
      }
    } catch (error) {
      console.error("Download error:", error)
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button size="sm">
            <Download className="w-4 h-4 mr-2" />
            Download PDF
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Download PDF</DialogTitle>
          <DialogDescription>
            Configure your PDF settings for print-ready output compatible with Amazon KDP.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="size">Book Size</Label>
            <Select
              value={options.size}
              onValueChange={(value) => setOptions((prev) => ({ ...prev, size: value as any }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="6x9">6" × 9" (Most Popular)</SelectItem>
                <SelectItem value="7x10">7" × 10"</SelectItem>
                <SelectItem value="8x10">8" × 10"</SelectItem>
                <SelectItem value="8.5x8.5">8.5" × 8.5" (Square)</SelectItem>
                <SelectItem value="8.5x11">8.5" × 11" (Letter)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="author">Author Name (Optional)</Label>
            <Input
              id="author"
              placeholder="Enter author name"
              value={options.author}
              onChange={(e) => setOptions((prev) => ({ ...prev, author: e.target.value }))}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="bleed"
              checked={options.includeBleed}
              onCheckedChange={(checked) => setOptions((prev) => ({ ...prev, includeBleed: !!checked }))}
            />
            <Label htmlFor="bleed" className="text-sm">
              Include bleed area (for professional printing)
            </Label>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)} disabled={isGenerating}>
            Cancel
          </Button>
          <Button onClick={handleDownload} disabled={isGenerating}>
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Download className="w-4 h-4 mr-2" />
                Download PDF
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
