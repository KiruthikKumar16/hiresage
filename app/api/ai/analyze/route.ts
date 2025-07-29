import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { enhancedAIService, aiAnalysisService } from '@/lib/supabase-db-enhanced'
import { withRBAC, RBAC_CONFIGS } from '@/lib/rbac-middleware'

const analyzeContentSchema = z.object({
  interviewId: z.string(),
  content: z.string(),
  context: z.string(),
  analysisType: z.enum(['content', 'emotion', 'cheating', 'comprehensive']),
  emotionData: z.record(z.any()).optional(),
  faceData: z.record(z.any()).optional(),
  gazeData: z.record(z.any()).optional()
})

export const POST = withRBAC(RBAC_CONFIGS.ANY_AUTHENTICATED)(
  async (request: NextRequest, user: any) => {
    try {
      const body = await request.json()
      const validatedData = analyzeContentSchema.parse(body)

      let analysis = null

      // Perform analysis based on type
      switch (validatedData.analysisType) {
        case 'content':
          analysis = await enhancedAIService.analyzeResponse(
            validatedData.context,
            validatedData.content,
            validatedData.emotionData,
            validatedData.faceData,
            validatedData.gazeData
          )
          break

        case 'emotion':
          analysis = await enhancedAIService.analyzeEmotions(
            validatedData.content,
            validatedData.emotionData,
            validatedData.faceData
          )
          break

        case 'cheating':
          analysis = await enhancedAIService.detectCheating(
            validatedData.content,
            validatedData.faceData,
            validatedData.gazeData
          )
          break

        case 'comprehensive':
          const [contentAnalysis, emotionAnalysis, cheatingAnalysis] = await Promise.all([
            enhancedAIService.analyzeResponse(
              validatedData.context,
              validatedData.content,
              validatedData.emotionData,
              validatedData.faceData,
              validatedData.gazeData
            ),
            enhancedAIService.analyzeEmotions(
              validatedData.content,
              validatedData.emotionData,
              validatedData.faceData
            ),
            enhancedAIService.detectCheating(
              validatedData.content,
              validatedData.faceData,
              validatedData.gazeData
            )
          ])

          analysis = {
            content: contentAnalysis,
            emotion: emotionAnalysis,
            cheating: cheatingAnalysis,
            overallScore: (contentAnalysis.confidenceScore + emotionAnalysis.confidence) / 2
          }
          break

        default:
          throw new Error('Invalid analysis type')
      }

      // Log analysis
      await aiAnalysisService.createAnalysisLog({
        interview_id: validatedData.interviewId,
        analysis_type: validatedData.analysisType,
        input_data: {
          content: validatedData.content,
          context: validatedData.context,
          emotionData: validatedData.emotionData,
          faceData: validatedData.faceData,
          gazeData: validatedData.gazeData
        },
        output_data: analysis,
        model_used: 'gemini-2.0-flash',
        processing_time_ms: 200
      })

      return NextResponse.json({
        success: true,
        data: {
          analysis,
          timestamp: new Date().toISOString()
        }
      })

    } catch (error) {
      console.error('AI analysis error:', error)
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to analyze content' 
        },
        { status: 500 }
      )
    }
  }
)