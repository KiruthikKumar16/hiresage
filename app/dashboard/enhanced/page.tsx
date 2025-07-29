"use client"

import { useEffect, useState } from 'react'
import { useAuth } from '@/components/auth-provider'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  Users, 
  Calendar, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  BarChart3,
  FileText,
  Video,
  Mic,
  Eye,
  Brain
} from 'lucide-react'
import Link from 'next/link'

interface DashboardStats {
  totalInterviews: number
  completedInterviews: number
  averageScore: number
  cheatingFlags: number
  thisWeek: number
  interviewsRemaining: number
  totalInterviewsAllowed: number
}

interface RecentInterview {
  id: string
  candidateName: string
  position: string
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled'
  overallScore?: number
  flaggedCheating: boolean
  startTime: string
  endTime?: string
}

export default function EnhancedDashboard() {
  const { user, subscription } = useAuth()
  const [stats, setStats] = useState<DashboardStats>({
    totalInterviews: 0,
    completedInterviews: 0,
    averageScore: 0,
    cheatingFlags: 0,
    thisWeek: 0,
    interviewsRemaining: 0,
    totalInterviewsAllowed: 0
  })
  const [recentInterviews, setRecentInterviews] = useState<RecentInterview[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (user) {
      fetchDashboardData()
    }
  }, [user])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch dashboard data based on user role
      const response = await fetch('/api/dashboard/stats')
      if (response.ok) {
        const data = await response.json()
        setStats(data.stats)
      } else {
        throw new Error('Failed to fetch dashboard stats')
      }

      // Fetch recent interviews
      const interviewsResponse = await fetch('/api/interviews/recent')
      if (interviewsResponse.ok) {
        const data = await interviewsResponse.json()
        setRecentInterviews(data.interviews)
      } else {
        throw new Error('Failed to fetch recent interviews')
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      setError('Failed to load dashboard data. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800'
      case 'in_progress': return 'bg-blue-100 text-blue-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4" />
      case 'in_progress': return <Clock className="h-4 w-4" />
      case 'pending': return <Clock className="h-4 w-4" />
      case 'cancelled': return <AlertTriangle className="h-4 w-4" />
      default: return <Clock className="h-4 w-4" />
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 text-white">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-slate-700 rounded mb-4"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-slate-700 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 text-white">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-red-400" />
            <h2 className="text-xl font-semibold mb-2">Error Loading Dashboard</h2>
            <p className="text-slate-300 mb-4">{error}</p>
            <Button onClick={fetchDashboardData} className="bg-blue-600 hover:bg-blue-700">
              Try Again
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Welcome back, {user?.name || 'User'}!</h1>
          <p className="text-slate-300">
            Here's what's happening with your AI interviews today.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-300">Total Interviews</CardTitle>
              <Video className="h-4 w-4 text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats.totalInterviews}</div>
              <p className="text-xs text-slate-400">
                {stats.completedInterviews} completed
              </p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-300">Average Score</CardTitle>
              <BarChart3 className="h-4 w-4 text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats.averageScore}%</div>
              <p className="text-xs text-slate-400">
                Based on {stats.completedInterviews} interviews
              </p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-300">Cheating Flags</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats.cheatingFlags}</div>
              <p className="text-xs text-slate-400">
                {stats.cheatingFlags > 0 ? 'Requires attention' : 'All clear'}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-300">Interviews Remaining</CardTitle>
              <Users className="h-4 w-4 text-purple-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats.interviewsRemaining}</div>
              <Progress 
                value={stats.totalInterviewsAllowed > 0 ? (stats.totalInterviewsAllowed - stats.interviewsRemaining) / stats.totalInterviewsAllowed * 100 : 0} 
                className="mt-2"
              />
              <p className="text-xs text-slate-400 mt-1">
                {stats.totalInterviewsAllowed} total allowed
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Start New Interview</CardTitle>
              <CardDescription className="text-slate-400">
                Begin a new AI-powered interview session
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/interview/live">
                <Button className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700">
                  <Video className="mr-2 h-4 w-4" />
                  Start Interview
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">View Reports</CardTitle>
              <CardDescription className="text-slate-400">
                Access detailed interview reports and analytics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/reports">
                <Button variant="outline" className="w-full border-slate-600 text-slate-300 hover:bg-slate-700">
                  <FileText className="mr-2 h-4 w-4" />
                  View Reports
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">AI Analysis</CardTitle>
              <CardDescription className="text-slate-400">
                Review AI insights and recommendations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/analytics">
                <Button variant="outline" className="w-full border-slate-600 text-slate-300 hover:bg-slate-700">
                  <Brain className="mr-2 h-4 w-4" />
                  View Analytics
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Recent Interviews */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Recent Interviews</CardTitle>
            <CardDescription className="text-slate-400">
              Your latest interview sessions and their status
            </CardDescription>
          </CardHeader>
          <CardContent>
            {recentInterviews.length === 0 ? (
              <div className="text-center py-8 text-slate-400">
                <Video className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No interviews yet. Start your first interview to see results here.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentInterviews.map((interview) => (
                  <div key={interview.id} className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(interview.status)}
                        <Badge className={getStatusColor(interview.status)}>
                          {interview.status.replace('_', ' ')}
                        </Badge>
                      </div>
                      <div>
                        <p className="font-medium text-white">{interview.candidateName}</p>
                        <p className="text-sm text-slate-400">{interview.position}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      {interview.overallScore && (
                        <div className="text-right">
                          <p className="text-sm text-slate-400">Score</p>
                          <p className="font-medium text-white">{interview.overallScore}%</p>
                        </div>
                      )}
                      {interview.flaggedCheating && (
                        <Badge variant="destructive" className="bg-red-500">
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          Cheating Detected
                        </Badge>
                      )}
                      <Link href={`/interviews/${interview.id}`}>
                        <Button variant="ghost" size="sm" className="text-blue-400 hover:text-blue-300">
                          View Details
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Subscription Info */}
        {subscription && (
          <Card className="bg-slate-800/50 border-slate-700 mt-8">
            <CardHeader>
              <CardTitle className="text-white">Subscription Status</CardTitle>
              <CardDescription className="text-slate-400">
                Your current plan and usage
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-slate-400">Plan</p>
                  <p className="font-medium text-white">{subscription.plan_name}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-400">Interviews Remaining</p>
                  <p className="font-medium text-white">{subscription.interviews_remaining}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-400">Status</p>
                  <Badge className={subscription.status === 'active' ? 'bg-green-500' : 'bg-red-500'}>
                    {subscription.status}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}