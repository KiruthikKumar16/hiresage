"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  Play, 
  Pause, 
  Square, 
  Mic, 
  MicOff, 
  MessageSquare, 
  Brain, 
  Clock,
  CheckCircle,
  AlertCircle,
  User,
  Bot,
  Send,
  Loader2,
  Save
} from "lucide-react"
import { toast } from "sonner"

interface Message {
  id: string
  type: "ai" | "user"
  content: string
  timestamp: Date
}

interface InterviewState {
  isRecording: boolean
  isActive: boolean
  currentQuestion: number
  totalQuestions: number
  duration: number
  messages: Message[]
  interviewId?: string
}

interface Candidate {
  id: string
  name: string
  email: string
  position: string
}

export function InterviewSession() {
  const [interviewState, setInterviewState] = useState<InterviewState>({
    isRecording: false,
    isActive: false,
    currentQuestion: 0,
    totalQuestions: 5,
    duration: 0,
    messages: []
  })

  const [selectedCandidate, setSelectedCandidate] = useState("")
  const [selectedPosition, setSelectedPosition] = useState("")
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [loading, setLoading] = useState(false)
  const [messageInput, setMessageInput] = useState("")
  const [sendingMessage, setSendingMessage] = useState(false)

  const questions = [
    "Tell me about your experience with React and modern JavaScript frameworks.",
    "How do you handle state management in large applications?",
    "Describe a challenging project you worked on and how you solved it.",
    "What's your approach to testing and code quality?",
    "How do you stay updated with the latest technologies?"
  ]

  const positions = [
    "Frontend Developer",
    "Backend Developer", 
    "Full Stack Developer",
    "Data Scientist",
    "Product Manager",
    "DevOps Engineer",
    "UX Designer",
    "Mobile Developer"
  ]

  useEffect(() => {
    fetchCandidates()
  }, [])

  const fetchCandidates = async () => {
    try {
      const response = await fetch('/api/candidates')
      const data = await response.json()
      
      if (data.success) {
        setCandidates(data.data)
      } else {
        toast.error('Failed to fetch candidates')
      }
    } catch (error) {
      console.error('Error fetching candidates:', error)
      toast.error('Failed to fetch candidates')
    }
  }

  const startInterview = async () => {
    if (!selectedCandidate || !selectedPosition) {
      toast.error("Please select a candidate and position")
      return
    }

    try {
      setLoading(true)
      
      const candidate = candidates.find(c => c.id === selectedCandidate)
      if (!candidate) {
        toast.error("Selected candidate not found")
        return
      }

      // Create interview in database
      const interviewData = {
        candidateId: selectedCandidate,
        candidateName: candidate.name,
        position: selectedPosition,
        status: "in-progress",
        questions: questions.map((question, index) => ({
          id: `q_${index + 1}`,
          question,
          category: "technical",
          weight: 2,
          answered: false
        })),
        messages: [],
        startedAt: new Date()
      }

      const response = await fetch('/api/interviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(interviewData),
      })

      const result = await response.json()

      if (result.success) {
        const interviewId = result.data.id
        
        // Add initial AI message
        const initialMessage: Message = {
          id: `msg_${Date.now()}`,
          type: "ai",
          content: `Hello! I'm your AI interviewer. I'll be asking you ${questions.length} questions about ${selectedPosition}. Let's start with the first question: ${questions[0]}`,
          timestamp: new Date()
        }

        await fetch(`/api/interviews/${interviewId}/messages`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(initialMessage),
        })

        setInterviewState(prev => ({
          ...prev,
          isActive: true,
          isRecording: true,
          interviewId,
          messages: [initialMessage]
        }))

        toast.success("Interview started!")
      } else {
        toast.error(result.message || "Failed to start interview")
      }
    } catch (error) {
      console.error('Error starting interview:', error)
      toast.error('Failed to start interview')
    } finally {
      setLoading(false)
    }
  }

  const stopInterview = async () => {
    if (!interviewState.interviewId) return

    try {
      setLoading(true)
      
      // Update interview status to completed
      await fetch(`/api/interviews/${interviewState.interviewId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: "completed",
          completedAt: new Date(),
          duration: interviewState.duration
        }),
      })

      setInterviewState(prev => ({
        ...prev,
        isActive: false,
        isRecording: false
      }))
      
      toast.success("Interview completed!")
    } catch (error) {
      console.error('Error stopping interview:', error)
      toast.error('Failed to complete interview')
    } finally {
      setLoading(false)
    }
  }

  const toggleRecording = () => {
    setInterviewState(prev => ({
      ...prev,
      isRecording: !prev.isRecording
    }))
  }

  const sendMessage = async (content: string) => {
    if (!content.trim() || !interviewState.interviewId) return

    try {
      setSendingMessage(true)
      
      const userMessage: Message = {
        id: `msg_${Date.now()}`,
        type: "user",
        content,
        timestamp: new Date()
      }

      // Add user message to database
      await fetch(`/api/interviews/${interviewState.interviewId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userMessage),
      })

      setInterviewState(prev => ({
        ...prev,
        messages: [...prev.messages, userMessage]
      }))

      setMessageInput("")

      // Generate AI response using real AI service
      const selectedCandidateData = candidates.find(c => c.id === selectedCandidate)
      const context = {
        candidateName: selectedCandidateData?.name || 'Candidate',
        position: selectedPosition,
        experience: selectedCandidateData?.position || 'Not specified',
        skills: ['Technical skills', 'Problem solving', 'Communication'],
        previousQuestions: interviewState.messages.filter(m => m.type === 'ai').map(m => m.content),
        transcript: interviewState.messages.map(m => `${m.type}: ${m.content}`).join('\n'),
        currentEmotion: 'neutral',
        confidenceLevel: 75
      }

      const aiResponseContent = await generateAIResponse(content, context)
      
      const aiResponse: Message = {
        id: `msg_${Date.now() + 1}`,
        type: "ai",
        content: aiResponseContent,
        timestamp: new Date()
      }

      // Add AI message to database
      await fetch(`/api/interviews/${interviewState.interviewId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(aiResponse),
      })

      setInterviewState(prev => ({
        ...prev,
        messages: [...prev.messages, aiResponse],
        currentQuestion: prev.currentQuestion + 1
      }))
    } catch (error) {
      console.error('Error sending message:', error)
      toast.error('Failed to send message')
    } finally {
      setSendingMessage(false)
    }
  }

  const generateAIResponse = async (userMessage: string, context: any): Promise<string> => {
    try {
      const response = await fetch('/api/ai/interview', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'analyze_response',
          response: userMessage,
          context: context
        })
      })

      const data = await response.json()
      
      if (data.success) {
        return data.data.feedback || "Thank you for your response. Let's continue."
      } else {
        console.error('AI response error:', data.error)
        return "Thank you for your response. Let's continue with the next question."
      }
    } catch (error) {
      console.error('Error generating AI response:', error)
      return "Thank you for your response. Let's continue with the next question."
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (messageInput.trim() && !sendingMessage) {
      sendMessage(messageInput)
    }
  }

  return (
    <div className="space-y-6">
      {/* Interview Setup */}
      {!interviewState.isActive && (
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Start New Interview</CardTitle>
            <CardDescription className="text-slate-300">
              Select a candidate and position to begin the AI interview
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-slate-300 mb-2 block">Candidate</label>
                <Select onValueChange={setSelectedCandidate}>
                  <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                    <SelectValue placeholder="Select a candidate" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-700 border-slate-600">
                    {candidates.map((candidate) => (
                      <SelectItem key={candidate.id} value={candidate.id}>
                        {candidate.name} - {candidate.position}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium text-slate-300 mb-2 block">Position</label>
                <Select onValueChange={setSelectedPosition}>
                  <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                    <SelectValue placeholder="Select position" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-700 border-slate-600">
                    {positions.map((position) => (
                      <SelectItem key={position} value={position}>
                        {position}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <Button 
              onClick={startInterview}
              disabled={loading || !selectedCandidate || !selectedPosition}
              className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 w-full"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Play className="w-4 h-4 mr-2" />
              )}
              Start Interview
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Active Interview */}
      {interviewState.isActive && (
        <div className="space-y-6">
          {/* Interview Controls */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-white">Interview in Progress</CardTitle>
                  <CardDescription className="text-slate-300">
                    Question {interviewState.currentQuestion + 1} of {interviewState.totalQuestions}
                  </CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge className={interviewState.isRecording ? "bg-red-600" : "bg-slate-600"}>
                    {interviewState.isRecording ? (
                      <>
                        <Mic className="w-3 h-3 mr-1" />
                        Recording
                      </>
                    ) : (
                      <>
                        <MicOff className="w-3 h-3 mr-1" />
                        Paused
                      </>
                    )}
                  </Badge>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={toggleRecording}
                    className="border-slate-600 text-slate-300"
                  >
                    {interviewState.isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={stopInterview}
                    disabled={loading}
                    className="border-red-600 text-red-400 hover:bg-red-600/20"
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Square className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between text-sm text-slate-400">
                <span>Duration: {Math.floor(interviewState.duration / 60)}:{(interviewState.duration % 60).toString().padStart(2, '0')}</span>
                <span>Position: {selectedPosition}</span>
              </div>
            </CardContent>
          </Card>

          {/* Chat Interface */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Interview Conversation</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 mb-4 max-h-96 overflow-y-auto">
                {interviewState.messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        message.type === "user"
                          ? "bg-blue-600 text-white"
                          : "bg-slate-700 text-slate-300"
                      }`}
                    >
                      <div className="flex items-center space-x-2 mb-1">
                        {message.type === "user" ? (
                          <User className="w-4 h-4" />
                        ) : (
                          <Bot className="w-4 h-4" />
                        )}
                        <span className="text-xs opacity-70">
                          {message.type === "user" ? "You" : "AI Interviewer"}
                        </span>
                      </div>
                      <p className="text-sm">{message.content}</p>
                      <span className="text-xs opacity-50 mt-1 block">
                        {new Date(message.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                ))}
                {sendingMessage && (
                  <div className="flex justify-start">
                    <div className="bg-slate-700 text-slate-300 max-w-xs lg:max-w-md px-4 py-2 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <Bot className="w-4 h-4" />
                        <span className="text-xs opacity-70">AI Interviewer</span>
                      </div>
                      <div className="flex items-center space-x-2 mt-1">
                        <Loader2 className="w-3 h-3 animate-spin" />
                        <span className="text-xs">Typing...</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Message Input */}
              <form onSubmit={handleSubmit} className="flex space-x-2">
                <Input
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  placeholder="Type your response..."
                  className="flex-1 bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
                  disabled={sendingMessage}
                />
                <Button
                  type="submit"
                  disabled={!messageInput.trim() || sendingMessage}
                  className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
                >
                  {sendingMessage ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
} 