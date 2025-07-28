import { NextRequest, NextResponse } from 'next/server'
import { requireRole, createErrorResponse } from '@/lib/rbac-middleware'
import { supabase } from '@/lib/supabase-db'

// GET /api/system/reports - Generate system-wide reports
export async function GET(req: NextRequest) {
  try {
    // Verify system admin role
    const admin = await requireRole(req, 'system_admin')
    
    const { searchParams } = new URL(req.url)
    const reportType = searchParams.get('type') || 'overview'
    const startDate = searchParams.get('start_date')
    const endDate = searchParams.get('end_date')
    const organizationId = searchParams.get('organization_id')

    // Build date filter
    let dateFilter = ''
    if (startDate && endDate) {
      dateFilter = `AND created_at >= '${startDate}' AND created_at <= '${endDate}'`
    } else if (startDate) {
      dateFilter = `AND created_at >= '${startDate}'`
    } else if (endDate) {
      dateFilter = `AND created_at <= '${endDate}'`
    }

    // Build organization filter
    let orgFilter = ''
    if (organizationId) {
      orgFilter = `AND organization_id = '${organizationId}'`
    }

    let reportData = {}

    switch (reportType) {
      case 'overview':
        reportData = await generateOverviewReport(dateFilter, orgFilter)
        break
      case 'organizations':
        reportData = await generateOrganizationsReport(dateFilter)
        break
      case 'interviews':
        reportData = await generateInterviewsReport(dateFilter, orgFilter)
        break
      case 'revenue':
        reportData = await generateRevenueReport(dateFilter, orgFilter)
        break
      case 'questions':
        reportData = await generateQuestionsReport()
        break
      default:
        return NextResponse.json({
          success: false,
          error: 'Invalid report type'
        }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      data: reportData,
      generated_at: new Date().toISOString(),
      generated_by: admin.id
    })

  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes('Unauthorized') || error.message.includes('Forbidden')) {
        return createErrorResponse(error.message, 403)
      }
    }

    console.error('System reports GET error:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 })
  }
}

// Generate overview report
async function generateOverviewReport(dateFilter: string, orgFilter: string) {
  // Total users
  const { count: totalUsers } = await supabase
    .from('users')
    .select('*', { count: 'exact', head: true })
    .neq('role', 'system_admin')

  // Active subscriptions
  const { count: activeSubscriptions } = await supabase
    .from('subscriptions')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'active')

  // Total interviews
  const { count: totalInterviews } = await supabase
    .from('interviews')
    .select('*', { count: 'exact', head: true })

  // Completed interviews
  const { count: completedInterviews } = await supabase
    .from('interviews')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'completed')

  // Average interview score
  const { data: avgScoreData } = await supabase
    .from('interviews')
    .select('score')
    .eq('status', 'completed')
    .not('score', 'is', null)

  const avgScore = avgScoreData && avgScoreData.length > 0
    ? avgScoreData.reduce((sum, interview) => sum + (interview.score || 0), 0) / avgScoreData.length
    : 0

  // Recent activity (last 30 days)
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
  
  const { count: recentInterviews } = await supabase
    .from('interviews')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', thirtyDaysAgo)

  const { count: recentUsers } = await supabase
    .from('users')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', thirtyDaysAgo)
    .neq('role', 'system_admin')

  return {
    overview: {
      total_users: totalUsers || 0,
      active_subscriptions: activeSubscriptions || 0,
      total_interviews: totalInterviews || 0,
      completed_interviews: completedInterviews || 0,
      average_score: Math.round(avgScore * 100) / 100,
      completion_rate: totalInterviews ? Math.round((completedInterviews || 0) / totalInterviews * 100) : 0
    },
    recent_activity: {
      interviews_last_30_days: recentInterviews || 0,
      new_users_last_30_days: recentUsers || 0
    }
  }
}

