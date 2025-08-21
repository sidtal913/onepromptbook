declare module "next-auth" {
  interface Session {
    user: {
      id: string
      email: string
      name?: string
      image?: string
      role: "owner" | "admin" | "member"
      organization: {
        id: string
        name: string
        slug: string
        plan: "free" | "pro" | "team"
      }
    }
  }
}
