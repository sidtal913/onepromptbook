import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.SUPABASE_SUPABASE_URL!, process.env.SUPABASE_SUPABASE_SERVICE_ROLE_KEY!)

export async function uploadToSupabase(buffer: Buffer, filename: string, contentType = "image/png"): Promise<string> {
  try {
    const { data, error } = await supabase.storage.from("covers").upload(filename, buffer, {
      contentType,
      upsert: true,
    })

    if (error) {
      throw new Error(`Supabase upload error: ${error.message}`)
    }

    const { data: urlData } = supabase.storage.from("covers").getPublicUrl(filename)

    return urlData.publicUrl
  } catch (error) {
    console.error("Error uploading to Supabase:", error)
    throw new Error("Failed to upload image to storage")
  }
}

export async function uploadImageBuffer(buffer: Buffer, type: "cover" | "page" = "page"): Promise<string> {
  const filename = `${type}-${Date.now()}-${Math.random().toString(36).substring(7)}.png`
  return uploadToSupabase(buffer, filename, "image/png")
}
