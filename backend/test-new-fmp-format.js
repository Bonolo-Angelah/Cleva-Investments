const axios = require('axios');
require('dotenv').config();

async function testNewFMPFormat() {
  const key = process.env.FMP_API_KEY;

  console.log('=== Testing New FMP API Format ===');
  console.log('Key:', key.substring(0, 15) + '...');
  console.log('');

  // Test different endpoint formats
  const tests = [
    {
      name: 'V3 Quote (legacy)',
      url: `https://financialmodelingprep.com/api/v3/quote/AAPL?apikey=${key}`
    },
    {
      name: 'V4 Quote (new)',
      url: `https://financialmodelingprep.com/api/v4/quote/AAPL?apikey=${key}`
    },
    {
      name: 'Stock Screener',
      url: `https://financialmodelingprep.com/api/v3/stock-screener?marketCapMoreThan=1000000000&limit=1&apikey=${key}`
    },
    {
      name: 'Company Info',
      url: `https://financialmodelingprep.com/api/v4/company-outlook?symbol=AAPL&apikey=${key}`
    }
  ];

  for (const test of tests) {
    try {
      const response = await axios.get(test.url);
      console.log(`✓ ${test.name}: SUCCESS`);
      console.log('  Data sample:', JSON.stringify(response.data).substring(0, 100) + '...');
    } catch (error) {
      console.log(`✗ ${test.name}: FAILED`);
      console.log('  HTTP Status:', error.response?.status);
      const errorMsg = error.response?.data?.['Error Message'] || error.response?.data?.error || error.message;
      console.log('  Error:', errorMsg);
    }
    console.log('');
  }
}

testNewFMPFormat();
