import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Heart, 
  Shield, 
  Phone,
  MapPin,
  Calendar,
  CheckCircle,
  Clock,
  Truck,
  Package,
  Star,
  ArrowRight,
  Pill,
  ShoppingBag,
  Home,
  Zap,
  Award,
  Navigation,
  Mail,
  Users
} from 'lucide-react';
import { hospitalInfo } from '../mock';

const OnSitePharmacy = () => {
  const primaryColor = '#29add3';
  const primaryLight = '#5bc0db';
  const primaryBg = '#e6f7fb';
  const accentGreen = '#10b981';
  const accentBlue = '#3b82f6';
  const accentPurple = '#8b5cf6';

  const pharmacyBenefits = [
    {
      title: "Immediate Access to Meds",
      description: "Get your pet's prescriptions filled and leave with peace of mind—no more detours or delays",
      icon: Zap,
      color: "#10b981"
    },
    {
      title: "Easy Refill Delivery",
      description: "Need a refill later? We can conveniently mail medications and supplements directly to your door",
      icon: Truck,
      color: "#3b82f6"
    },
    {
      title: "Trusted and Tailored for Pets",
      description: "Our pharmacy only stocks veterinary-approved medications, ensuring proper dosing and safe use",
      icon: Shield,
      color: "#8b5cf6"
    }
  ];

  const processSteps = [
    {
      step: "See Your Vet",
      description: "Get an accurate diagnosis and treatment plan",
      icon: Heart,
      number: "01"
    },
    {
      step: "Head to In-House Pharmacy",
      description: "No extra errands—walk straight to our pharmacy",
      icon: Package,
      number: "02"
    },
    {
      step: "Get Back to Care Fast",
      description: "Leave efficiently with everything your pet needs",
      icon: Home,
      number: "03"
    },
    {
      step: "Request Refills Online",
      description: "Skip trips—order refills online and rely on delivery service",
      icon: Mail,
      number: "04"
    }
  ];

  const whyItMatters = [
    {
      title: "Time-Saving Convenience",
      description: "Perfect for busy schedules across South Riding and beyond",
      icon: Clock
    },
    {
      title: "No Waiting in Lines",
      description: "Skip external pharmacies and long wait times",
      icon: Users
    },
    {
      title: "Consistent, Accurate Medication",
      description: "Ensures your pet's safety and effective treatment",
      icon: Award
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
          <div className="max-w-4xl mx-auto text-center">
            <div className="space-y-8">
              <div className="space-y-6">
                <div className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium" style={{ backgroundColor: primaryBg, color: primaryColor }}>
                  <Pill className="h-4 w-4 mr-2" />
                  Convenient • Fast • Trusted
                </div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 leading-tight">
                  On-Site Pharmacy
                  <span className="block text-lg font-medium mt-2" style={{ color: primaryColor }}>
                    Convenient Care Right at Our Hospital
                  </span>
                </h1>
                <p className="text-gray-700 leading-relaxed text-lg max-w-4xl mx-auto">
                  At Pets and Vets Animal Hospital, we make keeping your pet healthy easier and faster with our 
                  on-site pharmacy. Skip the extra stop and get the medications your pet needs—immediately following your appointment.
                </p>
              </div>

              {/* Key Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
                <div className="text-center p-6 bg-white/60 backdrop-blur-sm rounded-lg">
                  <div className="flex items-center justify-center w-16 h-16 rounded-full mx-auto mb-4" style={{ backgroundColor: `${accentGreen}15` }}>
                    <Zap className="h-8 w-8" style={{ color: accentGreen }} />
                  </div>
                  <h3 className="font-bold text-gray-900 text-lg">Immediate</h3>
                  <p className="text-gray-600">No waiting or delays</p>
                </div>
                <div className="text-center p-6 bg-white/60 backdrop-blur-sm rounded-lg">
                  <div className="flex items-center justify-center w-16 h-16 rounded-full mx-auto mb-4" style={{ backgroundColor: `${accentBlue}15` }}>
                    <Truck className="h-8 w-8" style={{ color: accentBlue }} />
                  </div>
                  <h3 className="font-bold text-gray-900 text-lg">Delivery</h3>
                  <p className="text-gray-600">Refills mailed to your door</p>
                </div>
                <div className="text-center p-6 bg-white/60 backdrop-blur-sm rounded-lg">
                  <div className="flex items-center justify-center w-16 h-16 rounded-full mx-auto mb-4" style={{ backgroundColor: `${accentPurple}15` }}>
                    <Shield className="h-8 w-8" style={{ color: accentPurple }} />
                  </div>
                  <h3 className="font-bold text-gray-900 text-lg">Trusted</h3>
                  <p className="text-gray-600">Veterinary-approved only</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Our Pharmacy */}
      <section className="bg-white" style={{ paddingTop: '40px', paddingBottom: '40px' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Why Choose Our In-House Pharmacy?
            </h2>
            <p className="text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Our on-site pharmacy provides immediate access to the medications your pet needs, 
              with the convenience and trust you deserve.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {pharmacyBenefits.map((benefit, index) => (
              <div key={index} className="bg-gray-50 p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-center w-16 h-16 rounded-full mx-auto mb-6" style={{ backgroundColor: `${benefit.color}15` }}>
                  <benefit.icon className="h-8 w-8" style={{ color: benefit.color }} />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3 text-center">{benefit.title}</h3>
                <p className="text-gray-700 leading-relaxed text-center">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Process Steps */}
      <section style={{ backgroundColor: primaryBg, paddingTop: '40px', paddingBottom: '40px' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl font-bold text-gray-900 mb-12 text-center">
            A Smoother Experience, Every Time
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {processSteps.map((step, index) => (
              <div key={index} className="bg-white p-6 rounded-xl shadow-md text-center relative">
                <div className="absolute top-4 right-4 w-8 h-8 rounded-full text-white text-sm font-bold flex items-center justify-center" style={{ backgroundColor: primaryColor }}>
                  {step.number}
                </div>
                <div className="flex items-center justify-center w-16 h-16 rounded-full mx-auto mb-6" style={{ backgroundColor: primaryBg }}>
                  <step.icon className="h-8 w-8" style={{ color: primaryColor }} />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">{step.step}</h3>
                <p className="text-gray-700 text-sm leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why It Matters */}
      <section className="bg-white" style={{ paddingTop: '40px', paddingBottom: '40px' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl font-bold text-gray-900 mb-12 text-center">
            Why It Matters for Pet Owners
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {whyItMatters.map((reason, index) => (
              <div key={index} className="text-center p-6 bg-gray-50 rounded-xl shadow-md hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-center w-16 h-16 rounded-full mx-auto mb-6" style={{ backgroundColor: primaryBg }}>
                  <reason.icon className="h-8 w-8" style={{ color: primaryColor }} />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">{reason.title}</h3>
                <p className="text-gray-700 leading-relaxed">{reason.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Service Areas */}
      <section style={{ backgroundColor: primaryBg, paddingTop: '40px', paddingBottom: '40px' }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            Serving Your Community
          </h2>
          <p className="text-gray-700 mb-6">
            Convenient on-site pharmacy serving pet families across Northern Virginia:
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

      {/* Special Features Highlight */}
      <section className="bg-white" style={{ paddingTop: '40px', paddingBottom: '40px' }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-blue-50 to-green-50 p-8 rounded-xl border-l-4" style={{ borderColor: primaryColor }}>
            <div className="flex items-center mb-4">
              <div className="flex items-center justify-center w-12 h-12 rounded-full mr-4" style={{ backgroundColor: primaryBg }}>
                <Star className="h-6 w-6" style={{ color: primaryColor }} />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Ready to Make Care Easier?</h3>
            </div>
            <p className="text-gray-800 leading-relaxed mb-4">
              If your pet needs a prescription or refill, we've got you covered—right at our hospital in South Riding, VA, 
              serving the surrounding communities including Aldie, Ashburn, Chantilly, Centreville, Reston, and Herndon.
            </p>
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 mr-2" style={{ color: accentGreen }} />
              <span className="text-gray-800 font-medium">No extra trips • No waiting • Just convenient care</span>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section style={{ background: `linear-gradient(135deg, ${primaryColor} 0%, #2196c7 100%)`, paddingTop: '40px', paddingBottom: '40px' }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center mb-4">
            <Pill className="h-8 w-8 mr-3 text-white" />
            <h2 className="font-bold text-white text-xl">
              Get Your Pet's Medications Today
            </h2>
          </div>
          <p className="mb-8 text-white text-lg leading-relaxed">
            Call us today to learn more about our on-site pharmacy or to request a refill!
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
              Request Refill
              <ArrowRight className="ml-2 h-5 w-5" />
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
                <Zap className="h-4 w-4 mr-2" style={{ color: primaryColor }} />
                <span className="font-semibold">Immediate Access</span>
              </div>
              <p className="text-gray-300 text-sm">Right after your appointment</p>
            </div>
            <div className="mb-4 md:mb-0">
              <div className="flex items-center justify-center md:justify-start mb-2">
                <Truck className="h-4 w-4 mr-2" style={{ color: primaryColor }} />
                <span className="font-semibold">Delivery Available</span>
              </div>
              <p className="text-gray-300 text-sm">Refills mailed to your door</p>
            </div>
            <div>
              <div className="flex items-center justify-center md:justify-start mb-2">
                <MapPin className="h-4 w-4 mr-2" style={{ color: primaryColor }} />
                <span className="font-semibold">South Riding, VA</span>
              </div>
              <p className="text-gray-300 text-sm">Serving 7 communities</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default OnSitePharmacy;