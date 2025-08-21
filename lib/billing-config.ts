export const PRICES = {
  INPUT_PER_1K: Number(process.env.OPB_PRICE_INPUT_PER_1K ?? 0.003),
  OUTPUT_PER_1K: Number(process.env.OPB_PRICE_OUTPUT_PER_1K ?? 0.006),
  IMAGE_PER_GEN: Number(process.env.OPB_PRICE_IMAGE_GEN ?? 0.04),
}

export const LIMITS = {
  MAX_PAGES_PER_REQ: Number(process.env.OPB_MAX_PAGES_PER_REQ ?? 20),
  MAX_TOKENS_IN: Number(process.env.OPB_MAX_TOKENS_IN ?? 4000),
  MAX_TOKENS_OUT: Number(process.env.OPB_MAX_TOKENS_OUT ?? 4000),
  PER_USER_DAILY_COST: Number(process.env.OPB_PER_USER_DAILY_COST ?? 2), // $
  GLOBAL_DAILY_COST: Number(process.env.OPB_GLOBAL_DAILY_COST ?? 40), // $
  REQUIRE_SUB_PAGES: Number(process.env.OPB_REQUIRE_SUB ?? 10),
}

export const FLAGS = {
  DISABLE_GENERATION: process.env.OPB_DISABLE_GENERATION === "1",
  ALLOW_GUEST_GENERATION: process.env.OPB_ALLOW_GUEST_GENERATION === "1",
  GUEST_PRESET_ONLY: process.env.OPB_GUEST_PRESET_ONLY !== "0",
}
