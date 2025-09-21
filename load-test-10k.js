const { performance } = require('perf_hooks')
const https = require('https')
const http = require('http')
const { URL } = require('url')

/**
 * Comprehensive Load Testing Script for 10,000 Concurrent Users
 * 
 * This script simulates realistic user behavior patterns and tests the system
 * under heavy load conditions. It includes multiple test scenarios and detailed reporting.
 */

class LoadTester10K {
  constructor(options = {}) {
    this.baseUrl = options.baseUrl || 'http://localhost:3000'
    this.concurrentUsers = options.concurrentUsers || 10000
    this.duration = options.duration || 300000 // 5 minutes
    this.rampUpTime = options.rampUpTime || 60000 // 1 minute ramp-up
    this.rampDownTime = options.rampDownTime || 30000 // 30 seconds ramp-down
    this.thinkTime = options.thinkTime || { min: 100, max: 2000 } // User think time between requests
    this.scenario = options.scenario || 'mixed' // 'auth', 'api', 'mixed', 'stress'
    
    this.results = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      responseTimes: [],
      errors: [],
      concurrency: [],
      throughput: [],
      memoryUsage: [],
      cpuUsage: []
    }
    
    this.userAgents = [
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
      'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36',
      'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15',
      'Mozilla/5.0 (Android 11; Mobile; rv:68.0) Gecko/68.0 Firefox/88.0'
    ]
    
    this.testScenarios = {
      auth: this.authScenario.bind(this),
      api: this.apiScenario.bind(this),
      mixed: this.mixedScenario.bind(this),
      stress: this.stressScenario.bind(this)
    }
    
