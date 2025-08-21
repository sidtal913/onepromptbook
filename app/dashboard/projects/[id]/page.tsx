"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, BookOpen, Palette, Edit, Eye } from "lucide-react"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { PDFDownloadDialog } from "@/components/dashboard/pdf-download-dialog"

interface Project {
  id: string
  title: string
  type: "story" | "coloring-book"
  status: "generating" | "generated" | "failed"
  content?: any
  settings: any
  created_at: string
  updated_at: string
}

export default function ProjectPage() {
  const params = useParams()
  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const response = await fetch(`/api/projects/${params.id}`)
        const data = await response.json()
        if (data.project) {
          setProject(data.project)
        }
      } catch (error) {
        console.error("Failed to fetch project:", error)
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchProject()
    }
  }, [params.id])

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      </DashboardLayout>
    )
  }

  if (!project) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-foreground mb-2">Project not found</h2>
          <p className="text-muted-foreground">The project you're looking for doesn't exist.</p>
        </div>
      </DashboardLayout>
    )
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "generating":
        return (
          <Badge variant="secondary" className="animate-pulse">
            Generating
          </Badge>
        )
      case "generated":
        return <Badge variant="default">Ready</Badge>
      case "failed":
        return <Badge variant="destructive">Failed</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto p-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              {project.type === "story" ? (
                <BookOpen className="w-6 h-6 text-primary" />
              ) : (
                <Palette className="w-6 h-6 text-primary" />
              )}
              <h1 className="text-3xl font-bold text-foreground">{project.title}</h1>
              {getStatusBadge(project.status)}
            </div>
            <p className="text-muted-foreground">
              {project.type === "story" ? "Story Book" : "Coloring Book"} • Created{" "}
              {new Date(project.created_at).toLocaleDateString()}
            </p>
          </div>

          {project.status === "generated" && (
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Button>
              <Button variant="outline" size="sm">
                <Eye className="w-4 h-4 mr-2" />
                Preview
              </Button>
              <PDFDownloadDialog projectId={project.id} projectTitle={project.title} />
            </div>
          )}
        </div>

        {project.status === "generating" && (
          <Card>
            <CardContent className="flex items-center justify-center py-12">
              <div className="text-center">
                <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-primary" />
                <h3 className="text-lg font-semibold mb-2">
                  Generating your {project.type === "story" ? "story" : "coloring book"}...
                </h3>
                <p className="text-muted-foreground">This may take a few minutes. We'll notify you when it's ready!</p>
              </div>
            </CardContent>
          </Card>
        )}

        {project.status === "failed" && (
          <Card>
            <CardContent className="py-12">
              <div className="text-center">
                <h3 className="text-lg font-semibold mb-2 text-destructive">Generation Failed</h3>
                <p className="text-muted-foreground mb-4">
                  We encountered an error while generating your {project.type === "story" ? "story" : "coloring book"}.
                </p>
                <Button>Try Again</Button>
              </div>
            </CardContent>
          </Card>
        )}

        {project.status === "generated" && project.content && (
          <Tabs defaultValue="content" className="space-y-6">
            <TabsList>
              <TabsTrigger value="content">Content</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="content">
              <div className="grid gap-6">
                {project.content.pages?.map((page: any, index: number) => (
                  <Card key={index}>
                    <CardHeader>
                      <CardTitle className="text-lg">Page {page.pageNumber}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="font-medium mb-2">
                            {project.type === "story" ? "Story Text" : "Description"}
                          </h4>
                          <p className="text-sm text-muted-foreground leading-relaxed">
                            {project.type === "story" ? page.text : page.description}
                          </p>
                        </div>
                        <div>
                          <h4 className="font-medium mb-2">Image Prompt</h4>
                          <p className="text-sm text-muted-foreground leading-relaxed">{page.imagePrompt}</p>
                          <div className="mt-4 aspect-video bg-muted rounded-lg flex items-center justify-center">
                            <span className="text-muted-foreground text-sm">Image will be generated here</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="settings">
              <Card>
                <CardHeader>
                  <CardTitle>Project Settings</CardTitle>
                  <CardDescription>Configuration used for this project</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium">Original Prompt</Label>
                      <p className="text-sm text-muted-foreground mt-1">{project.settings.prompt}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Age Group</Label>
                      <p className="text-sm text-muted-foreground mt-1">{project.settings.ageGroup}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Page Count</Label>
                      <p className="text-sm text-muted-foreground mt-1">{project.settings.pageCount} pages</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Type</Label>
                      <p className="text-sm text-muted-foreground mt-1">
                        {project.type === "story" ? "Story Book" : "Coloring Book"}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </DashboardLayout>
  )
}

function Label({ children, className }: { children: React.ReactNode; className?: string }) {
  return <label className={className}>{children}</label>
}
