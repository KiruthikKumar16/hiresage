import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'

// Interview update validation schema
const interviewUpdateSchema = z.object({
  status: z.enum(['scheduled', 'in-progress', 'completed', 'cancelled']).optional(),
  score: z.number().min(0).max(10).optional(),
  duration: z.number().min(0).optional(),
  startedAt: z.string().optional(),
  completedAt: z.string().optional(),
  questions: z.array(z.object({
    id: z.string(),
    question: z.string(),
    category: z.string(),
    weight: z.number().min(0).max(10),
    answered: z.boolean(),
    score: z.number().min(0).max(10).optional(),
  })).optional(),
})

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const interview = await db.getInterviewById(id)
    
    if (!interview) {
      return NextResponse.json({
        success: false,
        message: 'Interview not found'
      }, { status: 404 })
    }
    
    return NextResponse.json({
      success: true,
      data: interview
    })
  } catch (error) {
    console.error('Error fetching interview:', error)
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch interview'
    }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    
    // Validate the request body
    const validatedData = interviewUpdateSchema.parse(body)
    
    // Convert date strings to Date objects if provided
    const updateData = { ...validatedData }
    if (validatedData.startedAt) {
      updateData.startedAt = new Date(validatedData.startedAt)
    }
    if (validatedData.completedAt) {
      updateData.completedAt = new Date(validatedData.completedAt)
    }
    
    // Update interview
    const interview = await db.updateInterview(id, updateData)
    
    if (!interview) {
      return NextResponse.json({
        success: false,
        message: 'Interview not found'
      }, { status: 404 })
    }
    
    console.log('Interview updated:', interview.id)
    
    return NextResponse.json({
      success: true,
      message: 'Interview updated successfully!',
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
    
    console.error('Interview update error:', error)
    return NextResponse.json({
      success: false,
      message: 'Something went wrong. Please try again.'
    }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    // For interviews, we'll just mark them as cancelled instead of deleting
    const interview = await db.updateInterview(id, { status: 'cancelled' })
    
    if (!interview) {
      return NextResponse.json({
        success: false,
        message: 'Interview not found'
      }, { status: 404 })
    }
    
    console.log('Interview cancelled:', id)
    
    return NextResponse.json({
      success: true,
      message: 'Interview cancelled successfully!'
    })
    
  } catch (error) {
    console.error('Interview cancellation error:', error)
    return NextResponse.json({
      success: false,
      message: 'Something went wrong. Please try again.'
    }, { status: 500 })
  }
} 