import { supabase } from './supabase-client'
import { aiService } from './ai-service'
import { authService } from './auth'

export interface InterviewSettings {
  position: string
  candidate_name: string
  duration: number
  question_count: number
  cheating_detection: boolean
  emotion_analysis: boolean
}

export interface CheatingDetection {
  gaze_tracking: boolean
  head_pose: boolean
  lip_sync: boolean
  voice_matching: boolean
  background_audio: boolean
  face_spoofing: boolean
  tab_switching: boolean
  flags: string[]
  confidence: number
}

export interface EmotionData {
  primary_emotion: string
  stress_level: string
  engagement: string
  confidence: string
  timestamp: string
}

export class InterviewService {
  // Start a new interview
  async startInterview(settings: InterviewSettings): Promise<{ success: boolean; interview_id?: string; error?: string }> {
    try {
      const user = await authService.getCurrentUser()
      if (!user) {
        return { success: false, error: 'User not authenticated' }
      }

      // Check if user has remaining interviews
      const remainingInterviews = await authService.getRemainingInterviews(user.id)
      if (remainingInterviews <= 0) {
        return { success: false, error: 'No interviews remaining. Please upgrade your plan.' }
      }

      // Create interview record
      const { data: interview, error } = await supabase
        .from('interviews')
        .insert({
          user_id: user.id,
          organization_id: user.organization_id,
          candidate_name: settings.candidate_name,
          position: settings.position,
          status: 'pending'
        })
        .select()
        .single()

      if (error) {
        console.error('Error creating interview:', error)
        return { success: false, error: 'Failed to create interview' }
      }

      // Create interview session
      const sessionToken = this.generateSessionToken()
      const { error: sessionError } = await supabase
        .from('interview_sessions')
        .insert({
          interview_id: interview.id,
          session_token: sessionToken,
          settings: settings
        })

      if (sessionError) {
        console.error('Error creating session:', sessionError)
        return { success: false, error: 'Failed to create session' }
      }

      return { success: true, interview_id: interview.id }
    } catch (error) {
      console.error('Error starting interview:', error)
      return { success: false, error: 'Failed to start interview' }
    }
  }

