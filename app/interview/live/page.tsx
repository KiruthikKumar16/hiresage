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
  LogIn,
  Volume2,
  MessageSquare
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
  const [transcript, setTranscript] = useState('')
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [interviewComplete, setInterviewComplete] = useState(false)
  const [results, setResults] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [isInitializing, setIsInitializing] = useState(true)
  const [isAISpeaking, setIsAISpeaking] = useState(false)
  const [totalQuestions] = useState(5)

  const videoRef = useRef<HTMLVideoElement>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const recognitionRef = useRef<any>(null)
  const speechSynthesisRef = useRef<SpeechSynthesis | null>(null)

  // Error boundary for client-side errors
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      console.error('Client-side error:', event.error)
      setError('An error occurred. Please refresh the page.')
    }

    window.addEventListener('error', handleError)
    return () => window.removeEventListener('error', handleError)
  }, [])

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

  // Auto-detect when user finishes speaking
  useEffect(() => {
    if (isRecording && transcript) {
      // If user stops speaking for 3 seconds, auto-submit
      const timeout = setTimeout(() => {
        if (transcript.trim().length > 10) { // Minimum answer length
          handleAnswerSubmit()
        }
      }, 3000)

      return () => clearTimeout(timeout)
    }
  }, [transcript, isRecording, session, questionIndex, totalQuestions, analysis])

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
            questionTimeLimit: 0 // No time limit
          }
        })
      })

      if (response.ok) {
        const data = await response.json()
        setSession(data.data)
        setCurrentQuestion(data.data.firstQuestion.question)
        
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
        
        // Start the interview by speaking the first question
        if (mediaInitialized) {
          speakQuestion(data.data.firstQuestion.question)
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
      toast.success('Recording started - Speak your answer')
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
      // Submit the answer
      const answerResponse = await fetch('/api/interview/answer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          interviewId: session.interviewId,
          sessionToken: session.sessionToken,
          answer: transcript.trim(),
          questionIndex: questionIndex
        })
      })

      if (!answerResponse.ok) {
        throw new Error('Failed to submit answer')
      }

      // Analyze the answer
      const analysisResponse = await fetch('/api/ai/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          interviewId: session.interviewId,
          text: transcript.trim(),
          analysisType: 'comprehensive'
        })
      })

      if (analysisResponse.ok) {
        const analysisData = await analysisResponse.json()
        setAnalysis(analysisData.data)
      }

      // Check if we should continue to next question
      if (questionIndex < totalQuestions - 1) {
        // Get next question
        const nextQuestionResponse = await fetch('/api/interview/next-question', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            interviewId: session.interviewId,
            sessionToken: session.sessionToken,
            previousAnswer: transcript.trim(),
            analysis: analysis
          })
        })

        if (nextQuestionResponse.ok) {
          const nextQuestionData = await nextQuestionResponse.json()
          setQuestionIndex(prev => prev + 1)
          setCurrentQuestion(nextQuestionData.data.question)
          setTranscript('')
          setAnalysis(null)
          
          // Speak the next question
          setTimeout(() => {
            speakQuestion(nextQuestionData.data.question)
          }, 2000)
        } else {
          throw new Error('Failed to get next question')
        }
      } else {
        // Interview complete
        await completeInterview()
      }

    } catch (error) {
      console.error('Error processing answer:', error)
      toast.error('Failed to process answer')
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

  const speakQuestion = (question: string) => {
    if ('speechSynthesis' in window) {
      speechSynthesisRef.current = window.speechSynthesis
      
      // Cancel any ongoing speech
      speechSynthesisRef.current.cancel()
      
      const utterance = new SpeechSynthesisUtterance(question)
      utterance.rate = 0.9 // Slightly slower for clarity
      utterance.pitch = 1.0
      utterance.volume = 0.8
      
      utterance.onstart = () => {
        setIsAISpeaking(true)
        toast.info('AI is asking the question...')
      }
      
      utterance.onend = () => {
        setIsAISpeaking(false)
        // Start recording after AI finishes speaking
        setTimeout(() => {
          startRecording()
        }, 1000)
      }
      
      utterance.onerror = (event) => {
        console.error('Speech synthesis error:', event)
        setIsAISpeaking(false)
        // Start recording even if speech fails
        setTimeout(() => {
          startRecording()
        }, 1000)
      }
      
      speechSynthesisRef.current.speak(utterance)
    } else {
      // Fallback if speech synthesis not available
      toast.info('Question: ' + question)
      setTimeout(() => {
        startRecording()
      }, 2000)
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
          <div className="text-center">
            <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-400" />
            <h2 className="text-xl font-semibold mb-2">Interview Complete!</h2>
            <p className="text-slate-300 mb-4">Your AI interview has been completed successfully.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/dashboard/enhanced">
                <Button className="bg-blue-600 hover:bg-blue-700">
                  Back to Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Main interview interface - Full screen video call style
  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* Full screen video */}
      <div className="absolute inset-0 z-10">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover"
        />
        
        {/* Video overlay with AI speaking indicator */}
        {isAISpeaking && (
          <div className="absolute top-4 left-4 bg-blue-600/90 backdrop-blur-sm rounded-lg px-4 py-2 flex items-center gap-2">
            <Volume2 className="h-4 w-4 animate-pulse" />
            <span className="text-sm font-medium">AI is speaking...</span>
          </div>
        )}
        
        {/* Recording indicator */}
        {isRecording && (
          <div className="absolute top-4 right-4 bg-red-600/90 backdrop-blur-sm rounded-lg px-4 py-2 flex items-center gap-2">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
            <span className="text-sm font-medium">Recording</span>
          </div>
        )}
        
        {/* Question progress */}
        <div className="absolute bottom-4 left-4 bg-black/70 backdrop-blur-sm rounded-lg px-4 py-2">
          <span className="text-sm font-medium">Question {questionIndex + 1} of {totalQuestions}</span>
        </div>
        
        {/* Processing indicator */}
        {isProcessing && (
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center">
            <div className="bg-blue-600/90 backdrop-blur-sm rounded-lg px-6 py-4 flex items-center gap-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
              <span className="text-lg font-medium">Processing your answer...</span>
            </div>
          </div>
        )}
      </div>
      
      {/* Transcript overlay - only show when recording */}
      {isRecording && transcript && (
        <div className="absolute bottom-20 left-4 right-4 bg-black/80 backdrop-blur-sm rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <MessageSquare className="h-4 w-4 text-blue-400" />
            <span className="text-sm font-medium text-blue-400">Your Response:</span>
          </div>
          <p className="text-white text-sm leading-relaxed">{transcript}</p>
        </div>
      )}
      
      {/* Manual submit button - only show when recording and has transcript */}
      {isRecording && transcript.trim().length > 10 && (
        <div className="absolute bottom-4 right-4">
          <Button 
            onClick={handleAnswerSubmit}
            className="bg-blue-600 hover:bg-blue-700"
            disabled={isProcessing}
          >
            Submit Answer
          </Button>
        </div>
      )}
    </div>
  )
}