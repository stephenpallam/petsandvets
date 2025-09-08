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
  Users,
  DollarSign,
  FileText,
  Target,
  Calendar,
  Award
} from 'lucide-react';
import { hospitalInfo } from '../mock';
import { useBusinessInfo } from '../hooks/useBusinessInfo';

const DogVaccinations = () => {
  const { businessInfo: currentBusinessInfo } = useBusinessInfo();
  const primaryColor = '#29add3';
  const primaryLight = '#5bc0db';
  const primaryBg = '#e6f7fb';

  const vaccineImportance = [
    {
      title: "Protection for Your Dog",
      description: "Prevents serious illnesses like parvovirus, distemper, and rabies",
      icon: Shield
    },
    {
      title: "Community Safety", 
      description: "Reduces the spread of contagious and zoonotic diseases that can affect other pets and people",
      icon: Users
    },
    {
      title: "Cost Savings",
      description: "Prevents expensive treatments and lengthy quarantines for diseases that could have been avoided",
      icon: DollarSign
    },
    {
      title: "Legal & Lifestyle Requirements",
      description: "Rabies vaccines are required by law, and most boarding, daycare, and travel services require up-to-date vaccinations",
      icon: FileText
    },
    {
      title: "Tailored Care",
      description: "Veterinarians recommend vaccines based on your dog's age, breed, health, and lifestyle—ensuring the right protection",
      icon: Target
    }
  ];

  const coreVaccines = [
    {
      name: "Distemper",
      description: "Protects against a highly contagious viral disease affecting respiratory, gastrointestinal, and nervous systems"
    },
    {
      name: "Adenovirus",
      description: "Prevents infectious canine hepatitis and respiratory infections"
    },
    {
      name: "Parvovirus",
      description: "Guards against severe gastrointestinal disease that is often fatal in puppies"
    },
    {
      name: "Parainfluenza",
      description: "Helps prevent respiratory infections and kennel cough complex"
    },
    {
      name: "Rabies",
      description: "Essential protection against fatal neurological disease transmissible to humans"
    }
  ];

  const nonCoreVaccines = [
    {
      name: "Bordetella (Kennel Cough)",
      description: "Recommended for dogs who board, attend daycare, or frequent dog parks",
      risk: "High social exposure"
    },
    {
      name: "Leptospirosis",
      description: "Important for dogs exposed to wildlife, standing water, or urban environments",
      risk: "Environmental exposure"
    },
    {
      name: "Lyme Disease",
      description: "Essential in tick-endemic areas and for dogs who spend time outdoors",
      risk: "Geographic/outdoor risk"
    },
    {
      name: "Canine Influenza",
      description: "Valuable for dogs in high-density social environments or boarding facilities",
      risk: "Social/boarding risk"
    }
  ];

  const vaccineRisks = [
    {
      disease: "Parvovirus",
      symptoms: "Severe vomiting, diarrhea, dehydration—often fatal in puppies",
      severity: "critical"
    },
    {
      disease: "Distemper",
      symptoms: "Pneumonia, seizures, brain disease—progressive and often fatal",
      severity: "critical"
    },
    {
      disease: "Leptospirosis",
      symptoms: "Kidney and liver damage—can be transmitted to humans",
      severity: "serious"
    },
    {
      disease: "Rabies",
      symptoms: "Fatal neurological disease in animals and humans—100% fatal once symptoms appear",
      severity: "fatal"
    }
  ];

  const scheduleInfo = [
    {
      stage: "Puppies (6-16 weeks)",
      schedule: "Begin at 6–8 weeks, boosters every 3–4 weeks until 16 weeks old",
      icon: Heart
    },
    {
      stage: "Adult Dogs",
      schedule: "Maintain regular boosters as advised by your veterinarian",
      icon: Calendar
    },
    {
      stage: "Annual Checkups",
      schedule: "Ensure your dog stays current with required and recommended vaccines",
      icon: CheckCircle
    },
    {
      stage: "Lifestyle Considerations",
      schedule: "Dogs who board, swim in lakes, or frequent dog parks may need additional vaccines",
      icon: Activity
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section - Mobile Only */}
      <section className="text-white sticky z-40 block md:hidden" style={{ top: '4rem', background: `linear-gradient(135deg, ${primaryColor} 0%, #2196c7 100%)`, paddingTop: '0.5rem', paddingBottom: '0.5rem' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="font-bold" style={{ fontSize: '1.125rem' }}>
              Dog Vaccinations
            </h1>
          </div>
        </div>
      </section>

      {/* Hero Section */}
      <section className="bg-white">
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center" style={{ paddingTop: '30px', paddingBottom: '15px' }}>
          <h1 className="text-xl font-bold text-gray-900 mb-6">
            Dog Vaccinations
          </h1>
          <div className="mb-6">
            <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold text-white" style={{ backgroundColor: primaryColor }}>
              Protecting Your Dog's Future
            </span>
          </div>
          <p className="text-base text-gray-600 leading-relaxed max-w-3xl mx-auto">
            Vaccines are one of the most important tools in keeping your dog healthy. They strengthen the immune system, 
            protect against life-threatening diseases, and help your pet live a longer, happier life. By introducing a safe, 
            weakened form of disease, vaccines train your dog's body to recognize and fight infections before they cause harm.
          </p>
        </div>
      </section>

      {/* Why Vaccines Matter */}
      <section style={{ backgroundColor: '#f8f9fa', paddingTop: '30px', paddingBottom: '15px' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">
            Why Vaccines Matter
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {vaccineImportance.map((item, index) => (
              <div key={index} className="bg-white p-6 rounded-xl shadow-md">
                <div className="flex items-center mb-4">
                  <item.icon className="h-6 w-6 mr-3" style={{ color: primaryColor }} />
                  <h3 className="text-lg font-semibold text-gray-900">{item.title}</h3>
                </div>
                <p className="text-gray-600 text-sm">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Types of Vaccines */}
      <section className="bg-white" style={{ paddingTop: '15px', paddingBottom: '15px' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl font-bold text-gray-900 mb-8 text-center">
            Types of Dog Vaccines
          </h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Core Vaccines */}
            <div>
              <div className="flex items-center mb-6">
                <Award className="h-6 w-6 mr-3" style={{ color: primaryColor }} />
                <h3 className="text-xl font-semibold text-gray-900">Core Vaccines</h3>
                <span className="ml-3 px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">
                  Essential for All Dogs
                </span>
              </div>
              <div className="space-y-4">
                {coreVaccines.map((vaccine, index) => (
                  <div key={index} className="p-4 rounded-lg border-l-4 border-green-500 bg-green-50">
                    <h4 className="font-semibold text-green-900 mb-2">{vaccine.name}</h4>
                    <p className="text-green-800 text-sm">{vaccine.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Non-Core Vaccines */}
            <div>
              <div className="flex items-center mb-6">
                <Target className="h-6 w-6 mr-3" style={{ color: primaryColor }} />
                <h3 className="text-xl font-semibold text-gray-900">Non-Core Vaccines</h3>
                <span className="ml-3 px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                  Lifestyle-Dependent
                </span>
              </div>
              <div className="space-y-4">
                {nonCoreVaccines.map((vaccine, index) => (
                  <div key={index} className="p-4 rounded-lg border-l-4 border-blue-500 bg-blue-50">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold text-blue-900">{vaccine.name}</h4>
                      <span className="text-xs text-blue-700 bg-blue-200 px-2 py-1 rounded">
                        {vaccine.risk}
                      </span>
                    </div>
                    <p className="text-blue-800 text-sm">{vaccine.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-8 p-6 rounded-xl" style={{ backgroundColor: primaryBg }}>
            <p className="text-center font-medium" style={{ color: primaryColor }}>
              Your veterinarian will design a schedule that balances core protection with your dog's unique risk factors and lifestyle needs.
            </p>
          </div>
        </div>
      </section>

      {/* Risks of Skipping Vaccines */}
      <section style={{ backgroundColor: '#f8f9fa', paddingTop: '15px', paddingBottom: '15px' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">
            The Risks of Skipping Vaccines
          </h2>
          <p className="text-center text-gray-600 mb-8">
            Not vaccinating exposes dogs to painful, often fatal diseases:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {vaccineRisks.map((risk, index) => (
              <div key={index} className={`p-6 rounded-xl border-l-4 ${
                risk.severity === 'fatal' ? 'border-red-600 bg-red-50' :
                risk.severity === 'critical' ? 'border-red-500 bg-red-50' :
                'border-orange-500 bg-orange-50'
              }`}>
                <div className="flex items-center mb-3">
                  <AlertTriangle className={`h-5 w-5 mr-3 ${
                    risk.severity === 'fatal' ? 'text-red-600' :
                    risk.severity === 'critical' ? 'text-red-500' :
                    'text-orange-500'
                  }`} />
                  <h3 className={`font-semibold ${
                    risk.severity === 'fatal' ? 'text-red-900' :
                    risk.severity === 'critical' ? 'text-red-900' :
                    'text-orange-900'
                  }`}>
                    {risk.disease}
                  </h3>
                  <span className={`ml-auto px-2 py-1 text-xs font-medium rounded ${
                    risk.severity === 'fatal' ? 'bg-red-200 text-red-800' :
                    risk.severity === 'critical' ? 'bg-red-200 text-red-800' :
                    'bg-orange-200 text-orange-800'
                  }`}>
                    {risk.severity.toUpperCase()}
                  </span>
                </div>
                <p className={`text-sm ${
                  risk.severity === 'fatal' ? 'text-red-800' :
                  risk.severity === 'critical' ? 'text-red-800' :
                  'text-orange-800'
                }`}>
                  {risk.symptoms}
                </p>
              </div>
            ))}
          </div>
          <div className="mt-8 p-6 rounded-xl bg-amber-50 border-l-4 border-amber-500">
            <p className="text-amber-800 font-medium text-center">
              <strong>Additional Consequences:</strong> Skipping required vaccines can result in legal consequences 
              and restrictions on boarding, travel, or daycare services.
            </p>
          </div>
        </div>
      </section>

      {/* Vaccination Schedule */}
      <section className="bg-white" style={{ paddingTop: '15px', paddingBottom: '15px' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">
            Vaccination Schedule & Tips for Owners
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {scheduleInfo.map((info, index) => (
              <div key={index} className="bg-gray-50 p-6 rounded-xl shadow-md text-center">
                <div className="flex items-center justify-center w-16 h-16 rounded-full mx-auto mb-4" style={{ backgroundColor: primaryBg }}>
                  <info.icon className="h-8 w-8" style={{ color: primaryColor }} />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">{info.stage}</h3>
                <p className="text-gray-600 text-sm">{info.schedule}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final Word */}
      <section style={{ backgroundColor: '#f8f9fa', paddingTop: '15px', paddingBottom: '30px' }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            Simple, Safe, and Cost-Effective Protection
          </h2>
          <div className="p-8 rounded-xl" style={{ backgroundColor: primaryBg }}>
            <p className="text-gray-700 leading-relaxed mb-6" style={{ fontSize: '1rem' }}>
              Vaccines are a simple, safe, and cost-effective way to protect your dog from devastating diseases. 
              They not only safeguard your pet's health but also protect your family, other animals, and the community.
            </p>
            <div className="bg-white p-6 rounded-lg">
              <p className="text-gray-800 font-semibold mb-4">
                At Pets & Vets Animal Hospital, we create personalized vaccination plans so your dog stays safe, 
                strong, and protected for life.
              </p>
              <p className="text-gray-700">
                Our experienced veterinary team will work with you to determine the right vaccination schedule 
                based on your dog's age, health status, lifestyle, and risk factors.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section style={{ background: `linear-gradient(135deg, ${primaryColor} 0%, #2196c7 100%)`, paddingTop: '30px', paddingBottom: '30px' }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-bold text-white mb-6" style={{ fontSize: '1rem' }}>
            Schedule Your Dog's Vaccination Appointment
          </h2>
          <p className="mb-8" style={{ color: 'white', fontSize: '1rem' }}>
            Protect your dog with personalized vaccination plans—call us today to keep your pet safe and healthy
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
              Schedule Vaccination
              <MapPin className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default DogVaccinations;