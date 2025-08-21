import { Ratelimit } from "@upstash/ratelimit"
import { Redis } from "@upstash/redis"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
})

const limiter = new Ratelimit({
  redis,
  limiter: Ratelimit.fixedWindow(10, "1 m"), // 10 requests/min/IP
  analytics: true,
})

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Enhanced rate limiting for money-spending APIs
  if (pathname.startsWith("/api/")) {
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? request.ip ?? "127.0.0.1"

    try {
      const { success } = await limiter.limit(ip)
      if (!success) {
        return new Response("Too many requests", { status: 429 })
      }
    } catch (error) {
      console.error("Rate limiting error:", error)
      // Continue on rate limit errors to avoid blocking legitimate requests
    }
  }

  // Allow access to public routes
  if (
    pathname.startsWith("/auth") ||
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname === "/" ||
    pathname === "/pricing" ||
    pathname === "/gallery" ||
    pathname === "/demo"
  ) {
    return NextResponse.next()
  }

  // For protected routes, we'll handle auth in the page components
  // since NextAuth v5 middleware requires more complex setup
  if (pathname.startsWith("/dashboard")) {
    return NextResponse.next()
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
}
