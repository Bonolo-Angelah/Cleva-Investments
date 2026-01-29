/**
 * Currency utility functions for displaying and formatting currencies
 */

export const currencySymbols = {
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

/**
 * Get currency symbol for a given currency code
 * @param {string} currencyCode - ISO currency code (e.g., 'USD', 'ZAR')
 * @returns {string} Currency symbol
 */
export const getCurrencySymbol = (currencyCode) => {
  return currencySymbols[currencyCode] || currencyCode;
};

/**
 * Format a number as currency
 * @param {number} amount - Amount to format
 * @param {string} currencyCode - ISO currency code
 * @param {number} decimals - Number of decimal places (default: 2)
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount, currencyCode, decimals = 2) => {
  if (amount === null || amount === undefined) return 'N/A';

  const symbol = getCurrencySymbol(currencyCode);
  const formatted = parseFloat(amount).toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });

  return `${symbol}${formatted}`;
};

/**
 * Format dual currency as string (for simple display)
 * @param {number} originalAmount - Amount in original currency
 * @param {string} originalCurrency - Original currency code
 * @param {number} convertedAmount - Amount in user's currency
 * @param {string} userCurrency - User's currency code
 * @returns {string} Formatted dual currency string
 */
export const formatDualCurrencyString = (originalAmount, originalCurrency, convertedAmount, userCurrency) => {
  if (originalCurrency === userCurrency) {
    return formatCurrency(originalAmount, originalCurrency);
  }

  const original = formatCurrency(originalAmount, originalCurrency);
  const converted = formatCurrency(convertedAmount, userCurrency);

  return `${converted} (${original})`;
};
