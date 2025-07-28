import { NextRequest, NextResponse } from 'next/server'
import { requireRole, getOptionalUser, createErrorResponse } from '@/lib/rbac-middleware'
import { supabase } from '@/lib/supabase-db'
import { aiService } from '@/lib/ai-service'
import { z } from 'zod'

// Validation schema for starting interview
const startInterviewSchema = z.object({
  candidate_name: z.string().min(2, 'Candidate name must be at least 2 characters'),
  position: z.string().min(1, 'Position is required'),
  system_check: z.boolean().default(false)
})

// Validation schema for submitting answer
const submitAnswerSchema = z.object({
  interview_id: z.string().uuid('Invalid interview ID'),
  answer: z.string().min(1, 'Answer is required'),
  emotion_data: z.any().optional(),
  cheating_detection: z.any().optional()
})

// POST /api/candidate/interview - Start new interview
export async function POST(req: NextRequest) {
  try {
    // Verify candidate role
    const user = await requireRole(req, 'candidate')
    
    const body = await req.json()
    
    // Validate request body
    const validatedData = startInterviewSchema.parse(body)
    
    // Check if user has remaining interviews
    const { data: subscription, error: subError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single()

    if (subError || !subscription) {
      return NextResponse.json({
        success: false,
        error: 'No active subscription found'
      }, { status: 403 })
    }

    if (subscription.interviews_remaining <= 0) {
      return NextResponse.json({
        success: false,
        error: 'No interviews remaining in your subscription'
      }, { status: 403 })
    }

    // Create interview
    const { data: interview, error: interviewError } = await supabase
      .from('interviews')
      .insert([{
        user_id: user.id,
        candidate_name: validatedData.candidate_name,
        position: validatedData.position,
        status: 'pending',
        system_check: validatedData.system_check
      }])
      .select()
      .single()

    if (interviewError) {
      console.error('Error creating interview:', interviewError)
      return NextResponse.json({
        success: false,
        error: 'Failed to create interview'
      }, { status: 500 })
    }

    // Decrement interviews remaining
    await supabase
      .from('subscriptions')
      .update({ interviews_remaining: subscription.interviews_remaining - 1 })
      .eq('id', subscription.id)

    // Generate first AI question
    const aiResponse = await aiService.generateInterviewQuestion({
      position: validatedData.position,
      candidate_name: validatedData.candidate_name,
      previous_questions: [],
      current_question_index: 0
    })

    // Add AI message to interview
    await supabase
      .from('messages')
      .insert([{
        interview_id: interview.id,
        role: 'assistant',
        content: aiResponse.question
      }])

    return NextResponse.json({
      success: true,
      message: 'Interview started successfully',
      data: {
        interview,
        current_question: aiResponse.question,
        interviews_remaining: subscription.interviews_remaining - 1
      }
    })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        error: 'Validation failed',
        details: error.errors
      }, { status: 400 })
    }

    if (error instanceof Error) {
      if (error.message.includes('Unauthorized') || error.message.includes('Forbidden')) {
        return createErrorResponse(error.message, 403)
      }
    }

    console.error('Candidate interview POST error:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 })
  }
}

// GET /api/candidate/interview - Get interview details
export async function GET(req: NextRequest) {
  try {
    // Verify candidate role
    const user = await requireRole(req, 'candidate')
    
    const { searchParams } = new URL(req.url)
    const interviewId = searchParams.get('id')

    if (!interviewId) {
      return NextResponse.json({
        success: false,
        error: 'Interview ID is required'
      }, { status: 400 })
    }

    // Get interview details
    const { data: interview, error: interviewError } = await supabase
      .from('interviews')
      .select('*')
      .eq('id', interviewId)
      .eq('user_id', user.id)
      .single()

    if (interviewError) {
      if (interviewError.code === 'PGRST116') {
        return NextResponse.json({
          success: false,
          error: 'Interview not found'
        }, { status: 404 })
      }
      
      console.error('Error fetching interview:', interviewError)
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch interview'
      }, { status: 500 })
    }

    // Get interview messages
    const { data: messages, error: messagesError } = await supabase
      .from('messages')
      .select('*')
      .eq('interview_id', interviewId)
      .order('timestamp', { ascending: true })

    if (messagesError) {
      console.error('Error fetching messages:', messagesError)
    }

    return NextResponse.json({
      success: true,
      data: {
        interview,
        messages: messages || []
      }
    })

  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes('Unauthorized') || error.message.includes('Forbidden')) {
        return createErrorResponse(error.message, 403)
      }
    }

    console.error('Candidate interview GET error:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 })
  }
}

