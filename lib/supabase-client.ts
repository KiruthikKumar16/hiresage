import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export interface User {
  id: string
  email: string
  name: string
  avatar?: string
  provider?: string
  role: 'candidate' | 'enterprise_admin' | 'system_admin'
  organization_id?: string
  created_at: string
  updated_at: string
}

export interface Organization {
  id: string
  name: string
  type: 'university' | 'company'
  admin_id: string
  subscription_status: 'trial' | 'active' | 'expired'
  interview_limit: number
  interviews_used: number
  created_at: string
  updated_at: string
}

export interface Subscription {
  id: string
  user_id: string
  organization_id?: string
  plan_type: 'trial' | 'monthly' | 'per_interview'
  status: 'active' | 'expired' | 'cancelled'
  interview_limit: number
  interviews_used: number
  expires_at: string
  created_at: string
}

export interface Interview {
  id: string
  user_id: string
  organization_id?: string
  candidate_name: string
  position: string
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled'
  duration: number
  transcript: string
  ai_feedback: string
  cheating_flags: any[]
  emotion_data: any
  created_at: string
  completed_at?: string
}

export interface InterviewSession {
  id: string
  interview_id: string
  session_token: string
  settings: any
  created_at: string
}

export interface Message {
  id: string
  interview_id: string
  session_id: string
  role: 'ai' | 'user'
  content: string
  timestamp: string
}

export interface AuditLog {
  id: string
  user_id: string
  action: string
  details: any
  ip_address: string
  user_agent: string
  created_at: string
} 