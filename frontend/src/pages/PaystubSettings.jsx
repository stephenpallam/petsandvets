import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Building2, DollarSign, FileText, Save, AlertCircle, CheckCircle, MapPin, Hash } from 'lucide-react';
import axios from 'axios';

const PaystubSettings = () => {
  const { user, token, canAccessManager, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [config, setConfig] = useState({
    // Tax Rates
    social_security_rate: 6.2,
    medicare_rate: 1.45,
    federal_income_tax_rate: 12.0,
    state: '',
    state_income_tax_rate: 0.0,
    
    // Employer Information
    employer_name: '',
    employer_address_line1: '',
    employer_address_line2: '',
    employer_city: '',
    employer_state: '',
    employer_zip_code: '',
    employer_ein: '',
    
    // Deduction Categories
    deduction_categories: [
      { name: 'Health Insurance', is_active: true },
      { name: 'Dental Insurance', is_active: true },
      { name: 'Vision Insurance', is_active: true },
      { name: '401(k)', is_active: true },
      { name: 'Life Insurance', is_active: true },
      { name: 'Parking', is_active: false },
      { name: 'Other', is_active: true }
    ]
  });

  // US States with typical state income tax rates
  const stateOptions = [
    { code: '', name: 'Select State', rate: 0.0 },
    { code: 'AL', name: 'Alabama', rate: 5.0 },
    { code: 'AK', name: 'Alaska', rate: 0.0 },
    { code: 'AZ', name: 'Arizona', rate: 4.5 },
    { code: 'AR', name: 'Arkansas', rate: 6.5 },
    { code: 'CA', name: 'California', rate: 9.3 },
    { code: 'CO', name: 'Colorado', rate: 4.4 },
    { code: 'CT', name: 'Connecticut', rate: 6.99 },
    { code: 'DE', name: 'Delaware', rate: 6.6 },
    { code: 'FL', name: 'Florida', rate: 0.0 },
    { code: 'GA', name: 'Georgia', rate: 5.75 },
    { code: 'HI', name: 'Hawaii', rate: 8.25 },
    { code: 'ID', name: 'Idaho', rate: 6.0 },
    { code: 'IL', name: 'Illinois', rate: 4.95 },
    { code: 'IN', name: 'Indiana', rate: 3.23 },
    { code: 'IA', name: 'Iowa', rate: 6.8 },
    { code: 'KS', name: 'Kansas', rate: 5.7 },
    { code: 'KY', name: 'Kentucky', rate: 5.0 },
    { code: 'LA', name: 'Louisiana', rate: 4.25 },
    { code: 'ME', name: 'Maine', rate: 7.15 },
    { code: 'MD', name: 'Maryland', rate: 5.75 },
    { code: 'MA', name: 'Massachusetts', rate: 5.0 },
    { code: 'MI', name: 'Michigan', rate: 4.25 },
    { code: 'MN', name: 'Minnesota', rate: 7.05 },
    { code: 'MS', name: 'Mississippi', rate: 5.0 },
    { code: 'MO', name: 'Missouri', rate: 5.3 },
    { code: 'MT', name: 'Montana', rate: 6.75 },
    { code: 'NE', name: 'Nebraska', rate: 6.84 },
    { code: 'NV', name: 'Nevada', rate: 0.0 },
    { code: 'NH', name: 'New Hampshire', rate: 0.0 },
    { code: 'NJ', name: 'New Jersey', rate: 8.97 },
    { code: 'NM', name: 'New Mexico', rate: 5.9 },
    { code: 'NY', name: 'New York', rate: 8.82 },
    { code: 'NC', name: 'North Carolina', rate: 4.99 },
    { code: 'ND', name: 'North Dakota', rate: 2.9 },
    { code: 'OH', name: 'Ohio', rate: 3.99 },
    { code: 'OK', name: 'Oklahoma', rate: 5.0 },
    { code: 'OR', name: 'Oregon', rate: 8.75 },
    { code: 'PA', name: 'Pennsylvania', rate: 3.07 },
    { code: 'RI', name: 'Rhode Island', rate: 5.99 },
    { code: 'SC', name: 'South Carolina', rate: 7.0 },
    { code: 'SD', name: 'South Dakota', rate: 0.0 },
    { code: 'TN', name: 'Tennessee', rate: 0.0 },
    { code: 'TX', name: 'Texas', rate: 0.0 },
    { code: 'UT', name: 'Utah', rate: 4.95 },
    { code: 'VT', name: 'Vermont', rate: 6.8 },
    { code: 'VA', name: 'Virginia', rate: 5.75 },
    { code: 'WA', name: 'Washington', rate: 0.0 },
    { code: 'WV', name: 'West Virginia', rate: 6.5 },
    { code: 'WI', name: 'Wisconsin', rate: 6.27 },
    { code: 'WY', name: 'Wyoming', rate: 0.0 }
  ];

  useEffect(() => {
    if (!authLoading && (!user || !canAccessManager())) {
      setMessage({ type: 'error', text: 'Access denied. Manager or admin privileges required.' });
      return;
    }
    
    if (user && token && canAccessManager()) {
      fetchPaystubConfig();
    }
  }, [user, token, authLoading, canAccessManager]);

  const fetchPaystubConfig = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/paystub-config`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data) {
        setConfig({ ...config, ...response.data });
      }
    } catch (error) {
      if (error.response?.status !== 404) {
        console.error('Error fetching paystub config:', error);
        setMessage({ type: 'error', text: 'Failed to load paystub configuration' });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleStateChange = (stateCode) => {
    const selectedState = stateOptions.find(state => state.code === stateCode);
    setConfig(prev => ({
      ...prev,
      state: stateCode,
      state_income_tax_rate: selectedState ? selectedState.rate : 0.0
    }));
  };

  const handleDeductionToggle = (index) => {
    setConfig(prev => ({
      ...prev,
      deduction_categories: prev.deduction_categories.map((cat, i) => 
        i === index ? { ...cat, is_active: !cat.is_active } : cat
      )
    }));
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      setMessage({ type: '', text: '' });

      // Validation
      if (!config.employer_name.trim()) {
        setMessage({ type: 'error', text: 'Employer name is required' });
        setLoading(false);
        return;
      }

      if (!config.employer_ein.trim()) {
        setMessage({ type: 'error', text: 'Employer EIN is required' });
        setLoading(false);
        return;
      }

      await axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/paystub-config`, config, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setMessage({ type: 'success', text: 'Paystub settings saved successfully!' });
    } catch (error) {
      console.error('Error saving paystub config:', error);
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.detail || 'Failed to save paystub settings' 
      });
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading paystub settings...</p>
        </div>
      </div>
    );
  }

  if (!user || !canAccessManager()) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">Manager or admin privileges required to access paystub settings.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Header */}
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                Paystub Settings
              </h2>
              <button
                onClick={handleSave}
                disabled={loading}
                className="text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center space-x-2"
                style={{ 
                  backgroundColor: loading ? 'rgb(156, 163, 175)' : 'rgb(41, 173, 211)',
                  cursor: loading ? 'not-allowed' : 'pointer'
                }}
                onMouseEnter={(e) => {
                  if (!loading) {
                    e.target.style.backgroundColor = 'rgb(31, 163, 201)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!loading) {
                    e.target.style.backgroundColor = 'rgb(41, 173, 211)';
                  }
                }}
              >
                <Save className="h-4 w-4" />
                <span>{loading ? 'Saving...' : 'Save Settings'}</span>
              </button>
            </div>
          </div>

          <div className="p-6">
            {/* Message Display */}
            {message.text && (
              <div className={`mb-6 flex items-center p-4 rounded-lg ${
                message.type === 'error' 
                  ? 'bg-red-50 text-red-800 border border-red-200' 
                  : 'bg-green-50 text-green-800 border border-green-200'
              }`}>
                {message.type === 'error' ? (
                  <AlertCircle className="h-5 w-5 mr-3 flex-shrink-0" />
                ) : (
                  <CheckCircle className="h-5 w-5 mr-3 flex-shrink-0" />
                )}
                <span>{message.text}</span>
              </div>
            )}

            {/* Employer Information */}
            <div className="mb-8">
              <div className="flex items-center mb-4">
                <Building2 className="h-5 w-5 text-gray-500 mr-2" />
                <h3 className="text-lg font-medium text-gray-900">Employer Information</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Company Name *
                  </label>
                  <input
                    type="text"
                    value={config.employer_name}
                    onChange={(e) => setConfig(prev => ({ ...prev, employer_name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter company name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    EIN (Employer ID Number) *
                  </label>
                  <div className="relative">
                    <Hash className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      value={config.employer_ein}
                      onChange={(e) => setConfig(prev => ({ ...prev, employer_ein: e.target.value }))}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="XX-XXXXXXX"
                    />
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Address Line 1
                  </label>
                  <input
                    type="text"
                    value={config.employer_address_line1}
                    onChange={(e) => setConfig(prev => ({ ...prev, employer_address_line1: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Street address"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Address Line 2
                  </label>
                  <input
                    type="text"
                    value={config.employer_address_line2}
                    onChange={(e) => setConfig(prev => ({ ...prev, employer_address_line2: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Suite, apartment, etc. (optional)"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    City
                  </label>
                  <input
                    type="text"
                    value={config.employer_city}
                    onChange={(e) => setConfig(prev => ({ ...prev, employer_city: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="City"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    State
                  </label>
                  <select
                    value={config.employer_state}
                    onChange={(e) => setConfig(prev => ({ ...prev, employer_state: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {stateOptions.map(state => (
                      <option key={state.code} value={state.code}>
                        {state.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ZIP Code
                  </label>
                  <input
                    type="text"
                    value={config.employer_zip_code}
                    onChange={(e) => setConfig(prev => ({ ...prev, employer_zip_code: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="ZIP Code"
                  />
                </div>
              </div>
            </div>

            {/* Tax Configuration */}
            <div className="mb-8">
              <div className="flex items-center mb-4">
                <DollarSign className="h-5 w-5 text-gray-500 mr-2" />
                <h3 className="text-lg font-medium text-gray-900">Tax Configuration</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Social Security Rate (%)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    value={config.social_security_rate}
                    onChange={(e) => setConfig(prev => ({ ...prev, social_security_rate: parseFloat(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Medicare Rate (%)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    value={config.medicare_rate}
                    onChange={(e) => setConfig(prev => ({ ...prev, medicare_rate: parseFloat(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Federal Income Tax Rate (%)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    value={config.federal_income_tax_rate}
                    onChange={(e) => setConfig(prev => ({ ...prev, federal_income_tax_rate: parseFloat(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    State
                  </label>
                  <select
                    value={config.state}
                    onChange={(e) => handleStateChange(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {stateOptions.map(state => (
                      <option key={state.code} value={state.code}>
                        {state.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    State Income Tax Rate (%)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    value={config.state_income_tax_rate}
                    onChange={(e) => setConfig(prev => ({ ...prev, state_income_tax_rate: parseFloat(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Automatically populated based on state selection"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Rate is automatically populated when you select a state, but can be manually adjusted
                  </p>
                </div>
              </div>
            </div>

            {/* Deduction Categories */}
            <div className="mb-8">
              <div className="flex items-center mb-4">
                <FileText className="h-5 w-5 text-gray-500 mr-2" />
                <h3 className="text-lg font-medium text-gray-900">Deduction Categories</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {config.deduction_categories.map((category, index) => (
                  <div key={index} className="flex items-center p-3 border border-gray-200 rounded-lg">
                    <input
                      type="checkbox"
                      checked={category.is_active}
                      onChange={() => handleDeductionToggle(index)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label className="ml-3 text-sm font-medium text-gray-700">
                      {category.name}
                    </label>
                  </div>
                ))}
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Select which deduction categories should be available when generating paystubs
              </p>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default PaystubSettings;