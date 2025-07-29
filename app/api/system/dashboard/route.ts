import { NextRequest, NextResponse } from 'next/server'
import { dashboardService, analyticsService } from '@/lib/supabase-db-enhanced'
import { withRBAC, RBAC_CONFIGS } from '@/lib/rbac-middleware'

export const GET = withRBAC(RBAC_CONFIGS.SYSTEM_ADMIN)(
  async (request: NextRequest, user: any) => {
    try {
      // Get system-wide statistics
      const stats = await dashboardService.getSystemStats()
      
      // Get recent activity
      const recentActivity = await dashboardService.getRecentActivity()
      
      // Get top performing organizations
      const topOrganizations = await dashboardService.getTopOrganizations()
      
      // Get interview analytics
      const interviewAnalytics = await analyticsService.getInterviewAnalytics()
      
      // Get subscription analytics
      const subscriptionAnalytics = await analyticsService.getSubscriptionAnalytics()

      return NextResponse.json({
        success: true,
        data: {
          stats,
          recentActivity,
          topOrganizations,
          interviewAnalytics,
          subscriptionAnalytics
        }
      })

    } catch (error) {
      console.error('System dashboard error:', error)
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to fetch system dashboard data' 
        },
        { status: 500 }
      )
    }
  }
)