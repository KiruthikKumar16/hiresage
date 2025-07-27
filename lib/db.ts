// Database interfaces and types
export interface ContactSubmission {
  id: string
  name: string
  email: string
  company?: string
  message: string
  plan?: string
  createdAt: Date
}

export interface TrialSignup {
  id: string
  name: string
  email: string
  company?: string
  plan?: string
  useCase?: string
  trialId: string
  createdAt: Date
}

export interface NewsletterSignup {
  id: string
  email: string
  name?: string
  createdAt: Date
}

export interface User {
  id: string
  name: string
  email: string
  company?: string
  role: 'admin' | 'user'
  createdAt: Date
  lastLogin?: Date
}

export interface Candidate {
  id: string
  name: string
  email: string
  phone: string
  position: string
  status: 'new' | 'interviewed' | 'hired' | 'rejected'
  score?: number
  lastInterview?: Date
  experience: string
  skills: string[]
  resume?: string
  notes?: string
  createdAt: Date
  updatedAt: Date
}

export interface Interview {
  id: string
  candidateId: string
  candidateName: string
  position: string
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled'
  score?: number
  duration?: number // in minutes
  questions: InterviewQuestion[]
  messages: InterviewMessage[]
  startedAt?: Date
  completedAt?: Date
  createdAt: Date
  updatedAt: Date
}

export interface InterviewQuestion {
  id: string
  question: string
  category: string
  weight: number
  answered: boolean
  score?: number
}

export interface InterviewMessage {
  id: string
  type: 'ai' | 'user'
  content: string
  timestamp: Date
  audioUrl?: string
  emotion?: string
  confidence?: number
  deceptionScore?: number
  transcript?: string
}

export interface VideoInterview extends Interview {
  videoUrl?: string
  emotionAnalysis: {
    overallMood: string
    confidenceLevel: number
    stressLevel: number
    engagementLevel: number
    deceptionIndicators: string[]
  }
  cheatingDetection: {
    multipleFaces: boolean
    screenSharing: boolean
    backgroundNoise: boolean
    unusualMovements: boolean
    suspiciousBehavior: string[]
  }
  realTimeAnalysis: {
    speechToText: string
    currentEmotion: string
    confidenceScore: number
    deceptionScore: number
    timestamp: Date
  }[]
  aiResponse: {
    nextQuestion: string
    followUp: string
    audioUrl: string
    emotion: string
    confidence: number
  }
}

export interface Organization {
  id: string
  name: string
  email: string
  plan: 'basic' | 'premium' | 'enterprise'
  maxUsers: number
  currentUsers: number
  subscriptionStatus: 'active' | 'expired' | 'cancelled'
  createdAt: Date
  updatedAt: Date
}

export interface IndividualUser {
  id: string
  name: string
  email: string
  plan: 'free' | 'basic' | 'premium'
  interviewsCompleted: number
  interviewsRemaining: number
  subscriptionStatus: 'active' | 'expired' | 'cancelled'
  createdAt: Date
  updatedAt: Date
}

export interface Analytics {
  totalInterviews: number
  completedInterviews: number
  averageScore: number
  averageDuration: number
  totalCandidates: number
  thisWeek: number
  topPositions: Array<{
    position: string
    count: number
    avgScore: number
  }>
  scoreDistribution: Array<{
    range: string
    count: number
    percentage: number
  }>
  weeklyTrends: Array<{
    week: string
    interviews: number
    avgScore: number
  }>
}

// Real database implementation with persistent storage
class Database {
  private contacts: ContactSubmission[] = []
  private trials: TrialSignup[] = []
  private newsletters: NewsletterSignup[] = []
  private users: User[] = []
  private candidates: Candidate[] = []
  private interviews: Interview[] = []
  private videoInterviews: VideoInterview[] = []
  private organizations: Organization[] = []
  private individualUsers: IndividualUser[] = []

  constructor() {
    this.loadFromStorage()
  }

