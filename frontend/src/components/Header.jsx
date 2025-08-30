import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Phone, Clock, MapPin, ChevronDown } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [businessInfo, setBusinessInfo] = useState(null);
  const [currentHours, setCurrentHours] = useState(null);
  const location = useLocation();
  const { user, isAdmin, logout } = useAuth();

  // Fetch business information and current hours
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [businessResponse, hoursResponse] = await Promise.all([
          axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/business-info`),
          axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/hours/current`)
        ]);
        setBusinessInfo(businessResponse.data);
        setCurrentHours(hoursResponse.data);
      } catch (error) {
        console.error('Error fetching data:', error);
        // Fallback to default values
        setBusinessInfo({
          hospital_name: "Pets & Vets",
          address: "South Riding, VA 20152",
          phone: "(703) 957-3297"
        });
      }
    };

    fetchData();
  }, []);

  // Function to determine if urgent care is currently open
  const getUrgentCareStatus = () => {
    const now = new Date();
    const currentHour = now.getHours();
    
    // Urgent Care hours: 3 PM - 10 PM Daily (15:00 - 22:00)
    if (currentHour >= 15 && currentHour < 22) {
      return "Open";
    } else {
      return "Closed";
    }
  };

  // Function to determine if general practice is currently open
  const getGeneralPracticeStatus = () => {
    if (!currentHours || !currentHours.general_practice) {
      return "Closed";
    }

    const now = new Date();
    const currentTime = now.getHours() * 100 + now.getMinutes(); // Convert to HHMM format
    
    const gpHours = currentHours.general_practice;
    
    // Handle case where gpHours is an object with open_time and close_time
    if (typeof gpHours === 'object' && gpHours.open_time && gpHours.close_time) {
      // Check if it's closed for the day
      if (gpHours.open_time.toLowerCase().includes('closed') || gpHours.close_time.toLowerCase().includes('closed')) {
        return "Closed";
      }
      
      try {
        const startTime = parseTimeString(gpHours.open_time);
        const endTime = parseTimeString(gpHours.close_time);
        
        if (currentTime >= startTime && currentTime < endTime) {
          return "Open";
        } else {
          return "Closed";
        }
      } catch (error) {
        return "Closed";
      }
    }
    
    // Handle case where gpHours is a string like "9:00 AM - 6:00 PM"
    if (typeof gpHours === 'string') {
      // Check if it's closed for the day
      if (gpHours.toLowerCase().includes('closed')) {
        return "Closed";
      }
      
      // Parse hours like "9:00 AM - 6:00 PM"
      try {
        const timeRange = gpHours.split(' - ');
        if (timeRange.length !== 2) return "Closed";
        
        const startTime = parseTimeString(timeRange[0].trim());
        const endTime = parseTimeString(timeRange[1].trim());
        
        if (currentTime >= startTime && currentTime < endTime) {
          return "Open";
        } else {
          return "Closed";
        }
      } catch (error) {
        return "Closed";
      }
    }
    
    return "Closed";
  };

  // Helper function to parse time strings like "9:00 AM" to HHMM format
  const parseTimeString = (timeStr) => {
    const [time, period] = timeStr.split(' ');
    const [hours, minutes] = time.split(':').map(Number);
    
    let hour24 = hours;
    if (period.toLowerCase() === 'pm' && hours !== 12) {
      hour24 += 12;
    } else if (period.toLowerCase() === 'am' && hours === 12) {
      hour24 = 0;
    }
    
    return hour24 * 100 + minutes;
  };

  // Get short address from business info
  const getShortAddress = () => {
    if (!businessInfo || !businessInfo.address) {
      return "South Riding, VA 20152";
    }
    
    // Extract city, state, zip from full address
    const address = businessInfo.address;
    const parts = address.split(',').map(part => part.trim());
    
    // Look for VA and zip code pattern and include the city before it
    for (let i = 0; i < parts.length; i++) {
      if (parts[i].includes('VA') || parts[i].includes('Virginia')) {
        // Get the city name (previous part) + state + zip
        let result = '';
        if (i > 0) {
          // Include city name from previous part
          result = parts[i - 1];
        }
        
        // Add state
        if (result) {
          result += `, ${parts[i]}`;
        } else {
          result = parts[i];
        }
        
        // Add zip code if available
        if (i + 1 < parts.length) {
          result += `, ${parts[i + 1]}`;
        }
        
        return result;
      }
    }
    
    // Fallback: return last three parts if available (city, state, zip)
    if (parts.length >= 3) {
      return `${parts[parts.length - 3]}, ${parts[parts.length - 2]}, ${parts[parts.length - 1]}`;
    } else if (parts.length >= 2) {
      return `${parts[parts.length - 2]}, ${parts[parts.length - 1]}`;
    }
    
    return "South Riding, VA 20152";
  };

  const getNavigation = () => {
    const baseNavigation = [
      { name: 'Home', href: '/' },
      { 
        name: 'About Us',
        dropdown: [
          { name: 'Our Mission', href: '/our-mission' },
          { name: 'Our Values', href: '/our-core-values' },
          { name: 'Our Team', href: '/our-team' },
          { name: 'Our Facility', href: '/gallery' }
        ]
      },
      { 
        name: 'Services',
        dropdown: [
          { name: 'Urgent Care', href: '/urgent-care' },
          {
            name: 'Dog Services',
            submenu: [
              { name: 'Dog Dental Care', href: '/dog-dental-care' },
              { name: 'Dog Dermatology', href: '/dog-skin-care' },
              { name: 'Dog Vaccinations', href: '/dog-vaccinations' },
              { name: 'Dog Wellness', href: '/dog-wellness-exams' },
              { name: 'Dog Eye Care', href: '/dog-eye-care' },
              { name: 'Dog Surgeries', href: '/dog-surgeries' }
            ]
          },
          {
            name: 'Cat Services',
            submenu: [
              { name: 'Cat Dental Care', href: '/cat-dental-care' },
              { name: 'Cat Diagnostic Imaging', href: '/cat-diagnostic-imaging' },
              { name: 'Cat Vaccinations', href: '/cat-vaccinations' }
            ]
          },
          {
            name: 'General Services',
            submenu: [
              { name: 'Vaccinations', href: '/pet-vaccinations' },
              { name: 'Wellness Exams', href: '/preventive-pet-care' },
              { name: 'Ultrasounds', href: '/ultrasound-exams' },
              { name: 'Diagnostic Laboratory', href: '/veterinary-diagnostic-services' },
              { name: 'Dermatology & Allergy Care', href: '/pet-dermatology-allergy-care' },
              { name: 'Digital Radiology', href: '/digital-veterinary-x-rays' },
              { name: 'Microchipping', href: '/pet-microchipping' },
              { name: 'End of Life Care', href: '/end-of-life-care' },
              { name: 'On Site Pharmacy', href: '/on-site-pharmacy' },
              { name: 'Travel Certificates', href: '/pet-travel-certificates' },
              { name: 'Diet & Nutrition', href: '/dog-diet-nutrition' }
            ]
          },
          {
            name: 'Dental Services',
            submenu: [
              { name: 'Dental Cleaning', href: '/dental-cleanings' },
              { name: 'Tooth Extractions', href: '/pet-tooth-extraction' }
            ]
          },
          { name: 'Eye Care', href: '/pet-ocular-services' },
          {
            name: 'Surgical Services',
            submenu: [
              { name: 'Spay & Neuter', href: '/pet-spay-neuter' },
              { name: 'Bladder Stone Removal', href: '/pet-bladder-stone-removal' },
              { name: 'Blocked Cat / PU Surgery', href: '/blocked-cats-urgent-care' },
              { name: 'Foreign Body / Obstruction Surgery', href: '/foreign-body-surgery' }
            ]
          }
        ]
      },
      { 
        name: 'Patient Resources',
        dropdown: [
          { name: 'Your First Visit', href: '/your-first-visit' },
          { name: 'Insurance & Payments', href: '/pet-insurance-payments' },
          { 
            name: 'Online Forms', 
            submenu: [
              { name: 'New Patient Registration', href: '/forms/new-patient-registration' },
              { name: 'Patient Drop-Off', href: '/forms/patient-drop-off' },
              { name: 'Surgery & Anesthesia Consent', href: '/forms/surgery-anesthesia-consent' },
              { name: 'Dental Consent', href: '/forms/dental-consent' },
              { name: 'Request Pet Records', href: '/forms/request-pet-records' }
            ]
          },
          { name: 'Download Forms', href: '/forms-download' }
        ]
      }
    ];

    // Add Manager menu only if user is logged in
    if (user) {
      const managerDropdown = [];
      
      if (isAdmin()) {
        managerDropdown.push(
          { name: 'Urgent Care Appointments', href: '/urgent-care-appointments' },
          { name: 'Configure Hours', href: '/configure-hours' },
          { name: 'Reviews', href: '/reviews' },
          { name: 'Business Info', href: '/business-info' },
          { name: 'Photo Management', href: '/photo-management' }
        );
      }
      
      if (user) {
        managerDropdown.push({ name: 'Register User', href: '/register-user' });
      }
      
      // Always add logout for logged-in users
      managerDropdown.push({ name: 'Logout', action: 'logout', className: 'border-t border-gray-200 pt-2' });
      
      baseNavigation.push({
        name: 'Manager',
        dropdown: managerDropdown
      });
    }

    // Add Contact Us
    baseNavigation.push({
      name: 'Contact Us',
      dropdown: [
        { name: 'Reach Us', href: '/reach-us' },
        { name: 'Our Hours', href: '/our-hours' },
        { name: 'Message Us', href: '/message-us' }
      ]
    });

    return baseNavigation;
  };

  const navigation = getNavigation();

  const isActive = (href) => location.pathname === href;

  const isNavItemActive = (itemName) => {
    switch (itemName) {
      case 'Services':
        return location.pathname.includes('/services') || 
               location.pathname.includes('/urgent-care') || 
               location.pathname.includes('/dog-') || 
               location.pathname.includes('/cat-') || 
               (location.pathname.includes('/pet-') && !location.pathname.includes('/pet-insurance-payments')) || 
               location.pathname.includes('/dental-') || 
               location.pathname.includes('/ultrasound-') || 
               location.pathname.includes('/veterinary-') || 
               location.pathname.includes('/digital-') || 
               location.pathname.includes('/preventive-') || 
               location.pathname.includes('/blocked-') || 
               location.pathname.includes('/foreign-') ||
               location.pathname.includes('/end-of-life-care') ||
               location.pathname.includes('/on-site-pharmacy') ||
               location.pathname.includes('/pet-travel-certificates');
      
      case 'About Us':
        return location.pathname.includes('/our-') || 
               location.pathname.includes('/about') || 
               location.pathname.includes('/gallery');
      
      case 'Contact Us':
        return location.pathname.includes('/reach-us') || 
               location.pathname.includes('/message-us') || 
               location.pathname.includes('/contact') ||
               location.pathname.includes('/our-hours');
      
      case 'Patient Resources':
        return location.pathname.includes('/forms') || 
               location.pathname.includes('/your-first-visit') ||
               location.pathname.includes('/pet-insurance-payments');
      
      case 'Manager':
        return location.pathname.includes('/urgent-care-appointments') ||
               location.pathname.includes('/configure-hours') ||
               location.pathname.includes('/reviews') ||
               location.pathname.includes('/business-info') ||
               location.pathname.includes('/photo-management') ||
               location.pathname.includes('/register-user');
      
      default:
        return false;
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200">
      {/* Top Bar */}
      <div className="text-white py-2" style={{ backgroundColor: '#29add3' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Desktop Layout */}
          <div className="hidden md:flex justify-between items-center text-sm">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                <Phone className="h-4 w-4" />
                <span>{businessInfo?.phone || "(703) 957-3297"}</span>
              </div>
              <div className="flex items-center space-x-1">
                <MapPin className="h-4 w-4" />
                <span className="truncate">{getShortAddress()}</span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                <Clock className="h-4 w-4" />
                <span>General Practice: {getGeneralPracticeStatus()}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Clock className="h-4 w-4" />
                <span>Urgent Care: {getUrgentCareStatus()}</span>
              </div>
            </div>
          </div>

          {/* Mobile Layout */}
          <div className="md:hidden">
            {/* Row 1: Phone (left) and GP Status (right) */}
            <div className="flex justify-between items-center text-xs mb-0.5">
              <div className="flex items-center space-x-1">
                <Phone className="h-3 w-3" />
                <span>{businessInfo?.phone || "(703) 957-3297"}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Clock className="h-3 w-3" />
                <span>General Practice: {getGeneralPracticeStatus()}</span>
              </div>
            </div>
            
            {/* Row 2: Address (left) and UC Status (right) */}
            <div className="flex justify-between items-center text-xs">
              <div className="flex items-center space-x-1">
                <MapPin className="h-3 w-3 flex-shrink-0" />
                <span className="truncate text-xs">{getShortAddress()}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Clock className="h-3 w-3" />
                <span>Urgent Care: {getUrgentCareStatus()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3">
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
              <h1 className="text-xl font-bold text-gray-900">Pets & Vets</h1>
              <p className="text-sm text-gray-600">Animal Hospital & Urgent Care</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            {navigation.map((item) => {
              // Hide Home link when on home page
              if (item.name === 'Home' && location.pathname === '/') {
                return null;
              }
              
              return (
                <div key={item.name} className="relative">
                  {item.dropdown ? (
                    <div 
                      className="relative"
                      onMouseEnter={() => setActiveDropdown(item.name)}
                      onMouseLeave={() => {
                        // Add a small delay before hiding to allow mouse movement
                        setTimeout(() => setActiveDropdown(null), 100);
                      }}
                    >
                      <button
                        onClick={() => setActiveDropdown(activeDropdown === item.name ? null : item.name)}
                        className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                          isNavItemActive(item.name)
                            ? 'text-gray-900' 
                            : 'text-gray-700 hover:text-gray-900'
                        }`}
                        style={{
                          backgroundColor: isNavItemActive(item.name) ? '#e6f7fb' : 'transparent',
                          color: isNavItemActive(item.name) ? '#29add3' : undefined
                        }}
                        onMouseEnter={(e) => {
                          if (!isNavItemActive(item.name)) {
                            e.target.style.color = '#29add3';
                            e.target.style.backgroundColor = '#f0fdff';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!isNavItemActive(item.name)) {
                            e.target.style.color = '#374151';
                            e.target.style.backgroundColor = 'transparent';
                          }
                        }}
                      >
                        {item.name}
                        <ChevronDown className="ml-1 h-4 w-4" />
                      </button>
                      
                      {/* Dropdown Menu */}
                      {activeDropdown === item.name && (
                        <div 
                          className="absolute top-full left-0 mt-0 w-64 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50"
                          onMouseEnter={() => setActiveDropdown(item.name)}
                          onMouseLeave={() => {
                            setTimeout(() => setActiveDropdown(null), 100);
                          }}
                        >
                          {item.dropdown.map((dropdownItem, index) => (
                            <div key={index} className={index < item.dropdown.length - 1 ? "border-b border-gray-100" : ""}>
                              {dropdownItem.submenu ? (
                                <div className="relative group">
                                  <div className="flex items-center justify-between px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer">
                                    <span className="font-medium">{dropdownItem.name}</span>
                                    <ChevronDown className="h-4 w-4 transform -rotate-90" />
                                  </div>
                                  {/* Submenu */}
                                  <div className="absolute left-full top-0 ml-0 w-64 bg-white rounded-lg shadow-xl border border-gray-200 py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                                    {dropdownItem.submenu.map((subItem, subIndex) => (
                                      <Link
                                        key={subIndex}
                                        to={subItem.href}
                                        className={`block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-blue-600 transition-colors duration-200 ${subIndex < dropdownItem.submenu.length - 1 ? 'border-b border-gray-100' : ''}`}
                                        onClick={() => setActiveDropdown(null)}
                                      >
                                        {subItem.name}
                                      </Link>
                                    ))}
                                  </div>
                                </div>
                              ) : dropdownItem.action === 'logout' ? (
                                <button
                                  onClick={() => {
                                    logout();
                                    setActiveDropdown(null);
                                  }}
                                  className={`block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-red-600 transition-colors duration-200 ${dropdownItem.className || ''}`}
                                >
                                  {dropdownItem.name}
                                </button>
                              ) : (
                                <Link
                                  to={dropdownItem.href}
                                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-blue-600 transition-colors duration-200"
                                  onClick={() => setActiveDropdown(null)}
                                >
                                  {dropdownItem.name}
                                </Link>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <Link
                      to={item.href}
                      className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                        isActive(item.href)
                          ? 'text-gray-900' 
                          : 'text-gray-700 hover:text-gray-900'
                      }`}
                      style={{
                        backgroundColor: isActive(item.href) ? '#e6f7fb' : 'transparent',
                        color: isActive(item.href) ? '#29add3' : undefined
                      }}
                      onMouseEnter={(e) => {
                        if (!isActive(item.href)) {
                          e.target.style.color = '#29add3';
                          e.target.style.backgroundColor = '#f0fdff';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isActive(item.href)) {
                          e.target.style.color = '#374151';
                          e.target.style.backgroundColor = 'transparent';
                        }
                      }}
                    >
                      {item.name}
                    </Link>
                  )}
                </div>
              );
            })}
          </nav>

          {/* CTA Button */}
          <div className="hidden md:flex items-center space-x-4">
            <Link
              to="/urgent-care"
              className="text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200 shadow-md hover:shadow-lg"
              style={{ 
                backgroundColor: '#29add3',
                '&:hover': { backgroundColor: '#2196c7' }
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#2196c7'}
              onMouseLeave={(e) => e.target.style.backgroundColor = '#29add3'}
            >
              Urgent Care
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors duration-200"
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200 shadow-lg">
          <div className="px-4 py-3 space-y-3 max-h-96 overflow-y-auto">
            {navigation.map((item) => {
              // Hide Home link when on home page
              if (item.name === 'Home' && location.pathname === '/') {
                return null;
              }
              
              return (
                <div key={item.name}>
                  {item.dropdown ? (
                    <div>
                      <Link
                        to={item.href}
                        onClick={() => setIsMenuOpen(false)}
                        className={`flex items-center justify-between px-3 py-2 text-base font-medium rounded-lg transition-all duration-200 ${
                          isActive(item.href) || location.pathname.includes('/services') || location.pathname.includes('/urgent-care') || location.pathname.includes('/dog-') || location.pathname.includes('/cat-') || location.pathname.includes('/pet-') || location.pathname.includes('/dental-') || location.pathname.includes('/ultrasound-') || location.pathname.includes('/veterinary-') || location.pathname.includes('/digital-') || location.pathname.includes('/preventive-') || location.pathname.includes('/blocked-') || location.pathname.includes('/foreign-') || location.pathname.includes('/our-') || location.pathname.includes('/about') || location.pathname.includes('/gallery')
                            ? 'text-gray-900'
                            : 'text-gray-700 hover:text-gray-900'
                        }`}
                        style={{
                          backgroundColor: (isActive(item.href) || location.pathname.includes('/services') || location.pathname.includes('/urgent-care') || location.pathname.includes('/dog-') || location.pathname.includes('/cat-') || location.pathname.includes('/pet-') || location.pathname.includes('/dental-') || location.pathname.includes('/ultrasound-') || location.pathname.includes('/veterinary-') || location.pathname.includes('/digital-') || location.pathname.includes('/preventive-') || location.pathname.includes('/blocked-') || location.pathname.includes('/foreign-') || location.pathname.includes('/our-') || location.pathname.includes('/about') || location.pathname.includes('/gallery')) ? '#e6f7fb' : undefined,
                          color: (isActive(item.href) || location.pathname.includes('/services') || location.pathname.includes('/urgent-care') || location.pathname.includes('/dog-') || location.pathname.includes('/cat-') || location.pathname.includes('/pet-') || location.pathname.includes('/dental-') || location.pathname.includes('/ultrasound-') || location.pathname.includes('/veterinary-') || location.pathname.includes('/digital-') || location.pathname.includes('/preventive-') || location.pathname.includes('/blocked-') || location.pathname.includes('/foreign-') || location.pathname.includes('/our-') || location.pathname.includes('/about') || location.pathname.includes('/gallery')) ? '#29add3' : undefined
                        }}
                      >
                        {item.name}
                      </Link>
                      
                      {/* Mobile Dropdown Items */}
                      <div className="ml-4 mt-2 space-y-2">
                        {item.dropdown.map((dropdownItem, index) => (
                          <div key={index}>
                            {dropdownItem.submenu ? (
                              <div>
                                <div className="px-3 py-1 text-sm font-medium text-gray-600 bg-gray-50 rounded">
                                  {dropdownItem.name}
                                </div>
                                <div className="ml-4 mt-1 space-y-1">
                                  {dropdownItem.submenu.map((subItem, subIndex) => (
                                    <Link
                                      key={subIndex}
                                      to={subItem.href}
                                      onClick={() => setIsMenuOpen(false)}
                                      className="block px-3 py-1 text-sm text-gray-700 hover:text-blue-600 rounded transition-colors duration-200"
                                    >
                                      {subItem.name}
                                    </Link>
                                  ))}
                                </div>
                              </div>
                            ) : dropdownItem.action === 'logout' ? (
                              <button
                                onClick={() => {
                                  logout();
                                  setIsMenuOpen(false);
                                }}
                                className={`block w-full text-left px-3 py-2 text-sm text-gray-700 hover:text-red-600 rounded transition-colors duration-200 ${dropdownItem.className || ''}`}
                              >
                                {dropdownItem.name}
                              </button>
                            ) : (
                              <Link
                                to={dropdownItem.href}
                                onClick={() => setIsMenuOpen(false)}
                                className="block px-3 py-2 text-sm text-gray-700 hover:text-blue-600 rounded transition-colors duration-200"
                              >
                                {dropdownItem.name}
                              </Link>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <Link
                      to={item.href}
                      onClick={() => setIsMenuOpen(false)}
                      className={`block px-3 py-2 text-base font-medium rounded-lg transition-all duration-200 ${
                        isActive(item.href)
                          ? 'text-gray-900'
                          : 'text-gray-700 hover:text-gray-900'
                      }`}
                      style={{
                        backgroundColor: isActive(item.href) ? '#e6f7fb' : undefined,
                        color: isActive(item.href) ? '#29add3' : undefined
                      }}
                      onMouseEnter={(e) => {
                        if (!isActive(item.href)) {
                          e.target.style.color = '#29add3';
                          e.target.style.backgroundColor = '#f9fafb';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isActive(item.href)) {
                          e.target.style.color = '#374151';
                          e.target.style.backgroundColor = 'transparent';
                        }
                      }}
                    >
                      {item.name}
                    </Link>
                  )}
                </div>
              );
            })}
            <Link
              to="/urgent-care"
              onClick={() => setIsMenuOpen(false)}
              className="block w-full text-center text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200"
              style={{ backgroundColor: '#29add3' }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#2196c7'}
              onMouseLeave={(e) => e.target.style.backgroundColor = '#29add3'}
            >
              Urgent Care
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;