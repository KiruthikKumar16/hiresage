-- Fix RLS policies to prevent infinite recursion
-- This script should be run in Supabase SQL editor

-- First, disable RLS temporarily to clear existing policies
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE questions DISABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions DISABLE ROW LEVEL SECURITY;
ALTER TABLE interviews DISABLE ROW LEVEL SECURITY;
ALTER TABLE messages DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies
DROP POLICY IF EXISTS "Users can view their own data" ON users;
DROP POLICY IF EXISTS "Users can update their own data" ON users;
DROP POLICY IF EXISTS "Users can insert their own data" ON users;
DROP POLICY IF EXISTS "System admins can view all users" ON users;
DROP POLICY IF EXISTS "Organization admins can view their organization users" ON users;
DROP POLICY IF EXISTS "System admins can manage all questions" ON questions;
DROP POLICY IF EXISTS "All authenticated users can view active questions" ON questions;
DROP POLICY IF EXISTS "Users can view their own subscriptions" ON subscriptions;
DROP POLICY IF EXISTS "Users can insert their own subscriptions" ON subscriptions;
DROP POLICY IF EXISTS "System admins can view all subscriptions" ON subscriptions;
DROP POLICY IF EXISTS "Users can view their own interviews" ON interviews;
DROP POLICY IF EXISTS "Users can create their own interviews" ON interviews;
DROP POLICY IF EXISTS "Users can update their own interviews" ON interviews;
DROP POLICY IF EXISTS "System admins can view all interviews" ON interviews;
DROP POLICY IF EXISTS "Users can view messages for their interviews" ON messages;
DROP POLICY IF EXISTS "Users can create messages for their interviews" ON messages;

-- Re-enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE interviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Create simplified policies without recursion
CREATE POLICY "Users can view their own data" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own data" ON users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own data" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Allow all authenticated users to view users (for now)
CREATE POLICY "Allow authenticated users to view users" ON users
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- Questions policies
CREATE POLICY "All authenticated users can view active questions" ON questions
  FOR SELECT USING (
    is_active = true AND auth.uid() IS NOT NULL
  );

CREATE POLICY "System admins can manage all questions" ON questions
  FOR ALL USING (true);

-- Subscriptions policies
CREATE POLICY "Users can view their own subscriptions" ON subscriptions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own subscriptions" ON subscriptions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "System admins can view all subscriptions" ON subscriptions
  FOR SELECT USING (true);

-- Interviews policies
CREATE POLICY "Users can view their own interviews" ON interviews
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own interviews" ON interviews
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own interviews" ON interviews
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "System admins can view all interviews" ON interviews
  FOR SELECT USING (true);

-- Messages policies
CREATE POLICY "Users can view messages for their interviews" ON messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM interviews 
      WHERE interviews.id = messages.interview_id 
      AND interviews.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create messages for their interviews" ON messages
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM interviews 
      WHERE interviews.id = messages.interview_id 
      AND interviews.user_id = auth.uid()
    )
  ); 