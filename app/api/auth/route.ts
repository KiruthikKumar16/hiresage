import { NextRequest, NextResponse } from 'next/server'
import { authService, userService } from '@/lib/supabase-db'

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
      credentials: {
        id: 'credentials',
        name: 'Credentials',
        type: 'credentials'
      },
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
  const { searchParams } = new URL(request.url)
  const action = searchParams.get('action')

  if (action === 'signin') {
    const body = await request.json()
    const { email, password, provider } = body

    // Handle OAuth providers
    if (provider === 'google' || provider === 'github') {
      try {
        // For OAuth, we'll create a user if they don't exist
        let user = await userService.getUserByEmail(email || `${provider}@example.com`)
        
        if (!user) {
          // Create user for OAuth login
          user = await userService.createUser({
            name: `${provider} User`,
            email: email || `${provider}@example.com`,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })

          // Create a free trial subscription for OAuth users
          await authService.createAccount({
            name: `${provider} User`,
            email: email || `${provider}@example.com`
          }, 'free-trial')
        }

        // Get subscription
        const subscription = await authService.getActiveSubscription(user.id)

        // Create session
        const sessionId = Math.random().toString(36).substring(7)
        const session = {
          user,
          subscription,
          expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
        }

        sessions.set(sessionId, session)

        const response = NextResponse.json({ 
          user,
          subscription,
          sessionId 
        })

        response.cookies.set('session-id', sessionId, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 24 * 60 * 60 // 24 hours
        })

        return response
      } catch (error) {
        console.error('OAuth authentication error:', error)
        return NextResponse.json({ error: 'OAuth authentication failed' }, { status: 500 })
      }
    }

    // Handle credentials
    if (!email || !password) {
      return NextResponse.json({ error: 'Missing credentials' }, { status: 400 })
    }

    try {
      // Authenticate user with database
      const authResult = await authService.authenticateUser(email, password)
      
      if (!authResult) {
        return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
      }

      const { user, subscription } = authResult

      // Create session
      const sessionId = Math.random().toString(36).substring(7)
      const session = {
        user,
        subscription,
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
      }

      sessions.set(sessionId, session)

      const response = NextResponse.json({ 
        user,
        subscription,
        sessionId 
      })

      // Set session cookie
      response.cookies.set('session-id', sessionId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 24 * 60 * 60 // 24 hours
      })

      return response
    } catch (error) {
      console.error('Authentication error:', error)
      return NextResponse.json({ error: 'Authentication failed' }, { status: 500 })
    }
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
} 