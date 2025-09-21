import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { cache } from '@/lib/redis-cache'

interface RateLimitData {
  count: number
  resetTime: Date
}

// In-memory store for rate limiting (fallback)
const memoryStore = new Map<string, RateLimitData>()

// Clean up expired entries periodically
setInterval(() => {
  const now = new Date()
  for (const [key, data] of memoryStore.entries()) {
    if (data.resetTime < now) {
      memoryStore.delete(key)
    }
  }
}, 60000) // Clean up every minute

export class RateLimiter {
  private maxRequests: number
  private windowMs: number
  private keyGenerator: (req: NextRequest) => string
  private useRedis: boolean = true

  constructor(options: {
    maxRequests?: number
    windowMs?: number
    keyGenerator?: (req: NextRequest) => string
    useRedis?: boolean
  } = {}) {
    this.maxRequests = options.maxRequests || 5 // Default: 5 requests
    this.windowMs = options.windowMs || 60 * 1000 // Default: 1 minute
    this.keyGenerator = options.keyGenerator || this.defaultKeyGenerator
    this.useRedis = options.useRedis !== false // Default to true
  }

  private defaultKeyGenerator(req: NextRequest): string {
    // Use IP address as the key
    const forwarded = req.headers.get('x-forwarded-for')
    const ip = forwarded ? forwarded.split(',')[0] : req.ip || 'unknown'
    return `rate_limit:${ip}`
  }

  async check(req: NextRequest): Promise<{ allowed: boolean; remaining: number; resetTime: Date }> {
    const key = this.keyGenerator(req)
    const now = new Date()
    const resetTime = new Date(now.getTime() + this.windowMs)

    // Try Redis first if enabled
    if (this.useRedis) {
      try {
        const redisResult = await this.checkRedis(key, this.maxRequests, Math.floor(this.windowMs / 1000))
        if (redisResult) {
          return {
            allowed: redisResult.allowed,
            remaining: redisResult.remaining,
            resetTime: new Date(redisResult.resetTime * 1000)
          }
        }
      } catch (error) {
        console.warn('Redis rate limiting failed, falling back to memory:', error)
      }
    }

    // Fallback to memory store
    return this.checkMemory(key, now, resetTime)
  }

  private async checkRedis(key: string, limit: number, windowSeconds: number): Promise<{
    allowed: boolean
    remaining: number
    resetTime: number
  } | null> {
    try {
      const result = await cache.incrementRateLimit(key, limit, windowSeconds)
      return result
    } catch (error) {
      console.error('Redis rate limiting error:', error)
      return null
    }
  }

  private checkMemory(key: string, now: Date, resetTime: Date): { allowed: boolean; remaining: number; resetTime: Date } {
    const existing = memoryStore.get(key)

    if (existing && existing.resetTime > now) {
      // Update existing record
      if (existing.count >= this.maxRequests) {
        return { allowed: false, remaining: 0, resetTime: existing.resetTime }
      }

      existing.count += 1
      memoryStore.set(key, existing)

      return {
        allowed: true,
        remaining: this.maxRequests - existing.count,
        resetTime: existing.resetTime
      }
    } else {
      // Create or reset record
      const data: RateLimitData = { count: 1, resetTime }
      memoryStore.set(key, data)

      return {
        allowed: true,
        remaining: this.maxRequests - 1,
        resetTime: data.resetTime
      }
    }
  }
}

// Pre-configured rate limiters for different endpoints
export const authRateLimiter = new RateLimiter({
  maxRequests: 5, // 5 attempts per minute
  windowMs: 60 * 1000,
  keyGenerator: (req) => {
    const forwarded = req.headers.get('x-forwarded-for')
    const ip = forwarded ? forwarded.split(',')[0] : req.ip || 'unknown'
    const email = req.headers.get('x-email') || 'unknown'
    return `auth_limit:${ip}:${email}`
  },
  useRedis: true
})

export const apiRateLimiter = new RateLimiter({
  maxRequests: 100, // 100 requests per minute
  windowMs: 60 * 1000,
  useRedis: true
})

// Stricter rate limiter for sensitive operations
export const strictRateLimiter = new RateLimiter({
  maxRequests: 10, // 10 requests per minute
  windowMs: 60 * 1000,
  useRedis: true
})

