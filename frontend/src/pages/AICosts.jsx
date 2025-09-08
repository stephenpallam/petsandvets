import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  DollarSign, 
  TrendingUp, 
  Activity, 
  Image as ImageIcon,
  MessageSquare,
  Calendar,
  Filter,
  BarChart3,
  PieChart,
  RefreshCw,
  Download,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';

const AICosts = () => {
  const { user, token, isAdmin, canAccessManager, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [analytics, setAnalytics] = useState(null);
  const [usageLogs, setUsageLogs] = useState([]);
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [message, setMessage] = useState({ type: '', text: '' });

  const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || import.meta.env.REACT_APP_BACKEND_URL || window.location.origin;

  const periods = [
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
    { value: 'year', label: 'This Year' }
  ];

  useEffect(() => {
    if (!authLoading) {
      if (!user || !isAdmin) {
        setMessage({ type: 'error', text: 'Access denied. Admin privileges required.' });
        setPageLoading(false);
        return;
      }
      
      fetchCostData();
    }
  }, [user, isAdmin, authLoading, selectedPeriod]);

  const fetchCostData = async () => {
    setLoading(true);
    try {
      // Fetch analytics
      const analyticsResponse = await fetch(`${API_BASE_URL}/api/ai-costs/analytics?period=${selectedPeriod}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (analyticsResponse.ok) {
        const analyticsData = await analyticsResponse.json();
        setAnalytics(analyticsData);
      }

      // Fetch usage logs
      const logsResponse = await fetch(`${API_BASE_URL}/api/ai-costs/usage-logs?period=${selectedPeriod}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (logsResponse.ok) {
        const logsData = await logsResponse.json();
        setUsageLogs(logsData.usage_logs || []);
      }

    } catch (error) {
      console.error('Error fetching cost data:', error);
      setMessage({ type: 'error', text: 'Failed to load cost data' });
    } finally {
      setLoading(false);
      setPageLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 4
    }).format(amount || 0);
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat('en-US').format(num || 0);
  };

  if (authLoading || pageLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading cost analytics...</p>
        </div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">Admin privileges required to view cost analytics.</p>
        </div>
      </div>
    );
  }

  const summary = analytics?.summary || {};
  const providerBreakdown = analytics?.provider_breakdown || [];
  const modelBreakdown = analytics?.model_breakdown || [];
  const dailyTrends = analytics?.daily_trends || [];

  return (
    <>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center space-x-3">
                  <DollarSign className="h-8 w-8 text-green-600" />
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">
                      AI Costs Analytics
                    </h2>
                    <p className="text-sm text-gray-600">Monitor AI usage and costs across all services</p>
                  </div>
                </div>

                {/* Period Filter */}
                <div className="flex flex-row items-center space-x-3">
                  <div className="flex items-center space-x-2">
                    <Filter className="h-4 w-4 text-gray-500" />
                    <select
                      value={selectedPeriod}
                      onChange={(e) => setSelectedPeriod(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm min-w-0"
                    >
                      {periods.map(period => (
                        <option key={period.value} value={period.value}>
                          {period.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <button
                    onClick={fetchCostData}
                    disabled={loading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 flex items-center text-sm font-medium transition-colors flex-shrink-0"
                  >
                    <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                    Refresh
                  </button>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              {message.text && (
                <div className={`mb-6 p-4 rounded-lg border ${
                  message.type === 'error' 
                    ? 'bg-red-50 text-red-700 border-red-200' 
                    : 'bg-green-50 text-green-700 border-green-200'
                }`}>
                  <div className="flex items-center">
                    {message.type === 'error' ? (
                      <AlertTriangle className="h-4 w-4 mr-2" />
                    ) : (
                      <CheckCircle className="h-4 w-4 mr-2" />
                    )}
                    {message.text}
                  </div>
                </div>
              )}

              {/* Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <div className="flex items-center">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <DollarSign className="h-5 w-5 text-green-600" />
                    </div>
                    <div className="ml-3">
                      <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">Total Cost</p>
                      <p className="text-lg font-bold text-gray-900">{formatCurrency(summary.total_cost)}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <div className="flex items-center">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <MessageSquare className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="ml-3">
                      <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">Text Generation</p>
                      <p className="text-lg font-bold text-gray-900">{formatCurrency(summary.text_cost)}</p>
                      <p className="text-xs text-gray-500">{formatNumber(summary.total_tokens)} tokens</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <div className="flex items-center">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <ImageIcon className="h-5 w-5 text-purple-600" />
                    </div>
                    <div className="ml-3">
                      <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">Image Generation</p>
                      <p className="text-lg font-bold text-gray-900">{formatCurrency(summary.image_cost)}</p>
                      <p className="text-xs text-gray-500">{formatNumber(summary.total_images)} images</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <div className="flex items-center">
                    <div className="p-2 bg-orange-100 rounded-lg">
                      <Activity className="h-5 w-5 text-orange-600" />
                    </div>
                    <div className="ml-3">
                      <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">Total Requests</p>
                      <p className="text-lg font-bold text-gray-900">{formatNumber(summary.total_requests)}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Charts Row */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* Provider Breakdown */}
                <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                  <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center">
                    <PieChart className="h-5 w-5 mr-2 text-green-600" />
                    Cost by Provider
                  </h3>
                  <div className="space-y-3">
                    {providerBreakdown.map((provider, index) => (
                      <div key={provider._id} className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-100">
                        <div className="flex items-center">
                          <div className={`w-3 h-3 rounded-full mr-3 ${
                            index === 0 ? 'bg-blue-500' : index === 1 ? 'bg-green-500' : index === 2 ? 'bg-purple-500' : 'bg-orange-500'
                          }`}></div>
                          <span className="text-sm font-medium text-gray-700 capitalize">{provider._id}</span>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-gray-900">{formatCurrency(provider.cost)}</p>
                          <p className="text-xs text-gray-500">{provider.requests} requests</p>
                        </div>
                      </div>
                    ))}
                    {providerBreakdown.length === 0 && (
                      <div className="text-center py-8">
                        <BarChart3 className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500 text-sm">No data available for the selected period</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Model Breakdown */}
                <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                  <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center">
                    <BarChart3 className="h-5 w-5 mr-2 text-green-600" />
                    Cost by Model
                  </h3>
                  <div className="space-y-3">
                    {modelBreakdown.map((model, index) => (
                      <div key={model._id} className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-100">
                        <div className="flex items-center">
                          <div className={`w-3 h-3 rounded-full mr-3 ${
                            index === 0 ? 'bg-indigo-500' : index === 1 ? 'bg-pink-500' : index === 2 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}></div>
                          <span className="text-sm font-medium text-gray-700">{model._id}</span>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-gray-900">{formatCurrency(model.cost)}</p>
                          <p className="text-xs text-gray-500">{model.requests} requests</p>
                        </div>
                      </div>
                    ))}
                    {modelBreakdown.length === 0 && (
                      <div className="text-center py-8">
                        <PieChart className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500 text-sm">No data available for the selected period</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Usage Logs Table */}
              <div className="bg-gray-50 rounded-lg border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200 bg-white rounded-t-lg">
                  <h3 className="text-base font-semibold text-gray-900 flex items-center">
                    <Activity className="h-5 w-5 mr-2 text-green-600" />
                    Recent Usage Logs
                  </h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead className="bg-gray-100 border-b border-gray-200">
                      <tr>
                        <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Date</th>
                        <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Type</th>
                        <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider hidden sm:table-cell">Provider</th>
                        <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider hidden md:table-cell">Model</th>
                        <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Usage</th>
                        <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Cost</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-100">
                      {usageLogs.slice(0, 50).map((log, index) => (
                        <tr key={log.id || index} className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 sm:px-6 py-4 text-sm text-gray-900">
                            <div className="font-medium">
                              {new Date(log.created_at).toLocaleDateString()}
                            </div>
                            <div className="text-xs text-gray-500 sm:hidden">
                              {new Date(log.created_at).toLocaleTimeString()}
                            </div>
                            <div className="text-xs text-gray-500 hidden sm:block">
                              {new Date(log.created_at).toLocaleTimeString()}
                            </div>
                          </td>
                          <td className="px-4 sm:px-6 py-4">
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                              log.cost_type === 'text_generation' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
                            }`}>
                              {log.cost_type === 'text_generation' ? (
                                <>
                                  <MessageSquare className="h-3 w-3 mr-1" />
                                  Text
                                </>
                              ) : (
                                <>
                                  <ImageIcon className="h-3 w-3 mr-1" />
                                  Image
                                </>
                              )}
                            </span>
                          </td>
                          <td className="px-4 sm:px-6 py-4 text-sm text-gray-700 capitalize hidden sm:table-cell">
                            {log.provider}
                          </td>
                          <td className="px-4 sm:px-6 py-4 text-sm text-gray-700 hidden md:table-cell">
                            <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                              {log.model}
                            </code>
                          </td>
                          <td className="px-4 sm:px-6 py-4 text-sm text-gray-600">
                            {log.cost_type === 'text_generation' ? (
                              <div>
                                <div className="font-medium">{formatNumber(log.tokens_used)} tokens</div>
                                <div className="text-xs text-gray-500 sm:hidden capitalize">
                                  {log.provider} • {log.model}
                                </div>
                              </div>
                            ) : (
                              <div>
                                <div className="font-medium">{log.images_generated} image{log.images_generated !== 1 ? 's' : ''}</div>
                                <div className="text-xs text-gray-500 sm:hidden capitalize">
                                  {log.provider} • {log.model}
                                </div>
                              </div>
                            )}
                          </td>
                          <td className="px-4 sm:px-6 py-4 text-sm font-semibold text-gray-900">
                            {formatCurrency(log.cost_usd)}
                          </td>
                        </tr>
                      ))}
                      {usageLogs.length === 0 && (
                        <tr>
                          <td colSpan="6" className="px-6 py-12 text-center">
                            <Activity className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                            <p className="text-gray-500 text-sm">No usage logs available for the selected period</p>
                            <p className="text-gray-400 text-xs mt-1">Logs will appear here when AI services are used</p>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AICosts;