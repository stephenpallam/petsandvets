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
  Award,
  Users,
  Calendar,
  Stethoscope,
  Target,
  TrendingUp,
  Scissors,
  Pill,
  Bandage,
  Timer,
  Search,
  FileText,
  Microscope,
  FlaskConical,
  Droplets,
  TestTube,
  Scan,
  Brain,
  Camera,
  Monitor,
  Zap,
  Eye,
  Sparkles,
  CircleDot
} from 'lucide-react';
import { hospitalInfo } from '../mock';

const PetBladderStoneRemoval = () => {
  const primaryColor = '#29add3';
  const primaryLight = '#5bc0db';
  const primaryBg = '#e6f7fb';

  const symptoms = [
    {
      symptom: "Frequent or Unsuccessful Urination",
      description: "Repeated attempts to urinate with little to no urine produced",
      severity: "High Priority",
      icon: Clock,
      color: "#ef4444"
    },
    {
      symptom: "Straining & Pain During Urination",
      description: "Visible discomfort, crying, or positioning changes while urinating",
      severity: "High Priority", 
      icon: AlertTriangle,
      color: "#f59e0b"
    },
    {
      symptom: "Blood in Urine",
      description: "Pink, red, or dark-colored urine indicating irritation or damage",
      severity: "Urgent Care",
      icon: Droplets,
      color: "#dc2626"
    },
    {
      symptom: "Lethargy & Appetite Loss",
      description: "Decreased energy, unwillingness to eat, or hiding behaviors",
      severity: "Monitor Closely",
      icon: Heart,
      color: "#8b5cf6"
    },
    {
      symptom: "Urinary Accidents",
      description: "Housetrained pets having accidents indoors due to urgency",
      severity: "Behavioral Change",
      icon: CircleDot,
      color: "#10b981"
    }
  ];

  const diagnosticTools = [
    {
      tool: "Digital X-rays",
      description: "High-resolution imaging to locate stones and assess bladder condition",
      details: ["Stone size identification", "Location mapping", "Bladder wall evaluation", "Obstruction assessment"],
      icon: Scan,
      color: primaryColor
    },
    {
      tool: "Ultrasound Examination", 
      description: "Advanced imaging for detailed bladder evaluation and stone detection",
      details: ["Real-time bladder imaging", "Stone composition analysis", "Urinary flow assessment", "Soft tissue evaluation"],
      icon: Monitor,
      color: "#10b981"
    },
    {
      tool: "Comprehensive Urinalysis",
      description: "Laboratory analysis to identify crystals, infection, and abnormalities",
      details: ["Crystal identification", "Bacterial culture", "Protein levels", "pH balance testing"],
      icon: TestTube,
      color: "#f59e0b"
    },
    {
      tool: "Stone Analysis",
      description: "Post-removal examination to identify mineral composition and prevent recurrence",
      details: ["Mineral identification", "Formation cause analysis", "Prevention planning", "Diet recommendations"],
      icon: Microscope,
      color: "#8b5cf6"
    }
  ];

  const treatmentOptions = [
    {
      treatment: "Surgical Removal (Cystotomy)",
      description: "Precise surgical procedure for removing larger or obstructive bladder stones",
      process: ["Advanced anesthesia monitoring", "Sterile surgical technique", "Complete bladder flushing", "Thorough stone removal"],
      complexity: "Major Procedure",
      icon: Scissors,
      recovery: "10-14 days"
    },
    {
      treatment: "Prescription Diet Therapy",
      description: "Specialized therapeutic diets designed to dissolve certain types of stones",
      process: ["Stone-specific nutrition", "pH modification", "Mineral regulation", "Long-term monitoring"],
      complexity: "Non-Surgical",
      icon: Pill,
      recovery: "2-6 months"
    }
  ];

  const preventionStrategies = [
    {
      strategy: "Specialized Urinary Health Diets",
      description: "Therapeutic nutrition to maintain optimal urinary pH and mineral balance",
      icon: Heart
    },
    {
      strategy: "Increased Water Intake",
      description: "Encouraging hydration through fresh water, wet food, and water fountains",
      icon: Droplets
    },
    {
      strategy: "Regular Veterinary Monitoring",
      description: "Scheduled checkups with urinalysis to detect early stone formation",
      icon: Stethoscope
    },
    {
      strategy: "Weight Management",
      description: "Maintaining healthy weight to reduce urinary complications and stone risk",
      icon: Activity
    }
  ];

  const whyChooseUs = [
    {
      feature: "Experienced Veterinary Team",
      description: "Skilled surgeons with extensive experience in bladder stone removal procedures",
      icon: Award
    },
    {
      feature: "Advanced Diagnostic Technology",
      description: "State-of-the-art X-ray, ultrasound, and laboratory equipment for precise diagnosis",
      icon: Sparkles
    },
    {
      feature: "Comprehensive Care Approach",
      description: "From initial diagnosis through treatment, recovery, and prevention strategies",
      icon: Shield
    },
    {
      feature: "Compassionate Support",
      description: "Dedicated care for both your pet's health and your family's peace of mind",
      icon: Heart
    }
  ];

  const serviceAreas = [
    "Chantilly", "South Riding", "Aldie", "Ashburn", "Centreville", "Reston", "Herndon"
  ];

  const urgencyIndicators = [
    "Complete inability to urinate",
    "Visible distress or extreme pain",
    "Vomiting alongside urinary symptoms", 
    "Collapse or severe lethargy"
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section - Mobile Only */}
      <section className="text-white sticky z-40 block md:hidden" style={{ top: '4rem', background: `linear-gradient(135deg, ${primaryColor} 0%, #2196c7 100%)`, paddingTop: '0.5rem', paddingBottom: '0.5rem' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="font-bold" style={{ fontSize: '1.125rem' }}>
              Bladder Stone Removal in Pets
            </h1>
          </div>
        </div>
      </section>

      {/* Introduction */}
      <section className="bg-white" style={{ paddingTop: '30px', paddingBottom: '30px' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h1 className="text-xl md:text-2xl font-bold text-gray-900 mb-4">
              Bladder Stone Removal in Pets - Chantilly, VA
            </h1>
            <p className="text-base text-gray-600 leading-relaxed max-w-4xl mx-auto">
              At Pets and Vets Animal Hospital & Urgent Care, we understand how stressful urinary problems can be 
              for both pets and their families. Bladder stones (uroliths) are painful mineral deposits that can block 
              the urinary tract, cause blood in the urine, and even become life-threatening. Our expert veterinary team 
              provides precise diagnosis, safe treatment, and compassionate care so your pet can return to a healthier, 
              more comfortable life.
            </p>
          </div>
          
          {/* Professional Image */}
          <div className="mt-8 flex justify-center">
            <div className="relative max-w-2xl">
              <img 
                src="https://images.unsplash.com/photo-1676155081561-865fab11da37"
                alt="Professional veterinary surgical team performing bladder stone removal procedure"
                className="w-full h-64 object-cover rounded-xl shadow-lg"
              />
              <div className="absolute inset-0 bg-black bg-opacity-10 rounded-xl"></div>
            </div>
          </div>
        </div>
      </section>

      {/* What Are Bladder Stones */}
      <section className="bg-gray-50" style={{ paddingTop: '30px', paddingBottom: '30px' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">
            What Are Bladder Stones?
          </h2>
          <div className="max-w-4xl mx-auto">
            <div className="bg-white p-8 rounded-xl shadow-md">
              <div className="flex items-center mb-4">
                <Target className="h-8 w-8 mr-4" style={{ color: primaryColor }} />
                <h3 className="text-lg font-semibold text-gray-900">Understanding Uroliths</h3>
              </div>
              <p className="text-gray-700 leading-relaxed mb-6">
                Bladder stones are hard mineral formations that develop in a pet's bladder due to urinary imbalances, 
                diet, or underlying health issues. They range in size from tiny grains to larger stones that obstruct 
                urination, leading to pain and complications.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-lg" style={{ backgroundColor: primaryBg }}>
                  <h4 className="font-semibold text-gray-900 mb-2">Formation Causes</h4>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• Urinary pH imbalances</li>
                    <li>• Dietary mineral excess</li>
                    <li>• Bacterial infections</li>
                    <li>• Genetic predisposition</li>
                  </ul>
                </div>
                <div className="p-4 rounded-lg" style={{ backgroundColor: "#fef3c7" }}>
                  <h4 className="font-semibold text-gray-900 mb-2">Stone Types</h4>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• Struvite stones</li>
                    <li>• Calcium oxalate</li>
                    <li>• Urate stones</li>
                    <li>• Cystine stones</li>
                  </ul>
                </div>
                <div className="p-4 rounded-lg" style={{ backgroundColor: "#ecfdf5" }}>
                  <h4 className="font-semibold text-gray-900 mb-2">Risk Factors</h4>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• Inadequate water intake</li>
                    <li>• Urinary tract infections</li>
                    <li>• Breed predisposition</li>
                    <li>• Age and gender</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Common Symptoms */}
      <section className="bg-white" style={{ paddingTop: '30px', paddingBottom: '30px' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">
            Common Symptoms of Bladder Stones
          </h2>
          <p className="text-center text-gray-600 mb-8">
            If your pet shows any of these signs, bladder stones may be the cause:
          </p>
          
          <div className="space-y-6">
            {symptoms.map((symptom, index) => (
              <div key={index} className="bg-gray-50 p-6 rounded-xl shadow-md">
                <div className="flex flex-col lg:flex-row lg:items-start lg:space-x-6">
                  <div className="flex items-center mb-4 lg:mb-0">
                    <div className="flex items-center justify-center w-16 h-16 rounded-full mr-4" style={{ backgroundColor: `${symptom.color}15` }}>
                      <symptom.icon className="h-8 w-8" style={{ color: symptom.color }} />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">{symptom.symptom}</h3>
                      <span className="px-3 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: `${symptom.color}15`, color: symptom.color }}>
                        {symptom.severity}
                      </span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-700 leading-relaxed">{symptom.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-8 bg-red-50 p-6 rounded-xl border-l-4 border-red-500">
            <div className="flex items-center mb-4">
              <AlertTriangle className="h-6 w-6 mr-3 text-red-600" />
              <h3 className="text-lg font-semibold text-red-900">Emergency Warning Signs</h3>
            </div>
            <p className="text-red-800 mb-4">
              Prompt veterinary care is critical, as untreated stones can cause dangerous blockages. Seek immediate attention if you notice:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {urgencyIndicators.map((indicator, index) => (
                <div key={index} className="flex items-center">
                  <AlertTriangle className="h-4 w-4 mr-2 text-red-600 flex-shrink-0" />
                  <span className="text-red-800 text-sm">{indicator}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Diagnostic Methods */}
      <section className="bg-gray-50" style={{ paddingTop: '30px', paddingBottom: '30px' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">
            How We Diagnose Bladder Stones
          </h2>
          <p className="text-center text-gray-600 mb-8">
            We use advanced diagnostic tools to quickly and accurately detect bladder stones:
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {diagnosticTools.map((tool, index) => (
              <div key={index} className="bg-white p-6 rounded-xl shadow-md">
                <div className="flex items-center mb-4">
                  <div className="flex items-center justify-center w-12 h-12 rounded-full mr-4" style={{ backgroundColor: `${tool.color}15` }}>
                    <tool.icon className="h-6 w-6" style={{ color: tool.color }} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{tool.tool}</h3>
                    <p className="text-gray-600 text-sm mt-1">{tool.description}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold text-gray-900 text-sm">Capabilities:</h4>
                  <div className="grid grid-cols-1 gap-2">
                    {tool.details.map((detail, detailIndex) => (
                      <div key={detailIndex} className="flex items-center p-2 rounded-lg" style={{ backgroundColor: `${tool.color}05` }}>
                        <CheckCircle className="h-4 w-4 mr-2 flex-shrink-0" style={{ color: tool.color }} />
                        <span className="text-sm text-gray-700">{detail}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Professional Image */}
          <div className="mt-8 flex justify-center">
            <div className="relative max-w-2xl">
              <img 
                src="https://images.pexels.com/photos/5486963/pexels-photo-5486963.jpeg"
                alt="Advanced veterinary diagnostic equipment for bladder stone detection"
                className="w-full h-64 object-cover rounded-xl shadow-lg"
              />
              <div className="absolute inset-0 bg-black bg-opacity-10 rounded-xl"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Treatment Options */}
      <section className="bg-white" style={{ paddingTop: '30px', paddingBottom: '30px' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">
            Treatment Options
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {treatmentOptions.map((treatment, index) => (
              <div key={index} className="bg-gray-50 p-6 rounded-xl shadow-md">
                <div className="flex items-center mb-4">
                  <treatment.icon className="h-6 w-6 mr-3" style={{ color: primaryColor }} />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{treatment.treatment}</h3>
                    <div className="flex items-center space-x-3 mt-1">
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                        {treatment.complexity}
                      </span>
                      <span className="px-3 py-1 bg-gray-100 text-gray-800 text-xs font-medium rounded-full">
                        Recovery: {treatment.recovery}
                      </span>
                    </div>
                  </div>
                </div>
                <p className="text-gray-600 text-sm mb-4">{treatment.description}</p>
                <div className="space-y-2">
                  <h4 className="font-semibold text-gray-900 text-sm">Treatment Process:</h4>
                  {treatment.process.map((step, stepIndex) => (
                    <div key={stepIndex} className="flex items-center p-2 rounded-lg" style={{ backgroundColor: primaryBg }}>
                      <CheckCircle className="h-4 w-4 mr-2 flex-shrink-0" style={{ color: primaryColor }} />
                      <span className="text-sm text-gray-700">{step}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          
          {/* Professional Image */}
          <div className="mt-8 flex justify-center">
            <div className="relative max-w-2xl">
              <img 
                src="https://images.pexels.com/photos/3924779/pexels-photo-3924779.jpeg"
                alt="Professional veterinary surgical environment for bladder stone removal"
                className="w-full h-64 object-cover rounded-xl shadow-lg"
              />
              <div className="absolute inset-0 bg-black bg-opacity-10 rounded-xl"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Prevention Strategies */}
      <section className="bg-gray-50" style={{ paddingTop: '30px', paddingBottom: '30px' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">
            Preventing Bladder Stones
          </h2>
          <p className="text-center text-gray-600 mb-8">
            After treatment, our veterinarians work with you to keep stones from returning through:
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {preventionStrategies.map((strategy, index) => (
              <div key={index} className="bg-white p-6 rounded-xl shadow-md text-center">
                <div className="flex items-center justify-center w-16 h-16 rounded-full mx-auto mb-4" style={{ backgroundColor: primaryBg }}>
                  <strategy.icon className="h-8 w-8" style={{ color: primaryColor }} />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">{strategy.strategy}</h3>
                <p className="text-gray-600 text-sm">{strategy.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="bg-white" style={{ paddingTop: '30px', paddingBottom: '30px' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">
            Why Choose Our Bladder Stone Services
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {whyChooseUs.map((feature, index) => (
              <div key={index} className="bg-gray-50 p-6 rounded-xl shadow-md text-center">
                <div className="flex items-center justify-center w-16 h-16 rounded-full mx-auto mb-4" style={{ backgroundColor: primaryBg }}>
                  <feature.icon className="h-8 w-8" style={{ color: primaryColor }} />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">{feature.feature}</h3>
                <p className="text-gray-600 text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Expert Care Section */}
      <section className="bg-gray-50" style={{ paddingTop: '30px', paddingBottom: '30px' }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            Expert Care for Your Pet's Urinary Health
          </h2>
          <div className="p-8 rounded-xl" style={{ backgroundColor: primaryBg }}>
            <p className="text-gray-700 leading-relaxed mb-6 text-lg">
              Bladder stones can be painful and dangerous, but with proper diagnosis and treatment, your pet can 
              return to a comfortable, healthy life. Our experienced team uses the latest diagnostic technology 
              and surgical techniques to provide safe, effective stone removal and comprehensive prevention planning.
            </p>
            <div className="bg-white p-6 rounded-lg">
              <div className="flex items-center justify-center mb-4">
                <Stethoscope className="h-8 w-8 mr-3" style={{ color: primaryColor }} />
                <h3 className="text-xl font-semibold text-gray-900">Professional Urinary Health Care</h3>
              </div>
              <p className="text-gray-800 font-semibold">
                From emergency treatment to preventive care—trust our dedicated team to provide the specialized 
                attention your pet needs for optimal urinary health and long-term comfort.
              </p>
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
            At Pets and Vets Animal Hospital & Urgent Care, we're dedicated to keeping pets healthy, comfortable, and thriving in:
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
            Schedule Bladder Stone Evaluation Today
          </h2>
          <p className="mb-8" style={{ color: 'white', fontSize: '1rem' }}>
            Expert diagnosis, safe treatment, and compassionate care for your pet's urinary health
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
              Schedule Evaluation
              <MapPin className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default PetBladderStoneRemoval;