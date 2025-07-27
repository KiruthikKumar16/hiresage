'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/hooks/use-toast'
import { 
  Video, 
  Mic, 
  MicOff, 
  Square, 
  Play, 
  Pause, 
  Eye, 
  EyeOff,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Brain,
  Heart,
  Activity,
  Clock,
  TrendingUp,
  Shield
} from 'lucide-react'
import { AIService, type EmotionAnalysis, type CheatingDetection, type RealTimeAnalysis } from '@/lib/ai-service'

interface VideoInterviewProps {
  candidateId?: string
  candidateName?: string
  position?: string
  onComplete?: (interviewId: string) => void
}

export function VideoInterview({ candidateId, candidateName, position, onComplete }: VideoInterviewProps) {
  const { toast } = useToast()
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const aiService = AIService.getInstance()
  
  const [isRecording, setIsRecording] = useState(false)
  const [isVideoOn, setIsVideoOn] = useState(true)
  const [isAudioOn, setIsAudioOn] = useState(true)
  const [interviewId, setInterviewId] = useState<string | null>(null)
  const [currentQuestion, setCurrentQuestion] = useState<string>('')
  const [aiResponse, setAiResponse] = useState<string>('')
  const [isPlayingAiResponse, setIsPlayingAiResponse] = useState(false)
  const [interviewDuration, setInterviewDuration] = useState(0)
  
  // Real-time analysis states
  const [emotionData, setEmotionData] = useState<EmotionAnalysis>({
    primaryEmotion: 'neutral',
    confidence: 0,
    stressLevel: 0,
    engagementLevel: 0,
    deceptionIndicators: [],
    microExpressions: []
  })
  
  const [cheatingDetection, setCheatingDetection] = useState<CheatingDetection>({
    multipleFaces: false,
    screenSharing: false,
    backgroundNoise: false,
    unusualMovements: false,
    suspiciousBehavior: [],
    riskLevel: 'low',
    recommendations: []
  })
  
  const [realTimeAnalysis, setRealTimeAnalysis] = useState<RealTimeAnalysis[]>([])
  const [transcript, setTranscript] = useState<string>('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [interviewContext, setInterviewContext] = useState({
    candidateName: candidateName || 'Candidate',
    position: position || 'Position',
    experience: 'Not specified',
    skills: ['Technical skills', 'Problem solving', 'Communication'],
    previousQuestions: [] as string[],
    transcript: '',
    realTimeAnalysis: [] as RealTimeAnalysis[]
  })

  // Start video stream
  const startVideo = async () => {
    try {
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
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        streamRef.current = stream
        setIsVideoOn(true)
        setIsAudioOn(true)
        
        // Start analysis
        startEmotionAnalysis()
        startCheatingDetection()
        startSpeechRecognition()
      }
    } catch (error) {
      console.error('Error accessing media devices:', error)
      toast({
        title: "Camera Access Error",
        description: "Please allow camera and microphone access to start the interview.",
        variant: "destructive"
      })
    }
  }

  // Stop video stream
  const stopVideo = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
    setIsVideoOn(false)
    setIsAudioOn(false)
  }

  // Enhanced emotion analysis using AI
  const startEmotionAnalysis = () => {
    const canvas = canvasRef.current
    const video = videoRef.current
    if (!canvas || !video) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const analyzeFrame = async () => {
      if (video.videoWidth && video.videoHeight) {
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
        
        // Convert canvas to base64 for AI analysis
        const imageData = canvas.toDataURL('image/jpeg', 0.8)
        
        try {
                   // Use AI service for emotion analysis
         const analysis = await aiService.analyzeEmotionAndBehavior(
           imageData,
           transcript || '',
           interviewContext
         )
          
          setEmotionData(analysis.emotion)
          setCheatingDetection(analysis.cheating)
          
          // Add to real-time analysis
          const realTimeData: RealTimeAnalysis = {
            speechToText: transcript || '',
            currentEmotion: analysis.emotion.primaryEmotion,
            confidenceScore: analysis.emotion.confidence,
            deceptionScore: analysis.emotion.deceptionIndicators.length * 10,
            stressLevel: analysis.emotion.stressLevel,
            engagementLevel: analysis.emotion.engagementLevel,
            timestamp: new Date()
          }
          
          setRealTimeAnalysis(prev => [...prev, realTimeData])
          
          // Update interview context
          setInterviewContext(prev => ({
            ...prev,
            realTimeAnalysis: [...prev.realTimeAnalysis, realTimeData]
          }))
          
        } catch (error) {
          console.error('Error in emotion analysis:', error)
        }
      }
      
      if (isRecording) {
        setTimeout(analyzeFrame, 2000) // Analyze every 2 seconds
      }
    }
    
    analyzeFrame()
  }

  // Enhanced cheating detection
  const startCheatingDetection = () => {
    const checkForCheating = () => {
      // This would use computer vision and AI for real cheating detection
      // For now, we'll use the AI service results
      
      if (cheatingDetection.riskLevel === 'high') {
        toast({
          title: "High Risk Activity Detected",
          description: cheatingDetection.suspiciousBehavior.join(', '),
          variant: "destructive"
        })
      } else if (cheatingDetection.riskLevel === 'medium') {
        toast({
          title: "Suspicious Activity Detected",
          description: cheatingDetection.suspiciousBehavior.join(', '),
          variant: "destructive"
        })
      }
      
      if (isRecording) {
        setTimeout(checkForCheating, 10000) // Check every 10 seconds
      }
    }
    
    checkForCheating()
  }

  // Enhanced speech recognition
  const startSpeechRecognition = () => {
    if ('webkitSpeechRecognition' in window) {
      const recognition = new (window as any).webkitSpeechRecognition()
      recognition.continuous = true
      recognition.interimResults = true
      recognition.lang = 'en-US'
      
      recognition.onresult = async (event: any) => {
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
        
        const currentText = finalTranscript || interimTranscript
        setTranscript(currentText)
        
        // Update interview context with new transcript
        setInterviewContext(prev => ({
          ...prev,
          transcript: currentText
        }))
        
        // Generate AI response for substantial speech
        if (finalTranscript.length > 20 && !isProcessing) {
          await generateAiResponse(finalTranscript || '')
        }
      }
      
      recognition.start()
    }
  }

  // Enhanced AI response generation
  const generateAiResponse = async (userSpeech: string) => {
    setIsProcessing(true)
    
    try {
      // Use AI service for real-time response
      const response = await aiService.generateRealTimeResponse(
        userSpeech,
        emotionData,
        interviewContext
      )
      
      setAiResponse(response.question || response.feedback || '')
      setCurrentQuestion(response.question || '')
      
      // Update interview context
      setInterviewContext(prev => ({
        ...prev,
        previousQuestions: [...prev.previousQuestions, response.question || ''],
        transcript: prev.transcript + `\nCandidate: ${userSpeech}\nAI: ${response.question || response.feedback}`
      }))
      
      // Convert to speech and play
      if (response.question || response.feedback) {
        await playAiResponse(response.question || response.feedback || '')
      }
      
    } catch (error) {
      console.error('Error generating AI response:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  // Text-to-speech for AI response
  const playAiResponse = async (text: string) => {
    if ('speechSynthesis' in window) {
      setIsPlayingAiResponse(true)
      
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.rate = 0.9
      utterance.pitch = 1
      utterance.volume = 0.8
      
      utterance.onend = () => {
        setIsPlayingAiResponse(false)
      }
      
      speechSynthesis.speak(utterance)
    }
  }

  // Start interview
  const startInterview = async () => {
    try {
      setIsRecording(true)
      
      // Create video interview record
      const response = await fetch('/api/video-interviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          candidateId,
          candidateName: candidateName || 'Candidate',
          position: position || 'Position',
          status: 'in-progress',
          startedAt: new Date().toISOString(),
          emotionAnalysis: emotionData,
          cheatingDetection,
          realTimeAnalysis: [],
          aiResponse: {
            nextQuestion: '',
            followUp: '',
            audioUrl: '',
            emotion: 'neutral',
            confidence: 0
          }
        })
      })
      
      const result = await response.json()
      if (result.success) {
        setInterviewId(result.data.id)
        toast({
          title: "Interview Started",
          description: "Video interview is now recording with AI analysis."
        })
        
        // Start with initial AI question
        const initialQuestion = "Hello! I'm your AI interviewer. Let's start with you telling me about your background and experience. What brings you to this interview today?"
        setCurrentQuestion(initialQuestion)
        setAiResponse(initialQuestion)
        await playAiResponse(initialQuestion)
        
        // Start duration timer
        const timer = setInterval(() => {
          setInterviewDuration(prev => prev + 1)
        }, 1000)
        
        // Store timer reference for cleanup
        return () => clearInterval(timer)
      }
    } catch (error) {
      console.error('Error starting interview:', error)
      toast({
        title: "Error",
        description: "Failed to start interview. Please try again.",
        variant: "destructive"
      })
    }
  }

  // Stop interview
  const stopInterview = async () => {
    try {
      setIsRecording(false)
      stopVideo()
      
      if (interviewId) {
        // Update interview with final data
        await fetch(`/api/video-interviews/${interviewId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            status: 'completed',
            completedAt: new Date().toISOString(),
            duration: interviewDuration,
            emotionAnalysis: emotionData,
            cheatingDetection,
            realTimeAnalysis,
            transcript
          })
        })
        
        toast({
          title: "Interview Completed",
          description: "Your interview has been recorded and analyzed."
        })
        
        if (onComplete) {
          onComplete(interviewId)
        }
      }
    } catch (error) {
      console.error('Error stopping interview:', error)
    }
  }

  // Toggle video/audio
  const toggleVideo = () => {
    if (streamRef.current) {
      const videoTrack = streamRef.current.getVideoTracks()[0]
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled
        setIsVideoOn(videoTrack.enabled)
      }
    }
  }

  const toggleAudio = () => {
    if (streamRef.current) {
      const audioTrack = streamRef.current.getAudioTracks()[0]
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled
        setIsAudioOn(audioTrack.enabled)
      }
    }
  }

  useEffect(() => {
    startVideo()
    return () => stopVideo()
  }, [])

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Video className="h-5 w-5" />
            AI Video Interview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Video Feed */}
            <div className="lg:col-span-2">
              <div className="relative bg-black rounded-lg overflow-hidden">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-64 lg:h-96 object-cover"
                />
                <canvas
                  ref={canvasRef}
                  className="absolute top-0 left-0 w-full h-full opacity-0"
                />
                
                {/* Recording indicator */}
                {isRecording && (
                  <div className="absolute top-4 right-4 flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                    <span className="text-white text-sm font-medium">REC</span>
                  </div>
                )}
                
                {/* Duration */}
                {isRecording && (
                  <div className="absolute top-4 left-4 flex items-center gap-2 bg-black/50 px-2 py-1 rounded">
                    <Clock className="h-4 w-4 text-white" />
                    <span className="text-white text-sm font-medium">
                      {Math.floor(interviewDuration / 60)}:{(interviewDuration % 60).toString().padStart(2, '0')}
                    </span>
                  </div>
                )}
                
                {/* Controls */}
                <div className="absolute bottom-4 left-4 flex gap-2">
                  <Button
                    size="sm"
                    variant={isVideoOn ? "default" : "secondary"}
                    onClick={toggleVideo}
                  >
                    {isVideoOn ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                  </Button>
                  <Button
                    size="sm"
                    variant={isAudioOn ? "default" : "secondary"}
                    onClick={toggleAudio}
                  >
                    {isAudioOn ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              
              {/* Interview Controls */}
              <div className="flex justify-center gap-4 mt-4">
                {!isRecording ? (
                  <Button onClick={startInterview} className="bg-green-600 hover:bg-green-700">
                    <Play className="h-4 w-4 mr-2" />
                    Start Interview
                  </Button>
                ) : (
                  <Button onClick={stopInterview} variant="destructive">
                    <Square className="h-4 w-4 mr-2" />
                    End Interview
                  </Button>
                )}
              </div>
            </div>

            {/* Real-time Analysis */}
            <div className="space-y-4">
              <Tabs defaultValue="emotion" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="emotion">Emotion</TabsTrigger>
                  <TabsTrigger value="cheating">Security</TabsTrigger>
                  <TabsTrigger value="analysis">Analysis</TabsTrigger>
                </TabsList>
                
                <TabsContent value="emotion" className="space-y-4">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-sm">
                        <Heart className="h-4 w-4" />
                        Emotional State
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Primary Emotion:</span>
                        <Badge variant={emotionData.primaryEmotion === 'neutral' ? 'secondary' : 'default'}>
                          {emotionData.primaryEmotion}
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Confidence:</span>
                        <span className="text-sm font-medium">{emotionData.confidence}%</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Stress Level:</span>
                        <span className="text-sm font-medium">{emotionData.stressLevel}%</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Engagement:</span>
                        <span className="text-sm font-medium">{emotionData.engagementLevel}%</span>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="cheating" className="space-y-4">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-sm">
                        <Shield className="h-4 w-4" />
                        Security Analysis
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Risk Level:</span>
                        <Badge 
                          variant={
                            cheatingDetection.riskLevel === 'high' ? 'destructive' :
                            cheatingDetection.riskLevel === 'medium' ? 'secondary' : 'default'
                          }
                        >
                          {cheatingDetection.riskLevel.toUpperCase()}
                        </Badge>
                      </div>
                      {cheatingDetection.suspiciousBehavior.length > 0 && (
                        <div className="space-y-2">
                          <span className="text-sm font-medium">Suspicious Activity:</span>
                          <div className="space-y-1">
                            {cheatingDetection.suspiciousBehavior.map((behavior, index) => (
                              <div key={index} className="flex items-center gap-2">
                                <AlertTriangle className="h-3 w-3 text-red-500" />
                                <span className="text-xs text-red-600">{behavior}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="analysis" className="space-y-4">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-sm">
                        <TrendingUp className="h-4 w-4" />
                        Real-time Analysis
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="space-y-2 max-h-32 overflow-y-auto">
                        {realTimeAnalysis.slice(-5).map((analysis, index) => (
                          <div key={index} className="text-xs p-2 bg-gray-50 rounded">
                            <div className="flex justify-between">
                              <span className="font-medium">{analysis.currentEmotion}</span>
                              <span>{analysis.confidenceScore}%</span>
                            </div>
                            <div className="text-gray-600 truncate">{analysis.speechToText}</div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
              
              {/* Current Question */}
              {currentQuestion && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-sm">
                      <Brain className="h-4 w-4" />
                      Current Question
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">{currentQuestion}</p>
                    {isPlayingAiResponse && (
                      <div className="flex items-center gap-2 mt-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                        <span className="text-xs text-blue-600">AI Speaking...</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 