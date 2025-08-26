import React, { useState, useCallback } from 'react';
import { 
  FileText, 
  User, 
  Heart, 
  Stethoscope, 
  Phone,
  Mail,
  MapPin,
  Download,
  Send,
  AlertCircle,
  CheckCircle,
  Loader,
  Plus,
  Minus,
  PawPrint,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

const PatientRegistrationPDF = () => {
  const [formData, setFormData] = useState({
    // Owner Information
    owner_first_name: '',
    owner_last_name: '',
    address: '',
    city: '',
    state: '',
    zip_code: '',
    email: '',
    phone: '',
    emergency_contact_name: '',
    emergency_contact_phone: '',
    
    // Multiple Pets Information
    pets: [{
      pet_name: '',
      pet_species: '',
      pet_breed: '',
      pet_gender: '',
      pet_age: '',
      pet_weight: '',
      pet_color: '',
      spayed_neutered: '',
      current_medications: '',
      allergies: '',
      vaccination_history: '',
      medical_conditions: ''
    }],
    
    // Veterinary History (shared)
    previous_vet: '',
    previous_vet_phone: '',
    last_visit_date: '',
    
    // Additional Information
    how_heard_about_us: '',
    preferred_appointment_type: '',
    special_instructions: ''
  });

  // Accordion state management
  const [accordionState, setAccordionState] = useState({
    ownerInfo: true,     // Start with first section open
    petInfo: false,
    vetHistory: false,
    additionalInfo: false
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || import.meta.env.REACT_APP_BACKEND_URL;
  const primaryColor = '#29add3';

  // Accordion toggle function - memoized to prevent re-renders
  const toggleAccordion = useCallback((section, event) => {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    setAccordionState(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  }, []);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handlePetChange = (petIndex, field, value) => {
    setFormData(prev => ({
      ...prev,
      pets: prev.pets.map((pet, index) => 
        index === petIndex ? { ...pet, [field]: value } : pet
      )
    }));
  };

  const addPet = () => {
    if (formData.pets.length < 4) {
      setFormData(prev => ({
        ...prev,
        pets: [...prev.pets, {
          pet_name: '',
          pet_species: '',
          pet_breed: '',
          pet_gender: '',
          pet_age: '',
          pet_weight: '',
          pet_color: '',
          spayed_neutered: '',
          current_medications: '',
          allergies: '',
          vaccination_history: '',
          medical_conditions: ''
        }]
      }));
    }
  };

  const removePet = (petIndex) => {
    if (formData.pets.length > 1) {
      setFormData(prev => ({
        ...prev,
        pets: prev.pets.filter((_, index) => index !== petIndex)
      }));
    }
  };

  const validateForm = () => {
    // Check required owner fields
    const requiredOwnerFields = [
      'owner_first_name', 'owner_last_name', 'address', 'city', 'state', 
      'zip_code', 'email', 'phone'
    ];
    
    for (let field of requiredOwnerFields) {
      if (!formData[field].trim()) {
        return false;
      }
    }
    
    // Check required pet fields for each pet
    const requiredPetFields = ['pet_name', 'pet_species', 'pet_gender', 'pet_age'];
    
    for (let petIndex = 0; petIndex < formData.pets.length; petIndex++) {
      const pet = formData.pets[petIndex];
      for (let field of requiredPetFields) {
        if (!pet[field].trim()) {
          return false;
        }
      }
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      return false;
    }
    
    return true;
  };

  const submitForm = async (generatePDF = false) => {
    if (!validateForm()) {
      setMessage({ type: 'error', text: 'Please fill all required fields with valid information for all pets.' });
      return;
    }

    setLoading(true);
    try {
      const endpoint = generatePDF ? '/api/patient-registration/pdf' : '/api/patient-registration';
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        if (generatePDF) {
          // Handle PDF download
          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.style.display = 'none';
          a.href = url;
          a.download = `patient_registration_${formData.owner_last_name}_${Date.now()}.pdf`;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          setMessage({ type: 'success', text: `Registration for ${formData.pets.length} pet${formData.pets.length > 1 ? 's' : ''} submitted and PDF downloaded successfully!` });
        } else {
          const data = await response.json();
          setMessage({ type: 'success', text: `Registration for ${formData.pets.length} pet${formData.pets.length > 1 ? 's' : ''} submitted successfully!` });
        }
        
        // Reset form
        setFormData({
          owner_first_name: '', owner_last_name: '', address: '', city: '', state: '',
          zip_code: '', email: '', phone: '', emergency_contact_name: '', emergency_contact_phone: '',
          pets: [{
            pet_name: '', pet_species: '', pet_breed: '', pet_gender: '', pet_age: '',
            pet_weight: '', pet_color: '', spayed_neutered: '', current_medications: '',
            allergies: '', vaccination_history: '', medical_conditions: ''
          }],
          previous_vet: '', previous_vet_phone: '', last_visit_date: '',
          how_heard_about_us: '', preferred_appointment_type: '', special_instructions: ''
        });
      } else {
        const errorData = await response.json();
        setMessage({ type: 'error', text: errorData.detail || 'Failed to submit registration' });
      }
    } catch (error) {
      console.error('Error submitting registration:', error);
      setMessage({ type: 'error', text: 'Unable to submit registration. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  // Accordion Section Component - Memoized to prevent unnecessary re-renders
  const AccordionSection = React.memo(({ 
    isOpen, 
    onToggle, 
    title, 
    icon: Icon, 
    iconColor = primaryColor, 
    children, 
    subtitle = null,
    bgColor = "bg-white"
  }) => {
    
    const handleToggle = useCallback((e) => {
      e.preventDefault();
      e.stopPropagation();
      
      // Store the current scroll position and button position
      const currentScrollY = window.scrollY;
      const buttonRect = e.currentTarget.getBoundingClientRect();
      const buttonTop = buttonRect.top + currentScrollY;
      
      // Call the toggle function
      onToggle(e);
      
      // Use a timeout to adjust scroll position after React re-render
      setTimeout(() => {
        // If we're expanding content above the current view, maintain relative position
        if (buttonTop < currentScrollY && !isOpen) {
          // Content is expanding above current view - don't adjust scroll
          window.scrollTo(0, currentScrollY);
        } else if (buttonTop < currentScrollY && isOpen) {
          // Content is collapsing above current view - maintain position
          window.scrollTo(0, currentScrollY);
        } else {
          // Content change is at or below current view - maintain exact position  
          window.scrollTo(0, currentScrollY);
        }
      }, 0);
    }, [onToggle, isOpen]);

    return (
      <div className={`${bgColor} rounded-xl shadow-lg overflow-hidden border border-gray-200`}>
        <button
          type="button"
          onClick={handleToggle}
          className="w-full p-6 flex items-center justify-between hover:bg-gray-50 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2"
          style={{ '--tw-ring-color': primaryColor }}
        >
          <div className="flex items-center">
            <Icon className="h-6 w-6 mr-3" style={{ color: iconColor }} />
            <div className="text-left">
              <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
              {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
            </div>
          </div>
          {isOpen ? (
            <ChevronUp className="h-5 w-5 text-gray-500" />
          ) : (
            <ChevronDown className="h-5 w-5 text-gray-500" />
          )}
        </button>
        
        <div className={`transition-all duration-300 ease-in-out overflow-hidden ${
          isOpen ? 'max-h-none opacity-100' : 'max-h-0 opacity-0'
        }`}>
          <div 
            className="px-6 pb-6 pt-8 border-t border-gray-100"
            onClick={(e) => e.stopPropagation()}
            onFocus={(e) => e.stopPropagation()}
          >
            {children}
          </div>
        </div>
      </div>
    );
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center">
            <FileText className="h-8 w-8 mr-3" style={{ color: primaryColor }} />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">New Patient Registration</h1>
              <p className="text-gray-600">Complete this form to register as a new patient (up to 4 pets)</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Messages */}
        {message.text && (
          <div className={`mb-6 p-4 rounded-lg flex items-center ${
            message.type === 'success' ? 'bg-blue-50 border border-blue-200' : 'bg-red-50 border border-red-200'
          }`}>
            {message.type === 'success' ? (
              <CheckCircle className="h-5 w-5 mr-3 text-blue-600" />
            ) : (
              <AlertCircle className="h-5 w-5 mr-3 text-red-600" />
            )}
            <p className={message.type === 'success' ? 'text-blue-800' : 'text-red-800'}>
              {message.text}
            </p>
          </div>
        )}

        <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
          {/* Pet Owner Information Section */}
          <AccordionSection
            key="ownerInfo"
            isOpen={accordionState.ownerInfo}
            onToggle={(e) => toggleAccordion('ownerInfo', e)}
            title="Pet Owner Information"
            icon={User}
            iconColor={primaryColor}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">First Name *</label>
                <input
                  type="text"
                  value={formData.owner_first_name}
                  onChange={(e) => handleInputChange('owner_first_name', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Last Name *</label>
                <input
                  type="text"
                  value={formData.owner_last_name}
                  onChange={(e) => handleInputChange('owner_last_name', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent focus:ring-blue-500"
                  required
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Address *</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">City *</label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">State *</label>
                <input
                  type="text"
                  value={formData.state}
                  onChange={(e) => handleInputChange('state', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">ZIP Code *</label>
                <input
                  type="text"
                  value={formData.zip_code}
                  onChange={(e) => handleInputChange('zip_code', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone *</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Emergency Contact Name</label>
                <input
                  type="text"
                  value={formData.emergency_contact_name}
                  onChange={(e) => handleInputChange('emergency_contact_name', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Emergency Contact Phone</label>
                <input
                  type="tel"
                  value={formData.emergency_contact_phone}
                  onChange={(e) => handleInputChange('emergency_contact_phone', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent focus:ring-blue-500"
                />
              </div>
            </div>
          </AccordionSection>

          {/* Multiple Pets Information Section */}
          <AccordionSection
            key="petInfo"
            isOpen={accordionState.petInfo}
            onToggle={(e) => toggleAccordion('petInfo', e)}
            title="Pet Information"
            icon={Heart}
            iconColor="#ef4444"
            subtitle={`${formData.pets.length} of 4 pets`}
            bgColor="bg-gray-50"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <span className="text-lg font-medium text-gray-900">Your Pets</span>
              </div>
              {formData.pets.length < 4 && (
                <button
                  type="button"
                  onClick={addPet}
                  className="flex items-center px-4 py-2 border border-transparent rounded-lg font-medium text-white transition-all duration-200"
                  style={{ backgroundColor: primaryColor }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#2196c7'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = primaryColor}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Pet
                </button>
              )}
            </div>
            
            {formData.pets.map((pet, petIndex) => (
              <div key={petIndex} className="mb-8 p-6 bg-white rounded-lg border border-gray-200 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <PawPrint className="h-5 w-5 mr-2" style={{ color: primaryColor }} />
                    <h3 className="text-lg font-medium text-gray-900">Pet {petIndex + 1}</h3>
                    {pet.pet_name && <span className="ml-2 text-sm text-gray-600">- {pet.pet_name}</span>}
                  </div>
                  {formData.pets.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removePet(petIndex)}
                      className="flex items-center px-3 py-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md transition-all duration-200"
                    >
                      <Minus className="h-4 w-4 mr-1" />
                      Remove
                    </button>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Pet Name *</label>
                    <input
                      type="text"
                      value={pet.pet_name}
                      onChange={(e) => handlePetChange(petIndex, 'pet_name', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Species *</label>
                    <select
                      value={pet.pet_species}
                      onChange={(e) => handlePetChange(petIndex, 'pet_species', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent focus:ring-blue-500"
                      required
                    >
                      <option value="">Select species</option>
                      <option value="Dog">Dog</option>
                      <option value="Cat">Cat</option>
                      <option value="Bird">Bird</option>
                      <option value="Rabbit">Rabbit</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Breed</label>
                    <input
                      type="text"
                      value={pet.pet_breed}
                      onChange={(e) => handlePetChange(petIndex, 'pet_breed', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Gender *</label>
                    <select
                      value={pet.pet_gender}
                      onChange={(e) => handlePetChange(petIndex, 'pet_gender', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent focus:ring-blue-500"
                      required
                    >
                      <option value="">Select gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Age *</label>
                    <input
                      type="text"
                      value={pet.pet_age}
                      onChange={(e) => handlePetChange(petIndex, 'pet_age', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent focus:ring-blue-500"
                      placeholder="e.g., 2 years, 6 months"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Weight</label>
                    <input
                      type="text"
                      value={pet.pet_weight}
                      onChange={(e) => handlePetChange(petIndex, 'pet_weight', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent focus:ring-blue-500"
                      placeholder="e.g., 25 lbs"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Color</label>
                    <input
                      type="text"
                      value={pet.pet_color}
                      onChange={(e) => handlePetChange(petIndex, 'pet_color', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Spayed/Neutered</label>
                    <select
                      value={pet.spayed_neutered}
                      onChange={(e) => handlePetChange(petIndex, 'spayed_neutered', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent focus:ring-blue-500"
                    >
                      <option value="">Select option</option>
                      <option value="Yes">Yes</option>
                      <option value="No">No</option>
                      <option value="Unknown">Unknown</option>
                    </select>
                  </div>
                  
                  {/* Pet-specific medical information */}
                  <div className="md:col-span-2 mt-4">
                    <h4 className="text-md font-medium text-gray-900 mb-3">Medical Information for {pet.pet_name || `Pet ${petIndex + 1}`}</h4>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Current Medications</label>
                    <textarea
                      value={pet.current_medications}
                      onChange={(e) => handlePetChange(petIndex, 'current_medications', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent focus:ring-blue-500"
                      rows="2"
                      placeholder="List any current medications..."
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Allergies</label>
                    <textarea
                      value={pet.allergies}
                      onChange={(e) => handlePetChange(petIndex, 'allergies', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent focus:ring-blue-500"
                      rows="2"
                      placeholder="List any known allergies..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Vaccination History</label>
                    <input
                      type="text"
                      value={pet.vaccination_history}
                      onChange={(e) => handlePetChange(petIndex, 'vaccination_history', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent focus:ring-blue-500"
                      placeholder="e.g., Up to date, Unknown"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Medical Conditions</label>
                    <input
                      type="text"
                      value={pet.medical_conditions}
                      onChange={(e) => handlePetChange(petIndex, 'medical_conditions', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent focus:ring-blue-500"
                      placeholder="List any known medical conditions..."
                    />
                  </div>
                </div>
              </div>
            ))}
          </AccordionSection>

          {/* Veterinary History Section */}
          <AccordionSection
            isOpen={accordionState.vetHistory}
            onToggle={(e) => toggleAccordion('vetHistory', e)}
            title="Veterinary History"
            icon={Stethoscope}
            iconColor={primaryColor}
            subtitle="Shared across all pets"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Previous Veterinarian</label>
                <input
                  type="text"
                  value={formData.previous_vet}
                  onChange={(e) => handleInputChange('previous_vet', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Previous Vet Phone</label>
                <input
                  type="tel"
                  value={formData.previous_vet_phone}
                  onChange={(e) => handleInputChange('previous_vet_phone', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Last Visit Date</label>
                <input
                  type="date"
                  value={formData.last_visit_date}
                  onChange={(e) => handleInputChange('last_visit_date', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent focus:ring-blue-500"
                />
              </div>
            </div>
          </AccordionSection>

          {/* Additional Information Section */}
          <AccordionSection
            isOpen={accordionState.additionalInfo}
            onToggle={(e) => toggleAccordion('additionalInfo', e)}
            title="Additional Information"
            icon={FileText}
            iconColor={primaryColor}
            bgColor="bg-gray-50"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">How did you hear about us?</label>
                <select
                  value={formData.how_heard_about_us}
                  onChange={(e) => handleInputChange('how_heard_about_us', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent focus:ring-blue-500"
                >
                  <option value="">Select option</option>
                  <option value="Google Search">Google Search</option>
                  <option value="Social Media">Social Media</option>
                  <option value="Friend/Family">Friend/Family</option>
                  <option value="Vet Referral">Vet Referral</option>
                  <option value="Drive By">Drive By</option>
                  <option value="Online Reviews">Online Reviews</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Appointment Type</label>
                <select
                  value={formData.preferred_appointment_type}
                  onChange={(e) => handleInputChange('preferred_appointment_type', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent focus:ring-blue-500"
                >
                  <option value="">Select option</option>
                  <option value="Regular Appointment">Regular Appointment</option>
                  <option value="Urgent Care">Urgent Care</option>
                  <option value="Wellness Check">Wellness Check</option>
                  <option value="Surgery Consultation">Surgery Consultation</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Special Instructions</label>
                <textarea
                  value={formData.special_instructions}
                  onChange={(e) => handleInputChange('special_instructions', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent focus:ring-blue-500"
                  rows="4"
                  placeholder="Any special instructions or notes for our team..."
                />
              </div>
            </div>
          </AccordionSection>

          {/* Submit Buttons */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                type="button"
                onClick={() => submitForm(false)}
                disabled={loading}
                className="flex items-center justify-center px-8 py-4 border-2 rounded-lg font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ 
                  borderColor: primaryColor, 
                  color: primaryColor 
                }}
                onMouseEnter={(e) => {
                  if (!loading) {
                    e.target.style.backgroundColor = primaryColor;
                    e.target.style.color = 'white';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!loading) {
                    e.target.style.backgroundColor = 'transparent';
                    e.target.style.color = primaryColor;
                  }
                }}
              >
                {loading ? (
                  <Loader className="h-5 w-5 mr-2 animate-spin" />
                ) : (
                  <Send className="h-5 w-5 mr-2" />
                )}
                Submit Registration
              </button>
              
              <button
                type="button"
                onClick={() => submitForm(true)}
                disabled={loading}
                className="flex items-center justify-center px-8 py-4 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: primaryColor }}
                onMouseEnter={(e) => {
                  if (!loading) e.target.style.backgroundColor = '#2196c7';
                }}
                onMouseLeave={(e) => {
                  if (!loading) e.target.style.backgroundColor = primaryColor;
                }}
              >
                {loading ? (
                  <Loader className="h-5 w-5 mr-2 animate-spin" />
                ) : (
                  <Download className="h-5 w-5 mr-2" />
                )}
                Submit & Download PDF
              </button>
            </div>
            
            <p className="text-center text-sm text-gray-500 mt-4">
              * Required fields. Your information is secure and will be used only for veterinary care purposes.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PatientRegistrationPDF;