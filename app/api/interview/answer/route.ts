import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { interviewService, messageService } from '@/lib/supabase-db-enhanced'
import { enhancedAIService } from '@/lib/ai-service-enhanced'
import { withRBAC, RBAC_CONFIGS } from '@/lib/rbac-middleware'

const submitAnswerSchema = z.object({
  interviewId: z.string(),
  sessionId: z.string(),
  content: z.string().min(1),
  emotionData: z.any().optional()
})

export const POST = withRBAC(RBAC_CONFIGS.ANY_AUTHENTICATED)(
  async (request: NextRequest, user: any) => {
    try {
      console.log('Submit answer request from user:', user.id)
      
      const body = await request.json()
      console.log('Request body:', body)
      
      const validatedData = submitAnswerSchema.parse(body)
      console.log('Validated data:', validatedData)

      // Verify interview ownership
      const interview = await interviewService.getInterview(validatedData.interviewId)
      if (!interview || interview.user_id !== user.id) {
        return NextResponse.json(
          { success: false, error: 'Interview not found or access denied' },
          { status: 404 }
        )
      }

      // Analyze emotion using AI
      let emotionAnalysis = {}
      try {
        console.log('Analyzing emotion for answer...')
        const emotionResult = await enhancedAIService.analyzeEmotion(validatedData.content)
        emotionAnalysis = emotionResult
        console.log('Emotion analysis result:', emotionAnalysis)
      } catch (emotionError) {
        console.error('Emotion analysis failed:', emotionError)
        // Continue without emotion analysis
        emotionAnalysis = {
          primary_emotion: 'neutral',
          confidence: 0.5,
          emotions: { neutral: 0.5 }
        }
      }

      // Add message to database
      const messageData = {
        interview_id: validatedData.interviewId,
        session_id: validatedData.sessionId,
        role: 'user' as const,
        content: validatedData.content
      }

      console.log('Adding message to database:', messageData)
      const message = await messageService.createMessage(messageData)
      console.log('Message created:', message.id)

      // Update interview with transcript and AI feedback
      const updateData = {
        transcript: validatedData.content,
        ai_feedback: JSON.stringify({
          emotion_analysis: emotionAnalysis,
          timestamp: new Date().toISOString()
        })
      }

      console.log('Updating interview with data:', updateData)
      await interviewService.updateInterview(validatedData.interviewId, updateData)
      console.log('Interview updated successfully')

      return NextResponse.json({
        success: true,
        data: {
          messageId: message.id,
          emotionAnalysis: emotionAnalysis
        }
      })

    } catch (error: any) {
      console.error('Submit answer error:', error)
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to submit answer',
          details: error?.message || 'Unknown error'
        },
        { status: 500 }
      )
    }
  }
)