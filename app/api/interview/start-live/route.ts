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
      const body = await request.json()
      const validatedData = startLiveInterviewSchema.parse(body)

      // Check if user has remaining interviews
      const subscription = await subscriptionService.getActiveSubscription(user.id)
      if (!subscription || subscription.interviews_remaining <= 0) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'No interviews remaining. Please upgrade your subscription.' 
          },
          { status: 403 }
        )
      }

      // Create interview session
      const interviewData = {
        user_id: user.id,
        candidate_name: validatedData.candidateName,
        position: 'General Interview',
        status: 'in_progress',
        start_time: new Date().toISOString(),
        settings: validatedData.settings
      }

      const interview = await interviewService.createInterview(interviewData)

      // Create session
      const sessionToken = Math.random().toString(36).substring(2)
      const sessionData = {
        interview_id: interview.id,
        session_token: sessionToken,
        status: 'active',
        created_at: new Date().toISOString()
      }

      const session = await sessionService.createSession(sessionData)

      // Generate first question using AI
      const firstQuestion = await enhancedAIService.generateInterviewQuestion(
        'General interview context',
        [],
        { name: validatedData.candidateName },
        'General'
      )

      // Update interview with first question
      await interviewService.updateInterview(interview.id, {
        current_question: firstQuestion.question,
        question_index: 0
      })

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
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to start interview session' 
        },
        { status: 500 }
      )
    }
  }
)