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
  Target,
  Camera
} from 'lucide-react';
import { hospitalInfo } from '../mock';

const DogEyeCare = () => {
  const primaryColor = '#29add3';
  const primaryLight = '#5bc0db';
  const primaryBg = '#e6f7fb';

  const eyeDisorders = [
    {
      title: "Eyelid or Eyelash Abnormalities",
      description: "Structural issues that can cause irritation and discomfort",
      icon: Eye
    },
    {
      title: "Conjunctivitis (Pink Eye)", 
      description: "Inflammation of the membrane lining the eyelids and eyeball",
      icon: AlertTriangle
    },
    {
      title: "Dry Eye and Cherry Eye",
      description: "Insufficient tear production or gland prolapse causing irritation",
      icon: Shield
    },
    {
      title: "Corneal Ulcers",
      description: "Painful wounds on the clear front surface of the eye",
      icon: Target
    },
    {
      title: "Glaucoma and Cataracts",
      description: "Increased eye pressure and lens clouding that can cause blindness",
      icon: Camera
    },
    {
      title: "Retinal Disease",
      description: "Conditions affecting the light-sensitive tissue at the back of the eye",
      icon: Search
    }
  ];

  const warningSignsEmergency = [
    "Cloudy eyes or swelling",
    "Redness, irritation, or pawing at the face"
  ];

  const warningSignsBehavioral = [
    "Reluctance to use stairs or jump",
    "Bumping into furniture or appearing dazed",
    "Anxiety in new places or being easily startled"
  ];

  const selfDiagnosisRisks = [
    {
      risk: "Misdiagnosis & Complications",
      description: "Eye conditions often look similar but require completely different treatments, leading to worsened symptoms."
    },
    {
      risk: "Unnecessary Pain",
      description: "Delayed or incorrect treatment prolongs your pet's discomfort and can cause lasting damage."
    },
    {
      risk: "Overlooked Emergencies",
      description: "Conditions like glaucoma or corneal ulcers need immediate attention to prevent permanent vision loss."
    }
  ];

  const diagnosticTests = [
    {
      test: "Fluorescein Staining",
      purpose: "Check for corneal injuries and surface damage not visible to the naked eye"
    },
    {
      test: "Tear Production Tests", 
      purpose: "Measure tear production to diagnose dry eye conditions"
    },
    {
      test: "Tonometry",
      purpose: "Detect glaucoma by measuring pressure inside the eye"
    },
    {
      test: "Ophthalmoscopy & Imaging",
      purpose: "Assess internal eye structures including retina, lens, and optic nerve"
    }
  ];

  const earlyDetectionBenefits = [
    {
      benefit: "Relieve Pain & Discomfort",
      description: "Early treatment prevents progression of painful conditions",
      icon: Heart
    },
    {
      benefit: "Preserve Vision",
      description: "Timely intervention can prevent blindness and maintain quality of life",
      icon: Eye
    },
    {
      benefit: "Identify Systemic Diseases",
      description: "Eye exams can reveal underlying health conditions affecting the whole body",
      icon: Search
    },
    {
      benefit: "Avoid Emergency Surgery",
      description: "Prevent severe complications that require costly emergency procedures",
      icon: Shield
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section - Mobile Only */}
      <section className="text-white sticky z-40 block md:hidden" style={{ top: '4rem', background: `linear-gradient(135deg, ${primaryColor} 0%, #2196c7 100%)`, paddingTop: '0.5rem', paddingBottom: '0.5rem' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="font-bold" style={{ fontSize: '1.125rem' }}>
              Dog Eye Care
            </h1>
          </div>
        </div>
      </section>

      {/* Hero Section */}
      <section className="bg-white">
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center" style={{ paddingTop: '30px', paddingBottom: '15px' }}>
          <h1 className="text-xl font-bold text-gray-900 mb-6">
            Dog Eye Care
          </h1>
          <div className="mb-6">
            <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold text-white" style={{ backgroundColor: primaryColor }}>
              Clear Vision for Your Best Friend
            </span>
          </div>
          <p className="text-base text-gray-600 leading-relaxed max-w-3xl mx-auto">
            Your dog's eyes are not only a window to their soul—they are vital to their comfort, confidence, and quality of life. 
            Just like humans, dogs can develop eye conditions that range from minor irritations to serious diseases that threaten their vision. 
            At Pets & Vets Animal Hospital, we provide comprehensive eye care to keep your pet healthy and happy through regular checkups and early veterinary attention.
          </p>
        </div>
      </section>

      {/* Why Eye Care Matters */}
      <section style={{ backgroundColor: '#f8f9fa', paddingTop: '30px', paddingBottom: '15px' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">
            Why Eye Care Matters
          </h2>
          <p className="text-center text-gray-600 mb-8">
            Common eye disorders in dogs include various conditions that can affect vision and comfort:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {eyeDisorders.map((disorder, index) => (
              <div key={index} className="bg-white p-6 rounded-xl shadow-md">
                <div className="flex items-center mb-4">
                  <disorder.icon className="h-6 w-6 mr-3" style={{ color: primaryColor }} />
                  <h3 className="text-lg font-semibold text-gray-900">{disorder.title}</h3>
                </div>
                <p className="text-gray-600 text-sm">
                  {disorder.description}
                </p>
              </div>
            ))}
          </div>
          <div className="mt-8 p-6 rounded-xl border-l-4" style={{ borderColor: primaryColor, backgroundColor: '#fffbf0' }}>
            <p className="text-gray-700 font-medium">
              <strong>Breed Considerations:</strong> Some breeds are genetically predisposed to certain eye conditions, 
              making routine veterinary checkups even more important for early detection and prevention.
            </p>
          </div>
        </div>
      </section>

      {/* Warning Signs */}
      <section className="bg-white" style={{ paddingTop: '15px', paddingBottom: '15px' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">
            Warning Signs of Vision Problems
          </h2>
          <p className="text-center text-gray-600 mb-8">
            Seek immediate veterinary care if you notice any of these symptoms:
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Emergency Signs */}
            <div>
              <h3 className="text-lg font-semibold text-red-900 mb-4 flex items-center">
                <Zap className="h-5 w-5 mr-2 text-red-600" />
                Immediate Emergency Signs
              </h3>
              <div className="space-y-3">
                {warningSignsEmergency.map((sign, index) => (
                  <div key={index} className="flex items-start p-4 rounded-lg border-l-4 border-red-500 bg-red-50">
                    <AlertTriangle className="h-5 w-5 mr-3 flex-shrink-0 mt-0.5 text-red-600" />
                    <span className="text-red-800 font-medium">{sign}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Behavioral Signs */}
            <div>
              <h3 className="text-lg font-semibold text-amber-900 mb-4 flex items-center">
                <Eye className="h-5 w-5 mr-2 text-amber-600" />
                Behavioral Changes
              </h3>
              <div className="space-y-3">
                {warningSignsBehavioral.map((sign, index) => (
                  <div key={index} className="flex items-start p-4 rounded-lg border-l-4 border-amber-500 bg-amber-50">
                    <Eye className="h-5 w-5 mr-3 flex-shrink-0 mt-0.5 text-amber-600" />
                    <span className="text-amber-800">{sign}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-8 p-6 rounded-xl bg-red-50 border-2 border-red-200">
            <p className="text-red-800 font-semibold text-center">
              ⚠️ These symptoms may point to conditions that can worsen quickly without treatment. 
              When in doubt, seek immediate veterinary attention.
            </p>
          </div>
        </div>
      </section>

      {/* Why Not Self-Diagnose */}
      <section style={{ backgroundColor: '#f8f9fa', paddingTop: '15px', paddingBottom: '15px' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">
            Why You Shouldn't Self-Diagnose
          </h2>
          <p className="text-center text-gray-600 mb-8">
            Eye conditions in dogs often resemble each other but require different treatments. Attempting to self-diagnose or delay care can have serious consequences:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {selfDiagnosisRisks.map((item, index) => (
              <div key={index} className="bg-white p-6 rounded-xl shadow-md border-l-4 border-red-500">
                <div className="flex items-center mb-4">
                  <AlertTriangle className="h-6 w-6 mr-3 text-red-500" />
                  <h3 className="text-lg font-semibold text-red-900">{item.risk}</h3>
                </div>
                <p className="text-gray-600 text-sm">{item.description}</p>
              </div>
            ))}
          </div>
          <div className="mt-8 p-6 rounded-xl" style={{ backgroundColor: primaryBg }}>
            <p className="text-center font-semibold" style={{ color: primaryColor }}>
              A veterinarian's examination is always the safest option for your pet's eye health.
            </p>
          </div>
        </div>
      </section>

      {/* Veterinary Diagnosis & Treatment */}
      <section className="bg-white" style={{ paddingTop: '15px', paddingBottom: '15px' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">
            How Veterinarians Diagnose & Treat
          </h2>
          <p className="text-center text-gray-600 mb-8">
            Veterinary eye exams use specialized equipment and techniques for accurate diagnosis:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {diagnosticTests.map((test, index) => (
              <div key={index} className="bg-gray-50 p-6 rounded-xl shadow-md border-l-4" style={{ borderColor: primaryColor }}>
                <div className="flex items-start">
                  <Stethoscope className="h-6 w-6 mr-4 flex-shrink-0 mt-1" style={{ color: primaryColor }} />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{test.test}</h3>
                    <p className="text-gray-600 text-sm">{test.purpose}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="bg-gray-50 p-8 rounded-xl">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">Treatment Options</h3>
            <p className="text-gray-700 text-center mb-4">
              Treatments range from conservative to advanced options based on the specific condition:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-white rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">Topical Medications</h4>
                <p className="text-sm text-gray-600">Eye drops and ointments for infections and inflammation</p>
              </div>
              <div className="text-center p-4 bg-white rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">Oral Medications</h4>
                <p className="text-sm text-gray-600">Systemic treatments for complex conditions</p>
              </div>
              <div className="text-center p-4 bg-white rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">Artificial Tears</h4>
                <p className="text-sm text-gray-600">Lubrication therapy for dry eye conditions</p>
              </div>
              <div className="text-center p-4 bg-white rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">Surgery & Referrals</h4>
                <p className="text-sm text-gray-600">Advanced procedures or veterinary ophthalmologist care</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Early Detection Benefits */}
      <section style={{ backgroundColor: '#f8f9fa', paddingTop: '15px', paddingBottom: '15px' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">
            The Importance of Early Detection
          </h2>
          <p className="text-center text-gray-600 mb-8">
            Catching eye problems early provides significant benefits for your pet:
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
        </div>
      </section>

      {/* Conclusion */}
      <section className="bg-white" style={{ paddingTop: '15px', paddingBottom: '30px' }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            Protecting Your Dog's Vision and Quality of Life
          </h2>
          <div className="p-8 rounded-xl" style={{ backgroundColor: primaryBg }}>
            <p className="text-gray-700 leading-relaxed mb-6" style={{ fontSize: '1rem' }}>
              Your dog depends on healthy vision for confidence, mobility, and joy. Their eyes are essential 
              for navigating the world and maintaining their quality of life.
            </p>
            <div className="bg-white p-6 rounded-lg">
              <p className="text-gray-800 font-medium mb-4">
                By watching for early signs of trouble, scheduling routine veterinary exams, and seeking 
                immediate care when problems arise, you can protect their eyes—and their quality of life.
              </p>
              <p className="text-gray-700 italic">
                Remember: Eye conditions can progress rapidly. When in doubt, always consult with a veterinary professional 
                rather than waiting or attempting home remedies.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section style={{ background: `linear-gradient(135deg, ${primaryColor} 0%, #2196c7 100%)`, paddingTop: '30px', paddingBottom: '30px' }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-bold text-white mb-6" style={{ fontSize: '1rem' }}>
            Schedule Your Dog's Eye Health Examination
          </h2>
          <p className="mb-8" style={{ color: 'white', fontSize: '1rem' }}>
            Protect your dog's vision with professional eye care—early detection and treatment make all the difference
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

export default DogEyeCare;