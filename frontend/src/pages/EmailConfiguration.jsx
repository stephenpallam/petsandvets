import React, { useState, useEffect } from 'react';
import { Mail, Send, Settings, CheckCircle, AlertCircle, Eye, EyeOff, Info } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const EmailConfiguration = () => {
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
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error && !canAccessManager()) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center">
              <Mail className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Email Configuration</h1>
                <p className="text-gray-600 mt-1">Configure email notifications for appointments and contact forms</p>
              </div>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6">
            {/* Success Alert */}
            {success && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6 flex items-center">
                <CheckCircle className="h-5 w-5 mr-3" />
                {success}
              </div>
            )}

            {/* Error Alert */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center">
                <AlertCircle className="h-5 w-5 mr-3" />
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* General Settings */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2 mb-4">
                  General Settings
                </h3>
                
                <div className="space-y-4">
                  {/* Enable Email Notifications */}
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="is_enabled"
                      id="is_enabled"
                      checked={emailConfig.is_enabled}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="is_enabled" className="ml-2 block text-sm text-gray-900">
                      Enable email notifications
                    </label>
                  </div>

                  {/* Notification Email */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Mail className="h-4 w-4 inline mr-2" />
                      Notification Email Address
                    </label>
                    <input
                      type="email"
                      name="notification_email"
                      value={emailConfig.notification_email}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="notifications@yourpractice.com"
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      This email will receive appointment and contact form notifications
                    </p>
                  </div>
                </div>
              </div>

              {/* Email Provider Selection */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2 mb-4">
                  Email Provider
                </h3>
                
                <div className="space-y-4">
                  {/* Provider Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Choose Email Service Provider
                    </label>
                    <div className="space-y-2">
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
                        <label htmlFor="gmail" className="ml-2 block text-sm text-gray-900">
                          Gmail SMTP (Recommended for small practices)
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
                        <label htmlFor="sendgrid" className="ml-2 block text-sm text-gray-900">
                          SendGrid (Recommended for high volume)
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Gmail SMTP Configuration */}
              {emailConfig.email_provider === 'gmail' && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2 mb-4">
                    Gmail SMTP Settings
                  </h3>
                  
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                    <div className="flex items-start">
                      <Info className="h-5 w-5 text-blue-600 mr-3 mt-0.5" />
                      <div className="text-sm text-blue-800">
                        <p className="font-medium mb-1">Setup Instructions:</p>
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
                        Gmail Email Address
                      </label>
                      <input
                        type="email"
                        name="smtp_email"
                        value={emailConfig.smtp_email}
                        onChange={handleInputChange}
                        required={emailConfig.email_provider === 'gmail'}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="your-email@gmail.com"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Gmail App Password
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          name="smtp_password"
                          value={emailConfig.smtp_password}
                          onChange={handleInputChange}
                          required={emailConfig.email_provider === 'gmail'}
                          className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                <div>
                  <h3 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2 mb-4">
                    SendGrid Settings
                  </h3>
                  
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                    <div className="flex items-start">
                      <Info className="h-5 w-5 text-blue-600 mr-3 mt-0.5" />
                      <div className="text-sm text-blue-800">
                        <p className="font-medium mb-1">Setup Instructions:</p>
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
                        SendGrid API Key
                      </label>
                      <div className="relative">
                        <input
                          type={showApiKey ? "text" : "password"}
                          name="sendgrid_api_key"
                          value={emailConfig.sendgrid_api_key}
                          onChange={handleInputChange}
                          required={emailConfig.email_provider === 'sendgrid'}
                          className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                        Verified Sender Email
                      </label>
                      <input
                        type="email"
                        name="sender_email"
                        value={emailConfig.sender_email}
                        onChange={handleInputChange}
                        required={emailConfig.email_provider === 'sendgrid'}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="noreply@yourpractice.com"
                      />
                      <p className="text-sm text-gray-500 mt-1">
                        Must be verified in your SendGrid account
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handleTestEmail}
                  disabled={testing || !emailConfig.notification_email || !emailConfig.is_enabled}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  <Send className="h-4 w-4 mr-2" />
                  {testing ? 'Sending...' : 'Send Test Email'}
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center px-6 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  {saving ? 'Saving...' : 'Save Configuration'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailConfiguration;