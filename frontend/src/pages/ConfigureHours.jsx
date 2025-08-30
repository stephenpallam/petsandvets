import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Clock, Calendar, Plus, Edit2, Trash2, Save, AlertCircle, CheckCircle, ExternalLink, RefreshCw, CalendarDays } from 'lucide-react';
import axios from 'axios';

const ConfigureHours = () => {
  const { user, token, isAdmin, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState('general');
  const [hospitalHours, setHospitalHours] = useState({
    monday: { is_open: true, open_time: '09:00', close_time: '18:00' },
    tuesday: { is_open: true, open_time: '09:00', close_time: '18:00' },
    wednesday: { is_open: true, open_time: '09:00', close_time: '18:00' },
    thursday: { is_open: true, open_time: '09:00', close_time: '18:00' },
    friday: { is_open: true, open_time: '09:00', close_time: '18:00' },
    saturday: { is_open: true, open_time: '09:00', close_time: '17:00' },
    sunday: { is_open: false, open_time: '', close_time: '' }
  });

  const [urgentCareHours, setUrgentCareHours] = useState({
    monday: { is_open: true, open_time: '15:00', close_time: '22:00' },
    tuesday: { is_open: true, open_time: '15:00', close_time: '22:00' },
    wednesday: { is_open: true, open_time: '15:00', close_time: '22:00' },
    thursday: { is_open: true, open_time: '15:00', close_time: '22:00' },
    friday: { is_open: true, open_time: '15:00', close_time: '22:00' },
    saturday: { is_open: true, open_time: '15:00', close_time: '22:00' },
    sunday: { is_open: true, open_time: '15:00', close_time: '22:00' }
  });

  const [specialHours, setSpecialHours] = useState([]);
  const [newSpecialHour, setNewSpecialHour] = useState({
    date: '',
    name: '',
    general_practice: { is_open: false, open_time: '', close_time: '' },
    urgent_care: { is_open: false, open_time: '', close_time: '' }
  });

  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [googleConnected, setGoogleConnected] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || import.meta.env.REACT_APP_BACKEND_URL;

  const days = [
    { key: 'monday', label: 'Monday' },
    { key: 'tuesday', label: 'Tuesday' },
    { key: 'wednesday', label: 'Wednesday' },
    { key: 'thursday', label: 'Thursday' },
    { key: 'friday', label: 'Friday' },
    { key: 'saturday', label: 'Saturday' },
    { key: 'sunday', label: 'Sunday' }
  ];

  const tabs = [
    { 
      id: 'general', 
      label: 'General Practice Hours', 
      icon: Clock,
      color: '#374151'  // Dark grey
    },
    { 
      id: 'urgent', 
      label: 'Urgent Care Hours', 
      icon: Clock,
      color: '#374151'  // Changed from red to dark grey
    },
    { 
      id: 'special', 
      label: 'Special Holidays', 
      icon: CalendarDays,
      color: '#7c3aed'  // Keep purple for special
    }
  ];

  useEffect(() => {
    // Wait for auth to finish loading
    if (authLoading) {
      return;
    }
    
    if (!isAdmin()) {
      setMessage({ type: 'error', text: 'Access denied. Admin privileges required.' });
      return;
    }
    fetchHours();
    checkGoogleConnection();
  }, [authLoading, isAdmin]);

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

  const handleGoogleSync = async (syncType) => {
    setSyncing(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await axios.post(`${API_BASE_URL}/api/google-business/sync`, 
        { sync_type: syncType },
        {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        setMessage({ type: 'success', text: `${syncType === 'general_practice' ? 'General Practice' : 'Urgent Care'} hours synced to Google Business Profile successfully!` });
      } else {
        setMessage({ type: 'error', text: response.data.message || 'Sync failed' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.detail || 'Failed to sync to Google Business Profile' });
    } finally {
      setSyncing(false);
      setTimeout(() => setMessage({ type: '', text: '' }), 5000);
    }
  };

  const fetchHours = async () => {
    try {
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      };

      // Fetch hospital hours
      const hospitalResponse = await fetch(`${API_BASE_URL}/api/hospital-hours`, { headers });
      if (hospitalResponse.ok) {
        const hospitalData = await hospitalResponse.json();
        setHospitalHours({
          monday: hospitalData.monday,
          tuesday: hospitalData.tuesday,
          wednesday: hospitalData.wednesday,
          thursday: hospitalData.thursday,
          friday: hospitalData.friday,
          saturday: hospitalData.saturday,
          sunday: hospitalData.sunday
        });
      }

      // Fetch urgent care hours
      const urgentResponse = await fetch(`${API_BASE_URL}/api/urgent-care-hours`, { headers });
      if (urgentResponse.ok) {
        const urgentData = await urgentResponse.json();
        setUrgentCareHours({
          monday: urgentData.monday,
          tuesday: urgentData.tuesday,
          wednesday: urgentData.wednesday,
          thursday: urgentData.thursday,
          friday: urgentData.friday,
          saturday: urgentData.saturday,
          sunday: urgentData.sunday
        });
      }

      // Fetch special hours
      const specialResponse = await fetch(`${API_BASE_URL}/api/special-hours`, { headers });
      if (specialResponse.ok) {
        const specialData = await specialResponse.json();
        setSpecialHours(specialData);
      }

    } catch (error) {
      console.error('Error fetching hours:', error);
      setMessage({ type: 'error', text: 'Failed to load hours data.' });
    }
  };

  const handleDayChange = (type, day, field, value) => {
    const setter = type === 'hospital' ? setHospitalHours : setUrgentCareHours;
    const current = type === 'hospital' ? hospitalHours : urgentCareHours;
    
    setter({
      ...current,
      [day]: {
        ...current[day],
        [field]: value
      }
    });
  };

  const updateHospitalHours = (day, field, value) => {
    setHospitalHours({
      ...hospitalHours,
      [day]: {
        ...hospitalHours[day],
        [field]: value
      }
    });
  };

  const updateUrgentCareHours = (day, field, value) => {
    setUrgentCareHours({
      ...urgentCareHours,
      [day]: {
        ...urgentCareHours[day],
        [field]: value
      }
    });
  };

  const saveHours = async (type) => {
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const endpoint = type === 'hospital' ? 'hospital-hours' : 'urgent-care-hours';
      const data = type === 'hospital' ? hospitalHours : urgentCareHours;

      const response = await fetch(`${API_BASE_URL}/api/${endpoint}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      });

      if (response.ok) {
        setMessage({ 
          type: 'success', 
          text: `${type === 'hospital' ? 'Hospital' : 'Urgent Care'} hours updated successfully!` 
        });
      } else {
        const errorData = await response.json();
        setMessage({ type: 'error', text: errorData.detail || 'Failed to update hours' });
      }
    } catch (error) {
      console.error('Error saving hours:', error);
      setMessage({ type: 'error', text: 'Network error. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const addSpecialHour = async () => {
    if (!newSpecialHour.date || !newSpecialHour.name) {
      setMessage({ type: 'error', text: 'Please fill in date and name for special hours.' });
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/special-hours`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newSpecialHour)
      });

      if (response.ok) {
        const newHour = await response.json();
        setSpecialHours([...specialHours, newHour]);
        setNewSpecialHour({
          date: '',
          name: '',
          general_practice: { is_open: false, open_time: '', close_time: '' },
          urgent_care: { is_open: false, open_time: '', close_time: '' }
        });
        setMessage({ type: 'success', text: 'Special hours added successfully!' });
      } else {
        const errorData = await response.json();
        setMessage({ type: 'error', text: errorData.detail || 'Failed to add special hours' });
      }
    } catch (error) {
      console.error('Error adding special hours:', error);
      setMessage({ type: 'error', text: 'Network error. Please try again.' });
    }
  };

  const deleteSpecialHour = async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/special-hours/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });

      if (response.ok) {
        setSpecialHours(specialHours.filter(hour => hour.id !== id));
        setMessage({ type: 'success', text: 'Special hours deleted successfully!' });
      } else {
        const errorData = await response.json();
        setMessage({ type: 'error', text: errorData.detail || 'Failed to delete special hours' });
      }
    } catch (error) {
      console.error('Error deleting special hours:', error);
      setMessage({ type: 'error', text: 'Network error. Please try again.' });
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: '#29add3' }}></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin()) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-red-800 mb-2">Access Denied</h2>
            <p className="text-red-600">You need administrator privileges to configure hospital hours.</p>
            <p className="text-red-600 text-sm mt-2">Please log in with an admin account.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-4 sm:py-8">
      <div className="max-w-6xl mx-auto px-2 sm:px-4 lg:px-8">


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
        <div className="bg-white rounded-lg shadow-sm mb-4 sm:mb-6">
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
          <div className="p-3 sm:p-6">
            {/* General Practice Hours Tab */}
            {activeTab === 'general' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row justify-end items-stretch sm:items-center mb-4 sm:mb-6 gap-3">
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:space-x-3">
                    {/* Google Sync Button */}
                    {googleConnected ? (
                      <button
                        onClick={() => handleGoogleSync('general_practice')}
                        disabled={syncing || loading}
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
                        {syncing ? (
                          <>
                            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                            Syncing...
                          </>
                        ) : (
                          <>
                            <ExternalLink className="h-4 w-4 mr-2" />
                            Sync to Google
                          </>
                        )}
                      </button>
                    ) : (
                      <a
                        href="/google-integration"
                        className="w-full sm:w-auto text-white px-6 py-2 rounded-lg transition-colors font-medium no-underline flex items-center justify-center sm:justify-start"
                        style={{ backgroundColor: '#29add3' }}
                        onMouseEnter={(e) => e.target.style.backgroundColor = '#2196c7'}
                        onMouseLeave={(e) => e.target.style.backgroundColor = '#29add3'}
                      >
                        Connect Google
                      </a>
                    )}

                    {/* Save Button */}
                    <button
                      onClick={() => saveHours('hospital')}
                      disabled={loading}
                      className="w-full sm:w-auto text-white px-6 py-2 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center sm:justify-start font-medium"
                      style={{ 
                        backgroundColor: loading ? '#94a3b8' : '#29add3'
                      }}
                      onMouseEnter={(e) => {
                        if (!loading) e.target.style.backgroundColor = '#2196c7';
                      }}
                      onMouseLeave={(e) => {
                        if (!loading) e.target.style.backgroundColor = '#29add3';
                      }}
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {days.map(day => (
                    <div key={day.key} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-medium text-gray-900">{day.label}</h3>
                        <label className="flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={hospitalHours[day.key]?.is_open || false}
                            onChange={(e) => updateHospitalHours(day.key, 'is_open', e.target.checked)}
                            className="sr-only"
                          />
                          <div className="relative inline-flex items-center h-6 rounded-full w-11 transition-colors"
                            style={{
                              backgroundColor: hospitalHours[day.key]?.is_open ? '#29add3' : '#e5e7eb'
                            }}>
                            <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${
                              hospitalHours[day.key]?.is_open ? 'translate-x-6' : 'translate-x-1'
                            }`} />
                          </div>
                          <span className="ml-2 text-sm text-gray-600">
                            {hospitalHours[day.key]?.is_open ? 'Open' : 'Closed'}
                          </span>
                        </label>
                      </div>
                      
                      {hospitalHours[day.key]?.is_open && (
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Open Time</label>
                            <input
                              type="time"
                              value={hospitalHours[day.key]?.open_time || ''}
                              onChange={(e) => updateHospitalHours(day.key, 'open_time', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2"
                              style={{ "--tw-ring-color": "#29add3" }}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Close Time</label>
                            <input
                              type="time"
                              value={hospitalHours[day.key]?.close_time || ''}
                              onChange={(e) => updateHospitalHours(day.key, 'close_time', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2"
                              style={{ "--tw-ring-color": "#29add3" }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Urgent Care Hours Tab */}
            {activeTab === 'urgent' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row justify-end items-stretch sm:items-center mb-4 sm:mb-6 gap-3">
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:space-x-3">
                    {/* Google Sync Button */}
                    {googleConnected ? (
                      <button
                        onClick={() => handleGoogleSync('urgent_care')}
                        disabled={syncing || loading}
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
                        {syncing ? (
                          <>
                            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                            Syncing...
                          </>
                        ) : (
                          <>
                            <ExternalLink className="h-4 w-4 mr-2" />
                            Sync to Google
                          </>
                        )}
                      </button>
                    ) : (
                      <a
                        href="/google-integration"
                        className="w-full sm:w-auto text-white px-6 py-2 rounded-lg transition-colors font-medium no-underline flex items-center justify-center sm:justify-start"
                        style={{ backgroundColor: '#29add3' }}
                        onMouseEnter={(e) => e.target.style.backgroundColor = '#2196c7'}
                        onMouseLeave={(e) => e.target.style.backgroundColor = '#29add3'}
                      >
                        Connect Google
                      </a>
                    )}

                    {/* Save Button */}
                    <button
                      onClick={() => saveHours('urgent')}
                      disabled={loading}
                      className="text-white px-6 py-2 rounded-lg transition-colors disabled:opacity-50 flex items-center font-medium"
                      style={{ 
                        backgroundColor: loading ? '#94a3b8' : '#29add3'
                      }}
                      onMouseEnter={(e) => {
                        if (!loading) e.target.style.backgroundColor = '#2196c7';
                      }}
                      onMouseLeave={(e) => {
                        if (!loading) e.target.style.backgroundColor = '#29add3';
                      }}
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {days.map(day => (
                    <div key={day.key} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-medium text-gray-900">{day.label}</h3>
                        <label className="flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={urgentCareHours[day.key]?.is_open || false}
                            onChange={(e) => updateUrgentCareHours(day.key, 'is_open', e.target.checked)}
                            className="sr-only"
                          />
                          <div className="relative inline-flex items-center h-6 rounded-full w-11 transition-colors"
                            style={{
                              backgroundColor: urgentCareHours[day.key]?.is_open ? '#29add3' : '#e5e7eb'
                            }}>
                            <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${
                              urgentCareHours[day.key]?.is_open ? 'translate-x-6' : 'translate-x-1'
                            }`} />
                          </div>
                          <span className="ml-2 text-sm text-gray-600">
                            {urgentCareHours[day.key]?.is_open ? 'Open' : 'Closed'}
                          </span>
                        </label>
                      </div>
                      
                      {urgentCareHours[day.key]?.is_open && (
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Open Time</label>
                            <input
                              type="time"
                              value={urgentCareHours[day.key]?.open_time || ''}
                              onChange={(e) => updateUrgentCareHours(day.key, 'open_time', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2"
                              style={{ "--tw-ring-color": "#29add3" }}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Close Time</label>
                            <input
                              type="time"
                              value={urgentCareHours[day.key]?.close_time || ''}
                              onChange={(e) => updateUrgentCareHours(day.key, 'close_time', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2"
                              style={{ "--tw-ring-color": "#29add3" }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Special Holidays Tab */}
            {activeTab === 'special' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row justify-end items-stretch sm:items-center mb-4 sm:mb-6 gap-3">
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:space-x-3">
                    {/* Google Sync Button */}
                    {googleConnected ? (
                      <button
                        onClick={() => handleGoogleSync('special_hours')}
                        disabled={syncing || loading}
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
                        {syncing ? (
                          <>
                            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                            Syncing...
                          </>
                        ) : (
                          <>
                            <ExternalLink className="h-4 w-4 mr-2" />
                            Sync to Google
                          </>
                        )}
                      </button>
                    ) : (
                      <a
                        href="/google-integration"
                        className="w-full sm:w-auto text-white px-6 py-2 rounded-lg transition-colors font-medium no-underline flex items-center justify-center sm:justify-start"
                        style={{ backgroundColor: '#29add3' }}
                        onMouseEnter={(e) => e.target.style.backgroundColor = '#2196c7'}
                        onMouseLeave={(e) => e.target.style.backgroundColor = '#29add3'}
                      >
                        Connect Google
                      </a>
                    )}
                  </div>
                </div>

                {/* Add New Special Hour Form */}
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 sm:p-6">
                  <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-4">Add Special Holiday Hours</h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                      <input
                        type="date"
                        value={newSpecialHour.date}
                        onChange={(e) => setNewSpecialHour(prev => ({ ...prev, date: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2"
                        style={{ "--tw-ring-color": "#29add3" }}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Holiday Name</label>
                      <input
                        type="text"
                        value={newSpecialHour.name}
                        onChange={(e) => setNewSpecialHour(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2"
                        style={{ "--tw-ring-color": "#29add3" }}
                        placeholder="e.g., Christmas Day, Thanksgiving"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                    {/* General Practice Special Hours */}
                    <div className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium text-gray-900">General Practice</h4>
                        <label className="flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={newSpecialHour.general_practice.is_open}
                            onChange={(e) => setNewSpecialHour(prev => ({
                              ...prev,
                              general_practice: { ...prev.general_practice, is_open: e.target.checked }
                            }))}
                            className="sr-only"
                          />
                          <div className="relative inline-flex items-center h-6 rounded-full w-11 transition-colors"
                            style={{
                              backgroundColor: newSpecialHour.general_practice.is_open ? '#29add3' : '#e5e7eb'
                            }}>
                            <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${
                              newSpecialHour.general_practice.is_open ? 'translate-x-6' : 'translate-x-1'
                            }`} />
                          </div>
                          <span className="ml-2 text-sm text-gray-600">
                            {newSpecialHour.general_practice.is_open ? 'Open' : 'Closed'}
                          </span>
                        </label>
                      </div>
                      
                      {newSpecialHour.general_practice.is_open && (
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Open</label>
                            <input
                              type="time"
                              value={newSpecialHour.general_practice.open_time}
                              onChange={(e) => setNewSpecialHour(prev => ({
                                ...prev,
                                general_practice: { ...prev.general_practice, open_time: e.target.value }
                              }))}
                              className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1"
                              style={{ "--tw-ring-color": "#29add3" }}
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Close</label>
                            <input
                              type="time"
                              value={newSpecialHour.general_practice.close_time}
                              onChange={(e) => setNewSpecialHour(prev => ({
                                ...prev,
                                general_practice: { ...prev.general_practice, close_time: e.target.value }
                              }))}
                              className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1"
                              style={{ "--tw-ring-color": "#29add3" }}
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Urgent Care Special Hours */}
                    <div className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium text-gray-900">Urgent Care</h4>
                        <label className="flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={newSpecialHour.urgent_care.is_open}
                            onChange={(e) => setNewSpecialHour(prev => ({
                              ...prev,
                              urgent_care: { ...prev.urgent_care, is_open: e.target.checked }
                            }))}
                            className="sr-only"
                          />
                          <div className="relative inline-flex items-center h-6 rounded-full w-11 transition-colors"
                            style={{
                              backgroundColor: newSpecialHour.urgent_care.is_open ? '#29add3' : '#e5e7eb'
                            }}>
                            <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${
                              newSpecialHour.urgent_care.is_open ? 'translate-x-6' : 'translate-x-1'
                            }`} />
                          </div>
                          <span className="ml-2 text-sm text-gray-600">
                            {newSpecialHour.urgent_care.is_open ? 'Open' : 'Closed'}
                          </span>
                        </label>
                      </div>
                      
                      {newSpecialHour.urgent_care.is_open && (
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Open</label>
                            <input
                              type="time"
                              value={newSpecialHour.urgent_care.open_time}
                              onChange={(e) => setNewSpecialHour(prev => ({
                                ...prev,
                                urgent_care: { ...prev.urgent_care, open_time: e.target.value }
                              }))}
                              className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1"
                              style={{ "--tw-ring-color": "#29add3" }}
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Close</label>
                            <input
                              type="time"
                              value={newSpecialHour.urgent_care.close_time}
                              onChange={(e) => setNewSpecialHour(prev => ({
                                ...prev,
                                urgent_care: { ...prev.urgent_care, close_time: e.target.value }
                              }))}
                              className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1"
                              style={{ "--tw-ring-color": "#29add3" }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      onClick={addSpecialHour}
                      disabled={loading || !newSpecialHour.date || !newSpecialHour.name}
                      className="w-full sm:w-auto text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center sm:justify-start font-medium"
                      style={{ 
                        backgroundColor: (loading || !newSpecialHour.date || !newSpecialHour.name) ? '#94a3b8' : '#29add3'
                      }}
                      onMouseEnter={(e) => {
                        if (!loading && newSpecialHour.date && newSpecialHour.name) e.target.style.backgroundColor = '#2196c7';
                      }}
                      onMouseLeave={(e) => {
                        if (!loading && newSpecialHour.date && newSpecialHour.name) e.target.style.backgroundColor = '#29add3';
                      }}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Special Hours
                    </button>
                  </div>
                </div>

                {/* Existing Special Hours List */}
                {specialHours.length > 0 && (
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Existing Special Hours</h3>
                    <div className="space-y-4">
                      {specialHours.map((specialHour) => (
                        <div key={specialHour.id} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <h4 className="font-medium text-gray-900">{specialHour.name}</h4>
                              <p className="text-sm text-gray-600">{new Date(specialHour.date).toLocaleDateString()}</p>
                            </div>
                            <button
                              onClick={() => deleteSpecialHour(specialHour.id)}
                              className="text-red-600 hover:text-red-700 p-1"
                              title="Delete Special Hours"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="font-medium text-blue-600">General Practice:</span>
                              <span className="ml-2">
                                {specialHour.general_practice.is_open 
                                  ? `${specialHour.general_practice.open_time} - ${specialHour.general_practice.close_time}`
                                  : 'Closed'
                                }
                              </span>
                            </div>
                            <div>
                              <span className="font-medium text-red-600">Urgent Care:</span>
                              <span className="ml-2">
                                {specialHour.urgent_care.is_open 
                                  ? `${specialHour.urgent_care.open_time} - ${specialHour.urgent_care.close_time}`
                                  : 'Closed'
                                }
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {specialHours.length === 0 && (
                  <div className="text-center py-12 bg-gray-50 rounded-lg">
                    <CalendarDays className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No special hours set yet</h3>
                    <p className="text-gray-600">Add special holiday hours using the form above</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfigureHours;