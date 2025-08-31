import React, { useState, useEffect } from 'react';
import { Mail, Send, Settings, CheckCircle, AlertCircle, Eye, EyeOff, Info, Cog, TestTube } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const EmailConfiguration = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [emailConfig, setEmailConfig] = useState({
    notification_email: '',
    email_provider: 'gmail', // 'gmail' or 'sendgrid'
    is_enabled: false,
    // Gmail SMTP fields
    smtp_email: '',
    smtp_password: '',
    // SendGrid fields
    sendgrid_api_key: '',
    sender_email: ''
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);

  const { user, token, isAdmin, canAccessManager, loading: authLoading } = useAuth();
  const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || import.meta.env.REACT_APP_BACKEND_URL;

  const tabs = [
    { id: 'general', label: 'General Settings', icon: Settings },
    { id: 'provider', label: 'Email Provider', icon: Mail },
    { id: 'test', label: 'Test & Verify', icon: TestTube }
  ];

  const fetchEmailConfig = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/email-config`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setEmailConfig(data);
      } else {
        throw new Error('Failed to fetch email configuration');
      }
    } catch (err) {
      setError('Failed to load email configuration');
      console.error('Error fetching email config:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authLoading) return;
    if (token && !user) return;

    if (user && canAccessManager()) {
      setError(null);
      fetchEmailConfig();
    } else if (user && !canAccessManager()) {
      setError('Access denied. Manager or admin privileges required.');
      setLoading(false);
    } else if (!token) {
      setError('Please log in as a manager or admin to configure email settings.');
      setLoading(false);
    }
  }, [user, token, authLoading]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEmailConfig(prev => ({
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
      const response = await fetch(`${API_BASE_URL}/api/email-config`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(emailConfig)
      });

      if (response.ok) {
        setSuccess('Email configuration saved successfully!');
      } else {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to save email configuration');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleTestEmail = async () => {
    setTesting(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/email-config/test`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          test_email: emailConfig.notification_email
        })
      });

      if (response.ok) {
        setSuccess('Test email sent successfully! Check your inbox.');
      } else {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to send test email');
      }
    } catch (err) {
      setError(`Test email failed: ${err.message}`);
    } finally {
      setTesting(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: '#29add3' }}></div>
      </div>
    );
  }

  if (error && !canAccessManager()) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 mr-3" />
              {error}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Header - Inside the main card */}
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                Email Configuration
              </h2>
            </div>
          </div>

          {/* Content Area */}
          <div className="p-6">
            {/* Success Alert */}
            {success && (
              <div className="mb-6 rounded-md p-4 bg-green-50 border border-green-200">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <CheckCircle className="h-5 w-5 text-green-400" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-green-800">
                      {success}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Error Alert */}
            {error && (
              <div className="mb-6 rounded-md p-4 bg-red-50 border border-red-200">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <AlertCircle className="h-5 w-5 text-red-400" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-red-800">
                      {error}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Tab Navigation */}
            <div className="border border-gray-200 rounded-lg mb-4 sm:mb-6">
              <div className="border-b border-gray-200">
                <nav className="flex flex-col sm:flex-row sm:space-x-8 px-3 sm:px-6" aria-label="Tabs">
                  {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className="w-full sm:w-auto py-3 sm:py-4 px-3 sm:px-1 border-b-2 sm:border-l-0 font-medium text-sm transition-colors border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                        style={{
                          borderBottomColor: isActive ? '#29add3' : 'transparent',
                          color: isActive ? '#29add3' : undefined,
                          backgroundColor: isActive ? '#f0fdff' : 'transparent'
                        }}
                      >
                        <div className="flex items-center justify-center sm:justify-start space-x-2">
                          <Icon className="h-4 w-4" />
                          <span>{tab.label}</span>
                        </div>
                      </button>
                    );
                  })}
                </nav>
              </div>

              {/* Tab Content */}
              <form onSubmit={handleSubmit} className="p-3 sm:p-6">
            {/* General Settings Tab */}
            <div className={activeTab === 'general' ? 'block' : 'hidden'}>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">General Settings</h3>
                  
                  {/* Enable Email Notifications */}
                  <div className="flex items-center mb-6">
                    <input
                      type="checkbox"
                      name="is_enabled"
                      id="is_enabled"
                      checked={emailConfig.is_enabled}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="is_enabled" className="ml-3 text-sm sm:text-base text-gray-900">
                      Enable email notifications
                    </label>
                  </div>

                  {/* Notification Email */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Mail className="h-4 w-4 inline mr-2" />
                      Notification Email Address *
                    </label>
                    <input
                      type="email"
                      name="notification_email"
                      value={emailConfig.notification_email}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                      placeholder="notifications@yourpractice.com"
                    />
                    <p className="text-xs sm:text-sm text-gray-500 mt-2">
                      This email will receive appointment and contact form notifications
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Email Provider Tab */}
            <div className={activeTab === 'provider' ? 'block' : 'hidden'}>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Email Provider</h3>
                  
                  {/* Provider Selection */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Choose Email Service Provider
                    </label>
                    <div className="space-y-3">
                      <div className="flex items-center">
                        <input
                          type="radio"
                          name="email_provider"
                          id="gmail"
                          value="gmail"
                          checked={emailConfig.email_provider === 'gmail'}
                          onChange={handleInputChange}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                        />
                        <label htmlFor="gmail" className="ml-3 text-sm sm:text-base text-gray-900">
                          Gmail SMTP <span className="text-sm text-gray-500">(Recommended for small practices)</span>
                        </label>
                      </div>
                      <div className="flex items-center">
                        <input
                          type="radio"
                          name="email_provider"
                          id="sendgrid"
                          value="sendgrid"
                          checked={emailConfig.email_provider === 'sendgrid'}
                          onChange={handleInputChange}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                        />
                        <label htmlFor="sendgrid" className="ml-3 text-sm sm:text-base text-gray-900">
                          SendGrid <span className="text-sm text-gray-500">(Recommended for high volume)</span>
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Gmail SMTP Configuration */}
                  {emailConfig.email_provider === 'gmail' && (
                    <div className="space-y-4">
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-start">
                          <Info className="h-5 w-5 text-blue-600 mr-3 mt-0.5 flex-shrink-0" />
                          <div className="text-sm text-blue-800">
                            <p className="font-medium mb-2">Gmail Setup Instructions:</p>
                            <ol className="list-decimal list-inside space-y-1">
                              <li>Enable 2-factor authentication on your Gmail account</li>
                              <li>Go to Google Account settings → Security → App passwords</li>
                              <li>Generate an app password for "Mail"</li>
                              <li>Use your Gmail address and the generated app password below</li>
                            </ol>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Gmail Email Address *
                          </label>
                          <input
                            type="email"
                            name="smtp_email"
                            value={emailConfig.smtp_email}
                            onChange={handleInputChange}
                            required={emailConfig.email_provider === 'gmail'}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                            placeholder="your-email@gmail.com"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Gmail App Password *
                          </label>
                          <div className="relative">
                            <input
                              type={showPassword ? "text" : "password"}
                              name="smtp_password"
                              value={emailConfig.smtp_password}
                              onChange={handleInputChange}
                              required={emailConfig.email_provider === 'gmail'}
                              className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                              placeholder="16-character app password"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute inset-y-0 right-0 pr-3 flex items-center"
                            >
                              {showPassword ? (
                                <EyeOff className="h-4 w-4 text-gray-400" />
                              ) : (
                                <Eye className="h-4 w-4 text-gray-400" />
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* SendGrid Configuration */}
                  {emailConfig.email_provider === 'sendgrid' && (
                    <div className="space-y-4">
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-start">
                          <Info className="h-5 w-5 text-blue-600 mr-3 mt-0.5 flex-shrink-0" />
                          <div className="text-sm text-blue-800">
                            <p className="font-medium mb-2">SendGrid Setup Instructions:</p>
                            <ol className="list-decimal list-inside space-y-1">
                              <li>Create account at <a href="https://sendgrid.com" target="_blank" rel="noopener noreferrer" className="underline">sendgrid.com</a></li>
                              <li>Go to Settings → API Keys</li>
                              <li>Create API key with "Full Access" permissions</li>
                              <li>Verify a sender email address in SendGrid</li>
                            </ol>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            SendGrid API Key *
                          </label>
                          <div className="relative">
                            <input
                              type={showApiKey ? "text" : "password"}
                              name="sendgrid_api_key"
                              value={emailConfig.sendgrid_api_key}
                              onChange={handleInputChange}
                              required={emailConfig.email_provider === 'sendgrid'}
                              className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                              placeholder="SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                            />
                            <button
                              type="button"
                              onClick={() => setShowApiKey(!showApiKey)}
                              className="absolute inset-y-0 right-0 pr-3 flex items-center"
                            >
                              {showApiKey ? (
                                <EyeOff className="h-4 w-4 text-gray-400" />
                              ) : (
                                <Eye className="h-4 w-4 text-gray-400" />
                              )}
                            </button>
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Verified Sender Email *
                          </label>
                          <input
                            type="email"
                            name="sender_email"
                            value={emailConfig.sender_email}
                            onChange={handleInputChange}
                            required={emailConfig.email_provider === 'sendgrid'}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                            placeholder="noreply@yourpractice.com"
                          />
                          <p className="text-xs sm:text-sm text-gray-500 mt-2">
                            Must be verified in your SendGrid account
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Test & Verify Tab */}
            <div className={activeTab === 'test' ? 'block' : 'hidden'}>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Test & Verify</h3>
                  
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 sm:p-6">
                    <div className="text-center">
                      <TestTube className="h-12 w-12 mx-auto mb-4" style={{ color: '#29add3' }} />
                      <h4 className="text-lg font-medium text-gray-900 mb-2">Test Email Configuration</h4>
                      <p className="text-sm sm:text-base text-gray-600 mb-6">
                        Send a test email to verify your configuration is working correctly.
                      </p>
                      
                      {emailConfig.notification_email && emailConfig.is_enabled ? (
                        <div className="space-y-4">
                          <p className="text-sm text-gray-700">
                            Test email will be sent to: <strong>{emailConfig.notification_email}</strong>
                          </p>
                          <button
                            type="button"
                            onClick={handleTestEmail}
                            disabled={testing}
                            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white transition-colors disabled:opacity-50"
                            style={{ backgroundColor: testing ? '#94a3b8' : '#29add3' }}
                            onMouseEnter={(e) => {
                              if (!testing) e.target.style.backgroundColor = '#2196c7';
                            }}
                            onMouseLeave={(e) => {
                              if (!testing) e.target.style.backgroundColor = '#29add3';
                            }}
                          >
                            <Send className="h-5 w-5 mr-2" />
                            {testing ? 'Sending...' : 'Send Test Email'}
                          </button>
                        </div>
                      ) : (
                        <div className="text-center">
                          <p className="text-sm text-red-600 mb-4">
                            Please configure and enable email notifications first.
                          </p>
                          <div className="text-xs text-gray-500">
                            <p>Required:</p>
                            <ul className="list-disc list-inside mt-1 space-y-1">
                              <li>Enable email notifications</li>
                              <li>Set notification email address</li>
                              <li>Configure email provider settings</li>
                            </ul>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-6 border-t border-gray-200 mt-8">
              <button
                type="submit"
                disabled={saving}
                className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white transition-colors disabled:opacity-50"
                style={{ backgroundColor: saving ? '#94a3b8' : '#29add3' }}
                onMouseEnter={(e) => {
                  if (!saving) e.target.style.backgroundColor = '#2196c7';
                }}
                onMouseLeave={(e) => {
                  if (!saving) e.target.style.backgroundColor = '#29add3';
                }}
              >
                <Settings className="h-5 w-5 mr-2" />
                {saving ? 'Saving...' : 'Save Configuration'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EmailConfiguration;