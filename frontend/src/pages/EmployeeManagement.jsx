import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Users, Plus, Edit2, Trash2, Save, X, AlertCircle, CheckCircle, DollarSign, Clock, User, Mail, Briefcase, AlertTriangle, Eye } from 'lucide-react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';

// Custom Modal Component
const ConfirmationModal = ({ isOpen, onClose, onConfirm, type, employeeName, loading, deleteInfo }) => {
  const [confirmationText, setConfirmationText] = useState('');
  
  if (!isOpen) return null;

  const isDeactivate = type === 'deactivate';
  const isDelete = type === 'delete';

  const modalConfig = {
    deactivate: {
      title: 'Deactivate Employee',
      icon: Clock,
      iconColor: '#f59e0b',
      iconBg: '#fef3c7',
      confirmButtonColor: '#f59e0b',
      confirmButtonHover: '#d97706',
      message: `Are you sure you want to deactivate ${employeeName}?`,
      description: 'This will prevent them from clocking in/out but will preserve all their data and timesheet history.',
      requiresTyping: false,
      confirmText: 'Deactivate Employee'
    },
    delete: {
      title: 'Permanently Delete Employee',
      icon: AlertTriangle,
      iconColor: '#dc2626',
      iconBg: '#fee2e2',
      confirmButtonColor: '#dc2626',
      confirmButtonHover: '#b91c1c',
      message: `⚠️ PERMANENT DELETE WARNING ⚠️`,
      description: `You are about to permanently delete ${employeeName}. This action:\n• Cannot be undone\n• Will remove all employee data`,
      requiresTyping: true,
      confirmText: 'Permanently Delete',
      typingRequired: 'DELETE'
    }
  };

  const config = modalConfig[type];
  const Icon = config.icon;
  const canConfirm = !config.requiresTyping || confirmationText === config.typingRequired;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div 
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={onClose}
        ></div>

        {/* Modal */}
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          {/* Sticky Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">
                {config.title}
              </h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="px-6 py-4">
            <div className="flex items-start space-x-4">
              {/* Icon */}
              <div 
                className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center"
                style={{ backgroundColor: config.iconBg }}
              >
                <Icon className="h-5 w-5" style={{ color: config.iconColor }} />
              </div>

              {/* Content */}
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900 mb-2">
                  {config.message}
                </p>
                <p className="text-sm text-gray-600 whitespace-pre-line mb-4">
                  {config.description}
                </p>

                {/* Timesheet Data Warning for Delete */}
                {isDelete && deleteInfo && (
                  <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center mb-2">
                      <AlertTriangle className="h-4 w-4 text-red-600 mr-2" />
                      <span className="text-sm font-medium text-red-800">
                        Timesheet Data Warning
                      </span>
                    </div>
                    {deleteInfo.hasTimesheetData ? (
                      <div className="text-sm text-red-700">
                        <p className="mb-2">This employee has timesheet data that will be permanently deleted:</p>
                        <ul className="list-disc list-inside space-y-1 ml-4">
                          {deleteInfo.timeEntriesCount > 0 && (
                            <li>{deleteInfo.timeEntriesCount} time entries (clock in/out records)</li>
                          )}
                          {deleteInfo.adjustmentsCount > 0 && (
                            <li>{deleteInfo.adjustmentsCount} hour adjustments</li>
                          )}
                        </ul>
                        <p className="mt-2 font-medium">
                          ⚠️ All timesheet data will be permanently deleted and cannot be recovered!
                        </p>
                      </div>
                    ) : (
                      <p className="text-sm text-red-700">
                        No timesheet data found for this employee. Safe to delete.
                      </p>
                    )}
                  </div>
                )}

                {/* Typing confirmation for delete */}
                {config.requiresTyping && (
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      To confirm, type "{config.typingRequired}" below:
                    </label>
                    <input
                      type="text"
                      value={confirmationText}
                      onChange={(e) => setConfirmationText(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:border-transparent"
                      style={{ "--tw-ring-color": "#29add3" }}
                      placeholder={`Type ${config.typingRequired} to confirm`}
                      autoFocus
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sticky Footer */}
          <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4">
            <div className="flex justify-end space-x-3">
              <button
                onClick={onClose}
                disabled={loading}
                className="bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={onConfirm}
                disabled={loading || !canConfirm}
                className="text-white font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50 flex items-center space-x-2"
                style={{ 
                  backgroundColor: loading || !canConfirm ? '#94a3b8' : config.confirmButtonColor
                }}
                onMouseEnter={(e) => {
                  if (!loading && canConfirm) {
                    e.target.style.backgroundColor = config.confirmButtonHover;
                  }
                }}
                onMouseLeave={(e) => {
                  if (!loading && canConfirm) {
                    e.target.style.backgroundColor = config.confirmButtonColor;
                  }
                }}
              >
                {loading && (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                )}
                <span>{loading ? 'Processing...' : config.confirmText}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const EmployeeManagement = () => {
  const { user, token, canAccessManager, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [employees, setEmployees] = useState([]);
  const [employeeConfigs, setEmployeeConfigs] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [isCreateMode, setIsCreateMode] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    pin: '',
    role: 'user',
    hourly_rate: '',
    after_hours_rate: '',
    is_active: true
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [authError, setAuthError] = useState(null);
  const [pageLoading, setPageLoading] = useState(true);
  
  // Filter state
  const [showActiveOnly, setShowActiveOnly] = useState(true);
  
  // Enhanced delete state
  const [deleteInfo, setDeleteInfo] = useState({
    timeEntriesCount: 0,
    adjustmentsCount: 0,
    hasTimesheetData: false
  });
  
  // Modal states
  const [modalState, setModalState] = useState({
    isOpen: false,
    type: 'deactivate', // 'deactivate' or 'delete'
    employeeId: null,
    employeeName: ''
  });

  const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || import.meta.env.REACT_APP_BACKEND_URL || window.location.origin;

  const roles = [
    { value: 'user', label: 'User' },
    { value: 'technician', label: 'Technician' },
    { value: 'manager', label: 'Manager' }
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
      setAuthError('Please log in with manager or admin privileges to manage employees.');
      setPageLoading(false);
    }
  }, [user, token, authLoading, canAccessManager]);

  // Fetch data when page loads
  useEffect(() => {
    if (!pageLoading && user && canAccessManager()) {
      fetchEmployees();
      fetchEmployeeConfigs();
    }
  }, [pageLoading, user, canAccessManager, showActiveOnly]); // Add showActiveOnly dependency

  const fetchEmployees = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/employees`, {
        params: { active_only: showActiveOnly },
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setEmployees(response.data);
    } catch (err) {
      console.error('Error fetching employees:', err);
      setMessage({ 
        type: 'error', 
        text: err.response?.data?.detail || 'Failed to fetch employees' 
      });
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

  const getEmployeeConfig = (userId) => {
    return employeeConfigs.find(config => config.user_id === userId) || {
      hourly_rate: 0,
      after_hours_rate: null,
      is_active: true
    };
  };

  const resetForm = () => {
    setFormData({
      full_name: '',
      email: '',
      pin: '',
      role: 'user',
      hourly_rate: '',
      after_hours_rate: '',
      is_active: true
    });
    setIsCreateMode(false);
    setSelectedEmployee(null);
  };

  const handleCreateEmployee = async () => {
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      // Validate form
      if (!formData.full_name || !formData.email) {
        setMessage({ type: 'error', text: 'Please fill in all required fields' });
        return;
      }

      // Validate PIN if provided
      if (formData.pin && formData.pin.length < 6) {
        setMessage({ type: 'error', text: 'PIN must be at least 6 characters (letters, numbers, and symbols allowed)' });
        return;
      }

      if (parseFloat(formData.hourly_rate) < 0) {
        setMessage({ type: 'error', text: 'Hourly rate cannot be negative' });
        return;
      }

      // Create employee
      const employeeData = {
        full_name: formData.full_name,
        email: formData.email,
        role: formData.role
      };

      // Add PIN if provided
      if (formData.pin) {
        employeeData.pin = formData.pin;
      }

      const response = await axios.post(`${API_BASE_URL}/api/employees`, employeeData, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      // Update employee config with rates
      const configData = {
        hourly_rate: parseFloat(formData.hourly_rate) || 0,
        after_hours_rate: formData.after_hours_rate ? parseFloat(formData.after_hours_rate) : null,
        is_active: formData.is_active
      };

      await axios.put(`${API_BASE_URL}/api/employee-configs/${response.data.id}`, configData, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      // Show success message with PIN information
      const pinMessage = response.data.pin 
        ? `Employee created successfully! Login PIN: ${response.data.pin}` 
        : 'Employee created successfully!';
      
      setMessage({ type: 'success', text: pinMessage });
      resetForm();
      fetchEmployees();
      fetchEmployeeConfigs();
    } catch (err) {
      setMessage({ 
        type: 'error', 
        text: err.response?.data?.detail || 'Failed to create employee' 
      });
    } finally {
      setLoading(false);
      setTimeout(() => setMessage({ type: '', text: '' }), 8000); // Show PIN message longer
    }
  };

  const handleEditEmployee = (employee) => {
    navigate(`/edit-employee/${employee.id}`);
  };

  const handleDeleteEmployee = async (employeeId, employeeName) => {
    try {
      // Fetch time entries count for this employee
      const response = await axios.get(`${API_BASE_URL}/api/employees/${employeeId}/time-entries-count`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      setDeleteInfo({
        timeEntriesCount: response.data.time_entries_count,
        adjustmentsCount: response.data.adjustments_count,
        hasTimesheetData: response.data.has_timesheet_data
      });
    } catch (err) {
      console.error('Error fetching employee timesheet data:', err);
      // Set default values if API call fails
      setDeleteInfo({
        timeEntriesCount: 0,
        adjustmentsCount: 0,
        hasTimesheetData: false
      });
    }

    setModalState({
      isOpen: true,
      type: 'deactivate',
      employeeId,
      employeeName
    });
  };

  const handlePermanentDeleteEmployee = async (employeeId, employeeName) => {
    try {
      // Fetch time entries count for this employee for permanent delete
      const response = await axios.get(`${API_BASE_URL}/api/employees/${employeeId}/time-entries-count`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      setDeleteInfo({
        timeEntriesCount: response.data.time_entries_count,
        adjustmentsCount: response.data.adjustments_count,
        hasTimesheetData: response.data.has_timesheet_data
      });
    } catch (err) {
      console.error('Error fetching employee timesheet data:', err);
      setDeleteInfo({
        timeEntriesCount: 0,
        adjustmentsCount: 0,
        hasTimesheetData: false
      });
    }

    setModalState({
      isOpen: true,
      type: 'delete',
      employeeId,
      employeeName
    });
  };

  const closeModal = () => {
    setModalState({
      isOpen: false,
      type: 'deactivate',
      employeeId: null,
      employeeName: ''
    });
  };

  const confirmAction = async () => {
    const { type, employeeId, employeeName } = modalState;
    
    if (type === 'deactivate') {
      await performDeactivate(employeeId, employeeName);
    } else if (type === 'delete') {
      await performPermanentDelete(employeeId, employeeName);
    }
    
    closeModal();
  };

  const performDeactivate = async (employeeId, employeeName) => {
    setLoading(true);
    try {
      await axios.delete(`${API_BASE_URL}/api/employees/${employeeId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      setMessage({ type: 'success', text: 'Employee deactivated successfully!' });
      fetchEmployees();
      fetchEmployeeConfigs();
    } catch (err) {
      setMessage({ 
        type: 'error', 
        text: err.response?.data?.detail || 'Failed to deactivate employee' 
      });
    } finally {
      setLoading(false);
      setTimeout(() => setMessage({ type: '', text: '' }), 5000);
    }
  };

  const performPermanentDelete = async (employeeId, employeeName) => {
    setLoading(true);
    try {
      await axios.delete(`${API_BASE_URL}/api/employees/${employeeId}/permanent`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      setMessage({ type: 'success', text: 'Employee permanently deleted successfully!' });
      fetchEmployees();
      fetchEmployeeConfigs();
    } catch (err) {
      setMessage({ 
        type: 'error', 
        text: err.response?.data?.detail || 'Failed to permanently delete employee' 
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

  // Loading state
  if (pageLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading employee management...</p>
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
                Employee Management
              </h2>
              <div className="flex items-center space-x-3">
                {/* Filter Button */}
                <button
                  onClick={() => setShowActiveOnly(!showActiveOnly)}
                  className="text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center space-x-2"
                  style={{ 
                    backgroundColor: showActiveOnly ? '#29add3' : '#6b7280'
                  }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = showActiveOnly ? '#2196c7' : '#4b5563'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = showActiveOnly ? '#29add3' : '#6b7280'}
                  title={showActiveOnly ? 'Showing active employees only' : 'Showing all employees'}
                >
                  <Users className="h-4 w-4" />
                  <span>{showActiveOnly ? 'Active Only' : 'Show All'}</span>
                </button>
                
                {/* Add Employee Button */}
                <button
                  onClick={() => setIsCreateMode(!isCreateMode)}
                  className="text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center space-x-2"
                  style={{ 
                    backgroundColor: '#29add3'
                  }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#2196c7'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = '#29add3'}
                >
                  <Plus className="h-4 w-4" />
                  <span>{isCreateMode ? 'Cancel' : 'Add Employee'}</span>
                </button>
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

            {/* Create Employee Form */}
            {isCreateMode && (
              <div className="bg-gray-50 p-6 rounded-lg mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Add New Employee
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      value={formData.full_name}
                      onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:border-transparent"
                      style={{ "--tw-ring-color": "#29add3" }}
                      placeholder="Enter employee name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:border-transparent"
                      style={{ "--tw-ring-color": "#29add3" }}
                      placeholder="Enter email address"
                    />
                  </div>

                  {isCreateMode && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Login PIN * (6+ characters - letters, numbers, symbols)
                      </label>
                      <input
                        type="text"
                        value={formData.pin || ''}
                        onChange={(e) => {
                          const value = e.target.value;
                          setFormData(prev => ({ ...prev, pin: value }));
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:border-transparent"
                        style={{ "--tw-ring-color": "#29add3" }}
                        placeholder="Enter 6+ character PIN (letters, numbers, symbols - leave empty for auto-generated)"
                        minLength="6"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Employee will use their email and this PIN to login. Leave empty to auto-generate a PIN.
                      </p>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Role
                    </label>
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
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Hourly Rate
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.hourly_rate}
                      onChange={(e) => setFormData(prev => ({ ...prev, hourly_rate: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:border-transparent"
                      style={{ "--tw-ring-color": "#29add3" }}
                      placeholder="0.00"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      After Hours Rate (Optional)
                    </label>
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
                  </div>

                  <div className="flex items-center">
                    <input
                      id="is_active"
                      type="checkbox"
                      checked={formData.is_active}
                      onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                      className="h-4 w-4 border-gray-300 rounded"
                      style={{ 
                        accentColor: '#29add3'
                      }}
                    />
                    <label htmlFor="is_active" className="ml-2 block text-sm text-gray-900">
                      Active Employee
                    </label>
                  </div>
                </div>

                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    onClick={resetForm}
                    className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium py-2 px-4 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateEmployee}
                    disabled={loading}
                    className="text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center space-x-2"
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
                    <Save className="h-4 w-4" />
                    <span>{loading ? 'Saving...' : 'Create Employee'}</span>
                  </button>
                </div>
              </div>
            )}

            {/* Employees List */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">All Employees ({employees.length})</h3>
              
              {employees.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h4 className="text-lg font-medium text-gray-900 mb-2">No Employees Found</h4>
                  <p className="text-gray-600 mb-4">Get started by adding your first employee.</p>
                  <button
                    onClick={() => setIsCreateMode(true)}
                    className="text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center space-x-2 mx-auto"
                    style={{ 
                      backgroundColor: '#29add3'
                    }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = '#2196c7'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = '#29add3'}
                  >
                    <Plus className="h-4 w-4" />
                    <span>Add First Employee</span>
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {employees.map((employee) => {
                    const config = getEmployeeConfig(employee.id);
                    return (
                      <div key={employee.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h4 className="font-medium text-gray-900">{employee.full_name}</h4>
                          </div>
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-md ${
                            config.is_active 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {config.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </div>

                        <div className="space-y-2 mb-4">
                          <div className="flex items-center space-x-2 text-sm">
                            <Briefcase className="h-4 w-4 text-gray-500" />
                            <span className="capitalize">{employee.role}</span>
                          </div>
                          <div className="flex items-center space-x-2 text-sm">
                            <DollarSign className="h-4 w-4 text-gray-500" />
                            <span>Regular: {formatCurrency(config.hourly_rate)}/hr</span>
                          </div>
                          {config.after_hours_rate && (
                            <div className="flex items-center space-x-2 text-sm">
                              <Clock className="h-4 w-4 text-gray-500" />
                              <span>After Hours: {formatCurrency(config.after_hours_rate)}/hr</span>
                            </div>
                          )}
                        </div>

                        <div className="space-y-2">
                          <div className="flex space-x-1">
                            <Link
                              to={`/employee-profile/${employee.id}`}
                              className="flex-1 text-white text-sm font-medium py-2 px-3 rounded transition-colors flex items-center justify-center space-x-1"
                              style={{ 
                                backgroundColor: '#29add3'
                              }}
                              onMouseEnter={(e) => e.target.style.backgroundColor = '#2196c7'}
                              onMouseLeave={(e) => e.target.style.backgroundColor = '#29add3'}
                            >
                              <Eye className="h-3 w-3" />
                              <span>View Profile</span>
                            </Link>
                            
                            <button
                              onClick={() => handleEditEmployee(employee)}
                              className="flex-1 bg-gray-600 hover:bg-gray-700 text-white text-sm font-medium py-2 px-3 rounded transition-colors flex items-center justify-center space-x-1"
                            >
                              <Edit2 className="h-3 w-3" />
                              <span>Edit</span>
                            </button>
                          </div>
                          
                          <div className="flex space-x-1">
                            <button
                              onClick={() => handleDeleteEmployee(employee.id, employee.full_name)}
                              className="flex-1 bg-orange-600 hover:bg-orange-700 text-white text-xs font-medium py-1.5 px-2 rounded transition-colors flex items-center justify-center space-x-1"
                              title="Deactivate employee (keeps data)"
                            >
                              <Clock className="h-3 w-3" />
                              <span>Deactivate</span>
                            </button>
                            
                            <button
                              onClick={() => handlePermanentDeleteEmployee(employee.id, employee.full_name)}
                              className="flex-1 bg-red-600 hover:bg-red-700 text-white text-xs font-medium py-1.5 px-2 rounded transition-colors flex items-center justify-center space-x-1"
                              title="Permanently delete employee (WARNING: Cannot be undone)"
                            >
                              <AlertTriangle className="h-3 w-3" />
                              <span>Delete</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={modalState.isOpen}
        onClose={closeModal}
        onConfirm={confirmAction}
        type={modalState.type}
        employeeName={modalState.employeeName}
        loading={loading}
        deleteInfo={deleteInfo}
      />
    </div>
  );
};

export default EmployeeManagement;