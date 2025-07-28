'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { toast } from 'sonner'

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
      
      // Redirect to OAuth provider
      const redirectUrl = `${window.location.origin}/auth/callback`
      const oauthUrl = provider === 'google' 
        ? `https://accounts.google.com/oauth/authorize?client_id=${process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID}&redirect_uri=${redirectUrl}&response_type=code&scope=email profile`
        : `https://github.com/login/oauth/authorize?client_id=${process.env.NEXT_PUBLIC_GITHUB_ID || process.env.GITHUB_ID}&redirect_uri=${redirectUrl}&scope=user:email`
      
      // Store provider in sessionStorage for callback handling
      sessionStorage.setItem('oauth_provider', provider)
      
      // Redirect to OAuth provider
      window.location.href = oauthUrl
      
    } catch (error) {
      console.error('Sign-in error:', error)
      toast.error('Sign-in failed. Please try again.')
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
      window.location.href = '/'
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