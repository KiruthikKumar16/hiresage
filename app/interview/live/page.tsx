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
  Eye
} from 'lucide-react'
import { toast } from 'sonner'

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
  const { user } = useAuth()
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

  const videoRef = useRef<HTMLVideoElement>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const recognitionRef = useRef<any>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (user) {
      startInterview()
    }
  }, [user])

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
      const response = await fetch('/api/interview/start-live', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: user?.id,
          candidateName: user?.name,
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
        await initializeMedia()
      } else {
        toast.error('Failed to start interview')
      }
    } catch (error) {
      console.error('Error starting interview:', error)
      toast.error('Failed to start interview')
    }
  }

  const initializeMedia = async () => {
    try {
      const stream = await navigator.getUserMedia({
        video: isVideoEnabled,
        audio: isAudioEnabled
      })

      streamRef.current = stream

      if (videoRef.current) {
        videoRef.current.srcObject = stream
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
    } catch (error) {
      console.error('Error accessing media devices:', error)
      toast.error('Failed to access camera/microphone')
    }
  }

  const startRecording = async () => {
    if (!streamRef.current) return

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
        // Handle audio blob for analysis
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
    if (!session || !transcript.trim()) return

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
          emotionData: {}, // Mock emotion data
          confidenceScore: 0.8, // Mock confidence score
          cheatingFlags: [] // Mock cheating flags
        })
      })

      if (answerResponse.ok) {
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

        if (analysisResponse.ok) {
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

          if (nextQuestionResponse.ok) {
            const nextQuestionData = await nextQuestionResponse.json()
            setQuestionIndex(prev => prev + 1)
            
            if (nextQuestionData.data.nextQuestion) {
              setCurrentQuestion(nextQuestionData.data.nextQuestion)
              setTimeRemaining(nextQuestionData.data.timeLimit || 120)
              setTranscript('')
              setAnalysis(null)
            } else {
              // Interview complete
              await completeInterview()
            }
          }
        }
      }
    } catch (error) {
      console.error('Error submitting answer:', error)
      toast.error('Failed to submit answer')
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
          duration: 0 // Calculate actual duration
        })
      })

      if (response.ok) {
        const data = await response.json()
        setResults(data.data)
        setInterviewComplete(true)
        toast.success('Interview completed successfully!')
      }
    } catch (error) {
      console.error('Error completing interview:', error)
      toast.error('Failed to complete interview')
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
                  <div className="text-3xl font-bold text-white mb-2">{results.overallScore}%</div>
                  <div className="text-slate-400">Overall Score</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-white mb-2">{results.totalQuestions}</div>
                  <div className="text-slate-400">Questions Answered</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-white mb-2">{results.cheatingFlags}</div>
                  <div className="text-slate-400">Cheating Flags</div>
                </div>
              </div>
              
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-white mb-4">Summary</h3>
                <p className="text-slate-300">{results.summary}</p>
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
                    ))}
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
                    ))}
                  </ul>
                </div>
              </div>

              <div className="mt-6 flex space-x-4">
                <Button className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700">
                  View Detailed Report
                </Button>
                <Button variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700">
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
                <p className="text-slate-300 mb-4">{currentQuestion}</p>
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
                      <span className="text-white">{Math.round(analysis.confidenceScore * 100)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Truthfulness:</span>
                      <span className="text-white">{Math.round(analysis.truthfulness * 100)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Relevance:</span>
                      <span className="text-white">{Math.round(analysis.relevance * 100)}%</span>
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