  private loadFromStorage() {
    try {
      if (typeof window !== 'undefined') {
        const contacts = localStorage.getItem('jocruit_contacts')
        const trials = localStorage.getItem('jocruit_trials')
        const newsletters = localStorage.getItem('jocruit_newsletters')
        const users = localStorage.getItem('jocruit_users')
        const candidates = localStorage.getItem('jocruit_candidates')
        const interviews = localStorage.getItem('jocruit_interviews')
        const videoInterviews = localStorage.getItem('jocruit_video_interviews')
        const organizations = localStorage.getItem('jocruit_organizations')
        const individualUsers = localStorage.getItem('jocruit_individual_users')

        if (contacts) this.contacts = JSON.parse(contacts)
        if (trials) this.trials = JSON.parse(trials)
        if (newsletters) this.newsletters = JSON.parse(newsletters)
        if (users) this.users = JSON.parse(users)
        if (candidates) this.candidates = JSON.parse(candidates)
        if (interviews) this.interviews = JSON.parse(interviews)
        if (videoInterviews) this.videoInterviews = JSON.parse(videoInterviews)
        if (organizations) this.organizations = JSON.parse(organizations)
        if (individualUsers) this.individualUsers = JSON.parse(individualUsers)
      }
    } catch (error) {
      console.error('Error loading from storage:', error)
    }
  }

