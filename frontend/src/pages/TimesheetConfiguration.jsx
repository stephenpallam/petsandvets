import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Settings, Clock, MapPin, DollarSign, Calendar, AlertCircle, CheckCircle, Save, Plus, Edit3, Trash2, X } from 'lucide-react';
import axios from 'axios';

const TimesheetConfiguration = () => {
  const { user, token, canAccessManager, loading: authLoading } = useAuth();
  const [config, setConfig] = useState({
    location_tracking_enabled: false,
    after_hours_cutoff_time: '18:00',
    auto_clockout_grace_minutes: 30,
    pay_period_type: 'biweekly',
    original_pay_period_start_date: ''
  });
  const [loading, setLoading] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [authError, setAuthError] = useState(null);
  const [pageLoading, setPageLoading] = useState(true);
  
  // Shift Presets State
  const [shiftPresets, setShiftPresets] = useState([]);
  const [showPresetModal, setShowPresetModal] = useState(false);
  const [editingPreset, setEditingPreset] = useState(null);
  const [presetForm, setPresetForm] = useState({
    name: '',
    start_time: '09:00',
    end_time: '17:00',
    description: ''
  });

  // Pay Period Settings State
  const [payPeriodSettings, setPayPeriodSettings] = useState([]);
  const [showPayPeriodModal, setShowPayPeriodModal] = useState(false);
  const [editingPayPeriod, setEditingPayPeriod] = useState(null);
  const [payPeriodForm, setPayPeriodForm] = useState({
    period_type: 'weekly',
    config_name: '',
    is_default: false,
    original_start_date: '',
    weekly_config: {
      start_day: 'monday',
      end_day: 'sunday',
      name: 'Monday to Sunday'
    },
    bi_weekly_config: {
      start_day: 'saturday',
      end_day: 'friday',
      name: 'Saturday to Friday'
    },
    monthly_config: {
      start_day: 1,
      end_day: -1,
      name: '1st to Last Day'
    }
  });

  const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || import.meta.env.REACT_APP_BACKEND_URL || window.location.origin;

  const payPeriodOptions = [
    { value: 'biweekly', label: 'Bi-weekly (Every 2 weeks)' },
    { value: 'custom', label: 'Custom (Flexible date ranges)' }
  ];

  // Authentication check - only managers and admins
  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (token && !user) {
      return;
    }

    if (user && canAccessManager()) {
      setAuthError(null);
      setPageLoading(false);
    } else if (user && !canAccessManager()) {
      setAuthError('Access denied. Manager or admin privileges required.');
      setPageLoading(false);
    } else if (!token) {
      setAuthError('Please log in with manager or admin privileges to configure timesheet settings.');
      setPageLoading(false);
    }
  }, [user, token, authLoading, canAccessManager]);

  // Fetch configuration when page loads
  useEffect(() => {
    if (!pageLoading && user && canAccessManager()) {
      fetchConfiguration();
      fetchShiftPresets();
      fetchPayPeriodSettings();
    }
  }, [pageLoading, user, canAccessManager]);

  const fetchConfiguration = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/api/timesheet-config`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setConfig(response.data);
    } catch (err) {
      console.error('Error fetching timesheet configuration:', err);
      if (err.response?.status === 404) {
        // Config doesn't exist yet, keep defaults
        setMessage({ 
          type: 'info', 
          text: 'No configuration found. Default settings will be created when you save.' 
        });
      } else {
        setMessage({ 
          type: 'error', 
          text: err.response?.data?.detail || 'Failed to fetch timesheet configuration' 
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchShiftPresets = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/shift-presets`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setShiftPresets(response.data);
    } catch (err) {
      console.error('Error fetching shift presets:', err);
      // Don't show error for presets, it's not critical
    }
  };

  const handleSaveConfiguration = async () => {
    setLoading(true);
    setShowSaveModal(true);
    setMessage({ type: '', text: '' });

    try {
      // Validate configuration
      if (parseInt(config.auto_clockout_grace_minutes) < 0) {
        setMessage({ type: 'error', text: 'Auto clock-out grace period cannot be negative' });
        return;
      }

      if (!config.original_pay_period_start_date) {
        setMessage({ type: 'error', text: 'Original Pay Period Start Date is required for accurate timesheet calculations' });
        return;
      }

      const updateData = {
        location_tracking_enabled: config.location_tracking_enabled,
        after_hours_cutoff_time: config.after_hours_cutoff_time,
        auto_clockout_grace_minutes: parseInt(config.auto_clockout_grace_minutes),
        pay_period_type: config.pay_period_type,
        original_pay_period_start_date: config.original_pay_period_start_date || null
      };

      await axios.put(`${API_BASE_URL}/api/timesheet-config`, updateData, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      setMessage({ type: 'success', text: 'Timesheet configuration saved successfully!' });
      
      // Keep modal open for a brief moment to show success
      setTimeout(() => {
        setShowSaveModal(false);
      }, 1000);
      
    } catch (err) {
      console.error('Error saving timesheet configuration:', err);
      setMessage({ 
        type: 'error', 
        text: err.response?.data?.detail || 'Failed to save timesheet configuration' 
      });
      setShowSaveModal(false);
    } finally {
      setLoading(false);
      setTimeout(() => setMessage({ type: '', text: '' }), 5000);
    }
  };

  const handleInputChange = (field, value) => {
    setConfig(prev => ({ ...prev, [field]: value }));
  };

  const formatTime = (timeString) => {
    const [hours, minutes] = timeString.split(':');
    const hour12 = parseInt(hours) % 12 || 12;
    const ampm = parseInt(hours) >= 12 ? 'PM' : 'AM';
    return `${hour12}:${minutes} ${ampm}`;
  };

  // Shift Preset Management Functions
  const openPresetModal = (preset = null) => {
    if (preset) {
      setEditingPreset(preset);
      setPresetForm({
        name: preset.name,
        start_time: preset.start_time,
        end_time: preset.end_time,
        description: preset.description || ''
      });
    } else {
      setEditingPreset(null);
      setPresetForm({
        name: '',
        start_time: '09:00',
        end_time: '17:00',
        description: ''
      });
    }
    setShowPresetModal(true);
  };

  const closePresetModal = () => {
    setShowPresetModal(false);
    setEditingPreset(null);
    setPresetForm({
      name: '',
      start_time: '09:00',
      end_time: '17:00',
      description: ''
    });
  };

  const handleSavePreset = async () => {
    if (!presetForm.name.trim()) {
      setMessage({ type: 'error', text: 'Preset name is required' });
      return;
    }

    setLoading(true);
    try {
      if (editingPreset) {
        // Update existing preset
        await axios.put(`${API_BASE_URL}/api/shift-presets/${editingPreset.id}`, presetForm, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        setMessage({ type: 'success', text: 'Shift preset updated successfully!' });
      } else {
        // Create new preset
        await axios.post(`${API_BASE_URL}/api/shift-presets`, presetForm, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        setMessage({ type: 'success', text: 'Shift preset created successfully!' });
      }

      closePresetModal();
      fetchShiftPresets(); // Reload presets
    } catch (err) {
      const errorMsg = err.response?.data?.detail || 'Failed to save shift preset';
      setMessage({ type: 'error', text: errorMsg });
    } finally {
      setLoading(false);
      setTimeout(() => setMessage({ type: '', text: '' }), 5000);
    }
  };

  const handleDeletePreset = async (presetId, presetName) => {
    if (!confirm(`Are you sure you want to delete the "${presetName}" preset?`)) {
      return;
    }

    setLoading(true);
    try {
      await axios.delete(`${API_BASE_URL}/api/shift-presets/${presetId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      setMessage({ type: 'success', text: 'Shift preset deleted successfully!' });
      fetchShiftPresets(); // Reload presets
    } catch (err) {
      setMessage({ 
        type: 'error', 
        text: 'Failed to delete shift preset' 
      });
    } finally {
      setLoading(false);
      setTimeout(() => setMessage({ type: '', text: '' }), 5000);
    }
  };

  const calculateDuration = (startTime, endTime) => {
    const [startHour, startMin] = startTime.split(':').map(Number);
    const [endHour, endMin] = endTime.split(':').map(Number);
    
    let duration = (endHour * 60 + endMin) - (startHour * 60 + startMin);
    if (duration < 0) duration += 24 * 60; // Handle overnight shifts
    
    const hours = Math.floor(duration / 60);
    const minutes = duration % 60;
    return `${hours}h${minutes > 0 ? ` ${minutes}m` : ''}`;
  };

  // Pay Period Settings Management Functions
  const fetchPayPeriodSettings = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/pay-period-settings`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setPayPeriodSettings(response.data);
    } catch (err) {
      console.error('Error fetching pay period settings:', err);
    }
  };

  const openPayPeriodModal = (setting = null) => {
    if (setting) {
      setEditingPayPeriod(setting);
      setPayPeriodForm({
        period_type: setting.period_type,
        config_name: setting.config_name,
        is_default: setting.is_default,
        original_start_date: setting.original_start_date || '',
        weekly_config: setting.weekly_config || {
          start_day: 'monday',
          end_day: 'sunday',
          name: 'Monday to Sunday'
        },
        bi_weekly_config: setting.bi_weekly_config || {
          start_day: 'saturday',
          end_day: 'friday',
          name: 'Saturday to Friday'
        },
        monthly_config: setting.monthly_config || {
          start_day: 1,
          end_day: -1,
          name: '1st to Last Day'
        }
      });
    } else {
      setEditingPayPeriod(null);
      setPayPeriodForm({
        period_type: 'weekly',
        config_name: '',
        is_default: false,
        original_start_date: '',
        weekly_config: {
          start_day: 'monday',
          end_day: 'sunday',
          name: 'Monday to Sunday'
        },
        bi_weekly_config: {
          start_day: 'saturday',
          end_day: 'friday',
          name: 'Saturday to Friday'
        },
        monthly_config: {
          start_day: 1,
          end_day: -1,
          name: '1st to Last Day'
        }
      });
    }
    setShowPayPeriodModal(true);
  };

  const closePayPeriodModal = () => {
    setShowPayPeriodModal(false);
    setEditingPayPeriod(null);
  };

  const handlePayPeriodFormChange = (field, value) => {
    setPayPeriodForm(prev => ({ ...prev, [field]: value }));
  };

  const handlePayPeriodConfigChange = (configType, field, value) => {
    setPayPeriodForm(prev => ({
      ...prev,
      [configType]: {
        ...prev[configType],
        [field]: value
      }
    }));
  };

  const updatePayPeriodName = () => {
    setPayPeriodForm(prev => {
      const newForm = { ...prev };
      
      if (prev.period_type === 'weekly') {
        newForm.weekly_config.name = `${prev.weekly_config.start_day.charAt(0).toUpperCase() + prev.weekly_config.start_day.slice(1)} to ${prev.weekly_config.end_day.charAt(0).toUpperCase() + prev.weekly_config.end_day.slice(1)}`;
      } else if (prev.period_type === 'bi_weekly') {
        newForm.bi_weekly_config.name = `${prev.bi_weekly_config.start_day.charAt(0).toUpperCase() + prev.bi_weekly_config.start_day.slice(1)} to ${prev.bi_weekly_config.end_day.charAt(0).toUpperCase() + prev.bi_weekly_config.end_day.slice(1)}`;
      } else if (prev.period_type === 'monthly') {
        const startLabel = prev.monthly_config.start_day === 1 ? '1st' : `${prev.monthly_config.start_day}th`;
        const endLabel = prev.monthly_config.end_day === -1 ? 'Last Day' : 
                         prev.monthly_config.end_day === 1 ? '1st' : `${prev.monthly_config.end_day}th`;
        newForm.monthly_config.name = `${startLabel} to ${endLabel}`;
      }
      
      return newForm;
    });
  };

  const handleSavePayPeriod = async () => {
    if (!payPeriodForm.config_name.trim()) {
      setMessage({ type: 'error', text: 'Configuration name is required' });
      return;
    }

    setLoading(true);
    try {
      const payloadData = {
        period_type: payPeriodForm.period_type,
        config_name: payPeriodForm.config_name,
        is_default: payPeriodForm.is_default
      };

      // Add the appropriate config based on period type
      if (payPeriodForm.period_type === 'weekly') {
        payloadData.weekly_config = payPeriodForm.weekly_config;
      } else if (payPeriodForm.period_type === 'bi_weekly') {
        payloadData.bi_weekly_config = payPeriodForm.bi_weekly_config;
      } else if (payPeriodForm.period_type === 'monthly') {
        payloadData.monthly_config = payPeriodForm.monthly_config;
      }

      if (editingPayPeriod) {
        // Update existing setting
        await axios.put(`${API_BASE_URL}/api/pay-period-settings/${editingPayPeriod.id}`, payloadData, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        setMessage({ type: 'success', text: 'Pay period setting updated successfully!' });
      } else {
        // Create new setting
        await axios.post(`${API_BASE_URL}/api/pay-period-settings`, payloadData, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        setMessage({ type: 'success', text: 'Pay period setting created successfully!' });
      }

      closePayPeriodModal();
      fetchPayPeriodSettings(); // Reload settings
    } catch (err) {
      const errorMsg = err.response?.data?.detail || 'Failed to save pay period setting';
      setMessage({ type: 'error', text: errorMsg });
    } finally {
      setLoading(false);
      setTimeout(() => setMessage({ type: '', text: '' }), 5000);
    }
  };

  const editPayPeriodSetting = (setting) => {
    openPayPeriodModal(setting);
  };

  const deletePayPeriodSetting = async (settingId) => {
    const setting = payPeriodSettings.find(s => s.id === settingId);
    if (!confirm(`Are you sure you want to delete the "${setting?.config_name}" pay period setting?`)) {
      return;
    }

    setLoading(true);
    try {
      await axios.delete(`${API_BASE_URL}/api/pay-period-settings/${settingId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      setMessage({ type: 'success', text: 'Pay period setting deleted successfully!' });
      fetchPayPeriodSettings(); // Reload settings
    } catch (err) {
      setMessage({ 
        type: 'error', 
        text: 'Failed to delete pay period setting' 
      });
    } finally {
      setLoading(false);
      setTimeout(() => setMessage({ type: '', text: '' }), 5000);
    }
  };

  // Loading state
  if (pageLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading timesheet configuration...</p>
        </div>
      </div>
    );
  }

  // Show error if authentication failed
  if (authError) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-red-800 mb-2">Access Denied</h2>
            <p className="text-red-600">{authError}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Header */}
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                Timesheet Configuration
              </h2>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Settings className="h-4 w-4" />
                <span>System Settings</span>
              </div>
            </div>
          </div>

          {/* Content Area */}
          <div className="p-6">
            {/* Message Display */}
            {message.text && (
              <div className={`mb-6 rounded-md p-4 ${
                message.type === 'error' 
                  ? 'bg-red-50 border border-red-200' 
                  : message.type === 'info'
                  ? 'bg-blue-50 border border-blue-200'
                  : 'bg-green-50 border border-green-200'
              }`}>
                <div className="flex">
                  <div className="flex-shrink-0">
                    {message.type === 'error' ? (
                      <AlertCircle className="h-5 w-5 text-red-400" />
                    ) : message.type === 'info' ? (
                      <AlertCircle className="h-5 w-5 text-blue-400" />
                    ) : (
                      <CheckCircle className="h-5 w-5 text-green-400" />
                    )}
                  </div>
                  <div className="ml-3">
                    <p className={`text-sm font-medium ${
                      message.type === 'error' 
                        ? 'text-red-800' 
                        : message.type === 'info'
                        ? 'text-blue-800'
                        : 'text-green-800'
                    }`}>
                      {message.text}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-8">
              
              {/* Location Tracking Section */}
              <div className="bg-gray-50 p-6 rounded-lg">
                <div className="flex items-center space-x-3 mb-4">
                  <MapPin className="h-6 w-6 text-blue-500" />
                  <h3 className="text-lg font-medium text-gray-900">Location Tracking</h3>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-start">
                    <div className="flex items-center h-5">
                      <input
                        id="location_tracking"
                        type="checkbox"
                        checked={config.location_tracking_enabled}
                        onChange={(e) => handleInputChange('location_tracking_enabled', e.target.checked)}
                        className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label htmlFor="location_tracking" className="font-medium text-gray-700">
                        Enable Location Tracking
                      </label>
                      <p className="text-gray-500">
                        When enabled, employee locations (GPS coordinates and IP address) will be recorded during clock in/out.
                        This helps verify that employees are clocking in from authorized locations.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* After Hours Settings Section */}
              <div className="bg-gray-50 p-6 rounded-lg">
                <div className="flex items-center space-x-3 mb-4">
                  <Clock className="h-6 w-6 text-purple-500" />
                  <h3 className="text-lg font-medium text-gray-900">After Hours Settings</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      After Hours Cutoff Time
                    </label>
                    <input
                      type="time"
                      value={config.after_hours_cutoff_time}
                      onChange={(e) => handleInputChange('after_hours_cutoff_time', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Work after {formatTime(config.after_hours_cutoff_time)} will be paid at after hours rate
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      After Hours Pay Information
                    </label>
                    <div className="px-3 py-2 bg-blue-50 border border-blue-200 rounded-md">
                      <p className="text-sm text-blue-800">
                        After hours rate is configured individually for each employee in their employee profile.
                        If not set, it defaults to their regular hourly rate (same as regular hours).
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Auto Clock-out Settings Section */}
              <div className="bg-gray-50 p-6 rounded-lg">
                <div className="flex items-center space-x-3 mb-4">
                  <Clock className="h-6 w-6 text-orange-500" />
                  <h3 className="text-lg font-medium text-gray-900">Auto Clock-out Settings</h3>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Grace Period (minutes)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="120"
                    value={config.auto_clockout_grace_minutes}
                    onChange={(e) => handleInputChange('auto_clockout_grace_minutes', e.target.value)}
                    className="w-full md:w-48 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Employees will be automatically clocked out {config.auto_clockout_grace_minutes} minutes after business closing hours if they forget to clock out.
                  </p>
                </div>
              </div>

              {/* Original Pay Period Start Date Section */}
              <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border-2 border-purple-200 p-6 rounded-lg">
                <div className="flex items-center space-x-3 mb-4">
                  <Calendar className="h-6 w-6 text-purple-600" />
                  <h3 className="text-lg font-medium text-gray-900">Pay Period Foundation Date</h3>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Original Pay Period Start Date *
                    </label>
                    <input
                      type="date"
                      value={config.original_pay_period_start_date}
                      onChange={(e) => handleInputChange('original_pay_period_start_date', e.target.value)}
                      className="w-full md:w-64 px-3 py-2 border border-purple-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white"
                    />
                  </div>
                  
                  <div className="px-4 py-3 bg-purple-100 border border-purple-200 rounded-md">
                    <div className="flex items-start space-x-2">
                      <AlertCircle className="h-5 w-5 text-purple-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-purple-800 mb-1">
                          Critical Foundation Setting
                        </p>
                        <p className="text-xs text-purple-700">
                          This date serves as the foundation for calculating ALL future pay periods and timesheets. 
                          Set this to the start date of your very first pay period. All subsequent pay periods 
                          (weekly, bi-weekly, monthly) will be calculated based on this reference date.
                        </p>
                        <p className="text-xs text-purple-600 mt-2">
                          <strong>Example:</strong> If your pay periods start on Mondays and your first Monday was January 1, 2024, 
                          enter 2024-01-01 here.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Custom Pay Period Settings Section */}
              <div className="bg-gray-50 p-6 rounded-lg">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <Calendar className="h-6 w-6 text-purple-500" />
                    <h3 className="text-lg font-medium text-gray-900">Custom Pay Period Settings</h3>
                  </div>
                  <button
                    onClick={() => openPayPeriodModal()}
                    className="flex items-center space-x-2 px-4 py-2 text-white rounded-lg transition-colors"
                    style={{ backgroundColor: '#29add3' }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = '#1e9bb8'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = '#29add3'}
                  >
                    <Plus className="h-4 w-4" />
                    <span>Add Period</span>
                  </button>
                </div>
                
                <p className="text-gray-600 mb-4">
                  Configure custom pay periods that can be used in timesheet agents and reports. 
                  Create weekly, bi-weekly, and monthly period configurations to match your business needs.
                </p>

                {/* Pay Period Settings List */}
                <div className="space-y-4">
                  {payPeriodSettings.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p>No custom pay periods configured yet</p>
                      <p className="text-sm">Create your first pay period setting to get started</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {payPeriodSettings.map((setting) => (
                        <div key={setting.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-1">
                                <h4 className="font-medium text-gray-900">{setting.config_name}</h4>
                                {setting.is_default && (
                                  <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800">
                                    Default
                                  </span>
                                )}
                              </div>
                              <div className="text-sm text-gray-600 space-y-1">
                                <div className="flex items-center space-x-2">
                                  <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                                    setting.period_type === 'weekly' ? 'bg-blue-100 text-blue-800' :
                                    setting.period_type === 'bi_weekly' ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-purple-100 text-purple-800'
                                  }`}>
                                    {setting.period_type === 'weekly' ? 'Weekly' : 
                                     setting.period_type === 'bi_weekly' ? 'Bi-Weekly' : 'Monthly'}
                                  </span>
                                </div>
                                <div className="text-xs text-gray-500">
                                  {setting.period_type === 'weekly' && setting.weekly_config && (
                                    <span>
                                      {setting.weekly_config.start_day.charAt(0).toUpperCase() + setting.weekly_config.start_day.slice(1)} to {' '}
                                      {setting.weekly_config.end_day.charAt(0).toUpperCase() + setting.weekly_config.end_day.slice(1)}
                                    </span>
                                  )}
                                  {setting.period_type === 'bi_weekly' && setting.bi_weekly_config && (
                                    <span>
                                      {setting.bi_weekly_config.start_day.charAt(0).toUpperCase() + setting.bi_weekly_config.start_day.slice(1)} to {' '}
                                      {setting.bi_weekly_config.end_day.charAt(0).toUpperCase() + setting.bi_weekly_config.end_day.slice(1)} (Bi-Weekly)
                                    </span>
                                  )}
                                  {setting.period_type === 'monthly' && setting.monthly_config && (
                                    <span>
                                      {setting.monthly_config.start_day === 1 ? '1st' : `${setting.monthly_config.start_day}th`} to {' '}
                                      {setting.monthly_config.end_day === -1 ? 'Last Day' : 
                                       setting.monthly_config.end_day === 1 ? '1st' : `${setting.monthly_config.end_day}th`}
                                    </span>
                                  )}
                                  {setting.original_start_date && (
                                    <div className="mt-1 text-purple-600 font-medium">
                                      Reference Date: {new Date(setting.original_start_date).toLocaleDateString()}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2 ml-2">
                              <button
                                onClick={() => editPayPeriodSetting(setting)}
                                className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                title="Edit"
                              >
                                <Edit3 className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => deletePayPeriodSetting(setting.id)}
                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                title="Delete"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Shift Presets Section */}
              <div className="bg-gray-50 p-6 rounded-lg">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <Calendar className="h-6 w-6 text-green-500" />
                    <h3 className="text-lg font-medium text-gray-900">Shift Presets</h3>
                  </div>
                  <button
                    onClick={() => openPresetModal()}
                    className="flex items-center space-x-2 px-4 py-2 text-white rounded-lg transition-colors"
                    style={{ backgroundColor: '#29add3' }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = '#1e9bb8'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = '#29add3'}
                  >
                    <Plus className="h-4 w-4" />
                    <span>Add Preset</span>
                  </button>
                </div>
                
                <p className="text-gray-600 mb-4">
                  Create quick shift presets that managers can use when scheduling employees. 
                  These presets will appear in the scheduling calendar for easy shift creation.
                </p>

                {/* Presets List */}
                <div className="space-y-3">
                  {shiftPresets.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p>No shift presets configured yet</p>
                      <p className="text-sm">Create your first preset to get started</p>
                    </div>
                  ) : (
                    shiftPresets.map((preset) => (
                      <div key={preset.id} className="bg-white border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-4">
                              <div>
                                <h4 className="font-medium text-gray-900">{preset.name}</h4>
                                <div className="flex items-center space-x-2 text-sm text-gray-600">
                                  <Clock className="h-4 w-4" />
                                  <span>{preset.start_time} - {preset.end_time}</span>
                                  <span className="text-gray-400">•</span>
                                  <span>{calculateDuration(preset.start_time, preset.end_time)}</span>
                                </div>
                                {preset.description && (
                                  <p className="text-sm text-gray-500 mt-1">{preset.description}</p>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => openPresetModal(preset)}
                              className="p-2 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50"
                            >
                              <Edit3 className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeletePreset(preset.id, preset.name)}
                              className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Current Configuration Summary */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h4 className="font-medium text-blue-900 mb-4">Current Configuration Summary</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-blue-800 font-medium">Location Tracking:</span>
                    <p className="text-blue-700">
                      {config.location_tracking_enabled ? 'Enabled' : 'Disabled'}
                    </p>
                  </div>
                  <div>
                    <span className="text-blue-800 font-medium">After Hours After:</span>
                    <p className="text-blue-700">
                      {formatTime(config.after_hours_cutoff_time)} (employee-specific rates)
                    </p>
                  </div>
                  <div>
                    <span className="text-blue-800 font-medium">Auto Clock-out:</span>
                    <p className="text-blue-700">
                      {config.auto_clockout_grace_minutes} minutes after business hours
                    </p>
                  </div>
                  <div>
                    <span className="text-blue-800 font-medium">Pay Period:</span>
                    <p className="text-blue-700">
                      {config.pay_period_type === 'biweekly' ? 'Bi-weekly' : 'Custom'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Save Button */}
              <div className="flex justify-end">
                <button
                  onClick={handleSaveConfiguration}
                  disabled={loading}
                  className="text-white font-medium py-3 px-6 rounded-lg transition-colors flex items-center space-x-2"
                  style={{ 
                    backgroundColor: loading ? '#9ca3af' : '#29add3',
                    cursor: loading ? 'not-allowed' : 'pointer'
                  }}
                  onMouseEnter={(e) => {
                    if (!loading) {
                      e.target.style.backgroundColor = '#228ba8';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!loading) {
                      e.target.style.backgroundColor = '#29add3';
                    }
                  }}
                >
                  <Save className="h-5 w-5" />
                  <span>{loading ? 'Saving...' : 'Save Configuration'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Shift Preset Modal */}
      {showPresetModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-4 sm:top-20 mx-auto w-full max-w-lg mx-4 sm:mx-auto bg-white rounded-lg shadow-lg flex flex-col max-h-[95vh] sm:max-h-[80vh]">
            {/* Sticky Header */}
            <div className="flex items-center justify-between px-4 sm:px-6 py-4 text-white rounded-t-lg" style={{ backgroundColor: '#29add3' }}>
              <h3 className="text-base sm:text-lg font-medium">
                {editingPreset ? 'Edit Shift Preset' : 'Create Shift Preset'}
              </h3>
              <button
                onClick={closePresetModal}
                className="text-white hover:text-gray-200 text-xl"
              >
                ✕
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4">
              <div className="space-y-4">
                {/* Preset Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Preset Name *
                  </label>
                  <input
                    type="text"
                    value={presetForm.name}
                    onChange={(e) => setPresetForm({...presetForm, name: e.target.value})}
                    placeholder="e.g., Morning Shift, Evening Shift"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2"
                    style={{ focusRingColor: '#29add3' }}
                  />
                </div>

                {/* Time Inputs */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Start Time *
                    </label>
                    <input
                      type="time"
                      value={presetForm.start_time}
                      onChange={(e) => setPresetForm({...presetForm, start_time: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2"
                      style={{ focusRingColor: '#29add3' }}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      End Time *
                    </label>
                    <input
                      type="time"
                      value={presetForm.end_time}
                      onChange={(e) => setPresetForm({...presetForm, end_time: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2"
                      style={{ focusRingColor: '#29add3' }}
                    />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description (Optional)
                  </label>
                  <textarea
                    value={presetForm.description}
                    onChange={(e) => setPresetForm({...presetForm, description: e.target.value})}
                    placeholder="Brief description of this shift preset..."
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2"
                    style={{ focusRingColor: '#29add3' }}
                  />
                </div>

                {/* Duration Display */}
                <div className="p-3 rounded-lg" style={{ backgroundColor: '#e6f7ff' }}>
                  <div className="text-sm" style={{ color: '#29add3' }}>
                    <Clock className="inline h-4 w-4 mr-1" />
                    Duration: {calculateDuration(presetForm.start_time, presetForm.end_time)}
                  </div>
                </div>
              </div>
            </div>

            {/* Sticky Footer */}
            <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 px-4 sm:px-6 py-4 bg-gray-50 border-t border-gray-200 rounded-b-lg">
              <button
                onClick={closePresetModal}
                className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={handleSavePreset}
                disabled={loading}
                className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-white rounded-md disabled:opacity-50"
                style={{ backgroundColor: loading ? '#a3a3a3' : '#29add3' }}
                onMouseEnter={(e) => !loading && (e.target.style.backgroundColor = '#1e9bb8')}
                onMouseLeave={(e) => !loading && (e.target.style.backgroundColor = '#29add3')}
              >
                {loading ? 'Saving...' : (editingPreset ? 'Update Preset' : 'Create Preset')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pay Period Setting Modal */}
      {showPayPeriodModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-4 sm:px-6 py-4 bg-gray-50 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <Calendar className="h-6 w-6 text-purple-500" />
                <h3 className="text-lg font-semibold text-gray-900">
                  {editingPayPeriod ? 'Edit Pay Period Setting' : 'Create Pay Period Setting'}
                </h3>
              </div>
              <button
                onClick={closePayPeriodModal}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="px-4 sm:px-6 py-4 overflow-y-auto max-h-[70vh]">
              <div className="space-y-6">
                {/* Configuration Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Configuration Name *
                  </label>
                  <input
                    type="text"
                    value={payPeriodForm.config_name}
                    onChange={(e) => handlePayPeriodFormChange('config_name', e.target.value)}
                    placeholder="e.g., Standard Weekly, Bi-Weekly Payroll"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                {/* Original Start Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Original Pay Period Start Date *
                  </label>
                  <input
                    type="date"
                    value={payPeriodForm.original_start_date}
                    onChange={(e) => handlePayPeriodFormChange('original_start_date', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    The reference date for calculating all pay periods. This should be the start date of your very first pay period of this type.
                  </p>
                </div>

                {/* Period Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Period Type *
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {['weekly', 'bi_weekly', 'monthly'].map((type) => (
                      <label key={type} className="flex items-center p-3 border-2 border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                        <input
                          type="radio"
                          name="period_type"
                          value={type}
                          checked={payPeriodForm.period_type === type}
                          onChange={(e) => {
                            handlePayPeriodFormChange('period_type', e.target.value);
                            setTimeout(updatePayPeriodName, 100);
                          }}
                          className="mr-3"
                        />
                        <div>
                          <div className="font-medium text-gray-900 capitalize">
                            {type === 'bi_weekly' ? 'Bi-Weekly' : type.charAt(0).toUpperCase() + type.slice(1)}
                          </div>
                          <div className="text-sm text-gray-500">
                            {type === 'weekly' && 'Every week'}
                            {type === 'bi_weekly' && 'Every 2 weeks'}
                            {type === 'monthly' && 'Every month'}
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Weekly Configuration */}
                {payPeriodForm.period_type === 'weekly' && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-medium text-blue-900 mb-4">Weekly Configuration</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Start Day</label>
                        <select
                          value={payPeriodForm.weekly_config.start_day}
                          onChange={(e) => {
                            handlePayPeriodConfigChange('weekly_config', 'start_day', e.target.value);
                            setTimeout(updatePayPeriodName, 100);
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map(day => (
                            <option key={day} value={day}>
                              {day.charAt(0).toUpperCase() + day.slice(1)}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">End Day</label>
                        <select
                          value={payPeriodForm.weekly_config.end_day}
                          onChange={(e) => {
                            handlePayPeriodConfigChange('weekly_config', 'end_day', e.target.value);
                            setTimeout(updatePayPeriodName, 100);
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map(day => (
                            <option key={day} value={day}>
                              {day.charAt(0).toUpperCase() + day.slice(1)}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="mt-3 p-2 bg-blue-100 rounded text-sm text-blue-800">
                      <strong>Preview:</strong> {payPeriodForm.weekly_config.name}
                    </div>
                  </div>
                )}

                {/* Bi-Weekly Configuration */}
                {payPeriodForm.period_type === 'bi_weekly' && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <h4 className="font-medium text-yellow-900 mb-4">Bi-Weekly Configuration</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Start Day</label>
                        <select
                          value={payPeriodForm.bi_weekly_config.start_day}
                          onChange={(e) => {
                            handlePayPeriodConfigChange('bi_weekly_config', 'start_day', e.target.value);
                            setTimeout(updatePayPeriodName, 100);
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                        >
                          {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map(day => (
                            <option key={day} value={day}>
                              {day.charAt(0).toUpperCase() + day.slice(1)}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">End Day</label>
                        <select
                          value={payPeriodForm.bi_weekly_config.end_day}
                          onChange={(e) => {
                            handlePayPeriodConfigChange('bi_weekly_config', 'end_day', e.target.value);
                            setTimeout(updatePayPeriodName, 100);
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                        >
                          {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map(day => (
                            <option key={day} value={day}>
                              {day.charAt(0).toUpperCase() + day.slice(1)}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="mt-3 p-2 bg-yellow-100 rounded text-sm text-yellow-800">
                      <strong>Preview:</strong> {payPeriodForm.bi_weekly_config.name} (Every 2 weeks)
                    </div>
                  </div>
                )}

                {/* Monthly Configuration */}
                {payPeriodForm.period_type === 'monthly' && (
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <h4 className="font-medium text-purple-900 mb-4">Monthly Configuration</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Start Day</label>
                        <select
                          value={payPeriodForm.monthly_config.start_day}
                          onChange={(e) => {
                            handlePayPeriodConfigChange('monthly_config', 'start_day', parseInt(e.target.value));
                            setTimeout(updatePayPeriodName, 100);
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                        >
                          {Array.from({length: 28}, (_, i) => i + 1).map(day => (
                            <option key={day} value={day}>
                              {day === 1 ? '1st' : day === 2 ? '2nd' : day === 3 ? '3rd' : `${day}th`} of month
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">End Day</label>
                        <select
                          value={payPeriodForm.monthly_config.end_day}
                          onChange={(e) => {
                            handlePayPeriodConfigChange('monthly_config', 'end_day', parseInt(e.target.value));
                            setTimeout(updatePayPeriodName, 100);
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                        >
                          <option value={-1}>Last day of month</option>
                          {Array.from({length: 28}, (_, i) => i + 1).map(day => (
                            <option key={day} value={day}>
                              {day === 1 ? '1st' : day === 2 ? '2nd' : day === 3 ? '3rd' : `${day}th`} of month
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="mt-3 p-2 bg-purple-100 rounded text-sm text-purple-800">
                      <strong>Preview:</strong> {payPeriodForm.monthly_config.name}
                    </div>
                  </div>
                )}

                {/* Default Setting */}
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={payPeriodForm.is_default}
                      onChange={(e) => handlePayPeriodFormChange('is_default', e.target.checked)}
                      className="mr-3"
                    />
                    <div>
                      <div className="font-medium text-gray-900">Set as Default</div>
                      <div className="text-sm text-gray-500">
                        This will be the default period type used in timesheet agents and reports
                      </div>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 px-4 sm:px-6 py-4 bg-gray-50 border-t border-gray-200">
              <button
                onClick={closePayPeriodModal}
                className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={handleSavePayPeriod}
                disabled={loading}
                className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-white rounded-md disabled:opacity-50"
                style={{ backgroundColor: loading ? '#a3a3a3' : '#29add3' }}
                onMouseEnter={(e) => !loading && (e.target.style.backgroundColor = '#1e9bb8')}
                onMouseLeave={(e) => !loading && (e.target.style.backgroundColor = '#29add3')}
              >
                {loading ? 'Saving...' : (editingPayPeriod ? 'Update Setting' : 'Create Setting')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Save Configuration Modal */}
      {showSaveModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 shadow-xl max-w-sm mx-4">
            <div className="flex items-center space-x-3">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <div>
                <h3 className="text-lg font-medium text-gray-900">Saving Configuration</h3>
                <p className="text-sm text-gray-600">Updating timesheet settings...</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TimesheetConfiguration;