"use client"

import { signIn, getSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Sparkles, BookOpen, ArrowLeft, CheckCircle } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export default function SignInPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    getSession().then((session) => {
      if (session) {
        router.push("/dashboard")
      }
    })
  }, [router])

  const handleSignIn = async () => {
    setIsLoading(true)
    try {
      await signIn("google", { callbackUrl: "/dashboard" })
    } catch (error) {
      console.error("Sign in error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-20 h-20 bg-pink-500/20 rounded-full blur-xl animate-pulse" />
        <div className="absolute top-40 right-20 w-32 h-32 bg-purple-500/20 rounded-full blur-xl animate-pulse delay-1000" />
        <div className="absolute bottom-20 left-20 w-24 h-24 bg-blue-500/20 rounded-full blur-xl animate-pulse delay-2000" />
        <Sparkles className="absolute top-32 right-32 h-6 w-6 text-pink-400/60 animate-pulse" />
        <Sparkles className="absolute bottom-32 left-32 h-4 w-4 text-purple-400/60 animate-pulse delay-1000" />
        <Sparkles className="absolute top-1/2 left-10 h-5 w-5 text-blue-400/60 animate-pulse delay-2000" />
      </div>

      {/* Header */}
      <div className="relative z-10 border-b border-white/10 bg-slate-900/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/">
              <Button variant="ghost" size="sm" className="text-gray-100 hover:text-white">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-full bg-gradient-to-r from-pink-500 to-purple-600">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">OnePromptBook</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex items-center justify-center min-h-[calc(100vh-80px)] p-4">
        <div className="grid lg:grid-cols-2 gap-12 max-w-6xl w-full items-center">
          {/* Left Side - Benefits */}
          <div className="text-center lg:text-left space-y-8">
            <div>
              <Badge variant="secondary" className="mb-4 bg-pink-500/20 text-pink-300 border-pink-500/30">
                <Sparkles className="h-3 w-3 mr-1" />
                Join 25,000+ Authors
              </Badge>
              <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4">
                Create{" "}
                <span className="bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
                  Magical
                </span>{" "}
                Children's Books
              </h1>
              <p className="text-gray-300 text-lg mb-8">
                One prompt creates your complete, print-ready children's book—cover, pages, and KDP export—all in
                minutes, not hours.
              </p>
            </div>

            {/* Features */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0" />
                <span className="text-gray-300">Generate complete books from simple prompts</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0" />
                <span className="text-gray-300">Professional illustrations and layouts</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0" />
                <span className="text-gray-300">Amazon KDP ready PDFs</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0" />
                <span className="text-gray-300">Start free, upgrade when ready</span>
              </div>
            </div>

            {/* Sample Preview */}
            <div className="hidden lg:block">
              <div className="relative">
                <Image
                  src="/playground-dino-coloring.png"
                  alt="Sample children's book"
                  width={300}
                  height={200}
                  className="rounded-lg shadow-2xl"
                />
                <div className="absolute -top-2 -right-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                  AI Generated
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Sign In Form */}
          <div className="flex justify-center lg:justify-end">
            <Card className="w-full max-w-md bg-white/10 backdrop-blur-sm border-white/20">
              <CardHeader className="text-center space-y-4">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <div className="p-3 rounded-full bg-gradient-to-r from-pink-500 to-purple-600">
                    <BookOpen className="h-6 w-6 text-white" />
                  </div>
                </div>
                <CardTitle className="text-2xl text-white">Get Started Free</CardTitle>
                <CardDescription className="text-gray-300">
                  Sign in with Google to start creating amazing children's books
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <Button
                  onClick={handleSignIn}
                  disabled={isLoading}
                  className="w-full bg-white hover:bg-gray-100 text-gray-900 font-semibold transition-all duration-200 disabled:opacity-50"
                  size="lg"
                >
                  <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  {isLoading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900 mr-2"></div>
                      Signing in...
                    </div>
                  ) : (
                    "Continue with Google"
                  )}
                </Button>

                <div className="text-center space-y-4">
                  <div className="text-sm text-gray-400">
                    <span className="bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent font-semibold">
                      Free Forever Plan:
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs text-gray-300">
                    <div className="flex items-center gap-1">
                      <CheckCircle className="h-3 w-3 text-green-400" />
                      <span>5 books/month</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <CheckCircle className="h-3 w-3 text-green-400" />
                      <span>PDF downloads</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <CheckCircle className="h-3 w-3 text-green-400" />
                      <span>All templates</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <CheckCircle className="h-3 w-3 text-green-400" />
                      <span>KDP ready</span>
                    </div>
                  </div>
                </div>

                <div className="text-center text-xs text-gray-400 leading-relaxed">
                  By signing in, you agree to our{" "}
                  <Link href="/terms" className="text-pink-400 hover:text-pink-300 underline">
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link href="/privacy" className="text-pink-400 hover:text-pink-300 underline">
                    Privacy Policy
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
