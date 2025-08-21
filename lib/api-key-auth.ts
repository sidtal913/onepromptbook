import type { NextRequest } from "next/server"
import { randomBytes, createHash, timingSafeEqual } from "crypto"
import { sql } from "./db"

function b64url(buf: Buffer) {
  return buf.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "")
}

export function createPlainKey() {
  const prefix = b64url(randomBytes(6)) // ~8 chars
  const secret = b64url(randomBytes(24)) // ~32 chars
  return `opb_live_${prefix}_${secret}`
}

export function hashSecret(secret: string) {
  return createHash("sha256").update(secret).digest("hex")
}

export async function issueKey({
  orgId,
  userId,
  name,
  scopes,
  expiresAt,
}: {
  orgId: string
  userId: string
  name?: string
  scopes?: string[]
  expiresAt?: Date
}) {
  const plain = createPlainKey()
  const [, , prefix, secret] = plain.split("_")
  const secretHash = hashSecret(secret)

  await sql`
    INSERT INTO "ApiKey" (id, "orgId", "userId", name, scopes, prefix, "secretHash", "expiresAt")
    VALUES (${crypto.randomUUID()}, ${orgId}, ${userId}, ${name || null}, ${JSON.stringify(scopes ?? ["generate"])}, ${prefix}, ${secretHash}, ${expiresAt?.toISOString() || null})
  `

  return { apiKey: plain }
}

export async function authenticateApiKey(req: NextRequest) {
  const key = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "")
  if (!key || !key.startsWith("opb_live_")) {
    throw new Error("unauthorized")
  }

  const parts = key.split("_")
  const prefix = parts[2]
  const secret = parts[3]
  if (!prefix || !secret) {
    throw new Error("unauthorized")
  }

  const result = await sql`
    SELECT * FROM "ApiKey" WHERE prefix = ${prefix} AND status = 'active'
  `

  const rec = result[0]
  if (!rec) {
    throw new Error("unauthorized")
  }

  const providedHash = hashSecret(secret)
  const stored = Buffer.from(rec.secretHash)
  const provided = Buffer.from(providedHash)

  if (stored.length !== provided.length || !timingSafeEqual(stored, provided)) {
    throw new Error("unauthorized")
  }

  if (rec.expiresAt && new Date(rec.expiresAt) < new Date()) {
    throw new Error("expired")
  }

  // Update last used timestamp
  await sql`
    UPDATE "ApiKey" 
    SET "lastUsedAt" = ${new Date().toISOString()}
    WHERE prefix = ${prefix}
  `

  return {
    orgId: rec.orgId,
    userId: rec.userId,
    scopes: typeof rec.scopes === "string" ? JSON.parse(rec.scopes) : rec.scopes,
  }
}