// PUT /api/candidate/interview - Submit answer and get next question
export async function PUT(req: NextRequest) {
  try {
    // Verify candidate role
    const user = await requireRole(req, 'candidate')
    
    const body = await req.json()
    
    // Validate request body
    const validatedData = submitAnswerSchema.parse(body)
    
    // Get interview
    const { data: interview, error: interviewError } = await supabase
      .from('interviews')
      .select('*')
      .eq('id', validatedData.interview_id)
      .eq('user_id', user.id)
      .single()

    if (interviewError || !interview) {
      return NextResponse.json({
        success: false,
        error: 'Interview not found'
      }, { status: 404 })
    }

    if (interview.status === 'completed') {
      return NextResponse.json({
        success: false,
        error: 'Interview is already completed'
      }, { status: 400 })
    }

    // Add user answer to messages
    await supabase
      .from('messages')
      .insert([{
        interview_id: validatedData.interview_id,
        role: 'user',
        content: validatedData.answer
      }])

    // Get all messages for context
    const { data: messages } = await supabase
      .from('messages')
      .select('*')
      .eq('interview_id', validatedData.interview_id)
      .order('timestamp', { ascending: true })

    // Analyze the answer
    const analysis = await aiService.analyzeResponse(
      validatedData.answer,
      {
        position: interview.position,
        candidate_name: interview.candidate_name,
        previous_questions: messages?.filter(m => m.role === 'assistant').map(m => m.content) || [],
        current_question_index: messages?.filter(m => m.role === 'assistant').length || 0
      }
    )

    // Update interview with emotion and cheating data
    const updateData: any = {
      status: 'in_progress'
    }

    if (validatedData.emotion_data) {
      updateData.emotion_data = validatedData.emotion_data
    }

    if (validatedData.cheating_detection) {
      updateData.cheating_detection = validatedData.cheating_detection
    }

    await supabase
      .from('interviews')
      .update(updateData)
      .eq('id', validatedData.interview_id)

    // Generate next question or complete interview
    const questionCount = messages?.filter(m => m.role === 'assistant').length || 0
    const maxQuestions = 5 // Configurable

    if (questionCount >= maxQuestions) {
      // Complete interview
      const summary = await aiService.generateInterviewSummary({
        position: interview.position,
        candidate_name: interview.candidate_name,
        questions: messages?.filter(m => m.role === 'assistant').map(m => m.content) || [],
        answers: messages?.filter(m => m.role === 'user').map(m => m.content) || [],
        analysis: analysis
      })

      await supabase
        .from('interviews')
        .update({
          status: 'completed',
          ai_feedback: summary.summary,
          score: analysis.score,
          duration: Math.floor((Date.now() - new Date(interview.created_at).getTime()) / 1000)
        })
        .eq('id', validatedData.interview_id)

      return NextResponse.json({
        success: true,
        message: 'Interview completed',
        data: {
          status: 'completed',
          summary: summary.summary,
          score: analysis.score,
          feedback: analysis.feedback
        }
      })
    } else {
      // Generate next question
      const nextQuestion = await aiService.generateInterviewQuestion({
        position: interview.position,
        candidate_name: interview.candidate_name,
        previous_questions: messages?.filter(m => m.role === 'assistant').map(m => m.content) || [],
        current_question_index: questionCount
      })

      // Add AI question to messages
      await supabase
        .from('messages')
        .insert([{
          interview_id: validatedData.interview_id,
          role: 'assistant',
          content: nextQuestion.question
        }])

      return NextResponse.json({
        success: true,
        message: 'Answer submitted successfully',
        data: {
          status: 'in_progress',
          next_question: nextQuestion.question,
          analysis: analysis
        }
      })
    }

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        error: 'Validation failed',
        details: error.errors
      }, { status: 400 })
    }

    if (error instanceof Error) {
      if (error.message.includes('Unauthorized') || error.message.includes('Forbidden')) {
        return createErrorResponse(error.message, 403)
      }
    }

    console.error('Candidate interview PUT error:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 })
  }
} 