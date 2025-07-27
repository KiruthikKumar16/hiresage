import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'

// Video interview update validation schema
const videoInterviewUpdateSchema = z.object({
  status: z.enum(['scheduled', 'in-progress', 'completed', 'cancelled']).optional(),
  startedAt: z.string().optional(),
  completedAt: z.string().optional(),
  duration: z.number().min(0).optional(),
  emotionAnalysis: z.object({
    overallMood: z.string(),
    confidenceLevel: z.number(),
    stressLevel: z.number(),
    engagementLevel: z.number(),
    deceptionIndicators: z.array(z.string())
  }).optional(),
  cheatingDetection: z.object({
    multipleFaces: z.boolean(),
    screenSharing: z.boolean(),
    backgroundNoise: z.boolean(),
    unusualMovements: z.boolean(),
    suspiciousBehavior: z.array(z.string())
  }).optional(),
  realTimeAnalysis: z.array(z.object({
    speechToText: z.string(),
    currentEmotion: z.string(),
    confidenceScore: z.number(),
    deceptionScore: z.number(),
    timestamp: z.string()
  })).optional(),
  aiResponse: z.object({
    nextQuestion: z.string(),
    followUp: z.string(),
    audioUrl: z.string(),
    emotion: z.string(),
    confidence: z.number()
  }).optional(),
  transcript: z.string().optional()
})

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const videoInterview = await db.getVideoInterviewById(id)
    
    if (!videoInterview) {
      return NextResponse.json({
        success: false,
        message: 'Video interview not found'
      }, { status: 404 })
    }
    
    return NextResponse.json({
      success: true,
      data: videoInterview
    })
  } catch (error) {
    console.error('Error fetching video interview:', error)
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch video interview'
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
    const validatedData = videoInterviewUpdateSchema.parse(body)
    
    // Convert date strings to Date objects if provided
    const updateData = { ...validatedData }
    if (validatedData.startedAt) {
      updateData.startedAt = new Date(validatedData.startedAt)
    }
    if (validatedData.completedAt) {
      updateData.completedAt = new Date(validatedData.completedAt)
    }
    
    // Convert real-time analysis timestamps
    if (validatedData.realTimeAnalysis) {
      updateData.realTimeAnalysis = validatedData.realTimeAnalysis.map(analysis => ({
        ...analysis,
        timestamp: new Date(analysis.timestamp)
      }))
    }
    
    // Update video interview
    const videoInterview = await db.updateVideoInterview(id, updateData)
    
    if (!videoInterview) {
      return NextResponse.json({
        success: false,
        message: 'Video interview not found'
      }, { status: 404 })
    }
    
    console.log('Video interview updated:', videoInterview.id)
    
    return NextResponse.json({
      success: true,
      message: 'Video interview updated successfully!',
      data: videoInterview
    })
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        message: 'Please check your information and try again',
        errors: error.errors
      }, { status: 400 })
    }
    
    console.error('Video interview update error:', error)
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
    
    // For video interviews, we'll just mark them as cancelled instead of deleting
    const videoInterview = await db.updateVideoInterview(id, { status: 'cancelled' })
    
    if (!videoInterview) {
      return NextResponse.json({
        success: false,
        message: 'Video interview not found'
      }, { status: 404 })
    }
    
    console.log('Video interview cancelled:', id)
    
    return NextResponse.json({
      success: true,
      message: 'Video interview cancelled successfully!'
    })
    
  } catch (error) {
    console.error('Video interview cancellation error:', error)
    return NextResponse.json({
      success: false,
      message: 'Something went wrong. Please try again.'
    }, { status: 500 })
  }
} 