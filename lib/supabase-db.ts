import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseKey)

// Database interfaces
export interface User {
  id: string
  email: string
  name: string
  company?: string
  phone?: string
  website?: string
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
  price_per_interview: number
  status: 'active' | 'expired' | 'cancelled'
  payment_method?: string
  payment_status: 'pending' | 'completed' | 'failed'
  trial_end_date?: string
  expires_at?: string
  created_at: string
  updated_at: string
}

export interface Interview {
  id: string
  user_id: string
  candidate_name: string
  position: string
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled'
  score?: number
  duration?: number
  transcript?: string
  ai_feedback?: string
  created_at: string
  updated_at: string
}

export interface Message {
  id: string
  interview_id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}

// User management functions
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
  }
}

// Subscription management functions
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
      interviews_remaining: subscription.interviews_remaining - 1
    })

    return true
  }
}

// Interview management functions
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
  }
}

// Authentication functions
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
      price_per_interview: plan.price,
      status: 'active',
      payment_status: plan.trial ? 'completed' : 'completed', // For demo, assume payment is completed
      trial_end_date: plan.trial ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() : undefined,
      expires_at: plan.trial ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() : undefined
    })

    return { user, subscription }
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