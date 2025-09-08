import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import Register from '../components/Register';

const RegisterUser = () => {
  const { user } = useAuth();
  const [showRegister, setShowRegister] = useState(true);

  // Redirect if not logged in
  if (!user) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {showRegister && (
        <Register onClose={() => setShowRegister(false)} />
      )}
      
      {!showRegister && (
        <div className="flex items-center justify-center min-h-screen">
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">User Registration</h1>
            <p className="text-gray-600 mb-6">
              This page allows authorized staff to register new users.
            </p>
            <button
              onClick={() => setShowRegister(true)}
              className="text-white px-6 py-3 rounded-lg font-medium transition-colors"
              style={{ backgroundColor: '#29add3' }}
              onMouseEnter={(e) => e.target.style.opacity = '0.9'}
              onMouseLeave={(e) => e.target.style.opacity = '1'}
            >
              Register New User
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RegisterUser;