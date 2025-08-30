import React, { useState, useEffect } from 'react';
import { Building, Save, RefreshCw, Globe, Phone, Mail, MapPin, Facebook, Instagram, Twitter, ExternalLink } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

const BusinessInfo = () => {
  const [businessInfo, setBusinessInfo] = useState({
    hospital_name: '',
    tagline: '',
    phone: '',
    email: '',
    address: '',
    facebook_link: '',
    instagram_link: '',
    twitter_link: '',
    hero_images: []
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [googleConnected, setGoogleConnected] = useState(false);

  const { user, token, isAdmin } = useAuth();
  const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || import.meta.env.REACT_APP_BACKEND_URL;

  const fetchBusinessInfo = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/business-info`);
      
      if (response.ok) {
        const data = await response.json();
        setBusinessInfo(data);
      } else {
        throw new Error('Failed to fetch business information');
      }
    } catch (err) {
      setError('Failed to load business information');
      console.error('Error fetching business info:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && isAdmin()) {
      fetchBusinessInfo();
      checkGoogleConnection();
    } else if (user && !isAdmin()) {
      setError('Access denied. Admin privileges required.');
      setLoading(false);
    } else {
      setError('Please log in as an admin to manage business information.');
      setLoading(false);
    }
  }, [user]);

  const checkGoogleConnection = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/google-business/settings`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setGoogleConnected(response.data.is_connected || false);
    } catch (err) {
      console.error('Error checking Google connection:', err);
    }
  };

  const handleGoogleSync = async () => {
    setSyncing(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await axios.post(`${API_BASE_URL}/api/google-business/sync`, 
        { sync_type: 'business_info' },
        {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        setSuccess('Business information synced to Google Business Profile successfully!');
      } else {
        setError(response.data.message || 'Sync failed');
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to sync to Google Business Profile');
    } finally {
      setSyncing(false);
      setTimeout(() => {
        setSuccess(null);
        setError(null);
      }, 5000);
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
    setError(null);
    setSuccess(null);
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/business-info`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(businessInfo)
      });

      if (response.ok) {
        const updatedInfo = await response.json();
        setBusinessInfo(updatedInfo);
        setSuccess('Business information updated successfully!');
        // Clear success message after 3 seconds
        setTimeout(() => setSuccess(null), 3000);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to update business information');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-lg shadow-sm border border-gray-200">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Authentication Required</h1>
          <p className="text-gray-600 mb-4">You must be logged in as an admin to manage business information.</p>
          <p className="text-sm text-gray-500">Please log in using the login button in the top navigation bar.</p>
        </div>
      </div>
    );
  }

  if (user && !isAdmin()) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-lg shadow-sm border border-gray-200">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-4">Admin privileges are required to manage business information.</p>
          <p className="text-sm text-gray-500">Please contact an administrator if you need access.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading business information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-center">
            <Building className="h-8 w-8 text-blue-600 mr-4" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Business Information</h1>
              <p className="mt-2 text-gray-600">
                Manage your hospital's business information that appears throughout the website
              </p>
            </div>
          </div>
        </div>

        {/* Success Alert */}
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6">
            {success}
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Business Information Form */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Hospital Name & Tagline */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Building className="h-4 w-4 inline mr-2" />
                  Hospital Name
                </label>
                <input
                  type="text"
                  name="hospital_name"
                  value={businessInfo.hospital_name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Pets and Vets Animal Hospital"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Globe className="h-4 w-4 inline mr-2" />
                  Tagline
                </label>
                <input
                  type="text"
                  name="tagline"
                  value={businessInfo.tagline}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Compassionate Care for Your Beloved Pets"
                />
              </div>
            </div>

            {/* Phone & Email */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Phone className="h-4 w-4 inline mr-2" />
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={businessInfo.phone}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="(703) 957-3297"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Mail className="h-4 w-4 inline mr-2" />
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={businessInfo.email}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="vet@petsandvetsanimalhospital.com"
                />
              </div>
            </div>

            {/* Address */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <MapPin className="h-4 w-4 inline mr-2" />
                Full Address
              </label>
              <input
                type="text"
                name="address"
                value={businessInfo.address}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="43114 Peacock Market Plaza, Suite F110, South Riding, VA 20152"
              />
            </div>

            {/* Social Media Links */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">
                Social Media Links
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Facebook className="h-4 w-4 inline mr-2 text-blue-600" />
                    Facebook URL
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
                    Instagram URL
                  </label>
                  <input
                    type="url"
                    name="instagram_link"
                    value={businessInfo.instagram_link}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="https://instagram.com/yourpage"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Twitter className="h-4 w-4 inline mr-2 text-blue-400" />
                    Twitter URL
                  </label>
                  <input
                    type="url"
                    name="twitter_link"
                    value={businessInfo.twitter_link}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="https://twitter.com/yourpage"
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex items-center space-x-4 pt-6 border-t border-gray-200">
              {/* Google Sync Section */}
              {googleConnected ? (
                <button
                  type="button"
                  onClick={handleGoogleSync}
                  disabled={syncing}
                  className="inline-flex items-center px-4 py-2 text-white rounded-md hover:opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ backgroundColor: '#29add3' }}
                >
                  {syncing ? (
                    <>
                      <RefreshCw className="animate-spin h-4 w-4 mr-2" />
                      Syncing to Google...
                    </>
                  ) : (
                    <>
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Sync to Google Business
                    </>
                  )}
                </button>
              ) : (
                <a 
                  href="/google-integration" 
                  className="inline-flex items-center px-4 py-2 text-white rounded-md hover:opacity-90 transition-colors font-medium no-underline"
                  style={{ backgroundColor: '#29add3' }}
                >
                  Connect Google Business Profile
                </a>
              )}

              {/* Save Button */}
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center px-6 py-3 text-white rounded-lg hover:opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: '#29add3' }}
              >
                {saving ? (
                  <>
                    <RefreshCw className="animate-spin h-4 w-4 mr-2" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Information Note */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <Building className="h-5 w-5 text-blue-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">
                About Business Information
              </h3>
              <div className="mt-2 text-sm text-blue-700">
                <ul className="list-disc list-inside space-y-1">
                  <li>Changes will appear immediately across the entire website</li>
                  <li>The hospital name and tagline appear in the header and footer</li>
                  <li>Contact information is displayed in multiple locations</li>
                  <li>Social media links will be shown in the footer (leave blank to hide)</li>
                  <li>For photo management, use the dedicated Photo Management page</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusinessInfo;