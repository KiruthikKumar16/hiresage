import { NextRequest, NextResponse } from 'next/server'
import { interviewService, subscriptionService, userService } from '@/lib/supabase-db-enhanced'
import { withRBAC, RBAC_CONFIGS } from '@/lib/rbac-middleware'

export const GET = withRBAC(RBAC_CONFIGS.ANY_AUTHENTICATED)(
  async (request: NextRequest, user: any) => {
    try {
      // Get user's interviews
      const interviews = await interviewService.getUserInterviews(user.id)
      
      // Calculate stats
      const totalInterviews = interviews.length
      const completedInterviews = interviews.filter(i => i.status === 'completed').length
      const averageScore = completedInterviews > 0 
        ? interviews
            .filter(i => i.overall_score)
            .reduce((sum, i) => sum + (i.overall_score || 0), 0) / 
            interviews.filter(i => i.overall_score).length
        : 0
      const cheatingFlags = interviews.filter(i => i.flagged_cheating).length
      
      // Get this week's interviews
      const oneWeekAgo = new Date()
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
      const thisWeek = interviews.filter(i => 
        new Date(i.created_at) >= oneWeekAgo
      ).length

      // Get subscription info
      const subscription = await subscriptionService.getActiveSubscription(user.id)
      const interviewsRemaining = subscription?.interviews_remaining || 0
      const totalInterviewsAllowed = subscription?.total_interviews || 0

      const stats = {
        totalInterviews,
        completedInterviews,
        averageScore: Math.round(averageScore),
        cheatingFlags,
        thisWeek,
        interviewsRemaining,
        totalInterviewsAllowed
      }

      return NextResponse.json({
        success: true,
        stats
      })

    } catch (error) {
      console.error('Dashboard stats error:', error)
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to fetch dashboard stats' 
        },
        { status: 500 }
      )
    }
  }
)