const axios = require('axios');

/**
 * Currency Conversion Service
 * Uses Frankfurter API (free, no API key required)
 * API: https://www.frankfurter.app
 */
class CurrencyService {
  constructor() {
    this.baseURL = 'https://api.frankfurter.app';
    this.cache = new Map(); // Cache exchange rates
    this.cacheExpiry = 60 * 60 * 1000; // 1 hour (rates don't change that frequently)
  }

  /**
   * Get exchange rate from one currency to another
   * @param {string} from - Source currency code (e.g., 'USD')
   * @param {string} to - Target currency code (e.g., 'ZAR')
   * @returns {number} Exchange rate
   */
  async getExchangeRate(from, to) {
    try {
      // If same currency, rate is 1
      if (from === to) return 1;

      // Check cache first
      const cacheKey = `${from}_${to}`;
      const cached = this.cache.get(cacheKey);

      if (cached && Date.now() - cached.timestamp < this.cacheExpiry) {
        return cached.rate;
      }

      // Fetch fresh rate
      const response = await axios.get(`${this.baseURL}/latest`, {
        params: {
          from: from,
          to: to
        }
      });

      const rate = response.data.rates[to];

      // Cache the rate
      this.cache.set(cacheKey, {
        rate,
        timestamp: Date.now()
      });

      return rate;
    } catch (error) {
      console.error(`Error fetching exchange rate ${from} to ${to}:`, error.message);

      // Return cached value if available, even if expired
      const cacheKey = `${from}_${to}`;
      const cached = this.cache.get(cacheKey);
      if (cached) {
        console.log(`Using cached rate for ${from} to ${to}`);
        return cached.rate;
      }

      throw new Error(`Unable to fetch exchange rate from ${from} to ${to}`);
    }
  }

  /**
   * Convert amount from one currency to another
   * @param {number} amount - Amount to convert
   * @param {string} from - Source currency code
   * @param {string} to - Target currency code
   * @returns {number} Converted amount
   */
  async convert(amount, from, to) {
    if (from === to) return amount;

    const rate = await this.getExchangeRate(from, to);
    return amount * rate;
  }

  /**
   * Get multiple exchange rates at once
   * @param {string} base - Base currency
   * @param {string[]} targets - Array of target currencies
   * @returns {Object} Object with currency codes as keys and rates as values
   */
  async getMultipleRates(base, targets) {
    try {
      const response = await axios.get(`${this.baseURL}/latest`, {
        params: {
          from: base,
          to: targets.join(',')
        }
      });

      return response.data.rates;
    } catch (error) {
      console.error('Error fetching multiple exchange rates:', error.message);
      throw error;
    }
  }

  /**
   * Get currency symbol for display
   * @param {string} currencyCode - Currency code (e.g., 'USD', 'ZAR')
   * @returns {string} Currency symbol (e.g., '$', 'R')
   */
  getCurrencySymbol(currencyCode) {
    const symbols = {
      // Major currencies
      'USD': '$', 'EUR': '€', 'GBP': '£', 'JPY': '¥', 'CHF': 'Fr',
      // Africa
      'ZAR': 'R', 'NGN': '₦', 'KES': 'KSh', 'GHS': '₵', 'EGP': 'E£',
      'TZS': 'TSh', 'UGX': 'USh', 'ZWL': 'Z$', 'BWP': 'P', 'ETB': 'Br',
      'MAD': 'DH', 'TND': 'DT',
      // Americas
      'CAD': 'C$', 'BRL': 'R$', 'MXN': '$', 'ARS': '$', 'CLP': '$',
      'COP': '$', 'PEN': 'S/',
      // Asia & Pacific
      'CNY': '¥', 'INR': '₹', 'AUD': 'A$', 'NZD': 'NZ$', 'SGD': 'S$',
      'HKD': 'HK$', 'KRW': '₩', 'THB': '฿', 'MYR': 'RM', 'IDR': 'Rp',
      'PHP': '₱', 'VND': '₫', 'PKR': '₨', 'BDT': '৳',
      // Europe
      'SEK': 'kr', 'NOK': 'kr', 'DKK': 'kr', 'PLN': 'zł', 'TRY': '₺',
      'RUB': '₽',
      // Middle East
      'AED': 'AED', 'SAR': 'SR', 'ILS': '₪'
    };

    return symbols[currencyCode] || currencyCode;
  }

