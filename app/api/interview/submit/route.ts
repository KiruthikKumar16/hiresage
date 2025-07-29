import { NextRequest, NextResponse } from 'next/server'
import { interviewService, sessionService, messageService, reportService, aiAnalysisService } from '@/lib/supabase-db-enhanced'
import { z } from 'zod'

// Input validation schema
const submitInterviewSchema = z.object({
  interviewId: z.string(),
  sessionId: z.string(),
  overallScore: z.number().optional(),
  transcript: z.string().optional(),
  aiFeedback: z.string().optional(),
  videoUrl: z.string().optional(),
  audioUrl: z.string().optional(),
  duration: z.number().optional()
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = submitInterviewSchema.parse(body)

    // Get all messages for the interview
    const messages = await messageService.getInterviewMessages(validatedData.interviewId)
    
    // Analyze all responses for cheating detection
    const cheatingFlags = messages
      .filter(msg => msg.role === 'user')
      .flatMap(msg => msg.cheating_flags)
      .filter(flag => flag.severity === 'high')

    // Calculate overall score if not provided
    let overallScore = validatedData.overallScore
    if (!overallScore) {
      const confidenceScores = messages
        .filter(msg => msg.role === 'user' && msg.confidence_score)
        .map(msg => msg.confidence_score!)
      
      overallScore = confidenceScores.length > 0 
        ? Math.round(confidenceScores.reduce((a, b) => a + b, 0) / confidenceScores.length * 100)
        : 75 // Default score
    }

    // Update interview with final data
    const updatedInterview = await interviewService.updateInterview(validatedData.interviewId, {
      status: 'completed',
      overall_score: overallScore,
      flagged_cheating: cheatingFlags.length > 0,
      cheating_flags: cheatingFlags,
      transcript: validatedData.transcript,
      ai_feedback: validatedData.aiFeedback,
      video_url: validatedData.videoUrl,
      audio_url: validatedData.audioUrl,
      duration: validatedData.duration,
      end_time: new Date().toISOString(),
      result_json: {
        totalQuestions: messages.filter(msg => msg.role === 'assistant').length,
        totalAnswers: messages.filter(msg => msg.role === 'user').length,
        averageConfidence: messages
          .filter(msg => msg.role === 'user' && msg.confidence_score)
          .reduce((sum, msg) => sum + (msg.confidence_score || 0), 0) / 
          Math.max(messages.filter(msg => msg.role === 'user' && msg.confidence_score).length, 1),
        cheatingFlags: cheatingFlags.length,
        duration: validatedData.duration
      }
    })

    // Update session status
    await sessionService.updateSession(validatedData.sessionId, {
      status: 'completed',
      end_time: new Date().toISOString()
    })

    // Create comprehensive report
    const reportData = {
      interview_id: validatedData.interviewId,
      report_type: 'individual' as const,
      report_data: {
        candidateName: updatedInterview.candidate_name,
        position: updatedInterview.position,
        overallScore,
        totalQuestions: messages.filter(msg => msg.role === 'assistant').length,
        totalAnswers: messages.filter(msg => msg.role === 'user').length,
        cheatingFlags: cheatingFlags.length,
        duration: validatedData.duration,
        transcript: validatedData.transcript,
        aiFeedback: validatedData.aiFeedback,
        emotionAnalysis: messages
          .filter(msg => msg.role === 'user')
          .map(msg => ({
            timestamp: msg.timestamp,
            emotionData: msg.emotion_data,
            confidenceScore: msg.confidence_score
          })),
        questions: messages
          .filter(msg => msg.role === 'assistant')
          .map(msg => msg.content),
        answers: messages
          .filter(msg => msg.role === 'user')
          .map(msg => ({
            content: msg.content,
            confidenceScore: msg.confidence_score,
            emotionData: msg.emotion_data,
            cheatingFlags: msg.cheating_flags
          }))
      },
      email_sent: false,
      email_recipients: []
    }

    const report = await reportService.createReport(reportData)

    // Log final analysis
    await aiAnalysisService.createAnalysisLog({
      interview_id: validatedData.interviewId,
      analysis_type: 'content',
      input_data: {
        messages: messages.length,
        overallScore,
        cheatingFlags: cheatingFlags.length,
        duration: validatedData.duration
      },
      output_data: {
        reportId: report.id,
        completed: true,
        timestamp: new Date().toISOString()
      },
      model_used: 'gemini-2.0-flash',
      processing_time_ms: 500
    })

    return NextResponse.json({
      success: true,
      data: {
        interviewId: updatedInterview.id,
        reportId: report.id,
        overallScore,
        cheatingFlags: cheatingFlags.length,
        totalQuestions: messages.filter(msg => msg.role === 'assistant').length
      }
    })

  } catch (error) {
    console.error('Submit interview error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to submit interview' 
      },
      { status: 500 }
    )
  }
}