import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Heart, 
  Shield, 
  Phone,
  MapPin,
  Calendar,
  Users,
  Flower2,
  HandHeart,
  Stethoscope,
  Clock,
  CheckCircle,
  ArrowRight
} from 'lucide-react';
import { hospitalInfo } from '../mock';

const EndOfLifeCare = () => {
  const primaryColor = '#29add3';
  const softBlue = '#e6f7fb';
  const gentleGray = '#f8fafc';
  const warmGray = '#64748b';

  const processSteps = [
    {
      step: "Respectful Pre-Evaluation",
      description: "We assess your pet's health and quality of life with utmost care",
      icon: Stethoscope,
      color: "#10b981"
    },
    {
      step: "Comfort-First Approach", 
      description: "Soothing medications are administered prior to the procedure to ease fear and pain",
      icon: Heart,
      color: "#6366f1"
    },
    {
      step: "Compassionate Presence",
      description: "You and your loved ones are encouraged to remain with your companion throughout their final moments",
      icon: Users,
      color: "#8b5cf6"
    },
    {
      step: "Privacy & Honor",
      description: "This is a deeply personal experience—your pet's final journey occurs in a peaceful, dignified setting",
      icon: Flower2,
      color: "#ec4899"
    }
  ];

  const trustPoints = [
    {
      title: "Thoughtful Guidance",
      description: "We support your decision-making with clarity, honesty, and kindness—never pressure",
      icon: HandHeart
    },
    {
      title: "Tender Execution", 
      description: "Our team treats both you and your pet with deep compassion and respect",
      icon: Heart
    },
    {
      title: "Lasting Peace",
      description: "We help guide your pet's departure with gentle care, honoring the special bond you share",
      icon: Flower2
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-white pt-6" style={{ paddingBottom: '8px' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h1 className="text-xl font-bold text-gray-900 mb-4">
              End-of-Life Care
            </h1>
            <div className="mb-6">
              <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold text-white" style={{ backgroundColor: primaryColor }}>
                Compassionate Final Care
              </span>
            </div>
            <p className="text-base text-gray-600 leading-relaxed max-w-4xl mx-auto">
              Saying goodbye to a beloved pet is one of the hardest decisions a pet owner ever faces. 
              At Pets and Vets Animal Hospital, we're here to guide you through this emotional journey 
              with respect, empathy, and unwavering compassion.
            </p>
          </div>
        </div>
      </section>

      {/* Philosophy Section */}
      <section className="bg-[#f8f9fa] py-6">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <Shield className="h-6 w-6 mr-2" style={{ color: primaryColor }} />
              <h2 className="text-xl font-bold text-gray-900">
                Our Philosophy: Dignified Care, Not Convenience
              </h2>
            </div>
          </div>
          
          <div className="bg-blue-50 p-6 rounded-lg border-l-4" style={{ borderColor: primaryColor }}>
            <p className="text-gray-800 leading-relaxed mb-3 text-sm">
              <strong>We do not perform convenience euthanasia.</strong> Every end-of-life decision begins with a 
              comprehensive examination and discussion. Only after assessing your pet's medical status, exploring 
              all alternatives, and with your final consent, will we proceed.
            </p>
            <p className="text-gray-800 leading-relaxed text-sm">
              We begin with calming medications to ease anxiety and pain—ensuring your pet is peaceful and comfortable.
            </p>
          </div>
        </div>
      </section>

      {/* Gentle Goodbye Section */}
      <section style={{ backgroundColor: gentleGray, paddingTop: '40px', paddingBottom: '40px' }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center mb-6">
            <Users className="h-8 w-8 mr-3" style={{ color: primaryColor }} />
            <h2 className="text-xl font-bold text-gray-900">
              A Gentle Goodbye, Together
            </h2>
          </div>
          <div className="bg-white p-8 rounded-xl shadow-md">
            <p className="text-gray-800 leading-relaxed text-lg">
              We invite you to be present—bring your family, loved ones, and cherished memories. 
              This is your time to hold your pet close, reflect on your journey together, and 
              say goodbye with love and grace.
            </p>
          </div>
        </div>
      </section>

      {/* Process Steps */}
      <section className="bg-white" style={{ paddingTop: '40px', paddingBottom: '40px' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl font-bold text-gray-900 mb-12 text-center">
            What You Can Expect From Our Process
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {processSteps.map((step, index) => (
              <div key={index} className="bg-gray-50 p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow">
                <div className="flex items-start mb-4">
                  <div className="flex items-center justify-center w-12 h-12 rounded-full mr-4" style={{ backgroundColor: `${step.color}15` }}>
                    <step.icon className="h-6 w-6" style={{ color: step.color }} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{step.step}</h3>
                    <p className="text-gray-700 leading-relaxed">{step.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Trust Us */}
      <section style={{ backgroundColor: gentleGray, paddingTop: '40px', paddingBottom: '40px' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl font-bold text-gray-900 mb-12 text-center">
            Why Trust Pets and Vets Animal Hospital?
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {trustPoints.map((point, index) => (
              <div key={index} className="bg-white p-6 rounded-xl shadow-md text-center hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-center w-16 h-16 rounded-full mx-auto mb-6" style={{ backgroundColor: softBlue }}>
                  <point.icon className="h-8 w-8" style={{ color: primaryColor }} />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">{point.title}</h3>
                <p className="text-gray-700 leading-relaxed">{point.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final Act of Love */}
      <section className="bg-white" style={{ paddingTop: '40px', paddingBottom: '40px' }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center mb-6">
            <Heart className="h-8 w-8 mr-3 text-red-500" />
            <h2 className="text-xl font-bold text-gray-900">
              A Final Act of Love
            </h2>
          </div>
          
          <div className="bg-red-50 p-8 rounded-xl border-l-4 border-red-500">
            <p className="text-gray-800 leading-relaxed text-lg mb-4">
              <strong>Choosing euthanasia is never a sign of giving up—it's the ultimate act of love and compassion.</strong>
            </p>
            <p className="text-gray-800 leading-relaxed text-lg">
              We're honored to walk this path with you and ensure your pet's final moments are calm, 
              respectful, and filled with love.
            </p>
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section style={{ background: `linear-gradient(135deg, ${primaryColor} 0%, #2196c7 100%)`, paddingTop: '40px', paddingBottom: '40px' }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center mb-4">
            <Phone className="h-8 w-8 mr-3 text-white" />
            <h2 className="font-bold text-white text-xl">
              We're Here to Support You
            </h2>
          </div>
          <p className="mb-8 text-white text-lg leading-relaxed">
            If you're considering end-of-life care for your companion, please call us—or let us know how 
            we can support you during this tender time.
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
              Contact Us
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Location & Hours Info */}
      <section className="bg-gray-800 text-white" style={{ paddingTop: '30px', paddingBottom: '30px' }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-center md:text-left">
            <div>
              <div className="flex items-center justify-center md:justify-start mb-3">
                <MapPin className="h-5 w-5 mr-2" style={{ color: primaryColor }} />
                <h3 className="font-semibold">Our Location</h3>
              </div>
              <p className="text-gray-300">
                {hospitalInfo.address}<br />
                South Riding, VA 20152
              </p>
            </div>
            <div>
              <div className="flex items-center justify-center md:justify-start mb-3">
                <Clock className="h-5 w-5 mr-2" style={{ color: primaryColor }} />
                <h3 className="font-semibold">Available for Consultations</h3>
              </div>
              <p className="text-gray-300">
                By appointment<br />
                <span className="text-sm">Please call to schedule</span>
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default EndOfLifeCare;