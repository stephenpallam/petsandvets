import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Phone, Clock, MapPin, ChevronDown, ChevronUp, ArrowRight } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [openMobileSubmenu, setOpenMobileSubmenu] = useState(null); // New state for mobile submenu
  const [businessInfo, setBusinessInfo] = useState(null);
  const [currentHours, setCurrentHours] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAdmin, logout } = useAuth();

  // Handle logout with redirect to home page
  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Toggle mobile submenu
  const toggleMobileSubmenu = (itemName) => {
    setOpenMobileSubmenu(openMobileSubmenu === itemName ? null : itemName);
  };

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

  // Function to get current time in business timezone
  const getCurrentBusinessTime = () => {
    if (!businessInfo?.timezone) {
      return new Date(); // Fallback to local time if timezone not available
    }
    
    try {
      // Create a date in the business timezone
      const now = new Date();
      const businessTime = new Date(now.toLocaleString("en-US", {timeZone: businessInfo.timezone}));
      return businessTime;
    } catch (error) {
      console.error('Error getting business time:', error);
      return new Date(); // Fallback to local time
    }
  };

  // Function to determine urgent care status with Opening Soon/Closing Soon
  const getUrgentCareStatus = () => {
    if (!currentHours || !currentHours.urgent_care) {
      return "Closed";
    }

    const urgentCareHours = currentHours.urgent_care;
    
    // Check if urgent care is closed today
    if (!urgentCareHours.is_open || !urgentCareHours.open_time || !urgentCareHours.close_time) {
      return "Closed";
    }

    const businessTime = getCurrentBusinessTime();
    const currentMinutes = businessTime.getHours() * 60 + businessTime.getMinutes();
    
    try {
      const openMinutes = parseTimeToMinutes(urgentCareHours.open_time);
      const closeMinutes = parseTimeToMinutes(urgentCareHours.close_time);
      
      // Check if currently open
      if (currentMinutes >= openMinutes && currentMinutes < closeMinutes) {
        // Check if closing soon (within 60 minutes)
        if (closeMinutes - currentMinutes <= 60) {
          return "Closing Soon";
        }
        return "Open";
      }
      
      // Check if opening soon (within 60 minutes)
      if (currentMinutes < openMinutes && openMinutes - currentMinutes <= 60) {
        return "Opening Soon";
      }
      
      return "Closed";
    } catch (error) {
      console.error('Error parsing urgent care hours:', error);
      return "Closed";
    }
  };

  // Function to determine general practice status with Opening Soon/Closing Soon
  const getGeneralPracticeStatus = () => {
    if (!currentHours || !currentHours.general_practice) {
      return "Closed";
    }

    const gpHours = currentHours.general_practice;
    
    // Check if general practice is closed today
    if (!gpHours.is_open || !gpHours.open_time || !gpHours.close_time) {
      return "Closed";
    }

    const businessTime = getCurrentBusinessTime();
    const currentMinutes = businessTime.getHours() * 60 + businessTime.getMinutes();
    
    try {
      const openMinutes = parseTimeToMinutes(gpHours.open_time);
      const closeMinutes = parseTimeToMinutes(gpHours.close_time);
      
      // Check if currently open
      if (currentMinutes >= openMinutes && currentMinutes < closeMinutes) {
        // Check if closing soon (within 60 minutes)
        if (closeMinutes - currentMinutes <= 60) {
          return "Closing Soon";
        }
        return "Open";
      }
      
      // Check if opening soon (within 60 minutes)
      if (currentMinutes < openMinutes && openMinutes - currentMinutes <= 60) {
        return "Opening Soon";
      }
      
      return "Closed";
    } catch (error) {
      console.error('Error parsing general practice hours:', error);
      return "Closed";
    }
  };

  // Helper function to parse time strings like "09:00" or "14:30" to total minutes
  const parseTimeToMinutes = (timeString) => {
    if (!timeString) return 0;
    
    const [hours, minutes] = timeString.split(':').map(Number);
    return hours * 60 + (minutes || 0);
  };

  // Function to get status styling based on status text
  const getStatusStyling = (status) => {
    // Simple white text styling that inherits font size and weight from parent
    return {
      color: 'white'
    };
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
      // Only show Home button if user is not logged in
      ...(user ? [] : [{ name: 'Home', href: '/' }]),
      { 
        name: 'About',
        dropdown: [
          { name: 'Our Mission', href: '/our-mission' },
          { name: 'Our Values', href: '/our-core-values' },
          { name: 'Our Team', href: '/our-team' },
          { name: 'Our Facility', href: '/gallery' },
          { name: 'Review Us', href: '/review-us' }
        ]
      },
      // Only show Urgent Care button if user is not logged in
      ...(user ? [] : [{ name: 'Urgent Care', href: '/urgent-care' }]),
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
        name: 'Patient',
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

    // Add role-based menu only if user is logged in
    if (user) {
      const roleDropdown = [];
      
      // Admin gets access to all management features
      if (user.role === 'admin') {
        roleDropdown.push(
          { name: 'Urgent Care Appointments', href: '/urgent-care-appointments' },
          { name: 'Configure Hours', href: '/configure-hours' },
          { name: 'Timesheet Management', href: '/timesheet-management' },
          { name: 'Timesheet Configuration', href: '/timesheet-configuration' },
          { name: 'Employee Management', href: '/employee-management' },
          { name: 'Customer Management', href: '/customer-management' },
          { name: 'Holiday Management', href: '/holiday-management' },
          { name: 'CMS Settings', href: '/cms-settings' },
          { name: 'Scheduling Calendar', href: '/scheduling-calendar' },
          { name: 'Reviews', href: '/reviews' },
          { name: 'Business Info', href: '/business-info' },
          { name: 'Email Configuration', href: '/email-configuration' },
          { name: 'SMS Configuration', href: '/sms-configuration' },
          { name: 'Photo Management', href: '/photo-management' },
          { name: 'User Management', href: '/user-management' }
        );
      }
      
      // Manager gets access to content management and appointments
      if (user.role === 'manager' || user.role === 'admin') {
        if (user.role === 'manager') {
          roleDropdown.push(
            { name: 'Clock In/Out', href: '/timesheet-clock' },
            { name: 'Urgent Care Appointments', href: '/urgent-care-appointments' },
            { name: 'Configure Hours', href: '/configure-hours' },
            { name: 'Timesheet Management', href: '/timesheet-management' },
            { name: 'Timesheet Configuration', href: '/timesheet-configuration' },
            { name: 'Employee Management', href: '/employee-management' },
            { name: 'Customer Management', href: '/customer-management' },
            { name: 'Holiday Management', href: '/holiday-management' },
            { name: 'Scheduling Calendar', href: '/scheduling-calendar' },
            { name: 'Reviews', href: '/reviews' },
            { name: 'Business Info', href: '/business-info' },
            { name: 'Email Configuration', href: '/email-configuration' },
            { name: 'Photo Management', href: '/photo-management' },
            { name: 'User Management', href: '/user-management' }
          );
        }
        roleDropdown.push({ name: 'Register User', href: '/register' });
      }
      
      // Technician gets limited access
      if (user.role === 'technician') {
        roleDropdown.push(
          { name: 'Clock In/Out', href: '/timesheet-clock' },
          { name: 'Urgent Care Appointments', href: '/urgent-care-appointments' },
          { name: 'Customer Management', href: '/customer-management' }
        );
      }
      
      // Regular user gets basic access
      if (user.role === 'user') {
        roleDropdown.push(
          { name: 'Clock In/Out', href: '/timesheet-clock' },
          { name: 'Customer Management', href: '/customer-management' }
        );
      }
      
      // All logged-in users can access basic registration (this will be controlled by RegisterPage logic)
      if (user.role === 'user' || user.role === 'technician' || user.role === 'manager' || user.role === 'admin') {
        // Only add register if not already added for managers/admins
        const hasRegister = roleDropdown.some(item => item.href === '/register');
        if (!hasRegister) {
          roleDropdown.push({ name: 'Register User', href: '/register' });
        }
      }
      
      // Always add logout for logged-in users
      if (roleDropdown.length > 0) {
        roleDropdown.push({ name: 'Logout', action: 'logout', className: 'border-t border-gray-200 pt-2' });
      }
      
      // Determine navigation label based on user role
      let navigationLabel;
      switch (user.role) {
        case 'admin':
          navigationLabel = 'Admin';
          break;
        case 'manager':
          navigationLabel = 'Manager';
          break;
        case 'technician':
          navigationLabel = 'Technician';
          break;
        default:
          navigationLabel = 'User';
          break;
      }
      
      // Only show role dropdown if there are items
      if (roleDropdown.length > 0) {
        baseNavigation.push({
          name: navigationLabel,
          dropdown: roleDropdown
        });
      }
    }

    // Add AI menu for managers and admins
    if (user && (user.role === 'manager' || user.role === 'admin')) {
      baseNavigation.push({
        name: 'AI',
        dropdown: [
          { name: 'AI Agents Dashboard', href: '/ai-agents-dashboard' },
          { name: 'Ready to Publish', href: '/ai-ready-to-publish' },
          { name: 'Published', href: '/ai-published-posts' },
          { name: 'In Review', href: '/ai-in-review' },
          { name: 'AI Settings', href: '/ai-settings' },
          { name: 'AI Costs', href: '/ai-costs' }
        ]
      });
    }

    // Add Contact Us
    baseNavigation.push({
      name: 'Contact',
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
      case 'Home':
        return location.pathname === '/';

      case 'Urgent Care':
        return location.pathname === '/urgent-care';
        
      case 'Services':
        return location.pathname.includes('/services') || 
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
      
      case 'About':
        return (location.pathname.includes('/our-') && !location.pathname.includes('/our-hours')) || 
               location.pathname.includes('/about') || 
               location.pathname.includes('/gallery') ||
               location.pathname.includes('/review-us');
      
      case 'Contact':
        return location.pathname.includes('/reach-us') || 
               location.pathname.includes('/message-us') || 
               location.pathname.includes('/contact') ||
               location.pathname.includes('/our-hours');
      
      case 'Patient':
        return location.pathname.includes('/forms') || 
               location.pathname.includes('/your-first-visit') ||
               location.pathname.includes('/pet-insurance-payments');
      
      case 'Admin':
      case 'Manager':
      case 'Technician':
      case 'User':
        return location.pathname.includes('/urgent-care-appointments') ||
               location.pathname.includes('/configure-hours') ||
               location.pathname.includes('/reviews') ||
               location.pathname.includes('/business-info') ||
               location.pathname.includes('/photo-management') ||
               location.pathname.includes('/user-management') ||
               location.pathname.includes('/register');  // Updated from /register-user
      
      case 'AI':
        return location.pathname.startsWith('/ai-');

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
          <div className="hidden lg:flex justify-between items-center text-sm">
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
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4" />
                <span>General Practice:</span>
                <span style={getStatusStyling(getGeneralPracticeStatus())}>
                  {getGeneralPracticeStatus()}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4" />
                <span>Urgent Care:</span>
                <span style={getStatusStyling(getUrgentCareStatus())}>
                  {getUrgentCareStatus()}
                </span>
              </div>
            </div>
          </div>

          {/* Mobile Layout */}
          <div className="lg:hidden">
            {/* Row 1: Phone (left) and GP Status (right) */}
            <div className="flex justify-between items-center text-xs mb-0.5">
              <div className="flex items-center space-x-1">
                <Phone className="h-3 w-3" />
                <span>{businessInfo?.phone || "(703) 957-3297"}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Clock className="h-3 w-3" />
                <span>General Practice:</span>
                <span style={getStatusStyling(getGeneralPracticeStatus())}>
                  {getGeneralPracticeStatus()}
                </span>
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
                <span>Urgent Care:</span>
                <span style={getStatusStyling(getUrgentCareStatus())}>
                  {getUrgentCareStatus()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-3">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="rounded-lg p-1.5" style={{ backgroundColor: '#29add3' }}>
              <div className="w-7 h-7 bg-white rounded flex items-center justify-center">
                <div className="relative">
                  {/* Hospital plus sign */}
                  <div 
                    className="absolute" 
                    style={{
                      width: '14px',
                      height: '3px',
                      backgroundColor: '#29add3',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)'
                    }}
                  ></div>
                  <div 
                    className="absolute" 
                    style={{
                      width: '3px',
                      height: '14px',
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
              <h1 className="text-lg font-bold text-gray-900">Pets & Vets</h1>
              <p className="text-xs text-gray-600">Animal Hospital & Urgent Care</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex space-x-4">
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
                        className={`flex items-center px-2 py-1 text-sm font-medium rounded-lg transition-all duration-200 ${
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
                                        className={`block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors duration-200 ${subIndex < dropdownItem.submenu.length - 1 ? 'border-b border-gray-100' : ''}`}
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
                                    handleLogout();
                                    setActiveDropdown(null);
                                  }}
                                  className={`block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-red-600 transition-colors duration-200 ${dropdownItem.className || ''}`}
                                >
                                  {dropdownItem.name}
                                </button>
                              ) : (
                                <Link
                                  to={dropdownItem.href}
                                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors duration-200"
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
                      className={`flex items-center px-2 py-1 text-sm font-medium rounded-lg transition-all duration-200 ${
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
                    </Link>
                  )}
                </div>
              );
            })}
          </nav>

          {/* CTA Button */}
          <div className="hidden lg:flex items-center space-x-4">
            <Link
              to="/urgent-care-booking"
              className="inline-flex items-center text-white px-6 py-2 rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg"
              style={{ 
                backgroundColor: '#29add3'
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#2196c7'}
              onMouseLeave={(e) => e.target.style.backgroundColor = '#29add3'}
            >
              Check In Online
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => {
              setIsMenuOpen(!isMenuOpen);
              // Reset mobile submenu state when closing menu
              if (isMenuOpen) {
                setOpenMobileSubmenu(null);
              }
            }}
            className="lg:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors duration-200"
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="lg:hidden bg-white border-t border-gray-200 shadow-lg">
          <div className="px-4 py-3 space-y-2 max-h-96 overflow-y-auto">
            {navigation.map((item) => {
              // Hide Home link when on home page
              if (item.name === 'Home' && location.pathname === '/') {
                return null;
              }
              
              return (
                <div key={item.name}>
                  {item.dropdown ? (
                    <div>
                      <button
                        onClick={() => toggleMobileSubmenu(item.name)}
                        className={`flex items-center justify-between w-full px-3 py-2 text-base font-medium rounded-lg transition-all duration-200 ${
                          isNavItemActive(item.name) || openMobileSubmenu === item.name
                            ? 'text-gray-900'
                            : 'text-gray-700 hover:text-gray-900'
                        }`}
                        style={{
                          backgroundColor: (isNavItemActive(item.name) || openMobileSubmenu === item.name) ? '#e6f7fb' : undefined,
                          color: (isNavItemActive(item.name) || openMobileSubmenu === item.name) ? '#29add3' : undefined
                        }}
                      >
                        <span>{item.name}</span>
                        {openMobileSubmenu === item.name ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </button>
                      
                      {/* Mobile Dropdown Items with Slide Animation */}
                      <div 
                        className={`overflow-hidden transition-all duration-300 ease-in-out ${
                          openMobileSubmenu === item.name ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                        }`}
                      >
                        <div className="ml-4 mt-2 space-y-2 pb-2">
                          {item.dropdown.map((dropdownItem, index) => (
                            <div key={index}>
                              {dropdownItem.submenu ? (
                                <div>
                                  <div className="px-3 py-2 text-sm font-medium text-gray-600 bg-gray-50 rounded-md">
                                    {dropdownItem.name}
                                  </div>
                                  <div className="ml-4 mt-1 space-y-1">
                                    {dropdownItem.submenu.map((subItem, subIndex) => (
                                      <Link
                                        key={subIndex}
                                        to={subItem.href}
                                        onClick={() => {
                                          setIsMenuOpen(false);
                                          setOpenMobileSubmenu(null);
                                        }}
                                        className="block px-3 py-2 text-sm text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-all duration-200"
                                        style={{
                                          backgroundColor: location.pathname === subItem.href ? '#29add3' : undefined,
                                          color: location.pathname === subItem.href ? 'white' : undefined
                                        }}
                                      >
                                        {subItem.name}
                                      </Link>
                                    ))}
                                  </div>
                                </div>
                              ) : dropdownItem.action === 'logout' ? (
                                <button
                                  onClick={() => {
                                    handleLogout();
                                    setIsMenuOpen(false);
                                    setOpenMobileSubmenu(null);
                                  }}
                                  className={`block w-full text-left px-3 py-2 text-sm text-gray-700 hover:text-red-600 rounded-md transition-colors duration-200 ${dropdownItem.className || ''}`}
                                >
                                  {dropdownItem.name}
                                </button>
                              ) : (
                                <Link
                                  to={dropdownItem.href}
                                  onClick={() => {
                                    setIsMenuOpen(false);
                                    setOpenMobileSubmenu(null);
                                  }}
                                  className="block px-3 py-2 text-sm text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-all duration-200"
                                  style={{
                                    backgroundColor: location.pathname === dropdownItem.href ? '#29add3' : undefined,
                                    color: location.pathname === dropdownItem.href ? 'white' : undefined
                                  }}
                                >
                                  {dropdownItem.name}
                                </Link>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <Link
                      to={item.href}
                      onClick={() => {
                        setIsMenuOpen(false);
                        setOpenMobileSubmenu(null);
                      }}
                      className={`block px-3 py-2 text-base font-medium rounded-lg transition-all duration-200 ${
                        isNavItemActive(item.name)
                          ? 'text-gray-900'
                          : 'text-gray-700 hover:text-gray-900'
                      }`}
                      style={{
                        backgroundColor: isNavItemActive(item.name) ? '#e6f7fb' : undefined,
                        color: isNavItemActive(item.name) ? '#29add3' : undefined
                      }}
                      onMouseEnter={(e) => {
                        if (!isNavItemActive(item.name)) {
                          e.target.style.color = '#29add3';
                          e.target.style.backgroundColor = '#f9fafb';
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
                    </Link>
                  )}
                </div>
              );
            })}
            <Link
              to="/urgent-care-booking"
              onClick={() => setIsMenuOpen(false)}
              className="inline-flex items-center justify-center w-full text-center text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200"
              style={{ backgroundColor: '#29add3' }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#2196c7'}
              onMouseLeave={(e) => e.target.style.backgroundColor = '#29add3'}
            >
              Check In Online
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;