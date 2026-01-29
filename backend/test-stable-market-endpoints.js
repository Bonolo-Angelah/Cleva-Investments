const axios = require('axios');
require('dotenv').config();

async function testMarketEndpoints() {
  const key = process.env.FMP_API_KEY;

  console.log('=== Testing FMP Stable Market Endpoints ===');
  console.log('Key:', key.substring(0, 15) + '...');
  console.log('');

  const tests = [
    {
      name: 'Search (old v3)',
      url: `https://financialmodelingprep.com/api/v3/search?query=apple&limit=5&apikey=${key}`
    },
    {
      name: 'Search (stable)',
      url: `https://financialmodelingprep.com/stable/search?query=apple&limit=5&apikey=${key}`
    },
    {
      name: 'Stock Screener (could replace trending)',
      url: `https://financialmodelingprep.com/stable/stock-screener?volumeMoreThan=1000000&limit=5&apikey=${key}`
    },
    {
      name: 'Actives/Trending (old v3)',
      url: `https://financialmodelingprep.com/api/v3/stock_market/actives?apikey=${key}`
    },
    {
      name: 'Gainers (old v3)',
      url: `https://financialmodelingprep.com/api/v3/stock_market/gainers?apikey=${key}`
    }
  ];

  for (const test of tests) {
    try {
      const response = await axios.get(test.url);
      console.log(`✓ ${test.name}: SUCCESS`);

      if (Array.isArray(response.data) && response.data.length > 0) {
        console.log(`  Results: ${response.data.length} items`);
        const first = response.data[0];
        console.log('  First item:', first.symbol || first.Symbol, '-', first.name || first.Name || 'N/A');
      }
    } catch (error) {
      console.log(`✗ ${test.name}: FAILED`);
      console.log('  HTTP Status:', error.response?.status);
      const errorMsg = error.response?.data?.['Error Message'] || error.response?.data?.error || error.message;
      console.log('  Error:', typeof errorMsg === 'string' ? errorMsg.substring(0, 100) : errorMsg);
    }
    console.log('');
  }
}

testMarketEndpoints();
