import React, { useState } from 'react';
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
  Loader
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
    
    // Pet Information
    pet_name: '',
    pet_species: '',
    pet_breed: '',
    pet_gender: '',
    pet_age: '',
    pet_weight: '',
    pet_color: '',
    spayed_neutered: '',
    
    // Medical History
    current_medications: '',
    allergies: '',
    previous_vet: '',
    previous_vet_phone: '',
    last_visit_date: '',
    vaccination_history: '',
    medical_conditions: '',
    
    // Additional Information
    how_heard_about_us: '',
    preferred_appointment_type: '',
    special_instructions: ''
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || import.meta.env.REACT_APP_BACKEND_URL;
  const primaryColor = '#29add3';

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setMessage({ type: '', text: '' });
  };

  const validateForm = () => {
    const required = [
      'owner_first_name', 'owner_last_name', 'address', 'city', 'state', 
      'zip_code', 'email', 'phone', 'pet_name', 'pet_species', 'pet_gender', 'pet_age'
    ];
    
    for (let field of required) {
      if (!formData[field].trim()) {
        return false;
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
      setMessage({ type: 'error', text: 'Please fill all required fields with valid information.' });
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
          a.download = `patient_registration_${formData.pet_name}_${Date.now()}.pdf`;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          setMessage({ type: 'success', text: 'Registration submitted and PDF downloaded successfully!' });
        } else {
          const data = await response.json();
          setMessage({ type: 'success', text: 'Registration submitted successfully!' });
        }
        
        // Reset form
        setFormData({
          owner_first_name: '', owner_last_name: '', address: '', city: '', state: '',
          zip_code: '', email: '', phone: '', emergency_contact_name: '', emergency_contact_phone: '',
          pet_name: '', pet_species: '', pet_breed: '', pet_gender: '', pet_age: '',
          pet_weight: '', pet_color: '', spayed_neutered: '', current_medications: '',
          allergies: '', previous_vet: '', previous_vet_phone: '', last_visit_date: '',
          vaccination_history: '', medical_conditions: '', how_heard_about_us: '',
          preferred_appointment_type: '', special_instructions: ''
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center">
            <FileText className="h-8 w-8 mr-3" style={{ color: primaryColor }} />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">New Patient Registration</h1>
              <p className="text-gray-600">Complete this form to register as a new patient</p>
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

        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <form onSubmit={(e) => e.preventDefault()}>
            {/* Pet Owner Information */}
            <div className="p-8 border-b border-gray-200">
              <div className="flex items-center mb-6">
                <User className="h-6 w-6 mr-3" style={{ color: primaryColor }} />
                <h2 className="text-xl font-semibold text-gray-900">Pet Owner Information</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">First Name *</label>
                  <input
                    type="text"
                    value={formData.owner_first_name}
                    onChange={(e) => handleInputChange('owner_first_name', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                    style={{ '--tw-ring-color': primaryColor }}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Last Name *</label>
                  <input
                    type="text"
                    value={formData.owner_last_name}
                    onChange={(e) => handleInputChange('owner_last_name', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                    style={{ '--tw-ring-color': primaryColor }}
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Address *</label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                    style={{ '--tw-ring-color': primaryColor }}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">City *</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                    style={{ '--tw-ring-color': primaryColor }}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">State *</label>
                  <input
                    type="text"
                    value={formData.state}
                    onChange={(e) => handleInputChange('state', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                    style={{ '--tw-ring-color': primaryColor }}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">ZIP Code *</label>
                  <input
                    type="text"
                    value={formData.zip_code}
                    onChange={(e) => handleInputChange('zip_code', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                    style={{ '--tw-ring-color': primaryColor }}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                    style={{ '--tw-ring-color': primaryColor }}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone *</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                    style={{ '--tw-ring-color': primaryColor }}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Emergency Contact Name</label>
                  <input
                    type="text"
                    value={formData.emergency_contact_name}
                    onChange={(e) => handleInputChange('emergency_contact_name', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                    style={{ '--tw-ring-color': primaryColor }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Emergency Contact Phone</label>
                  <input
                    type="tel"
                    value={formData.emergency_contact_phone}
                    onChange={(e) => handleInputChange('emergency_contact_phone', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                    style={{ '--tw-ring-color': primaryColor }}
                  />
                </div>
              </div>
            </div>

            {/* Pet Information */}
            <div className="p-8 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center mb-6">
                <Heart className="h-6 w-6 mr-3 text-red-500" />
                <h2 className="text-xl font-semibold text-gray-900">Pet Information</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Pet Name *</label>
                  <input
                    type="text"
                    value={formData.pet_name}
                    onChange={(e) => handleInputChange('pet_name', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                    style={{ '--tw-ring-color': primaryColor }}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Species *</label>
                  <select
                    value={formData.pet_species}
                    onChange={(e) => handleInputChange('pet_species', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                    style={{ '--tw-ring-color': primaryColor }}
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
                    value={formData.pet_breed}
                    onChange={(e) => handleInputChange('pet_breed', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                    style={{ '--tw-ring-color': primaryColor }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Gender *</label>
                  <select
                    value={formData.pet_gender}
                    onChange={(e) => handleInputChange('pet_gender', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                    style={{ '--tw-ring-color': primaryColor }}
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
                    value={formData.pet_age}
                    onChange={(e) => handleInputChange('pet_age', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                    style={{ '--tw-ring-color': primaryColor }}
                    placeholder="e.g., 2 years, 6 months"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Weight</label>
                  <input
                    type="text"
                    value={formData.pet_weight}
                    onChange={(e) => handleInputChange('pet_weight', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                    style={{ '--tw-ring-color': primaryColor }}
                    placeholder="e.g., 25 lbs"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Color</label>
                  <input
                    type="text"
                    value={formData.pet_color}
                    onChange={(e) => handleInputChange('pet_color', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                    style={{ '--tw-ring-color': primaryColor }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Spayed/Neutered</label>
                  <select
                    value={formData.spayed_neutered}
                    onChange={(e) => handleInputChange('spayed_neutered', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                    style={{ '--tw-ring-color': primaryColor }}
                  >
                    <option value="">Select option</option>
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                    <option value="Unknown">Unknown</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Medical History */}
            <div className="p-8 border-b border-gray-200">
              <div className="flex items-center mb-6">
                <Stethoscope className="h-6 w-6 mr-3" style={{ color: primaryColor }} />
                <h2 className="text-xl font-semibold text-gray-900">Medical History</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Current Medications</label>
                  <textarea
                    value={formData.current_medications}
                    onChange={(e) => handleInputChange('current_medications', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                    style={{ '--tw-ring-color': primaryColor }}
                    rows="3"
                    placeholder="List any current medications..."
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Allergies</label>
                  <textarea
                    value={formData.allergies}
                    onChange={(e) => handleInputChange('allergies', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                    style={{ '--tw-ring-color': primaryColor }}
                    rows="3"
                    placeholder="List any known allergies..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Previous Veterinarian</label>
                  <input
                    type="text"
                    value={formData.previous_vet}
                    onChange={(e) => handleInputChange('previous_vet', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                    style={{ '--tw-ring-color': primaryColor }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Previous Vet Phone</label>
                  <input
                    type="tel"
                    value={formData.previous_vet_phone}
                    onChange={(e) => handleInputChange('previous_vet_phone', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                    style={{ '--tw-ring-color': primaryColor }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Last Visit Date</label>
                  <input
                    type="date"
                    value={formData.last_visit_date}
                    onChange={(e) => handleInputChange('last_visit_date', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                    style={{ '--tw-ring-color': primaryColor }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Vaccination History</label>
                  <input
                    type="text"
                    value={formData.vaccination_history}
                    onChange={(e) => handleInputChange('vaccination_history', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                    style={{ '--tw-ring-color': primaryColor }}
                    placeholder="e.g., Up to date, Unknown"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Medical Conditions</label>
                  <textarea
                    value={formData.medical_conditions}
                    onChange={(e) => handleInputChange('medical_conditions', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                    style={{ '--tw-ring-color': primaryColor }}
                    rows="3"
                    placeholder="List any known medical conditions..."
                  />
                </div>
              </div>
            </div>

            {/* Additional Information */}
            <div className="p-8 bg-gray-50">
              <div className="flex items-center mb-6">
                <FileText className="h-6 w-6 mr-3" style={{ color: primaryColor }} />
                <h2 className="text-xl font-semibold text-gray-900">Additional Information</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">How did you hear about us?</label>
                  <select
                    value={formData.how_heard_about_us}
                    onChange={(e) => handleInputChange('how_heard_about_us', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                    style={{ '--tw-ring-color': primaryColor }}
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                    style={{ '--tw-ring-color': primaryColor }}
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                    style={{ '--tw-ring-color': primaryColor }}
                    rows="4"
                    placeholder="Any special instructions or notes for our team..."
                  />
                </div>
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="p-8 bg-white">
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
    </div>
  );
};

export default PatientRegistrationPDF;