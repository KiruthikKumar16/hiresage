"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Users, 
  BarChart3, 
  Clock, 
  TrendingUp, 
  Calendar,
  LogOut,
  Menu,
  X,
  Video,
  FileText,
  Settings,
  User,
  Star,
  CheckCircle,
  Plus,
  Search,
  Filter,
  MoreVertical,
  Play,
  Eye,
  Download,
  Edit,
  Trash2,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Timer,
  Target,
  Award,
  Zap,
  AlertTriangle
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useAuth } from "@/components/auth-provider"
import { toast } from "sonner"
import { ProtectedRoute } from "@/components/protected-route"

interface Interview {
  id: string
  candidateName: string
  candidateEmail: string
  position: string
  date: string
  duration: number
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled'
  score: number
  questions: number
  feedback: string
  recordingUrl?: string
  transcriptUrl?: string
}

interface DashboardData {
  totalInterviews: number
  completedInterviews: number
  pendingInterviews: number
  averageScore: number
  recentInterviews: Interview[]
  upcomingInterviews: Interview[]
  performanceMetrics: {
    totalQuestions: number
    averageDuration: number
    successRate: number
    topSkills: string[]
  }
}

export default function Dashboard() {
  const { user, subscription, signOut } = useAuth()
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  useEffect(() => {
    if (user) {
      loadDashboardData()
    }
  }, [user])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch dashboard stats
      const statsResponse = await fetch('/api/dashboard/stats')
      if (!statsResponse.ok) {
        throw new Error('Failed to fetch dashboard stats')
      }
      const statsData = await statsResponse.json()

      // Fetch recent interviews
      const interviewsResponse = await fetch('/api/interviews/recent')
      if (!interviewsResponse.ok) {
        throw new Error('Failed to fetch recent interviews')
      }
      const interviewsData = await interviewsResponse.json()

      // Transform data to match interface
      const transformedData: DashboardData = {
        totalInterviews: statsData.stats.totalInterviews,
        completedInterviews: statsData.stats.completedInterviews,
        pendingInterviews: statsData.stats.totalInterviews - statsData.stats.completedInterviews,
        averageScore: statsData.stats.averageScore,
        recentInterviews: interviewsData.interviews.map((interview: any) => ({
          id: interview.id,
          candidateName: interview.candidateName,
          candidateEmail: 'candidate@example.com', // Would come from user data
          position: interview.position,
          date: new Date(interview.startTime).toLocaleDateString(),
          duration: interview.duration || 0,
          status: interview.status,
          score: interview.overallScore || 0,
          questions: 5, // Default for now
          feedback: '',
          recordingUrl: undefined,
          transcriptUrl: undefined
        })),
        upcomingInterviews: [], // Would be fetched from separate endpoint
        performanceMetrics: {
          totalQuestions: statsData.stats.totalInterviews * 5, // Estimate
          averageDuration: 45, // Default
          successRate: statsData.stats.completedInterviews > 0 ? 
            Math.round((statsData.stats.completedInterviews / statsData.stats.totalInterviews) * 100) : 0,
          topSkills: ['JavaScript', 'React', 'Node.js', 'Python', 'AWS'] // Default
        }
      }

      setDashboardData(transformedData)
    } catch (error) {
      console.error("Failed to load dashboard data:", error)
      setError(error instanceof Error ? error.message : 'Failed to load dashboard data')
      toast.error("Failed to load dashboard data")
    } finally {
      setLoading(false)
    }
  }

  const handleSignOut = async () => {
    try {
      await signOut()
      toast.success("Successfully signed out!")
    } catch (error) {
      toast.error("Failed to sign out")
    }
  }

  const startNewInterview = () => {
    toast.info("Starting new interview...")
    window.location.href = '/interview/live'
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-600'
      case 'in-progress': return 'bg-blue-600'
      case 'scheduled': return 'bg-yellow-600'
      case 'cancelled': return 'bg-red-600'
      default: return 'bg-gray-600'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle2 className="w-4 h-4" />
      case 'in-progress': return <Timer className="w-4 h-4" />
      case 'scheduled': return <Clock className="w-4 h-4" />
      case 'cancelled': return <XCircle className="w-4 h-4" />
      default: return <AlertCircle className="w-4 h-4" />
    }
  }

  const filteredInterviews = dashboardData?.recentInterviews.filter(interview => {
    const matchesSearch = interview.candidateName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         interview.position.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || interview.status === statusFilter
    return matchesSearch && matchesStatus
  }) || []

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
          <p className="text-slate-300">Loading dashboard...</p>
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
            <Button onClick={loadDashboardData} className="bg-blue-600 hover:bg-blue-700">
              Try Again
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 text-white">
        {/* Navigation */}
        <nav className="fixed top-0 w-full z-50 bg-slate-900/95 backdrop-blur-md border-b border-slate-700/50">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <Link href="/" className="flex items-center space-x-3">
                <div className="relative">
                  <Image
                    src="/JoCruit_Logo/logo_full_dark.png"
                    alt="JoCruit AI"
                    width={120}
                    height={40}
                    className="h-10 w-auto"
                  />
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full animate-pulse"></div>
                </div>
                <div>
                  <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
                    JoCruit AI X
                  </h1>
                  <p className="text-xs text-slate-400">Smarter Hiring Starts Here</p>
                </div>
              </Link>

              <div className="hidden md:flex items-center space-x-8">
                <Link href="/" className="text-slate-300 hover:text-white transition-colors">
                  Home
                </Link>
                <Link href="/pricing" className="text-slate-300 hover:text-white transition-colors">
                  Pricing
                </Link>
                <div className="flex items-center space-x-2">
                  <User className="w-4 h-4 text-slate-400" />
                  <span className="text-slate-300">{user?.name || user?.email}</span>
                </div>
                <Button
                  variant="outline"
                  onClick={handleSignOut}
                  className="border-slate-600 text-slate-300 hover:bg-slate-700 bg-slate-700/50"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </Button>
              </div>

              <button className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>

            {/* Mobile Menu */}
            {isMenuOpen && (
              <div className="md:hidden mt-4 pb-4 border-t border-slate-700">
                <div className="flex flex-col space-y-4 pt-4">
                  <Link href="/" className="text-slate-300 hover:text-white transition-colors">
                    Home
                  </Link>
                  <Link href="/pricing" className="text-slate-300 hover:text-white transition-colors">
                    Pricing
                  </Link>
                  <div className="flex items-center space-x-2">
                    <User className="w-4 h-4 text-slate-400" />
                    <span className="text-slate-300">{user?.name || user?.email}</span>
                  </div>
                  <Button
                    variant="outline"
                    onClick={handleSignOut}
                    className="border-slate-600 text-slate-300 hover:bg-slate-700 bg-slate-700/50"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </Button>
                </div>
              </div>
            )}
          </div>
        </nav>

        {/* Main Content */}
        <div className="pt-24 pb-8">
          <div className="container mx-auto px-4">
            {/* Welcome Section */}
            <div className="mb-8">
              <Badge className="mb-4 bg-gradient-to-r from-blue-600/20 to-cyan-600/20 text-cyan-300 border-cyan-500/30">
                Dashboard
              </Badge>
              <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-white via-blue-100 to-cyan-200 bg-clip-text text-transparent">
                Welcome back, {user?.name || user?.email}! 👋
              </h1>
              <p className="text-slate-300">
                Here's your interview performance overview and upcoming sessions
              </p>
              
              {/* Subscription Info */}
              {subscription && (
                <div className="mt-4 p-4 bg-slate-800/50 border border-slate-700 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-white flex items-center">
                        <Award className="w-5 h-5 mr-2 text-yellow-400" />
                        {subscription.plan_name}
                      </h3>
                      <p className="text-slate-300">
                        {subscription.interviews_remaining} interviews remaining
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-slate-400">Plan</p>
                      <p className="text-white font-semibold">${subscription.price_per_interview}/interview</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm hover:bg-slate-800/70 transition-colors">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-slate-300">Total Interviews</CardTitle>
                  <Users className="h-4 w-4 text-blue-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">{dashboardData?.totalInterviews || 0}</div>
                  <p className="text-xs text-slate-400">All time</p>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm hover:bg-slate-800/70 transition-colors">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-slate-300">Completed</CardTitle>
                  <CheckCircle className="h-4 w-4 text-green-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">{dashboardData?.completedInterviews || 0}</div>
                  <p className="text-xs text-slate-400">Successfully finished</p>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm hover:bg-slate-800/70 transition-colors">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-slate-300">Pending</CardTitle>
                  <Clock className="h-4 w-4 text-yellow-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">{dashboardData?.pendingInterviews || 0}</div>
                  <p className="text-xs text-slate-400">Awaiting completion</p>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm hover:bg-slate-800/70 transition-colors">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-slate-300">Avg Score</CardTitle>
                  <TrendingUp className="h-4 w-4 text-purple-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">{dashboardData?.averageScore || 0}%</div>
                  <p className="text-xs text-slate-400">Performance metric</p>
                </CardContent>
              </Card>
            </div>

            {/* Main Dashboard Content */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="grid w-full grid-cols-4 bg-slate-800/50 border-slate-700">
                <TabsTrigger value="overview" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                  Overview
                </TabsTrigger>
                <TabsTrigger value="interviews" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                  Interviews
                </TabsTrigger>
                <TabsTrigger value="upcoming" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                  Upcoming
                </TabsTrigger>
                <TabsTrigger value="analytics" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                  Analytics
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Recent Interviews */}
                  <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle className="text-white">Recent Interviews</CardTitle>
                      <CardDescription className="text-slate-300">
                        Latest interview sessions
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {dashboardData?.recentInterviews.length === 0 ? (
                        <div className="text-center py-8 text-slate-400">
                          <Video className="h-12 w-12 mx-auto mb-4 opacity-50" />
                          <p>No interviews yet. Start your first interview to see results here.</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {dashboardData?.recentInterviews.slice(0, 3).map((interview) => (
                            <div key={interview.id} className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg hover:bg-slate-700/70 transition-colors">
                              <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                                  <User className="w-4 h-4 text-white" />
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-white">{interview.candidateName}</p>
                                  <p className="text-xs text-slate-400">{interview.position}</p>
                                  <p className="text-xs text-slate-400">{interview.date}</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <Badge 
                                  className={`${getStatusColor(interview.status)} text-white`}
                                >
                                  {interview.status}
                                </Badge>
                                {interview.score > 0 && (
                                  <p className="text-xs text-slate-400 mt-1">Score: {interview.score}%</p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Quick Actions */}
                  <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle className="text-white">Quick Actions</CardTitle>
                      <CardDescription className="text-slate-300">
                        Start a new interview or view reports
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 gap-4">
                        <Button 
                          onClick={startNewInterview}
                          className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Start New Interview
                        </Button>
                        <Link href="/reports">
                          <Button variant="outline" className="w-full border-slate-600 text-slate-300 hover:bg-slate-700 bg-slate-700/50">
                            <FileText className="w-4 h-4 mr-2" />
                            View Reports
                          </Button>
                        </Link>
                        <Link href="/settings">
                          <Button variant="outline" className="w-full border-slate-600 text-slate-300 hover:bg-slate-700 bg-slate-700/50">
                            <Settings className="w-4 h-4 mr-2" />
                            Settings
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Performance Metrics */}
                <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-white">Performance Metrics</CardTitle>
                    <CardDescription className="text-slate-300">
                      Key insights from your interviews
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-white mb-2">{dashboardData?.performanceMetrics.totalQuestions || 0}</div>
                        <p className="text-sm text-slate-400">Total Questions</p>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-white mb-2">{dashboardData?.performanceMetrics.averageDuration || 0}min</div>
                        <p className="text-sm text-slate-400">Avg Duration</p>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-white mb-2">{dashboardData?.performanceMetrics.successRate || 0}%</div>
                        <p className="text-sm text-slate-400">Success Rate</p>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-white mb-2">{dashboardData?.performanceMetrics.topSkills.length || 0}</div>
                        <p className="text-sm text-slate-400">Top Skills</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="interviews" className="space-y-6">
                {/* Search and Filter */}
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Search interviews..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Status</option>
                    <option value="scheduled">Scheduled</option>
                    <option value="in-progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>

                {/* Interviews List */}
                <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-white">All Interviews</CardTitle>
                    <CardDescription className="text-slate-300">
                      Complete list of interview sessions
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {filteredInterviews.length === 0 ? (
                      <div className="text-center py-8 text-slate-400">
                        <Video className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>No interviews found. Start your first interview to see results here.</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {filteredInterviews.map((interview) => (
                          <div key={interview.id} className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg hover:bg-slate-700/70 transition-colors">
                            <div className="flex items-center space-x-4">
                              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                                <User className="w-5 h-5 text-white" />
                              </div>
                              <div>
                                <h3 className="text-sm font-medium text-white">{interview.candidateName}</h3>
                                <p className="text-xs text-slate-400">{interview.candidateEmail}</p>
                                <p className="text-xs text-slate-400">{interview.position}</p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-4">
                              <div className="text-right">
                                <p className="text-sm text-white">{interview.date}</p>
                                {interview.duration > 0 && (
                                  <p className="text-xs text-slate-400">{interview.duration} min</p>
                                )}
                              </div>
                              <Badge className={`${getStatusColor(interview.status)} text-white`}>
                                {getStatusIcon(interview.status)}
                                <span className="ml-1">{interview.status}</span>
                              </Badge>
                              {interview.score > 0 && (
                                <div className="text-right">
                                  <p className="text-sm font-medium text-white">{interview.score}%</p>
                                  <p className="text-xs text-slate-400">Score</p>
                                </div>
                              )}
                              <div className="flex items-center space-x-2">
                                {interview.status === 'scheduled' && (
                                  <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                                    <Play className="w-3 h-3 mr-1" />
                                    Start
                                  </Button>
                                )}
                                {interview.status === 'completed' && (
                                  <>
                                    <Button size="sm" variant="outline" className="border-slate-600 text-slate-300">
                                      <Eye className="w-3 h-3 mr-1" />
                                      View
                                    </Button>
                                    <Button size="sm" variant="outline" className="border-slate-600 text-slate-300">
                                      <Download className="w-3 h-3 mr-1" />
                                      Report
                                    </Button>
                                  </>
                                )}
                                <Button size="sm" variant="outline" className="border-slate-600 text-slate-300">
                                  <MoreVertical className="w-3 h-3" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="upcoming" className="space-y-6">
                <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-white">Upcoming Interviews</CardTitle>
                    <CardDescription className="text-slate-300">
                      Scheduled interview sessions
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {dashboardData?.upcomingInterviews.length === 0 ? (
                      <div className="text-center py-8 text-slate-400">
                        <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>No upcoming interviews scheduled.</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {dashboardData?.upcomingInterviews.map((interview) => (
                          <div key={interview.id} className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg hover:bg-slate-700/70 transition-colors">
                            <div className="flex items-center space-x-4">
                              <div className="w-10 h-10 bg-yellow-600 rounded-full flex items-center justify-center">
                                <Clock className="w-5 h-5 text-white" />
                              </div>
                              <div>
                                <h3 className="text-sm font-medium text-white">{interview.candidateName}</h3>
                                <p className="text-xs text-slate-400">{interview.candidateEmail}</p>
                                <p className="text-xs text-slate-400">{interview.position}</p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-4">
                              <div className="text-right">
                                <p className="text-sm text-white">{interview.date}</p>
                                <p className="text-xs text-slate-400">Scheduled</p>
                              </div>
                              <Badge className="bg-yellow-600 text-white">
                                <Clock className="w-4 h-4 mr-1" />
                                Scheduled
                              </Badge>
                              <div className="flex items-center space-x-2">
                                <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                                  <Play className="w-3 h-3 mr-1" />
                                  Start
                                </Button>
                                <Button size="sm" variant="outline" className="border-slate-600 text-slate-300">
                                  <Edit className="w-3 h-3 mr-1" />
                                  Edit
                                </Button>
                                <Button size="sm" variant="outline" className="border-slate-600 text-slate-300">
                                  <X className="w-3 h-3" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="analytics" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Performance Chart */}
                  <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle className="text-white">Performance Overview</CardTitle>
                      <CardDescription className="text-slate-300">
                        Interview success rates and scores
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center py-8">
                        <BarChart3 className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                        <p className="text-slate-300">Performance charts coming soon...</p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Top Skills */}
                  <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle className="text-white">Top Skills Assessed</CardTitle>
                      <CardDescription className="text-slate-300">
                        Most frequently evaluated skills
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {dashboardData?.performanceMetrics.topSkills.length === 0 ? (
                        <div className="text-center py-8 text-slate-400">
                          <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
                          <p>No skills data available yet.</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {dashboardData?.performanceMetrics.topSkills.map((skill, index) => (
                            <div key={skill} className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                                  <span className="text-xs text-white font-bold">{index + 1}</span>
                                </div>
                                <span className="text-sm text-white">{skill}</span>
                              </div>
                              <Badge className="bg-blue-600/20 text-blue-300 border-blue-500/30">
                                {Math.floor(Math.random() * 20) + 80}%
                              </Badge>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* Floating Elements */}
        <div className="fixed top-20 left-10 w-20 h-20 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full animate-bounce"></div>
        <div className="fixed bottom-20 right-10 w-16 h-16 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-full animate-pulse"></div>
      </div>
    </ProtectedRoute>
  )
} 