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
  Leaf,
  Cat
} from 'lucide-react';
import { hospitalInfo }
import { useBusinessInfo } from '../hooks/useBusinessInfo';

const BlockedCatsUrgentCare = () => {
  const { businessInfo: currentBusinessInfo } = useBusinessInfo();
  const primaryColor = '#29add3';
  const primaryLight = '#5bc0db';
  const primaryBg = '#e6f7fb';
  const warningColor = '#f59e0b';
  const dangerColor = '#ef4444';

  const emergencySymptoms = [
    {
      symptom: "Straining to Urinate",
      description: "Frequent trips to litter box with little or no urine production",
      severity: "EMERGENCY",
      icon: AlertTriangle,
      color: dangerColor,
      timeframe: "Seek immediate care"
    },
    {
      symptom: "Crying or Vocalizing",
      description: "Painful sounds while attempting to urinate or general distress",
      severity: "EMERGENCY",
      icon: Cat,
      color: dangerColor,
      timeframe: "Do not wait"
    },
    {
      symptom: "Lethargy & Loss of Appetite",
      description: "Sudden decrease in energy and interest in food or treats",
      severity: "URGENT",
      icon: Activity,
      color: "#dc2626",
      timeframe: "Within hours"
    },
    {
      symptom: "Vomiting",
      description: "Nausea and vomiting due to toxin buildup from inability to urinate",
      severity: "CRITICAL",
      icon: Target,
      color: dangerColor,
      timeframe: "Life-threatening"
    },
    {
      symptom: "Hiding or Unusual Behavior",
      description: "Seeking isolation, aggression, or other abnormal behaviors",
      severity: "CONCERNING",
      icon: Eye,
      color: warningColor,
      timeframe: "Monitor closely"
    }
  ];

  const riskFactors = [
    {
      factor: "Male Cats",
      description: "Males have narrower urethras making blockages more likely",
      risk: "High Risk",
      icon: Target,
      color: dangerColor
    },
    {
      factor: "Dry Food Diet",
      description: "Low moisture intake can contribute to urinary crystal formation",
      risk: "Moderate Risk",
      icon: Droplets,
      color: warningColor
    },
    {
      factor: "Stress & Environment",
      description: "Changes in routine, moving, or multi-cat households increase risk",
      risk: "Variable Risk",
      icon: Home,
      color: "#8b5cf6"
    },
    {
      factor: "Previous Blockages",
      description: "Cats with history of blockages are at higher risk for recurrence",
      risk: "Very High Risk",
      icon: AlertTriangle,
      color: "#dc2626"
    },
    {
      factor: "Obesity",
      description: "Overweight cats have increased risk of urinary complications",
      risk: "Moderate Risk",
      icon: Heart,
      color: warningColor
    }
  ];

  const emergencyTreatment = [
    {
      step: "Immediate Stabilization",
      description: "Emergency catheterization to relieve blockage and restore urine flow",
      urgency: "Life-saving",
      procedures: ["Urethral catheterization", "Bladder emptying", "Pain management", "IV fluid therapy"],
      icon: Zap
    },
    {
      step: "Toxin Management",
      description: "Treatment of electrolyte imbalances and toxin buildup",
      urgency: "Critical",
      procedures: ["Blood chemistry monitoring", "Electrolyte correction", "Kidney function support", "Cardiac monitoring"],
      icon: TestTube
    },
    {
      step: "Catheter Management",
      description: "Maintaining catheter placement for proper drainage and healing",
      urgency: "Essential",
      procedures: ["Sterile catheter care", "Continuous monitoring", "Infection prevention", "Comfort measures"],
      icon: Monitor
    }
  ];

  const preventionStrategies = [
    {
      strategy: "Increased Water Intake",
      description: "Multiple water sources and wet food to promote hydration",
      methods: ["Fresh water daily", "Water fountains", "Wet food diet", "Flavor water with tuna juice"],
      icon: Droplets
    },
    {
      strategy: "Stress Reduction",
      description: "Environmental management to reduce stress-related urinary issues",
      methods: ["Consistent routine", "Multiple litter boxes", "Quiet feeding areas", "Pheromone diffusers"],
      icon: Heart
    },
    {
      strategy: "Diet Management",
      description: "Urinary health diets designed to prevent crystal formation",
      methods: ["Prescription urinary diets", "Controlled mineral content", "Proper pH balance", "Regular feeding schedule"],
      icon: Leaf
    },
    {
      strategy: "Regular Monitoring",
      description: "Routine check-ups and early detection of urinary issues",
      methods: ["Annual urinalysis", "Weight management", "Behavior monitoring", "Quick response to symptoms"],
      icon: Search
    }
  ];

  const recoverySupport = [
    {
      support: "Hospitalization & Monitoring",
      description: "24/7 care during critical recovery period",
      icon: Monitor
    },
    {
      support: "Pain Management",
      description: "Comprehensive comfort protocols during treatment",
      icon: Pill
    },
    {
      support: "Nutritional Support",
      description: "Specialized diets to support recovery and prevention",
      icon: Leaf
    },
    {
      support: "Follow-up Care",
      description: "Regular monitoring to prevent recurrence",
      icon: Calendar
    },
    {
      support: "Owner Education",
      description: "Training on prevention strategies and warning signs",
      icon: FileText
    },
    {
      support: "Emergency Planning",
      description: "24/7 support and emergency contact protocols",
      icon: Phone
    }
  ];

  const whyChooseUs = [
    {
      feature: "Emergency Care",
      description: "Immediate availability for blocked cat emergencies—no appointment needed",
      icon: Clock
    },
    {
      feature: "Advanced Equipment",
      description: "Specialized catheters and monitoring equipment for feline urinary emergencies",
      icon: Award
    },
    {
      feature: "Experienced Team",
      description: "Veterinarians trained in emergency feline urinary blockage treatment",
      icon: Stethoscope
    },
    {
      feature: "Comprehensive Care",
      description: "From emergency treatment through long-term prevention planning",
      icon: Shield
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
              Blocked Cats
            </h1>
          </div>
        </div>
      </section>

      {/* Hero Section */}
      <section className="bg-white pt-6" style={{ paddingBottom: '8px' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h1 className="text-xl font-bold text-gray-900 mb-4">
              Blocked Cats
            </h1>
            <div className="mb-6">
              <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold text-white" style={{ backgroundColor: primaryColor }}>
                Emergency Care for Blocked Cats
              </span>
            </div>
            <p className="text-base text-gray-600 leading-relaxed max-w-4xl mx-auto">
              We provide emergency care for blocked cats. Male cats are particularly susceptible to urinary 
              blockages, which are true medical emergencies requiring immediate intervention to save their lives.
            </p>
          </div>
        </div>
      </section>

      {/* Emergency Symptoms */}
      <section className="bg-[#f8f9fa] py-6">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">
            Critical Emergency Symptoms
          </h2>
          <p className="text-center text-gray-600 mb-6 text-sm">
            <strong>Contact us immediately if your cat shows any of these signs:</strong>
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {emergencySymptoms.map((symptom, index) => (
              <div key={index} className="bg-white p-4 rounded-lg shadow-sm">
                <div className="flex items-center mb-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full mr-3" style={{ backgroundColor: `${symptom.color}15` }}>
                    <symptom.icon className="h-5 w-5" style={{ color: symptom.color }} />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-gray-900">{symptom.symptom}</h3>
                    <div className="flex items-center space-x-1 mt-1">
                      <span className="px-2 py-1 rounded-full text-xs font-medium text-white" style={{ backgroundColor: symptom.color }}>
                        {symptom.severity}
                      </span>
                    </div>
                  </div>
                </div>
                <p className="text-gray-600 text-sm">{symptom.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Risk Factors */}
      <section className="bg-white py-6">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">
            Risk Factors for Urinary Blockages
          </h2>
          <p className="text-center text-gray-600 mb-6 text-sm">
            Understanding risk factors helps with prevention and early recognition:
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {riskFactors.map((factor, index) => (
              <div key={index} className="bg-gray-50 p-4 rounded-lg shadow-sm">
                <div className="flex items-center mb-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full mr-3" style={{ backgroundColor: `${factor.color}15` }}>
                    <factor.icon className="h-5 w-5" style={{ color: factor.color }} />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-gray-900">{factor.factor}</h3>
                    <span className="px-2 py-1 rounded-full text-xs font-medium text-white" style={{ backgroundColor: factor.color }}>
                      {factor.risk}
                    </span>
                  </div>
                </div>
                <p className="text-gray-600 text-sm">{factor.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Emergency Treatment */}
      <section className="bg-[#f8f9fa] py-6">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">
            Emergency Treatment Protocol
          </h2>
          <p className="text-center text-gray-600 mb-6 text-sm">
            Our immediate response protocol for blocked cats follows these critical steps:
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {emergencyTreatment.map((step, index) => (
              <div key={index} className="bg-white p-4 rounded-lg shadow-sm">
                <div className="flex items-center mb-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full mr-3" style={{ backgroundColor: primaryBg }}>
                    <step.icon className="h-5 w-5" style={{ color: primaryColor }} />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-gray-900">{step.step}</h3>
                    <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full">
                      {step.urgency}
                    </span>
                  </div>
                </div>
                <p className="text-gray-600 text-sm">{step.description}</p>
                <div className="space-y-2">
                  <h4 className="font-semibold text-gray-900 text-sm">Includes:</h4>
                  <div className="space-y-1">
                    {step.procedures.slice(0, 2).map((procedure, procIndex) => (
                      <div key={procIndex} className="flex items-center text-xs text-gray-600">
                        <CheckCircle className="h-3 w-3 mr-2 flex-shrink-0" style={{ color: primaryColor }} />
                        <span>{procedure}</span>
                      </div>
                    ))}
                  </div>
                </div>
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
            Preventing urinary blockages through proactive care and environmental management:
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {preventionStrategies.map((strategy, index) => (
              <div key={index} className="bg-gray-50 p-6 rounded-xl shadow-md">
                <div className="flex items-center mb-4">
                  <div className="flex items-center justify-center w-12 h-12 rounded-full mr-4 bg-green-100">
                    <strategy.icon className="h-6 w-6 text-green-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">{strategy.strategy}</h3>
                </div>
                <p className="text-gray-600 text-sm mb-4">{strategy.description}</p>
                <div className="space-y-2">
                  <h4 className="font-semibold text-gray-900 text-sm">Key Methods:</h4>
                  <div className="space-y-1">
                    {strategy.methods.slice(0, 2).map((method, methIndex) => (
                      <div key={methIndex} className="flex items-center text-xs text-gray-600">
                        <CheckCircle className="h-3 w-3 mr-2 flex-shrink-0 text-green-600" />
                        <span>{method}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Recovery Support */}
      <section className="bg-white py-6">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">
            Recovery & Ongoing Support
          </h2>
          <p className="text-center text-gray-600 mb-8">
            Comprehensive support throughout recovery and prevention of future episodes:
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recoverySupport.map((support, index) => (
              <div key={index} className="bg-gray-50 p-6 rounded-xl shadow-md text-center">
                <div className="flex items-center justify-center w-16 h-16 rounded-full mx-auto mb-4" style={{ backgroundColor: primaryBg }}>
                  <support.icon className="h-8 w-8" style={{ color: primaryColor }} />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">{support.support}</h3>
                <p className="text-gray-600 text-sm">{support.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="bg-[#f8f9fa] py-6">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">
            Why Choose Our Emergency Care?
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

      {/* Life-Saving Care Message */}
      <section className="bg-white py-6">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            Life-Saving Emergency Care When Minutes Count
          </h2>
          <div className="p-6 rounded-lg" style={{ backgroundColor: primaryBg }}>
            <p className="text-gray-700 leading-relaxed mb-4" style={{ fontSize: '1rem' }}>
              Urinary blockages in male cats are true medical emergencies. Every minute counts 
              when your cat's life is at stake. Our experienced emergency team is equipped with 
              the specialized knowledge and equipment needed to save blocked cats.
            </p>
            <div className="bg-white p-4 rounded-lg">
              <div className="flex items-center justify-center mb-3">
                <Cat className="h-6 w-6 mr-2" style={{ color: primaryColor }} />
                <h3 className="text-base font-semibold text-gray-900">Emergency Excellence</h3>
              </div>
              <p className="text-gray-800 text-sm font-semibold">
                Don't wait—if your cat shows signs of a blockage, call immediately or come 
                directly to our hospital. We're here to save lives when every second matters.
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
          <p className="text-gray-600 mb-6 text-sm">
            We provide emergency care for blocked cats throughout our service area:
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

      {/* Emergency Contact CTA */}
      <section style={{ background: `linear-gradient(135deg, ${dangerColor} 0%, #dc2626 100%)`, paddingTop: '30px', paddingBottom: '30px' }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-bold text-white mb-4" style={{ fontSize: '1rem' }}>
            FELINE EMERGENCY - CALL NOW
          </h2>
          <p className="mb-8" style={{ color: 'white', fontSize: '1rem' }}>
            If your cat is blocked or showing signs of blockage, this is a life-threatening emergency
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href={`tel:${currentBusinessInfo.phone}`}
              className="inline-flex items-center justify-center bg-white px-8 py-3 rounded-lg font-semibold transition-colors duration-200"
              style={{ color: dangerColor }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#f9fafb'}
              onMouseLeave={(e) => e.target.style.backgroundColor = 'white'}
            >
              <Phone className="mr-2 h-5 w-5" />
              EMERGENCY: {currentBusinessInfo.phone}
            </a>
            <Link
              to="/reach-us"
              className="inline-flex items-center justify-center border-2 border-white text-white px-8 py-3 rounded-lg font-semibold transition-colors duration-200"
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = 'white';
                e.target.style.color = dangerColor;
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'transparent';  
                e.target.style.color = 'white';
              }}
            >
              Get Directions
              <MapPin className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default BlockedCatsUrgentCare;