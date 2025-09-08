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
  XCircle,
  Utensils,
  Package,
  UserCheck,
  Layers,
  Settings,
  PlusCircle
} from 'lucide-react';
import { hospitalInfo } from '../mock';
import { useBusinessInfo } from '../hooks/useBusinessInfo';

const SoftTissueSurgeries = () => {
  const { businessInfo: currentBusinessInfo } = useBusinessInfo();
  const primaryColor = '#29add3';
  const primaryLight = '#5bc0db';
  const primaryBg = '#e6f7fb';

  const surgicalApproach = [
    {
      phase: "Comprehensive Pre-Surgical Evaluation",
      description: "Full health assessment with advanced diagnostics and screenings to understand your pet's unique surgical needs",
      procedures: ["Complete physical examination", "Advanced diagnostic imaging", "Blood chemistry analysis", "Anesthesia risk assessment"],
      icon: FileText,
      focus: "Assessment"
    },
    {
      phase: "Advanced Surgical Techniques",
      description: "Specialized tools and methods ensuring accurate and minimally invasive procedures for optimal outcomes",
      procedures: ["Minimally invasive techniques", "Precision surgical instruments", "Advanced monitoring systems", "Sterile surgical protocols"],
      icon: Scissors,
      focus: "Procedure"
    },
    {
      phase: "Caring Post-Op Follow-Up",
      description: "Detailed aftercare plans, close monitoring, and continuous support for smooth healing and recovery",
      procedures: ["Recovery room monitoring", "Pain management protocols", "Healing progress tracking", "Owner education and support"],
      icon: Heart,
      focus: "Recovery"
    }
  ];

  const commonProcedures = [
    {
      procedure: "Mass Removals",
      description: "Skilled excision of tumors or cysts, focusing on complete removal while protecting healthy tissue",
      applications: ["Benign tumor removal", "Malignant mass excision", "Cyst removal procedures", "Biopsy and histopathology"],
      complexity: "Variable",
      icon: Target,
      color: "#10b981"
    },
    {
      procedure: "Wound Repairs",
      description: "Reconstruction for trauma or deep skin injuries, promoting optimal healing and minimizing complications",
      applications: ["Traumatic wound closure", "Skin reconstruction", "Laceration repair", "Complex wound management"],
      complexity: "Moderate to Complex",
      icon: Bandage,
      color: "#f59e0b"
    },
    {
      procedure: "Abdominal Surgeries",
      description: "Operations addressing internal organ issues—often critical for diagnosing and treating underlying conditions",
      applications: ["Exploratory surgery", "Organ-specific procedures", "Emergency interventions", "Diagnostic procedures"],
      complexity: "Advanced",
      icon: Layers,
      color: primaryColor
    }
  ];

  const surgicalSpecialties = [
    {
      specialty: "Skin & Subcutaneous Surgery",
      description: "Treatment of skin conditions, masses, and wound management",
      procedures: ["Tumor excision", "Skin grafts", "Wound reconstruction", "Abscess drainage"],
      icon: Shield
    },
    {
      specialty: "Abdominal Surgery",
      description: "Internal organ procedures including liver, spleen, and intestinal operations",
      procedures: ["Splenectomy", "Liver biopsy", "Intestinal surgery", "Exploratory laparotomy"],
      icon: Layers
    },
    {
      specialty: "Respiratory Surgery",
      description: "Procedures involving the respiratory system and airway management",
      procedures: ["Airway reconstruction", "Laryngeal surgery", "Tracheal procedures", "Lung biopsy"],
      icon: Activity
    },
    {
      specialty: "Reconstructive Surgery",
      description: "Complex reconstruction following trauma or congenital conditions",
      procedures: ["Tissue reconstruction", "Flap procedures", "Cosmetic repair", "Functional restoration"],
      icon: Sparkles
    }
  ];

  const whyChooseUs = [
    {
      feature: "Surgical Experts",
      description: "Years of experience and specialized training in advanced soft tissue surgical techniques",
      icon: Award
    },
    {
      feature: "Advanced Facilities",
      description: "State-of-the-art surgical suites equipped for precise procedures and confident patient handling",
      icon: Settings
    },
    {
      feature: "Whole-Pet Care Approach",
      description: "Comprehensive care from thorough evaluations to complete recovery support with tailored attention",
      icon: Heart
    },
    {
      feature: "Minimally Invasive Focus",
      description: "Advanced techniques that reduce trauma, minimize scarring, and promote faster healing",
      icon: Target
    }
  ];

  const serviceAreas = [
    "South Riding", "Aldie", "Ashburn", "Chantilly", "Centreville", "Reston", "Herndon"
  ];

  const softTissueAreas = [
    {
      area: "Integumentary System",
      description: "Skin, hair, nails, and associated glands",
      icon: Shield
    },
    {
      area: "Muscular System", 
      description: "Skeletal muscles and connective tissues",
      icon: Activity
    },
    {
      area: "Digestive Organs",
      description: "Stomach, intestines, liver, and associated structures",
      icon: Layers
    },
    {
      area: "Respiratory System",
      description: "Airways, lungs, and breathing-related structures",
      icon: Heart
    }
  ];

  const recoverySupport = [
    "Detailed post-operative care instructions",
    "Pain management protocols tailored to each pet",
    "Follow-up appointments to monitor healing",
    "24/7 emergency support during recovery",
    "Nutritional guidance for optimal healing",
    "Physical therapy recommendations when appropriate"
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section - Mobile Only */}
      <section className="text-white sticky z-40 block md:hidden" style={{ top: '4rem', background: `linear-gradient(135deg, ${primaryColor} 0%, #2196c7 100%)`, paddingTop: '0.5rem', paddingBottom: '0.5rem' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="font-bold" style={{ fontSize: '1.125rem' }}>
              Soft Tissue Surgeries
            </h1>
          </div>
        </div>
      </section>

      {/* Introduction */}
      <section className="bg-white" style={{ paddingTop: '30px', paddingBottom: '30px' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h1 className="text-xl md:text-2xl font-bold text-gray-900 mb-4">
              Expert Pet Soft Tissue Surgeries in South Riding, VA
            </h1>
            <p className="text-base text-gray-600 leading-relaxed max-w-4xl mx-auto mb-4">
              When your pet requires surgery for soft tissue issues—like tumors, wounds, or internal organ 
              conditions—Pets and Vets Animal Hospital is here to help. We offer compassionate, precise, 
              and advanced soft tissue surgery, ensuring your furry family member enjoys the best care at every step.
            </p>
            <p className="text-base text-gray-500">
              Also Serving Aldie, Ashburn, Chantilly, Centreville, Reston, and Herndon
            </p>
          </div>
          
          {/* Professional Image */}
          <div className="mt-8 flex justify-center">
            <div className="relative max-w-2xl">
              <img 
                src="https://images.unsplash.com/photo-1640876777002-badf6aee5bcc"
                alt="Professional veterinary surgical team performing soft tissue surgery"
                className="w-full h-64 object-cover rounded-xl shadow-lg"
              />
              <div className="absolute inset-0 bg-black bg-opacity-10 rounded-xl"></div>
            </div>
          </div>
        </div>
      </section>

      {/* What Are Soft Tissue Surgeries */}
      <section className="bg-gray-50" style={{ paddingTop: '30px', paddingBottom: '30px' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">
            What Are Soft Tissue Surgeries?
          </h2>
          <div className="max-w-4xl mx-auto mb-8">
            <div className="bg-white p-8 rounded-xl shadow-md">
              <div className="flex items-center mb-4">
                <Layers className="h-8 w-8 mr-4" style={{ color: primaryColor }} />
                <h3 className="text-lg font-semibold text-gray-900">Specialized Surgical Care</h3>
              </div>
              <p className="text-gray-700 leading-relaxed mb-6">
                Soft tissue surgeries focus on non-bony structures, including the skin, abdomen, and respiratory areas. 
                Whether it's removing a growth, repairing a traumatic injury, or exploring and treating abdominal organs, 
                our experienced surgical team is equipped to handle these delicate procedures with skill and care.
              </p>
            </div>
          </div>
          
          <h3 className="text-lg font-semibold text-gray-900 mb-6 text-center">Soft Tissue Areas We Treat</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {softTissueAreas.map((area, index) => (
              <div key={index} className="bg-white p-6 rounded-xl shadow-md text-center">
                <div className="flex items-center justify-center w-16 h-16 rounded-full mx-auto mb-4" style={{ backgroundColor: primaryBg }}>
                  <area.icon className="h-8 w-8" style={{ color: primaryColor }} />
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-3">{area.area}</h4>
                <p className="text-gray-600 text-sm">{area.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Surgical Approach */}
      <section className="bg-white" style={{ paddingTop: '30px', paddingBottom: '30px' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">
            Our Surgical Approach
          </h2>
          
          <div className="space-y-6">
            {surgicalApproach.map((phase, index) => (
              <div key={index} className="bg-gray-50 p-6 rounded-xl shadow-md">
                <div className="flex flex-col lg:flex-row lg:items-start lg:space-x-6">
                  <div className="flex items-center mb-4 lg:mb-0">
                    <div className="flex items-center justify-center w-16 h-16 rounded-full mr-4" style={{ backgroundColor: primaryBg }}>
                      <phase.icon className="h-8 w-8" style={{ color: primaryColor }} />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">{phase.phase}</h3>
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                        {phase.focus}
                      </span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-700 mb-4">{phase.description}</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {phase.procedures.map((procedure, procIndex) => (
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
          
          {/* Professional Image */}
          <div className="mt-8 flex justify-center">
            <div className="relative max-w-2xl">
              <img 
                src="https://images.unsplash.com/photo-1551601651-2a8555f1a136"
                alt="Professional veterinary surgeons in surgical attire preparing for soft tissue surgery"
                className="w-full h-64 object-cover rounded-xl shadow-lg"
              />
              <div className="absolute inset-0 bg-black bg-opacity-10 rounded-xl"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Common Soft Tissue Procedures */}
      <section className="bg-gray-50" style={{ paddingTop: '30px', paddingBottom: '30px' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">
            Common Soft Tissue Procedures
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {commonProcedures.map((procedure, index) => (
              <div key={index} className="bg-white p-6 rounded-xl shadow-md">
                <div className="flex items-center mb-4">
                  <div className="flex items-center justify-center w-12 h-12 rounded-full mr-4" style={{ backgroundColor: `${procedure.color}15` }}>
                    <procedure.icon className="h-6 w-6" style={{ color: procedure.color }} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{procedure.procedure}</h3>
                    <span className="px-3 py-1 bg-gray-100 text-gray-800 text-xs font-medium rounded-full">
                      {procedure.complexity}
                    </span>
                  </div>
                </div>
                <p className="text-gray-600 text-sm mb-4">{procedure.description}</p>
                <div className="space-y-2">
                  <h4 className="font-semibold text-gray-900 text-sm">Applications:</h4>
                  <div className="space-y-1">
                    {procedure.applications.map((application, appIndex) => (
                      <div key={appIndex} className="flex items-center p-2 rounded-lg" style={{ backgroundColor: `${procedure.color}05` }}>
                        <CheckCircle className="h-4 w-4 mr-2 flex-shrink-0" style={{ color: procedure.color }} />
                        <span className="text-sm text-gray-700">{application}</span>
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
                src="https://images.pexels.com/photos/2324837/pexels-photo-2324837.jpeg"
                alt="Professional surgical environment for advanced soft tissue procedures"
                className="w-full h-64 object-cover rounded-xl shadow-lg"
              />
              <div className="absolute inset-0 bg-black bg-opacity-10 rounded-xl"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Surgical Specialties */}
      <section className="bg-white" style={{ paddingTop: '30px', paddingBottom: '30px' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">
            Our Surgical Specialties
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {surgicalSpecialties.map((specialty, index) => (
              <div key={index} className="bg-gray-50 p-6 rounded-xl shadow-md">
                <div className="flex items-center mb-4">
                  <specialty.icon className="h-6 w-6 mr-3" style={{ color: primaryColor }} />
                  <h3 className="text-lg font-semibold text-gray-900">{specialty.specialty}</h3>
                </div>
                <p className="text-gray-600 text-sm mb-4">{specialty.description}</p>
                <div className="space-y-2">
                  <h4 className="font-semibold text-gray-900 text-sm">Common Procedures:</h4>
                  <div className="grid grid-cols-1 gap-2">
                    {specialty.procedures.map((procedure, procIndex) => (
                      <div key={procIndex} className="flex items-center p-2 rounded-lg" style={{ backgroundColor: primaryBg }}>
                        <CircleDot className="h-3 w-3 mr-2 flex-shrink-0" style={{ color: primaryColor }} />
                        <span className="text-sm text-gray-700">{procedure}</span>
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
      <section className="bg-gray-50" style={{ paddingTop: '30px', paddingBottom: '30px' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">
            Comprehensive Recovery Support
          </h2>
          <p className="text-center text-gray-600 mb-8">
            Your pet's recovery is just as important as the surgery itself. We provide:
          </p>
          
          <div className="max-w-4xl mx-auto">
            <div className="bg-white p-8 rounded-xl shadow-md">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {recoverySupport.map((support, index) => (
                  <div key={index} className="flex items-center p-3 rounded-lg" style={{ backgroundColor: primaryBg }}>
                    <CheckCircle className="h-5 w-5 mr-3 flex-shrink-0" style={{ color: primaryColor }} />
                    <span className="text-gray-700">{support}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="bg-white" style={{ paddingTop: '30px', paddingBottom: '30px' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">
            Why Choose Us for Your Pet's Surgery?
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

      {/* Expert Surgical Care Message */}
      <section className="bg-gray-50" style={{ paddingTop: '30px', paddingBottom: '30px' }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            Excellence and Compassion in Every Procedure
          </h2>
          <div className="p-8 rounded-xl" style={{ backgroundColor: primaryBg }}>
            <p className="text-gray-700 leading-relaxed mb-6 text-lg">
              Soft tissue surgery requires precision, experience, and compassionate care. Our dedicated surgical team 
              combines advanced techniques with personalized attention to ensure your pet receives the highest quality 
              care throughout their surgical journey.
            </p>
            <div className="bg-white p-6 rounded-lg">
              <div className="flex items-center justify-center mb-4">
                <Heart className="h-8 w-8 mr-3" style={{ color: primaryColor }} />
                <h3 className="text-xl font-semibold text-gray-900">Compassionate Surgical Excellence</h3>
              </div>
              <p className="text-gray-800 font-semibold">
                From comprehensive evaluation to complete recovery—trust our experienced team to provide 
                the specialized soft tissue surgical care your pet deserves with skill and compassion.
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
            Pets and Vets Animal Hospital—helping pets heal with excellence and compassion throughout:
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
            Schedule Your Pet's Surgical Care
          </h2>
          <p className="mb-8" style={{ color: 'white', fontSize: '1rem' }}>
            If your pet's condition requires surgery, we're ready to provide the care and expertise they deserve
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href={`tel:${currentBusinessInfo.phone}`}
              className="inline-flex items-center justify-center bg-white px-8 py-4 rounded-lg font-semibold transition-colors duration-200"
              style={{ color: primaryColor }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#f9fafb'}
              onMouseLeave={(e) => e.target.style.backgroundColor = 'white'}
            >
              <Phone className="mr-2 h-5 w-5" />
              Call Now: {currentBusinessInfo.phone}
            </a>
            <Link
              to="/reach-us"
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

export default SoftTissueSurgeries;