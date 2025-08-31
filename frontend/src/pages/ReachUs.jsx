import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  MapPin, 
  Phone, 
  Mail, 
  Navigation,
  Clock,
  AlertCircle
} from 'lucide-react';
import { hospitalInfo } from '../mock';

const ReachUs = () => {
  const [businessInfo, setBusinessInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const primaryColor = '#29add3';
  const primaryLight = '#5bc0db';
  const primaryBg = '#e6f7fb';

  const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || import.meta.env.REACT_APP_BACKEND_URL || window.location.origin;

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

  const quickInfo = [
    {
      title: "Phone",
      value: currentBusinessInfo.phone,
      icon: Phone,
      link: `tel:${currentBusinessInfo.phone}`,
      color: "#10b981"
    },
    {
      title: "Email",
      value: currentBusinessInfo.email,
      icon: Mail,
      link: `mailto:${currentBusinessInfo.email}`,
      color: "#3b82f6"
    },
    {
      title: "Address",
      value: currentBusinessInfo.address,
      icon: MapPin,
      link: `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(currentBusinessInfo.address)}`,
      color: "#8b5cf6"
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: primaryColor }}></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-white">
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center" style={{ paddingTop: '30px', paddingBottom: '15px' }}>
          <h1 className="text-xl font-bold text-gray-900 mb-6">
            Reach Us
          </h1>
          <div className="mb-6">
            <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold text-white" style={{ backgroundColor: primaryColor }}>
              Your Partner in Pet Care Excellence
            </span>
          </div>
          <p className="text-base text-gray-600 leading-relaxed max-w-3xl mx-auto mb-8">
            Multiple convenient ways to reach us for appointments, questions, or urgent care needs. 
            Our dedicated team is here to provide compassionate support for you and your beloved pets.
          </p>
        </div>
      </section>

      {/* Quick Contact Info */}
      <section style={{ backgroundColor: '#f8f9fa', paddingTop: '40px', paddingBottom: '40px' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {quickInfo.map((info, index) => (
              <div key={index} className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow text-center">
                <div className="flex items-center justify-center w-16 h-16 rounded-full mx-auto mb-6" style={{ backgroundColor: `${info.color}15` }}>
                  <info.icon className="h-8 w-8" style={{ color: info.color }} />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">{info.title}</h3>
                <a
                  href={info.link}
                  className="text-gray-700 hover:text-blue-600 transition-colors duration-200 font-medium"
                  target={info.title === "Address" ? "_blank" : undefined}
                  rel={info.title === "Address" ? "noopener noreferrer" : undefined}
                >
                  {info.value}
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Main Location Section */}
      <section className="bg-white" style={{ paddingTop: '40px', paddingBottom: '40px' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gray-50 p-8 rounded-xl shadow-lg">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center mb-4 lg:mb-0">
                <MapPin className="mr-3 h-6 w-6" style={{ color: primaryColor }} />
                Our Location
              </h2>
              <div className="flex flex-col sm:flex-row gap-4">
                <a 
                  href={`tel:${hospitalInfo.phone}`}
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
                  {hospitalInfo.phone}
                </a>
                <a 
                  href={`mailto:${hospitalInfo.email}`}
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
                  {hospitalInfo.email}
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
            
            <div className="mt-4 p-4 rounded-lg" style={{ backgroundColor: '#f8f9fa' }}>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-semibold text-gray-900">{hospitalInfo.address}</p>
                  <p className="text-sm text-gray-600 mt-1">Located beside Sweet Frog in Peacock Market Plaza</p>
                </div>
                <button 
                  className="mt-3 sm:mt-0 text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200"
                  style={{ backgroundColor: primaryColor }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#2196c7'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = primaryColor}
                  onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(hospitalInfo.address)}`, '_blank')}
                >
                  <Navigation className="inline-block w-4 h-4 mr-2" />
                  Get Directions
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Important Information */}
      <section className="bg-white" style={{ paddingTop: '40px', paddingBottom: '40px' }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Operating Note */}
            <div className="bg-blue-50 border-2 border-blue-200 p-6 rounded-xl">
              <div className="flex items-start">
                <Clock className="h-6 w-6 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
                <div>
                  <h3 className="text-lg font-bold text-blue-900 mb-2">By Appointment Only</h3>
                  <p className="text-blue-700">
                    All services are provided by appointment. Please call ahead to schedule your visit for both 
                    general practice and urgent care services.
                  </p>
                </div>
              </div>
            </div>

            {/* Emergency Information */}
            <div className="bg-red-50 border-2 border-red-200 p-6 rounded-xl">
              <div className="flex items-start">
                <AlertCircle className="h-6 w-6 text-red-600 mt-0.5 mr-3 flex-shrink-0" />
                <div>
                  <h3 className="text-lg font-bold text-red-900 mb-2">Life-Threatening Emergencies</h3>
                  <p className="text-red-700 mb-2">
                    For emergencies outside our hours, contact the nearest 24-hour emergency hospital:
                  </p>
                  <p className="text-red-600 font-semibold">
                    VCA SouthPaws: (703) 752-9100
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section style={{ background: `linear-gradient(135deg, ${primaryColor} 0%, #2196c7 100%)`, paddingTop: '40px', paddingBottom: '40px' }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-bold text-white mb-4 text-xl">
            Ready to Visit Us?
          </h2>
          <p className="mb-8" style={{ color: 'white', fontSize: '1rem' }}>
            Call us today to schedule an appointment or get directions to our convenient South Riding location
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href={`tel:${hospitalInfo.phone}`}
              className="inline-flex items-center justify-center bg-white px-8 py-3 rounded-lg font-semibold transition-colors duration-200"
              style={{ color: primaryColor }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#f9fafb'}
              onMouseLeave={(e) => e.target.style.backgroundColor = 'white'}
            >
              <Phone className="mr-2 h-5 w-5" />
              Call Now: {hospitalInfo.phone}
            </a>
            <Link
              to="/our-hours"
              className="inline-flex items-center justify-center border-2 border-white text-white px-8 py-3 rounded-lg font-semibold transition-colors duration-200"
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = 'white';
                e.target.style.color = primaryColor;
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'transparent';  
                e.target.style.color = 'white';
              }}
            >
              View Hours
              <Clock className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ReachUs;