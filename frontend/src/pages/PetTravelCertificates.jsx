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
  Ship,
  Globe,
  Flag
} from 'lucide-react';
import { hospitalInfo } from '../mock';

const PetTravelCertificates = () => {
  const primaryColor = '#29add3';
  const primaryLight = '#5bc0db';
  const primaryBg = '#e6f7fb';

  const requirements = [
    "Required by most airlines, states, and ferries",
    "Valid for domestic and international travel",
    "Must be issued by a USDA-accredited veterinarian",
    "Typically valid for 10–30 days depending on destination",
    "Pets must be 8 weeks or older, fully weaned, and current on Rabies vaccination"
  ];

  const examSteps = [
    {
      step: "Full Physical Exam",
      description: "Comprehensive health assessment to ensure travel fitness",
      icon: Stethoscope,
      color: "#10b981"
    },
    {
      step: "Disease Screening",
      description: "Screen for communicable diseases that could affect travel",
      icon: Shield,
      color: "#3b82f6"
    },
    {
      step: "Vaccination Verification",
      description: "Verify current Rabies vaccination status and records",
      icon: CheckCircle,
      color: "#8b5cf6"
    },
    {
      step: "Certificate Issuance",
      description: "Provide signed health certificate for your journey",
      icon: FileText,
      color: "#f59e0b"
    }
  ];

  const travelTypes = [
    {
      type: "Domestic Travel",
      icon: Flag,
      description: "Health certificates required for most out-of-state trips, whether flying or driving",
      details: "Even on road trips, authorities may request proof of Rabies vaccination. For Hawaii, a Rabies Titer Test must be completed 120 days before travel.",
      color: "#10b981"
    },
    {
      type: "International Travel", 
      icon: Globe,
      description: "Every country has unique rules—often requiring vaccines, bloodwork, flea treatments, or microchipping",
      details: "Certificates must be endorsed by the USDA before departure. Plan at least 4 months in advance, as some tests and approvals take weeks.",
      color: "#ef4444"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden" style={{ background: `linear-gradient(135deg, ${primaryBg} 0%, #ffffff 50%, #f0fdff 100%)` }}>
        <div className="absolute inset-0 bg-white/40"></div>
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center" style={{ paddingTop: '30px', paddingBottom: '30px' }}>
          <h1 className="text-xl font-bold text-gray-900 mb-6">
            Travel Certificates
          </h1>
          <div className="mb-6">
            <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold text-white" style={{ backgroundColor: primaryColor }}>
              Keeping Journeys Safe & Stress-Free
            </span>
          </div>
          <p className="text-base text-gray-600 leading-relaxed max-w-3xl mx-auto">
            Planning a trip with your pet? Whether by air, land, or sea, most pets need a health certificate before traveling. This federally recognized document confirms your pet is healthy, properly vaccinated, and poses no risk to other animals or people.
          </p>
        </div>
      </section>

      {/* Why It Matters */}
      <section className="bg-white" style={{ paddingTop: '30px', paddingBottom: '30px' }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Why It Matters</h2>
          </div>
          
          <div className="bg-gray-50 p-6 rounded-xl">
            <div className="space-y-4">
              {requirements.map((requirement, index) => (
                <div key={index} className="flex items-start">
                  <CheckCircle className="h-5 w-5 mr-3 flex-shrink-0 mt-0.5" style={{ color: '#10b981' }} />
                  <span className="text-gray-700">{requirement}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Travel Types */}
      <section style={{ backgroundColor: '#f8f9fa', paddingTop: '30px', paddingBottom: '30px' }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {travelTypes.map((travel, index) => (
              <div key={index} className="bg-white p-6 rounded-xl shadow-md">
                <div className="flex items-center mb-4">
                  <div className="flex items-center justify-center w-12 h-12 rounded-full mr-4" style={{ backgroundColor: `${travel.color}15` }}>
                    <travel.icon className="h-6 w-6" style={{ color: travel.color }} />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">{travel.type}</h3>
                </div>
                <p className="text-gray-600 mb-4">{travel.description}</p>
                <p className="text-sm text-gray-500">{travel.details}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What to Expect */}
      <section className="bg-white" style={{ paddingTop: '30px', paddingBottom: '30px' }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">What to Expect</h2>
            <p className="text-gray-600 max-w-3xl mx-auto">
              During your pet's travel exam, our accredited veterinarian will:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {examSteps.map((step, index) => (
              <div key={index} className="text-center">
                <div className="flex items-center justify-center w-16 h-16 rounded-full mb-4 mx-auto" style={{ backgroundColor: `${step.color}15` }}>
                  <step.icon className="h-8 w-8" style={{ color: step.color }} />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{step.step}</h3>
                <p className="text-sm text-gray-600">{step.description}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 p-6 rounded-xl border-l-4" style={{ backgroundColor: '#fff3cd', borderColor: '#f59e0b' }}>
            <div className="flex items-center mb-4">
              <AlertCircle className="h-6 w-6 mr-3" style={{ color: '#f59e0b' }} />
              <h3 className="text-lg font-semibold text-gray-900">Important Note</h3>
            </div>
            <p className="text-gray-700">
              If your pet's Rabies vaccine was done elsewhere, please bring the official certificate to your appointment.
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
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-xl text-center">
              <div className="flex items-center justify-center w-16 h-16 rounded-full mb-4 mx-auto" style={{ backgroundColor: `${primaryColor}15` }}>
                <Calendar className="h-8 w-8" style={{ color: primaryColor }} />
              </div>
              <h3 className="font-semibold text-gray-900 mb-3">Schedule Early</h3>
              <p className="text-sm text-gray-600">Schedule your appointment within 10 days of departure</p>
            </div>
            
            <div className="bg-white p-6 rounded-xl text-center">
              <div className="flex items-center justify-center w-16 h-16 rounded-full mb-4 mx-auto" style={{ backgroundColor: '#10b98115' }}>
                <Phone className="h-8 w-8" style={{ color: '#10b981' }} />
              </div>
              <h3 className="font-semibold text-gray-900 mb-3">Confirm Requirements</h3>
              <p className="text-sm text-gray-600">Contact your airline, cruise line, or destination country early to confirm requirements</p>
            </div>
            
            <div className="bg-white p-6 rounded-xl text-center">
              <div className="flex items-center justify-center w-16 h-16 rounded-full mb-4 mx-auto" style={{ backgroundColor: '#8b5cf615' }}>
                <MapPin className="h-8 w-8" style={{ color: '#8b5cf6' }} />
              </div>
              <h3 className="font-semibold text-gray-900 mb-3">Final Destination</h3>
              <p className="text-sm text-gray-600">If making multiple stops, your final destination must be listed on the certificate</p>
            </div>
          </div>
        </div>
      </section>

      {/* Helpful Resources */}
      <section className="bg-white" style={{ paddingTop: '30px', paddingBottom: '30px' }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Helpful Resources</h2>
            <p className="text-gray-600">
              Get the latest travel requirements and guidelines from official sources:
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-50 p-6 rounded-xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">USDA Pet Travel Guidelines</h3>
                <div className="flex items-center justify-center w-8 h-8 rounded-full" style={{ backgroundColor: `${primaryColor}15` }}>
                  <Plane className="h-4 w-4" style={{ color: primaryColor }} />
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-4">Official guidelines for domestic and international pet travel requirements</p>
              <a
                href="https://www.aphis.usda.gov/aphis/pet-travel"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-sm font-semibold transition-colors hover:opacity-80"
                style={{ color: primaryColor }}
              >
                Visit USDA Guidelines <ExternalLink className="ml-1 h-4 w-4" />
              </a>
            </div>
            
            <div className="bg-gray-50 p-6 rounded-xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">CDC Dog Import Requirements</h3>
                <div className="flex items-center justify-center w-8 h-8 rounded-full" style={{ backgroundColor: '#10b98115' }}>
                  <Globe className="h-4 w-4" style={{ color: '#10b981' }} />
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-4">CDC requirements for bringing dogs into the United States</p>
              <a
                href="https://www.cdc.gov/importation/bringing-an-animal-into-the-united-states/dogs.html"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-sm font-semibold transition-colors hover:opacity-80"
                style={{ color: '#10b981' }}
              >
                Visit CDC Requirements <ExternalLink className="ml-1 h-4 w-4" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Closing Message */}
      <section style={{ backgroundColor: '#f8f9fa', paddingTop: '30px', paddingBottom: '30px' }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="p-6 rounded-xl border-l-4" style={{ backgroundColor: 'white', borderColor: primaryColor }}>
            <p className="text-lg font-medium text-gray-800 mb-4">
              With proper planning, your pet can travel safely by your side—whether across the state or across the globe.
            </p>
            <p className="text-gray-600">
              Our experienced team is here to help ensure your pet meets all travel requirements for a smooth and safe journey.
            </p>
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section style={{ backgroundColor: primaryColor, paddingTop: '30px', paddingBottom: '30px' }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-xl font-bold text-white mb-4">
            Ready to Get Your Pet's Travel Certificate?
          </h2>
          <p className="text-blue-100 mb-8">
            Schedule your appointment today and ensure your pet is ready for their next adventure.
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