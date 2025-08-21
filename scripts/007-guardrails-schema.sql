-- Adding guardrails database schema for credits, usage tracking, and billing
CREATE TABLE IF NOT EXISTS user_wallets (
  user_id uuid PRIMARY KEY REFERENCES users(id),
  credits_cents integer NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS usage_ledger (
  id bigserial PRIMARY KEY,
  user_id uuid NOT NULL,
  project_id bigint,
  kind text NOT NULL,
  input_tokens int DEFAULT 0,
  output_tokens int DEFAULT 0,
  images int DEFAULT 0,
  est_cost_cents int NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Grant trial credits to existing users
INSERT INTO user_wallets (user_id, credits_cents)
SELECT id, 100 FROM users
ON CONFLICT (user_id) DO NOTHING;