  private saveToStorage() {
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem('jocruit_contacts', JSON.stringify(this.contacts))
        localStorage.setItem('jocruit_trials', JSON.stringify(this.trials))
        localStorage.setItem('jocruit_newsletters', JSON.stringify(this.newsletters))
        localStorage.setItem('jocruit_users', JSON.stringify(this.users))
        localStorage.setItem('jocruit_candidates', JSON.stringify(this.candidates))
        localStorage.setItem('jocruit_interviews', JSON.stringify(this.interviews))
        localStorage.setItem('jocruit_video_interviews', JSON.stringify(this.videoInterviews))
        localStorage.setItem('jocruit_organizations', JSON.stringify(this.organizations))
        localStorage.setItem('jocruit_individual_users', JSON.stringify(this.individualUsers))
      }
    } catch (error) {
      console.error('Error saving to storage:', error)
    }
  }

  // Contact submissions
  async createContact(data: Omit<ContactSubmission, 'id' | 'createdAt'>): Promise<ContactSubmission> {
    const contact: ContactSubmission = {
      ...data,
      id: `contact_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
    }
    this.contacts.push(contact)
    this.saveToStorage()
    return contact
  }

  async getContacts(): Promise<ContactSubmission[]> {
    return this.contacts.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
  }

  // Trial signups
  async createTrial(data: Omit<TrialSignup, 'id' | 'createdAt'>): Promise<TrialSignup> {
    const trial: TrialSignup = {
      ...data,
      id: `trial_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
    }
    this.trials.push(trial)
    this.saveToStorage()
    return trial
  }

  async getTrials(): Promise<TrialSignup[]> {
    return this.trials.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
  }

  // Newsletter signups
  async createNewsletter(data: Omit<NewsletterSignup, 'id' | 'createdAt'>): Promise<NewsletterSignup> {
    const newsletter: NewsletterSignup = {
      ...data,
      id: `newsletter_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
    }
    this.newsletters.push(newsletter)
    this.saveToStorage()
    return newsletter
  }

  async getNewsletters(): Promise<NewsletterSignup[]> {
    return this.newsletters.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
  }

  // Users
  async createUser(data: Omit<User, 'id' | 'createdAt'>): Promise<User> {
    const user: User = {
      ...data,
      id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
    }
    this.users.push(user)
    this.saveToStorage()
    return user
  }

  async getUserByEmail(email: string): Promise<User | null> {
    return this.users.find(u => u.email === email) || null
  }

  async updateUserLastLogin(userId: string): Promise<void> {
    const user = this.users.find(u => u.id === userId)
    if (user) {
      user.lastLogin = new Date()
      this.saveToStorage()
    }
  }

  async getUsers(): Promise<User[]> {
    return this.users.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
  }

  // Candidates
  async createCandidate(data: Omit<Candidate, 'id' | 'createdAt' | 'updatedAt'>): Promise<Candidate> {
    const candidate: Candidate = {
      ...data,
      id: `candidate_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    this.candidates.push(candidate)
    this.saveToStorage()
    return candidate
  }

  async getCandidates(): Promise<Candidate[]> {
    return this.candidates.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
  }

  async getCandidateById(id: string): Promise<Candidate | null> {
    return this.candidates.find(c => c.id === id) || null
  }

  async updateCandidate(id: string, data: Partial<Candidate>): Promise<Candidate | null> {
    const candidate = this.candidates.find(c => c.id === id)
    if (candidate) {
      Object.assign(candidate, { ...data, updatedAt: new Date() })
      this.saveToStorage()
      return candidate
    }
    return null
  }

  async deleteCandidate(id: string): Promise<boolean> {
    const index = this.candidates.findIndex(c => c.id === id)
    if (index !== -1) {
      this.candidates.splice(index, 1)
      this.saveToStorage()
      return true
    }
    return false
  }

  // Interviews
  async createInterview(data: Omit<Interview, 'id' | 'createdAt' | 'updatedAt'>): Promise<Interview> {
    const interview: Interview = {
      ...data,
      id: `interview_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    this.interviews.push(interview)
    this.saveToStorage()
    return interview
  }

  async getInterviews(): Promise<Interview[]> {
    return this.interviews.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
  }

  async getInterviewById(id: string): Promise<Interview | null> {
    return this.interviews.find(i => i.id === id) || null
  }

  async updateInterview(id: string, data: Partial<Interview>): Promise<Interview | null> {
    const interview = this.interviews.find(i => i.id === id)
    if (interview) {
      Object.assign(interview, { ...data, updatedAt: new Date() })
      this.saveToStorage()
      return interview
    }
    return null
  }

  async addInterviewMessage(interviewId: string, message: Omit<InterviewMessage, 'id'>): Promise<InterviewMessage | null> {
    const interview = this.interviews.find(i => i.id === interviewId)
    if (interview) {
      const newMessage: InterviewMessage = {
        ...message,
        id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      }
      interview.messages.push(newMessage)
      interview.updatedAt = new Date()
      this.saveToStorage()
      return newMessage
    }
    return null
  }

  // Video Interview Methods
  async createVideoInterview(data: Omit<VideoInterview, 'id' | 'createdAt' | 'updatedAt'>): Promise<VideoInterview> {
    const videoInterview: VideoInterview = {
      ...data,
      id: `video_interview_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    
    this.videoInterviews.push(videoInterview)
    this.saveToStorage()
    console.log('Video interview created:', videoInterview.id)
    return videoInterview
  }

  async getVideoInterviewById(id: string): Promise<VideoInterview | null> {
    return this.videoInterviews.find(interview => interview.id === id) || null
  }

  async updateVideoInterview(id: string, updates: Partial<VideoInterview>): Promise<VideoInterview | null> {
    const index = this.videoInterviews.findIndex(interview => interview.id === id)
    if (index === -1) return null
    
    this.videoInterviews[index] = {
      ...this.videoInterviews[index],
      ...updates,
      updatedAt: new Date(),
    }
    
    this.saveToStorage()
    return this.videoInterviews[index]
  }

  async getVideoInterviews(): Promise<VideoInterview[]> {
    return this.videoInterviews.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
  }

  // Organization Methods
  async createOrganization(data: Omit<Organization, 'id' | 'createdAt' | 'updatedAt'>): Promise<Organization> {
    const organization: Organization = {
      ...data,
      id: `org_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    
    this.organizations.push(organization)
    this.saveToStorage()
    console.log('Organization created:', organization.id)
    return organization
  }

  async getOrganizationById(id: string): Promise<Organization | null> {
    return this.organizations.find(org => org.id === id) || null
  }

  async updateOrganization(id: string, updates: Partial<Organization>): Promise<Organization | null> {
    const index = this.organizations.findIndex(org => org.id === id)
    if (index === -1) return null
    
    this.organizations[index] = {
      ...this.organizations[index],
      ...updates,
      updatedAt: new Date(),
    }
    
    this.saveToStorage()
    return this.organizations[index]
  }

  async getOrganizations(): Promise<Organization[]> {
    return this.organizations.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
  }

  // Individual User Methods
  async createIndividualUser(data: Omit<IndividualUser, 'id' | 'createdAt' | 'updatedAt'>): Promise<IndividualUser> {
    const user: IndividualUser = {
      ...data,
      id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    
    this.individualUsers.push(user)
    this.saveToStorage()
    console.log('Individual user created:', user.id)
    return user
  }

  async getIndividualUserById(id: string): Promise<IndividualUser | null> {
    return this.individualUsers.find(user => user.id === id) || null
  }

  async getIndividualUserByEmail(email: string): Promise<IndividualUser | null> {
    return this.individualUsers.find(user => user.email === email) || null
  }

  async updateIndividualUser(id: string, updates: Partial<IndividualUser>): Promise<IndividualUser | null> {
    const index = this.individualUsers.findIndex(user => user.id === id)
    if (index === -1) return null
    
    this.individualUsers[index] = {
      ...this.individualUsers[index],
      ...updates,
      updatedAt: new Date(),
    }
    
    this.saveToStorage()
    return this.individualUsers[index]
  }

  async getIndividualUsers(): Promise<IndividualUser[]> {
    return this.individualUsers.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
  }

  // Analytics
  async getAnalytics(): Promise<Analytics> {
    const now = new Date()
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    
    const completedInterviews = this.interviews.filter(i => i.status === 'completed')
    const thisWeekInterviews = this.interviews.filter(i => 
      i.createdAt >= oneWeekAgo && i.status === 'completed'
    )

    // Calculate top positions
    const positionStats = new Map<string, { count: number, totalScore: number }>()
    completedInterviews.forEach(interview => {
      const current = positionStats.get(interview.position) || { count: 0, totalScore: 0 }
      current.count++
      if (interview.score) current.totalScore += interview.score
      positionStats.set(interview.position, current)
    })

    const topPositions = Array.from(positionStats.entries())
      .map(([position, stats]) => ({
        position,
        count: stats.count,
        avgScore: stats.totalScore / stats.count
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)

    // Calculate score distribution
    const scores = completedInterviews.map(i => i.score).filter(Boolean) as number[]
    const scoreRanges = [
      { range: '9-10', min: 9, max: 10 },
      { range: '8-9', min: 8, max: 9 },
      { range: '7-8', min: 7, max: 8 },
      { range: '6-7', min: 6, max: 7 },
      { range: '5-6', min: 5, max: 6 }
    ]

    const scoreDistribution = scoreRanges.map(range => {
      const count = scores.filter(score => score >= range.min && score < range.max).length
      return {
        range: range.range,
        count,
        percentage: scores.length > 0 ? Math.round((count / scores.length) * 100) : 0
      }
    })

    // Calculate weekly trends (last 4 weeks)
    const weeklyTrends = []
    for (let i = 3; i >= 0; i--) {
      const weekStart = new Date(now.getTime() - i * 7 * 24 * 60 * 60 * 1000)
      const weekEnd = new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000)
      
      const weekInterviews = completedInterviews.filter(i => 
        i.createdAt >= weekStart && i.createdAt < weekEnd
      )
      
      const weekScores = weekInterviews.map(i => i.score).filter(Boolean) as number[]
      const avgScore = weekScores.length > 0 
        ? weekScores.reduce((sum, score) => sum + score, 0) / weekScores.length 
        : 0

      weeklyTrends.push({
        week: `Week ${4 - i}`,
        interviews: weekInterviews.length,
        avgScore: Math.round(avgScore * 10) / 10
      })
    }

    const averageScore = scores.length > 0 
      ? scores.reduce((sum, score) => sum + score, 0) / scores.length 
      : 0

    const averageDuration = completedInterviews.length > 0
      ? completedInterviews.reduce((sum, i) => sum + (i.duration || 0), 0) / completedInterviews.length
      : 0

    return {
      totalInterviews: this.interviews.length,
      completedInterviews: completedInterviews.length,
      averageScore: Math.round(averageScore * 10) / 10,
      averageDuration: Math.round(averageDuration),
      totalCandidates: this.candidates.length,
      thisWeek: thisWeekInterviews.length,
      topPositions,
      scoreDistribution,
      weeklyTrends
    }
  }

  // Admin analytics
  async getAdminAnalytics() {
    return {
      totalContacts: this.contacts.length,
      totalTrials: this.trials.length,
      totalNewsletters: this.newsletters.length,
      totalUsers: this.users.length,
      totalCandidates: this.candidates.length,
      totalInterviews: this.interviews.length,
      recentContacts: this.contacts.slice(0, 10),
      recentTrials: this.trials.slice(0, 10),
      recentCandidates: this.candidates.slice(0, 10),
      recentInterviews: this.interviews.slice(0, 10),
    }
  }
}

// Export singleton instance
export const db = new Database() 