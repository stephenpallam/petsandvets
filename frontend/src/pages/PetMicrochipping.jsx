import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Heart, 
  Shield, 
  Phone,
  MapPin,
  Calendar,
  CheckCircle,
  Zap,
  Timer,
  Award,
  Users,
  Radio,
  Smartphone,
  Search,
  ArrowRight,
  Clock,
  DollarSign,
  Star
} from 'lucide-react';
import { hospitalInfo } from '../mock';

const PetMicrochipping = () => {
  const primaryColor = '#29add3';
  const primaryLight = '#5bc0db';
  const primaryBg = '#e6f7fb';
  const accentGreen = '#10b981';
  const accentBlue = '#3b82f6';

  const whyMicrochips = [
    {
      title: "Permanent Identification",
      description: "A tiny electronic device about the size of a grain of rice, implanted safely under your pet's skin",
      icon: Radio,
      color: "#10b981"
    },
    {
      title: "Quick Scanning Process",
      description: "Shelters and veterinary clinics can instantly scan the chip to access your contact information",
      icon: Search,
      color: "#3b82f6"
    },
    {
      title: "Swift Reunification",
      description: "Helps reunite you with your lost pet quickly and efficiently",
      icon: Heart,
      color: "#ec4899"
    }
  ];

  const benefitStats = [
    {
      title: "Quick",
      description: "The procedure takes only seconds",
      icon: Timer,
      color: "#10b981"
    },
    {
      title: "Safe",
      description: "Comparable to a routine vaccination",
      icon: Shield,
      color: "#3b82f6"
    },
    {
      title: "Affordable",
      description: "A small price for potential years of peace of mind",
      icon: DollarSign,
      color: "#f59e0b"
    }
  ];

  const trustFeatures = [
    {
      title: "Professional Placement",
      description: "Carried out by our skilled veterinary team",
      icon: Award
    },
    {
      title: "Secure Pet-Owner Connection",
      description: "Your contact info is linked securely to the chip",
      icon: Shield
    },
    {
      title: "Located Close to Home",
      description: "We serve South Riding, Aldie, Ashburn, Chantilly, Centreville, Reston, and Herndon",
      icon: MapPin
    }
  ];

  const serviceAreas = [
    "South Riding", "Aldie", "Ashburn", "Chantilly", "Centreville", "Reston", "Herndon"
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-white pt-6" style={{ paddingBottom: '8px' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h1 className="text-xl font-bold text-gray-900 mb-4">
              Microchipping
            </h1>
            <div className="mb-6">
              <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold text-white" style={{ backgroundColor: primaryColor }}>
                Permanent Pet Protection
              </span>
            </div>
            <p className="text-base text-gray-600 leading-relaxed max-w-4xl mx-auto">
              Losing a pet can be a heart-wrenching experience—but microchipping offers a powerful tool 
              to prevent long-term separation. At Pets and Vets Animal Hospital, we make microchipping 
              quick, safe, and effective, giving you peace of mind that your pet can always find their way home.
            </p>
          </div>
        </div>
      </section>

      {/* Why Microchips Matter */}
      <section className="bg-[#f8f9fa] py-6">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Why Microchips Matter
            </h2>
            <p className="text-gray-600 max-w-3xl mx-auto leading-relaxed">
              A microchip is a tiny electronic device—about the size and shape of a grain of rice—implanted just under your pet's neck skin. 
              The process, using a needle similar to a vaccine injection, is quick and minimally invasive.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {whyMicrochips.map((reason, index) => (
              <div key={index} className="bg-white p-4 rounded-lg shadow-sm text-center">
                <div className="flex items-center justify-center w-12 h-12 rounded-full mx-auto mb-3" style={{ backgroundColor: `${reason.color}15` }}>
                  <reason.icon className="h-6 w-6" style={{ color: reason.color }} />
                </div>
                <h3 className="text-base font-semibold text-gray-900 mb-2">{reason.title}</h3>
                <p className="text-gray-700 text-sm leading-relaxed">{reason.description}</p>
              </div>
            ))}
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            {benefitStats.map((stat, index) => (
              <div key={index} className="text-center p-4 bg-white rounded-lg shadow-sm">
                <div className="flex items-center justify-center w-12 h-12 rounded-full mx-auto mb-3" style={{ backgroundColor: `${stat.color}15` }}>
                  <stat.icon className="h-6 w-6" style={{ color: stat.color }} />
                </div>
                <h3 className="font-bold text-gray-900 text-base">{stat.title}</h3>
                <p className="text-gray-600 text-sm">{stat.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Safety Combo Section */}
      <section className="bg-white py-6">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-gray-50 p-6 rounded-lg">
            <div className="flex items-center justify-center mb-4">
              <div className="flex items-center space-x-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-full" style={{ backgroundColor: `${accentGreen}15` }}>
                  <Award className="h-5 w-5" style={{ color: accentGreen }} />
                </div>
                <span className="text-xl font-bold text-gray-700">+</span>
                <div className="flex items-center justify-center w-10 h-10 rounded-full" style={{ backgroundColor: `${primaryColor}15` }}>
                  <Radio className="h-5 w-5" style={{ color: primaryColor }} />
                </div>
                <span className="text-xl font-bold text-gray-700">=</span>
                <div className="flex items-center justify-center w-10 h-10 rounded-full" style={{ backgroundColor: `${accentBlue}15` }}>
                  <Shield className="h-5 w-5" style={{ color: accentBlue }} />
                </div>
              </div>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Microchip + Collar = The Ultimate Safety Combo
            </h2>
            <p className="text-gray-700 leading-relaxed text-sm">
              While collars with ID tags are essential, they can fall off or become unreadable. A microchip offers 
              permanent, unalterable identification linked directly to you. <strong>The best practice? Use both methods 
              for the highest level of protection.</strong>
            </p>
          </div>
        </div>
      </section>

      {/* Trust Features */}
      <section className="bg-[#f8f9fa] py-6">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl font-bold text-gray-900 mb-8 text-center">
            Why Trust Pets and Vets Animal Hospital for Microchipping?
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {trustFeatures.map((feature, index) => (
              <div key={index} className="text-center p-4 bg-white rounded-lg shadow-sm">
                <div className="flex items-center justify-center w-12 h-12 rounded-full mx-auto mb-3" style={{ backgroundColor: primaryBg }}>
                  <feature.icon className="h-6 w-6" style={{ color: primaryColor }} />
                </div>
                <h3 className="text-base font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-700 text-sm leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Service Areas */}
      <section className="bg-white py-6">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            Proudly Serving Your Community
          </h2>
          <p className="text-gray-700 mb-6">
            Convenient microchipping services across Northern Virginia:
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

      {/* Final CTA */}
      <section style={{ background: `linear-gradient(135deg, ${primaryColor} 0%, #2196c7 100%)` }} className="py-6">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center mb-4">
            <Radio className="h-6 w-6 mr-2 text-white" />
            <h2 className="font-bold text-white text-base">
              Make Microchipping a Part of Your Pet's Protection
            </h2>
          </div>
          <p className="mb-6 text-white leading-relaxed" style={{ fontSize: '1rem' }}>
            Don't leave your pet's safe return to chance. Contact us today to add microchipping to your pet's veterinary care.
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
              to="/reach-us"
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
              Schedule Online
              <Calendar className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
};

export default PetMicrochipping;