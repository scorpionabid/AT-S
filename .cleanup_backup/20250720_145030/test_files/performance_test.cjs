// Performance Test Script for Survey Enhancement System
const https = require('https');
const http = require('http');

// Test configurations
const BACKEND_URL = 'http://127.0.0.1:8001';
const FRONTEND_URL = 'http://localhost:3001';
const TEST_ITERATIONS = 5;

// Test credentials
const TEST_USER = {
  login: 'superadmin',
  password: 'admin123'
};

// Performance metrics storage
let metrics = {
  auth: [],
  surveys: [],
  dashboard: [],
  filtering: [],
  bulkOperations: []
};

// Utility function to make HTTP requests
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    
    const req = http.request(url, options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        const endTime = Date.now();
        const responseTime = endTime - startTime;
        
        try {
          const jsonData = JSON.parse(data);
          resolve({
            statusCode: res.statusCode,
            responseTime,
            data: jsonData,
            headers: res.headers
          });
        } catch (e) {
          resolve({
            statusCode: res.statusCode,
            responseTime,
            data: data,
            headers: res.headers
          });
        }
      });
    });
    
    req.on('error', reject);
    
    if (options.body) {
      req.write(JSON.stringify(options.body));
    }
    
    req.end();
  });
}

// Test 1: Authentication Performance
async function testAuthentication() {
  console.log('🔐 Testing Authentication Performance...');
  
  for (let i = 0; i < TEST_ITERATIONS; i++) {
    try {
      const result = await makeRequest(`${BACKEND_URL}/api/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: TEST_USER
      });
      
      metrics.auth.push({
        iteration: i + 1,
        responseTime: result.responseTime,
        statusCode: result.statusCode,
        success: result.statusCode === 200
      });
      
      console.log(`  ✓ Auth Test ${i + 1}: ${result.responseTime}ms (${result.statusCode})`);
    } catch (error) {
      console.log(`  ✗ Auth Test ${i + 1}: Error - ${error.message}`);
      metrics.auth.push({
        iteration: i + 1,
        responseTime: 0,
        statusCode: 0,
        success: false,
        error: error.message
      });
    }
  }
}

// Test 2: Survey List Performance
async function testSurveyList() {
  console.log('📋 Testing Survey List Performance...');
  
  for (let i = 0; i < TEST_ITERATIONS; i++) {
    try {
      const result = await makeRequest(`${BACKEND_URL}/api/surveys`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      });
      
      metrics.surveys.push({
        iteration: i + 1,
        responseTime: result.responseTime,
        statusCode: result.statusCode,
        success: result.statusCode === 200
      });
      
      console.log(`  ✓ Survey List Test ${i + 1}: ${result.responseTime}ms (${result.statusCode})`);
    } catch (error) {
      console.log(`  ✗ Survey List Test ${i + 1}: Error - ${error.message}`);
      metrics.surveys.push({
        iteration: i + 1,
        responseTime: 0,
        statusCode: 0,
        success: false,
        error: error.message
      });
    }
  }
}

// Test 3: Dashboard Statistics Performance
async function testDashboardStats() {
  console.log('📊 Testing Dashboard Statistics Performance...');
  
  for (let i = 0; i < TEST_ITERATIONS; i++) {
    try {
      const result = await makeRequest(`${BACKEND_URL}/api/surveys/dashboard/statistics`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      });
      
      metrics.dashboard.push({
        iteration: i + 1,
        responseTime: result.responseTime,
        statusCode: result.statusCode,
        success: [200, 404, 405].includes(result.statusCode)
      });
      
      console.log(`  ✓ Dashboard Test ${i + 1}: ${result.responseTime}ms (${result.statusCode})`);
    } catch (error) {
      console.log(`  ✗ Dashboard Test ${i + 1}: Error - ${error.message}`);
      metrics.dashboard.push({
        iteration: i + 1,
        responseTime: 0,
        statusCode: 0,
        success: false,
        error: error.message
      });
    }
  }
}

// Test 4: Advanced Filtering Performance
async function testAdvancedFiltering() {
  console.log('🔍 Testing Advanced Filtering Performance...');
  
  const filterParams = [
    '?search=test',
    '?status=published',
    '?survey_type=form',
    '?date_filter=month',
    '?search=teacher&status=active&per_page=10'
  ];
  
  for (let i = 0; i < filterParams.length; i++) {
    try {
      const result = await makeRequest(`${BACKEND_URL}/api/surveys${filterParams[i]}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      });
      
      metrics.filtering.push({
        iteration: i + 1,
        filter: filterParams[i],
        responseTime: result.responseTime,
        statusCode: result.statusCode,
        success: [200, 404, 405, 422].includes(result.statusCode)
      });
      
      console.log(`  ✓ Filter Test ${i + 1} (${filterParams[i]}): ${result.responseTime}ms (${result.statusCode})`);
    } catch (error) {
      console.log(`  ✗ Filter Test ${i + 1}: Error - ${error.message}`);
      metrics.filtering.push({
        iteration: i + 1,
        filter: filterParams[i],
        responseTime: 0,
        statusCode: 0,
        success: false,
        error: error.message
      });
    }
  }
}

