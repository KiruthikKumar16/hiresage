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
  Loader2,
  LogOut,
  User
} from "lucide-react"
import { InterviewSession } from "@/components/interview-session"
import { CandidateList } from "@/components/candidate-list"
import { Analytics } from "@/components/analytics"
import { VideoInterview } from "@/components/video-interview"
import { ProtectedRoute } from "@/components/protected-route"
import { useAuth } from "@/components/auth-provider"
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
  const { user, signOut } = useAuth()
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
          duration: interview.duration ? `${Math.floor(interview.duration / 60)}m ${interview.duration % 60}s` : undefined,
          date: new Date(interview.createdAt).toLocaleDateString()
        }))
        setRecentInterviews(interviews)
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSignOut = async () => {
    try {
      await signOut()
      toast.success("Signed out successfully")
    } catch (error) {
      toast.error("Error signing out")
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Image
                src="/JoCruit_Logo/logo_full_dark.png"
                alt="JoCruit AI"
                width={120}
                height={40}
                className="h-8 w-auto"
              />
              <h1 className="text-xl font-semibold text-gray-900">Dashboard</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-700">{user?.name || user?.email}</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleSignOut}
                className="flex items-center space-x-2"
              >
                <LogOut className="h-4 w-4" />
                <span>Sign Out</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="candidates">Candidates</TabsTrigger>
            <TabsTrigger value="interviews">Interviews</TabsTrigger>
            <TabsTrigger value="video">Video Interviews</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Interviews</CardTitle>
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalInterviews}</div>
                  <p className="text-xs text-muted-foreground">
                    +{stats.thisWeek} this week
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Completed</CardTitle>
                  <CheckCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.completedInterviews}</div>
                  <p className="text-xs text-muted-foreground">
                    {stats.totalInterviews > 0 ? Math.round((stats.completedInterviews / stats.totalInterviews) * 100) : 0}% completion rate
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Average Score</CardTitle>
                  <Brain className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.averageScore}%</div>
                  <p className="text-xs text-muted-foreground">
                    Across all interviews
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Candidates</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalCandidates}</div>
                  <p className="text-xs text-muted-foreground">
                    In the system
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Interviews */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Interviews</CardTitle>
                <CardDescription>
                  Latest interview sessions and their status
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentInterviews.length > 0 ? (
                    recentInterviews.map((interview) => (
                      <div key={interview.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className="flex-shrink-0">
                            <User className="h-8 w-8 text-gray-400" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{interview.candidate}</p>
                            <p className="text-sm text-gray-500">{interview.position}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <Badge variant={interview.status === 'completed' ? 'default' : 'secondary'}>
                            {interview.status}
                          </Badge>
                          {interview.score && (
                            <span className="text-sm text-gray-500">{interview.score}%</span>
                          )}
                          {interview.duration && (
                            <span className="text-sm text-gray-500">{interview.duration}</span>
                          )}
                          <span className="text-sm text-gray-500">{interview.date}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      No interviews yet. Start by creating a new interview session.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="candidates">
            <CandidateList />
          </TabsContent>

          <TabsContent value="interviews">
            <InterviewSession />
          </TabsContent>

          <TabsContent value="video">
            <VideoInterview />
          </TabsContent>

          <TabsContent value="analytics">
            <Analytics />
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