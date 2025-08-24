import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Heart, 
  Shield, 
  Award, 
  Users,
  MapPin,
  Phone,
  Star,
  CheckCircle
} from 'lucide-react';
import { hospitalInfo } from '../mock';

const OurCoreValues = () => {
  const primaryColor = '#29add3';
  const primaryLight = '#5bc0db';
  const primaryBg = '#e6f7fb';

  const values = [
    {
      icon: Heart,
      title: "Compassionate Care",
      description: "We treat every pet with the same love and attention we would give our own family members.",
      color: "#ef4444"
    },
    {
      icon: Shield,
      title: "Quality Medicine",
      description: "Using the latest medical technology and proven treatment methods for the best outcomes.",
      color: "#10b981"
    },
    {
      icon: Users,
      title: "Collaborative Approach",
      description: "We work closely with pet owners to develop the best care plans for each individual pet.",
      color: "#3b82f6"
    },
    {
      icon: Award,
      title: "Experienced Team",
      description: "Our veterinarians and staff bring years of experience and continuing education to every case.",
      color: "#f59e0b"
    }
  ];

  const valueDetails = [
    {
      title: "Patient-Centered Care",
      description: "Every decision we make is based on what's best for your pet's health and wellbeing",
      icon: Heart
    },
    {
      title: "Continuous Learning",
      description: "Our team stays current with the latest veterinary advances and best practices",
      icon: Star
    },
    {
      title: "Transparent Communication",
      description: "We believe in keeping pet owners informed every step of the way",
      icon: CheckCircle
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-white">
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center" style={{ paddingTop: '30px', paddingBottom: '15px' }}>
          <h1 className="text-xl font-bold text-gray-900 mb-6">
            Our Values
          </h1>
          <div className="mb-6">
            <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold text-white" style={{ backgroundColor: primaryColor }}>
              Compassionate • Professional • Trustworthy • Experienced
            </span>
          </div>
          <p className="text-base text-gray-600 leading-relaxed max-w-3xl mx-auto">
            These four core values shape every interaction, decision, and treatment plan at Pets & Vets Animal Hospital
          </p>
        </div>
      </section>

      {/* Core Values Grid */}
      <section className="bg-[#f8f9fa] py-6">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {values.map((value, index) => (
              <div key={index} className="bg-white p-6 rounded-xl shadow-md">
                <div className="flex items-center mb-4">
                  <div className="flex items-center justify-center w-12 h-12 rounded-full mr-4" style={{ backgroundColor: `${value.color}15` }}>
                    <value.icon className="h-6 w-6" style={{ color: value.color }} />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">{value.title}</h3>
                </div>
                <p className="text-gray-600 text-sm leading-relaxed">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values in Action */}
      <section style={{ backgroundColor: '#f8f9fa', paddingTop: '30px', paddingBottom: '30px' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl font-bold text-gray-900 mb-8 text-center">
            Our Values in Action
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {valueDetails.map((detail, index) => (
              <div key={index} className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow text-center">
                <div className="flex items-center justify-center w-16 h-16 rounded-full mx-auto mb-6" style={{ backgroundColor: '#f8f9fa' }}>
                  <detail.icon className="h-8 w-8" style={{ color: primaryColor }} />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">{detail.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{detail.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values Promise */}
      <section className="bg-white" style={{ paddingTop: '30px', paddingBottom: '30px' }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-8 rounded-xl border-l-4" style={{ borderColor: primaryColor }}>
            <div className="flex items-center mb-4">
              <div className="flex items-center justify-center w-12 h-12 rounded-full mr-4" style={{ backgroundColor: '#f8f9fa' }}>
                <CheckCircle className="h-6 w-6" style={{ color: primaryColor }} />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Our Promise to You</h3>
            </div>
            <p className="text-gray-800 leading-relaxed mb-4">
              When you choose Pets & Vets Animal Hospital, you're choosing a team that lives by these values every single day. 
              From the moment you walk through our doors to the ongoing care of your beloved pet, these principles guide our actions 
              and decisions.
            </p>
            <div className="flex items-center">
              <Heart className="h-5 w-5 mr-2 text-red-500" />
              <span className="text-gray-800 font-medium">Compassionate • Professional • Trustworthy • Experienced</span>
            </div>
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section style={{ background: `linear-gradient(135deg, ${primaryColor} 0%, #2196c7 100%)`, paddingTop: '40px', paddingBottom: '40px' }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-bold text-white mb-4 text-xl">
            Experience Our Values Firsthand
          </h2>
          <p className="mb-8 text-white text-lg">
            See how our core values translate into exceptional care for your pet
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
              Schedule Visit
              <MapPin className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default OurCoreValues;