import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Eye, EyeOff, Lock, Mail, AlertCircle, CheckCircle, X } from 'lucide-react';

const Login = ({ onClose }) => {
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setMessage({ type: '', text: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    const result = await login(formData.email, formData.password);
    
    if (result.success) {
      setMessage({ type: 'success', text: 'Login successful!' });
      setTimeout(() => {
        onClose();
      }, 1000);
    } else {
      setMessage({ type: 'error', text: result.error });
    }
    
    setLoading(false);
  };

  return (
    <>
      {/* Full page overlay */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-50" 
        style={{ 
          position: 'fixed', 
          top: 0, 
          left: 0, 
          right: 0, 
          bottom: 0,
          zIndex: 9999 
        }}
        onClick={onClose}
      />
      
      {/* Modal */}
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ 
          position: 'fixed', 
          top: 0, 
          left: 0, 
          right: 0, 
          bottom: 0,
          zIndex: 10000,
          pointerEvents: 'none'
        }}
      >
        <div 
          className="bg-white rounded-xl shadow-2xl w-full max-w-sm relative"
          style={{ 
            margin: 'auto',
            pointerEvents: 'auto'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-100">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: '#29add3' }}>
                <Lock className="h-5 w-5 text-white" />
              </div>
              <h2 className="text-lg font-bold text-gray-900">Sign In</h2>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Main Content */}
          <div className="p-4">
            {message.text && (
              <div className={`mb-4 p-3 rounded-lg flex items-center text-sm ${
                message.type === 'success' 
                  ? 'bg-green-50 text-green-800 border border-green-200'
                  : 'bg-red-50 text-red-800 border border-red-200'
              }`}>
                {message.type === 'success' ? (
                  <CheckCircle className="h-4 w-4 mr-2 flex-shrink-0" />
                ) : (
                  <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0" />
                )}
                {message.text}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent transition-colors"
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
                    placeholder="Enter your email"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full pl-10 pr-12 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent transition-colors"
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
                    placeholder="Enter your password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-gray-100 space-y-3">
            <div className="text-xs text-gray-500 rounded-lg p-2 text-center" style={{ backgroundColor: '#f0fdff' }}>
              <strong>Test Account:</strong><br />
              admin@hospital.com / admin123
            </div>
            
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full text-white py-2.5 px-4 rounded-lg hover:opacity-90 focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium"
              style={{ 
                backgroundColor: '#29add3',
                '--tw-ring-color': '#29add3'
              }}
              onMouseEnter={(e) => e.target.style.opacity = '0.9'}
              onMouseLeave={(e) => e.target.style.opacity = '1'}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;