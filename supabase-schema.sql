-- Enable Row Level Security
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret';

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  company TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login TIMESTAMP WITH TIME ZONE
);

-- Create candidates table
CREATE TABLE IF NOT EXISTS candidates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  position TEXT NOT NULL,
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'interviewed', 'hired', 'rejected')),
  score INTEGER,
  last_interview TIMESTAMP WITH TIME ZONE,
  experience TEXT NOT NULL,
  skills TEXT[] NOT NULL,
  resume TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create interviews table
CREATE TABLE IF NOT EXISTS interviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  candidate_id UUID REFERENCES candidates(id) ON DELETE CASCADE,
  candidate_name TEXT NOT NULL,
  position TEXT NOT NULL,
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in-progress', 'completed', 'cancelled')),
  score INTEGER,
  duration INTEGER, -- in minutes
  questions JSONB DEFAULT '[]',
  messages JSONB DEFAULT '[]',
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create video_interviews table
CREATE TABLE IF NOT EXISTS video_interviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  candidate_id UUID REFERENCES candidates(id) ON DELETE CASCADE,
  candidate_name TEXT NOT NULL,
  position TEXT NOT NULL,
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in-progress', 'completed', 'cancelled')),
  score INTEGER,
  duration INTEGER, -- in minutes
  video_url TEXT,
  emotion_analysis JSONB DEFAULT '{}',
  cheating_detection JSONB DEFAULT '{}',
  real_time_analysis JSONB DEFAULT '[]',
  ai_response JSONB DEFAULT '{}',
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create organizations table
CREATE TABLE IF NOT EXISTS organizations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  plan TEXT DEFAULT 'basic' CHECK (plan IN ('basic', 'premium', 'enterprise')),
  max_users INTEGER DEFAULT 10,
  current_users INTEGER DEFAULT 0,
  subscription_status TEXT DEFAULT 'active' CHECK (subscription_status IN ('active', 'expired', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create individual_users table
CREATE TABLE IF NOT EXISTS individual_users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  plan TEXT DEFAULT 'free' CHECK (plan IN ('free', 'basic', 'premium')),
  interviews_completed INTEGER DEFAULT 0,
  interviews_remaining INTEGER DEFAULT 1,
  subscription_status TEXT DEFAULT 'active' CHECK (subscription_status IN ('active', 'expired', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_candidates_email ON candidates(email);
CREATE INDEX IF NOT EXISTS idx_candidates_status ON candidates(status);
CREATE INDEX IF NOT EXISTS idx_interviews_candidate_id ON interviews(candidate_id);
CREATE INDEX IF NOT EXISTS idx_interviews_status ON interviews(status);
CREATE INDEX IF NOT EXISTS idx_video_interviews_candidate_id ON video_interviews(candidate_id);
CREATE INDEX IF NOT EXISTS idx_video_interviews_status ON video_interviews(status);
CREATE INDEX IF NOT EXISTS idx_organizations_email ON organizations(email);
CREATE INDEX IF NOT EXISTS idx_individual_users_email ON individual_users(email);

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE interviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_interviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE individual_users ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Users can only see their own data
CREATE POLICY "Users can view own data" ON users
  FOR SELECT USING (auth.uid()::text = id::text);

CREATE POLICY "Users can insert own data" ON users
  FOR INSERT WITH CHECK (auth.uid()::text = id::text);

CREATE POLICY "Users can update own data" ON users
  FOR UPDATE USING (auth.uid()::text = id::text);

-- Candidates: Users can see candidates they created
CREATE POLICY "Users can view candidates" ON candidates
  FOR SELECT USING (true);

CREATE POLICY "Users can insert candidates" ON candidates
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update candidates" ON candidates
  FOR UPDATE USING (true);

-- Interviews: Users can see interviews they created
CREATE POLICY "Users can view interviews" ON interviews
  FOR SELECT USING (true);

CREATE POLICY "Users can insert interviews" ON interviews
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update interviews" ON interviews
  FOR UPDATE USING (true);

-- Video Interviews: Users can see video interviews they created
CREATE POLICY "Users can view video interviews" ON video_interviews
  FOR SELECT USING (true);

CREATE POLICY "Users can insert video interviews" ON video_interviews
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update video interviews" ON video_interviews
  FOR UPDATE USING (true);

-- Organizations: Users can see organizations they belong to
CREATE POLICY "Users can view organizations" ON organizations
  FOR SELECT USING (true);

CREATE POLICY "Users can insert organizations" ON organizations
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update organizations" ON organizations
  FOR UPDATE USING (true);

-- Individual Users: Users can see their own individual user data
CREATE POLICY "Users can view own individual data" ON individual_users
  FOR SELECT USING (auth.uid()::text = id::text);

CREATE POLICY "Users can insert own individual data" ON individual_users
  FOR INSERT WITH CHECK (auth.uid()::text = id::text);

CREATE POLICY "Users can update own individual data" ON individual_users
  FOR UPDATE USING (auth.uid()::text = id::text);

-- Create functions for automatic timestamp updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_candidates_updated_at BEFORE UPDATE ON candidates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_interviews_updated_at BEFORE UPDATE ON interviews
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_video_interviews_updated_at BEFORE UPDATE ON video_interviews
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON organizations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_individual_users_updated_at BEFORE UPDATE ON individual_users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column(); 