  // Get interview session
  async getInterviewSession(interviewId: string): Promise<any> {
    try {
      const { data, error } = await supabase
        .from('interview_sessions')
        .select('*')
        .eq('interview_id', interviewId)
        .single()

      if (error) {
        console.error('Error getting session:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('Error getting interview session:', error)
      return null
    }
  }

  // Generate next question
  async generateNextQuestion(interviewId: string, previousQuestions: string[] = []): Promise<any> {
    try {
      const interview = await this.getInterview(interviewId)
      if (!interview) {
        return { success: false, error: 'Interview not found' }
      }

      const session = await this.getInterviewSession(interviewId)
      if (!session) {
        return { success: false, error: 'Session not found' }
      }

      const context = `Interview for ${interview.position} position. Previous questions: ${previousQuestions.join(', ')}`
      
      const questionData = await aiService.generateQuestion(
        context,
        previousQuestions,
        { name: interview.candidate_name, position: interview.position },
        interview.position
      )

      // Save AI message
      await this.saveMessage(interviewId, session.id, 'ai', questionData.question)

      return {
        success: true,
        question: questionData.question,
        category: questionData.category,
        difficulty: questionData.difficulty,
        timeLimit: questionData.timeLimit
      }
    } catch (error) {
      console.error('Error generating question:', error)
      return { success: false, error: 'Failed to generate question' }
    }
  }

  // Submit answer and analyze
  async submitAnswer(interviewId: string, answer: string, emotionData?: EmotionData, cheatingData?: CheatingDetection): Promise<any> {
    try {
      const interview = await this.getInterview(interviewId)
      if (!interview) {
        return { success: false, error: 'Interview not found' }
      }

      const session = await this.getInterviewSession(interviewId)
      if (!session) {
        return { success: false, error: 'Session not found' }
      }

      // Save user message
      await this.saveMessage(interviewId, session.id, 'user', answer)

      // Get the last AI question
      const { data: messages } = await supabase
        .from('messages')
        .select('*')
        .eq('interview_id', interviewId)
        .eq('role', 'ai')
        .order('timestamp', { ascending: false })
        .limit(1)
        .single()

      const lastQuestion = messages?.content || ''

      // Analyze the answer
      const analysis = await aiService.analyzeResponse(lastQuestion, answer, emotionData, cheatingData)

      // Update interview with analysis data
      await supabase
        .from('interviews')
        .update({
          transcript: interview.transcript + `\nQ: ${lastQuestion}\nA: ${answer}`,
          emotion_data: emotionData || {},
          cheating_flags: cheatingData?.flags || []
        })
        .eq('id', interviewId)

      return {
        success: true,
        analysis: analysis,
        nextQuestion: analysis.nextQuestion
      }
    } catch (error) {
      console.error('Error submitting answer:', error)
      return { success: false, error: 'Failed to submit answer' }
    }
  }

  // Complete interview
  async completeInterview(interviewId: string): Promise<any> {
    try {
      const interview = await this.getInterview(interviewId)
      if (!interview) {
        return { success: false, error: 'Interview not found' }
      }

      // Get all messages for summary
      const { data: messages } = await supabase
        .from('messages')
        .select('*')
        .eq('interview_id', interviewId)
        .order('timestamp', { ascending: true })

      if (!messages) {
        return { success: false, error: 'No messages found' }
      }

      // Generate summary
      const questions = messages.filter(m => m.role === 'ai').map(m => m.content)
      const responses = messages.filter(m => m.role === 'user').map(m => m.content)
      const analysis = await aiService.generateSummary(questions, responses, [])

      // Update interview
      const { error } = await supabase
        .from('interviews')
        .update({
          status: 'completed',
          ai_feedback: analysis.summary,
          completed_at: new Date().toISOString()
        })
        .eq('id', interviewId)

      if (error) {
        console.error('Error completing interview:', error)
        return { success: false, error: 'Failed to complete interview' }
      }

      // Increment interviews used
      await this.incrementInterviewsUsed(interview.user_id)

      return {
        success: true,
        summary: analysis
      }
    } catch (error) {
      console.error('Error completing interview:', error)
      return { success: false, error: 'Failed to complete interview' }
    }
  }

  // Get interview details
  async getInterview(interviewId: string): Promise<any> {
    try {
      const { data, error } = await supabase
        .from('interviews')
        .select('*')
        .eq('id', interviewId)
        .single()

      if (error) {
        console.error('Error getting interview:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('Error getting interview:', error)
      return null
    }
  }

  // Save message
  private async saveMessage(interviewId: string, sessionId: string, role: 'ai' | 'user', content: string): Promise<void> {
    try {
      await supabase
        .from('messages')
        .insert({
          interview_id: interviewId,
          session_id: sessionId,
          role,
          content
        })
    } catch (error) {
      console.error('Error saving message:', error)
    }
  }

  // Increment interviews used
  private async incrementInterviewsUsed(userId: string): Promise<void> {
    try {
      await supabase
        .from('subscriptions')
        .update({
          interviews_used: supabase.sql`interviews_used + 1`
        })
        .eq('user_id', userId)
        .eq('status', 'active')
    } catch (error) {
      console.error('Error incrementing interviews used:', error)
    }
  }

  // Generate session token
  private generateSessionToken(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
  }

  // Detect cheating (placeholder for real implementation)
  async detectCheating(videoFrame: any, audioData: any): Promise<CheatingDetection> {
    // This would integrate with real cheating detection algorithms
    // For now, return mock data
    return {
      gaze_tracking: Math.random() > 0.8,
      head_pose: Math.random() > 0.9,
      lip_sync: Math.random() > 0.85,
      voice_matching: Math.random() > 0.9,
      background_audio: Math.random() > 0.95,
      face_spoofing: Math.random() > 0.95,
      tab_switching: Math.random() > 0.9,
      flags: Math.random() > 0.9 ? ['multiple_faces', 'screen_sharing'] : [],
      confidence: Math.random() * 0.9 + 0.1
    }
  }

  // Detect emotions (placeholder for real implementation)
  async detectEmotions(videoFrame: any): Promise<EmotionData> {
    // This would integrate with real emotion detection
    // For now, return mock data
    const emotions = ['neutral', 'happy', 'sad', 'angry', 'surprised', 'fearful']
    const stressLevels = ['low', 'medium', 'high']
    const engagementLevels = ['low', 'medium', 'high']
    const confidenceLevels = ['low', 'medium', 'high']

    return {
      primary_emotion: emotions[Math.floor(Math.random() * emotions.length)],
      stress_level: stressLevels[Math.floor(Math.random() * stressLevels.length)],
      engagement: engagementLevels[Math.floor(Math.random() * engagementLevels.length)],
      confidence: confidenceLevels[Math.floor(Math.random() * confidenceLevels.length)],
      timestamp: new Date().toISOString()
    }
  }
}

// Export singleton instance
export const interviewService = new InterviewService() 