import { NextRequest, NextResponse } from 'next/server'
import { interviewService } from '@/lib/supabase-db-enhanced'
import { withRBAC, RBAC_CONFIGS } from '@/lib/rbac-middleware'

export const GET = withRBAC(RBAC_CONFIGS.ANY_AUTHENTICATED)(
  async (request: NextRequest, user: any) => {
    try {
      const { searchParams } = new URL(request.url)
      const limit = parseInt(searchParams.get('limit') || '10')

      // Get user's recent interviews
      const interviews = await interviewService.getUserInterviews(user.id)
      
      // Sort by created_at and limit
      const recentInterviews = interviews
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, limit)
        .map(interview => ({
          id: interview.id,
          candidateName: interview.candidate_name || 'Unknown',
          position: interview.position || 'General',
          status: interview.status,
          overallScore: interview.overall_score,
          flaggedCheating: interview.flagged_cheating,
          startTime: interview.start_time,
          endTime: interview.end_time,
          duration: interview.duration
        }))

      return NextResponse.json({
        success: true,
        interviews: recentInterviews
      })

    } catch (error) {
      console.error('Recent interviews error:', error)
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to fetch recent interviews' 
        },
        { status: 500 }
      )
    }
  }
)