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
  Stethoscope,
  Check
} from 'lucide-react';

const UrgentCareBooking = () => {
  const [currentTab, setCurrentTab] = useState(0);
  const [completedTabs, setCompletedTabs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [timeSlots, setTimeSlots] = useState([]);
  const [availableToday, setAvailableToday] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });

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
    { id: 1, title: 'Your Information', icon: User },
    { id: 2, title: 'Pet Details', icon: Heart },
    { id: 3, title: 'Visit Reason', icon: Stethoscope },
    { id: 4, title: 'Additional Info', icon: CheckCircle },
    { id: 5, title: 'Confirmation', icon: Check }
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
        return formData.primary_vet_hospital && formData.how_heard_about_us;
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
    } else {
      setMessage({ type: 'error', text: 'Please complete all required fields' });
    }
  };

  const goToTab = (tabIndex) => {
    // Can only go to completed tabs or the next available tab
    if (completedTabs.includes(tabIndex) || tabIndex === Math.min(...completedTabs) + 1 || tabIndex === 0) {
      setCurrentTab(tabIndex);
      setMessage({ type: '', text: '' });
    }
  };

  const isTabEnabled = (tabIndex) => {
    return tabIndex === 0 || completedTabs.includes(tabIndex - 1);
  };

  const isTabCompleted = (tabIndex) => {
    return completedTabs.includes(tabIndex);
  };

  const formatTime = (timeString) => {
    const [hours, minutes] = timeString.split(':');
    const hour12 = parseInt(hours) % 12 || 12;
    const ampm = parseInt(hours) >= 12 ? 'PM' : 'AM';
    return `${hour12}:${minutes} ${ampm}`;
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
        setCurrentTab(5); // Success tab
        setCompletedTabs([...completedTabs, 4]);
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
      {/* Hero Section */}
      <div className="relative bg-white" style={{ paddingTop: '30px', paddingBottom: '15px' }}>
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h1 className="text-xl font-bold text-gray-900 mb-6">
            Check In Online
          </h1>
          <div className="mb-6">
            <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold text-white" style={{ backgroundColor: '#dc2626' }}>
              Urgent Care Appointment Booking
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
            <span>Step {currentTab + 1} of 6</span>
            <span>{Math.round(((currentTab + 1) / 6) * 100)}% Complete</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="h-2 rounded-full transition-all duration-300" 
              style={{ 
                backgroundColor: primaryColor,
                width: `${((currentTab + 1) / 6) * 100}%` 
              }}
            ></div>
          </div>
        </div>

        {message.text && (
          <div className={`mb-6 p-4 rounded-lg flex items-center ${
            message.type === 'success' 
              ? 'bg-green-50 text-green-800 border border-green-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}>
            {message.type === 'success' ? (
              <CheckCircle className="h-5 w-5 mr-3" />
            ) : (
              <AlertCircle className="h-5 w-5 mr-3" />
            )}
            {message.text}
          </div>
        )}

        <div className="bg-white rounded-xl shadow-lg p-8">
          {/* Step 1: Time Selection */}
          {currentTab === 0 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <Clock className="h-6 w-6 mr-3" style={{ color: primaryColor }} />
                Please Select An Arrival Time For Today
              </h2>
              
              {!availableToday ? (
                <div className="text-center py-8">
                  <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                  <p className="text-lg text-gray-900 mb-2">Urgent Care is Closed Today</p>
                  <p className="text-gray-600">Please check our hours and try again when we're open.</p>
                  <Link 
                    to="/our-hours" 
                    className="inline-block mt-4 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                    style={{ backgroundColor: primaryColor }}
                  >
                    View Our Hours
                  </Link>
                </div>
              ) : loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: primaryColor }}></div>
                  <p className="text-gray-600">Loading available times...</p>
                </div>
              ) : timeSlots.length === 0 ? (
                <div className="text-center py-8">
                  <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
                  <p className="text-lg text-gray-900 mb-2">No Available Slots Today</p>
                  <p className="text-gray-600">All appointment slots for today are booked. Please call us for urgent needs.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {timeSlots.map((slot, index) => (
                    <button
                      key={index}
                      onClick={() => handleInputChange('appointment_time', slot.value)}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        formData.appointment_time === slot.value
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {formatTime(slot.time)}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Step 2: Owner Information */}
          {currentTab === 1 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <User className="h-6 w-6 mr-3" style={{ color: primaryColor }} />
                Pet Owner Information
              </h2>
              
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

          {/* Step 3: Pet Information */}
          {currentTab === 2 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <Heart className="h-6 w-6 mr-3" style={{ color: primaryColor }} />
                Pet Information
              </h2>
              
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

          {/* Step 4: Reason for Visit */}
          {currentTab === 3 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <Stethoscope className="h-6 w-6 mr-3" style={{ color: primaryColor }} />
                Reason for Visit
              </h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-4">
                  What brings your pet in today? *
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

          {/* Step 5: Additional Information */}
          {currentTab === 4 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Additional Information
              </h2>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Primary Veterinary Hospital Name *
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
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    How did you hear about us? *
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
                    required
                  >
                    <option value="">Select an option</option>
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

          {/* Step 6: Success */}
          {currentTab === 5 && (
            <div className="text-center py-8">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-6" />
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Appointment Booked Successfully!
              </h2>
              <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
                <h3 className="font-semibold text-green-800 mb-4">Appointment Details:</h3>
                <div className="space-y-2 text-left text-green-700">
                  <p><strong>Date:</strong> Today</p>
                  <p><strong>Time:</strong> {formatTime(formData.appointment_time.split('T')[1])}</p>
                  <p><strong>Pet:</strong> {formData.pet_name} ({formData.pet_type})</p>
                  <p><strong>Reason:</strong> {formData.reason_for_visit}</p>
                </div>
              </div>
              <p className="text-gray-600 mb-6">
                We'll see you and {formData.pet_name} at your scheduled time. Please arrive 10 minutes early.
              </p>
              <Link 
                to="/" 
                className="inline-block text-white px-8 py-3 rounded-lg font-medium transition-colors"
                style={{ backgroundColor: primaryColor }}
              >
                Return to Home
              </Link>
            </div>
          )}

          {/* Navigation Buttons */}
          {currentTab < 5 && availableToday && timeSlots.length > 0 && (
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
                ) : (
                  <button
                    onClick={submitAppointment}
                    disabled={!validateStep() || loading}
                    className="flex items-center px-8 py-3 text-white rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ backgroundColor: validateStep() && !loading ? primaryColor : '#9ca3af' }}
                  >
                    {loading ? 'Booking...' : 'Book Appointment'}
                    {!loading && <CheckCircle className="h-4 w-4 ml-2" />}
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UrgentCareBooking;