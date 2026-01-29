const axios = require('axios');
require('dotenv').config();

async function testStableFMP() {
  const key = process.env.FMP_API_KEY;

  console.log('=== Testing FMP Stable API Endpoints ===');
  console.log('Key:', key.substring(0, 15) + '...');
  console.log('');

  const tests = [
    {
      name: 'Stable Quote API (AAPL)',
      url: `https://financialmodelingprep.com/stable/quote?symbol=AAPL&apikey=${key}`
    },
    {
      name: 'Stable Profile API (AAPL)',
      url: `https://financialmodelingprep.com/stable/profile?symbol=AAPL&apikey=${key}`
    },
    {
      name: 'Stable Batch Quote (AAPL,MSFT)',
      url: `https://financialmodelingprep.com/stable/batch-quote?symbols=AAPL,MSFT&apikey=${key}`
    }
  ];

  for (const test of tests) {
    try {
      const response = await axios.get(test.url);
      console.log(`✓ ${test.name}: SUCCESS`);

      if (Array.isArray(response.data) && response.data.length > 0) {
        const data = response.data[0];
        console.log('  Symbol:', data.symbol);
        console.log('  Price:', data.price);
        console.log('  Name:', data.name || data.companyName || 'N/A');
      } else if (response.data && typeof response.data === 'object') {
        console.log('  Data available:', Object.keys(response.data).slice(0, 5).join(', '));
      }
    } catch (error) {
      console.log(`✗ ${test.name}: FAILED`);
      console.log('  HTTP Status:', error.response?.status);
      const errorMsg = error.response?.data?.['Error Message'] || error.response?.data?.error || error.message;
      console.log('  Error:', errorMsg);
    }
    console.log('');
  }
}

testStableFMP();
