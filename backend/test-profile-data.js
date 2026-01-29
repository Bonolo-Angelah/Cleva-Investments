const axios = require('axios');
require('dotenv').config();

async function testProfileData() {
  const key = process.env.FMP_API_KEY;
  const symbol = 'AAPL';

  console.log('=== Testing FMP Stable Profile Data ===');
  console.log('Symbol:', symbol);
  console.log('');

  try {
    const url = `https://financialmodelingprep.com/stable/profile?symbol=${symbol}&apikey=${key}`;
    const response = await axios.get(url);
    const data = Array.isArray(response.data) ? response.data[0] : response.data;

    console.log('✓ Profile API: SUCCESS');
    console.log('');
    console.log('=== Available Fields ===');
    console.log('Symbol:', data.symbol);
    console.log('Name:', data.companyName || data.name);
    console.log('Price:', data.price);
    console.log('Market Cap:', data.marketCap);
    console.log('P/E Ratio:', data.pe);
    console.log('EPS:', data.eps);
    console.log('');
    console.log('Description:', data.description?.substring(0, 100) + '...');
    console.log('Sector:', data.sector);
    console.log('Industry:', data.industry);
    console.log('CEO:', data.ceo);
    console.log('Website:', data.website);
    console.log('Country:', data.country);
    console.log('');
    console.log('Dividend Yield:', data.dividendYield);
    console.log('52W High:', data.fiftyTwoWeekHigh || data.yearHigh);
    console.log('52W Low:', data.fiftyTwoWeekLow || data.yearLow);
    console.log('');
    console.log('=== All Fields ===');
    console.log(Object.keys(data).join(', '));

  } catch (error) {
    console.log('✗ Profile API: FAILED');
    console.log('Error:', error.response?.data || error.message);
  }
}

testProfileData();
