"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { 
  Video, 
  Mic, 
  MicOff, 
  Camera, 
  CameraOff,
  Play,
  Pause,
  Square,
  RotateCcw,
  Settings,
  ArrowLeft,
  Clock,
  User,
  Mail,
  Building,
  FileText,
  CheckCircle,
  AlertCircle,
  Zap,
  Target,
  Brain,
  MessageSquare,
  Download
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useAuth } from "@/components/auth-provider"
import { toast } from "sonner"
import { ProtectedRoute } from "@/components/protected-route"

interface InterviewState {
  isRecording: boolean
  isVideoOn: boolean
  isAudioOn: boolean
  currentQuestion: number
  totalQuestions: number
  timeElapsed: number
  isPaused: boolean
}

interface Question {
  id: string
  text: string
  category: string
  difficulty: 'easy' | 'medium' | 'hard'
  timeLimit: number
}

export default function NewInterview() {
  const { user, subscription } = useAuth()
  const [interviewState, setInterviewState] = useState<InterviewState>({
    isRecording: false,
    isVideoOn: true,
    isAudioOn: true,
    currentQuestion: 0,
    totalQuestions: 8,
    timeElapsed: 0,
    isPaused: false
  })
  const [candidateInfo, setCandidateInfo] = useState({
    name: '',
    email: '',
    position: '',
    company: '',
    experience: '',
    skills: ''
  })
  const [currentStep, setCurrentStep] = useState<'setup' | 'preparation' | 'interview' | 'summary'>('setup')
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (interviewState.isRecording && !interviewState.isPaused) {
      const timer = setInterval(() => {
        setInterviewState(prev => ({
          ...prev,
          timeElapsed: prev.timeElapsed + 1
        }))
      }, 1000)
      return () => clearInterval(timer)
    }
  }, [interviewState.isRecording, interviewState.isPaused])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const generateQuestions = async () => {
    setLoading(true)
    try {
      // Simulate AI question generation
      const mockQuestions: Question[] = [
        {
          id: "1",
          text: "Can you walk me through your experience with React and how you would optimize a component for performance?",
          category: "Frontend Development",
          difficulty: "medium",
          timeLimit: 180
        },
        {
          id: "2",
          text: "Describe a challenging project you worked on and how you overcame the obstacles you faced.",
          category: "Problem Solving",
          difficulty: "hard",
          timeLimit: 240
        },
        {
          id: "3",
          text: "How do you handle state management in large applications? What are your preferred tools and why?",
          category: "Architecture",
          difficulty: "medium",
          timeLimit: 200
        },
        {
          id: "4",
          text: "Explain the difference between REST and GraphQL APIs. When would you choose one over the other?",
          category: "Backend Development",
          difficulty: "medium",
          timeLimit: 180
        },
        {
          id: "5",
          text: "How do you ensure code quality in your projects? What testing strategies do you use?",
          category: "Quality Assurance",
          difficulty: "easy",
          timeLimit: 150
        },
        {
          id: "6",
          text: "Describe your experience with CI/CD pipelines. What tools have you used and what challenges have you faced?",
          category: "DevOps",
          difficulty: "hard",
          timeLimit: 200
        },
        {
          id: "7",
          text: "How do you stay updated with the latest technologies and industry trends?",
          category: "Learning",
          difficulty: "easy",
          timeLimit: 120
        },
        {
          id: "8",
          text: "Tell me about a time when you had to work with a difficult team member. How did you handle the situation?",
          category: "Soft Skills",
          difficulty: "medium",
          timeLimit: 180
        }
      ]
      
      setQuestions(mockQuestions)
      setCurrentStep('preparation')
      toast.success("Questions generated successfully!")
    } catch (error) {
      toast.error("Failed to generate questions")
    } finally {
      setLoading(false)
    }
  }

  const startInterview = () => {
    setInterviewState(prev => ({ ...prev, isRecording: true }))
    setCurrentStep('interview')
    toast.success("Interview started!")
  }

  const toggleVideo = () => {
    setInterviewState(prev => ({ ...prev, isVideoOn: !prev.isVideoOn }))
    toast.info(interviewState.isVideoOn ? "Video turned off" : "Video turned on")
  }

  const toggleAudio = () => {
    setInterviewState(prev => ({ ...prev, isAudioOn: !prev.isAudioOn }))
    toast.info(interviewState.isAudioOn ? "Audio turned off" : "Audio turned on")
  }

  const pauseInterview = () => {
    setInterviewState(prev => ({ ...prev, isPaused: !prev.isPaused }))
    toast.info(interviewState.isPaused ? "Interview resumed" : "Interview paused")
  }

  const nextQuestion = () => {
    if (interviewState.currentQuestion < interviewState.totalQuestions - 1) {
      setInterviewState(prev => ({ ...prev, currentQuestion: prev.currentQuestion + 1 }))
    } else {
      setCurrentStep('summary')
    }
  }

  const previousQuestion = () => {
    if (interviewState.currentQuestion > 0) {
      setInterviewState(prev => ({ ...prev, currentQuestion: prev.currentQuestion - 1 }))
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-600'
      case 'medium': return 'bg-yellow-600'
      case 'hard': return 'bg-red-600'
      default: return 'bg-gray-600'
    }
  }

  if (currentStep === 'setup') {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 text-white">
          {/* Navigation */}
          <nav className="fixed top-0 w-full z-50 bg-slate-900/95 backdrop-blur-md border-b border-slate-700/50">
            <div className="container mx-auto px-4 py-4">
              <div className="flex items-center justify-between">
                <Link href="/dashboard" className="flex items-center space-x-2 text-slate-300 hover:text-white transition-colors">
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to Dashboard</span>
                </Link>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <User className="w-4 h-4 text-slate-400" />
                    <span className="text-slate-300">{user?.name || user?.email}</span>
                  </div>
                </div>
              </div>
            </div>
          </nav>

          {/* Main Content */}
          <div className="pt-24 pb-8">
            <div className="container mx-auto px-4 max-w-4xl">
              <div className="text-center mb-8">
                <Badge className="mb-4 bg-gradient-to-r from-blue-600/20 to-cyan-600/20 text-cyan-300 border-cyan-500/30">
                  New Interview
                </Badge>
                <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-white via-blue-100 to-cyan-200 bg-clip-text text-transparent">
                  Start a New Interview
                </h1>
                <p className="text-slate-300">
                  Set up candidate information and prepare for the interview
                </p>
              </div>

              {/* Setup Form */}
              <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white">Candidate Information</CardTitle>
                  <CardDescription className="text-slate-300">
                    Enter the candidate's details to personalize the interview
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-slate-300">Full Name</Label>
                      <Input
                        id="name"
                        value={candidateInfo.name}
                        onChange={(e) => setCandidateInfo(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Enter candidate's full name"
                        className="bg-slate-700/50 border-slate-600 text-white placeholder-slate-400"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-slate-300">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={candidateInfo.email}
                        onChange={(e) => setCandidateInfo(prev => ({ ...prev, email: e.target.value }))}
                        placeholder="candidate@email.com"
                        className="bg-slate-700/50 border-slate-600 text-white placeholder-slate-400"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="position" className="text-slate-300">Position</Label>
                      <Input
                        id="position"
                        value={candidateInfo.position}
                        onChange={(e) => setCandidateInfo(prev => ({ ...prev, position: e.target.value }))}
                        placeholder="e.g., Frontend Developer"
                        className="bg-slate-700/50 border-slate-600 text-white placeholder-slate-400"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="company" className="text-slate-300">Current Company</Label>
                      <Input
                        id="company"
                        value={candidateInfo.company}
                        onChange={(e) => setCandidateInfo(prev => ({ ...prev, company: e.target.value }))}
                        placeholder="Current or previous company"
                        className="bg-slate-700/50 border-slate-600 text-white placeholder-slate-400"
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="experience" className="text-slate-300">Years of Experience</Label>
                      <Input
                        id="experience"
                        value={candidateInfo.experience}
                        onChange={(e) => setCandidateInfo(prev => ({ ...prev, experience: e.target.value }))}
                        placeholder="e.g., 3-5 years"
                        className="bg-slate-700/50 border-slate-600 text-white placeholder-slate-400"
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="skills" className="text-slate-300">Key Skills</Label>
                      <Textarea
                        id="skills"
                        value={candidateInfo.skills}
                        onChange={(e) => setCandidateInfo(prev => ({ ...prev, skills: e.target.value }))}
                        placeholder="e.g., React, Node.js, TypeScript, AWS"
                        className="bg-slate-700/50 border-slate-600 text-white placeholder-slate-400"
                        rows={3}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <div className="mt-8 flex justify-center">
                <Button
                  onClick={generateQuestions}
                  disabled={loading || !candidateInfo.name || !candidateInfo.position}
                  className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 px-8 py-3 text-lg"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Generating Questions...
                    </>
                  ) : (
                    <>
                      <Brain className="w-5 h-5 mr-2" />
                      Generate Questions
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  if (currentStep === 'preparation') {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 text-white">
          {/* Navigation */}
          <nav className="fixed top-0 w-full z-50 bg-slate-900/95 backdrop-blur-md border-b border-slate-700/50">
            <div className="container mx-auto px-4 py-4">
              <div className="flex items-center justify-between">
                <Link href="/dashboard" className="flex items-center space-x-2 text-slate-300 hover:text-white transition-colors">
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to Dashboard</span>
                </Link>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <User className="w-4 h-4 text-slate-400" />
                    <span className="text-slate-300">{user?.name || user?.email}</span>
                  </div>
                </div>
              </div>
            </div>
          </nav>

          {/* Main Content */}
          <div className="pt-24 pb-8">
            <div className="container mx-auto px-4 max-w-6xl">
              <div className="text-center mb-8">
                <Badge className="mb-4 bg-gradient-to-r from-green-600/20 to-emerald-600/20 text-emerald-300 border-emerald-500/30">
                  Preparation
                </Badge>
                <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-white via-blue-100 to-cyan-200 bg-clip-text text-transparent">
                  Interview Questions Generated
                </h1>
                <p className="text-slate-300">
                  Review the questions and prepare for the interview
                </p>
              </div>

              {/* Candidate Info Summary */}
              <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm mb-8">
                <CardHeader>
                  <CardTitle className="text-white">Candidate Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-center space-x-2">
                      <User className="w-4 h-4 text-slate-400" />
                      <span className="text-slate-300">{candidateInfo.name}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Mail className="w-4 h-4 text-slate-400" />
                      <span className="text-slate-300">{candidateInfo.email}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Building className="w-4 h-4 text-slate-400" />
                      <span className="text-slate-300">{candidateInfo.position}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Questions List */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h2 className="text-xl font-semibold text-white mb-4">Generated Questions</h2>
                  <div className="space-y-4">
                    {questions.map((question, index) => (
                      <Card key={question.id} className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-3">
                            <Badge className={`${getDifficultyColor(question.difficulty)} text-white`}>
                              {question.difficulty}
                            </Badge>
                            <span className="text-sm text-slate-400">Q{index + 1}</span>
                          </div>
                          <p className="text-white mb-3">{question.text}</p>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-slate-400">{question.category}</span>
                            <span className="text-xs text-slate-400">{question.timeLimit}s</span>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                <div>
                  <h2 className="text-xl font-semibold text-white mb-4">Interview Setup</h2>
                  <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle className="text-white">Interview Settings</CardTitle>
                      <CardDescription className="text-slate-300">
                        Configure your interview environment
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Camera className="w-4 h-4 text-slate-400" />
                          <span className="text-slate-300">Video Recording</span>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={toggleVideo}
                          className="border-slate-600 text-slate-300"
                        >
                          {interviewState.isVideoOn ? 'On' : 'Off'}
                        </Button>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Mic className="w-4 h-4 text-slate-400" />
                          <span className="text-slate-300">Audio Recording</span>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={toggleAudio}
                          className="border-slate-600 text-slate-300"
                        >
                          {interviewState.isAudioOn ? 'On' : 'Off'}
                        </Button>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Clock className="w-4 h-4 text-slate-400" />
                          <span className="text-slate-300">Total Questions</span>
                        </div>
                        <span className="text-white font-semibold">{questions.length}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Target className="w-4 h-4 text-slate-400" />
                          <span className="text-slate-300">Estimated Duration</span>
                        </div>
                        <span className="text-white font-semibold">~25 minutes</span>
                      </div>
                    </CardContent>
                  </Card>

                  <div className="mt-6">
                    <Button
                      onClick={startInterview}
                      className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 py-3 text-lg"
                    >
                      <Play className="w-5 h-5 mr-2" />
                      Start Interview
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  if (currentStep === 'interview') {
    const currentQuestion = questions[interviewState.currentQuestion]
    
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 text-white">
          {/* Interview Header */}
          <div className="fixed top-0 w-full z-50 bg-slate-900/95 backdrop-blur-md border-b border-slate-700/50">
            <div className="container mx-auto px-4 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-slate-400" />
                    <span className="text-white font-mono">{formatTime(interviewState.timeElapsed)}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <FileText className="w-4 h-4 text-slate-400" />
                    <span className="text-slate-300">Question {interviewState.currentQuestion + 1} of {interviewState.totalQuestions}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={toggleVideo}
                    className="border-slate-600 text-slate-300"
                  >
                    {interviewState.isVideoOn ? <Camera className="w-4 h-4" /> : <CameraOff className="w-4 h-4" />}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={toggleAudio}
                    className="border-slate-600 text-slate-300"
                  >
                    {interviewState.isAudioOn ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={pauseInterview}
                    className="border-slate-600 text-slate-300"
                  >
                    {interviewState.isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="pt-24 pb-8">
            <div className="container mx-auto px-4 max-w-4xl">
              {/* Current Question */}
              <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm mb-8">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-white">Current Question</CardTitle>
                    <Badge className={`${getDifficultyColor(currentQuestion?.difficulty)} text-white`}>
                      {currentQuestion?.difficulty}
                    </Badge>
                  </div>
                  <CardDescription className="text-slate-300">
                    {currentQuestion?.category} • {currentQuestion?.timeLimit} seconds
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-lg text-white leading-relaxed">{currentQuestion?.text}</p>
                </CardContent>
              </Card>

              {/* Navigation */}
              <div className="flex justify-between items-center">
                <Button
                  variant="outline"
                  onClick={previousQuestion}
                  disabled={interviewState.currentQuestion === 0}
                  className="border-slate-600 text-slate-300"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Previous
                </Button>
                
                <div className="flex items-center space-x-4">
                  <span className="text-slate-300">
                    {interviewState.currentQuestion + 1} of {interviewState.totalQuestions}
                  </span>
                </div>

                <Button
                  onClick={nextQuestion}
                  className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
                >
                  {interviewState.currentQuestion === interviewState.totalQuestions - 1 ? (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Finish Interview
                    </>
                  ) : (
                    <>
                      Next
                      <ArrowLeft className="w-4 h-4 ml-2 rotate-180" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  if (currentStep === 'summary') {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 text-white">
          {/* Navigation */}
          <nav className="fixed top-0 w-full z-50 bg-slate-900/95 backdrop-blur-md border-b border-slate-700/50">
            <div className="container mx-auto px-4 py-4">
              <div className="flex items-center justify-between">
                <Link href="/dashboard" className="flex items-center space-x-2 text-slate-300 hover:text-white transition-colors">
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to Dashboard</span>
                </Link>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <User className="w-4 h-4 text-slate-400" />
                    <span className="text-slate-300">{user?.name || user?.email}</span>
                  </div>
                </div>
              </div>
            </div>
          </nav>

          {/* Main Content */}
          <div className="pt-24 pb-8">
            <div className="container mx-auto px-4 max-w-4xl">
              <div className="text-center mb-8">
                <Badge className="mb-4 bg-gradient-to-r from-green-600/20 to-emerald-600/20 text-emerald-300 border-emerald-500/30">
                  Interview Complete
                </Badge>
                <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-white via-blue-100 to-cyan-200 bg-clip-text text-transparent">
                  Interview Summary
                </h1>
                <p className="text-slate-300">
                  Review the interview results and generate the final report
                </p>
              </div>

              {/* Summary Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
                  <CardContent className="p-6 text-center">
                    <Clock className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-white">{formatTime(interviewState.timeElapsed)}</div>
                    <p className="text-sm text-slate-400">Total Duration</p>
                  </CardContent>
                </Card>
                <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
                  <CardContent className="p-6 text-center">
                    <FileText className="w-8 h-8 text-green-400 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-white">{interviewState.totalQuestions}</div>
                    <p className="text-sm text-slate-400">Questions Asked</p>
                  </CardContent>
                </Card>
                <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
                  <CardContent className="p-6 text-center">
                    <Target className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-white">85%</div>
                    <p className="text-sm text-slate-400">Estimated Score</p>
                  </CardContent>
                </Card>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700">
                  <FileText className="w-4 h-4 mr-2" />
                  Generate Report
                </Button>
                <Button variant="outline" className="border-slate-600 text-slate-300">
                  <Download className="w-4 h-4 mr-2" />
                  Download Recording
                </Button>
                <Button variant="outline" className="border-slate-600 text-slate-300">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Send Feedback
                </Button>
              </div>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  return null
} 