import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(null);

  const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || import.meta.env.REACT_APP_BACKEND_URL;

  // Initialize token from localStorage on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);
    } else {
      setLoading(false);
    }
  }, []);

  // Fetch user profile when token changes
  useEffect(() => {
    if (token) {
      fetchUserProfile();
    } else {
      setLoading(false);
    }
  }, [token]);

  const fetchUserProfile = async () => {
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      } else if (response.status === 401 || response.status === 403) {
        // Token is invalid or expired
        console.log('Token invalid, clearing authentication');
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
      } else {
        console.error('Error fetching user profile:', response.status);
      }
    } catch (error) {
      console.error('Network error fetching user profile:', error);
      // Don't clear token on network errors, user might be offline
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const data = await response.json();
        const newToken = data.access_token;
        
        // Store token in localStorage and state
        localStorage.setItem('token', newToken);
        setToken(newToken);
        
        // The useEffect will trigger fetchUserProfile when token changes
        return { success: true };
      } else {
        const errorData = await response.json();
        return { success: false, error: errorData.detail || 'Login failed' };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Network error. Please try again.' };
    }
  };

  const register = async (email, password, fullName, role = 'user') => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          full_name: fullName,
          role
        }),
      });

      if (response.ok) {
        const userData = await response.json();
        return { success: true, user: userData };
      } else {
        const errorData = await response.json();
        return { success: false, error: errorData.detail || 'Registration failed' };
      }
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, error: 'Network error. Please try again.' };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  const isAdmin = () => {
    return user && user.role === 'admin';
  };

  const isManager = () => {
    return user && user.role === 'manager';
  };

  const isTechnician = () => {
    return user && user.role === 'technician';
  };

  const hasRole = (role) => {
    return user && user.role === role;
  };

  const canAccessAdmin = () => {
    return user && user.role === 'admin';
  };

  const canAccessManager = () => {
    return user && (user.role === 'admin' || user.role === 'manager');
  };

  const canAccessTechnician = () => {
    return user && (user.role === 'admin' || user.role === 'manager' || user.role === 'technician');
  };

  const value = {
    user,
    token,
    login,
    register,
    logout,
    isAdmin,
    isManager,
    isTechnician,
    hasRole,
    canAccessAdmin,
    canAccessManager,
    canAccessTechnician,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};