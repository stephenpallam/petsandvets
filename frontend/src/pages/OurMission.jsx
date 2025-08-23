import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Heart, 
  MapPin,
  Phone,
  Star,
  Target,
  CheckCircle
} from 'lucide-react';
import { hospitalInfo } from '../mock';

const OurMission = () => {
  const primaryColor = '#29add3';
  const primaryLight = '#5bc0db';
  const primaryBg = '#e6f7fb';

  const serviceAreas = [
    "South Riding", "Chantilly", "Aldie", "Ashburn", "Herndon", "Centreville", "Fairfax"
  ];

  const missionPoints = [
    {
      title: "Quality Pet Care for All",
      description: "We believe quality pet care, food, medicines, and pet supplies should be available to all caring and responsible pet owners",
      icon: Heart
    },
    {
      title: "State-of-the-Art Facility",
      description: "Provide high-quality treatment options in our modern facility equipped with the latest veterinary technologies",
      icon: Star
    },
    {
      title: "Comprehensive Services",
      description: "Our licensed veterinarians provide vaccinations, parasite control, and comprehensive care to keep your pets healthy",
      icon: CheckCircle
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mission Statement */}
      <section className="bg-white" style={{ paddingTop: '40px', paddingBottom: '40px' }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Our Mission
            </h2>
          </div>
          
          <div className="space-y-8">
            <p className="text-base text-gray-600 leading-relaxed">
              Pets & Vets Animal Hospital is pleased to deliver the very best veterinary care to your pets residing in 
              South Riding, Chantilly, Aldie, Ashburn, Herndon, Centreville, and Fairfax in Northern Virginia. Our team 
              of licensed veterinarians and support staff provides vaccinations, parasite control, and comprehensive care 
              to ensure your family pets stay healthy.
            </p>
            
            <p className="text-base text-gray-600 leading-relaxed">
              We believe quality pet care, food, medicines, and pet supplies should be available to all caring and 
              responsible pet owners. It is our mission to provide high-quality treatment options for your pets in our 
              state-of-the-art facility, which is equipped with the latest veterinary technologies.
            </p>
            
            <div className="p-8 rounded-xl border-l-4" style={{ backgroundColor: '#f8f9fa', borderColor: primaryColor }}>
              <div className="flex items-center mb-4">
                <Heart className="h-6 w-6 mr-3" style={{ color: primaryColor }} />
                <h3 className="text-xl font-semibold text-gray-900">Our Promise</h3>
              </div>
              <p className="text-lg font-medium italic text-gray-800">
                "We strive to provide excellent modern care for the modern pet, because every pet deserves the best possible care."
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Mission Points */}
      <section style={{ backgroundColor: '#f8f9fa', paddingTop: '40px', paddingBottom: '40px' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl font-bold text-gray-900 mb-12 text-center">
            How We Fulfill Our Mission
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {missionPoints.map((point, index) => (
              <div key={index} className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow text-center">
                <div className="flex items-center justify-center w-16 h-16 rounded-full mx-auto mb-6" style={{ backgroundColor: '#f8f9fa' }}>
                  <point.icon className="h-8 w-8" style={{ color: primaryColor }} />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">{point.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{point.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Service Areas */}
      <section className="bg-white" style={{ paddingTop: '40px', paddingBottom: '40px' }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            Proudly Serving Northern Virginia
          </h2>
          <p className="text-gray-700 mb-6">
            Delivering exceptional veterinary care across these communities:
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {serviceAreas.map((area, index) => (
              <span key={index} className="px-4 py-2 rounded-full text-white font-medium" style={{ backgroundColor: primaryColor }}>
                {area}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section style={{ background: `linear-gradient(135deg, ${primaryColor} 0%, #2196c7 100%)`, paddingTop: '40px', paddingBottom: '40px' }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-bold text-white mb-4 text-xl">
            Experience Our Mission in Action
          </h2>
          <p className="mb-8 text-white text-lg">
            Contact us today to schedule an appointment and see how we put our mission into practice
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href={`tel:${hospitalInfo.phone}`}
              className="inline-flex items-center justify-center bg-white px-8 py-4 rounded-lg font-semibold transition-colors duration-200"
              style={{ color: primaryColor }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#f9fafb'}
              onMouseLeave={(e) => e.target.style.backgroundColor = 'white'}
            >
              <Phone className="mr-2 h-5 w-5" />
              Call Now: {hospitalInfo.phone}
            </a>
            <Link
              to="/contact"
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

export default OurMission;