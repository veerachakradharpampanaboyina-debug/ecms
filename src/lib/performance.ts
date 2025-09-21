import { NextRequest, NextResponse } from 'next/server'

interface PerformanceMetrics {
  requestId: string
  timestamp: number
  method: string
  url: string
  userAgent: string
  ip: string
  responseTime: number
  statusCode: number
  memoryUsage: NodeJS.MemoryUsage
  cpuUsage?: NodeJS.CpuUsage
}

interface AlertThreshold {
  responseTime: number
  memoryUsage: number
  errorRate: number
}

export class PerformanceMonitor {
  private static instance: PerformanceMonitor
  private metrics: PerformanceMetrics[] = []
  private alerts: AlertThreshold = {
    responseTime: 5000, // 5 seconds
    memoryUsage: 500 * 1024 * 1024, // 500MB
    errorRate: 0.05 // 5%
  }
  private errorCount = 0
  private requestCount = 0

  private constructor() {
    // Start periodic cleanup
    setInterval(() => this.cleanup(), 60000) // Clean up every minute
    
    // Start periodic reporting
    setInterval(() => this.generateReport(), 300000) // Report every 5 minutes
  }

  public static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor()
    }
    return PerformanceMonitor.instance
  }

  public generateRequestId(): string {
    return `perf_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  public async startMonitoring(req: NextRequest): Promise<{
    requestId: string
    startTime: number
    startMemory: NodeJS.MemoryUsage
    startCpu?: NodeJS.CpuUsage
  }> {
    const requestId = this.generateRequestId()
    const startTime = Date.now()
    const startMemory = process.memoryUsage()
    let startCpu: NodeJS.CpuUsage | undefined

    try {
      startCpu = process.cpuUsage()
    } catch (error) {
      // CPU usage might not be available in all environments
    }

    return {
      requestId,
      startTime,
      startMemory,
      startCpu
    }
  }

  public async endMonitoring(
    req: NextRequest,
    response: NextResponse,
    monitoringData: {
      requestId: string
      startTime: number
      startMemory: NodeJS.MemoryUsage
      startCpu?: NodeJS.CpuUsage
    }
  ): Promise<void> {
    const endTime = Date.now()
    const endMemory = process.memoryUsage()
    const responseTime = endTime - monitoringData.startTime

    const forwarded = req.headers.get('x-forwarded-for')
    const ip = forwarded ? forwarded.split(',')[0] : req.ip || 'unknown'

    const metric: PerformanceMetrics = {
      requestId: monitoringData.requestId,
      timestamp: monitoringData.startTime,
      method: req.method,
      url: req.url,
      userAgent: req.headers.get('user-agent') || 'unknown',
      ip,
      responseTime,
      statusCode: response.status,
      memoryUsage: endMemory,
      cpuUsage: monitoringData.startCpu ? process.cpuUsage(monitoringData.startCpu) : undefined
    }

    this.metrics.push(metric)
    this.requestCount++

    // Check for alerts
    this.checkAlerts(metric)

    // Log slow requests
    if (responseTime > this.alerts.responseTime) {
      console.warn(`Slow request detected: ${responseTime}ms - ${req.method} ${req.url}`)
    }

    // Log high memory usage
    if (endMemory.heapUsed > this.alerts.memoryUsage) {
      console.warn(`High memory usage detected: ${Math.round(endMemory.heapUsed / 1024 / 1024)}MB`)
    }
  }

  private checkAlerts(metric: PerformanceMetrics): void {
    // Check response time
    if (metric.responseTime > this.alerts.responseTime) {
      this.triggerAlert('HIGH_RESPONSE_TIME', {
        requestId: metric.requestId,
        responseTime: metric.responseTime,
        threshold: this.alerts.responseTime,
        url: metric.url
      })
    }

    // Check memory usage
    if (metric.memoryUsage.heapUsed > this.alerts.memoryUsage) {
      this.triggerAlert('HIGH_MEMORY_USAGE', {
        requestId: metric.requestId,
        memoryUsage: metric.memoryUsage.heapUsed,
        threshold: this.alerts.memoryUsage
      })
    }

    // Check error rate
    if (metric.statusCode >= 400) {
      this.errorCount++
      const errorRate = this.errorCount / this.requestCount
      if (errorRate > this.alerts.errorRate) {
        this.triggerAlert('HIGH_ERROR_RATE', {
          errorRate,
          threshold: this.alerts.errorRate,
          totalRequests: this.requestCount,
          errorCount: this.errorCount
        })
      }
    }
  }

  private triggerAlert(type: string, data: any): void {
    const alert = {
      type,
      timestamp: new Date().toISOString(),
      data,
      environment: process.env.NODE_ENV
    }

    console.error('Performance Alert:', JSON.stringify(alert, null, 2))

    // Here you could integrate with external monitoring services
    // For example: Slack, PagerDuty, custom webhooks, etc.
  }

  private cleanup(): void {
    const now = Date.now()
    const oneHourAgo = now - 60 * 60 * 1000 // Keep last hour of data

    this.metrics = this.metrics.filter(metric => metric.timestamp > oneHourAgo)
  }

  private generateReport(): void {
    if (this.metrics.length === 0) return

    const report = {
      timestamp: new Date().toISOString(),
      period: '5 minutes',
      totalRequests: this.requestCount,
      errorCount: this.errorCount,
      errorRate: this.requestCount > 0 ? this.errorCount / this.requestCount : 0,
      averageResponseTime: this.calculateAverageResponseTime(),
      p95ResponseTime: this.calculatePercentileResponseTime(95),
      p99ResponseTime: this.calculatePercentileResponseTime(99),
      memoryUsage: {
        average: this.calculateAverageMemoryUsage(),
        peak: this.calculatePeakMemoryUsage()
      },
      topSlowEndpoints: this.getTopSlowEndpoints(5),
      statusCodeDistribution: this.getStatusCodeDistribution()
    }

    console.log('Performance Report:', JSON.stringify(report, null, 2))
  }

  private calculateAverageResponseTime(): number {
    if (this.metrics.length === 0) return 0
    const total = this.metrics.reduce((sum, metric) => sum + metric.responseTime, 0)
    return total / this.metrics.length
  }

  private calculatePercentileResponseTime(percentile: number): number {
    if (this.metrics.length === 0) return 0
    const sorted = this.metrics.map(m => m.responseTime).sort((a, b) => a - b)
    const index = Math.ceil((percentile / 100) * sorted.length) - 1
    return sorted[index] || 0
  }

  private calculateAverageMemoryUsage(): number {
    if (this.metrics.length === 0) return 0
    const total = this.metrics.reduce((sum, metric) => sum + metric.memoryUsage.heapUsed, 0)
    return total / this.metrics.length
  }

  private calculatePeakMemoryUsage(): number {
    if (this.metrics.length === 0) return 0
    return Math.max(...this.metrics.map(metric => metric.memoryUsage.heapUsed))
  }

  private getTopSlowEndpoints(limit: number): Array<{ url: string; avgResponseTime: number; count: number }> {
    const endpointStats = new Map<string, { total: number; count: number }>()

    for (const metric of this.metrics) {
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

  private getStatusCodeDistribution(): Record<number, number> {
    const distribution: Record<number, number> = {}
    
    for (const metric of this.metrics) {
      distribution[metric.statusCode] = (distribution[metric.statusCode] || 0) + 1
    }

    return distribution
  }

  public getMetrics(): PerformanceMetrics[] {
    return [...this.metrics]
  }

  public getSystemStats(): {
    uptime: number
    memoryUsage: NodeJS.MemoryUsage
    cpuUsage?: NodeJS.CpuUsage
    requestCount: number
    errorCount: number
    errorRate: number
  } {
    let cpuUsage: NodeJS.CpuUsage | undefined
    try {
      cpuUsage = process.cpuUsage()
    } catch (error) {
      // CPU usage might not be available
    }

    return {
      uptime: process.uptime(),
      memoryUsage: process.memoryUsage(),
      cpuUsage,
      requestCount: this.requestCount,
      errorCount: this.errorCount,
      errorRate: this.requestCount > 0 ? this.errorCount / this.requestCount : 0
    }
  }

  public reset(): void {
    this.metrics = []
    this.errorCount = 0
    this.requestCount = 0
  }
}

// Middleware for performance monitoring
export async function withPerformanceMonitoring(
  req: NextRequest,
  handler: (req: NextRequest) => Promise<NextResponse>
): Promise<NextResponse> {
  const monitor = PerformanceMonitor.getInstance()
  const monitoringData = await monitor.startMonitoring(req)

  try {
    const response = await handler(req)
    await monitor.endMonitoring(req, response, monitoringData)
    
    // Add performance headers
    response.headers.set('X-Response-Time', monitoringData.startTime ? (Date.now() - monitoringData.startTime).toString() : '0')
    response.headers.set('X-Request-ID', monitoringData.requestId)
    
    return response
  } catch (error) {
    // Create error response for monitoring
    const errorResponse = NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
    await monitor.endMonitoring(req, errorResponse, monitoringData)
    throw error
  }
}