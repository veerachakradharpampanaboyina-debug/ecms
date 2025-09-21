import { NextRequest, NextResponse } from 'next/server'
import { rateLimitMiddleware, apiRateLimiter } from './rate-limit'
import { ErrorHandler } from './error-handler'
import { LoadBalancer } from './load-balancer'
import { RBACService } from './rbac'
import { getServerSession } from 'next-auth'
import { authOptions } from './firebase-auth'

export async function apiMiddleware(req: NextRequest): Promise<NextResponse | null> {
  const url = new URL(req.url)
  const pathname = url.pathname

  // Skip middleware for static files and non-API routes
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/static') ||
    pathname.startsWith('/images') ||
    pathname.startsWith('/favicon') ||
    pathname.endsWith('.ico') ||
    pathname.endsWith('.png') ||
    pathname.endsWith('.jpg') ||
    pathname.endsWith('.jpeg') ||
    pathname.endsWith('.svg') ||
    pathname.endsWith('.css') ||
    pathname.endsWith('.js')
  ) {
    return null
  }

  try {
    // Apply rate limiting to API routes
    if (pathname.startsWith('/api/')) {
      // Skip rate limiting for health check
      if (pathname !== '/api/health') {
        const rateLimitResponse = await rateLimitMiddleware(req, apiRateLimiter)
        if (rateLimitResponse) {
          return rateLimitResponse
        }
      }

      // Add security headers
      const response = NextResponse.next()
      response.headers.set('X-Content-Type-Options', 'nosniff')
      response.headers.set('X-Frame-Options', 'DENY')
      response.headers.set('X-XSS-Protection', '1; mode=block')
      response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
      response.headers.set('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline';")
      
      return response
    }

    // Apply role-based access control for protected routes
    if (pathname.startsWith('/admin')) {
      return await checkRoleAccess(req, 'canManageSystem')
    }

    if (pathname.startsWith('/hod')) {
      return await checkRoleAccess(req, 'canManageFaculty')
    }

    if (pathname.startsWith('/faculty')) {
      return await checkRoleAccess(req, 'canManageAttendance')
    }

    if (pathname.startsWith('/student')) {
      return await checkRoleAccess(req, 'canManageFiles')
    }

    if (pathname.startsWith('/parent')) {
      return await checkRoleAccess(req, 'canManageEmails')
    }

    // Apply load balancing for authenticated routes
    if (pathname.startsWith('/admin') || pathname.startsWith('/hod') || pathname.startsWith('/faculty') || pathname.startsWith('/student') || pathname.startsWith('/parent')) {
      const loadBalancer = LoadBalancer.getInstance()
      const server = loadBalancer.selectServer()
      
      if (!server) {
        return NextResponse.json(
          { error: 'Service temporarily unavailable' },
          { status: 503 }
        )
      }

      // Add server information to headers
      const response = NextResponse.next()
      response.headers.set('X-Server-Id', server.id)
      response.headers.set('X-Server-Load', `${server.currentConnections}/${server.maxConnections}`)
      
      return response
    }

    return null
  } catch (error) {
    console.error('Middleware error:', error)
    const errorHandler = ErrorHandler.getInstance()
    return errorHandler.handleApiError(error, req, { 
      middleware: true,
      pathname 
    })
  }
}

// Helper function to check role-based access
async function checkRoleAccess(req: NextRequest, permission: string): Promise<NextResponse | null> {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user?.id) {
      return NextResponse.redirect(new URL('/auth/signin', req.url))
    }

    const hasAccess = await RBACService.hasPermission(session.user.id, permission as any)
    
    if (!hasAccess) {
      return NextResponse.json(
        { error: 'Access denied. Insufficient permissions.' },
        { status: 403 }
      )
    }

    return null
  } catch (error) {
    console.error('Role access check error:', error)
    return NextResponse.json(
      { error: 'Authentication error' },
      { status: 401 }
    )
  }
}

// Helper function to create middleware chain
export function createMiddlewareChain(...middlewares: ((req: NextRequest) => Promise<NextResponse | null>)[]) {
  return async (req: NextRequest): Promise<NextResponse> => {
    for (const middleware of middlewares) {
      const result = await middleware(req)
      if (result) {
        return result
      }
    }
    return NextResponse.next()
  }
}

// Export the main middleware function
export const mainMiddleware = createMiddlewareChain(apiMiddleware)