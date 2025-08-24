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
      title: "Expert Consultation Available",
      description: "Our veterinary team provides guidance on proper medication administration and answers your questions",
      icon: Users,
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
      step: "Get Medication & Guidance",
      description: "Receive your pet's medication with expert administration guidance",
      icon: Users,
      number: "03"
    },
    {
      step: "Easy Refill Process",
      description: "Return for refills or call ahead to have them ready for pickup",
      icon: Phone,
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
      <section className="bg-white pt-6" style={{ paddingBottom: '8px' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h1 className="text-xl font-bold text-gray-900 mb-4">
              On-Site Pharmacy
            </h1>
            <div className="mb-6">
              <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold text-white" style={{ backgroundColor: primaryColor }}>
                Convenient Care Right Here
              </span>
            </div>
            <p className="text-base text-gray-600 leading-relaxed max-w-4xl mx-auto">
              At Pets and Vets Animal Hospital, we make keeping your pet healthy easier and faster with our 
              on-site pharmacy. Skip the extra stop and get the medications your pet needs—immediately following your appointment.
            </p>
          </div>
        </div>
      </section>

      {/* Why Choose Our Pharmacy */}
      <section className="bg-[#f8f9fa] py-6">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Why Choose Our In-House Pharmacy?
            </h2>
            <p className="text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Our on-site pharmacy provides immediate access to the medications your pet needs, 
              with the convenience and trust you deserve.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {pharmacyBenefits.map((benefit, index) => (
              <div key={index} className="bg-white p-4 rounded-lg shadow-sm text-center">
                <div className="flex items-center justify-center w-12 h-12 rounded-full mx-auto mb-3" style={{ backgroundColor: `${benefit.color}15` }}>
                  <benefit.icon className="h-6 w-6" style={{ color: benefit.color }} />
                </div>
                <h3 className="text-base font-semibold text-gray-900 mb-2">{benefit.title}</h3>
                <p className="text-gray-700 text-sm leading-relaxed">{benefit.description}</p>
              </div>
            ))}
          </div>

          {/* Key Stats moved here */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="text-center p-4 bg-white rounded-lg shadow-sm">
              <div className="flex items-center justify-center w-12 h-12 rounded-full mx-auto mb-3" style={{ backgroundColor: `${accentGreen}15` }}>
                <Zap className="h-6 w-6" style={{ color: accentGreen }} />
              </div>
              <h3 className="font-bold text-gray-900 text-base">Immediate</h3>
              <p className="text-gray-600 text-sm">No waiting or delays</p>
            </div>
            <div className="text-center p-4 bg-white rounded-lg shadow-sm">
              <div className="flex items-center justify-center w-12 h-12 rounded-full mx-auto mb-3" style={{ backgroundColor: `${accentBlue}15` }}>
                <Users className="h-6 w-6" style={{ color: accentBlue }} />
              </div>
              <h3 className="font-bold text-gray-900 text-base">Expert Care</h3>
              <p className="text-gray-600 text-sm">Professional guidance available</p>
            </div>
            <div className="text-center p-4 bg-white rounded-lg shadow-sm">
              <div className="flex items-center justify-center w-12 h-12 rounded-full mx-auto mb-3" style={{ backgroundColor: `${accentPurple}15` }}>
                <Shield className="h-6 w-6" style={{ color: accentPurple }} />
              </div>
              <h3 className="font-bold text-gray-900 text-base">Trusted</h3>
              <p className="text-gray-600 text-sm">Veterinary-approved only</p>
            </div>
          </div>
        </div>
      </section>

      {/* Process Steps */}
      <section className="bg-white py-6">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl font-bold text-gray-900 mb-8 text-center">
            A Smoother Experience, Every Time
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {processSteps.map((step, index) => (
              <div key={index} className="bg-gray-50 p-4 rounded-lg shadow-sm text-center relative">
                <div className="absolute top-3 right-3 w-6 h-6 rounded-full text-white text-xs font-bold flex items-center justify-center" style={{ backgroundColor: primaryColor }}>
                  {step.number}
                </div>
                <div className="flex items-center justify-center w-12 h-12 rounded-full mx-auto mb-3" style={{ backgroundColor: primaryBg }}>
                  <step.icon className="h-6 w-6" style={{ color: primaryColor }} />
                </div>
                <h3 className="text-base font-semibold text-gray-900 mb-2">{step.step}</h3>
                <p className="text-gray-700 text-sm leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why It Matters */}
      <section className="bg-[#f8f9fa] py-6">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl font-bold text-gray-900 mb-8 text-center">
            Why It Matters for Pet Owners
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {whyItMatters.map((reason, index) => (
              <div key={index} className="text-center p-4 bg-white rounded-lg shadow-sm">
                <div className="flex items-center justify-center w-12 h-12 rounded-full mx-auto mb-3" style={{ backgroundColor: primaryBg }}>
                  <reason.icon className="h-6 w-6" style={{ color: primaryColor }} />
                </div>
                <h3 className="text-base font-semibold text-gray-900 mb-2">{reason.title}</h3>
                <p className="text-gray-700 text-sm leading-relaxed">{reason.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Service Areas */}
      <section className="bg-white py-6">
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
      <section className="bg-[#f8f9fa] py-6">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-blue-50 p-6 rounded-lg border-l-4" style={{ borderColor: primaryColor }}>
            <div className="flex items-center mb-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-full mr-3" style={{ backgroundColor: primaryBg }}>
                <Star className="h-5 w-5" style={{ color: primaryColor }} />
              </div>
              <h3 className="text-base font-bold text-gray-900">Ready to Make Care Easier?</h3>
            </div>
            <p className="text-gray-800 leading-relaxed mb-3 text-sm">
              If your pet needs a prescription or refill, we've got you covered—right at our hospital in South Riding, VA, 
              serving the surrounding communities including Aldie, Ashburn, Chantilly, Centreville, Reston, and Herndon.
            </p>
            <div className="flex items-center">
              <CheckCircle className="h-4 w-4 mr-2" style={{ color: accentGreen }} />
              <span className="text-gray-800 font-medium text-sm">No extra trips • No waiting • Just convenient care</span>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section style={{ background: `linear-gradient(135deg, ${primaryColor} 0%, #2196c7 100%)` }} className="py-6">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center mb-4">
            <Pill className="h-6 w-6 mr-2 text-white" />
            <h2 className="font-bold text-white text-base">
              Get Your Pet's Medications Today
            </h2>
          </div>
          <p className="mb-6 text-white leading-relaxed" style={{ fontSize: '1rem' }}>
            Call us today to learn more about our on-site pharmacy or to request a refill!
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
              to="/contact"
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
              Contact Us
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
};

export default OnSitePharmacy;