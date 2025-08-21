-- Temporarily disabled billing fields migration
-- This script is disabled while Stripe integration is turned off

/*
-- Add billing and subscription fields to organizations table
ALTER TABLE organizations 
ADD COLUMN IF NOT EXISTS plan VARCHAR(20) DEFAULT 'free',
ADD COLUMN IF NOT EXISTS subscription_status VARCHAR(20) DEFAULT 'free',
ADD COLUMN IF NOT EXISTS subscription_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS stripe_customer_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS current_period_end TIMESTAMP;

-- Add indexes for billing queries
CREATE INDEX IF NOT EXISTS idx_organizations_stripe_customer ON organizations(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_organizations_subscription ON organizations(subscription_id);
CREATE INDEX IF NOT EXISTS idx_organizations_plan ON organizations(plan);

-- Update existing organizations to have default billing settings
UPDATE organizations 
SET 
  plan = 'free',
  subscription_status = 'free',
  usage_limit = 3
WHERE plan IS NULL;
*/

-- Placeholder comment to keep file structure
SELECT 1;
