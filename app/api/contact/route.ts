import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'

// Contact form validation schema
const contactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email'),
  company: z.string().optional(),
  message: z.string().min(10, 'Message must be at least 10 characters'),
  plan: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate the request body
    const validatedData = contactSchema.parse(body)
    
    // Save to database
    const contact = await db.createContact(validatedData)
    
    // Simulate email sending
    await simulateEmailSending(validatedData)
    
    console.log('Contact form submission saved:', contact.id)
    
    return NextResponse.json({
      success: true,
      message: 'Thank you for your message! We\'ll get back to you soon.'
    })
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        message: 'Validation failed',
        errors: error.errors
      }, { status: 400 })
    }
    
    console.error('Contact form error:', error)
    return NextResponse.json({
      success: false,
      message: 'Something went wrong. Please try again.'
    }, { status: 500 })
  }
}

async function simulateEmailSending(data: any) {
  // Simulate email sending delay
  await new Promise(resolve => setTimeout(resolve, 1000))
  console.log('Email sent to:', data.email)
  console.log('Notification sent to team about new inquiry from:', data.name)
} 