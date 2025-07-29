import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { reportService, enhancedAIService } from '@/lib/supabase-db-enhanced'
import { withRBAC, RBAC_CONFIGS } from '@/lib/rbac-middleware'

const generateReportSchema = z.object({
  interviewId: z.string().optional(),
  batchId: z.string().optional(),
  reportType: z.enum(['individual', 'batch', 'comprehensive']),
  includeAnalytics: z.boolean().default(true),
  includeRecommendations: z.boolean().default(true)
})

export const POST = withRBAC(RBAC_CONFIGS.ANY_AUTHENTICATED)(
  async (request: NextRequest, user: any) => {
    try {
      const body = await request.json()
      const validatedData = generateReportSchema.parse(body)

      let reportData = null

      switch (validatedData.reportType) {
        case 'individual':
          if (!validatedData.interviewId) {
            return NextResponse.json(
              { 
                success: false, 
                error: 'Interview ID is required for individual reports' 
              },
              { status: 400 }
            )
          }

          // Generate individual interview report
          const interview = await reportService.getInterviewForReport(validatedData.interviewId)
          if (!interview || interview.user_id !== user.id) {
            return NextResponse.json(
              { 
                success: false, 
                error: 'Interview not found or access denied' 
              },
              { status: 404 }
            )
          }

          const individualSummary = await enhancedAIService.generateInterviewSummary(
            interview.messages.map(m => m.content),
            interview.messages.map(m => m.metadata?.analysis || {}),
            interview.messages.map(m => m.metadata?.emotionData || {})
          )

          reportData = {
            interview_id: validatedData.interviewId,
            report_type: 'individual',
            content: {
              candidateName: interview.candidate_name,
              position: interview.position,
              overallScore: interview.overall_score,
              totalQuestions: interview.messages.length,
              cheatingFlags: interview.cheating_flags?.length || 0,
              duration: interview.duration,
              summary: individualSummary.summary,
              strengths: individualSummary.strengths,
              weaknesses: individualSummary.weaknesses,
              recommendations: individualSummary.recommendations,
              analytics: validatedData.includeAnalytics ? {
                emotionAnalysis: interview.messages.map(m => m.metadata?.emotionData),
                confidenceTrends: interview.messages.map(m => m.metadata?.analysis?.confidenceScore),
                cheatingFlags: interview.cheating_flags
              } : null
            },
            generated_at: new Date().toISOString()
          }
          break

        case 'batch':
          if (!validatedData.batchId) {
            return NextResponse.json(
              { 
                success: false, 
                error: 'Batch ID is required for batch reports' 
              },
              { status: 400 }
            )
          }

          // Generate batch report
          const batchInterviews = await reportService.getBatchInterviews(validatedData.batchId)
          const batchSummary = await enhancedAIService.generateBatchSummary(batchInterviews)

          reportData = {
            batch_id: validatedData.batchId,
            report_type: 'batch',
            content: {
              batchName: batchSummary.batchName,
              totalCandidates: batchInterviews.length,
              averageScore: batchSummary.averageScore,
              topPerformers: batchSummary.topPerformers,
              areasOfConcern: batchSummary.areasOfConcern,
              recommendations: batchSummary.recommendations,
              analytics: validatedData.includeAnalytics ? {
                scoreDistribution: batchSummary.scoreDistribution,
                cheatingFlags: batchSummary.cheatingFlags,
                performanceTrends: batchSummary.performanceTrends
              } : null
            },
            generated_at: new Date().toISOString()
          }
          break

        case 'comprehensive':
          // Generate comprehensive system report
          const systemData = await reportService.getSystemData()
          const comprehensiveSummary = await enhancedAIService.generateComprehensiveSummary(systemData)

          reportData = {
            report_type: 'comprehensive',
            content: {
              totalInterviews: systemData.totalInterviews,
              totalOrganizations: systemData.totalOrganizations,
              averagePerformance: comprehensiveSummary.averagePerformance,
              systemHealth: comprehensiveSummary.systemHealth,
              recommendations: comprehensiveSummary.recommendations,
              analytics: validatedData.includeAnalytics ? {
                performanceMetrics: comprehensiveSummary.performanceMetrics,
                usagePatterns: comprehensiveSummary.usagePatterns,
                trendAnalysis: comprehensiveSummary.trendAnalysis
              } : null
            },
            generated_at: new Date().toISOString()
          }
          break
      }

      const report = await reportService.createReport(reportData)

      return NextResponse.json({
        success: true,
        data: {
          reportId: report.id,
          reportType: validatedData.reportType,
          generatedAt: report.generated_at,
          downloadUrl: `/api/report/download/${report.id}`
        }
      })

    } catch (error) {
      console.error('Report generation error:', error)
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to generate report' 
        },
        { status: 500 }
      )
    }
  }
)