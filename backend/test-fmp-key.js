const axios = require('axios');
require('dotenv').config();

async function testFMPKey() {
  const key = process.env.FMP_API_KEY;

  console.log('=== Testing FMP API Key ===');
  console.log('Key:', key.substring(0, 15) + '...');
  console.log('');

  const tests = [
    { name: 'Quote API (AAPL)', url: `https://financialmodelingprep.com/api/v3/quote/AAPL?apikey=${key}` },
    { name: 'Profile API (AAPL)', url: `https://financialmodelingprep.com/api/v3/profile/AAPL?apikey=${key}` },
    { name: 'API Limit Check', url: `https://financialmodelingprep.com/api/v3/key-status?apikey=${key}` }
  ];

  for (const test of tests) {
    try {
      const response = await axios.get(test.url);
      console.log(`✓ ${test.name}: SUCCESS`);

      if (test.name.includes('Limit')) {
        console.log('  Status:', JSON.stringify(response.data, null, 2));
      } else {
        console.log('  Data available: YES');
      }
    } catch (error) {
      console.log(`✗ ${test.name}: FAILED`);
      console.log('  HTTP Status:', error.response?.status);
      console.log('  Error:', JSON.stringify(error.response?.data || error.message, null, 2));
    }
    console.log('');
  }
}

testFMPKey();
