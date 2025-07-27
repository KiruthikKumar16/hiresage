"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Calendar,
  Star,
  Brain,
  Target,
  Activity,
  Loader2
} from "lucide-react"
import { toast } from "sonner"

interface AnalyticsData {
  totalInterviews: number
  completedInterviews: number
  averageScore: number
  averageDuration: number
  totalCandidates: number
  thisWeek: number
  topPositions: Array<{
    position: string
    count: number
    avgScore: number
  }>
  scoreDistribution: Array<{
    range: string
    count: number
    percentage: number
  }>
  weeklyTrends: Array<{
    week: string
    interviews: number
    avgScore: number
  }>
}

export function Analytics() {
  const [timeRange, setTimeRange] = useState("30d")
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAnalytics()
  }, [timeRange])

  const fetchAnalytics = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/analytics')
      const data = await response.json()
      
      if (data.success) {
        setAnalyticsData(data.data)
      } else {
        toast.error('Failed to fetch analytics data')
      }
    } catch (error) {
      console.error('Error fetching analytics:', error)
      toast.error('Failed to fetch analytics data')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 text-blue-400 animate-spin mr-2" />
        <span className="text-slate-300">Loading analytics...</span>
      </div>
    )
  }

  if (!analyticsData) {
    return (
      <div className="text-center py-12">
        <BarChart3 className="w-16 h-16 text-slate-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-white mb-2">No Analytics Data</h3>
        <p className="text-slate-300 mb-4">Start conducting interviews to see analytics here</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Analytics</h2>
          <p className="text-slate-300">Interview performance insights and trends</p>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-32 bg-slate-700 border-slate-600 text-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-slate-700 border-slate-600">
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
            <SelectItem value="90d">Last 90 days</SelectItem>
            <SelectItem value="1y">Last year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">Total Interviews</CardTitle>
            <Brain className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{analyticsData.totalInterviews}</div>
            <p className="text-xs text-slate-400">+12% from last period</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">Completion Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {analyticsData.totalInterviews > 0 ? Math.round((analyticsData.completedInterviews / analyticsData.totalInterviews) * 100) : 0}%
            </div>
            <p className="text-xs text-slate-400">{analyticsData.completedInterviews} completed</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">Average Score</CardTitle>
            <Star className="h-4 w-4 text-yellow-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{analyticsData.averageScore.toFixed(1)}/10</div>
            <p className="text-xs text-slate-400">+0.3 from last week</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">Avg Duration</CardTitle>
            <Clock className="h-4 w-4 text-cyan-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{analyticsData.averageDuration} min</div>
            <p className="text-xs text-slate-400">per interview</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Positions */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Top Positions</CardTitle>
            <CardDescription className="text-slate-300">
              Most interviewed positions and their performance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analyticsData.topPositions.length > 0 ? (
                analyticsData.topPositions.map((position, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-medium">{index + 1}</span>
                      </div>
                      <div>
                        <p className="text-white font-medium">{position.position}</p>
                        <p className="text-slate-400 text-sm">{position.count} interviews</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-white font-medium">{position.avgScore.toFixed(1)}/10</div>
                      <div className="text-slate-400 text-sm">avg score</div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <Target className="w-12 h-12 text-slate-400 mx-auto mb-2" />
                  <p className="text-slate-300">No position data yet</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Score Distribution */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Score Distribution</CardTitle>
            <CardDescription className="text-slate-300">
              Breakdown of interview scores
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analyticsData.scoreDistribution.length > 0 ? (
                analyticsData.scoreDistribution.map((range, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-300">{range.range}</span>
                      <span className="text-sm text-slate-400">{range.count} ({range.percentage}%)</span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${range.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <BarChart3 className="w-12 h-12 text-slate-400 mx-auto mb-2" />
                  <p className="text-slate-300">No score data yet</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Weekly Trends */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Weekly Trends</CardTitle>
          <CardDescription className="text-slate-300">
            Interview volume and average scores over time
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analyticsData.weeklyTrends.length > 0 ? (
              analyticsData.weeklyTrends.map((week, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                      <TrendingUp className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-white font-medium">{week.week}</p>
                      <p className="text-slate-400 text-sm">{week.interviews} interviews</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-white font-medium">{week.avgScore.toFixed(1)}/10</div>
                    <div className="text-slate-400 text-sm">avg score</div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <Activity className="w-12 h-12 text-slate-400 mx-auto mb-2" />
                <p className="text-slate-300">No trend data yet</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Additional Insights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">Total Candidates</CardTitle>
            <Users className="h-4 w-4 text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{analyticsData.totalCandidates}</div>
            <p className="text-xs text-slate-400">in database</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">This Week</CardTitle>
            <Calendar className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{analyticsData.thisWeek}</div>
            <p className="text-xs text-slate-400">interviews</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">Success Rate</CardTitle>
            <Target className="h-4 w-4 text-orange-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {analyticsData.completedInterviews > 0 && analyticsData.averageScore >= 7 ? 'High' : 'Good'}
            </div>
            <p className="text-xs text-slate-400">performance</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 