import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useParams, useNavigate } from 'react-router-dom';
import { User, Mail, Briefcase, DollarSign, ArrowLeft, Save, AlertCircle, CheckCircle, Lock, X } from 'lucide-react';
import axios from 'axios';

const EditEmployeeProfile = () => {
  const { user_id } = useParams();
  const navigate = useNavigate();
  const { user, token, canAccessManager, loading: authLoading } = useAuth();
  const [employee, setEmployee] = useState(null);
  const [employeeConfig, setEmployeeConfig] = useState(null);
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    role: '',
    pin: '',
    hourly_rate: '',
    after_hours_rate: '',
    is_active: true
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [authError, setAuthError] = useState(null);
  const [pageLoading, setPageLoading] = useState(true);

  const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || import.meta.env.REACT_APP_BACKEND_URL || window.location.origin;
  const themeColor = '#29add3';

  const roles = [
    { value: 'user', label: 'User' },
    { value: 'technician', label: 'Technician' },
    { value: 'manager', label: 'Manager' }
  ];

  // Authentication check - managers/admins can edit all, employees can edit their own
  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (!user) {
      setAuthError('Please log in to access this page');
      setPageLoading(false);
      return;
    }

    // Check permissions - managers can edit all, users can only edit their own
    if (!canAccessManager() && user.id !== user_id) {
      setAuthError('You can only edit your own profile');
      setPageLoading(false);
      return;
    }

    fetchEmployeeData();
  }, [user, user_id, token, canAccessManager, authLoading]);

  const fetchEmployeeData = async () => {
    try {
      setPageLoading(true);

      // Fetch employee details
      const employeeResponse = await axios.get(`${API_BASE_URL}/api/employees/${user_id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      // Fetch employee config
      const configResponse = await axios.get(`${API_BASE_URL}/api/employee-configs/${user_id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      setEmployee(employeeResponse.data);
      setEmployeeConfig(configResponse.data);

      // Set form data
      setFormData({
        full_name: employeeResponse.data.full_name,
        email: employeeResponse.data.email,
        role: employeeResponse.data.role,
        pin: '',
        hourly_rate: configResponse.data.hourly_rate.toString(),
        after_hours_rate: configResponse.data.after_hours_rate ? configResponse.data.after_hours_rate.toString() : '',
        is_active: configResponse.data.is_active
      });

    } catch (err) {
      console.error('Error fetching employee data:', err);
      setMessage({ 
        type: 'error', 
        text: err.response?.data?.detail || 'Failed to load employee data' 
      });
    } finally {
      setPageLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      // Validate PIN if provided
      if (formData.pin && formData.pin.length < 6) {
        setMessage({ type: 'error', text: 'PIN must be at least 6 characters (letters, numbers, and symbols allowed)' });
        return;
      }

      if (parseFloat(formData.hourly_rate) < 0) {
        setMessage({ type: 'error', text: 'Hourly rate cannot be negative' });
        return;
      }

      // Update employee details
      const employeeData = {
        full_name: formData.full_name,
        email: formData.email,
        role: formData.role
      };

      // Add PIN if provided
      if (formData.pin) {
        employeeData.pin = formData.pin;
      }

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

      const successMessage = formData.pin 
        ? 'Employee updated successfully! New PIN is active for login.' 
        : 'Employee updated successfully!';
      
      setMessage({ type: 'success', text: successMessage });

      // Navigate back to employee profile after successful update
      setTimeout(() => {
        navigate(`/employee-profile/${user_id}`);
      }, 2000);

    } catch (err) {
      setMessage({ 
        type: 'error', 
        text: err.response?.data?.detail || 'Failed to update employee' 
      });
    } finally {
      setLoading(false);
    }
  };

  // Show loading screen while checking authentication
  if (pageLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderBottomColor: themeColor }}></div>
          <p className="text-gray-600">Loading employee data...</p>
        </div>
      </div>
    );
  }

  // Show error if authentication failed
  if (authError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-medium text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">{authError}</p>
        </div>
      </div>
    );
  }

  if (!employee || !employeeConfig) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-medium text-gray-900 mb-2">Employee Not Found</h2>
          <p className="text-gray-600">The requested employee could not be found.</p>
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
                Edit {employee?.full_name || 'Employee'} Profile
              </h2>
              <div className="flex space-x-2">
                <button
                  onClick={() => navigate('/employee-management')}
                  className="text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center space-x-2"
                  style={{ backgroundColor: 'rgb(41, 173, 211)' }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = 'rgb(31, 163, 201)'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = 'rgb(41, 173, 211)'}
                  title="Back to Employee Management"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Back</span>
                </button>
              </div>
            </div>
          </div>

          <div className="p-6">
            {/* Message Display */}
            {message.text && (
              <div className={`mb-6 flex items-center p-4 rounded-lg ${
                message.type === 'error' 
                  ? 'bg-red-50 border border-red-200' 
                  : 'bg-green-50 border border-green-200'
              }`}>
                {message.type === 'error' ? (
                  <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
                ) : (
                  <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                )}
                <span className={message.type === 'error' ? 'text-red-700' : 'text-green-700'}>
                  {message.text}
                </span>
              </div>
            )}

            {/* Edit Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* Full Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <User className="h-4 w-4 inline mr-1" />
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={formData.full_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:border-transparent"
                    style={{ "--tw-ring-color": themeColor }}
                    placeholder="Enter full name"
                    required
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Mail className="h-4 w-4 inline mr-1" />
                    Email *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:border-transparent"
                    style={{ "--tw-ring-color": themeColor }}
                    placeholder="Enter email address"
                    required
                  />
                </div>

                {/* Role */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Briefcase className="h-4 w-4 inline mr-1" />
                    Role
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:border-transparent"
                    style={{ "--tw-ring-color": themeColor }}
                  >
                    {roles.map(role => (
                      <option key={role.value} value={role.value}>
                        {role.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* PIN */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Lock className="h-4 w-4 inline mr-1" />
                    Update Login PIN (6+ characters - letters, numbers, symbols)
                  </label>
                  <input
                    type="text"
                    value={formData.pin}
                    onChange={(e) => {
                      const value = e.target.value;
                      setFormData(prev => ({ ...prev, pin: value }));
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:border-transparent"
                    style={{ "--tw-ring-color": themeColor }}
                    placeholder="Enter new PIN (leave empty to keep current PIN)"
                    minLength="6"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Leave empty to keep the current PIN unchanged. Employee will use their email and PIN to login.
                  </p>
                </div>

                {/* Hourly Rate */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <DollarSign className="h-4 w-4 inline mr-1" />
                    Hourly Rate
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.hourly_rate}
                    onChange={(e) => setFormData(prev => ({ ...prev, hourly_rate: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:border-transparent"
                    style={{ "--tw-ring-color": themeColor }}
                    placeholder="0.00"
                  />
                </div>

                {/* After Hours Rate */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    After Hours Rate (optional)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.after_hours_rate}
                    onChange={(e) => setFormData(prev => ({ ...prev, after_hours_rate: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:border-transparent"
                    style={{ "--tw-ring-color": themeColor }}
                    placeholder="Leave empty for same as regular rate"
                  />
                </div>

              </div>

              {/* Active Status */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                  className="h-4 w-4 rounded border-gray-300 focus:ring-2"
                  style={{ "--tw-ring-color": themeColor }}
                />
                <label htmlFor="is_active" className="ml-2 text-sm text-gray-700">
                  Employee is active (can clock in/out and access system)
                </label>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-2 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => navigate(`/employee-profile/${user_id}`)}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium py-2 px-4 rounded-lg transition-colors flex items-center space-x-2"
                >
                  <X className="h-4 w-4" />
                  <span>Cancel</span>
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center space-x-2"
                  style={{ 
                    backgroundColor: loading ? '#9ca3af' : themeColor,
                    cursor: loading ? 'not-allowed' : 'pointer'
                  }}
                  onMouseEnter={(e) => {
                    if (!loading) {
                      e.target.style.backgroundColor = '#228ba8';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!loading) {
                      e.target.style.backgroundColor = themeColor;
                    }
                  }}
                >
                  <Save className="h-4 w-4" />
                  <span>{loading ? 'Saving...' : 'Save Changes'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditEmployeeProfile;