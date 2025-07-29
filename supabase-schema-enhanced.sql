-- Enhanced Database Schema for JoCruit AI Platform

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (enhanced)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    avatar TEXT DEFAULT '',
    provider VARCHAR(50) DEFAULT 'email',
    role VARCHAR(50) DEFAULT 'candidate' CHECK (role IN ('system_admin', 'university_admin', 'enterprise_admin', 'candidate')),
    company VARCHAR(255),
    phone VARCHAR(50),
    website VARCHAR(255),
    organization_id UUID,
    batch_id UUID,
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Organizations table
CREATE TABLE IF NOT EXISTS organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('university', 'enterprise', 'startup')),
    domain VARCHAR(255),
    admin_id UUID REFERENCES users(id),
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Batches table (for university/enterprise candidate groups)
CREATE TABLE IF NOT EXISTS batches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    organization_id UUID REFERENCES organizations(id),
    admin_id UUID REFERENCES users(id),
    start_date DATE,
    end_date DATE,
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Subscriptions table (enhanced)
CREATE TABLE IF NOT EXISTS subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    plan_id VARCHAR(100) NOT NULL,
    plan_name VARCHAR(255) NOT NULL,
    interviews_remaining INTEGER DEFAULT 0,
    total_interviews INTEGER DEFAULT 0,
    used_slots INTEGER DEFAULT 0,
    price_per_interview DECIMAL(10,2) DEFAULT 0,
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'expired', 'cancelled')),
    payment_method VARCHAR(100),
    payment_status VARCHAR(50) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'failed')),
    trial_end_date TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Question sets table
CREATE TABLE IF NOT EXISTS question_sets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    difficulty VARCHAR(20) CHECK (difficulty IN ('easy', 'medium', 'hard')),
    organization_id UUID REFERENCES organizations(id),
    created_by UUID REFERENCES users(id),
    is_public BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Questions table
CREATE TABLE IF NOT EXISTS questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    question_set_id UUID REFERENCES question_sets(id) ON DELETE CASCADE,
    text TEXT NOT NULL,
    category VARCHAR(100),
    difficulty VARCHAR(20) CHECK (difficulty IN ('easy', 'medium', 'hard')),
    time_limit INTEGER DEFAULT 120, -- seconds
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Interviews table (enhanced)
CREATE TABLE IF NOT EXISTS interviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    candidate_id UUID REFERENCES users(id),
    batch_id UUID REFERENCES batches(id),
    question_set_id UUID REFERENCES question_sets(id),
    candidate_name VARCHAR(255),
    position VARCHAR(255),
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
    overall_score INTEGER,
    flagged_cheating BOOLEAN DEFAULT false,
    cheating_flags JSONB DEFAULT '[]',
    emotion_data JSONB DEFAULT '{}',
    report_url TEXT,
    video_url TEXT,
    audio_url TEXT,
    start_time TIMESTAMP WITH TIME ZONE,
    end_time TIMESTAMP WITH TIME ZONE,
    duration INTEGER, -- seconds
    transcript TEXT,
    ai_feedback TEXT,
    result_json JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Interview sessions table (for live interviews)
CREATE TABLE IF NOT EXISTS interview_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    interview_id UUID REFERENCES interviews(id) ON DELETE CASCADE,
    session_token VARCHAR(255) UNIQUE NOT NULL,
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed', 'cancelled')),
    current_question_index INTEGER DEFAULT 0,
    total_questions INTEGER DEFAULT 0,
    start_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    end_time TIMESTAMP WITH TIME ZONE,
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Messages table (enhanced for live interviews)
CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    interview_id UUID REFERENCES interviews(id) ON DELETE CASCADE,
    session_id UUID REFERENCES interview_sessions(id),
    role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
    content TEXT NOT NULL,
    audio_url TEXT,
    emotion_data JSONB DEFAULT '{}',
    confidence_score DECIMAL(3,2),
    cheating_flags JSONB DEFAULT '[]',
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI Analysis logs table
CREATE TABLE IF NOT EXISTS ai_analysis_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    interview_id UUID REFERENCES interviews(id) ON DELETE CASCADE,
    message_id UUID REFERENCES messages(id),
    analysis_type VARCHAR(50) NOT NULL CHECK (analysis_type IN ('emotion', 'cheating', 'confidence', 'content')),
    input_data JSONB,
    output_data JSONB,
    model_used VARCHAR(100),
    processing_time_ms INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Reports table
CREATE TABLE IF NOT EXISTS reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    interview_id UUID REFERENCES interviews(id) ON DELETE CASCADE,
    batch_id UUID REFERENCES batches(id),
    report_type VARCHAR(50) NOT NULL CHECK (report_type IN ('individual', 'batch', 'summary')),
    report_data JSONB NOT NULL,
    pdf_url TEXT,
    csv_url TEXT,
    email_sent BOOLEAN DEFAULT false,
    email_recipients TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Email logs table
