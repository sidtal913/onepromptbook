import type { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import { getServerSession } from "next-auth"

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      console.log("[v0] NextAuth signIn for:", user.email)
      return true
    },
    async jwt({ token, user, account }) {
      if (user?.email) {
        console.log("[v0] JWT callback for user:", user.email)
        token.userId = user.email
        token.role = "user"
        token.organization = {
          id: "default",
          name: "Default Organization",
          slug: "default",
          plan: "free",
        }
      }
      return token
    },
    async session({ session, token }) {
      console.log("[v0] Session callback")
      if (token) {
        session.user.id = token.userId as string
        session.user.role = token.role as string
        session.user.organization = token.organization as any
      }
      return session
    },
  },
  pages: {
    signIn: "/auth/signin",
  },
  debug: false, // Disable debug to reduce noise
}

export const auth = () => getServerSession(authOptions)
