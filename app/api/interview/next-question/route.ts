import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { enhancedAIService, interviewService } from '@/lib/supabase-db-enhanced'
import { withRBAC, RBAC_CONFIGS } from '@/lib/rbac-middleware'

const nextQuestionSchema = z.object({
  interviewId: z.string(),
  sessionId: z.string(),
  previousQuestion: z.string(),
  response: z.string(),
  analysis: z.record(z.any())
})

export const POST = withRBAC(RBAC_CONFIGS.ANY_AUTHENTICATED)(
  async (request: NextRequest, user: any) => {
    try {
      const body = await request.json()
      const validatedData = nextQuestionSchema.parse(body)

      // Verify interview belongs to user
      const interview = await interviewService.getInterviewById(validatedData.interviewId)
      if (!interview || interview.user_id !== user.id) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'Interview not found or access denied' 
          },
          { status: 404 }
        )
      }

      // Check if interview should continue (max 5 questions)
      const currentQuestionIndex = interview.question_index || 0
      if (currentQuestionIndex >= 4) { // 0-4 = 5 questions total
        return NextResponse.json({
          success: true,
          data: {
            interviewComplete: true,
            message: 'Interview completed - maximum questions reached'
          }
        })
      }

      // Generate next question based on previous response and analysis
      const nextQuestion = await enhancedAIService.generateInterviewQuestion(
        'Follow-up based on previous response',
        [validatedData.previousQuestion],
        { name: interview.candidate_name },
        interview.position,
        validatedData.analysis
      )

      // Update interview with new question
      await interviewService.updateInterview(validatedData.interviewId, {
        current_question: nextQuestion.question,
        question_index: currentQuestionIndex + 1,
        last_question_time: new Date().toISOString()
      })

      return NextResponse.json({
        success: true,
        data: {
          nextQuestion: nextQuestion.question,
          category: nextQuestion.category,
          difficulty: nextQuestion.difficulty,
          timeLimit: nextQuestion.timeLimit,
          questionIndex: currentQuestionIndex + 1
        }
      })

    } catch (error) {
      console.error('Next question error:', error)
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to generate next question' 
        },
        { status: 500 }
      )
    }
  }
)