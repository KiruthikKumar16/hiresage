import { NextRequest, NextResponse } from 'next/server'
import { interviewService, sessionService, subscriptionService } from '@/lib/supabase-db-enhanced'
import { z } from 'zod'

// Input validation schema
const startInterviewSchema = z.object({
  userId: z.string(),
  candidateName: z.string().optional(),
  position: z.string().optional(),
  questionSetId: z.string().optional(),
  batchId: z.string().optional()
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = startInterviewSchema.parse(body)

    // Check if user has remaining interviews
    const canUseInterview = await subscriptionService.useInterview(validatedData.userId)
    if (!canUseInterview) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'No interviews remaining in your subscription' 
        },
        { status: 403 }
      )
    }

    // Create interview record
    const interview = await interviewService.createInterview({
      user_id: validatedData.userId,
      candidate_name: validatedData.candidateName,
      position: validatedData.position,
      question_set_id: validatedData.questionSetId,
      batch_id: validatedData.batchId,
      status: 'in_progress',
      start_time: new Date().toISOString(),
      flagged_cheating: false,
      cheating_flags: [],
      emotion_data: {},
      result_json: {}
    })

    // Create interview session
    const sessionToken = Math.random().toString(36).substring(2) + Date.now().toString(36)
    const session = await sessionService.createSession({
      interview_id: interview.id,
      session_token: sessionToken,
      status: 'active',
      current_question_index: 0,
      total_questions: 5, // Default number of questions
      start_time: new Date().toISOString(),
      settings: {
        enableVideo: true,
        enableAudio: true,
        enableScreenShare: false,
        questionTimeLimit: 120,
        totalQuestions: 5
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        interviewId: interview.id,
        sessionToken: session.session_token,
        sessionId: session.id,
        settings: session.settings
      }
    })

  } catch (error) {
    console.error('Start interview error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to start interview' 
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const interviewId = searchParams.get('interviewId')
    const sessionToken = searchParams.get('sessionToken')

    if (!interviewId || !sessionToken) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Interview ID and session token are required' 
        },
        { status: 400 }
      )
    }

    // Get interview and session data
    const [interview, session] = await Promise.all([
      interviewService.getInterviewById(interviewId),
      sessionService.getSessionByToken(sessionToken)
    ])

    if (!interview || !session) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Interview or session not found' 
        },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        interview,
        session,
        currentQuestion: session.current_question_index,
        totalQuestions: session.total_questions
      }
    })

  } catch (error) {
    console.error('Get interview error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to get interview data' 
      },
      { status: 500 }
    )
  }
}