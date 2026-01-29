import React, { useState, useEffect } from 'react';
import { FiSearch, FiTrendingUp, FiTrendingDown, FiRefreshCw, FiActivity } from 'react-icons/fi';
import { marketAPI } from '../services/api';
import { toast } from 'react-toastify';

const Market = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [trending, setTrending] = useState([]);
  const [gainers, setGainers] = useState([]);
  const [selectedStock, setSelectedStock] = useState(null);
  const [isLoadingTrending, setIsLoadingTrending] = useState(false);
  const [isLoadingGainers, setIsLoadingGainers] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(null);

  // Determine currency based on exchange or symbol
  const getCurrencyInfo = (symbol, exchange) => {
    // South African stocks (JSE)
    if (symbol?.endsWith('.JO') || exchange?.includes('JSE') || exchange?.includes('Johannesburg')) {
      return { code: 'ZAR', symbol: 'R' };
    }

    // US stocks (default for most stocks)
    if (exchange?.includes('NASDAQ') || exchange?.includes('NYSE') || exchange?.includes('AMEX') || !exchange) {
      return { code: 'USD', symbol: '$' };
    }

    // UK stocks
    if (exchange?.includes('LSE') || exchange?.includes('London')) {
      return { code: 'GBP', symbol: '£' };
    }

    // European stocks
    if (exchange?.includes('Euronext') || exchange?.includes('Frankfurt') || exchange?.includes('Paris')) {
      return { code: 'EUR', symbol: '€' };
    }

    // Japanese stocks
    if (exchange?.includes('Tokyo') || exchange?.includes('JPX')) {
      return { code: 'JPY', symbol: '¥' };
    }

    // Canadian stocks
    if (exchange?.includes('TSX') || exchange?.includes('Toronto')) {
      return { code: 'CAD', symbol: 'C$' };
    }

    // Australian stocks
    if (exchange?.includes('ASX') || exchange?.includes('Sydney')) {
      return { code: 'AUD', symbol: 'A$' };
    }

    // Default to USD
    return { code: 'USD', symbol: '$' };
  };

  const formatMarketPrice = (price, symbol, exchange) => {
    if (!price && price !== 0) return 'N/A';
    const currency = getCurrencyInfo(symbol, exchange);
    return `${currency.symbol}${parseFloat(price).toFixed(2)}`;
  };

  useEffect(() => {
    loadMarketData();
  }, []);

  const loadMarketData = async () => {
    setIsLoadingTrending(true);
    setIsLoadingGainers(true);

    try {
      const [trendingRes, gainersRes] = await Promise.all([
        marketAPI.getTrending(5),
        marketAPI.getGainers(5)
      ]);

      setTrending(trendingRes.data.trending || []);
      setGainers(gainersRes.data.gainers || []);
      setLastRefresh(new Date());
    } catch (error) {
      toast.error('Failed to load market data');
    } finally {
      setIsLoadingTrending(false);
      setIsLoadingGainers(false);
    }
  };

  const handleRefresh = async () => {
    await loadMarketData();
    toast.success('Market data refreshed');
  };

  const formatVolume = (volume) => {
    if (!volume) return 'N/A';
    if (volume >= 1e9) return `${(volume / 1e9).toFixed(2)}B`;
    if (volume >= 1e6) return `${(volume / 1e6).toFixed(2)}M`;
    if (volume >= 1e3) return `${(volume / 1e3).toFixed(2)}K`;
    return volume.toLocaleString();
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    try {
      const response = await marketAPI.search(searchQuery, 10);
      setSearchResults(response.data.results || []);
    } catch (error) {
      toast.error('Search failed');
    }
  };

  const handleStockClick = async (symbol) => {
    try {
      const response = await marketAPI.getQuote(symbol);
      setSelectedStock(response.data.data);
    } catch (error) {
      toast.error('Failed to load stock details');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Market Explorer</h1>

      {/* Search */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <form onSubmit={handleSearch} className="flex space-x-2">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search stocks, ETFs, or companies..."
            className="flex-1 px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:outline-none"
          />
          <button
            type="submit"
            className="px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition flex items-center space-x-2"
          >
            <FiSearch />
            <span>Search</span>
          </button>
        </form>

        {searchResults.length > 0 && (
          <div className="mt-4 space-y-2">
            {searchResults.map((result, idx) => (
              <div
                key={idx}
                onClick={() => handleStockClick(result.symbol)}
                className="p-3 border rounded-lg hover:border-primary-500 cursor-pointer transition"
              >
                <div className="flex justify-between">
                  <div>
                    <p className="font-semibold text-gray-800">{result.symbol}</p>
                    <p className="text-sm text-gray-500">{result.name}</p>
                  </div>
                  <span className="text-sm text-gray-500">{result.exchangeShortName}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Selected Stock Details */}
      {selectedStock && (() => {
        const currency = getCurrencyInfo(selectedStock.symbol, selectedStock.exchange);
        return (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              {selectedStock.symbol} - {selectedStock.name}
            </h2>
            {selectedStock.exchange && (
              <p className="text-sm text-gray-500 mb-4">Exchange: {selectedStock.exchange}</p>
            )}

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gradient-to-br from-primary-50 to-primary-100 p-4 rounded-lg">
                <p className="text-sm text-primary-700 font-medium">Current Price ({currency.code})</p>
                <p className="text-2xl font-bold text-primary-900">
                  {formatMarketPrice(selectedStock.currentPrice, selectedStock.symbol, selectedStock.exchange)}
                </p>
              </div>
              <div className={`p-4 rounded-lg ${selectedStock.priceChangePercent >= 0 ? 'bg-gradient-to-br from-green-50 to-green-100' : 'bg-gradient-to-br from-red-50 to-red-100'}`}>
                <p className="text-sm font-medium" style={{color: selectedStock.priceChangePercent >= 0 ? '#15803d' : '#991b1b'}}>Change</p>
                <p className={`text-2xl font-bold ${selectedStock.priceChangePercent >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                  {selectedStock.priceChangePercent >= 0 ? '+' : ''}
                  {selectedStock.priceChangePercent?.toFixed(2)}%
                </p>
              </div>
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg">
                <p className="text-sm text-blue-700 font-medium">Market Cap</p>
                <p className="text-lg font-bold text-blue-900">
                  {selectedStock.marketCap
                    ? `${currency.symbol}${(selectedStock.marketCap / 1e9).toFixed(2)}B`
                    : 'N/A'
                  }
                </p>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg">
                <p className="text-sm text-purple-700 font-medium">P/E Ratio</p>
                <p className="text-lg font-bold text-purple-900">{selectedStock.peRatio?.toFixed(2) || 'N/A'}</p>
              </div>
            </div>

            {/* Company Information Section */}
            <div className="mt-6 space-y-4">
              {/* Description */}
              {selectedStock.description && (
                <div className="pt-4 border-t">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">About {selectedStock.name}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{selectedStock.description}</p>
                </div>
              )}

              {/* Company Details Grid */}
              <div className="pt-4 border-t">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Company Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {selectedStock.sector && (
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-xs text-gray-500 font-medium">Sector</p>
                      <p className="text-sm font-semibold text-gray-800 mt-1">{selectedStock.sector}</p>
                    </div>
                  )}
                  {selectedStock.industry && (
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-xs text-gray-500 font-medium">Industry</p>
                      <p className="text-sm font-semibold text-gray-800 mt-1">{selectedStock.industry}</p>
                    </div>
                  )}
                  {selectedStock.country && (
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-xs text-gray-500 font-medium">Country</p>
                      <p className="text-sm font-semibold text-gray-800 mt-1">{selectedStock.country}</p>
                    </div>
                  )}
                  {selectedStock.ceo && (
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-xs text-gray-500 font-medium">CEO</p>
                      <p className="text-sm font-semibold text-gray-800 mt-1">{selectedStock.ceo}</p>
                    </div>
                  )}
                  {selectedStock.website && (
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-xs text-gray-500 font-medium">Website</p>
                      <a
                        href={selectedStock.website.startsWith('http') ? selectedStock.website : `https://${selectedStock.website}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-semibold text-primary-600 hover:text-primary-700 mt-1 block truncate"
                      >
                        {selectedStock.website}
                      </a>
                    </div>
                  )}
                  {selectedStock.volume && (
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-xs text-gray-500 font-medium">Volume</p>
                      <p className="text-sm font-semibold text-gray-800 mt-1">
                        {selectedStock.volume.toLocaleString()}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Trading Range */}
              {(selectedStock.fiftyTwoWeekHigh || selectedStock.fiftyTwoWeekLow) && (
                <div className="pt-4 border-t">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">52-Week Range</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {selectedStock.fiftyTwoWeekLow && (
                      <div className="bg-red-50 p-3 rounded-lg">
                        <p className="text-xs text-red-600 font-medium">52-Week Low</p>
                        <p className="text-lg font-bold text-red-700 mt-1">
                          {formatMarketPrice(selectedStock.fiftyTwoWeekLow, selectedStock.symbol, selectedStock.exchange)}
                        </p>
                      </div>
                    )}
                    {selectedStock.fiftyTwoWeekHigh && (
                      <div className="bg-green-50 p-3 rounded-lg">
                        <p className="text-xs text-green-600 font-medium">52-Week High</p>
                        <p className="text-lg font-bold text-green-700 mt-1">
                          {formatMarketPrice(selectedStock.fiftyTwoWeekHigh, selectedStock.symbol, selectedStock.exchange)}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Additional Metrics */}
              {(selectedStock.dividendYield || selectedStock.fundamentals?.eps || selectedStock.fundamentals?.roe) && (
                <div className="pt-4 border-t">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">Additional Metrics</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {selectedStock.dividendYield && (
                      <div className="bg-purple-50 p-3 rounded-lg">
                        <p className="text-xs text-purple-600 font-medium">Dividend Yield</p>
                        <p className="text-sm font-semibold text-purple-800 mt-1">
                          {(selectedStock.dividendYield * 100).toFixed(2)}%
                        </p>
                      </div>
                    )}
                    {selectedStock.fundamentals?.eps && (
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <p className="text-xs text-blue-600 font-medium">EPS</p>
                        <p className="text-sm font-semibold text-blue-800 mt-1">
                          {currency.symbol}{selectedStock.fundamentals.eps.toFixed(2)}
                        </p>
                      </div>
                    )}
                    {selectedStock.fundamentals?.roe && (
                      <div className="bg-indigo-50 p-3 rounded-lg">
                        <p className="text-xs text-indigo-600 font-medium">ROE</p>
                        <p className="text-sm font-semibold text-indigo-800 mt-1">
                          {(selectedStock.fundamentals.roe * 100).toFixed(2)}%
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })()}

      {/* Market Insights Section Header */}
      <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-lg p-6 mb-6 border border-gray-200">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Real-Time Market Insights</h2>
        <p className="text-gray-600 text-sm">
          Stay informed with live market data. <strong>Trending</strong> shows the top 5 most active investments based on trading volume and market activity.
          <strong> Top Gainers</strong> displays the top 5 highest-gaining investments by percentage price increase.
        </p>
      </div>

      {/* Market Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Trending Section */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <FiActivity className="text-blue-500 w-6 h-6" />
              <h2 className="text-xl font-bold text-gray-800">Trending Now</h2>
            </div>
            <button
              onClick={handleRefresh}
              disabled={isLoadingTrending}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
              title="Refresh market data"
            >
              <FiRefreshCw className={`w-5 h-5 text-gray-600 ${isLoadingTrending ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {lastRefresh && (
            <p className="text-xs text-gray-500 mb-3">
              Last updated: {lastRefresh.toLocaleTimeString()}
            </p>
          )}

          {isLoadingTrending ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : trending.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No trending stocks available</p>
            </div>
          ) : (
            <div className="space-y-2">
              {trending.map((stock, idx) => (
                <div
                  key={idx}
                  onClick={() => handleStockClick(stock.symbol)}
                  className="relative p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:shadow-lg cursor-pointer transition-all duration-200 hover:bg-blue-50"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <p className="font-bold text-gray-800 text-lg">{stock.symbol}</p>
                        <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                          #{idx + 1}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 font-semibold mb-2">
                        {formatMarketPrice(stock.price, stock.symbol, stock.exchange)}
                      </p>
                      <div className="flex items-center space-x-1 text-xs text-gray-500">
                        <FiActivity className="w-3 h-3" />
                        <span>Volume: {formatVolume(stock.volume)}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`inline-flex items-center px-3 py-1 rounded-lg ${stock.changesPercentage >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
                        <span className={`font-bold text-lg ${stock.changesPercentage >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                          {stock.changesPercentage >= 0 ? '+' : ''}
                          {stock.changesPercentage?.toFixed(2)}%
                        </span>
                        {stock.changesPercentage >= 0 ? (
                          <FiTrendingUp className="ml-1 text-green-700" />
                        ) : (
                          <FiTrendingDown className="ml-1 text-red-700" />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top Gainers Section */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <FiTrendingUp className="text-green-500 w-6 h-6" />
              <h2 className="text-xl font-bold text-gray-800">Top Gainers</h2>
            </div>
            <button
              onClick={handleRefresh}
              disabled={isLoadingGainers}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
              title="Refresh market data"
            >
              <FiRefreshCw className={`w-5 h-5 text-gray-600 ${isLoadingGainers ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {lastRefresh && (
            <p className="text-xs text-gray-500 mb-3">
              Last updated: {lastRefresh.toLocaleTimeString()}
            </p>
          )}

          {isLoadingGainers ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
            </div>
          ) : gainers.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No top gainers available</p>
            </div>
          ) : (
            <div className="space-y-2">
              {gainers.map((stock, idx) => (
                <div
                  key={idx}
                  onClick={() => handleStockClick(stock.symbol)}
                  className="relative p-4 border-2 border-gray-200 rounded-lg hover:border-green-500 hover:shadow-lg cursor-pointer transition-all duration-200 hover:bg-green-50"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <p className="font-bold text-gray-800 text-lg">{stock.symbol}</p>
                        <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                          #{idx + 1}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 font-semibold mb-2">
                        {formatMarketPrice(stock.price, stock.symbol, stock.exchange)}
                      </p>
                      {stock.name && (
                        <p className="text-xs text-gray-500 truncate">{stock.name}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="inline-flex items-center px-3 py-2 rounded-lg bg-gradient-to-r from-green-100 to-green-200">
                        <span className="font-bold text-xl text-green-700">
                          +{stock.changesPercentage?.toFixed(2)}%
                        </span>
                        <FiTrendingUp className="ml-1 text-green-700 w-5 h-5" />
                      </div>
                      {stock.change && (
                        <p className="text-xs text-gray-600 mt-1">
                          +{formatMarketPrice(stock.change, stock.symbol, stock.exchange)}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Market;
