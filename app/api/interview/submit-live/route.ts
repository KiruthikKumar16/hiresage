import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { enhancedAIService, interviewService, reportService, subscriptionService } from '@/lib/supabase-db-enhanced'
import { withRBAC, RBAC_CONFIGS } from '@/lib/rbac-middleware'

const submitLiveInterviewSchema = z.object({
  interviewId: z.string(),
  sessionId: z.string(),
  duration: z.number().optional()
})

export const POST = withRBAC(RBAC_CONFIGS.ANY_AUTHENTICATED)(
  async (request: NextRequest, user: any) => {
    try {
      const body = await request.json()
      const validatedData = submitLiveInterviewSchema.parse(body)

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

      // Get all messages from the interview
      const messages = await interviewService.getInterviewMessages(validatedData.interviewId)
      const candidateMessages = messages.filter(m => m.sender_type === 'candidate')

      // Generate comprehensive summary using AI
      const summary = await enhancedAIService.generateInterviewSummary(
        candidateMessages.map(m => m.content),
        candidateMessages.map(m => m.metadata?.analysis || {}),
        candidateMessages.map(m => m.metadata?.emotionData || {})
      )

      // Calculate overall score
      const scores = candidateMessages
        .map(m => m.metadata?.analysis?.confidenceScore || 0)
        .filter(score => score > 0)
      
      const overallScore = scores.length > 0 
        ? Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length * 100)
        : 0

      // Count cheating flags
      const cheatingFlags = candidateMessages
        .flatMap(m => m.metadata?.cheatingFlags || [])
        .filter(flag => flag.severity === 'high')

      // Update interview with completion data
      await interviewService.updateInterview(validatedData.interviewId, {
        status: 'completed',
        end_time: new Date().toISOString(),
        duration: validatedData.duration || 0,
        overall_score: overallScore,
        flagged_cheating: cheatingFlags.length > 0,
        cheating_flags: cheatingFlags,
        result_json: {
          summary: summary.summary,
          strengths: summary.strengths,
          weaknesses: summary.weaknesses,
          recommendations: summary.recommendations,
          overallScore,
          totalQuestions: candidateMessages.length,
          cheatingFlags: cheatingFlags.length
        }
      })

      // Create report
      const reportData = {
        interview_id: validatedData.interviewId,
        report_type: 'comprehensive',
        content: {
          summary: summary.summary,
          strengths: summary.strengths,
          weaknesses: summary.weaknesses,
          recommendations: summary.recommendations,
          overallScore,
          totalQuestions: candidateMessages.length,
          cheatingFlags: cheatingFlags.length,
          duration: validatedData.duration || 0
        },
        generated_at: new Date().toISOString()
      }

      const report = await reportService.createReport(reportData)

      // Deduct interview from subscription
      await subscriptionService.useInterview(user.id)

      return NextResponse.json({
        success: true,
        data: {
          overallScore,
          totalQuestions: candidateMessages.length,
          cheatingFlags: cheatingFlags.length,
          summary: summary.summary,
          strengths: summary.strengths,
          weaknesses: summary.weaknesses,
          recommendations: summary.recommendations,
          reportId: report.id
        }
      })

    } catch (error) {
      console.error('Submit live interview error:', error)
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to complete interview' 
        },
        { status: 500 }
      )
    }
  }
)