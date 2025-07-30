"use client"

import { useEffect, useState, useRef } from 'react'
import { useAuth } from '@/components/auth-provider'
import { Button } from '@/components/ui/button'
import { 
  AlertTriangle,
  CheckCircle,
  Brain,
  LogIn,
  Volume2,
  MessageSquare,
  Mic,
  MicOff
} from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'

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

export default function LiveInterview() {
  const { user, loading: authLoading } = useAuth()
  const [session, setSession] = useState<InterviewSession | null>(null)
  const [currentQuestion, setCurrentQuestion] = useState<string>('')
  const [transcript, setTranscript] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [interviewComplete, setInterviewComplete] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isInitializing, setIsInitializing] = useState(true)
  const [isAISpeaking, setIsAISpeaking] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [showStartInfo, setShowStartInfo] = useState(false)

  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const recognitionRef = useRef<any>(null)

  // Initialize interview when component mounts
  useEffect(() => {
    if (!authLoading && user) {
      initializeInterview()
    } else if (!authLoading && !user) {
      setError('No user in session. Please sign in to start an interview.')
      setIsInitializing(false)
    }
  }, [user, authLoading])

  const initializeInterview = async () => {
    try {
      setIsInitializing(true)
      setError(null)

      // Start the interview session
      console.log('Starting interview session...')
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
            questionTimeLimit: 0
          }
        })
      })

      if (response.ok) {
        const data = await response.json()
        console.log('Interview session started:', data)
        setSession(data.data)
        setCurrentQuestion(data.data.firstQuestion.question)
        
        // Initialize media after session is created
        await initializeMedia()
        
        // Show start info popup
        setShowStartInfo(true)
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to start interview session')
      }

    } catch (error) {
      console.error('Error initializing interview:', error)
      setError(error instanceof Error ? error.message : 'Failed to initialize interview')
      toast.error('Failed to initialize interview')
    } finally {
      setIsInitializing(false)
    }
  }

  const initializeMedia = async () => {
    try {
      console.log('Initializing media...')
      
      // Get camera and microphone access
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user'
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      })

      console.log('Media stream obtained:', !!stream, 'tracks:', stream.getTracks().length)
      streamRef.current = stream

      // Set up video element
      if (videoRef.current) {
        console.log('Setting up video element...')
        videoRef.current.srcObject = stream
        
        // Wait for video to load
        videoRef.current.onloadedmetadata = () => {
          console.log('Video metadata loaded:', videoRef.current?.videoWidth, 'x', videoRef.current?.videoHeight)
          videoRef.current?.play()
        }
        
        videoRef.current.oncanplay = () => {
          console.log('Video can play')
        }
        
        videoRef.current.onplay = () => {
          console.log('Video started playing')
        }
        
        videoRef.current.onerror = (e) => {
          console.error('Video error:', e)
        }
      }

      // Initialize speech recognition
      if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        console.log('Initializing speech recognition...')
        const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition
        
        if (SpeechRecognition) {
          recognitionRef.current = new SpeechRecognition()
          recognitionRef.current.continuous = true
          recognitionRef.current.interimResults = true
          recognitionRef.current.lang = 'en-US'
          recognitionRef.current.maxAlternatives = 1

          recognitionRef.current.onresult = (event: any) => {
            console.log('Speech recognition result:', event.results.length)
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

            setTranscript(prev => {
              const currentFinal = prev.replace(/\[interim\].*$/, '')
              return currentFinal + finalTranscript + (interimTranscript ? ` [interim]${interimTranscript}` : '')
            })
          }

          recognitionRef.current.onerror = (event: any) => {
            console.error('Speech recognition error:', event.error)
            if (event.error === 'not-allowed') {
              toast.error('Microphone access denied. Please allow microphone access.')
            } else if (event.error === 'no-speech') {
              console.log('No speech detected')
            } else {
              toast.error(`Speech recognition error: ${event.error}`)
            }
          }

          recognitionRef.current.onstart = () => {
            console.log('Speech recognition started successfully')
            setIsRecording(true)
          }

          recognitionRef.current.onend = () => {
            console.log('Speech recognition ended')
            setIsRecording(false)
            // Restart if still in interview
            if (!interviewComplete) {
              setTimeout(() => {
                try {
                  recognitionRef.current?.start()
                } catch (error) {
                  console.error('Failed to restart speech recognition:', error)
                }
              }, 100)
            }
          }

          console.log('Speech recognition initialized successfully')
        } else {
          console.error('SpeechRecognition constructor not available')
          toast.error('Speech recognition not supported in this browser')
        }
      } else {
        console.error('Speech recognition not supported')
        toast.error('Speech recognition not supported in this browser')
      }

    } catch (error: any) {
      console.error('Error accessing media devices:', error)
      
      if (error.name === 'NotAllowedError') {
        toast.error('Camera/microphone access denied. Please allow access in your browser settings.')
        setError('Camera/microphone access denied. Please allow access in your browser settings and refresh the page.')
      } else if (error.name === 'NotFoundError') {
        toast.error('No camera or microphone found.')
        setError('No camera or microphone detected. Please connect a device and refresh the page.')
      } else if (error.name === 'NotSupportedError') {
        toast.error('Media devices not supported in this browser.')
        setError('Media devices are not supported in this browser. Please use a modern browser.')
      } else if (error.name === 'NotReadableError') {
        toast.error('Camera/microphone is already in use.')
        setError('Camera/microphone is already in use by another application. Please close other apps and refresh.')
      } else {
        toast.error('Failed to access camera/microphone')
        setError(`Camera/microphone access failed: ${error.message}. Please check your device permissions and refresh the page.`)
      }
      throw error
    }
  }

  const handleStartInterview = () => {
    setShowStartInfo(false)
    startInterview()
  }

  const startInterview = async () => {
    try {
      console.log('Starting interview...')
      setShowStartInfo(false)

      // Speak the first question
      if (currentQuestion) {
        console.log('Speaking first question:', currentQuestion)
        setIsAISpeaking(true)
        
        const utterance = new SpeechSynthesisUtterance(currentQuestion)
        utterance.rate = 0.9
        utterance.pitch = 1
        utterance.volume = 1
        
        utterance.onend = () => {
          console.log('AI finished speaking, starting speech recognition...')
          setIsAISpeaking(false)
          
          // Start speech recognition after AI finishes speaking
          setTimeout(() => {
            console.log('Starting speech recognition after AI speech...')
            try {
              if (recognitionRef.current) {
                recognitionRef.current.start()
                console.log('Speech recognition started successfully')
              } else {
                console.error('Speech recognition not initialized')
                toast.error('Speech recognition not available')
              }
            } catch (error) {
              console.error('Failed to start speech recognition:', error)
              toast.error('Failed to start speech recognition')
            }
          }, 3000) // 3 second delay after AI finishes speaking
        }
        
        utterance.onerror = (event) => {
          console.error('Speech synthesis error:', event)
          setIsAISpeaking(false)
          // Start speech recognition even if AI speech fails
          setTimeout(() => {
            try {
              recognitionRef.current?.start()
            } catch (error) {
              console.error('Failed to start speech recognition after AI error:', error)
            }
          }, 1000)
        }
        
        window.speechSynthesis.speak(utterance)
      }
    } catch (error) {
      console.error('Error starting interview:', error)
      toast.error('Failed to start interview')
    }
  }

  // Auto-detect when user finishes speaking
  useEffect(() => {
    if (isRecording && transcript && transcript.trim().length > 10) {
      // If user stops speaking for 3 seconds, auto-submit
      const timeout = setTimeout(() => {
        if (transcript.trim().length > 10) {
          handleAnswerSubmit()
        }
      }, 3000)

      return () => clearTimeout(timeout)
    }
  }, [transcript, isRecording])

  const handleAnswerSubmit = async () => {
    if (!session || !transcript.trim()) return

    setIsProcessing(true)
    try {
      console.log('Submitting answer:', transcript.trim())
      
      // Submit answer to API
      const response = await fetch('/api/interview/answer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          interviewId: session.interviewId,
          sessionId: session.sessionToken,
          content: transcript.trim()
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to submit answer')
      }

      const data = await response.json()
      console.log('Answer submitted successfully:', data)
      
      // Clear transcript for next question
      setTranscript('')
      
      // Complete the interview after one answer
      await completeInterview()

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
          duration: 0
        })
      })

      if (response.ok) {
        const data = await response.json()
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

  // Show start info popup
  if (showStartInfo && !isInitializing) {
    return (
      <div className="min-h-screen bg-black text-white relative overflow-hidden">
        {/* Background video */}
        <div className="absolute inset-0">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              zIndex: 1,
              backgroundColor: '#000'
            }}
          />
        </div>
        
        {/* Popup overlay */}
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-20">
          <div className="bg-slate-800/90 border border-slate-700 rounded-lg p-6 max-w-md mx-4">
            <div className="text-center">
              <Brain className="h-12 w-12 mx-auto mb-4 text-blue-400" />
              <h1 className="text-2xl font-bold mb-4">AI Interview Starting</h1>
              <div className="text-left space-y-3 text-slate-300 mb-6">
                <div className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-400 mr-3 mt-0.5 flex-shrink-0" />
                  <span>Speak naturally - no time limits</span>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-400 mr-3 mt-0.5 flex-shrink-0" />
                  <span>Questions are dynamic based on your responses</span>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-400 mr-3 mt-0.5 flex-shrink-0" />
                  <span>Interview will end when AI has enough information</span>
                </div>
              </div>
              <Button 
                onClick={handleStartInterview}
                className="bg-blue-600 hover:bg-blue-700 px-6 py-2"
              >
                OK, Start Interview
              </Button>
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
              <Button onClick={initializeInterview} className="bg-blue-600 hover:bg-blue-700">
                Try Again
              </Button>
              <Link href="/dashboard">
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

  if (interviewComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 text-white">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-400" />
            <h2 className="text-xl font-semibold mb-2">Interview Complete!</h2>
            <p className="text-slate-300 mb-4">Your AI interview has been completed successfully.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/dashboard">
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
      <div className="absolute inset-0">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            zIndex: 1,
            backgroundColor: '#000'
          }}
        />
        
        {/* Video overlay with AI speaking indicator only */}
        {isAISpeaking && (
          <div className="absolute top-4 left-4 bg-blue-600/90 backdrop-blur-sm rounded-lg px-4 py-2 flex items-center gap-2 z-10">
            <Volume2 className="h-4 w-4 animate-pulse" />
            <span className="text-sm font-medium">AI is speaking...</span>
          </div>
        )}
        
        {/* Processing indicator */}
        {isProcessing && (
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-20">
            <div className="bg-blue-600/90 backdrop-blur-sm rounded-lg px-6 py-4 flex items-center gap-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
              <span className="text-lg font-medium">Processing your answer...</span>
            </div>
          </div>
        )}
      </div>
      
      {/* Transcript overlay - only show when recording and has content */}
      {isRecording && transcript && transcript.trim().length > 0 && (
        <div className="absolute bottom-20 left-4 right-4 bg-black/80 backdrop-blur-sm rounded-lg p-4 z-10">
          <div className="flex items-center gap-2 mb-2">
            <MessageSquare className="h-4 w-4 text-blue-400" />
            <span className="text-sm font-medium text-blue-400">Your Response:</span>
          </div>
          <p className="text-white text-sm leading-relaxed">{transcript.replace(/\[interim\].*$/, '')}</p>
        </div>
      )}
    </div>
  )
}