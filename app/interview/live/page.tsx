"use client"

import { useEffect, useState, useRef } from 'react'
import { useAuth } from '@/components/auth-provider'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { 
  Video, 
  Mic, 
  MicOff, 
  VideoOff, 
  Play, 
  Pause, 
  Square,
  AlertTriangle,
  CheckCircle,
  Clock,
  Brain,
  Eye,
  LogIn
} from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface InterviewSession {
  interviewId: string
  sessionToken: string
  sessionId: string
  settings: any
  firstQuestion: {
    question: string
    category: string
    difficulty: string
    timeLimit: number
  }
}

interface AnalysisResult {
  confidenceScore: number
  truthfulness: number
  relevance: number
  completeness: number
  emotionAnalysis: any
  cheatingFlags: any[]
  suggestions: string[]
  nextQuestion?: string
}

export default function LiveInterview() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [session, setSession] = useState<InterviewSession | null>(null)
  const [currentQuestion, setCurrentQuestion] = useState<string>('')
  const [questionIndex, setQuestionIndex] = useState(0)
  const [isRecording, setIsRecording] = useState(false)
  const [isVideoEnabled, setIsVideoEnabled] = useState(true)
  const [isAudioEnabled, setIsAudioEnabled] = useState(true)
  const [timeRemaining, setTimeRemaining] = useState(0)
  const [transcript, setTranscript] = useState('')
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [interviewComplete, setInterviewComplete] = useState(false)
  const [results, setResults] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [isInitializing, setIsInitializing] = useState(true)

  const videoRef = useRef<HTMLVideoElement>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const recognitionRef = useRef<any>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    // Wait for auth to load, then check user
    if (!authLoading) {
      if (!user) {
        setError('No user in session. Please sign in to start an interview.')
        setIsInitializing(false)
      } else {
        startInterview()
      }
    }
  }, [user, authLoading])

  useEffect(() => {
    if (timeRemaining > 0) {
      timerRef.current = setTimeout(() => {
        setTimeRemaining(prev => prev - 1)
      }, 1000)
    } else if (timeRemaining === 0 && isRecording) {
      handleAnswerSubmit()
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
    }
  }, [timeRemaining, isRecording])

  const startInterview = async () => {
    try {
      setIsInitializing(true)
      setError(null)

      const response = await fetch('/api/interview/start-live', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: user?.id,
          candidateName: user?.name || 'Candidate',
          settings: {
            enableVideo: true,
            enableAudio: true,
            questionTimeLimit: 120
          }
        })
      })

      if (response.ok) {
        const data = await response.json()
        setSession(data.data)
        setCurrentQuestion(data.data.firstQuestion.question)
        setTimeRemaining(data.data.firstQuestion.timeLimit)
        
        // Try to initialize media with retry
        let mediaInitialized = false
        let retryCount = 0
        const maxRetries = 3
        
        while (!mediaInitialized && retryCount < maxRetries) {
          try {
            await initializeMedia()
            mediaInitialized = true
          } catch (error: any) {
            retryCount++
            console.log(`Media initialization attempt ${retryCount} failed:`, error)
            
            if (retryCount >= maxRetries) {
              // If media fails, still allow the interview to proceed without video/audio
              toast.warning('Media access failed, but interview can proceed with text input only.')
              setError('Media access failed. You can still participate in the interview using text input.')
            } else {
              // Wait before retrying
              await new Promise(resolve => setTimeout(resolve, 1000))
            }
          }
        }
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to start interview')
      }
    } catch (error) {
      console.error('Error starting interview:', error)
      setError(error instanceof Error ? error.message : 'Failed to start interview')
      toast.error('Failed to start interview')
    } finally {
      setIsInitializing(false)
    }
  }

  const initializeMedia = async () => {
    try {
      // Use modern MediaDevices API
      const stream = await navigator.mediaDevices.getUserMedia({
        video: isVideoEnabled,
        audio: isAudioEnabled
      })

      streamRef.current = stream

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        // Ensure video plays
        videoRef.current.play().catch(console.error)
      }

      // Initialize speech recognition
      if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition
        recognitionRef.current = new SpeechRecognition()
        recognitionRef.current.continuous = true
        recognitionRef.current.interimResults = true
        recognitionRef.current.lang = 'en-US'

        recognitionRef.current.onresult = (event: any) => {
          let interimTranscript = ''
          let finalTranscript = ''

          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript
            if (event.results[i].isFinal) {
              finalTranscript += transcript
            } else {
              interimTranscript += transcript
            }
          }

          setTranscript(finalTranscript + interimTranscript)
        }

        recognitionRef.current.onerror = (event: any) => {
          console.error('Speech recognition error:', event.error)
        }
      }
    } catch (error: any) {
      console.error('Error accessing media devices:', error)
      
      // Provide more specific error messages
      if (error.name === 'NotAllowedError') {
        toast.error('Camera/microphone access denied. Please allow access in your browser settings.')
        setError('Camera/microphone access denied. Please allow access in your browser settings and refresh the page.')
      } else if (error.name === 'NotFoundError') {
        toast.error('No camera or microphone found.')
        setError('No camera or microphone detected. Please connect a device and refresh the page.')
      } else if (error.name === 'NotSupportedError') {
        toast.error('Media devices not supported in this browser.')
        setError('Media devices are not supported in this browser. Please use a modern browser.')
      } else {
        toast.error('Failed to access camera/microphone')
        setError('Camera/microphone access failed. Please check your device permissions and refresh the page.')
      }
    }
  }

  const startRecording = async () => {
    if (!streamRef.current) {
      toast.error('No media stream available')
      return
    }

    try {
      const mediaRecorder = new MediaRecorder(streamRef.current)
      mediaRecorderRef.current = mediaRecorder

      const chunks: Blob[] = []
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data)
        }
      }

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' })
        console.log('Recording stopped, blob size:', blob.size)
      }

      mediaRecorder.start()
      setIsRecording(true)
      recognitionRef.current?.start()
      toast.success('Recording started')
    } catch (error) {
      console.error('Error starting recording:', error)
      toast.error('Failed to start recording')
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      recognitionRef.current?.stop()
      setIsRecording(false)
    }
  }

  const handleAnswerSubmit = async () => {
    if (!session || !transcript.trim()) {
      toast.error('Please provide an answer before submitting')
      return
    }

    setIsProcessing(true)
    stopRecording()

    try {
      // Submit answer
      const answerResponse = await fetch('/api/interview/answer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          interviewId: session.interviewId,
          sessionId: session.sessionId,
          content: transcript,
          emotionData: {},
          confidenceScore: 0.8,
          cheatingFlags: []
        })
      })

      if (!answerResponse.ok) {
        throw new Error('Failed to submit answer')
      }

      const answerData = await answerResponse.json()
      
      // Analyze response
      const analysisResponse = await fetch('/api/ai/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          interviewId: session.interviewId,
          content: transcript,
          context: currentQuestion,
          analysisType: 'content',
          emotionData: {},
          faceData: {},
          gazeData: {}
        })
      })

      if (!analysisResponse.ok) {
        throw new Error('Failed to analyze response')
      }

      const analysisData = await analysisResponse.json()
      setAnalysis(analysisData.data.analysis)
      
      // Generate next question
      const nextQuestionResponse = await fetch('/api/interview/next-question', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          interviewId: session.interviewId,
          sessionId: session.sessionId,
          previousQuestion: currentQuestion,
          response: transcript,
          analysis: analysisData.data.analysis
        })
      })

      if (!nextQuestionResponse.ok) {
        throw new Error('Failed to generate next question')
      }

      const nextQuestionData = await nextQuestionResponse.json()
      setQuestionIndex(prev => prev + 1)
      
      if (nextQuestionData.data.interviewComplete) {
        // Interview complete
        await completeInterview()
      } else if (nextQuestionData.data.nextQuestion) {
        setCurrentQuestion(nextQuestionData.data.nextQuestion)
        setTimeRemaining(nextQuestionData.data.timeLimit || 120)
        setTranscript('')
        setAnalysis(null)
      }
    } catch (error) {
      console.error('Error submitting answer:', error)
      toast.error('Failed to submit answer')
      setError(error instanceof Error ? error.message : 'Failed to submit answer')
    } finally {
      setIsProcessing(false)
    }
  }

  const completeInterview = async () => {
    try {
      const response = await fetch('/api/interview/submit-live', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          interviewId: session?.interviewId,
          sessionId: session?.sessionId,
          duration: 0
        })
      })

      if (response.ok) {
        const data = await response.json()
        setResults(data.data)
        setInterviewComplete(true)
        toast.success('Interview completed successfully!')
      } else {
        throw new Error('Failed to complete interview')
      }
    } catch (error) {
      console.error('Error completing interview:', error)
      toast.error('Failed to complete interview')
      setError(error instanceof Error ? error.message : 'Failed to complete interview')
    }
  }

  const toggleVideo = () => {
    setIsVideoEnabled(!isVideoEnabled)
    if (videoRef.current && streamRef.current) {
      const videoTrack = streamRef.current.getVideoTracks()[0]
      if (videoTrack) {
        videoTrack.enabled = !isVideoEnabled
      }
    }
  }

  const toggleAudio = () => {
    setIsAudioEnabled(!isAudioEnabled)
    if (streamRef.current) {
      const audioTrack = streamRef.current.getAudioTracks()[0]
      if (audioTrack) {
        audioTrack.enabled = !isAudioEnabled
      }
    }
  }

  // Show loading while auth is loading
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 text-white">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold mb-2">Loading Authentication</h2>
            <p className="text-slate-300">Checking your session...</p>
          </div>
        </div>
      </div>
    )
  }

  // Show authentication error
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 text-white">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-red-400" />
            <h2 className="text-xl font-semibold mb-2">Authentication Required</h2>
            <p className="text-slate-300 mb-4">You need to sign in to access the interview feature.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth/signin">
                <Button className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700">
                  <LogIn className="mr-2 h-4 w-4" />
                  Sign In
                </Button>
              </Link>
              <Link href="/">
                <Button variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700">
                  Back to Home
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 text-white">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold mb-2">Initializing Interview</h2>
            <p className="text-slate-300">Setting up your AI interview session...</p>
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
            <h2 className="text-xl font-semibold mb-2">Interview Error</h2>
            <p className="text-slate-300 mb-4">{error}</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {error.includes('Camera/microphone') && (
                <Button 
                  onClick={async () => {
                    setError(null)
                    try {
                      await initializeMedia()
                      toast.success('Media access granted!')
                    } catch (mediaError) {
                      setError('Media access still failed. You can continue with text input only.')
                    }
                  }} 
                  className="bg-green-600 hover:bg-green-700"
                >
                  Retry Media Access
                </Button>
              )}
              <Button onClick={startInterview} className="bg-blue-600 hover:bg-blue-700">
                Try Again
              </Button>
              <Link href="/dashboard/enhanced">
                <Button variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700">
                  Back to Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (interviewComplete && results) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 text-white">
        <div className="container mx-auto px-4 py-8">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <CheckCircle className="mr-2 h-6 w-6 text-green-400" />
                Interview Completed
              </CardTitle>
              <CardDescription className="text-slate-400">
                Your AI interview has been completed successfully
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-white mb-2">{results.overallScore || 0}%</div>
                  <div className="text-slate-400">Overall Score</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-white mb-2">{results.totalQuestions || 0}</div>
                  <div className="text-slate-400">Questions Answered</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-white mb-2">{results.cheatingFlags || 0}</div>
                  <div className="text-slate-400">Cheating Flags</div>
                </div>
              </div>
              
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-white mb-4">Summary</h3>
                <p className="text-slate-300">{results.summary || 'Interview completed successfully.'}</p>
              </div>

              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-md font-semibold text-white mb-2">Strengths</h4>
                  <ul className="text-slate-300">
                    {results.strengths?.map((strength: string, index: number) => (
                      <li key={index} className="flex items-center mb-1">
                        <CheckCircle className="h-4 w-4 text-green-400 mr-2" />
                        {strength}
                      </li>
                    )) || <li className="text-slate-400">No specific strengths identified</li>}
                  </ul>
                </div>
                <div>
                  <h4 className="text-md font-semibold text-white mb-2">Areas for Improvement</h4>
                  <ul className="text-slate-300">
                    {results.weaknesses?.map((weakness: string, index: number) => (
                      <li key={index} className="flex items-center mb-1">
                        <AlertTriangle className="h-4 w-4 text-yellow-400 mr-2" />
                        {weakness}
                      </li>
                    )) || <li className="text-slate-400">No specific areas identified</li>}
                  </ul>
                </div>
              </div>

              <div className="mt-6 flex space-x-4">
                <Link href="/dashboard/enhanced">
                  <Button className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700">
                    Back to Dashboard
                  </Button>
                </Link>
                <Button variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700" onClick={startInterview}>
                  Start New Interview
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Live AI Interview</h1>
          <p className="text-slate-300">
            Question {questionIndex + 1} of 5 • {timeRemaining}s remaining
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Video Section */}
          <div className="lg:col-span-2">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Interview Video</CardTitle>
                <CardDescription className="text-slate-400">
                  Your camera and microphone feed
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-64 bg-slate-900 rounded-lg"
                  />
                  
                  {/* Recording indicator */}
                  {isRecording && (
                    <div className="absolute top-4 right-4 flex items-center space-x-2 bg-red-500 px-3 py-1 rounded-full">
                      <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                      <span className="text-white text-sm">Recording</span>
                    </div>
                  )}

                  {/* Controls */}
                  <div className="flex justify-center space-x-4 mt-4">
                    <Button
                      onClick={toggleVideo}
                      variant={isVideoEnabled ? "default" : "destructive"}
                      size="sm"
                    >
                      {isVideoEnabled ? <Video className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}
                    </Button>
                    <Button
                      onClick={toggleAudio}
                      variant={isAudioEnabled ? "default" : "destructive"}
                      size="sm"
                    >
                      {isAudioEnabled ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
                    </Button>
                    {!isRecording ? (
                      <Button onClick={startRecording} className="bg-green-600 hover:bg-green-700">
                        <Play className="h-4 w-4 mr-2" />
                        Start Recording
                      </Button>
                    ) : (
                      <Button onClick={handleAnswerSubmit} className="bg-red-600 hover:bg-red-700">
                        <Square className="h-4 w-4 mr-2" />
                        Submit Answer
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Question and Analysis Section */}
          <div className="space-y-6">
            {/* Current Question */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Brain className="mr-2 h-5 w-5 text-blue-400" />
                  Current Question
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-300 mb-4">{currentQuestion || 'Loading question...'}</p>
                <div className="flex items-center justify-between">
                  <Badge className="bg-blue-500">Question {questionIndex + 1}/5</Badge>
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-slate-400" />
                    <span className="text-slate-300">{timeRemaining}s</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Transcript */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Mic className="mr-2 h-5 w-5 text-green-400" />
                  Your Response
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="min-h-[100px] p-3 bg-slate-700 rounded border border-slate-600">
                  {transcript || (
                    <span className="text-slate-400 italic">
                      {isRecording ? 'Listening...' : 'Click "Start Recording" to begin your answer'}
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* AI Analysis */}
            {analysis && (
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Eye className="mr-2 h-5 w-5 text-purple-400" />
                    AI Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Confidence:</span>
                      <span className="text-white">{Math.round((analysis.confidenceScore || 0) * 100)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Truthfulness:</span>
                      <span className="text-white">{Math.round((analysis.truthfulness || 0) * 100)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Relevance:</span>
                      <span className="text-white">{Math.round((analysis.relevance || 0) * 100)}%</span>
                    </div>
                    {analysis.suggestions?.length > 0 && (
                      <div className="mt-3">
                        <p className="text-sm text-slate-400 mb-2">Suggestions:</p>
                        <ul className="text-sm text-slate-300">
                          {analysis.suggestions.map((suggestion: string, index: number) => (
                            <li key={index} className="mb-1">• {suggestion}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Processing indicator */}
            {isProcessing && (
              <Card className="bg-slate-800/50 border-slate-700">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-center space-x-2">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-400"></div>
                    <span className="text-slate-300">Processing your response...</span>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}