import { NextRequest, NextResponse } from 'next/server'
import { userService } from '@/lib/supabase-db-enhanced'
import { sessionStore } from '@/lib/session-store'

export interface UserRole {
  id: string
  role: 'system_admin' | 'university_admin' | 'enterprise_admin' | 'candidate'
  organization_id?: string
}

export interface RBACConfig {
  allowedRoles: string[]
  requireOrganization?: boolean
  organizationField?: string
}

// RBAC Middleware function
export async function rbacMiddleware(
  request: NextRequest,
  config: RBACConfig
): Promise<{ user: UserRole | null; error: string | null }> {
  try {
    // Get session from cookies
    const sessionId = request.cookies.get('session-id')?.value
    const sessionToken = request.cookies.get('session-token')?.value
    
    if (!sessionId && !sessionToken) {
      return { user: null, error: 'No session found' }
    }

    // Get session data using new session management
    const session = sessionStore.getSession(sessionId || '', sessionToken)
    
    if (!session) {
      return { user: null, error: 'Invalid session' }
    }

    if (!session.user) {
      return { user: null, error: 'No user in session' }
    }

    const user: UserRole = {
      id: session.user.id,
      role: session.user.role || 'candidate', // Default to candidate role
      organization_id: session.user.organization_id
    }

    // Check if user has required role
    if (!config.allowedRoles.includes(user.role)) {
      return { user: null, error: 'Insufficient permissions' }
    }

    // Check organization requirement if specified
    if (config.requireOrganization && !user.organization_id) {
      return { user: null, error: 'Organization access required' }
    }

    return { user, error: null }

  } catch (error) {
    console.error('RBAC middleware error:', error)
    return { user: null, error: 'Authentication failed' }
  }
}

// Helper function to create RBAC wrapper
export function withRBAC(config: RBACConfig) {
  return function(handler: (request: NextRequest, user: UserRole) => Promise<NextResponse>) {
    return async function(request: NextRequest): Promise<NextResponse> {
      const { user, error } = await rbacMiddleware(request, config)
      
      if (error) {
        return NextResponse.json(
          { success: false, error },
          { status: 401 }
        )
      }

      if (!user) {
        return NextResponse.json(
          { success: false, error: 'User not found' },
          { status: 401 }
        )
      }

      return handler(request, user)
    }
  }
}

// Predefined RBAC configurations
export const RBAC_CONFIGS = {
  SYSTEM_ADMIN: {
    allowedRoles: ['system_admin'],
    requireOrganization: false
  },
  UNIVERSITY_ADMIN: {
    allowedRoles: ['university_admin', 'system_admin'],
    requireOrganization: true
  },
  ENTERPRISE_ADMIN: {
    allowedRoles: ['enterprise_admin', 'system_admin'],
    requireOrganization: true
  },
  CANDIDATE: {
    allowedRoles: ['candidate', 'university_admin', 'enterprise_admin', 'system_admin'],
    requireOrganization: false
  },
  ANY_AUTHENTICATED: {
    allowedRoles: ['candidate', 'university_admin', 'enterprise_admin', 'system_admin'],
    requireOrganization: false
  }
}

// Example usage in API routes:
/*
export const GET = withRBAC(RBAC_CONFIGS.SYSTEM_ADMIN)(
  async (request: NextRequest, user: UserRole) => {
    // Your API logic here
    return NextResponse.json({ success: true, data: {} })
  }
)
*/ 