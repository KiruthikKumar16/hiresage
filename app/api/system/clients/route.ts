import { NextRequest, NextResponse } from 'next/server'
import { requireRole, createErrorResponse } from '@/lib/rbac-middleware'
import { supabase } from '@/lib/supabase-db'
import { z } from 'zod'

// Validation schema for creating organizations
const createOrganizationSchema = z.object({
  name: z.string().min(2, 'Organization name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email'),
  plan: z.enum(['starter', 'growth', 'pro', 'enterprise']),
  maxUsers: z.number().min(1, 'Max users must be at least 1').optional().default(10),
  adminName: z.string().min(2, 'Admin name must be at least 2 characters'),
  adminEmail: z.string().email('Please enter a valid admin email'),
  phone: z.string().optional(),
  website: z.string().url().optional().or(z.literal('')),
})

// POST /api/system/clients - Create new University/Enterprise client
export async function POST(req: NextRequest) {
  try {
    // Verify system admin role
    const admin = await requireRole(req, 'system_admin')
    
    const body = await req.json()
    
    // Validate request body
    const validatedData = createOrganizationSchema.parse(body)
    
    // Check if organization already exists
    const { data: existingOrg, error: checkError } = await supabase
      .from('users')
      .select('id')
      .eq('email', validatedData.email)
      .single()

    if (checkError && checkError.code !== 'PGRST116') {
      throw checkError
    }

    if (existingOrg) {
      return NextResponse.json({
        success: false,
        error: 'Organization with this email already exists'
      }, { status: 409 })
    }

    // Create organization admin user
    const { data: adminUser, error: adminError } = await supabase
      .from('users')
      .insert([{
        name: validatedData.adminName,
        email: validatedData.adminEmail,
        company: validatedData.name,
        phone: validatedData.phone,
        website: validatedData.website,
        role: 'university_admin', // or 'enterprise_admin' based on plan
        max_users: validatedData.maxUsers,
        plan: validatedData.plan,
        status: 'active'
      }])
      .select()
      .single()

    if (adminError) {
      console.error('Error creating admin user:', adminError)
      return NextResponse.json({
        success: false,
        error: 'Failed to create organization admin'
      }, { status: 500 })
    }

    // Create subscription for the organization
    const planDetails = {
      starter: { name: 'Starter', interviews: 50, price: 1.80 },
      growth: { name: 'Growth', interviews: 200, price: 1.50 },
      pro: { name: 'Pro', interviews: 1000, price: 1.20 },
      enterprise: { name: 'Enterprise', interviews: 5000, price: 1.00 }
    }

    const plan = planDetails[validatedData.plan]
    
    const { data: subscription, error: subError } = await supabase
      .from('subscriptions')
      .insert([{
        user_id: adminUser.id,
        plan_id: validatedData.plan,
        plan_name: plan.name,
        interviews_remaining: plan.interviews,
        total_interviews: plan.interviews,
        price_per_interview: plan.price,
        status: 'active',
        payment_status: 'completed',
        expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString() // 1 year
      }])
      .select()
      .single()

    if (subError) {
      console.error('Error creating subscription:', subError)
      // Clean up admin user if subscription creation fails
      await supabase.from('users').delete().eq('id', adminUser.id)
      return NextResponse.json({
        success: false,
        error: 'Failed to create organization subscription'
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Organization created successfully',
      data: {
        organization: adminUser,
        subscription
      }
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

    console.error('System clients POST error:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 })
  }
}

// GET /api/system/clients - Get all University/Enterprise clients
export async function GET(req: NextRequest) {
  try {
    // Verify system admin role
    const admin = await requireRole(req, 'system_admin')
    
    // Get all admin users (university/enterprise admins)
    const { data: organizations, error } = await supabase
      .from('users')
      .select(`
        id,
        name,
        email,
        company,
        phone,
        website,
        role,
        max_users,
        plan,
        status,
        created_at,
        subscriptions (
          id,
          plan_name,
          interviews_remaining,
          total_interviews,
          status,
          expires_at
        )
      `)
      .in('role', ['university_admin', 'enterprise_admin'])
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching organizations:', error)
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch organizations'
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data: organizations
    })

  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes('Unauthorized') || error.message.includes('Forbidden')) {
        return createErrorResponse(error.message, 403)
      }
    }

    console.error('System clients GET error:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 })
  }
} 