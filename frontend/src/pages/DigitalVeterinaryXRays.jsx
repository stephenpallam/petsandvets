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
  Bone
} from 'lucide-react';
import { hospitalInfo } from '../mock';

const DigitalVeterinaryXRays = () => {
  const primaryColor = '#29add3';
  const primaryLight = '#5bc0db';
  const primaryBg = '#e6f7fb';

  const organSystems = [
    {
      system: "Heart and Lungs",
      description: "Comprehensive cardiopulmonary system imaging",
      details: ["Heart structure assessment", "Lung condition evaluation", "Respiratory function analysis", "Cardiovascular health monitoring"],
      icon: Heart,
      color: "#ef4444"
    },
    {
      system: "Stomach and Intestines",
      description: "Complete gastrointestinal system examination",
      details: ["Digestive tract visualization", "Foreign object detection", "Bowel obstruction assessment", "Gastrointestinal health evaluation"],
      icon: Activity,
      color: "#f59e0b"
    },
    {
      system: "Bones, Joints, and Muscles",
      description: "Detailed musculoskeletal system analysis",
      details: ["Fracture detection", "Joint condition assessment", "Bone density evaluation", "Muscle and tissue examination"],
      icon: Bone,
      color: "#8b5cf6"
    },
    {
      system: "Kidneys and Bladder",
      description: "Thorough urinary system evaluation",
      details: ["Kidney function assessment", "Bladder stone detection", "Urinary tract examination", "Renal health monitoring"],
      icon: Droplets,
      color: "#10b981"
    }
  ];

  const digitalBenefits = [
    {
      benefit: "Sharper Images",
      description: "Superior image quality for more accurate diagnosis and treatment planning",
      icon: Eye,
      highlight: "Enhanced accuracy",
      color: primaryColor
    },
    {
      benefit: "Instant Results",
      description: "Real-time imaging provides immediate answers for faster care and peace of mind",
      icon: Zap,
      highlight: "Immediate answers",
      color: "#10b981"
    },
    {
      benefit: "Lower Radiation Exposure",
      description: "Significantly reduced radiation compared to traditional film X-rays for pet safety",
      icon: Shield,
      highlight: "Safer technology",
      color: "#f59e0b"
    },
    {
      benefit: "Eco-Friendly Technology",
      description: "Digital system eliminates film waste and chemical processing for environmental protection",
      icon: Leaf,
      highlight: "Environmentally conscious",
      color: "#8b5cf6"
    }
  ];

  const safetyFeatures = [
    {
      feature: "Painless Procedure",
      description: "Completely non-invasive with no discomfort to your pet during the imaging process",
      icon: Heart
    },
    {
      feature: "Minimal Radiation",
      description: "Modern digital technology uses the lowest possible radiation levels for maximum safety",
      icon: Shield
    },
    {
      feature: "Stress-Free Environment",
      description: "Calm, professional setting designed to keep pets comfortable during examination",
      icon: Users
    },
    {
      feature: "Optional Sedation",
      description: "Mild sedatives available for anxious pets to ensure comfort and accurate positioning",
      icon: Clock
    }
  ];

  const serviceAreas = [
    "Chantilly", "South Riding", "Aldie", "Ashburn", "Centreville", "Reston", "Herndon"
  ];

  const diagnosticCapabilities = [
    "Early problem detection for prompt treatment",
    "Effective treatment plan development",
    "Same-day diagnosis in most cases",
    "Comprehensive internal structure visualization"
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section - Mobile Only */}
      <section className="text-white sticky z-40 block md:hidden" style={{ top: '4rem', background: `linear-gradient(135deg, ${primaryColor} 0%, #2196c7 100%)`, paddingTop: '0.5rem', paddingBottom: '0.5rem' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="font-bold" style={{ fontSize: '1.125rem' }}>
              Digital Veterinary X-Rays
            </h1>
          </div>
        </div>
      </section>

      {/* Hero Section */}
      <section className="bg-white py-6">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h1 className="text-xl font-bold text-gray-900 mb-4">
              Digital X-Rays
            </h1>
            <div className="mb-6">
              <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold text-white" style={{ backgroundColor: primaryColor }}>
                Fast & Accurate Digital Imaging
              </span>
            </div>
            <p className="text-base text-gray-600 leading-relaxed max-w-4xl mx-auto">
              When your pet needs an X-ray, safety and accuracy matter most. At Pets and Vets Animal Hospital & Urgent Care, 
              we provide advanced digital veterinary X-rays in Chantilly, VA, proudly serving families in South Riding, Aldie, 
              Ashburn, Centreville, Reston, and Herndon. Our state-of-the-art radiology technology helps us diagnose conditions 
              quickly, safely, and with exceptional clarity.
            </p>
          </div>
        </div>
      </section>

      {/* What Are Digital X-Rays */}
      <section className="bg-[#f8f9fa] py-6">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">
            What Are Digital X-Rays?
          </h2>
          <p className="text-center text-gray-600 mb-8">
            Digital radiology, also known as digital X-ray, is a non-invasive diagnostic tool that gives veterinarians 
            a clear, real-time view of your pet's internal organs and structures, including the:
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {organSystems.map((system, index) => (
              <div key={index} className="bg-white p-4 rounded-lg shadow-sm">
                <div className="flex items-center mb-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full mr-3" style={{ backgroundColor: `${system.color}15` }}>
                    <system.icon className="h-5 w-5" style={{ color: system.color }} />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-gray-900">{system.system}</h3>
                    <p className="text-gray-600 text-sm">{system.description}</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-2">
                  {system.details.map((detail, detailIndex) => (
                    <div key={detailIndex} className="flex items-center text-sm text-gray-700">
                      <CheckCircle className="h-3 w-3 mr-2 flex-shrink-0" style={{ color: system.color }} />
                      <span>{detail}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          
          <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
            <h3 className="text-base font-semibold text-blue-900 mb-3">Advanced Imaging Capabilities:</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {diagnosticCapabilities.map((capability, index) => (
                <div key={index} className="flex items-center text-sm">
                  <Target className="h-3 w-3 mr-2 text-blue-600 flex-shrink-0" />
                  <span className="text-blue-800">{capability}</span>
                </div>
              ))}
            </div>
            <p className="text-blue-800 text-sm mt-3 font-medium">
              This advanced imaging allows us to detect problems early and create effective treatment plans—often during the same visit.
            </p>
          </div>
        </div>
      </section>

      {/* Benefits of Digital X-Rays for Pets */}
      <section className="bg-white py-6">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">
            Benefits of Digital X-Rays for Pets
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {digitalBenefits.map((benefit, index) => (
              <div key={index} className="bg-gray-50 p-4 rounded-lg shadow-sm text-center">
                <div className="flex items-center justify-center w-12 h-12 rounded-full mx-auto mb-3" style={{ backgroundColor: `${benefit.color}15` }}>
                  <benefit.icon className="h-6 w-6" style={{ color: benefit.color }} />
                </div>
                <h3 className="text-base font-semibold text-gray-900 mb-2">{benefit.benefit}</h3>
                <p className="text-gray-600 text-sm mb-2">{benefit.description}</p>
                <span className="px-2 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: `${benefit.color}20`, color: benefit.color }}>
                  {benefit.highlight}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Safe, Painless, and Stress-Free */}
      <section className="bg-[#f8f9fa] py-6">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">
            Safe, Painless, and Stress-Free
          </h2>
          <p className="text-center text-gray-600 mb-8">
            X-rays are completely painless and safe for pets. Most dogs and cats remain calm without sedation, but for 
            anxious pets, a mild sedative or anesthesia may be used to keep them comfortable. Thanks to modern digital 
            technology, the radiation exposure is minimal and harmless for both pets and humans.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {safetyFeatures.map((feature, index) => (
              <div key={index} className="bg-white p-4 rounded-lg shadow-sm text-center">
                <div className="flex items-center justify-center w-12 h-12 rounded-full mx-auto mb-3" style={{ backgroundColor: primaryBg }}>
                  <feature.icon className="h-6 w-6" style={{ color: primaryColor }} />
                </div>
                <h3 className="text-base font-semibold text-gray-900 mb-2">{feature.feature}</h3>
                <p className="text-gray-600 text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
          
          <div className="mt-6 p-4 rounded-lg" style={{ backgroundColor: primaryBg }}>
            <div className="flex items-center justify-center mb-3">
              <Shield className="h-5 w-5 mr-2" style={{ color: primaryColor }} />
              <h3 className="text-base font-semibold text-gray-900">Maximum Safety Standards</h3>
            </div>
            <p className="text-center text-sm font-medium" style={{ color: primaryColor }}>
              Modern digital radiology technology ensures minimal radiation exposure while delivering superior diagnostic 
              images for accurate treatment planning.
            </p>
          </div>
        </div>
      </section>

      {/* Compassionate Care You Can Trust */}
      <section className="bg-white" style={{ paddingTop: '30px', paddingBottom: '30px' }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            Compassionate Care You Can Trust
          </h2>
          <div className="p-8 rounded-xl" style={{ backgroundColor: primaryBg }}>
            <p className="text-gray-700 leading-relaxed mb-6 text-lg">
              We know it can be stressful when your pet needs an X-ray, but rest assured—our caring veterinary team is 
              here to make the process smooth, safe, and reassuring. With advanced diagnostic imaging, we can provide the 
              answers you need quickly, so your pet can get back to feeling their best.
            </p>
            <div className="bg-white p-6 rounded-lg">
              <div className="flex items-center justify-center mb-4">
                <Heart className="h-8 w-8 mr-3" style={{ color: primaryColor }} />
                <h3 className="text-xl font-semibold text-gray-900">Expert Veterinary Radiology</h3>
              </div>
              <p className="text-gray-800 font-semibold">
                State-of-the-art digital X-ray technology combined with compassionate veterinary care for accurate 
                diagnosis and peace of mind for you and your beloved pet.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Service Areas */}
      <section className="bg-gray-50" style={{ paddingTop: '30px', paddingBottom: '30px' }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            Serving Your Community
          </h2>
          <p className="text-gray-600 mb-6">
            We proudly provide advanced digital X-ray services to pet families across:
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
            Schedule Your Pet's Digital X-Ray Today
          </h2>
          <p className="mb-8" style={{ color: 'white', fontSize: '1rem' }}>
            Advanced digital radiology with superior image quality and maximum safety
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
              Schedule X-Ray Appointment
              <MapPin className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default DigitalVeterinaryXRays;