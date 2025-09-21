import { createClient } from 'redis'

// Redis configuration for high concurrency (10k users)
const redisConfig = {
  url: process.env.REDIS_URL || 'redis://localhost:6379',
  password: process.env.REDIS_PASSWORD || '',
  socket: {
    reconnectStrategy: (retries: number) => {
      // Exponential backoff with max 30 seconds
      const delay = Math.min(retries * 100, 30000)
      console.log(`Redis reconnect attempt ${retries}, delaying ${delay}ms`)
      return delay
    },
    connectTimeout: 10000, // 10 seconds
    commandTimeout: 5000, // 5 seconds
  },
  // Connection pool settings
  connectionPool: {
    minConnections: 5,
    maxConnections: 50,
    queueTimeout: 30000, // 30 seconds
  }
}

// Cache configuration
const cacheConfig = {
  defaultTTL: 300, // 5 minutes default TTL
  sessionTTL: 3600, // 1 hour for sessions
  userTTL: 1800, // 30 minutes for user data
  rateLimitTTL: 60, // 1 minute for rate limiting
  healthTTL: 30, // 30 seconds for health data
  
  // Cache key prefixes
  prefixes: {
    session: 'session:',
    user: 'user:',
    rateLimit: 'rate_limit:',
    health: 'health:',
    api: 'api:',
    db: 'db:',
    analytics: 'analytics:'
  }
}

interface CacheOptions {
  ttl?: number
  prefix?: string
  compress?: boolean
}

class RedisCache {
  private static instance: RedisCache
  private client: any
  private isConnected: boolean = false
  private connectionRetries: number = 0
  private maxRetries: number = 5

  private constructor() {
    this.initializeRedis()
  }

  public static getInstance(): RedisCache {
    if (!RedisCache.instance) {
      RedisCache.instance = new RedisCache()
    }
    return RedisCache.instance
  }

  private async initializeRedis(): Promise<void> {
    try {
      this.client = createClient(redisConfig)
      
      // Set up event handlers
      this.client.on('connect', () => {
        console.log('✅ Redis connected successfully')
        this.isConnected = true
        this.connectionRetries = 0
      })

      this.client.on('error', (error: Error) => {
        console.error('❌ Redis error:', error)
        this.isConnected = false
      })

      this.client.on('reconnecting', () => {
        console.log('🔄 Redis reconnecting...')
      })

      this.client.on('ready', () => {
        console.log('✅ Redis ready for commands')
        this.isConnected = true
      })

      // Connect to Redis
      await this.client.connect()
      
      // Test connection
      await this.client.ping()
      
      console.log('✅ Redis cache initialized successfully')
    } catch (error) {
      console.error('❌ Failed to initialize Redis:', error)
      this.isConnected = false
      
      // Retry connection
      if (this.connectionRetries < this.maxRetries) {
        this.connectionRetries++
        const delay = Math.pow(2, this.connectionRetries) * 1000
        console.log(`Retrying Redis connection in ${delay}ms (attempt ${this.connectionRetries}/${this.maxRetries})`)
        
        setTimeout(() => this.initializeRedis(), delay)
      }
    }
  }

  private generateKey(prefix: string, key: string): string {
    return `${cacheConfig.prefixes[prefix as keyof typeof cacheConfig.prefixes] || ''}${key}`
  }

  private async ensureConnection(): Promise<boolean> {
    if (!this.isConnected || !this.client) {
      console.warn('Redis not connected, attempting to reconnect...')
      await this.initializeRedis()
    }
    return this.isConnected
  }

  // Basic cache operations
  public async set(key: string, value: any, options: CacheOptions = {}): Promise<boolean> {
    try {
      if (!(await this.ensureConnection())) {
        return false
      }

      const { ttl = cacheConfig.defaultTTL, prefix = 'api' } = options
      const cacheKey = this.generateKey(prefix, key)
      
      // Serialize value
      const serializedValue = JSON.stringify(value)
      
      // Set with TTL
      await this.client.setEx(cacheKey, ttl, serializedValue)
      
      return true
    } catch (error) {
      console.error('Redis set error:', error)
      return false
    }
  }

  public async get<T>(key: string, options: CacheOptions = {}): Promise<T | null> {
    try {
      if (!(await this.ensureConnection())) {
        return null
      }

      const { prefix = 'api' } = options
      const cacheKey = this.generateKey(prefix, key)
      
      const value = await this.client.get(cacheKey)
      
      if (!value) {
        return null
      }
      
      // Deserialize value
      return JSON.parse(value) as T
    } catch (error) {
      console.error('Redis get error:', error)
      return null
    }
  }

