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
  signIn: (email: string, password: string) => Promise<void>
  signInWithProvider: (provider: 'google' | 'github') => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkSession()
  }, [])

  const checkSession = async () => {
    try {
      const response = await fetch('/api/auth?action=session')
      const data = await response.json()
      
      if (data.user) {
        setUser(data.user)
        setSubscription(data.subscription || null)
      }
    } catch (error) {
      console.error('Session check failed:', error)
    } finally {
      setLoading(false)
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      const response = await fetch('/api/auth?action=signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (response.ok && data.user) {
        setUser(data.user)
        setSubscription(data.subscription || null)
      } else {
        throw new Error(data.error || 'Sign in failed')
      }
    } catch (error) {
      console.error('Sign in failed:', error)
      throw error
    }
  }

  const signInWithProvider = async (provider: 'google' | 'github') => {
    try {
      // For demo purposes, we'll simulate OAuth login
      // In a real app, this would redirect to OAuth provider
      const response = await fetch('/api/auth?action=signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          provider,
          email: `demo@${provider}.com` // Demo email for testing
        }),
      })

      const data = await response.json()

      if (response.ok && data.user) {
        setUser(data.user)
        setSubscription(data.subscription || null)
      } else {
        throw new Error(data.error || 'Social sign in failed')
      }
    } catch (error) {
      console.error('Social sign in failed:', error)
      throw error
    }
  }

  const signOut = async () => {
    try {
      await fetch('/api/auth?action=signout', {
        method: 'POST',
      })
      setUser(null)
      setSubscription(null)
    } catch (error) {
      console.error('Sign out failed:', error)
      throw error
    }
  }

  return (
    <AuthContext.Provider value={{ user, subscription, loading, signIn, signInWithProvider, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
} 