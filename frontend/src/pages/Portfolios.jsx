import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { portfolioAPI } from '../services/api';
import { useAuthStore } from '../utils/store';
import { formatCurrency, getCurrencySymbol } from '../utils/currency';
import { FiPlus, FiTrendingUp, FiDollarSign, FiBriefcase } from 'react-icons/fi';

const Portfolios = () => {
  const { user } = useAuthStore();
  const userCurrency = user?.currency || 'USD';
  const [portfolios, setPortfolios] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });

  useEffect(() => {
    loadPortfolios();
  }, []);

  const loadPortfolios = async () => {
    try {
      const response = await portfolioAPI.getPortfolios();
      setPortfolios(response.data.portfolios);
    } catch (error) {
      toast.error('Failed to load portfolios');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreatePortfolio = async (e) => {
    e.preventDefault();
    try {
      await portfolioAPI.createPortfolio(formData);
      toast.success('Portfolio created successfully!');
      setShowModal(false);
      setFormData({ name: '', description: '' });
      loadPortfolios();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to create portfolio');
    }
  };

  const totalValue = portfolios.reduce((sum, p) => sum + parseFloat(p.totalValue || 0), 0);
  const totalGainLoss = portfolios.reduce((sum, p) => sum + parseFloat(p.totalGainLoss || 0), 0);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">My Portfolios</h1>
          <p className="text-gray-600 mt-1">Track and manage your investments</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition"
        >
          <FiPlus /> New Portfolio
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-700 font-medium">Total Portfolios</p>
              <p className="text-3xl font-bold text-blue-900 mt-2">{portfolios.length}</p>
            </div>
            <FiBriefcase className="w-12 h-12 text-blue-500" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-primary-50 to-primary-100 rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-primary-700 font-medium">Total Value</p>
              <p className="text-3xl font-bold text-primary-900 mt-2">{formatCurrency(totalValue, userCurrency)}</p>
            </div>
            <FiDollarSign className="w-12 h-12 text-primary-500" />
          </div>
        </div>

        <div className={`bg-gradient-to-br ${totalGainLoss >= 0 ? 'from-green-50 to-green-100' : 'from-red-50 to-red-100'} rounded-lg shadow p-6`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${totalGainLoss >= 0 ? 'text-green-700' : 'text-red-700'}`}>Total Gain/Loss</p>
              <p className={`text-3xl font-bold mt-2 ${totalGainLoss >= 0 ? 'text-green-900' : 'text-red-900'}`}>
                {totalGainLoss >= 0 ? '+' : ''}{formatCurrency(Math.abs(totalGainLoss), userCurrency)}
              </p>
            </div>
            <FiTrendingUp className={`w-12 h-12 ${totalGainLoss >= 0 ? 'text-green-500' : 'text-red-500'}`} />
          </div>
        </div>
      </div>

      {/* Portfolios List */}
      {portfolios.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <FiBriefcase className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-800 mb-2">No Portfolios Yet</h3>
          <p className="text-gray-600 mb-6">Create your first portfolio to start tracking your investments</p>
          <button
            onClick={() => setShowModal(true)}
            className="px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition"
          >
            Create Portfolio
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {portfolios.map((portfolio) => (
            <Link
              key={portfolio.id}
              to={`/portfolios/${portfolio.id}`}
              className="bg-white rounded-lg shadow hover:shadow-lg transition p-6 border-2 border-transparent hover:border-primary-500"
            >
              <h3 className="text-xl font-semibold text-gray-800 mb-2">{portfolio.name}</h3>
              {portfolio.description && (
                <p className="text-sm text-gray-600 mb-4">{portfolio.description}</p>
              )}

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Value:</span>
                  <span className="font-semibold text-gray-800">
                    {formatCurrency(portfolio.totalValue || 0, userCurrency)}
                  </span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Gain/Loss:</span>
                  <span className={`font-semibold ${parseFloat(portfolio.totalGainLoss || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {parseFloat(portfolio.totalGainLoss || 0) >= 0 ? '+' : ''}
                    {formatCurrency(Math.abs(portfolio.totalGainLoss || 0), userCurrency)}
                    {portfolio.totalGainLossPercent && (
                      <span className="ml-1">({parseFloat(portfolio.totalGainLossPercent).toFixed(2)}%)</span>
                    )}
                  </span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Holdings:</span>
                  <span className="font-semibold text-gray-800">{portfolio.holdings?.length || 0}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Create Portfolio Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Create New Portfolio</h2>

            <form onSubmit={handleCreatePortfolio} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Portfolio Name*
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:outline-none"
                  placeholder="e.g., Growth Portfolio"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:outline-none"
                  rows="3"
                  placeholder="Optional description"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition"
                >
                  Create
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setFormData({ name: '', description: '' });
                  }}
                  className="flex-1 py-2 border rounded-lg hover:bg-gray-50 transition"
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

export default Portfolios;
