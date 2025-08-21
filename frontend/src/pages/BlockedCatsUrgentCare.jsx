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
  Siren,
  PhoneCall,
  Emergency
} from 'lucide-react';
import { hospitalInfo } from '../mock';

const BlockedCatsUrgentCare = () => {
  const primaryColor = '#29add3';
  const primaryLight = '#5bc0db';
  const primaryBg = '#e6f7fb';
  const emergencyColor = '#dc2626';
  const warningColor = '#f59e0b';

  const emergencySignsData = [
    {
      sign: "Straining or Crying in Litter Box",
      description: "Repeated attempts to urinate with visible distress or vocalization",
      urgency: "EMERGENCY",
      icon: AlertTriangle,
      color: emergencyColor
    },
    {
      sign: "Frequent Unsuccessful Urination",
      description: "Multiple trips to litter box with little to no urine produced",
      urgency: "EMERGENCY", 
      icon: Clock,
      color: emergencyColor
    },
    {
      sign: "Blood in Urine",
      description: "Pink, red, or dark-colored urine indicating severe irritation",
      urgency: "CRITICAL",
      icon: Droplets,
      color: "#b91c1c"
    },
    {
      sign: "Lethargy, Vomiting, Loss of Appetite",
      description: "Systemic signs indicating toxin buildup and kidney stress",
      urgency: "CRITICAL",
      icon: Heart,
      color: "#b91c1c"
    },
    {
      sign: "Swollen, Painful Belly",
      description: "Distended abdomen from urine backup and bladder expansion",
      urgency: "LIFE-THREATENING",
      icon: Target,
      color: "#7f1d1d"
    }
  ];

  const treatmentSteps = [
    {
      step: "Emergency Stabilization",
      description: "Immediate IV fluid therapy and pain relief to stabilize your cat's condition",
      procedures: ["IV fluid administration", "Pain management protocols", "Vital signs monitoring", "Electrolyte correction"],
      icon: Zap,
      urgency: "Immediate"
    },
    {
      step: "Catheter Unblocking",
      description: "Sterile catheter placement to flush the urethra and restore urine flow",
      procedures: ["Sterile catheter insertion", "Urethra flushing", "Obstruction removal", "Flow restoration"],
      icon: Target,
      urgency: "Critical"
    },
    {
      step: "Continuous Monitoring",
      description: "Close observation to prevent re-blockage and ensure stable recovery",
      procedures: ["24-hour monitoring", "Re-blockage prevention", "Kidney function testing", "Recovery assessment"],
      icon: Activity,
      urgency: "Ongoing"
    }
  ];

  const surgicalOption = {
    name: "Perineal Urethrostomy (PU Surgery)",
    description: "Advanced surgical procedure for cats with repeated blockages",
    benefits: ["Creates wider urethral opening", "Reduces future blockage risk", "Long-term relief", "Improved quality of life"],
    process: ["Advanced anesthesia protocols", "Skilled surgical technique", "Close post-operative care", "Recovery monitoring"],
    candidateInfo: "Recommended for male cats with recurrent blockages or severe urethral damage"
  };

  const preventionStrategies = [
    {
      strategy: "Increased Hydration",
      description: "Fresh water and wet food to dilute urine and flush the urinary tract",
      icon: Droplets
    },
    {
      strategy: "Prescription Urinary Diets",
      description: "Specialized nutrition to prevent crystal formation and maintain urinary health",
      icon: Pill
    },
    {
      strategy: "Regular Veterinary Monitoring",
      description: "Scheduled checkups with urinalysis for early detection and prevention",
      icon: Stethoscope
    },
    {
      strategy: "Stress Reduction",
      description: "Environmental enrichment and stress management to reduce blockage triggers",
      icon: Heart
    }
  ];

  const whyChooseUsEmergency = [
    {
      feature: "Emergency Expertise",
      description: "Immediate response protocols for life-threatening feline urinary blockages",
      icon: Siren
    },
    {
      feature: "Advanced Surgical Skills",
      description: "Experienced surgeons skilled in PU surgery with proven success rates",
      icon: Scissors
    },
    {
      feature: "24/7 Critical Care",
      description: "Round-the-clock monitoring and emergency intervention capabilities", 
      icon: Clock
    },
    {
      feature: "Compassionate Emergency Care",
      description: "Understanding the stress and providing support throughout the crisis",
      icon: Shield
    }
  ];

  const serviceAreas = [
    "Chantilly", "South Riding", "Aldie", "Ashburn", "Centreville", "Reston", "Herndon"
  ];

  const criticalFactors = [
    "Every hour without treatment increases kidney damage",
    "Toxin buildup can cause death within 24-72 hours",
    "Early intervention greatly improves survival rates",
    "Male cats are at highest risk due to narrow urethra"
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Emergency Hero Section - Mobile Only */}
      <section className="text-white sticky z-40 block md:hidden" style={{ top: '4rem', background: `linear-gradient(135deg, ${emergencyColor} 0%, #b91c1c 100%)`, paddingTop: '0.5rem', paddingBottom: '0.5rem' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center flex items-center justify-center">
            <Siren className="h-5 w-5 mr-2" />
            <h1 className="font-bold" style={{ fontSize: '1.125rem' }}>
              Blocked Cats - Emergency Care
            </h1>
          </div>
        </div>
      </section>

      {/* Critical Emergency Alert */}
      <section style={{ background: `linear-gradient(135deg, ${emergencyColor} 0%, #b91c1c 100%)`, paddingTop: '20px', paddingBottom: '20px' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white bg-opacity-95 p-6 rounded-xl shadow-lg text-center">
            <div className="flex items-center justify-center mb-4">
              <AlertTriangle className="h-8 w-8 mr-3 text-red-600" />
              <h2 className="text-xl font-bold text-red-900">LIFE-THREATENING EMERGENCY</h2>
            </div>
            <p className="text-red-800 font-semibold text-lg mb-4">
              If your cat is showing signs of urinary blockage, this is a veterinary emergency. 
              Call us immediately or come in right away.
            </p>
            <a
              href={`tel:${hospitalInfo.phone}`}
              className="inline-flex items-center justify-center bg-red-600 text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-red-700 transition-colors duration-200"
            >
              <PhoneCall className="mr-2 h-6 w-6" />
              EMERGENCY: {hospitalInfo.phone}
            </a>
          </div>
        </div>
      </section>

      {/* Introduction */}
      <section className="bg-white" style={{ paddingTop: '30px', paddingBottom: '30px' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h1 className="text-xl md:text-2xl font-bold text-gray-900 mb-4">
              Blocked Cats – Life-Saving Care for Urinary Blockages
            </h1>
            <p className="text-base text-gray-600 leading-relaxed max-w-4xl mx-auto">
              At Pets and Vets Animal Hospital & Urgent Care in Chantilly, VA, we know how frightening it is when 
              your cat struggles to urinate. Urinary blockages in cats—especially male cats—are life-threatening 
              emergencies that require immediate veterinary care. With expert treatment and advanced surgical options, 
              our team is here to save lives and restore your cat's comfort.
            </p>
          </div>
          
          {/* Professional Image */}
          <div className="mt-8 flex justify-center">
            <div className="relative max-w-2xl">
              <img 
                src="https://images.unsplash.com/photo-1733783506192-653df6185a7d"
                alt="Professional veterinary examination of cat for urinary blockage emergency"
                className="w-full h-64 object-cover rounded-xl shadow-lg"
              />
              <div className="absolute inset-0 bg-black bg-opacity-10 rounded-xl"></div>
            </div>
          </div>
        </div>
      </section>

      {/* What Is a Urinary Blockage */}
      <section className="bg-gray-50" style={{ paddingTop: '30px', paddingBottom: '30px' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">
            What Is a Urinary Blockage?
          </h2>
          <div className="max-w-4xl mx-auto">
            <div className="bg-white p-8 rounded-xl shadow-md">
              <div className="flex items-center mb-4">
                <AlertTriangle className="h-8 w-8 mr-4 text-red-600" />
                <h3 className="text-lg font-semibold text-gray-900">Life-Threatening Emergency</h3>
              </div>
              <p className="text-gray-700 leading-relaxed mb-6">
                A urinary blockage occurs when the urethra becomes obstructed by crystals, stones, or mucus plugs. 
                This prevents urine from passing, leading to dangerous toxin buildup, severe pain, kidney damage, 
                and—if untreated—death.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-4 rounded-lg bg-red-50 border-l-4 border-red-500">
                  <h4 className="font-semibold text-red-900 mb-3">Critical Time Factors</h4>
                  <div className="space-y-2">
                    {criticalFactors.map((factor, index) => (
                      <div key={index} className="flex items-start">
                        <Clock className="h-4 w-4 mr-2 text-red-600 flex-shrink-0 mt-0.5" />
                        <span className="text-red-800 text-sm">{factor}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="p-4 rounded-lg bg-blue-50 border-l-4 border-blue-500">
                  <h4 className="font-semibold text-blue-900 mb-3">Common Causes</h4>
                  <ul className="text-sm text-blue-800 space-y-2">
                    <li className="flex items-center">
                      <CircleDot className="h-3 w-3 mr-2 flex-shrink-0" />
                      Urinary crystals (struvite, calcium oxalate)
                    </li>
                    <li className="flex items-center">
                      <CircleDot className="h-3 w-3 mr-2 flex-shrink-0" />
                      Bladder stones or debris
                    </li>
                    <li className="flex items-center">
                      <CircleDot className="h-3 w-3 mr-2 flex-shrink-0" />
                      Mucus plugs from inflammation
                    </li>
                    <li className="flex items-center">
                      <CircleDot className="h-3 w-3 mr-2 flex-shrink-0" />
                      Urethral strictures or swelling
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Emergency Signs */}
      <section className="bg-white" style={{ paddingTop: '30px', paddingBottom: '30px' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">
            Emergency Signs of a Blocked Cat
          </h2>
          <p className="text-center text-gray-600 mb-8">
            <strong>Call us immediately if you notice:</strong>
          </p>
          
          <div className="space-y-6">
            {emergencySignsData.map((sign, index) => (
              <div key={index} className="bg-gray-50 p-6 rounded-xl shadow-md border-l-4" style={{ borderColor: sign.color }}>
                <div className="flex flex-col lg:flex-row lg:items-start lg:space-x-6">
                  <div className="flex items-center mb-4 lg:mb-0">
                    <div className="flex items-center justify-center w-16 h-16 rounded-full mr-4" style={{ backgroundColor: `${sign.color}15` }}>
                      <sign.icon className="h-8 w-8" style={{ color: sign.color }} />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">{sign.sign}</h3>
                      <span className="px-3 py-1 rounded-full text-xs font-bold text-white" style={{ backgroundColor: sign.color }}>
                        {sign.urgency}
                      </span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-700 leading-relaxed">{sign.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-8 bg-red-50 p-6 rounded-xl border-2 border-red-500">
            <div className="flex items-center justify-center mb-4">
              <Siren className="h-8 w-8 mr-3 text-red-600" />
              <h3 className="text-xl font-bold text-red-900">Don't Wait - Every Hour Matters</h3>
            </div>
            <p className="text-red-800 text-center font-semibold text-lg">
              If your cat is blocked, don't wait—every hour matters. This is a life-threatening emergency requiring immediate veterinary intervention.
            </p>
          </div>
        </div>
      </section>

      {/* Treatment Options */}
      <section className="bg-gray-50" style={{ paddingTop: '30px', paddingBottom: '30px' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">
            How We Treat Urinary Blockages
          </h2>
          
          {/* Emergency Treatment Steps */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-6 text-center">Emergency Stabilization & Unblocking</h3>
            <div className="space-y-6">
              {treatmentSteps.map((step, index) => (
                <div key={index} className="bg-white p-6 rounded-xl shadow-md">
                  <div className="flex flex-col lg:flex-row lg:items-start lg:space-x-6">
                    <div className="flex items-center mb-4 lg:mb-0">
                      <div className="flex items-center justify-center w-16 h-16 rounded-full mr-4" style={{ backgroundColor: primaryBg }}>
                        <step.icon className="h-8 w-8" style={{ color: primaryColor }} />
                      </div>
                      <div>
                        <h4 className="text-xl font-semibold text-gray-900">{step.step}</h4>
                        <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                          {step.urgency}
                        </span>
                      </div>
                    </div>
                    <div className="flex-1">
                      <p className="text-gray-700 mb-4">{step.description}</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {step.procedures.map((procedure, procIndex) => (
                          <div key={procIndex} className="flex items-center p-2 rounded-lg" style={{ backgroundColor: primaryBg }}>
                            <CheckCircle className="h-4 w-4 mr-2 flex-shrink-0" style={{ color: primaryColor }} />
                            <span className="text-sm text-gray-700">{procedure}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Professional Image */}
          <div className="mt-8 flex justify-center">
            <div className="relative max-w-2xl">
              <img 
                src="https://images.unsplash.com/photo-1733783489145-f3d3ee7a9ccf"
                alt="Professional veterinary care for blocked cat emergency treatment"
                className="w-full h-64 object-cover rounded-xl shadow-lg"
              />
              <div className="absolute inset-0 bg-black bg-opacity-10 rounded-xl"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Surgical Option */}
      <section className="bg-white" style={{ paddingTop: '30px', paddingBottom: '30px' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">
            Advanced Surgical Care
          </h2>
          
          <div className="max-w-4xl mx-auto">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-8 rounded-xl shadow-md">
              <div className="flex items-center mb-4">
                <Scissors className="h-8 w-8 mr-4" style={{ color: primaryColor }} />
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">{surgicalOption.name}</h3>
                  <p className="text-gray-600">{surgicalOption.description}</p>
                </div>
              </div>
              <p className="text-gray-700 mb-6">{surgicalOption.candidateInfo}</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                    <Award className="h-5 w-5 mr-2" style={{ color: primaryColor }} />
                    Benefits
                  </h4>
                  <div className="space-y-2">
                    {surgicalOption.benefits.map((benefit, index) => (
                      <div key={index} className="flex items-center">
                        <CheckCircle className="h-4 w-4 mr-2 text-green-600 flex-shrink-0" />
                        <span className="text-sm text-gray-700">{benefit}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="bg-white p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                    <Stethoscope className="h-5 w-5 mr-2" style={{ color: primaryColor }} />
                    Surgical Process
                  </h4>
                  <div className="space-y-2">
                    {surgicalOption.process.map((step, index) => (
                      <div key={index} className="flex items-center">
                        <CheckCircle className="h-4 w-4 mr-2 flex-shrink-0" style={{ color: primaryColor }} />
                        <span className="text-sm text-gray-700">{step}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Professional Image */}
          <div className="mt-8 flex justify-center">
            <div className="relative max-w-2xl">
              <img 
                src="https://images.unsplash.com/photo-1721907043581-ae2fdca684e8"
                alt="Professional veterinary surgeon providing compassionate care for blocked cat"
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
            Preventing Future Blockages
          </h2>
          
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
            Why Choose Our Emergency Care
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {whyChooseUsEmergency.map((feature, index) => (
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

      {/* Emergency Care Message */}
      <section className="bg-gray-50" style={{ paddingTop: '30px', paddingBottom: '30px' }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            Your Cat's Life Depends on Fast, Expert Care
          </h2>
          <div className="p-8 rounded-xl" style={{ backgroundColor: primaryBg }}>
            <p className="text-gray-700 leading-relaxed mb-6 text-lg">
              Urinary blockages are true veterinary emergencies where every minute counts. Our experienced emergency 
              team is equipped with advanced diagnostic tools and surgical expertise to provide immediate, life-saving 
              care when your cat needs it most.
            </p>
            <div className="bg-white p-6 rounded-lg">
              <div className="flex items-center justify-center mb-4">
                <Siren className="h-8 w-8 mr-3" style={{ color: emergencyColor }} />
                <h3 className="text-xl font-semibold text-gray-900">Emergency Veterinary Care</h3>
              </div>
              <p className="text-gray-800 font-semibold">
                From emergency stabilization to advanced surgery—we're ready when you need us most. 
                Don't wait if your cat shows signs of urinary blockage.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Service Areas */}
      <section className="bg-white" style={{ paddingTop: '30px', paddingBottom: '30px' }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            Emergency Care for Your Community
          </h2>
          <p className="text-gray-600 mb-6">
            We proudly serve families and their cats throughout:
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
      <section style={{ background: `linear-gradient(135deg, ${emergencyColor} 0%, #b91c1c 100%)`, paddingTop: '30px', paddingBottom: '30px' }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center mb-4">
            <Siren className="h-8 w-8 mr-3 text-white" />
            <h2 className="font-bold text-white text-xl">
              EMERGENCY: Is Your Cat Blocked?
            </h2>
          </div>
          <p className="mb-8 text-white text-lg font-semibold">
            Don't wait—call immediately or come in right away. Your cat's life depends on fast action.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href={`tel:${hospitalInfo.phone}`}
              className="inline-flex items-center justify-center bg-white px-8 py-4 rounded-lg font-bold text-lg transition-colors duration-200"
              style={{ color: emergencyColor }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#f9fafb'}
              onMouseLeave={(e) => e.target.style.backgroundColor = 'white'}
            >
              <PhoneCall className="mr-2 h-6 w-6" />
              CALL NOW: {hospitalInfo.phone}
            </a>
            <Link
              to="/contact"
              className="inline-flex items-center justify-center border-2 border-white text-white px-8 py-4 rounded-lg font-semibold transition-colors duration-200"
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = 'white';
                e.target.style.color = emergencyColor;
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
          <p className="mt-6 text-white text-sm">
            <strong>Pets and Vets Animal Hospital & Urgent Care</strong><br />
            We're ready when you need us most.
          </p>
        </div>
      </section>
    </div>
  );
};

export default BlockedCatsUrgentCare;