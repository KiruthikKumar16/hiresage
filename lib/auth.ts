import { supabase } from './supabase-client'
import { User } from './supabase-client'

export interface AuthUser {
  id: string
  email: string
  name: string
  avatar?: string
  role: 'candidate' | 'enterprise_admin' | 'system_admin'
  organization_id?: string
}

export class AuthService {
  // Get current user
  async getCurrentUser(): Promise<AuthUser | null> {
    try {
      const { data: { user }, error } = await supabase.auth.getUser()
      
      if (error || !user) {
        return null
      }

      // Get user profile from our users table
      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single()

      if (profileError || !profile) {
        return null
      }

      return {
        id: profile.id,
        email: profile.email,
        name: profile.name,
        avatar: profile.avatar,
        role: profile.role,
        organization_id: profile.organization_id
      }
    } catch (error) {
      console.error('Error getting current user:', error)
      return null
    }
  }

  // Sign in with email/password
  async signInWithEmail(email: string, password: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) {
        return { success: false, error: error.message }
      }

      // Create or update user profile
      await this.createUserProfile(data.user!)
      
      return { success: true }
    } catch (error) {
      console.error('Sign in error:', error)
      return { success: false, error: 'Sign in failed' }
    }
  }

  // Sign up with email/password
  async signUpWithEmail(email: string, password: string, name: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name
          }
        }
      })

      if (error) {
        return { success: false, error: error.message }
      }

      // Create user profile
      await this.createUserProfile(data.user!)
      
      return { success: true }
    } catch (error) {
      console.error('Sign up error:', error)
      return { success: false, error: 'Sign up failed' }
    }
  }

  // Sign in with Google
  async signInWithGoogle(): Promise<{ success: boolean; error?: string }> {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      })

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true }
    } catch (error) {
      console.error('Google sign in error:', error)
      return { success: false, error: 'Google sign in failed' }
    }
  }

  // Sign in with GitHub
  async signInWithGitHub(): Promise<{ success: boolean; error?: string }> {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      })

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true }
    } catch (error) {
      console.error('GitHub sign in error:', error)
      return { success: false, error: 'GitHub sign in failed' }
    }
  }

  // Sign out
  async signOut(): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase.auth.signOut()
      
      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true }
    } catch (error) {
      console.error('Sign out error:', error)
      return { success: false, error: 'Sign out failed' }
    }
  }

  // Create or update user profile
  private async createUserProfile(authUser: any): Promise<void> {
    try {
      const { data: existingUser } = await supabase
        .from('users')
        .select('*')
        .eq('id', authUser.id)
        .single()

      if (!existingUser) {
        // Create new user profile
        const { error } = await supabase
          .from('users')
          .insert({
            id: authUser.id,
            email: authUser.email!,
            name: authUser.user_metadata?.name || authUser.email!.split('@')[0],
            avatar: authUser.user_metadata?.avatar_url || '',
            provider: authUser.app_metadata?.provider || '',
            role: 'candidate'
          })

        if (error) {
          console.error('Error creating user profile:', error)
        }
      } else {
        // Update existing user profile
        const { error } = await supabase
          .from('users')
          .update({
            name: authUser.user_metadata?.name || existingUser.name,
            avatar: authUser.user_metadata?.avatar_url || existingUser.avatar,
            provider: authUser.app_metadata?.provider || existingUser.provider
          })
          .eq('id', authUser.id)

        if (error) {
          console.error('Error updating user profile:', error)
        }
      }
    } catch (error) {
      console.error('Error creating/updating user profile:', error)
    }
  }

  // Handle OAuth callback
  async handleAuthCallback(): Promise<{ success: boolean; error?: string }> {
    try {
      const { data, error } = await supabase.auth.getSession()
      
      if (error) {
        return { success: false, error: error.message }
      }

      if (data.session?.user) {
        await this.createUserProfile(data.session.user)
        return { success: true }
      }

      return { success: false, error: 'No session found' }
    } catch (error) {
      console.error('Auth callback error:', error)
      return { success: false, error: 'Auth callback failed' }
    }
  }

  // Check if user has active subscription
  async hasActiveSubscription(userId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'active')
        .gte('expires_at', new Date().toISOString())
        .single()

      if (error || !data) {
        return false
      }

      return data.interviews_used < data.interview_limit
    } catch (error) {
      console.error('Error checking subscription:', error)
      return false
    }
  }

  // Get user's remaining interviews
  async getRemainingInterviews(userId: string): Promise<number> {
    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('interview_limit, interviews_used')
        .eq('user_id', userId)
        .eq('status', 'active')
        .gte('expires_at', new Date().toISOString())
        .single()

      if (error || !data) {
        return 0
      }

      return Math.max(0, data.interview_limit - data.interviews_used)
    } catch (error) {
      console.error('Error getting remaining interviews:', error)
      return 0
    }
  }
}

// Export singleton instance
export const authService = new AuthService() 