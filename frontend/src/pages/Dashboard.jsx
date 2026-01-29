import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiTarget, FiTrendingUp, FiMessageSquare, FiArrowRight } from 'react-icons/fi';
import { useAuthStore, useGoalsStore } from '../utils/store';
import { goalsAPI, chatAPI, marketAPI } from '../services/api';

const Dashboard = () => {
  const { user } = useAuthStore();
  const { goals, setGoals } = useGoalsStore();
  const [recommendations, setRecommendations] = useState([]);
  const [marketOverview, setMarketOverview] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [goalsRes, recsRes, marketRes] = await Promise.all([
        goalsAPI.getGoals('active'),
        chatAPI.getRecommendations(5),
        marketAPI.getOverview()
      ]);

      setGoals(goalsRes.data.goals);
      setRecommendations(recsRes.data.personalized || []);
      setMarketOverview(marketRes.data);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">
          Welcome back, {user?.firstName}!
        </h1>
        <p className="text-gray-500 mt-1">Here's your investment overview</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Active Goals</p>
              <p className="text-3xl font-bold text-gray-800 mt-1">{goals.length}</p>
            </div>
            <FiTarget className="w-12 h-12 text-primary-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Recommendations</p>
              <p className="text-3xl font-bold text-gray-800 mt-1">{recommendations.length}</p>
            </div>
            <FiTrendingUp className="w-12 h-12 text-green-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Risk Level</p>
              <p className="text-3xl font-bold text-gray-800 mt-1 capitalize">{user?.riskTolerance}</p>
            </div>
            <FiMessageSquare className="w-12 h-12 text-blue-500" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Goals */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-800">Your Goals</h2>
            <Link to="/goals" className="text-primary-500 text-sm font-semibold hover:underline">
              View all
            </Link>
          </div>

          <div className="space-y-3">
            {goals.slice(0, 3).map((goal) => (
              <div key={goal.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-gray-800">{goal.title}</h3>
                  <span className="text-sm text-primary-600 font-semibold">
                    {Math.min((goal.currentAmount / goal.targetAmount) * 100, 100).toFixed(0)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-primary-500 h-2 rounded-full"
                    style={{ width: `${Math.min((goal.currentAmount / goal.targetAmount) * 100, 100)}%` }}
                  />
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  R{parseFloat(goal.currentAmount).toLocaleString()} / R{parseFloat(goal.targetAmount).toLocaleString()}
                </p>
                <p className="text-xs text-primary-600 font-medium mt-1">
                  {Math.min((goal.currentAmount / goal.targetAmount) * 100, 100).toFixed(1)}% Complete
                </p>
              </div>
            ))}

            {goals.length === 0 && (
              <div className="text-center py-8">
                <FiTarget className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500">No goals yet</p>
                <Link to="/goals" className="text-primary-500 text-sm font-semibold hover:underline mt-2 inline-block">
                  Create your first goal
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Recommendations */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-800">Personalized Recommendations</h2>
            <Link to="/chat" className="text-primary-500 text-sm font-semibold hover:underline">
              Chat with AI
            </Link>
          </div>

          <div className="space-y-3">
            {recommendations.slice(0, 5).map((rec, idx) => (
              <div key={idx} className="border rounded-lg p-4 hover:border-primary-500 transition cursor-pointer">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-gray-800">{rec.symbol}</h3>
                    <p className="text-sm text-gray-500">{rec.name}</p>
                  </div>
                  <FiArrowRight className="text-primary-500" />
                </div>
                <div className="flex justify-between items-center mt-2 text-sm">
                  <span className="text-gray-500">{rec.type}</span>
                  <span className="text-primary-600">{rec.recommendedByUsers} similar users</span>
                </div>
              </div>
            ))}

            {recommendations.length === 0 && (
              <div className="text-center py-8">
                <FiTrendingUp className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500">Start chatting to get recommendations</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Market Overview */}
      {marketOverview && (
        <div className="mt-6 bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Market Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-gray-700 mb-3">Trending</h3>
              <div className="space-y-2">
                {marketOverview.trending?.slice(0, 5).map((stock, idx) => (
                  <div key={idx} className="flex justify-between items-center text-sm">
                    <span className="text-gray-800">{stock.symbol}</span>
                    <span className={stock.changesPercentage >= 0 ? 'text-green-600' : 'text-red-600'}>
                      {stock.changesPercentage >= 0 ? '+' : ''}
                      {stock.changesPercentage?.toFixed(2)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-gray-700 mb-3">Top Gainers</h3>
              <div className="space-y-2">
                {marketOverview.gainers?.slice(0, 5).map((stock, idx) => (
                  <div key={idx} className="flex justify-between items-center text-sm">
                    <span className="text-gray-800">{stock.symbol}</span>
                    <span className="text-green-600">
                      +{stock.changesPercentage?.toFixed(2)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
