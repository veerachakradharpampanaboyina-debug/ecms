const { performance } = require('perf_hooks');
const https = require('https');

class LoadTester {
  constructor(options = {}) {
    this.baseUrl = options.baseUrl || 'http://localhost:3000';
    this.concurrentUsers = options.concurrentUsers || 10;
    this.duration = options.duration || 30000; // 30 seconds
    this.requests = [];
    this.results = {
      total: 0,
      successful: 0,
      failed: 0,
      responseTimes: [],
      statusCodes: {},
      errors: []
    };
  }

  async makeRequest(endpoint, method = 'GET', data = null, headers = {}) {
    const startTime = performance.now();
    const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    try {
      const url = new URL(endpoint, this.baseUrl);
      const options = {
        hostname: url.hostname,
        port: url.port || (url.protocol === 'https:' ? 443 : 80),
        path: url.pathname + url.search,
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'LoadTester/1.0',
          'X-Request-ID': requestId,
          ...headers
        }
      };

      return new Promise((resolve, reject) => {
        const req = https.request(options, (res) => {
          let responseData = '';
          
          res.on('data', (chunk) => {
            responseData += chunk;
          });
          
          res.on('end', () => {
            const endTime = performance.now();
            const responseTime = endTime - startTime;
            
            this.results.total++;
            this.results.responseTimes.push(responseTime);
            this.results.statusCodes[res.statusCode] = (this.results.statusCodes[res.statusCode] || 0) + 1;
            
            if (res.statusCode >= 200 && res.statusCode < 300) {
              this.results.successful++;
            } else {
              this.results.failed++;
              this.results.errors.push({
                requestId,
                statusCode: res.statusCode,
                error: responseData,
                timestamp: new Date().toISOString()
              });
            }
            
            resolve({
              statusCode: res.statusCode,
              responseTime,
              data: responseData,
              requestId
            });
          });
        });

        req.on('error', (error) => {
          const endTime = performance.now();
          const responseTime = endTime - startTime;
          
          this.results.total++;
          this.results.failed++;
          this.results.responseTimes.push(responseTime);
          this.results.errors.push({
            requestId,
            error: error.message,
            timestamp: new Date().toISOString()
          });
          
          reject(error);
        });

        if (data) {
          req.write(JSON.stringify(data));
        }
        
        req.end();
      });
    } catch (error) {
      const endTime = performance.now();
      const responseTime = endTime - startTime;
      
      this.results.total++;
      this.results.failed++;
      this.results.responseTimes.push(responseTime);
      this.results.errors.push({
        requestId,
        error: error.message,
        timestamp: new Date().toISOString()
      });
      
      throw error;
    }
  }

  async testAuthentication() {
    const authTests = [
      {
        name: 'Health Check',
        endpoint: '/api/health',
        method: 'GET'
      },
      {
        name: 'Login Attempt',
        endpoint: '/api/auth/callback/credentials',
        method: 'POST',
        data: {
          email: 'admin@college.edu',
          password: 'password123'
        }
      },
      {
        name: 'Invalid Login',
        endpoint: '/api/auth/callback/credentials',
        method: 'POST',
        data: {
          email: 'invalid@example.com',
          password: 'wrongpassword'
        }
      }
    ];

    console.log('🔐 Running Authentication Tests...\n');

    for (const test of authTests) {
      console.log(`Testing: ${test.name}`);
      try {
        const result = await this.makeRequest(test.endpoint, test.method, test.data);
        console.log(`  ✅ Status: ${result.statusCode}, Time: ${result.responseTime.toFixed(2)}ms`);
      } catch (error) {
        console.log(`  ❌ Error: ${error.message}`);
      }
    }
  }

  async simulateUser() {
    const endpoints = [
      { path: '/api/health', weight: 0.3 },
      { path: '/api/admin/settings', weight: 0.1 },
      { path: '/api/admin/users', weight: 0.1 },
      { path: '/api/admin/monitoring', weight: 0.2 },
      { path: '/api/student/materials', weight: 0.1 },
      { path: '/api/faculty/assignments', weight: 0.1 },
      { path: '/api/hod/reports', weight: 0.1 }
    ];

    const getRandomEndpoint = () => {
      const random = Math.random();
      let cumulative = 0;
      
      for (const endpoint of endpoints) {
        cumulative += endpoint.weight;
        if (random <= cumulative) {
          return endpoint.path;
        }
      }
      
      return endpoints[0].path;
    };

    const startTime = Date.now();
    const endTime = startTime + this.duration;

    while (Date.now() < endTime) {
      try {
        const endpoint = getRandomEndpoint();
        await this.makeRequest(endpoint);
        
        // Random delay between requests (100ms to 1s)
        await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 900));
      } catch (error) {
        console.error(`User request failed: ${error.message}`);
      }
    }
  }

  async runLoadTest() {
    console.log('🚀 Starting Load Test...\n');
    console.log(`📊 Configuration:`);
    console.log(`   - Base URL: ${this.baseUrl}`);
    console.log(`   - Concurrent Users: ${this.concurrentUsers}`);
    console.log(`   - Duration: ${this.duration / 1000} seconds\n`);

    // Run authentication tests first
    await this.testAuthentication();
    console.log('\n' + '='.repeat(50) + '\n');

    // Start concurrent users
    console.log(`👥 Starting ${this.concurrentUsers} concurrent users...\n`);
    
    const userPromises = [];
    for (let i = 0; i < this.concurrentUsers; i++) {
      userPromises.push(this.simulateUser());
    }

    // Wait for all users to complete
    await Promise.all(userPromises);

    // Generate report
    this.generateReport();
  }

  generateReport() {
    console.log('\n📊 Load Test Results\n');
    console.log('='.repeat(50));

    // Basic statistics
    console.log('\n📈 Basic Statistics:');
    console.log(`   Total Requests: ${this.results.total}`);
    console.log(`   Successful: ${this.results.successful} (${((this.results.successful / this.results.total) * 100).toFixed(1)}%)`);
    console.log(`   Failed: ${this.results.failed} (${((this.results.failed / this.results.total) * 100).toFixed(1)}%)`);

    // Response time statistics
    if (this.results.responseTimes.length > 0) {
      const sortedTimes = [...this.results.responseTimes].sort((a, b) => a - b);
      const avgResponseTime = sortedTimes.reduce((sum, time) => sum + time, 0) / sortedTimes.length;
      const minResponseTime = sortedTimes[0];
      const maxResponseTime = sortedTimes[sortedTimes.length - 1];
      const p95ResponseTime = sortedTimes[Math.floor(sortedTimes.length * 0.95)];
      const p99ResponseTime = sortedTimes[Math.floor(sortedTimes.length * 0.99)];

      console.log('\n⏱️  Response Times:');
      console.log(`   Average: ${avgResponseTime.toFixed(2)}ms`);
      console.log(`   Minimum: ${minResponseTime.toFixed(2)}ms`);
      console.log(`   Maximum: ${maxResponseTime.toFixed(2)}ms`);
      console.log(`   95th Percentile: ${p95ResponseTime.toFixed(2)}ms`);
      console.log(`   99th Percentile: ${p99ResponseTime.toFixed(2)}ms`);
    }

    // Status code distribution
    console.log('\n📋 Status Code Distribution:');
    for (const [statusCode, count] of Object.entries(this.results.statusCodes)) {
      console.log(`   ${statusCode}: ${count} (${((count / this.results.total) * 100).toFixed(1)}%)`);
    }

    // Errors
    if (this.results.errors.length > 0) {
      console.log('\n❌ Errors:');
      const errorSummary = {};
      
      for (const error of this.results.errors) {
        const errorMessage = error.error || error.statusCode?.toString() || 'Unknown error';
        errorSummary[errorMessage] = (errorSummary[errorMessage] || 0) + 1;
      }

      for (const [errorMessage, count] of Object.entries(errorSummary).sort((a, b) => b[1] - a[1]).slice(0, 5)) {
        console.log(`   ${errorMessage}: ${count} occurrences`);
      }
    }

    // Performance assessment
    console.log('\n🎯 Performance Assessment:');
    
    const avgResponseTime = this.results.responseTimes.length > 0 
      ? this.results.responseTimes.reduce((sum, time) => sum + time, 0) / this.results.responseTimes.length 
      : 0;
    
    const errorRate = this.results.total > 0 ? (this.results.failed / this.results.total) * 100 : 0;
    
    if (avgResponseTime < 1000 && errorRate < 1) {
      console.log('   ✅ Excellent performance');
    } else if (avgResponseTime < 2000 && errorRate < 5) {
      console.log('   ✅ Good performance');
    } else if (avgResponseTime < 5000 && errorRate < 10) {
      console.log('   ⚠️  Acceptable performance');
    } else {
      console.log('   ❌ Poor performance - needs optimization');
    }

    // Recommendations
    console.log('\n💡 Recommendations:');
    
    if (avgResponseTime > 2000) {
      console.log('   - High response times detected. Consider optimizing database queries.');
    }
    
    if (errorRate > 5) {
      console.log('   - High error rate detected. Review error logs and fix underlying issues.');
    }
    
    if (this.results.statusCodes['429'] > 0) {
      console.log('   - Rate limiting is working. Consider adjusting limits if needed.');
    }
    
    if (avgResponseTime < 500 && errorRate < 1) {
      console.log('   - System is performing well. Consider increasing load for further testing.');
    }

    console.log('\n' + '='.repeat(50));
    console.log('✅ Load test completed!\n');
  }
}

// Run the load test
if (require.main === module) {
  const tester = new LoadTester({
    baseUrl: process.env.BASE_URL || 'http://localhost:3000',
    concurrentUsers: parseInt(process.env.CONCURRENT_USERS) || 10,
    duration: parseInt(process.env.DURATION) || 30000
  });

  tester.runLoadTest().catch(console.error);
}

module.exports = LoadTester;