import React, { useState, useEffect } from 'react';
import { Building, Save, RefreshCw, Globe, Phone, Mail, MapPin, Facebook, Instagram, Twitter, MessageCircle, ExternalLink, AlertCircle, CheckCircle, Star } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const BusinessInfo = () => {
  const [activeTab, setActiveTab] = useState('business');
  const [businessInfo, setBusinessInfo] = useState({
    hospital_name: '',
    tagline: '',
    phone: '',
    email: '',
    address: '',
    timezone: 'America/New_York',
    facebook_link: '',
    instagram_link: '',
    twitter_link: '',
    whatsapp_group_link: '',
    google_reviews_link: '',
    yelp_reviews_link: '',
    facebook_reviews_link: '',
    hero_images: []
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [authError, setAuthError] = useState('');

  const { user, token, isAdmin, canAccessManager, loading: authLoading } = useAuth();
  const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || import.meta.env.REACT_APP_BACKEND_URL || window.location.origin;

  const tabs = [
    { id: 'business', label: 'Business Info', icon: Building, color: '#29add3' },
    { id: 'social', label: 'Social Media', icon: Globe, color: '#29add3' },
    { id: 'reviews', label: 'Review Platforms', icon: Star, color: '#29add3' }
  ];

  const clearMessage = () => {
    setTimeout(() => setMessage({ type: '', text: '' }), 5000);
  };

  const fetchBusinessInfo = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/business-info`);
      if (response.ok) {
        const data = await response.json();
        setBusinessInfo(data);
      } else {
        throw new Error('Failed to fetch business info');
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to load business information' });
      clearMessage();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authLoading) return;
    if (token && !user) return;

    if (user && canAccessManager()) {
      setAuthError('');
      fetchBusinessInfo();
    } else if (user && !canAccessManager()) {
      setAuthError('Access denied. Manager or admin privileges required.');
      setLoading(false);
    } else if (!token) {
      setAuthError('Please log in as a manager or admin to access business information.');
      setLoading(false);
    }
  }, [user, token, authLoading]);

  const handleGoogleSync = async () => {
    setSyncing(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await fetch(`${API_BASE_URL}/api/business-info/sync-google`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: businessInfo.hospital_name,
          phone: businessInfo.phone,
          address: businessInfo.address
        })
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Business information synced to Google Business Profile successfully!' });
        clearMessage();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to sync with Google Business Profile');
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
      clearMessage();
    } finally {
      setSyncing(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setBusinessInfo(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await fetch(`${API_BASE_URL}/api/business-info`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(businessInfo)
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Business information updated successfully!' });
        clearMessage();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to update business information');
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
      clearMessage();
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: '#29add3' }}></div>
      </div>
    );
  }

  if (authError) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-8 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-red-800 mb-2">Access Denied</h2>
            <p className="text-red-600">{authError}</p>
            <p className="text-red-600 text-sm mt-2">Please log in with a manager or admin account.</p>
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
                Business Information
              </h2>
            </div>
          </div>

          {/* Content Area */}
          <div className="p-6">
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
                          <Icon className="h-4 w-4" style={{ color: isActive ? tab.color : undefined }} />
                          <span>{tab.label}</span>
                        </div>
                      </button>
                    );
                  })}
                </nav>
              </div>

              {/* Tab Content */}
              <form onSubmit={handleSubmit} className="p-3 sm:p-6">
                
                {/* Business Info Tab */}
                {activeTab === 'business' && (
                  <div className="space-y-6">
                    <div className="flex flex-col sm:flex-row justify-end items-stretch sm:items-center mb-4 sm:mb-6 gap-3">
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:space-x-3">
                        {/* Google Sync Button */}
                        <button
                          type="button"
                          onClick={handleGoogleSync}
                          disabled={syncing}
                          className="w-full sm:w-auto text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center sm:justify-start font-medium"
                          style={{ 
                            backgroundColor: syncing ? '#94a3b8' : '#29add3'
                          }}
                          onMouseEnter={(e) => {
                            if (!syncing) e.target.style.backgroundColor = '#2196c7';
                          }}
                          onMouseLeave={(e) => {
                            if (!syncing) e.target.style.backgroundColor = '#29add3';
                          }}
                        >
                          <RefreshCw className={`h-4 w-4 mr-2 ${syncing ? 'animate-spin' : ''}`} />
                          {syncing ? 'Syncing...' : 'Sync to Google'}
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <Building className="h-4 w-4 inline mr-2" />
                          Hospital Name *
                        </label>
                        <input
                          type="text"
                          name="hospital_name"
                          value={businessInfo.hospital_name}
                          onChange={handleInputChange}
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Tagline
                        </label>
                        <input
                          type="text"
                          name="tagline"
                          value={businessInfo.tagline}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Your pet's health is our priority"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <Phone className="h-4 w-4 inline mr-2" />
                          Phone Number *
                        </label>
                        <input
                          type="tel"
                          name="phone"
                          value={businessInfo.phone}
                          onChange={handleInputChange}
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <Mail className="h-4 w-4 inline mr-2" />
                          Email Address *
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={businessInfo.email}
                          onChange={handleInputChange}
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <MapPin className="h-4 w-4 inline mr-2" />
                        Address *
                      </label>
                      <textarea
                        name="address"
                        value={businessInfo.address}
                        onChange={handleInputChange}
                        required
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Full business address"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <Globe className="h-4 w-4 inline mr-2" />
                        Business Timezone *
                      </label>
                      <select
                        name="timezone"
                        value={businessInfo.timezone}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <optgroup label="US Timezones">
                          <option value="America/New_York">Eastern Time (ET)</option>
                          <option value="America/Chicago">Central Time (CT)</option>
                          <option value="America/Denver">Mountain Time (MT)</option>
                          <option value="America/Los_Angeles">Pacific Time (PT)</option>
                          <option value="America/Anchorage">Alaska Time (AKT)</option>
                          <option value="Pacific/Honolulu">Hawaii Time (HST)</option>
                        </optgroup>
                        <optgroup label="Canada Timezones">
                          <option value="America/Toronto">Eastern Time - Toronto</option>
                          <option value="America/Winnipeg">Central Time - Winnipeg</option>
                          <option value="America/Edmonton">Mountain Time - Edmonton</option>
                          <option value="America/Vancouver">Pacific Time - Vancouver</option>
                        </optgroup>
                        <optgroup label="India & Asia">
                          <option value="Asia/Kolkata">India Standard Time (IST)</option>
                          <option value="Asia/Tokyo">Tokyo (JST)</option>
                          <option value="Asia/Singapore">Singapore (SGT)</option>
                          <option value="Asia/Dubai">Dubai (GST)</option>
                        </optgroup>
                        <optgroup label="Europe & Others">
                          <option value="Europe/London">London (GMT/BST)</option>
                          <option value="Europe/Paris">Paris (CET/CEST)</option>
                          <option value="Australia/Sydney">Sydney (AEST/AEDT)</option>
                        </optgroup>
                      </select>
                      <p className="mt-2 text-sm text-gray-600">
                        This timezone will be used for all appointment scheduling and business hours calculations.
                      </p>
                    </div>
                  </div>
                )}

                {/* Social Media Tab */}
                {activeTab === 'social' && (
                  <div className="space-y-6">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <Facebook className="h-4 w-4 inline mr-2 text-blue-600" />
                          Facebook Page URL
                        </label>
                        <input
                          type="url"
                          name="facebook_link"
                          value={businessInfo.facebook_link}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="https://facebook.com/yourpage"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <Instagram className="h-4 w-4 inline mr-2 text-pink-600" />
                          Instagram Profile URL
                        </label>
                        <input
                          type="url"
                          name="instagram_link"
                          value={businessInfo.instagram_link}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="https://instagram.com/yourprofile"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <Twitter className="h-4 w-4 inline mr-2 text-blue-400" />
                          Twitter Profile URL
                        </label>
                        <input
                          type="url"
                          name="twitter_link"
                          value={businessInfo.twitter_link}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="https://twitter.com/yourprofile"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <MessageCircle className="h-4 w-4 inline mr-2 text-green-600" />
                          WhatsApp Group URL
                        </label>
                        <input
                          type="url"
                          name="whatsapp_group_link"
                          value={businessInfo.whatsapp_group_link}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="https://chat.whatsapp.com/..."
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Link to your WhatsApp group for community updates
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Review Platforms Tab */}
                {activeTab === 'reviews' && (
                  <div className="space-y-6">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <Globe className="h-4 w-4 inline mr-2 text-blue-500" />
                          Google Reviews URL
                        </label>
                        <input
                          type="url"
                          name="google_reviews_link"
                          value={businessInfo.google_reviews_link}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="https://g.page/r/..."
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Link to your Google Business reviews page
                        </p>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <ExternalLink className="h-4 w-4 inline mr-2 text-red-600" />
                          Yelp Reviews URL
                        </label>
                        <input
                          type="url"
                          name="yelp_reviews_link"
                          value={businessInfo.yelp_reviews_link}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="https://www.yelp.com/biz/..."
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Link to your Yelp business reviews page
                        </p>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <Facebook className="h-4 w-4 inline mr-2 text-blue-600" />
                          Facebook Reviews URL
                        </label>
                        <input
                          type="url"
                          name="facebook_reviews_link"
                          value={businessInfo.facebook_reviews_link}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="https://www.facebook.com/pg/.../reviews/"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Link to your Facebook business reviews page
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Submit Button */}
                <div className="flex justify-end pt-6 border-t border-gray-200 mt-8">
                  <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex items-center px-6 py-2 border border-transparent text-sm font-medium rounded-md text-white transition-colors disabled:opacity-50"
                    style={{ backgroundColor: saving ? '#94a3b8' : '#29add3' }}
                    onMouseEnter={(e) => {
                      if (!saving) e.target.style.backgroundColor = '#2196c7';
                    }}
                    onMouseLeave={(e) => {
                      if (!saving) e.target.style.backgroundColor = '#29add3';
                    }}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusinessInfo;