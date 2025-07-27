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
  Activity
} from 'lucide-react'

interface VideoInterviewProps {
  candidateId?: string
  onComplete?: (interviewId: string) => void
}

interface EmotionData {
  emotion: string
  confidence: number
  stressLevel: number
  engagementLevel: number
}

interface CheatingDetection {
  multipleFaces: boolean
  screenSharing: boolean
  backgroundNoise: boolean
  unusualMovements: boolean
  suspiciousBehavior: string[]
}

interface RealTimeAnalysis {
  speechToText: string
  currentEmotion: string
  confidenceScore: number
  deceptionScore: number
  timestamp: Date
}

export function VideoInterview({ candidateId, onComplete }: VideoInterviewProps) {
  const { toast } = useToast()
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  
  const [isRecording, setIsRecording] = useState(false)
  const [isVideoOn, setIsVideoOn] = useState(true)
  const [isAudioOn, setIsAudioOn] = useState(true)
  const [interviewId, setInterviewId] = useState<string | null>(null)
  const [currentQuestion, setCurrentQuestion] = useState<string>('')
  const [aiResponse, setAiResponse] = useState<string>('')
  const [isPlayingAiResponse, setIsPlayingAiResponse] = useState(false)
  
  // Real-time analysis states
  const [emotionData, setEmotionData] = useState<EmotionData>({
    emotion: 'neutral',
    confidence: 0,
    stressLevel: 0,
    engagementLevel: 0
  })
  
  const [cheatingDetection, setCheatingDetection] = useState<CheatingDetection>({
    multipleFaces: false,
    screenSharing: false,
    backgroundNoise: false,
    unusualMovements: false,
    suspiciousBehavior: []
  })
  
  const [realTimeAnalysis, setRealTimeAnalysis] = useState<RealTimeAnalysis[]>([])
  const [transcript, setTranscript] = useState<string>('')
  const [isProcessing, setIsProcessing] = useState(false)

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
        
        // Start emotion analysis
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

  // Emotion analysis using canvas
  const startEmotionAnalysis = () => {
    const canvas = canvasRef.current
    const video = videoRef.current
    if (!canvas || !video) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const analyzeFrame = () => {
      if (video.videoWidth && video.videoHeight) {
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
        
        // Simulate emotion analysis (in real app, this would use AI/ML)
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
        const emotions = ['happy', 'sad', 'angry', 'surprised', 'neutral', 'confused']
        const randomEmotion = emotions[Math.floor(Math.random() * emotions.length)]
        
        setEmotionData({
          emotion: randomEmotion,
          confidence: Math.random() * 100,
          stressLevel: Math.random() * 100,
          engagementLevel: Math.random() * 100
        })
      }
      
      if (isRecording) {
        requestAnimationFrame(analyzeFrame)
      }
    }
    
    analyzeFrame()
  }

  // Cheating detection
  const startCheatingDetection = () => {
    const checkForCheating = () => {
      // Simulate cheating detection (in real app, this would use computer vision)
      const suspiciousBehaviors = []
      
      if (Math.random() > 0.95) {
        suspiciousBehaviors.push('Multiple faces detected')
        setCheatingDetection(prev => ({ ...prev, multipleFaces: true }))
      }
      
      if (Math.random() > 0.98) {
        suspiciousBehaviors.push('Screen sharing detected')
        setCheatingDetection(prev => ({ ...prev, screenSharing: true }))
      }
      
      if (Math.random() > 0.97) {
        suspiciousBehaviors.push('Unusual movements detected')
        setCheatingDetection(prev => ({ ...prev, unusualMovements: true }))
      }
      
      if (suspiciousBehaviors.length > 0) {
        setCheatingDetection(prev => ({
          ...prev,
          suspiciousBehavior: [...prev.suspiciousBehavior, ...suspiciousBehaviors]
        }))
        
        toast({
          title: "Suspicious Activity Detected",
          description: suspiciousBehaviors.join(', '),
          variant: "destructive"
        })
      }
      
      if (isRecording) {
        setTimeout(checkForCheating, 5000) // Check every 5 seconds
      }
    }
    
    checkForCheating()
  }

  // Speech recognition
  const startSpeechRecognition = () => {
    if ('webkitSpeechRecognition' in window) {
      const recognition = new (window as any).webkitSpeechRecognition()
      recognition.continuous = true
      recognition.interimResults = true
      recognition.lang = 'en-US'
      
      recognition.onresult = (event: any) => {
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
        
        // Add to real-time analysis
        const analysis: RealTimeAnalysis = {
          speechToText: currentText,
          currentEmotion: emotionData.emotion,
          confidenceScore: emotionData.confidence,
          deceptionScore: Math.random() * 100,
          timestamp: new Date()
        }
        
        setRealTimeAnalysis(prev => [...prev, analysis])
        
        // Generate AI response if there's substantial speech
        if (finalTranscript.length > 20 && !isProcessing) {
          generateAiResponse(finalTranscript)
        }
      }
      
      recognition.start()
    }
  }

  // Generate AI response
  const generateAiResponse = async (userSpeech: string) => {
    setIsProcessing(true)
    
    try {
      // Simulate AI processing time
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Generate contextual response based on user speech
      const responses = [
        "That's interesting. Can you elaborate on your experience with that technology?",
        "I see. How would you handle a challenging situation in that context?",
        "Great point. What would you do differently if you had to do it again?",
        "Tell me more about your approach to problem-solving.",
        "How do you stay updated with the latest trends in your field?"
      ]
      
      const randomResponse = responses[Math.floor(Math.random() * responses.length)]
      setAiResponse(randomResponse)
      setCurrentQuestion(randomResponse)
      
      // Convert to speech and play
      await playAiResponse(randomResponse)
      
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
            duration: realTimeAnalysis.length * 5, // Approximate duration
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
                
                {/* Controls */}
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center gap-2">
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
              {/* Emotion Analysis */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Heart className="h-4 w-4" />
                    Emotion Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs">Current Emotion:</span>
                    <Badge variant="outline">{emotionData.emotion}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs">Confidence:</span>
                    <span className="text-xs">{emotionData.confidence.toFixed(1)}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs">Stress Level:</span>
                    <span className="text-xs">{emotionData.stressLevel.toFixed(1)}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs">Engagement:</span>
                    <span className="text-xs">{emotionData.engagementLevel.toFixed(1)}%</span>
                  </div>
                </CardContent>
              </Card>

              {/* Cheating Detection */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" />
                    Security Monitor
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs">Multiple Faces:</span>
                    {cheatingDetection.multipleFaces ? (
                      <XCircle className="h-4 w-4 text-red-500" />
                    ) : (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs">Screen Sharing:</span>
                    {cheatingDetection.screenSharing ? (
                      <XCircle className="h-4 w-4 text-red-500" />
                    ) : (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs">Unusual Movements:</span>
                    {cheatingDetection.unusualMovements ? (
                      <XCircle className="h-4 w-4 text-red-500" />
                    ) : (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* AI Response */}
              {aiResponse && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Brain className="h-4 w-4" />
                      AI Response
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs text-muted-foreground mb-2">
                      {isPlayingAiResponse ? "Speaking..." : "Last response:"}
                    </p>
                    <p className="text-sm">{aiResponse}</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {/* Transcript and Analysis */}
          <Tabs defaultValue="transcript" className="mt-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="transcript">Live Transcript</TabsTrigger>
              <TabsTrigger value="analysis">Real-time Analysis</TabsTrigger>
              <TabsTrigger value="security">Security Log</TabsTrigger>
            </TabsList>
            
            <TabsContent value="transcript" className="mt-4">
              <Card>
                <CardContent className="pt-4">
                  <div className="h-32 overflow-y-auto bg-muted p-3 rounded">
                    {transcript || "Waiting for speech..."}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="analysis" className="mt-4">
              <Card>
                <CardContent className="pt-4">
                  <div className="h-32 overflow-y-auto space-y-2">
                    {realTimeAnalysis.slice(-10).map((analysis, index) => (
                      <div key={index} className="text-xs p-2 bg-muted rounded">
                        <div className="flex justify-between">
                          <span>{analysis.speechToText}</span>
                          <span className="text-muted-foreground">
                            {analysis.timestamp.toLocaleTimeString()}
                          </span>
                        </div>
                        <div className="flex gap-4 mt-1 text-muted-foreground">
                          <span>Emotion: {analysis.currentEmotion}</span>
                          <span>Confidence: {analysis.confidenceScore.toFixed(1)}%</span>
                          <span>Deception: {analysis.deceptionScore.toFixed(1)}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="security" className="mt-4">
              <Card>
                <CardContent className="pt-4">
                  <div className="h-32 overflow-y-auto space-y-2">
                    {cheatingDetection.suspiciousBehavior.map((behavior, index) => (
                      <div key={index} className="text-xs p-2 bg-red-50 border border-red-200 rounded">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="h-3 w-3 text-red-500" />
                          <span className="text-red-700">{behavior}</span>
                        </div>
                      </div>
                    ))}
                    {cheatingDetection.suspiciousBehavior.length === 0 && (
                      <p className="text-xs text-muted-foreground">No suspicious activity detected</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
} 