import { NextRequest, NextResponse } from 'next/server'

interface CacheEntry<T> {
  data: T
  timestamp: number
  ttl: number
}

interface HealthCheck {
  url: string
  healthy: boolean
  lastCheck: number
  responseTime: number
}

interface ServerInstance {
  id: string
  url: string
  weight: number
  currentConnections: number
  maxConnections: number
  health: HealthCheck
}

export class LoadBalancer {
  private static instance: LoadBalancer
  private cache: Map<string, CacheEntry<any>>
  private servers: ServerInstance[]
  private currentIndex = 0
  private healthCheckInterval: NodeJS.Timeout | null = null

  private constructor() {
    this.cache = new Map()
    this.servers = [
      {
        id: 'server1',
        url: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
        weight: 1,
        currentConnections: 0,
        maxConnections: 1000,
        health: {
          url: '/api/health',
          healthy: true,
          lastCheck: Date.now(),
          responseTime: 0
        }
      }
    ]
    this.startHealthChecks()
  }

  public static getInstance(): LoadBalancer {
    if (!LoadBalancer.instance) {
      LoadBalancer.instance = new LoadBalancer()
    }
    return LoadBalancer.instance
  }

  private startHealthChecks(): void {
    this.healthCheckInterval = setInterval(async () => {
      await this.performHealthChecks()
    }, 30000) // Check every 30 seconds
  }

  private async performHealthChecks(): Promise<void> {
    for (const server of this.servers) {
      try {
        const startTime = Date.now()
        const response = await fetch(`${server.url}${server.health.url}`, {
          method: 'GET',
          signal: AbortSignal.timeout(5000) // 5 second timeout
        })
        const responseTime = Date.now() - startTime
        
        server.health.healthy = response.ok
        server.health.lastCheck = Date.now()
        server.health.responseTime = responseTime
        
        if (!response.ok) {
          console.warn(`Server ${server.id} health check failed: ${response.status}`)
        }
      } catch (error) {
        server.health.healthy = false
        server.health.lastCheck = Date.now()
        console.warn(`Server ${server.id} health check error:`, error)
      }
    }
  }

  public selectServer(): ServerInstance | null {
    const healthyServers = this.servers.filter(s => s.health.healthy)
    
    if (healthyServers.length === 0) {
      console.error('No healthy servers available')
      return null
    }

    // Round-robin with least connections
    const server = healthyServers[this.currentIndex % healthyServers.length]
    this.currentIndex = (this.currentIndex + 1) % healthyServers.length
    
    if (server.currentConnections >= server.maxConnections) {
      // Try next server if current is at capacity
      const nextIndex = (this.currentIndex + 1) % healthyServers.length
      const nextServer = healthyServers[nextIndex]
      if (nextServer.currentConnections < nextServer.maxConnections) {
        this.currentIndex = nextIndex
        return nextServer
      }
    }

    return server
  }

  // Cache management
  public setCache<T>(key: string, data: T, ttl: number = 300000): void { // Default 5 minutes
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    })
  }

  public getCache<T>(key: string): T | null {
    const entry = this.cache.get(key)
    if (!entry) return null

    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key)
      return null
    }

    return entry.data as T
  }

  public clearCache(pattern?: string): void {
    if (!pattern) {
      this.cache.clear()
      return
    }

    const regex = new RegExp(pattern)
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key)
      }
    }
  }

  // Request throttling
  public async throttleRequest<T>(
    key: string,
    requestFn: () => Promise<T>,
    options: {
      ttl?: number
      throttleMs?: number
    } = {}
  ): Promise<T> {
    const { ttl = 300000, throttleMs = 1000 } = options

    // Check cache first
    const cached = this.getCache<T>(key)
    if (cached) {
      return cached
    }

    // Check if request was made recently (throttling)
    const throttleKey = `${key}_throttle`
    const lastRequest = this.getCache<number>(throttleKey)
    if (lastRequest && Date.now() - lastRequest < throttleMs) {
      throw new Error('Request throttled')
    }

    // Make the request
    this.setCache(throttleKey, Date.now(), throttleMs)
    const result = await requestFn()
    
    // Cache the result
    this.setCache(key, result, ttl)
    
    return result
  }

  // Circuit breaker pattern
  private circuitBreakers: Map<string, {
    state: 'CLOSED' | 'OPEN' | 'HALF_OPEN'
    failures: number
    lastFailure: number
    cooldown: number
  }> = new Map()

  public async withCircuitBreaker<T>(
    key: string,
    requestFn: () => Promise<T>,
    options: {
      maxFailures?: number
      cooldownMs?: number
    } = {}
  ): Promise<T> {
    const { maxFailures = 5, cooldownMs = 60000 } = options
    const breaker = this.circuitBreakers.get(key) || {
      state: 'CLOSED',
      failures: 0,
      lastFailure: 0,
      cooldown: cooldownMs
    }

    if (breaker.state === 'OPEN') {
      if (Date.now() - breaker.lastFailure > breaker.cooldown) {
        breaker.state = 'HALF_OPEN'
      } else {
        throw new Error('Circuit breaker is open')
      }
    }

    try {
      const result = await requestFn()
      
      // Reset on success
      if (breaker.state === 'HALF_OPEN') {
        breaker.state = 'CLOSED'
        breaker.failures = 0
      }
      
      this.circuitBreakers.set(key, breaker)
      return result
    } catch (error) {
      breaker.failures++
      breaker.lastFailure = Date.now()
      
      if (breaker.failures >= maxFailures) {
        breaker.state = 'OPEN'
        console.warn(`Circuit breaker opened for key: ${key}`)
      }
      
      this.circuitBreakers.set(key, breaker)
      throw error
    }
  }

  // Cleanup
  public destroy(): void {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval)
    }
    this.cache.clear()
    this.circuitBreakers.clear()
  }
}

// Middleware for load balancing
export async function withLoadBalancing(
  req: NextRequest,
  handler: (req: NextRequest) => Promise<NextResponse>
): Promise<NextResponse> {
  const loadBalancer = LoadBalancer.getInstance()
  
  try {
    // Check server health and select appropriate server
    const server = loadBalancer.selectServer()
    if (!server) {
      throw new Error('No healthy servers available')
    }

    // Add server information to request headers
    const response = await handler(req)
    response.headers.set('X-Server-Id', server.id)
    response.headers.set('X-Server-Load', `${server.currentConnections}/${server.maxConnections}`)
    
    return response
  } catch (error) {
    console.error('Load balancing error:', error)
    return NextResponse.json(
      { error: 'Service temporarily unavailable' },
      { status: 503 }
    )
  }
}

// Cache middleware
export function withCache(
  keyGenerator: (req: NextRequest) => string,
  ttl: number = 300000
) {
  return async (req: NextRequest, handler: (req: NextRequest) => Promise<NextResponse>): Promise<NextResponse> => {
    const loadBalancer = LoadBalancer.getInstance()
    const cacheKey = keyGenerator(req)
    
    // Try to get cached response
    const cached = loadBalancer.getCache(cacheKey)
    if (cached) {
      const response = NextResponse.json(cached)
      response.headers.set('X-Cache', 'HIT')
      return response
    }

    // Make the request
    const response = await handler(req)
    
    // Cache successful GET requests
    if (req.method === 'GET' && response.status === 200) {
      const data = await response.clone().json()
      loadBalancer.setCache(cacheKey, data, ttl)
      response.headers.set('X-Cache', 'MISS')
    }
    
    return response
  }
}