// Generate organizations report
async function generateOrganizationsReport(dateFilter: string) {
  // Get all organizations with their stats
  const { data: organizations, error } = await supabase
    .from('users')
    .select(`
      id,
      name,
      email,
      company,
      role,
      plan,
      status,
      created_at,
      subscriptions (
        plan_name,
        interviews_remaining,
        total_interviews,
        status,
        expires_at
      )
    `)
    .in('role', ['university_admin', 'enterprise_admin'])
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching organizations:', error)
    return { organizations: [] }
  }

  // Get interview counts for each organization
  const orgStats = await Promise.all(
    (organizations || []).map(async (org) => {
      const { count: interviewCount } = await supabase
        .from('interviews')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', org.id)

      const { count: userCount } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', org.id)

      return {
        ...org,
        interview_count: interviewCount || 0,
        user_count: userCount || 0
      }
    })
  )

  return {
    organizations: orgStats,
    summary: {
      total_organizations: orgStats.length,
      active_organizations: orgStats.filter(org => org.status === 'active').length,
      total_interviews: orgStats.reduce((sum, org) => sum + org.interview_count, 0),
      total_users: orgStats.reduce((sum, org) => sum + org.user_count, 0)
    }
  }
}

// Generate interviews report
async function generateInterviewsReport(dateFilter: string, orgFilter: string) {
  // Get interview statistics
  const { data: interviews, error } = await supabase
    .from('interviews')
    .select(`
      id,
      candidate_name,
      position,
      status,
      score,
      duration,
      created_at,
      users!inner (
        name,
        company,
        role
      )
    `)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching interviews:', error)
    return { interviews: [] }
  }

  // Calculate statistics
  const completedInterviews = (interviews || []).filter(i => i.status === 'completed')
  const avgScore = completedInterviews.length > 0
    ? completedInterviews.reduce((sum, i) => sum + (i.score || 0), 0) / completedInterviews.length
    : 0

  const avgDuration = completedInterviews.length > 0
    ? completedInterviews.reduce((sum, i) => sum + (i.duration || 0), 0) / completedInterviews.length
    : 0

  // Status breakdown
  const statusBreakdown = (interviews || []).reduce((acc, interview) => {
    acc[interview.status] = (acc[interview.status] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  return {
    interviews: interviews || [],
    statistics: {
      total: interviews?.length || 0,
      completed: completedInterviews.length,
      average_score: Math.round(avgScore * 100) / 100,
      average_duration: Math.round(avgDuration),
      status_breakdown: statusBreakdown
    }
  }
}

// Generate revenue report
async function generateRevenueReport(dateFilter: string, orgFilter: string) {
  // Get subscription data
  const { data: subscriptions, error } = await supabase
    .from('subscriptions')
    .select(`
      id,
      plan_name,
      total_interviews,
      price_per_interview,
      status,
      payment_status,
      created_at,
      users!inner (
        name,
        company,
        role
      )
    `)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching subscriptions:', error)
    return { revenue: { total: 0, breakdown: [] } }
  }

  // Calculate revenue
  const revenueData = (subscriptions || []).map(sub => ({
    ...sub,
    revenue: sub.total_interviews * sub.price_per_interview
  }))

  const totalRevenue = revenueData.reduce((sum, sub) => sum + sub.revenue, 0)

  // Plan breakdown
  const planBreakdown = revenueData.reduce((acc, sub) => {
    acc[sub.plan_name] = (acc[sub.plan_name] || 0) + sub.revenue
    return acc
  }, {} as Record<string, number>)

  return {
    revenue: {
      total: totalRevenue,
      breakdown: revenueData,
      plan_breakdown: planBreakdown
    }
  }
}

// Generate questions report
async function generateQuestionsReport() {
  // Get questions statistics
  const { data: questions, error } = await supabase
    .from('questions')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching questions:', error)
    return { questions: [] }
  }

  // Category breakdown
  const categoryBreakdown = (questions || []).reduce((acc, q) => {
    acc[q.category] = (acc[q.category] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  // Difficulty breakdown
  const difficultyBreakdown = (questions || []).reduce((acc, q) => {
    acc[q.difficulty] = (acc[q.difficulty] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  return {
    questions: questions || [],
    statistics: {
      total: questions?.length || 0,
      active: (questions || []).filter(q => q.is_active).length,
      category_breakdown: categoryBreakdown,
      difficulty_breakdown: difficultyBreakdown
    }
  }
} 