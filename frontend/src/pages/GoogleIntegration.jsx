import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  Settings, 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  RefreshCw, 
  ExternalLink,
  Trash2,
  Shield,
  Calendar,
  Building2
} from 'lucide-react';
import axios from 'axios';

const GoogleIntegration = () => {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const [settings, setSettings] = useState({
    client_id: '',
    client_secret: '',
    auto_sync_enabled: true
  });
  const [googleSettings, setGoogleSettings] = useState(null);
  const [syncLogs, setSyncLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [showCredentialsForm, setShowCredentialsForm] = useState(false);
  
  const API_BASE_URL = process.env.REACT_APP_BACKEND_URL;

  useEffect(() => {
    // Wait for auth to finish loading before checking permissions
    if (authLoading) {
      return;
    }

    if (user && isAdmin()) {
      fetchGoogleSettings();
      fetchSyncLogs();
    }
  }, [user, authLoading]);

  const fetchGoogleSettings = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/google-business/settings`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      setGoogleSettings(response.data);
      if (response.data.client_id) {
        setSettings(prev => ({ ...prev, client_id: response.data.client_id }));
      }
    } catch (error) {
      console.error('Error fetching Google settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSyncLogs = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/google-business/sync-logs?limit=20`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      setSyncLogs(response.data.sync_logs);
    } catch (error) {
      console.error('Error fetching sync logs:', error);
    }
  };

  const handleSaveSettings = async () => {
    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      await axios.post(`${API_BASE_URL}/api/google-business/configure`, settings, {
        headers: { 
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      setMessage({ type: 'success', text: 'Google Business settings saved successfully!' });
      setShowCredentialsForm(false);
      setTimeout(() => {
        fetchGoogleSettings();
        setMessage({ type: '', text: '' });
      }, 2000);
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.detail || 'Failed to save settings' });
    } finally {
      setSaving(false);
    }
  };

  const handleConnectGoogle = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/google-business/auth-url`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      
      // Open Google OAuth in new window
      window.open(response.data.auth_url, '_blank', 'width=600,height=700');
      
      // Poll for connection status
      const pollInterval = setInterval(async () => {
        try {
          await fetchGoogleSettings();
          if (googleSettings?.is_connected) {
            clearInterval(pollInterval);
            setMessage({ type: 'success', text: 'Google Business Profile connected successfully!' });
            setTimeout(() => setMessage({ type: '', text: '' }), 3000);
          }
        } catch (error) {
          console.error('Polling error:', error);
        }
      }, 2000);

      // Stop polling after 2 minutes
      setTimeout(() => clearInterval(pollInterval), 120000);
      
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.detail || 'Failed to start connection process' });
    }
  };

  const handleSync = async (syncType) => {
    setSyncing(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await axios.post(`${API_BASE_URL}/api/google-business/sync`, 
        { sync_type: syncType },
        {
          headers: { 
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        setMessage({ type: 'success', text: response.data.message || 'Sync completed successfully!' });
      } else {
        setMessage({ type: 'error', text: response.data.message || 'Sync failed' });
      }

      fetchSyncLogs();
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.detail || 'Sync failed' });
    } finally {
      setSyncing(false);
      setTimeout(() => setMessage({ type: '', text: '' }), 5000);
    }
  };

  const handleDisconnect = async () => {
    if (!window.confirm('Are you sure you want to disconnect Google Business Profile? This will stop all automatic syncing.')) {
      return;
    }

    try {
      await axios.delete(`${API_BASE_URL}/api/google-business/disconnect`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });

      setMessage({ type: 'success', text: 'Google Business Profile disconnected successfully' });
      fetchGoogleSettings();
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.detail || 'Failed to disconnect' });
    }
  };

  const formatDateTime = (dateStr) => {
    if (!dateStr) return 'Never';
    return new Date(dateStr).toLocaleString();
  };

  if (!user || !isAdmin()) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Shield className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">Admin privileges required to access Google Integration settings.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <div className="bg-blue-600 p-3 rounded-lg">
              <Settings className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Google Business Integration</h1>
              <p className="text-gray-600">Connect and sync your hospital data with Google Business Profile</p>
            </div>
          </div>
        </div>

        {/* Message Display */}
        {message.text && (
          <div className={`mb-6 rounded-md p-4 ${
            message.type === 'error' 
              ? 'bg-red-50 border border-red-200' 
              : 'bg-green-50 border border-green-200'
          }`}>
            <div className="flex">
              <div className="flex-shrink-0">
                {message.type === 'error' ? (
                  <AlertCircle className="h-5 w-5 text-red-400" />
                ) : (
                  <CheckCircle className="h-5 w-5 text-green-400" />
                )}
              </div>
              <div className="ml-3">
                <p className={`text-sm font-medium ${
                  message.type === 'error' ? 'text-red-800' : 'text-green-800'
                }`}>
                  {message.text}
                </p>
              </div>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <span className="ml-4 text-gray-600">Loading Google integration settings...</span>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Connection Status */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">Connection Status</h2>
              </div>
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${
                      googleSettings?.is_connected ? 'bg-green-500' : 'bg-red-500'
                    }`}></div>
                    <span className="text-lg font-medium">
                      {googleSettings?.is_connected ? 'Connected' : 'Not Connected'}
                    </span>
                  </div>
                  
                  {googleSettings?.is_connected ? (
                    <button
                      onClick={handleDisconnect}
                      className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Disconnect
                    </button>
                  ) : (
                    <div className="flex space-x-3">
                      <button
                        onClick={() => setShowCredentialsForm(true)}
                        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                      >
                        <Settings className="h-4 w-4 mr-2" />
                        Configure
                      </button>
                      {googleSettings?.client_id && (
                        <button
                          onClick={handleConnectGoogle}
                          className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                        >
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Connect to Google
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {googleSettings?.last_sync_at && (
                  <p className="text-sm text-gray-600">
                    Last sync: {formatDateTime(googleSettings.last_sync_at)}
                  </p>
                )}
              </div>
            </div>

            {/* Configuration Form */}
            {showCredentialsForm && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-medium text-gray-900">Google API Configuration</h2>
                  <p className="text-sm text-gray-600 mt-1">
                    Enter your Google Cloud Project credentials to enable Google Business Profile integration
                  </p>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Google Client ID
                      </label>
                      <input
                        type="text"
                        value={settings.client_id}
                        onChange={(e) => setSettings(prev => ({ ...prev, client_id: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="123456789012-abcdefghijklmnopqrstuvwxyz.apps.googleusercontent.com"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Google Client Secret
                      </label>
                      <input
                        type="password"
                        value={settings.client_secret}
                        onChange={(e) => setSettings(prev => ({ ...prev, client_secret: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="GOCSPX-xxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                      />
                    </div>

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="auto_sync"
                        checked={settings.auto_sync_enabled}
                        onChange={(e) => setSettings(prev => ({ ...prev, auto_sync_enabled: e.target.checked }))}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor="auto_sync" className="ml-2 block text-sm text-gray-900">
                        Enable automatic syncing of hours and business information
                      </label>
                    </div>
                  </div>

                  <div className="mt-6 flex space-x-3">
                    <button
                      onClick={handleSaveSettings}
                      disabled={saving || !settings.client_id || !settings.client_secret}
                      className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 transition-colors"
                    >
                      {saving ? (
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <CheckCircle className="h-4 w-4 mr-2" />
                      )}
                      {saving ? 'Saving...' : 'Save Configuration'}
                    </button>
                    
                    <button
                      onClick={() => setShowCredentialsForm(false)}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>

                  {/* Setup Instructions */}
                  <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
                    <h3 className="text-sm font-medium text-blue-800 mb-2">Setup Instructions:</h3>
                    <ol className="text-xs text-blue-700 space-y-1 list-decimal list-inside">
                      <li>Go to <a href="https://console.cloud.google.com" target="_blank" rel="noopener noreferrer" className="underline">Google Cloud Console</a></li>
                      <li>Create a new project or select an existing one</li>
                      <li>Enable the "Business Profile API"</li>
                      <li>Go to "Credentials" and create "OAuth 2.0 Client ID"</li>
                      <li>Set the redirect URI to: <code className="bg-white px-1 rounded">{window.location.origin}/google-integration/callback</code></li>
                      <li>Copy the Client ID and Client Secret above</li>
                    </ol>
                  </div>
                </div>
              </div>
            )}

            {/* Manual Sync Controls */}
            {googleSettings?.is_connected && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-medium text-gray-900">Manual Sync Controls</h2>
                  <p className="text-sm text-gray-600 mt-1">
                    Manually sync specific data sections with Google Business Profile
                  </p>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <button
                      onClick={() => handleSync('general_practice')}
                      disabled={syncing}
                      className="flex items-center justify-center p-4 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors disabled:opacity-50"
                    >
                      <Clock className="h-5 w-5 text-blue-600 mr-2" />
                      <span className="text-blue-700 font-medium">Sync General Practice Hours</span>
                    </button>

                    <button
                      onClick={() => handleSync('urgent_care')}
                      disabled={syncing}
                      className="flex items-center justify-center p-4 bg-green-50 hover:bg-green-100 border border-green-200 rounded-lg transition-colors disabled:opacity-50"
                    >
                      <Calendar className="h-5 w-5 text-green-600 mr-2" />
                      <span className="text-green-700 font-medium">Sync Urgent Care Hours</span>
                    </button>

                    <button
                      onClick={() => handleSync('business_info')}
                      disabled={syncing}
                      className="flex items-center justify-center p-4 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-lg transition-colors disabled:opacity-50"
                    >
                      <Building2 className="h-5 w-5 text-purple-600 mr-2" />
                      <span className="text-purple-700 font-medium">Sync Business Info</span>
                    </button>
                  </div>

                  {syncing && (
                    <div className="mt-4 flex items-center justify-center text-blue-600">
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      <span>Syncing to Google Business Profile...</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Sync History */}
            {syncLogs.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-medium text-gray-900">Sync History</h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Type
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Message
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {syncLogs.map((log) => (
                        <tr key={log.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {log.sync_type.replace('_', ' ').toUpperCase()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              log.status === 'success' 
                                ? 'bg-green-100 text-green-800'
                                : log.status === 'failed'
                                ? 'bg-red-100 text-red-800' 
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {log.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                            {log.message}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDateTime(log.synced_at)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default GoogleIntegration;