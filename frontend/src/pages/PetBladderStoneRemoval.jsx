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

const PetBladderStoneRemoval = () => {
  const primaryColor = '#29add3';
  const primaryLight = '#5bc0db';
  const primaryBg = '#e6f7fb';
  const warningColor = '#f59e0b';
  const dangerColor = '#ef4444';

  const bladderStoneTypes = [
    {
      type: 'Struvite Stones',
      color: '#10b981',
      icon: Droplets,
      description: 'Most common in female dogs and cats, often forming due to bacterial infections.',
      characteristics: [
        'Dissolve with prescription diets',
        'Associated with urinary tract infections',
        'More common in alkaline urine',
        'Can form rapidly'
      ]
    },
    {
      type: 'Calcium Oxalate Stones',
      color: '#f59e0b',
      icon: FlaskConical,
      description: 'Hard stones that cannot be dissolved and typically require surgical removal.',
      characteristics: [
        'Cannot be dissolved medically',
        'More common in male dogs',
        'Associated with acidic urine',
        'High recurrence rate'
      ]
    },
    {
      type: 'Uric Acid Stones',
      color: '#8b5cf6',
      icon: TestTube,
      description: 'Less common stones that can sometimes be managed with dietary modifications.',
      characteristics: [
        'Genetic predisposition in some breeds',
        'May respond to dietary management',
        'Associated with liver disease',
        'More common in Dalmatians'
      ]
    },
    {
      type: 'Cystine Stones',
      color: '#ef4444',
      icon: Microscope,
      description: 'Rare stones caused by a genetic defect affecting amino acid metabolism.',
      characteristics: [
        'Hereditary condition',
        'More common in male dogs',
        'Difficult to manage',
        'High recurrence rate'
      ]
    }
  ];

  const symptoms = [
    {
      symptom: 'Frequent Urination',
      color: '#f59e0b',
      severity: 'Moderate',
      icon: Clock,
      description: 'Your pet may urinate more frequently than normal, often in small amounts.'
    },
    {
      symptom: 'Blood in Urine',
      color: '#ef4444',
      severity: 'Severe',
      icon: AlertTriangle,
      description: 'Pink, red, or brown-tinged urine is a serious sign that requires immediate attention.'
    },
    {
      symptom: 'Straining to Urinate',
      color: '#ef4444',
      severity: 'Severe',
      icon: Activity,
      description: 'Difficulty or obvious discomfort when attempting to urinate.'
    },
    {
      symptom: 'Urinating in Unusual Places',
      color: '#f59e0b',
      severity: 'Moderate',
      icon: Home,
      description: 'House-trained pets may start urinating indoors or in inappropriate locations.'
    },
    {
      symptom: 'Lethargy & Loss of Appetite',
      color: '#f59e0b',
      severity: 'Moderate',
      icon: Heart,
      description: 'General discomfort and pain can cause decreased energy and interest in food.'
    },
    {
      symptom: 'Excessive Licking',
      color: '#f59e0b',
      severity: 'Moderate',
      icon: Target,
      description: 'Pets may lick their genital area excessively due to discomfort or irritation.'
    }
  ];

  const diagnosticProcess = [
    {
      step: 'Physical Examination',
      icon: Stethoscope,
      description: 'Comprehensive physical exam to assess your pet\'s overall health and identify areas of discomfort.',
      details: [
        'Abdominal palpation',
        'Pain assessment',
        'General health evaluation',
        'Vital signs monitoring'
      ]
    },
    {
      step: 'Urinalysis & Culture',
      icon: FlaskConical,
      description: 'Laboratory analysis of urine to identify bacteria, crystals, and other abnormalities.',
      details: [
        'Bacterial culture and sensitivity',
        'Crystal identification',
        'pH and specific gravity',
        'Microscopic examination'
      ]
    },
    {
      step: 'Imaging Studies',
      icon: Scan,
      description: 'X-rays and ultrasound to locate stones and assess bladder health.',
      details: [
        'Radiographs (X-rays)',
        'Ultrasound examination',
        'Stone size and location',
        'Bladder wall assessment'
      ]
    }
  ];

  const surgicalOptions = [
    {
      surgery: 'Cystotomy',
      icon: Scissors,
      description: 'The most common surgical procedure to remove bladder stones through a small incision.',
      details: [
        'Direct stone removal',
        'Bladder wall examination',
        'Complete stone extraction',
        'Tissue biopsy if needed'
      ],
      recovery: '7-14 days'
    },
    {
      surgery: 'Laser Lithotripsy',
      icon: Zap,
      description: 'Advanced technique using laser energy to break stones into smaller pieces.',
      details: [
        'Minimally invasive',
        'Breaks stones into fragments',
        'Faster recovery',
        'Less tissue trauma'
      ],
      recovery: '3-7 days'
    }
  ];

  const serviceAreas = [
    'South Riding',
    'Aldie',
    'Ashburn',
    'Chantilly',
    'Centreville',
    'Reston',
    'Herndon'
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section - Mobile Only */}
      <section className="text-white sticky z-40 block md:hidden" style={{ top: '4rem', background: `linear-gradient(135deg, ${primaryColor} 0%, #2196c7 100%)`, paddingTop: '0.5rem', paddingBottom: '0.5rem' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="font-bold" style={{ fontSize: '1.125rem' }}>
              Bladder Stone Removal
            </h1>
          </div>
        </div>
      </section>

      {/* Hero Section */}
      <section className="bg-white pt-6" style={{ paddingBottom: '8px' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h1 className="text-xl font-bold text-gray-900 mb-4">
              Bladder Stone Removal
            </h1>
            <div className="mb-6">
              <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold text-white" style={{ backgroundColor: primaryColor }}>
                Expert Bladder Stone Removal & Prevention
              </span>
            </div>
            <p className="text-base text-gray-600 leading-relaxed max-w-4xl mx-auto">
              Bladder stones can cause significant discomfort and serious health complications for your pet. 
              At Pets and Vets Animal Hospital & Urgent Care in South Riding, VA, we provide expert diagnosis 
              and advanced surgical treatment for bladder stones, proudly serving pet families in Aldie, 
              Ashburn, Chantilly, Centreville, Reston, and Herndon.
            </p>
          </div>
        </div>
      </section>

      {/* Types of Bladder Stones */}
      <section className="bg-[#f8f9fa] py-6">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">
            Types of Bladder Stones We Treat
          </h2>
          <p className="text-center text-gray-600 mb-6 text-sm">
            Understanding different stone types helps determine the most effective treatment approach:
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {bladderStoneTypes.map((stone, index) => (
              <div key={index} className="bg-white p-4 rounded-lg shadow-sm">
                <div className="flex items-center mb-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full mr-3" style={{ backgroundColor: `${stone.color}15` }}>
                    <stone.icon className="h-5 w-5" style={{ color: stone.color }} />
                  </div>
                  <h3 className="text-base font-semibold text-gray-900">{stone.type}</h3>
                </div>
                <p className="text-gray-600 text-sm mb-3">{stone.description}</p>
                <div className="space-y-1">
                  <h4 className="font-semibold text-gray-900 text-sm">Key Features:</h4>
                  <div className="space-y-1">
                    {stone.characteristics.slice(0, 2).map((characteristic, charIndex) => (
                      <div key={charIndex} className="flex items-center text-xs text-gray-600">
                        <CheckCircle className="h-2 w-2 mr-2 flex-shrink-0" style={{ color: stone.color }} />
                        <span>{characteristic}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Symptoms */}
      <section className="bg-white py-6">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">
            Recognizing Bladder Stone Symptoms
          </h2>
          <p className="text-center text-gray-600 mb-6 text-sm">
            Early recognition of these symptoms can prevent serious complications:
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {symptoms.map((symptom, index) => (
              <div key={index} className="bg-gray-50 p-4 rounded-lg shadow-sm">
                <div className="flex items-center mb-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full mr-3" style={{ backgroundColor: `${symptom.color}15` }}>
                    <symptom.icon className="h-5 w-5" style={{ color: symptom.color }} />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-gray-900">{symptom.symptom}</h3>
                    <span className="px-2 py-1 rounded-full text-xs font-medium text-white" style={{ backgroundColor: symptom.color }}>
                      {symptom.severity}
                    </span>
                  </div>
                </div>
                <p className="text-gray-600 text-sm">{symptom.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Diagnostic Process */}
      <section className="bg-[#f8f9fa] py-6">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">
            Our Diagnostic Process
          </h2>
          <p className="text-center text-gray-600 mb-6 text-sm">
            Accurate diagnosis is essential for effective treatment planning:
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {diagnosticProcess.map((step, index) => (
              <div key={index} className="bg-white p-4 rounded-lg shadow-sm">
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

      {/* Surgical Options */}
      <section className="bg-white py-6">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">
            Advanced Surgical Options
          </h2>
          <p className="text-center text-gray-600 mb-6 text-sm">
            We offer multiple surgical approaches to ensure the best outcome for your pet:
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {surgicalOptions.map((surgery, index) => (
              <div key={index} className="bg-gray-50 p-4 rounded-lg shadow-sm">
                <div className="flex items-center mb-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full mr-3" style={{ backgroundColor: primaryBg }}>
                    <surgery.icon className="h-5 w-5" style={{ color: primaryColor }} />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-gray-900">{surgery.surgery}</h3>
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                      Recovery: {surgery.recovery}
                    </span>
                  </div>
                </div>
                <p className="text-gray-600 text-sm mb-3">{surgery.description}</p>
                <div className="space-y-1">
                  <h4 className="font-semibold text-gray-900 text-sm">Features:</h4>
                  <div className="space-y-1">
                    {surgery.details.slice(0, 2).map((detail, detIndex) => (
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

      {/* Expert Care Message */}
      <section className="bg-[#f8f9fa] py-6">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            Restoring Your Pet's Comfort & Health
          </h2>
          <div className="p-6 rounded-lg" style={{ backgroundColor: primaryBg }}>
            <p className="text-gray-700 leading-relaxed mb-4" style={{ fontSize: '1rem' }}>
              Bladder stones can cause significant pain and complications, but with proper diagnosis 
              and expert surgical care, your pet can return to a comfortable, healthy life. Our 
              experienced team is dedicated to providing the safest, most effective treatment options.
            </p>
            <div className="bg-white p-4 rounded-lg">
              <div className="flex items-center justify-center mb-3">
                <Scissors className="h-6 w-6 mr-2" style={{ color: primaryColor }} />
                <h3 className="text-base font-semibold text-gray-900">Expert Surgical Care</h3>
              </div>
              <p className="text-gray-800 text-sm font-semibold">
                From diagnosis through complete recovery—trust our skilled surgical team to 
                provide the specialized care your pet needs for optimal urinary health.
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
            We proudly provide expert bladder stone removal services to pet families across:
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
            Schedule Your Pet's Bladder Stone Evaluation
          </h2>
          <p className="mb-6" style={{ color: 'white', fontSize: '1rem' }}>
            Expert diagnosis and surgical treatment for bladder stones and urinary health
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
              Schedule Consultation
              <MapPin className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default PetBladderStoneRemoval;