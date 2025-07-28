"use client"

import { useState, useEffect, useRef } from "react"
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
  Download,
  Volume2,
  VolumeX,
  Monitor,
  MonitorOff,
  StopCircle,
  SkipForward,
  SkipBack
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
  isScreenShareOn: boolean
  currentQuestion: number
  totalQuestions: number
  timeElapsed: number
  isPaused: boolean
  isListening: boolean
  aiSpeaking: boolean
}

interface Question {
  id: string
  text: string
  category: string
  difficulty: 'easy' | 'medium' | 'hard'
  timeLimit: number
  followUpQuestions?: string[]
}

interface CandidateInfo {
  name: string
  email: string
  position: string
  company: string
  experience: string
  skills: string
}

export default function NewInterview() {
  const { user, subscription } = useAuth()
  const [interviewState, setInterviewState] = useState<InterviewState>({
    isRecording: false,
    isVideoOn: true,
    isAudioOn: true,
    isScreenShareOn: false,
    currentQuestion: 0,
    totalQuestions: 8,
    timeElapsed: 0,
    isPaused: false,
    isListening: false,
    aiSpeaking: false
  })
  const [candidateInfo, setCandidateInfo] = useState<CandidateInfo>({
    name: '',
    email: '',
    position: '',
    company: '',
    experience: '',
    skills: ''
  })
  const [currentStep, setCurrentStep] = useState<'setup' | 'preparation' | 'interview' | 'summary'>('setup')
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null)
  const [aiResponse, setAiResponse] = useState<string>('')
  const [userResponse, setUserResponse] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [interviewTranscript, setInterviewTranscript] = useState<string[]>([])
  
  const videoRef = useRef<HTMLVideoElement>(null)
  const audioRef = useRef<HTMLAudioElement>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const streamRef = useRef<MediaStream | null>(null)

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

  const startInterview = async () => {
    try {
      setLoading(true)
      
      // Start video/audio stream
      const stream = await navigator.mediaDevices.getUserMedia({
        video: interviewState.isVideoOn,
        audio: interviewState.isAudioOn
      })
      
      streamRef.current = stream
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }

      // Start recording
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      
      const chunks: Blob[] = []
      mediaRecorder.ondataavailable = (event) => {
        chunks.push(event.data)
      }
      
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' })
        const url = URL.createObjectURL(blob)
        // Save recording URL for later download
        sessionStorage.setItem('interview_recording', url)
      }
      
      mediaRecorder.start()
      
      setInterviewState(prev => ({ ...prev, isRecording: true }))
      setCurrentStep('interview')
      
      // Start AI interview
      await startAIInterview()
      
      toast.success("Interview started!")
    } catch (error) {
      console.error('Failed to start interview:', error)
      toast.error("Failed to start interview. Please check your camera and microphone permissions.")
    } finally {
      setLoading(false)
    }
  }

  const startAIInterview = async () => {
    // Generate first question based on candidate info
    const firstQuestion = await generateAIQuestion(0)
    setCurrentQuestion(firstQuestion)
    
    // Start AI speaking
    await speakQuestion(firstQuestion.text)
  }

  const generateAIQuestion = async (questionIndex: number): Promise<Question> => {
    // In production, this would call the Gemini API
    const questions: Question[] = [
      {
        id: "1",
        text: "Hello! I'm your AI interviewer. Can you tell me about your background and experience?",
        category: "Introduction",
        difficulty: "easy" as const,
        timeLimit: 120
      },
      {
        id: "2",
        text: "Great! Now, can you walk me through a challenging project you worked on recently?",
        category: "Experience",
        difficulty: "medium" as const,
        timeLimit: 180
      },
      {
        id: "3",
        text: "That's interesting. How do you handle conflicts within your team?",
        category: "Soft Skills",
        difficulty: "medium" as const,
        timeLimit: 150
      },
      {
        id: "4",
        text: "Can you explain your approach to problem-solving when you encounter a difficult technical challenge?",
        category: "Problem Solving",
        difficulty: "hard" as const,
        timeLimit: 200
      },
      {
        id: "5",
        text: "How do you stay updated with the latest technologies and industry trends?",
        category: "Learning",
        difficulty: "easy" as const,
        timeLimit: 120
      },
      {
        id: "6",
        text: "Describe a time when you had to learn a new technology quickly. How did you approach it?",
        category: "Adaptability",
        difficulty: "medium" as const,
        timeLimit: 180
      },
      {
        id: "7",
        text: "What are your career goals for the next 2-3 years?",
        category: "Career Goals",
        difficulty: "easy" as const,
        timeLimit: 120
      },
      {
        id: "8",
        text: "Thank you for your time! Do you have any questions for me about the role or company?",
        category: "Closing",
        difficulty: "easy" as const,
        timeLimit: 120
      }
    ]
    
    return questions[questionIndex] || questions[0]
  }

  const speakQuestion = async (text: string) => {
    setInterviewState(prev => ({ ...prev, aiSpeaking: true }))
    
    // Use Web Speech API for text-to-speech
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.rate = 0.9
      utterance.pitch = 1
      utterance.volume = 0.8
      
      utterance.onend = () => {
        setInterviewState(prev => ({ ...prev, aiSpeaking: false, isListening: true }))
        startListening()
      }
      
      speechSynthesis.speak(utterance)
    } else {
      // Fallback: just show the question
      setInterviewState(prev => ({ ...prev, aiSpeaking: false, isListening: true }))
      startListening()
    }
  }

  const startListening = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      const recognition = new SpeechRecognition()
      
      recognition.continuous = true
      recognition.interimResults = true
      recognition.lang = 'en-US'
      
      recognition.onresult = (event: any) => {
        let finalTranscript = ''
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript
          }
        }
        
        if (finalTranscript) {
          setUserResponse(finalTranscript)
          setInterviewTranscript(prev => [...prev, `AI: ${currentQuestion?.text}`, `Candidate: ${finalTranscript}`])
        }
      }
      
      recognition.onend = () => {
        // Stop listening after a timeout
        setTimeout(() => {
          setInterviewState(prev => ({ ...prev, isListening: false }))
          processUserResponse()
        }, 5000)
      }
      
      recognition.start()
    } else {
      // Fallback for browsers without speech recognition
      setInterviewState(prev => ({ ...prev, isListening: false }))
    }
  }

  const processUserResponse = async () => {
    if (!currentQuestion) return
    
    // Analyze user response with AI
    const analysis = await analyzeResponse(userResponse, currentQuestion)
    
    // Generate follow-up question or move to next question
    if (interviewState.currentQuestion < interviewState.totalQuestions - 1) {
      const nextQuestion = await generateAIQuestion(interviewState.currentQuestion + 1)
      setCurrentQuestion(nextQuestion)
      setInterviewState(prev => ({ 
        ...prev, 
        currentQuestion: prev.currentQuestion + 1 
      }))
      setUserResponse('')
      
      // Speak next question
      await speakQuestion(nextQuestion.text)
    } else {
      // Interview complete
      endInterview()
    }
  }

  const analyzeResponse = async (response: string, question: Question) => {
    // In production, this would call Gemini API for analysis
    return {
      score: Math.floor(Math.random() * 30) + 70,
      feedback: "Good response with room for improvement",
      keywords: ["technical", "experience", "problem-solving"]
    }
  }

  const endInterview = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop()
    }
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
    }
    
    setInterviewState(prev => ({ ...prev, isRecording: false }))
    setCurrentStep('summary')
    
    toast.success("Interview completed!")
  }

  const toggleVideo = () => {
    setInterviewState(prev => ({ ...prev, isVideoOn: !prev.isVideoOn }))
    toast.info(interviewState.isVideoOn ? "Video turned off" : "Video turned on")
  }

  const toggleAudio = () => {
    setInterviewState(prev => ({ ...prev, isAudioOn: !prev.isAudioOn }))
    toast.info(interviewState.isAudioOn ? "Audio turned off" : "Audio turned on")
  }

  const toggleScreenShare = () => {
    setInterviewState(prev => ({ ...prev, isScreenShareOn: !prev.isScreenShareOn }))
    toast.info(interviewState.isScreenShareOn ? "Screen share stopped" : "Screen share started")
  }

  const pauseInterview = () => {
    setInterviewState(prev => ({ ...prev, isPaused: !prev.isPaused }))
    toast.info(interviewState.isPaused ? "Interview resumed" : "Interview paused")
  }

  const skipQuestion = () => {
    if (interviewState.currentQuestion < interviewState.totalQuestions - 1) {
      setInterviewState(prev => ({ 
        ...prev, 
        currentQuestion: prev.currentQuestion + 1 
      }))
      generateAIQuestion(interviewState.currentQuestion + 1).then(setCurrentQuestion)
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
                  AI Interview Setup
                </Badge>
                <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-white via-blue-100 to-cyan-200 bg-clip-text text-transparent">
                  Start AI-Powered Interview
                </h1>
                <p className="text-slate-300">
                  Set up candidate information for the AI interview
                </p>
              </div>

              {/* Setup Form */}
              <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white">Candidate Information</CardTitle>
                  <CardDescription className="text-slate-300">
                    Enter the candidate's details to personalize the AI interview
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
                  onClick={() => setCurrentStep('preparation')}
                  disabled={!candidateInfo.name || !candidateInfo.position}
                  className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 px-8 py-3 text-lg"
                >
                  <Brain className="w-5 h-5 mr-2" />
                  Continue to Interview
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
                  Interview Preparation
                </Badge>
                <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-white via-blue-100 to-cyan-200 bg-clip-text text-transparent">
                  AI Interview Ready
                </h1>
                <p className="text-slate-300">
                  Review settings and start the AI-powered interview
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

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Interview Settings */}
                <div>
                  <h2 className="text-xl font-semibold text-white mb-4">Interview Settings</h2>
                  <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle className="text-white">AI Interview Configuration</CardTitle>
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
                          <Monitor className="w-4 h-4 text-slate-400" />
                          <span className="text-slate-300">Screen Sharing</span>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={toggleScreenShare}
                          className="border-slate-600 text-slate-300"
                        >
                          {interviewState.isScreenShareOn ? 'On' : 'Off'}
                        </Button>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Clock className="w-4 h-4 text-slate-400" />
                          <span className="text-slate-300">Estimated Duration</span>
                        </div>
                        <span className="text-white font-semibold">~20 minutes</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* AI Interview Info */}
                <div>
                  <h2 className="text-xl font-semibold text-white mb-4">AI Interview Features</h2>
                  <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle className="text-white">AI-Powered Interview</CardTitle>
                      <CardDescription className="text-slate-300">
                        Advanced AI features for comprehensive assessment
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center space-x-3">
                        <Brain className="w-5 h-5 text-blue-400" />
                        <div>
                          <p className="text-white font-medium">Dynamic Question Generation</p>
                          <p className="text-sm text-slate-400">AI adapts questions based on responses</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Volume2 className="w-5 h-5 text-green-400" />
                        <div>
                          <p className="text-white font-medium">Voice Interaction</p>
                          <p className="text-sm text-slate-400">Natural conversation with AI interviewer</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Target className="w-5 h-5 text-purple-400" />
                        <div>
                          <p className="text-white font-medium">Real-time Analysis</p>
                          <p className="text-sm text-slate-400">Instant feedback and scoring</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <FileText className="w-5 h-5 text-yellow-400" />
                        <div>
                          <p className="text-white font-medium">Comprehensive Report</p>
                          <p className="text-sm text-slate-400">Detailed assessment and recommendations</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <div className="mt-6">
                    <Button
                      onClick={startInterview}
                      disabled={loading}
                      className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 py-3 text-lg"
                    >
                      {loading ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                          Starting Interview...
                        </>
                      ) : (
                        <>
                          <Play className="w-5 h-5 mr-2" />
                          Start AI Interview
                        </>
                      )}
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
                  {interviewState.aiSpeaking && (
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                      <span className="text-blue-400 text-sm">AI Speaking</span>
                    </div>
                  )}
                  {interviewState.isListening && (
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                      <span className="text-green-400 text-sm">Listening</span>
                    </div>
                  )}
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
                    onClick={toggleScreenShare}
                    className="border-slate-600 text-slate-300"
                  >
                    {interviewState.isScreenShareOn ? <Monitor className="w-4 h-4" /> : <MonitorOff className="w-4 h-4" />}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={pauseInterview}
                    className="border-slate-600 text-slate-300"
                  >
                    {interviewState.isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={skipQuestion}
                    className="border-slate-600 text-slate-300"
                  >
                    <SkipForward className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="pt-24 pb-8">
            <div className="container mx-auto px-4 max-w-6xl">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Video Feed */}
                <div className="lg:col-span-2">
                  <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle className="text-white">Interview Video</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="relative aspect-video bg-slate-900 rounded-lg overflow-hidden">
                        <video
                          ref={videoRef}
                          autoPlay
                          muted
                          className="w-full h-full object-cover"
                        />
                        {!interviewState.isVideoOn && (
                          <div className="absolute inset-0 flex items-center justify-center bg-slate-800">
                            <CameraOff className="w-16 h-16 text-slate-400" />
                          </div>
                        )}
                        {interviewState.aiSpeaking && (
                          <div className="absolute top-4 left-4 bg-blue-600/80 px-3 py-1 rounded-full">
                            <span className="text-white text-sm">AI Speaking</span>
                          </div>
                        )}
                        {interviewState.isListening && (
                          <div className="absolute top-4 right-4 bg-green-600/80 px-3 py-1 rounded-full">
                            <span className="text-white text-sm">Listening</span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Interview Controls & Transcript */}
                <div className="space-y-6">
                  {/* Current Question */}
                  <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle className="text-white">Current Question</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-white leading-relaxed">{currentQuestion?.text}</p>
                    </CardContent>
                  </Card>

                  {/* User Response */}
                  {userResponse && (
                    <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
                      <CardHeader>
                        <CardTitle className="text-white">Your Response</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-slate-300 leading-relaxed">{userResponse}</p>
                      </CardContent>
                    </Card>
                  )}

                  {/* Interview Transcript */}
                  <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle className="text-white">Interview Transcript</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3 max-h-64 overflow-y-auto">
                        {interviewTranscript.map((entry, index) => (
                          <div key={index} className="text-sm">
                            <span className="text-slate-400">{entry}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
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
                  AI Interview Summary
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
                    <p className="text-sm text-slate-400">AI Score</p>
                  </CardContent>
                </Card>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700">
                  <FileText className="w-4 h-4 mr-2" />
                  Generate AI Report
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