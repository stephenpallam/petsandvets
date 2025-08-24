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
  Bug,
  Thermometer
} from 'lucide-react';
import { hospitalInfo } from '../mock';

const DogSkinCare = () => {
  const primaryColor = '#29add3';
  const primaryLight = '#5bc0db';
  const primaryBg = '#e6f7fb';

  const skinCauses = [
    {
      title: "Allergies",
      description: "Environmental or food-related allergens that trigger immune responses",
      icon: Thermometer
    },
    {
      title: "Parasites", 
      description: "Fleas, ticks, mites that cause irritation and secondary infections",
      icon: Bug
    },
    {
      title: "Endocrine Disorders",
      description: "Thyroid or hormonal imbalances affecting skin health",
      icon: Activity
    },
    {
      title: "Autoimmune Diseases",
      description: "Pemphigus, lupus and other immune system disorders",
      icon: Shield
    }
  ];

  const warningSigns = [
    "Persistent scratching or chewing feet",
    "Hair loss or bald patches",
    "Redness, bumps, or skin lesions", 
    "Scabs or sores",
    "Ear infections and head shaking",
    "Behavioral changes like restlessness or irritability"
  ];

  const diagnosticTests = [
    {
      test: "Skin Scraping",
      purpose: "Detect parasites such as mange mites"
    },
    {
      test: "Ear Exams & Wax Sampling", 
      purpose: "Identify yeast or bacterial infections in ears"
    },
    {
      test: "Hair Plucking & Fungal Culture (DTM)",
      purpose: "Test for ringworm and other fungal infections"
    },
    {
      test: "Physical Examination",
      purpose: "Identify staph infections, dermatitis, and visible conditions"
    }
  ];

  const skinConditions = [
    {
      name: "Allergies & Atopic Dermatitis (Atopy)",
      description: "Environmental triggers like pollen, dust, or grass causing chronic inflammation",
      type: "chronic"
    },
    {
      name: "Contact Dermatitis", 
      description: "Irritation from direct contact with allergens (e.g., grass, chemicals)",
      type: "treatable"
    },
    {
      name: "Bacterial (Staph) and Yeast Infections",
      description: "Often secondary to allergies or excessive scratching",
      type: "curable"
    },
    {
      name: "Parasites",
      description: "Fleas, ticks, ear mites, and mange causing irritation",
      type: "curable"
    },
    {
      name: "Autoimmune Disorders",
      description: "Less common, but serious and often lifelong conditions",
      type: "chronic"
    }
  ];

  const untreatedConsequences = [
    {
      consequence: "Secondary Infections",
      description: "Constant itching leads to bacterial or fungal infections that complicate treatment"
    },
    {
      consequence: "Pain and Discomfort",
      description: "Results in loss of appetite, weight loss, and lethargy affecting quality of life"
    },
    {
      consequence: "Chronic Complications",
      description: "Long-term medications needed and higher veterinary costs over time"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section - Mobile Only */}
      <section className="text-white sticky z-40 block md:hidden" style={{ top: '4rem', background: `linear-gradient(135deg, ${primaryColor} 0%, #2196c7 100%)`, paddingTop: '0.5rem', paddingBottom: '0.5rem' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="font-bold" style={{ fontSize: '1.125rem' }}>
              Dog Skin Care
            </h1>
          </div>
        </div>
      </section>

      {/* Hero Section */}
      <section className="bg-white">
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center" style={{ paddingTop: '30px', paddingBottom: '15px' }}>
          <h1 className="text-xl font-bold text-gray-900 mb-6">
            Dog Skin Care
          </h1>
          <div className="mb-6">
            <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold text-white" style={{ backgroundColor: primaryColor }}>
              Comfort and Relief for Your Dog
            </span>
          </div>
          <p className="text-base text-gray-600 leading-relaxed max-w-3xl mx-auto">
            When it comes to your dog's health, skin is often overlooked—but it's one of the most common sources of discomfort. 
            From itchy allergies to serious autoimmune diseases, skin problems can cause pain, stress, and even affect overall health 
            if left untreated. At Pets & Vets Animal Hospital, we help pet owners recognize issues early and provide accurate, effective treatment.
          </p>
        </div>
      </section>

      {/* Common Causes */}
      <section style={{ backgroundColor: '#f8f9fa', paddingTop: '30px', paddingBottom: '15px' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">
            Common Causes of Skin Problems
          </h2>
          <p className="text-center text-gray-600 mb-8">
            Dog skin conditions can arise from various sources that trigger inflammation, irritation, or infections:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {skinCauses.map((cause, index) => (
              <div key={index} className="bg-white p-6 rounded-xl shadow-md">
                <div className="flex items-center mb-4">
                  <cause.icon className="h-6 w-6 mr-3" style={{ color: primaryColor }} />
                  <h3 className="text-lg font-semibold text-gray-900">{cause.title}</h3>
                </div>
                <p className="text-gray-600 text-sm">
                  {cause.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Signs & Symptoms */}
      <section className="bg-white" style={{ paddingTop: '15px', paddingBottom: '15px' }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">
            Signs Your Dog May Have a Skin Condition
          </h2>
          <p className="text-center text-gray-600 mb-8">
            Watch for these red flags that indicate potential skin problems:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {warningSigns.map((sign, index) => (
              <div key={index} className="flex items-start p-4 rounded-lg" style={{ backgroundColor: primaryBg }}>
                <AlertTriangle className="h-5 w-5 mr-3 flex-shrink-0 mt-0.5" style={{ color: primaryColor }} />
                <span className="text-gray-700">{sign}</span>
              </div>
            ))}
          </div>
          <div className="mt-8 p-6 rounded-xl border-l-4" style={{ borderColor: primaryColor, backgroundColor: '#fef7ff' }}>
            <p className="text-gray-700 font-medium">
              <strong>Important:</strong> Even subtle changes in grooming habits or energy levels can signal skin discomfort. 
              Early recognition allows for prompt treatment and better outcomes.
            </p>
          </div>
        </div>
      </section>

      {/* Diagnostic Approach */}
      <section style={{ backgroundColor: '#f8f9fa', paddingTop: '15px', paddingBottom: '15px' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">
            Diagnostic Approach
          </h2>
          <p className="text-center text-gray-600 mb-8">
            Veterinarians use targeted tests to pinpoint the cause, as accurate diagnosis is key—different conditions require very different treatments:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {diagnosticTests.map((test, index) => (
              <div key={index} className="bg-white p-6 rounded-xl shadow-md border-l-4" style={{ borderColor: primaryColor }}>
                <div className="flex items-start">
                  <Search className="h-6 w-6 mr-4 flex-shrink-0 mt-1" style={{ color: primaryColor }} />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{test.test}</h3>
                    <p className="text-gray-600 text-sm">{test.purpose}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Common Skin Conditions */}
      <section className="bg-white" style={{ paddingTop: '15px', paddingBottom: '15px' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">
            Common Skin Conditions in Dogs
          </h2>
          <div className="space-y-4">
            {skinConditions.map((condition, index) => (
              <div key={index} className="bg-gray-50 p-6 rounded-xl shadow-md">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{condition.name}</h3>
                      <span className={`ml-3 px-3 py-1 rounded-full text-xs font-medium ${
                        condition.type === 'curable' ? 'bg-green-100 text-green-800' :
                        condition.type === 'treatable' ? 'bg-blue-100 text-blue-800' :
                        'bg-amber-100 text-amber-800'
                      }`}>
                        {condition.type === 'curable' ? 'Curable' : 
                         condition.type === 'treatable' ? 'Treatable' : 'Chronic Management'}
                      </span>
                    </div>
                    <p className="text-gray-600">{condition.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What Happens If Untreated */}
      <section style={{ backgroundColor: '#f8f9fa', paddingTop: '15px', paddingBottom: '15px' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">
            What Happens If Left Untreated?
          </h2>
          <p className="text-center text-gray-600 mb-8">
            Ignoring skin problems can worsen your dog's health in multiple ways:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {untreatedConsequences.map((item, index) => (
              <div key={index} className="bg-white p-6 rounded-xl shadow-md border-l-4 border-red-500">
                <div className="flex items-center mb-4">
                  <Zap className="h-6 w-6 mr-3 text-red-500" />
                  <h3 className="text-lg font-semibold text-red-900">{item.consequence}</h3>
                </div>
                <p className="text-gray-600 text-sm">{item.description}</p>
              </div>
            ))}
          </div>
          <div className="mt-8 p-6 rounded-xl bg-amber-50 border-l-4 border-amber-500">
            <p className="text-amber-800">
              <strong>Note:</strong> Some conditions, like chronic alopecia in older Boxers, may be harmless cosmetic issues. 
              However, conditions like severe allergies can seriously compromise your dog's quality of life and require professional management.
            </p>
          </div>
        </div>
      </section>

      {/* Curable vs Lifelong */}
      <section className="bg-white" style={{ paddingTop: '15px', paddingBottom: '15px' }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">
            Curable vs. Lifelong Conditions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 rounded-xl bg-green-50 border-l-4 border-green-500">
              <div className="flex items-center mb-4">
                <CheckCircle className="h-6 w-6 mr-3 text-green-600" />
                <h3 className="text-lg font-semibold text-green-900">Curable Conditions</h3>
              </div>
              <p className="text-green-800 mb-4">
                <strong>Bacterial infections</strong> (e.g., staph) can be fully treated with proper antibiotics and supportive care.
              </p>
              <ul className="text-green-700 text-sm space-y-1">
                <li>• Complete resolution possible</li>
                <li>• Short-term treatment protocols</li>
                <li>• Return to normal skin health</li>
              </ul>
            </div>
            <div className="p-6 rounded-xl bg-blue-50 border-l-4 border-blue-500">
              <div className="flex items-center mb-4">
                <Clock className="h-6 w-6 mr-3 text-blue-600" />
                <h3 className="text-lg font-semibold text-blue-900">Managed Conditions</h3>
              </div>
              <p className="text-blue-800 mb-4">
                <strong>Allergies, autoimmune diseases, and chronic dermatitis</strong> require ongoing management to control symptoms.
              </p>
              <ul className="text-blue-700 text-sm space-y-1">
                <li>• Symptom control and comfort</li>
                <li>• Long-term treatment plans</li>
                <li>• Quality of life maintenance</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom Line */}
      <section style={{ backgroundColor: '#f8f9fa', paddingTop: '15px', paddingBottom: '30px' }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            The Bottom Line: Your Dog's Skin Reflects Their Health
          </h2>
          <div className="p-8 rounded-xl" style={{ backgroundColor: primaryBg }}>
            <p className="text-gray-700 leading-relaxed mb-6 text-lg">
              Your dog's skin is a reflection of their overall health. Early diagnosis and treatment can prevent pain, 
              secondary infections, and long-term complications that affect quality of life.
            </p>
            <div className="bg-white p-6 rounded-lg">
              <p className="text-gray-800 font-medium">
                If your dog is scratching, losing hair, or showing signs of skin irritation, don't rely on internet guesses—
                schedule a professional examination for accurate diagnosis and effective treatment.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section style={{ background: `linear-gradient(135deg, ${primaryColor} 0%, #2196c7 100%)`, paddingTop: '30px', paddingBottom: '30px' }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-bold text-white mb-6" style={{ fontSize: '1rem' }}>
            Schedule Your Dog's Skin & Dermatology Consultation
          </h2>
          <p className="mb-8" style={{ color: 'white', fontSize: '1rem' }}>
            Get professional diagnosis and treatment for your dog's skin condition—early intervention leads to better outcomes
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
              Schedule Dermatology Exam
              <MapPin className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default DogSkinCare;