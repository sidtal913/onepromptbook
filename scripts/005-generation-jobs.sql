-- Database schema for book generation jobs
CREATE TABLE IF NOT EXISTS generation_jobs (
  id VARCHAR(255) PRIMARY KEY,
  org_id VARCHAR(255) NOT NULL,
  spec JSONB NOT NULL,
  plan JSONB,
  status VARCHAR(50) DEFAULT 'PENDING',
  tokens_used INTEGER DEFAULT 0,
  images_used INTEGER DEFAULT 0,
  credits_used INTEGER DEFAULT 0,
  error_message TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP,
  INDEX idx_org_created (org_id, created_at),
  INDEX idx_status (status)
);

CREATE TABLE IF NOT EXISTS page_regenerations (
  id VARCHAR(255) PRIMARY KEY,
  job_id VARCHAR(255) REFERENCES generation_jobs(id),
  page_index INTEGER NOT NULL,
  original_content JSONB,
  new_content JSONB,
  cost_credits INTEGER DEFAULT 1,
  created_at TIMESTAMP DEFAULT NOW()
);
