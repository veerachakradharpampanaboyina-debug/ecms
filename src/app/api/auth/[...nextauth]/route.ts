import NextAuth from "next-auth"
import { authOptions } from "@/lib/firebase-auth"
import { rateLimitMiddleware, authRateLimiter } from "@/lib/rate-limit"
import { withErrorHandling, ErrorHandler } from "@/lib/error-handler"
import { withLoadBalancing } from "@/lib/load-balancer"

// Enhanced NextAuth handler with error handling and rate limiting
const handler = async (req: Request, res: any) => {
  // Convert NextRequest to our enhanced request format
  const nextReq = req as any
  
  // Apply rate limiting for authentication endpoints
  if (req.method === 'POST') {
    const rateLimitResponse = await rateLimitMiddleware(nextReq, authRateLimiter)
    if (rateLimitResponse) {
      return rateLimitResponse
    }
  }

  try {
    // Apply load balancing
    const result = await withLoadBalancing(nextReq, async (request) => {
      // Call the original NextAuth handler
      return NextAuth(authOptions)(request, res)
    })
    
    return result
  } catch (error) {
    const errorHandler = ErrorHandler.getInstance()
    return errorHandler.handleApiError(error, nextReq, { 
      endpoint: 'auth',
      method: req.method 
    })
  }
}

export { handler as GET, handler as POST }