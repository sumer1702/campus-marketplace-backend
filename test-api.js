// API Testing Script for Campus Marketplace Backend
// Run this after deployment to test all endpoints

const API_BASE_URL = 'http://localhost:5000'; // Change to Railway URL after deployment

async function testAPI() {
  console.log('🧪 Testing Campus Marketplace Backend API');
  console.log('==========================================');
  
  try {
    // Test 1: Health Check
    console.log('\n1. Testing Health Check...');
    const healthResponse = await fetch(`${API_BASE_URL}/health`);
    const healthData = await healthResponse.json();
    console.log('✅ Health Check:', healthData);
    
    // Test 2: Root Endpoint
    console.log('\n2. Testing Root Endpoint...');
    const rootResponse = await fetch(`${API_BASE_URL}/`);
    const rootData = await rootResponse.json();
    console.log('✅ Root:', rootData);
    
    // Test 3: Protected Endpoints (without auth - should fail)
    console.log('\n3. Testing Protected Endpoints (no auth)...');
    const listingsResponse = await fetch(`${API_BASE_URL}/listings`);
    console.log('Status:', listingsResponse.status, '(should be 401)');
    
    // Test 4: CORS Headers
    console.log('\n4. Testing CORS Headers...');
    const corsResponse = await fetch(`${API_BASE_URL}/health`, {
      method: 'OPTIONS'
    });
    console.log('CORS Status:', corsResponse.status);
    
    console.log('\n🎉 Basic API tests completed!');
    console.log('\nNext: Test with Firebase authentication from frontend');
    
  } catch (error) {
    console.error('❌ API Test Error:', error.message);
  }
}

// Run tests if this script is executed directly
if (typeof window === 'undefined') {
  // Node.js environment
  const fetch = require('node-fetch');
  testAPI();
} else {
  // Browser environment
  window.testAPI = testAPI;
}
