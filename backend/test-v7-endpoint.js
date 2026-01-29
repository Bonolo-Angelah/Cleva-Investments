const axios = require('axios');

async function testV7Endpoint() {
  const symbol = 'AAPL';
  const url = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${symbol}`;

  console.log('Testing Yahoo Finance V7 Quote Endpoint');
  console.log('URL:', url);
  console.log('');

  try {
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    const quote = response.data.quoteResponse?.result?.[0];

    if (quote) {
      console.log('=== Quote Data ===');
      console.log('Symbol:', quote.symbol);
      console.log('Name:', quote.longName);
      console.log('Price:', quote.regularMarketPrice);
      console.log('');
      console.log('=== Financial Metrics ===');
      console.log('Trailing PE:', quote.trailingPE);
      console.log('Forward PE:', quote.forwardPE);
      console.log('EPS (TTM):', quote.epsTrailingTwelveMonths);
      console.log('Market Cap:', quote.marketCap);
      console.log('');
      console.log('✓ All data available!');
    } else {
      console.log('No quote data found');
    }
  } catch (error) {
    console.error('Error:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
    }
  }
}

testV7Endpoint();
