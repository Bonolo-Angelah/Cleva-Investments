const axios = require('axios');

async function testYahooFinanceAPI() {
  const symbol = 'AAPL';
  const url = `https://query2.finance.yahoo.com/v10/finance/quoteSummary/${symbol}?modules=defaultKeyStatistics,summaryDetail`;

  console.log('Testing Yahoo Finance Quote Summary API...');
  console.log('URL:', url);
  console.log('');

  try {
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    const result = response.data.quoteSummary.result[0];
    const keyStats = result.defaultKeyStatistics || {};
    const summaryDetail = result.summaryDetail || {};

    console.log('=== Key Statistics ===');
    console.log('Trailing PE:', keyStats.trailingPE);
    console.log('Forward PE:', keyStats.forwardPE);
    console.log('Trailing EPS:', keyStats.trailingEps);
    console.log('');

    console.log('=== Summary Detail ===');
    console.log('Market Cap:', summaryDetail.marketCap);
    console.log('Trailing PE:', summaryDetail.trailingPE);
    console.log('Forward PE:', summaryDetail.forwardPE);
    console.log('');

    // Check what we're extracting
    console.log('=== Extracted Values ===');
    console.log('PE (extracted):', keyStats.trailingPE?.raw || summaryDetail.trailingPE?.raw || null);
    console.log('EPS (extracted):', keyStats.trailingEps?.raw || null);
    console.log('Market Cap (extracted):', summaryDetail.marketCap?.raw || null);

  } catch (error) {
    console.error('Error:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Status Text:', error.response.statusText);
    }
  }
}

testYahooFinanceAPI();
