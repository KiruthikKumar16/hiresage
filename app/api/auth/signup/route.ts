import { NextRequest, NextResponse } from 'next/server'
import { authService, userService } from '@/lib/supabase-db'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, company, phone, website, planId, paymentMethod } = body

    console.log('Signup request:', { name, email, planId })

    // Validate required fields
    if (!name || !email || !planId) {
      console.log('Missing required fields:', { name, email, planId })
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Check if user already exists
    try {
      const existingUser = await userService.getUserByEmail(email)
      if (existingUser) {
        console.log('User already exists:', email)
        return NextResponse.json({ error: 'User already exists with this email' }, { status: 409 })
      }
    } catch (error) {
      console.log('Error checking existing user:', error)
      // Continue with signup even if check fails
    }

    console.log('Creating user account...')
    
    try {
      // Create user account with subscription
      const { user, subscription } = await authService.createAccount({
        name,
        email,
        company,
        phone,
        website
      }, planId)

      console.log('Account created successfully:', { userId: user.id, subscriptionId: subscription.id })

      return NextResponse.json({
        success: true,
        user,
        subscription,
        message: 'Account created successfully'
      })
    } catch (dbError) {
      console.error('Database signup failed, creating demo account:', dbError)
      
      // Fallback: Create demo account without database
      const demoUser = {
        id: `demo-${Date.now()}`,
        email,
        name,
        company,
        phone,
        website,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      const demoSubscription = {
        id: `demo-sub-${Date.now()}`,
        user_id: demoUser.id,
        plan_id: planId,
        plan_name: planId === 'free-trial' ? 'Free Trial' : 'Demo Plan',
        interviews_remaining: planId === 'free-trial' ? 1 : 10,
        total_interviews: planId === 'free-trial' ? 1 : 10,
        price_per_interview: 0,
        status: 'active',
        payment_status: 'completed',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      console.log('Demo account created:', { userId: demoUser.id })

      return NextResponse.json({
        success: true,
        user: demoUser,
        subscription: demoSubscription,
        message: 'Demo account created successfully'
      })
    }

  } catch (error) {
    console.error('Signup error details:', error)
    
    // Return more specific error messages
    if (error instanceof Error) {
      if (error.message.includes('Invalid plan')) {
        return NextResponse.json({ error: 'Invalid plan selected' }, { status: 400 })
      }
      if (error.message.includes('duplicate key')) {
        return NextResponse.json({ error: 'User already exists with this email' }, { status: 409 })
      }
    }
    
    return NextResponse.json({ 
      error: 'Failed to create account. Please try again.' 
    }, { status: 500 })
  }
} 