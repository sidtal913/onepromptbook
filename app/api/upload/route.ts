import { type NextRequest, NextResponse } from "next/server"
import { put } from "@vercel/blob"
import { auth } from "@/lib/auth"

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const contentType = req.headers.get("content-type") || ""
  if (!contentType.startsWith("multipart/form-data"))
    return NextResponse.json({ error: "Use multipart/form-data" }, { status: 400 })

  const form = await req.formData()
  const file = form.get("file") as File | null
  if (!file) return NextResponse.json({ error: "No file" }, { status: 400 })

  // guardrails: <= 6MB, images only
  if (!file.type.startsWith("image/")) return NextResponse.json({ error: "Invalid file type" }, { status: 400 })
  if (file.size > 6_000_000) return NextResponse.json({ error: "Max 6MB" }, { status: 400 })

  const blob = await put(`opb/${session.user.id}/${Date.now()}-${file.name}`, file, {
    access: "public",
  })

  return NextResponse.json({ url: blob.url })
}
