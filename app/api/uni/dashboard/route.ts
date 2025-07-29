import { NextRequest, NextResponse } from 'next/server'
import { dashboardService, analyticsService } from '@/lib/supabase-db-enhanced'
import { withRBAC, RBAC_CONFIGS } from '@/lib/rbac-middleware'

export const GET = withRBAC(RBAC_CONFIGS.UNIVERSITY_ADMIN)(
  async (request: NextRequest, user: any) => {
    try {
      // Get university-specific statistics
      const stats = await dashboardService.getUniversityStats(user.organization_id)
      
      // Get recent interviews for the university
      const recentInterviews = await dashboardService.getUniversityRecentInterviews(user.organization_id)
      
      // Get batch analytics
      const batchAnalytics = await analyticsService.getBatchAnalytics(user.organization_id)
      
      // Get candidate performance analytics
      const candidateAnalytics = await analyticsService.getCandidateAnalytics(user.organization_id)
      
      // Get department-wise statistics
      const departmentStats = await dashboardService.getDepartmentStats(user.organization_id)

      return NextResponse.json({
        success: true,
        data: {
          stats,
          recentInterviews,
          batchAnalytics,
          candidateAnalytics,
          departmentStats
        }
      })

    } catch (error) {
      console.error('University dashboard error:', error)
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to fetch university dashboard data' 
        },
        { status: 500 }
      )
    }
  }
)