  public async del(key: string, options: CacheOptions = {}): Promise<boolean> {
    try {
      if (!(await this.ensureConnection())) {
        return false
      }

      const { prefix = 'api' } = options
      const cacheKey = this.generateKey(prefix, key)
      
      await this.client.del(cacheKey)
      
      return true
    } catch (error) {
      console.error('Redis delete error:', error)
      return false
    }
  }

  public async exists(key: string, options: CacheOptions = {}): Promise<boolean> {
    try {
      if (!(await this.ensureConnection())) {
        return false
      }

      const { prefix = 'api' } = options
      const cacheKey = this.generateKey(prefix, key)
      
      const result = await this.client.exists(cacheKey)
      
      return result === 1
    } catch (error) {
      console.error('Redis exists error:', error)
      return false
    }
  }

  // Rate limiting operations
  public async incrementRateLimit(key: string, limit: number, window: number): Promise<{
    allowed: boolean
    remaining: number
    resetTime: number
  }> {
    try {
      if (!(await this.ensureConnection())) {
        // Fallback to memory-based rate limiting
        return this.memoryRateLimit(key, limit, window)
      }

      const cacheKey = this.generateKey('rateLimit', key)
      const now = Math.floor(Date.now() / 1000)
      const windowEnd = now + window
      
      // Use Redis INCR with expiration
      const pipeline = this.client.multi()
      pipeline.incr(cacheKey)
      pipeline.expire(cacheKey, window)
      
      const results = await pipeline.exec()
      const current = results[0][1]
      
      return {
        allowed: current <= limit,
        remaining: Math.max(0, limit - current),
        resetTime: windowEnd
      }
    } catch (error) {
      console.error('Redis rate limit error:', error)
      return this.memoryRateLimit(key, limit, window)
    }
  }

  // Memory-based fallback for rate limiting
  private memoryRateLimitStore: Map<string, { count: number; resetTime: number }> = new Map()
  
  private memoryRateLimit(key: string, limit: number, window: number): {
    allowed: boolean
    remaining: number
    resetTime: number
  } {
    const now = Date.now()
    const record = this.memoryRateLimitStore.get(key)
    
    if (!record || now > record.resetTime) {
      // New window
      this.memoryRateLimitStore.set(key, {
        count: 1,
        resetTime: now + (window * 1000)
      })
      
      return {
        allowed: true,
        remaining: limit - 1,
        resetTime: Math.floor((now + (window * 1000)) / 1000)
      }
    } else if (record.count < limit) {
      // Increment within window
      record.count++
      return {
        allowed: true,
        remaining: limit - record.count,
        resetTime: Math.floor(record.resetTime / 1000)
      }
    } else {
      // Limit exceeded
      return {
        allowed: false,
        remaining: 0,
        resetTime: Math.floor(record.resetTime / 1000)
      }
    }
  }

  // Session management
  public async setSession(sessionId: string, sessionData: any): Promise<boolean> {
    return this.set(sessionId, sessionData, {
      ttl: cacheConfig.sessionTTL,
      prefix: 'session'
    })
  }

  public async getSession(sessionId: string): Promise<any> {
    return this.get(sessionId, { prefix: 'session' })
  }

  public async deleteSession(sessionId: string): Promise<boolean> {
    return this.del(sessionId, { prefix: 'session' })
  }

  // User data caching
  public async setUser(userId: string, userData: any): Promise<boolean> {
    return this.set(userId, userData, {
      ttl: cacheConfig.userTTL,
      prefix: 'user'
    })
  }

  public async getUser(userId: string): Promise<any> {
    return this.get(userId, { prefix: 'user' })
  }

  public async deleteUser(userId: string): Promise<boolean> {
    return this.del(userId, { prefix: 'user' })
  }

  // Analytics and monitoring
  public async incrementCounter(key: string, increment: number = 1): Promise<number> {
    try {
      if (!(await this.ensureConnection())) {
        return 0
      }

      const cacheKey = this.generateKey('analytics', key)
      return await this.client.incrBy(cacheKey, increment)
    } catch (error) {
      console.error('Redis increment error:', error)
      return 0
    }
  }

