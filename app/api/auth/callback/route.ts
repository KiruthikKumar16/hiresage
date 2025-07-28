import { NextRequest, NextResponse } from 'next/server'
import { userService, authService } from '@/lib/supabase-db'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { code, provider, redirect_uri } = body

    if (!code || !provider) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 })
    }

    let userInfo: { email: string; name: string; avatar?: string } | null = null

    if (provider === 'google') {
      // Exchange code for Google access token
      const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          code,
          client_id: process.env.GOOGLE_CLIENT_ID!,
          client_secret: process.env.GOOGLE_CLIENT_SECRET!,
          redirect_uri,
          grant_type: 'authorization_code',
        }),
      })

      const tokenData = await tokenResponse.json()

      if (!tokenResponse.ok) {
        console.error('Google token error:', tokenData)
        return NextResponse.json({ error: 'Failed to exchange code for token' }, { status: 400 })
      }

      // Get user info from Google
      const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`,
        },
      })

      const googleUser = await userResponse.json()
      userInfo = {
        email: googleUser.email,
        name: googleUser.name,
        avatar: googleUser.picture,
      }
    } else if (provider === 'github') {
      // Exchange code for GitHub access token
      const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          client_id: process.env.GITHUB_ID,
          client_secret: process.env.GITHUB_SECRET,
          code,
          redirect_uri,
        }),
      })

      const tokenData = await tokenResponse.json()

      if (!tokenResponse.ok || tokenData.error) {
        console.error('GitHub token error:', tokenData)
        return NextResponse.json({ error: 'Failed to exchange code for token' }, { status: 400 })
      }

      // Get user info from GitHub
      const userResponse = await fetch('https://api.github.com/user', {
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`,
          Accept: 'application/vnd.github.v3+json',
        },
      })

      const githubUser = await userResponse.json()
      userInfo = {
        email: githubUser.email || `${githubUser.login}@users.noreply.github.com`,
        name: githubUser.name || githubUser.login,
        avatar: githubUser.avatar_url,
      }
    } else {
      return NextResponse.json({ error: 'Unsupported provider' }, { status: 400 })
    }

    if (!userInfo) {
      return NextResponse.json({ error: 'Failed to get user information' }, { status: 400 })
    }

    // Check if user exists, create if not
    let user = await userService.getUserByEmail(userInfo.email)
    if (!user) {
      user = await userService.createUser({
        name: userInfo.name,
        email: userInfo.email,
        avatar: userInfo.avatar || '',
        provider
      })
    }

    // Get or create subscription
    let subscription = await authService.getOrCreateFreeTrialSubscription(user.id)

    // Create session
    const sessionId = Math.random().toString(36).substring(2)
    const session = { 
      user, 
      subscription, 
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000) 
    }
    
    // Store session (in production, use Redis or database)
    const sessions = new Map()
    sessions.set(sessionId, session)

    const response = NextResponse.json({ 
      success: true, 
      user, 
      subscription 
    })
    
    response.cookies.set('session-id', sessionId, { 
      httpOnly: true, 
      secure: process.env.NODE_ENV === 'production', 
      sameSite: 'lax', 
      maxAge: 24 * 60 * 60 
    })
    
    return response

  } catch (error) {
    console.error('OAuth callback error:', error)
    return NextResponse.json({ error: 'Authentication failed' }, { status: 500 })
  }
} 