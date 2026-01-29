const axios = require('axios');
require('dotenv').config();

async function testQuoteFields() {
  const key = process.env.FMP_API_KEY;
  const symbol = 'AAPL';

  console.log('=== Testing FMP Stable Quote Fields ===');
  console.log('Symbol:', symbol);
  console.log('');

  try {
    const url = `https://financialmodelingprep.com/stable/quote?symbol=${symbol}&apikey=${key}`;
    const response = await axios.get(url);
    const data = Array.isArray(response.data) ? response.data[0] : response.data;

    console.log('✓ Quote API: SUCCESS');
    console.log('');
    console.log('=== Financial Metrics ===');
    console.log('P/E Ratio:', data.pe);
    console.log('EPS:', data.eps);
    console.log('Dividend Yield:', data.dividendYield);
    console.log('52W High:', data.yearHigh);
    console.log('52W Low:', data.yearLow);
    console.log('Day High:', data.dayHigh);
    console.log('Day Low:', data.dayLow);
    console.log('');
    console.log('=== All Fields ===');
    console.log(Object.keys(data).join(', '));

  } catch (error) {
    console.log('✗ Quote API: FAILED');
    console.log('Error:', error.response?.data || error.message);
  }
}

testQuoteFields();
