import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  Settings, 
  Save, 
  AlertCircle, 
  CheckCircle, 
  X,
  Globe,
  Calendar,
  Building2,
  Shield,
  Palette,
  Mail,
  Bell,
  Edit3,
  Plus
} from 'lucide-react';

const CMSSettings = () => {
  const { user, token, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState('google');
  const [settings, setSettings] = useState({
    google_sync_enabled: true,
    google_business_sync_enabled: true,
    google_calendar_sync_enabled: true
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [pageLoading, setPageLoading] = useState(true);

  // Global placeholders state
  const [placeholders, setPlaceholders] = useState([]);
  const [loadingPlaceholders, setLoadingPlaceholders] = useState(false);
  const [editingPlaceholder, setEditingPlaceholder] = useState(null);
  const [showPlaceholderModal, setShowPlaceholderModal] = useState(false);
  const [placeholderForm, setPlaceholderForm] = useState({
    name: '',
    placeholder: '',
    value: '',
    description: ''
  });

  const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || import.meta.env.REACT_APP_BACKEND_URL || window.location.origin;

  const tabs = [
    { 
      id: 'google', 
      label: 'Google Integration', 
      icon: Globe,
      color: '#29add3'
    },
    {
      id: 'placeholders',
      label: 'Global Placeholders',
      icon: Settings,
      color: '#f59e0b'
    },
    { 
      id: 'appearance', 
      label: 'Appearance', 
      icon: Palette,
      color: '#7c3aed'
    },
    { 
      id: 'notifications', 
      label: 'Notifications', 
      icon: Bell,
      color: '#059669'
    }
  ];

  // Fetch CMS settings
  const fetchSettings = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/cms-settings`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setSettings({
          google_sync_enabled: data.google_sync_enabled,
          google_business_sync_enabled: data.google_business_sync_enabled,
          google_calendar_sync_enabled: data.google_calendar_sync_enabled
        });
      } else if (response.status === 403) {
        setMessage({ type: 'error', text: 'Access denied. Admin privileges required.' });
      } else {
        setMessage({ type: 'error', text: 'Failed to fetch CMS settings.' });
      }
    } catch (error) {
      console.error('Error fetching CMS settings:', error);
      setMessage({ type: 'error', text: 'Network error. Please try again.' });
    } finally {
      setLoading(false);
      setPageLoading(false);
    }
  };

  // Authentication useEffect
  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (token && !user) {
      return;
    }

    if (!token || !user) {
      setPageLoading(false);
      return;
    }

    if (user.role !== 'admin') {
      setPageLoading(false);
      return;
    }

    // Admin user - fetch settings
    fetchSettings();
  }, [token, user, authLoading]);

  // Load placeholders when placeholders tab is active
  useEffect(() => {
    if (activeTab === 'placeholders' && user && user.role === 'admin') {
      fetchPlaceholders();
    }
  }, [activeTab, user, token]);

  // Check if user is admin
  if (!authLoading && (!user || user.role !== 'admin')) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
          <Shield className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">Only administrators can access CMS Settings.</p>
        </div>
      </div>
    );
  }

  if (pageLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500 mx-auto"></div>
          <p className="text-gray-500 mt-4">Loading CMS Settings...</p>
        </div>
      </div>
    );
  }

  // Save settings
  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/cms-settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(settings)
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'CMS settings saved successfully!' });
        // Clear message after 3 seconds
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      } else if (response.status === 403) {
        setMessage({ type: 'error', text: 'Access denied. Admin privileges required.' });
      } else {
        const errorData = await response.json();
        setMessage({ type: 'error', text: errorData.detail || 'Failed to save settings.' });
      }
    } catch (error) {
      console.error('Error saving CMS settings:', error);
      setMessage({ type: 'error', text: 'Network error. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  // Handle toggle change
  const handleToggleChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // Global placeholders functions
  const fetchPlaceholders = async () => {
    setLoadingPlaceholders(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/global-placeholders`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setPlaceholders(data);
      } else {
        throw new Error('Failed to fetch placeholders');
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to load global placeholders' });
      console.error('Error fetching placeholders:', err);
    } finally {
      setLoadingPlaceholders(false);
    }
  };

  const handleCreatePlaceholder = async () => {
    if (!placeholderForm.name.trim() || !placeholderForm.placeholder.trim() || !placeholderForm.value.trim()) {
      setMessage({ type: 'error', text: 'Name, placeholder, and value are required' });
      return;
    }

    // Auto-format placeholder if it doesn't have brackets
    let formattedPlaceholder = placeholderForm.placeholder;
    if (!formattedPlaceholder.startsWith('[') || !formattedPlaceholder.endsWith(']')) {
      formattedPlaceholder = `[${formattedPlaceholder.toUpperCase()}]`;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/global-placeholders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...placeholderForm,
          placeholder: formattedPlaceholder,
          created_by: user?.email || 'unknown'
        })
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Global placeholder created successfully!' });
        setPlaceholderForm({ name: '', placeholder: '', value: '', description: '' });
        setShowPlaceholderModal(false);
        fetchPlaceholders();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to create placeholder');
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    }
  };

  const handleUpdatePlaceholder = async () => {
    if (!placeholderForm.name.trim() || !placeholderForm.placeholder.trim() || !placeholderForm.value.trim()) {
      setMessage({ type: 'error', text: 'Name, placeholder, and value are required' });
      return;
    }

    // Auto-format placeholder if it doesn't have brackets
    let formattedPlaceholder = placeholderForm.placeholder;
    if (!formattedPlaceholder.startsWith('[') || !formattedPlaceholder.endsWith(']')) {
      formattedPlaceholder = `[${formattedPlaceholder.toUpperCase()}]`;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/global-placeholders/${editingPlaceholder.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...placeholderForm,
          placeholder: formattedPlaceholder
        })
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Global placeholder updated successfully!' });
        setPlaceholderForm({ name: '', placeholder: '', value: '', description: '' });
        setEditingPlaceholder(null);
        setShowPlaceholderModal(false);
        fetchPlaceholders();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to update placeholder');
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    }
  };

  const handleDeletePlaceholder = async (placeholderId) => {
    if (!confirm('Are you sure you want to delete this global placeholder?')) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/global-placeholders/${placeholderId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Global placeholder deleted successfully!' });
        fetchPlaceholders();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to delete placeholder');
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    }
  };

  const handleEditPlaceholder = (placeholder) => {
    console.log('Edit button clicked for placeholder:', placeholder);
    // Clear any existing messages first
    setMessage({ type: '', text: '' });
    
    setEditingPlaceholder(placeholder);
    setPlaceholderForm({
      name: placeholder.name,
      placeholder: placeholder.placeholder,
      value: placeholder.value,
      description: placeholder.description || ''
    });
    setShowPlaceholderModal(true);
    
    console.log('State updated - modal should show');
  };

  const handleCancelPlaceholderForm = () => {
    console.log('Cancel button clicked');
    setMessage({ type: '', text: '' });
    setPlaceholderForm({ name: '', placeholder: '', value: '', description: '' });
    setEditingPlaceholder(null);
    setShowPlaceholderModal(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Main Card Container */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Header - Inside the main card */}
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Settings className="h-6 w-6 text-gray-700" />
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">CMS Settings</h2>
                  <p className="text-sm text-gray-600">Configure application-wide settings</p>
                </div>
              </div>
            </div>
          </div>

          {/* Content Area */}
          <div className="p-6">
            {/* Message Display */}
            {message.text && (
              <div className={`mb-6 rounded-lg p-4 ${
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
                  <div className="ml-3 flex-1">
                    <p className={`text-sm font-medium ${
                      message.type === 'error' ? 'text-red-800' : 'text-green-800'
                    }`}>
                      {message.text}
                    </p>
                  </div>
                  <div className="ml-auto pl-3">
                    <button
                      onClick={() => setMessage({ type: '', text: '' })}
                      className={`inline-flex ${
                        message.type === 'error' ? 'text-red-400 hover:text-red-600' : 'text-green-400 hover:text-green-600'
                      }`}
                    >
                      <X className="h-5 w-5" />
                    </button>
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
              <div className="p-6">
            
            {/* Google Integration Tab */}
            {activeTab === 'google' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
                  <div className="mb-4 sm:mb-0">
                    <h2 className="text-lg font-semibold text-gray-900">Google Integration Settings</h2>
                    <p className="text-sm text-gray-600">
                      Configure Google services integration across the application
                    </p>
                  </div>
                  
                  {/* Save Button */}
                  <button
                    onClick={handleSaveSettings}
                    disabled={saving}
                    className="w-full sm:w-auto text-white px-6 py-2 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center sm:justify-start font-medium"
                    style={{ 
                      backgroundColor: saving ? '#94a3b8' : '#29add3'
                    }}
                    onMouseEnter={(e) => {
                      if (!saving) e.target.style.backgroundColor = '#2196c7';
                    }}
                    onMouseLeave={(e) => {
                      if (!saving) e.target.style.backgroundColor = '#29add3';
                    }}
                  >
                    {saving ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Save Settings
                      </>
                    )}
                  </button>
                </div>

                <div className="space-y-4">
                  
                  {/* Master Google Sync Toggle */}
                  <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center space-x-3">
                      <div className="bg-blue-100 rounded-full p-2">
                        <Globe className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">Master Google Sync</h3>
                        <p className="text-sm text-gray-600">
                          Enable or disable all Google integrations across the application
                        </p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.google_sync_enabled}
                        onChange={(e) => handleToggleChange('google_sync_enabled', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  {/* Google Business Profile Sync */}
                  <div className={`flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200 transition-opacity ${
                    !settings.google_sync_enabled ? 'opacity-50' : ''
                  }`}>
                    <div className="flex items-center space-x-3">
                      <div className="bg-green-100 rounded-full p-2">
                        <Building2 className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">Google Business Profile Sync</h3>
                        <p className="text-sm text-gray-600">
                          Sync business information with Google Business Profile
                        </p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.google_business_sync_enabled && settings.google_sync_enabled}
                        onChange={(e) => handleToggleChange('google_business_sync_enabled', e.target.checked)}
                        disabled={!settings.google_sync_enabled}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600 disabled:cursor-not-allowed disabled:opacity-50"></div>
                    </label>
                  </div>

                  {/* Google Calendar Sync */}
                  <div className={`flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200 transition-opacity ${
                    !settings.google_sync_enabled ? 'opacity-50' : ''
                  }`}>
                    <div className="flex items-center space-x-3">
                      <div className="bg-purple-100 rounded-full p-2">
                        <Calendar className="h-5 w-5 text-purple-600" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">Google Calendar Sync</h3>
                        <p className="text-sm text-gray-600">
                          Sync appointments and events with Google Calendar
                        </p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.google_calendar_sync_enabled && settings.google_sync_enabled}
                        onChange={(e) => handleToggleChange('google_calendar_sync_enabled', e.target.checked)}
                        disabled={!settings.google_sync_enabled}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600 disabled:cursor-not-allowed disabled:opacity-50"></div>
                    </label>
                  </div>

                </div>

                {/* Info Panel */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <h3 className="text-sm font-medium text-blue-800">Important Information</h3>
                      <p className="text-sm text-blue-700 mt-1">
                        Disabling Google Sync will hide all Google Connect buttons and synchronization features throughout the application. 
                        Existing Google integrations will remain connected but will not sync data until re-enabled.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Global Placeholders Tab */}
            {activeTab === 'placeholders' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">Global Placeholders</h2>
                    <p className="text-sm text-gray-600">
                      Manage global placeholder values used across email and SMS templates
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setMessage({ type: '', text: '' });
                      setEditingPlaceholder(null);
                      setPlaceholderForm({ name: '', placeholder: '', value: '', description: '' });
                      setShowPlaceholderModal(true);
                    }}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white transition-colors"
                    style={{ backgroundColor: '#29add3' }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = '#2196c7'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = '#29add3'}
                  >
                    Add Placeholder
                  </button>
                </div>

                {/* Placeholder Form */}
                {showPlaceholderForm && (
                  <div className="mb-6 p-4 border border-gray-200 rounded-lg bg-gray-50" 
                       style={{ backgroundColor: '#f9fafb', border: '2px solid #29add3' }}>
                    <h4 className="text-md font-medium text-gray-900 mb-4">
                      {editingPlaceholder ? 'Edit Global Placeholder' : 'Create New Global Placeholder'}
                    </h4>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Placeholder Name *
                        </label>
                        <input
                          type="text"
                          value={placeholderForm.name}
                          onChange={(e) => setPlaceholderForm(prev => ({ ...prev, name: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2"
                          style={{ '--tw-ring-color': '#29add3' }}
                          placeholder="e.g., Website Link"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Placeholder Text *
                        </label>
                        <input
                          type="text"
                          value={placeholderForm.placeholder}
                          onChange={(e) => setPlaceholderForm(prev => ({ ...prev, placeholder: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2"
                          style={{ '--tw-ring-color': '#29add3' }}
                          placeholder="e.g., WEBSITE_LINK (brackets added automatically)"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Placeholder Value *
                        </label>
                        <input
                          type="text"
                          value={placeholderForm.value}
                          onChange={(e) => setPlaceholderForm(prev => ({ ...prev, value: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2"
                          style={{ '--tw-ring-color': '#29add3' }}
                          placeholder="e.g., https://yourwebsite.com"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Description
                        </label>
                        <input
                          type="text"
                          value={placeholderForm.description}
                          onChange={(e) => setPlaceholderForm(prev => ({ ...prev, description: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2"
                          style={{ '--tw-ring-color': '#29add3' }}
                          placeholder="Brief description of this placeholder"
                        />
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 mt-4">
                      <button
                        type="button"
                        onClick={editingPlaceholder ? handleUpdatePlaceholder : handleCreatePlaceholder}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white transition-colors"
                        style={{ backgroundColor: '#29add3' }}
                        onMouseEnter={(e) => e.target.style.backgroundColor = '#2196c7'}
                        onMouseLeave={(e) => e.target.style.backgroundColor = '#29add3'}
                      >
                        {editingPlaceholder ? 'Update Placeholder' : 'Create Placeholder'}
                      </button>
                      <button
                        type="button"
                        onClick={handleCancelPlaceholderForm}
                        className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                {/* Placeholders List */}
                <div>
                  {loadingPlaceholders ? (
                    <div className="text-center py-4">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-cyan-500 mx-auto"></div>
                      <p className="text-gray-500 mt-2">Loading placeholders...</p>
                    </div>
                  ) : placeholders.length === 0 ? (
                    <div className="text-center py-8 bg-gray-50 rounded-lg">
                      <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h4 className="text-lg font-medium text-gray-900 mb-2">No Global Placeholders</h4>
                      <p className="text-gray-500">Create your first global placeholder to get started.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {placeholders.map(placeholder => (
                        <div key={placeholder.id} className="border border-gray-200 rounded-lg p-4 bg-white">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-3 mb-2">
                                <h4 className="font-medium text-gray-900">{placeholder.name}</h4>
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                  {placeholder.placeholder}
                                </span>
                              </div>
                              {placeholder.description && (
                                <p className="text-sm text-gray-600 mb-2">{placeholder.description}</p>
                              )}
                              <div className="mt-2">
                                <span className="text-sm font-medium text-gray-700">Value: </span>
                                <span className="text-sm text-gray-900">{placeholder.value}</span>
                              </div>
                              <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                                <span>Created: {new Date(placeholder.created_at).toLocaleDateString()}</span>
                                {placeholder.updated_at && placeholder.updated_at !== placeholder.created_at && (
                                  <span>Updated: {new Date(placeholder.updated_at).toLocaleDateString()}</span>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center space-x-2 ml-4">
                              <button
                                onClick={() => handleEditPlaceholder(placeholder)}
                                className="text-blue-600 hover:text-blue-800 text-sm"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeletePlaceholder(placeholder.id)}
                                className="text-red-600 hover:text-red-800 text-sm"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Info Panel */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                    <div>
                      <h3 className="text-sm font-medium text-yellow-800">Usage Information</h3>
                      <p className="text-sm text-yellow-700 mt-1">
                        Global placeholders can be used in email and SMS templates throughout the application. 
                        Changes to placeholder values will automatically update all templates that use them.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Appearance Tab */}
            {activeTab === 'appearance' && (
              <div className="space-y-6">
                <div className="text-center py-12">
                  <Palette className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Appearance Settings</h3>
                  <p className="text-gray-500">Theme and layout customization options will be available here.</p>
                </div>
              </div>
            )}

            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <div className="text-center py-12">
                  <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Notification Settings</h3>
                  <p className="text-gray-500">Email and system notification preferences will be configured here.</p>
                </div>
              </div>
            )}

          </div>
        </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CMSSettings;