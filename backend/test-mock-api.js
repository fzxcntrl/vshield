// Quick test script to verify mock API endpoints are working
const axios = require('axios');

const BASE_URL = 'http://localhost:5001';

async function testMockAPI() {
  console.log('Testing Mock API endpoints...\n');

  // Test Aadhaar - should PASS (ends with 4)
  try {
    console.log('1. Testing Aadhaar (762065200604) - should PASS:');
    const aadhaarPass = await axios.post(`${BASE_URL}/mock-api/aadhaar/verify`, {
      aadhaarNumber: '762065200604'
    });
    console.log('   ✅ Response:', aadhaarPass.data);
  } catch (err) {
    console.log('   ❌ Error:', err.message);
  }

  // Test Aadhaar - should FAIL (ends with 0)
  try {
    console.log('\n2. Testing Aadhaar (762065200600) - should FAIL:');
    const aadhaarFail = await axios.post(`${BASE_URL}/mock-api/aadhaar/verify`, {
      aadhaarNumber: '762065200600'
    });
    console.log('   ✅ Response:', aadhaarFail.data);
  } catch (err) {
    console.log('   ❌ Error:', err.message);
  }

  // Test PAN - should PASS (ends with M)
  try {
    console.log('\n3. Testing PAN (DMEPN2340M) - should PASS:');
    const panPass = await axios.post(`${BASE_URL}/mock-api/pan/verify`, {
      panNumber: 'DMEPN2340M'
    });
    console.log('   ✅ Response:', panPass.data);
  } catch (err) {
    console.log('   ❌ Error:', err.message);
  }

  // Test PAN - should FAIL (ends with Z)
  try {
    console.log('\n4. Testing PAN (DMEPN2340Z) - should FAIL:');
    const panFail = await axios.post(`${BASE_URL}/mock-api/pan/verify`, {
      panNumber: 'DMEPN2340Z'
    });
    console.log('   ✅ Response:', panFail.data);
  } catch (err) {
    console.log('   ❌ Error:', err.message);
  }

  console.log('\n✅ All tests completed!');
}

testMockAPI().catch(console.error);
