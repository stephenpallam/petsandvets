import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Clock, Calendar, Plus, Edit2, Trash2, Save, AlertCircle, CheckCircle } from 'lucide-react';

const ConfigureHours = () => {
  const { user, token, isAdmin } = useAuth();
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

  useEffect(() => {
    if (!isAdmin()) {
      setMessage({ type: 'error', text: 'Access denied. Admin privileges required.' });
      return;
    }
    fetchHours();
  }, []);

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

  if (!isAdmin()) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-red-800 mb-2">Access Denied</h2>
            <p className="text-red-600">You need administrator privileges to configure hospital hours.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section - Similar to Urgent Care page */}
      <div className="relative bg-white py-16">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Configure Hospital Hours
          </h1>
          <div 
            className="inline-block px-8 py-4 rounded-lg text-white text-lg font-medium shadow-lg"
            style={{ backgroundColor: '#29add3' }}
          >
            Manage general practice and urgent care operating hours
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {message.text && (
          <div className={`mb-6 p-4 rounded-lg flex items-center ${
            message.type === 'success' 
              ? 'bg-green-50 text-green-800 border border-green-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}>
            {message.type === 'success' ? (
              <CheckCircle className="h-5 w-5 mr-3" />
            ) : (
              <AlertCircle className="h-5 w-5 mr-3" />
            )}
            {message.text}
          </div>
        )}

        {/* General Practice Hours */}
        <div className="bg-white rounded-lg shadow-md mb-8">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                <Clock className="h-5 w-5 mr-2" style={{ color: '#29add3' }} />
                General Practice Hours
              </h2>
              <button
                onClick={() => saveHours('hospital')}
                disabled={loading}
                className="text-white px-4 py-2 rounded-lg hover:opacity-90 transition-colors disabled:opacity-50 flex items-center font-medium"
                style={{ backgroundColor: '#29add3' }}
              >
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </button>
            </div>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {days.map(day => (
                <div key={day.key} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium text-gray-900">{day.label}</h3>
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={hospitalHours[day.key]?.is_open || false}
                        onChange={(e) => handleDayChange('hospital', day.key, 'is_open', e.target.checked)}
                        className="rounded border-gray-300 focus:ring-2 disabled:opacity-50"
                        style={{ 
                          accentColor: '#29add3',
                          '--tw-ring-color': '#29add3'
                        }}
                      />
                      <span className="ml-2 text-sm text-gray-600">Open</span>
                    </label>
                  </div>
                  {hospitalHours[day.key]?.is_open && (
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Open Time</label>
                        <input
                          type="time"
                          value={hospitalHours[day.key]?.open_time || ''}
                          onChange={(e) => handleDayChange('hospital', day.key, 'open_time', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:border-transparent"
                          style={{ 
                            '--tw-ring-color': '#29add3',
                            outline: 'none'
                          }}
                          onFocus={(e) => {
                            e.target.style.borderColor = '#29add3';
                            e.target.style.boxShadow = '0 0 0 2px rgba(41, 173, 211, 0.2)';
                          }}
                          onBlur={(e) => {
                            e.target.style.borderColor = '#d1d5db';
                            e.target.style.boxShadow = 'none';
                          }}
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Close Time</label>
                        <input
                          type="time"
                          value={hospitalHours[day.key]?.close_time || ''}
                          onChange={(e) => handleDayChange('hospital', day.key, 'close_time', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:border-transparent"
                          style={{ 
                            '--tw-ring-color': '#29add3',
                            outline: 'none'
                          }}
                          onFocus={(e) => {
                            e.target.style.borderColor = '#29add3';
                            e.target.style.boxShadow = '0 0 0 2px rgba(41, 173, 211, 0.2)';
                          }}
                          onBlur={(e) => {
                            e.target.style.borderColor = '#d1d5db';
                            e.target.style.boxShadow = 'none';
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Urgent Care Hours */}
        <div className="bg-white rounded-lg shadow-md mb-8">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                <Clock className="h-5 w-5 mr-2" style={{ color: '#dc2626' }} />
                Urgent Care Hours
              </h2>
              <button
                onClick={() => saveHours('urgent')}
                disabled={loading}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center font-medium"
              >
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </button>
            </div>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {days.map(day => (
                <div key={day.key} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium text-gray-900">{day.label}</h3>
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={urgentCareHours[day.key]?.is_open || false}
                        onChange={(e) => handleDayChange('urgent', day.key, 'is_open', e.target.checked)}
                        className="rounded border-gray-300 focus:ring-2 disabled:opacity-50"
                        style={{ 
                          accentColor: '#dc2626',
                          '--tw-ring-color': '#dc2626'
                        }}
                      />
                      <span className="ml-2 text-sm text-gray-600">Open</span>
                    </label>
                  </div>
                  {urgentCareHours[day.key]?.is_open && (
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Open Time</label>
                        <input
                          type="time"
                          value={urgentCareHours[day.key]?.open_time || ''}
                          onChange={(e) => handleDayChange('urgent', day.key, 'open_time', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:border-transparent"
                          style={{ 
                            '--tw-ring-color': '#dc2626',
                            outline: 'none'
                          }}
                          onFocus={(e) => {
                            e.target.style.borderColor = '#dc2626';
                            e.target.style.boxShadow = '0 0 0 2px rgba(220, 38, 38, 0.2)';
                          }}
                          onBlur={(e) => {
                            e.target.style.borderColor = '#d1d5db';
                            e.target.style.boxShadow = 'none';
                          }}
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Close Time</label>
                        <input
                          type="time"
                          value={urgentCareHours[day.key]?.close_time || ''}
                          onChange={(e) => handleDayChange('urgent', day.key, 'close_time', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:border-transparent"
                          style={{ 
                            '--tw-ring-color': '#dc2626',
                            outline: 'none'
                          }}
                          onFocus={(e) => {
                            e.target.style.borderColor = '#dc2626';
                            e.target.style.boxShadow = '0 0 0 2px rgba(220, 38, 38, 0.2)';
                          }}
                          onBlur={(e) => {
                            e.target.style.borderColor = '#d1d5db';
                            e.target.style.boxShadow = 'none';
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Special Hours/Holidays */}
        <div className="bg-white rounded-lg shadow-md">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              <Calendar className="h-5 w-5 mr-2" style={{ color: '#16a34a' }} />
              Special Hours & Holidays
            </h2>
          </div>
          <div className="p-6">
            {/* Add New Special Hour */}
            <div className="border border-gray-200 rounded-lg p-4 mb-6">
              <h3 className="font-medium text-gray-900 mb-4">Add Special Hours</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Date</label>
                  <input
                    type="date"
                    value={newSpecialHour.date}
                    onChange={(e) => setNewSpecialHour({...newSpecialHour, date: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:border-transparent"
                    style={{ 
                      '--tw-ring-color': '#16a34a',
                      outline: 'none'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#16a34a';
                      e.target.style.boxShadow = '0 0 0 2px rgba(22, 163, 74, 0.2)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#d1d5db';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Holiday Name</label>
                  <input
                    type="text"
                    value={newSpecialHour.name}
                    onChange={(e) => setNewSpecialHour({...newSpecialHour, name: e.target.value})}
                    placeholder="e.g., Christmas Day"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:border-transparent"
                    style={{ 
                      '--tw-ring-color': '#16a34a',
                      outline: 'none'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#16a34a';
                      e.target.style.boxShadow = '0 0 0 2px rgba(22, 163, 74, 0.2)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#d1d5db';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                {/* General Practice Special Hours */}
                <div className="border border-gray-200 rounded p-3">
                  <h4 className="font-medium text-gray-700 mb-2">General Practice</h4>
                  <label className="flex items-center mb-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newSpecialHour.general_practice.is_open}
                      onChange={(e) => setNewSpecialHour({
                        ...newSpecialHour,
                        general_practice: { ...newSpecialHour.general_practice, is_open: e.target.checked }
                      })}
                      className="rounded border-gray-300 focus:ring-2"
                      style={{ 
                        accentColor: '#29add3',
                        '--tw-ring-color': '#29add3'
                      }}
                    />
                    <span className="ml-2 text-sm">Open</span>
                  </label>
                  {newSpecialHour.general_practice.is_open && (
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="time"
                        value={newSpecialHour.general_practice.open_time}
                        onChange={(e) => setNewSpecialHour({
                          ...newSpecialHour,
                          general_practice: { ...newSpecialHour.general_practice, open_time: e.target.value }
                        })}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:border-transparent"
                        style={{ 
                          '--tw-ring-color': '#29add3',
                          outline: 'none'
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = '#29add3';
                          e.target.style.boxShadow = '0 0 0 2px rgba(41, 173, 211, 0.2)';
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = '#d1d5db';
                          e.target.style.boxShadow = 'none';
                        }}
                      />
                      <input
                        type="time"
                        value={newSpecialHour.general_practice.close_time}
                        onChange={(e) => setNewSpecialHour({
                          ...newSpecialHour,
                          general_practice: { ...newSpecialHour.general_practice, close_time: e.target.value }
                        })}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:border-transparent"
                        style={{ 
                          '--tw-ring-color': '#29add3',
                          outline: 'none'
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = '#29add3';
                          e.target.style.boxShadow = '0 0 0 2px rgba(41, 173, 211, 0.2)';
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = '#d1d5db';
                          e.target.style.boxShadow = 'none';
                        }}
                      />
                    </div>
                  )}
                </div>
                {/* Urgent Care Special Hours */}
                <div className="border border-gray-200 rounded p-3">
                  <h4 className="font-medium text-gray-700 mb-2">Urgent Care</h4>
                  <label className="flex items-center mb-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newSpecialHour.urgent_care.is_open}
                      onChange={(e) => setNewSpecialHour({
                        ...newSpecialHour,
                        urgent_care: { ...newSpecialHour.urgent_care, is_open: e.target.checked }
                      })}
                      className="rounded border-gray-300 focus:ring-2"
                      style={{ 
                        accentColor: '#dc2626',
                        '--tw-ring-color': '#dc2626'
                      }}
                    />
                    <span className="ml-2 text-sm">Open</span>
                  </label>
                  {newSpecialHour.urgent_care.is_open && (
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="time"
                        value={newSpecialHour.urgent_care.open_time}
                        onChange={(e) => setNewSpecialHour({
                          ...newSpecialHour,
                          urgent_care: { ...newSpecialHour.urgent_care, open_time: e.target.value }
                        })}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:border-transparent"
                        style={{ 
                          '--tw-ring-color': '#dc2626',
                          outline: 'none'
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = '#dc2626';
                          e.target.style.boxShadow = '0 0 0 2px rgba(220, 38, 38, 0.2)';
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = '#d1d5db';
                          e.target.style.boxShadow = 'none';
                        }}
                      />
                      <input
                        type="time"
                        value={newSpecialHour.urgent_care.close_time}
                        onChange={(e) => setNewSpecialHour({
                          ...newSpecialHour,
                          urgent_care: { ...newSpecialHour.urgent_care, close_time: e.target.value }
                        })}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:border-transparent"
                        style={{ 
                          '--tw-ring-color': '#dc2626',
                          outline: 'none'
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = '#dc2626';
                          e.target.style.boxShadow = '0 0 0 2px rgba(220, 38, 38, 0.2)';
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = '#d1d5db';
                          e.target.style.boxShadow = 'none';
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>
              <button
                onClick={addSpecialHour}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center font-medium"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Special Hours
              </button>
            </div>

            {/* Existing Special Hours */}
            {specialHours.length > 0 && (
              <div>
                <h3 className="font-medium text-gray-900 mb-4">Existing Special Hours</h3>
                <div className="space-y-3">
                  {specialHours.map(hour => (
                    <div key={hour.id} className="border border-gray-200 rounded-lg p-4 flex justify-between items-center">
                      <div>
                        <h4 className="font-medium text-gray-900">{hour.name}</h4>
                        <p className="text-sm text-gray-600">{hour.date}</p>
                        <div className="mt-2 text-xs text-gray-500">
                          <span className="mr-4">
                            General: {hour.general_practice.is_open ? 
                              `${hour.general_practice.open_time} - ${hour.general_practice.close_time}` : 
                              'Closed'
                            }
                          </span>
                          <span>
                            Urgent: {hour.urgent_care.is_open ? 
                              `${hour.urgent_care.open_time} - ${hour.urgent_care.close_time}` : 
                              'Closed'
                            }
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => deleteSpecialHour(hour.id)}
                        className="text-red-600 hover:text-red-800 p-2 rounded-lg hover:bg-red-50 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfigureHours;