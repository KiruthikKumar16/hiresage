import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'

// Message validation schema
const messageSchema = z.object({
  type: z.enum(['ai', 'user']),
  content: z.string().min(1, 'Message content is required'),
})

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    
    // Validate the request body
    const validatedData = messageSchema.parse(body)
    
    // Add message to interview
    const message = await db.addInterviewMessage(id, {
      ...validatedData,
      timestamp: new Date(),
    })
    
    if (!message) {
      return NextResponse.json({
        success: false,
        message: 'Interview not found'
      }, { status: 404 })
    }
    
    console.log('Message added to interview:', id)
    
    return NextResponse.json({
      success: true,
      message: 'Message added successfully!',
      data: message
    })
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        message: 'Please check your information and try again',
        errors: error.errors
      }, { status: 400 })
    }
    
    console.error('Message addition error:', error)
    return NextResponse.json({
      success: false,
      message: 'Something went wrong. Please try again.'
    }, { status: 500 })
  }
} 