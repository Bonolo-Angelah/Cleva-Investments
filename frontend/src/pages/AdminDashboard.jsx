import React, { useEffect, useState } from 'react';
import {
  FiUsers, FiActivity, FiTrendingUp, FiTarget, FiDollarSign,
  FiDownload, FiRefreshCw, FiAlertCircle, FiCheckCircle, FiClock
} from 'react-icons/fi';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { adminAPI } from '../services/api';
import { useAuthStore } from '../utils/store';

const AdminDashboard = () => {
  const { user } = useAuthStore();
  const [stats, setStats] = useState(null);
  const [activities, setActivities] = useState([]);
  const [users, setUsers] = useState([]);
  const [systemHealth, setSystemHealth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [reportFormat, setReportFormat] = useState('pdf');
  const [reportLoading, setReportLoading] = useState('');

  useEffect(() => {
    if (user?.role !== 'admin') {
      window.location.href = '/';
      return;
    }
    loadDashboardData();
  }, [user]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [statsRes, activitiesRes, usersRes, healthRes] = await Promise.all([
        adminAPI.getDashboardStats(),
        adminAPI.getRecentActivity({ limit: 20 }),
        adminAPI.getAllUsers({ page: 1, limit: 10 }),
        adminAPI.getSystemHealth()
      ]);

      setStats(statsRes.data);
      setActivities(activitiesRes.data.activities);
      setUsers(usersRes.data.users);
      setSystemHealth(healthRes.data);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const downloadReport = async (reportType) => {
    setReportLoading(reportType);
    try {
      let response;
      const params = { format: reportFormat };

      switch (reportType) {
        case 'activity':
          response = await adminAPI.generateActivityReport(params);
          break;
        case 'usage':
          response = await adminAPI.generateUsageReport(params);
          break;
        case 'performance':
          response = await adminAPI.generatePerformanceReport(params);
          break;
        default:
          return;
      }

      // Create blob and download
      const blob = new Blob([response.data], {
        type: reportFormat === 'pdf' ? 'application/pdf' :
              reportFormat === 'csv' ? 'text/csv' :
              'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${reportType}-report-${Date.now()}.${reportFormat === 'excel' ? 'xlsx' : reportFormat}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading report:', error);
      alert('Failed to download report. Please try again.');
    } finally {
      setReportLoading('');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <FiRefreshCw className="w-12 h-12 text-primary-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <FiAlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600">Failed to load dashboard data</p>
          <button
            onClick={loadDashboardData}
            className="mt-4 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const activityChartData = stats.activityStats?.actionBreakdown?.slice(0, 10).map(item => ({
    name: item._id,
    count: item.count
  })) || [];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658', '#FF6B9D', '#C0C0C0', '#8DD1E1'];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
        <p className="text-gray-500 mt-1">System overview and management</p>
      </div>

      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'overview'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'users'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Users
          </button>
          <button
            onClick={() => setActiveTab('activity')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'activity'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Activity Logs
          </button>
          <button
            onClick={() => setActiveTab('reports')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'reports'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Reports
          </button>
          <button
            onClick={() => setActiveTab('system')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'system'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            System Health
          </button>
        </nav>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Total Users</p>
                  <p className="text-3xl font-bold text-gray-800 mt-1">{stats.users.total}</p>
                  <p className="text-xs text-green-600 mt-1">
                    {stats.users.activePercentage}% active
                  </p>
                </div>
                <FiUsers className="w-12 h-12 text-blue-500" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Active Goals</p>
                  <p className="text-3xl font-bold text-gray-800 mt-1">{stats.goals.active}</p>
                  <p className="text-xs text-gray-600 mt-1">
                    {stats.goals.completionRate}% completion rate
                  </p>
                </div>
                <FiTarget className="w-12 h-12 text-green-500" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Total Portfolios</p>
                  <p className="text-3xl font-bold text-gray-800 mt-1">{stats.portfolios.total}</p>
                  <p className="text-xs text-gray-600 mt-1">
                    ${(stats.portfolios.totalValue || 0).toLocaleString()}
                  </p>
                </div>
                <FiDollarSign className="w-12 h-12 text-purple-500" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Chat Sessions</p>
                  <p className="text-3xl font-bold text-gray-800 mt-1">{stats.chat.totalSessions}</p>
                  <p className="text-xs text-gray-600 mt-1">
                    {stats.chat.recentSessions} recent
                  </p>
                </div>
                <FiActivity className="w-12 h-12 text-orange-500" />
              </div>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Activity Breakdown */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Activity Breakdown</h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={activityChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* User Stats */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">User Statistics</h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total Users</span>
                  <span className="font-bold text-lg">{stats.users.total}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Active Users</span>
                  <span className="font-bold text-lg text-green-600">{stats.users.active}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">New This Month</span>
                  <span className="font-bold text-lg text-blue-600">{stats.users.newThisMonth}</span>
                </div>
                <div className="mt-6">
                  <ResponsiveContainer width="100%" height={150}>
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Active', value: stats.users.active },
                          { name: 'Inactive', value: stats.users.total - stats.users.active }
                        ]}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label
                        outerRadius={60}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        <Cell fill="#00C49F" />
                        <Cell fill="#FFBB28" />
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Recent Activity</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Timestamp
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Action
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {activities.slice(0, 10).map((activity, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(activity.timestamp).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {activity.userEmail || 'System'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {activity.action}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          activity.status === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {activity.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">User Management</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Joined
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {user.firstName} {user.lastName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <span className={`px-2 py-1 text-xs rounded ${
                        user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Activity Logs Tab */}
      {activeTab === 'activity' && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Activity Logs</h2>
          <div className="space-y-3">
            {activities.map((activity, index) => (
              <div key={index} className="border rounded-lg p-4 hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      {activity.status === 'success' ? (
                        <FiCheckCircle className="text-green-500" />
                      ) : (
                        <FiAlertCircle className="text-red-500" />
                      )}
                      <span className="font-semibold text-gray-800">{activity.action}</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      {activity.description || 'No description'}
                    </p>
                    <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                      <span>{activity.userEmail || 'System'}</span>
                      <span>•</span>
                      <span>{new Date(activity.timestamp).toLocaleString()}</span>
                      {activity.ipAddress && (
                        <>
                          <span>•</span>
                          <span>{activity.ipAddress}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Reports Tab */}
      {activeTab === 'reports' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Generate Reports</h2>

            {/* Format Selector */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Report Format
              </label>
              <div className="flex space-x-4">
                <button
                  onClick={() => setReportFormat('pdf')}
                  className={`px-4 py-2 rounded-lg ${
                    reportFormat === 'pdf' ? 'bg-primary-500 text-white' : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  PDF
                </button>
                <button
                  onClick={() => setReportFormat('csv')}
                  className={`px-4 py-2 rounded-lg ${
                    reportFormat === 'csv' ? 'bg-primary-500 text-white' : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  CSV
                </button>
                <button
                  onClick={() => setReportFormat('excel')}
                  className={`px-4 py-2 rounded-lg ${
                    reportFormat === 'excel' ? 'bg-primary-500 text-white' : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  Excel
                </button>
              </div>
            </div>

            {/* Report Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* User Activity Report */}
              <div className="border rounded-lg p-6">
                <div className="flex items-center mb-4">
                  <FiActivity className="w-8 h-8 text-blue-500 mr-3" />
                  <h3 className="text-lg font-semibold">Activity Report</h3>
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  Detailed log of all user activities in the system
                </p>
                <button
                  onClick={() => downloadReport('activity')}
                  disabled={reportLoading === 'activity'}
                  className="w-full flex items-center justify-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
                >
                  {reportLoading === 'activity' ? (
                    <FiRefreshCw className="animate-spin mr-2" />
                  ) : (
                    <FiDownload className="mr-2" />
                  )}
                  Download
                </button>
              </div>

              {/* Usage Report */}
              <div className="border rounded-lg p-6">
                <div className="flex items-center mb-4">
                  <FiTrendingUp className="w-8 h-8 text-green-500 mr-3" />
                  <h3 className="text-lg font-semibold">Usage Report</h3>
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  System usage statistics and metrics
                </p>
                <button
                  onClick={() => downloadReport('usage')}
                  disabled={reportLoading === 'usage'}
                  className="w-full flex items-center justify-center px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50"
                >
                  {reportLoading === 'usage' ? (
                    <FiRefreshCw className="animate-spin mr-2" />
                  ) : (
                    <FiDownload className="mr-2" />
                  )}
                  Download
                </button>
              </div>

              {/* Performance Report */}
              <div className="border rounded-lg p-6">
                <div className="flex items-center mb-4">
                  <FiClock className="w-8 h-8 text-purple-500 mr-3" />
                  <h3 className="text-lg font-semibold">Performance Report</h3>
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  System performance and audit logs
                </p>
                <button
                  onClick={() => downloadReport('performance')}
                  disabled={reportLoading === 'performance'}
                  className="w-full flex items-center justify-center px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:opacity-50"
                >
                  {reportLoading === 'performance' ? (
                    <FiRefreshCw className="animate-spin mr-2" />
                  ) : (
                    <FiDownload className="mr-2" />
                  )}
                  Download
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* System Health Tab */}
      {activeTab === 'system' && systemHealth && (
        <div className="space-y-6">
          {/* Overall Status */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-800">System Health</h2>
              <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                systemHealth.status === 'healthy' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {systemHealth.status}
              </span>
            </div>

            {/* Databases */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold mb-2">PostgreSQL</h3>
                <div className="flex items-center">
                  {systemHealth.databases.postgresql.status === 'connected' ? (
                    <>
                      <FiCheckCircle className="text-green-500 mr-2" />
                      <span className="text-sm text-green-600">Connected</span>
                    </>
                  ) : (
                    <>
                      <FiAlertCircle className="text-red-500 mr-2" />
                      <span className="text-sm text-red-600">Disconnected</span>
                    </>
                  )}
                </div>
              </div>

              <div className="border rounded-lg p-4">
                <h3 className="font-semibold mb-2">MongoDB</h3>
                <div className="flex items-center">
                  {systemHealth.databases.mongodb.status === 'connected' ? (
                    <>
                      <FiCheckCircle className="text-green-500 mr-2" />
                      <span className="text-sm text-green-600">Connected</span>
                    </>
                  ) : (
                    <>
                      <FiAlertCircle className="text-red-500 mr-2" />
                      <span className="text-sm text-red-600">Disconnected</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Memory & Uptime */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold mb-3">Memory Usage</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Heap Used:</span>
                    <span className="font-medium">{systemHealth.memory.heapUsed}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Heap Total:</span>
                    <span className="font-medium">{systemHealth.memory.heapTotal}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">RSS:</span>
                    <span className="font-medium">{systemHealth.memory.rss}</span>
                  </div>
                </div>
              </div>

              <div className="border rounded-lg p-4">
                <h3 className="font-semibold mb-3">System Metrics</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Uptime:</span>
                    <span className="font-medium">{systemHealth.uptime}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Timestamp:</span>
                    <span className="font-medium">{new Date(systemHealth.timestamp).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={loadDashboardData}
            className="w-full flex items-center justify-center px-4 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600"
          >
            <FiRefreshCw className="mr-2" />
            Refresh Data
          </button>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