  /**
   * Get currency from country code
   * @param {string} countryCode - ISO country code (e.g., 'ZA', 'US')
   * @returns {string} Currency code (e.g., 'ZAR', 'USD')
   */
  getCurrencyFromCountry(countryCode) {
    const countryToCurrency = {
      // Africa
      'ZA': 'ZAR', 'NG': 'NGN', 'KE': 'KES', 'GH': 'GHS', 'EG': 'EGP',
      'TZ': 'TZS', 'UG': 'UGX', 'ZW': 'ZWL', 'BW': 'BWP', 'ET': 'ETB',
      'MA': 'MAD', 'TN': 'TND',
      // Americas
      'US': 'USD', 'CA': 'CAD', 'BR': 'BRL', 'MX': 'MXN', 'AR': 'ARS',
      'CL': 'CLP', 'CO': 'COP', 'PE': 'PEN',
      // Asia & Pacific
      'CN': 'CNY', 'IN': 'INR', 'JP': 'JPY', 'AU': 'AUD', 'NZ': 'NZD',
      'SG': 'SGD', 'HK': 'HKD', 'KR': 'KRW', 'TH': 'THB', 'MY': 'MYR',
      'ID': 'IDR', 'PH': 'PHP', 'VN': 'VND', 'PK': 'PKR', 'BD': 'BDT',
      // Europe
      'GB': 'GBP', 'CH': 'CHF', 'SE': 'SEK', 'NO': 'NOK', 'DK': 'DKK',
      'PL': 'PLN', 'TR': 'TRY', 'RU': 'RUB',
      'DE': 'EUR', 'FR': 'EUR', 'IT': 'EUR', 'ES': 'EUR', 'NL': 'EUR',
      'AT': 'EUR', 'BE': 'EUR', 'GR': 'EUR', 'PT': 'EUR', 'IE': 'EUR',
      // Middle East
      'AE': 'AED', 'SA': 'SAR', 'IL': 'ILS'
    };

    return countryToCurrency[countryCode] || 'USD';
  }

  /**
   * Get investment's original currency based on symbol
   * @param {string} symbol - Stock symbol (e.g., 'AAPL', 'JSE:ANG')
   * @returns {string} Currency code
   */
  getInvestmentCurrency(symbol) {
    // JSE stocks (Johannesburg Stock Exchange)
    if (symbol.startsWith('JSE:')) {
      return 'ZAR';
    }

    // LSE stocks (London Stock Exchange)
    if (symbol.endsWith('.L') || symbol.startsWith('LSE:')) {
      return 'GBP';
    }

    // TSE stocks (Tokyo Stock Exchange)
    if (symbol.endsWith('.T') || symbol.startsWith('TSE:')) {
      return 'JPY';
    }

    // ASX stocks (Australian Stock Exchange)
    if (symbol.endsWith('.AX') || symbol.startsWith('ASX:')) {
      return 'AUD';
    }

    // Default to USD for US stocks (NYSE, NASDAQ)
    return 'USD';
  }

  /**
   * Format currency value for display
   * @param {number} amount - Amount to format
   * @param {string} currencyCode - Currency code
   * @returns {string} Formatted currency string
   */
  formatCurrency(amount, currencyCode) {
    const symbol = this.getCurrencySymbol(currencyCode);
    const formatted = amount.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });

    return `${symbol}${formatted}`;
  }

  /**
   * Clear exchange rate cache
   */
  clearCache() {
    this.cache.clear();
  }
}

module.exports = new CurrencyService();
