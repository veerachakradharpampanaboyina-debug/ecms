import { NextRequest, NextResponse } from 'next/server'
import { ErrorHandler } from '@/lib/error-handler'

interface ServerNode {
  id: string
  host: string
  port: number
  protocol: 'http' | 'https'
  weight: number
  currentConnections: number
  maxConnections: number
  healthy: boolean
  lastHealthCheck: number
  responseTime: number
  region?: string
  zone?: string
}

interface LoadBalancerConfig {
  strategy: 'round-robin' | 'least-connections' | 'weighted' | 'ip-hash' | 'geographic'
  healthCheckInterval: number
  healthCheckTimeout: number
  unhealthyThreshold: number
  healthyThreshold: number
  sessionAffinity: boolean
  maxRetries: number
  retryDelay: number
}

interface ScalingMetrics {
  totalRequests: number
  activeConnections: number
  averageResponseTime: number
  errorRate: number
  cpuUsage: number
  memoryUsage: number
  timestamp: number
}

interface ScalingPolicy {
  scaleUpThreshold: {
    cpuUsage: number
    memoryUsage: number
    responseTime: number
    errorRate: number
  }
  scaleDownThreshold: {
    cpuUsage: number
    memoryUsage: number
    responseTime: number
    connectionsPerServer: number
  }
  cooldownPeriod: number
  minServers: number
  maxServers: number
  scaleUpIncrement: number
  scaleDownIncrement: number
}

export class HorizontalScaler {
  private static instance: HorizontalScaler
  private servers: ServerNode[] = []
  private config: LoadBalancerConfig
  private currentIndex = 0
  private metrics: ScalingMetrics[] = []
  private scalingPolicy: ScalingPolicy
  private lastScalingAction = 0
  private healthCheckInterval: NodeJS.Timeout | null = null

  private constructor() {
    this.config = {
      strategy: 'least-connections',
      healthCheckInterval: 30000, // 30 seconds
      healthCheckTimeout: 5000, // 5 seconds
      unhealthyThreshold: 3,
      healthyThreshold: 2,
      sessionAffinity: true,
      maxRetries: 3,
      retryDelay: 1000
    }

    this.scalingPolicy = {
      scaleUpThreshold: {
        cpuUsage: 70, // 70%
        memoryUsage: 80, // 80%
        responseTime: 2000, // 2 seconds
        errorRate: 5 // 5%
      },
      scaleDownThreshold: {
        cpuUsage: 20, // 20%
        memoryUsage: 30, // 30%
        responseTime: 500, // 500ms
        connectionsPerServer: 50
      },
      cooldownPeriod: 300000, // 5 minutes
      minServers: 3,
      maxServers: 20,
      scaleUpIncrement: 2,
      scaleDownIncrement: 1
    }

    this.initializeServers()
    this.startHealthChecks()
    this.startScalingMonitor()
  }

  public static getInstance(): HorizontalScaler {
    if (!HorizontalScaler.instance) {
      HorizontalScaler.instance = new HorizontalScaler()
    }
    return HorizontalScaler.instance
  }

  private initializeServers(): void {
    // Initialize with default server nodes
    this.servers = [
      {
        id: 'server-1',
        host: 'localhost',
        port: 3000,
        protocol: 'http',
        weight: 1,
        currentConnections: 0,
        maxConnections: 1000,
        healthy: true,
        lastHealthCheck: Date.now(),
        responseTime: 0
      },
      {
        id: 'server-2',
        host: 'localhost',
        port: 3001,
        protocol: 'http',
        weight: 1,
        currentConnections: 0,
        maxConnections: 1000,
        healthy: true,
        lastHealthCheck: Date.now(),
        responseTime: 0
      },
      {
        id: 'server-3',
        host: 'localhost',
        port: 3002,
        protocol: 'http',
        weight: 1,
        currentConnections: 0,
        maxConnections: 1000,
        healthy: true,
        lastHealthCheck: Date.now(),
        responseTime: 0
      }
    ]
  }

  private startHealthChecks(): void {
    this.healthCheckInterval = setInterval(async () => {
      await this.performHealthChecks()
    }, this.config.healthCheckInterval)
  }

