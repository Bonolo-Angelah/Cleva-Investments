const axios = require('axios');

async function testChartAPI() {
  const symbol = 'AAPL';
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}`;

  console.log('Testing Yahoo Finance Chart API');
  console.log('URL:', url);
  console.log('');

  try {
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    const result = response.data.chart.result[0];
    const meta = result.meta;

    console.log('=== Meta Data ===');
    console.log('Symbol:', meta.symbol);
    console.log('Price:', meta.regularMarketPrice);
    console.log('Market Cap:', meta.marketCap);
    console.log('Exchange:', meta.exchangeName);
    console.log('Currency:', meta.currency);
    console.log('');
    console.log('Available:', !!meta.marketCap ? '✓ Market Cap Available' : '✗ No Market Cap');

  } catch (error) {
    console.error('Error:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
    }
  }
}

testChartAPI();
