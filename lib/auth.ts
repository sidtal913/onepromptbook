import type { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import { sql } from "./db"
import { getServerSession } from "next-auth"

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "dummy-client-id",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "dummy-client-secret",
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === "google") {
        try {
          console.log("[v0] NextAuth signIn callback started for:", user.email)

          const existingUser = await sql`
            SELECT * FROM users WHERE email = ${user.email}
          `.catch((error) => {
            console.error("[v0] Database error checking existing user:", error)
            return [] // Return empty array if query fails
          })

          console.log("[v0] Existing user check completed, found:", existingUser.length, "users")

          if (existingUser.length === 0) {
            const orgSlug = user.email?.split("@")[0] || "user"
            console.log("[v0] Creating new organization with slug:", orgSlug)

            try {
              const [org] = await sql`
                INSERT INTO organizations (name, slug, plan)
                VALUES (${user.name || "My Organization"}, ${orgSlug}, 'free')
                RETURNING *
              `
              console.log("[v0] Organization created with ID:", org.id)

              await sql`
                INSERT INTO users (email, name, avatar_url, organization_id, role)
                VALUES (${user.email}, ${user.name}, ${user.image}, ${org.id}, 'owner')
              `
              console.log("[v0] User created successfully")
            } catch (dbError) {
              console.error("[v0] Database error creating user/org:", dbError)
              // Continue with sign-in even if database operations fail
            }
          }

          return true
        } catch (error) {
          console.error("[v0] Error during sign in:", error)
          return true
        }
      }
      return true
    },
    async jwt({ token, user, account }) {
      if (user?.email) {
        try {
          console.log("[v0] JWT callback for user:", user.email)

          const dbUser = await sql`
            SELECT u.*, o.name as org_name, o.slug as org_slug, o.plan as org_plan
            FROM users u
            LEFT JOIN organizations o ON u.organization_id = o.id
            WHERE u.email = ${user.email}
          `
            .then((result) => result[0])
            .catch((error) => {
              console.error("[v0] Database error fetching user data:", error)
              return null // Return null if query fails
            })

          if (dbUser) {
            token.userId = dbUser.id
            token.role = dbUser.role
            token.organization = {
              id: dbUser.organization_id,
              name: dbUser.org_name,
              slug: dbUser.org_slug,
              plan: dbUser.org_plan,
            }
            console.log("[v0] JWT token populated with user data")
          } else {
            console.log("[v0] No database user found for:", user.email)
            token.userId = user.email
            token.role = "user"
            token.organization = {
              id: "fallback",
              name: "Default Organization",
              slug: "default",
              plan: "free",
            }
          }
        } catch (error) {
          console.error("[v0] Error fetching user data in JWT callback:", error)
          token.userId = user.email
          token.role = "user"
          token.organization = {
            id: "fallback",
            name: "Default Organization",
            slug: "default",
            plan: "free",
          }
        }
      }
      return token
    },
    async session({ session, token }) {
      console.log("[v0] Session callback for token:", !!token)

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
  debug: process.env.NODE_ENV === "development",
}

export const auth = () => getServerSession(authOptions)
