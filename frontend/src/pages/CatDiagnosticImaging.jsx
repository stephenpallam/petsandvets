import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Eye, 
  Heart, 
  Brain,
  Bone,
  Stethoscope,
  MapPin,
  Phone,
  Clock,
  CheckCircle,
  Target,
  Camera,
  Monitor,
  Activity,
  Search
} from 'lucide-react';

const CatDiagnosticImaging = () => {
  const { businessInfo: currentBusinessInfo } = useBusinessInfo();
  const primaryColor = '#29add3';
  const primaryBg = '#e6f7fb';

  const hospitalInfo = {
    name: "Pets and Vets Animal Hospital",
    phone: "(703) 957-3297",
    address: "43114 Peacock Market Plaza, Suite F110, South Riding, VA 20152"
  };

  const imagingServices = [
    {
      icon: Camera,
      title: "Digital X-Rays",
      description: "High-resolution digital radiography for accurate bone, organ, and tissue assessment",
      benefits: ["Instant image viewing", "Enhanced image quality", "Reduced radiation exposure", "Detailed bone and organ visualization"]
    },
    {
      icon: Monitor,
      title: "Ultrasound Imaging",
      description: "Non-invasive soft tissue and organ examination using advanced ultrasound technology",
      benefits: ["Real-time organ visualization", "Pregnancy monitoring", "Heart function assessment", "Bladder and kidney evaluation"]
    },
    {
      icon: Eye,
      title: "Ophthalmology Imaging",
      description: "Specialized eye imaging and examination for comprehensive ocular health assessment",
      benefits: ["Retinal examination", "Glaucoma detection", "Corneal assessment", "Vision preservation"]
    },
    {
      icon: Activity,
      title: "Cardiac Imaging",
      description: "Heart function and structure evaluation using specialized imaging techniques",
      benefits: ["Heart rhythm analysis", "Chamber size assessment", "Blood flow evaluation", "Early disease detection"]
    }
  ];

  const diagnosticBenefits = [
    {
      icon: Target,
      title: "Precise Diagnosis",
      description: "Advanced imaging provides detailed internal views for accurate condition identification"
    },
    {
      icon: Clock,
      title: "Quick Results",
      description: "Digital technology delivers immediate results for faster treatment decisions"
    },
    {
      icon: CheckCircle,
      title: "Non-Invasive",
      description: "Safe, comfortable procedures that don't require surgical exploration"
    },
    {
      icon: Search,
      title: "Early Detection",
      description: "Identify health issues before they become serious or symptomatic"
    }
  ];

  const serviceAreas = [
    "South Riding", "Aldie", "Ashburn", "Chantilly", "Centreville", "Reston", "Herndon"
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section - Mobile Only */}
      <section className="text-white sticky z-40 block md:hidden" style={{ top: '4rem', background: `linear-gradient(135deg, ${primaryColor} 0%, #2196c7 100%)`, paddingTop: '0.5rem', paddingBottom: '0.5rem' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="font-bold" style={{ fontSize: '1.125rem' }}>
              Cat Diagnostic Imaging
            </h1>
          </div>
        </div>
      </section>

      {/* Hero Section */}
      <section className="bg-white">
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center" style={{ paddingTop: '30px', paddingBottom: '15px' }}>
          <h1 className="text-xl font-bold text-gray-900 mb-6">
            Cat Diagnostic Imaging
          </h1>
          <div className="mb-6">
            <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold text-white" style={{ backgroundColor: primaryColor }}>
              Advanced Imaging for Comprehensive Cat Care
            </span>
          </div>
          <p className="text-base text-gray-600 leading-relaxed max-w-3xl mx-auto">
            When your cat needs a thorough internal examination, our advanced diagnostic imaging services provide 
            clear, detailed views that help us deliver precise diagnoses and effective treatment plans. At Pets and Vets 
            Animal Hospital, we use state-of-the-art digital imaging technology to ensure your feline friend receives 
            the most accurate assessment of their health.
          </p>
        </div>
      </section>

      {/* Imaging Services */}
      <section style={{ backgroundColor: '#f8f9fa', paddingTop: '30px', paddingBottom: '30px' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">
            Comprehensive Imaging Services for Cats
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {imagingServices.map((service, index) => (
              <div key={index} className="bg-white p-8 rounded-xl shadow-sm">
                <div className="flex items-center mb-6">
                  <div className="flex items-center justify-center w-16 h-16 rounded-full mr-4" style={{ backgroundColor: primaryBg }}>
                    <service.icon className="h-8 w-8" style={{ color: primaryColor }} />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">{service.title}</h3>
                </div>
                <p className="text-gray-700 mb-6 leading-relaxed">
                  {service.description}
                </p>
                <ul className="space-y-3">
                  {service.benefits.map((benefit, benefitIndex) => (
                    <li key={benefitIndex} className="flex items-start">
                      <CheckCircle className="h-5 w-5 mr-3 mt-0.5 flex-shrink-0" style={{ color: primaryColor }} />
                      <span className="text-gray-700">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="bg-white" style={{ paddingTop: '30px', paddingBottom: '30px' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">
            Why Choose Advanced Diagnostic Imaging?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {diagnosticBenefits.map((benefit, index) => (
              <div key={index} className="text-center">
                <div className="flex items-center justify-center w-16 h-16 rounded-full mx-auto mb-4" style={{ backgroundColor: primaryBg }}>
                  <benefit.icon className="h-8 w-8" style={{ color: primaryColor }} />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">{benefit.title}</h3>
                <p className="text-gray-600">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* When Imaging is Needed */}
      <section style={{ backgroundColor: '#f8f9fa', paddingTop: '30px', paddingBottom: '30px' }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            When Does Your Cat Need Diagnostic Imaging?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Common Indications</h3>
              <ul className="space-y-3 text-left">
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 mr-3 mt-0.5 flex-shrink-0" style={{ color: primaryColor }} />
                  <span className="text-gray-700">Unexplained lameness or mobility issues</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 mr-3 mt-0.5 flex-shrink-0" style={{ color: primaryColor }} />
                  <span className="text-gray-700">Persistent vomiting or digestive problems</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 mr-3 mt-0.5 flex-shrink-0" style={{ color: primaryColor }} />
                  <span className="text-gray-700">Suspected internal injuries</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 mr-3 mt-0.5 flex-shrink-0" style={{ color: primaryColor }} />
                  <span className="text-gray-700">Breathing difficulties or chest issues</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 mr-3 mt-0.5 flex-shrink-0" style={{ color: primaryColor }} />
                  <span className="text-gray-700">Abdominal swelling or pain</span>
                </li>
              </ul>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Preventive Screening</h3>
              <ul className="space-y-3 text-left">
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 mr-3 mt-0.5 flex-shrink-0" style={{ color: primaryColor }} />
                  <span className="text-gray-700">Senior cat health assessments</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 mr-3 mt-0.5 flex-shrink-0" style={{ color: primaryColor }} />
                  <span className="text-gray-700">Pre-surgical evaluations</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 mr-3 mt-0.5 flex-shrink-0" style={{ color: primaryColor }} />
                  <span className="text-gray-700">Heart health monitoring</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 mr-3 mt-0.5 flex-shrink-0" style={{ color: primaryColor }} />
                  <span className="text-gray-700">Cancer screening and monitoring</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 mr-3 mt-0.5 flex-shrink-0" style={{ color: primaryColor }} />
                  <span className="text-gray-700">Breeding and pregnancy evaluation</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Service Areas */}
      <section className="bg-white" style={{ paddingTop: '30px', paddingBottom: '30px' }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            Serving Cat Families Throughout Northern Virginia
          </h2>
          <p className="text-gray-600 mb-8">
            Professional diagnostic imaging services for cats across the region
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            {serviceAreas.map((area, index) => (
              <span key={index} className="px-4 py-2 rounded-full text-sm font-medium" style={{ backgroundColor: primaryBg, color: primaryColor }}>
                {area}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section style={{ background: `linear-gradient(135deg, ${primaryColor} 0%, #2196c7 100%)`, paddingTop: '40px', paddingBottom: '40px' }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-bold text-white mb-4 text-xl">
            Schedule Your Cat's Diagnostic Imaging
          </h2>
          <p className="mb-8 text-white" style={{ fontSize: '1rem' }}>
            Advanced imaging technology for accurate diagnosis and effective treatment planning
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href={`tel:${currentBusinessInfo.phone}`}
              className="inline-flex items-center justify-center bg-white px-8 py-4 rounded-lg font-semibold transition-colors duration-200"
              style={{ color: primaryColor }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#f9fafb'}
              onMouseLeave={(e) => e.target.style.backgroundColor = 'white'}
            >
              <Phone className="mr-2 h-5 w-5" />
              Call Now: {currentBusinessInfo.phone}
            </a>
            <Link
              to="/reach-us"
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
              Schedule Consultation
              <MapPin className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default CatDiagnosticImaging;