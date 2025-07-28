import { NextRequest, NextResponse } from 'next/server'
import { requireRole, createErrorResponse } from '@/lib/rbac-middleware'
import { supabase } from '@/lib/supabase-db'
import { z } from 'zod'

// Validation schema for creating questions
const createQuestionSchema = z.object({
  question: z.string().min(10, 'Question must be at least 10 characters'),
  category: z.enum(['technical', 'behavioral', 'situational', 'problem_solving', 'leadership']),
  difficulty: z.enum(['easy', 'medium', 'hard', 'expert']),
  tags: z.array(z.string()).optional().default([]),
  weight: z.number().min(1).max(10).default(5),
  expected_answer: z.string().optional(),
  is_active: z.boolean().default(true)
})

// Validation schema for updating questions
const updateQuestionSchema = createQuestionSchema.partial()

// POST /api/system/questions - Create new interview question
export async function POST(req: NextRequest) {
  try {
    // Verify system admin role
    const admin = await requireRole(req, 'system_admin')
    
    const body = await req.json()
    
    // Validate request body
    const validatedData = createQuestionSchema.parse(body)
    
    // Create question
    const { data: question, error } = await supabase
      .from('questions')
      .insert([{
        question: validatedData.question,
        category: validatedData.category,
        difficulty: validatedData.difficulty,
        tags: validatedData.tags,
        weight: validatedData.weight,
        expected_answer: validatedData.expected_answer,
        is_active: validatedData.is_active,
        created_by: admin.id
      }])
      .select()
      .single()

    if (error) {
      console.error('Error creating question:', error)
      return NextResponse.json({
        success: false,
        error: 'Failed to create question'
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Question created successfully',
      data: question
    })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        error: 'Validation failed',
        details: error.errors
      }, { status: 400 })
    }

    if (error instanceof Error) {
      if (error.message.includes('Unauthorized') || error.message.includes('Forbidden')) {
        return createErrorResponse(error.message, 403)
      }
    }

    console.error('System questions POST error:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 })
  }
}

// GET /api/system/questions - Get all interview questions
export async function GET(req: NextRequest) {
  try {
    // Verify system admin role
    const admin = await requireRole(req, 'system_admin')
    
    const { searchParams } = new URL(req.url)
    const category = searchParams.get('category')
    const difficulty = searchParams.get('difficulty')
    const isActive = searchParams.get('is_active')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = (page - 1) * limit

    // Build query
    let query = supabase
      .from('questions')
      .select('*', { count: 'exact' })

    // Apply filters
    if (category) {
      query = query.eq('category', category)
    }
    if (difficulty) {
      query = query.eq('difficulty', difficulty)
    }
    if (isActive !== null) {
      query = query.eq('is_active', isActive === 'true')
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1)
    query = query.order('created_at', { ascending: false })

    const { data: questions, error, count } = await query

    if (error) {
      console.error('Error fetching questions:', error)
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch questions'
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data: questions,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    })

  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes('Unauthorized') || error.message.includes('Forbidden')) {
        return createErrorResponse(error.message, 403)
      }
    }

    console.error('System questions GET error:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 })
  }
}

// PUT /api/system/questions - Update question
export async function PUT(req: NextRequest) {
  try {
    // Verify system admin role
    const admin = await requireRole(req, 'system_admin')
    
    const body = await req.json()
    const { id, ...updates } = body

    if (!id) {
      return NextResponse.json({
        success: false,
        error: 'Question ID is required'
      }, { status: 400 })
    }

    // Validate updates
    const validatedUpdates = updateQuestionSchema.parse(updates)
    
    // Update question
    const { data: question, error } = await supabase
      .from('questions')
      .update({
        ...validatedUpdates,
        updated_by: admin.id,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({
          success: false,
          error: 'Question not found'
        }, { status: 404 })
      }
      
      console.error('Error updating question:', error)
      return NextResponse.json({
        success: false,
        error: 'Failed to update question'
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Question updated successfully',
      data: question
    })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        error: 'Validation failed',
        details: error.errors
      }, { status: 400 })
    }

    if (error instanceof Error) {
      if (error.message.includes('Unauthorized') || error.message.includes('Forbidden')) {
        return createErrorResponse(error.message, 403)
      }
    }

    console.error('System questions PUT error:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 })
  }
}

// DELETE /api/system/questions - Delete question
export async function DELETE(req: NextRequest) {
  try {
    // Verify system admin role
    const admin = await requireRole(req, 'system_admin')
    
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({
        success: false,
        error: 'Question ID is required'
      }, { status: 400 })
    }

    // Soft delete by setting is_active to false
    const { error } = await supabase
      .from('questions')
      .update({
        is_active: false,
        updated_by: admin.id,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)

    if (error) {
      console.error('Error deleting question:', error)
      return NextResponse.json({
        success: false,
        error: 'Failed to delete question'
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Question deleted successfully'
    })

  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes('Unauthorized') || error.message.includes('Forbidden')) {
        return createErrorResponse(error.message, 403)
      }
    }

    console.error('System questions DELETE error:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 })
  }
} 