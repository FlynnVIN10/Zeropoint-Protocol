-- Monitoring and Performance Schema
CREATE TABLE IF NOT EXISTS performance_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  operation VARCHAR(255) NOT NULL,
  duration_ms INTEGER NOT NULL,
  context VARCHAR(100) NOT NULL,
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS error_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  error_message TEXT NOT NULL,
  error_stack TEXT,
  context VARCHAR(100) NOT NULL,
  request_id VARCHAR(255),
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS request_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  method VARCHAR(10) NOT NULL,
  path VARCHAR(500) NOT NULL,
  status_code INTEGER NOT NULL,
  duration_ms INTEGER NOT NULL,
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS system_health (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  status VARCHAR(20) NOT NULL,
  details JSONB,
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_performance_operation ON performance_metrics(operation);
CREATE INDEX IF NOT EXISTS idx_performance_recorded_at ON performance_metrics(recorded_at);
CREATE INDEX IF NOT EXISTS idx_error_logs_context ON error_logs(context);
CREATE INDEX IF NOT EXISTS idx_error_logs_recorded_at ON error_logs(recorded_at);
CREATE INDEX IF NOT EXISTS idx_request_logs_path ON request_logs(path);
CREATE INDEX IF NOT EXISTS idx_request_logs_recorded_at ON request_logs(recorded_at);
