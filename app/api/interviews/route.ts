import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'

// Interview validation schema
const interviewSchema = z.object({
  candidateId: z.string().min(1, 'Candidate ID is required'),
  candidateName: z.string().min(1, 'Candidate name is required'),
  position: z.string().min(1, 'Position is required'),
  status: z.enum(['scheduled', 'in-progress', 'completed', 'cancelled']).default('scheduled'),
  questions: z.array(z.object({
    id: z.string(),
    question: z.string(),
    category: z.string(),
    weight: z.number().min(0).max(10),
    answered: z.boolean().default(false),
    score: z.number().min(0).max(10).optional(),
  })).optional(),
  messages: z.array(z.object({
    id: z.string(),
    type: z.enum(['ai', 'user']),
    content: z.string(),
    timestamp: z.date(),
  })).optional(),
})

export async function GET() {
  try {
    const interviews = await db.getInterviews()
    return NextResponse.json({
      success: true,
      data: interviews
    })
  } catch (error) {
    console.error('Error fetching interviews:', error)
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch interviews'
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate the request body
    const validatedData = interviewSchema.parse(body)
    
    // Save to database
    const interview = await db.createInterview({
      ...validatedData,
      questions: validatedData.questions || [],
      messages: validatedData.messages || [],
    })
    
    console.log('Interview created:', interview.id)
    
    return NextResponse.json({
      success: true,
      message: 'Interview created successfully!',
      data: interview
    })
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        message: 'Please check your information and try again',
        errors: error.errors
      }, { status: 400 })
    }
    
    console.error('Interview creation error:', error)
    return NextResponse.json({
      success: false,
      message: 'Something went wrong. Please try again.'
    }, { status: 500 })
  }
} 