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
      <section className="relative overflow-hidden" style={{ background: `linear-gradient(135deg, ${primaryBg} 0%, #ffffff 50%, #f0fdff 100%)` }}>
        <div className="absolute inset-0 bg-white/40"></div>
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8" style={{ paddingTop: '40px', paddingBottom: '40px' }}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-8">
              <div className="space-y-6">
                <div className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium" style={{ backgroundColor: primaryBg, color: primaryColor }}>
                  <Radio className="h-4 w-4 mr-2" />
                  Quick • Safe • Affordable
                </div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 leading-tight">
                  Pet Microchipping
                  <span className="block text-lg font-medium mt-2" style={{ color: primaryColor }}>
                    Permanent Protection for Your Beloved Pet
                  </span>
                </h1>
                <p className="text-gray-700 leading-relaxed text-lg">
                  Losing a pet can be a heart-wrenching experience—but microchipping offers a powerful tool 
                  to prevent long-term separation. At Pets and Vets Animal Hospital, we make microchipping 
                  quick, safe, and effective, giving you peace of mind that your pet can always find their way home.
                </p>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-4">
                {benefitStats.map((stat, index) => (
                  <div key={index} className="text-center p-4 bg-white/60 backdrop-blur-sm rounded-lg">
                    <div className="flex items-center justify-center w-12 h-12 rounded-full mx-auto mb-2" style={{ backgroundColor: `${stat.color}15` }}>
                      <stat.icon className="h-6 w-6" style={{ color: stat.color }} />
                    </div>
                    <h3 className="font-bold text-gray-900">{stat.title}</h3>
                    <p className="text-sm text-gray-600">{stat.description}</p>
                  </div>
                ))}
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <a
                  href={`tel:${hospitalInfo.phone}`}
                  className="inline-flex items-center justify-center text-white px-8 py-4 rounded-lg font-semibold transition-all duration-200 shadow-lg hover:shadow-xl group"
                  style={{ backgroundColor: primaryColor }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#2196c7'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = primaryColor}
                >
                  <Phone className="mr-2 h-5 w-5" />
                  Schedule Now: {hospitalInfo.phone}
                </a>
                <Link
                  to="/contact"
                  className="inline-flex items-center justify-center border-2 px-8 py-4 rounded-lg font-semibold transition-all duration-200"
                  style={{ 
                    borderColor: primaryColor, 
                    color: primaryColor 
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = primaryColor;
                    e.target.style.color = 'white';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = 'transparent';
                    e.target.style.color = primaryColor;
                  }}
                >
                  Learn More
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </div>
            </div>

            {/* Right Content - Visual */}
            <div className="relative">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl bg-white p-8">
                <div className="text-center">
                  <div className="flex items-center justify-center w-24 h-24 rounded-full mx-auto mb-6" style={{ backgroundColor: primaryBg }}>
                    <Radio className="h-12 w-12" style={{ color: primaryColor }} />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Microchip Size Comparison</h3>
                  <div className="bg-gray-50 p-6 rounded-xl">
                    <div className="flex items-center justify-center space-x-8">
                      <div className="text-center">
                        <div className="w-2 h-6 bg-yellow-600 rounded-full mx-auto mb-2"></div>
                        <p className="text-sm font-medium text-gray-700">Rice Grain</p>
                      </div>
                      <div className="text-center">
                        <div className="w-2 h-6 rounded-full mx-auto mb-2" style={{ backgroundColor: primaryColor }}></div>
                        <p className="text-sm font-medium text-gray-700">Microchip</p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mt-4">
                      Same size as a grain of rice - tiny but powerful protection!
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Microchips Matter */}
      <section className="bg-white" style={{ paddingTop: '40px', paddingBottom: '40px' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Why Microchips Matter
            </h2>
            <p className="text-gray-600 max-w-3xl mx-auto leading-relaxed">
              A microchip is a tiny electronic device—about the size and shape of a grain of rice—implanted just under your pet's neck skin. 
              The process, using a needle similar to a vaccine injection, is quick and minimally invasive.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {whyMicrochips.map((reason, index) => (
              <div key={index} className="bg-gray-50 p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow text-center">
                <div className="flex items-center justify-center w-16 h-16 rounded-full mx-auto mb-6" style={{ backgroundColor: `${reason.color}15` }}>
                  <reason.icon className="h-8 w-8" style={{ color: reason.color }} />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">{reason.title}</h3>
                <p className="text-gray-700 leading-relaxed">{reason.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Safety Combo Section */}
      <section style={{ backgroundColor: primaryBg, paddingTop: '40px', paddingBottom: '40px' }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-white p-8 rounded-xl shadow-lg">
            <div className="flex items-center justify-center mb-6">
              <div className="flex items-center space-x-4">
                <div className="flex items-center justify-center w-12 h-12 rounded-full" style={{ backgroundColor: `${accentGreen}15` }}>
                  <Award className="h-6 w-6" style={{ color: accentGreen }} />
                </div>
                <span className="text-2xl font-bold text-gray-700">+</span>
                <div className="flex items-center justify-center w-12 h-12 rounded-full" style={{ backgroundColor: `${primaryColor}15` }}>
                  <Radio className="h-6 w-6" style={{ color: primaryColor }} />
                </div>
                <span className="text-2xl font-bold text-gray-700">=</span>
                <div className="flex items-center justify-center w-12 h-12 rounded-full" style={{ backgroundColor: `${accentBlue}15` }}>
                  <Shield className="h-6 w-6" style={{ color: accentBlue }} />
                </div>
              </div>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Microchip + Collar = The Ultimate Safety Combo
            </h2>
            <p className="text-gray-700 leading-relaxed">
              While collars with ID tags are essential, they can fall off or become unreadable. A microchip offers 
              permanent, unalterable identification linked directly to you. <strong>The best practice? Use both methods 
              for the highest level of protection.</strong>
            </p>
          </div>
        </div>
      </section>

      {/* Trust Features */}
      <section className="bg-white" style={{ paddingTop: '40px', paddingBottom: '40px' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl font-bold text-gray-900 mb-12 text-center">
            Why Trust Pets and Vets Animal Hospital for Microchipping?
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {trustFeatures.map((feature, index) => (
              <div key={index} className="text-center p-6 bg-gray-50 rounded-xl shadow-md hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-center w-16 h-16 rounded-full mx-auto mb-6" style={{ backgroundColor: primaryBg }}>
                  <feature.icon className="h-8 w-8" style={{ color: primaryColor }} />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-700 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Service Areas */}
      <section style={{ backgroundColor: primaryBg, paddingTop: '40px', paddingBottom: '40px' }}>
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
      <section style={{ background: `linear-gradient(135deg, ${primaryColor} 0%, #2196c7 100%)`, paddingTop: '40px', paddingBottom: '40px' }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center mb-4">
            <Radio className="h-8 w-8 mr-3 text-white" />
            <h2 className="font-bold text-white text-xl">
              Make Microchipping a Part of Your Pet's Protection
            </h2>
          </div>
          <p className="mb-8 text-white text-lg leading-relaxed">
            Don't leave your pet's safe return to chance. Contact us today to add microchipping to your pet's veterinary care.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href={`tel:${hospitalInfo.phone}`}
              className="inline-flex items-center justify-center bg-white px-8 py-4 rounded-lg font-bold text-lg transition-colors duration-200 shadow-lg hover:shadow-xl"
              style={{ color: primaryColor }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#f9fafb'}
              onMouseLeave={(e) => e.target.style.backgroundColor = 'white'}
            >
              <Phone className="mr-2 h-6 w-6" />
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
              Schedule Online
              <Calendar className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Bottom Info Bar */}
      <section className="bg-gray-800 text-white" style={{ paddingTop: '20px', paddingBottom: '20px' }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center text-center md:text-left">
            <div className="mb-4 md:mb-0">
              <div className="flex items-center justify-center md:justify-start mb-2">
                <Clock className="h-4 w-4 mr-2" style={{ color: primaryColor }} />
                <span className="font-semibold">Quick Procedure</span>
              </div>
              <p className="text-gray-300 text-sm">Takes only seconds to complete</p>
            </div>
            <div className="mb-4 md:mb-0">
              <div className="flex items-center justify-center md:justify-start mb-2">
                <MapPin className="h-4 w-4 mr-2" style={{ color: primaryColor }} />
                <span className="font-semibold">Convenient Location</span>
              </div>
              <p className="text-gray-300 text-sm">South Riding, VA</p>
            </div>
            <div>
              <div className="flex items-center justify-center md:justify-start mb-2">
                <Star className="h-4 w-4 mr-2" style={{ color: primaryColor }} />
                <span className="font-semibold">Professional Care</span>
              </div>
              <p className="text-gray-300 text-sm">Skilled veterinary team</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default PetMicrochipping;