  private async performHealthChecks(): Promise<void> {
    const healthCheckPromises = this.servers.map(async (server) => {
      try {
        const startTime = Date.now()
        const response = await fetch(`${server.protocol}://${server.host}:${server.port}/api/health`, {
          method: 'GET',
          signal: AbortSignal.timeout(this.config.healthCheckTimeout)
        })
        const responseTime = Date.now() - startTime

        if (response.ok) {
          const healthData = await response.json()
          server.healthy = healthData.status === 'healthy'
          server.responseTime = responseTime
        } else {
          server.healthy = false
          server.responseTime = responseTime
        }
      } catch (error) {
        server.healthy = false
        server.responseTime = this.config.healthCheckTimeout
      }

      server.lastHealthCheck = Date.now()
    })

    await Promise.all(healthCheckPromises)
    
    // Log unhealthy servers
    const unhealthyServers = this.servers.filter(s => !s.healthy)
    if (unhealthyServers.length > 0) {
      console.warn(`Unhealthy servers detected: ${unhealthyServers.map(s => s.id).join(', ')}`)
    }
  }

  private startScalingMonitor(): void {
    setInterval(async () => {
      await this.checkScalingConditions()
    }, 60000) // Check every minute
  }

  private async checkScalingConditions(): Promise<void> {
    const now = Date.now()
    
    // Check cooldown period
    if (now - this.lastScalingAction < this.scalingPolicy.cooldownPeriod) {
      return
    }

    const metrics = await this.collectMetrics()
    const shouldScaleUp = this.shouldScaleUp(metrics)
    const shouldScaleDown = this.shouldScaleDown(metrics)

    if (shouldScaleUp) {
      await this.scaleUp()
    } else if (shouldScaleDown) {
      await this.scaleDown()
    }
  }

  private async collectMetrics(): Promise<ScalingMetrics> {
    const healthyServers = this.servers.filter(s => s.healthy)
    const totalConnections = healthyServers.reduce((sum, s) => sum + s.currentConnections, 0)
    const averageResponseTime = healthyServers.reduce((sum, s) => sum + s.responseTime, 0) / healthyServers.length

    const totalRequests = 0
    const errorRate = 0

    // Get memory and CPU usage (simplified)
    const memoryUsage = process.memoryUsage()
    const memoryUsagePercent = (memoryUsage.heapUsed / memoryUsage.heapTotal) * 100

    const metrics: ScalingMetrics = {
      totalRequests: totalRequests || 0,
      activeConnections: totalConnections,
      averageResponseTime,
      errorRate,
      cpuUsage: 0, // Would need system monitoring in production
      memoryUsage: memoryUsagePercent,
      timestamp: now
    }

    // Store metrics for analysis
    this.metrics.push(metrics)
    
    // Keep only last hour of metrics
    const oneHourAgo = now - 3600000
    this.metrics = this.metrics.filter(m => m.timestamp > oneHourAgo)

    return metrics
  }

  private async calculateErrorRate(): Promise<number> {
    return 0
  }

  private shouldScaleUp(metrics: ScalingMetrics): boolean {
    const { scaleUpThreshold } = this.scalingPolicy
    const healthyServers = this.servers.filter(s => s.healthy)
    
    if (healthyServers.length >= this.scalingPolicy.maxServers) {
      return false
    }

    return (
      metrics.cpuUsage > scaleUpThreshold.cpuUsage ||
      metrics.memoryUsage > scaleUpThreshold.memoryUsage ||
      metrics.averageResponseTime > scaleUpThreshold.responseTime ||
      metrics.errorRate > scaleUpThreshold.errorRate
    )
  }

  private shouldScaleDown(metrics: ScalingMetrics): boolean {
    const { scaleDownThreshold } = this.scalingPolicy
    const healthyServers = this.servers.filter(s => s.healthy)
    
    if (healthyServers.length <= this.scalingPolicy.minServers) {
      return false
    }

    const avgConnectionsPerServer = metrics.activeConnections / healthyServers.length

    return (
      metrics.cpuUsage < scaleDownThreshold.cpuUsage &&
      metrics.memoryUsage < scaleDownThreshold.memoryUsage &&
      metrics.averageResponseTime < scaleDownThreshold.responseTime &&
      avgConnectionsPerServer < scaleDownThreshold.connectionsPerServer
    )
  }

