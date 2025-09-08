import { useState, useEffect } from 'react';
import { hospitalInfo } from '../mock';

export const useBusinessInfo = () => {
  const [businessInfo, setBusinessInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || import.meta.env.REACT_APP_BACKEND_URL || window.location.origin;

  useEffect(() => {
    const fetchBusinessInfo = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/business-info`);
        if (response.ok) {
          const data = await response.json();
          setBusinessInfo(data);
        } else {
          setError('Failed to fetch business info');
        }
      } catch (err) {
        console.error('Error fetching business info:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBusinessInfo();
  }, []);

  // Return dynamic business info or fallback to static
  const currentBusinessInfo = businessInfo || hospitalInfo;

  return {
    businessInfo: currentBusinessInfo,
    loading,
    error,
    isStatic: !businessInfo // indicates if using fallback static data
  };
};