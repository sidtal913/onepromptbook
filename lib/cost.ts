import { PRICES, LIMITS } from "./billing-config"

export function estimateRequestCostCents(args: {
  pages: number
  images: number
  inputTokens: number
  outputTokens: number
}) {
  const inCost = (args.inputTokens / 1000) * PRICES.INPUT_PER_1K
  const outCost = (args.outputTokens / 1000) * PRICES.OUTPUT_PER_1K
  const imgCost = args.images * PRICES.IMAGE_PER_GEN
  return Math.ceil((inCost + outCost + imgCost) * 100)
}

export function clampRequest(pages: number, inTok: number, outTok: number) {
  return {
    pages: Math.min(Math.max(1, pages), LIMITS.MAX_PAGES_PER_REQ),
    inTok: Math.min(inTok, LIMITS.MAX_TOKENS_IN),
    outTok: Math.min(outTok, LIMITS.MAX_TOKENS_OUT),
  }
}