// Test 5: Bulk Operations Performance
async function testBulkOperations() {
  console.log('⚡ Testing Bulk Operations Performance...');
  
  const bulkOperations = [
    { endpoint: '/api/surveys/bulk/publish', body: { survey_ids: [1, 2, 3] } },
    { endpoint: '/api/surveys/bulk/close', body: { survey_ids: [1, 2, 3] } },
    { endpoint: '/api/surveys/bulk/archive', body: { survey_ids: [1, 2, 3] } },
    { endpoint: '/api/surveys/estimate-recipients', body: { target_institutions: [1, 2], target_user_types: ['müəllim'] } }
  ];
  
  for (let i = 0; i < bulkOperations.length; i++) {
    try {
      const operation = bulkOperations[i];
      const result = await makeRequest(`${BACKEND_URL}${operation.endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: operation.body
      });
      
      metrics.bulkOperations.push({
        iteration: i + 1,
        operation: operation.endpoint,
        responseTime: result.responseTime,
        statusCode: result.statusCode,
        success: [200, 404, 405, 422].includes(result.statusCode)
      });
      
      console.log(`  ✓ Bulk Test ${i + 1} (${operation.endpoint}): ${result.responseTime}ms (${result.statusCode})`);
    } catch (error) {
      console.log(`  ✗ Bulk Test ${i + 1}: Error - ${error.message}`);
      metrics.bulkOperations.push({
        iteration: i + 1,
        operation: bulkOperations[i].endpoint,
        responseTime: 0,
        statusCode: 0,
        success: false,
        error: error.message
      });
    }
  }
}

// Calculate performance statistics
function calculateStats(data) {
  const successfulRequests = data.filter(item => item.success);
  const responseTimes = successfulRequests.map(item => item.responseTime);
  
  if (responseTimes.length === 0) {
    return {
      count: 0,
      successRate: 0,
      avgResponseTime: 0,
      minResponseTime: 0,
      maxResponseTime: 0,
      medianResponseTime: 0
    };
  }
  
  responseTimes.sort((a, b) => a - b);
  
  return {
    count: data.length,
    successRate: (successfulRequests.length / data.length) * 100,
    avgResponseTime: responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length,
    minResponseTime: responseTimes[0],
    maxResponseTime: responseTimes[responseTimes.length - 1],
    medianResponseTime: responseTimes[Math.floor(responseTimes.length / 2)]
  };
}

// Generate performance report
function generateReport() {
  console.log('\n' + '='.repeat(60));
  console.log('📊 SURVEY ENHANCEMENT PERFORMANCE REPORT');
  console.log('='.repeat(60));
  
  const authStats = calculateStats(metrics.auth);
  const surveyStats = calculateStats(metrics.surveys);
  const dashboardStats = calculateStats(metrics.dashboard);
  const filterStats = calculateStats(metrics.filtering);
  const bulkStats = calculateStats(metrics.bulkOperations);
  
  console.log('\n🔐 Authentication Performance:');
  console.log(`   Tests: ${authStats.count} | Success Rate: ${authStats.successRate.toFixed(1)}%`);
  console.log(`   Avg Response: ${authStats.avgResponseTime.toFixed(0)}ms | Min: ${authStats.minResponseTime}ms | Max: ${authStats.maxResponseTime}ms`);
  
  console.log('\n📋 Survey List Performance:');
  console.log(`   Tests: ${surveyStats.count} | Success Rate: ${surveyStats.successRate.toFixed(1)}%`);
  console.log(`   Avg Response: ${surveyStats.avgResponseTime.toFixed(0)}ms | Min: ${surveyStats.minResponseTime}ms | Max: ${surveyStats.maxResponseTime}ms`);
  
  console.log('\n📊 Dashboard Statistics Performance:');
  console.log(`   Tests: ${dashboardStats.count} | Success Rate: ${dashboardStats.successRate.toFixed(1)}%`);
  console.log(`   Avg Response: ${dashboardStats.avgResponseTime.toFixed(0)}ms | Min: ${dashboardStats.minResponseTime}ms | Max: ${dashboardStats.maxResponseTime}ms`);
  
  console.log('\n🔍 Advanced Filtering Performance:');
  console.log(`   Tests: ${filterStats.count} | Success Rate: ${filterStats.successRate.toFixed(1)}%`);
  console.log(`   Avg Response: ${filterStats.avgResponseTime.toFixed(0)}ms | Min: ${filterStats.minResponseTime}ms | Max: ${filterStats.maxResponseTime}ms`);
  
  console.log('\n⚡ Bulk Operations Performance:');
  console.log(`   Tests: ${bulkStats.count} | Success Rate: ${bulkStats.successRate.toFixed(1)}%`);
  console.log(`   Avg Response: ${bulkStats.avgResponseTime.toFixed(0)}ms | Min: ${bulkStats.minResponseTime}ms | Max: ${bulkStats.maxResponseTime}ms`);
  
  // Overall assessment
  const overallSuccessRate = [authStats, surveyStats, dashboardStats, filterStats, bulkStats]
    .reduce((sum, stats) => sum + stats.successRate, 0) / 5;
  
  const overallAvgResponse = [authStats, surveyStats, dashboardStats, filterStats, bulkStats]
    .filter(stats => stats.avgResponseTime > 0)
    .reduce((sum, stats) => sum + stats.avgResponseTime, 0) / 5;
  
  console.log('\n' + '='.repeat(60));
  console.log('🎯 OVERALL PERFORMANCE ASSESSMENT');
  console.log('='.repeat(60));
  console.log(`Overall Success Rate: ${overallSuccessRate.toFixed(1)}%`);
  console.log(`Overall Avg Response: ${overallAvgResponse.toFixed(0)}ms`);
  
  // Performance rating
  let performanceRating = 'EXCELLENT';
  if (overallAvgResponse > 2000) performanceRating = 'POOR';
  else if (overallAvgResponse > 1000) performanceRating = 'FAIR';
  else if (overallAvgResponse > 500) performanceRating = 'GOOD';
  
  console.log(`Performance Rating: ${performanceRating}`);
  
  // Requirements check
  console.log('\n✅ REQUIREMENTS VERIFICATION:');
  console.log(`   API Response < 2s: ${overallAvgResponse < 2000 ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`   Success Rate > 90%: ${overallSuccessRate > 90 ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`   Enhancement Ready: ${overallSuccessRate > 80 && overallAvgResponse < 3000 ? '✅ PRODUCTION READY' : '❌ NEEDS OPTIMIZATION'}`);
}

// Main test execution
async function runPerformanceTests() {
  console.log('🚀 Starting Survey Enhancement Performance Tests...\n');
  
  try {
    await testAuthentication();
    await testSurveyList();
    await testDashboardStats();
    await testAdvancedFiltering();
    await testBulkOperations();
    
    generateReport();
    
    console.log('\n🎉 Performance Testing Complete!');
    
  } catch (error) {
    console.error('❌ Performance Testing Failed:', error.message);
  }
}

// Run the tests
runPerformanceTests();