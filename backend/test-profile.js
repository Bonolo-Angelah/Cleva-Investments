const axios = require('axios');

async function testYahooProfile() {
  const symbol = 'AAPL';
  const url = `https://query2.finance.yahoo.com/v10/finance/quoteSummary/${symbol}?modules=assetProfile,summaryProfile`;

  console.log('Testing Yahoo Finance Profile Endpoint');
  console.log('URL:', url);
  console.log('');

  try {
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    const result = response.data.quoteSummary?.result?.[0];
    const profile = result?.assetProfile || result?.summaryProfile || {};

    console.log('=== Company Profile ===');
    console.log('Description:', profile.longBusinessSummary?.substring(0, 100) + '...');
    console.log('Sector:', profile.sector);
    console.log('Industry:', profile.industry);
    console.log('Website:', profile.website);
    console.log('Country:', profile.country);
    console.log('CEO:', profile.companyOfficers?.[0]?.name);
    console.log('');
    console.log('✓ Profile data available!');

  } catch (error) {
    console.error('Error:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
    }
  }
}

testYahooProfile();
