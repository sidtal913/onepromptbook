import NextAuth from "next-auth"
import { authOptions } from "@/lib/auth"

const handler = NextAuth(authOptions)

const wrappedHandler = async (req: Request) => {
  try {
    return await handler(req)
  } catch (error) {
    console.error("[v0] NextAuth handler error:", error)
    return new Response(JSON.stringify({ error: "Authentication error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}

export { wrappedHandler as GET, wrappedHandler as POST }
