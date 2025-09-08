import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  Calendar, 
  Clock, 
  Users, 
  Plus, 
  Edit3, 
  Trash2, 
  ChevronLeft, 
  ChevronRight,
  AlertCircle,
  CheckCircle,
  User,
  MapPin,
  FileText
} from 'lucide-react';
import axios from 'axios';

const SchedulingCalendar = () => {
  const { user, token, loading: authLoading } = useAuth();
  const [employees, setEmployees] = useState([]);
  const [weekSchedule, setWeekSchedule] = useState({});
  const [currentWeekStart, setCurrentWeekStart] = useState(new Date());
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [showShiftModal, setShowShiftModal] = useState(false);
  const [selectedShift, setSelectedShift] = useState(null);
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [authError, setAuthError] = useState(null);
  const [pageLoading, setPageLoading] = useState(true);

  const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || import.meta.env.REACT_APP_BACKEND_URL || window.location.origin;

  // Shift form data
  const [shiftForm, setShiftForm] = useState({
    start_time: '09:00',
    end_time: '17:00',
    notes: ''
  });

  // Shift presets loaded from backend
  const [shiftPresets, setShiftPresets] = useState([]);

  // Authentication check
  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (token && !user) {
      return;
    }

    // Check if user can access scheduling (managers and admins only)
    if (user && (user.role === 'manager' || user.role === 'admin')) {
      setAuthError(null);
      setPageLoading(false);
    } else if (user) {
      setAuthError('Access denied. Only managers can access the scheduling system.');
      setPageLoading(false);
    } else if (!token) {
      setAuthError('Please log in to access the scheduling system.');
      setPageLoading(false);
    }
  }, [user, token, authLoading]);

  // Initialize week to current Monday
  useEffect(() => {
    const today = new Date();
    const monday = new Date(today);
    const dayOfWeek = today.getDay();
    const daysToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // Sunday = 0, Monday = 1
    monday.setDate(today.getDate() + daysToMonday);
    setCurrentWeekStart(monday);
  }, []);

  // Load data when component mounts and when week changes
  useEffect(() => {
    if (!pageLoading && user && (user.role === 'manager' || user.role === 'admin')) {
      loadScheduleData();
    }
  }, [pageLoading, user, currentWeekStart]);

  const loadScheduleData = async () => {
    setLoading(true);
    try {
      const weekStartStr = formatDateForAPI(currentWeekStart);
      
      // Load employees, weekly schedule, and shift presets
      const [employeesRes, scheduleRes, presetsRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/api/schedule/employees`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        axios.get(`${API_BASE_URL}/api/schedule/week/${weekStartStr}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        axios.get(`${API_BASE_URL}/api/shift-presets`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }).catch(() => ({ data: [] })) // Don't fail if presets don't load
      ]);

      setEmployees(employeesRes.data);
      setWeekSchedule(scheduleRes.data);
      setShiftPresets(presetsRes.data);
    } catch (err) {
      console.error('Error loading schedule data:', err);
      setMessage({ 
        type: 'error', 
        text: 'Failed to load schedule data. Please try again.' 
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDateForAPI = (date) => {
    return date.toISOString().split('T')[0];
  };

  const formatDateForDisplay = (date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const getWeekDates = () => {
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(currentWeekStart);
      date.setDate(currentWeekStart.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  const navigateWeek = (direction) => {
    const newWeekStart = new Date(currentWeekStart);
    newWeekStart.setDate(currentWeekStart.getDate() + (direction * 7));
    setCurrentWeekStart(newWeekStart);
  };

  const openShiftModal = (employeeId = '', date = '', existingShift = null) => {
    setSelectedEmployee(employeeId);
    setSelectedDate(date);
    setSelectedShift(existingShift);
    
    if (existingShift) {
      setShiftForm({
        start_time: existingShift.start_time,
        end_time: existingShift.end_time,
        notes: existingShift.notes || ''
      });
    } else {
      setShiftForm({
        start_time: '09:00',
        end_time: '17:00',
        notes: ''
      });
    }
    
    setShowShiftModal(true);
  };

  const closeShiftModal = () => {
    setShowShiftModal(false);
    setSelectedShift(null);
    setSelectedEmployee('');
    setSelectedDate('');
    setMessage({ type: '', text: '' });
  };

  const handleSaveShift = async () => {
    if (!selectedEmployee || !selectedDate) {
      setMessage({ type: 'error', text: 'Please select an employee and date' });
      return;
    }

    setLoading(true);
    try {
      const shiftData = {
        user_id: selectedEmployee,
        schedule_date: selectedDate,
        ...shiftForm
      };

      if (selectedShift) {
        // Update existing shift
        await axios.put(`${API_BASE_URL}/api/schedule/shifts/${selectedShift.id}`, shiftData, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        setMessage({ type: 'success', text: 'Shift updated successfully!' });
      } else {
        // Create new shift
        await axios.post(`${API_BASE_URL}/api/schedule/shifts`, shiftData, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        setMessage({ type: 'success', text: 'Shift created successfully!' });
      }

      closeShiftModal();
      loadScheduleData(); // Reload the schedule
    } catch (err) {
      const errorMsg = err.response?.data?.detail || 'Failed to save shift. Please try again.';
      setMessage({ type: 'error', text: errorMsg });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteShift = async (shiftId) => {
    if (!confirm('Are you sure you want to delete this shift?')) {
      return;
    }

    setLoading(true);
    try {
      await axios.delete(`${API_BASE_URL}/api/schedule/shifts/${shiftId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      setMessage({ type: 'success', text: 'Shift deleted successfully!' });
      loadScheduleData(); // Reload the schedule
    } catch (err) {
      setMessage({ 
        type: 'error', 
        text: 'Failed to delete shift. Please try again.' 
      });
    } finally {
      setLoading(false);
    }
  };

  const applyShiftPreset = (preset) => {
    setShiftForm({
      ...shiftForm,
      start_time: preset.start_time,
      end_time: preset.end_time
    });
  };

  const getShiftForEmployeeAndDate = (employeeId, date) => {
    const dateStr = formatDateForAPI(date);
    return weekSchedule.schedule?.[dateStr]?.[employeeId] || null;
  };

  const getShiftStatusColor = (status) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'confirmed': return 'bg-green-100 text-green-800 border-green-200';
      case 'completed': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      case 'no_show': return 'bg-orange-100 text-orange-800 border-orange-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const calculateShiftDuration = (startTime, endTime) => {
    const [startHour, startMin] = startTime.split(':').map(Number);
    const [endHour, endMin] = endTime.split(':').map(Number);
    
    let duration = (endHour * 60 + endMin) - (startHour * 60 + startMin);
    if (duration < 0) duration += 24 * 60; // Handle overnight shifts
    
    const hours = Math.floor(duration / 60);
    const minutes = duration % 60;
    return `${hours}h${minutes > 0 ? ` ${minutes}m` : ''}`;
  };

  // Loading state
  if (pageLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading scheduling system...</p>
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

  const weekDates = getWeekDates();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-2 sm:px-4 lg:px-8 py-4 sm:py-8">
        
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Header */}
          <div className="px-4 sm:px-6 py-4 bg-gray-50 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
              <div className="flex items-center space-x-3">
                <Calendar className="h-6 w-6 text-blue-600" />
                <h2 className="text-lg font-semibold text-gray-900">
                  Employee Scheduling Calendar
                </h2>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">{user?.full_name}</span>
                <span className="sm:hidden text-xs">{user?.full_name?.split(' ')[0]}</span>
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-md text-xs">
                  {user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)}
                </span>
              </div>
            </div>
          </div>

          {/* Week Navigation */}
          <div className="px-4 sm:px-6 py-4 bg-white border-b border-gray-200">
            <div className="flex items-center justify-between">
              <button
                onClick={() => navigateWeek(-1)}
                className="flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors text-sm"
              >
                <ChevronLeft className="h-4 w-4" />
                <span className="hidden sm:inline">Previous Week</span>
                <span className="sm:hidden">Prev</span>
              </button>
              
              <div className="text-center">
                <h3 className="text-base sm:text-lg font-medium text-gray-900">
                  Week of {formatDateForDisplay(currentWeekStart)}
                </h3>
                <p className="text-xs sm:text-sm text-gray-600">
                  {formatDateForAPI(currentWeekStart)} to {formatDateForAPI(weekDates[6])}
                </p>
              </div>
              
              <button
                onClick={() => navigateWeek(1)}
                className="flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors text-sm"
              >
                <span className="hidden sm:inline">Next Week</span>
                <span className="sm:hidden">Next</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Message Display */}
          {message.text && (
            <div className="px-4 sm:px-6 py-4">
              <div className={`rounded-md p-3 sm:p-4 ${
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
            </div>
          )}

          {/* Schedule Grid */}
          <div className="overflow-x-auto">
            <div className="min-w-full" style={{ minWidth: '800px' }}>
              {/* Calendar Header */}
              <div className="grid grid-cols-8 bg-gray-50 border-b border-gray-200">
                <div className="px-2 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Employee
                </div>
                {weekDates.map((date, index) => (
                  <div key={index} className="px-2 sm:px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="hidden sm:block">{formatDateForDisplay(date)}</div>
                    <div className="sm:hidden">
                      {date.toLocaleDateString('en-US', { weekday: 'short' })}
                    </div>
                    <div className="text-gray-400 font-normal text-xs">
                      <span className="sm:hidden">{date.getDate()}</span>
                      <span className="hidden sm:inline">{formatDateForAPI(date)}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Schedule Rows */}
              <div className="bg-white divide-y divide-gray-200">
                {employees.filter(emp => emp.is_active).map((employee) => (
                  <div key={employee.id} className="grid grid-cols-8">
                    {/* Employee Info */}
                    <div className="px-2 sm:px-4 py-4 sm:py-6 border-r border-gray-200">
                      <div>
                        <div className="text-xs sm:text-sm font-medium text-gray-900">
                          {employee.full_name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {employee.role.charAt(0).toUpperCase() + employee.role.slice(1)}
                        </div>
                      </div>
                    </div>

                    {/* Daily Shift Cells */}
                    {weekDates.map((date, dateIndex) => {
                      const shift = getShiftForEmployeeAndDate(employee.id, date);
                      const dateStr = formatDateForAPI(date);
                      
                      return (
                        <div key={dateIndex} className="px-1 sm:px-2 py-2 sm:py-4 border-r border-gray-200 min-h-[80px] sm:min-h-[100px]">
                          {shift ? (
                            // Existing shift
                            <div className={`rounded-lg border p-2 sm:p-3 ${getShiftStatusColor(shift.status)}`}>
                              <div className="flex items-start justify-between mb-1 sm:mb-2">
                                <div className="text-xs font-medium">
                                  {shift.start_time} - {shift.end_time}
                                </div>
                                <div className="flex space-x-1">
                                  <button
                                    onClick={() => openShiftModal(employee.id, dateStr, shift)}
                                    className="text-gray-400 hover:text-gray-600"
                                  >
                                    <Edit3 className="h-3 w-3" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteShift(shift.id)}
                                    className="text-gray-400 hover:text-red-600"
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </button>
                                </div>
                              </div>
                              
                              <div className="text-xs space-y-1">
                                <div>{calculateShiftDuration(shift.start_time, shift.end_time)}</div>
                                <div className="font-medium capitalize">{shift.status}</div>
                              </div>
                            </div>
                          ) : (
                            // Empty slot - add shift button
                            <button
                              onClick={() => openShiftModal(employee.id, dateStr)}
                              className="w-full h-full min-h-[60px] sm:min-h-[80px] border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-600 hover:border-gray-400 transition-colors"
                            >
                              <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Loading indicator */}
          {loading && (
            <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          )}
        </div>
      </div>

      {/* Shift Modal */}
      {showShiftModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-4 sm:top-20 mx-auto w-full max-w-lg mx-4 sm:mx-auto bg-white rounded-lg shadow-lg flex flex-col max-h-[95vh] sm:max-h-[80vh]">
            {/* Sticky Header */}
            <div className="flex items-center justify-between px-4 sm:px-6 py-4 text-white rounded-t-lg" style={{ backgroundColor: '#29add3' }}>
              <h3 className="text-base sm:text-lg font-medium">
                {selectedShift ? 'Edit Shift' : 'Schedule New Shift'}
              </h3>
              <button
                onClick={closeShiftModal}
                className="text-white hover:text-gray-200 text-xl"
              >
                ✕
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4">
              <div className="space-y-4">
                {/* Employee and Date Info */}
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="text-sm">
                    <strong>Employee:</strong> {employees.find(e => e.id === selectedEmployee)?.full_name}
                  </div>
                  <div className="text-sm">
                    <strong>Date:</strong> {selectedDate}
                  </div>
                </div>

                {/* Shift Presets */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quick Presets
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {shiftPresets.map((preset, index) => (
                      <button
                        key={index}
                        onClick={() => applyShiftPreset(preset)}
                        className="px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg text-left"
                      >
                        <div className="font-medium">{preset.name}</div>
                        <div className="text-gray-600">{preset.start_time} - {preset.end_time}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Time Inputs */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Start Time
                    </label>
                    <input
                      type="time"
                      value={shiftForm.start_time}
                      onChange={(e) => setShiftForm({...shiftForm, start_time: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-opacity-50"
                      style={{ focusRingColor: '#29add3' }}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      End Time
                    </label>
                    <input
                      type="time"
                      value={shiftForm.end_time}
                      onChange={(e) => setShiftForm({...shiftForm, end_time: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-opacity-50"
                      style={{ focusRingColor: '#29add3' }}
                    />
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notes
                  </label>
                  <textarea
                    value={shiftForm.notes}
                    onChange={(e) => setShiftForm({...shiftForm, notes: e.target.value})}
                    placeholder="Any additional notes or instructions..."
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-opacity-50"
                    style={{ focusRingColor: '#29add3' }}
                  />
                </div>

                {/* Duration Display */}
                <div className="p-3 rounded-lg" style={{ backgroundColor: '#e6f7ff' }}>
                  <div className="text-sm" style={{ color: '#29add3' }}>
                    <Clock className="inline h-4 w-4 mr-1" />
                    Duration: {calculateShiftDuration(shiftForm.start_time, shiftForm.end_time)}
                  </div>
                </div>
              </div>
            </div>

            {/* Sticky Footer */}
            <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 px-4 sm:px-6 py-4 bg-gray-50 border-t border-gray-200 rounded-b-lg">
              <button
                onClick={closeShiftModal}
                className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveShift}
                disabled={loading}
                className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-white rounded-md disabled:opacity-50"
                style={{ backgroundColor: loading ? '#a3a3a3' : '#29add3' }}
                onMouseEnter={(e) => !loading && (e.target.style.backgroundColor = '#1e9bb8')}
                onMouseLeave={(e) => !loading && (e.target.style.backgroundColor = '#29add3')}
              >
                {loading ? 'Saving...' : (selectedShift ? 'Update Shift' : 'Create Shift')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SchedulingCalendar;