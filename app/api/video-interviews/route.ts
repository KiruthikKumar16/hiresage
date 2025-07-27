import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'

// Video interview validation schema
const videoInterviewSchema = z.object({
  candidateId: z.string().optional(),
  status: z.enum(['scheduled', 'in-progress', 'completed', 'cancelled']),
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

export async function GET() {
  try {
    const videoInterviews = await db.getVideoInterviews()
    
    return NextResponse.json({
      success: true,
      data: videoInterviews
    })
  } catch (error) {
    console.error('Error fetching video interviews:', error)
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch video interviews'
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate the request body
    const validatedData = videoInterviewSchema.parse(body)
    
    // Convert date strings to Date objects if provided
    const interviewData = { ...validatedData }
    if (validatedData.startedAt) {
      interviewData.startedAt = new Date(validatedData.startedAt)
    }
    if (validatedData.completedAt) {
      interviewData.completedAt = new Date(validatedData.completedAt)
    }
    
    // Convert real-time analysis timestamps
    if (validatedData.realTimeAnalysis) {
      interviewData.realTimeAnalysis = validatedData.realTimeAnalysis.map(analysis => ({
        ...analysis,
        timestamp: new Date(analysis.timestamp)
      }))
    }
    
    // Create video interview
    const videoInterview = await db.createVideoInterview(interviewData)
    
    console.log('Video interview created:', videoInterview.id)
    
    return NextResponse.json({
      success: true,
      message: 'Video interview created successfully!',
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
    
    console.error('Video interview creation error:', error)
    return NextResponse.json({
      success: false,
      message: 'Something went wrong. Please try again.'
    }, { status: 500 })
  }
} 