-- Fix missing organization_id column
-- Run this in Supabase SQL Editor if you get the organization_id error

-- Add organization_id column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'organization_id') THEN
        ALTER TABLE users ADD COLUMN organization_id UUID;
        RAISE NOTICE 'Added organization_id column to users table';
    ELSE
        RAISE NOTICE 'organization_id column already exists';
    END IF;
END $$;

-- Create index for organization_id if it doesn't exist
CREATE INDEX IF NOT EXISTS idx_users_organization_id ON users(organization_id);

-- Drop and recreate policies to ensure they work with the new column
DROP POLICY IF EXISTS "Organization admins can view their organization users" ON users;

CREATE POLICY "Organization admins can view their organization users" ON users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND role IN ('university_admin', 'enterprise_admin')
      AND organization_id = users.organization_id
    )
  );

-- Verify the column exists
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'users' AND column_name = 'organization_id'; 