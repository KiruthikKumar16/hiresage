import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

// Database types based on our existing interfaces
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          name: string
          email: string
          company?: string
          role: 'admin' | 'user'
          created_at: string
          last_login?: string
        }
        Insert: {
          id?: string
          name: string
          email: string
          company?: string
          role?: 'admin' | 'user'
          created_at?: string
          last_login?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string
          company?: string
          role?: 'admin' | 'user'
          created_at?: string
          last_login?: string
        }
      }
      candidates: {
        Row: {
          id: string
          name: string
          email: string
          phone: string
          position: string
          status: 'new' | 'interviewed' | 'hired' | 'rejected'
          score?: number
          last_interview?: string
          experience: string
          skills: string[]
          resume?: string
          notes?: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          email: string
          phone: string
          position: string
          status?: 'new' | 'interviewed' | 'hired' | 'rejected'
          score?: number
          last_interview?: string
          experience: string
          skills: string[]
          resume?: string
          notes?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string
          phone?: string
          position?: string
          status?: 'new' | 'interviewed' | 'hired' | 'rejected'
          score?: number
          last_interview?: string
          experience?: string
          skills?: string[]
          resume?: string
          notes?: string
          created_at?: string
          updated_at?: string
        }
      }
      interviews: {
        Row: {
          id: string
          candidate_id: string
          candidate_name: string
          position: string
          status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled'
          score?: number
          duration?: number
          questions: any
          messages: any
          started_at?: string
          completed_at?: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          candidate_id: string
          candidate_name: string
          position: string
          status?: 'scheduled' | 'in-progress' | 'completed' | 'cancelled'
          score?: number
          duration?: number
          questions?: any
          messages?: any
          started_at?: string
          completed_at?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          candidate_id?: string
          candidate_name?: string
          position?: string
          status?: 'scheduled' | 'in-progress' | 'completed' | 'cancelled'
          score?: number
          duration?: number
          questions?: any
          messages?: any
          started_at?: string
          completed_at?: string
          created_at?: string
          updated_at?: string
        }
      }
      video_interviews: {
        Row: {
          id: string
          candidate_id: string
          candidate_name: string
          position: string
          status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled'
          score?: number
          duration?: number
          video_url?: string
          emotion_analysis: any
          cheating_detection: any
          real_time_analysis: any
          ai_response: any
          started_at?: string
          completed_at?: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          candidate_id: string
          candidate_name: string
          position: string
          status?: 'scheduled' | 'in-progress' | 'completed' | 'cancelled'
          score?: number
          duration?: number
          video_url?: string
          emotion_analysis?: any
          cheating_detection?: any
          real_time_analysis?: any
          ai_response?: any
          started_at?: string
          completed_at?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          candidate_id?: string
          candidate_name?: string
          position?: string
          status?: 'scheduled' | 'in-progress' | 'completed' | 'cancelled'
          score?: number
          duration?: number
          video_url?: string
          emotion_analysis?: any
          cheating_detection?: any
          real_time_analysis?: any
          ai_response?: any
          started_at?: string
          completed_at?: string
          created_at?: string
          updated_at?: string
        }
      }
      organizations: {
        Row: {
          id: string
          name: string
          email: string
          plan: 'basic' | 'premium' | 'enterprise'
          max_users: number
          current_users: number
          subscription_status: 'active' | 'expired' | 'cancelled'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          email: string
          plan?: 'basic' | 'premium' | 'enterprise'
          max_users?: number
          current_users?: number
          subscription_status?: 'active' | 'expired' | 'cancelled'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string
          plan?: 'basic' | 'premium' | 'enterprise'
          max_users?: number
          current_users?: number
          subscription_status?: 'active' | 'expired' | 'cancelled'
          created_at?: string
          updated_at?: string
        }
      }
      individual_users: {
        Row: {
          id: string
          name: string
          email: string
          plan: 'free' | 'basic' | 'premium'
          interviews_completed: number
          interviews_remaining: number
          subscription_status: 'active' | 'expired' | 'cancelled'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          email: string
          plan?: 'free' | 'basic' | 'premium'
          interviews_completed?: number
          interviews_remaining?: number
          subscription_status?: 'active' | 'expired' | 'cancelled'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string
          plan?: 'free' | 'basic' | 'premium'
          interviews_completed?: number
          interviews_remaining?: number
          subscription_status?: 'active' | 'expired' | 'cancelled'
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
} 