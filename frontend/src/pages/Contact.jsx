import React, { useState } from 'react';
import { 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  Send,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { useToast } from '../hooks/use-toast';
import { hospitalInfo, hours, mockAPI } from '../mock';
import { useBusinessInfo } from '../hooks/useBusinessInfo';

const Contact = () => {
  const { businessInfo: currentBusinessInfo } = useBusinessInfo();
  const { toast } = useToast();
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    phone: '',
    petName: '',
    message: '',
    serviceType: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const primaryColor = '#29add3';
  const primaryLight = '#5bc0db';
  const primaryBg = '#e6f7fb';

  const serviceTypes = [
    'General Inquiry',
    'Schedule Appointment',
    'Urgent Care',
    'Surgery Consultation',
    'Dental Care',
    'Wellness Exam',
    'Exotic Pet Care',
    'Other'
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setContactForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await mockAPI.submitContactForm(contactForm);
      
      if (response.success) {
        toast({
          title: "Message Sent Successfully!",
          description: response.message,
          duration: 5000,
        });
        
        // Reset form
        setContactForm({
          name: '',
          email: '',
          phone: '',
          petName: '',
          message: '',
          serviceType: ''
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to send message. Please try again or call us directly.",
        duration: 5000,
      });
    }

    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section - Mobile Only */}
      <section className="text-white sticky z-40 block md:hidden" style={{ top: '4rem', background: `linear-gradient(135deg, ${primaryColor} 0%, #2196c7 100%)`, paddingTop: '0.5rem', paddingBottom: '0.5rem' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="font-bold" style={{ fontSize: '1.125rem' }}>
              Contact Us
            </h1>
          </div>
        </div>
      </section>

      {/* Hero Section */}
      <section className="bg-white">
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center" style={{ paddingTop: '30px', paddingBottom: '15px' }}>
          <h1 className="text-xl font-bold text-gray-900 mb-6">
            Reach Us
          </h1>
          <div className="mb-6">
            <span className="inline-flex items-center px-6 py-3 rounded-full text-lg font-bold text-white shadow-lg" style={{ backgroundColor: primaryColor }}>
              Your Partner in Pet Care Excellence
            </span>
          </div>
          <p className="text-base text-gray-600 leading-relaxed max-w-3xl mx-auto mb-8">
            Every question matters, every concern is heard, and every pet receives the compassionate care they deserve. 
            Connect with us through multiple convenient channels - because exceptional veterinary care begins with exceptional communication.
          </p>
        </div>
      </section>

      {/* Reach Us Section */}
      <section style={{ backgroundColor: '#f8f9fa', paddingTop: '40px', paddingBottom: '40px' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Introduction */}
          <div className="text-center mb-12">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Contact Information
            </h2>
            <p className="text-gray-700 mb-2">
              Multiple convenient ways to reach us for appointments, questions, or urgent care needs
            </p>
            <p className="text-gray-700">
              Our dedicated team is here to provide compassionate support for you and your beloved pets
            </p>
          </div>

          {/* Reach Us Map - Full Width */}
          <div className="mb-12">
            <div className="bg-white p-8 rounded-xl shadow-lg">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center mb-4 lg:mb-0">
                  <MapPin className="mr-3 h-6 w-6" style={{ color: primaryColor }} />
                  Reach Us
                </h2>
                <div className="flex flex-col sm:flex-row gap-4">
                  <a 
                    href={`tel:${currentBusinessInfo.phone}`}
                    className="flex items-center justify-center px-4 py-2 rounded-lg transition-colors duration-200 border-2"
                    style={{ borderColor: primaryColor, color: primaryColor }}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = primaryColor;
                      e.target.style.color = 'white';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = 'transparent';
                      e.target.style.color = primaryColor;
                    }}
                  >
                    <Phone className="mr-2 h-4 w-4" />
                    {currentBusinessInfo.phone}
                  </a>
                  <a 
                    href={`mailto:${currentBusinessInfo.email}`}
                    className="flex items-center justify-center px-4 py-2 rounded-lg transition-colors duration-200 border-2"
                    style={{ borderColor: primaryColor, color: primaryColor }}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = primaryColor;
                      e.target.style.color = 'white';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = 'transparent';
                      e.target.style.color = primaryColor;
                    }}
                  >
                    <Mail className="mr-2 h-4 w-4" />
                    {currentBusinessInfo.email}
                  </a>
                </div>
              </div>
              
              <div className="rounded-xl overflow-hidden shadow-md">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3105.8947649847485!2d-77.52344768464344!3d38.98234397956376!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89b638b58b3b5c61%3A0x5f5f5f5f5f5f5f5f!2s43114%20Peacock%20Market%20Plaza%2C%20South%20Riding%2C%20VA%2020152%2C%20USA!5e0!3m2!1sen!2sus!4v1620000000000!5m2!1sen!2sus"
                  width="100%"
                  height="400"
                  style={{ border: 0 }}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Pets and Vets Animal Hospital Location"
                ></iframe>
              </div>
              
              <div className="mt-4 p-4 rounded-lg" style={{ backgroundColor: primaryBg }}>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-semibold text-gray-900">{currentBusinessInfo.address}</p>
                    <p className="text-sm text-gray-600 mt-1">Located beside Sweet Frog in Peacock Market Plaza</p>
                  </div>
                  <button 
                    className="mt-3 sm:mt-0 text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200"
                    style={{ backgroundColor: primaryColor }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = '#2196c7'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = primaryColor}
                    onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(currentBusinessInfo.address)}`, '_blank')}
                  >
                    Get Directions
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Hours Grid - Side by Side */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12">
            {/* Urgent Care Hours - Left Side */}
            <div className="bg-white p-8 rounded-xl shadow-lg border-2 border-red-200">
              <h2 className="text-2xl font-bold text-red-900 mb-4 flex items-center">
                <Clock className="mr-3 h-6 w-6 text-red-600" />
                Urgent Care Hours
              </h2>
              <p className="text-sm mb-6 font-medium text-red-700">
                By Appointment Only
              </p>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Monday - Friday:</span>
                  <span className="font-bold text-red-600">3 PM - 10 PM</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Thursday:</span>
                  <span className="font-medium text-red-600">Closed</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Saturday:</span>
                  <span className="font-bold text-red-600">10 AM - 8 PM</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Sunday:</span>
                  <span className="font-bold text-red-600">10 AM - 6 PM</span>
                </div>
              </div>
            </div>

            {/* General Practice Hours - Right Side */}
            <div className="bg-white p-8 rounded-xl shadow-lg">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                <Clock className="mr-3 h-6 w-6" style={{ color: primaryColor }} />
                General Practice Hours
              </h2>
              <p className="text-sm mb-6 font-medium" style={{ color: primaryColor }}>
                By Appointment Only
              </p>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Monday - Wednesday, Friday:</span>
                  <span className="font-medium text-gray-900">{hours.generalPractice.monday}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tuesday:</span>
                  <span className="font-medium text-gray-900">{hours.generalPractice.tuesday}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Thursday:</span>
                  <span className="font-medium text-red-600">{hours.generalPractice.thursday}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Saturday:</span>
                  <span className="font-medium text-gray-900">{hours.generalPractice.saturday}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Sunday:</span>
                  <span className="font-medium text-red-600">{hours.generalPractice.sunday}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Emergency Care - Full Width */}
          <div className="mb-12">
            <div className="bg-red-50 border-2 border-red-200 p-8 rounded-xl">
              <div className="flex items-start">
                <AlertCircle className="h-6 w-6 text-red-600 mt-0.5 mr-3 flex-shrink-0" />
                <div>
                  <h3 className="text-lg font-bold text-red-900 mb-2">Emergency Care</h3>
                  <p className="text-red-700 mb-3">
                    If your pet is experiencing a life-threatening emergency outside our urgent care hours, 
                    please contact your nearest 24-hour emergency animal hospital immediately.
                  </p>
                  <p className="text-red-600 font-semibold">
                    <a 
                      href="tel:(703) 752-9100" 
                      className="transition-colors duration-200"
                      style={{ color: '#dc2626' }}
                      onMouseEnter={(e) => e.target.style.color = '#b91c1c'}
                      onMouseLeave={(e) => e.target.style.color = '#dc2626'}
                    >
                      VCA SouthPaws Veterinary Specialists & Emergency Center: (703) 752-9100
                    </a>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form - Full Width */}
          <div className="w-full">
            <div className="bg-white p-8 rounded-xl shadow-lg">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                Send Us a Message
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                      Your Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      required
                      value={contactForm.name}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg transition-colors"
                      style={{
                        '&:focus': {
                          outline: 'none',
                          borderColor: primaryColor,
                          boxShadow: `0 0 0 2px ${primaryColor}20`
                        }
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = primaryColor;
                        e.target.style.boxShadow = `0 0 0 2px ${primaryColor}20`;
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = '#d1d5db';
                        e.target.style.boxShadow = 'none';
                      }}
                      placeholder="John Doe"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      required
                      value={contactForm.email}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg transition-colors"
                      onFocus={(e) => {
                        e.target.style.borderColor = primaryColor;
                        e.target.style.boxShadow = `0 0 0 2px ${primaryColor}20`;
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = '#d1d5db';
                        e.target.style.boxShadow = 'none';
                      }}
                      placeholder="john@example.com"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={contactForm.phone}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg transition-colors"
                      onFocus={(e) => {
                        e.target.style.borderColor = primaryColor;
                        e.target.style.boxShadow = `0 0 0 2px ${primaryColor}20`;
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = '#d1d5db';
                        e.target.style.boxShadow = 'none';
                      }}
                      placeholder="(555) 123-4567"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="petName" className="block text-sm font-medium text-gray-700 mb-2">
                      Pet's Name
                    </label>
                    <input
                      type="text"
                      id="petName"
                      name="petName"
                      value={contactForm.petName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg transition-colors"
                      onFocus={(e) => {
                        e.target.style.borderColor = primaryColor;
                        e.target.style.boxShadow = `0 0 0 2px ${primaryColor}20`;
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = '#d1d5db';
                        e.target.style.boxShadow = 'none';
                      }}
                      placeholder="Fluffy"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="serviceType" className="block text-sm font-medium text-gray-700 mb-2">
                    Service Type
                  </label>
                  <select
                    id="serviceType"
                    name="serviceType"
                    value={contactForm.serviceType}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg transition-colors"
                    onFocus={(e) => {
                      e.target.style.borderColor = primaryColor;
                      e.target.style.boxShadow = `0 0 0 2px ${primaryColor}20`;
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#d1d5db';
                      e.target.style.boxShadow = 'none';
                    }}
                  >
                    <option value="">Select a service...</option>
                    {serviceTypes.map((service) => (
                      <option key={service} value={service}>
                        {service}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                    Message *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    required
                    rows={5}
                    value={contactForm.message}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg transition-colors resize-none"
                    onFocus={(e) => {
                      e.target.style.borderColor = primaryColor;
                      e.target.style.boxShadow = `0 0 0 2px ${primaryColor}20`;
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#d1d5db';
                      e.target.style.boxShadow = 'none';
                    }}
                    placeholder="Tell us about your pet's needs or any questions you have..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full text-white px-6 py-4 rounded-lg font-semibold transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  style={{ backgroundColor: primaryColor }}
                  onMouseEnter={(e) => {
                    if (!isSubmitting) {
                      e.target.style.backgroundColor = '#2196c7';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isSubmitting) {
                      e.target.style.backgroundColor = primaryColor;
                    }
                  }}
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-5 w-5" />
                      Send Message
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section style={{ background: `linear-gradient(135deg, ${primaryColor} 0%, #2196c7 100%)`, paddingTop: '30px', paddingBottom: '30px' }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-bold text-white mb-4" style={{ fontSize: '1rem' }}>
            Ready to Give Your Pet the Best Care?
          </h2>
          <p className="mb-8" style={{ color: 'white', fontSize: '1rem' }}>
            Contact us today to schedule an appointment or for urgent care
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href={`tel:${currentBusinessInfo.phone}`}
              className="inline-flex items-center justify-center bg-white px-8 py-4 rounded-lg font-semibold transition-colors duration-200"
              style={{ color: primaryColor }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#f9fafb'}
              onMouseLeave={(e) => e.target.style.backgroundColor = 'white'}
            >
              <Phone className="mr-2 h-5 w-5" />
              Call Now: {currentBusinessInfo.phone}
            </a>
            <a
              href={`tel:${currentBusinessInfo.phone}`}
              className="inline-flex items-center justify-center border-2 border-white text-white px-8 py-4 rounded-lg font-semibold transition-colors duration-200"
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = 'white';
                e.target.style.color = primaryColor;
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'transparent';  
                e.target.style.color = 'white';
              }}
            >
              Emergency Call
              <Phone className="ml-2 h-5 w-5" />
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;