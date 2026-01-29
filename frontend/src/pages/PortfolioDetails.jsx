import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { portfolioAPI, marketAPI } from '../services/api';
import { useAuthStore } from '../utils/store';
import { formatCurrency, getCurrencySymbol } from '../utils/currency';
import {
  FiArrowLeft,
  FiRefreshCw,
  FiPlus,
  FiTrendingUp,
  FiTrendingDown,
  FiDollarSign,
  FiPieChart,
  FiActivity,
  FiCalendar,
  FiBarChart2,
  FiTrash2
} from 'react-icons/fi';

const PortfolioDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const userCurrency = user?.currency || 'USD';
  const [portfolio, setPortfolio] = useState(null);
  const [performance, setPerformance] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddTransaction, setShowAddTransaction] = useState(false);
  const [activeTab, setActiveTab] = useState('holdings'); // holdings, transactions, analytics
  const [transactionForm, setTransactionForm] = useState({
    symbol: '',
    name: '',
    type: 'buy',
    quantity: '',
    price: '',
    fees: '0',
    notes: ''
  });
  const [searchResults, setSearchResults] = useState([]);

  useEffect(() => {
    loadPortfolio();
    loadPerformance();
    loadTransactions();
  }, [id]);

  const loadPortfolio = async () => {
    try {
      const response = await portfolioAPI.getPortfolio(id);
      setPortfolio(response.data.portfolio);
    } catch (error) {
      toast.error('Failed to load portfolio');
    } finally {
      setIsLoading(false);
    }
  };

  const loadPerformance = async () => {
    try {
      const response = await portfolioAPI.getPerformance(id);
      setPerformance(response.data);
    } catch (error) {
      console.error('Failed to load performance');
    }
  };

  const loadTransactions = async () => {
    try {
      const response = await portfolioAPI.getTransactions(id);
      setTransactions(response.data.transactions);
    } catch (error) {
      console.error('Failed to load transactions');
    }
  };

  const handleRefreshPrices = async () => {
    try {
      await portfolioAPI.refreshPrices(id);
      toast.success('Prices updated!');
      loadPortfolio();
      loadPerformance();
    } catch (error) {
      toast.error('Failed to refresh prices');
    }
  };

  const searchSymbol = async (query) => {
    if (query.length < 1) {
      setSearchResults([]);
      return;
    }
    try {
      const response = await marketAPI.search(query, 5);
      setSearchResults(response.data.results || []);
    } catch (error) {
      console.error('Search failed');
    }
  };

  const selectSymbol = (result) => {
    setTransactionForm({
      ...transactionForm,
      symbol: result.symbol,
      name: result.name
    });
    setSearchResults([]);
  };

  const handleAddTransaction = async (e) => {
    e.preventDefault();
    try {
      await portfolioAPI.addTransaction(id, transactionForm);
      toast.success('Transaction added successfully!');
      setShowAddTransaction(false);
      setTransactionForm({
        symbol: '',
        name: '',
        type: 'buy',
        quantity: '',
        price: '',
        fees: '0',
        notes: ''
      });
      loadPortfolio();
      loadPerformance();
      loadTransactions();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to add transaction');
    }
  };

  const handleDeletePortfolio = async () => {
    if (!window.confirm(`Are you sure you want to delete "${portfolio.name}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await portfolioAPI.deletePortfolio(id);
      toast.success('Portfolio deleted successfully');
      navigate('/portfolios');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to delete portfolio');
    }
  };

  // Calculate sector allocation
  const getSectorAllocation = () => {
    if (!portfolio?.holdings) return [];
    const sectorMap = {};

    portfolio.holdings.forEach(holding => {
      const sector = holding.sector || 'Other';
      const value = holding.currentValue || holding.totalCost || 0;
      sectorMap[sector] = (sectorMap[sector] || 0) + parseFloat(value);
    });

    return Object.entries(sectorMap)
      .map(([sector, value]) => ({ sector, value }))
      .sort((a, b) => b.value - a.value);
  };

  // Calculate top performers
  const getTopPerformers = () => {
    if (!portfolio?.holdings) return [];
    return [...portfolio.holdings]
      .filter(h => h.gainLossPercent != null)
      .sort((a, b) => parseFloat(b.gainLossPercent) - parseFloat(a.gainLossPercent))
      .slice(0, 5);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading portfolio...</p>
        </div>
      </div>
    );
  }

  if (!portfolio) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FiPieChart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600 mb-4">Portfolio not found</p>
          <Link to="/portfolios" className="text-primary-500 hover:underline">
            Back to Portfolios
          </Link>
        </div>
      </div>
    );
  }

  const sectorAllocation = getSectorAllocation();
  const topPerformers = getTopPerformers();
  const totalValue = performance?.performance?.totalValue || 0;
  const totalInvested = performance?.performance?.totalInvested || 0;
  const totalGain = performance?.performance?.totalGain || 0;
  const totalGainPercent = performance?.performance?.totalGainPercent || 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white border-b shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                to="/portfolios"
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Back to portfolios"
              >
                <FiArrowLeft className="w-6 h-6 text-gray-600" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">{portfolio.name}</h1>
                {portfolio.description && (
                  <p className="text-sm text-gray-500 mt-1">{portfolio.description}</p>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleRefreshPrices}
                className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
              >
                <FiRefreshCw className="w-4 h-4" />
                <span className="hidden md:inline">Refresh</span>
              </button>
              <button
                onClick={() => setShowAddTransaction(true)}
                className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors shadow-sm"
              >
                <FiPlus className="w-4 h-4" />
                <span className="hidden md:inline">Add Transaction</span>
              </button>
              <button
                onClick={handleDeletePortfolio}
                className="flex items-center gap-2 px-4 py-2 text-red-600 bg-white border border-red-300 rounded-lg hover:bg-red-50 transition-colors shadow-sm"
                title="Delete portfolio"
              >
                <FiTrash2 className="w-4 h-4" />
                <span className="hidden md:inline">Delete</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* Performance Overview Cards */}
        {performance && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {/* Total Value */}
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
              <div className="flex items-center justify-between mb-2">
                <p className="text-blue-100 text-sm font-medium">Total Value</p>
                <FiDollarSign className="w-5 h-5 text-blue-200" />
              </div>
              <p className="text-3xl font-bold">
                R{parseFloat(totalValue).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>

            {/* Total Invested */}
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
              <div className="flex items-center justify-between mb-2">
                <p className="text-purple-100 text-sm font-medium">Total Invested</p>
                <FiBarChart2 className="w-5 h-5 text-purple-200" />
              </div>
              <p className="text-3xl font-bold">
                R{parseFloat(totalInvested).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>

            {/* Total Gain/Loss */}
            <div className={`bg-gradient-to-br ${totalGain >= 0 ? 'from-green-500 to-green-600' : 'from-red-500 to-red-600'} rounded-xl shadow-lg p-6 text-white`}>
              <div className="flex items-center justify-between mb-2">
                <p className={`${totalGain >= 0 ? 'text-green-100' : 'text-red-100'} text-sm font-medium`}>Total Gain/Loss</p>
                {totalGain >= 0 ?
                  <FiTrendingUp className="w-5 h-5 text-green-200" /> :
                  <FiTrendingDown className="w-5 h-5 text-red-200" />
                }
              </div>
              <p className="text-3xl font-bold">
                {totalGain >= 0 ? '+' : ''}R{Math.abs(parseFloat(totalGain)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>

            {/* Return % */}
            <div className={`bg-gradient-to-br ${totalGainPercent >= 0 ? 'from-teal-500 to-teal-600' : 'from-orange-500 to-orange-600'} rounded-xl shadow-lg p-6 text-white`}>
              <div className="flex items-center justify-between mb-2">
                <p className={`${totalGainPercent >= 0 ? 'text-teal-100' : 'text-orange-100'} text-sm font-medium`}>Return</p>
                <FiActivity className="w-5 h-5 text-teal-200" />
              </div>
              <p className="text-3xl font-bold">
                {totalGainPercent >= 0 ? '+' : ''}{parseFloat(totalGainPercent).toFixed(2)}%
              </p>
            </div>
          </div>
        )}

        {/* Tabs Navigation */}
        <div className="bg-white rounded-t-xl shadow-sm border-b">
          <div className="flex space-x-1 p-2">
            <button
              onClick={() => setActiveTab('holdings')}
              className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
                activeTab === 'holdings'
                  ? 'bg-primary-500 text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <FiPieChart className="inline mr-2" />
              Holdings
            </button>
            <button
              onClick={() => setActiveTab('transactions')}
              className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
                activeTab === 'transactions'
                  ? 'bg-primary-500 text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <FiCalendar className="inline mr-2" />
              Transactions
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
                activeTab === 'analytics'
                  ? 'bg-primary-500 text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <FiBarChart2 className="inline mr-2" />
              Analytics
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-b-xl shadow-lg">
          {/* Holdings Tab */}
          {activeTab === 'holdings' && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b-2 border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Asset</th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Quantity</th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Avg Cost</th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Current Price</th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Market Value</th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Gain/Loss</th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Return %</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {portfolio.holdings && portfolio.holdings.length > 0 ? (
                    portfolio.holdings.map((holding) => {
                      const originalCurrency = holding.originalCurrency || 'USD';
                      const showDualCurrency = originalCurrency !== userCurrency;
                      const displayAvgCost = showDualCurrency && holding.averageCostConverted
                        ? holding.averageCostConverted
                        : holding.averageCost;
                      const displayPrice = showDualCurrency && holding.currentPriceConverted
                        ? holding.currentPriceConverted
                        : holding.currentPrice || holding.averageCost;
                      const displayValue = showDualCurrency && holding.currentValueConverted
                        ? holding.currentValueConverted
                        : holding.currentValue || holding.totalCost;
                      const displayGainLoss = showDualCurrency && holding.gainLossConverted
                        ? holding.gainLossConverted
                        : holding.gainLoss || 0;
                      const gainLossPercent = holding.gainLossPercent || 0;

                      return (
                        <tr key={holding.id} className="hover:bg-blue-50 transition-colors">
                          <td className="px-6 py-4">
                            <div>
                              <p className="font-bold text-gray-900">{holding.symbol}</p>
                              <p className="text-sm text-gray-500">{holding.name}</p>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-right font-medium text-gray-900">
                            {parseFloat(holding.quantity).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <p className="font-semibold text-gray-900">
                              R{parseFloat(displayAvgCost).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </p>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <p className="font-semibold text-gray-900">
                              R{parseFloat(displayPrice).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </p>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <p className="font-bold text-gray-900">
                              R{parseFloat(displayValue).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </p>
                          </td>
                          <td className={`px-6 py-4 text-right font-bold ${parseFloat(displayGainLoss) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            <div className="flex items-center justify-end gap-1">
                              {parseFloat(displayGainLoss) >= 0 ? <FiTrendingUp className="w-4 h-4" /> : <FiTrendingDown className="w-4 h-4" />}
                              <span>
                                {parseFloat(displayGainLoss) >= 0 ? '+' : ''}R{Math.abs(parseFloat(displayGainLoss)).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                              </span>
                            </div>
                          </td>
                          <td className={`px-6 py-4 text-right font-bold ${parseFloat(gainLossPercent) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {parseFloat(gainLossPercent) >= 0 ? '+' : ''}{parseFloat(gainLossPercent).toFixed(2)}%
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="7" className="px-6 py-12 text-center">
                        <FiPieChart className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500 font-medium">No holdings yet</p>
                        <p className="text-sm text-gray-400 mt-1">Add your first transaction to get started</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Transactions Tab */}
          {activeTab === 'transactions' && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b-2 border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Asset</th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Quantity</th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Price</th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {transactions.length > 0 ? (
                    transactions.map((tx) => (
                      <tr key={tx.id} className="hover:bg-blue-50 transition-colors">
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {new Date(tx.transactionDate).toLocaleDateString('en-ZA', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                            tx.type === 'buy' ? 'bg-green-100 text-green-800' :
                            tx.type === 'sell' ? 'bg-red-100 text-red-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {tx.type.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-semibold text-gray-900">{tx.symbol}</p>
                        </td>
                        <td className="px-6 py-4 text-right font-medium text-gray-900">
                          {parseFloat(tx.quantity).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-6 py-4 text-right font-medium text-gray-900">
                          R{parseFloat(tx.price).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-6 py-4 text-right font-bold text-gray-900">
                          R{parseFloat(tx.totalAmount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="px-6 py-12 text-center">
                        <FiCalendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500 font-medium">No transactions yet</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Analytics Tab */}
          {activeTab === 'analytics' && (
            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Sector Allocation */}
                <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-6 border border-gray-200">
                  <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                    <FiPieChart className="mr-2 text-primary-500" />
                    Sector Allocation
                  </h3>
                  {sectorAllocation.length > 0 ? (
                    <div className="space-y-3">
                      {sectorAllocation.map((sector, idx) => {
                        const percentage = (sector.value / totalValue * 100).toFixed(1);
                        return (
                          <div key={idx}>
                            <div className="flex justify-between text-sm mb-1">
                              <span className="font-medium text-gray-700">{sector.sector}</span>
                              <span className="font-semibold text-gray-900">{percentage}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2.5">
                              <div
                                className="bg-gradient-to-r from-primary-500 to-primary-600 h-2.5 rounded-full transition-all"
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-gray-400 text-center py-8">No sector data available</p>
                  )}
                </div>

                {/* Top Performers */}
                <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-6 border border-gray-200">
                  <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                    <FiTrendingUp className="mr-2 text-green-500" />
                    Top Performers
                  </h3>
                  {topPerformers.length > 0 ? (
                    <div className="space-y-3">
                      {topPerformers.map((holding, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200 hover:border-primary-300 transition-colors">
                          <div className="flex-1">
                            <p className="font-bold text-gray-900">{holding.symbol}</p>
                            <p className="text-xs text-gray-500">{holding.name}</p>
                          </div>
                          <div className="text-right">
                            <p className={`font-bold ${parseFloat(holding.gainLossPercent) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {parseFloat(holding.gainLossPercent) >= 0 ? '+' : ''}
                              {parseFloat(holding.gainLossPercent).toFixed(2)}%
                            </p>
                            <p className="text-xs text-gray-500">
                              R{Math.abs(parseFloat(holding.gainLoss || 0)).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-400 text-center py-8">No performance data available</p>
                  )}
                </div>

                {/* Portfolio Summary */}
                <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-6 border border-gray-200 lg:col-span-2">
                  <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                    <FiBarChart2 className="mr-2 text-blue-500" />
                    Portfolio Summary
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-white rounded-lg border border-gray-200">
                      <p className="text-sm text-gray-600 mb-1">Total Holdings</p>
                      <p className="text-2xl font-bold text-gray-900">{portfolio.holdings?.length || 0}</p>
                    </div>
                    <div className="text-center p-4 bg-white rounded-lg border border-gray-200">
                      <p className="text-sm text-gray-600 mb-1">Total Transactions</p>
                      <p className="text-2xl font-bold text-gray-900">{transactions.length}</p>
                    </div>
                    <div className="text-center p-4 bg-white rounded-lg border border-gray-200">
                      <p className="text-sm text-gray-600 mb-1">Avg Return</p>
                      <p className={`text-2xl font-bold ${totalGainPercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {totalGainPercent >= 0 ? '+' : ''}{parseFloat(totalGainPercent).toFixed(2)}%
                      </p>
                    </div>
                    <div className="text-center p-4 bg-white rounded-lg border border-gray-200">
                      <p className="text-sm text-gray-600 mb-1">Diversification</p>
                      <p className="text-2xl font-bold text-gray-900">{sectorAllocation.length} Sectors</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add Transaction Modal */}
      {showAddTransaction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 max-h-screen overflow-y-auto shadow-2xl">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Add Transaction</h2>

            <form onSubmit={handleAddTransaction} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Type*</label>
                <select
                  required
                  value={transactionForm.type}
                  onChange={(e) => setTransactionForm({ ...transactionForm, type: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 focus:outline-none transition-all"
                >
                  <option value="buy">Buy</option>
                  <option value="sell">Sell</option>
                  <option value="dividend">Dividend</option>
                </select>
              </div>

              <div className="relative">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Symbol*</label>
                <input
                  type="text"
                  required
                  value={transactionForm.symbol}
                  onChange={(e) => {
                    setTransactionForm({ ...transactionForm, symbol: e.target.value.toUpperCase() });
                    searchSymbol(e.target.value);
                  }}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 focus:outline-none transition-all"
                  placeholder="e.g., AAPL"
                />
                {searchResults.length > 0 && (
                  <div className="absolute bg-white border-2 border-gray-200 rounded-xl mt-2 max-h-48 overflow-y-auto shadow-xl z-10 w-full">
                    {searchResults.map((result, idx) => (
                      <div
                        key={idx}
                        onClick={() => selectSymbol(result)}
                        className="px-4 py-3 hover:bg-primary-50 cursor-pointer transition-colors"
                      >
                        <div className="font-semibold text-gray-900">{result.symbol}</div>
                        <div className="text-sm text-gray-600">{result.name}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Name*</label>
                <input
                  type="text"
                  required
                  value={transactionForm.name}
                  onChange={(e) => setTransactionForm({ ...transactionForm, name: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 focus:outline-none transition-all"
                  placeholder="e.g., Apple Inc."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Quantity*</label>
                  <input
                    type="number"
                    required
                    step="0.000001"
                    min="0"
                    value={transactionForm.quantity}
                    onChange={(e) => setTransactionForm({ ...transactionForm, quantity: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 focus:outline-none transition-all"
                    placeholder="10"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Price (R)*</label>
                  <input
                    type="number"
                    required
                    step="0.01"
                    min="0"
                    value={transactionForm.price}
                    onChange={(e) => setTransactionForm({ ...transactionForm, price: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 focus:outline-none transition-all"
                    placeholder="150.00"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Fees (R)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={transactionForm.fees}
                  onChange={(e) => setTransactionForm({ ...transactionForm, fees: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 focus:outline-none transition-all"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Notes</label>
                <textarea
                  value={transactionForm.notes}
                  onChange={(e) => setTransactionForm({ ...transactionForm, notes: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 focus:outline-none transition-all"
                  rows="3"
                  placeholder="Optional notes about this transaction"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 py-3 bg-primary-500 text-white rounded-xl hover:bg-primary-600 transition-all font-semibold shadow-lg hover:shadow-xl"
                >
                  Add Transaction
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddTransaction(false);
                    setTransactionForm({
                      symbol: '',
                      name: '',
                      type: 'buy',
                      quantity: '',
                      price: '',
                      fees: '0',
                      notes: ''
                    });
                    setSearchResults([]);
                  }}
                  className="flex-1 py-3 border-2 border-gray-300 rounded-xl hover:bg-gray-50 transition-all font-semibold"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PortfolioDetails;
