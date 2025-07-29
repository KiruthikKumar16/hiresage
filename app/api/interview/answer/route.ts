import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { messageService, interviewService } from '@/lib/supabase-db-enhanced'
import { withRBAC, RBAC_CONFIGS } from '@/lib/rbac-middleware'

const submitAnswerSchema = z.object({
  interviewId: z.string(),
  sessionId: z.string(),
  content: z.string(),
  emotionData: z.record(z.any()).optional(),
  confidenceScore: z.number().optional(),
  cheatingFlags: z.array(z.any()).optional()
})

export const POST = withRBAC(RBAC_CONFIGS.ANY_AUTHENTICATED)(
  async (request: NextRequest, user: any) => {
    try {
      const body = await request.json()
      const validatedData = submitAnswerSchema.parse(body)

      // Verify session belongs to user
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

      // Add message to interview
      const messageData = {
        interview_id: validatedData.interviewId,
        session_id: validatedData.sessionId,
        sender_type: 'candidate',
        content: validatedData.content,
        message_type: 'answer',
        metadata: {
          emotionData: validatedData.emotionData || {},
          confidenceScore: validatedData.confidenceScore || 0,
          cheatingFlags: validatedData.cheatingFlags || [],
          timestamp: new Date().toISOString()
        }
      }

      const message = await messageService.addMessage(messageData)

      // Update interview with answer data
      await interviewService.updateInterview(validatedData.interviewId, {
        last_answer: validatedData.content,
        last_answer_time: new Date().toISOString(),
        cheating_flags: validatedData.cheatingFlags || []
      })

      return NextResponse.json({
        success: true,
        data: {
          messageId: message.id,
          timestamp: message.created_at
        }
      })

    } catch (error) {
      console.error('Submit answer error:', error)
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to submit answer' 
        },
        { status: 500 }
      )
    }
  }
)