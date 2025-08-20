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
  Bandage,
  Beaker
} from 'lucide-react';
import { hospitalInfo } from '../mock';

const PetOcularServices = () => {
  const primaryColor = '#29add3';
  const primaryLight = '#5bc0db';
  const primaryBg = '#e6f7fb';

  const eyeExamTests = [
    {
      test: "Tear Production Tests",
      description: "Schirmer tear test to evaluate natural tear production and eye lubrication",
      details: ["Dry eye assessment", "Tear film evaluation", "Lubrication analysis", "Gland function check"],
      icon: Droplets,
      color: "#10b981"
    },
    {
      test: "Corneal Staining",
      description: "Special dyes to detect corneal scratches, ulcers, and surface damage",
      details: ["Surface scratch detection", "Ulcer identification", "Corneal integrity", "Damage assessment"],
      icon: Target,
      color: "#f59e0b"
    },
    {
      test: "Tonometry",
      description: "Eye pressure measurement for glaucoma detection and monitoring",
      details: ["Pressure measurement", "Glaucoma screening", "Optic nerve protection", "Disease monitoring"],
      icon: Gauge,
      color: "#ef4444"
    },
    {
      test: "Ophthalmoscopy",
      description: "Comprehensive retina and optic nerve assessment using specialized instruments",
      details: ["Retinal examination", "Optic nerve evaluation", "Blood vessel assessment", "Fundus analysis"],
      icon: Eye,
      color: primaryColor
    }
  ];

  const medicalTreatments = [
    {
      treatment: "Topical Antibiotics",
      description: "Specialized eye drops and ointments for bacterial infections",
      conditions: ["Conjunctivitis", "Corneal infections", "Post-surgical care"],
      icon: Droplets
    },
    {
      treatment: "Anti-Glaucoma Medications",
      description: "Pressure-reducing medications to protect vision and comfort",
      conditions: ["Glaucoma management", "Pressure control", "Optic nerve protection"],
      icon: Pill
    },
    {
      treatment: "Anti-Inflammatory Therapy",
      description: "Specialized treatments for ocular inflammation and swelling",
      conditions: ["Uveitis treatment", "Post-surgical inflammation", "Allergic reactions"],
      icon: Shield
    },
    {
      treatment: "Pain Relief Medications",
      description: "Targeted pain management for ocular discomfort and trauma",
      conditions: ["Acute pain relief", "Chronic discomfort", "Post-operative care"],
      icon: Heart
    }
  ];

  const surgicalTreatments = [
    {
      surgery: "Eyelid Surgery",
      description: "Corrective procedures for eyelid abnormalities and tumors",
      applications: ["Entropion correction", "Tumor removal", "Reconstructive repair", "Cosmetic recovery"],
      complexity: "Moderate to Advanced",
      icon: Scissors
    },
    {
      surgery: "Cherry Eye Surgery",
      description: "Nictitans gland replacement to restore normal tear production",
      applications: ["Gland repositioning", "Tear production restoration", "Cosmetic improvement", "Function preservation"],
      complexity: "Moderate",
      icon: Target
    },
    {
      surgery: "Corneal Repair Surgeries",
      description: "Advanced procedures to restore corneal integrity and vision",
      applications: ["Deep ulcer repair", "Perforation closure", "Grafting procedures", "Vision preservation"],
      complexity: "Advanced",
      icon: Sparkles
    },
    {
      surgery: "Enucleation with Prosthetics",
      description: "Eye removal with cosmetic prosthetic options when necessary",
      applications: ["Severe trauma cases", "End-stage glaucoma", "Malignant tumors", "Pain relief"],
      complexity: "Advanced",
      icon: Award
    }
  ];

  const carePhilosophy = [
    {
      principle: "Vision Preservation",
      description: "Every effort to maintain and protect your pet's natural vision",
      icon: Eye
    },
    {
      principle: "Comfort First",
      description: "Prioritizing pain relief and comfort throughout all treatments",
      icon: Heart
    },
    {
      principle: "Quality of Life",
      description: "Treatments focused on enhancing your pet's daily life and happiness",
      icon: Activity
    },
    {
      principle: "Advanced Technology",
      description: "State-of-the-art equipment for accurate diagnosis and effective treatment",
      icon: Microscope
    }
  ];

  const serviceAreas = [
    "Chantilly", "South Riding", "Aldie", "Ashburn", "Centreville", "Reston", "Herndon"
  ];

  const commonConditions = [
    "Corneal ulcers and scratches",
    "Glaucoma and elevated eye pressure",
    "Uveitis and inflammatory conditions",
    "Cherry eye and eyelid disorders",
    "Post-surgical inflammation",
    "Chronic dry eye conditions"
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section - Mobile Only */}
      <section className="text-white sticky z-40 block md:hidden" style={{ top: '4rem', background: `linear-gradient(135deg, ${primaryColor} 0%, #2196c7 100%)`, paddingTop: '0.5rem', paddingBottom: '0.5rem' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="font-bold" style={{ fontSize: '1.125rem' }}>
              Pet Ocular Services
            </h1>
          </div>
        </div>
      </section>

      {/* Introduction */}
      <section className="bg-white" style={{ paddingTop: '30px', paddingBottom: '30px' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h1 className="text-xl md:text-2xl font-bold text-gray-900 mb-4">
              Pet Ocular Services in Chantilly, VA
            </h1>
            <p className="text-base text-gray-600 leading-relaxed max-w-4xl mx-auto">
              Your pet's eyes are just as important as yours—and when problems arise, expert care matters. At Pets and 
              Vets Animal Hospital & Urgent Care, we provide advanced pet ocular services in Chantilly, VA, while proudly 
              serving families in South Riding, Aldie, Ashburn, Centreville, Reston, and Herndon. From thorough eye exams 
              to advanced surgical care, our goal is to protect your pet's vision, comfort, and quality of life.
            </p>
          </div>
          
          {/* Professional Image */}
          <div className="mt-8 flex justify-center">
            <div className="relative max-w-2xl">
              <img 
                src="https://images.unsplash.com/photo-1682663947014-445b091292e9"
                alt="Professional veterinary ophthalmology equipment and examination setup"
                className="w-full h-64 object-cover rounded-xl shadow-lg"
              />
              <div className="absolute inset-0 bg-black bg-opacity-10 rounded-xl"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Care Philosophy */}
      <section className="bg-gray-50" style={{ paddingTop: '30px', paddingBottom: '30px' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">
            Our Approach to Pet Eye Care
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {carePhilosophy.map((principle, index) => (
              <div key={index} className="bg-white p-6 rounded-xl shadow-md text-center">
                <div className="flex items-center justify-center w-16 h-16 rounded-full mx-auto mb-4" style={{ backgroundColor: primaryBg }}>
                  <principle.icon className="h-8 w-8" style={{ color: primaryColor }} />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">{principle.principle}</h3>
                <p className="text-gray-600 text-sm">{principle.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comprehensive Eye Exams */}
      <section className="bg-white" style={{ paddingTop: '30px', paddingBottom: '30px' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">
            Comprehensive Eye Exams
          </h2>
          <p className="text-center text-gray-600 mb-8">
            Our eye exams for pets are similar to human eye exams and are performed in a darkened room for accuracy. 
            Depending on your pet's needs, we may use:
          </p>
          
          <div className="space-y-6">
            {eyeExamTests.map((test, index) => (
              <div key={index} className="bg-gray-50 p-6 rounded-xl shadow-md">
                <div className="flex flex-col lg:flex-row lg:items-start lg:space-x-6">
                  <div className="flex items-center mb-4 lg:mb-0">
                    <div className="flex items-center justify-center w-16 h-16 rounded-full mr-4" style={{ backgroundColor: `${test.color}15` }}>
                      <test.icon className="h-8 w-8" style={{ color: test.color }} />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">{test.test}</h3>
                      <p className="text-gray-600 text-sm mt-1">{test.description}</p>
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {test.details.map((detail, detailIndex) => (
                        <div key={detailIndex} className="flex items-center p-3 rounded-lg border-l-4" style={{ borderColor: test.color, backgroundColor: `${test.color}05` }}>
                          <CheckCircle className="h-4 w-4 mr-2 flex-shrink-0" style={{ color: test.color }} />
                          <span className="text-sm text-gray-700">{detail}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-8 bg-blue-50 p-6 rounded-xl border-l-4 border-blue-500">
            <div className="flex items-center mb-4">
              <Eye className="h-6 w-6 mr-3 text-blue-600" />
              <h3 className="text-lg font-semibold text-blue-900">Professional Eye Examination Standards</h3>
            </div>
            <p className="text-blue-800">
              All examinations are performed in controlled lighting conditions using specialized veterinary ophthalmology 
              equipment to ensure accurate diagnosis and appropriate treatment planning.
            </p>
          </div>
        </div>
      </section>

      {/* Medical Eye Care */}
      <section className="bg-gray-50" style={{ paddingTop: '30px', paddingBottom: '30px' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">
            Medical Eye Care
          </h2>
          <p className="text-center text-gray-600 mb-8">
            We offer a full range of medications for various eye conditions. Treatments may include:
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {medicalTreatments.map((treatment, index) => (
              <div key={index} className="bg-white p-6 rounded-xl shadow-md">
                <div className="flex items-center mb-4">
                  <treatment.icon className="h-6 w-6 mr-3" style={{ color: primaryColor }} />
                  <h3 className="text-lg font-semibold text-gray-900">{treatment.treatment}</h3>
                </div>
                <p className="text-gray-600 text-sm mb-4">{treatment.description}</p>
                <div className="space-y-2">
                  <h4 className="font-semibold text-gray-900 text-sm">Common Applications:</h4>
                  {treatment.conditions.map((condition, conditionIndex) => (
                    <div key={conditionIndex} className="flex items-center">
                      <CheckCircle className="h-4 w-4 mr-2 flex-shrink-0" style={{ color: primaryColor }} />
                      <span className="text-sm text-gray-700">{condition}</span>
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
                src="https://images.unsplash.com/photo-1620840737684-7661256552e5"
                alt="Close-up of healthy pet eye showing professional veterinary care results"
                className="w-full h-64 object-cover rounded-xl shadow-lg"
              />
              <div className="absolute inset-0 bg-black bg-opacity-10 rounded-xl"></div>
            </div>
          </div>
          
          <div className="mt-8 bg-green-50 p-6 rounded-xl border-l-4 border-green-500">
            <h3 className="text-lg font-semibold text-green-900 mb-4">Common Conditions We Treat:</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {commonConditions.map((condition, index) => (
                <div key={index} className="flex items-center">
                  <Target className="h-4 w-4 mr-2 text-green-600 flex-shrink-0" />
                  <span className="text-green-800 text-sm">{condition}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Advanced Surgical Treatments */}
      <section className="bg-white" style={{ paddingTop: '30px', paddingBottom: '30px' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">
            Advanced Surgical Treatments
          </h2>
          <p className="text-center text-gray-600 mb-8">
            When medicine alone is not enough, our skilled team provides surgical solutions, including:
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {surgicalTreatments.map((surgery, index) => (
              <div key={index} className="bg-gray-50 p-6 rounded-xl shadow-md">
                <div className="flex items-center mb-4">
                  <surgery.icon className="h-6 w-6 mr-3" style={{ color: primaryColor }} />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{surgery.surgery}</h3>
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                      {surgery.complexity}
                    </span>
                  </div>
                </div>
                <p className="text-gray-600 text-sm mb-4">{surgery.description}</p>
                <div className="space-y-2">
                  <h4 className="font-semibold text-gray-900 text-sm">Applications:</h4>
                  <div className="grid grid-cols-1 gap-2">
                    {surgery.applications.map((application, applicationIndex) => (
                      <div key={applicationIndex} className="flex items-center p-2 rounded-lg" style={{ backgroundColor: primaryBg }}>
                        <CheckCircle className="h-4 w-4 mr-2 flex-shrink-0" style={{ color: primaryColor }} />
                        <span className="text-sm text-gray-700">{application}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Compassionate Care for Lasting Comfort */}
      <section className="bg-gray-50" style={{ paddingTop: '30px', paddingBottom: '30px' }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            Compassionate Care for Lasting Comfort
          </h2>
          <div className="p-8 rounded-xl" style={{ backgroundColor: primaryBg }}>
            <p className="text-gray-700 leading-relaxed mb-6 text-lg">
              Whether it's managing chronic eye disease, treating infections, or repairing trauma, we are committed to 
              helping your pet live a more comfortable, healthy life. Our comprehensive approach combines advanced 
              diagnostic technology with compassionate care to achieve the best possible outcomes.
            </p>
            <div className="bg-white p-6 rounded-lg">
              <div className="flex items-center justify-center mb-4">
                <Heart className="h-8 w-8 mr-3" style={{ color: primaryColor }} />
                <h3 className="text-xl font-semibold text-gray-900">Expert Veterinary Ophthalmology</h3>
              </div>
              <p className="text-gray-800 font-semibold">
                From routine eye examinations to complex surgical procedures—trust our experienced team to provide 
                the specialized ocular care your pet deserves with compassion and professional excellence.
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
            We proudly provide advanced ocular services to pet families across:
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
            Schedule Your Pet's Ocular Examination
          </h2>
          <p className="mb-8" style={{ color: 'white', fontSize: '1rem' }}>
            Expert veterinary ophthalmology with advanced diagnostics and compassionate care
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