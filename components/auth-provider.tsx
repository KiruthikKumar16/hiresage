"use client"

import { createContext, useContext, useEffect, useState, ReactNode } from "react"

interface User {
  id: string
  email: string
  name: string
  company?: string
  phone?: string
  website?: string
}

interface Subscription {
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
}

interface AuthContextType {
  user: User | null
  subscription: Subscription | null
  loading: boolean
  signInWithProvider: (provider: 'google' | 'github') => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState(null)
  const [subscription, setSubscription] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Fetch session on mount
    async function checkSession() {
      setLoading(true)
      try {
        const res = await fetch('/api/auth?action=session')
        if (res.ok) {
          const { user, subscription } = await res.json()
          setUser(user)
          setSubscription(subscription)
        } else {
          setUser(null)
          setSubscription(null)
        }
      } catch {
        setUser(null)
        setSubscription(null)
      }
      setLoading(false)
    }
    checkSession()
  }, [])

  async function signInWithProvider(provider) {
    // Implement OAuth popup/redirect logic here
    // For demo: call /api/auth with provider
    setLoading(true)
    try {
      // In real app, use OAuth popup/redirect
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'signin', provider })
      })
      if (res.ok) {
        const { user, subscription } = await res.json()
        setUser(user)
        setSubscription(subscription)
      } else {
        setUser(null)
        setSubscription(null)
      }
    } finally {
      setLoading(false)
    }
  }

  async function signOut() {
    setLoading(true)
    await fetch('/api/auth', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'signout' }) })
    setUser(null)
    setSubscription(null)
    setLoading(false)
  }

  return (
    <AuthContext.Provider value={{ user, subscription, loading, signInWithProvider, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
} 