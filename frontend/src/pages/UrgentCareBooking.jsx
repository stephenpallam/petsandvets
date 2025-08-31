import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Calendar, 
  Clock, 
  User, 
  Mail, 
  Phone, 
  Heart, 
  CheckCircle, 
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Stethoscope,
  Check
} from 'lucide-react';
import { hospitalInfo } from '../mock';
import { useAuth } from '../contexts/AuthContext';

const UrgentCareBooking = () => {
  const [currentTab, setCurrentTab] = useState(0);
  const [completedTabs, setCompletedTabs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [timeSlots, setTimeSlots] = useState([]);
  const [availableToday, setAvailableToday] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });
  const { user } = useAuth(); // Get authentication context

  const [formData, setFormData] = useState({
    appointment_time: '',
    owner_first_name: '',
    owner_last_name: '',
    email: '',
    phone: '',
    pet_name: '',
    pet_type: '',
    reason_for_visit: '',
    primary_vet_hospital: '',
    how_heard_about_us: ''
  });

  const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || import.meta.env.REACT_APP_BACKEND_URL;
  const primaryColor = '#29add3';

  const tabs = [
    { id: 0, title: 'Select Time', icon: Clock },
    { id: 1, title: 'Client Details', icon: User },
    { id: 2, title: 'Pet Details', icon: Heart },
    { id: 3, title: 'Visit Reason', icon: Stethoscope },
    { id: 4, title: 'Other Details', icon: CheckCircle },
    { id: 5, title: 'Review', icon: AlertCircle },
    { id: 6, title: 'Confirmation', icon: Check }
  ];

  const reasonOptions = [
    'Sick / Illness',
    'Injury',
    'Joint Pain / Limping',
    'Skin / Ears / Itching / Allergy',
    'Coughing / Congestion / Nasal Discharge',
    'Difficulty Breathing',
    'Urinary Problems',
    'Vomiting / Diarrhea / Gastrointestinal',
    'Not Eating',
    'Eye Issues',
    'Poison / Ingestion',
    'End of Life Care'
  ];

  const howHeardOptions = [
    'Google Search',
    'Social Media',
    'Friend/Family Referral',
    'Veterinarian Referral',
    'Drive By/Location',
    'Online Reviews',
    'Pet Insurance',
    'Emergency Situation',
    'Other'
  ];

  useEffect(() => {
    fetchTimeSlots();
  }, []);

  const fetchTimeSlots = async () => {
    setLoading(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      const response = await fetch(`${API_BASE_URL}/api/urgent-care-time-slots/${today}`);
      const data = await response.json();
      
      if (data.available) {
        setTimeSlots(data.slots);
        setAvailableToday(true);
      } else {
        setAvailableToday(false);
        setMessage({ type: 'error', text: data.message });
      }
    } catch (error) {
      console.error('Error fetching time slots:', error);
      setMessage({ type: 'error', text: 'Unable to load available times' });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setMessage({ type: '', text: '' });
  };

  const validateCurrentTab = () => {
    switch (currentTab) {
      case 0:
        return formData.appointment_time !== '';
      case 1:
        return formData.owner_first_name && formData.owner_last_name && 
               formData.email && formData.phone &&
               /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email) &&
               /^\d{10,}$/.test(formData.phone.replace(/\D/g, ''));
      case 2:
        return formData.pet_name && formData.pet_type;
      case 3:
        return formData.reason_for_visit;
      case 4:
        return true; // Primary vet hospital and how heard about us are now optional
      default:
        return false;
    }
  };

  const goToNextTab = () => {
    if (validateCurrentTab()) {
      if (!completedTabs.includes(currentTab)) {
        setCompletedTabs([...completedTabs, currentTab]);
      }
      setCurrentTab(currentTab + 1);
      setMessage({ type: '', text: '' });
      // Scroll to top when advancing to next tab
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setMessage({ type: 'error', text: 'Please complete all required fields' });
    }
  };

  const goToTab = (tabIndex) => {
    // Can only go to completed tabs or the next available tab
    if (completedTabs.includes(tabIndex) || tabIndex === Math.min(...completedTabs) + 1 || tabIndex === 0) {
      setCurrentTab(tabIndex);
      setMessage({ type: '', text: '' });
      // Scroll to top when changing tabs
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const isTabEnabled = (tabIndex) => {
    return tabIndex === 0 || completedTabs.includes(tabIndex - 1);
  };

  const isTabCompleted = (tabIndex) => {
    return completedTabs.includes(tabIndex);
  };

  const prevStep = () => {
    if (currentTab > 0) {
      setCurrentTab(currentTab - 1);
      setMessage({ type: '', text: '' });
      // Scroll to top when going back
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const nextStep = () => {
    goToNextTab();
  };

  const validateStep = () => {
    return validateCurrentTab();
  };

  const formatTime = (timeString) => {
    const [hours, minutes] = timeString.split(':');
    const hour12 = parseInt(hours) % 12 || 12;
    const ampm = parseInt(hours) >= 12 ? 'PM' : 'AM';
    return `${hour12}:${minutes} ${ampm}`;
  };

  const formatDateAndDay = () => {
    const today = new Date();
    const options = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return today.toLocaleDateString('en-US', options);
  };

  const formatPhoneNumber = (phone) => {
    // Remove all non-digits
    const cleaned = phone.replace(/\D/g, '');
    // Format as XXX-XXX-XXXX
    if (cleaned.length === 10) {
      return cleaned.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3');
    }
    return phone; // Return original if not 10 digits
  };

  const capitalizeWords = (str) => {
    return str.replace(/\b\w/g, l => l.toUpperCase());
  };

  const submitAppointment = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/urgent-care-appointments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setCurrentTab(6); // Success tab
        setCompletedTabs([...completedTabs, 5]);
        setMessage({ type: 'success', text: 'Appointment booked successfully!' });
      } else {
        const errorData = await response.json();
        setMessage({ type: 'error', text: errorData.detail || 'Failed to book appointment' });
      }
    } catch (error) {
      console.error('Error submitting appointment:', error);
      setMessage({ type: 'error', text: 'Unable to book appointment. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="bg-white rounded-xl shadow-lg mb-6">
          <div className="px-6 py-4 bg-gray-100 rounded-t-xl border-b border-gray-200">
            <h1 className="text-lg font-bold text-gray-900">Urgent Care - Online Check In</h1>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="border-b border-gray-200">
            <nav className="flex">
              {tabs.map((tab) => {
                const IconComponent = tab.icon;
                const isActive = currentTab === tab.id;
                const isCompleted = isTabCompleted(tab.id);
                const isEnabled = isTabEnabled(tab.id);
                
                return (
                  <button
                    key={tab.id}
                    onClick={() => goToTab(tab.id)}
                    disabled={!isEnabled}
                    className={`flex-1 flex items-center justify-center px-4 py-4 text-sm font-medium border-b-2 transition-colors ${
                      isActive
                        ? ''
                        : isCompleted
                        ? ''
                        : isEnabled
                        ? 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                        : 'border-transparent text-gray-300 cursor-not-allowed'
                    }`}
                    style={
                      isActive
                        ? { 
                            borderColor: primaryColor, 
                            color: primaryColor, 
                            backgroundColor: '#e6f7fb' 
                          }
                        : isCompleted
                        ? { 
                            borderColor: primaryColor, 
                            color: primaryColor, 
                            backgroundColor: '#e6f7fb' 
                          }
                        : {}
                    }
                    onMouseEnter={(e) => {
                      if (isCompleted && !isActive) {
                        e.target.style.backgroundColor = '#d4f4f9';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (isCompleted && !isActive) {
                        e.target.style.backgroundColor = '#e6f7fb';
                      }
                    }}
                  >
                    <div className="flex items-center">
                      {isCompleted ? (
                        <Check className="h-5 w-5 mr-2" />
                      ) : (
                        <IconComponent className="h-5 w-5 mr-2" />
                      )}
                      <span className="hidden sm:inline">{tab.title}</span>
                    </div>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6 sm:p-8">
            {/* Messages */}
            {message.text && (
              <div className={`mb-6 p-4 rounded-lg flex items-center ${
                message.type === 'success' ? 'border' : 'bg-red-50 border border-red-200'
              }`}
              style={message.type === 'success' ? {
                backgroundColor: '#e6f7fb',
                borderColor: '#29add3'
              } : {}}
              >
                <AlertCircle className={`h-5 w-5 mr-3 ${
                  message.type === 'success' ? '' : 'text-red-600'
                }`} 
                style={message.type === 'success' ? { color: primaryColor } : {}}
                />
                <p className={`${
                  message.type === 'success' ? '' : 'text-red-800'
                }`}
                style={message.type === 'success' ? { color: '#1e7a8c' } : {}}
                >
                  {message.text}
                </p>
              </div>
            )}

            {/* Tab 0: Time Selection */}
            {currentTab === 0 && (
              <div>
                <div className="mb-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">Select an Arrival Time for Today</h2>
                  <p className="text-gray-600">Choose your preferred appointment time</p>
                </div>

                {loading ? (
                  <div className="text-center py-8">
                    <div 
                      className="animate-spin rounded-full h-8 w-8 border-b-2 mx-auto"
                      style={{ borderColor: primaryColor }}
                    ></div>
                    <p className="mt-2 text-gray-600">Loading available times...</p>
                  </div>
                ) : !availableToday ? (
                  <div className="text-center py-8">
                    <Clock className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-lg text-gray-900 mb-2">Urgent Care is Closed Today</p>
                    <p className="text-gray-600">Please check back during our operating hours.</p>
                  </div>
                ) : timeSlots.length === 0 ? (
                  <div className="text-center py-8">
                    <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-lg text-gray-900 mb-2">No Available Times</p>
                    <p className="text-gray-600">All appointment slots for today are booked.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {timeSlots.map((slot) => (
                      <button
                        key={slot.value}
                        onClick={() => handleInputChange('appointment_time', slot.value)}
                        className={`p-4 text-center rounded-lg border-2 transition-all ${
                          formData.appointment_time === slot.value
                            ? ''
                            : 'border-gray-200 bg-white hover:border-gray-300 text-gray-900'
                        }`}
                        style={formData.appointment_time === slot.value ? {
                          borderColor: primaryColor,
                          backgroundColor: '#e6f7fb',
                          color: primaryColor
                        } : {}}
                      >
                        <Clock className="h-5 w-5 mx-auto mb-2" />
                        <div className="font-medium">{formatTime(slot.time)}</div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Tab 1: Owner Information */}
            {currentTab === 1 && (
              <div>
                <div className="mb-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">Pet Owner Information</h2>
                  <p className="text-gray-600">Please provide your contact information</p>
                </div>
                
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        First Name *
                      </label>
                      <input
                        type="text"
                        value={formData.owner_first_name}
                        onChange={(e) => handleInputChange('owner_first_name', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                        style={{ '--tw-ring-color': primaryColor }}
                        onFocus={(e) => {
                          e.target.style.borderColor = primaryColor;
                          e.target.style.boxShadow = `0 0 0 2px rgba(41, 173, 211, 0.2)`;
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = '#d1d5db';
                          e.target.style.boxShadow = 'none';
                        }}
                        placeholder="Enter your first name"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Last Name *
                      </label>
                      <input
                        type="text"
                        value={formData.owner_last_name}
                        onChange={(e) => handleInputChange('owner_last_name', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                        style={{ '--tw-ring-color': primaryColor }}
                        onFocus={(e) => {
                          e.target.style.borderColor = primaryColor;
                          e.target.style.boxShadow = `0 0 0 2px rgba(41, 173, 211, 0.2)`;
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = '#d1d5db';
                          e.target.style.boxShadow = 'none';
                        }}
                        placeholder="Enter your last name"
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                        style={{ '--tw-ring-color': primaryColor }}
                        onFocus={(e) => {
                          e.target.style.borderColor = primaryColor;
                          e.target.style.boxShadow = `0 0 0 2px rgba(41, 173, 211, 0.2)`;
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = '#d1d5db';
                          e.target.style.boxShadow = 'none';
                        }}
                        placeholder="Enter your email address"
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number *
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                        style={{ '--tw-ring-color': primaryColor }}
                        onFocus={(e) => {
                          e.target.style.borderColor = primaryColor;
                          e.target.style.boxShadow = `0 0 0 2px rgba(41, 173, 211, 0.2)`;
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = '#d1d5db';
                          e.target.style.boxShadow = 'none';
                        }}
                        placeholder="Enter your phone number"
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 2: Pet Information */}
            {currentTab === 2 && (
              <div>
                <div className="mb-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">Pet Information</h2>
                  <p className="text-gray-600">Tell us about your pet</p>
                </div>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Pet Name *
                    </label>
                    <input
                      type="text"
                      value={formData.pet_name}
                      onChange={(e) => handleInputChange('pet_name', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                      style={{ '--tw-ring-color': primaryColor }}
                      onFocus={(e) => {
                        e.target.style.borderColor = primaryColor;
                        e.target.style.boxShadow = `0 0 0 2px rgba(41, 173, 211, 0.2)`;
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = '#d1d5db';
                        e.target.style.boxShadow = 'none';
                      }}
                      placeholder="Enter your pet's name"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-4">
                      Pet Type *
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                      <button
                        type="button"
                        onClick={() => handleInputChange('pet_type', 'dog')}
                        className={`p-6 rounded-lg border-2 transition-all text-center ${
                          formData.pet_type === 'dog'
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="text-4xl mb-2">🐕</div>
                        <div className="font-semibold">Dog</div>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleInputChange('pet_type', 'cat')}
                        className={`p-6 rounded-lg border-2 transition-all text-center ${
                          formData.pet_type === 'cat'
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="text-4xl mb-2">🐱</div>
                        <div className="font-semibold">Cat</div>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 3: Reason for Visit */}
            {currentTab === 3 && (
              <div>
                <div className="mb-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">Reason for Visit</h2>
                  <p className="text-gray-600">What brings your pet in today?</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-4">
                    Select the reason for your visit *
                  </label>
                  <select
                    value={formData.reason_for_visit}
                    onChange={(e) => handleInputChange('reason_for_visit', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                    style={{ '--tw-ring-color': primaryColor }}
                    onFocus={(e) => {
                      e.target.style.borderColor = primaryColor;
                      e.target.style.boxShadow = `0 0 0 2px rgba(41, 173, 211, 0.2)`;
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#d1d5db';
                      e.target.style.boxShadow = 'none';
                    }}
                    required
                  >
                    <option value="">Select reason for visit</option>
                    {reasonOptions.map((reason, index) => (
                      <option key={index} value={reason}>
                        {reason}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* Tab 4: Additional Information */}
            {currentTab === 4 && (
              <div>
                <div className="mb-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">Additional Information</h2>
                  <p className="text-gray-600">Optional information to help us serve you better</p>
                </div>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Primary Veterinary Hospital Name (Optional)
                    </label>
                    <input
                      type="text"
                      value={formData.primary_vet_hospital}
                      onChange={(e) => handleInputChange('primary_vet_hospital', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                      style={{ '--tw-ring-color': primaryColor }}
                      onFocus={(e) => {
                        e.target.style.borderColor = primaryColor;
                        e.target.style.boxShadow = `0 0 0 2px rgba(41, 173, 211, 0.2)`;
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = '#d1d5db';
                        e.target.style.boxShadow = 'none';
                      }}
                      placeholder="Enter your regular vet's name"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      How did you hear about us? (Optional)
                    </label>
                    <select
                      value={formData.how_heard_about_us}
                      onChange={(e) => handleInputChange('how_heard_about_us', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                      style={{ '--tw-ring-color': primaryColor }}
                      onFocus={(e) => {
                        e.target.style.borderColor = primaryColor;
                        e.target.style.boxShadow = `0 0 0 2px rgba(41, 173, 211, 0.2)`;
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = '#d1d5db';
                        e.target.style.boxShadow = 'none';
                      }}
                    >
                      <option value="">Please select</option>
                      {howHeardOptions.map((option, index) => (
                        <option key={index} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 5: Review & Confirm */}
            {currentTab === 5 && (
              <div>
                <div className="mb-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">Review & Confirm Your Appointment</h2>
                  <p className="text-gray-600">Please review all details before confirming your appointment</p>
                </div>

                <div className="space-y-6">
                  {/* Appointment Time */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-blue-900 mb-2">Appointment Time</h3>
                        <p className="text-blue-800">
                          <strong>Today</strong> at <strong>{formatTime(formData.appointment_time.split('T')[1])}</strong>
                        </p>
                      </div>
                      <button
                        onClick={() => goToTab(0)}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        Change Time
                      </button>
                    </div>
                  </div>

                  {/* Pet Owner Information */}
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">Pet Owner Information</h3>
                      <button
                        onClick={() => goToTab(1)}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        Edit Info
                      </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">Name</label>
                        <p className="text-gray-900">{formData.owner_first_name} {formData.owner_last_name}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">Phone</label>
                        <p className="text-gray-900">{formData.phone}</p>
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-500 mb-1">Email</label>
                        <p className="text-gray-900">{formData.email}</p>
                      </div>
                    </div>
                  </div>

                  {/* Pet Information */}
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">Pet Information</h3>
                      <button
                        onClick={() => goToTab(2)}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        Edit Pet Info
                      </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">Pet Name</label>
                        <p className="text-gray-900">{formData.pet_name}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">Pet Type</label>
                        <p className="text-gray-900 capitalize">{formData.pet_type}</p>
                      </div>
                    </div>
                  </div>

                  {/* Visit Reason */}
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">Reason for Visit</h3>
                      <button
                        onClick={() => goToTab(3)}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        Change Reason
                      </button>
                    </div>
                    <p className="text-gray-900">{formData.reason_for_visit}</p>
                  </div>

                  {/* Additional Information */}
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">Additional Information</h3>
                      <button
                        onClick={() => goToTab(4)}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        Edit Details
                      </button>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">Primary Veterinary Hospital</label>
                        <p className="text-gray-900">{formData.primary_vet_hospital}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">How did you hear about us?</label>
                        <p className="text-gray-900">{formData.how_heard_about_us}</p>
                      </div>
                    </div>
                  </div>

                  {/* Important Notice */}
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                    <div className="flex items-start">
                      <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 mr-3" />
                      <div>
                        <h3 className="text-sm font-semibold text-yellow-800 mb-2">Important Notice</h3>
                        <ul className="text-sm text-yellow-700 space-y-1">
                          <li>• Please arrive 10 minutes before your scheduled appointment</li>
                          <li>• Bring any previous medical records if available</li>
                          <li>• Have your pet secured on a leash or in a carrier</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 6: Success */}
            {currentTab === 6 && (
              <div className="text-center py-8">
                {/* Personalized Message Section */}
                <div className="bg-gray-50 rounded-lg p-6 mb-6">
                  <p className="text-base text-gray-600 leading-relaxed">
                    <span className="font-semibold text-gray-900">
                      {capitalizeWords(formData.owner_first_name)} {capitalizeWords(formData.owner_last_name)}
                    </span>, your urgent care appointment has been successfully booked. 
                    We look forward to caring for <span className="font-semibold text-gray-900">{capitalizeWords(formData.pet_name)}</span>.
                  </p>
                </div>

                {/* Appointment Summary Card */}
                <div className="max-w-3xl mx-auto mb-8">
                  <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                    <div className="text-center mb-4">
                      <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold text-white" style={{ backgroundColor: primaryColor }}>
                        <Clock className="h-4 w-4 mr-1" />
                        Appointment Summary
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center justify-between md:justify-start">
                        <span className="font-medium text-gray-600 mr-3">Client:</span>
                        <span className="font-semibold text-gray-900">
                          {capitalizeWords(formData.owner_first_name)} {capitalizeWords(formData.owner_last_name)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between md:justify-start">
                        <span className="font-medium text-gray-600 mr-3">Date:</span>
                        <span className="font-semibold text-gray-900">{formatDateAndDay()}</span>
                      </div>
                      <div className="flex items-center justify-between md:justify-start">
                        <span className="font-medium text-gray-600 mr-3">Time:</span>
                        <span className="font-semibold text-gray-900">{formatTime(formData.appointment_time.split('T')[1])}</span>
                      </div>
                      <div className="flex items-center justify-between md:justify-start">
                        <span className="font-medium text-gray-600 mr-3">Pet:</span>
                        <span className="font-semibold text-gray-900">
                          {capitalizeWords(formData.pet_name)} ({capitalizeWords(formData.pet_type)})
                        </span>
                      </div>
                      <div className="flex items-center justify-between md:justify-start">
                        <span className="font-medium text-gray-600 mr-3">Phone:</span>
                        <span className="font-semibold text-gray-900">{formatPhoneNumber(formData.phone)}</span>
                      </div>
                      <div className="flex items-center justify-between md:justify-start">
                        <span className="font-medium text-gray-600 mr-3">Email:</span>
                        <span className="font-semibold text-gray-900">{formData.email}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Important Reminders */}
                <div className="max-w-3xl mx-auto mb-8">
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-start">
                      <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 mr-3 flex-shrink-0" />
                      <div className="text-left">
                        <h3 className="text-sm font-semibold text-yellow-800 mb-2">Important Reminders</h3>
                        <ul className="text-xs text-yellow-700 space-y-1">
                          <li>• Please arrive 10 minutes before your scheduled time</li>
                          <li>• Bring any previous medical records if available</li>
                          <li>• Have your pet secured on a leash or in a carrier</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Button */}
                <div className="mb-8">
                  <Link 
                    to="/urgent-care" 
                    className="inline-flex items-center px-6 py-3 text-white font-semibold rounded-lg shadow-sm hover:shadow-md transition-all duration-200"
                    style={{ backgroundColor: primaryColor }}
                  >
                    <Stethoscope className="h-4 w-4 mr-2" />
                    Urgent Care Services
                  </Link>
                </div>

                {/* Contact CTA Section - Styled like Dog Dental Care */}
                <section style={{ 
                  background: `linear-gradient(135deg, ${primaryColor} 0%, #2196c7 100%)`, 
                  paddingTop: '30px', 
                  paddingBottom: '30px',
                  borderRadius: '12px',
                  marginTop: '2rem'
                }}>
                  <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="font-bold text-white mb-6" style={{ fontSize: '1rem' }}>
                      Need to Make Changes to Your Appointment?
                    </h2>
                    <p className="mb-8" style={{ color: 'white', fontSize: '1rem' }}>
                      Please call us if you need to reschedule or have any questions about your upcoming visit
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                      <a
                        href={`tel:${hospitalInfo.phone}`}
                        className="inline-flex items-center justify-center bg-white px-8 py-3 rounded-lg font-semibold transition-colors duration-200"
                        style={{ color: primaryColor }}
                        onMouseEnter={(e) => e.target.style.backgroundColor = '#f9fafb'}
                        onMouseLeave={(e) => e.target.style.backgroundColor = 'white'}
                      >
                        <Phone className="h-4 w-4 mr-2" />
                        Call {hospitalInfo.phone}
                      </a>
                    </div>
                  </div>
                </section>
              </div>
            )}

            {/* Navigation Buttons */}
            {currentTab < 6 && availableToday && timeSlots.length > 0 && (
              <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
                {currentTab > 0 && (
                  <button
                    onClick={prevStep}
                    className="flex items-center px-6 py-3 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Previous
                  </button>
                )}
                
                <div className="ml-auto">
                  {currentTab < 4 ? (
                    <button
                      onClick={nextStep}
                      disabled={!validateStep()}
                      className="flex items-center px-8 py-3 text-white rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{ backgroundColor: validateStep() ? primaryColor : '#9ca3af' }}
                    >
                      Next
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </button>
                  ) : currentTab === 4 ? (
                    <button
                      onClick={nextStep}
                      disabled={!validateStep()}
                      className="flex items-center px-8 py-3 text-white rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{ backgroundColor: validateStep() ? primaryColor : '#9ca3af' }}
                    >
                      Review Appointment
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </button>
                  ) : currentTab === 5 ? (
                    <button
                      onClick={submitAppointment}
                      disabled={loading}
                      className="flex items-center px-8 py-3 text-white rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{ backgroundColor: !loading ? primaryColor : '#9ca3af' }}
                    >
                      {loading ? 'Booking...' : 'Confirm & Book Appointment'}
                      {!loading && <CheckCircle className="h-4 w-4 ml-2" />}
                    </button>
                  ) : null}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UrgentCareBooking;