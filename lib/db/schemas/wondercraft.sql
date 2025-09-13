-- Wondercraft Contribution Schema
CREATE TABLE IF NOT EXISTS contributions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contribution_id VARCHAR(255) UNIQUE NOT NULL,
  title VARCHAR(500) NOT NULL,
  description TEXT NOT NULL,
  asset_type VARCHAR(100) NOT NULL,
  content TEXT NOT NULL,
  metadata JSONB,
  contributor VARCHAR(255) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  approved_at TIMESTAMP WITH TIME ZONE,
  reviewer VARCHAR(255),
  review_notes TEXT
);

CREATE TABLE IF NOT EXISTS contribution_diffs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contribution_id VARCHAR(255) NOT NULL REFERENCES contributions(contribution_id),
  asset_id VARCHAR(255) NOT NULL,
  diff_content TEXT NOT NULL,
  changes JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS contribution_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id VARCHAR(255) UNIQUE NOT NULL,
  asset_type VARCHAR(100) NOT NULL,
  content TEXT NOT NULL,
  version INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_contributions_status ON contributions(status);
CREATE INDEX IF NOT EXISTS idx_contributions_contributor ON contributions(contributor);
CREATE INDEX IF NOT EXISTS idx_diffs_contribution_id ON contribution_diffs(contribution_id);
