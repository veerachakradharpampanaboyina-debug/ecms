import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { ErrorHandler } from "@/lib/error-handler"
import { PerformanceMonitor } from "@/lib/performance"
import { LoadBalancer } from "@/lib/load-balancer"
import { createApiHandler } from "@/lib/error-handler"

export const GET = createApiHandler(async (req: NextRequest) => {
  const monitor = PerformanceMonitor.getInstance()
  const loadBalancer = LoadBalancer.getInstance()

  // Get system metrics
  const systemStats = monitor.getSystemStats()
  const metrics = monitor.getMetrics()

  // Get database statistics
  const dbStats = await getDatabaseStats()

  // Get load balancer stats
  const lbStats = {
    servers: loadBalancer['servers'] || [],
    cacheSize: loadBalancer['cache']?.size || 0,
    circuitBreakers: Array.from(loadBalancer['circuitBreakers']?.entries() || []).map(([key, breaker]) => ({
      key,
      state: breaker.state,
      failures: breaker.failures,
      lastFailure: breaker.lastFailure
    }))
  }

  // Calculate performance metrics
  const performanceMetrics = {
    totalRequests: systemStats.requestCount,
    errorCount: systemStats.errorCount,
    errorRate: systemStats.errorRate,
    averageResponseTime: metrics.length > 0 
      ? metrics.reduce((sum, m) => sum + m.responseTime, 0) / metrics.length 
      : 0,
    p95ResponseTime: calculatePercentile(metrics.map(m => m.responseTime), 95),
    p99ResponseTime: calculatePercentile(metrics.map(m => m.responseTime), 99),
    requestsPerMinute: calculateRequestsPerMinute(metrics),
    topEndpoints: getTopEndpoints(metrics, 10),
    statusCodeDistribution: getStatusCodeDistribution(metrics),
    memoryTrend: getMemoryTrend(metrics),
    responseTimeTrend: getResponseTimeTrend(metrics)
  }

  // Get recent alerts
  const recentAlerts = getRecentAlerts(metrics)

  // System health check
  const systemHealth = {
    overall: calculateOverallHealth(performanceMetrics, dbStats, lbStats),
    database: dbStats.health,
    loadBalancer: lbStats.servers.every(s => s.health.healthy) ? 'healthy' : 'degraded',
    performance: performanceMetrics.errorRate < 0.05 && performanceMetrics.averageResponseTime < 2000 ? 'healthy' : 'degraded',
    memory: systemStats.memoryUsage.heapUsed < 800 * 1024 * 1024 ? 'healthy' : 'warning' // 800MB threshold
  }

  return NextResponse.json({
    timestamp: new Date().toISOString(),
    system: systemStats,
    database: dbStats,
    loadBalancer: lbStats,
    performance: performanceMetrics,
    health: systemHealth,
    alerts: recentAlerts,
    recommendations: generateRecommendations(performanceMetrics, dbStats, lbStats)
  })
})

// Helper functions
async function getDatabaseStats() {
  try {
    // Get user counts by role
    const userCounts = await db.user.groupBy({
      by: ['role'],
      _count: { id: true }
    })

    // Get total records counts
    const [studentCount, facultyCount, courseCount, subjectCount] = await Promise.all([
      db.student.count(),
      db.faculty.count(),
      db.course.count(),
      db.subject.count()
    ])

    // Get recent activity
    const recentLogins = await db.user.findMany({
      where: {
        lastLoginAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
        }
      },
      select: {
        id: true,
        email: true,
        role: true,
        lastLoginAt: true
      },
      orderBy: { lastLoginAt: 'desc' },
      take: 10
    })

    return {
      health: 'healthy',
      userCounts: userCounts.reduce((acc, item) => {
        acc[item.role] = item._count.id
        return acc
      }, {} as Record<string, number>),
      totalRecords: {
        students: studentCount,
        faculty: facultyCount,
        courses: courseCount,
        subjects: subjectCount
      },
      recentActivity: {
        logins24h: recentLogins.length,
        recentLogins
      }
    }
  } catch (error) {
    console.error('Database stats error:', error)
    return {
      health: 'unhealthy',
      error: 'Failed to fetch database statistics'
    }
  }
}

function calculatePercentile(values: number[], percentile: number): number {
  if (values.length === 0) return 0
  const sorted = [...values].sort((a, b) => a - b)
  const index = Math.ceil((percentile / 100) * sorted.length) - 1
  return sorted[index] || 0
}

function calculateRequestsPerMinute(metrics: any[]): number {
  if (metrics.length === 0) return 0
  
  const now = Date.now()
  const oneMinuteAgo = now - 60 * 1000
  const recentRequests = metrics.filter(m => m.timestamp > oneMinuteAgo)
  
  return recentRequests.length
}