  private async scaleUp(): Promise<void> {
    const healthyServers = this.servers.filter(s => s.healthy)
    const newServerCount = Math.min(
      healthyServers.length + this.scalingPolicy.scaleUpIncrement,
      this.scalingPolicy.maxServers
    )

    console.log(`📈 Scaling up from ${healthyServers.length} to ${newServerCount} servers`)

    // In a real implementation, this would provision new server instances
    // For now, we'll simulate by adding server configurations
    for (let i = healthyServers.length; i < newServerCount; i++) {
      const newServer: ServerNode = {
        id: `server-${i + 1}`,
        host: 'localhost',
        port: 3000 + i,
        protocol: 'http',
        weight: 1,
        currentConnections: 0,
        maxConnections: 1000,
        healthy: false, // Will be verified by health check
        lastHealthCheck: Date.now(),
        responseTime: 0
      }

      this.servers.push(newServer)
      
      // Log scaling action
      console.log(`Added new server: ${newServer.id}`)
    }

    this.lastScalingAction = Date.now()
    
    // Notify about scaling event
    await this.logScalingEvent('scale_up', {
      from: healthyServers.length,
      to: newServerCount,
      reason: 'high_load'
    })
  }

  private async scaleDown(): Promise<void> {
    const healthyServers = this.servers.filter(s => s.healthy)
    const newServerCount = Math.max(
      healthyServers.length - this.scalingPolicy.scaleDownIncrement,
      this.scalingPolicy.minServers
    )

    console.log(`📉 Scaling down from ${healthyServers.length} to ${newServerCount} servers`)

    // Remove least loaded servers
    const serversToRemove = healthyServers
      .sort((a, b) => a.currentConnections - b.currentConnections)
      .slice(0, healthyServers.length - newServerCount)

    for (const server of serversToRemove) {
      const index = this.servers.findIndex(s => s.id === server.id)
      if (index > -1) {
        this.servers.splice(index, 1)
        console.log(`Removed server: ${server.id}`)
      }
    }

    this.lastScalingAction = Date.now()
    
    // Notify about scaling event
    await this.logScalingEvent('scale_down', {
      from: healthyServers.length,
      to: newServerCount,
      reason: 'low_load'
    })
  }

  private async logScalingEvent(action: string, data: any): Promise<void> {
    
  }

  public selectServer(req: NextRequest): ServerNode | null {
    const healthyServers = this.servers.filter(s => s.healthy)
    
    if (healthyServers.length === 0) {
      console.error('No healthy servers available')
      return null
    }

    let selectedServer: ServerNode

    switch (this.config.strategy) {
      case 'round-robin':
        selectedServer = healthyServers[this.currentIndex % healthyServers.length]
        this.currentIndex = (this.currentIndex + 1) % healthyServers.length
        break

      case 'least-connections':
        selectedServer = healthyServers.reduce((min, server) => 
          server.currentConnections < min.currentConnections ? server : min
        )
        break

      case 'weighted':
        const totalWeight = healthyServers.reduce((sum, s) => sum + s.weight, 0)
        let random = Math.random() * totalWeight
        for (const server of healthyServers) {
          random -= server.weight
          if (random <= 0) {
            selectedServer = server
            break
          }
        }
        selectedServer = selectedServer || healthyServers[0]
        break

      case 'ip-hash':
        const forwarded = req.headers.get('x-forwarded-for')
        const ip = forwarded ? forwarded.split(',')[0] : req.ip || 'unknown'
        const hash = this.hashString(ip)
        selectedServer = healthyServers[hash % healthyServers.length]
        break

      case 'geographic':
        // Simplified geographic routing - would use GeoIP in production
        selectedServer = healthyServers[0]
        break

      default:
        selectedServer = healthyServers[0]
    }

    // Check if server has capacity
    if (selectedServer.currentConnections >= selectedServer.maxConnections) {
      // Find next available server
      const availableServer = healthyServers.find(s => s.currentConnections < s.maxConnections)
      if (availableServer) {
        selectedServer = availableServer
      } else {
        console.warn('All servers at capacity')
        return null
      }
    }

    selectedServer.currentConnections++
    return selectedServer
  }

