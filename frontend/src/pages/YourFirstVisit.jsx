import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Heart, 
  Shield, 
  CheckCircle,
  Clock,
  Phone,
  MapPin,
  Stethoscope,
  FileText,
  PawPrint,
  AlertCircle,
  Clipboard,
  Calendar,
  Users,
  Star
} from 'lucide-react';
import { hospitalInfo } from '../mock';

const YourFirstVisit = () => {
  const primaryColor = '#29add3';
  const primaryLight = '#5bc0db';
  const primaryBg = '#e6f7fb';

  const whatToExpect = [
    {
      step: "Medical History Review",
      description: "We'll gather information about your pet's background, diet, and medical history",
      icon: Clipboard,
      color: "#10b981"
    },
    {
      step: "Complete Physical Exam",
      description: "Full nose-to-tail examination checking for heart murmurs, ear infections, parasites, and more",
      icon: Stethoscope,
      color: "#3b82f6"
    },
    {
      step: "Guidance & Education",
      description: "Expert advice on nutrition, training, parasite prevention, and pet-proofing your home",
      icon: Star,
      color: "#8b5cf6"
    }
  ];

  const preparationSteps = [
    "Complete the New Client Form online or arrive early",
    "Bring adoption/purchase records and prior medical history",
    "List all current medications or supplements your pet takes",
    "Note your pet's feeding schedule and food brand",
    "Collect stool or urine samples if requested by our team",
    "Use a short leash for dogs or secure carrier for cats",
    "Pack your pet's favorite treats for comfort during the visit"
  ];

  const appointmentTips = [
    {
      tip: "Arrive Early",
      description: "10 minutes early for check-in, or 30 minutes if completing forms",
      icon: Clock,
      color: "#f59e0b"
    },
    {
      tip: "Stay Calm",
      description: "Your pet can sense your energy - staying relaxed helps them feel secure",
      icon: Heart,
      color: "#ef4444"
    },
    {
      tip: "Bring Questions",
      description: "Write down any concerns or questions you have about your pet's health",
      icon: FileText,
      color: "#10b981"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden" style={{ background: `linear-gradient(135deg, ${primaryBg} 0%, #ffffff 50%, #f0fdff 100%)` }}>
        <div className="absolute inset-0 bg-white/40"></div>
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center" style={{ paddingTop: '30px', paddingBottom: '30px' }}>
          <h1 className="text-xl font-bold text-gray-900 mb-6">
            Your First Visit
          </h1>
          <div className="mb-6">
            <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold text-white" style={{ backgroundColor: primaryColor }}>
              A Healthy Start for Your Pet
            </span>
          </div>
          <p className="text-base text-gray-600 leading-relaxed max-w-3xl mx-auto">
            Your pet's first veterinary visit is an important step toward lifelong health. We're here to make the process smooth, comfortable, and reassuring for both you and your pet.
          </p>
        </div>
      </section>

      {/* What to Expect */}
      <section className="bg-white" style={{ paddingTop: '30px', paddingBottom: '30px' }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">What to Expect</h2>
            <p className="text-gray-600 max-w-3xl mx-auto">
              At your first appointment, our experienced veterinary team will provide comprehensive care for your pet.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {whatToExpect.map((item, index) => (
              <div key={index} className="text-center">
                <div className="flex items-center justify-center w-16 h-16 rounded-full mb-6 mx-auto" style={{ backgroundColor: `${item.color}15` }}>
                  <item.icon className="h-8 w-8" style={{ color: item.color }} />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">{item.step}</h3>
                <p className="text-gray-600 text-sm">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How to Prepare */}
      <section style={{ backgroundColor: '#f8f9fa', paddingTop: '30px', paddingBottom: '30px' }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">How to Prepare</h2>
            <p className="text-gray-600 max-w-3xl mx-auto">
              Before your visit, please take these steps to ensure a smooth and productive appointment:
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md">
            <div className="flex items-center mb-6">
              <div className="flex items-center justify-center w-16 h-16 rounded-full mr-4" style={{ backgroundColor: primaryBg }}>
                <PawPrint className="h-8 w-8" style={{ color: primaryColor }} />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Preparation Checklist</h3>
            </div>
            
            <div className="space-y-4">
              {preparationSteps.map((step, index) => (
                <div key={index} className="flex items-start">
                  <CheckCircle className="h-5 w-5 mr-3 flex-shrink-0 mt-0.5" style={{ color: '#10b981' }} />
                  <span className="text-gray-700">{step}</span>
                </div>
              ))}
            </div>

            <div className="mt-6 p-4 rounded-lg border-l-4" style={{ backgroundColor: '#fff3cd', borderColor: '#f59e0b' }}>
              <div className="flex items-center mb-2">
                <AlertCircle className="h-5 w-5 mr-2" style={{ color: '#f59e0b' }} />
                <h4 className="font-semibold text-gray-900">New Client Form</h4>
              </div>
              <p className="text-sm text-gray-700">
                Complete our New Client Form online before your visit to save time, or arrive 30 minutes early to fill it out at our office.
              </p>
              <Link
                to="/forms/new-patient-registration"
                className="inline-flex items-center mt-3 text-sm font-semibold transition-colors hover:opacity-80"
                style={{ color: '#f59e0b' }}
              >
                Complete New Client Form →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Appointment Guidelines */}
      <section className="bg-white" style={{ paddingTop: '30px', paddingBottom: '30px' }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Appointment Guidelines</h2>
            <p className="text-gray-600 max-w-3xl mx-auto">
              Follow these simple guidelines to make your visit as smooth as possible:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {appointmentTips.map((tip, index) => (
              <div key={index} className="bg-gray-50 p-6 rounded-xl text-center">
                <div className="flex items-center justify-center w-16 h-16 rounded-full mb-4 mx-auto" style={{ backgroundColor: `${tip.color}15` }}>
                  <tip.icon className="h-8 w-8" style={{ color: tip.color }} />
                </div>
                <h3 className="font-semibold text-gray-900 mb-3">{tip.tip}</h3>
                <p className="text-sm text-gray-600">{tip.description}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 text-center">
            <div className="p-6 rounded-xl border-l-4" style={{ backgroundColor: primaryBg, borderColor: primaryColor }}>
              <p className="text-lg font-medium text-gray-800">
                With a little preparation, your first visit will set the stage for a healthy and happy future for your pet.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section style={{ backgroundColor: primaryColor, paddingTop: '30px', paddingBottom: '30px' }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center mb-6">
            <Users className="h-8 w-8 text-white mr-3" />
            <h2 className="text-xl font-bold text-white">
              Ready to Schedule Your Pet's First Visit?
            </h2>
          </div>
          <p className="text-blue-100 mb-8">
            Our experienced veterinary team is here to provide the best care for your beloved pet. Contact us today to schedule your first appointment!
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

export default YourFirstVisit;