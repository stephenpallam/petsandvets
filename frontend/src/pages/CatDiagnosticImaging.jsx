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
  Search,
  Stethoscope,
  Eye,
  Zap,
  Camera,
  Monitor,
  Scan,
  Target,
  TrendingUp
} from 'lucide-react';
import { hospitalInfo } from '../mock';

const CatDiagnosticImaging = () => {
  const primaryColor = '#29add3';
  const primaryLight = '#5bc0db';
  const primaryBg = '#e6f7fb';

  const imagingTypes = [
    {
      type: "X-rays (Radiographs)",
      description: "Quick and cost-effective; ideal for detecting broken bones, tumors, dental problems, and lung or heart issues.",
      icon: Camera,
      features: ["Bone fractures", "Dental problems", "Lung conditions", "Heart issues", "Tumors"],
      speed: "Quick",
      cost: "Cost-effective"
    },
    {
      type: "Ultrasound",
      description: "Uses sound waves to visualize soft tissues such as the heart, liver, kidneys, bladder, and intestines. Echocardiogram assesses cardiac health.",
      icon: Monitor,
      features: ["Heart evaluation", "Liver assessment", "Kidney function", "Bladder stones", "Intestinal issues"],
      speed: "Non-invasive",
      cost: "Moderate"
    }
  ];

  const imagingSymptoms = [
    {
      symptom: "Persistent coughing or breathing trouble",
      urgency: "high",
      imaging: "X-rays, Ultrasound"
    },
    {
      symptom: "Difficulty walking, sudden limping, or suspected fractures",
      urgency: "high", 
      imaging: "X-rays, MRI"
    },
    {
      symptom: "Abdominal pain, vomiting, or signs of obstruction",
      urgency: "critical",
      imaging: "X-rays, Ultrasound"
    },
    {
      symptom: "Dental issues or jaw pain",
      urgency: "moderate",
      imaging: "Dental X-rays"
    },
    {
      symptom: "Suspected tumors, heart disease, or bladder stones",
      urgency: "high",
      imaging: "Ultrasound, X-rays, CT"
    }
  ];

  const earlyDetectionBenefits = [
    {
      benefit: "Early Intervention",
      description: "Detect and treat conditions before they progress to more serious stages",
      icon: Clock
    },
    {
      benefit: "Accurate Diagnosis", 
      description: "Precise identification guides the most effective treatment plan for your cat",
      icon: Target
    },
    {
      benefit: "Improved Quality of Life",
      description: "Prevent unnecessary pain and complications through timely detection",
      icon: Heart
    },
    {
      benefit: "Better Outcomes",
      description: "Early detection often means less invasive treatments and better prognosis",
      icon: TrendingUp
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section - Mobile Only */}
      <section className="text-white sticky z-40 block md:hidden" style={{ top: '4rem', background: `linear-gradient(135deg, ${primaryColor} 0%, #2196c7 100%)`, paddingTop: '0.5rem', paddingBottom: '0.5rem' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="font-bold" style={{ fontSize: '1.125rem' }}>
              Cat Diagnostic Imaging
            </h1>
          </div>
        </div>
      </section>

      {/* Introduction */}
      <section className="bg-white" style={{ paddingTop: '30px', paddingBottom: '30px' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
              Cat Diagnostic Imaging
            </h1>
            <p className="text-base text-gray-600 leading-relaxed max-w-4xl mx-auto">
              Cats are experts at hiding pain and illness, which makes it challenging for owners to know when something is wrong. 
              That's where diagnostic imaging comes in. Using advanced, non-invasive technology, veterinarians can look inside your 
              cat's body to detect injuries or illnesses that can't be seen during a physical exam—helping ensure faster, more accurate treatment.
            </p>
          </div>
        </div>
      </section>

      {/* What Is Cat Diagnostic Imaging */}
      <section className="bg-gray-50" style={{ paddingTop: '30px', paddingBottom: '30px' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">
            What Is Cat Diagnostic Imaging?
          </h2>
          <p className="text-center text-gray-600 mb-8">
            Diagnostic imaging uses specialized equipment to create detailed pictures of a cat's bones, organs, and tissues:
          </p>
          <div className="space-y-6">
            {imagingTypes.map((imaging, index) => (
              <div key={index} className="bg-white p-6 rounded-xl shadow-md">
                <div className="flex flex-col lg:flex-row lg:items-start lg:space-x-6">
                  <div className="flex items-center mb-4 lg:mb-0">
                    <imaging.icon className="h-8 w-8 mr-4" style={{ color: primaryColor }} />
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">{imaging.type}</h3>
                      <div className="flex space-x-4 mt-2">
                        <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">
                          {imaging.speed}
                        </span>
                        <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                          {imaging.cost}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-600 mb-4">{imaging.description}</p>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
                      {imaging.features.map((feature, featureIndex) => (
                        <div key={featureIndex} className="flex items-center p-2 rounded-lg" style={{ backgroundColor: primaryBg }}>
                          <CheckCircle className="h-4 w-4 mr-2" style={{ color: primaryColor }} />
                          <span className="text-sm text-gray-700">{feature}</span>
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

      {/* When Is Imaging Needed */}
      <section className="bg-white" style={{ paddingTop: '30px', paddingBottom: '30px' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">
            When Is Imaging Needed?
          </h2>
          <p className="text-center text-gray-600 mb-8">
            Your veterinarian may recommend diagnostic imaging if your cat shows symptoms such as:
          </p>
          <div className="space-y-4">
            {imagingSymptoms.map((item, index) => (
              <div key={index} className={`p-6 rounded-xl border-l-4 ${
                item.urgency === 'critical' ? 'border-red-500 bg-red-50' :
                item.urgency === 'high' ? 'border-orange-500 bg-orange-50' :
                'border-yellow-500 bg-yellow-50'
              }`}>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                  <div className="flex items-start mb-4 md:mb-0">
                    <AlertTriangle className={`h-5 w-5 mr-3 flex-shrink-0 mt-0.5 ${
                      item.urgency === 'critical' ? 'text-red-500' :
                      item.urgency === 'high' ? 'text-orange-500' :
                      'text-yellow-500'
                    }`} />
                    <div>
                      <p className={`font-medium ${
                        item.urgency === 'critical' ? 'text-red-900' :
                        item.urgency === 'high' ? 'text-orange-900' :
                        'text-yellow-900'
                      }`}>
                        {item.symptom}
                      </p>
                      <p className={`text-sm mt-1 ${
                        item.urgency === 'critical' ? 'text-red-700' :
                        item.urgency === 'high' ? 'text-orange-700' :
                        'text-yellow-700'
                      }`}>
                        Recommended imaging: {item.imaging}
                      </p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                    item.urgency === 'critical' ? 'bg-red-200 text-red-800' :
                    item.urgency === 'high' ? 'bg-orange-200 text-orange-800' :
                    'bg-yellow-200 text-yellow-800'
                  }`}>
                    {item.urgency.toUpperCase()} PRIORITY
                  </span>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-8 p-6 rounded-xl" style={{ backgroundColor: primaryBg }}>
            <p className="text-center font-medium" style={{ color: primaryColor }}>
              Imaging helps pinpoint the cause, so treatment can begin quickly and effectively for your feline companion.
            </p>
          </div>
        </div>
      </section>

      {/* Why Early Detection Matters */}
      <section className="bg-gray-50" style={{ paddingTop: '30px', paddingBottom: '30px' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">
            Why Early Detection Matters
          </h2>
          <p className="text-center text-gray-600 mb-8">
            Cats age rapidly, and health problems can progress quickly if left undiagnosed. Imaging allows for:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {earlyDetectionBenefits.map((benefit, index) => (
              <div key={index} className="bg-white p-6 rounded-xl shadow-md text-center">
                <div className="flex items-center justify-center w-16 h-16 rounded-full mx-auto mb-4" style={{ backgroundColor: primaryBg }}>
                  <benefit.icon className="h-8 w-8" style={{ color: primaryColor }} />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">{benefit.benefit}</h3>
                <p className="text-gray-600 text-sm">{benefit.description}</p>
              </div>
            ))}
          </div>
          <div className="mt-8 p-6 rounded-xl bg-amber-50 border-l-4 border-amber-500">
            <p className="text-amber-800 font-medium text-center">
              <strong>Critical Timing:</strong> Routine check-ups combined with timely imaging can mean the difference 
              between a manageable condition and a life-threatening emergency.
            </p>
          </div>
        </div>
      </section>

      {/* Advanced Technology Section */}
      <section className="bg-white" style={{ paddingTop: '30px', paddingBottom: '30px' }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">
            Advanced Imaging Technology for Cats
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 rounded-xl" style={{ backgroundColor: primaryBg }}>
              <div className="flex items-center mb-4">
                <Shield className="h-6 w-6 mr-3" style={{ color: primaryColor }} />
                <h3 className="text-lg font-semibold text-gray-900">Non-Invasive Procedures</h3>
              </div>
              <p className="text-gray-700 text-sm mb-4">
                Most diagnostic imaging procedures are completely non-invasive, requiring minimal restraint 
                and causing no discomfort to your cat.
              </p>
              <ul className="text-gray-600 text-sm space-y-1">
                <li>• No surgical procedures required</li>
                <li>• Minimal stress for your cat</li>
                <li>• Quick and efficient imaging</li>
                <li>• Immediate results available</li>
              </ul>
            </div>
            <div className="p-6 rounded-xl" style={{ backgroundColor: primaryBg }}>
              <div className="flex items-center mb-4">
                <Eye className="h-6 w-6 mr-3" style={{ color: primaryColor }} />
                <h3 className="text-lg font-semibold text-gray-900">See Beyond the Surface</h3>
              </div>
              <p className="text-gray-700 text-sm mb-4">
                Advanced imaging reveals hidden conditions that physical examination alone cannot detect, 
                providing a complete picture of your cat's health.
              </p>
              <ul className="text-gray-600 text-sm space-y-1">
                <li>• Internal organ visualization</li>
                <li>• Bone and joint assessment</li>
                <li>• Soft tissue evaluation</li>
                <li>• Disease progression monitoring</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* The Bottom Line */}
      <section className="bg-gray-50" style={{ paddingTop: '30px', paddingBottom: '30px' }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            The Bottom Line: Seeing Beyond What's Visible
          </h2>
          <div className="p-8 rounded-xl" style={{ backgroundColor: primaryBg }}>
            <p className="text-gray-700 leading-relaxed mb-6 text-lg">
              Cat diagnostic imaging is one of the most powerful tools in modern veterinary care. It allows vets to see beyond 
              what the eye can detect, ensuring earlier diagnoses, targeted treatments, and better outcomes for your feline friend.
            </p>
            <div className="bg-white p-6 rounded-lg">
              <div className="flex items-center justify-center mb-4">
                <Search className="h-8 w-8 mr-3" style={{ color: primaryColor }} />
                <h3 className="text-xl font-semibold text-gray-900">Advanced Diagnostic Excellence</h3>
              </div>
              <p className="text-gray-800 font-semibold mb-4">
                At Pets & Vets Animal Hospital, we're committed to using advanced imaging to keep your cat healthy, 
                happy, and comfortable—because every detail matters when it comes to their well-being.
              </p>
              <p className="text-gray-700">
                Our state-of-the-art imaging equipment and experienced veterinary team work together to provide 
                the most accurate diagnoses and effective treatment plans for your beloved feline companion.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section style={{ background: `linear-gradient(135deg, ${primaryColor} 0%, #2196c7 100%)`, paddingTop: '30px', paddingBottom: '30px' }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-bold text-white mb-4" style={{ fontSize: '1rem' }}>
            Schedule Your Cat's Diagnostic Imaging Consultation
          </h2>
          <p className="mb-8" style={{ color: 'white', fontSize: '1rem' }}>
            Advanced imaging technology for accurate diagnosis and better outcomes—schedule your consultation today
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
              Schedule Imaging Consultation
              <MapPin className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default CatDiagnosticImaging;