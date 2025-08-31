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
  Thermometer,
  Calendar,
  TrendingUp,
  Award,
  Target,
  Users
} from 'lucide-react';
import { hospitalInfo }
import { useBusinessInfo } from '../hooks/useBusinessInfo';

const DogWellnessExams = () => {
  const { businessInfo: currentBusinessInfo } = useBusinessInfo();
  const primaryColor = '#29add3';
  const primaryLight = '#5bc0db';
  const primaryBg = '#e6f7fb';

  const examComponents = [
    {
      area: "Vital Signs",
      description: "Temperature, heart, and lung function assessment",
      icon: Thermometer
    },
    {
      area: "Eyes, Ears, and Mouth",
      description: "Checking for infections, tartar buildup, or gum disease",
      icon: Eye
    },
    {
      area: "Lymph Nodes & Abdomen",
      description: "Palpation for enlargement or abnormalities",
      icon: Search
    },
    {
      area: "Skin, Coat, and Paws",
      description: "Examining for signs of allergies or irritation",
      icon: Shield
    },
    {
      area: "Musculoskeletal Health",
      description: "Range of motion and joint function evaluation",
      icon: Activity
    },
    {
      area: "Reproductive & Rectal Exam",
      description: "Comprehensive examination for older dogs",
      icon: Stethoscope
    }
  ];

  const wellnessBenefits = [
    {
      benefit: "Early Detection",
      description: "Dogs hide pain well. Exams uncover hidden problems like heart murmurs, cancer, or infections before they worsen.",
      icon: Search
    },
    {
      benefit: "Disease Prevention",
      description: "It's easier (and safer) to prevent conditions like heartworm or dental disease than to treat them later.",
      icon: Shield
    },
    {
      benefit: "Longevity",
      description: "Routine exams support healthy aging and extend your dog's life expectancy.",
      icon: TrendingUp
    },
    {
      benefit: "Customized Care",
      description: "From vaccines and parasite prevention to nutrition and weight management, recommendations are tailored to your dog's needs.",
      icon: Target
    }
  ];

  const ageGroups = [
    {
      stage: "Puppies",
      timing: "6–8 weeks",
      schedule: "First exam at 6–8 weeks, then regular visits to support growth and vaccinations",
      icon: Heart,
      color: "green"
    },
    {
      stage: "Adults",
      timing: "Annual + 6-month check",
      schedule: "Annual comprehensive exams with a 6-month wellness check-up in between",
      icon: Calendar,
      color: "blue"
    },
    {
      stage: "Seniors",
      timing: "Geriatric screenings",
      schedule: "Enhanced screenings including bloodwork, urine tests, imaging, and blood pressure checks to catch age-related diseases early",
      icon: Award,
      color: "purple"
    }
  ];

  const additionalDiagnostics = [
    {
      test: "Bloodwork & Laboratory Tests",
      purpose: "Complete blood count, chemistry panel, and urinalysis to assess organ function"
    },
    {
      test: "Fecal Examination",
      purpose: "Screen for intestinal parasites and digestive health issues"
    },
    {
      test: "Diagnostic Imaging",
      purpose: "X-rays or ultrasounds to visualize internal structures and detect abnormalities"
    },
    {
      test: "Specialized Testing",
      purpose: "Skin and ear cytology for persistent dermatological or auricular issues"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section - Mobile Only */}
      <section className="text-white sticky z-40 block md:hidden" style={{ top: '4rem', background: `linear-gradient(135deg, ${primaryColor} 0%, #2196c7 100%)`, paddingTop: '0.5rem', paddingBottom: '0.5rem' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="font-bold" style={{ fontSize: '1.125rem' }}>
              Dog Wellness Exams
            </h1>
          </div>
        </div>
      </section>

      {/* Hero Section */}
      <section className="bg-white">
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center" style={{ paddingTop: '30px', paddingBottom: '15px' }}>
          <h1 className="text-xl font-bold text-gray-900 mb-6">
            Dog Wellness Exams
          </h1>
          <div className="mb-6">
            <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold text-white" style={{ backgroundColor: primaryColor }}>
              Preventive Care for a Longer Life
            </span>
          </div>
          <p className="text-base text-gray-600 leading-relaxed max-w-3xl mx-auto">
            Most pet owners visit the vet when their dog is sick—but wellness exams are just as important for protecting 
            long-term health and longevity. Preventive care helps detect issues early, often before symptoms appear, 
            and ensures your dog enjoys the best possible quality of life. At Pets & Vets Animal Hospital, we're committed 
            to keeping your canine companion thriving through regular wellness visits.
          </p>
        </div>
      </section>

      {/* What Happens in a Wellness Exam */}
      <section style={{ backgroundColor: '#f8f9fa', paddingTop: '30px', paddingBottom: '15px' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">
            What Happens in a Wellness Exam?
          </h2>
          <p className="text-center text-gray-600 mb-8">
            A wellness exam is a comprehensive head-to-tail check-up, recommended every six months. Our veterinarians evaluate your dog's:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {examComponents.map((component, index) => (
              <div key={index} className="bg-white p-6 rounded-xl shadow-md">
                <div className="flex items-center mb-4">
                  <component.icon className="h-6 w-6 mr-3" style={{ color: primaryColor }} />
                  <h3 className="text-lg font-semibold text-gray-900">{component.area}</h3>
                </div>
                <p className="text-gray-600 text-sm">
                  {component.description}
                </p>
              </div>
            ))}
          </div>
          <div className="mt-8 p-6 rounded-xl" style={{ backgroundColor: primaryBg }}>
            <p className="text-center font-medium" style={{ color: primaryColor }}>
              We also discuss your dog's lifestyle, diet, and behavior to ensure their daily care supports long-term health.
            </p>
          </div>
        </div>
      </section>

      {/* Why Wellness Exams Matter */}
      <section className="bg-white" style={{ paddingTop: '15px', paddingBottom: '15px' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">
            Why Wellness Exams Matter
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {wellnessBenefits.map((benefit, index) => (
              <div key={index} className="bg-gray-50 p-6 rounded-xl shadow-md text-center">
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

      {/* When to Schedule */}
      <section style={{ backgroundColor: '#f8f9fa', paddingTop: '15px', paddingBottom: '15px' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">
            When to Schedule an Exam
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {ageGroups.map((group, index) => (
              <div key={index} className={`p-6 rounded-xl shadow-md border-l-4 ${
                group.color === 'green' ? 'border-green-500 bg-green-50' :
                group.color === 'blue' ? 'border-blue-500 bg-blue-50' :
                'border-purple-500 bg-purple-50'
              }`}>
                <div className="flex items-center mb-4">
                  <group.icon className={`h-6 w-6 mr-3 ${
                    group.color === 'green' ? 'text-green-600' :
                    group.color === 'blue' ? 'text-blue-600' :
                    'text-purple-600'
                  }`} />
                  <h3 className={`text-lg font-semibold ${
                    group.color === 'green' ? 'text-green-900' :
                    group.color === 'blue' ? 'text-blue-900' :
                    'text-purple-900'
                  }`}>
                    {group.stage}
                  </h3>
                  <span className={`ml-auto px-2 py-1 text-xs font-medium rounded ${
                    group.color === 'green' ? 'bg-green-200 text-green-800' :
                    group.color === 'blue' ? 'bg-blue-200 text-blue-800' :
                    'bg-purple-200 text-purple-800'
                  }`}>
                    {group.timing}
                  </span>
                </div>
                <p className={`text-sm ${
                  group.color === 'green' ? 'text-green-800' :
                  group.color === 'blue' ? 'text-blue-800' :
                  'text-purple-800'
                }`}>
                  {group.schedule}
                </p>
              </div>
            ))}
          </div>
          <div className="mt-8 p-6 rounded-xl bg-amber-50 border-l-4 border-amber-500">
            <p className="text-amber-800 font-medium text-center">
              <strong>New Pet or Overdue for Care?</strong> If your dog is new to your home or hasn't had a wellness exam recently, 
              the best time to schedule one is now.
            </p>
          </div>
        </div>
      </section>

      {/* Beyond the Basics */}
      <section className="bg-white" style={{ paddingTop: '15px', paddingBottom: '15px' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">
            Beyond the Basics
          </h2>
          <p className="text-center text-gray-600 mb-8">
            Depending on exam findings, additional diagnostics may include:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {additionalDiagnostics.map((diagnostic, index) => (
              <div key={index} className="bg-gray-50 p-6 rounded-xl shadow-md border-l-4" style={{ borderColor: primaryColor }}>
                <div className="flex items-start">
                  <Stethoscope className="h-6 w-6 mr-4 flex-shrink-0 mt-1" style={{ color: primaryColor }} />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{diagnostic.test}</h3>
                    <p className="text-gray-600 text-sm">{diagnostic.purpose}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-8 p-6 rounded-xl" style={{ backgroundColor: primaryBg }}>
            <p className="text-center font-medium" style={{ color: primaryColor }}>
              These baseline tests help us track your dog's health over time, making it easier to spot and treat changes quickly.
            </p>
          </div>
        </div>
      </section>

      {/* The Bottom Line */}
      <section style={{ backgroundColor: '#f8f9fa', paddingTop: '15px', paddingBottom: '30px' }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            An Investment in Your Dog's Future
          </h2>
          <div className="p-8 rounded-xl" style={{ backgroundColor: primaryBg }}>
            <p className="text-gray-700 leading-relaxed mb-6" style={{ fontSize: '1rem' }}>
              Wellness exams are more than routine checkups—they're an investment in your dog's future. 
              By catching problems early, preventing disease, and providing personalized care, they help ensure 
              a longer, healthier, and happier life for your best friend.
            </p>
            <div className="bg-white p-6 rounded-lg">
              <div className="flex items-center justify-center mb-4">
                <Users className="h-8 w-8 mr-3" style={{ color: primaryColor }} />
                <h3 className="text-xl font-semibold text-gray-900">Comprehensive Preventive Care</h3>
              </div>
              <p className="text-gray-800 font-medium mb-4">
                Our experienced veterinary team provides thorough wellness examinations tailored to your dog's age, 
                breed, and lifestyle to ensure optimal health at every life stage.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <Heart className="h-6 w-6 mx-auto mb-2" style={{ color: primaryColor }} />
                  <p className="text-sm font-medium text-gray-700">Early Problem Detection</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <Shield className="h-6 w-6 mx-auto mb-2" style={{ color: primaryColor }} />
                  <p className="text-sm font-medium text-gray-700">Disease Prevention</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <TrendingUp className="h-6 w-6 mx-auto mb-2" style={{ color: primaryColor }} />
                  <p className="text-sm font-medium text-gray-700">Extended Lifespan</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section style={{ background: `linear-gradient(135deg, ${primaryColor} 0%, #2196c7 100%)`, paddingTop: '30px', paddingBottom: '30px' }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-bold text-white mb-6" style={{ fontSize: '1rem' }}>
            Schedule Your Dog's Wellness Examination
          </h2>
          <p className="mb-8" style={{ color: 'white', fontSize: '1rem' }}>
            Invest in your dog's long-term health with comprehensive preventive care—schedule your wellness exam today
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href={`tel:${currentBusinessInfo.phone}`}
              className="inline-flex items-center justify-center bg-white px-8 py-3 rounded-lg font-semibold transition-colors duration-200"
              style={{ color: primaryColor }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#f9fafb'}
              onMouseLeave={(e) => e.target.style.backgroundColor = 'white'}
            >
              <Phone className="mr-2 h-5 w-5" />
              Call Now: {currentBusinessInfo.phone}
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
              Schedule Wellness Exam
              <MapPin className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default DogWellnessExams;