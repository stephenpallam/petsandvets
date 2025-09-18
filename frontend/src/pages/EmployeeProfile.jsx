import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useParams, useNavigate } from 'react-router-dom';
import { User, Mail, Briefcase, DollarSign, Clock, Calendar, Edit2, Save, X, AlertCircle, CheckCircle, TrendingUp, Activity, Target, Award, ArrowLeft } from 'lucide-react';
import axios from 'axios';

const EmployeeProfile = () => {
  const { user_id } = useParams();
  const navigate = useNavigate();
  const { user, token, canAccessManager, loading: authLoading } = useAuth();
  const [employee, setEmployee] = useState(null);
  const [employeeConfig, setEmployeeConfig] = useState(null);
  const [recentEntries, setRecentEntries] = useState([]);
  const [workStats, setWorkStats] = useState({
    totalDays: 0,
    totalHours: 0,
    regularHours: 0,
    afterHours: 0,
    totalPay: 0,
    averageDailyHours: 0,
    thisWeekHours: 0,
    thisMonthHours: 0
  });
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    role: '',
    hourly_rate: '',
    after_hours_rate: '',
    is_active: true
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [authError, setAuthError] = useState(null);
  const [pageLoading, setPageLoading] = useState(true);

  const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || import.meta.env.REACT_APP_BACKEND_URL || window.location.origin;

  const roles = [
    { value: 'user', label: 'User' },
    { value: 'technician', label: 'Technician' },
    { value: 'manager', label: 'Manager' }
  ];

  // Authentication check - managers/admins can view all, employees can view their own
  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (token && !user) {
      return;
    }

    if (user && (canAccessManager() || user.id === user_id)) {
      setAuthError(null);
      setPageLoading(false);
    } else if (user && !canAccessManager() && user.id !== user_id) {
      setAuthError('Access denied. You can only view your own profile.');
      setPageLoading(false);
    } else if (!token) {
      setAuthError('Please log in to view employee profiles.');
      setPageLoading(false);
    }
  }, [user, token, authLoading, canAccessManager, user_id]);

  // Fetch data when page loads
  useEffect(() => {
    if (!pageLoading && user) {
      fetchEmployeeData();
    }
  }, [pageLoading, user, user_id]);

  const fetchEmployeeData = async () => {
    setLoading(true);
    try {
      // Fetch employee details
      const employeeResponse = await axios.get(`${API_BASE_URL}/api/employees/${user_id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setEmployee(employeeResponse.data);

      // Fetch employee config
      const configResponse = await axios.get(`${API_BASE_URL}/api/employee-configs/${user_id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setEmployeeConfig(configResponse.data);

      // Set form data for editing
      setFormData({
        full_name: employeeResponse.data.full_name,
        email: employeeResponse.data.email,
        role: employeeResponse.data.role,
        hourly_rate: configResponse.data.hourly_rate.toString(),
        after_hours_rate: configResponse.data.after_hours_rate ? configResponse.data.after_hours_rate.toString() : '',
        is_active: configResponse.data.is_active
      });

      // Fetch recent timesheet entries
      if (canAccessManager() || user.id === user_id) {
        fetchRecentEntries(configResponse.data);
      }

    } catch (err) {
      console.error('Error fetching employee data:', err);
      setMessage({ 
        type: 'error', 
        text: err.response?.data?.detail || 'Failed to fetch employee data' 
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchRecentEntries = async (empConfig) => {
    try {
      // Get last 30 days
      const endDate = new Date().toISOString().split('T')[0];
      const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      
      let url = `${API_BASE_URL}/api/timesheet/my-hours?start_date=${startDate}&end_date=${endDate}`;
      
      // If manager/admin viewing another employee, use reports endpoint
      if (canAccessManager() && user.id !== user_id) {
        url = `${API_BASE_URL}/api/timesheet/reports?start_date=${startDate}&end_date=${endDate}&user_id=${user_id}`;
      }

      const response = await axios.get(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      let entries = [];
      if (canAccessManager() && user.id !== user_id) {
        // Reports endpoint returns different structure
        entries = response.data.reports?.[0]?.entries || [];
      } else {
        entries = response.data.slice(0, 10); // Last 10 entries
      }
      
      setRecentEntries(entries);
      
      // Calculate comprehensive statistics
      calculateWorkStats(entries, empConfig);
    } catch (err) {
      console.error('Error fetching recent entries:', err);
    }
  };

  const calculateWorkStats = (entries, empConfig) => {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    let totalDays = 0;
    let totalHours = 0;
    let regularHours = 0;
    let afterHours = 0;
    let thisWeekHours = 0;
    let thisMonthHours = 0;
    
    entries.forEach(entry => {
      if (entry.status === 'completed' && entry.total_hours) {
        totalDays++;
        totalHours += entry.total_hours;
        regularHours += entry.regular_hours || 0;
        afterHours += entry.after_hours_hours || 0;
        
        const entryDate = new Date(entry.clock_in_time);
        if (entryDate >= startOfWeek) {
          thisWeekHours += entry.total_hours;
        }
        if (entryDate >= startOfMonth) {
          thisMonthHours += entry.total_hours;
        }
      }
    });
    
    const averageDailyHours = totalDays > 0 ? totalHours / totalDays : 0;
    const hourlyRate = empConfig?.hourly_rate || 0;
    const afterHoursRate = empConfig?.after_hours_rate || hourlyRate;
    const totalPay = (regularHours * hourlyRate) + (afterHours * afterHoursRate);
    
    setWorkStats({
      totalDays,
      totalHours,
      regularHours,
      afterHours,
      totalPay,
      averageDailyHours,
      thisWeekHours,
      thisMonthHours
    });
  };

  const handleSaveProfile = async () => {
    if (!canAccessManager()) {
      setMessage({ type: 'error', text: 'Only managers can edit employee profiles' });
      return;
    }

    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      // Update employee details
      const employeeData = {
        full_name: formData.full_name,
        email: formData.email,
        role: formData.role
      };

      await axios.put(`${API_BASE_URL}/api/employees/${user_id}`, employeeData, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      // Update employee config
      const configData = {
        hourly_rate: parseFloat(formData.hourly_rate) || 0,
        after_hours_rate: formData.after_hours_rate ? parseFloat(formData.after_hours_rate) : null,
        is_active: formData.is_active
      };

      await axios.put(`${API_BASE_URL}/api/employee-configs/${user_id}`, configData, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      setIsEditing(false);
      fetchEmployeeData();
    } catch (err) {
      setMessage({ 
        type: 'error', 
        text: err.response?.data?.detail || 'Failed to update profile' 
      });
    } finally {
      setLoading(false);
      setTimeout(() => setMessage({ type: '', text: '' }), 5000);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatTime = (timeString) => {
    return new Date(timeString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
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
          <p className="text-gray-600">Loading employee profile...</p>
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

  if (!employee || !employeeConfig) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Employee not found</p>
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
                {employee?.full_name || 'Employee'} Profile
              </h2>
              {canAccessManager() && (
                <div className="flex space-x-2">
                  {isEditing ? (
                    <>
                      <button
                        onClick={() => navigate('/employee-management')}
                        className="bg-gray-500 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center space-x-2"
                        title="Back to Employee Management"
                      >
                        <ArrowLeft className="h-4 w-4" />
                        <span>Back</span>
                      </button>
                      <button
                        onClick={() => setIsEditing(false)}
                        className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium py-2 px-4 rounded-lg transition-colors flex items-center space-x-2"
                      >
                        <X className="h-4 w-4" />
                        <span>Cancel</span>
                      </button>
                      <button
                        onClick={handleSaveProfile}
                        disabled={loading}
                        className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center space-x-2"
                      >
                        <Save className="h-4 w-4" />
                        <span>{loading ? 'Saving...' : 'Save Changes'}</span>
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => navigate('/employee-management')}
                        className="bg-gray-500 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center space-x-2"
                        title="Back to Employee Management"
                      >
                        <ArrowLeft className="h-4 w-4" />
                        <span>Back</span>
                      </button>
                      <button
                        onClick={() => setIsEditing(true)}
                        className="text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center space-x-2"
                        style={{ 
                          backgroundColor: '#29add3'
                        }}
                        onMouseEnter={(e) => e.target.style.backgroundColor = '#2196c7'}
                        onMouseLeave={(e) => e.target.style.backgroundColor = '#29add3'}
                      >
                        <Edit2 className="h-4 w-4" />
                        <span>Edit Profile</span>
                      </button>
                    </>
                  )}
                </div>
              )}
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

            <div className="space-y-6">
              
              {/* Work Statistics Overview */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-6 flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5 text-blue-500" />
                  <span>Work Statistics (Last 30 Days)</span>
                </h3>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg text-center">
                    <div className="flex items-center justify-center mb-2">
                      <Calendar className="h-5 w-5 text-blue-500" />
                    </div>
                    <p className="text-2xl font-bold text-blue-600">{workStats.totalDays}</p>
                    <p className="text-sm text-blue-800">Days Worked</p>
                  </div>
                  
                  <div className="bg-green-50 p-4 rounded-lg text-center">
                    <div className="flex items-center justify-center mb-2">
                      <Clock className="h-5 w-5 text-green-500" />
                    </div>
                    <p className="text-2xl font-bold text-green-600">{workStats.totalHours.toFixed(1)}</p>
                    <p className="text-sm text-green-800">Total Hours</p>
                  </div>
                  
                  <div className="bg-purple-50 p-4 rounded-lg text-center">
                    <div className="flex items-center justify-center mb-2">
                      <Activity className="h-5 w-5 text-purple-500" />
                    </div>
                    <p className="text-2xl font-bold text-purple-600">{workStats.averageDailyHours.toFixed(1)}</p>
                    <p className="text-sm text-purple-800">Avg Hours/Day</p>
                  </div>
                  
                  <div className="bg-orange-50 p-4 rounded-lg text-center">
                    <div className="flex items-center justify-center mb-2">
                      <DollarSign className="h-5 w-5 text-orange-500" />
                    </div>
                    <p className="text-2xl font-bold text-orange-600">{formatCurrency(workStats.totalPay)}</p>
                    <p className="text-sm text-orange-800">Total Earnings</p>
                  </div>
                </div>
                
                {/* Detailed breakdown */}
                <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">Hours Breakdown</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Regular Hours:</span>
                        <span className="font-medium">{workStats.regularHours.toFixed(1)}h</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">After Hours:</span>
                        <span className="font-medium">{workStats.afterHours.toFixed(1)}h</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">Recent Performance</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">This Week:</span>
                        <span className="font-medium">{workStats.thisWeekHours.toFixed(1)}h</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">This Month:</span>
                        <span className="font-medium">{workStats.thisMonthHours.toFixed(1)}h</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">Pay Information</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Regular Rate:</span>
                        <span className="font-medium">{formatCurrency(employeeConfig?.hourly_rate || 0)}/hr</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">After Hours Rate:</span>
                        <span className="font-medium">{formatCurrency(employeeConfig?.after_hours_rate || employeeConfig?.hourly_rate || 0)}/hr</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Employee Details */}
                <div className="lg:col-span-2">
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <h3 className="text-lg font-medium text-gray-900 mb-6">Employee Information</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Full Name
                        </label>
                        {isEditing ? (
                          <input
                            type="text"
                            value={formData.full_name}
                            onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:border-transparent"
                            style={{ "--tw-ring-color": "#29add3" }}
                          />
                        ) : (
                          <div className="flex items-center space-x-2">
                            <User className="h-4 w-4 text-gray-500" />
                            <span className="text-gray-900">{employee.full_name}</span>
                          </div>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Email
                        </label>
                        {isEditing ? (
                          <input
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:border-transparent"
                            style={{ "--tw-ring-color": "#29add3" }}
                          />
                        ) : (
                          <div className="flex items-center space-x-2">
                            <Mail className="h-4 w-4 text-gray-500" />
                            <span className="text-gray-900">{employee.email}</span>
                          </div>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Role
                        </label>
                        {isEditing ? (
                          <select
                            value={formData.role}
                            onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:border-transparent"
                            style={{ "--tw-ring-color": "#29add3" }}
                          >
                            {roles.map(role => (
                              <option key={role.value} value={role.value}>
                                {role.label}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <div className="flex items-center space-x-2">
                            <Briefcase className="h-4 w-4 text-gray-500" />
                            <span className="text-gray-900 capitalize">{employee.role}</span>
                          </div>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Status
                        </label>
                        {isEditing ? (
                          <select
                            value={formData.is_active.toString()}
                            onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.value === 'true' }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:border-transparent"
                            style={{ "--tw-ring-color": "#29add3" }}
                          >
                            <option value="true">Active</option>
                            <option value="false">Inactive</option>
                          </select>
                        ) : (
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            employeeConfig.is_active 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {employeeConfig.is_active ? 'Active' : 'Inactive'}
                          </span>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Hourly Rate
                        </label>
                        {isEditing ? (
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={formData.hourly_rate}
                            onChange={(e) => setFormData(prev => ({ ...prev, hourly_rate: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:border-transparent"
                            style={{ "--tw-ring-color": "#29add3" }}
                          />
                        ) : (
                          <div className="flex items-center space-x-2">
                            <DollarSign className="h-4 w-4 text-gray-500" />
                            <span className="text-gray-900">{formatCurrency(employeeConfig.hourly_rate)}/hour</span>
                          </div>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          After Hours Rate
                        </label>
                        {isEditing ? (
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={formData.after_hours_rate}
                            onChange={(e) => setFormData(prev => ({ ...prev, after_hours_rate: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:border-transparent"
                            style={{ "--tw-ring-color": "#29add3" }}
                            placeholder="Leave blank to use regular rate"
                          />
                        ) : (
                          <div className="flex items-center space-x-2">
                            <Clock className="h-4 w-4 text-gray-500" />
                            <span className="text-gray-900">
                              {employeeConfig.after_hours_rate 
                                ? `${formatCurrency(employeeConfig.after_hours_rate)}/hour`
                                : `${formatCurrency(employeeConfig.hourly_rate)}/hour (same as regular)`
                              }
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="mt-6 pt-6 border-t border-gray-200">
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Calendar className="h-4 w-4" />
                        <span>Joined: {formatDate(employee.created_at)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recent Activity */}
                <div>
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h3>
                    
                    {recentEntries.length > 0 ? (
                      <div className="space-y-3">
                        {recentEntries.slice(0, 5).map((entry, index) => (
                          <div key={entry.id || index} className="bg-white p-3 rounded border">
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="text-sm font-medium text-gray-900">
                                  {formatDate(entry.clock_in_time)}
                                </p>
                                <p className="text-xs text-gray-600">
                                  {formatTime(entry.clock_in_time)} - {
                                    entry.clock_out_time ? formatTime(entry.clock_out_time) : 'Active'
                                  }
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="text-sm font-medium text-gray-900">
                                  {entry.total_hours ? formatDuration(entry.total_hours) : '0h 0m'}
                                </p>
                                {entry.after_hours_hours > 0 && (
                                  <p className="text-xs text-orange-600">
                                    +{formatDuration(entry.after_hours_hours)} AH
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-6">
                        <Clock className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-600 text-sm">No recent activity</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeProfile;