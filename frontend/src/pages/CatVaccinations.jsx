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
  Calendar,
  Users,
  Home,
  Zap,
  Target,
  TrendingUp,
  Award
} from 'lucide-react';
import { hospitalInfo } from '../mock';

const CatVaccinations = () => {
  const primaryColor = '#29add3';
  const primaryLight = '#5bc0db';
  const primaryBg = '#e6f7fb';

  const coreVaccines = [
    {
      name: "FVRCP Vaccine",
      description: "Protects against feline viral rhinotracheitis, calicivirus, and panleukopenia",
      coverage: ["Upper respiratory infections", "Severe digestive issues", "Immune system suppression"],
      frequency: "Annual boosters",
      importance: "Essential for all cats",
      icon: Shield
    },
    {
      name: "Rabies Vaccine",
      description: "Prevents rabies, a fatal disease that can spread to humans",
      coverage: ["Neurological damage", "Fatal brain infection", "Zoonotic transmission"],
      frequency: "Every 1-3 years",
      importance: "Legally required",
      icon: AlertTriangle
    }
  ];

  const lifestyleVaccines = [
    {
      name: "Feline Leukemia (FeLV)",
      description: "Recommended for kittens and outdoor cats, provides protection against immune system damage",
      coverage: ["Immune system compromise", "Cancer development", "Secondary infections"],
      frequency: "Every 2 years for outdoor cats",
      importance: "Strongly recommended for outdoor/multi-cat households",
      icon: Heart
    }
  ];

  const scheduleData = [
    {
      ageGroup: "Kittens (6-16 weeks)",
      vaccines: [
        { name: "FVRCP", schedule: "Starting at 6-8 weeks, boosters every 3-4 weeks until 16 weeks", priority: "core" },
        { name: "Rabies", schedule: "Around 12 weeks", priority: "core" },
        { name: "FeLV", schedule: "At 12 and 16 weeks (for outdoor/multi-cat households)", priority: "lifestyle" }
      ]
    },
    {
      ageGroup: "Adult Cats",
      vaccines: [
        { name: "FVRCP", schedule: "Annually", priority: "core" },
        { name: "Rabies", schedule: "Every 1-3 years (depending on vaccine type)", priority: "core" },
        { name: "FeLV", schedule: "Every 2 years for outdoor cats", priority: "lifestyle" }
      ]
    }
  ];

  const riskFactors = [
    {
      risk: "Missed vaccines lower your cat's immunity",
      consequence: "Leaves them vulnerable to life-threatening infections",
      severity: "high"
    },
    {
      risk: "Gaps in vaccination schedules reduce effectiveness",
      consequence: "Protection diminishes over time without consistent boosters",
      severity: "medium"
    },
    {
      risk: "Some vaccines like rabies are legally required",
      consequence: "Non-compliance affects public health and pet safety",
      severity: "critical"
    }
  ];

  const benefits = [
    {
      benefit: "Disease Prevention",
      description: "Protection against dangerous and often fatal diseases",
      icon: Shield
    },
    {
      benefit: "Immune System Strengthening", 
      description: "Builds natural defenses against infections and illnesses",
      icon: TrendingUp
    },
    {
      benefit: "Peace of Mind",
      description: "Confidence that your cat is protected from preventable diseases",
      icon: Heart
    },
    {
      benefit: "Community Safety",
      description: "Helps prevent disease spread in the broader pet population",
      icon: Users
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section - Mobile Only */}
      <section className="text-white sticky z-40 block md:hidden" style={{ top: '4rem', background: `linear-gradient(135deg, ${primaryColor} 0%, #2196c7 100%)`, paddingTop: '0.5rem', paddingBottom: '0.5rem' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="font-bold" style={{ fontSize: '1.125rem' }}>
              Cat Vaccinations
            </h1>
          </div>
        </div>
      </section>

      {/* Introduction */}
      <section className="bg-white" style={{ paddingTop: '30px', paddingBottom: '30px' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
              Cat Vaccinations
            </h1>
            <p className="text-base text-gray-600 leading-relaxed max-w-4xl mx-auto">
              Vaccinations are one of the simplest, safest, and most effective ways to keep your cat healthy. 
              They protect against dangerous and often fatal diseases, strengthen your cat's immune system, and 
              provide peace of mind for you as a pet owner. At Pets & Vets Animal Hospital, we're here to guide 
              you through the essentials of cat vaccinations and why they are a cornerstone of preventive care.
            </p>
          </div>
        </div>
      </section>

      {/* Why Vaccinations Are Essential */}
      <section className="bg-gray-50" style={{ paddingTop: '30px', paddingBottom: '30px' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">
            Why Vaccinations Are Essential
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {benefits.map((benefit, index) => (
              <div key={index} className="bg-white p-6 rounded-xl shadow-md text-center">
                <div className="flex items-center justify-center w-16 h-16 rounded-full mx-auto mb-4" style={{ backgroundColor: primaryBg }}>
                  <benefit.icon className="h-8 w-8" style={{ color: primaryColor }} />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">{benefit.benefit}</h3>
                <p className="text-gray-600 text-sm">{benefit.description}</p>
              </div>
            ))}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-md border-l-4" style={{ borderColor: primaryColor }}>
              <div className="flex items-center mb-4">
                <Award className="h-6 w-6 mr-3" style={{ color: primaryColor }} />
                <h3 className="text-lg font-semibold text-gray-900">Core Protection</h3>
              </div>
              <p className="text-gray-600 text-sm">
                Every cat should receive the rabies vaccine and the FVRCP vaccine (feline viral rhinotracheitis, 
                calicivirus, and panleukopenia).
              </p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md border-l-4" style={{ borderColor: '#f59e0b' }}>
              <div className="flex items-center mb-4">
                <Target className="h-6 w-6 mr-3 text-amber-600" />
                <h3 className="text-lg font-semibold text-gray-900">Lifestyle Protection</h3>
              </div>
              <p className="text-gray-600 text-sm">
                The feline leukemia (FeLV) vaccine is strongly recommended for kittens and outdoor cats, 
                as even "indoor-only" cats can escape or be exposed unexpectedly.
              </p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md border-l-4" style={{ borderColor: '#10b981' }}>
              <div className="flex items-center mb-4">
                <Home className="h-6 w-6 mr-3 text-green-600" />
                <h3 className="text-lg font-semibold text-gray-900">Indoor Cats Need Vaccines Too</h3>
              </div>
              <p className="text-gray-600 text-sm">
                Diseases can still enter your home through open windows, other pets, or visitors.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Core Vaccines */}
      <section className="bg-white" style={{ paddingTop: '30px', paddingBottom: '30px' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">
            Core Vaccines - Essential for All Cats
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {coreVaccines.map((vaccine, index) => (
              <div key={index} className="bg-gray-50 p-6 rounded-xl shadow-md">
                <div className="flex items-center mb-4">
                  <vaccine.icon className="h-8 w-8 mr-4" style={{ color: primaryColor }} />
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">{vaccine.name}</h3>
                    <span className="px-3 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full">
                      {vaccine.importance}
                    </span>
                  </div>
                </div>
                <p className="text-gray-600 mb-4">{vaccine.description}</p>
                <div className="mb-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Protects Against:</h4>
                  <div className="grid grid-cols-1 gap-2">
                    {vaccine.coverage.map((condition, conditionIndex) => (
                      <div key={conditionIndex} className="flex items-center p-2 rounded-lg" style={{ backgroundColor: primaryBg }}>
                        <CheckCircle className="h-4 w-4 mr-2" style={{ color: primaryColor }} />
                        <span className="text-sm text-gray-700">{condition}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <p className="text-sm text-gray-600">
                  <strong>Frequency:</strong> {vaccine.frequency}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Lifestyle Vaccines */}
      <section className="bg-gray-50" style={{ paddingTop: '30px', paddingBottom: '30px' }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">
            Lifestyle Vaccines - Recommended Based on Risk
          </h2>
          {lifestyleVaccines.map((vaccine, index) => (
            <div key={index} className="bg-white p-6 rounded-xl shadow-md">
              <div className="flex items-center mb-4">
                <vaccine.icon className="h-8 w-8 mr-4" style={{ color: primaryColor }} />
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">{vaccine.name}</h3>
                  <span className="px-3 py-1 bg-amber-100 text-amber-800 text-xs font-medium rounded-full">
                    {vaccine.importance}
                  </span>
                </div>
              </div>
              <p className="text-gray-600 mb-4">{vaccine.description}</p>
              <div className="mb-4">
                <h4 className="font-semibold text-gray-900 mb-2">Protects Against:</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  {vaccine.coverage.map((condition, conditionIndex) => (
                    <div key={conditionIndex} className="flex items-center p-2 rounded-lg" style={{ backgroundColor: primaryBg }}>
                      <CheckCircle className="h-4 w-4 mr-2" style={{ color: primaryColor }} />
                      <span className="text-sm text-gray-700">{condition}</span>
                    </div>
                  ))}
                </div>
              </div>
              <p className="text-sm text-gray-600">
                <strong>Frequency:</strong> {vaccine.frequency}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Vaccination Schedules */}
      <section className="bg-white" style={{ paddingTop: '30px', paddingBottom: '30px' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">
            Vaccination Schedules
          </h2>
          <p className="text-center text-gray-600 mb-8">
            Regular veterinary visits ensure your cat stays on track and protected.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {scheduleData.map((schedule, index) => (
              <div key={index} className="bg-gray-50 p-6 rounded-xl shadow-md">
                <div className="flex items-center mb-6">
                  <Calendar className="h-6 w-6 mr-3" style={{ color: primaryColor }} />
                  <h3 className="text-xl font-semibold text-gray-900">{schedule.ageGroup}</h3>
                </div>
                <div className="space-y-4">
                  {schedule.vaccines.map((vaccine, vaccineIndex) => (
                    <div key={vaccineIndex} className="border-l-4 pl-4" style={{ borderColor: vaccine.priority === 'core' ? primaryColor : '#f59e0b' }}>
                      <div className="flex items-center mb-2">
                        <h4 className="font-semibold text-gray-900">{vaccine.name}</h4>
                        <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${
                          vaccine.priority === 'core' ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {vaccine.priority}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">{vaccine.schedule}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Risks vs. Rewards */}
      <section className="bg-gray-50" style={{ paddingTop: '30px', paddingBottom: '30px' }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">
            Risks vs. Rewards
          </h2>
          <div className="bg-white p-8 rounded-xl shadow-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <div className="flex items-center mb-4">
                  <Activity className="h-6 w-6 mr-3 text-green-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Safety Profile</h3>
                </div>
                <p className="text-gray-600 mb-4">
                  Modern vaccines are very safe. The most common side effects are mild—temporary lethargy, 
                  soreness at the injection site, or a reduced appetite.
                </p>
                <p className="text-gray-600">
                  Severe reactions, such as swelling or allergic responses, are rare.
                </p>
              </div>
              <div>
                <div className="flex items-center mb-4">
                  <Shield className="h-6 w-6 mr-3" style={{ color: primaryColor }} />
                  <h3 className="text-lg font-semibold text-gray-900">Overwhelming Benefits</h3>
                </div>
                <p className="text-gray-600 mb-4">
                  The benefits of protection from life-threatening diseases far outweigh the minimal risks.
                </p>
                <p className="font-medium" style={{ color: primaryColor }}>
                  Prevention is always better than treatment.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* The Danger of Skipping Vaccines */}
      <section className="bg-white" style={{ paddingTop: '30px', paddingBottom: '30px' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">
            The Danger of Skipping Vaccines
          </h2>
          <div className="space-y-4">
            {riskFactors.map((risk, index) => (
              <div key={index} className={`p-6 rounded-xl border-l-4 ${
                risk.severity === 'critical' ? 'border-red-500 bg-red-50' :
                risk.severity === 'high' ? 'border-orange-500 bg-orange-50' :
                'border-yellow-500 bg-yellow-50'
              }`}>
                <div className="flex items-start">
                  <AlertTriangle className={`h-5 w-5 mr-3 flex-shrink-0 mt-0.5 ${
                    risk.severity === 'critical' ? 'text-red-500' :
                    risk.severity === 'high' ? 'text-orange-500' :
                    'text-yellow-500'
                  }`} />
                  <div>
                    <p className={`font-medium mb-2 ${
                      risk.severity === 'critical' ? 'text-red-900' :
                      risk.severity === 'high' ? 'text-orange-900' :
                      'text-yellow-900'
                    }`}>
                      {risk.risk}
                    </p>
                    <p className={`text-sm ${
                      risk.severity === 'critical' ? 'text-red-700' :
                      risk.severity === 'high' ? 'text-orange-700' :
                      'text-yellow-700'
                    }`}>
                      {risk.consequence}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* The Bottom Line */}
      <section className="bg-gray-50" style={{ paddingTop: '30px', paddingBottom: '30px' }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            The Bottom Line: Essential Preventive Care
          </h2>
          <div className="p-8 rounded-xl" style={{ backgroundColor: primaryBg }}>
            <div className="mb-6">
              <img 
                src="https://images.pexels.com/photos/6816857/pexels-photo-6816857.jpeg"
                alt="Veterinary professional providing cat care"
                className="w-full max-w-md h-48 object-cover rounded-lg shadow-md mx-auto"
              />
            </div>
            <p className="text-gray-700 leading-relaxed mb-6 text-lg">
              Vaccinating your cat is not optional—it's an essential part of responsible pet ownership. 
              Whether your cat spends their days exploring outside or lounging indoors, vaccines safeguard 
              them from illness and support a long, healthy life.
            </p>
            <div className="bg-white p-6 rounded-lg">
              <p className="text-gray-800 font-semibold">
                A small step now means years of protection for your feline companion.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section style={{ background: `linear-gradient(135deg, ${primaryColor} 0%, #2196c7 100%)`, paddingTop: '30px', paddingBottom: '30px' }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-bold text-white mb-4" style={{ fontSize: '1rem' }}>
            Schedule Your Cat's Vaccinations Today
          </h2>
          <p className="mb-8" style={{ color: 'white', fontSize: '1rem' }}>
            Protect your feline companion with essential vaccines—schedule your appointment today
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
              Schedule Vaccination Appointment
              <MapPin className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default CatVaccinations;