    this.isRunning = false
    this.startTime = null
    this.activeUsers = 0
  }

  async runTest() {
    console.log('🚀 Starting 10K User Load Test')
    console.log('='.repeat(60))
    console.log(`📊 Configuration:`)
    console.log(`   Target URL: ${this.baseUrl}`)
    console.log(`   Concurrent Users: ${this.concurrentUsers.toLocaleString()}`)
    console.log(`   Duration: ${(this.duration / 1000).toLocaleString()} seconds`)
    console.log(`   Ramp-up Time: ${(this.rampUpTime / 1000).toLocaleString()} seconds`)
    console.log(`   Ramp-down Time: ${(this.rampDownTime / 1000).toLocaleString()} seconds`)
    console.log(`   Scenario: ${this.scenario}`)
    console.log('='.repeat(60))

    this.startTime = Date.now()
    this.isRunning = true

    try {
      // Start monitoring
      this.startMonitoring()
      
      // Execute test scenario
      await this.testScenarios[this.scenario]()
      
      // Wait for test completion
      await this.waitForCompletion()
      
      // Generate comprehensive report
      this.generateReport()
      
    } catch (error) {
      console.error('❌ Load test failed:', error)
    } finally {
      this.isRunning = false
    }
  }

  async authScenario() {
    console.log('🔐 Running Authentication Scenario...')
    
    const userPromises = []
    const usersPerSecond = this.concurrentUsers / (this.rampUpTime / 1000)
    
    for (let i = 0; i < this.concurrentUsers; i++) {
      const delay = (i / usersPerSecond) * 1000
      
      userPromises.push(new Promise(async (resolve) => {
        setTimeout(async () => {
          if (!this.isRunning) {
            resolve()
            return
          }
          
          this.activeUsers++
          const userId = `user_${i + 1}`
          
          try {
            await this.simulateAuthUser(userId)
          } catch (error) {
            console.error(`User ${userId} failed:`, error.message)
          } finally {
            this.activeUsers--
            resolve()
          }
        }, delay)
      }))
    }
    
    await Promise.all(userPromises)
  }

  async apiScenario() {
    console.log('📡 Running API Scenario...')
    
    const userPromises = []
    const usersPerSecond = this.concurrentUsers / (this.rampUpTime / 1000)
    
    for (let i = 0; i < this.concurrentUsers; i++) {
      const delay = (i / usersPerSecond) * 1000
      
      userPromises.push(new Promise(async (resolve) => {
        setTimeout(async () => {
          if (!this.isRunning) {
            resolve()
            return
          }
          
          this.activeUsers++
          const userId = `user_${i + 1}`
          
          try {
            await this.simulateApiUser(userId)
          } catch (error) {
            console.error(`User ${userId} failed:`, error.message)
          } finally {
            this.activeUsers--
            resolve()
          }
        }, delay)
      }))
    }
    
    await Promise.all(userPromises)
  }

  async mixedScenario() {
    console.log('🔄 Running Mixed Scenario...')
    
    const userPromises = []
    const usersPerSecond = this.concurrentUsers / (this.rampUpTime / 1000)
    
    for (let i = 0; i < this.concurrentUsers; i++) {
      const delay = (i / usersPerSecond) * 1000
      
      userPromises.push(new Promise(async (resolve) => {
        setTimeout(async () => {
          if (!this.isRunning) {
            resolve()
            return
          }
          
          this.activeUsers++
          const userId = `user_${i + 1}`
          
          try {
            await this.simulateMixedUser(userId)
          } catch (error) {
            console.error(`User ${userId} failed:`, error.message)
          } finally {
            this.activeUsers--
            resolve()
          }
        }, delay)
      }))
    }
    
    await Promise.all(userPromises)
  }

  async stressScenario() {
    console.log('💥 Running Stress Scenario...')
    
    const userPromises = []
    const usersPerSecond = this.concurrentUsers / (this.rampUpTime / 1000)
    
    for (let i = 0; i < this.concurrentUsers; i++) {
      const delay = (i / usersPerSecond) * 1000
      
      userPromises.push(new Promise(async (resolve) => {
        setTimeout(async () => {
          if (!this.isRunning) {
            resolve()
            return
          }
          
          this.activeUsers++
          const userId = `user_${i + 1}`
          
          try {
            await this.simulateStressUser(userId)
          } catch (error) {
            console.error(`User ${userId} failed:`, error.message)
          } finally {
            this.activeUsers--
            resolve()
          }
        }, delay)
      }))
    }
    
    await Promise.all(userPromises)
  }

  async simulateAuthUser(userId) {
    const endTime = this.startTime + this.duration
    
    while (Date.now() < endTime && this.isRunning) {
      try {
        // Health check
        await this.makeRequest('/api/health', 'GET', userId)
        
        // Login attempt
        const credentials = this.generateCredentials(userId)
        await this.makeRequest('/api/auth/callback/credentials', 'POST', userId, {
          email: credentials.email,
          password: credentials.password
        })
        
        // Get session
        await this.makeRequest('/api/auth/session', 'GET', userId)
        
        // User profile access
        await this.makeRequest('/api/user/profile', 'GET', userId)
        
        // Think time
        await this.sleep(this.randomBetween(this.thinkTime.min, this.thinkTime.max))
        
      } catch (error) {
        // Log error but continue
        this.results.errors.push({
          userId,
          error: error.message,
          timestamp: Date.now()
        })
      }
    }
  }

  async simulateApiUser(userId) {
    const endTime = this.startTime + this.duration
    
    while (Date.now() < endTime && this.isRunning) {
      try {
        const endpoints = [
          '/api/health',
          '/api/admin/users',
          '/api/student/materials',
          '/api/faculty/assignments',
          '/api/hod/reports',
          '/api/admin/monitoring'
        ]
        
        const endpoint = endpoints[Math.floor(Math.random() * endpoints.length)]
        await this.makeRequest(endpoint, 'GET', userId)
        
        // Think time
        await this.sleep(this.randomBetween(this.thinkTime.min, this.thinkTime.max))
        
      } catch (error) {
        this.results.errors.push({
          userId,
          error: error.message,
          timestamp: Date.now()
        })
      }
    }
  }

  async simulateMixedUser(userId) {
    const endTime = this.startTime + this.duration
    const userRole = this.getUserRole(userId)
    
    while (Date.now() < endTime && this.isRunning) {
      try {
        const actions = this.getActionsForRole(userRole)
        const action = actions[Math.floor(Math.random() * actions.length)]
        
        await this.executeAction(action, userId)
        
        // Think time
        await this.sleep(this.randomBetween(this.thinkTime.min, this.thinkTime.max))
        
      } catch (error) {
        this.results.errors.push({
          userId,
          error: error.message,
          timestamp: Date.now()
        })
      }
    }
  }

  async simulateStressUser(userId) {
    const endTime = this.startTime + this.duration
    
    while (Date.now() < endTime && this.isRunning) {
      try {
        // Rapid fire requests with minimal think time
        await Promise.all([
          this.makeRequest('/api/health', 'GET', userId),
          this.makeRequest('/api/admin/monitoring', 'GET', userId),
          this.makeRequest('/api/student/materials', 'GET', userId)
        ])
        
        // Minimal think time for stress testing
        await this.sleep(this.randomBetween(10, 100))
        
      } catch (error) {
        this.results.errors.push({
          userId,
          error: error.message,
          timestamp: Date.now()
        })
      }
    }
  }

  getActionsForRole(role) {
    const actions = {
      admin: [
        { method: 'GET', endpoint: '/api/health' },
        { method: 'GET', endpoint: '/api/admin/users' },
        { method: 'GET', endpoint: '/api/admin/monitoring' },
        { method: 'GET', endpoint: '/api/admin/settings' },
        { method: 'POST', endpoint: '/api/admin/users', data: { name: 'Test User', email: 'test@example.com' } }
      ],
      student: [
        { method: 'GET', endpoint: '/api/health' },
        { method: 'GET', endpoint: '/api/student/materials' },
        { method: 'GET', endpoint: '/api/student/assignments' },
        { method: 'GET', endpoint: '/api/student/attendance' },
        { method: 'GET', endpoint: '/api/student/fees' }
      ],
      faculty: [
        { method: 'GET', endpoint: '/api/health' },
        { method: 'GET', endpoint: '/api/faculty/assignments' },
        { method: 'GET', endpoint: '/api/faculty/materials' },
        { method: 'GET', endpoint: '/api/faculty/attendance' },
        { method: 'GET', endpoint: '/api/faculty/students' }
      ],
      hod: [
        { method: 'GET', endpoint: '/api/health' },
        { method: 'GET', endpoint: '/api/hod/reports' },
        { method: 'GET', endpoint: '/api/hod/faculty' },
        { method: 'GET', endpoint: '/api/hod/subjects' },
        { method: 'GET', endpoint: '/api/hod/attendance' }
      ]
    }
    
    return actions[role] || actions.student
  }

  async executeAction(action, userId) {
    await this.makeRequest(action.endpoint, action.method, userId, action.data)
  }

  getUserRole(userId) {
    const roles = ['admin', 'student', 'faculty', 'hod']
    const hash = this.hashString(userId)
    return roles[hash % roles.length]
  }

  generateCredentials(userId) {
    const email = `${userId}@test.com`
    const password = 'password123'
    return { email, password }
  }

  async makeRequest(endpoint, method = 'GET', userId = 'anonymous', data = null) {
    const startTime = performance.now()
    const requestId = `${userId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    try {
      const url = new URL(endpoint, this.baseUrl)
      const isHttps = url.protocol === 'https:'
      const client = isHttps ? https : http
      
      const options = {
        hostname: url.hostname,
        port: url.port || (isHttps ? 443 : 80),
        path: url.pathname + url.search,
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': this.userAgents[Math.floor(Math.random() * this.userAgents.length)],
          'X-Request-ID': requestId,
          'X-User-ID': userId,
          'X-Load-Test': 'true'
        }
      }

      return new Promise((resolve, reject) => {
        const req = client.request(options, (res) => {
          let responseData = ''
          
          res.on('data', (chunk) => {
            responseData += chunk
          })
          
          res.on('end', () => {
            const endTime = performance.now()
            const responseTime = endTime - startTime
            
            this.results.totalRequests++
            this.results.responseTimes.push(responseTime)
            
            if (res.statusCode >= 200 && res.statusCode < 300) {
              this.results.successfulRequests++
            } else {
              this.results.failedRequests++
              this.results.errors.push({
                userId,
                endpoint,
                statusCode: res.statusCode,
                error: responseData,
                timestamp: Date.now()
              })
            }
            
            resolve({
              statusCode: res.statusCode,
              responseTime,
              data: responseData,
              requestId
            })
          })
        })

        req.on('error', (error) => {
          const endTime = performance.now()
          const responseTime = endTime - startTime
          
          this.results.totalRequests++
          this.results.failedRequests++
          this.results.responseTimes.push(responseTime)
          this.results.errors.push({
            userId,
            endpoint,
            error: error.message,
            timestamp: Date.now()
          })
          
          reject(error)
        })

        if (data) {
          req.write(JSON.stringify(data))
        }
        
        req.end()
      })
    } catch (error) {
      const endTime = performance.now()
      const responseTime = endTime - startTime
      
      this.results.totalRequests++
      this.results.failedRequests++
      this.results.responseTimes.push(responseTime)
      
      throw error
    }
  }

  startMonitoring() {
    // Monitor concurrency
    setInterval(() => {
      if (this.isRunning) {
        this.results.concurrency.push({
          timestamp: Date.now(),
          activeUsers: this.activeUsers
        })
      }
    }, 1000)

    // Monitor throughput
    let lastRequestCount = 0
    setInterval(() => {
      if (this.isRunning) {
        const currentRequestCount = this.results.totalRequests
        const throughput = currentRequestCount - lastRequestCount
        
        this.results.throughput.push({
          timestamp: Date.now(),
          requestsPerSecond: throughput
        })
        
        lastRequestCount = currentRequestCount
      }
    }, 1000)

    // Monitor system resources
    setInterval(() => {
      if (this.isRunning) {
        const memUsage = process.memoryUsage()
        this.results.memoryUsage.push({
          timestamp: Date.now(),
          rss: Math.round(memUsage.rss / 1024 / 1024), // MB
          heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024), // MB
          heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024) // MB
        })
      }
    }, 5000)
  }

  async waitForCompletion() {
    const endTime = this.startTime + this.duration + this.rampDownTime
    
    while (Date.now() < endTime && this.isRunning) {
      await this.sleep(1000)
      
      // Check if all users have completed
      if (this.activeUsers === 0 && Date.now() > this.startTime + this.duration) {
        break
      }
    }
  }

  generateReport() {
    console.log('\n📊 Load Test Results')
    console.log('='.repeat(60))
    
    const duration = (Date.now() - this.startTime) / 1000
    
    // Basic statistics
    console.log('\n📈 Basic Statistics:')
    console.log(`   Total Duration: ${duration.toFixed(1)} seconds`)
    console.log(`   Total Requests: ${this.results.totalRequests.toLocaleString()}`)
    console.log(`   Successful: ${this.results.successfulRequests.toLocaleString()} (${((this.results.successfulRequests / this.results.totalRequests) * 100).toFixed(2)}%)`)
    console.log(`   Failed: ${this.results.failedRequests.toLocaleString()} (${((this.results.failedRequests / this.results.totalRequests) * 100).toFixed(2)}%)`)
    
    // Response time statistics
    if (this.results.responseTimes.length > 0) {
      const sortedTimes = [...this.results.responseTimes].sort((a, b) => a - b)
      const avgResponseTime = sortedTimes.reduce((sum, time) => sum + time, 0) / sortedTimes.length
      const minResponseTime = sortedTimes[0]
      const maxResponseTime = sortedTimes[sortedTimes.length - 1]
      const p50ResponseTime = sortedTimes[Math.floor(sortedTimes.length * 0.5)]
      const p90ResponseTime = sortedTimes[Math.floor(sortedTimes.length * 0.9)]
      const p95ResponseTime = sortedTimes[Math.floor(sortedTimes.length * 0.95)]
      const p99ResponseTime = sortedTimes[Math.floor(sortedTimes.length * 0.99)]
      
      console.log('\n⏱️  Response Times:')
      console.log(`   Average: ${avgResponseTime.toFixed(2)}ms`)
      console.log(`   Minimum: ${minResponseTime.toFixed(2)}ms`)
      console.log(`   Maximum: ${maxResponseTime.toFixed(2)}ms`)
      console.log(`   50th Percentile: ${p50ResponseTime.toFixed(2)}ms`)
      console.log(`   90th Percentile: ${p90ResponseTime.toFixed(2)}ms`)
      console.log(`   95th Percentile: ${p95ResponseTime.toFixed(2)}ms`)
      console.log(`   99th Percentile: ${p99ResponseTime.toFixed(2)}ms`)
    }
    
    // Throughput analysis
    if (this.results.throughput.length > 0) {
      const avgThroughput = this.results.throughput.reduce((sum, t) => sum + t.requestsPerSecond, 0) / this.results.throughput.length
      const maxThroughput = Math.max(...this.results.throughput.map(t => t.requestsPerSecond))
      
      console.log('\n📊 Throughput:')
      console.log(`   Average: ${avgThroughput.toFixed(1)} requests/second`)
      console.log(`   Peak: ${maxThroughput.toFixed(1)} requests/second`)
      console.log(`   Total: ${this.results.totalRequests.toLocaleString()} requests in ${duration.toFixed(1)}s`)
    }
    
    // Concurrency analysis
    if (this.results.concurrency.length > 0) {
      const maxConcurrency = Math.max(...this.results.concurrency.map(c => c.activeUsers))
      const avgConcurrency = this.results.concurrency.reduce((sum, c) => sum + c.activeUsers, 0) / this.results.concurrency.length
      
      console.log('\n👥 Concurrency:')
      console.log(`   Target: ${this.concurrentUsers.toLocaleString()} users`)
      console.log(`   Achieved: ${maxConcurrency.toLocaleString()} users (${((maxConcurrency / this.concurrentUsers) * 100).toFixed(1)}%)`)
      console.log(`   Average: ${avgConcurrency.toFixed(0)} users`)
    }
    
    // Memory usage
    if (this.results.memoryUsage.length > 0) {
      const maxMemory = Math.max(...this.results.memoryUsage.map(m => m.heapUsed))
      const avgMemory = this.results.memoryUsage.reduce((sum, m) => sum + m.heapUsed, 0) / this.results.memoryUsage.length
      
      console.log('\n💾 Memory Usage:')
      console.log(`   Peak: ${maxMemory} MB`)
      console.log(`   Average: ${avgMemory.toFixed(1)} MB`)
    }
    
    // Error analysis
    if (this.results.errors.length > 0) {
      console.log('\n❌ Error Analysis:')
      const errorSummary = {}
      
      for (const error of this.results.errors) {
        const key = error.error || error.statusCode?.toString() || 'Unknown'
        errorSummary[key] = (errorSummary[key] || 0) + 1
      }
      
      const topErrors = Object.entries(errorSummary)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
      
      for (const [error, count] of topErrors) {
        console.log(`   ${error}: ${count} occurrences (${((count / this.results.errors.length) * 100).toFixed(1)}%)`)
      }
    }
    
    // Performance assessment
    console.log('\n🎯 Performance Assessment:')
    
    const avgResponseTime = this.results.responseTimes.length > 0 
      ? this.results.responseTimes.reduce((sum, time) => sum + time, 0) / this.results.responseTimes.length 
      : 0
    
    const errorRate = this.results.totalRequests > 0 
      ? (this.results.failedRequests / this.results.totalRequests) * 100 
      : 0
    
    const successRate = this.results.totalRequests > 0 
      ? (this.results.successfulRequests / this.results.totalRequests) * 100 
      : 0
    
    // Assess performance based on industry standards
    let performance = 'Unknown'
    if (avgResponseTime < 1000 && errorRate < 1 && successRate > 99) {
      performance = 'Excellent'
    } else if (avgResponseTime < 2000 && errorRate < 5 && successRate > 95) {
      performance = 'Good'
    } else if (avgResponseTime < 5000 && errorRate < 10 && successRate > 90) {
      performance = 'Acceptable'
    } else {
      performance = 'Poor'
    }
    
    console.log(`   Overall Performance: ${performance}`)
    console.log(`   Success Rate: ${successRate.toFixed(2)}%`)
    console.log(`   Error Rate: ${errorRate.toFixed(2)}%`)
    console.log(`   Avg Response Time: ${avgResponseTime.toFixed(2)}ms`)
    
    // Recommendations
    console.log('\n💡 Recommendations:')
    
    if (avgResponseTime > 2000) {
      console.log('   - High response times detected. Consider optimizing database queries and implementing caching.')
    }
    
    if (errorRate > 5) {
      console.log('   - High error rate detected. Review error logs and fix underlying issues.')
    }
    
    if (this.results.errors.some(e => e.statusCode === 429)) {
      console.log('   - Rate limiting is active. Consider adjusting limits if needed.')
    }
    
    if (avgResponseTime < 500 && errorRate < 1) {
      console.log('   - System is performing well. Consider increasing load for further testing.')
    }
    
    const maxConcurrency = Math.max(...this.results.concurrency.map(c => c.activeUsers))
    if (maxConcurrency < this.concurrentUsers * 0.8) {
      console.log('   - Failed to achieve target concurrency. Check system resources and configuration.')
    }
    
    console.log('\n' + '='.repeat(60))
    console.log('✅ 10K User Load Test Completed!')
    
    // Save detailed results to file
    this.saveDetailedResults()
  }

  saveDetailedResults() {
    const fs = require('fs')
    const results = {
      timestamp: new Date().toISOString(),
      configuration: {
        baseUrl: this.baseUrl,
        concurrentUsers: this.concurrentUsers,
        duration: this.duration,
        rampUpTime: this.rampUpTime,
        rampDownTime: this.rampDownTime,
        scenario: this.scenario
      },
      results: this.results,
      summary: {
        duration: (Date.now() - this.startTime) / 1000,
        totalRequests: this.results.totalRequests,
        successfulRequests: this.results.successfulRequests,
        failedRequests: this.results.failedRequests,
        averageResponseTime: this.results.responseTimes.length > 0 
          ? this.results.responseTimes.reduce((sum, time) => sum + time, 0) / this.results.responseTimes.length 
          : 0,
        maxConcurrency: Math.max(...this.results.concurrency.map(c => c.activeUsers)),
        peakThroughput: Math.max(...this.results.throughput.map(t => t.requestsPerSecond))
      }
    }
    
    const filename = `load-test-results-${Date.now()}.json`
    fs.writeFileSync(filename, JSON.stringify(results, null, 2))
    console.log(`\n📄 Detailed results saved to: ${filename}`)
  }

  // Utility functions
  randomBetween(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  hashString(str) {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32-bit integer
    }
    return Math.abs(hash)
  }
}

// Command line argument parsing
function parseArgs() {
  const args = process.argv.slice(2)
  const options = {}
  
  for (let i = 0; i < args.length; i += 2) {
    const key = args[i].replace(/^--/, '')
    const value = args[i + 1]
    
    switch (key) {
      case 'url':
        options.baseUrl = value
        break
      case 'users':
        options.concurrentUsers = parseInt(value)
        break
      case 'duration':
        options.duration = parseInt(value) * 1000
        break
      case 'scenario':
        options.scenario = value
        break
      case 'ramp-up':
        options.rampUpTime = parseInt(value) * 1000
        break
      case 'ramp-down':
        options.rampDownTime = parseInt(value) * 1000
        break
    }
  }
  
  return options
}

// Main execution
if (require.main === module) {
  const options = parseArgs()
  
  console.log('🧪 10K User Load Testing Tool')
  console.log('Usage: node load-test-10k.js [options]')
  console.log('Options:')
  console.log('  --url <url>           Target URL (default: http://localhost:3000)')
  console.log('  --users <number>      Concurrent users (default: 10000)')
  console.log('  --duration <seconds>  Test duration (default: 300)')
  console.log('  --scenario <type>     Scenario: auth, api, mixed, stress (default: mixed)')
  console.log('  --ramp-up <seconds>   Ramp-up time (default: 60)')
  console.log('  --ramp-down <seconds> Ramp-down time (default: 30)')
  console.log('')
  
  const tester = new LoadTester10K(options)
  tester.runTest().catch(console.error)
}

module.exports = LoadTester10K