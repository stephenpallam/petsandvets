import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, Clock, Facebook, Instagram, X, MessageCircle } from 'lucide-react';
import { hospitalInfo } from '../mock';

const Footer = () => {
  const [hospitalHours, setHospitalHours] = useState(null);
  const [urgentCareHours, setUrgentCareHours] = useState(null);
  const [loading, setLoading] = useState(true);

  const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || import.meta.env.REACT_APP_BACKEND_URL || window.location.origin;

  const formatTime = (time) => {
    if (!time) return '';
    // Convert 24-hour format to 12-hour format
    const [hours, minutes] = time.split(':');
    const hour12 = parseInt(hours) % 12 || 12;
    const ampm = parseInt(hours) >= 12 ? 'PM' : 'AM';
    return `${hour12}:${minutes} ${ampm}`;
  };

  const formatDayHours = (dayData) => {
    if (!dayData || !dayData.is_open) {
      return 'Closed';
    }
    return `${formatTime(dayData.open_time)} - ${formatTime(dayData.close_time)}`;
  };

  useEffect(() => {
    const fetchHours = async () => {
      try {
        // Fetch hospital hours
        const hospitalResponse = await fetch(`${API_BASE_URL}/api/hospital-hours`);
        if (hospitalResponse.ok) {
          const hospitalData = await hospitalResponse.json();
          setHospitalHours(hospitalData);
        }

        // Fetch urgent care hours
        const urgentResponse = await fetch(`${API_BASE_URL}/api/urgent-care-hours`);
        if (urgentResponse.ok) {
          const urgentData = await urgentResponse.json();
          setUrgentCareHours(urgentData);
        }
      } catch (error) {
        console.error('Error fetching hours:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchHours();
  }, []);

  // Fallback to static data while loading or if fetch fails
  const defaultHours = {
    generalPractice: {
      monday: '9:00 AM - 6:00 PM',
      tuesday: '9:00 AM - 6:00 PM',
      wednesday: '9:00 AM - 6:00 PM',
      thursday: '9:00 AM - 6:00 PM',
      friday: '9:00 AM - 6:00 PM',
      saturday: '9:00 AM - 5:00 PM',
      sunday: 'Closed'
    },
    urgentCare: {
      everyday: '3:00 PM - 10:00 PM'
    }
  };

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Hospital Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="rounded-lg p-2" style={{ backgroundColor: '#29add3' }}>
                <div className="w-8 h-8 bg-white rounded flex items-center justify-center">
                  <div className="relative">
                    {/* Hospital plus sign */}
                    <div 
                      className="absolute" 
                      style={{
                        width: '16px',
                        height: '4px',
                        backgroundColor: '#29add3',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)'
                      }}
                    ></div>
                    <div 
                      className="absolute" 
                      style={{
                        width: '4px',
                        height: '16px',
                        backgroundColor: '#29add3',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)'
                      }}
                    ></div>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-bold">Pets & Vets</h3>
                <p className="text-sm text-gray-400">Animal Hospital & Urgent Care</p>
              </div>
            </div>
            
            {/* Contact Info */}
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <MapPin className="h-5 w-5 mt-0.5 flex-shrink-0" style={{ color: '#5bc0db' }} />
                <p className="text-gray-300 text-sm">{hospitalInfo.address}</p>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="h-5 w-5" style={{ color: '#5bc0db' }} />
                <a 
                  href={`tel:${hospitalInfo.phone}`} 
                  className="text-gray-300 transition-colors text-sm"
                  onMouseEnter={(e) => e.target.style.color = '#5bc0db'}
                  onMouseLeave={(e) => e.target.style.color = '#d1d5db'}
                >
                  {hospitalInfo.phone}
                </a>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="h-5 w-5" style={{ color: '#5bc0db' }} />
                <a 
                  href={`mailto:${hospitalInfo.email}`} 
                  className="text-gray-300 transition-colors text-sm"
                  onMouseEnter={(e) => e.target.style.color = '#5bc0db'}
                  onMouseLeave={(e) => e.target.style.color = '#d1d5db'}
                >
                  {hospitalInfo.email}
                </a>
              </div>
            </div>

            {/* Social Media Icons */}
            <div className="flex space-x-4 pt-2">
              <a 
                href="#" 
                className="text-gray-400 transition-colors"
                onMouseEnter={(e) => e.target.style.color = '#5bc0db'}
                onMouseLeave={(e) => e.target.style.color = '#9ca3af'}
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a 
                href="#" 
                className="text-gray-400 transition-colors"
                onMouseEnter={(e) => e.target.style.color = '#5bc0db'}
                onMouseLeave={(e) => e.target.style.color = '#9ca3af'}
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a 
                href="#" 
                className="text-gray-400 transition-colors"
                onMouseEnter={(e) => e.target.style.color = '#5bc0db'}
                onMouseLeave={(e) => e.target.style.color = '#9ca3af'}
              >
                <X className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* General Practice Hours */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-white flex items-center">
              <Clock className="h-5 w-5 mr-2" style={{ color: '#5bc0db' }} />
              General Practice Hours
              {loading && <span className="ml-2 text-xs text-gray-400">(loading...)</span>}
            </h4>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-300">Monday:</span>
                <span className="text-white">
                  {hospitalHours ? formatDayHours(hospitalHours.monday) : defaultHours.generalPractice.monday}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Tuesday:</span>
                <span className="text-white">
                  {hospitalHours ? formatDayHours(hospitalHours.tuesday) : defaultHours.generalPractice.tuesday}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Wednesday:</span>
                <span className="text-white">
                  {hospitalHours ? formatDayHours(hospitalHours.wednesday) : defaultHours.generalPractice.wednesday}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Thursday:</span>
                <span className="text-white">
                  {hospitalHours ? formatDayHours(hospitalHours.thursday) : defaultHours.generalPractice.thursday}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Friday:</span>
                <span className="text-white">
                  {hospitalHours ? formatDayHours(hospitalHours.friday) : defaultHours.generalPractice.friday}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Saturday:</span>
                <span className="text-white">
                  {hospitalHours ? formatDayHours(hospitalHours.saturday) : defaultHours.generalPractice.saturday}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Sunday:</span>
                <span className="text-white">
                  {hospitalHours ? formatDayHours(hospitalHours.sunday) : defaultHours.generalPractice.sunday}
                </span>
              </div>
            </div>
            <p className="text-blue-400 text-xs mt-2">By Appointment Only</p>
          </div>

          {/* Urgent Care Hours */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-white flex items-center">
              <Clock className="h-5 w-5 mr-2 text-red-400" />
              Urgent Care Hours
              {loading && <span className="ml-2 text-xs text-gray-400">(loading...)</span>}
            </h4>
            <div className="text-sm">
              {urgentCareHours ? (
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-gray-300">Monday:</span>
                    <span className="text-white">{formatDayHours(urgentCareHours.monday)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Tuesday:</span>
                    <span className="text-white">{formatDayHours(urgentCareHours.tuesday)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Wednesday:</span>
                    <span className="text-white">{formatDayHours(urgentCareHours.wednesday)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Thursday:</span>
                    <span className="text-white">{formatDayHours(urgentCareHours.thursday)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Friday:</span>
                    <span className="text-white">{formatDayHours(urgentCareHours.friday)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Saturday:</span>
                    <span className="text-white">{formatDayHours(urgentCareHours.saturday)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Sunday:</span>
                    <span className="text-white">{formatDayHours(urgentCareHours.sunday)}</span>
                  </div>
                </div>
              ) : (
                <div className="flex justify-between">
                  <span className="text-gray-300">Every Day:</span>
                  <span className="text-white font-medium">{defaultHours.urgentCare.everyday}</span>
                </div>
              )}
              <p className="text-red-400 text-xs mt-2">Check In Online or Call Now</p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-6 pt-6 text-center">
          <div className="flex flex-col sm:flex-row justify-center items-center space-y-2 sm:space-y-0 sm:space-x-6 mb-4">
            <Link 
              to="/privacy-policy" 
              className="text-gray-400 hover:text-white transition-colors text-sm"
              onMouseEnter={(e) => e.target.style.color = '#5bc0db'}
              onMouseLeave={(e) => e.target.style.color = '#9ca3af'}
            >
              Privacy Policy
            </Link>
            <span className="hidden sm:inline text-gray-600">•</span>
            <Link 
              to="/accessibility" 
              className="text-gray-400 hover:text-white transition-colors text-sm"
              onMouseEnter={(e) => e.target.style.color = '#5bc0db'}
              onMouseLeave={(e) => e.target.style.color = '#9ca3af'}
            >
              Accessibility
            </Link>
            <span className="hidden sm:inline text-gray-600">•</span>
            <Link 
              to="/terms-of-service" 
              className="text-gray-400 hover:text-white transition-colors text-sm"
              onMouseEnter={(e) => e.target.style.color = '#5bc0db'}
              onMouseLeave={(e) => e.target.style.color = '#9ca3af'}
            >
              Terms of Service
            </Link>
          </div>
          <p className="text-gray-400 text-sm">
            © 2025 Prime Pixel LLC. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;