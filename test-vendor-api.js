// Test script to check vendor API
const fetch = require('node-fetch');

async function testVendorAPI() {
  try {
    // First, let's test a simple GET request to see if the API is working
    console.log('Testing GET /api/vendors...');
    
    const getResponse = await fetch('http://localhost:3002/api/vendors', {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer test-token' // This will fail auth but we can see the error
      }
    });
    
    const getData = await getResponse.json();
    console.log('GET Response:', getData);
    
    // Now test POST with form data
    console.log('\nTesting POST /api/vendors...');
    
    const formData = new FormData();
    formData.append('companyType', 'Individual');
    formData.append('individualName', 'Test Vendor');
    formData.append('email', 'test@example.com');
    formData.append('phone', '+1234567890');
    formData.append('address', '123 Test Street');
    formData.append('country', 'United States');
    formData.append('typeOfWork', JSON.stringify(['Patents', 'Trademarks']));
    
    const postResponse = await fetch('http://localhost:3002/api/vendors', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer test-token' // This will fail auth but we can see the error
      },
      body: formData
    });
    
    const postData = await postResponse.json();
    console.log('POST Response:', postData);
    
  } catch (error) {
    console.error('Test error:', error);
  }
}

testVendorAPI();
