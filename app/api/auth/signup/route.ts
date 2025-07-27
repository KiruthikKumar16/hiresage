import { NextRequest, NextResponse } from 'next/server'
import { authService, userService } from '@/lib/supabase-db'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, company, phone, website, planId, paymentMethod } = body

    // Validate required fields
    if (!name || !email || !planId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Check if user already exists
    const existingUser = await userService.getUserByEmail(email)
    if (existingUser) {
      return NextResponse.json({ error: 'User already exists with this email' }, { status: 409 })
    }

    // Create user account with subscription
    const { user, subscription } = await authService.createAccount({
      name,
      email,
      company,
      phone,
      website
    }, planId)

    return NextResponse.json({
      success: true,
      user,
      subscription,
      message: 'Account created successfully'
    })

  } catch (error) {
    console.error('Signup error:', error)
    return NextResponse.json({ 
      error: 'Failed to create account. Please try again.' 
    }, { status: 500 })
  }
} 