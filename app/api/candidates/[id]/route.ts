import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'

// Candidate update validation schema
const candidateUpdateSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
  email: z.string().email('Please enter a valid email').optional(),
  phone: z.string().min(10, 'Phone number must be at least 10 characters').optional(),
  position: z.string().min(1, 'Position is required').optional(),
  experience: z.string().min(1, 'Experience is required').optional(),
  skills: z.array(z.string()).min(1, 'At least one skill is required').optional(),
  status: z.enum(['new', 'interviewed', 'hired', 'rejected']).optional(),
  resume: z.string().optional(),
  notes: z.string().optional(),
  score: z.number().min(0).max(10).optional(),
  lastInterview: z.string().optional(),
})

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const candidate = await db.getCandidateById(params.id)
    
    if (!candidate) {
      return NextResponse.json({
        success: false,
        message: 'Candidate not found'
      }, { status: 404 })
    }
    
    return NextResponse.json({
      success: true,
      data: candidate
    })
  } catch (error) {
    console.error('Error fetching candidate:', error)
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch candidate'
    }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    
    // Validate the request body
    const validatedData = candidateUpdateSchema.parse(body)
    
    // Update candidate
    const candidate = await db.updateCandidate(params.id, validatedData)
    
    if (!candidate) {
      return NextResponse.json({
        success: false,
        message: 'Candidate not found'
      }, { status: 404 })
    }
    
    console.log('Candidate updated:', candidate.id)
    
    return NextResponse.json({
      success: true,
      message: 'Candidate updated successfully!',
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
    
    console.error('Candidate update error:', error)
    return NextResponse.json({
      success: false,
      message: 'Something went wrong. Please try again.'
    }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const success = await db.deleteCandidate(params.id)
    
    if (!success) {
      return NextResponse.json({
        success: false,
        message: 'Candidate not found'
      }, { status: 404 })
    }
    
    console.log('Candidate deleted:', params.id)
    
    return NextResponse.json({
      success: true,
      message: 'Candidate deleted successfully!'
    })
    
  } catch (error) {
    console.error('Candidate deletion error:', error)
    return NextResponse.json({
      success: false,
      message: 'Something went wrong. Please try again.'
    }, { status: 500 })
  }
} 