-- Add missing columns to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar TEXT DEFAULT '';
ALTER TABLE users ADD COLUMN IF NOT EXISTS provider TEXT DEFAULT '';

-- Update existing users to have default values
UPDATE users SET avatar = '' WHERE avatar IS NULL;
UPDATE users SET provider = 'email' WHERE provider IS NULL;

-- Verify the changes
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'users' 
ORDER BY ordinal_position; 