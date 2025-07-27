import { NextRequest, NextResponse } from 'next/server'

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
    if (provider === 'google') {
      // For demo, create a user from Google
      const sessionId = Math.random().toString(36).substring(7)
      const user = {
        id: 'google-user',
        email: 'demo@google.com',
        name: 'Google User',
        role: 'user'
      }

      const session = {
        user,
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
      }

      sessions.set(sessionId, session)

      const response = NextResponse.json({ 
        user,
        sessionId 
      })

      response.cookies.set('session-id', sessionId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 24 * 60 * 60 // 24 hours
      })

      return response
    }

    if (provider === 'github') {
      // For demo, create a user from GitHub
      const sessionId = Math.random().toString(36).substring(7)
      const user = {
        id: 'github-user',
        email: 'demo@github.com',
        name: 'GitHub User',
        role: 'user'
      }

      const session = {
        user,
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
      }

      sessions.set(sessionId, session)

      const response = NextResponse.json({ 
        user,
        sessionId 
      })

      response.cookies.set('session-id', sessionId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 24 * 60 * 60 // 24 hours
      })

      return response
    }

    // Handle credentials
    if (!email || !password) {
      return NextResponse.json({ error: 'Missing credentials' }, { status: 400 })
    }

    // Accept any email/password combination
    const sessionId = Math.random().toString(36).substring(7)
    const user = {
      id: 'demo-user',
      email: email,
      name: email.split('@')[0],
      role: 'user'
    }

    const session = {
      user,
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
    }

    sessions.set(sessionId, session)

    const response = NextResponse.json({ 
      user,
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