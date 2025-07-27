import { supabase } from './supabase'
import type { Database } from './supabase'

type Tables = Database['public']['Tables']

// User types
export type User = Tables['users']['Row']
export type UserInsert = Tables['users']['Insert']
export type UserUpdate = Tables['users']['Update']

// Candidate types
export type Candidate = Tables['candidates']['Row']
export type CandidateInsert = Tables['candidates']['Insert']
export type CandidateUpdate = Tables['candidates']['Update']

// Interview types
export type Interview = Tables['interviews']['Row']
export type InterviewInsert = Tables['interviews']['Insert']
export type InterviewUpdate = Tables['interviews']['Update']

// Video Interview types
export type VideoInterview = Tables['video_interviews']['Row']
export type VideoInterviewInsert = Tables['video_interviews']['Insert']
export type VideoInterviewUpdate = Tables['video_interviews']['Update']

// Organization types
export type Organization = Tables['organizations']['Row']
export type OrganizationInsert = Tables['organizations']['Insert']
export type OrganizationUpdate = Tables['organizations']['Update']

// Individual User types
export type IndividualUser = Tables['individual_users']['Row']
export type IndividualUserInsert = Tables['individual_users']['Insert']
export type IndividualUserUpdate = Tables['individual_users']['Update']

class SupabaseDatabase {
  // Users
  async createUser(data: Omit<UserInsert, 'id' | 'created_at'>): Promise<User> {
    const { data: user, error } = await supabase
      .from('users')
      .insert({
        ...data,
        created_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) throw error
    return user
  }

  async getUserByEmail(email: string): Promise<User | null> {
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single()

    if (error && error.code !== 'PGRST116') throw error
    return user
  }

  async getUsers(): Promise<User[]> {
    const { data: users, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    return users
  }

  async updateUserLastLogin(userId: string): Promise<void> {
    const { error } = await supabase
      .from('users')
      .update({ last_login: new Date().toISOString() })
      .eq('id', userId)

    if (error) throw error
  }

  // Candidates
  async createCandidate(data: Omit<CandidateInsert, 'id' | 'created_at' | 'updated_at'>): Promise<Candidate> {
    const { data: candidate, error } = await supabase
      .from('candidates')
      .insert({
        ...data,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) throw error
    return candidate
  }

  async getCandidates(): Promise<Candidate[]> {
    const { data: candidates, error } = await supabase
      .from('candidates')
      .select('*')
      .order('updated_at', { ascending: false })

    if (error) throw error
    return candidates
  }

  async getCandidateById(id: string): Promise<Candidate | null> {
    const { data: candidate, error } = await supabase
      .from('candidates')
      .select('*')
      .eq('id', id)
      .single()

    if (error && error.code !== 'PGRST116') throw error
    return candidate
  }

  async updateCandidate(id: string, data: Partial<CandidateUpdate>): Promise<Candidate | null> {
    const { data: candidate, error } = await supabase
      .from('candidates')
      .update({
        ...data,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return candidate
  }

  async deleteCandidate(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('candidates')
      .delete()
      .eq('id', id)

    if (error) throw error
    return true
  }

  // Interviews
  async createInterview(data: Omit<InterviewInsert, 'id' | 'created_at' | 'updated_at'>): Promise<Interview> {
    const { data: interview, error } = await supabase
      .from('interviews')
      .insert({
        ...data,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) throw error
    return interview
  }

  async getInterviews(): Promise<Interview[]> {
    const { data: interviews, error } = await supabase
      .from('interviews')
      .select('*')
      .order('updated_at', { ascending: false })

    if (error) throw error
    return interviews
  }

  async getInterviewById(id: string): Promise<Interview | null> {
    const { data: interview, error } = await supabase
      .from('interviews')
      .select('*')
      .eq('id', id)
      .single()

    if (error && error.code !== 'PGRST116') throw error
    return interview
  }

  async updateInterview(id: string, data: Partial<InterviewUpdate>): Promise<Interview | null> {
    const { data: interview, error } = await supabase
      .from('interviews')
      .update({
        ...data,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return interview
  }

  // Video Interviews
  async createVideoInterview(data: Omit<VideoInterviewInsert, 'id' | 'created_at' | 'updated_at'>): Promise<VideoInterview> {
    const { data: videoInterview, error } = await supabase
      .from('video_interviews')
      .insert({
        ...data,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) throw error
    return videoInterview
  }

  async getVideoInterviews(): Promise<VideoInterview[]> {
    const { data: videoInterviews, error } = await supabase
      .from('video_interviews')
      .select('*')
      .order('updated_at', { ascending: false })

    if (error) throw error
    return videoInterviews
  }

  async getVideoInterviewById(id: string): Promise<VideoInterview | null> {
    const { data: videoInterview, error } = await supabase
      .from('video_interviews')
      .select('*')
      .eq('id', id)
      .single()

    if (error && error.code !== 'PGRST116') throw error
    return videoInterview
  }

  async updateVideoInterview(id: string, data: Partial<VideoInterviewUpdate>): Promise<VideoInterview | null> {
    const { data: videoInterview, error } = await supabase
      .from('video_interviews')
      .update({
        ...data,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return videoInterview
  }

  // Organizations
  async createOrganization(data: Omit<OrganizationInsert, 'id' | 'created_at' | 'updated_at'>): Promise<Organization> {
    const { data: organization, error } = await supabase
      .from('organizations')
      .insert({
        ...data,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) throw error
    return organization
  }

  async getOrganizations(): Promise<Organization[]> {
    const { data: organizations, error } = await supabase
      .from('organizations')
      .select('*')
      .order('updated_at', { ascending: false })

    if (error) throw error
    return organizations
  }

  async getOrganizationById(id: string): Promise<Organization | null> {
    const { data: organization, error } = await supabase
      .from('organizations')
      .select('*')
      .eq('id', id)
      .single()

    if (error && error.code !== 'PGRST116') throw error
    return organization
  }

  async updateOrganization(id: string, data: Partial<OrganizationUpdate>): Promise<Organization | null> {
    const { data: organization, error } = await supabase
      .from('organizations')
      .update({
        ...data,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return organization
  }

  // Individual Users
  async createIndividualUser(data: Omit<IndividualUserInsert, 'id' | 'created_at' | 'updated_at'>): Promise<IndividualUser> {
    const { data: individualUser, error } = await supabase
      .from('individual_users')
      .insert({
        ...data,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) throw error
    return individualUser
  }

  async getIndividualUsers(): Promise<IndividualUser[]> {
    const { data: individualUsers, error } = await supabase
      .from('individual_users')
      .select('*')
      .order('updated_at', { ascending: false })

    if (error) throw error
    return individualUsers
  }

  async getIndividualUserById(id: string): Promise<IndividualUser | null> {
    const { data: individualUser, error } = await supabase
      .from('individual_users')
      .select('*')
      .eq('id', id)
      .single()

    if (error && error.code !== 'PGRST116') throw error
    return individualUser
  }

  async getIndividualUserByEmail(email: string): Promise<IndividualUser | null> {
    const { data: individualUser, error } = await supabase
      .from('individual_users')
      .select('*')
      .eq('email', email)
      .single()

    if (error && error.code !== 'PGRST116') throw error
    return individualUser
  }

  async updateIndividualUser(id: string, data: Partial<IndividualUserUpdate>): Promise<IndividualUser | null> {
    const { data: individualUser, error } = await supabase
      .from('individual_users')
      .update({
        ...data,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return individualUser
  }

  // Analytics
  async getAnalytics() {
    const [
      { count: totalInterviews },
      { count: totalCandidates },
      { data: interviews }
    ] = await Promise.all([
      supabase.from('interviews').select('*', { count: 'exact', head: true }),
      supabase.from('candidates').select('*', { count: 'exact', head: true }),
      supabase.from('interviews').select('*').eq('status', 'completed')
    ])

    const completedInterviews = interviews.data?.length || 0
    const averageScore = interviews.data?.reduce((sum, interview) => sum + (interview.score || 0), 0) / completedInterviews || 0

    return {
      totalInterviews: totalInterviews || 0,
      completedInterviews,
      averageScore: Math.round(averageScore * 100) / 100,
      averageDuration: 25, // Mock data
      totalCandidates: totalCandidates || 0,
      thisWeek: Math.floor(Math.random() * 10) + 5, // Mock data
      topPositions: [
        { position: 'Software Engineer', count: 15, avgScore: 85 },
        { position: 'Product Manager', count: 8, avgScore: 78 },
        { position: 'Data Scientist', count: 6, avgScore: 82 }
      ],
      scoreDistribution: [
        { range: '90-100', count: 12, percentage: 30 },
        { range: '80-89', count: 18, percentage: 45 },
        { range: '70-79', count: 8, percentage: 20 },
        { range: '60-69', count: 2, percentage: 5 }
      ],
      weeklyTrends: [
        { week: 'Week 1', interviews: 8, avgScore: 82 },
        { week: 'Week 2', interviews: 12, avgScore: 85 },
        { week: 'Week 3', interviews: 10, avgScore: 79 },
        { week: 'Week 4', interviews: 15, avgScore: 87 }
      ]
    }
  }
}

export const supabaseDb = new SupabaseDatabase() 