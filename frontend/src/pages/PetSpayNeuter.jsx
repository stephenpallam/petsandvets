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
  PlusCircle,
  MinusCircle
} from 'lucide-react';
import { hospitalInfo } from '../mock';

const PetSpayNeuter = () => {
  const primaryColor = '#29add3';
  const primaryLight = '#5bc0db';
  const primaryBg = '#e6f7fb';
  const warningColor = '#f59e0b';
  const dangerColor = '#ef4444';

  const healthBenefits = [
    {
      benefit: "Cancer Prevention",
      description: "Significantly reduces risk of reproductive cancers and related health issues",
      details: ["Eliminates ovarian and uterine cancer risk", "Reduces mammary cancer risk by 90%+", "Prevents testicular cancer", "Reduces prostate problems"],
      icon: Shield,
      color: "#10b981"
    },
    {
      benefit: "Behavioral Improvements",
      description: "Reduces unwanted behaviors and promotes calmer, more focused pets",
      details: ["Reduces aggression and territorial marking", "Decreases roaming and escape attempts", "Eliminates heat cycles in females", "Reduces mounting behaviors"],
      icon: Star,
      color: "#8b5cf6"
    },
    {
      benefit: "Population Control",
      description: "Prevents unwanted litters and reduces pet overpopulation",
      details: ["Eliminates accidental breeding", "Reduces shelter overpopulation", "Prevents abandonment issues", "Community health responsibility"],
      icon: Users,
      color: primaryColor
    },
    {
      benefit: "Longevity & Health",
      description: "Spayed and neutered pets typically live longer, healthier lives",
      details: ["Increased average lifespan", "Reduced risk of infections", "Decreased injury from fighting", "Overall improved quality of life"],
      icon: Heart,
      color: "#ef4444"
    }
  ];

  const procedureDetails = [
    {
      procedure: "Spaying (Females)",
      description: "Ovariohysterectomy - surgical removal of ovaries and uterus",
      details: ["Performed under general anesthesia", "Small abdominal incision", "Complete removal of reproductive organs", "Absorbable sutures used"],
      duration: "45-90 minutes",
      icon: PlusCircle
    },
    {
      procedure: "Neutering (Males)",
      description: "Orchiectomy - surgical removal of testicles",
      details: ["Quick outpatient procedure", "Small scrotal incision", "Removal of both testicles", "Minimal tissue disruption"],
      duration: "20-45 minutes", 
      icon: MinusCircle
    }
  ];

  const ageGuidelines = [
    {
      age: "Puppies & Kittens",
      timing: "6-8 months old",
      description: "Ideal age for most pets, before sexual maturity",
      considerations: ["Before first heat cycle", "Adequate physical development", "Optimal healing response", "Behavioral benefits maximized"],
      color: "#10b981"
    },
    {
      age: "Adult Pets",
      timing: "Any age after 6 months",
      description: "Adult pets can be safely spayed/neutered with proper evaluation",
      considerations: ["Pre-surgical health assessment", "Additional monitoring may be needed", "Still provides significant benefits", "Recovery may take slightly longer"],
      color: primaryColor
    },
    {
      age: "Senior Pets",
      timing: "Case-by-case evaluation",
      description: "Senior pets require thorough pre-surgical assessment",
      considerations: ["Comprehensive health screening", "Blood work and cardiac evaluation", "Benefits vs. risk assessment", "Specialized anesthesia protocols"],
      color: "#f59e0b"
    }
  ];

  const preSurgicalCare = [
    {
      step: "Pre-Surgical Consultation",
      description: "Comprehensive examination and health assessment",
      details: ["Complete physical examination", "Health history review", "Vaccination status check", "Anesthesia risk assessment"],
      icon: Stethoscope
    },
    {
      step: "Pre-Surgical Instructions",
      description: "Detailed preparation guidelines for optimal surgical outcomes",
      details: ["Fasting instructions (12+ hours)", "Water restriction guidelines", "Medication management", "Morning preparation checklist"],
      icon: FileText
    },
    {
      step: "Blood Work & Diagnostics",
      description: "Laboratory testing to ensure your pet is healthy for surgery",
      details: ["Complete blood count (CBC)", "Blood chemistry panel", "Organ function evaluation", "Clotting factor assessment"],
      icon: TestTube
    }
  ];

  const postSurgicalCare = [
    {
      care: "Recovery Monitoring",
      description: "Close observation during immediate post-surgical period",
      icon: Monitor
    },
    {
      care: "Pain Management",
      description: "Comprehensive pain control protocols for optimal comfort",
      icon: Pill
    },
    {
      care: "Activity Restrictions",
      description: "Guidelines for proper rest and limited activity during healing",
      icon: Timer
    },
    {
      care: "Incision Care",
      description: "Detailed instructions for wound monitoring and protection",
      icon: Bandage
    },
    {
      care: "Follow-up Visits",
      description: "Scheduled check-ups to ensure proper healing progress",
      icon: Calendar
    },
    {
      care: "24/7 Support",
      description: "Emergency support for any post-surgical concerns",
      icon: Phone
    }
  ];

  const whyChooseUs = [
    {
      feature: "Experienced Surgical Team",
      description: "Board-certified veterinarians with extensive spay/neuter experience",
      icon: Award
    },
    {
      feature: "Advanced Anesthesia Protocols",
      description: "Safe, modern anesthesia monitoring for optimal surgical safety",
      icon: Activity
    },
    {
      feature: "Pain Management Focus",
      description: "Comprehensive pain control before, during, and after surgery",
      icon: Heart
    },
    {
      feature: "Individualized Care",
      description: "Customized surgical and recovery plans for each pet's needs",
      icon: Target
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
              Spay & Neuter
            </h1>
          </div>
        </div>
      </section>

      {/* Hero Section */}
      <section className="bg-white pt-6" style={{ paddingBottom: '8px' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h1 className="text-xl font-bold text-gray-900 mb-4">
              Spay & Neuter
            </h1>
            <div className="mb-6">
              <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold text-white" style={{ backgroundColor: primaryColor }}>
                Safe & Professional Spay/Neuter Services
              </span>
            </div>
            <p className="text-base text-gray-600 leading-relaxed max-w-4xl mx-auto">
              At Pets and Vets Animal Hospital in South Riding, VA—serving Aldie, Ashburn, Chantilly, 
              Centreville, Reston, and Herndon—we provide safe, professional spay and neuter services 
              that benefit your pet's health, behavior, and longevity. Our experienced surgical team 
              uses advanced techniques and comprehensive care protocols to ensure the best outcomes.
            </p>
          </div>
        </div>
      </section>

      {/* Health Benefits */}
      <section className="bg-[#f8f9fa] py-6">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">
            Health Benefits of Spaying & Neutering
          </h2>
          <p className="text-center text-gray-600 mb-6 text-sm">
            Spaying and neutering provide numerous health and behavioral benefits:
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {healthBenefits.map((benefit, index) => (
              <div key={index} className="bg-white p-4 rounded-lg shadow-sm">
                <div className="flex items-center mb-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full mr-3" style={{ backgroundColor: `${benefit.color}15` }}>
                    <benefit.icon className="h-5 w-5" style={{ color: benefit.color }} />
                  </div>
                  <h3 className="text-base font-semibold text-gray-900">{benefit.benefit}</h3>
                </div>
                <p className="text-gray-600 text-sm mb-3">{benefit.description}</p>
                <div className="space-y-1">
                  <h4 className="font-semibold text-gray-900 text-sm">Key Benefits:</h4>
                  <div className="space-y-1">
                    {benefit.details.slice(0, 2).map((detail, detIndex) => (
                      <div key={detIndex} className="flex items-center text-xs text-gray-600">
                        <CheckCircle className="h-2 w-2 mr-2 flex-shrink-0" style={{ color: benefit.color }} />
                        <span>{detail}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Procedure Details */}
      <section className="bg-white py-6">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">
            Spay & Neuter Procedure Details
          </h2>
          <p className="text-center text-gray-600 mb-6 text-sm">
            Understanding what to expect during your pet's spay or neuter procedure:
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {procedureDetails.map((procedure, index) => (
              <div key={index} className="bg-gray-50 p-4 rounded-lg shadow-sm">
                <div className="flex items-center mb-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full mr-3" style={{ backgroundColor: primaryBg }}>
                    <procedure.icon className="h-5 w-5" style={{ color: primaryColor }} />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-gray-900">{procedure.procedure}</h3>
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                      Duration: {procedure.duration}
                    </span>
                  </div>
                </div>
                <p className="text-gray-600 text-sm mb-3">{procedure.description}</p>
                <div className="space-y-1">
                  <h4 className="font-semibold text-gray-900 text-sm">Procedure Steps:</h4>
                  <div className="space-y-1">
                    {procedure.details.map((detail, detIndex) => (
                      <div key={detIndex} className="flex items-center text-xs">
                        <CheckCircle className="h-3 w-3 mr-2 flex-shrink-0" style={{ color: primaryColor }} />
                        <span className="text-gray-700">{detail}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Age Guidelines */}
      <section className="bg-[#f8f9fa] py-6">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">
            Age Guidelines for Spaying & Neutering
          </h2>
          <p className="text-center text-gray-600 mb-6 text-sm">
            Optimal timing depends on your pet's age, breed, and individual health factors:
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {ageGuidelines.map((guideline, index) => (
              <div key={index} className="bg-white p-4 rounded-lg shadow-sm">
                <div className="flex items-center mb-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full mr-3" style={{ backgroundColor: `${guideline.color}15` }}>
                    <Calendar className="h-5 w-5" style={{ color: guideline.color }} />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-gray-900">{guideline.age}</h3>
                    <span className="px-2 py-1 text-white text-xs font-medium rounded-full" style={{ backgroundColor: guideline.color }}>
                      {guideline.timing}
                    </span>
                  </div>
                </div>
                <p className="text-gray-600 text-sm mb-3">{guideline.description}</p>
                <div className="space-y-1">
                  <h4 className="font-semibold text-gray-900 text-sm">Key Points:</h4>
                  <div className="space-y-1">
                    {guideline.considerations.slice(0, 2).map((consideration, conIndex) => (
                      <div key={conIndex} className="flex items-center text-xs text-gray-600">
                        <CheckCircle className="h-2 w-2 mr-2 flex-shrink-0" style={{ color: guideline.color }} />
                        <span>{consideration}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pre-Surgical Care */}
      <section className="bg-white py-6">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">
            Pre-Surgical Preparation
          </h2>
          <p className="text-center text-gray-600 mb-6 text-sm">
            Proper preparation ensures the safest surgical experience for your pet:
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {preSurgicalCare.map((step, index) => (
              <div key={index} className="bg-gray-50 p-4 rounded-lg shadow-sm">
                <div className="flex items-center mb-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full mr-3" style={{ backgroundColor: primaryBg }}>
                    <step.icon className="h-5 w-5" style={{ color: primaryColor }} />
                  </div>
                  <h3 className="text-base font-semibold text-gray-900">{step.step}</h3>
                </div>
                <p className="text-gray-600 text-sm mb-3">{step.description}</p>
                <div className="space-y-1">
                  <h4 className="font-semibold text-gray-900 text-sm">Includes:</h4>
                  <div className="space-y-1">
                    {step.details.slice(0, 2).map((detail, detIndex) => (
                      <div key={detIndex} className="flex items-center text-xs text-gray-600">
                        <CheckCircle className="h-2 w-2 mr-2 flex-shrink-0" style={{ color: primaryColor }} />
                        <span>{detail}</span>
                      </div>
                    ))}
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
            Post-Surgical Recovery Care
          </h2>
          <p className="text-center text-gray-600 mb-6 text-sm">
            Comprehensive support for optimal healing and recovery:
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {postSurgicalCare.map((care, index) => (
              <div key={index} className="bg-white p-4 rounded-lg shadow-sm text-center">
                <div className="flex items-center justify-center w-12 h-12 rounded-full mx-auto mb-3" style={{ backgroundColor: primaryBg }}>
                  <care.icon className="h-6 w-6" style={{ color: primaryColor }} />
                </div>
                <h3 className="text-base font-semibold text-gray-900 mb-2">{care.care}</h3>
                <p className="text-gray-600 text-sm">{care.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="bg-white py-6">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">
            Why Choose Our Spay & Neuter Services?
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {whyChooseUs.map((feature, index) => (
              <div key={index} className="bg-gray-50 p-4 rounded-lg shadow-sm text-center">
                <div className="flex items-center justify-center w-12 h-12 rounded-full mx-auto mb-3" style={{ backgroundColor: primaryBg }}>
                  <feature.icon className="h-6 w-6" style={{ color: primaryColor }} />
                </div>
                <h3 className="text-base font-semibold text-gray-900 mb-2">{feature.feature}</h3>
                <p className="text-gray-600 text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Expert Surgical Message */}
      <section className="bg-[#f8f9fa] py-6">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            Protecting Your Pet's Health & Well-being
          </h2>
          <div className="p-6 rounded-lg" style={{ backgroundColor: primaryBg }}>
            <p className="text-gray-700 leading-relaxed mb-4" style={{ fontSize: '1rem' }}>
              Spaying and neutering are among the most important health decisions you can make for 
              your pet. Our experienced surgical team provides safe, compassionate care that 
              benefits your pet's long-term health and quality of life.
            </p>
            <div className="bg-white p-4 rounded-lg">
              <div className="flex items-center justify-center mb-3">
                <Scissors className="h-6 w-6 mr-2" style={{ color: primaryColor }} />
                <h3 className="text-base font-semibold text-gray-900">Professional Surgical Excellence</h3>
              </div>
              <p className="text-gray-800 text-sm font-semibold">
                From pre-surgical consultation through complete recovery—trust our dedicated 
                team to provide the expert care your pet deserves.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Service Areas */}
      <section className="bg-white py-6">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            Serving Your Community
          </h2>
          <p className="text-gray-600 mb-6 text-sm">
            We proudly provide expert spay and neuter services to pets and families throughout:
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
            Schedule Your Pet's Spay or Neuter
          </h2>
          <p className="mb-6" style={{ color: 'white', fontSize: '1rem' }}>
            Give your pet the health benefits of professional spay/neuter services
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
              to="/reach-us"
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
              Schedule Surgery
              <MapPin className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default PetSpayNeuter;