-- Zeropoint Protocol Database Migration to PostgreSQL
-- Migration Date: 2025-01-01
-- Environment: STAGE
-- Version: 1.0

-- =====================================================
-- MIGRATION CHECKPOINT: START
-- =====================================================

BEGIN;

-- Create migration tracking table
CREATE TABLE IF NOT EXISTS migration_log (
    id SERIAL PRIMARY KEY,
    migration_name VARCHAR(255) NOT NULL,
    executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) NOT NULL,
    environment VARCHAR(50) NOT NULL,
    soulchain_hash VARCHAR(255),
    rollback_checkpoint VARCHAR(255)
);

-- Log migration start
INSERT INTO migration_log (migration_name, status, environment, rollback_checkpoint)
VALUES ('2025-postgres-migration', 'STARTED', 'STAGE', 'MIGRATION_START');

-- =====================================================
-- SCHEMA CREATION
-- =====================================================

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'user',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Sessions table
CREATE TABLE IF NOT EXISTS sessions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT true
);

-- Audit logs table
CREATE TABLE IF NOT EXISTS audit_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(255) NOT NULL,
    resource_type VARCHAR(100),
    resource_id VARCHAR(255),
    metadata JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Agent states table
CREATE TABLE IF NOT EXISTS agent_states (
    id SERIAL PRIMARY KEY,
    agent_id VARCHAR(255) UNIQUE NOT NULL,
    state_data JSONB NOT NULL,
    status VARCHAR(50) DEFAULT 'active',
    last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Soulchain entries table
CREATE TABLE IF NOT EXISTS soulchain_entries (
    id SERIAL PRIMARY KEY,
    hash_id VARCHAR(255) UNIQUE NOT NULL,
    action VARCHAR(255) NOT NULL,
    metadata JSONB,
    data TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    environment VARCHAR(50) NOT NULL,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL
);

-- Zeroth-gate validations table
CREATE TABLE IF NOT EXISTS zeroth_gate_validations (
    id SERIAL PRIMARY KEY,
    request_hash VARCHAR(255) UNIQUE NOT NULL,
    intent_type VARCHAR(100) NOT NULL,
    validation_result BOOLEAN NOT NULL,
    confidence_score DECIMAL(5,4),
    risk_factors JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Users indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Sessions indexes
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token);
CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions(expires_at);

-- Audit logs indexes
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_audit_logs_metadata ON audit_logs USING GIN(metadata);

-- Agent states indexes
CREATE INDEX IF NOT EXISTS idx_agent_states_agent_id ON agent_states(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_states_status ON agent_states(status);
CREATE INDEX IF NOT EXISTS idx_agent_states_last_activity ON agent_states(last_activity);

-- Soulchain entries indexes
CREATE INDEX IF NOT EXISTS idx_soulchain_entries_hash_id ON soulchain_entries(hash_id);
CREATE INDEX IF NOT EXISTS idx_soulchain_entries_action ON soulchain_entries(action);
CREATE INDEX IF NOT EXISTS idx_soulchain_entries_timestamp ON soulchain_entries(timestamp);
CREATE INDEX IF NOT EXISTS idx_soulchain_entries_environment ON soulchain_entries(environment);

-- Zeroth-gate validations indexes
CREATE INDEX IF NOT EXISTS idx_zeroth_gate_request_hash ON zeroth_gate_validations(request_hash);
CREATE INDEX IF NOT EXISTS idx_zeroth_gate_intent_type ON zeroth_gate_validations(intent_type);
CREATE INDEX IF NOT EXISTS idx_zeroth_gate_validation_result ON zeroth_gate_validations(validation_result);
CREATE INDEX IF NOT EXISTS idx_zeroth_gate_created_at ON zeroth_gate_validations(created_at);

-- =====================================================
-- DATA MIGRATION FROM SQLITE (IF EXISTS)
-- =====================================================

-- Note: This section would contain actual data migration logic
-- from SQLite to PostgreSQL. For now, we'll create sample data.

-- Insert sample admin user
INSERT INTO users (username, email, password_hash, role) VALUES 
('admin', 'admin@zeropointprotocol.ai', '$2b$10$sample.hash.for.admin.user', 'admin')
ON CONFLICT (username) DO NOTHING;

-- Insert sample soulchain entry for migration
INSERT INTO soulchain_entries (hash_id, action, metadata, data, environment) VALUES 
('migration-2025-01-01-001', 'DATABASE_MIGRATION', 
 '{"migration_name": "2025-postgres-migration", "environment": "STAGE", "version": "1.0"}',
 'Migration executed successfully on environment: STAGE', 'STAGE')
ON CONFLICT (hash_id) DO NOTHING;

-- =====================================================
-- ROLLBACK CHECKPOINT
-- =====================================================

-- Create rollback function
CREATE OR REPLACE FUNCTION rollback_migration()
RETURNS VOID AS $$
BEGIN
    -- Drop all tables in reverse order
    DROP TABLE IF EXISTS zeroth_gate_validations CASCADE;
    DROP TABLE IF EXISTS soulchain_entries CASCADE;
    DROP TABLE IF EXISTS agent_states CASCADE;
    DROP TABLE IF EXISTS audit_logs CASCADE;
    DROP TABLE IF EXISTS sessions CASCADE;
    DROP TABLE IF EXISTS users CASCADE;
    DROP TABLE IF EXISTS migration_log CASCADE;
    
    -- Log rollback
    RAISE NOTICE 'Migration rollback completed successfully';
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- MIGRATION COMPLETION
-- =====================================================

-- Update migration log with success
UPDATE migration_log 
SET status = 'COMPLETED', 
    soulchain_hash = 'migration-2025-01-01-001'
WHERE migration_name = '2025-postgres-migration';

-- Log completion to soulchain
INSERT INTO soulchain_entries (hash_id, action, metadata, data, environment) VALUES 
('migration-2025-01-01-002', 'MIGRATION_COMPLETE', 
 '{"migration_name": "2025-postgres-migration", "environment": "STAGE", "status": "SUCCESS"}',
 'Migration executed successfully on environment: STAGE || Soulchain hash: migration-2025-01-01-001', 'STAGE')
ON CONFLICT (hash_id) DO NOTHING;

COMMIT;

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Verify tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('users', 'sessions', 'audit_logs', 'agent_states', 'soulchain_entries', 'zeroth_gate_validations', 'migration_log');

-- Verify indexes exist
SELECT indexname FROM pg_indexes 
WHERE tablename IN ('users', 'sessions', 'audit_logs', 'agent_states', 'soulchain_entries', 'zeroth_gate_validations');

-- Verify migration log
SELECT * FROM migration_log WHERE migration_name = '2025-postgres-migration';

-- =====================================================
-- MIGRATION CHECKPOINT: END
-- =====================================================

-- Migration completed successfully
-- Rollback available via: SELECT rollback_migration();