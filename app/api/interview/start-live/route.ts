import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { interviewService, sessionService, subscriptionService } from '@/lib/supabase-db-enhanced'
import { enhancedAIService } from '@/lib/ai-service-enhanced'
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
      try {
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
      } catch (subError) {
        console.error('Subscription check error:', subError)
        return NextResponse.json(
          { 
            success: false, 
            error: 'Failed to check subscription' 
          },
          { status: 500 }
        )
      }

      // Create interview session (without start_time to let database handle defaults)
      console.log('Creating interview with data:', {
        user_id: user.id,
        candidate_name: validatedData.candidateName,
        position: 'General Interview',
        status: 'in_progress'
      })
      
      let interview
      try {
        const interviewData = {
          user_id: user.id,
          candidate_name: validatedData.candidateName,
          position: 'General Interview',
          status: 'in_progress' as const,
          emotion_data: {},
          cheating_detection: {}
        }

        interview = await interviewService.createInterview(interviewData)
        console.log('Interview created:', interview.id)
      } catch (interviewError) {
        console.error('Interview creation error:', interviewError)
        return NextResponse.json(
          { 
            success: false, 
            error: 'Failed to create interview' 
          },
          { status: 500 }
        )
      }

      // Skip session creation for now - just use interview ID as session token
      const sessionToken = interview.id // Use interview ID as session token
      console.log('Using interview ID as session token:', sessionToken)

      // Generate first AI question
      console.log('Generating first question...')
      console.log('AI Service available:', !!enhancedAIService)
      console.log('Environment check - GEMINI API KEY:', !!process.env.GOOGLE_GEMINI_API_KEY)
      
      let firstQuestion
      try {
        firstQuestion = await enhancedAIService.generateInterviewQuestion(
          'Initial interview question',
          [],
          { name: validatedData.candidateName },
          'General'
        )
        console.log('AI question generated successfully')
      } catch (aiError: any) {
        console.error('Error generating interview question:', aiError)
        console.error('AI Service error:', aiError)
        console.error('AI Error details:', {
          message: aiError.message,
          stack: aiError.stack
        })
        
        // Use fallback question
        firstQuestion = {
          question: "Tell me about your experience and why you're interested in this position.",
          category: "behavioral",
          difficulty: "medium",
          timeLimit: 120,
          followUpQuestions: []
        }
        console.log('Using fallback question:', firstQuestion.question)
      }

      console.log('Interview setup completed successfully')

      return NextResponse.json({
        success: true,
        data: {
          interviewId: interview.id,
          sessionToken: sessionToken,
          sessionId: interview.id, // Use interview ID as session ID
          settings: validatedData.settings,
          firstQuestion: {
            question: firstQuestion.question,
            category: firstQuestion.category,
            difficulty: firstQuestion.difficulty,
            timeLimit: firstQuestion.timeLimit
          }
        }
      })

    } catch (error: any) {
      console.error('Start live interview error:', error)
      console.error('Error details:', {
        message: error?.message,
        stack: error?.stack,
        name: error?.name
      })
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to start interview session',
          details: error?.message
        },
        { status: 500 }
      )
    }
  }
)