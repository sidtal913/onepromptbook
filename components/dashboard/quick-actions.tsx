import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen, Palette, Sparkles, Upload } from "lucide-react"

export function QuickActions() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card className="hover:shadow-md transition-shadow cursor-pointer">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            <CardTitle className="text-base">New eBook</CardTitle>
          </div>
          <CardDescription className="text-sm">Create a new children's story book</CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <Link href="/dashboard/projects/new?type=ebook">
            <Button size="sm" className="w-full">
              <Sparkles className="mr-2 h-4 w-4" />
              Start Creating
            </Button>
          </Link>
        </CardContent>
      </Card>

      <Card className="hover:shadow-md transition-shadow cursor-pointer">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Palette className="h-5 w-5 text-accent" />
            <CardTitle className="text-base">Coloring Book</CardTitle>
          </div>
          <CardDescription className="text-sm">Generate a fun coloring book</CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <Link href="/dashboard/projects/new?type=coloring_book">
            <Button size="sm" variant="outline" className="w-full bg-transparent">
              <Palette className="mr-2 h-4 w-4" />
              Create Book
            </Button>
          </Link>
        </CardContent>
      </Card>

      <Card className="hover:shadow-md transition-shadow cursor-pointer">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Upload className="h-5 w-5 text-muted-foreground" />
            <CardTitle className="text-base">Import Project</CardTitle>
          </div>
          <CardDescription className="text-sm">Upload existing content</CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <Button size="sm" variant="outline" className="w-full bg-transparent">
            <Upload className="mr-2 h-4 w-4" />
            Import
          </Button>
        </CardContent>
      </Card>

      <Card className="hover:shadow-md transition-shadow cursor-pointer">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <CardTitle className="text-base">Browse Templates</CardTitle>
          </div>
          <CardDescription className="text-sm">Start from a template</CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <Link href="/dashboard/templates">
            <Button size="sm" variant="outline" className="w-full bg-transparent">
              Browse
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}
