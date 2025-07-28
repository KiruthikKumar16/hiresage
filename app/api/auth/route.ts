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
  try {
    const body = await request.json()
    const { action, provider, email, name, avatar } = body

    if (action === 'signin') {
      if (provider === 'google' || provider === 'github') {
        // Try to find user by email
        let user = await userService.getUserByEmail(email)
        if (!user) {
          // Create user if not exists
          user = await userService.createUser({
            name: name || '',
            email,
            avatar: avatar || '',
            provider
          })
        }
        // Create/fetch subscription
        let subscription = await authService.getOrCreateFreeTrialSubscription(user.id)
        // Return session info
        return NextResponse.json({ user, subscription })
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