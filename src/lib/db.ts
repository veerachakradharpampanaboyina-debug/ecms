import { PrismaClient } from '@prisma/client'
import { adminDb } from './firebase'
import { userService } from './firestore-models'

// Database connection configuration for high concurrency
const connectionConfig = {
  // Connection pool settings for 10k concurrent users
  connectionLimit: 100, // Maximum number of connections in the pool
  poolTimeout: 30000, // 30 seconds timeout for getting connection from pool
  queueLimit: 1000, // Maximum number of connection requests in queue
  acquireTimeout: 60000, // 60 seconds timeout for acquiring connection
  
  // Connection settings
  connectTimeout: 60000, // 60 seconds connection timeout
  readTimeout: 30000, // 30 seconds read timeout
  writeTimeout: 30000, // 30 seconds write timeout
  
  // Retry settings
  retryCount: 3, // Number of retry attempts
  retryDelay: 1000, // Delay between retries in milliseconds
  
  // Logging
  logLevel: process.env.NODE_ENV === 'development' ? 'query' : 'error'
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
  connectionPoolManager: any | undefined
}

// Create Prisma client with optimized configuration
const prismaClient = globalForPrisma.prisma ?? new PrismaClient({
  log: connectionConfig.logLevel === 'query' ? ['query', 'info', 'warn', 'error'] : ['error'],
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prismaClient

// Connection pool management
class ConnectionPoolManager {
  private static instance: ConnectionPoolManager
  private pool: any
  private activeConnections: number = 0
  private maxConnections: number = connectionConfig.connectionLimit
  private waitingQueue: Array<{ resolve: (value: any) => void; reject: (reason: any) => void }> = []

  private constructor() {
    this.initializePool()
  }

  public static getInstance(): ConnectionPoolManager {
    if (!ConnectionPoolManager.instance) {
      ConnectionPoolManager.instance = new ConnectionPoolManager()
    }
    return ConnectionPoolManager.instance
  }

  private async initializePool(): Promise<void> {
    try {
      // Test database connection
      await prismaClient.$connect()
      console.log('✅ Database connection pool initialized successfully')
      
      // Set up connection monitoring
      this.monitorConnections()
    } catch (error) {
      console.error('❌ Failed to initialize database connection pool:', error)
      throw error
    }
  }

  private monitorConnections(): void {
    setInterval(() => {
      const usage = (this.activeConnections / this.maxConnections) * 100
      console.log(`📊 Connection Pool Usage: ${this.activeConnections}/${this.maxConnections} (${usage.toFixed(1)}%)`)
      
      if (usage > 80) {
        console.warn('⚠️  High connection pool usage detected')
      }
      
      if (usage > 95) {
        console.error('🚨 Connection pool nearly exhausted')
      }
    }, 30000) // Monitor every 30 seconds
  }

  public async getConnection(): Promise<any> {
    return new Promise((resolve, reject) => {
      if (this.activeConnections < this.maxConnections) {
        this.activeConnections++
        resolve(prismaClient)
      } else if (this.waitingQueue.length < connectionConfig.queueLimit) {
        // Add to waiting queue
        const timeout = setTimeout(() => {
          const index = this.waitingQueue.findIndex(item => item.resolve === resolve)
          if (index > -1) {
            this.waitingQueue.splice(index, 1)
            reject(new Error('Connection pool timeout'))
          }
        }, connectionConfig.acquireTimeout)

        this.waitingQueue.push({
          resolve: (client: any) => {
            clearTimeout(timeout)
            this.activeConnections++
            resolve(client)
          },
          reject: (error: any) => {
            clearTimeout(timeout)
            reject(error)
          }
        })
      } else {
        reject(new Error('Connection queue limit exceeded'))
      }
    })
  }

  public releaseConnection(): void {
    this.activeConnections = Math.max(0, this.activeConnections - 1)
    
    // Process waiting queue
    if (this.waitingQueue.length > 0 && this.activeConnections < this.maxConnections) {
      const next = this.waitingQueue.shift()
      if (next) {
        next.resolve(prismaClient)
      }
    }
  }

  public getPoolStats(): {
    activeConnections: number
    maxConnections: number
    waitingQueue: number
    usagePercentage: number
  } {
    return {
      activeConnections: this.activeConnections,
      maxConnections: this.maxConnections,
      waitingQueue: this.waitingQueue.length,
      usagePercentage: (this.activeConnections / this.maxConnections) * 100
    }
  }

  public async close(): Promise<void> {
    await prismaClient.$disconnect()
    console.log('✅ Database connection pool closed')
  }
}

// Initialize connection pool manager
const connectionPoolManager = globalForPrisma.connectionPoolManager ?? ConnectionPoolManager.getInstance()
if (process.env.NODE_ENV !== 'production') globalForPrisma.connectionPoolManager = connectionPoolManager

// Enhanced database client with connection pooling
export const db = new Proxy(prismaClient, {
  get(target: any, prop: string) {
    const originalMethod = target[prop]
    
    if (typeof originalMethod === 'function') {
      return async (...args: any[]) => {
        const poolManager = ConnectionPoolManager.getInstance()
        
        try {
          // Get connection from pool
          await poolManager.getConnection()
          
          // Execute the operation with retry logic
          let lastError: Error | null = null
          for (let attempt = 1; attempt <= connectionConfig.retryCount; attempt++) {
            try {
              const result = await originalMethod.apply(target, args)
              return result
            } catch (error) {
              lastError = error as Error
              console.warn(`Database operation failed (attempt ${attempt}/${connectionConfig.retryCount}):`, error)
              
              if (attempt < connectionConfig.retryCount) {
                await new Promise(resolve => setTimeout(resolve, connectionConfig.retryDelay * attempt))
              }
            }
          }
          
          throw lastError || new Error('Database operation failed after retries')
        } finally {
          // Release connection back to pool
          poolManager.releaseConnection()
        }
      }
    }
    
    return originalMethod
  }
})

// Firestore database client
export const firestoreDb = {
  // User operations
  user: userService,
  
  // Department operations
  department: departmentService,
  
  // Student operations
  student: studentService,
  
  // Faculty operations
  faculty: facultyService,
  
  // Course operations
  course: courseService,
  
  // Generic Firestore operations
  collection: (name: string) => collection(adminDb, name),
  doc: (path: string) => doc(adminDb, path),
  
  // Health check
  async healthCheck() {
    try {
      // Test Firestore connectivity
      await adminDb.collection('health_check').doc('test').set({
        timestamp: new Date(),
        status: 'healthy'
      })
      return { healthy: true, latency: 0 }
    } catch (error) {
      console.error('Firestore health check failed:', error)
      return { healthy: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }
}

// Database health check
export async function checkDatabaseHealth(): Promise<{
  healthy: boolean
  latency: number
  poolStats: any
  firestore?: any
  error?: string
}> {
  const poolManager = ConnectionPoolManager.getInstance()
  const startTime = Date.now()
  
  try {
    // Test basic connectivity
    await db.$queryRaw`SELECT 1`
    const latency = Date.now() - startTime
    
    // Get pool statistics
    const poolStats = poolManager.getPoolStats()
    
    // Test Firestore
    const firestoreHealth = await firestoreDb.healthCheck()
    
    // Determine health based on pool usage and latency
    const healthy = latency < 1000 && poolStats.usagePercentage < 90 && firestoreHealth.healthy
    
    return {
      healthy,
      latency,
      poolStats,
      firestore: firestoreHealth
    }
  } catch (error) {
    console.error('Database health check failed:', error)
    return {
      healthy: false,
      latency: Date.now() - startTime,
      poolStats: poolManager.getPoolStats(),
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

// Export for direct access when needed
export { prismaClient as PrismaClient }
export { ConnectionPoolManager }