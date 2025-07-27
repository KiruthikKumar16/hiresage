"use client"

import { useState, useEffect } from "react"
import { useSession, signOut } from "next-auth/react"
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
  Loader2,
  LogOut,
  User
} from "lucide-react"
import { InterviewSession } from "@/components/interview-session"
import { CandidateList } from "@/components/candidate-list"
import { Analytics } from "@/components/analytics"
import { VideoInterview } from "@/components/video-interview"
import { ProtectedRoute } from "@/components/protected-route"
import { toast } from "sonner"
import Image from "next/image"

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

function DashboardContent() {
  const { data: session } = useSession()
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

  const handleSignOut = async () => {
    try {
      await signOut({ callbackUrl: '/' })
      toast.success('Signed out successfully')
    } catch (error) {
      toast.error('Error signing out')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span className="text-lg">Loading dashboard...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <Image
                  src="/JoCruit_Logo/logo_light.png"
                  alt="JoCruit AI"
                  width={40}
                  height={40}
                  className="w-10 h-10"
                />
                <div>
                  <h1 className="text-2xl font-bold text-white">JoCruit AI</h1>
                  <p className="text-sm text-slate-400">AI-Powered Interview Platform</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-slate-300">
                <User className="h-4 w-4" />
                <span>{session?.user?.name || 'User'}</span>
                {session?.user?.role === 'admin' && (
                  <Badge variant="secondary" className="text-xs">Admin</Badge>
                )}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleSignOut}
                className="border-slate-600 text-slate-300 hover:bg-slate-800"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6 bg-slate-800">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="candidates" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Candidates
            </TabsTrigger>
            <TabsTrigger value="interviews" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Interviews
            </TabsTrigger>
            <TabsTrigger value="video-interviews" className="flex items-center gap-2">
              <Brain className="h-4 w-4" />
              Video Interviews
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Reports
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-slate-300">Total Interviews</CardTitle>
                  <MessageSquare className="h-4 w-4 text-blue-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">{stats.totalInterviews}</div>
                  <p className="text-xs text-slate-400">All time interviews</p>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-slate-300">Completed</CardTitle>
                  <CheckCircle className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">{stats.completedInterviews}</div>
                  <p className="text-xs text-slate-400">Successfully completed</p>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-slate-300">Average Score</CardTitle>
                  <BarChart3 className="h-4 w-4 text-purple-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">{stats.averageScore.toFixed(1)}%</div>
                  <p className="text-xs text-slate-400">Overall performance</p>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-slate-300">Total Candidates</CardTitle>
                  <Users className="h-4 w-4 text-orange-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">{stats.totalCandidates}</div>
                  <p className="text-xs text-slate-400">Registered candidates</p>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-slate-300">This Week</CardTitle>
                  <Calendar className="h-4 w-4 text-pink-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">{stats.thisWeek}</div>
                  <p className="text-xs text-slate-400">Interviews this week</p>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-slate-300">Pending</CardTitle>
                  <Clock className="h-4 w-4 text-yellow-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">{stats.pendingInterviews}</div>
                  <p className="text-xs text-slate-400">Scheduled interviews</p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Interviews */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Recent Interviews</CardTitle>
                <CardDescription className="text-slate-400">Latest interview activities</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentInterviews.length > 0 ? (
                    recentInterviews.map((interview) => (
                      <div key={interview.id} className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-2">
                            {interview.status === 'completed' ? (
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            ) : (
                              <Clock className="h-4 w-4 text-yellow-500" />
                            )}
                            <span className="text-white font-medium">{interview.candidate}</span>
                          </div>
                          <span className="text-slate-400">{interview.position}</span>
                        </div>
                        <div className="flex items-center space-x-4">
                          {interview.score && (
                            <Badge variant="secondary" className="text-xs">
                              {interview.score}%
                            </Badge>
                          )}
                          {interview.duration && (
                            <span className="text-xs text-slate-400">{interview.duration}</span>
                          )}
                          <span className="text-xs text-slate-400">{interview.date}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <MessageSquare className="h-12 w-12 text-slate-600 mx-auto mb-4" />
                      <p className="text-slate-400">No interviews yet</p>
                      <p className="text-sm text-slate-500">Start by creating your first interview</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Candidates Tab */}
          <TabsContent value="candidates">
            <CandidateList />
          </TabsContent>

          {/* Interviews Tab */}
          <TabsContent value="interviews">
            <InterviewSession />
          </TabsContent>

          {/* Video Interviews Tab */}
          <TabsContent value="video-interviews">
            <VideoInterview />
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics">
            <Analytics />
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Reports</CardTitle>
                <CardDescription className="text-slate-400">
                  Generate detailed reports and insights
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-slate-600 mx-auto mb-4" />
                  <p className="text-slate-400">Reports Coming Soon</p>
                  <p className="text-sm text-slate-500">Advanced reporting features will be available soon</p>
                  <Button className="mt-4" disabled>
                    Generate Sample Report
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}

export default function Dashboard() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  )
} 