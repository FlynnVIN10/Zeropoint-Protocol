-- Enhanced Tinygrad Training Jobs Schema
CREATE TABLE IF NOT EXISTS training_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id VARCHAR(255) UNIQUE NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  model_name VARCHAR(255) NOT NULL,
  dataset_path TEXT NOT NULL,
  hyperparameters JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  metrics JSONB,
  logs TEXT[],
  progress_percentage INTEGER DEFAULT 0,
  estimated_completion TIMESTAMP WITH TIME ZONE
);

CREATE TABLE IF NOT EXISTS training_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id VARCHAR(255) NOT NULL REFERENCES training_jobs(job_id),
  metric_name VARCHAR(255) NOT NULL,
  metric_value DECIMAL,
  metric_unit VARCHAR(50),
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_training_jobs_status ON training_jobs(status);
CREATE INDEX IF NOT EXISTS idx_training_jobs_created_at ON training_jobs(created_at);
CREATE INDEX IF NOT EXISTS idx_training_metrics_job_id ON training_metrics(job_id);
