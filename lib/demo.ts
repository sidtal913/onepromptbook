import { cacheGet } from "./cache"

export async function getGuestDemoIfAvailable(prompt: string, style: string) {
  const key = `demo:${style}:${prompt.trim().toLowerCase()}`
  return cacheGet<any>(key)
}
