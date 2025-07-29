import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseKey)

// Enhanced Database interfaces
export interface User {
  id: string
  email: string
  name: string
  avatar?: string
  provider?: string
  role: 'system_admin' | 'university_admin' | 'enterprise_admin' | 'candidate'
  company?: string
  phone?: string
  website?: string
  organization_id?: string
  batch_id?: string
  status: 'active' | 'inactive' | 'suspended'
  created_at: string
  updated_at: string
}

export interface Organization {
  id: string
  name: string
  type: 'university' | 'enterprise' | 'startup'
  domain?: string
  admin_id?: string
  settings: Record<string, any>
  created_at: string
  updated_at: string
}

export interface Batch {
  id: string
  name: string
  organization_id: string
  admin_id?: string
  start_date?: string
  end_date?: string
  status: 'active' | 'completed' | 'cancelled'
  settings: Record<string, any>
  created_at: string
  updated_at: string
}

export interface Subscription {
  id: string
  user_id: string
  plan_id: string
  plan_name: string
  interviews_remaining: number
  total_interviews: number
  used_slots: number
  price_per_interview: number
  status: 'active' | 'expired' | 'cancelled'
  payment_method?: string
  payment_status: 'pending' | 'completed' | 'failed'
  trial_end_date?: string
  expires_at?: string
  created_at: string
  updated_at: string
}

export interface QuestionSet {
  id: string
  name: string
  description?: string
  category?: string
  difficulty: 'easy' | 'medium' | 'hard'
  organization_id?: string
  created_by?: string
  is_public: boolean
  created_at: string
  updated_at: string
}

export interface Question {
  id: string
  question_set_id: string
  text: string
  category?: string
  difficulty: 'easy' | 'medium' | 'hard'
  time_limit: number
  order_index: number
  created_at: string
  updated_at: string
}

export interface Interview {
  id: string
  user_id: string
  candidate_id?: string
  batch_id?: string
  question_set_id?: string
  candidate_name?: string
  position?: string
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled'
  overall_score?: number
  flagged_cheating: boolean
  cheating_flags: any[]
  emotion_data: Record<string, any>
  report_url?: string
  video_url?: string
  audio_url?: string
  start_time?: string
  end_time?: string
  duration?: number
  transcript?: string
  ai_feedback?: string
  result_json: Record<string, any>
  created_at: string
  updated_at: string
}

export interface InterviewSession {
  id: string
  interview_id: string
  session_token: string
  status: 'active' | 'paused' | 'completed' | 'cancelled'
  current_question_index: number
  total_questions: number
  start_time: string
  end_time?: string
  settings: Record<string, any>
  created_at: string
  updated_at: string
}

export interface Message {
  id: string
  interview_id: string
  session_id?: string
  role: 'user' | 'assistant' | 'system'
  content: string
  audio_url?: string
  emotion_data: Record<string, any>
  confidence_score?: number
  cheating_flags: any[]
  timestamp: string
}

export interface AIAnalysisLog {
  id: string
  interview_id: string
  message_id?: string
  analysis_type: 'emotion' | 'cheating' | 'confidence' | 'content'
  input_data: Record<string, any>
  output_data: Record<string, any>
  model_used: string
  processing_time_ms: number
  created_at: string
}

export interface Report {
  id: string
  interview_id?: string
  batch_id?: string
  report_type: 'individual' | 'batch' | 'summary'
  report_data: Record<string, any>
  pdf_url?: string
  csv_url?: string
  email_sent: boolean
  email_recipients: string[]
  created_at: string
  updated_at: string
}

export interface UsageAnalytics {
  id: string
  organization_id?: string
  user_id?: string
  date: string
  interviews_conducted: number
  interviews_completed: number
  cheating_flags: number
  avg_score?: number
  total_duration: number
  created_at: string
}

// Enhanced User management functions
export const userService = {
  // Create a new user
  async createUser(userData: Omit<User, 'id' | 'created_at' | 'updated_at'>): Promise<User> {
    const { data, error } = await supabase
      .from('users')
      .insert([userData])
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Get user by email
  async getUserByEmail(email: string): Promise<User | null> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single()

    if (error && error.code !== 'PGRST116') throw error
    return data
  },

  // Get user by ID
  async getUserById(id: string): Promise<User | null> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single()

    if (error && error.code !== 'PGRST116') throw error
    return data
  },

  // Update user
  async updateUser(id: string, updates: Partial<User>): Promise<User> {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Get users by role
  async getUsersByRole(role: string): Promise<User[]> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('role', role)

    if (error) throw error
    return data || []
  },

  // Get users by organization
  async getUsersByOrganization(organizationId: string): Promise<User[]> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('organization_id', organizationId)

    if (error) throw error
    return data || []
  }
}

