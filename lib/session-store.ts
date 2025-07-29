import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'

export interface SessionData {
  user: any
  subscription?: any
  expires: number
}

// Global session store for serverless environment (fallback)
const sessions = new Map<string, SessionData>()

export const sessionStore = {
  set: (sessionId: string, session: SessionData) => {
    sessions.set(sessionId, session)
  },
  
  get: (sessionId: string): SessionData | null => {
    return sessions.get(sessionId) || null
  },
  
  delete: (sessionId: string) => {
    sessions.delete(sessionId)
  },
  
  clear: () => {
    sessions.clear()
  },

  // Create JWT token for session
  createToken: (sessionData: SessionData): string => {
    return jwt.sign(sessionData, JWT_SECRET, { expiresIn: '24h' })
  },

  // Verify and decode JWT token
  verifyToken: (token: string): SessionData | null => {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as SessionData
      return decoded
    } catch (error) {
      console.error('JWT verification failed:', error)
      return null
    }
  },

  // Get session from token or session store
  getSession: (sessionId: string, token?: string): SessionData | null => {
    // First try JWT token
    if (token) {
      const sessionData = sessionStore.verifyToken(token)
      if (sessionData && sessionData.expires > Date.now()) {
        return sessionData
      }
    }
    
    // Fallback to in-memory store
    const session = sessionStore.get(sessionId)
    if (session && session.expires > Date.now()) {
      return session
    }
    
    return null
  }
} 