  private hashString(str: string): number {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32-bit integer
    }
    return Math.abs(hash)
  }

  public releaseConnection(serverId: string): void {
    const server = this.servers.find(s => s.id === serverId)
    if (server) {
      server.currentConnections = Math.max(0, server.currentConnections - 1)
    }
  }

  public getServerStats(): Array<{
    id: string
    host: string
    port: number
    healthy: boolean
    currentConnections: number
    maxConnections: number
    responseTime: number
    connectionsPercent: number
  }> {
    return this.servers.map(server => ({
      id: server.id,
      host: server.host,
      port: server.port,
      healthy: server.healthy,
      currentConnections: server.currentConnections,
      maxConnections: server.maxConnections,
      responseTime: server.responseTime,
      connectionsPercent: (server.currentConnections / server.maxConnections) * 100
    }))
  }

  public getScalingMetrics(): {
    totalServers: number
    healthyServers: number
    totalConnections: number
    averageResponseTime: number
    lastScalingAction: number
    scalingPolicy: ScalingPolicy
  } {
    const healthyServers = this.servers.filter(s => s.healthy)
    const totalConnections = this.servers.reduce((sum, s) => sum + s.currentConnections, 0)
    const averageResponseTime = healthyServers.length > 0 
      ? healthyServers.reduce((sum, s) => sum + s.responseTime, 0) / healthyServers.length 
      : 0

    return {
      totalServers: this.servers.length,
      healthyServers: healthyServers.length,
      totalConnections,
      averageResponseTime,
      lastScalingAction: this.lastScalingAction,
      scalingPolicy: this.scalingPolicy
    }
  }

  public async addServer(serverConfig: Omit<ServerNode, 'currentConnections' | 'healthy' | 'lastHealthCheck' | 'responseTime'>): Promise<void> {
    const newServer: ServerNode = {
      ...serverConfig,
      currentConnections: 0,
      healthy: false,
      lastHealthCheck: Date.now(),
      responseTime: 0
    }

    this.servers.push(newServer)
    console.log(`Manually added server: ${newServer.id}`)
  }

  public async removeServer(serverId: string): Promise<void> {
    const index = this.servers.findIndex(s => s.id === serverId)
    if (index > -1) {
      const server = this.servers[index]
      
      // Wait for connections to drain
      if (server.currentConnections > 0) {
        console.log(`Waiting for ${server.currentConnections} connections to drain on ${serverId}`)
        // In production, you might want to implement a proper draining mechanism
      }

      this.servers.splice(index, 1)
      console.log(`Removed server: ${serverId}`)
    }
  }

  public updateConfig(newConfig: Partial<LoadBalancerConfig>): void {
    this.config = { ...this.config, ...newConfig }
    console.log('Load balancer configuration updated')
  }

  public updateScalingPolicy(newPolicy: Partial<ScalingPolicy>): void {
    this.scalingPolicy = { ...this.scalingPolicy, ...newPolicy }
    console.log('Scaling policy updated')
  }

  public destroy(): void {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval)
    }
    this.servers = []
    this.metrics = []
    console.log('Horizontal scaler destroyed')
  }
}

// Middleware for horizontal scaling
export async function withHorizontalScaling(
  req: NextRequest,
  handler: (req: NextRequest, server: ServerNode) => Promise<NextResponse>
): Promise<NextResponse> {
  const scaler = HorizontalScaler.getInstance()
  
  try {
    // Select appropriate server
    const server = scaler.selectServer(req)
    if (!server) {
      return NextResponse.json(
        { error: 'Service temporarily unavailable - no healthy servers' },
        { status: 503 }
      )
    }

    try {
      // Execute the handler with server context
      const response = await handler(req, server)
      
      // Add server information to response headers
      response.headers.set('X-Server-Id', server.id)
      response.headers.set('X-Server-Host', server.host)
      response.headers.set('X-Server-Port', server.port.toString())
      response.headers.set('X-Server-Connections', `${server.currentConnections}/${server.maxConnections}`)
      response.headers.set('X-Server-Response-Time', server.responseTime.toString())
      
      return response
    } finally {
      // Release connection back to server
      scaler.releaseConnection(server.id)
    }
  } catch (error) {
    console.error('Horizontal scaling error:', error)
    const errorHandler = ErrorHandler.getInstance()
    return errorHandler.handleApiError(error, req, { 
      scaling: true 
    })
  }
}

// Export singleton instance
export const horizontalScaler = HorizontalScaler.getInstance()