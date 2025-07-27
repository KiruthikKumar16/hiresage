import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'

// Candidate validation schema
const candidateSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email'),
  phone: z.string().min(10, 'Phone number must be at least 10 characters'),
  position: z.string().min(1, 'Position is required'),
  experience: z.string().min(1, 'Experience is required'),
  skills: z.array(z.string()).min(1, 'At least one skill is required'),
  status: z.enum(['new', 'interviewed', 'hired', 'rejected']).default('new'),
  resume: z.string().optional(),
  notes: z.string().optional(),
})

export async function GET() {
  try {
    const candidates = await db.getCandidates()
    return NextResponse.json({
      success: true,
      data: candidates
    })
  } catch (error) {
    console.error('Error fetching candidates:', error)
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch candidates'
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate the request body
    const validatedData = candidateSchema.parse(body)
    
    // Save to database
    const candidate = await db.createCandidate(validatedData)
    
    console.log('Candidate created:', candidate.id)
    
    return NextResponse.json({
      success: true,
      message: 'Candidate created successfully!',
      data: candidate
    })
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        message: 'Please check your information and try again',
        errors: error.errors
      }, { status: 400 })
    }
    
    console.error('Candidate creation error:', error)
    return NextResponse.json({
      success: false,
      message: 'Something went wrong. Please try again.'
    }, { status: 500 })
  }
} 