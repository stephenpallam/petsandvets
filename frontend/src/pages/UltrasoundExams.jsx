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
  Monitor,
  Search,
  Users,
  Award,
  Stethoscope,
  Target,
  TrendingUp
} from 'lucide-react';
import { hospitalInfo } from '../mock';

const UltrasoundExams = () => {
  const primaryColor = '#29add3';
  const primaryLight = '#5bc0db';
  const primaryBg = '#e6f7fb';

  const detectionCapabilities = [
    {
      category: "Abdominal Organs",
      description: "Examine liver, kidneys, bladder, spleen for abnormalities, diseases, or structural issues",
      icon: Activity,
      conditions: ["Liver disease", "Kidney stones", "Bladder issues", "Spleen enlargement"]
    },
    {
      category: "Pregnancy Diagnosis",
      description: "Confirm pregnancy, monitor fetal development, and assess reproductive health",
      icon: Heart,
      conditions: ["Pregnancy confirmation", "Fetal development", "Litter size", "Reproductive health"]
    },
    {
      category: "Heart Function Assessment",
      description: "Echocardiography to evaluate heart structure, function, and blood flow",
      icon: Stethoscope,
      conditions: ["Heart murmurs", "Valve function", "Heart disease", "Blood flow assessment"]
    },
    {
      category: "Eye Disease Detection",
      description: "Detect and diagnose various eye conditions and abnormalities",
      icon: Eye,
      conditions: ["Cataracts", "Retinal issues", "Eye tumors", "Structural abnormalities"]
    }
  ];

  const benefitsData = [
    {
      benefit: "Safe & Non-Invasive",
      description: "No radiation involved, making it completely safe for all pets",
      icon: Shield,
      highlight: "No radiation exposure"
    },
    {
      benefit: "Immediate Results", 
      description: "Real-time imaging provides answers during the examination",
      icon: Zap,
      highlight: "Real-time answers"
    },
    {
      benefit: "Highly Accurate",
      description: "Detects conditions that may be invisible to traditional X-rays",
      icon: Target,
      highlight: "Superior detection"
    },
    {
      benefit: "Compassionate Care",
      description: "Performed by experienced, caring veterinary professionals",
      icon: Users,
      highlight: "Expert veterinary team"
    }
  ];

  const comfortFeatures = [
    {
      title: "Painless & Stress-Free",
      description: "Most pets remain comfortable without anesthesia. Sedation may only be needed if your pet is anxious or a biopsy is required.",
      icon: Heart,
      type: "comfort"
    },
    {
      title: "Gentle Preparation",
      description: "To get accurate images, a small patch of fur may need to be shaved so the probe can make full skin contact. Our team handles this gently and with care.",
      icon: Shield,
      type: "preparation"
    },
    {
      title: "Quick Results",
      description: "Because ultrasounds are performed in real-time, findings are often available immediately. In complex cases, images may be reviewed by a veterinary radiologist, with a final report in a few days.",
      icon: Clock,
      type: "results"
    }
  ];

  const procedureSteps = [
    "Initial assessment and positioning of your pet for optimal comfort",
    "Gentle application of ultrasound gel to the examination area", 
    "Real-time ultrasound examination with immediate image review",
    "Discussion of findings and next steps with our veterinary team"
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
              Ultrasound in Dogs & Cats
            </h1>
          </div>
        </div>
      </section>

      {/* Introduction */}
      <section className="bg-white" style={{ paddingTop: '30px', paddingBottom: '30px' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
              Ultrasound in Dogs & Cats
            </h1>
            <p className="text-base text-gray-600 leading-relaxed max-w-4xl mx-auto">
              When your pet isn't feeling well, answers matter. At Pets and Vets Animal Hospital & Urgent Care, 
              we proudly provide safe, effective, and compassionate pet ultrasounds in Chantilly, VA, while also 
              serving pet families across South Riding, Aldie, Ashburn, Centreville, Reston, and Herndon.
            </p>
            <p className="text-base text-gray-600 leading-relaxed max-w-4xl mx-auto mt-4">
              Ultrasound exams (ultrasonography) are a quick, non-invasive way for our veterinarians to see inside 
              your dog or cat's body—without the risks of radiation used in X-rays. By recording sound wave echoes, 
              ultrasounds produce real-time images that help us detect, diagnose, and guide treatment for a wide range 
              of conditions, from abdominal issues to heart disease.
            </p>
          </div>
        </div>
      </section>

      {/* What Ultrasounds Can Detect */}
      <section className="bg-gray-50" style={{ paddingTop: '30px', paddingBottom: '30px' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">
            What Ultrasounds Can Detect
          </h2>
          <p className="text-center text-gray-600 mb-8">
            The most common type, B-mode (two-dimensional) ultrasound, produces clear images of internal organs:
          </p>
          
          {/* Professional Image */}
          <div className="mb-8 flex justify-center">
            <div className="relative max-w-2xl">
              <img 
                src="https://images.pexels.com/photos/6235239/pexels-photo-6235239.jpeg"
                alt="Veterinary professional performing ultrasound examination"
                className="w-full h-64 object-cover rounded-xl shadow-lg"
              />
              <div className="absolute inset-0 bg-black bg-opacity-10 rounded-xl"></div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {detectionCapabilities.map((capability, index) => (
              <div key={index} className="bg-white p-6 rounded-xl shadow-md">
                <div className="flex items-center mb-4">
                  <capability.icon className="h-8 w-8 mr-4" style={{ color: primaryColor }} />
                  <h3 className="text-xl font-semibold text-gray-900">{capability.category}</h3>
                </div>
                <p className="text-gray-600 mb-4">{capability.description}</p>
                <div className="grid grid-cols-2 gap-2">
                  {capability.conditions.map((condition, conditionIndex) => (
                    <div key={conditionIndex} className="flex items-center p-2 rounded-lg" style={{ backgroundColor: primaryBg }}>
                      <CheckCircle className="h-4 w-4 mr-2" style={{ color: primaryColor }} />
                      <span className="text-sm text-gray-700">{condition}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 p-6 rounded-xl" style={{ backgroundColor: primaryBg }}>
            <p className="text-center font-medium" style={{ color: primaryColor }}>
              This makes ultrasound an essential diagnostic tool for both wellness checks and emergency situations.
            </p>
          </div>
        </div>
      </section>

      {/* Why Pet Owners Choose Ultrasound */}
      <section className="bg-white" style={{ paddingTop: '30px', paddingBottom: '30px' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">
            Why Pet Owners Choose Ultrasound
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefitsData.map((benefit, index) => (
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
        </div>
      </section>

      {/* Comfort and Care for Your Pet */}
      <section className="bg-gray-50" style={{ paddingTop: '30px', paddingBottom: '30px' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">
            Comfort and Care for Your Pet
          </h2>
          
          {/* Second Professional Image */}
          <div className="mb-8 flex justify-center">
            <div className="relative max-w-2xl">
              <img 
                src="https://images.pexels.com/photos/6235657/pexels-photo-6235657.jpeg"
                alt="Veterinarian providing gentle care to a cat during examination"
                className="w-full h-64 object-cover rounded-xl shadow-lg"
              />
              <div className="absolute inset-0 bg-black bg-opacity-10 rounded-xl"></div>
            </div>
          </div>

          <div className="space-y-6">
            {comfortFeatures.map((feature, index) => (
              <div key={index} className="bg-white p-6 rounded-xl shadow-md">
                <div className="flex items-start">
                  <div className="flex items-center justify-center w-12 h-12 rounded-full mr-6 flex-shrink-0" style={{ backgroundColor: primaryBg }}>
                    <feature.icon className="h-6 w-6" style={{ color: primaryColor }} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">{feature.title}</h3>
                    <p className="text-gray-600">{feature.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* The Procedure */}
      <section className="bg-white" style={{ paddingTop: '30px', paddingBottom: '30px' }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">
            What to Expect During the Procedure
          </h2>
          <div className="space-y-4">
            {procedureSteps.map((step, index) => (
              <div key={index} className="flex items-start p-4 rounded-lg border-l-4" style={{ borderColor: primaryColor, backgroundColor: primaryBg }}>
                <div className="flex items-center justify-center w-8 h-8 rounded-full mr-4 flex-shrink-0" style={{ backgroundColor: primaryColor }}>
                  <span className="text-white font-bold text-sm">{index + 1}</span>
                </div>
                <p className="text-gray-700">{step}</p>
              </div>
            ))}
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
            We proudly provide exceptional veterinary care to pet families across:
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
            The Bottom Line: Safe, Fast, and Effective Diagnostics
          </h2>
          <div className="p-8 rounded-xl" style={{ backgroundColor: primaryBg }}>
            <p className="text-gray-700 leading-relaxed mb-6" style={{ fontSize: '1rem' }}>
              Ultrasound exams are one of the safest, fastest, and most effective ways to diagnose health conditions 
              in dogs and cats. Whether confirming a pregnancy, assessing organ health, or investigating unexplained 
              symptoms, ultrasound provides vital insight that leads to better care and peace of mind.
            </p>
            <div className="bg-white p-6 rounded-lg">
              <div className="flex items-center justify-center mb-4">
                <Monitor className="h-8 w-8 mr-3" style={{ color: primaryColor }} />
                <h3 className="text-xl font-semibold text-gray-900">Advanced Diagnostic Excellence</h3>
              </div>
              <p className="text-gray-800 font-semibold">
                Because their health can't wait—trust our experienced team to provide the answers you need 
                with compassionate, professional ultrasound services.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section style={{ background: `linear-gradient(135deg, ${primaryColor} 0%, #2196c7 100%)`, paddingTop: '30px', paddingBottom: '30px' }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-bold text-white mb-4" style={{ fontSize: '1rem' }}>
            Schedule Your Pet's Ultrasound Examination
          </h2>
          <p className="mb-8" style={{ color: 'white', fontSize: '1rem' }}>
            Advanced ultrasound diagnostics for dogs and cats—schedule your appointment today
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
              Schedule Ultrasound Exam
              <MapPin className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default UltrasoundExams;