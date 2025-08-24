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
  Scissors,
  Pill,
  Bandage
} from 'lucide-react';
import { hospitalInfo } from '../mock';

const PetToothExtraction = () => {
  const primaryColor = '#29add3';
  const primaryLight = '#5bc0db';
  const primaryBg = '#e6f7fb';

  const extractionReasons = [
    {
      reason: "Gum Disease",
      description: "Advanced periodontal disease leading to pain, infection, and tooth mobility",
      details: ["Periodontal pockets", "Bone loss", "Root exposure", "Chronic infection"],
      icon: AlertTriangle,
      color: "#ef4444",
      severity: "serious"
    },
    {
      reason: "Broken or Fractured Teeth",
      description: "Traumatic damage exposing nerve endings and causing severe pain",
      details: ["Crown fractures", "Root fractures", "Pulp exposure", "Nerve damage"],
      icon: Target,
      color: "#f59e0b",
      severity: "urgent"
    },
    {
      reason: "Severe Tooth Decay",
      description: "Advanced dental caries causing structural damage and pain",
      details: ["Deep cavities", "Enamel loss", "Dentin damage", "Pulp infection"],
      icon: Search,
      color: "#8b5cf6",
      severity: "progressive"
    },
    {
      reason: "Unerupted Teeth",
      description: "Impacted teeth causing discomfort or complications with normal dentition",
      details: ["Impaction issues", "Alignment problems", "Cyst formation", "Pain and pressure"],
      icon: Bone,
      color: "#10b981",
      severity: "developmental"
    }
  ];

  const procedureSteps = [
    {
      step: "Pre-Surgical Assessment",
      description: "Comprehensive examination and X-rays to plan the safest approach",
      icon: Search
    },
    {
      step: "Safe Anesthesia",
      description: "Pain-free experience with careful monitoring throughout the procedure",
      icon: Shield
    },
    {
      step: "Local Nerve Blocks",
      description: "Extended pain relief lasting 6-8 hours for maximum comfort",
      icon: Zap
    },
    {
      step: "Gentle Extraction",
      description: "Surgical approach when needed with careful tissue handling",
      icon: Scissors
    },
    {
      step: "Socket Care",
      description: "Thorough cleaning and closure with dissolvable sutures",
      icon: Bandage
    }
  ];

  const painManagementOptions = [
    {
      treatment: "Narcotic Pain Medications",
      description: "Professional-grade pain control similar to human dental procedures",
      duration: "As prescribed",
      type: "Primary pain relief"
    },
    {
      treatment: "Anti-Inflammatory Medications",
      description: "Reduces swelling and inflammation at the surgical site",
      duration: "5-7 days typically",
      type: "Swelling control"
    },
    {
      treatment: "Local Nerve Blocks",
      description: "Immediate and extended pain relief during and after surgery",
      duration: "6-8 hours",
      type: "Surgical comfort"
    },
    {
      treatment: "Soft Diet Protocol",
      description: "Gentle nutrition plan to support healing and comfort",
      duration: "During healing",
      type: "Recovery support"
    }
  ];

  const warningSignsData = [
    {
      sign: "Subtle Changes",
      examples: ["Chewing on one side", "Avoiding hard food", "Behavior changes", "Reduced activity"],
      note: "Often the only visible signs"
    },
    {
      sign: "Pain Indicators",
      examples: ["Pawing at mouth", "Excessive drooling", "Head shaking", "Difficulty eating"],
      note: "May indicate severe problem"
    },
    {
      sign: "Visible Damage",
      examples: ["Broken tooth visible", "Swelling around tooth", "Bad breath", "Bleeding gums"],
      note: "Requires immediate attention"
    }
  ];

  const recoveryBenefits = [
    "Immediate relief from dental pain",
    "Improved energy and appetite",
    "Better eating and nutrition",
    "Enhanced overall quality of life",
    "Prevention of systemic infection",
    "Restored normal behavior patterns"
  ];

  const serviceAreas = [
    "Chantilly", "South Riding", "Aldie", "Ashburn", "Centreville", "Reston", "Herndon"
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section - Mobile Only */}
      <section className="text-white sticky z-40 block md:hidden" style={{ top: '4rem', background: `linear-gradient(135deg, ${primaryColor} 0%, #2196c7 100%)`, paddingTop: '0.5rem', paddingBottom: '0.5rem' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="font-bold" style={{ fontSize: '1.125rem' }}>
              Tooth Extractions
            </h1>
          </div>
        </div>
      </section>

      {/* Hero Section */}
      <section className="bg-white pt-6" style={{ paddingBottom: '8px' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h1 className="text-xl font-bold text-gray-900 mb-4">
              Tooth Extractions
            </h1>
            <div className="mb-6">
              <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold text-white" style={{ backgroundColor: primaryColor }}>
                Compassionate Pain Relief
              </span>
            </div>
            <p className="text-base text-gray-600 leading-relaxed max-w-4xl mx-auto">
              Dental pain in pets often goes unnoticed—dogs and cats rarely show obvious symptoms until the problem 
              is severe. You may notice subtle signs like chewing on one side, avoiding hard food, or changes in behavior. 
              At Pets and Vets Animal Hospital & Urgent Care, we provide safe and compassionate pet tooth extractions in 
              Chantilly, VA, proudly serving families in South Riding, Aldie, Ashburn, Centreville, Reston, and Herndon.
            </p>
          </div>
        </div>
      </section>

      {/* Hidden Pain Recognition */}
      <section className="bg-[#f8f9fa] py-6">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">
            Recognizing Hidden Dental Pain
          </h2>
          <p className="text-center text-gray-600 mb-6 text-sm">
            Pets rarely show obvious signs of dental pain. Watch for these subtle indicators:
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {warningSignsData.map((category, index) => (
              <div key={index} className="bg-white p-4 rounded-lg shadow-sm">
                <h3 className="text-base font-semibold text-gray-900 mb-3">{category.sign}</h3>
                <div className="space-y-1 mb-3">
                  {category.examples.map((example, exampleIndex) => (
                    <div key={exampleIndex} className="flex items-center">
                      <CheckCircle className="h-3 w-3 mr-2 flex-shrink-0" style={{ color: primaryColor }} />
                      <span className="text-xs text-gray-700">{example}</span>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-500 italic">{category.note}</p>
              </div>
            ))}
          </div>
          
          <div className="bg-orange-50 p-4 rounded-lg border-l-4 border-orange-500">
            <div className="flex items-center mb-3">
              <Eye className="h-5 w-5 mr-2 text-orange-600" />
              <h3 className="text-base font-semibold text-orange-900">Early Detection is Critical</h3>
            </div>
            <p className="text-orange-800 text-sm">
              Many dental problems go unnoticed until they're severe. Regular dental examinations help identify 
              issues before they become painful emergencies requiring extraction.
            </p>
          </div>
        </div>
      </section>

      {/* Why Pets May Need Tooth Extractions */}
      <section className="bg-white py-6">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">
            Why Pets May Need Tooth Extractions
          </h2>
          <p className="text-center text-gray-600 mb-6 text-sm">
            When extraction is the best option, our skilled team uses advanced technology and gentle care to ensure 
            your pet's safety and comfort.
          </p>
          
          <div className="space-y-4">
            {extractionReasons.map((reason, index) => (
              <div key={index} className="bg-gray-50 p-4 rounded-lg shadow-sm">
                <div className="flex flex-col lg:flex-row lg:items-start lg:space-x-4">
                  <div className="flex items-center mb-3 lg:mb-0">
                    <div className="flex items-center justify-center w-12 h-12 rounded-full mr-3" style={{ backgroundColor: `${reason.color}15` }}>
                      <reason.icon className="h-6 w-6" style={{ color: reason.color }} />
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-gray-900">{reason.reason}</h3>
                      <p className="text-gray-600 text-sm mt-1">{reason.description}</p>
                      <span className="px-2 py-1 text-xs font-medium rounded-full mt-2 inline-block" style={{ backgroundColor: `${reason.color}20`, color: reason.color }}>
                        {reason.severity}
                      </span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {reason.details.map((detail, detailIndex) => (
                        <div key={detailIndex} className="flex items-center p-2 rounded border-l-4" style={{ borderColor: reason.color, backgroundColor: `${reason.color}05` }}>
                          <CheckCircle className="h-3 w-3 mr-2 flex-shrink-0" style={{ color: reason.color }} />
                          <span className="text-xs text-gray-700">{detail}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What to Expect During an Extraction */}
      <section className="bg-[#f8f9fa] py-6">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">
            What to Expect During an Extraction
          </h2>
          <p className="text-center text-gray-600 mb-6 text-sm">
            Tooth extractions are performed under anesthesia for a pain-free experience. Our veterinarians use 
            advanced techniques to ensure your pet's safety and comfort.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
            {procedureSteps.map((step, index) => (
              <div key={index} className="bg-white p-4 rounded-lg shadow-sm text-center">
                <div className="flex items-center justify-center w-12 h-12 rounded-full mx-auto mb-3" style={{ backgroundColor: primaryBg }}>
                  <step.icon className="h-6 w-6" style={{ color: primaryColor }} />
                </div>
                <h3 className="text-base font-semibold text-gray-900 mb-2">{step.step}</h3>
                <p className="text-gray-600 text-sm">{step.description}</p>
              </div>
            ))}
          </div>
          
          <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
            <div className="flex items-center mb-3">
              <Scissors className="h-5 w-5 mr-2 text-blue-600" />
              <h3 className="text-base font-semibold text-blue-900">Surgical Extraction Process</h3>
            </div>
            <p className="text-blue-800 text-sm">
              In surgical cases, gum tissue may be lifted, bone around the tooth carefully removed, and the socket 
              flushed before closing with dissolvable sutures. Our experienced team uses advanced techniques to 
              minimize trauma and promote healing.
            </p>
          </div>
        </div>
      </section>

      {/* Pain Management and Recovery */}
      <section className="bg-white" style={{ paddingTop: '30px', paddingBottom: '30px' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">
            Pain Management and Recovery
          </h2>
          <p className="text-center text-gray-600 mb-8">
            Your pet's comfort is our top priority. We use comprehensive pain management protocols similar to 
            those prescribed for people to control pain and swelling.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {painManagementOptions.map((treatment, index) => (
              <div key={index} className="bg-gray-50 p-6 rounded-xl shadow-md border-l-4" style={{ borderColor: primaryColor }}>
                <div className="flex items-center mb-4">
                  <Pill className="h-6 w-6 mr-3" style={{ color: primaryColor }} />
                  <h3 className="text-lg font-semibold text-gray-900">{treatment.treatment}</h3>
                </div>
                <p className="text-gray-600 text-sm mb-3">{treatment.description}</p>
                <div className="flex justify-between items-center">
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                    {treatment.type}
                  </span>
                  <span className="text-sm font-medium text-green-600">{treatment.duration}</span>
                </div>
              </div>
            ))}
          </div>
          
          <div className="bg-green-50 p-6 rounded-xl border-l-4 border-green-500">
            <div className="flex items-center mb-4">
              <Heart className="h-6 w-6 mr-3 text-green-600" />
              <h3 className="text-lg font-semibold text-green-900">Quick Recovery Timeline</h3>
            </div>
            <p className="text-green-800">
              Most pets recover quickly, returning to their normal routines within days. We'll schedule a follow-up 
              exam to ensure recovery is on track and answer any questions you may have.
            </p>
          </div>
        </div>
      </section>

      {/* A Healthier, Happier Pet */}
      <section className="bg-gray-50" style={{ paddingTop: '30px', paddingBottom: '30px' }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            A Healthier, Happier Pet
          </h2>
          <div className="p-8 rounded-xl" style={{ backgroundColor: primaryBg }}>
            <p className="text-gray-700 leading-relaxed mb-6 text-lg">
              Many owners notice an immediate improvement in their pet's energy, appetite, and overall happiness 
              once dental pain is relieved. Removing problem teeth allows your pet to return to comfortable eating, 
              playing, and enjoying life without pain.
            </p>
            <div className="bg-white p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Post-Extraction Benefits:</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {recoveryBenefits.map((benefit, index) => (
                  <div key={index} className="flex items-center">
                    <CheckCircle className="h-4 w-4 mr-2 flex-shrink-0" style={{ color: primaryColor }} />
                    <span className="text-sm text-gray-700">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
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
            We proudly provide safe and compassionate tooth extraction services to pet families across:
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
      <section style={{ background: `linear-gradient(135deg, ${primaryColor} 0%, #2196c7 100%)`, paddingTop: '30px', paddingBottom: '30px' }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-bold text-white mb-4" style={{ fontSize: '1rem' }}>
            Schedule a Consultation for Pet Tooth Extractions
          </h2>
          <p className="mb-8" style={{ color: 'white', fontSize: '1rem' }}>
            Compassionate dental surgery with comprehensive pain management for your pet's comfort
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
              Schedule Consultation
              <MapPin className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default PetToothExtraction;