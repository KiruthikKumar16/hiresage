import { NextRequest, NextResponse } from 'next/server'
import { interviewService } from '@/lib/interview-service'

export async function POST(request: NextRequest) {
  try {
    const { interview_id, previous_questions } = await request.json()

    if (!interview_id) {
      return NextResponse.json(
        { error: 'Interview ID is required' },
        { status: 400 }
      )
    }

    const result = await interviewService.generateNextQuestion(interview_id, previous_questions || [])

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      question: result.question,
      category: result.category,
      difficulty: result.difficulty,
      timeLimit: result.timeLimit
    })
  } catch (error) {
    console.error('Generate question error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 