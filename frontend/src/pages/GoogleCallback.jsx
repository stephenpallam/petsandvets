import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import axios from 'axios';

const GoogleCallback = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const [status, setStatus] = useState('processing'); // processing, success, error
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!user || !isAdmin()) {
      setStatus('error');
      setMessage('Admin access required');
      return;
    }

    const handleCallback = async () => {
      try {
        // Extract code and state from URL parameters
        const urlParams = new URLSearchParams(location.search);
        const code = urlParams.get('code');
        const state = urlParams.get('state');
        const error = urlParams.get('error');

        if (error) {
          throw new Error(`Google OAuth error: ${error}`);
        }

        if (!code || !state) {
          throw new Error('Missing authorization code or state parameter');
        }

        // Send callback data to backend
        const response = await axios.post(
          `${process.env.REACT_APP_BACKEND_URL}/api/google-business/callback`,
          { code, state },
          {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`,
              'Content-Type': 'application/json'
            }
          }
        );

        if (response.data) {
          setStatus('success');
          setMessage('Google Business Profile connected successfully!');
          
          // Redirect to Google Integration page after 2 seconds
          setTimeout(() => {
            navigate('/google-integration');
          }, 2000);
        }

      } catch (error) {
        console.error('Callback error:', error);
        setStatus('error');
        setMessage(error.response?.data?.detail || error.message || 'Connection failed');
        
        // Redirect to Google Integration page after 3 seconds
        setTimeout(() => {
          navigate('/google-integration');
        }, 3000);
      }
    };

    handleCallback();
  }, [location, navigate, user, isAdmin]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-8 text-center">
        {status === 'processing' && (
          <>
            <RefreshCw className="h-12 w-12 text-blue-600 mx-auto mb-4 animate-spin" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Connecting to Google</h2>
            <p className="text-gray-600">Please wait while we complete the connection...</p>
          </>
        )}

        {status === 'success' && (
          <>
            <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Connection Successful!</h2>
            <p className="text-gray-600 mb-4">{message}</p>
            <p className="text-sm text-gray-500">Redirecting you back to Google Integration...</p>
          </>
        )}

        {status === 'error' && (
          <>
            <AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Connection Failed</h2>
            <p className="text-red-600 mb-4">{message}</p>
            <p className="text-sm text-gray-500">Redirecting you back to try again...</p>
          </>
        )}
      </div>
    </div>
  );
};

export default GoogleCallback;