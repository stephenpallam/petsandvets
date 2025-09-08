import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Calendar, Clock, DollarSign, Users, Edit2, Save, X, AlertCircle, CheckCircle, FileText, Download, Filter } from 'lucide-react';
import axios from 'axios';

const TimesheetManagement = () => {
  const { user, token, canAccessManager, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState('reports');
  const [timesheetReports, setTimesheetReports] = useState(null);
  const [employeeConfigs, setEmployeeConfigs] = useState([]);
  const [selectedPeriod, setSelectedPeriod] = useState('current_week');
  const [customDateRange, setCustomDateRange] = useState({
    start_date: '',
    end_date: ''
  });
  const [selectedEmployee, setSelectedEmployee] = useState('all');
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [authError, setAuthError] = useState(null);
  const [pageLoading, setPageLoading] = useState(true);
  
  // Hour Adjustments state
  const [timeEntries, setTimeEntries] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [adjustmentPeriod, setAdjustmentPeriod] = useState('current_week');
  const [adjustmentDateRange, setAdjustmentDateRange] = useState({
    start_date: '',
    end_date: ''
  });
  const [selectedEmployeeForAdjustment, setSelectedEmployeeForAdjustment] = useState('all');
  const [editingEntry, setEditingEntry] = useState(null);
  const [adjustmentForm, setAdjustmentForm] = useState({
    new_hours: '',
    reason: ''
  });

  // Manual Clock In/Out state
  const [showManualEntryModal, setShowManualEntryModal] = useState(false);
  const [manualEntryForm, setManualEntryForm] = useState({
    employee_id: '',
    date: '',
    clock_in_time: '',
    clock_out_time: '',
    reason: ''
  });

  const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || import.meta.env.REACT_APP_BACKEND_URL || window.location.origin;
  const themeColor = '#29add3'; // Website theme blue color

  const tabs = [
    { 
      id: 'reports', 
      label: 'Employee Hours', 
      icon: FileText,
      color: themeColor
    },
    { 
      id: 'employees', 
      label: 'Employee Details', 
      icon: Users,
      color: themeColor
    },
    { 
      id: 'adjustments', 
      label: 'Hour Adjustments', 
      icon: Edit2,
      color: themeColor
    }
  ];

  const periodOptions = [
    { value: 'current_week', label: 'Current Week' },
    { value: 'last_week', label: 'Last Week' },
    { value: 'current_month', label: 'Current Month' },
    { value: 'last_month', label: 'Last Month' },
    { value: 'custom', label: 'Custom Range' }
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
      setAuthError('Please log in with manager or admin privileges to access timesheet management.');
      setPageLoading(false);
    }
  }, [user, token, authLoading, canAccessManager]);

  // Fetch data when page loads
  useEffect(() => {
    if (!pageLoading && user && canAccessManager()) {
      fetchEmployeeConfigs();
      fetchEmployees();
      if (activeTab === 'reports') {
        fetchTimesheetReports();
      } else if (activeTab === 'adjustments') {
        fetchTimeEntries();
      }
    }
  }, [pageLoading, user, canAccessManager, activeTab, selectedPeriod, customDateRange, selectedEmployee, adjustmentPeriod, adjustmentDateRange, selectedEmployeeForAdjustment]);

  const calculateDateRange = (period) => {
    const now = new Date();
    let startDate, endDate;

    switch (period) {
      case 'current_week':
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay()); // Sunday
        startDate = startOfWeek.toISOString().split('T')[0];
        endDate = new Date(startOfWeek.getTime() + 6 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]; // Saturday
        break;
      
      case 'last_week':
        const lastWeekStart = new Date(now);
        lastWeekStart.setDate(now.getDate() - now.getDay() - 7);
        startDate = lastWeekStart.toISOString().split('T')[0];
        endDate = new Date(lastWeekStart.getTime() + 6 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        break;
      
      case 'current_month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
        break;
      
      case 'last_month':
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString().split('T')[0];
        endDate = new Date(now.getFullYear(), now.getMonth(), 0).toISOString().split('T')[0];
        break;
      
      case 'custom':
        return customDateRange;
      
      default:
        return { start_date: '', end_date: '' };
    }

    return { start_date: startDate, end_date: endDate };
  };

  const fetchTimesheetReports = async () => {
    setLoading(true);
    try {
      const dateRange = calculateDateRange(selectedPeriod);
      if (!dateRange.start_date || !dateRange.end_date) {
        setMessage({ type: 'error', text: 'Please select a valid date range' });
        return;
      }

      const params = new URLSearchParams({
        start_date: dateRange.start_date,
        end_date: dateRange.end_date
      });

      if (selectedEmployee !== 'all') {
        params.append('user_id', selectedEmployee);
      }

      const response = await axios.get(`${API_BASE_URL}/api/timesheet/reports?${params}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      setTimesheetReports(response.data);
      setMessage({ type: '', text: '' });
    } catch (err) {
      console.error('Error fetching timesheet reports:', err);
      setMessage({ 
        type: 'error', 
        text: err.response?.data?.detail || 'Failed to fetch timesheet reports' 
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployeeConfigs = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/employee-configs`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setEmployeeConfigs(response.data);
    } catch (err) {
      console.error('Error fetching employee configs:', err);
    }
  };

  const fetchEmployees = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/employees`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setEmployees(response.data);
    } catch (err) {
      console.error('Error fetching employees:', err);
    }
  };

  const fetchTimeEntries = async () => {
    try {
      setLoading(true);
      
      // Calculate date range based on selected period
      const dateRange = adjustmentPeriod === 'custom' ? adjustmentDateRange : calculateDateRange(adjustmentPeriod);
      
      const params = new URLSearchParams({
        start_date: dateRange.start_date,
        end_date: dateRange.end_date
      });

      if (selectedEmployeeForAdjustment !== 'all') {
        params.append('user_id', selectedEmployeeForAdjustment);
      }

      const response = await axios.get(`${API_BASE_URL}/api/timesheet/all-entries?${params}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      setTimeEntries(response.data);
      setMessage({ type: '', text: '' });
    } catch (err) {
      console.error('Error fetching time entries:', err);
      setMessage({ 
        type: 'error', 
        text: err.response?.data?.detail || 'Failed to fetch time entries' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEditEmployee = (config) => {
    setEditingEmployee(config.user_id);
    setEditForm({
      hourly_rate: config.hourly_rate,
      overtime_rate: config.overtime_rate || '',
      is_active: config.is_active
    });
  };

  const handleSaveEmployee = async (userId) => {
    setLoading(true);
    try {
      const updateData = {
        hourly_rate: parseFloat(editForm.hourly_rate),
        is_active: editForm.is_active
      };

      if (editForm.overtime_rate) {
        updateData.overtime_rate = parseFloat(editForm.overtime_rate);
      }

      await axios.put(`${API_BASE_URL}/api/employee-configs/${userId}`, updateData, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      setMessage({ type: 'success', text: 'Employee configuration updated successfully!' });
      setEditingEmployee(null);
      fetchEmployeeConfigs();
    } catch (err) {
      setMessage({ 
        type: 'error', 
        text: err.response?.data?.detail || 'Failed to update employee configuration' 
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
    }).format(amount);
  };

  const formatTime = (timeString) => {
    if (!timeString) return '';
    const date = new Date(timeString);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const calculateHours = (clockIn, clockOut) => {
    if (!clockIn || !clockOut) return 0;
    const start = new Date(clockIn);
    const end = new Date(clockOut);
    return Math.round(((end - start) / (1000 * 60 * 60)) * 100) / 100;
  };

  const getEmployeeName = (userId) => {
    const employee = employees.find(emp => emp.id === userId);
    return employee ? employee.full_name : 'Unknown Employee';
  };

  const handleEditHours = (entry) => {
    const currentHours = calculateHours(entry.clock_in_time, entry.clock_out_time);
    setEditingEntry(entry);
    setAdjustmentForm({
      new_hours: currentHours.toString(),
      reason: ''
    });
  };

  const handleSaveAdjustment = async () => {
    if (!editingEntry || !adjustmentForm.new_hours || !adjustmentForm.reason) {
      setMessage({ type: 'error', text: 'Please fill in all fields' });
      return;
    }

    try {
      setLoading(true);
      const originalHours = calculateHours(editingEntry.clock_in_time, editingEntry.clock_out_time);
      const newHours = parseFloat(adjustmentForm.new_hours);

      await axios.post(`${API_BASE_URL}/api/timesheet/adjustments`, {
        time_entry_id: editingEntry.id,
        user_id: editingEntry.user_id,
        adjustment_type: 'manual_hours',
        original_value: originalHours.toString(),
        new_value: newHours.toString(),
        reason: adjustmentForm.reason
      }, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      setMessage({ type: 'success', text: 'Hours adjusted successfully!' });
      setEditingEntry(null);
      setAdjustmentForm({ new_hours: '', reason: '' });
      fetchTimeEntries();
    } catch (err) {
      setMessage({ 
        type: 'error', 
        text: err.response?.data?.detail || 'Failed to save adjustment' 
      });
    } finally {
      setLoading(false);
      setTimeout(() => setMessage({ type: '', text: '' }), 5000);
    }
  };

  const cancelAdjustment = () => {
    setEditingEntry(null);
    setAdjustmentForm({ new_hours: '', reason: '' });
  };

  const formatHours = (hours) => {
    return hours.toFixed(2);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  // Handle manual clock in/out entry
  const handleManualEntry = async () => {
    if (!manualEntryForm.employee_id || !manualEntryForm.date || !manualEntryForm.clock_in_time || !manualEntryForm.reason) {
      setMessage({ type: 'error', text: 'Please fill in all required fields' });
      return;
    }

    try {
      setLoading(true);
      
      // Create the time entry data
      const entryData = {
        user_id: manualEntryForm.employee_id,
        date: manualEntryForm.date,
        clock_in_time: `${manualEntryForm.date}T${manualEntryForm.clock_in_time}:00.000Z`,
        clock_out_time: manualEntryForm.clock_out_time ? `${manualEntryForm.date}T${manualEntryForm.clock_out_time}:00.000Z` : null,
        reason: manualEntryForm.reason,
        is_manual_entry: true
      };

      await axios.post(`${API_BASE_URL}/api/timesheet/manual-entry`, entryData, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      setMessage({ type: 'success', text: 'Manual time entry added successfully!' });
      setShowManualEntryModal(false);
      setManualEntryForm({
        employee_id: '',
        date: '',
        clock_in_time: '',
        clock_out_time: '',
        reason: ''
      });
      fetchTimeEntries();
    } catch (err) {
      setMessage({ 
        type: 'error', 
        text: err.response?.data?.detail || 'Failed to add manual entry' 
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderBottomColor: themeColor }}></div>
          <p className="text-gray-600">Loading timesheet management...</p>
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
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Header */}
          <div className="px-4 sm:px-6 py-4 bg-gray-50 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2 sm:mb-0">
                Timesheet Management
              </h2>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Clock className="h-4 w-4" />
                <span className="hidden sm:inline">Manager Dashboard</span>
                <span className="sm:hidden">Dashboard</span>
              </div>
            </div>
          </div>

          {/* Content Area */}
          <div className="p-4 sm:p-6">
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
                          borderBottomColor: isActive ? themeColor : 'transparent',
                          color: isActive ? themeColor : undefined,
                          backgroundColor: isActive ? '#e6f7fb' : 'transparent'
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
                
                {/* Employee Hours Tab */}
                {activeTab === 'reports' && (
                  <div className="space-y-6">
                    {/* Filters */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Time Period
                          </label>
                          <select
                            value={selectedPeriod}
                            onChange={(e) => setSelectedPeriod(e.target.value)}
                            className="w-full px-3 py-2 pr-20 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:border-gray-400 hover:border-gray-400 transition-colors"
                            style={{ 
                              '--tw-ring-color': themeColor + '50'
                            }}
                          >
                            {periodOptions.map(option => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                        </div>

                        {selectedPeriod === 'custom' && (
                          <>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Start Date
                              </label>
                              <input
                                type="date"
                                value={customDateRange.start_date}
                                onChange={(e) => setCustomDateRange(prev => ({ ...prev, start_date: e.target.value }))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-opacity-50 focus:border-transparent"
                                style={{ 
                                  focusRingColor: themeColor,
                                  '--tw-ring-color': themeColor + '50'
                                }}
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                End Date
                              </label>
                              <input
                                type="date"
                                value={customDateRange.end_date}
                                onChange={(e) => setCustomDateRange(prev => ({ ...prev, end_date: e.target.value }))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-opacity-50 focus:border-transparent"
                                style={{ 
                                  focusRingColor: themeColor,
                                  '--tw-ring-color': themeColor + '50'
                                }}
                              />
                            </div>
                          </>
                        )}

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Employee Filter
                          </label>
                          <select
                            value={selectedEmployee}
                            onChange={(e) => setSelectedEmployee(e.target.value)}
                            className="w-full px-3 py-2 pr-16 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-opacity-50 focus:border-transparent"
                            style={{ 
                              focusRingColor: themeColor,
                              '--tw-ring-color': themeColor + '50'
                            }}
                          >
                            <option value="all">All Employees</option>
                            {employeeConfigs.map(config => (
                              <option key={config.user_id} value={config.user_id}>
                                Employee {config.user_id.substring(0, 8)}...
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Reports Display */}
                    {timesheetReports && (
                      <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="bg-blue-50 p-4 rounded-lg">
                            <div className="flex items-center space-x-2 mb-2">
                              <Users className="h-5 w-5 text-blue-500" />
                              <span className="font-medium">Total Employees</span>
                            </div>
                            <p className="text-2xl font-bold" style={{ color: themeColor }}>
                              {timesheetReports.total_employees}
                            </p>
                          </div>

                          <div className="bg-green-50 p-4 rounded-lg">
                            <div className="flex items-center space-x-2 mb-2">
                              <Clock className="h-5 w-5 text-green-500" />
                              <span className="font-medium">Total Hours</span>
                            </div>
                            <p className="text-2xl font-bold text-green-600">
                              {formatHours(timesheetReports.total_hours)}
                            </p>
                          </div>

                          <div className="bg-purple-50 p-4 rounded-lg">
                            <div className="flex items-center space-x-2 mb-2">
                              <DollarSign className="h-5 w-5 text-purple-500" />
                              <span className="font-medium">Total Pay</span>
                            </div>
                            <p className="text-2xl font-bold text-purple-600">
                              {formatCurrency(timesheetReports.total_pay)}
                            </p>
                          </div>
                        </div>

                        {/* Individual Employee Reports */}
                        <div className="space-y-4">
                          <h4 className="font-medium text-gray-900">Employee Details</h4>
                          {timesheetReports.reports.map((report, index) => (
                            <div key={report.user_id} className="bg-white border border-gray-200 rounded-lg p-4">
                              <div className="flex justify-between items-start mb-4">
                                <div>
                                  <h5 className="font-medium text-gray-900">{report.user_name}</h5>
                                  <p className="text-sm text-gray-600">
                                    {report.user_role?.charAt(0).toUpperCase() + report.user_role?.slice(1)}
                                  </p>
                                </div>
                                <div className="text-right">
                                  <p className="font-medium text-gray-900">{formatCurrency(report.total_pay)}</p>
                                  <p className="text-sm text-gray-600">{formatHours(report.total_hours)} hours</p>
                                </div>
                              </div>

                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                <div>
                                  <span className="text-gray-600">Regular Hours:</span>
                                  <p className="font-medium">{formatHours(report.regular_hours)}</p>
                                </div>
                                <div>
                                  <span className="text-gray-600">After Hours:</span>
                                  <p className="font-medium">{formatHours(report.after_hours_hours)}</p>
                                </div>
                                <div>
                                  <span className="text-gray-600">Days Worked:</span>
                                  <p className="font-medium">{report.days_worked}</p>
                                </div>
                                <div>
                                  <span className="text-gray-600">Hourly Rate:</span>
                                  <p className="font-medium">{formatCurrency(report.hourly_rate || 0)}</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Employee Details Tab */}
                {activeTab === 'employees' && (
                  <div className="space-y-6">
                    <div className="flex justify-between items-center">
                      <h4 className="font-medium text-gray-900">Employee Configuration</h4>
                      <button
                        onClick={fetchEmployeeConfigs}
                        className="text-white font-medium py-2 px-4 rounded-lg transition-colors"
                      style={{ 
                        backgroundColor: themeColor,
                        '--tw-bg-opacity': '1'
                      }}
                      onMouseEnter={(e) => e.target.style.backgroundColor = '#228ba8'}
                      onMouseLeave={(e) => e.target.style.backgroundColor = themeColor}
                      >
                        Refresh
                      </button>
                    </div>

                    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Employee Name
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Hourly Rate
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              After Hours Rate
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Status
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {employeeConfigs.map((config) => (
                            <tr key={config.user_id}>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                {getEmployeeName(config.user_id)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {editingEmployee === config.user_id ? (
                                  <input
                                    type="number"
                                    step="0.01"
                                    value={editForm.hourly_rate}
                                    onChange={(e) => setEditForm(prev => ({ ...prev, hourly_rate: e.target.value }))}
                                    className="w-20 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2"
                                    style={{ 
                                      '--tw-ring-color': themeColor + '50',
                                      focusRingColor: themeColor
                                    }}
                                  />
                                ) : (
                                  formatCurrency(config.hourly_rate)
                                )}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {editingEmployee === config.user_id ? (
                                  <input
                                    type="number"
                                    step="0.01"
                                    value={editForm.after_hours_rate}
                                    onChange={(e) => setEditForm(prev => ({ ...prev, after_hours_rate: e.target.value }))}
                                    placeholder="Auto calculated"
                                    className="w-20 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2"
                                    style={{ 
                                      '--tw-ring-color': themeColor + '50',
                                      focusRingColor: themeColor
                                    }}
                                  />
                                ) : (
                                  config.after_hours_rate ? formatCurrency(config.after_hours_rate) : 'Same as regular'
                                )}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                {editingEmployee === config.user_id ? (
                                  <select
                                    value={editForm.is_active}
                                    onChange={(e) => setEditForm(prev => ({ ...prev, is_active: e.target.value === 'true' }))}
                                    className="px-2 py-1 pr-6 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  >
                                    <option value="true">Active</option>
                                    <option value="false">Inactive</option>
                                  </select>
                                ) : (
                                  <span className="text-sm text-gray-600">
                                    {config.is_active ? 'Active' : 'Inactive'}
                                  </span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}

                {/* Hour Adjustments Tab */}
                {activeTab === 'adjustments' && (
                  <div className="space-y-6">
                    {/* Controls */}
                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Period Selection */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Period</label>
                          <select
                            value={adjustmentPeriod}
                            onChange={(e) => setAdjustmentPeriod(e.target.value)}
                            className="w-full px-3 py-2 pr-16 border border-gray-300 rounded-md focus:outline-none focus:ring-2"
                            style={{ 
                              '--tw-ring-color': themeColor + '50',
                              focusRingColor: themeColor
                            }}
                          >
                            {periodOptions.map(option => (
                              <option key={option.value} value={option.value}>{option.label}</option>
                            ))}
                          </select>
                        </div>

                        {/* Employee Selection */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Employee</label>
                          <select
                            value={selectedEmployeeForAdjustment}
                            onChange={(e) => setSelectedEmployeeForAdjustment(e.target.value)}
                            className="w-full px-3 py-2 pr-16 border border-gray-300 rounded-md focus:outline-none focus:ring-2"
                            style={{ 
                              '--tw-ring-color': themeColor + '50',
                              focusRingColor: themeColor
                            }}
                          >
                            <option value="all">All Employees</option>
                            {employees.map(employee => (
                              <option key={employee.id} value={employee.id}>{employee.full_name}</option>
                            ))}
                          </select>
                        </div>

                        {/* Custom Date Range */}
                        {adjustmentPeriod === 'custom' && (
                          <div className="md:col-span-3">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                                <input
                                  type="date"
                                  value={adjustmentDateRange.start_date}
                                  onChange={(e) => setAdjustmentDateRange(prev => ({...prev, start_date: e.target.value}))}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2"
                                  style={{ 
                                    '--tw-ring-color': themeColor + '50',
                                    focusRingColor: themeColor
                                  }}
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                                <input
                                  type="date"
                                  value={adjustmentDateRange.end_date}
                                  onChange={(e) => setAdjustmentDateRange(prev => ({...prev, end_date: e.target.value}))}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2"
                                  style={{ 
                                    '--tw-ring-color': themeColor + '50',
                                    focusRingColor: themeColor
                                  }}
                                />
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Time Entries Table */}
                    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-lg font-medium text-gray-900 flex items-center">
                              <Edit2 className="h-5 w-5 mr-2 text-yellow-600" />
                              Hour Adjustments
                            </h3>
                            <p className="text-sm text-gray-600 mt-1">
                              Review and adjust employee hours for the selected period
                            </p>
                          </div>
                          <button
                            onClick={() => setShowManualEntryModal(true)}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white focus:outline-none focus:ring-2 focus:ring-offset-2"
                            style={{ 
                              backgroundColor: themeColor,
                              focusRingColor: themeColor
                            }}
                            onMouseEnter={(e) => e.target.style.backgroundColor = '#228ba8'}
                            onMouseLeave={(e) => e.target.style.backgroundColor = themeColor}
                          >
                            <Clock className="h-4 w-4 mr-2" />
                            Add Manual Entry
                          </button>
                        </div>
                      </div>

                      {loading ? (
                        <div className="flex items-center justify-center py-12">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderBottomColor: themeColor }}></div>
                          <span className="ml-2 text-gray-600">Loading time entries...</span>
                        </div>
                      ) : timeEntries.length === 0 ? (
                        <div className="text-center py-12">
                          <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                          <h4 className="text-lg font-medium text-gray-900 mb-2">No Time Entries Found</h4>
                          <p className="text-gray-600">
                            No time entries found for the selected period and employee filter.
                          </p>
                        </div>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                              <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Employee
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Date
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Clock In
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Clock Out
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Hours Worked
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Actions
                                </th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {timeEntries.map((entry) => {
                                const currentHours = calculateHours(entry.clock_in_time, entry.clock_out_time);
                                const isEditing = editingEntry?.id === entry.id;
                                
                                return (
                                  <tr key={entry.id} className={isEditing ? 'bg-yellow-50' : 'hover:bg-gray-50'}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                      <div className="font-medium text-gray-900">
                                        {getEmployeeName(entry.user_id)}
                                      </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                                      {formatDate(entry.clock_in_time)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                                      {formatTime(entry.clock_in_time)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                                      {entry.clock_out_time ? formatTime(entry.clock_out_time) : 'Not clocked out'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                      {isEditing ? (
                                        <input
                                          type="number"
                                          value={adjustmentForm.new_hours}
                                          onChange={(e) => setAdjustmentForm(prev => ({...prev, new_hours: e.target.value}))}
                                          step="0.25"
                                          className="w-20 px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2"
                                          style={{ 
                                            '--tw-ring-color': themeColor + '50',
                                            focusRingColor: themeColor
                                          }}
                                          placeholder="Hours"
                                        />
                                      ) : (
                                        <span className="font-medium text-gray-900">
                                          {currentHours.toFixed(2)} hrs
                                        </span>
                                      )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                      <span className="text-sm text-gray-600">
                                        {entry.status?.charAt(0).toUpperCase() + entry.status?.slice(1)}
                                      </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                      {isEditing ? (
                                        <div className="flex space-x-2">
                                          <button
                                            onClick={handleSaveAdjustment}
                                            disabled={loading}
                                            className="text-green-600 hover:text-green-900 disabled:opacity-50"
                                          >
                                            <Save className="h-4 w-4" />
                                          </button>
                                          <button
                                            onClick={cancelAdjustment}
                                            className="text-gray-600 hover:text-gray-900"
                                          >
                                            <X className="h-4 w-4" />
                                          </button>
                                        </div>
                                      ) : (
                                        <button
                                          onClick={() => handleEditHours(entry)}
                                          disabled={!entry.clock_out_time}
                                          className="hover:opacity-75 disabled:opacity-50 disabled:cursor-not-allowed"
                                          style={{ color: themeColor }}
                                          title={!entry.clock_out_time ? 'Cannot adjust hours for active time entries' : 'Adjust hours'}
                                        >
                                          <Edit2 className="h-4 w-4" />
                                        </button>
                                      )}
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>

                    {/* Adjustment Reason Modal */}
                    {editingEntry && (
                      <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                        <div className="relative top-20 mx-auto p-5 border w-full max-w-md bg-white rounded-lg shadow-lg">
                          <div className="mb-4">
                            <h3 className="text-lg font-medium text-gray-900">Adjust Hours</h3>
                            <p className="text-sm text-gray-600 mt-1">
                              {getEmployeeName(editingEntry.user_id)} - {formatDate(editingEntry.clock_in_time)}
                            </p>
                          </div>
                          
                          <div className="space-y-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Original Hours: {calculateHours(editingEntry.clock_in_time, editingEntry.clock_out_time).toFixed(2)}
                              </label>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                New Hours
                              </label>
                              <input
                                type="number"
                                value={adjustmentForm.new_hours}
                                onChange={(e) => setAdjustmentForm(prev => ({...prev, new_hours: e.target.value}))}
                                step="0.25"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2"
                                style={{ 
                                  '--tw-ring-color': themeColor + '50',
                                  focusRingColor: themeColor
                                }}
                                placeholder="Enter new hours"
                              />
                            </div>
                            
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Reason for Adjustment *
                              </label>
                              <textarea
                                value={adjustmentForm.reason}
                                onChange={(e) => setAdjustmentForm(prev => ({...prev, reason: e.target.value}))}
                                rows="3"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2"
                                style={{ 
                                  '--tw-ring-color': themeColor + '50',
                                  focusRingColor: themeColor
                                }}
                                placeholder="Explain why this adjustment is needed..."
                              />
                            </div>
                          </div>
                          
                          <div className="flex justify-end space-x-3 mt-6">
                            <button
                              onClick={cancelAdjustment}
                              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={handleSaveAdjustment}
                              disabled={loading || !adjustmentForm.new_hours || !adjustmentForm.reason}
                              className="px-4 py-2 text-sm font-medium text-white rounded-md"
                              style={{ 
                                backgroundColor: loading || !adjustmentForm.new_hours || !adjustmentForm.reason ? '#9ca3af' : themeColor,
                                cursor: loading || !adjustmentForm.new_hours || !adjustmentForm.reason ? 'not-allowed' : 'pointer'
                              }}
                              onMouseEnter={(e) => {
                                if (!loading && adjustmentForm.new_hours && adjustmentForm.reason) {
                                  e.target.style.backgroundColor = '#228ba8';
                                }
                              }}
                              onMouseLeave={(e) => {
                                if (!loading && adjustmentForm.new_hours && adjustmentForm.reason) {
                                  e.target.style.backgroundColor = themeColor;
                                }
                              }}
                            >
                              {loading ? 'Saving...' : 'Save Adjustment'}
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Manual Clock Entry Modal */}
                    {showManualEntryModal && (
                      <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                        <div className="relative top-20 mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white">
                          <div className="mt-3">
                            <div className="flex items-center justify-between mb-4">
                              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                                <Clock className="h-5 w-5 mr-2" style={{ color: themeColor }} />
                                Add Manual Time Entry
                              </h3>
                              <button
                                onClick={() => setShowManualEntryModal(false)}
                                className="text-gray-400 hover:text-gray-600"
                              >
                                <X className="h-5 w-5" />
                              </button>
                            </div>
                            
                            <div className="space-y-4">
                              {/* Employee Selection */}
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Employee *
                                </label>
                                <select
                                  value={manualEntryForm.employee_id}
                                  onChange={(e) => setManualEntryForm(prev => ({...prev, employee_id: e.target.value}))}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2"
                                  style={{ 
                                    '--tw-ring-color': themeColor + '50',
                                    focusRingColor: themeColor
                                  }}
                                >
                                  <option value="">Select Employee</option>
                                  {employees.map(employee => (
                                    <option key={employee.id} value={employee.id}>{employee.full_name}</option>
                                  ))}
                                </select>
                              </div>

                              {/* Date */}
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Date *
                                </label>
                                <input
                                  type="date"
                                  value={manualEntryForm.date}
                                  onChange={(e) => setManualEntryForm(prev => ({...prev, date: e.target.value}))}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2"
                                  style={{ 
                                    '--tw-ring-color': themeColor + '50',
                                    focusRingColor: themeColor
                                  }}
                                />
                              </div>

                              {/* Clock In Time */}
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Clock In Time *
                                </label>
                                <input
                                  type="time"
                                  value={manualEntryForm.clock_in_time}
                                  onChange={(e) => setManualEntryForm(prev => ({...prev, clock_in_time: e.target.value}))}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2"
                                  style={{ 
                                    '--tw-ring-color': themeColor + '50',
                                    focusRingColor: themeColor
                                  }}
                                />
                              </div>

                              {/* Clock Out Time */}
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Clock Out Time (Optional)
                                </label>
                                <input
                                  type="time"
                                  value={manualEntryForm.clock_out_time}
                                  onChange={(e) => setManualEntryForm(prev => ({...prev, clock_out_time: e.target.value}))}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2"
                                  style={{ 
                                    '--tw-ring-color': themeColor + '50',
                                    focusRingColor: themeColor
                                  }}
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                  Leave empty if employee is still clocked in
                                </p>
                              </div>

                              {/* Reason */}
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Reason *
                                </label>
                                <textarea
                                  value={manualEntryForm.reason}
                                  onChange={(e) => setManualEntryForm(prev => ({...prev, reason: e.target.value}))}
                                  placeholder="Reason for manual entry (e.g., forgot to clock in, system issue, etc.)"
                                  rows="3"
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2"
                                  style={{ 
                                    '--tw-ring-color': themeColor + '50',
                                    focusRingColor: themeColor
                                  }}
                                />
                              </div>
                            </div>

                            <div className="flex justify-end space-x-3 mt-6">
                              <button
                                onClick={() => setShowManualEntryModal(false)}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={handleManualEntry}
                                disabled={loading || !manualEntryForm.employee_id || !manualEntryForm.date || !manualEntryForm.clock_in_time || !manualEntryForm.reason}
                                className="px-4 py-2 text-sm font-medium text-white rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2"
                                style={{ 
                                  backgroundColor: loading || !manualEntryForm.employee_id || !manualEntryForm.date || !manualEntryForm.clock_in_time || !manualEntryForm.reason ? '#9ca3af' : themeColor,
                                  cursor: loading || !manualEntryForm.employee_id || !manualEntryForm.date || !manualEntryForm.clock_in_time || !manualEntryForm.reason ? 'not-allowed' : 'pointer',
                                  focusRingColor: themeColor
                                }}
                                onMouseEnter={(e) => {
                                  if (!loading && manualEntryForm.employee_id && manualEntryForm.date && manualEntryForm.clock_in_time && manualEntryForm.reason) {
                                    e.target.style.backgroundColor = '#228ba8';
                                  }
                                }}
                                onMouseLeave={(e) => {
                                  if (!loading && manualEntryForm.employee_id && manualEntryForm.date && manualEntryForm.clock_in_time && manualEntryForm.reason) {
                                    e.target.style.backgroundColor = themeColor;
                                  }
                                }}
                              >
                                {loading ? 'Adding...' : 'Add Entry'}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
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

export default TimesheetManagement;