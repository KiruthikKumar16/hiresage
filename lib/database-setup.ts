import { supabase } from './supabase-client'

export async function setupDatabase() {
  try {
    console.log('Setting up database schema...')
    
    // Read the schema file
    const schemaSQL = `
    -- Enable necessary extensions
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

    -- Users table
    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      email TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      avatar TEXT DEFAULT '',
      provider TEXT DEFAULT '',
      role TEXT NOT NULL DEFAULT 'candidate' CHECK (role IN ('candidate', 'enterprise_admin', 'system_admin')),
      organization_id UUID,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    -- Organizations table
    CREATE TABLE IF NOT EXISTS organizations (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      name TEXT NOT NULL,
      type TEXT NOT NULL CHECK (type IN ('university', 'company')),
      admin_id UUID REFERENCES users(id),
      subscription_status TEXT NOT NULL DEFAULT 'trial' CHECK (subscription_status IN ('trial', 'active', 'expired')),
      interview_limit INTEGER DEFAULT 10,
      interviews_used INTEGER DEFAULT 0,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    -- Add organization_id foreign key to users table
    ALTER TABLE users ADD CONSTRAINT IF NOT EXISTS fk_users_organization 
      FOREIGN KEY (organization_id) REFERENCES organizations(id);

    -- Subscriptions table
    CREATE TABLE IF NOT EXISTS subscriptions (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      user_id UUID REFERENCES users(id) ON DELETE CASCADE,
      organization_id UUID REFERENCES organizations(id),
      plan_type TEXT NOT NULL CHECK (plan_type IN ('trial', 'monthly', 'per_interview')),
      status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired', 'cancelled')),
      interview_limit INTEGER DEFAULT 10,
      interviews_used INTEGER DEFAULT 0,
      expires_at TIMESTAMP WITH TIME ZONE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    -- Interviews table
    CREATE TABLE IF NOT EXISTS interviews (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      user_id UUID REFERENCES users(id) ON DELETE CASCADE,
      organization_id UUID REFERENCES organizations(id),
      candidate_name TEXT NOT NULL,
      position TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
      duration INTEGER DEFAULT 0,
      transcript TEXT DEFAULT '',
      ai_feedback TEXT DEFAULT '',
      cheating_flags JSONB DEFAULT '[]',
      emotion_data JSONB DEFAULT '{}',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      completed_at TIMESTAMP WITH TIME ZONE
    );

    -- Interview sessions table
    CREATE TABLE IF NOT EXISTS interview_sessions (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      interview_id UUID REFERENCES interviews(id) ON DELETE CASCADE,
      session_token TEXT UNIQUE NOT NULL,
      settings JSONB DEFAULT '{}',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    -- Messages table
    CREATE TABLE IF NOT EXISTS messages (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      interview_id UUID REFERENCES interviews(id) ON DELETE CASCADE,
      session_id UUID REFERENCES interview_sessions(id) ON DELETE CASCADE,
      role TEXT NOT NULL CHECK (role IN ('ai', 'user')),
      content TEXT NOT NULL,
      timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    -- Audit logs table
    CREATE TABLE IF NOT EXISTS audit_logs (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      user_id UUID REFERENCES users(id) ON DELETE CASCADE,
      action TEXT NOT NULL,
      details JSONB DEFAULT '{}',
      ip_address TEXT,
      user_agent TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    -- Create indexes for better performance
    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    CREATE INDEX IF NOT EXISTS idx_users_organization_id ON users(organization_id);
    CREATE INDEX IF NOT EXISTS idx_interviews_user_id ON interviews(user_id);
    CREATE INDEX IF NOT EXISTS idx_interviews_organization_id ON interviews(organization_id);
    CREATE INDEX IF NOT EXISTS idx_interviews_status ON interviews(status);
    CREATE INDEX IF NOT EXISTS idx_messages_interview_id ON messages(interview_id);
    CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
    CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);

    -- Enable Row Level Security
    ALTER TABLE users ENABLE ROW LEVEL SECURITY;
    ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
    ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
    ALTER TABLE interviews ENABLE ROW LEVEL SECURITY;
    ALTER TABLE interview_sessions ENABLE ROW LEVEL SECURITY;
    ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
    ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

    -- Function to update updated_at timestamp
    CREATE OR REPLACE FUNCTION update_updated_at_column()
    RETURNS TRIGGER AS $$
    BEGIN
      NEW.updated_at = NOW();
      RETURN NEW;
    END;
    $$ language 'plpgsql';

    -- Create triggers for updated_at
    DROP TRIGGER IF EXISTS update_users_updated_at ON users;
    CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

    DROP TRIGGER IF EXISTS update_organizations_updated_at ON organizations;
    CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON organizations
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

    -- Function to log audit events
    CREATE OR REPLACE FUNCTION log_audit_event(
      p_user_id UUID,
      p_action TEXT,
      p_details JSONB DEFAULT '{}',
      p_ip_address TEXT DEFAULT NULL,
      p_user_agent TEXT DEFAULT NULL
    )
    RETURNS VOID AS $$
    BEGIN
      INSERT INTO audit_logs (user_id, action, details, ip_address, user_agent)
      VALUES (p_user_id, p_action, p_details, p_ip_address, p_user_agent);
    END;
    $$ LANGUAGE plpgsql;
    `

    // Execute the schema
    const { error } = await supabase.rpc('exec_sql', { sql: schemaSQL })
    
    if (error) {
      console.error('Database setup error:', error)
      return false
    }

    console.log('Database schema applied successfully!')
    return true
  } catch (error) {
    console.error('Failed to setup database:', error)
    return false
  }
} 