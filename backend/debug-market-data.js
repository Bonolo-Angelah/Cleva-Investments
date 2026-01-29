const axios = require('axios');
const marketDataService = require('./src/services/marketDataService');

async function debugMarketData() {
  const symbol = 'AAPL';

  // Test getStockStatsYahoo directly
  console.log('=== Testing getStockStatsYahoo ===');
  const stats = await marketDataService.getStockStatsYahoo(symbol);
  console.log('Stats returned:', stats);
  console.log('PE:', stats.pe, 'Type:', typeof stats.pe);
  console.log('Market Cap:', stats.marketCap, 'Type:', typeof stats.marketCap);
  console.log('EPS:', stats.eps, 'Type:', typeof stats.eps);

  // Check condition
  console.log('\n=== Checking Fallback Condition ===');
  console.log('!stats.pe:', !stats.pe);
  console.log('!stats.marketCap:', !stats.marketCap);
  console.log('Has FMP Key:', !!marketDataService.fmpKey);
  console.log('All conditions met:', !stats.pe && !stats.marketCap && !!marketDataService.fmpKey);

  // Test FMP API directly
  if (marketDataService.fmpKey) {
    console.log('\n=== Testing FMP API Directly ===');
    try {
      const fmpUrl = `https://financialmodelingprep.com/api/v3/quote/${symbol}?apikey=${marketDataService.fmpKey}`;
      const response = await axios.get(fmpUrl);
      console.log('FMP Response:', response.data[0]);
    } catch (error) {
      console.error('FMP Error:', error.message, error.response?.status);
    }
  }
}

debugMarketData().catch(console.error);