// Per-user rate limiter
export const userRateLimiter = new RateLimiter({
  maxRequests: 50, // 50 requests per minute per user
  windowMs: 60 * 1000,
  keyGenerator: (req) => {
    const forwarded = req.headers.get('x-forwarded-for')
    const ip = forwarded ? forwarded.split(',')[0] : req.ip || 'unknown'
    const userId = req.headers.get('x-user-id') || 'anonymous'
    return `user_limit:${userId}:${ip}`
  },
  useRedis: true
})

// Distributed rate limiter for high-traffic endpoints
export const distributedRateLimiter = new RateLimiter({
  maxRequests: 1000, // 1000 requests per minute
  windowMs: 60 * 1000,
  useRedis: true
})

// Middleware function for rate limiting
export async function rateLimitMiddleware(
  req: NextRequest,
  limiter: RateLimiter = apiRateLimiter
): Promise<NextResponse | null> {
  const result = await limiter.check(req)

  if (!result.allowed) {
    // Log rate limit exceeded
    console.warn(`Rate limit exceeded for ${req.method} ${req.url}`)
    
    return NextResponse.json(
      { 
        error: 'Too many requests', 
        message: 'Rate limit exceeded. Please try again later.',
        retryAfter: Math.ceil((result.resetTime.getTime() - Date.now()) / 1000)
      },
      { 
        status: 429,
        headers: {
          'X-RateLimit-Limit': limiter['maxRequests'].toString(),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': result.resetTime.toISOString(),
          'Retry-After': Math.ceil((result.resetTime.getTime() - Date.now()) / 1000).toString(),
          'X-RateLimit-Reset-After': Math.ceil((result.resetTime.getTime() - Date.now()) / 1000).toString()
        }
      }
    )
  }

  // Add rate limit headers to successful responses
  const response = NextResponse.next()
  response.headers.set('X-RateLimit-Limit', limiter['maxRequests'].toString())
  response.headers.set('X-RateLimit-Remaining', result.remaining.toString())
  response.headers.set('X-RateLimit-Reset', result.resetTime.toISOString())

  return null
}

// Adaptive rate limiter that adjusts based on system load
export class AdaptiveRateLimiter extends RateLimiter {
  private baseMaxRequests: number
  private loadThresholds: {
    high: number
    critical: number
  }

  constructor(options: {
    baseMaxRequests?: number
    windowMs?: number
    keyGenerator?: (req: NextRequest) => string
    loadThresholds?: {
      high: number
      critical: number
    }
  } = {}) {
    super(options)
    this.baseMaxRequests = options.baseMaxRequests || 100
    this.loadThresholds = options.loadThresholds || {
      high: 0.7, // 70% load
      critical: 0.9 // 90% load
    }
  }

  async check(req: NextRequest): Promise<{ allowed: boolean; remaining: number; resetTime: Date }> {
    // Get current system load
    const systemLoad = await this.getSystemLoad()
    
    // Adjust rate limit based on system load
    let adjustedMaxRequests = this.baseMaxRequests
    
    if (systemLoad >= this.loadThresholds.critical) {
      adjustedMaxRequests = Math.floor(this.baseMaxRequests * 0.3) // 30% of normal
    } else if (systemLoad >= this.loadThresholds.high) {
      adjustedMaxRequests = Math.floor(this.baseMaxRequests * 0.6) // 60% of normal
    }

    // Temporarily override max requests for this check
    const originalMaxRequests = this.maxRequests
    this.maxRequests = adjustedMaxRequests

    try {
      return await super.check(req)
    } finally {
      this.maxRequests = originalMaxRequests
    }
  }

  private async getSystemLoad(): Promise<number> {
    try {
      // Get Redis stats as a proxy for system load
      const stats = await cache.getStats()
      if (stats.connected && stats.keyCount) {
        // Simple heuristic: higher key count = higher load
        // This is a simplified example - in production you'd want more sophisticated metrics
        const load = Math.min(stats.keyCount / 10000, 1) // Normalize to 0-1
        return load
      }
    } catch (error) {
      console.warn('Failed to get system load for adaptive rate limiting:', error)
    }

    return 0 // Default to no load if we can't determine it
  }
}

// Export adaptive rate limiter instance
export const adaptiveApiRateLimiter = new AdaptiveRateLimiter({
  baseMaxRequests: 100,
  windowMs: 60 * 1000,
  useRedis: true
})