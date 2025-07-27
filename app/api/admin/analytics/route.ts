import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    // Get analytics data from database
    const analytics = await db.getAnalytics()
    const adminData = await db.getAdminAnalytics()
    
    return NextResponse.json({
      success: true,
      message: 'Analytics data retrieved successfully',
      data: {
        ...analytics,
        ...adminData
      }
    })
    
  } catch (error) {
    console.error('Analytics error:', error)
    return NextResponse.json({
      success: false,
      message: 'Failed to retrieve analytics data'
    }, { status: 500 })
  }
} 