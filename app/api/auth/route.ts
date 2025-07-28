import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase-db'

// Simple session storage (in production, use Redis or database)
const sessions = new Map()

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const action = searchParams.get('action')

  if (action === 'session') {
    const sessionId = request.cookies.get('session-id')?.value
    
    if (sessionId && sessions.has(sessionId)) {
      const session = sessions.get(sessionId)
      return NextResponse.json({
        user: session.user,
        subscription: session.subscription,
        expires: session.expires
      })
    }
    
    return NextResponse.json({ user: null })
  }

  if (action === 'providers') {
    return NextResponse.json({
      google: {
        id: 'google',
        name: 'Google',
        type: 'oauth'
      },
      github: {
        id: 'github',
        name: 'GitHub',
        type: 'oauth'
      }
    })
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, provider, email, name, avatar } = body

    if (action === 'signin') {
      if (provider === 'google' || provider === 'github') {
        // Try to find user by email
        let { data: user, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('email', email)
          .single()

        if (userError && userError.code !== 'PGRST116') {
          console.error('Error finding user:', userError)
          return NextResponse.json({ error: 'Authentication failed' }, { status: 500 })
        }

        if (!user) {
          // Create new user with candidate role
          const { data: newUser, error: createError } = await supabase
            .from('users')
            .insert([{
              email,
              name: name || email.split('@')[0],
              role: 'candidate', // Default role for new users
              status: 'active'
            }])
            .select()
            .single()

          if (createError) {
            console.error('Error creating user:', createError)
            return NextResponse.json({ error: 'Failed to create user account' }, { status: 500 })
          }

          user = newUser
        }

        // Check if user has active subscription, create free trial if not
        let { data: subscription, error: subError } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('user_id', user.id)
          .eq('status', 'active')
          .single()

        if (subError && subError.code !== 'PGRST116') {
          console.error('Error checking subscription:', subError)
          return NextResponse.json({ error: 'Authentication failed' }, { status: 500 })
        }

        if (!subscription) {
          // Create free trial subscription
          const { data: newSubscription, error: createSubError } = await supabase
            .from('subscriptions')
            .insert([{
              user_id: user.id,
              plan_id: 'free-trial',
              plan_name: 'Free Trial',
              interviews_remaining: 1,
              total_interviews: 1,
              price_per_interview: 0,
              status: 'active',
              payment_status: 'completed',
              trial_end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
              expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
            }])
            .select()
            .single()

          if (createSubError) {
            console.error('Error creating subscription:', createSubError)
            return NextResponse.json({ error: 'Failed to create subscription' }, { status: 500 })
          }

          subscription = newSubscription
        }

        // Create session
        const sessionId = Math.random().toString(36).substring(2)
        const session = {
          user,
          subscription,
          expires: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
        }
        sessions.set(sessionId, session)

        const response = NextResponse.json({ 
          success: true,
          user, 
          subscription 
        })
        
        // Set session cookie
        response.cookies.set('session-id', sessionId, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 24 * 60 * 60 // 24 hours
        })

        return response
      }
      
      return NextResponse.json({ error: 'Only Google and GitHub sign-in supported' }, { status: 400 })
    }

    if (action === 'signout') {
      const sessionId = request.cookies.get('session-id')?.value
      
      if (sessionId) {
        sessions.delete(sessionId)
      }

      const response = NextResponse.json({ success: true })
      response.cookies.delete('session-id')
      
      return response
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('Auth error:', error)
    return NextResponse.json({ error: 'Auth failed' }, { status: 500 })
  }
} 