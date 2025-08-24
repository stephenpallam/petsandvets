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
  Zap,
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
  Eye,
  Sparkles,
  CircleDot,
  Users,
  Home,
  Star,
  Leaf
} from 'lucide-react';
import { hospitalInfo } from '../mock';

const PetBladderStoneRemoval = () => {
  const primaryColor = '#29add3';
  const primaryLight = '#5bc0db';
  const primaryBg = '#e6f7fb';
  const warningColor = '#f59e0b';
  const dangerColor = '#ef4444';

  const bladderStoneTypes = [
    {
      type: "Struvite Stones",
      description: "Most common type, often caused by bacterial infections and dietary factors",
      characteristics: ["Associated with UTIs", "More common in female dogs", "Can dissolve with dietary management", "Often recurrent without proper treatment"],
      icon: CircleDot,
      color: "#10b981"
    },
    {
      type: "Calcium Oxalate Stones",
      description: "Hard stones that typically require surgical removal",
      characteristics: ["Cannot be dissolved medically", "More common in males", "Higher recurrence rate", "Requires surgical intervention"],
      icon: Target,
      color: "#ef4444"
    },
    {
      type: "Urate Stones",
      description: "Less common stones often related to genetic factors or liver disease",
      characteristics: ["Breed predisposition exists", "May indicate liver problems", "Can sometimes be dissolved", "Requires specialized diet"],
      icon: Sparkles,
      color: "#8b5cf6"
    },
    {
      type: "Cystine Stones",
      description: "Rare genetic condition causing amino acid crystal formation",
      characteristics: ["Hereditary condition", "Usually in young animals", "Requires lifelong management", "Preventable with proper diet"],
      icon: Star,
      color: "#f59e0b"
    }
  ];

  const symptoms = [
    {
      symptom: "Frequent Urination Attempts",
      description: "Straining to urinate with little or no urine production",
      severity: "High Priority",
      icon: AlertTriangle,
      color: dangerColor
    },
    {
      symptom: "Blood in Urine",
      description: "Pink, red, or dark-colored urine indicating bladder irritation",
      severity: "Concerning",
      icon: Droplets,
      color: "#dc2626"
    },
    {
      symptom: "Painful Urination", 
      description: "Crying, whimpering, or signs of discomfort while urinating",
      severity: "High Priority",
      icon: Heart,
      color: dangerColor
    },
    {
      symptom: "Accidents in the House",
      description: "Inappropriate urination due to urgency and bladder irritation",
      severity: "Monitor Closely",
      icon: Home,
      color: warningColor
    },
    {
      symptom: "Lethargy and Loss of Appetite",
      description: "General discomfort affecting normal behavior and eating",
      severity: "Concerning",
      icon: Activity,
      color: "#8b5cf6"
    }
  ];

  const diagnosticProcess = [
    {
      step: "Physical Examination",
      description: "Comprehensive assessment of symptoms and physical condition",
      details: ["Bladder palpation", "Pain assessment", "Overall health evaluation", "Medical history review"],
      icon: Stethoscope
    },
    {
      step: "Urinalysis & Culture",
      description: "Laboratory analysis to identify infection and stone composition",
      details: ["Urine crystal analysis", "Bacterial culture testing", "pH level measurement", "Protein and blood detection"],
      icon: TestTube
    },
    {
      step: "Advanced Imaging",
      description: "X-rays and ultrasound to locate and measure stones",
      details: ["Digital radiographs", "Ultrasound examination", "Stone size assessment", "Surgical planning"],
      icon: Scan
    }
  ];

  const surgicalOptions = [
    {
      procedure: "Cystotomy",
      description: "Surgical opening of the bladder to remove stones",
      details: ["Most common procedure", "Complete stone removal", "Bladder examination", "Immediate relief"],
      duration: "1-2 hours",
      icon: Scissors
    },
    {
      procedure: "Laser Lithotripsy",
      description: "Advanced laser technology to break up stones",
      details: ["Minimally invasive option", "Breaks stones into fragments", "Less tissue trauma", "Faster recovery"],
      duration: "1-3 hours", 
      icon: Zap
    },
    {
      procedure: "Urethral Stone Removal",
      description: "Specialized procedure for stones blocking the urethra",
      details: ["Emergency procedure", "Immediate blockage relief", "Catheter placement", "Life-saving intervention"],
      duration: "1-2 hours",
      icon: Target
    }
  ];

  const postSurgicalCare = [
    {
      care: "Pain Management",
      description: "Comprehensive protocols to ensure patient comfort during recovery",
      icon: Pill
    },
    {
      care: "Antibiotic Therapy",
      description: "Preventing infection and treating existing bacterial issues",
      icon: Shield
    },
    {
      care: "Activity Restriction",
      description: "Controlled exercise to allow proper healing of surgical sites",
      icon: Timer
    },
    {
      care: "Dietary Management",
      description: "Specialized nutrition to prevent stone recurrence",
      icon: Leaf
    },
    {
      care: "Follow-up Monitoring",
      description: "Regular check-ups to ensure complete recovery and prevention",
      icon: Calendar
    },
    {
      care: "Emergency Support",
      description: "24/7 availability for any post-surgical concerns",
      icon: Phone
    }
  ];

  const preventionStrategies = [
    {
      strategy: "Dietary Management",
      description: "Specialized prescription diets designed to prevent stone formation",
      icon: Leaf
    },
    {
      strategy: "Increased Water Intake",
      description: "Promoting adequate hydration to dilute urine and flush the system",
      icon: Droplets
    },
    {
      strategy: "Regular Monitoring",
      description: "Routine urine testing and examinations to catch problems early",
      icon: Search
    },
    {
      strategy: "Weight Management",
      description: "Maintaining optimal body weight to reduce stone formation risk",
      icon: Target
    }
  ];

  const whyChooseUs = [
    {
      feature: "Advanced Surgical Techniques",
      description: "Multiple surgical options including traditional and minimally invasive procedures",
      icon: Award
    },
    {
      feature: "Complete Diagnostic Capabilities",
      description: "In-house lab, digital X-rays, and ultrasound for accurate diagnosis",
      icon: Microscope
    },
    {
      feature: "Comprehensive Aftercare",
      description: "Detailed recovery plans and ongoing prevention strategies",
      icon: Shield
    },
    {
      feature: "Emergency Availability",
      description: "Urgent care for blocked animals requiring immediate intervention",
      icon: Clock
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
              Pet Bladder Stone Removal
            </h1>
          </div>
        </div>
      </section>

      {/* Hero Section */}
      <section className="bg-white">
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center" style={{ paddingTop: '30px', paddingBottom: '15px' }}>
          <h1 className="text-xl font-bold text-gray-900 mb-6">
            Bladder Stone Removal
          </h1>
          <div className="mb-6">
            <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold text-white" style={{ backgroundColor: primaryColor }}>
              Expert Bladder Stone Removal & Prevention
            </span>
          </div>
          <p className="text-base text-gray-600 leading-relaxed max-w-3xl mx-auto">
            At Pets and Vets Animal Hospital in South Riding, VA—serving Aldie, Ashburn, Chantilly, 
            Centreville, Reston, and Herndon—we provide expert diagnosis and treatment for bladder 
            stones in pets. Our advanced surgical techniques and comprehensive care approach ensure 
            the best outcomes for your pet's urinary health.
          </p>
        </div>
      </section>

      {/* Types of Bladder Stones */}
      <section className="bg-[#f8f9fa] py-6">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">
            Types of Bladder Stones We Treat
          </h2>
          <p className="text-center text-gray-600 mb-8">
            Understanding different stone types helps determine the most effective treatment approach:
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {bladderStoneTypes.map((stone, index) => (
              <div key={index} className="bg-white p-6 rounded-xl shadow-md">
                <div className="flex items-center mb-4">
                  <div className="flex items-center justify-center w-12 h-12 rounded-full mr-4" style={{ backgroundColor: `${stone.color}15` }}>
                    <stone.icon className="h-6 w-6" style={{ color: stone.color }} />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">{stone.type}</h3>
                </div>
                <p className="text-gray-600 text-sm mb-4">{stone.description}</p>
                <div className="space-y-2">
                  <h4 className="font-semibold text-gray-900 text-sm">Key Features:</h4>
                  <div className="space-y-1">
                    {stone.characteristics.slice(0, 2).map((characteristic, charIndex) => (
                      <div key={charIndex} className="flex items-center text-xs text-gray-600">
                        <CheckCircle className="h-3 w-3 mr-2 flex-shrink-0" style={{ color: stone.color }} />
                        <span>{characteristic}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Symptoms */}
      <section className="bg-white py-6">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">
            Recognizing Bladder Stone Symptoms
          </h2>
          <p className="text-center text-gray-600 mb-8">
            Early recognition of these symptoms can prevent serious complications:
          </p>
          
          <div className="space-y-6">
            {symptoms.map((symptom, index) => (
              <div key={index} className="bg-gray-50 p-6 rounded-xl shadow-md border-l-4" style={{ borderColor: symptom.color }}>
                <div className="flex flex-col lg:flex-row lg:items-start lg:space-x-6">
                  <div className="flex items-center mb-4 lg:mb-0">
                    <div className="flex items-center justify-center w-16 h-16 rounded-full mr-4" style={{ backgroundColor: `${symptom.color}15` }}>
                      <symptom.icon className="h-8 w-8" style={{ color: symptom.color }} />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">{symptom.symptom}</h3>
                      <span className="px-3 py-1 rounded-full text-xs font-medium text-white" style={{ backgroundColor: symptom.color }}>
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
        </div>
      </section>

      {/* Diagnostic Process */}
      <section className="bg-[#f8f9fa] py-6">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">
            Our Diagnostic Process
          </h2>
          <p className="text-center text-gray-600 mb-8">
            Accurate diagnosis is essential for effective treatment planning:
          </p>
          
          <div className="space-y-6">
            {diagnosticProcess.map((step, index) => (
              <div key={index} className="bg-white p-6 rounded-xl shadow-md">
                <div className="flex flex-col lg:flex-row lg:items-start lg:space-x-6">
                  <div className="flex items-center mb-4 lg:mb-0">
                    <div className="flex items-center justify-center w-16 h-16 rounded-full mr-4" style={{ backgroundColor: primaryBg }}>
                      <step.icon className="h-8 w-8" style={{ color: primaryColor }} />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">{step.step}</h3>
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-700 mb-4">{step.description}</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {step.details.map((detail, detIndex) => (
                        <div key={detIndex} className="flex items-center p-2 rounded-lg" style={{ backgroundColor: primaryBg }}>
                          <CheckCircle className="h-4 w-4 mr-2 flex-shrink-0" style={{ color: primaryColor }} />
                          <span className="text-sm text-gray-700">{detail}</span>
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

      {/* Surgical Options */}
      <section className="bg-white py-6">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">
            Advanced Surgical Treatment Options
          </h2>
          <p className="text-center text-gray-600 mb-8">
            We offer multiple surgical approaches tailored to your pet's specific condition:
          </p>
          
          <div className="space-y-6">
            {surgicalOptions.map((option, index) => (
              <div key={index} className="bg-gray-50 p-6 rounded-xl shadow-md">
                <div className="flex flex-col lg:flex-row lg:items-start lg:space-x-6">
                  <div className="flex items-center mb-4 lg:mb-0">
                    <div className="flex items-center justify-center w-16 h-16 rounded-full mr-4" style={{ backgroundColor: primaryBg }}>
                      <option.icon className="h-8 w-8" style={{ color: primaryColor }} />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">{option.procedure}</h3>
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                        Duration: {option.duration}
                      </span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-700 mb-4">{option.description}</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {option.details.map((detail, detIndex) => (
                        <div key={detIndex} className="flex items-center p-2 rounded-lg" style={{ backgroundColor: primaryBg }}>
                          <CheckCircle className="h-4 w-4 mr-2 flex-shrink-0" style={{ color: primaryColor }} />
                          <span className="text-sm text-gray-700">{detail}</span>
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

      {/* Post-Surgical Care */}
      <section className="bg-[#f8f9fa] py-6">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">
            Comprehensive Post-Surgical Care
          </h2>
          <p className="text-center text-gray-600 mb-8">
            Recovery support designed to ensure optimal healing and prevent recurrence:
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {postSurgicalCare.map((care, index) => (
              <div key={index} className="bg-white p-6 rounded-xl shadow-md text-center">
                <div className="flex items-center justify-center w-16 h-16 rounded-full mx-auto mb-4" style={{ backgroundColor: primaryBg }}>
                  <care.icon className="h-8 w-8" style={{ color: primaryColor }} />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">{care.care}</h3>
                <p className="text-gray-600 text-sm">{care.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Prevention Strategies */}
      <section className="bg-white py-6">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">
            Prevention Strategies
          </h2>
          <p className="text-center text-gray-600 mb-8">
            Preventing bladder stone recurrence through targeted interventions:
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {preventionStrategies.map((strategy, index) => (
              <div key={index} className="bg-gray-50 p-6 rounded-xl shadow-md text-center">
                <div className="flex items-center justify-center w-16 h-16 rounded-full mx-auto mb-4 bg-green-100">
                  <strategy.icon className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">{strategy.strategy}</h3>
                <p className="text-gray-600 text-sm">{strategy.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="bg-[#f8f9fa] py-6">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">
            Why Choose Our Bladder Stone Services?
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {whyChooseUs.map((feature, index) => (
              <div key={index} className="bg-white p-6 rounded-xl shadow-md text-center">
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

      {/* Expert Care Message */}
      <section className="bg-white py-6">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            Expert Bladder Stone Treatment & Prevention
          </h2>
          <div className="p-8 rounded-xl" style={{ backgroundColor: primaryBg }}>
            <p className="text-gray-700 leading-relaxed mb-6 text-lg">
              Bladder stones can cause significant discomfort and serious complications if left 
              untreated. Our experienced team combines advanced surgical techniques with 
              comprehensive prevention strategies to ensure your pet's long-term urinary health.
            </p>
            <div className="bg-white p-6 rounded-lg">
              <div className="flex items-center justify-center mb-4">
                <Target className="h-8 w-8 mr-3" style={{ color: primaryColor }} />
                <h3 className="text-xl font-semibold text-gray-900">Complete Urinary Care</h3>
              </div>
              <p className="text-gray-800 font-semibold">
                From emergency intervention to long-term prevention—trust our dedicated team 
                to provide the specialized care your pet needs.
              </p>
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
          <p className="text-gray-600 mb-6">
            We proudly provide expert bladder stone treatment to pets and families throughout:
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
            Expert Bladder Stone Treatment
          </h2>
          <p className="mb-8" style={{ color: 'white', fontSize: '1rem' }}>
            Don't let bladder stones cause discomfort—get expert treatment today
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
              Schedule Consultation
              <MapPin className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default PetBladderStoneRemoval;