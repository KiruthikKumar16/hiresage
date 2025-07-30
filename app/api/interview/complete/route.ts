import { NextRequest, NextResponse } from 'next/server'
import { interviewService } from '@/lib/interview-service'

export async function POST(request: NextRequest) {
  try {
    const { interview_id } = await request.json()

    if (!interview_id) {
      return NextResponse.json(
        { error: 'Interview ID is required' },
        { status: 400 }
      )
    }

    const result = await interviewService.completeInterview(interview_id)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      summary: result.summary
    })
  } catch (error) {
    console.error('Complete interview error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 