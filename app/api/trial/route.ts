import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'

// Trial signup validation schema
const trialSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email'),
  company: z.string().optional(),
  plan: z.string().optional(),
  useCase: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate the request body
    const validatedData = trialSchema.parse(body)
    
    // Generate trial ID
    const trialId = generateTrialId()
    
    // Save to database
    const trial = await db.createTrial({
      ...validatedData,
      trialId,
    })
    
    // Simulate account creation and email sending
    await simulateTrialSetup(validatedData, trialId)
    
    console.log('Trial signup saved:', trial.id)
    
    return NextResponse.json({
      success: true,
      message: 'Trial account created successfully! Check your email for login details.',
      trialId
    })
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        message: 'Please check your information and try again',
        errors: error.errors
      }, { status: 400 })
    }
    
    console.error('Trial signup error:', error)
    return NextResponse.json({
      success: false,
      message: 'Something went wrong. Please try again.'
    }, { status: 500 })
  }
}

async function simulateTrialSetup(data: any, trialId: string) {
  // Simulate account creation and email sending
  await new Promise(resolve => setTimeout(resolve, 1500))
  console.log('Trial account created for:', data.email, 'with ID:', trialId)
  console.log('Welcome email sent with trial credentials')
  console.log('Trial environment set up for:', data.company || 'Individual')
}

function generateTrialId() {
  return 'trial_' + Math.random().toString(36).substr(2, 9)
} 