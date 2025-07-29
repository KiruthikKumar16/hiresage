import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { interviewService, sessionService, subscriptionService, enhancedAIService } from '@/lib/supabase-db-enhanced'
import { withRBAC, RBAC_CONFIGS } from '@/lib/rbac-middleware'

const startLiveInterviewSchema = z.object({
  userId: z.string(),
  candidateName: z.string(),
  settings: z.object({
    enableVideo: z.boolean().default(true),
    enableAudio: z.boolean().default(true),
    questionTimeLimit: z.number().default(120)
  })
})

export const POST = withRBAC(RBAC_CONFIGS.ANY_AUTHENTICATED)(
  async (request: NextRequest, user: any) => {
    try {
      console.log('Starting live interview for user:', user.id)
      
      const body = await request.json()
      console.log('Request body:', body)
      
      const validatedData = startLiveInterviewSchema.parse(body)
      console.log('Validated data:', validatedData)

      // Check if user has remaining interviews
      console.log('Checking subscription for user:', user.id)
      const subscription = await subscriptionService.getActiveSubscription(user.id)
      console.log('Subscription found:', !!subscription, 'remaining:', subscription?.interviews_remaining)
      
      if (!subscription || subscription.interviews_remaining <= 0) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'No interviews remaining. Please upgrade your subscription.' 
          },
          { status: 403 }
        )
      }

      // Create interview session (without start_time to let database handle defaults)
      console.log('Creating interview with data:', {
        user_id: user.id,
        candidate_name: validatedData.candidateName,
        position: 'General Interview',
        status: 'in_progress'
      })
      
      const interviewData = {
        user_id: user.id,
        candidate_name: validatedData.candidateName,
        position: 'General Interview',
        status: 'in_progress'
      }

      const interview = await interviewService.createInterview(interviewData)
      console.log('Interview created:', interview.id)

      // Create session with settings
      const sessionToken = Math.random().toString(36).substring(2)
      console.log('Creating session with token:', sessionToken)
      
      const sessionData = {
        interview_id: interview.id,
        session_token: sessionToken,
        status: 'active',
        settings: validatedData.settings
      }
      console.log('Session data:', sessionData)

      const session = await sessionService.createSession(sessionData)
      console.log('Session created:', session.id)

      // Generate first question using AI
      console.log('Generating first question...')
      const firstQuestion = await enhancedAIService.generateInterviewQuestion(
        'General interview context',
        [],
        { name: validatedData.candidateName },
        'General'
      )
      console.log('First question generated:', firstQuestion.question)

      // Update session with first question (not interview)
      console.log('Updating session with first question...')
      await sessionService.updateSession(session.id, {
        current_question_index: 0,
        total_questions: 5 // Default to 5 questions
      })
      console.log('Session updated successfully')

      return NextResponse.json({
        success: true,
        data: {
          interviewId: interview.id,
          sessionToken: sessionToken,
          sessionId: session.id,
          settings: validatedData.settings,
          firstQuestion: {
            question: firstQuestion.question,
            category: firstQuestion.category,
            difficulty: firstQuestion.difficulty,
            timeLimit: firstQuestion.timeLimit
          }
        }
      })

    } catch (error) {
      console.error('Start live interview error:', error)
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      })
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to start interview session',
          details: error.message
        },
        { status: 500 }
      )
    }
  }
)