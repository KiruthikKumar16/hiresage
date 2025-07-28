'use client'

import { createContext, useContext, useEffect, useState } from 'react'

interface User {
  id: string
  email: string
  name: string
  role: string
  company?: string
  phone?: string
  website?: string
  created_at: string
  updated_at: string
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
  created_at: string
  updated_at: string
}

interface AuthContextType {
  user: User | null
  subscription: Subscription | null
  loading: boolean
  signInWithProvider: (provider: 'google' | 'github') => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [loading, setLoading] = useState(true)

  // Fetch session on mount
  useEffect(() => {
    fetchSession()
  }, [])

  const fetchSession = async () => {
    try {
      const response = await fetch('/api/auth?action=session')
      const data = await response.json()
      
      if (data.user) {
        setUser(data.user)
        setSubscription(data.subscription)
      }
    } catch (error) {
      console.error('Error fetching session:', error)
    } finally {
      setLoading(false)
    }
  }

  const signInWithProvider = async (provider: 'google' | 'github') => {
    try {
      setLoading(true)
      
      // For now, we'll simulate the OAuth flow with a prompt
      // In production, this would redirect to the actual OAuth provider
      const email = prompt(`Enter your ${provider} email for testing:`)
      const name = prompt(`Enter your name for testing:`)
      
      if (!email || !name) {
        setLoading(false)
        return
      }

      // Call our auth API to create/authenticate user
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'signin',
          provider,
          email,
          name
        })
      })

      const data = await response.json()
      
      if (data.success) {
        setUser(data.user)
        setSubscription(data.subscription)
        // Redirect to dashboard after successful sign-in
        window.location.href = '/dashboard'
      } else {
        alert('Sign-in failed: ' + (data.error || 'Unknown error'))
      }
    } catch (error) {
      console.error('Sign-in error:', error)
      alert('Sign-in failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

      // Simulate OAuth sign-in
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'signin',
          provider,
          email: mockUser.email,
          name: mockUser.name
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
        setSubscription(data.subscription)
      } else {
        throw new Error('Sign-in failed')
      }
    } catch (error) {
      console.error('Sign-in error:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    try {
      setLoading(true)
      
      await fetch('/api/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'signout'
        }),
      })

      setUser(null)
      setSubscription(null)
    } catch (error) {
      console.error('Sign-out error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthContext.Provider value={{
      user,
      subscription,
      loading,
      signInWithProvider,
      signOut
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
} 