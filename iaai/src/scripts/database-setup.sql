-- Database setup script for Zeropoint Protocol IAAI
-- This script initializes the database schema and tables

-- Create database if it doesn't exist
CREATE DATABASE IF NOT EXISTS zeropoint_iaai;

-- Use the database
\c zeropoint_iaai;

-- Create tables for IAAI (Intelligence Augmentation and AI) system

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Sessions table
CREATE TABLE IF NOT EXISTS sessions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    session_token VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL
);

-- AI models table
CREATE TABLE IF NOT EXISTS ai_models (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    version VARCHAR(50) NOT NULL,
    model_type VARCHAR(100) NOT NULL,
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Training jobs table
CREATE TABLE IF NOT EXISTS training_jobs (
    id SERIAL PRIMARY KEY,
    model_id INTEGER REFERENCES ai_models(id),
    status VARCHAR(50) DEFAULT 'queued',
    config JSONB,
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default AI models
INSERT INTO ai_models (name, version, model_type, status) VALUES
    ('tinygrad', '1.0.0', 'training', 'active'),
    ('petals', '1.0.0', 'proposal', 'active'),
    ('wondercraft', '1.0.0', 'asset', 'active')
ON CONFLICT DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_training_jobs_model_id ON training_jobs(model_id);
CREATE INDEX IF NOT EXISTS idx_training_jobs_status ON training_jobs(status);

-- Grant permissions (adjust as needed for your setup)
-- GRANT ALL PRIVILEGES ON DATABASE zeropoint_iaai TO zeropoint_user;
-- GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO zeropoint_user;
-- GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO zeropoint_user;
