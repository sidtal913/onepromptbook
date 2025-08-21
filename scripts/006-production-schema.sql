-- Production schema extensions for OnePromptBook

-- API Keys for user authentication
CREATE TABLE IF NOT EXISTS "ApiKey" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "orgId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "prefix" TEXT NOT NULL UNIQUE,
    "secretHash" TEXT NOT NULL,
    "name" TEXT,
    "scopes" JSONB DEFAULT '["generate"]',
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastUsedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3)
);

CREATE INDEX IF NOT EXISTS "ApiKey_orgId_idx" ON "ApiKey"("orgId");
CREATE INDEX IF NOT EXISTS "ApiKey_userId_idx" ON "ApiKey"("userId");

-- Enhanced Usage tracking
CREATE TABLE IF NOT EXISTS "Usage" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "orgId" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "pages" INTEGER NOT NULL DEFAULT 0,
    "images" INTEGER NOT NULL DEFAULT 0,
    "regens" INTEGER NOT NULL DEFAULT 0,
    "tokens" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Usage_orgId_period_key" UNIQUE("orgId", "period")
);

-- Credit ledger for purchased credits
CREATE TABLE IF NOT EXISTS "CreditLedger" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "orgId" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "deltaPages" INTEGER NOT NULL DEFAULT 0,
    "deltaImages" INTEGER NOT NULL DEFAULT 0,
    "deltaTokens" INTEGER NOT NULL DEFAULT 0,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Enhanced user profiles
CREATE TABLE IF NOT EXISTS "UserProfile" (
    "userId" TEXT NOT NULL PRIMARY KEY,
    "displayName" TEXT,
    "handle" TEXT UNIQUE,
    "bio" TEXT,
    "defaultPaymentMethodId" TEXT,
    "defaultCardBrand" TEXT,
    "defaultCardLast4" TEXT,
    "timezone" TEXT,
    "locale" TEXT,
    "lastSeen" TIMESTAMP(3)
);

-- Payment methods cache (optional)
CREATE TABLE IF NOT EXISTS "PaymentMethod" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "orgId" TEXT,
    "userId" TEXT,
    "stripePmId" TEXT NOT NULL UNIQUE,
    "brand" TEXT,
    "last4" TEXT,
    "expMonth" INTEGER,
    "expYear" INTEGER,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Job tracking for generation pipeline
CREATE TABLE IF NOT EXISTS "GenerationJob" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "jobId" TEXT NOT NULL UNIQUE,
    "orgId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'QUEUED',
    "spec" JSONB NOT NULL,
    "pages" JSONB NOT NULL DEFAULT '[]',
    "downloads" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "GenerationJob_orgId_idx" ON "GenerationJob"("orgId");
CREATE INDEX IF NOT EXISTS "GenerationJob_userId_idx" ON "GenerationJob"("userId");
CREATE INDEX IF NOT EXISTS "GenerationJob_status_idx" ON "GenerationJob"("status");

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS "Usage_orgId_idx" ON "Usage"("orgId");
CREATE INDEX IF NOT EXISTS "CreditLedger_orgId_idx" ON "CreditLedger"("orgId");
CREATE INDEX IF NOT EXISTS "PaymentMethod_orgId_idx" ON "PaymentMethod"("orgId");
CREATE INDEX IF NOT EXISTS "PaymentMethod_userId_idx" ON "PaymentMethod"("userId");
