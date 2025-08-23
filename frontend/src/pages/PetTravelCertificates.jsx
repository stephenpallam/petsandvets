import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Plane, 
  Shield, 
  CheckCircle,
  Clock,
  Phone,
  MapPin,
  Calendar,
  FileText,
  Stethoscope,
  AlertCircle,
  ExternalLink,
  Car,
  Ship
} from 'lucide-react';
import { hospitalInfo } from '../mock';

const PetTravelCertificates = () => {
  const primaryColor = '#29add3';
  const primaryLight = '#5bc0db';
  const primaryBg = '#e6f7fb';

  const examSteps = [
    {
      step: "Full Physical Examination",
      description: "Complete health assessment to ensure your pet is fit for travel",
      icon: Stethoscope,
      color: "#10b981"
    },
    {
      step: "Disease Screening",
      description: "Confirm your pet is free of communicable diseases",
      icon: Shield,
      color: "#3b82f6"
    },
    {
      step: "Vaccination Verification",
      description: "Check and verify current Rabies vaccination status",
      icon: CheckCircle,
      color: "#8b5cf6"
    }
  ];

  const requirements = [
    "Certificate must be issued within 10 days of departure",
    "Pet must be at least 8 weeks old and fully weaned",
    "Current Rabies vaccination required",
    "Issued by federally accredited veterinarian",
    "Valid for domestic travel within the United States",
    "Required by most airlines and many states"
  ];

  const travelMethods = [
    {
      method: "Air Travel",
      icon: Plane,
      description: "Most airlines require health certificates for pet travel",
      color: "#3b82f6"
    },
    {
      method: "Road Trips",
      icon: Car,
      description: "Many states require certificates for pets crossing borders",
      color: "#10b981"
    },
    {
      method: "Sea Travel",
      icon: Ship,
      description: "Ferry and cruise travel often requires health documentation",
      color: "#8b5cf6"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden" style={{ background: `linear-gradient(135deg, ${primaryBg} 0%, #ffffff 50%, #f0fdff 100%)` }}>
        <div className="absolute inset-0 bg-white/40"></div>
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center" style={{ paddingTop: '30px', paddingBottom: '30px' }}>
          <h1 className="text-xl font-bold text-gray-900 mb-6">
            Pet Travel Certificates
          </h1>
          <p className="text-base text-gray-600 leading-relaxed max-w-3xl mx-auto">
            Planning a trip with your pet? Whether you're flying, driving, or sailing to another state, most pets need a Domestic Health Certificate before they can travel.
          </p>
        </div>
      </section>

      {/* Travel Methods */}
      <section className="bg-white" style={{ paddingTop: '30px', paddingBottom: '30px' }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {travelMethods.map((method, index) => (
              <div key={index} className="bg-gray-50 p-6 rounded-xl text-center">
                <div className="flex items-center justify-center w-16 h-16 rounded-full mb-4 mx-auto" style={{ backgroundColor: `${method.color}15` }}>
                  <method.icon className="h-8 w-8" style={{ color: method.color }} />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{method.method}</h3>
                <p className="text-sm text-gray-600">{method.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why It Matters */}
      <section style={{ backgroundColor: '#f8f9fa', paddingTop: '30px', paddingBottom: '30px' }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Why It Matters</h2>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-md">
            <p className="text-base text-gray-600 leading-relaxed mb-6">
              A health certificate is a federally recognized document that confirms your pet is healthy and poses no risk to other animals or people. It ensures your pet is fit for travel and meets state and airline requirements.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {requirements.map((requirement, index) => (
                <div key={index} className="flex items-start">
                  <CheckCircle className="h-5 w-5 mr-3 flex-shrink-0 mt-0.5" style={{ color: '#10b981' }} />
                  <span className="text-gray-700 text-sm">{requirement}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* What to Expect */}
      <section className="bg-white" style={{ paddingTop: '30px', paddingBottom: '30px' }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">What to Expect</h2>
            <p className="text-gray-600 max-w-3xl mx-auto">
              During your appointment, our federally accredited veterinarian will:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {examSteps.map((step, index) => (
              <div key={index} className="text-center">
                <div className="flex items-center justify-center w-16 h-16 rounded-full mb-6 mx-auto" style={{ backgroundColor: `${step.color}15` }}>
                  <step.icon className="h-8 w-8" style={{ color: step.color }} />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">{step.step}</h3>
                <p className="text-gray-600 text-sm">{step.description}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 p-6 rounded-xl border-l-4" style={{ backgroundColor: '#fff3cd', borderColor: '#f59e0b' }}>
            <div className="flex items-center mb-4">
              <AlertCircle className="h-6 w-6 mr-3" style={{ color: '#f59e0b' }} />
              <h3 className="text-lg font-semibold text-gray-900">Important Note</h3>
            </div>
            <p className="text-gray-700">
              If your pet's Rabies vaccine wasn't given at our hospital, please bring their Rabies Certificate or vaccine record to the visit.
            </p>
          </div>
        </div>
      </section>

      {/* Plan Ahead */}
      <section style={{ backgroundColor: '#f8f9fa', paddingTop: '30px', paddingBottom: '30px' }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Plan Ahead</h2>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-md">
            <div className="flex items-center mb-4">
              <Calendar className="h-6 w-6 mr-3" style={{ color: primaryColor }} />
              <h3 className="text-lg font-semibold text-gray-900">Check Requirements Early</h3>
            </div>
            <p className="text-gray-600 mb-6">
              Every state and airline may have different requirements, so check early. Certificates must be issued within 10 days of your departure.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-between p-4 rounded-lg" style={{ backgroundColor: primaryBg }}>
              <div className="flex items-center mb-4 sm:mb-0">
                <FileText className="h-6 w-6 mr-3" style={{ color: primaryColor }} />
                <div>
                  <h4 className="font-semibold text-gray-900">Helpful Resource</h4>
                  <p className="text-sm text-gray-600">USDA APHIS Pet Travel Guidelines</p>
                </div>
              </div>
              <a
                href="https://www.aphis.usda.gov/aphis/pet-travel"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center px-6 py-2 font-semibold rounded-lg transition-colors text-white hover:opacity-90"
                style={{ backgroundColor: primaryColor }}
              >
                Visit USDA Site <ExternalLink className="ml-2 h-4 w-4" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section style={{ backgroundColor: primaryColor, paddingTop: '30px', paddingBottom: '30px' }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-xl font-bold text-white mb-4">
            Book Your Travel Certificate Appointment
          </h2>
          <p className="text-blue-100 mb-8">
            Call us to schedule your Domestic Health Certificate exam within 10 days of travel so your pet is cleared for a safe and stress-free journey.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <a
              href={`tel:${hospitalInfo.phone}`}
              className="inline-flex items-center justify-center px-8 py-3 bg-white text-gray-900 font-semibold rounded-lg hover:bg-gray-100 transition-colors"
            >
              <Phone className="mr-2 h-5 w-5" />
              Call {hospitalInfo.phone}
            </a>
            <Link
              to="/reach-us"
              className="inline-flex items-center justify-center px-8 py-3 border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-gray-900 transition-colors"
            >
              <MapPin className="mr-2 h-5 w-5" />
              Visit Our Location
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default PetTravelCertificates;