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
  Calendar
} from 'lucide-react';
import { hospitalInfo } from '../mock';

const PreventivePetCare = () => {
  const primaryColor = '#29add3';
  const primaryLight = '#5bc0db';
  const primaryBg = '#e6f7fb';

  const examComponents = [
    {
      title: "Eye Exams",
      description: "Comprehensive eye health evaluation to detect vision problems early",
      details: ["Checking for cataracts", "Glaucoma screening", "Infection detection", "Allergy assessment"],
      icon: Eye,
      color: "#10b981"
    },
    {
      title: "Full Body Exam",
      description: "Complete physical assessment of your pet's overall condition",
      details: ["Weight monitoring", "Muscle tone evaluation", "Mobility assessment", "Gait analysis"],
      icon: Activity,
      color: primaryColor
    },
    {
      title: "Heart & Lung Screening",
      description: "Cardiovascular and respiratory system evaluation",
      details: ["Detecting heart murmurs", "Irregular rhythm identification", "Breathing assessment", "Circulation check"],
      icon: Stethoscope,
      color: "#f59e0b"
    },
    {
      title: "Lab Testing",
      description: "Advanced diagnostic testing for early detection",
      details: ["In-house blood work", "Comprehensive urinalysis", "Fecal analysis", "Internal health screening"],
      icon: Search,
      color: "#8b5cf6"
    },
    {
      title: "Oral Evaluation",
      description: "Complete dental and oral health assessment",
      details: ["Tartar identification", "Infection screening", "Inflammation check", "Fractured teeth detection"],
      icon: Heart,
      color: "#ef4444"
    }
  ];

  const preventiveBenefits = [
    {
      benefit: "Early Detection",
      description: "Catch problems like tumors, parasites, or skin infections before they advance",
      icon: Target,
      highlight: "Proactive healthcare"
    },
    {
      benefit: "Cost Savings",
      description: "Save money and stress by avoiding advanced complications and emergency treatments",
      icon: TrendingUp,
      highlight: "Financial protection"
    },
    {
      benefit: "Customized Care",
      description: "Receive personalized recommendations for nutrition, dental care, and wellness",
      icon: Award,
      highlight: "Tailored approach"
    },
    {
      benefit: "Peace of Mind",
      description: "Confidence that your pet is healthy and any issues are addressed promptly",
      icon: Shield,
      highlight: "Professional assurance"
    }
  ];

  const serviceAreas = [
    "Chantilly", "South Riding", "Aldie", "Ashburn", "Centreville", "Reston", "Herndon"
  ];

  const secondOpinionFeatures = [
    {
      title: "Judgment-Free Environment",
      description: "Professional, compassionate evaluation without any judgment on previous care decisions",
      icon: Heart
    },
    {
      title: "Comprehensive Review",
      description: "Full examination and thorough review of your concerns and medical history",
      icon: FileText
    },
    {
      title: "Expert Guidance",
      description: "Clear explanations and guidance to help you make confident decisions about your pet's care",
      icon: Users
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section - Mobile Only */}
      <section className="text-white sticky z-40 block md:hidden" style={{ top: '4rem', background: `linear-gradient(135deg, ${primaryColor} 0%, #2196c7 100%)`, paddingTop: '0.5rem', paddingBottom: '0.5rem' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="font-bold" style={{ fontSize: '1.125rem' }}>
              Preventive Pet Care
            </h1>
          </div>
        </div>
      </section>

      {/* Introduction */}
      <section className="bg-white" style={{ paddingTop: '30px', paddingBottom: '30px' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
              Preventive Pet Care
            </h1>
            <p className="text-base text-gray-600 leading-relaxed max-w-4xl mx-auto">
              At Pets and Vets Animal Hospital & Urgent Care, we believe the best way to keep pets healthy is through 
              proactive, preventive care. That's why we offer comprehensive preventive pet care exams in Chantilly, VA, 
              while proudly serving families in South Riding, Aldie, Ashburn, Centreville, Reston, and Herndon. Our exams 
              are designed to review every aspect of your pet's health—from nose to tail—so potential issues are detected 
              early, before they become serious.
            </p>
          </div>
          
          {/* Professional Image */}
          <div className="mt-8 flex justify-center">
            <div className="relative max-w-2xl">
              <img 
                src="https://images.unsplash.com/photo-1733783489145-f3d3ee7a9ccf"
                alt="Professional veterinary examination for preventive care"
                className="w-full h-64 object-cover rounded-xl shadow-lg"
              />
              <div className="absolute inset-0 bg-black bg-opacity-10 rounded-xl"></div>
            </div>
          </div>
        </div>
      </section>

      {/* What's Included in Our Preventive Care Exams */}
      <section className="bg-gray-50" style={{ paddingTop: '30px', paddingBottom: '30px' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">
            What's Included in Our Preventive Care Exams
          </h2>
          <p className="text-center text-gray-600 mb-8">
            Comprehensive evaluation covering every aspect of your pet's health and wellbeing:
          </p>
          
          <div className="space-y-6">
            {examComponents.map((component, index) => (
              <div key={index} className="bg-white p-6 rounded-xl shadow-md">
                <div className="flex flex-col lg:flex-row lg:items-start lg:space-x-6">
                  <div className="flex items-center mb-4 lg:mb-0">
                    <div className="flex items-center justify-center w-16 h-16 rounded-full mr-4" style={{ backgroundColor: `${component.color}15` }}>
                      <component.icon className="h-8 w-8" style={{ color: component.color }} />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">{component.title}</h3>
                      <p className="text-gray-600 text-sm mt-1">{component.description}</p>
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {component.details.map((detail, detailIndex) => (
                        <div key={detailIndex} className="flex items-center p-3 rounded-lg border-l-4" style={{ borderColor: component.color, backgroundColor: `${component.color}05` }}>
                          <CheckCircle className="h-4 w-4 mr-2 flex-shrink-0" style={{ color: component.color }} />
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

      {/* Why Preventive Care Matters */}
      <section className="bg-white" style={{ paddingTop: '30px', paddingBottom: '30px' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">
            Why Preventive Care Matters
          </h2>
          <p className="text-center text-gray-600 mb-8">
            Annual (or semi-annual) preventive exams give your pet the best chance at a long, healthy life. These visits help us:
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {preventiveBenefits.map((benefit, index) => (
              <div key={index} className="bg-gray-50 p-6 rounded-xl shadow-md text-center">
                <div className="flex items-center justify-center w-16 h-16 rounded-full mx-auto mb-4" style={{ backgroundColor: primaryBg }}>
                  <benefit.icon className="h-8 w-8" style={{ color: primaryColor }} />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">{benefit.benefit}</h3>
                <p className="text-gray-600 text-sm mb-3">{benefit.description}</p>
                <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                  {benefit.highlight}
                </span>
              </div>
            ))}
          </div>
          
          <div className="bg-blue-50 p-6 rounded-xl border-l-4 border-blue-500">
            <div className="flex items-center mb-4">
              <Award className="h-6 w-6 mr-3 text-blue-600" />
              <h3 className="text-lg font-semibold text-blue-900">AVMA Recommendation</h3>
            </div>
            <p className="text-blue-800">
              The American Veterinary Medical Association (AVMA) recommends yearly preventive care exams for all pets. 
              This professional standard ensures your pet receives the comprehensive care they deserve.
            </p>
          </div>
        </div>
      </section>

      {/* Second Opinions Welcome */}
      <section className="bg-gray-50" style={{ paddingTop: '30px', paddingBottom: '30px' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">
            Second Opinions Welcome
          </h2>
          <p className="text-center text-gray-600 mb-8">
            Concerned about your pet's health or unsure about a previous diagnosis? We're happy to provide a 
            judgment-free second opinion.
          </p>
          
          {/* Professional Image */}
          <div className="mb-8 flex justify-center">
            <div className="relative max-w-2xl">
              <img 
                src="https://images.pexels.com/photos/6235650/pexels-photo-6235650.jpeg"
                alt="Professional veterinary consultation and examination"
                className="w-full h-64 object-cover rounded-xl shadow-lg"
              />
              <div className="absolute inset-0 bg-black bg-opacity-10 rounded-xl"></div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {secondOpinionFeatures.map((feature, index) => (
              <div key={index} className="bg-white p-6 rounded-xl shadow-md text-center">
                <div className="flex items-center justify-center w-16 h-16 rounded-full mx-auto mb-4" style={{ backgroundColor: primaryBg }}>
                  <feature.icon className="h-8 w-8" style={{ color: primaryColor }} />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600 text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
          
          <div className="mt-8 p-6 rounded-xl" style={{ backgroundColor: primaryBg }}>
            <p className="text-center font-medium" style={{ color: primaryColor }}>
              Our veterinarians will perform a full exam, review your concerns, and offer guidance so you can 
              make confident decisions about your pet's care.
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
            We proudly provide exceptional preventive pet care to families across:
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
            Schedule Your Pet's Exam Today
          </h2>
          <div className="p-8 rounded-xl" style={{ backgroundColor: primaryBg }}>
            <p className="text-gray-700 leading-relaxed mb-6 text-lg">
              Preventive care is the foundation of lifelong health. Don't wait until symptoms appear—protect your pet now 
              with a comprehensive wellness exam that covers every aspect of their health and wellbeing.
            </p>
            <div className="bg-white p-6 rounded-lg">
              <div className="flex items-center justify-center mb-4">
                <Calendar className="h-8 w-8 mr-3" style={{ color: primaryColor }} />
                <h3 className="text-xl font-semibold text-gray-900">Proactive Healthcare Excellence</h3>
              </div>
              <p className="text-gray-800 font-semibold">
                From nose to tail examinations to advanced diagnostic testing—trust our experienced team to provide 
                comprehensive preventive care that keeps your pet healthy for years to come.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section style={{ background: `linear-gradient(135deg, ${primaryColor} 0%, #2196c7 100%)`, paddingTop: '30px', paddingBottom: '30px' }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-bold text-white mb-4" style={{ fontSize: '1rem' }}>
            Schedule Your Pet's Preventive Care Exam
          </h2>
          <p className="mb-8" style={{ color: 'white', fontSize: '1rem' }}>
            Comprehensive wellness exams and preventive care services for your beloved companion
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
              Schedule Wellness Exam
              <MapPin className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default PreventivePetCare;