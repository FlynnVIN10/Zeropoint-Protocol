-- Migration: Add user_role field to users table
-- Date: 2025-08-03
-- Description: Adds user_role enum field to support role-based dashboard views

-- Create enum type for user roles
CREATE TYPE user_role_enum AS ENUM ('human-consensus', 'sentient-consensus', 'agent-view');

-- Add user_role column to users table
ALTER TABLE users 
ADD COLUMN user_role user_role_enum NOT NULL DEFAULT 'human-consensus';

-- Add index for performance on role-based queries
CREATE INDEX idx_users_user_role ON users(user_role);

-- Add comment for documentation
COMMENT ON COLUMN users.user_role IS 'User role for role-based dashboard views: human-consensus, sentient-consensus, or agent-view';

-- Update existing users to have default role (optional - only if you want to set specific roles for existing users)
-- UPDATE users SET user_role = 'human-consensus' WHERE user_role IS NULL;

-- Verify the migration
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'users' AND column_name = 'user_role'; 