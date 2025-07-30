import { NextRequest, NextResponse } from 'next/server'
import { interviewService } from '@/lib/interview-service'

export async function POST(request: NextRequest) {
  try {
    const settings = await request.json()

    if (!settings.position || !settings.candidate_name) {
      return NextResponse.json(
        { error: 'Position and candidate name are required' },
        { status: 400 }
      )
    }

    const result = await interviewService.startInterview(settings)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      interview_id: result.interview_id
    })
  } catch (error) {
    console.error('Start interview error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 