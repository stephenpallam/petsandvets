import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Heart, 
  Shield, 
  AlertTriangle,
  CheckCircle,
  Clock,
  Activity,
  Phone,
  MapPin,
  Eye,
  Zap,
  Stethoscope,
  Target,
  TrendingUp,
  Award,
  Users,
  Search,
  FileText,
  Microscope,
  FlaskConical,
  Droplets,
  TestTube,
  Scan,
  Timer,
  Brain
} from 'lucide-react';
import { hospitalInfo } from '../mock';

const VeterinaryDiagnosticServices = () => {
  const primaryColor = '#29add3';
  const primaryLight = '#5bc0db';
  const primaryBg = '#e6f7fb';

  const diagnosticBenefits = [
    {
      benefit: "Early Disease Detection",
      description: "Detect diseases early, before they become critical and harder to treat",
      icon: Target,
      highlight: "Proactive healthcare"
    },
    {
      benefit: "Quick Diagnosis",
      description: "Confirm causes of illness quickly to begin targeted treatment immediately",
      icon: Zap,
      highlight: "Rapid results"
    },
    {
      benefit: "Health Monitoring",
      description: "Monitor organ function and overall health for ongoing wellness",
      icon: Activity,
      highlight: "Continuous care"
    },
    {
      benefit: "Emergency Support",
      description: "Save valuable time in urgent or emergency cases when every minute counts",
      icon: Timer,
      highlight: "Critical care"
    }
  ];

  const diagnosticTests = [
    {
      category: "Bloodwork",
      description: "Comprehensive blood analysis for complete health assessment",
      tests: ["Complete blood counts", "Chemistry panels", "Thyroid panels", "Tick panels"],
      icon: Droplets,
      color: "#ef4444"
    },
    {
      category: "Urine & Fecal Tests",
      description: "Essential screening for internal health and parasite detection",
      tests: ["Kidney function assessment", "Infection screening", "Parasite detection", "Intestinal health analysis"],
      icon: TestTube,
      color: "#f59e0b"
    },
    {
      category: "Cytology & Cultures",
      description: "Microscopic examination and bacterial/fungal identification",
      tests: ["Ear cytology", "Skin cytology", "Mass cytology", "Bacterial cultures", "Fungal cultures"],
      icon: Microscope,
      color: "#8b5cf6"
    },
    {
      category: "Disease Testing",
      description: "Specific testing for common and serious pet diseases",
      tests: ["Heartworm testing", "Pancreatitis detection", "Parvovirus screening", "FeLV testing", "FIV testing"],
      icon: Shield,
      color: "#10b981"
    },
    {
      category: "Advanced Panels",
      description: "Specialized testing for comprehensive health evaluation",
      tests: ["Vaccine titers", "Histopathology", "Blood gas analysis", "Endocrine testing"],
      icon: Brain,
      color: primaryColor
    }
  ];

  const serviceAreas = [
    "Chantilly", "South Riding", "Aldie", "Ashburn", "Centreville", "Reston", "Herndon"
  ];

  const careFeatures = [
    {
      title: "In-House Laboratory",
      description: "Advanced diagnostic equipment on-site for immediate results and faster treatment decisions",
      icon: FlaskConical
    },
    {
      title: "Fast Results",
      description: "Most test results available quickly, so you won't wait long for answers about your pet's health",
      icon: Clock
    },
    {
      title: "Compassionate Guidance",
      description: "Clear explanations of findings and next steps delivered with clarity and compassion",
      icon: Heart
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section - Mobile Only */}
      <section className="text-white sticky z-40 block md:hidden" style={{ top: '4rem', background: `linear-gradient(135deg, ${primaryColor} 0%, #2196c7 100%)`, paddingTop: '0.5rem', paddingBottom: '0.5rem' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="font-bold" style={{ fontSize: '1.125rem' }}>
              Veterinary Diagnostic Services
            </h1>
          </div>
        </div>
      </section>

      {/* Hero Section */}
      <section className="bg-white">
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center" style={{ paddingTop: '30px', paddingBottom: '15px' }}>
          <h1 className="text-xl font-bold text-gray-900 mb-6">
            Diagnostic Services
          </h1>
          <div className="mb-6">
            <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold text-white" style={{ backgroundColor: primaryColor }}>
              Advanced In-House Laboratory
            </span>
          </div>
          <p className="text-base text-gray-600 leading-relaxed max-w-3xl mx-auto">
            When your pet is sick or showing unusual symptoms, time matters. Our in-house diagnostic laboratory and 
            state-of-the-art equipment help us quickly uncover what's wrong and begin treatment right away—because 
            your pet's health can't wait.
          </p>
        </div>
      </section>

      {/* Why Veterinary Diagnostics Are Important */}
      <section className="bg-[#f8f9fa] py-6">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">
            Why Veterinary Diagnostics Are Important
          </h2>
          <p className="text-center text-gray-600 mb-8">
            Modern diagnostic tools help us provide faster, more accurate care for your pet:
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {diagnosticBenefits.map((benefit, index) => (
              <div key={index} className="bg-white p-6 rounded-xl shadow-md">
                <div className="flex items-center mb-4">
                  <div className="flex items-center justify-center w-12 h-12 rounded-full mr-4" style={{ backgroundColor: `${primaryColor}15` }}>
                    <benefit.icon className="h-6 w-6" style={{ color: primaryColor }} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{benefit.benefit}</h3>
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                      {benefit.highlight}
                    </span>
                  </div>
                </div>
                <p className="text-gray-600 text-sm">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Common Diagnostic Tests We Perform */}
      <section className="bg-white py-6">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">
            Common Diagnostic Tests We Perform
          </h2>
          <p className="text-center text-gray-600 mb-8">
            Our in-house veterinary lab allows us to run a wide variety of tests for fast and accurate results:
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {diagnosticTests.map((test, index) => (
              <div key={index} className="bg-gray-50 p-6 rounded-xl shadow-md">
                <div className="flex items-center mb-4">
                  <div className="flex items-center justify-center w-12 h-12 rounded-full mr-4" style={{ backgroundColor: `${test.color}15` }}>
                    <test.icon className="h-6 w-6" style={{ color: test.color }} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{test.category}</h3>
                    <p className="text-gray-600 text-xs mt-1">{test.description}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold text-gray-900 text-sm">Available Tests:</h4>
                  <div className="space-y-1">
                    {test.tests.slice(0, 3).map((testItem, testIndex) => (
                      <div key={testIndex} className="flex items-center text-xs text-gray-600">
                        <CheckCircle className="h-3 w-3 mr-2 flex-shrink-0" style={{ color: test.color }} />
                        <span>{testItem}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Fast, Accurate, Compassionate Care */}
      <section className="bg-[#f8f9fa] py-6">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">
            Fast, Accurate, Compassionate Care
          </h2>
          <p className="text-center text-gray-600 mb-8">
            Our diagnostic services are designed to give you peace of mind and your pet the care they deserve.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {careFeatures.map((feature, index) => (
              <div key={index} className="bg-white p-6 rounded-xl shadow-md text-center">
                <div className="flex items-center justify-center w-12 h-12 rounded-full mx-auto mb-4" style={{ backgroundColor: `${primaryColor}15` }}>
                  <feature.icon className="h-6 w-6" style={{ color: primaryColor }} />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600 text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
          
          <div className="mt-8 p-6 rounded-xl" style={{ backgroundColor: primaryColor + '15' }}>
            <p className="text-center font-medium" style={{ color: primaryColor }}>
              Professional diagnostic testing with results you can trust—providing answers when your pet needs them most.
            </p>
          </div>
        </div>
      </section>

      {/* Service Areas */}
      <section className="bg-white" style={{ paddingTop: '30px', paddingBottom: '30px' }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            Serving Your Community
          </h2>
          <p className="text-gray-600 mb-6">
            We proudly provide advanced diagnostic services to pet families across:
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

      {/* The Bottom Line */}
      <section className="bg-gray-50" style={{ paddingTop: '30px', paddingBottom: '30px' }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            The Bottom Line: Knowledge is Power
          </h2>
          <div className="p-8 rounded-xl" style={{ backgroundColor: primaryBg }}>
            <p className="text-gray-700 leading-relaxed mb-6 text-lg">
              When it comes to your pet's health, knowledge is power—and diagnostics provide that knowledge. Whether it's 
              routine screening, detecting parasites, or identifying a complex illness, our diagnostic laboratory ensures 
              your pet gets the right care at the right time.
            </p>
            <div className="bg-white p-6 rounded-lg">
              <div className="flex items-center justify-center mb-4">
                <Microscope className="h-8 w-8 mr-3" style={{ color: primaryColor }} />
                <h3 className="text-xl font-semibold text-gray-900">Advanced Diagnostic Excellence</h3>
              </div>
              <p className="text-gray-800 font-semibold">
                From routine bloodwork to advanced disease testing—trust our in-house laboratory to provide the accurate, 
                timely diagnostic information that guides effective treatment for your beloved companion.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section style={{ background: `linear-gradient(135deg, ${primaryColor} 0%, #2196c7 100%)`, paddingTop: '30px', paddingBottom: '30px' }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-bold text-white mb-4" style={{ fontSize: '1rem' }}>
            Schedule Veterinary Diagnostic Testing Today
          </h2>
          <p className="mb-8" style={{ color: 'white', fontSize: '1rem' }}>
            Advanced diagnostic services with fast, accurate results for your pet's health needs
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
              Schedule Diagnostic Testing
              <MapPin className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default VeterinaryDiagnosticServices;