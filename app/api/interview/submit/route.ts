import { NextRequest, NextResponse } from 'next/server'
import { interviewService } from '@/lib/interview-service'

export async function POST(request: NextRequest) {
  try {
    const { interview_id, answer, emotion_data, cheating_data } = await request.json()

    if (!interview_id || !answer) {
      return NextResponse.json(
        { error: 'Interview ID and answer are required' },
        { status: 400 }
      )
    }

    const result = await interviewService.submitAnswer(interview_id, answer, emotion_data, cheating_data)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      analysis: result.analysis,
      nextQuestion: result.nextQuestion
    })
  } catch (error) {
    console.error('Submit answer error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 