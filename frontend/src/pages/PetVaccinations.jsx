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
  Award,
  Stethoscope,
  Target,
  TrendingUp,
  Zap,
  Eye,
  Home
} from 'lucide-react';
import { hospitalInfo } from '../mock';

const PetVaccinations = () => {
  const primaryColor = '#29add3';
  const primaryLight = '#5bc0db';
  const primaryBg = '#e6f7fb';

  const vaccineBenefits = [
    {
      benefit: "Disease Protection",
      description: "Protect pets from life-threatening diseases like rabies, distemper, and parvovirus",
      icon: Shield,
      highlight: "Lifesaving prevention"
    },
    {
      benefit: "Community Health",
      description: "Prevent the spread of contagious illnesses between pets and even to humans",
      icon: Users,
      highlight: "Public health safety"
    },
    {
      benefit: "Cost Savings",
      description: "Save on costly treatments for preventable conditions",
      icon: TrendingUp,
      highlight: "Financial protection"
    },
    {
      benefit: "Compliance & Access",
      description: "Meet legal requirements for rabies and boarding/daycare facilities",
      icon: Award,
      highlight: "Legal compliance"
    },
    {
      benefit: "Long-term Wellness",
      description: "Support your pet's long-term wellness and quality of life",
      icon: Heart,
      highlight: "Lifelong health"
    }
  ];

  const coreVaccinesDogs = [
    { name: "Rabies", description: "Fatal viral disease affecting the nervous system" },
    { name: "Canine Distemper Virus (CDV)", description: "Highly contagious viral disease" },
    { name: "Canine Parvovirus (CPV)", description: "Severe intestinal infection" },
    { name: "Canine Adenovirus (CAV)", description: "Respiratory and liver disease" }
  ];

  const coreVaccinesCats = [
    { name: "Rabies", description: "Fatal viral disease affecting the nervous system" },
    { name: "Feline Panleukopenia (FPL)", description: "Highly contagious and often fatal" },
    { name: "Feline Calicivirus (FCV)", description: "Upper respiratory infection" },
    { name: "Feline Herpesvirus-1 (FHV-1)", description: "Respiratory and eye infections" }
  ];

  const nonCoreVaccinesDogs = [
    { name: "Bordetella", description: "Kennel cough prevention" },
    { name: "Lyme Disease", description: "Tick-borne bacterial infection" },
    { name: "Leptospirosis", description: "Bacterial infection affecting kidneys and liver" },
    { name: "Canine Influenza Virus (CIV)", description: "Respiratory infection" },
    { name: "Canine Parainfluenza Virus (CPiV)", description: "Upper respiratory infection" }
  ];

  const nonCoreVaccinesCats = [
    { name: "Feline Leukemia Virus (FeLV)", description: "Immune system suppression" },
    { name: "Feline Immunodeficiency Virus (FIV)", description: "Immune system disorder" },
    { name: "Bordetella", description: "Upper respiratory infection" },
    { name: "Chlamydophila felis", description: "Eye and respiratory infection" }
  ];

  const scheduleData = [
    {
      ageGroup: "Puppies & Kittens",
      timeline: "6-16 weeks",
      details: [
        "Begin vaccines at 6–8 weeks of age",
        "Boosters every 3–4 weeks until 16 weeks",
        "Rabies vaccine typically given around 12 weeks",
        "FeLV strongly recommended for kittens during their series"
      ]
    },
    {
      ageGroup: "Adult Dogs & Cats",
      timeline: "Ongoing",
      details: [
        "Annual or tri-annual core vaccines, depending on the vaccine type",
        "Non-core vaccines as recommended by your vet",
        "Ongoing assessments during wellness exams to adjust schedules"
      ]
    }
  ];

  const careFeatures = [
    {
      title: "Quick & Gentle",
      description: "Keeping stress low for both pets and owners with efficient, gentle procedures",
      icon: Heart
    },
    {
      title: "Experienced Professionals",
      description: "Administered by experienced professionals who truly care about your pet's wellbeing",
      icon: Stethoscope
    },
    {
      title: "Customized Approach",
      description: "Ensuring your pet only receives what they need, when they need it",
      icon: Target
    }
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
              Vaccinations
            </h1>
          </div>
        </div>
      </section>

      {/* Hero Section */}
      <section className="bg-white">
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center" style={{ paddingTop: '30px', paddingBottom: '15px' }}>
          <h1 className="text-xl font-bold text-gray-900 mb-6">
            Vaccinations
          </h1>
          <div className="mb-6">
            <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold text-white" style={{ backgroundColor: primaryColor }}>
              Prevention is the Best Protection
            </span>
          </div>
          <p className="text-base text-gray-600 leading-relaxed max-w-3xl mx-auto">
            Keeping your pets healthy and protected starts with prevention, and one of the most effective preventive 
            steps is routine pet vaccinations. At Pets and Vets Animal Hospital & Urgent Care, we proudly provide 
            safe, effective, and compassionate pet vaccinations in Chantilly, VA, while also serving pet families 
            across South Riding, Aldie, Ashburn, Centreville, Reston, and Herndon. Our goal is simple: to protect 
            your furry family members from preventable diseases so they can live longer, happier lives.
          </p>
        </div>
      </section>

      {/* Why Vaccinations Matter */}
      <section style={{ backgroundColor: '#f8f9fa', paddingTop: '30px', paddingBottom: '15px' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">
            Why Vaccinations Matter
          </h2>
          <p className="text-center text-gray-600 mb-8">
            Vaccines are a proven way to protect and support your pet's health:
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {vaccineBenefits.slice(0, 3).map((benefit, index) => (
              <div key={index} className="bg-white p-6 rounded-xl shadow-md text-center">
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
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            {vaccineBenefits.slice(3).map((benefit, index) => (
              <div key={index} className="bg-white p-6 rounded-xl shadow-md text-center">
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

      {/* Core vs Non-Core Vaccines */}
      <section className="bg-white" style={{ paddingTop: '30px', paddingBottom: '30px' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">
            Core vs. Non-Core Vaccines
          </h2>
          
          {/* Core Vaccines */}
          <div className="mb-8">
            <div className="bg-red-50 p-6 rounded-xl border-l-4 border-red-500 mb-6">
              <h3 className="text-xl font-semibold text-red-900 mb-3 flex items-center">
                <Shield className="h-6 w-6 mr-3" />
                Core Vaccines – Recommended for all pets
              </h3>
              <p className="text-red-800 text-sm">Essential protection that every pet should receive</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Dogs Core Vaccines */}
              <div className="bg-gray-50 p-6 rounded-xl">
                <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Activity className="h-5 w-5 mr-2" style={{ color: primaryColor }} />
                  Dogs
                </h4>
                <div className="space-y-3">
                  {coreVaccinesDogs.map((vaccine, index) => (
                    <div key={index} className="border-l-4 pl-4" style={{ borderColor: primaryColor }}>
                      <h5 className="font-semibold text-gray-900">{vaccine.name}</h5>
                      <p className="text-gray-600 text-sm">{vaccine.description}</p>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Cats Core Vaccines */}
              <div className="bg-gray-50 p-6 rounded-xl">
                <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Eye className="h-5 w-5 mr-2" style={{ color: primaryColor }} />
                  Cats
                </h4>
                <div className="space-y-3">
                  {coreVaccinesCats.map((vaccine, index) => (
                    <div key={index} className="border-l-4 pl-4" style={{ borderColor: primaryColor }}>
                      <h5 className="font-semibold text-gray-900">{vaccine.name}</h5>
                      <p className="text-gray-600 text-sm">{vaccine.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          {/* Non-Core Vaccines */}
          <div>
            <div className="bg-amber-50 p-6 rounded-xl border-l-4 border-amber-500 mb-6">
              <h3 className="text-xl font-semibold text-amber-900 mb-3 flex items-center">
                <Target className="h-6 w-6 mr-3" />
                Non-Core Vaccines – Based on lifestyle, environment, and risk factors
              </h3>
              <p className="text-amber-800 text-sm">Customized protection based on your pet's specific needs and lifestyle</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Dogs Non-Core Vaccines */}
              <div className="bg-gray-50 p-6 rounded-xl">
                <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Activity className="h-5 w-5 mr-2" style={{ color: primaryColor }} />
                  Dogs
                </h4>
                <div className="space-y-3">
                  {nonCoreVaccinesDogs.map((vaccine, index) => (
                    <div key={index} className="border-l-4 border-amber-400 pl-4">
                      <h5 className="font-semibold text-gray-900">{vaccine.name}</h5>
                      <p className="text-gray-600 text-sm">{vaccine.description}</p>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Cats Non-Core Vaccines */}
              <div className="bg-gray-50 p-6 rounded-xl">
                <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Eye className="h-5 w-5 mr-2" style={{ color: primaryColor }} />
                  Cats
                </h4>
                <div className="space-y-3">
                  {nonCoreVaccinesCats.map((vaccine, index) => (
                    <div key={index} className="border-l-4 border-amber-400 pl-4">
                      <h5 className="font-semibold text-gray-900">{vaccine.name}</h5>
                      <p className="text-gray-600 text-sm">{vaccine.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-8 p-6 rounded-xl" style={{ backgroundColor: primaryBg }}>
            <p className="text-center font-medium" style={{ color: primaryColor }}>
              Our veterinarians will help you determine the right vaccination plan for your pet, 
              tailored to their unique lifestyle and health needs.
            </p>
          </div>
        </div>
      </section>

      {/* Vaccination Schedule */}
      <section className="bg-gray-50" style={{ paddingTop: '30px', paddingBottom: '30px' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">
            Vaccination Schedule
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {scheduleData.map((schedule, index) => (
              <div key={index} className="bg-white p-6 rounded-xl shadow-md">
                <div className="flex items-center mb-4">
                  <Calendar className="h-6 w-6 mr-3" style={{ color: primaryColor }} />
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">{schedule.ageGroup}</h3>
                    <span className="text-gray-600">{schedule.timeline}</span>
                  </div>
                </div>
                <div className="space-y-3">
                  {schedule.details.map((detail, detailIndex) => (
                    <div key={detailIndex} className="flex items-start">
                      <CheckCircle className="h-5 w-5 mr-3 flex-shrink-0 mt-0.5" style={{ color: primaryColor }} />
                      <p className="text-gray-700 text-sm">{detail}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Safe, Gentle, and Professional Care */}
      <section className="bg-white" style={{ paddingTop: '30px', paddingBottom: '30px' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">
            Safe, Gentle, and Professional Care
          </h2>
          <p className="text-center text-gray-600 mb-8">
            At Pets and Vets Animal Hospital & Urgent Care, your pet's comfort and safety come first.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {careFeatures.map((feature, index) => (
              <div key={index} className="bg-gray-50 p-6 rounded-xl shadow-md text-center">
                <div className="flex items-center justify-center w-16 h-16 rounded-full mx-auto mb-4" style={{ backgroundColor: primaryBg }}>
                  <feature.icon className="h-8 w-8" style={{ color: primaryColor }} />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600 text-sm">{feature.description}</p>
              </div>
            ))}
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
      <section className="bg-white" style={{ paddingTop: '15px', paddingBottom: '30px' }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            The Bottom Line: Lifesaving Protection
          </h2>
          <div className="p-8 rounded-xl" style={{ backgroundColor: primaryBg }}>
            <p className="text-gray-700 leading-relaxed mb-6" style={{ fontSize: '1rem' }}>
              Vaccines are more than shots—they are lifesaving protection. Whether your pet spends their days 
              indoors, outdoors, or a mix of both, vaccinations keep them safe, healthy, and part of your family 
              for years to come.
            </p>
            <div className="bg-white p-6 rounded-lg">
              <p className="text-gray-800 font-medium mb-4">
                Trust our experienced team to provide the highest standard of preventive care with 
                compassionate, professional vaccination services tailored to your pet's needs.
              </p>
              <p className="text-gray-700 italic">
                Remember: Prevention through vaccination is always more effective and affordable than treating 
                preventable diseases. Keep your furry family members protected with regular vaccinations.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section style={{ background: `linear-gradient(135deg, ${primaryColor} 0%, #2196c7 100%)`, paddingTop: '30px', paddingBottom: '30px' }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-bold text-white mb-4" style={{ fontSize: '1rem' }}>
            Schedule Your Pet's Vaccinations Today
          </h2>
          <p className="mb-8" style={{ color: 'white', fontSize: '1rem' }}>
            Protect your furry family members with comprehensive vaccination services
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
              to="/reach-us"
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

export default PetVaccinations;