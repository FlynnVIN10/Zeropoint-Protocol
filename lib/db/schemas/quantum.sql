-- Quantum Compute Schema
CREATE TABLE IF NOT EXISTS quantum_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id VARCHAR(255) UNIQUE NOT NULL,
  circuit_definition JSONB NOT NULL,
  parameters JSONB,
  status VARCHAR(50) NOT NULL DEFAULT 'queued',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  results JSONB,
  error_message TEXT,
  qubits_used INTEGER,
  depth INTEGER
);

CREATE TABLE IF NOT EXISTS quantum_circuits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  circuit_id VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  definition JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_quantum_jobs_status ON quantum_jobs(status);
CREATE INDEX IF NOT EXISTS idx_quantum_circuits_name ON quantum_circuits(name);