CREATE TABLE IF NOT EXISTS email_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    report_id UUID REFERENCES reports(id),
    recipient_email VARCHAR(255) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed')),
    sent_at TIMESTAMP WITH TIME ZONE,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Usage analytics table
CREATE TABLE IF NOT EXISTS usage_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id),
    user_id UUID REFERENCES users(id),
    date DATE NOT NULL,
    interviews_conducted INTEGER DEFAULT 0,
    interviews_completed INTEGER DEFAULT 0,
    cheating_flags INTEGER DEFAULT 0,
    avg_score DECIMAL(5,2),
    total_duration INTEGER DEFAULT 0, -- seconds
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_organization_id ON users(organization_id);
CREATE INDEX IF NOT EXISTS idx_users_batch_id ON users(batch_id);

CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_expires_at ON subscriptions(expires_at);

CREATE INDEX IF NOT EXISTS idx_interviews_user_id ON interviews(user_id);
CREATE INDEX IF NOT EXISTS idx_interviews_candidate_id ON interviews(candidate_id);
CREATE INDEX IF NOT EXISTS idx_interviews_batch_id ON interviews(batch_id);
CREATE INDEX IF NOT EXISTS idx_interviews_status ON interviews(status);
CREATE INDEX IF NOT EXISTS idx_interviews_flagged_cheating ON interviews(flagged_cheating);
CREATE INDEX IF NOT EXISTS idx_interviews_created_at ON interviews(created_at);

CREATE INDEX IF NOT EXISTS idx_messages_interview_id ON messages(interview_id);
CREATE INDEX IF NOT EXISTS idx_messages_timestamp ON messages(timestamp);

CREATE INDEX IF NOT EXISTS idx_usage_analytics_date ON usage_analytics(date);
CREATE INDEX IF NOT EXISTS idx_usage_analytics_organization_id ON usage_analytics(organization_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers to all tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON organizations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_batches_updated_at BEFORE UPDATE ON batches FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON subscriptions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_question_sets_updated_at BEFORE UPDATE ON question_sets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_questions_updated_at BEFORE UPDATE ON questions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_interviews_updated_at BEFORE UPDATE ON interviews FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_interview_sessions_updated_at BEFORE UPDATE ON interview_sessions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_reports_updated_at BEFORE UPDATE ON reports FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) Policies

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE question_sets ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE interviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE interview_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_analysis_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_analytics ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view their own profile" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "System admins can view all users" ON users FOR SELECT USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'system_admin')
);
CREATE POLICY "University admins can view users in their organization" ON users FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM users u 
        WHERE u.id = auth.uid() 
        AND u.role = 'university_admin' 
        AND u.organization_id = users.organization_id
    )
);

-- Organizations policies
CREATE POLICY "Users can view their organization" ON organizations FOR SELECT USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND organization_id = organizations.id)
);
CREATE POLICY "System admins can manage all organizations" ON organizations FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'system_admin')
);

-- Interviews policies
CREATE POLICY "Users can view their own interviews" ON interviews FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own interviews" ON interviews FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "University admins can view interviews in their organization" ON interviews FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM users u 
        WHERE u.id = auth.uid() 
        AND u.role = 'university_admin' 
        AND u.organization_id = (
            SELECT organization_id FROM users WHERE id = interviews.candidate_id
        )
    )
);

-- Messages policies
CREATE POLICY "Users can view messages for their interviews" ON messages FOR SELECT USING (
    EXISTS (SELECT 1 FROM interviews WHERE id = messages.interview_id AND user_id = auth.uid())
);
CREATE POLICY "Users can create messages for their interviews" ON messages FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM interviews WHERE id = messages.interview_id AND user_id = auth.uid())
);

-- Reports policies
CREATE POLICY "Users can view their own reports" ON reports FOR SELECT USING (
    EXISTS (SELECT 1 FROM interviews WHERE id = reports.interview_id AND user_id = auth.uid())
);
CREATE POLICY "University admins can view reports in their organization" ON reports FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM users u 
        WHERE u.id = auth.uid() 
        AND u.role = 'university_admin' 
        AND u.organization_id = (
            SELECT organization_id FROM users WHERE id = (
                SELECT user_id FROM interviews WHERE id = reports.interview_id
            )
        )
    )
);

-- Usage analytics policies
CREATE POLICY "Users can view their own analytics" ON usage_analytics FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "University admins can view analytics in their organization" ON usage_analytics FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM users u 
        WHERE u.id = auth.uid() 
        AND u.role = 'university_admin' 
        AND u.organization_id = usage_analytics.organization_id
    )
);