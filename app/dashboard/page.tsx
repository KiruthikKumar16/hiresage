"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Brain, 
  Users, 
  BarChart3, 
  Plus, 
  Play, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Calendar,
  MessageSquare,
  FileText,
  Settings,
  Loader2
} from "lucide-react"
import { InterviewSession } from "@/components/interview-session"
import { CandidateList } from "@/components/candidate-list"
import { Analytics } from "@/components/analytics"
import { VideoInterview } from "@/components/video-interview"
import { toast } from "sonner"

interface DashboardStats {
  totalInterviews: number
  completedInterviews: number
  pendingInterviews: number
  averageScore: number
  totalCandidates: number
  thisWeek: number
}

interface RecentInterview {
  id: string
  candidate: string
  position: string
  status: string
  score?: number
  duration?: string
  date: string
}

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("overview")
  const [stats, setStats] = useState<DashboardStats>({
    totalInterviews: 0,
    completedInterviews: 0,
    pendingInterviews: 0,
    averageScore: 0,
    totalCandidates: 0,
    thisWeek: 0
  })
  const [recentInterviews, setRecentInterviews] = useState<RecentInterview[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      
      // Fetch analytics data
      const analyticsResponse = await fetch('/api/admin/analytics')
      const analyticsData = await analyticsResponse.json()
      
      if (analyticsData.success) {
        const analytics = analyticsData.data
        setStats({
          totalInterviews: analytics.totalInterviews || 0,
          completedInterviews: analytics.completedInterviews || 0,
          pendingInterviews: analytics.totalInterviews - analytics.completedInterviews || 0,
          averageScore: analytics.averageScore || 0,
          totalCandidates: analytics.totalCandidates || 0,
          thisWeek: analytics.thisWeek || 0
        })
      }

      // Fetch recent interviews
      const interviewsResponse = await fetch('/api/interviews')
      const interviewsData = await interviewsResponse.json()
      
      if (interviewsData.success) {
        const interviews = interviewsData.data.slice(0, 3).map((interview: any) => ({
          id: interview.id,
          candidate: interview.candidateName,
          position: interview.position,
          status: interview.status,
          score: interview.score,
          duration: interview.duration ? `${interview.duration} min` : undefined,
          date: new Date(interview.createdAt).toLocaleDateString()
        }))
        setRecentInterviews(interviews)
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      toast.error('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-blue-400 animate-spin mx-auto mb-4" />
          <p className="text-slate-300">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800">
      {/* Header */}
      <header className="border-b border-slate-700 bg-slate-800/50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-lg flex items-center justify-center">
                  <Brain className="w-6 h-6 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full animate-pulse"></div>
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
                  HireSage AI X
                </h1>
                <p className="text-xs text-slate-400">AI Interview Platform</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm" className="border-slate-600 text-slate-300">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">JD</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6 bg-slate-800/50 border-slate-700">
            <TabsTrigger value="overview" className="text-slate-300 data-[state=active]:bg-blue-600">
              Overview
            </TabsTrigger>
            <TabsTrigger value="interviews" className="text-slate-300 data-[state=active]:bg-blue-600">
              Interviews
            </TabsTrigger>
            <TabsTrigger value="video-interviews" className="text-slate-300 data-[state=active]:bg-blue-600">
              Video Interviews
            </TabsTrigger>
            <TabsTrigger value="candidates" className="text-slate-300 data-[state=active]:bg-blue-600">
              Candidates
            </TabsTrigger>
            <TabsTrigger value="analytics" className="text-slate-300 data-[state=active]:bg-blue-600">
              Analytics
            </TabsTrigger>
            <TabsTrigger value="reports" className="text-slate-300 data-[state=active]:bg-blue-600">
              Reports
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-slate-300">Total Interviews</CardTitle>
                  <Brain className="h-4 w-4 text-blue-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">{stats.totalInterviews}</div>
                  <p className="text-xs text-slate-400">+12% from last month</p>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-slate-300">Completed</CardTitle>
                  <CheckCircle className="h-4 w-4 text-green-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">{stats.completedInterviews}</div>
                  <p className="text-xs text-slate-400">
                    {stats.totalInterviews > 0 ? Math.round((stats.completedInterviews / stats.totalInterviews) * 100) : 0}% completion rate
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-slate-300">Average Score</CardTitle>
                  <BarChart3 className="h-4 w-4 text-cyan-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">{stats.averageScore.toFixed(1)}/10</div>
                  <p className="text-xs text-slate-400">+0.3 from last week</p>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-slate-300">This Week</CardTitle>
                  <Calendar className="h-4 w-4 text-purple-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">{stats.thisWeek}</div>
                  <p className="text-xs text-slate-400">Interviews scheduled</p>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Quick Actions</CardTitle>
                  <CardDescription className="text-slate-300">
                    Start a new interview or manage existing sessions
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex space-x-4">
                    <Button 
                      className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
                      onClick={() => setActiveTab("interviews")}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      New Interview
                    </Button>
                    <Button variant="outline" className="border-slate-600 text-slate-300">
                      <Play className="w-4 h-4 mr-2" />
                      Resume Session
                    </Button>
                  </div>
                  <div className="flex space-x-4">
                    <Button 
                      variant="outline" 
                      className="border-slate-600 text-slate-300"
                      onClick={() => setActiveTab("candidates")}
                    >
                      <Users className="w-4 h-4 mr-2" />
                      View Candidates
                    </Button>
                    <Button variant="outline" className="border-slate-600 text-slate-300">
                      <FileText className="w-4 h-4 mr-2" />
                      Generate Report
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Recent Interviews</CardTitle>
                  <CardDescription className="text-slate-300">
                    Latest interview sessions and their status
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentInterviews.length > 0 ? (
                      recentInterviews.map((interview) => (
                        <div key={interview.id} className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full flex items-center justify-center">
                              <MessageSquare className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <p className="text-white font-medium">{interview.candidate}</p>
                              <p className="text-slate-400 text-sm">{interview.position}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            {interview.status === "completed" && interview.score && (
                              <Badge className="bg-green-600 text-white">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                {interview.score}/10
                              </Badge>
                            )}
                            {interview.status === "in-progress" && interview.duration && (
                              <Badge className="bg-yellow-600 text-white">
                                <Clock className="w-3 h-3 mr-1" />
                                {interview.duration}
                              </Badge>
                            )}
                            {interview.status === "scheduled" && (
                              <Badge className="bg-blue-600 text-white">
                                <Calendar className="w-3 h-3 mr-1" />
                                Scheduled
                              </Badge>
                            )}
                            {interview.status === "cancelled" && (
                              <Badge className="bg-red-600 text-white">
                                <AlertCircle className="w-3 h-3 mr-1" />
                                Cancelled
                              </Badge>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <MessageSquare className="w-12 h-12 text-slate-400 mx-auto mb-2" />
                        <p className="text-slate-300">No interviews yet</p>
                        <p className="text-slate-400 text-sm">Start your first interview to see it here</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Interviews Tab */}
          <TabsContent value="interviews">
            <InterviewSession />
          </TabsContent>

          {/* Video Interviews Tab */}
          <TabsContent value="video-interviews">
            <VideoInterview />
          </TabsContent>

          {/* Candidates Tab */}
          <TabsContent value="candidates">
            <CandidateList />
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics">
            <Analytics />
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Interview Reports</CardTitle>
                <CardDescription className="text-slate-300">
                  Generate and view detailed interview reports
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <FileText className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">Reports Coming Soon</h3>
                  <p className="text-slate-300 mb-4">
                    Detailed interview reports and analytics will be available here.
                  </p>
                  <Button className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700">
                    Generate Sample Report
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
} 