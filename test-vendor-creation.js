// Test vendor creation to identify the error
const FormData = require('form-data');
const fetch = require('node-fetch');

async function testVendorCreation() {
  try {
    console.log('Testing vendor creation...');
    
    // Create form data
    const formData = new FormData();
    formData.append('companyType', 'Individual');
    formData.append('individualName', 'Test User ' + Date.now());
    formData.append('email', 'test' + Date.now() + '@example.com');
    formData.append('phone', '+1234567890');
    formData.append('address', '123 Test Street');
    formData.append('country', 'United States');
    formData.append('typeOfWork', JSON.stringify(['Patents', 'Trademarks']));
    formData.append('pointsOfContact', JSON.stringify([]));

    // Test with a dummy token (this will fail auth but we can see the error)
    const response = await fetch('http://localhost:3002/api/vendors', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer dummy-token'
      },
      body: formData
    });

    const data = await response.json();
    
    console.log('Response status:', response.status);
    console.log('Response data:', JSON.stringify(data, null, 2));
    
  } catch (error) {
    console.error('Test error:', error);
  }
}

testVendorCreation();