  public async getCounter(key: string): Promise<number> {
    try {
      if (!(await this.ensureConnection())) {
        return 0
      }

      const cacheKey = this.generateKey('analytics', key)
      const value = await this.client.get(cacheKey)
      return value ? parseInt(value) : 0
    } catch (error) {
      console.error('Redis get counter error:', error)
      return 0
    }
  }

  // Cache operations with patterns
  public async clearPattern(pattern: string): Promise<number> {
    try {
      if (!(await this.ensureConnection())) {
        return 0
      }

      const keys = await this.client.keys(pattern)
      if (keys.length === 0) {
        return 0
      }
      
      return await this.client.del(keys)
    } catch (error) {
      console.error('Redis clear pattern error:', error)
      return 0
    }
  }

  // Health check
  public async healthCheck(): Promise<{
    healthy: boolean
    latency: number
    connected: boolean
    memoryUsage?: any
  }> {
    const startTime = Date.now()
    
    try {
      if (!(await this.ensureConnection())) {
        return {
          healthy: false,
          latency: Date.now() - startTime,
          connected: false
        }
      }

      // Test basic operations
      await this.client.ping()
      const testKey = `health_test_${Date.now()}`
      await this.client.set(testKey, 'test')
      await this.client.get(testKey)
      await this.client.del(testKey)
      
      const latency = Date.now() - startTime
      
      // Get memory usage
      let memoryUsage
      try {
        memoryUsage = await this.client.info('memory')
      } catch (error) {
        // Memory info might not be available
      }
      
      return {
        healthy: latency < 1000, // Consider healthy if latency < 1s
        latency,
        connected: this.isConnected,
        memoryUsage
      }
    } catch (error) {
      console.error('Redis health check failed:', error)
      return {
        healthy: false,
        latency: Date.now() - startTime,
        connected: false
      }
    }
  }

  // Cache statistics
  public async getStats(): Promise<{
    connected: boolean
    keyCount?: number
    memoryUsage?: string
    uptime?: number
  }> {
    try {
      if (!(await this.ensureConnection())) {
        return { connected: false }
      }

      const info = await this.client.info()
      const keyCount = await this.client.dbSize()
      
      // Parse info for memory usage and uptime
      const memoryMatch = info.match(/used_memory_human:([^\r\n]+)/)
      const uptimeMatch = info.match(/uptime_in_seconds:([^\r\n]+)/)
      
      return {
        connected: this.isConnected,
        keyCount,
        memoryUsage: memoryMatch ? memoryMatch[1] : undefined,
        uptime: uptimeMatch ? parseInt(uptimeMatch[1]) : undefined
      }
    } catch (error) {
      console.error('Redis get stats error:', error)
      return { connected: false }
    }
  }

  // Cleanup
  public async close(): Promise<void> {
    try {
      if (this.client && this.isConnected) {
        await this.client.quit()
        console.log('✅ Redis connection closed')
      }
    } catch (error) {
      console.error('Error closing Redis connection:', error)
    }
  }
}

// Export singleton instance
export const redisCache = RedisCache.getInstance()

// Export utility functions for easier usage
export const cache = {
  set: (key: string, value: any, options?: CacheOptions) => redisCache.set(key, value, options),
  get: <T>(key: string, options?: CacheOptions) => redisCache.get<T>(key, options),
  del: (key: string, options?: CacheOptions) => redisCache.del(key, options),
  exists: (key: string, options?: CacheOptions) => redisCache.exists(key, options),
  setSession: (sessionId: string, sessionData: any) => redisCache.setSession(sessionId, sessionData),
  getSession: (sessionId: string) => redisCache.getSession(sessionId),
  deleteSession: (sessionId: string) => redisCache.deleteSession(sessionId),
  setUser: (userId: string, userData: any) => redisCache.setUser(userId, userData),
  getUser: (userId: string) => redisCache.getUser(userId),
  deleteUser: (userId: string) => redisCache.deleteUser(userId),
  incrementRateLimit: (key: string, limit: number, window: number) => 
    redisCache.incrementRateLimit(key, limit, window),
  incrementCounter: (key: string, increment?: number) => redisCache.incrementCounter(key, increment),
  getCounter: (key: string) => redisCache.getCounter(key),
  clearPattern: (pattern: string) => redisCache.clearPattern(pattern),
  healthCheck: () => redisCache.healthCheck(),
  getStats: () => redisCache.getStats(),
  close: () => redisCache.close()
}

export default redisCache