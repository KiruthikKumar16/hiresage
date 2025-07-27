import { NextRequest, NextResponse } from 'next/server'
import { aiService, InterviewContext } from '@/lib/ai-service'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, context, response } = body

    if (!action) {
      return NextResponse.json(
        { success: false, error: 'Action is required' },
        { status: 400 }
      )
    }

    switch (action) {
      case 'generate_question':
        if (!context) {
          return NextResponse.json(
            { success: false, error: 'Context is required for question generation' },
            { status: 400 }
          )
        }

        const question = await aiService.generateInterviewQuestion(context as InterviewContext)
        return NextResponse.json({ success: true, data: question })

      case 'analyze_response':
        if (!response || !context) {
          return NextResponse.json(
            { success: false, error: 'Response and context are required for analysis' },
            { status: 400 }
          )
        }

        const analysis = await aiService.analyzeResponse(response, context as InterviewContext)
        return NextResponse.json({ success: true, data: analysis })

      case 'generate_summary':
        if (!context) {
          return NextResponse.json(
            { success: false, error: 'Context is required for summary generation' },
            { status: 400 }
          )
        }

        const summary = await aiService.generateInterviewSummary(context as InterviewContext)
        return NextResponse.json({ success: true, data: { summary } })

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('AI API error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
} 