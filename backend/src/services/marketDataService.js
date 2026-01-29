const axios = require('axios');
const { MarketData } = require('../models/mongodb');
require('dotenv').config();

class MarketDataService {
  constructor() {
    this.alphaVantageKey = process.env.ALPHA_VANTAGE_API_KEY;
    this.fmpKey = process.env.FMP_API_KEY;
    this.finnhubKey = process.env.FINNHUB_API_KEY;
    this.cacheExpiry = 5 * 60 * 1000; // 5 minutes
  }

  /**
   * Get additional stock stats from Yahoo Finance v7 quote endpoint
   */
  async getStockStatsYahoo(symbol) {
    try {
      // Try v7 quote endpoint which includes financial metrics
      const url = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${symbol}`;
      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      });

      const quote = response.data.quoteResponse?.result?.[0];

      if (quote) {
        return {
          pe: quote.trailingPE || quote.forwardPE || null,
          eps: quote.epsTrailingTwelveMonths || null,
          marketCap: quote.marketCap || null
        };
      }

      return { pe: null, eps: null, marketCap: null };
    } catch (error) {
      console.error(`Error fetching Yahoo stats for ${symbol}:`, error.message);
      return { pe: null, eps: null, marketCap: null };
    }
  }

  /**
   * Get stock quote from Yahoo Finance (free, no API key required)
   */
  async getStockQuoteYahoo(symbol) {
    try {
      const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}`;
      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      });
      const result = response.data.chart.result[0];
      const meta = result.meta;
      const quote = result.indicators.quote[0];

      // Try to fetch additional stats from Yahoo (may fail with 401)
      let stats = await this.getStockStatsYahoo(symbol);

      // If Yahoo stats failed (returned nulls), try FMP as fallback
      if (!stats.pe && !stats.marketCap && this.fmpKey) {
        try {
          console.log(`Yahoo stats failed for ${symbol}, trying FMP fallback...`);
          const fmpUrl = `https://financialmodelingprep.com/stable/quote?symbol=${symbol}&apikey=${this.fmpKey}`;
          const fmpResponse = await axios.get(fmpUrl);
          const fmpData = Array.isArray(fmpResponse.data) ? fmpResponse.data[0] : fmpResponse.data;

          if (fmpData) {
            stats = {
              pe: fmpData.pe,
              eps: fmpData.eps,
              marketCap: fmpData.marketCap
            };
          }
        } catch (fmpError) {
          console.error(`FMP fallback also failed for ${symbol}:`, fmpError.message);
        }
      }

