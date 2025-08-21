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
  PlusCircle,
  Thermometer,
  Siren,
  Truck,
  Leaf,
  Bug,
  Gauge,
  Smile,
  Frown,
  Wind,
  Star,
  Navigation
} from 'lucide-react';
import { hospitalInfo } from '../mock';

const UrgentCare = () => {
  const primaryColor = '#29add3';
  const primaryLight = '#5bc0db';
  const primaryBg = '#e6f7fb';
  const urgentColor = '#dc2626';

  const petIllnesses = [
    {
      service: "Diarrhea & Vomiting",
      description: "Immediate evaluation and relief for GI distress",
      icon: Droplets,
      color: "#ef4444"
    },
    {
      service: "Loss of Appetite or Hydration Issues",
      description: "Diagnosis and supportive therapies like IV fluids",
      icon: Utensils,
      color: "#f59e0b"
    },
    {
      service: "Poison or Toxin Exposure",
      description: "Rapid treatment including safe induced vomiting and detox protocols",
      icon: AlertTriangle,
      color: "#dc2626"
    },
    {
      service: "Skin Allergies, Itching, Rashes, Hot Spots",
      description: "Soothing remedies to end discomfort",
      icon: Bug,
      color: "#10b981"
    },
    {
      service: "Upper Respiratory Infections, Coughing & Sneezing",
      description: "Diagnostics and treatment plans tailored to breed and symptoms",
      icon: Lungs,
      color: "#6366f1"
    },
    {
      service: "Urinary Concerns",
      description: "Evaluation and care for straining, blood, or frequent attempts",
      icon: CircleDot,
      color: "#8b5cf6"
    },
    {
      service: "Ear Infections",
      description: "Comprehensive ear cleaning, testing, and medication to end irritation",
      icon: Ear,
      color: "#ec4899"
    }
  ];

  const petInjuries = [
    {
      service: "Abscesses",
      description: "Draining and treating painful infections",
      icon: Target,
      color: "#ef4444"
    },
    {
      service: "Back or Muscle Pain",
      description: "Diagnostics and comfort measures for strains or disc issues",
      icon: Activity,
      color: "#f59e0b"
    },
    {
      service: "Vaccine Reactions",
      description: "Immediate response to adverse symptoms",
      icon: Shield,
      color: "#10b981"
    },
    {
      service: "Bites, Stings & Wounds",
      description: "Cleaning, antibiotics, and pain support to prevent complications",
      icon: Bandage,
      color: "#8b5cf6"
    }
  ];

  const behavioralIssues = [
    {
      service: "Allergic Reactions",
      description: "Treatment for hives, facial swelling, and itching",
      icon: AlertTriangle,
      color: "#dc2626"
    },
    {
      service: "Anal Gland Issues",
      description: "Relief from scooting, licking, and discomfort",
      icon: CircleDot,
      color: "#f59e0b"
    },
    {
      service: "Anxiety & Motion Sickness",
      description: "Calming techniques and temporary support to ease travel stress",
      icon: Heart,
      color: "#10b981"
    },
    {
      service: "Bad Breath or Oral Discomfort",
      description: "Quick oral health checkups and treatment for underlying issues",
      icon: Smile,
      color: "#6366f1"
    }
  ];

  const processSteps = [
    {
      step: "Walk-In or Save Your Spot Online",
      description: "Flexible scheduling—no appointment needed; just walk in or use our online spot-saving tool",
      icon: Calendar,
      number: "01"
    },
    {
      step: "Fast, Gentle Care",
      description: "Escorted directly to a calm, Fear-Free certified exam room where our team listens and acts quickly",
      icon: Heart,
      number: "02"
    },
    {
      step: "Tailored Treatment, Clear Plan",
      description: "Diagnose, treat, and develop a clear plan, then share medical records with your regular vet",
      icon: FileText,
      number: "03"
    }
  ];

  const whyChooseUs = [
    {
      feature: "No-Appointment Needed",
      description: "Convenient help when you need it most",
      icon: Clock
    },
    {
      feature: "Fear-Free Certified Team",
      description: "Minimizing stress for scared or anxious pets",
      icon: Heart
    },
    {
      feature: "Transparent Care",
      description: "Clear pricing, clear plans, and seamless handoff to your primary vet",
      icon: Eye
    },
    {
      feature: "365 Days a Year",
      description: "Open every day to serve your urgent pet care needs",
      icon: Calendar
    }
  ];

  const notTreated = [
    "Severe trauma (e.g., hit-by-car incidents)",
    "Surgeries requiring amputation",
    "Overnight hospitalization or intensive care cases"
  ];

  const serviceAreas = [
    "South Riding", "Aldie", "Ashburn", "Chantilly", "Centreville", "Reston", "Herndon"
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section - Mobile Only */}
      <section className="text-white sticky z-40 block md:hidden" style={{ top: '4rem', background: `linear-gradient(135deg, ${urgentColor} 0%, #b91c1c 100%)`, paddingTop: '0.5rem', paddingBottom: '0.5rem' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center flex items-center justify-center">
            <Siren className="h-5 w-5 mr-2" />
            <h1 className="font-bold" style={{ fontSize: '1.125rem' }}>
              Urgent Care Services
            </h1>
          </div>
        </div>
      </section>

      {/* Introduction */}
      <section className="bg-white" style={{ paddingTop: '30px', paddingBottom: '30px' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h1 className="text-xl md:text-2xl font-bold text-gray-900 mb-4">
              Urgent Care at Pets and Vets Animal Hospital
            </h1>
            <p className="text-base text-gray-600 leading-relaxed max-w-4xl mx-auto mb-4">
              When your pet needs care—not just quickly, but right away—our Urgent Veterinary Services deliver 
              fast, compassionate relief when your regular vet is closed or unavailable. At Pets and Vets Animal 
              Hospital, we treat your family pets with the expertise and empathy they deserve.
            </p>
            <p className="text-base font-medium" style={{ color: primaryColor }}>
              Serving South Riding, Aldie, Ashburn, Chantilly, Centreville, Reston, and Herndon
            </p>
          </div>
          
          {/* Professional Image */}
          <div className="mt-8 flex justify-center">
            <div className="relative max-w-2xl">
              <img 
                src="https://images.pexels.com/photos/6809635/pexels-photo-6809635.jpeg"
                alt="Professional veterinary urgent care medical icons and equipment"
                className="w-full h-64 object-cover rounded-xl shadow-lg"
              />
              <div className="absolute inset-0 bg-black bg-opacity-10 rounded-xl"></div>
            </div>
          </div>
        </div>
      </section>

      {/* What We Treat Header */}
      <section className="bg-gray-50" style={{ paddingTop: '30px', paddingBottom: '30px' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              What We Treat — Fast, Effective, Compassionate Care
            </h2>
            <p className="text-gray-600 max-w-3xl mx-auto">
              Our urgent care services cover a wide range of conditions that need immediate attention but don't 
              require emergency surgery or overnight hospitalization.
            </p>
          </div>

          {/* Pet Illnesses & Discomfort */}
          <div className="mb-16">
            <h3 className="text-lg font-bold text-gray-900 mb-8 text-center">Pet Illnesses & Discomfort</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {petIllnesses.map((illness, index) => (
                <div key={index} className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow">
                  <div className="flex items-center mb-4">
                    <div className="flex items-center justify-center w-12 h-12 rounded-full mr-4" style={{ backgroundColor: `${illness.color}15` }}>
                      <illness.icon className="h-6 w-6" style={{ color: illness.color }} />
                    </div>
                    <h4 className="text-lg font-semibold text-gray-900">{illness.service}</h4>
                  </div>
                  <p className="text-gray-600 text-sm leading-relaxed">{illness.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Pet Injuries & Acute Issues */}
          <div className="mb-16">
            <h3 className="text-lg font-bold text-gray-900 mb-8 text-center">Pet Injuries & Acute Issues</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {petInjuries.map((injury, index) => (
                <div key={index} className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow">
                  <div className="flex items-center mb-4">
                    <div className="flex items-center justify-center w-12 h-12 rounded-full mr-4" style={{ backgroundColor: `${injury.color}15` }}>
                      <injury.icon className="h-6 w-6" style={{ color: injury.color }} />
                    </div>
                    <h4 className="text-lg font-semibold text-gray-900">{injury.service}</h4>
                  </div>
                  <p className="text-gray-600 text-sm leading-relaxed">{injury.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* When Pets Just Don't Seem Right */}
          <div className="mb-16">
            <h3 className="text-lg font-bold text-gray-900 mb-8 text-center">When Pets Just Don't Seem Right</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {behavioralIssues.map((issue, index) => (
                <div key={index} className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow">
                  <div className="flex items-center mb-4">
                    <div className="flex items-center justify-center w-12 h-12 rounded-full mr-4" style={{ backgroundColor: `${issue.color}15` }}>
                      <issue.icon className="h-6 w-6" style={{ color: issue.color }} />
                    </div>
                    <h4 className="text-lg font-semibold text-gray-900">{issue.service}</h4>
                  </div>
                  <p className="text-gray-600 text-sm leading-relaxed">{issue.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* End-of-Life Support */}
          <div className="mb-16">
            <h3 className="text-lg font-bold text-gray-900 mb-8 text-center">End-of-Life Support</h3>
            <div className="max-w-4xl mx-auto">
              <div className="bg-white p-8 rounded-xl shadow-md">
                <div className="flex items-center mb-4">
                  <div className="flex items-center justify-center w-12 h-12 rounded-full mr-4" style={{ backgroundColor: `${primaryColor}15` }}>
                    <Heart className="h-6 w-6" style={{ color: primaryColor }} />
                  </div>
                  <h4 className="text-xl font-semibold text-gray-900">Compassionate End-of-Life Care</h4>
                </div>
                <p className="text-gray-700 leading-relaxed">
                  We offer peaceful, compassionate end-of-life care when the time comes, ensuring you and your pet 
                  have the dignity and support you both deserve. Our team provides gentle, respectful services during 
                  this difficult time.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What We Do Not Treat */}
      <section className="bg-white" style={{ paddingTop: '30px', paddingBottom: '30px' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl font-bold text-gray-900 mb-8 text-center">
            What We Do Not Treat
          </h2>
          <div className="max-w-4xl mx-auto">
            <div className="bg-amber-50 p-8 rounded-xl border-l-4 border-amber-500">
              <div className="flex items-center mb-4">
                <AlertTriangle className="h-6 w-6 mr-3 text-amber-600" />
                <h3 className="text-lg font-semibold text-amber-900">Specialized Care Referrals</h3>
              </div>
              <p className="text-amber-800 mb-4">
                While we excel at urgent care, certain conditions are better managed by specialized ER teams or your primary veterinarian:
              </p>
              <div className="space-y-2">
                {notTreated.map((condition, index) => (
                  <div key={index} className="flex items-center">
                    <XCircle className="h-4 w-4 mr-2 text-amber-600 flex-shrink-0" />
                    <span className="text-amber-800">{condition}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-gray-50" style={{ paddingTop: '30px', paddingBottom: '30px' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl font-bold text-gray-900 mb-8 text-center">
            How It Works: The Urgent Care Experience
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {processSteps.map((step, index) => (
              <div key={index} className="bg-white p-8 rounded-xl shadow-md text-center relative">
                <div className="absolute top-4 right-4 w-8 h-8 rounded-full text-white text-sm font-bold flex items-center justify-center" style={{ backgroundColor: primaryColor }}>
                  {step.number}
                </div>
                <div className="flex items-center justify-center w-16 h-16 rounded-full mx-auto mb-6" style={{ backgroundColor: primaryBg }}>
                  <step.icon className="h-8 w-8" style={{ color: primaryColor }} />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">{step.step}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>
          
          {/* Professional Image */}
          <div className="mt-12 flex justify-center">
            <div className="relative max-w-2xl">
              <img 
                src="https://images.pexels.com/photos/6809640/pexels-photo-6809640.jpeg"
                alt="Professional veterinary urgent care process and medical equipment"
                className="w-full h-64 object-cover rounded-xl shadow-lg"
              />
              <div className="absolute inset-0 bg-black bg-opacity-10 rounded-xl"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="bg-white" style={{ paddingTop: '30px', paddingBottom: '30px' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl font-bold text-gray-900 mb-8 text-center">
            Why Choose Pets and Vets for Urgent Care?
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

      {/* Urgent Care Hours */}
      <section className="bg-gray-50" style={{ paddingTop: '30px', paddingBottom: '30px' }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            Urgent Care Hours
          </h2>
          <div className="bg-white p-8 rounded-xl shadow-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Weekdays</h3>
                <p className="text-2xl font-bold mb-2" style={{ color: primaryColor }}>3 PM - 10 PM</p>
                <p className="text-sm text-gray-600">Monday - Friday</p>
                <p className="text-sm text-red-600 font-medium">Thursday: Closed</p>
              </div>
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Weekends</h3>
                <p className="text-2xl font-bold mb-2" style={{ color: primaryColor }}>Saturday: 10 AM - 8 PM</p>
                <p className="text-2xl font-bold mb-2" style={{ color: primaryColor }}>Sunday: 10 AM - 6 PM</p>
              </div>
            </div>
            <div className="border-t border-gray-200 pt-4">
              <p className="text-sm font-medium" style={{ color: primaryColor }}>
                By Appointment Only • 365 Days a Year
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
            Providing urgent veterinary care across:
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

      {/* Emergency CTA */}
      <section style={{ background: `linear-gradient(135deg, ${urgentColor} 0%, #b91c1c 100%)`, paddingTop: '30px', paddingBottom: '30px' }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center mb-4">
            <Siren className="h-8 w-8 mr-3 text-white" />
            <h2 className="font-bold text-white text-xl">
              Ready to Help Your Pet Feel Better — Right Now
            </h2>
          </div>
          <p className="mb-8 text-white text-lg">
            If your pet is sick, injured, or just not acting like themselves, we're here to help
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href={`tel:${hospitalInfo.phone}`}
              className="inline-flex items-center justify-center bg-white px-8 py-4 rounded-lg font-bold text-lg transition-colors duration-200"
              style={{ color: urgentColor }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#f9fafb'}
              onMouseLeave={(e) => e.target.style.backgroundColor = 'white'}
            >
              <Phone className="mr-2 h-6 w-6" />
              CALL NOW: {hospitalInfo.phone}
            </a>
            <Link
              to="/contact"
              className="inline-flex items-center justify-center border-2 border-white text-white px-8 py-4 rounded-lg font-semibold transition-colors duration-200"
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = 'white';
                e.target.style.color = urgentColor;
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'transparent';  
                e.target.style.color = 'white';
              }}
            >
              Check In Online
              <Navigation className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default UrgentCare;