// Enhanced Subscription management functions
export const subscriptionService = {
  // Create a new subscription
  async createSubscription(subscriptionData: Omit<Subscription, 'id' | 'created_at' | 'updated_at'>): Promise<Subscription> {
    const { data, error } = await supabase
      .from('subscriptions')
      .insert([subscriptionData])
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Get active subscription for user
  async getActiveSubscription(userId: string): Promise<Subscription | null> {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')
      .single()

    if (error && error.code !== 'PGRST116') throw error
    return data
  },

  // Update subscription
  async updateSubscription(id: string, updates: Partial<Subscription>): Promise<Subscription> {
    const { data, error } = await supabase
      .from('subscriptions')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Decrement interviews remaining
  async useInterview(userId: string): Promise<boolean> {
    const subscription = await this.getActiveSubscription(userId)
    if (!subscription) return false

    if (subscription.interviews_remaining <= 0) return false

    await this.updateSubscription(subscription.id, {
      interviews_remaining: subscription.interviews_remaining - 1,
      used_slots: subscription.used_slots + 1
    })

    return true
  },

  // Get active subscriptions count
  async getActiveSubscriptionsCount(): Promise<number> {
    const { count, error } = await supabase
      .from('subscriptions')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active')
      .gt('expires_at', new Date().toISOString())

    if (error) throw error
    return count || 0
  }
}

// Enhanced Interview management functions
export const interviewService = {
  // Create a new interview
  async createInterview(interviewData: Omit<Interview, 'id' | 'created_at' | 'updated_at'>): Promise<Interview> {
    const { data, error } = await supabase
      .from('interviews')
      .insert([interviewData])
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Get interviews for user
  async getUserInterviews(userId: string): Promise<Interview[]> {
    const { data, error } = await supabase
      .from('interviews')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  },

  // Get interviews by batch
  async getInterviewsByBatch(batchId: string): Promise<Interview[]> {
    const { data, error } = await supabase
      .from('interviews')
      .select('*')
      .eq('batch_id', batchId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  },

  // Update interview
  async updateInterview(id: string, updates: Partial<Interview>): Promise<Interview> {
    const { data, error } = await supabase
      .from('interviews')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Get interview by ID
  async getInterviewById(id: string): Promise<Interview | null> {
    const { data, error } = await supabase
      .from('interviews')
      .select('*')
      .eq('id', id)
      .single()

    if (error && error.code !== 'PGRST116') throw error
    return data
  },

  // Get cheating flags count
  async getCheatingFlagsCount(): Promise<number> {
    const { count, error } = await supabase
      .from('interviews')
      .select('*', { count: 'exact', head: true })
      .eq('flagged_cheating', true)

    if (error) throw error
    return count || 0
  },

  // Get total interviews count
  async getTotalInterviewsCount(): Promise<number> {
    const { count, error } = await supabase
      .from('interviews')
      .select('*', { count: 'exact', head: true })

    if (error) throw error
    return count || 0
  }
}

// Enhanced Message management functions
export const messageService = {
  // Add message to interview
  async addMessage(messageData: Omit<Message, 'id' | 'timestamp'>): Promise<Message> {
    const { data, error } = await supabase
      .from('messages')
      .insert([{ ...messageData, timestamp: new Date().toISOString() }])
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Get messages for interview
  async getInterviewMessages(interviewId: string): Promise<Message[]> {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('interview_id', interviewId)
      .order('timestamp', { ascending: true })

    if (error) throw error
    return data || []
  },

  // Get messages by session
  async getSessionMessages(sessionId: string): Promise<Message[]> {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('session_id', sessionId)
      .order('timestamp', { ascending: true })

    if (error) throw error
    return data || []
  }
}

// Enhanced Session management functions
export const sessionService = {
  // Create interview session
  async createSession(sessionData: Omit<InterviewSession, 'id' | 'created_at' | 'updated_at'>): Promise<InterviewSession> {
    const { data, error } = await supabase
      .from('interview_sessions')
      .insert([sessionData])
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Get session by token
  async getSessionByToken(token: string): Promise<InterviewSession | null> {
    const { data, error } = await supabase
      .from('interview_sessions')
      .select('*')
      .eq('session_token', token)
      .single()

    if (error && error.code !== 'PGRST116') throw error
    return data
  },

  // Update session
  async updateSession(id: string, updates: Partial<InterviewSession>): Promise<InterviewSession> {
    const { data, error } = await supabase
      .from('interview_sessions')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  }
}

// Enhanced Report management functions
export const reportService = {
  // Create report
  async createReport(reportData: Omit<Report, 'id' | 'created_at' | 'updated_at'>): Promise<Report> {
    const { data, error } = await supabase
      .from('reports')
      .insert([reportData])
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Get report by ID
  async getReportById(id: string): Promise<Report | null> {
    const { data, error } = await supabase
      .from('reports')
      .select('*')
      .eq('id', id)
      .single()

    if (error && error.code !== 'PGRST116') throw error
    return data
  },

  // Get reports by interview
  async getReportsByInterview(interviewId: string): Promise<Report[]> {
    const { data, error } = await supabase
      .from('reports')
      .select('*')
      .eq('interview_id', interviewId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  },

  // Get reports by batch
  async getReportsByBatch(batchId: string): Promise<Report[]> {
    const { data, error } = await supabase
      .from('reports')
      .select('*')
      .eq('batch_id', batchId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  }
}

// Enhanced Analytics functions
export const analyticsService = {
  // Create usage analytics entry
  async createAnalytics(analyticsData: Omit<UsageAnalytics, 'id' | 'created_at'>): Promise<UsageAnalytics> {
    const { data, error } = await supabase
      .from('usage_analytics')
      .insert([analyticsData])
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Get analytics by organization
  async getAnalyticsByOrganization(organizationId: string, startDate?: string, endDate?: string): Promise<UsageAnalytics[]> {
    let query = supabase
      .from('usage_analytics')
      .select('*')
      .eq('organization_id', organizationId)

    if (startDate) {
      query = query.gte('date', startDate)
    }
    if (endDate) {
      query = query.lte('date', endDate)
    }

    const { data, error } = await query.order('date', { ascending: true })

    if (error) throw error
    return data || []
  },

  // Get analytics by user
  async getAnalyticsByUser(userId: string, startDate?: string, endDate?: string): Promise<UsageAnalytics[]> {
    let query = supabase
      .from('usage_analytics')
      .select('*')
      .eq('user_id', userId)

    if (startDate) {
      query = query.gte('date', startDate)
    }
    if (endDate) {
      query = query.lte('date', endDate)
    }

    const { data, error } = await query.order('date', { ascending: true })

    if (error) throw error
    return data || []
  }
}

// Enhanced AI Analysis functions
export const aiAnalysisService = {
  // Create AI analysis log
  async createAnalysisLog(logData: Omit<AIAnalysisLog, 'id' | 'created_at'>): Promise<AIAnalysisLog> {
    const { data, error } = await supabase
      .from('ai_analysis_logs')
      .insert([logData])
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Get analysis logs by interview
  async getAnalysisLogsByInterview(interviewId: string): Promise<AIAnalysisLog[]> {
    const { data, error } = await supabase
      .from('ai_analysis_logs')
      .select('*')
      .eq('interview_id', interviewId)
      .order('created_at', { ascending: true })

    if (error) throw error
    return data || []
  },

  // Get analysis logs by type
  async getAnalysisLogsByType(analysisType: string, interviewId?: string): Promise<AIAnalysisLog[]> {
    let query = supabase
      .from('ai_analysis_logs')
      .select('*')
      .eq('analysis_type', analysisType)

    if (interviewId) {
      query = query.eq('interview_id', interviewId)
    }

    const { data, error } = await query.order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  }
}

// Enhanced Authentication functions
export const authService = {
  // Authenticate user with email and password
  async authenticateUser(email: string, password: string): Promise<{ user: User; subscription: Subscription | null } | null> {
    // In a real app, you'd hash the password and verify it
    // For now, we'll just check if the user exists
    const user = await userService.getUserByEmail(email)
    if (!user) return null

    // Check if user has active subscription
    const subscription = await subscriptionService.getActiveSubscription(user.id)
    
    return { user, subscription }
  },

  // Get active subscription for user
  async getActiveSubscription(userId: string): Promise<Subscription | null> {
    return await subscriptionService.getActiveSubscription(userId)
  },

  // Create user account with subscription
  async createAccount(userData: {
    name: string
    email: string
    company?: string
    phone?: string
    website?: string
  }, planId: string): Promise<{ user: User; subscription: Subscription }> {
    // Create user
    const user = await userService.createUser({
      ...userData
    })

    // Define plan details
    const planDetails = {
      'free-trial': { name: 'Free Trial', interviews: 1, price: 0, trial: true },
      'starter': { name: 'Starter', interviews: 10, price: 1.80, trial: false },
      'growth': { name: 'Growth', interviews: 50, price: 1.50, trial: false },
      'pro': { name: 'Pro', interviews: 200, price: 1.20, trial: false },
      'enterprise': { name: 'Enterprise', interviews: 1000, price: 1.00, trial: false }
    }

    const plan = planDetails[planId as keyof typeof planDetails]
    if (!plan) throw new Error('Invalid plan')

    // Create subscription
    const subscription = await subscriptionService.createSubscription({
      user_id: user.id,
      plan_id: planId,
      plan_name: plan.name,
      interviews_remaining: plan.interviews,
      total_interviews: plan.interviews,
      used_slots: 0,
      price_per_interview: plan.price,
      status: 'active',
      payment_status: plan.trial ? 'completed' : 'completed', // For demo, assume payment is completed
      trial_end_date: plan.trial ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() : undefined,
      expires_at: plan.trial ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() : undefined
    })

    return { user, subscription }
  },

  // Get or create free trial subscription for OAuth users
  async getOrCreateFreeTrialSubscription(userId: string): Promise<Subscription> {
    // Check if user already has an active subscription
    const existingSubscription = await subscriptionService.getActiveSubscription(userId)
    if (existingSubscription) {
      return existingSubscription
    }

    // Create free trial subscription
    const subscription = await subscriptionService.createSubscription({
      user_id: userId,
      plan_id: 'free-trial',
      plan_name: 'Free Trial',
      interviews_remaining: 1,
      total_interviews: 1,
      used_slots: 0,
      price_per_interview: 0,
      status: 'active',
      payment_status: 'completed',
      trial_end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    })

    return subscription
  }
}

// Dashboard Analytics functions
export const dashboardService = {
  // Get system admin dashboard data
  async getSystemDashboardData(): Promise<{
    totalClients: number
    activeSubscriptions: number
    totalInterviews: number
    cheatingFlags: number
    monthlyStats: any[]
  }> {
    const [
      totalClients,
      activeSubscriptions,
      totalInterviews,
      cheatingFlags
    ] = await Promise.all([
      userService.getUsersByRole('university_admin').then(users => users.length),
      subscriptionService.getActiveSubscriptionsCount(),
      interviewService.getTotalInterviewsCount(),
      interviewService.getCheatingFlagsCount()
    ])

    // Mock monthly stats for now
    const monthlyStats = [
      { month: 'Jan', interviews: 120, cheatingFlags: 3 },
      { month: 'Feb', interviews: 150, cheatingFlags: 2 },
      { month: 'Mar', interviews: 180, cheatingFlags: 5 },
      { month: 'Apr', interviews: 200, cheatingFlags: 4 },
      { month: 'May', interviews: 220, cheatingFlags: 6 },
      { month: 'Jun', interviews: 250, cheatingFlags: 3 }
    ]

    return {
      totalClients,
      activeSubscriptions,
      totalInterviews,
      cheatingFlags,
      monthlyStats
    }
  },

  // Get university admin dashboard data
  async getUniversityDashboardData(organizationId: string): Promise<{
    totalCandidates: number
    interviewsScheduled: number
    interviewsCompleted: number
    cheatingFlags: number
    topCandidates: any[]
    interviewDistribution: any[]
  }> {
    const users = await userService.getUsersByOrganization(organizationId)
    const interviews = await interviewService.getInterviewsByBatch(organizationId)

    const totalCandidates = users.filter(u => u.role === 'candidate').length
    const interviewsScheduled = interviews.length
    const interviewsCompleted = interviews.filter(i => i.status === 'completed').length
    const cheatingFlags = interviews.filter(i => i.flagged_cheating).length

    // Mock top candidates
    const topCandidates = interviews
      .filter(i => i.status === 'completed' && i.overall_score)
      .sort((a, b) => (b.overall_score || 0) - (a.overall_score || 0))
      .slice(0, 5)
      .map(i => ({
        name: i.candidate_name || 'Unknown',
        score: i.overall_score || 0,
        position: i.position || 'Unknown'
      }))

    // Mock interview distribution
    const interviewDistribution = [
      { batch: 'Batch A', interviews: 25, completed: 20 },
      { batch: 'Batch B', interviews: 30, completed: 28 },
      { batch: 'Batch C', interviews: 20, completed: 15 }
    ]

    return {
      totalCandidates,
      interviewsScheduled,
      interviewsCompleted,
      cheatingFlags,
      topCandidates,
      interviewDistribution
    }
  }
}

// Legacy functions for backward compatibility
export const db = {
  // ... existing functions ...
  getUsers: async () => {
    const { data, error } = await supabase.from('users').select('*')
    if (error) throw error
    return data || []
  },

  getInterviews: async () => {
    const { data, error } = await supabase.from('interviews').select('*')
    if (error) throw error
    return data || []
  },

  getAnalytics: async () => {
    // Mock analytics data
    return {
      totalInterviews: 24,
      completedInterviews: 18,
      averageScore: 85,
      totalCandidates: 15,
      thisWeek: 5
    }
  }
}