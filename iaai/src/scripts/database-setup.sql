-- Zeropoint Protocol Database Setup Script
-- Phase 3: Persistent Storage & Authentication

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    is_verified BOOLEAN DEFAULT FALSE,
    last_login_at TIMESTAMP,
    email_verified_at TIMESTAMP,
    preferences JSONB,
    roles TEXT[] DEFAULT ARRAY['user'],
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for users table
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_is_active ON users(is_active);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);

-- Sessions table
CREATE TABLE IF NOT EXISTS sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    token VARCHAR(255) UNIQUE NOT NULL,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    ip_address INET,
    user_agent VARCHAR(500),
    is_active BOOLEAN DEFAULT TRUE,
    expires_at TIMESTAMP NOT NULL,
    last_used_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for sessions table
CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token);
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_sessions_is_active ON sessions(is_active);

-- Audit logs table
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    resource VARCHAR(100),
    resource_id UUID,
    ip_address INET,
    user_agent VARCHAR(500),
    details JSONB,
    level VARCHAR(20) DEFAULT 'info',
    status VARCHAR(50) DEFAULT 'success',
    error_message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for audit_logs table
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_audit_logs_ip_address ON audit_logs(ip_address);
CREATE INDEX IF NOT EXISTS idx_audit_logs_level ON audit_logs(level);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for users table
CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Insert default admin user (password: admin123)
INSERT INTO users (username, email, password, first_name, last_name, roles, is_verified)
VALUES (
    'admin',
    'admin@zeropoint.protocol',
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/HS.iK2O',
    'System',
    'Administrator',
    ARRAY['admin', 'user'],
    TRUE
) ON CONFLICT (username) DO NOTHING;

-- Create view for active sessions
CREATE OR REPLACE VIEW active_sessions AS
SELECT 
    s.id,
    s.user_id,
    u.username,
    s.ip_address,
    s.user_agent,
    s.expires_at,
    s.last_used_at,
    s.created_at
FROM sessions s
JOIN users u ON s.user_id = u.id
WHERE s.is_active = TRUE AND s.expires_at > CURRENT_TIMESTAMP;

-- Create view for user activity
CREATE OR REPLACE VIEW user_activity AS
SELECT 
    u.id,
    u.username,
    u.email,
    u.last_login_at,
    COUNT(s.id) as active_sessions,
    COUNT(al.id) as total_actions,
    MAX(al.created_at) as last_action
FROM users u
LEFT JOIN sessions s ON u.id = s.user_id AND s.is_active = TRUE AND s.expires_at > CURRENT_TIMESTAMP
LEFT JOIN audit_logs al ON u.id = al.user_id
GROUP BY u.id, u.username, u.email, u.last_login_at;

-- Grant permissions (adjust as needed for your setup)
-- GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO zeropoint;
-- GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO zeropoint;

-- Insert initial audit log entry
INSERT INTO audit_logs (action, resource, details, level)
VALUES (
    'database_setup',
    'system',
    '{"version": "1.0.0", "phase": "3", "tables_created": ["users", "sessions", "audit_logs"]}',
    'info'
); 