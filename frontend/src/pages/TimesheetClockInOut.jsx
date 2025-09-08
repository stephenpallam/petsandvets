import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Clock, Coffee, Play, Square, AlertCircle, CheckCircle, Timer, MapPin, User, Briefcase, Calendar } from 'lucide-react';
import axios from 'axios';

const TimesheetClockInOut = () => {
  const { user, token, loading: authLoading } = useAuth();
  const [timesheetStatus, setTimesheetStatus] = useState({
    is_clocked_in: false,
    is_on_break: false,
    clock_in_time: null,
    current_break: null,
    daily_hours: 0,
    breaks_today: 0
  });
  const [recentHours, setRecentHours] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [liveTimer, setLiveTimer] = useState({
    totalSeconds: 0,
    displayTime: '00:00:00',
    breakSeconds: 0,
    workingSeconds: 0
  });
  
  const [location, setLocation] = useState(null);
  const [locationEnabled, setLocationEnabled] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [locationPermissionAsked, setLocationPermissionAsked] = useState(false);
  const [notes, setNotes] = useState('');
  const [breakType, setBreakType] = useState('break');
  const [breakNotes, setBreakNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [authError, setAuthError] = useState(null);
  const [pageLoading, setPageLoading] = useState(true);
  const [config, setConfig] = useState(null);

  const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || import.meta.env.REACT_APP_BACKEND_URL || window.location.origin;

  const breakTypes = [
    { value: 'break', label: '☕ Break', icon: Coffee },
    { value: 'lunch', label: '🍽️ Lunch', icon: Briefcase },
    { value: 'other', label: '⏰ Other', icon: Timer }
  ];

  // Authentication check
  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (token && !user) {
      return;
    }

    // Check if user can access timesheet (all roles except admin)
    if (user && user.role !== 'admin') {
      setAuthError(null);
      setPageLoading(false);
    } else if (user && user.role === 'admin') {
      setAuthError('Timesheet system is for employees only. Admins do not need to clock in/out.');
      setPageLoading(false);
    } else if (!token) {
      setAuthError('Please log in to access the timesheet system.');
      setPageLoading(false);
    }
  }, [user, token, authLoading]);

  // Fetch timesheet status and config
  useEffect(() => {
    if (!pageLoading && user && user.role !== 'admin') {
      fetchTimesheetStatus();
      fetchConfig();
      fetchRecentHours();
    }
  }, [pageLoading, user]);

  // Request location after config is loaded
  useEffect(() => {
    if (config && locationEnabled && !locationPermissionAsked) {
      requestLocation();
    }
  }, [config, locationEnabled, locationPermissionAsked]);

  // Initialize timer when status is loaded
  useEffect(() => {
    if (timesheetStatus.is_clocked_in && timesheetStatus.clock_in_time) {
      updateLiveTimer(); // Initialize timer immediately
    }
  }, [timesheetStatus.is_clocked_in, timesheetStatus.clock_in_time]);

  // Auto-refresh status every 30 seconds when clocked in
  useEffect(() => {
    let interval;
    if (timesheetStatus.is_clocked_in) {
      interval = setInterval(() => {
        fetchTimesheetStatus();
      }, 30000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timesheetStatus.is_clocked_in]);

  // Live timer for real-time display
  useEffect(() => {
    let timerInterval;
    
    if (timesheetStatus.is_clocked_in && timesheetStatus.clock_in_time) {
      timerInterval = setInterval(() => {
        updateLiveTimer();
      }, 1000); // Update every second
    }
    
    return () => {
      if (timerInterval) clearInterval(timerInterval);
    };
  }, [timesheetStatus.is_clocked_in, timesheetStatus.clock_in_time, timesheetStatus.is_on_break, timesheetStatus.current_break]);

  const updateLiveTimer = () => {
    if (!timesheetStatus.clock_in_time) return;

    const clockInTime = new Date(timesheetStatus.clock_in_time);
    const currentTime = new Date();
    
    // Calculate total time since clock in
    const totalSeconds = Math.floor((currentTime - clockInTime) / 1000);
    
    // Calculate break time
    let totalBreakSeconds = 0;
    
    // Add time from current active break if on break
    if (timesheetStatus.is_on_break && timesheetStatus.current_break && timesheetStatus.current_break.break_start) {
      const breakStartTime = new Date(timesheetStatus.current_break.break_start);
      const currentBreakSeconds = Math.floor((currentTime - breakStartTime) / 1000);
      totalBreakSeconds += currentBreakSeconds;
    }
    
    // Note: For completed breaks, we'd need to get them from the backend
    // This is a simplified version for demo purposes
    
    // Working seconds = total seconds - break seconds
    const workingSeconds = Math.max(0, totalSeconds - totalBreakSeconds);
    
    // Display appropriate time based on current status
    let displaySeconds, displayLabel;
    if (timesheetStatus.is_on_break) {
      displaySeconds = totalBreakSeconds;
      displayLabel = 'Break Time';
    } else {
      displaySeconds = workingSeconds;
      displayLabel = 'Working Time';
    }
    
    const displayTime = formatSecondsToTime(displaySeconds);
    
    setLiveTimer({
      totalSeconds,
      displayTime,
      breakSeconds: totalBreakSeconds,
      workingSeconds: workingSeconds,
      displayLabel
    });
  };

  const formatSecondsToTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const fetchConfig = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/timesheet-config`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setConfig(response.data);
      setLocationEnabled(response.data.location_tracking_enabled);
    } catch (err) {
      console.error('Error fetching config:', err);
    }
  };

  const fetchTimesheetStatus = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/timesheet/status`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setTimesheetStatus(response.data);
    } catch (err) {
      console.error('Error fetching timesheet status:', err);
    }
  };

  const fetchRecentHours = async () => {
    try {
      // Get last 7 days of timesheet entries
      const endDate = new Date().toISOString().split('T')[0];
      const startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      
      const response = await axios.get(`${API_BASE_URL}/api/timesheet/my-hours?start_date=${startDate}&end_date=${endDate}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setRecentHours(response.data.slice(0, 10)); // Show last 10 entries
    } catch (err) {
      console.error('Error fetching recent hours:', err);
    }
  };

  const requestLocation = () => {
    // Check if we've already asked for location permission
    if (locationPermissionAsked) {
      return;
    }

    // Show custom modal instead of immediate browser prompt
    if (navigator.geolocation && locationEnabled) {
      setShowLocationModal(true);
    }
  };

  const handleLocationPermissionAccept = () => {
    setShowLocationModal(false);
    setLocationPermissionAsked(true);
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy
        });
      },
      (error) => {
        console.log('Location access denied or unavailable:', error);
        setMessage({ 
          type: 'info', 
          text: 'Location access was denied. You can still clock in without location tracking.' 
        });
      }
    );
  };

  const handleLocationPermissionDeny = () => {
    setShowLocationModal(false);
    setLocationPermissionAsked(true);
    setMessage({ 
      type: 'info', 
      text: 'Location tracking skipped. You can still clock in without location data.' 
    });
  };

  // Test function to show location modal (for testing purposes)
  const testLocationModal = () => {
    setLocationPermissionAsked(false);
    setShowLocationModal(true);
  };

  const handleClockIn = async () => {
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const clockData = {
        notes: notes.trim() || null,
        location_data: locationEnabled && location ? {
          ...location,
          timestamp: new Date().toISOString(),
          ip_address: null // Could be added server-side
        } : null
      };

      const response = await axios.post(`${API_BASE_URL}/api/timesheet/clock-in`, clockData, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      setMessage({ type: 'success', text: 'Successfully clocked in!' });
      setNotes('');
      fetchTimesheetStatus();
    } catch (err) {
      setMessage({ 
        type: 'error', 
        text: err.response?.data?.detail || 'Failed to clock in. Please try again.' 
      });
    } finally {
      setLoading(false);
      setTimeout(() => setMessage({ type: '', text: '' }), 5000);
    }
  };

  const handleClockOut = async () => {
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await axios.post(`${API_BASE_URL}/api/timesheet/clock-out`, {}, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      // Show total hours worked message
      const totalHours = response.data.total_hours || 0;
      const regularHours = response.data.regular_hours || 0;
      const afterHours = response.data.after_hours_hours || 0;
      
      let hoursSummary = `Total: ${formatDuration(totalHours)}`;
      if (afterHours > 0) {
        hoursSummary += ` (${formatDuration(regularHours)} regular + ${formatDuration(afterHours)} after-hours)`;
      }
      
      setMessage({ 
        type: 'success', 
        text: `Successfully clocked out! ${hoursSummary} worked today.` 
      });
      
      fetchTimesheetStatus();
      
      // Reset timer
      setLiveTimer({
        totalSeconds: 0,
        displayTime: '00:00:00',
        breakSeconds: 0,
        workingSeconds: 0
      });
    } catch (err) {
      setMessage({ 
        type: 'error', 
        text: err.response?.data?.detail || 'Failed to clock out. Please try again.' 
      });
    } finally {
      setLoading(false);
      setTimeout(() => setMessage({ type: '', text: '' }), 8000); // Show message longer for hours summary
    }
  };

  const handleStartBreak = async () => {
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const breakData = {
        break_type: breakType,
        notes: breakNotes.trim() || null
      };

      const response = await axios.post(`${API_BASE_URL}/api/timesheet/break-start`, breakData, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      setMessage({ type: 'success', text: `${breakType.charAt(0).toUpperCase() + breakType.slice(1)} started!` });
      setBreakNotes('');
      fetchTimesheetStatus();
    } catch (err) {
      setMessage({ 
        type: 'error', 
        text: err.response?.data?.detail || 'Failed to start break. Please try again.' 
      });
    } finally {
      setLoading(false);
      setTimeout(() => setMessage({ type: '', text: '' }), 5000);
    }
  };

  const handleEndBreak = async () => {
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const breakData = {
        notes: breakNotes.trim() || null
      };

      const response = await axios.post(`${API_BASE_URL}/api/timesheet/break-end`, breakData, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      setMessage({ type: 'success', text: 'Break ended!' });
      setBreakNotes('');
      fetchTimesheetStatus();
    } catch (err) {
      setMessage({ 
        type: 'error', 
        text: err.response?.data?.detail || 'Failed to end break. Please try again.' 
      });
    } finally {
      setLoading(false);
      setTimeout(() => setMessage({ type: '', text: '' }), 5000);
    }
  };

  const formatTime = (timeString) => {
    if (!timeString) return '';
    const date = new Date(timeString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDuration = (hours) => {
    const totalMinutes = Math.round(hours * 60);
    const hrs = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;
    return `${hrs}h ${mins}m`;
  };

  // Loading state
  if (pageLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading timesheet system...</p>
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
                Clock In & Clock Out
              </h2>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <User className="h-4 w-4" />
                <span>{user?.full_name}</span>
                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-md text-xs font-medium">
                  {user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)}
                </span>
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

            {/* Current Status Card with Live Timer */}
            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Live Status</h3>
                  <p className="text-sm text-gray-600">Welcome, {user?.full_name}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-600">
                    {new Date().toLocaleDateString()}
                  </span>
                </div>
              </div>

              {timesheetStatus.is_clocked_in ? (
                <div className="space-y-4">
                  {/* Live Status Display */}
                  <div className="bg-white p-6 rounded-lg border-l-4 border-green-500">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="relative">
                          <Clock className="h-8 w-8 text-green-500" />
                          <div className="absolute -top-1 -right-1 h-3 w-3 bg-green-400 rounded-full animate-pulse"></div>
                        </div>
                        <div>
                          <p className="text-lg font-semibold text-green-700">
                            {timesheetStatus.is_on_break ? 'On Break' : 'Clocked In & Working'}
                          </p>
                          <p className="text-sm text-gray-600">
                            Since {formatTime(timesheetStatus.clock_in_time)}
                          </p>
                        </div>
                      </div>
                      
                      {/* Live Timer Display */}
                      <div className="text-right">
                        <div className="text-3xl font-bold text-gray-900 font-mono">
                          {liveTimer.displayTime}
                        </div>
                        <p className="text-sm text-gray-600">
                          {liveTimer.displayLabel || (timesheetStatus.is_on_break ? 'Break Time' : 'Working Time')}
                        </p>
                      </div>
                    </div>
                    
                    {/* Break Status */}
                    {timesheetStatus.is_on_break && timesheetStatus.current_break && (
                      <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                        <div className="flex items-center space-x-2 text-orange-800">
                          <Coffee className="h-4 w-4" />
                          <span className="text-sm font-medium">
                            {timesheetStatus.current_break.break_type?.charAt(0).toUpperCase() + timesheetStatus.current_break.break_type?.slice(1)} break started at {formatTime(timesheetStatus.current_break.break_start)}
                          </span>
                        </div>
                      </div>
                    )}
                    
                    {/* Working Time Summary */}
                    {!timesheetStatus.is_on_break && (
                      <div className="flex justify-between text-sm text-gray-600 bg-green-50 rounded-lg p-3">
                        <span>Total breaks today: {timesheetStatus.breaks_today}</span>
                        <span>Working continuously for: {liveTimer.displayTime}</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Action Buttons for Clocked In State */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {timesheetStatus.is_on_break ? (
                      // On Break - Show "I'm Back" button
                      <div className="md:col-span-2">
                        <button
                          onClick={handleEndBreak}
                          disabled={loading}
                          className="w-full text-white font-medium py-4 px-6 rounded-lg transition-colors flex items-center justify-center space-x-3 text-lg disabled:opacity-50"
                          style={{ 
                            backgroundColor: loading ? '#a3a3a3' : '#29add3',
                            '&:hover': { backgroundColor: loading ? '#a3a3a3' : '#1e9bb8' }
                          }}
                          onMouseEnter={(e) => !loading && (e.target.style.backgroundColor = '#1e9bb8')}
                          onMouseLeave={(e) => !loading && (e.target.style.backgroundColor = '#29add3')}
                        >
                          <Play className="h-6 w-6" />
                          <span>{loading ? 'Ending Break...' : "I'm Back from Break"}</span>
                        </button>
                      </div>
                    ) : (
                      // Working - Show Take Break and Clock Out buttons
                      <>
                        <div className="space-y-3">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Break Type
                            </label>
                            <select
                              value={breakType}
                              onChange={(e) => setBreakType(e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                              {breakTypes.map(type => (
                                <option key={type.value} value={type.value}>
                                  {type.label}
                                </option>
                              ))}
                            </select>
                          </div>
                          
                          <button
                            onClick={handleStartBreak}
                            disabled={loading}
                            className="w-full bg-orange-600 hover:bg-orange-700 disabled:bg-orange-400 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
                          >
                            <Coffee className="h-5 w-5" />
                            <span>{loading ? 'Starting Break...' : 'Take Break'}</span>
                          </button>
                        </div>
                        
                        <button
                          onClick={handleClockOut}
                          disabled={loading}
                          className="text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2 disabled:opacity-50"
                          style={{ 
                            backgroundColor: loading ? '#a3a3a3' : '#29add3',
                            '&:hover': { backgroundColor: loading ? '#a3a3a3' : '#1e9bb8' }
                          }}
                          onMouseEnter={(e) => !loading && (e.target.style.backgroundColor = '#1e9bb8')}
                          onMouseLeave={(e) => !loading && (e.target.style.backgroundColor = '#29add3')}
                        >
                          <Square className="h-5 w-5" />
                          <span>{loading ? 'Clocking Out...' : 'Clock Out'}</span>
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ) : (
                // Not Clocked In
                <div className="bg-white p-6 rounded-lg border-l-4 border-gray-300">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Clock className="h-8 w-8 text-gray-400" />
                      <div>
                        <p className="text-lg font-semibold text-gray-700">Not Clocked In</p>
                        <p className="text-sm text-gray-600">Ready to start your workday</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-gray-400 font-mono">
                        --:--:--
                      </div>
                      <p className="text-sm text-gray-600">No active session</p>
                    </div>
                  </div>
                  
                  {/* Clock In Section */}
                  <div className="mt-6 space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Notes (Optional)
                      </label>
                      <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Add any notes about your shift..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        rows="3"
                      />
                    </div>

                    {locationEnabled && (
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <MapPin className="h-4 w-4" />
                        <span>
                          {location 
                            ? 'Location will be recorded' 
                            : 'Location access not available'
                          }
                        </span>
                      </div>
                    )}

                    <button
                      onClick={handleClockIn}
                      disabled={loading}
                      className="w-full text-white font-medium py-4 px-6 rounded-lg transition-colors flex items-center justify-center space-x-3 text-lg disabled:opacity-50"
                      style={{ 
                        backgroundColor: loading ? '#a3a3a3' : '#29add3',
                        '&:hover': { backgroundColor: loading ? '#a3a3a3' : '#1e9bb8' }
                      }}
                      onMouseEnter={(e) => !loading && (e.target.style.backgroundColor = '#1e9bb8')}
                      onMouseLeave={(e) => !loading && (e.target.style.backgroundColor = '#29add3')}
                    >
                      <Play className="h-6 w-6" />
                      <span>{loading ? 'Clocking In...' : 'Clock In'}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Debug/Status Information */}
            {timesheetStatus.is_clocked_in && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <h4 className="font-medium text-blue-900 mb-2">Session Information</h4>
                <div className="text-sm text-blue-800 space-y-1">
                  <p>• Clocked in at: {formatTime(timesheetStatus.clock_in_time)}</p>
                  <p>• Current status: {timesheetStatus.is_on_break ? 'On Break' : 'Working'}</p>
                  <p>• Breaks taken today: {timesheetStatus.breaks_today}</p>
                  <p>• Hours worked so far: {formatDuration(timesheetStatus.daily_hours)}</p>
                </div>
              </div>
            )}

            {/* Configuration Info */}
            {config && (
              <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2">System Information</h4>
                <div className="text-sm text-blue-800 space-y-1">
                  <p>• After hours applies after {config.after_hours_cutoff_time}</p>
                  <p>• Auto clock-out: {config.auto_clockout_grace_minutes} minutes after business hours</p>
                  <p>• Location tracking: {config.location_tracking_enabled ? 'Enabled' : 'Disabled'}</p>
                </div>
                {/* Test button for location modal - remove in production */}
                <div className="mt-3 pt-3 border-t border-blue-200">
                  <button
                    onClick={testLocationModal}
                    className="text-xs px-2 py-1 bg-blue-100 hover:bg-blue-200 text-blue-800 rounded"
                  >
                    Test Location Modal
                  </button>
                </div>
              </div>
            )}

            {/* Recent Hours Section */}
            <div className="mt-6">
              <div className="flex justify-between items-center mb-4">
                <h4 className="font-medium text-gray-900">My Recent Hours</h4>
                <button
                  onClick={() => {
                    setShowHistory(!showHistory);
                    if (!showHistory) fetchRecentHours();
                  }}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  {showHistory ? 'Hide History' : 'Show History'}
                </button>
              </div>

              {showHistory && (
                <div className="bg-gray-50 rounded-lg p-4">
                  {recentHours.length > 0 ? (
                    <div className="space-y-3">
                      {recentHours.map((entry, index) => (
                        <div key={entry.id} className="bg-white p-3 rounded border">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium text-gray-900">
                                {new Date(entry.clock_in_time).toLocaleDateString()}
                              </p>
                              <p className="text-sm text-gray-600">
                                {formatTime(entry.clock_in_time)} - {
                                  entry.clock_out_time ? formatTime(entry.clock_out_time) : 'Still clocked in'
                                }
                              </p>
                              {entry.breaks && entry.breaks.length > 0 && (
                                <p className="text-xs text-gray-500">
                                  {entry.breaks.length} break(s) taken
                                </p>
                              )}
                            </div>
                            <div className="text-right">
                              <p className="font-medium text-gray-900">
                                {entry.total_hours ? formatDuration(entry.total_hours) : '0h 0m'}
                              </p>
                              {entry.after_hours_hours > 0 && (
                                <p className="text-xs text-orange-600">
                                  {formatDuration(entry.after_hours_hours)} AH
                                </p>
                              )}
                              <div className="flex items-center space-x-1 mt-1">
                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                  entry.status === 'completed' 
                                    ? 'bg-green-100 text-green-800' 
                                    : entry.status === 'active'
                                    ? 'bg-blue-100 text-blue-800'
                                    : 'bg-yellow-100 text-yellow-800'
                                }`}>
                                  {entry.status === 'completed' ? 'Complete' : 
                                   entry.status === 'active' ? 'Active' : 'Adjusted'}
                                </span>
                                {entry.is_auto_clockout && (
                                  <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-orange-100 text-orange-800">
                                    Auto
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <Clock className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-600">No recent timesheet entries found</p>
                      <p className="text-sm text-gray-500">Your clock in/out history will appear here</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Custom Location Permission Modal */}
      {showLocationModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-md bg-white rounded-lg shadow-lg">
            {/* Modal Header */}
            <div className="flex items-center justify-center mb-4">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full" style={{ backgroundColor: '#e6f7ff' }}>
                <MapPin className="h-6 w-6" style={{ color: '#29add3' }} />
              </div>
            </div>

            {/* Modal Content */}
            <div className="text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Enable Location Tracking
              </h3>
              <p className="text-sm text-gray-600 mb-6">
                Our timesheet system can track your location when you clock in and out to help verify work locations. 
                This information is only used for timesheet purposes and helps ensure accurate attendance records.
              </p>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-6">
                <div className="flex items-start space-x-2">
                  <MapPin className="h-4 w-4 text-blue-600 mt-0.5" />
                  <div className="text-left">
                    <p className="text-sm font-medium text-blue-900">What we collect:</p>
                    <ul className="text-xs text-blue-800 mt-1 space-y-1">
                      <li>• Your approximate location coordinates</li>
                      <li>• Timestamp of clock in/out events</li>
                      <li>• Location is only recorded during clock events</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex flex-col sm:flex-row justify-center space-y-2 sm:space-y-0 sm:space-x-3">
              <button
                onClick={handleLocationPermissionDeny}
                className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
              >
                Skip Location
              </button>
              <button
                onClick={handleLocationPermissionAccept}
                className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-white rounded-md transition-colors"
                style={{ backgroundColor: '#29add3' }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#1e9bb8'}
                onMouseLeave={(e) => e.target.style.backgroundColor = '#29add3'}
              >
                Enable Location
              </button>
            </div>

            <div className="mt-4 text-center">
              <p className="text-xs text-gray-500">
                You can still clock in and out without location tracking
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TimesheetClockInOut;