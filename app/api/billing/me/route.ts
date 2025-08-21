import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { sql } from "@/lib/db"

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ credits: 0, plan: "guest" })

  const row = await sql`SELECT credits_cents FROM user_wallets WHERE user_id=${session.user.id}`
  const cents = Number(row[0]?.credits_cents ?? 0)

  return NextResponse.json({
    credits: cents, // available credits in cents
    plan: "user", // extend with plan name if you store it
  })
}
