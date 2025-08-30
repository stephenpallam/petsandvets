import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Mail, Lock, User, Shield, AlertCircle, CheckCircle } from 'lucide-react';

const RegisterPage = () => {
  const navigate = useNavigate();
  const { register, user, isAdmin } = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'user'
  });

  // Define available roles based on current user's permissions
  const getAvailableRoles = () => {
    if (!user) {
      // Public registration - only user role available
      return [
        { value: 'user', label: 'User' }
      ];
    } else if (isAdmin()) {
      // Admin can create all roles
      return [
        { value: 'user', label: 'User' },
        { value: 'technician', label: 'Technician' },
        { value: 'manager', label: 'Manager' },
        { value: 'admin', label: 'Admin' }
      ];
    } else if (user.role === 'manager') {
      // Manager can create user, technician, and manager
      return [
        { value: 'user', label: 'User' },
        { value: 'technician', label: 'Technician' },
        { value: 'manager', label: 'Manager' }
      ];
    } else {
      // Other roles cannot create users
      navigate('/');
      return [];
    }
  };

  const availableRoles = getAvailableRoles();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear messages when user starts typing
    if (message.text) {
      setMessage({ text: '', type: '' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (formData.password !== formData.confirmPassword) {
      setMessage({ text: 'Passwords do not match', type: 'error' });
      return;
    }

    if (formData.password.length < 6) {
      setMessage({ text: 'Password must be at least 6 characters long', type: 'error' });
      return;
    }

    setLoading(true);
    
    try {
      const result = await register(formData.email, formData.password, formData.fullName, formData.role);
      
      if (result.success) {
        setMessage({ text: 'User registered successfully!', type: 'success' });
        // Reset form
        setFormData({
          fullName: '',
          email: '',
          password: '',
          confirmPassword: '',
          role: 'user'
        });
        
        // Redirect after success
        setTimeout(() => {
          if (user) {
            // Admin/Manager creating users - redirect to appropriate page
            navigate('/');
          } else {
            // Public registration - redirect to login
            navigate('/login');
          }
        }, 2000);
      } else {
        setMessage({ text: result.error, type: 'error' });
      }
    } catch (error) {
      setMessage({ text: 'Registration failed. Please try again.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8" style={{paddingTop: '120px', paddingBottom: '48px'}}>
        <div className="w-full max-w-md mx-auto">
          <div className="bg-white py-8 px-6 shadow-lg rounded-lg border border-gray-200">
            {/* Form Title */}
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900">
                {user ? 'Register User' : 'Create Account'}
              </h2>
              <p className="mt-2 text-sm text-gray-600">
                {user ? 'Add a new user to the system' : 'Join our veterinary hospital system'}
              </p>
            </div>

            <form className="space-y-6" onSubmit={handleSubmit}>
              {/* Full Name Field */}
              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
                  Full Name
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="fullName"
                    name="fullName"
                    type="text"
                    required
                    className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                    placeholder="Enter full name"
                    value={formData.fullName}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email address
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                    placeholder="Enter email address"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* Role Selection - Only show if user is logged in (admin/manager) */}
              {user && availableRoles.length > 1 && (
                <div>
                  <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                    Role
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Shield className="h-5 w-5 text-gray-400" />
                    </div>
                    <select
                      id="role"
                      name="role"
                      value={formData.role}
                      onChange={handleChange}
                      className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                    >
                      {availableRoles.map(role => (
                        <option key={role.value} value={role.value}>
                          {role.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {/* Password Field */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    required
                    className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                    placeholder="Enter password"
                    value={formData.password}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* Confirm Password Field */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                  Confirm Password
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    required
                    className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                    placeholder="Confirm password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* Error/Success Message */}
              {message.text && (
                <div className={`rounded-md p-4 ${
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

              {/* Submit Button */}
              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full sm:w-auto text-white px-6 py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center sm:justify-start font-medium"
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
                  {loading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Creating Account...
                    </div>
                  ) : (
                    user ? 'Register User' : 'Create Account'
                  )}
                </button>
              </div>
            </form>

            {/* Navigation Links */}
            <div className="mt-6 text-center space-y-2">
              {!user && (
                <div>
                  <span className="text-sm text-gray-600">Already have an account? </span>
                  <button
                    type="button"
                    onClick={() => navigate('/login')}
                    className="text-sm font-medium hover:underline"
                    style={{ color: '#29add3' }}
                  >
                    Sign in
                  </button>
                </div>
              )}
              <div>
                <button
                  type="button"
                  onClick={() => navigate('/')}
                  className="text-sm text-gray-600 hover:text-gray-900 focus:outline-none focus:underline transition-colors"
                >
                  ← Back to Website
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;