function getTopEndpoints(metrics: any[], limit: number): Array<{ url: string; avgResponseTime: number; count: number }> {
  const endpointStats = new Map<string, { total: number; count: number }>()

  for (const metric of metrics) {
    const url = new URL(metric.url).pathname
    const current = endpointStats.get(url) || { total: 0, count: 0 }
    endpointStats.set(url, {
      total: current.total + metric.responseTime,
      count: current.count + 1
    })
  }

  return Array.from(endpointStats.entries())
    .map(([url, stats]) => ({
      url,
      avgResponseTime: stats.total / stats.count,
      count: stats.count
    }))
    .sort((a, b) => b.avgResponseTime - a.avgResponseTime)
    .slice(0, limit)
}

function getStatusCodeDistribution(metrics: any[]): Record<number, number> {
  const distribution: Record<number, number> = {}
  
  for (const metric of metrics) {
    distribution[metric.statusCode] = (distribution[metric.statusCode] || 0) + 1
  }

  return distribution
}

function getMemoryTrend(metrics: any[]): Array<{ timestamp: number; memory: number }> {
  return metrics
    .filter(m => m.memoryUsage)
    .map(m => ({
      timestamp: m.timestamp,
      memory: m.memoryUsage.heapUsed
    }))
    .sort((a, b) => a.timestamp - b.timestamp)
    .slice(-100) // Last 100 data points
}

function getResponseTimeTrend(metrics: any[]): Array<{ timestamp: number; responseTime: number }> {
  return metrics
    .map(m => ({
      timestamp: m.timestamp,
      responseTime: m.responseTime
    }))
    .sort((a, b) => a.timestamp - b.timestamp)
    .slice(-100) // Last 100 data points
}

function getRecentAlerts(metrics: any[]): Array<{ type: string; message: string; timestamp: number; severity: string }> {
  const alerts: Array<{ type: string; message: string; timestamp: number; severity: string }> = []
  
  // Check for slow responses
  const slowRequests = metrics.filter(m => m.responseTime > 5000)
  if (slowRequests.length > 0) {
    alerts.push({
      type: 'SLOW_RESPONSE',
      message: `${slowRequests.length} slow requests detected (>5s)`,
      timestamp: Math.max(...slowRequests.map(m => m.timestamp)),
      severity: 'warning'
    })
  }

  // Check for high error rate
  const errorMetrics = metrics.filter(m => m.statusCode >= 400)
  if (errorMetrics.length > metrics.length * 0.1) { // More than 10% errors
    alerts.push({
      type: 'HIGH_ERROR_RATE',
      message: `High error rate: ${((errorMetrics.length / metrics.length) * 100).toFixed(1)}%`,
      timestamp: Date.now(),
      severity: 'error'
    })
  }

  return alerts.sort((a, b) => b.timestamp - a.timestamp).slice(0, 10)
}

function calculateOverallHealth(performance: any, dbStats: any, lbStats: any): string {
  let score = 100

  // Deduct for performance issues
  if (performance.errorRate > 0.05) score -= 20
  if (performance.averageResponseTime > 2000) score -= 15
  if (performance.p99ResponseTime > 5000) score -= 10

  // Deduct for database issues
  if (dbStats.health !== 'healthy') score -= 30

  // Deduct for load balancer issues
  if (!lbStats.servers.every((s: any) => s.health.healthy)) score -= 25

  if (score >= 80) return 'healthy'
  if (score >= 60) return 'degraded'
  return 'unhealthy'
}

function generateRecommendations(performance: any, dbStats: any, lbStats: any): string[] {
  const recommendations: string[] = []

  // Performance recommendations
  if (performance.errorRate > 0.05) {
    recommendations.push('High error rate detected. Investigate error logs and fix underlying issues.')
  }

  if (performance.averageResponseTime > 2000) {
    recommendations.push('High average response time. Consider optimizing database queries or implementing caching.')
  }

  if (performance.p99ResponseTime > 5000) {
    recommendations.push('Some requests are very slow. Review slow endpoints and optimize performance.')
  }

  // Database recommendations
  if (dbStats.health !== 'healthy') {
    recommendations.push('Database health issues detected. Check database connectivity and performance.')
  }

  // Load balancer recommendations
  const unhealthyServers = lbStats.servers.filter((s: any) => !s.health.healthy)
  if (unhealthyServers.length > 0) {
    recommendations.push(`${unhealthyServers.length} server(s) are unhealthy. Check server health and restart if necessary.`)
  }

  // Memory recommendations
  const memoryUsage = process.memoryUsage()
  if (memoryUsage.heapUsed > 800 * 1024 * 1024) {
    recommendations.push('High memory usage detected. Consider implementing memory optimization or scaling up resources.')
  }

  return recommendations
}