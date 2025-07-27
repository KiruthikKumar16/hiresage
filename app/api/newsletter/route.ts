import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'

// Newsletter signup validation schema
const newsletterSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  name: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate the request body
    const validatedData = newsletterSchema.parse(body)
    
    // Save to database
    const newsletter = await db.createNewsletter(validatedData)
    
    // Simulate email marketing service integration
    await simulateNewsletterSignup(validatedData)
    
    console.log('Newsletter signup saved:', newsletter.id)
    
    return NextResponse.json({
      success: true,
      message: 'Successfully subscribed to our newsletter!'
    })
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        message: 'Please enter a valid email address',
        errors: error.errors
      }, { status: 400 })
    }
    
    console.error('Newsletter signup error:', error)
    return NextResponse.json({
      success: false,
      message: 'Something went wrong. Please try again.'
    }, { status: 500 })
  }
}

async function simulateNewsletterSignup(data: any) {
  // Simulate API call to email marketing service
  await new Promise(resolve => setTimeout(resolve, 500))
  console.log('Added to newsletter list:', data.email)
  console.log('Welcome email sent to:', data.email)
} 