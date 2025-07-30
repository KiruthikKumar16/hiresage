'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { toast } from 'sonner'
import { interviewService } from '@/lib/interview-service'

interface VideoInterviewProps {
  interviewId: string
  onComplete: (summary: any) => void
}

export function VideoInterview({ interviewId, onComplete }: VideoInterviewProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState('')
  const [isRecording, setIsRecording] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [questionCount, setQuestionCount] = useState(0)
  const [maxQuestions] = useState(5)
  const [isInterviewComplete, setIsInterviewComplete] = useState(false)
  const [emotionData, setEmotionData] = useState<any>(null)
  const [cheatingData, setCheatingData] = useState<any>(null)

  const videoRef = useRef<HTMLVideoElement>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const streamRef = useRef<MediaStream | null>(null)

  // Initialize video and audio
  const initializeMedia = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480 },
        audio: true
      })

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.play()
      }

      streamRef.current = stream

      // Initialize speech recognition
      if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
        recognitionRef.current = new SpeechRecognition()
        recognitionRef.current.continuous = true
        recognitionRef.current.interimResults = true
        recognitionRef.current.lang = 'en-US'

        recognitionRef.current.onresult = (event) => {
          let finalTranscript = ''
          for (let i = event.resultIndex; i < event.results.length; i++) {
            if (event.results[i].isFinal) {
              finalTranscript += event.results[i][0].transcript
            }
          }
          if (finalTranscript) {
            setTranscript(prev => prev + ' ' + finalTranscript)
          }
        }

        recognitionRef.current.onerror = (event) => {
          console.error('Speech recognition error:', event.error)
          toast.error('Speech recognition error')
        }
      }

      toast.success('Camera and microphone initialized')
    } catch (error) {
      console.error('Error initializing media:', error)
      toast.error('Failed to access camera/microphone')
    }
  }, [])

  // Start recording
  const startRecording = useCallback(() => {
    if (!streamRef.current) return

    try {
      const mediaRecorder = new MediaRecorder(streamRef.current)
      const chunks: Blob[] = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data)
        }
      }

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(chunks, { type: 'audio/wav' })
        await submitAnswer(audioBlob)
      }

      mediaRecorder.start()
      mediaRecorderRef.current = mediaRecorder
      setIsRecording(true)

      // Start speech recognition
      if (recognitionRef.current) {
        recognitionRef.current.start()
      }

      toast.success('Recording started')
    } catch (error) {
      console.error('Error starting recording:', error)
      toast.error('Failed to start recording')
    }
  }, [])

  // Stop recording
  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)

      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }

      toast.success('Recording stopped')
    }
  }, [isRecording])

  // Submit answer
  const submitAnswer = async (audioBlob?: Blob) => {
    if (!transcript.trim()) {
      toast.error('Please provide an answer')
      return
    }

    setIsLoading(true)

    try {
      // Detect emotions and cheating
      const emotion = await interviewService.detectEmotions(null)
      const cheating = await interviewService.detectCheating(null, null)
      
      setEmotionData(emotion)
      setCheatingData(cheating)

      const response = await fetch('/api/interview/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          interview_id: interviewId,
          answer: transcript,
          emotion_data: emotion,
          cheating_data: cheating
        })
      })

      const result = await response.json()

      if (result.success) {
        setQuestionCount(prev => prev + 1)
        setTranscript('')
        
        if (questionCount + 1 >= maxQuestions) {
          await completeInterview()
        } else {
          await generateNextQuestion()
        }
      } else {
        toast.error(result.error || 'Failed to submit answer')
      }
    } catch (error) {
      console.error('Error submitting answer:', error)
      toast.error('Failed to submit answer')
    } finally {
      setIsLoading(false)
    }
  }

  // Generate next question
  const generateNextQuestion = async () => {
    try {
      const response = await fetch('/api/interview/question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          interview_id: interviewId,
          previous_questions: []
        })
      })

      const result = await response.json()

      if (result.success) {
        setCurrentQuestion(result.question)
        
        // Text-to-speech for the question
        if ('speechSynthesis' in window) {
          const utterance = new SpeechSynthesisUtterance(result.question)
          utterance.rate = 0.9
          utterance.pitch = 1
          speechSynthesis.speak(utterance)
        }
      } else {
        toast.error(result.error || 'Failed to generate question')
      }
    } catch (error) {
      console.error('Error generating question:', error)
      toast.error('Failed to generate question')
    }
  }

  // Complete interview
  const completeInterview = async () => {
    try {
      const response = await fetch('/api/interview/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ interview_id: interviewId })
      })

      const result = await response.json()

      if (result.success) {
        setIsInterviewComplete(true)
        onComplete(result.summary)
        toast.success('Interview completed!')
      } else {
        toast.error(result.error || 'Failed to complete interview')
      }
    } catch (error) {
      console.error('Error completing interview:', error)
      toast.error('Failed to complete interview')
    }
  }

  // Initialize on mount
  useEffect(() => {
    initializeMedia()
    generateNextQuestion()
  }, [initializeMedia])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
      }
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
    }
  }, [])

  if (isInterviewComplete) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="text-center text-green-600">Interview Completed!</CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-lg mb-4">Thank you for completing the interview.</p>
          <p>Your responses have been analyzed and a detailed report will be generated.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>AI Interview Session</span>
            <div className="flex items-center space-x-4">
              <Badge variant="secondary">
                Question {questionCount + 1} of {maxQuestions}
              </Badge>
              <Progress value={(questionCount / maxQuestions) * 100} className="w-24" />
            </div>
          </CardTitle>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Video Section */}
        <Card>
          <CardHeader>
            <CardTitle>Video Feed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <video
                ref={videoRef}
                className="w-full h-64 bg-black rounded-lg"
                autoPlay
                muted
                playsInline
              />
              {isRecording && (
                <div className="absolute top-4 right-4">
                  <div className="w-4 h-4 bg-red-500 rounded-full animate-pulse" />
                </div>
              )}
            </div>
            
            <div className="mt-4 space-y-2">
              <Button
                onClick={isRecording ? stopRecording : startRecording}
                variant={isRecording ? "destructive" : "default"}
                className="w-full"
                disabled={isLoading}
              >
                {isRecording ? 'Stop Recording' : 'Start Recording'}
              </Button>
              
              {transcript && (
                <Alert>
                  <AlertDescription>
                    <strong>Transcript:</strong> {transcript}
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Question and Analysis Section */}
        <Card>
          <CardHeader>
            <CardTitle>Current Question</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {currentQuestion && (
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-lg font-medium">{currentQuestion}</p>
              </div>
            )}

            {/* Emotion Analysis */}
            {emotionData && (
              <div className="space-y-2">
                <h4 className="font-medium">Emotion Analysis</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>Primary Emotion: <Badge>{emotionData.primary_emotion}</Badge></div>
                  <div>Stress Level: <Badge variant="outline">{emotionData.stress_level}</Badge></div>
                  <div>Engagement: <Badge variant="outline">{emotionData.engagement}</Badge></div>
                  <div>Confidence: <Badge variant="outline">{emotionData.confidence}</Badge></div>
                </div>
              </div>
            )}

            {/* Cheating Detection */}
            {cheatingData && cheatingData.flags.length > 0 && (
              <Alert variant="destructive">
                <AlertDescription>
                  <strong>Cheating Detection:</strong> {cheatingData.flags.join(', ')}
                </AlertDescription>
              </Alert>
            )}

            <Button
              onClick={() => submitAnswer()}
              className="w-full"
              disabled={!transcript.trim() || isLoading}
            >
              {isLoading ? 'Processing...' : 'Submit Answer'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 