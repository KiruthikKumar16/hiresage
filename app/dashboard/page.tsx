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
  CheckCircle
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useAuth } from "@/components/auth-provider"
import { toast } from "sonner"
import { ProtectedRoute } from "@/components/protected-route"

interface DashboardData {
  totalInterviews: number
  completedInterviews: number
  pendingInterviews: number
  averageScore: number
  recentInterviews: Array<{
    id: string
    candidateName: string
    date: string
    status: string
    score: number
  }>
}

export default function Dashboard() {
  const { user, subscription, signOut } = useAuth()
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  useEffect(() => {
    // Simulate loading dashboard data
    const loadDashboardData = async () => {
      try {
        // In a real app, this would be an API call
        const mockData: DashboardData = {
          totalInterviews: 24,
          completedInterviews: 18,
          pendingInterviews: 6,
          averageScore: 85,
          recentInterviews: [
            {
              id: "1",
              candidateName: "Sarah Johnson",
              date: "2024-01-15",
              status: "Completed",
              score: 92
            },
            {
              id: "2", 
              candidateName: "Michael Chen",
              date: "2024-01-14",
              status: "Completed",
              score: 78
            },
            {
              id: "3",
              candidateName: "Emily Davis",
              date: "2024-01-13", 
              status: "Pending",
              score: 0
            }
          ]
        }
        
        setDashboardData(mockData)
      } catch (error) {
        console.error("Failed to load dashboard data:", error)
      } finally {
        setLoading(false)
      }
    }

    loadDashboardData()
  }, [])

  const handleSignOut = async () => {
    try {
      await signOut()
      toast.success("Successfully signed out!")
    } catch (error) {
      toast.error("Failed to sign out")
    }
  }

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`
  }

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
                Welcome back, {user?.name || user?.email}!
              </h1>
              <p className="text-slate-300">
                Here's your interview performance overview
              </p>
              
              {/* Subscription Info */}
              {subscription && (
                <div className="mt-4 p-4 bg-slate-800/50 border border-slate-700 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-white">{subscription.plan_name}</h3>
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
              <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-slate-300">Total Interviews</CardTitle>
                  <Users className="h-4 w-4 text-blue-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">{dashboardData?.totalInterviews}</div>
                  <p className="text-xs text-slate-400">All time</p>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-slate-300">Completed</CardTitle>
                  <CheckCircle className="h-4 w-4 text-green-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">{dashboardData?.completedInterviews}</div>
                  <p className="text-xs text-slate-400">Successfully finished</p>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-slate-300">Pending</CardTitle>
                  <Clock className="h-4 w-4 text-yellow-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">{dashboardData?.pendingInterviews}</div>
                  <p className="text-xs text-slate-400">Awaiting completion</p>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-slate-300">Avg Score</CardTitle>
                  <TrendingUp className="h-4 w-4 text-purple-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">{dashboardData?.averageScore}%</div>
                  <p className="text-xs text-slate-400">Performance metric</p>
                </CardContent>
              </Card>
            </div>

            {/* Main Dashboard Content */}
            <Tabs defaultValue="overview" className="space-y-6">
              <TabsList className="grid w-full grid-cols-3 bg-slate-800/50 border-slate-700">
                <TabsTrigger value="overview" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                  Overview
                </TabsTrigger>
                <TabsTrigger value="interviews" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                  Interviews
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
                      <div className="space-y-4">
                        {dashboardData?.recentInterviews.map((interview) => (
                          <div key={interview.id} className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                                <User className="w-4 h-4 text-white" />
                              </div>
                              <div>
                                <p className="text-sm font-medium text-white">{interview.candidateName}</p>
                                <p className="text-xs text-slate-400">{interview.date}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <Badge 
                                variant={interview.status === "Completed" ? "default" : "secondary"}
                                className={interview.status === "Completed" ? "bg-green-600" : "bg-yellow-600"}
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
                        <Button className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700">
                          <Video className="w-4 h-4 mr-2" />
                          Start New Interview
                        </Button>
                        <Button variant="outline" className="w-full border-slate-600 text-slate-300 hover:bg-slate-700 bg-slate-700/50">
                          <FileText className="w-4 h-4 mr-2" />
                          View Reports
                        </Button>
                        <Button variant="outline" className="w-full border-slate-600 text-slate-300 hover:bg-slate-700 bg-slate-700/50">
                          <Settings className="w-4 h-4 mr-2" />
                          Settings
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="interviews" className="space-y-6">
                <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-white">All Interviews</CardTitle>
                    <CardDescription className="text-slate-300">
                      Complete list of interview sessions
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8">
                      <Video className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                      <p className="text-slate-300">Interview management coming soon...</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="analytics" className="space-y-6">
                <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-white">Analytics</CardTitle>
                    <CardDescription className="text-slate-300">
                      Detailed performance insights
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8">
                      <BarChart3 className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                      <p className="text-slate-300">Analytics dashboard coming soon...</p>
                    </div>
                  </CardContent>
                </Card>
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