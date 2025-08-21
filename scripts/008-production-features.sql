-- Fixed foreign key type mismatch - projects.id is UUID, not bigint
-- Adding comprehensive production schema for characters, billing, and auth
-- Characters table for consistent character generation
CREATE TABLE IF NOT EXISTS characters (
  id            bigserial PRIMARY KEY,
  user_id       uuid NOT NULL REFERENCES users(id),
  name          text NOT NULL,
  age           text,
  description   text,
  appearance    jsonb,
  reference_url text,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS characters_user_id_idx ON characters(user_id);

-- Enhanced user fields for complete auth
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS email_verified boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS accepted_tos_at timestamptz,
  ADD COLUMN IF NOT EXISTS role text DEFAULT 'user',
  ADD COLUMN IF NOT EXISTS mfa_enabled boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS last_login_at timestamptz;

-- User wallets for credit system
CREATE TABLE IF NOT EXISTS user_wallets (
  id            bigserial PRIMARY KEY,
  user_id       uuid NOT NULL REFERENCES users(id) UNIQUE,
  credits_cents bigint NOT NULL DEFAULT 0,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

-- Billing transactions ledger
-- Changed project_id from bigint to uuid to match projects.id type
CREATE TABLE IF NOT EXISTS billing_transactions (
  id            bigserial PRIMARY KEY,
  user_id       uuid NOT NULL REFERENCES users(id),
  project_id    uuid REFERENCES projects(id),
  amount_cents  bigint NOT NULL,
  description   text NOT NULL,
  metadata      jsonb,
  created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS billing_transactions_user_id_idx ON billing_transactions(user_id);
CREATE INDEX IF NOT EXISTS billing_transactions_created_at_idx ON billing_transactions(created_at);

-- Usage ledger for tracking API consumption and costs
-- Changed project_id from bigint to uuid to match projects.id type
CREATE TABLE IF NOT EXISTS usage_ledger (
  id            bigserial PRIMARY KEY,
  user_id       uuid NOT NULL REFERENCES users(id),
  project_id    uuid REFERENCES projects(id),
  kind          text NOT NULL,
  input_tokens  bigint NOT NULL DEFAULT 0,
  output_tokens bigint NOT NULL DEFAULT 0,
  images        bigint NOT NULL DEFAULT 0,
  est_cost_cents bigint NOT NULL DEFAULT 0,
  created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS usage_ledger_user_id_idx ON usage_ledger(user_id);
CREATE INDEX IF NOT EXISTS usage_ledger_created_at_idx ON usage_ledger(created_at);

-- Ensure user_wallets has default records for existing users
INSERT INTO user_wallets (user_id, credits_cents)
SELECT id, 1000 FROM users 
WHERE id NOT IN (SELECT user_id FROM user_wallets)
ON CONFLICT (user_id) DO NOTHING;
