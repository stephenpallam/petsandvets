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

const PetOcularServices = () => {
  const primaryColor = '#29add3';
  const primaryLight = '#5bc0db';
  const primaryBg = '#e6f7fb';
  const warningColor = '#f59e0b';
  const dangerColor = '#ef4444';
  
  const eyeConditions = [
    {
      condition: "Conjunctivitis (Pink Eye)",
      description: "Inflammation of the eye's outer membrane causing redness, discharge, and discomfort",
      symptoms: ["Red, watery eyes", "Yellow or green discharge", "Pawing at eyes", "Squinting"],
      icon: Eye,
      color: "#ef4444"
    },
    {
      condition: "Corneal Ulcers",
      description: "Painful erosions on the eye's surface that can cause scarring if left untreated",
      symptoms: ["Excessive tearing", "Light sensitivity", "Cloudy cornea", "Visible eye pain"],
      icon: Target,
      color: "#f59e0b"
    },
    {
      condition: "Cataracts",
      description: "Clouding of the eye's lens that can progress to blindness without intervention",
      symptoms: ["Cloudy or white pupils", "Difficulty seeing in low light", "Bumping into objects", "Hesitant movement"],
      icon: Search,
      color: "#8b5cf6"
    },
    {
      condition: "Glaucoma",
      description: "Increased eye pressure that can cause severe pain and permanent vision loss",
      symptoms: ["Eye pain and redness", "Enlarged eye appearance", "Loss of vision", "Behavioral changes"],
      icon: AlertTriangle,
      color: "#dc2626"
    },
    {
      condition: "Dry Eye (KCS)",
      description: "Insufficient tear production leading to eye irritation and potential corneal damage",
      symptoms: ["Thick, sticky eye discharge", "Frequent blinking", "Red, irritated eyes", "Corneal changes"],
      icon: Droplets,
      color: "#0ea5e9"
    }
  ];

  const diagnosticServices = [
    {
      service: "Comprehensive Eye Examinations",
      description: "Thorough evaluation of all eye structures using advanced ophthalmic equipment",
      features: ["Visual acuity testing", "Intraocular pressure measurement", "Corneal staining", "Fundoscopic examination"],
      icon: Eye,
      color: primaryColor
    },
    {
      service: "Schirmer Tear Tests",
      description: "Precise measurement of tear production to diagnose dry eye conditions",
      features: ["Quantitative tear measurement", "Early dry eye detection", "Treatment monitoring", "Breed-specific evaluation"],
      icon: TestTube,
      color: "#10b981"
    },
    {
      service: "Tonometry (Eye Pressure)",
      description: "Advanced pressure measurement to detect glaucoma and monitor treatment",
      features: ["Digital pressure readings", "Glaucoma screening", "Treatment effectiveness monitoring", "Pre-surgical evaluation"],
      icon: Target,
      color: "#f59e0b"
    },
    {
      service: "Advanced Ocular Imaging",
      description: "High-resolution imaging for detailed evaluation of eye structures",
      features: ["Retinal photography", "Anterior segment imaging", "Digital documentation", "Treatment progress tracking"],
      icon: Camera,
      color: "#8b5cf6"
    }
  ];

  const treatmentOptions = [
    {
      treatment: "Medical Management",
      description: "Comprehensive pharmaceutical therapy tailored to specific eye conditions",
      approaches: ["Antibiotic eye drops", "Anti-inflammatory medications", "Pressure-reducing drugs", "Tear stimulants"],
      icon: Pill
    },
    {
      treatment: "Surgical Procedures",
      description: "Advanced surgical interventions for complex ocular conditions",
      approaches: ["Cataract surgery", "Eyelid corrections", "Corneal procedures", "Glaucoma surgery"],
      icon: Scissors
    },
    {
      treatment: "Laser Therapy",
      description: "Precision laser treatment for retinal and glaucoma conditions",
      approaches: ["Retinal photocoagulation", "Glaucoma management", "Tumor treatment", "Precision targeting"],
      icon: Zap
    },
    {
      treatment: "Ongoing Monitoring",
      description: "Regular follow-up care to ensure optimal treatment outcomes",
      approaches: ["Progress evaluations", "Medication adjustments", "Preventive care", "Early detection protocols"],
      icon: Monitor
    }
  ];

  const preventiveCare = [
    {
      care: "Regular Eye Examinations",
      description: "Routine screenings to detect problems before they become serious",
      icon: Calendar
    },
    {
      care: "Breed-Specific Monitoring",
      description: "Targeted care for breeds prone to specific eye conditions",
      icon: Search
    },
    {
      care: "Environmental Protection",
      description: "Guidance on protecting eyes from injury and irritants",
      icon: Shield
    },
    {
      care: "Early Intervention",
      description: "Prompt treatment of minor issues to prevent major problems",
      icon: Clock
    }
  ];

  const whyChooseUs = [
    {
      feature: "Specialized Equipment",
      description: "State-of-the-art ophthalmic instruments for precise diagnosis and treatment",
      icon: Microscope
    },
    {
      feature: "Experienced Team",
      description: "Veterinarians with extensive training in ocular medicine and surgery",
      icon: Award
    },
    {
      feature: "Comprehensive Care",
      description: "Complete eye care services from routine exams to advanced procedures",
      icon: Shield
    },
    {
      feature: "Compassionate Approach",
      description: "Gentle, patient-centered care focused on your pet's comfort and well-being",
      icon: Heart
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
              Eye Care
            </h1>
          </div>
        </div>
      </section>

      {/* Hero Section */}
      <section className="bg-white pt-6" style={{ paddingBottom: '8px' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h1 className="text-xl font-bold text-gray-900 mb-4">
              Eye Care
            </h1>
            <div className="mb-6">
              <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold text-white" style={{ backgroundColor: primaryColor }}>
                Comprehensive Vision Care & Eye Health
              </span>
            </div>
            <p className="text-base text-gray-600 leading-relaxed max-w-4xl mx-auto">
              At Pets and Vets Animal Hospital in South Riding, VA—serving Aldie, Ashburn, Chantilly, 
              Centreville, Reston, and the surrounding areas—we understand how crucial your pet's vision 
              is to their quality of life. Our comprehensive ocular services combine advanced diagnostic 
              technology with specialized treatment options to preserve and protect your pet's eyesight.
            </p>
          </div>
        </div>
      </section>

      {/* Common Eye Conditions */}
      <section className="bg-[#f8f9fa] py-6">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">
            Common Eye Conditions We Treat
          </h2>
          <p className="text-center text-gray-600 mb-6 text-sm">
            Early detection and treatment are crucial for maintaining your pet's vision and comfort:
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {eyeConditions.map((condition, index) => (
              <div key={index} className="bg-white p-4 rounded-lg shadow-sm">
                <div className="flex items-center mb-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full mr-3" style={{ backgroundColor: `${condition.color}15` }}>
                    <condition.icon className="h-5 w-5" style={{ color: condition.color }} />
                  </div>
                  <h3 className="text-base font-semibold text-gray-900">{condition.condition}</h3>
                </div>
                <p className="text-gray-600 text-sm mb-3">{condition.description}</p>
                <div className="space-y-1">
                  <h4 className="font-semibold text-gray-900 text-sm">Key Signs:</h4>
                  <div className="space-y-1">
                    {condition.symptoms.slice(0, 2).map((symptom, symIndex) => (
                      <div key={symIndex} className="flex items-center text-xs text-gray-600">
                        <CircleDot className="h-2 w-2 mr-2 flex-shrink-0" style={{ color: condition.color }} />
                        <span>{symptom}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Diagnostic Services */}
      <section className="bg-white py-6">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">
            Advanced Diagnostic Services
          </h2>
          <p className="text-center text-gray-600 mb-6 text-sm">
            Precise diagnosis is the foundation of effective eye care:
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {diagnosticServices.map((service, index) => (
              <div key={index} className="bg-gray-50 p-4 rounded-lg shadow-sm">
                <div className="flex items-center mb-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full mr-3" style={{ backgroundColor: `${service.color}15` }}>
                    <service.icon className="h-5 w-5" style={{ color: service.color }} />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-gray-900">{service.service}</h3>
                  </div>
                </div>
                <p className="text-gray-600 text-sm mb-3">{service.description}</p>
                <div className="space-y-1">
                  <h4 className="font-semibold text-gray-900 text-sm">Features:</h4>
                  <div className="space-y-1">
                    {service.features.map((feature, featIndex) => (
                      <div key={featIndex} className="flex items-center text-xs">
                        <CheckCircle className="h-3 w-3 mr-2 flex-shrink-0" style={{ color: service.color }} />
                        <span className="text-gray-700">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Treatment Options */}
      <section className="bg-[#f8f9fa] py-6">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">
            Comprehensive Treatment Options
          </h2>
          <p className="text-center text-gray-600 mb-8">
            Tailored treatment plans designed for your pet's specific condition and needs:
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {treatmentOptions.map((treatment, index) => (
              <div key={index} className="bg-white p-6 rounded-xl shadow-md">
                <div className="flex items-center mb-4">
                  <div className="flex items-center justify-center w-12 h-12 rounded-full mr-4" style={{ backgroundColor: primaryBg }}>
                    <treatment.icon className="h-6 w-6" style={{ color: primaryColor }} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{treatment.treatment}</h3>
                  </div>
                </div>
                <p className="text-gray-600 text-sm mb-4">{treatment.description}</p>
                <div className="space-y-2">
                  <h4 className="font-semibold text-gray-900 text-sm">Approaches:</h4>
                  <div className="space-y-1">
                    {treatment.approaches.map((approach, appIndex) => (
                      <div key={appIndex} className="flex items-center p-2 rounded-lg" style={{ backgroundColor: primaryBg }}>
                        <CheckCircle className="h-4 w-4 mr-2 flex-shrink-0" style={{ color: primaryColor }} />
                        <span className="text-sm text-gray-700">{approach}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Preventive Care */}
      <section className="bg-white py-6">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">
            Preventive Eye Care
          </h2>
          <p className="text-center text-gray-600 mb-8">
            Prevention is the best protection for your pet's vision:
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {preventiveCare.map((care, index) => (
              <div key={index} className="bg-gray-50 p-6 rounded-xl shadow-md text-center">
                <div className="flex items-center justify-center w-16 h-16 rounded-full mx-auto mb-4 bg-green-100">
                  <care.icon className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">{care.care}</h3>
                <p className="text-gray-600 text-sm">{care.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="bg-[#f8f9fa] py-6">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">
            Why Choose Our Eye Care Services?
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

      {/* Expert Vision Care Message */}
      <section className="bg-white py-6">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            Protecting Your Pet's Vision for Life
          </h2>
          <div className="p-8 rounded-xl" style={{ backgroundColor: primaryBg }}>
            <p className="text-gray-700 leading-relaxed mb-6 text-lg">
              Your pet's eyesight is precious and irreplaceable. Our comprehensive ocular services 
              combine the latest diagnostic technology with proven treatment methods to preserve 
              and protect their vision throughout their life.
            </p>
            <div className="bg-white p-6 rounded-lg">
              <div className="flex items-center justify-center mb-4">
                <Eye className="h-8 w-8 mr-3" style={{ color: primaryColor }} />
                <h3 className="text-xl font-semibold text-gray-900">Complete Vision Care</h3>
              </div>
              <p className="text-gray-800 font-semibold">
                From routine eye exams to advanced surgical procedures—trust our experienced team 
                to provide the specialized care your pet's eyes deserve.
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
            We proudly provide expert eye care to pets and families throughout:
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
            Expert Eye Care for Your Pet
          </h2>
          <p className="mb-8" style={{ color: 'white', fontSize: '1rem' }}>
            Don't wait—early detection and treatment can save your pet's vision
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
              Schedule Eye Exam
              <MapPin className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default PetOcularServices;