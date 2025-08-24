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
  Brain,
  Camera,
  Monitor,
  Leaf,
  Gauge,
  Bone,
  Sparkles,
  Scissors
} from 'lucide-react';
import { hospitalInfo } from '../mock';

const DentalCleanings = () => {
  const primaryColor = '#29add3';
  const primaryLight = '#5bc0db';
  const primaryBg = '#e6f7fb';

  const cleaningProcedures = [
    {
      procedure: "Plaque & Tartar Removal",
      description: "Comprehensive removal above and below the gumline for complete oral health",
      details: ["Surface plaque elimination", "Deep tartar removal", "Subgingival cleaning", "Bacteria elimination"],
      icon: Sparkles,
      color: "#10b981"
    },
    {
      procedure: "Dental Examination",
      description: "Thorough probing and charting of teeth to identify signs of disease",
      details: ["Periodontal probing", "Tooth charting", "Disease assessment", "Mobility evaluation"],
      icon: Search,
      color: "#f59e0b"
    },
    {
      procedure: "Dental X-Rays",
      description: "Advanced imaging to detect hidden dental issues below the gumline",
      details: ["Root examination", "Bone assessment", "Hidden cavity detection", "Structural analysis"],
      icon: Scan,
      color: "#8b5cf6"
    },
    {
      procedure: "Polishing & Prevention",
      description: "Professional polishing and preventive treatments for ongoing oral health",
      details: ["Tooth polishing", "Surface smoothing", "Preventive treatments", "Future buildup prevention"],
      icon: Award,
      color: primaryColor
    },
    {
      procedure: "Comprehensive Oral Exam",
      description: "Complete examination of all oral structures for abnormalities",
      details: ["Gum assessment", "Lip examination", "Tongue evaluation", "Oral tissue check"],
      icon: Eye,
      color: "#ef4444"
    }
  ];

  const warningSignsData = [
    {
      sign: "Bad Breath",
      description: "Persistent halitosis often indicates bacterial buildup and dental disease",
      severity: "early",
      icon: AlertTriangle
    },
    {
      sign: "Brown or Gold Tartar",
      description: "Visible tartar buildup near the gums requiring professional removal",
      severity: "moderate",
      icon: Target
    },
    {
      sign: "Red or Bleeding Gums",
      description: "Inflammation and bleeding indicating gingivitis or periodontal disease",
      severity: "serious",
      icon: Heart
    },
    {
      sign: "Excessive Drooling or Pawing",
      description: "Behavioral changes indicating oral pain or discomfort",
      severity: "serious",
      icon: Activity
    }
  ];

  const healthImpacts = [
    {
      impact: "Oral Pain Prevention",
      description: "Eliminates painful dental disease and maintains comfortable eating",
      icon: Shield
    },
    {
      impact: "Tooth Preservation",
      description: "Prevents tooth loss through early intervention and proper care",
      icon: Bone
    },
    {
      impact: "Infection Control",
      description: "Removes bacteria that can cause local and systemic infections",
      icon: Microscope
    },
    {
      impact: "Organ Protection",
      description: "Prevents dental bacteria from affecting heart, liver, and kidneys",
      icon: Stethoscope
    }
  ];

  const serviceAreas = [
    "Chantilly", "South Riding", "Aldie", "Ashburn", "Centreville", "Reston", "Herndon"
  ];

  const qualityOfLifeBenefits = [
    "Fresher breath and improved comfort",
    "Better eating and nutrition absorption",
    "Prevention of painful dental complications",
    "Enhanced overall health and longevity"
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section - Mobile Only */}
      <section className="text-white sticky z-40 block md:hidden" style={{ top: '4rem', background: `linear-gradient(135deg, ${primaryColor} 0%, #2196c7 100%)`, paddingTop: '0.5rem', paddingBottom: '0.5rem' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="font-bold" style={{ fontSize: '1.125rem' }}>
              Dental Cleaning
            </h1>
          </div>
        </div>
      </section>

      {/* Hero Section */}
      <section className="bg-white pt-6" style={{ paddingBottom: '8px' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h1 className="text-xl font-bold text-gray-900 mb-4">
              Dental Cleaning
            </h1>
            <div className="mb-6">
              <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold text-white" style={{ backgroundColor: primaryColor }}>
                Professional Oral Health Care
              </span>
            </div>
            <p className="text-base text-gray-600 leading-relaxed max-w-4xl mx-auto">
              Does your pet have bad breath, discolored teeth, or tartar buildup? Just like people, pets need regular 
              dental care to protect their health. At Pets and Vets Animal Hospital & Urgent Care, we provide safe, 
              thorough dog and cat dental cleanings in Chantilly, VA, proudly serving pet families in South Riding, 
              Aldie, Ashburn, Centreville, Reston, and Herndon.
            </p>
          </div>
        </div>
      </section>

      {/* Why Dental Cleanings Matter */}
      <section className="bg-[#f8f9fa] py-6">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">
            Why Dental Cleanings Matter
          </h2>
          <p className="text-center text-gray-600 mb-6 text-sm">
            Poor dental health can lead to pain, tooth loss, infection, and even affect your pet's heart, liver, 
            and kidneys. Professional cleanings remove harmful plaque and bacteria, protecting both your pet's 
            mouth and overall health.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {healthImpacts.map((impact, index) => (
              <div key={index} className="bg-white p-4 rounded-lg shadow-sm text-center">
                <div className="flex items-center justify-center w-12 h-12 rounded-full mx-auto mb-3" style={{ backgroundColor: primaryBg }}>
                  <impact.icon className="h-6 w-6" style={{ color: primaryColor }} />
                </div>
                <h3 className="text-base font-semibold text-gray-900 mb-2">{impact.impact}</h3>
                <p className="text-gray-600 text-sm">{impact.description}</p>
              </div>
            ))}
          </div>
          
          <div className="bg-red-50 p-4 rounded-lg border-l-4 border-red-500">
            <div className="flex items-center mb-3">
              <AlertTriangle className="h-5 w-5 mr-2 text-red-600" />
              <h3 className="text-base font-semibold text-red-900">Critical Health Connection</h3>
            </div>
            <p className="text-red-800 text-sm">
              Dental bacteria can enter your pet's bloodstream and travel to vital organs, potentially causing 
              serious health complications. Professional dental cleanings are essential preventive care.
            </p>
          </div>
        </div>
      </section>

      {/* What a Pet Dental Cleaning Involves */}
      <section className="bg-white py-6">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">
            What a Pet Dental Cleaning Involves
          </h2>
          <p className="text-center text-gray-600 mb-6 text-sm">
            Our comprehensive cleanings include:
          </p>
          
          <div className="space-y-4 mb-6">
            {cleaningProcedures.map((procedure, index) => (
              <div key={index} className="bg-gray-50 p-4 rounded-lg shadow-sm">
                <div className="flex flex-col lg:flex-row lg:items-start lg:space-x-4">
                  <div className="flex items-center mb-3 lg:mb-0">
                    <div className="flex items-center justify-center w-12 h-12 rounded-full mr-3" style={{ backgroundColor: `${procedure.color}15` }}>
                      <procedure.icon className="h-6 w-6" style={{ color: procedure.color }} />
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-gray-900">{procedure.procedure}</h3>
                      <p className="text-gray-600 text-sm mt-1">{procedure.description}</p>
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {procedure.details.map((detail, detailIndex) => (
                        <div key={detailIndex} className="flex items-center p-2 rounded border-l-4" style={{ borderColor: procedure.color, backgroundColor: `${procedure.color}05` }}>
                          <CheckCircle className="h-3 w-3 mr-2 flex-shrink-0" style={{ color: procedure.color }} />
                          <span className="text-xs text-gray-700">{detail}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
            <div className="flex items-center mb-3">
              <Shield className="h-5 w-5 mr-2 text-blue-600" />
              <h3 className="text-base font-semibold text-blue-900">Safe Anesthesia Protocol</h3>
            </div>
            <p className="text-blue-800 text-sm">
              Because a complete cleaning can only be done safely under anesthesia, your pet will be kept pain-free 
              and comfortable throughout the procedure. Our experienced team monitors your pet closely to ensure 
              maximum safety and comfort.
            </p>
          </div>
        </div>
      </section>

      {/* Signs Your Pet May Need a Cleaning */}
      <section className="bg-[#f8f9fa] py-6">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">
            Signs Your Pet May Need a Cleaning
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {warningSignsData.map((warning, index) => (
              <div key={index} className={`bg-white p-4 rounded-lg shadow-sm border-l-4 ${
                warning.severity === 'early' ? 'border-yellow-500' :
                warning.severity === 'moderate' ? 'border-orange-500' :
                'border-red-500'
              }`}>
                <div className="flex items-center mb-3">
                  <warning.icon className={`h-5 w-5 mr-2 ${
                    warning.severity === 'early' ? 'text-yellow-600' :
                    warning.severity === 'moderate' ? 'text-orange-600' :
                    'text-red-600'
                  }`} />
                  <h3 className="text-base font-semibold text-gray-900">{warning.sign}</h3>
                </div>
                <p className="text-gray-600 text-sm mb-2">{warning.description}</p>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  warning.severity === 'early' ? 'bg-yellow-100 text-yellow-800' :
                  warning.severity === 'moderate' ? 'bg-orange-100 text-orange-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {warning.severity === 'early' ? 'Early Sign' : 
                   warning.severity === 'moderate' ? 'Moderate Concern' : 'Serious Concern'}
                </span>
              </div>
            ))}
          </div>
          
          <div className="bg-orange-50 p-4 rounded-lg border-l-4 border-orange-500">
            <div className="flex items-center mb-3">
              <Clock className="h-5 w-5 mr-2 text-orange-600" />
              <h3 className="text-base font-semibold text-orange-900">Early Intervention is Key</h3>
            </div>
            <p className="text-orange-800 text-sm">
              If you notice these symptoms, your pet may already have dental disease. Early care helps prevent 
              painful complications and more extensive treatments.
            </p>
          </div>
        </div>
      </section>

      {/* Healthier Mouth, Healthier Pet */}
      <section className="bg-white py-6">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            Healthier Mouth, Healthier Pet
          </h2>
          <div className="p-6 rounded-lg" style={{ backgroundColor: primaryBg }}>
            <p className="text-gray-700 leading-relaxed mb-4" style={{ fontSize: '1rem' }}>
              A professional dental cleaning doesn't just freshen breath—it prevents infection, saves teeth, and 
              improves your pet's quality of life. Regular dental care is an investment in your pet's long-term 
              health and happiness.
            </p>
            <div className="bg-white p-4 rounded-lg">
              <h3 className="text-base font-semibold text-gray-900 mb-3">Quality of Life Benefits:</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {qualityOfLifeBenefits.map((benefit, index) => (
                  <div key={index} className="flex items-center">
                    <CheckCircle className="h-3 w-3 mr-2 flex-shrink-0" style={{ color: primaryColor }} />
                    <span className="text-xs text-gray-700">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Service Areas */}
      <section className="bg-[#f8f9fa] py-6">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            Serving Your Community
          </h2>
          <p className="text-gray-600 mb-6 text-sm">
            We proudly provide professional dental cleaning services to pet families across:
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

      {/* Contact CTA */}
      <section style={{ background: `linear-gradient(135deg, ${primaryColor} 0%, #2196c7 100%)` }} className="py-6">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-bold text-white mb-4" style={{ fontSize: '1rem' }}>
            Schedule Your Pet's Dental Cleaning Today
          </h2>
          <p className="mb-6" style={{ color: 'white', fontSize: '1rem' }}>
            Professional dental care for healthier teeth, fresher breath, and better overall health
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
              Schedule Dental Cleaning
              <MapPin className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default DentalCleanings;