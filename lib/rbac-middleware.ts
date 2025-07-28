import { NextRequest, NextResponse } from 'next/server'
import { supabase } from './supabase-db'

export interface AuthenticatedUser {
  id: string
  email: string
  name: string
  role: 'system_admin' | 'university_admin' | 'enterprise_admin' | 'candidate'
  organization_id?: string
}

// Extract and validate JWT token from request
async function getAuthenticatedUser(req: NextRequest): Promise<AuthenticatedUser | null> {
  try {
    // Get authorization header
    const authHeader = req.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return null
    }

    const token = authHeader.substring(7)
    
    // Verify JWT with Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token)
    
    if (error || !user) {
      return null
    }

    // Get user details from our users table
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single()

    if (userError || !userData) {
      return null
    }

    // For now, assume all users are candidates unless they have admin role
    // In a real app, you'd have a roles table or role field
    const role = userData.role || 'candidate'

    return {
      id: user.id,
      email: user.email || '',
      name: userData.name,
      role: role as AuthenticatedUser['role'],
      organization_id: userData.organization_id
    }
  } catch (error) {
    console.error('Auth middleware error:', error)
    return null
  }
}

// Require specific role
export async function requireRole(req: NextRequest, requiredRole: AuthenticatedUser['role']): Promise<AuthenticatedUser> {
  const user = await getAuthenticatedUser(req)
  
  if (!user) {
    throw new Error('Unauthorized: No valid session')
  }

  if (user.role !== requiredRole) {
    throw new Error(`Forbidden: Requires ${requiredRole} role`)
  }

  return user
}

// Require any of the specified roles
export async function requireAnyRole(req: NextRequest, roles: AuthenticatedUser['role'][]): Promise<AuthenticatedUser> {
  const user = await getAuthenticatedUser(req)
  
  if (!user) {
    throw new Error('Unauthorized: No valid session')
  }

  if (!roles.includes(user.role)) {
    throw new Error(`Forbidden: Requires one of ${roles.join(', ')} roles`)
  }

  return user
}

// Optional authentication - returns user if authenticated, null otherwise
export async function getOptionalUser(req: NextRequest): Promise<AuthenticatedUser | null> {
  return await getAuthenticatedUser(req)
}

// Error response helper
export function createErrorResponse(message: string, status: number = 401): NextResponse {
  return NextResponse.json({ 
    success: false, 
    error: message 
  }, { status })
} 