import React, { useState, useEffect } from 'react';
import { MessageSquare, Send, Settings, CheckCircle, AlertCircle, Eye, EyeOff, Info, Cog, TestTube, Phone } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const SMSConfiguration = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [smsConfig, setSmsConfig] = useState({
    notification_phone: '',
    sms_provider: 'twilio', // 'twilio' or 'sendgrid'
    is_enabled: false,
    // Twilio fields
    twilio_account_sid: '',
    twilio_auth_token: '',
    twilio_phone_number: '',
    // SendGrid fields (for SMS)
    sendgrid_api_key: '',
    sender_phone: ''
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);

  const { user, token, isAdmin, canAccessManager, loading: authLoading } = useAuth();
  const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || import.meta.env.REACT_APP_BACKEND_URL || window.location.origin;

  const tabs = [
    { id: 'general', label: 'General Settings', icon: Settings },
    { id: 'provider', label: 'SMS Provider', icon: MessageSquare },
    { id: 'test', label: 'Test & Verify', icon: TestTube }
  ];

  const fetchSmsConfig = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/sms-config`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setSmsConfig(data);
      } else {
        throw new Error('Failed to fetch SMS configuration');
      }
    } catch (err) {
      setError('Failed to load SMS configuration');
      console.error('Error fetching SMS config:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authLoading) return;
    if (token && !user) return;

    if (user && canAccessManager()) {
      setError(null);
      fetchSmsConfig();
    } else if (user && !canAccessManager()) {
      setError('Access denied. Manager or admin privileges required.');
      setLoading(false);
    } else if (!token) {
      setError('Please log in as a manager or admin to configure SMS settings.');
      setLoading(false);
    }
  }, [user, token, authLoading]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSmsConfig(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/sms-config`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(smsConfig)
      });

      if (response.ok) {
        setSuccess('SMS configuration saved successfully!');
      } else {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to save SMS configuration');
      }
    } catch (err) {
      console.error('Error saving SMS config:', err);
      setError(err.message || 'Failed to save SMS configuration');
    } finally {
      setSaving(false);
    }
  };

  const handleTestSms = async () => {
    if (!smsConfig.notification_phone) {
      setError('Please enter a notification phone number to test');
      return;
    }

    setTesting(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/sms-config/test`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          test_phone: smsConfig.notification_phone
        })
      });

      if (response.ok) {
        setSuccess(`Test SMS sent successfully to ${smsConfig.notification_phone}!`);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to send test SMS');
      }
    } catch (err) {
      console.error('Error testing SMS:', err);
      setError(err.message || 'Failed to send test SMS');
    } finally {
      setTesting(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-2">Loading SMS configuration...</p>
        </div>
      </div>
    );
  }

  if (error && !user) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
            <span className="text-red-800">{error}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <MessageSquare className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">SMS Configuration</h1>
            <p className="text-gray-600">Configure SMS providers and notification settings</p>
          </div>
        </div>
      </div>

      {/* Error/Success Messages */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
            <span className="text-red-800">{error}</span>
          </div>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
            <span className="text-green-800">{success}</span>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex space-x-1 mb-8">
        {tabs.map((tab) => {
          const IconComponent = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-blue-100 text-blue-700 border border-blue-200'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <IconComponent className="h-4 w-4 mr-2" />
              {tab.label}
            </button>
          );
        })}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* General Settings Tab */}
        {activeTab === 'general' && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center mb-6">
              <Settings className="h-5 w-5 text-gray-600 mr-2" />
              <h2 className="text-xl font-semibold text-gray-900">General Settings</h2>
            </div>

            <div className="space-y-6">
              {/* Enable SMS */}
              <div className="flex items-start space-x-3">
                <div className="flex items-center h-5">
                  <input
                    id="is_enabled"
                    name="is_enabled"
                    type="checkbox"
                    checked={smsConfig.is_enabled}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <label htmlFor="is_enabled" className="text-sm font-medium text-gray-900">
                    Enable SMS Notifications
                  </label>
                  <p className="text-sm text-gray-500">
                    Allow the system to send SMS notifications and marketing messages
                  </p>
                </div>
              </div>

              {/* Notification Phone */}
              <div>
                <label htmlFor="notification_phone" className="block text-sm font-medium text-gray-700 mb-2">
                  <Phone className="h-4 w-4 inline mr-2" />
                  Notification Phone Number
                </label>
                <input
                  type="tel"
                  id="notification_phone"
                  name="notification_phone"
                  value={smsConfig.notification_phone}
                  onChange={handleInputChange}
                  placeholder="+1234567890"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Phone number to receive system notifications and test messages
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Provider Settings Tab */}
        {activeTab === 'provider' && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center mb-6">
              <MessageSquare className="h-5 w-5 text-gray-600 mr-2" />
              <h2 className="text-xl font-semibold text-gray-900">SMS Provider Configuration</h2>
            </div>

            <div className="space-y-6">
              {/* Provider Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-4">Choose SMS Provider</label>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <input
                      id="provider_twilio"
                      name="sms_provider"
                      type="radio"
                      value="twilio"
                      checked={smsConfig.sms_provider === 'twilio'}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                    />
                    <label htmlFor="provider_twilio" className="ml-3 block text-sm font-medium text-gray-700">
                      Twilio SMS
                    </label>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      id="provider_sendgrid"
                      name="sms_provider"
                      type="radio"
                      value="sendgrid"
                      checked={smsConfig.sms_provider === 'sendgrid'}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                    />
                    <label htmlFor="provider_sendgrid" className="ml-3 block text-sm font-medium text-gray-700">
                      SendGrid SMS
                    </label>
                  </div>
                </div>
              </div>

              {/* Twilio Settings */}
              {smsConfig.sms_provider === 'twilio' && (
                <div className="bg-blue-50 rounded-lg p-4 space-y-4">
                  <div className="flex items-center mb-3">
                    <Info className="h-4 w-4 text-blue-600 mr-2" />
                    <span className="text-sm font-medium text-blue-900">Twilio SMS Configuration</span>
                  </div>
                  
                  <div>
                    <label htmlFor="twilio_account_sid" className="block text-sm font-medium text-gray-700 mb-2">
                      Account SID
                    </label>
                    <input
                      type="text"
                      id="twilio_account_sid"
                      name="twilio_account_sid"
                      value={smsConfig.twilio_account_sid}
                      onChange={handleInputChange}
                      placeholder="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                      required={smsConfig.sms_provider === 'twilio'}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label htmlFor="twilio_auth_token" className="block text-sm font-medium text-gray-700 mb-2">
                      Auth Token
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        id="twilio_auth_token"
                        name="twilio_auth_token"
                        value={smsConfig.twilio_auth_token}
                        onChange={handleInputChange}
                        placeholder="Your Twilio Auth Token"
                        required={smsConfig.sms_provider === 'twilio'}
                        className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4 text-gray-400" /> : <Eye className="h-4 w-4 text-gray-400" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="twilio_phone_number" className="block text-sm font-medium text-gray-700 mb-2">
                      Twilio Phone Number
                    </label>
                    <input
                      type="tel"
                      id="twilio_phone_number"
                      name="twilio_phone_number"
                      value={smsConfig.twilio_phone_number}
                      onChange={handleInputChange}
                      placeholder="+1234567890"
                      required={smsConfig.sms_provider === 'twilio'}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      Your Twilio phone number (sender ID)
                    </p>
                  </div>
                </div>
              )}

              {/* SendGrid Settings */}
              {smsConfig.sms_provider === 'sendgrid' && (
                <div className="bg-green-50 rounded-lg p-4 space-y-4">
                  <div className="flex items-center mb-3">
                    <Info className="h-4 w-4 text-green-600 mr-2" />
                    <span className="text-sm font-medium text-green-900">SendGrid SMS Configuration</span>
                  </div>

                  <div>
                    <label htmlFor="sendgrid_api_key" className="block text-sm font-medium text-gray-700 mb-2">
                      SendGrid API Key
                    </label>
                    <div className="relative">
                      <input
                        type={showApiKey ? "text" : "password"}
                        id="sendgrid_api_key"
                        name="sendgrid_api_key"
                        value={smsConfig.sendgrid_api_key}
                        onChange={handleInputChange}
                        placeholder="SG.xxxxxxxxxx"
                        required={smsConfig.sms_provider === 'sendgrid'}
                        className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowApiKey(!showApiKey)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      >
                        {showApiKey ? <EyeOff className="h-4 w-4 text-gray-400" /> : <Eye className="h-4 w-4 text-gray-400" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="sender_phone" className="block text-sm font-medium text-gray-700 mb-2">
                      Sender Phone Number
                    </label>
                    <input
                      type="tel"
                      id="sender_phone"
                      name="sender_phone"
                      value={smsConfig.sender_phone}
                      onChange={handleInputChange}
                      placeholder="+1234567890"
                      required={smsConfig.sms_provider === 'sendgrid'}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      Phone number to send SMS from
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Test & Verify Tab */}
        {activeTab === 'test' && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center mb-6">
              <TestTube className="h-5 w-5 text-gray-600 mr-2" />
              <h2 className="text-xl font-semibold text-gray-900">Test & Verify SMS Configuration</h2>
            </div>

            <div className="space-y-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-900 mb-3">Current Configuration Status</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">SMS Enabled:</span>
                    <span className={`text-sm font-medium ${smsConfig.is_enabled ? 'text-green-600' : 'text-red-600'}`}>
                      {smsConfig.is_enabled ? 'Yes' : 'No'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Provider:</span>
                    <span className="text-sm font-medium text-gray-900 capitalize">{smsConfig.sms_provider}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Notification Phone:</span>
                    <span className="text-sm font-medium text-gray-900">{smsConfig.notification_phone || 'Not set'}</span>
                  </div>
                </div>
              </div>

              {smsConfig.is_enabled && (
                <div>
                  <button
                    type="button"
                    onClick={handleTestSms}
                    disabled={testing || !smsConfig.notification_phone}
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send className="h-4 w-4 mr-2" />
                    {testing ? 'Sending Test SMS...' : 'Send Test SMS'}
                  </button>
                  <p className="text-sm text-gray-500 mt-2">
                    This will send a test SMS to your notification phone number to verify the configuration.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Cog className="h-4 w-4 mr-2" />
            {saving ? 'Saving Configuration...' : 'Save Configuration'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SMSConfiguration;