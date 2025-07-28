// Global session store for serverless environment
const sessions = new Map<string, any>()

export const sessionStore = {
  set: (sessionId: string, session: any) => {
    sessions.set(sessionId, session)
  },
  
  get: (sessionId: string) => {
    return sessions.get(sessionId)
  },
  
  delete: (sessionId: string) => {
    sessions.delete(sessionId)
  },
  
  clear: () => {
    sessions.clear()
  }
} 