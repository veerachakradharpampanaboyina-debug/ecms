import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { ErrorHandler } from "@/lib/error-handler"
import { LoadBalancer } from "@/lib/load-balancer"

export async function GET() {
  try {
    const startTime = Date.now()
    
    // Database health check
    let databaseStatus = 'healthy'
    let databaseLatency = 0
    
    try {
      const dbStart = Date.now()
      await db.$queryRaw`SELECT 1`
      databaseLatency = Date.now() - dbStart
    } catch (error) {
      databaseStatus = 'unhealthy'
      console.error('Database health check failed:', error)
    }

    // Memory usage
    const memoryUsage = process.memoryUsage()
    const memoryStatus = {
      rss: Math.round(memoryUsage.rss / 1024 / 1024), // MB
      heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024), // MB
      heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024), // MB
      external: Math.round(memoryUsage.external / 1024 / 1024), // MB
    }

    // Load balancer status
    const loadBalancer = LoadBalancer.getInstance()
    const servers = loadBalancer['servers'] || []
    
    

    const totalLatency = Date.now() - startTime

    const healthStatus = {
      status: databaseStatus === 'healthy' ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV,
      
      // Database
      database: {
        status: databaseStatus,
        latency: databaseLatency,
      },
      
      // Memory
      memory: memoryStatus,
      
      // Load balancer
      loadBalancer: {
        servers: servers.map(s => ({
          id: s.id,
          healthy: s.health.healthy,
          currentConnections: s.currentConnections,
          maxConnections: s.maxConnections,
          responseTime: s.health.responseTime,
        })),
        activeServers: servers.filter(s => s.health.healthy).length,
        totalServers: servers.length,
      },
      
      
      
      // Performance
      performance: {
        totalLatency,
        requestTimestamp: startTime,
      },
      
      // System info
      system: {
        platform: process.platform,
        arch: process.arch,
        nodeVersion: process.version,
      },
    }

    // Determine HTTP status based on health
    const httpStatus = healthStatus.status === 'healthy' ? 200 : 503

    return NextResponse.json(healthStatus, { 
      status: httpStatus,
      headers: {
        'X-Health-Status': healthStatus.status,
        'X-Response-Time': totalLatency.toString(),
        'X-Database-Latency': databaseLatency.toString(),
      }
    })
  } catch (error) {
    const errorHandler = ErrorHandler.getInstance()
    return errorHandler.handleApiError(error, new Request('http://localhost'), { 
      endpoint: 'health' 
    })
  }
}