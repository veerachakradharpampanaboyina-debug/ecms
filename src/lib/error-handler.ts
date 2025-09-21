import { NextRequest, NextResponse } from 'next/server'

// Try to import ZAI dynamically, but handle gracefully if it fails
let ZAI: any = null
try {
  // Dynamic import to avoid require() style import
  import('z-ai-web-dev-sdk').then((module) => {
    ZAI = module.default || module
  }).catch(() => {
    console.warn('ZAI SDK not available, using fallback error logging')
  })
} catch (error) {
  console.warn('ZAI SDK not available, using fallback error logging')
}

export interface ApiError {
  code: string
  message: string
  details?: any
  timestamp: string
  requestId: string
}

export class ErrorHandler {
  private static instance: ErrorHandler
  private zai: ZAI | null = null

  private constructor() {}

  public static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler()
    }
    return ErrorHandler.instance
  }

  private async getZAI(): Promise<any> {
    if (!this.zai && ZAI) {
      try {
        this.zai = await ZAI.create()
      } catch (error) {
        console.warn('Failed to initialize ZAI for error logging:', error)
        return null
      }
    }
    return this.zai
  }

  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private async logError(error: Error, context: any, requestId: string): Promise<void> {
    const errorData = {
      timestamp: new Date().toISOString(),
      requestId,
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack,
      },
      context,
      environment: process.env.NODE_ENV,
    }

    // Log to console
    console.error('API Error:', JSON.stringify(errorData, null, 2))

    // Try to log using ZAI if available
    try {
      const zai = await this.getZAI()
      if (zai) {
        await zai.functions.invoke('log_error', {
          error_data: errorData,
          source: 'ecms-api'
        })
      }
    } catch (logError) {
      console.warn('Failed to log error to ZAI:', logError)
    }
  }

  public async handleApiError(
    error: unknown,
    req: NextRequest,
    context: any = {}
  ): Promise<NextResponse> {
    const requestId = this.generateRequestId()
    
    // Convert error to Error instance if it's not
    const apiError = error instanceof Error ? error : new Error(String(error))
    
    // Log the error
    await this.logError(apiError, { ...context, url: req.url, method: req.method }, requestId)

    // Determine error type and response
    let statusCode = 500
    let errorCode = 'INTERNAL_SERVER_ERROR'
    let message = 'An unexpected error occurred'
    let details: any = undefined

    if (apiError.name === 'ValidationError') {
      statusCode = 400
      errorCode = 'VALIDATION_ERROR'
      message = 'Invalid request data'
    } else if (apiError.name === 'UnauthorizedError') {
      statusCode = 401
      errorCode = 'UNAUTHORIZED'
      message = 'Authentication required'
    } else if (apiError.name === 'ForbiddenError') {
      statusCode = 403
      errorCode = 'FORBIDDEN'
      message = 'Access denied'
    } else if (apiError.name === 'NotFoundError') {
      statusCode = 404
      errorCode = 'NOT_FOUND'
      message = 'Resource not found'
    } else if (apiError.name === 'PrismaClientKnownRequestError') {
      statusCode = 400
      errorCode = 'DATABASE_ERROR'
      message = 'Database operation failed'
      details = {
        code: (apiError as any).code,
        meta: (apiError as any).meta,
      }
    } else if (apiError.name === 'PrismaClientValidationError') {
      statusCode = 400
      errorCode = 'DATABASE_VALIDATION_ERROR'
      message = 'Database validation failed'
    }

    // In development, include more details
    if (process.env.NODE_ENV === 'development') {
      details = {
        ...details,
        stack: apiError.stack,
        originalError: apiError.message,
      }
    }

    const errorResponse: ApiError = {
      code: errorCode,
      message,
      details,
      timestamp: new Date().toISOString(),
      requestId,
    }

    return NextResponse.json(errorResponse, { status: statusCode })
  }

  public createError(code: string, message: string, details?: any): Error {
    const error = new Error(message)
    error.name = code
    if (details) {
      (error as any).details = details
    }
    return error
  }

  // Specific error creators
  public static ValidationError(message: string, details?: any): Error {
    return ErrorHandler.getInstance().createError('ValidationError', message, details)
  }

  public static UnauthorizedError(message: string = 'Unauthorized', details?: any): Error {
    return ErrorHandler.getInstance().createError('UnauthorizedError', message, details)
  }

  public static ForbiddenError(message: string = 'Forbidden', details?: any): Error {
    return ErrorHandler.getInstance().createError('ForbiddenError', message, details)
  }

  public static NotFoundError(message: string = 'Not found', details?: any): Error {
    return ErrorHandler.getInstance().createError('NotFoundError', message, details)
  }

  public static DatabaseError(message: string, details?: any): Error {
    return ErrorHandler.getInstance().createError('DatabaseError', message, details)
  }
}

// Middleware for error handling
export async function withErrorHandling(
  req: NextRequest,
  handler: (req: NextRequest) => Promise<NextResponse>,
  context: any = {}
): Promise<NextResponse> {
  try {
    return await handler(req)
  } catch (error) {
    const errorHandler = ErrorHandler.getInstance()
    return errorHandler.handleApiError(error, req, context)
  }
}

// Wrapper for API routes
export function createApiHandler(
  handler: (req: NextRequest, context?: any) => Promise<NextResponse>,
  context: any = {}
) {
  return async (req: NextRequest, { params }: { params?: any }) => {
    return withErrorHandling(req, (request) => handler(request, { ...context, params }), context)
  }
}