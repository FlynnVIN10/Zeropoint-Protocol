-- ML Pipeline Schema
CREATE TABLE IF NOT EXISTS ml_pipelines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pipeline_id VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  configuration JSONB NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'inactive',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_run TIMESTAMP WITH TIME ZONE,
  next_run TIMESTAMP WITH TIME ZONE
);

CREATE TABLE IF NOT EXISTS ml_pipeline_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pipeline_id VARCHAR(255) NOT NULL REFERENCES ml_pipelines(pipeline_id),
  run_id VARCHAR(255) UNIQUE NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'running',
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  results JSONB,
  error_message TEXT,
  metrics JSONB
);

CREATE INDEX IF NOT EXISTS idx_pipelines_status ON ml_pipelines(status);
CREATE INDEX IF NOT EXISTS idx_runs_pipeline_id ON ml_pipeline_runs(pipeline_id);
