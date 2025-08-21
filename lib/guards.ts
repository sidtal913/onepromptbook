import { sql } from "@/lib/db"
import { LIMITS, FLAGS } from "./billing-config"

export async function assertUserCanGenerate(userId: string, estCostCents: number) {
  if (FLAGS.DISABLE_GENERATION) {
    throw new Error("Generation temporarily disabled.")
  }

  try {
    // Per-user daily cap
    const daily = await sql`
      SELECT coalesce(sum(est_cost_cents),0) AS cents
      FROM usage_ledger
      WHERE user_id=${userId} AND created_at >= now() - interval '1 day'
    `
    if (Number(daily[0].cents) + estCostCents > LIMITS.PER_USER_DAILY_COST * 100) {
      throw new Error("Daily limit reached. Try again tomorrow or upgrade.")
    }

    // Global daily cap
    const global = await sql`
      SELECT coalesce(sum(est_cost_cents),0) AS cents
      FROM usage_ledger
      WHERE created_at >= now() - interval '1 day'
    `
    if (Number(global[0].cents) + estCostCents > LIMITS.GLOBAL_DAILY_COST * 100) {
      throw new Error("System at daily capacity. Please try later.")
    }

    // Wallet (prepaid credits) - with graceful fallback
    try {
      const wallet = await sql`SELECT credits_cents FROM user_wallets WHERE user_id=${userId}`
      const balance = Number(wallet[0]?.credits_cents ?? 0)
      if (balance < estCostCents) {
        throw new Error("Not enough credits. Buy a pack or subscribe.")
      }

      // Reserve (optimistic)
      await sql`
        UPDATE user_wallets SET credits_cents = credits_cents - ${estCostCents}
        WHERE user_id=${userId}
      `
    } catch (walletError: any) {
      // If user_wallets table doesn't exist, allow generation for now
      console.warn("[SERVER] [guards] Wallet check failed, allowing generation:", walletError.message)
      if (walletError.message.includes('relation "user_wallets" does not exist')) {
        console.log("[SERVER] [guards] user_wallets table missing - run database migrations")
        return // Allow generation without wallet check
      }
      throw walletError
    }
  } catch (ledgerError: any) {
    // If usage_ledger table doesn't exist, allow generation for now
    console.warn("[SERVER] [guards] Usage ledger check failed, allowing generation:", ledgerError.message)
    if (ledgerError.message.includes('relation "usage_ledger" does not exist')) {
      console.log("[SERVER] [guards] usage_ledger table missing - run database migrations")
      return // Allow generation without usage tracking
    }
    throw ledgerError
  }
}
