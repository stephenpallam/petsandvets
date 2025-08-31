import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Send,
  CheckCircle,
  Mail,
  Phone,
  MessageSquare,
  User,
  Clock,
  MapPin
} from 'lucide-react';
import { useToast } from '../hooks/use-toast';
import { hospitalInfo, mockAPI } from '../mock';

const MessageUs = () => {
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
  const [businessInfo, setBusinessInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || import.meta.env.REACT_APP_BACKEND_URL || window.location.origin;

  const primaryColor = '#29add3';
  const primaryLight = '#5bc0db';
  const primaryBg = '#e6f7fb';

  // Fetch business information
  useEffect(() => {
    const fetchBusinessInfo = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/business-info`);
        if (response.ok) {
          const data = await response.json();
          setBusinessInfo(data);
        }
      } catch (error) {
        console.error('Error fetching business info:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBusinessInfo();
  }, []);

  // Use dynamic business info or fallback to static
  const currentBusinessInfo = businessInfo || hospitalInfo;

  const serviceTypes = [
    'General Inquiry',
    'Schedule Appointment',
    'Urgent Care',
    'Surgery Consultation',
    'Dental Care',
    'Wellness Exam',
    'Pet Microchipping',
    'End of Life Care',
    'On Site Pharmacy',
    'Other'
  ];

  const contactMethods = [
    {
      title: "Phone Call",
      description: "Speak directly with our team for immediate assistance",
      icon: Phone,
      action: `tel:${currentBusinessInfo.phone}`,
      actionText: currentBusinessInfo.phone,
      color: "#10b981"
    },
    {
      title: "Email",
      description: "Send us an email for non-urgent questions",
      icon: Mail,
      action: `mailto:${currentBusinessInfo.email}`,
      actionText: currentBusinessInfo.email,
      color: "#29add3"
    },
    {
      title: "Contact Form",
      description: "Fill out our form below for detailed inquiries",
      icon: MessageSquare,
      action: "#contact-form",
      actionText: "Use Form Below",
      color: "#8b5cf6"
    }
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
      {/* Hero Section */}
      <section className="bg-white">
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center" style={{ paddingTop: '30px', paddingBottom: '15px' }}>
          <h1 className="text-xl font-bold text-gray-900 mb-6">
            Message Us
          </h1>
          <div className="mb-6">
            <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold text-white" style={{ backgroundColor: primaryColor }}>
              Your Voice Matters to Us
            </span>
          </div>
          <p className="text-base text-gray-600 leading-relaxed max-w-3xl mx-auto mb-8">
            Reach out to us with questions, appointments, or feedback. We believe in open communication 
            and are here to listen, support, and provide the best care possible for your beloved pets.
          </p>
        </div>
      </section>

      {/* Contact Methods */}
      <section style={{ backgroundColor: '#f8f9fa', paddingTop: '40px', paddingBottom: '40px' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Choose Your Preferred Contact Method
            </h2>
            <p className="text-gray-600 max-w-3xl mx-auto">
              We offer multiple ways to get in touch based on your needs and preferences
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {contactMethods.map((method, index) => (
              <div key={index} className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow text-center">
                <div className="flex items-center justify-center w-16 h-16 rounded-full mx-auto mb-6" style={{ backgroundColor: `${method.color}15` }}>
                  <method.icon className="h-8 w-8" style={{ color: method.color }} />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">{method.title}</h3>
                <p className="text-gray-700 mb-4 leading-relaxed">{method.description}</p>
                <a
                  href={method.action}
                  className="inline-flex items-center justify-center px-4 py-2 rounded-lg font-medium transition-colors duration-200"
                  style={{ backgroundColor: method.color, color: 'white' }}
                  onMouseEnter={(e) => e.target.style.opacity = '0.9'}
                  onMouseLeave={(e) => e.target.style.opacity = '1'}
                >
                  {method.actionText}
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section id="contact-form" className="bg-white" style={{ paddingTop: '40px', paddingBottom: '40px' }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gray-50 p-8 rounded-xl shadow-lg">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Send Us a Message
              </h2>
              <p className="text-gray-600">
                Fill out the form below and we'll get back to you as soon as possible
              </p>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    Your Name *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      id="name"
                      name="name"
                      required
                      value={contactForm.name}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg transition-colors"
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
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <input
                      type="email"
                      id="email"
                      name="email"
                      required
                      value={contactForm.email}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg transition-colors"
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
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={contactForm.phone}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg transition-colors"
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
                  rows={6}
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

            <div className="mt-6 p-4 rounded-lg" style={{ backgroundColor: '#e6f7fb' }}>
              <div className="flex items-start">
                <CheckCircle className="h-5 w-5 mt-0.5 mr-3 flex-shrink-0" style={{ color: primaryColor }} />
                <div>
                  <p className="text-sm text-gray-700">
                    <strong>Response Time:</strong> We typically respond to messages within 24 hours during business days. 
                    For urgent matters, please call us directly at {currentBusinessInfo.phone}.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Alternative Contact */}
      <section className="bg-white" style={{ paddingTop: '40px', paddingBottom: '40px' }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Need Immediate Assistance?
            </h2>
            <p className="text-gray-600">
              For urgent matters or to schedule an appointment, call us directly
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="p-6 rounded-xl text-center" style={{ backgroundColor: '#e6f7fb', border: `2px solid ${primaryColor}` }}>
              <Phone className="h-8 w-8 mx-auto mb-4" style={{ color: primaryColor }} />
              <h3 className="text-lg font-bold mb-2" style={{ color: primaryColor }}>Call Us Now</h3>
              <p className="text-gray-700 mb-4">Speak directly with our team</p>
              <a
                href={`tel:${currentBusinessInfo.phone}`}
                className="inline-flex items-center justify-center text-white px-6 py-3 rounded-lg font-semibold transition-colors duration-200"
                style={{ backgroundColor: primaryColor }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#2196c7'}
                onMouseLeave={(e) => e.target.style.backgroundColor = primaryColor}
              >
                <Phone className="mr-2 h-5 w-5" />
                {currentBusinessInfo.phone}
              </a>
            </div>

            <div className="bg-green-50 border-2 border-green-200 p-6 rounded-xl text-center">
              <Clock className="h-8 w-8 text-green-600 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-green-900 mb-2">Our Hours</h3>
              <p className="text-green-700 mb-4">Check when we're available</p>
              <Link
                to="/our-hours"
                className="inline-flex items-center justify-center bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors duration-200"
              >
                <Clock className="mr-2 h-5 w-5" />
                View Hours
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section style={{ background: `linear-gradient(135deg, ${primaryColor} 0%, #2196c7 100%)`, paddingTop: '40px', paddingBottom: '40px' }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-bold text-white mb-4" style={{ fontSize: '1rem' }}>
            We're Here to Help
          </h2>
          <p className="mb-8 text-white" style={{ fontSize: '1rem' }}>
            Whether you have questions, need to schedule an appointment, or want to learn more about our services
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
            <Link
              to="/reach-us"
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
              Get Directions
              <MapPin className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default MessageUs;