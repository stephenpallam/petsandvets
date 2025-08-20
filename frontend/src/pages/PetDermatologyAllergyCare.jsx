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
  Leaf,
  Apple,
  Wind,
  Bug,
  TreePine
} from 'lucide-react';
import { hospitalInfo } from '../mock';

const PetDermatologyAllergyCare = () => {
  const primaryColor = '#29add3';
  const primaryLight = '#5bc0db';
  const primaryBg = '#e6f7fb';

  const environmentalAllergens = [
    {
      allergen: "Tree and Grass Pollen",
      description: "Seasonal allergens from various trees and grasses that cause respiratory and skin reactions",
      icon: TreePine,
      season: "Spring/Summer",
      color: "#10b981"
    },
    {
      allergen: "Dust and Dander",
      description: "Indoor allergens including dust mites and pet dander that cause year-round irritation",
      icon: Wind,
      season: "Year-round",
      color: "#f59e0b"
    },
    {
      allergen: "Flea Saliva",
      description: "Allergic reactions to flea bites causing intense itching and skin inflammation",
      icon: Bug,
      season: "Warm months",
      color: "#ef4444"
    }
  ];

  const environmentalSymptoms = [
    "Skin inflammation and redness",
    "Excessive itching and scratching",
    "Secondary skin infections",
    "Hair loss in affected areas"
  ];

  const foodAllergySymptoms = [
    {
      category: "Skin Issues",
      symptoms: ["Red, dry, or oily skin", "Hot spots and hair loss", "Repeated skin infections"],
      icon: Activity,
      color: "#ef4444"
    },
    {
      category: "Behavioral Changes",
      symptoms: ["Over-grooming in cats", "Self-grooming in dogs", "Excessive scratching/licking"],
      icon: Heart,
      color: "#8b5cf6"
    },
    {
      category: "Ear Problems",
      symptoms: ["Repeated ear infections", "Ear scratching", "Discharge or odor"],
      icon: Eye,
      color: "#f59e0b"
    },
    {
      category: "Digestive & Other",
      symptoms: ["Vomiting and diarrhea", "Watery eyes", "Sneezing and swelling"],
      icon: Droplets,
      color: "#10b981"
    }
  ];

  const diagnosticMethods = [
    {
      method: "Intradermal Allergy Testing",
      description: "Gold standard testing method for dogs to identify specific environmental allergens",
      accuracy: "Highly accurate",
      suitability: "Best for dogs",
      icon: Target,
      type: "environmental"
    },
    {
      method: "Blood Allergy Testing",
      description: "Alternative testing method used in certain cases when intradermal testing isn't suitable",
      accuracy: "Good accuracy",
      suitability: "Various cases",
      icon: Droplets,
      type: "environmental"
    },
    {
      method: "Elimination Diet Trials",
      description: "Veterinary-supervised diet trials to pinpoint problem food ingredients",
      accuracy: "Definitive results",
      suitability: "Food allergies",
      icon: Apple,
      type: "food"
    }
  ];

  const treatmentOptions = [
    {
      treatment: "Desensitization Therapy",
      description: "Oral drops or injections to build tolerance to specific allergens",
      effectiveness: "~70% of allergic dogs",
      type: "Long-term solution"
    },
    {
      treatment: "Symptom Relief Medications",
      description: "Medications to control itching, inflammation, and discomfort",
      effectiveness: "Immediate relief",
      type: "Symptom management"
    },
    {
      treatment: "Medicated Baths & Topicals",
      description: "Specialized shampoos and treatments for skin relief",
      effectiveness: "Direct skin relief",
      type: "Topical treatment"
    },
    {
      treatment: "Specialized Diets",
      description: "Hydrolyzed protein or single-source protein diets for food allergies",
      effectiveness: "Highly effective",
      type: "Nutritional management"
    }
  ];

  const serviceAreas = [
    "Chantilly", "South Riding", "Aldie", "Ashburn", "Centreville", "Reston", "Herndon"
  ];

  const careAdvantages = [
    {
      title: "Comprehensive Testing",
      description: "Advanced diagnostic methods including intradermal testing and elimination diet trials",
      icon: Search
    },
    {
      title: "Personalized Treatment",
      description: "Customized treatment plans tailored to your pet's specific allergies and lifestyle",
      icon: Target
    },
    {
      title: "Long-term Management",
      description: "Ongoing support and adjustments to keep your pet comfortable and healthy",
      icon: Clock
    },
    {
      title: "Compassionate Care",
      description: "Understanding team that knows how much you love your pet and takes their comfort seriously",
      icon: Heart
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section - Mobile Only */}
      <section className="text-white sticky z-40 block md:hidden" style={{ top: '4rem', background: `linear-gradient(135deg, ${primaryColor} 0%, #2196c7 100%)`, paddingTop: '0.5rem', paddingBottom: '0.5rem' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="font-bold" style={{ fontSize: '1.125rem' }}>
              Pet Dermatology & Allergy Care
            </h1>
          </div>
        </div>
      </section>

      {/* Introduction */}
      <section className="bg-white" style={{ paddingTop: '30px', paddingBottom: '30px' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h1 className="text-xl md:text-2xl font-bold text-gray-900 mb-4">
              Pet Dermatology & Allergy Care
            </h1>
            <p className="text-base text-gray-600 leading-relaxed max-w-4xl mx-auto">
              Just like people, pets can suffer from uncomfortable and often painful allergies. If your dog or cat is 
              scratching, chewing, licking excessively, losing fur, or developing irritated skin, it could be more than 
              a minor irritation—it may be an allergy. At Pets and Vets Animal Hospital & Urgent Care, we provide expert 
              pet dermatology and allergy care in Chantilly, VA, while proudly serving families in South Riding, Aldie, 
              Ashburn, Centreville, Reston, and Herndon.
            </p>
          </div>
        </div>
      </section>

      {/* Environmental Allergies in Pets */}
      <section className="bg-gray-50" style={{ paddingTop: '30px', paddingBottom: '30px' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">
            Environmental Allergies in Pets
          </h2>
          <p className="text-center text-gray-600 mb-8">
            Environmental allergies are among the most common reasons pets visit the vet. Common triggers include:
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {environmentalAllergens.map((allergen, index) => (
              <div key={index} className="bg-white p-6 rounded-xl shadow-md text-center">
                <div className="flex items-center justify-center w-16 h-16 rounded-full mx-auto mb-4" style={{ backgroundColor: `${allergen.color}15` }}>
                  <allergen.icon className="h-8 w-8" style={{ color: allergen.color }} />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">{allergen.allergen}</h3>
                <p className="text-gray-600 text-sm mb-3">{allergen.description}</p>
                <span className="px-3 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: `${allergen.color}20`, color: allergen.color }}>
                  {allergen.season}
                </span>
              </div>
            ))}
          </div>
          
          <div className="bg-orange-50 p-6 rounded-xl border-l-4 border-orange-500">
            <h3 className="text-lg font-semibold text-orange-900 mb-4">Common Environmental Allergy Symptoms:</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {environmentalSymptoms.map((symptom, index) => (
                <div key={index} className="flex items-center">
                  <AlertTriangle className="h-4 w-4 mr-2 text-orange-600 flex-shrink-0" />
                  <span className="text-orange-800 text-sm">{symptom}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Food Allergies in Pets */}
      <section className="bg-white" style={{ paddingTop: '30px', paddingBottom: '30px' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">
            Food Allergies in Pets
          </h2>
          <p className="text-center text-gray-600 mb-8">
            Food allergies happen when your pet's immune system overreacts to an ingredient in their diet. Symptoms can include:
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {foodAllergySymptoms.map((category, index) => (
              <div key={index} className="bg-gray-50 p-6 rounded-xl shadow-md">
                <div className="flex items-center mb-4">
                  <div className="flex items-center justify-center w-12 h-12 rounded-full mr-4" style={{ backgroundColor: `${category.color}15` }}>
                    <category.icon className="h-6 w-6" style={{ color: category.color }} />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">{category.category}</h3>
                </div>
                <div className="space-y-2">
                  {category.symptoms.map((symptom, symptomIndex) => (
                    <div key={symptomIndex} className="flex items-start">
                      <CheckCircle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" style={{ color: category.color }} />
                      <span className="text-gray-700 text-sm">{symptom}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          
          {/* Professional Image */}
          <div className="mt-8 flex justify-center">
            <div className="relative max-w-2xl">
              <img 
                src="https://images.unsplash.com/photo-1601833746588-2307e503421b"
                alt="Caring veterinary dermatology examination for pets"
                className="w-full h-64 object-cover rounded-xl shadow-lg"
              />
              <div className="absolute inset-0 bg-black bg-opacity-10 rounded-xl"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Diagnosis & Treatment */}
      <section className="bg-gray-50" style={{ paddingTop: '30px', paddingBottom: '30px' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">
            Diagnosis & Treatment Options
          </h2>
          
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">Diagnostic Methods</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {diagnosticMethods.map((method, index) => (
                <div key={index} className="bg-white p-6 rounded-xl shadow-md">
                  <div className="flex items-center mb-4">
                    <method.icon className="h-6 w-6 mr-3" style={{ color: primaryColor }} />
                    <h4 className="font-semibold text-gray-900">{method.method}</h4>
                  </div>
                  <p className="text-gray-600 text-sm mb-3">{method.description}</p>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-xs text-gray-500">Accuracy:</span>
                      <span className="text-xs font-medium text-green-600">{method.accuracy}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs text-gray-500">Best for:</span>
                      <span className="text-xs font-medium" style={{ color: primaryColor }}>{method.suitability}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">Treatment Options</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {treatmentOptions.map((treatment, index) => (
                <div key={index} className="bg-white p-6 rounded-xl shadow-md border-l-4" style={{ borderColor: primaryColor }}>
                  <h4 className="font-semibold text-gray-900 mb-2">{treatment.treatment}</h4>
                  <p className="text-gray-600 text-sm mb-3">{treatment.description}</p>
                  <div className="flex justify-between items-center">
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                      {treatment.type}
                    </span>
                    <span className="text-sm font-medium text-green-600">{treatment.effectiveness}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us for Allergy Care */}
      <section className="bg-white" style={{ paddingTop: '30px', paddingBottom: '30px' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">
            Why Choose Us for Allergy Care
          </h2>
          <p className="text-center text-gray-600 mb-8">
            At Pets and Vets Animal Hospital & Urgent Care, we know how much you love your pet—and we take skin and 
            allergy issues seriously. From testing and treatment to long-term management, our compassionate team is 
            here to help your pet live more comfortably, itch-free, and healthy.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {careAdvantages.map((advantage, index) => (
              <div key={index} className="bg-gray-50 p-6 rounded-xl shadow-md text-center">
                <div className="flex items-center justify-center w-16 h-16 rounded-full mx-auto mb-4" style={{ backgroundColor: primaryBg }}>
                  <advantage.icon className="h-8 w-8" style={{ color: primaryColor }} />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">{advantage.title}</h3>
                <p className="text-gray-600 text-sm">{advantage.description}</p>
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
            We proudly provide expert dermatology and allergy care to pet families across:
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
      <section className="bg-white" style={{ paddingTop: '30px', paddingBottom: '30px' }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            Comfortable, Itch-Free Living for Your Pet
          </h2>
          <div className="p-8 rounded-xl" style={{ backgroundColor: primaryBg }}>
            <p className="text-gray-700 leading-relaxed mb-6 text-lg">
              Don't let allergies make your pet miserable. With proper diagnosis and treatment, most pets can live 
              comfortable, itch-free lives. Our comprehensive approach combines advanced testing, personalized treatment 
              plans, and ongoing support to give your pet the relief they deserve.
            </p>
            <div className="bg-white p-6 rounded-lg">
              <div className="flex items-center justify-center mb-4">
                <Shield className="h-8 w-8 mr-3" style={{ color: primaryColor }} />
                <h3 className="text-xl font-semibold text-gray-900">Expert Dermatology & Allergy Care</h3>
              </div>
              <p className="text-gray-800 font-semibold">
                From environmental allergies to food sensitivities—trust our experienced team to identify triggers, 
                provide effective treatments, and help your beloved companion live their most comfortable life.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section style={{ background: `linear-gradient(135deg, ${primaryColor} 0%, #2196c7 100%)`, paddingTop: '30px', paddingBottom: '30px' }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-bold text-white mb-4" style={{ fontSize: '1rem' }}>
            Schedule Your Pet's Dermatology & Allergy Care Appointment
          </h2>
          <p className="mb-8" style={{ color: 'white', fontSize: '1rem' }}>
            Expert diagnosis and treatment for skin conditions and allergies
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
              Schedule Dermatology Appointment
              <MapPin className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default PetDermatologyAllergyCare;