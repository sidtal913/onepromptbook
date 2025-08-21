-- Add PDF-related fields to projects table
ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS download_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS pdf_settings JSONB DEFAULT '{}';

-- Add index for download tracking
CREATE INDEX IF NOT EXISTS idx_projects_download_count ON projects(download_count);

-- Update existing projects to have default PDF settings
UPDATE projects 
SET pdf_settings = '{"size": "6x9", "includeBleed": false}'
WHERE pdf_settings = '{}' OR pdf_settings IS NULL;