      return {
        symbol: meta.symbol,
        name: meta.longName || meta.shortName || symbol,
        price: meta.regularMarketPrice,
        changesPercentage: ((meta.regularMarketPrice - meta.previousClose) / meta.previousClose) * 100,
        change: meta.regularMarketPrice - meta.previousClose,
        dayLow: meta.regularMarketDayLow,
        dayHigh: meta.regularMarketDayHigh,
        yearHigh: meta.fiftyTwoWeekHigh,
        yearLow: meta.fiftyTwoWeekLow,
        marketCap: stats.marketCap || meta.marketCap || null,
        volume: meta.regularMarketVolume,
        exchange: meta.exchangeName,
        pe: stats.pe,
        eps: stats.eps
      };
    } catch (error) {
      console.error(`Error fetching Yahoo quote for ${symbol}:`, error.message);
      throw error;
    }
  }

  /**
   * Get stock quote from Financial Modeling Prep
   */
  async getStockQuote(symbol) {
    try {
      // Try Yahoo Finance first (free, no API key)
      try {
        return await this.getStockQuoteYahoo(symbol);
      } catch (yahooError) {
        console.log(`Yahoo Finance failed for ${symbol}, trying FMP...`);
      }

      // Fallback to FMP (using new stable endpoints)
      const url = `https://financialmodelingprep.com/stable/quote?symbol=${symbol}&apikey=${this.fmpKey}`;
      const response = await axios.get(url);
      const data = Array.isArray(response.data) ? response.data[0] : response.data;

      if (!data) {
        throw new Error(`No data found for symbol: ${symbol}`);
      }

      return {
        symbol: data.symbol,
        name: data.name,
        price: data.price,
        changesPercentage: data.changesPercentage,
        change: data.change,
        dayLow: data.dayLow,
        dayHigh: data.dayHigh,
        yearHigh: data.yearHigh,
        yearLow: data.yearLow,
        marketCap: data.marketCap,
        priceAvg50: data.priceAvg50,
        priceAvg200: data.priceAvg200,
        volume: data.volume,
        avgVolume: data.avgVolume,
        exchange: data.exchange,
        pe: data.pe,
        eps: data.eps
      };
    } catch (error) {
      console.error(`Error fetching quote for ${symbol}:`, error.message);
      throw error;
    }
  }

  /**
   * Get company profile from Yahoo Finance
   */
  async getCompanyProfileYahoo(symbol) {
    try {
      const url = `https://query2.finance.yahoo.com/v10/finance/quoteSummary/${symbol}?modules=assetProfile,summaryProfile`;
      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      });

      const result = response.data.quoteSummary?.result?.[0];
      const profile = result?.assetProfile || result?.summaryProfile || {};

      if (profile) {
        return {
          symbol: symbol,
          name: profile.longBusinessSummary ? symbol : null,
          description: profile.longBusinessSummary || null,
          sector: profile.sector || null,
          industry: profile.industry || null,
          website: profile.website || null,
          ceo: profile.companyOfficers?.[0]?.name || null,
          country: profile.country || null
        };
      }

      return null;
    } catch (error) {
      console.error(`Error fetching Yahoo profile for ${symbol}:`, error.message);
      return null;
    }
  }

  /**
   * Get company profile
   */
  async getCompanyProfile(symbol) {
    try {
      // Try Yahoo Finance first
      const yahooProfile = await this.getCompanyProfileYahoo(symbol);
      if (yahooProfile && yahooProfile.description) {
        return yahooProfile;
      }

      // Fallback to FMP if Yahoo fails (using new stable endpoints)
      if (this.fmpKey) {
        const url = `https://financialmodelingprep.com/stable/profile?symbol=${symbol}&apikey=${this.fmpKey}`;
        const response = await axios.get(url);
        const data = Array.isArray(response.data) ? response.data[0] : response.data;

        if (data) {
          return {
            symbol: data.symbol,
            name: data.companyName,
            description: data.description,
            sector: data.sector,
            industry: data.industry,
            website: data.website,
            ceo: data.ceo,
            country: data.country
          };
        }
      }

      return null;
    } catch (error) {
      console.error(`Error fetching profile for ${symbol}:`, error.message);
      return null;
    }
  }

  /**
   * Get historical performance data
   */
  async getHistoricalPerformance(symbol) {
    try {
      const url = `https://financialmodelingprep.com/api/v3/historical-price-full/${symbol}?apikey=${this.fmpKey}`;
      const response = await axios.get(url);
      const historical = response.data.historical;

      if (!historical || historical.length === 0) {
        return null;
      }

      // Calculate performance metrics
      const today = historical[0];
      const oneWeekAgo = historical[7] || historical[historical.length - 1];
      const oneMonthAgo = historical[30] || historical[historical.length - 1];
      const threeMonthsAgo = historical[90] || historical[historical.length - 1];
      const sixMonthsAgo = historical[180] || historical[historical.length - 1];
      const oneYearAgo = historical[252] || historical[historical.length - 1];

      const calcReturn = (current, past) => {
        return past ? ((current.close - past.close) / past.close) * 100 : null;
      };

      return {
        oneDay: calcReturn(today, historical[1]),
        oneWeek: calcReturn(today, oneWeekAgo),
        oneMonth: calcReturn(today, oneMonthAgo),
        threeMonths: calcReturn(today, threeMonthsAgo),
        sixMonths: calcReturn(today, sixMonthsAgo),
        oneYear: calcReturn(today, oneYearAgo)
      };
    } catch (error) {
      console.error(`Error fetching historical data for ${symbol}:`, error.message);
      return null;
    }
  }

  /**
   * Get key financial ratios
   */
  async getFinancialRatios(symbol) {
    try {
      const url = `https://financialmodelingprep.com/api/v3/ratios/${symbol}?apikey=${this.fmpKey}`;
      const response = await axios.get(url);
      const ratios = response.data[0];

      if (!ratios) return null;

      return {
        debtToEquity: ratios.debtEquityRatio,
        roe: ratios.returnOnEquity,
        currentRatio: ratios.currentRatio,
        quickRatio: ratios.quickRatio,
        dividendYield: ratios.dividendYield
      };
    } catch (error) {
      console.error(`Error fetching ratios for ${symbol}:`, error.message);
      return null;
    }
  }

  /**
   * Fetch and cache complete market data
   */
  async fetchAndCacheMarketData(symbol) {
    try {
      // Check cache first
      const cached = await MarketData.findOne({
        symbol: symbol.toUpperCase(),
        lastUpdated: { $gte: new Date(Date.now() - this.cacheExpiry) }
      });

      if (cached) {
        return cached;
      }

      // Fetch fresh data (skip historical performance and ratios as they may not be available in free tier)
      const [quote, profile] = await Promise.all([
        this.getStockQuote(symbol),
        this.getCompanyProfile(symbol)
      ]);

      // Determine risk level based on available data
      const riskLevel = this.calculateRiskLevel(quote, null);

      const marketData = {
        symbol: symbol.toUpperCase(),
        name: profile?.companyName || profile?.name || quote.name,
        type: 'stock',
        exchange: quote.exchange,
        currentPrice: quote.price,
        priceChange: quote.change,
        priceChangePercent: quote.changesPercentage,
        volume: quote.volume,
        marketCap: quote.marketCap || profile?.marketCap,
        peRatio: quote.pe,
        dividendYield: null, // Not available in FMP free tier
        fiftyTwoWeekHigh: quote.yearHigh,
        fiftyTwoWeekLow: quote.yearLow,
        performance: {}, // Not available in FMP free tier
        riskMetrics: {
          volatility: null,
          beta: null
        },
        fundamentals: {
          eps: quote.eps,
          debtToEquity: null, // Not available in FMP free tier
          roe: null // Not available in FMP free tier
        },
        sector: profile?.sector,
        industry: profile?.industry,
        description: profile?.description,
        ceo: profile?.ceo,
        website: profile?.website,
        country: profile?.country,
        lastUpdated: new Date(),
        dataSource: 'yahoo+fmp'
      };

      // Update or create in database
      const updated = await MarketData.findOneAndUpdate(
        { symbol: symbol.toUpperCase() },
        marketData,
        { upsert: true, new: true }
      );

      return updated;
    } catch (error) {
      console.error(`Error fetching market data for ${symbol}:`, error.message);
      throw error;
    }
  }

  /**
   * Calculate risk level
   */
  calculateRiskLevel(quote, ratios) {
    let riskScore = 0;

    // PE Ratio assessment
    if (quote.pe > 30) riskScore += 2;
    else if (quote.pe > 20) riskScore += 1;

    // Debt to Equity
    if (ratios?.debtToEquity > 2) riskScore += 2;
    else if (ratios?.debtToEquity > 1) riskScore += 1;

    // Market cap (smaller = riskier)
    if (quote.marketCap < 2e9) riskScore += 2;
    else if (quote.marketCap < 10e9) riskScore += 1;

    if (riskScore >= 4) return 'high';
    if (riskScore >= 2) return 'medium';
    return 'low';
  }

  /**
   * Calculate volatility from performance data
   */
  calculateVolatility(performance) {
    if (!performance) return null;

    const returns = Object.values(performance).filter(v => v !== null);
    if (returns.length < 2) return null;

    const mean = returns.reduce((a, b) => a + b, 0) / returns.length;
    const variance = returns.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / returns.length;
    return Math.sqrt(variance);
  }

  /**
   * Search for investments using Yahoo Finance
   */
  async searchInvestmentsYahoo(query, limit = 10) {
    try {
      const url = `https://query2.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(query)}&quotesCount=${limit}&newsCount=0`;
      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      });

      return response.data.quotes.map(item => ({
        symbol: item.symbol,
        name: item.longname || item.shortname,
        currency: item.currency,
        stockExchange: item.exchange,
        exchangeShortName: item.exchDisp
      }));
    } catch (error) {
      console.error('Error searching investments on Yahoo:', error.message);
      throw error;
    }
  }

  /**
   * Search for investments
   */
  async searchInvestments(query, limit = 10) {
    try {
      // Try Yahoo Finance first
      try {
        return await this.searchInvestmentsYahoo(query, limit);
      } catch (yahooError) {
        console.log('Yahoo Finance search failed, trying FMP...');
      }

      // Fallback to FMP
      const url = `https://financialmodelingprep.com/api/v3/search?query=${query}&limit=${limit}&apikey=${this.fmpKey}`;
      const response = await axios.get(url);

      return response.data.map(item => ({
        symbol: item.symbol,
        name: item.name,
        currency: item.currency,
        stockExchange: item.stockExchange,
        exchangeShortName: item.exchangeShortName
      }));
    } catch (error) {
      console.error('Error searching investments:', error.message);
      return [];
    }
  }

  /**
   * Get trending stocks
   */
  async getTrendingStocks(limit = 10) {
    try {
      const url = `https://financialmodelingprep.com/api/v3/stock_market/actives?apikey=${this.fmpKey}`;
      const response = await axios.get(url);

      return response.data.slice(0, limit);
    } catch (error) {
      console.error('Error fetching trending stocks:', error.message);
      return [];
    }
  }

  /**
   * Get top gainers
   */
  async getTopGainers(limit = 10) {
    try {
      const url = `https://financialmodelingprep.com/api/v3/stock_market/gainers?apikey=${this.fmpKey}`;
      const response = await axios.get(url);

      return response.data.slice(0, limit);
    } catch (error) {
      console.error('Error fetching top gainers:', error.message);
      return [];
    }
  }
}

module.exports = new MarketDataService();
