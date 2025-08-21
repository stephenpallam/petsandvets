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
  Users,
  Calendar,
  Stethoscope,
  Target,
  TrendingUp,
  Scissors,
  Pill,
  Bandage,
  Timer,
  DollarSign,
  Home,
  Sparkles
} from 'lucide-react';
import { hospitalInfo } from '../mock';

const PetSpayNeuter = () => {
  const primaryColor = '#29add3';
  const primaryLight = '#5bc0db';
  const primaryBg = '#e6f7fb';

  const benefits = [
    {
      title: "Health Benefits",
      description: "Prevents serious diseases and reduces cancer risks for healthier, longer lives",
      details: ["Eliminates uterine & ovarian cancers", "Prevents testicular cancer", "Reduces mammary tumor risk", "Eliminates pyometra risk"],
      icon: Heart,
      color: "#10b981"
    },
    {
      title: "Behavioral Improvements",
      description: "Reduces problematic behaviors for more harmonious household living",
      details: ["Reduces roaming and escaping", "Less territorial marking", "Decreased aggression", "Better focus on family"],
      icon: Home,
      color: "#f59e0b"
    },
    {
      title: "Cost Savings",
      description: "Prevents expensive medical treatments and reduces pet overpopulation costs",
      details: ["Avoids cancer treatment costs", "No emergency pyometra surgery", "Prevents unwanted litters", "Long-term healthcare savings"],
      icon: DollarSign,
      color: "#8b5cf6"
    },
    {
      title: "Community Impact",
      description: "Reduces pet overpopulation and supports animal welfare in our communities",
      details: ["Prevents unwanted pregnancies", "Reduces shelter overcrowding", "Helps control stray population", "Supports responsible pet ownership"],
      icon: Users,
      color: primaryColor
    }
  ];

  const procedures = [
    {
      type: "Spaying (Ovariohysterectomy)",
      description: "Surgical removal of ovaries and uterus in female pets",
      benefits: ["Prevents heat cycles", "Eliminates reproductive cancers", "Stops unwanted pregnancies", "Reduces mammary tumors"],
      icon: Scissors,
      complexity: "Standard Procedure"
    },
    {
      type: "Neutering (Castration)",
      description: "Surgical removal of testicles in male pets",
      benefits: ["Reduces territorial behavior", "Prevents testicular cancer", "Decreases roaming tendencies", "Improves focus"],
      icon: Target,
      complexity: "Minor Procedure"
    }
  ];

  const ageGuidelines = [
    {
      category: "Dogs",
      timing: "6 months or older",
      considerations: "Before first heat cycle for females, anytime for males after 6 months",
      icon: Heart
    },
    {
      category: "Cats", 
      timing: "4-6 months",
      considerations: "Early spaying/neutering prevents many behavioral and health issues",
      icon: Heart
    }
  ];

  const recoverySteps = [
    {
      phase: "Day of Surgery",
      timeline: "0-24 hours",
      activities: ["Monitor for complications", "Limit food and water", "Keep quiet and warm", "Watch incision site"],
      icon: Clock
    },
    {
      phase: "First Week",
      timeline: "1-7 days",
      activities: ["Restrict activity levels", "Prevent licking/chewing", "Monitor appetite", "Check incision daily"],
      icon: Calendar
    },
    {
      phase: "Full Recovery",
      timeline: "10-14 days", 
      activities: ["Suture removal visit", "Return to normal activity", "Complete healing", "Follow-up examination"],
      icon: CheckCircle
    }
  ];

  const whyChooseUs = [
    {
      feature: "Experienced Surgical Team",
      description: "Skilled veterinarians with extensive spay/neuter experience",
      icon: Award
    },
    {
      feature: "Modern Surgical Facility", 
      description: "State-of-the-art equipment and sterile surgical suites",
      icon: Sparkles
    },
    {
      feature: "Comprehensive Pain Management",
      description: "Multi-modal pain relief for optimal comfort during recovery",
      icon: Shield
    },
    {
      feature: "Post-Operative Support",
      description: "Dedicated follow-up care and 24/7 emergency support",
      icon: Stethoscope
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
              Pet Spay & Neuter Services
            </h1>
          </div>
        </div>
      </section>

      {/* Introduction */}
      <section className="bg-white" style={{ paddingTop: '30px', paddingBottom: '30px' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h1 className="text-xl md:text-2xl font-bold text-gray-900 mb-4">
              Pet Spay & Neuter Services in Chantilly, VA
            </h1>
            <p className="text-base text-gray-600 leading-relaxed max-w-4xl mx-auto">
              At Pets and Vets Animal Hospital & Urgent Care, we provide professional spay and neuter services 
              to help your pet live a healthier, happier life. Serving families in Chantilly, South Riding, 
              Aldie, Ashburn, Centreville, Reston, and Herndon, our experienced surgical team ensures safe, 
              compassionate care with comprehensive pain management and dedicated post-operative support.
            </p>
          </div>
          
          {/* Professional Image */}
          <div className="mt-8 flex justify-center">
            <div className="relative max-w-2xl">
              <img 
                src="https://images.pexels.com/photos/3924779/pexels-photo-3924779.jpeg"
                alt="Professional veterinary surgical team performing spay neuter procedure"
                className="w-full h-64 object-cover rounded-xl shadow-lg"
              />
              <div className="absolute inset-0 bg-black bg-opacity-10 rounded-xl"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits of Spaying and Neutering */}
      <section className="bg-gray-50" style={{ paddingTop: '30px', paddingBottom: '30px' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">
            Benefits of Spaying and Neutering
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {benefits.map((benefit, index) => (
              <div key={index} className="bg-white p-6 rounded-xl shadow-md">
                <div className="flex items-center mb-4">
                  <div className="flex items-center justify-center w-12 h-12 rounded-full mr-4" style={{ backgroundColor: `${benefit.color}15` }}>
                    <benefit.icon className="h-6 w-6" style={{ color: benefit.color }} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{benefit.title}</h3>
                    <p className="text-gray-600 text-sm mt-1">{benefit.description}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  {benefit.details.map((detail, detailIndex) => (
                    <div key={detailIndex} className="flex items-center p-2 rounded-lg" style={{ backgroundColor: `${benefit.color}05` }}>
                      <CheckCircle className="h-4 w-4 mr-2 flex-shrink-0" style={{ color: benefit.color }} />
                      <span className="text-sm text-gray-700">{detail}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Procedures */}
      <section className="bg-white" style={{ paddingTop: '30px', paddingBottom: '30px' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">
            Our Spay & Neuter Procedures
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {procedures.map((procedure, index) => (
              <div key={index} className="bg-gray-50 p-6 rounded-xl shadow-md">
                <div className="flex items-center mb-4">
                  <procedure.icon className="h-6 w-6 mr-3" style={{ color: primaryColor }} />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{procedure.type}</h3>
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                      {procedure.complexity}
                    </span>
                  </div>
                </div>
                <p className="text-gray-600 text-sm mb-4">{procedure.description}</p>
                <div className="space-y-2">
                  <h4 className="font-semibold text-gray-900 text-sm">Key Benefits:</h4>
                  {procedure.benefits.map((benefit, benefitIndex) => (
                    <div key={benefitIndex} className="flex items-center p-2 rounded-lg" style={{ backgroundColor: primaryBg }}>
                      <CheckCircle className="h-4 w-4 mr-2 flex-shrink-0" style={{ color: primaryColor }} />
                      <span className="text-sm text-gray-700">{benefit}</span>
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
                src="https://images.unsplash.com/photo-1725859189289-a48cca8ad6af"
                alt="Professional veterinary spay neuter surgical procedure in progress"
                className="w-full h-64 object-cover rounded-xl shadow-lg"
              />
              <div className="absolute inset-0 bg-black bg-opacity-10 rounded-xl"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Age Guidelines */}
      <section className="bg-gray-50" style={{ paddingTop: '30px', paddingBottom: '30px' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">
            When to Spay or Neuter Your Pet
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {ageGuidelines.map((guideline, index) => (
              <div key={index} className="bg-white p-6 rounded-xl shadow-md text-center">
                <div className="flex items-center justify-center w-16 h-16 rounded-full mx-auto mb-4" style={{ backgroundColor: primaryBg }}>
                  <guideline.icon className="h-8 w-8" style={{ color: primaryColor }} />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{guideline.category}</h3>
                <div className="text-xl font-bold mb-3" style={{ color: primaryColor }}>{guideline.timing}</div>
                <p className="text-gray-600 text-sm">{guideline.considerations}</p>
              </div>
            ))}
          </div>
          
          <div className="bg-amber-50 p-6 rounded-xl border-l-4 border-amber-500">
            <div className="flex items-center mb-4">
              <AlertTriangle className="h-6 w-6 mr-3 text-amber-600" />
              <h3 className="text-lg font-semibold text-amber-900">Individual Consultation</h3>
            </div>
            <p className="text-amber-800">
              Every pet is unique. Schedule a consultation to discuss the optimal timing for your pet's procedure 
              based on their breed, size, health status, and individual circumstances.
            </p>
          </div>
        </div>
      </section>

      {/* Recovery Timeline */}
      <section className="bg-white" style={{ paddingTop: '30px', paddingBottom: '30px' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">
            Recovery Timeline & Care
          </h2>
          
          <div className="space-y-6">
            {recoverySteps.map((step, index) => (
              <div key={index} className="bg-gray-50 p-6 rounded-xl shadow-md">
                <div className="flex flex-col lg:flex-row lg:items-start lg:space-x-6">
                  <div className="flex items-center mb-4 lg:mb-0">
                    <div className="flex items-center justify-center w-16 h-16 rounded-full mr-4" style={{ backgroundColor: primaryBg }}>
                      <step.icon className="h-8 w-8" style={{ color: primaryColor }} />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">{step.phase}</h3>
                      <p className="text-gray-600 text-sm mt-1">{step.timeline}</p>
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {step.activities.map((activity, activityIndex) => (
                        <div key={activityIndex} className="flex items-center p-3 rounded-lg border-l-4" style={{ borderColor: primaryColor, backgroundColor: primaryBg }}>
                          <CheckCircle className="h-4 w-4 mr-2 flex-shrink-0" style={{ color: primaryColor }} />
                          <span className="text-sm text-gray-700">{activity}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Professional Image */}
          <div className="mt-8 flex justify-center">
            <div className="relative max-w-2xl">
              <img 
                src="https://images.pexels.com/photos/5486963/pexels-photo-5486963.jpeg"
                alt="Post-operative pet care and recovery monitoring by veterinary professionals"
                className="w-full h-64 object-cover rounded-xl shadow-lg"
              />
              <div className="absolute inset-0 bg-black bg-opacity-10 rounded-xl"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="bg-gray-50" style={{ paddingTop: '30px', paddingBottom: '30px' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">
            Why Choose Our Spay & Neuter Services
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {whyChooseUs.map((feature, index) => (
              <div key={index} className="bg-white p-6 rounded-xl shadow-md text-center">
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

      {/* Expert Care for Your Pet's Health */}
      <section className="bg-white" style={{ paddingTop: '30px', paddingBottom: '30px' }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            Expert Care for Your Pet's Health & Well-Being
          </h2>
          <div className="p-8 rounded-xl" style={{ backgroundColor: primaryBg }}>
            <p className="text-gray-700 leading-relaxed mb-6 text-lg">
              Spaying and neutering are among the most beneficial procedures you can provide for your pet. Our 
              experienced surgical team uses modern techniques and comprehensive pain management to ensure your 
              pet's comfort and safety throughout the entire process.
            </p>
            <div className="bg-white p-6 rounded-lg">
              <div className="flex items-center justify-center mb-4">
                <Heart className="h-8 w-8 mr-3" style={{ color: primaryColor }} />
                <h3 className="text-xl font-semibold text-gray-900">Professional Surgical Excellence</h3>
              </div>
              <p className="text-gray-800 font-semibold">
                From pre-surgical consultation to post-operative recovery—trust our dedicated team to provide 
                the highest quality spay and neuter services with compassion and professional care.
              </p>
            </div>
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
            We proudly provide professional spay and neuter services to pet families across:
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
      <section style={{ background: `linear-gradient(135deg, ${primaryColor} 0%, #2196c7 100%)`, paddingTop: '30px', paddingBottom: '30px' }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-bold text-white mb-4" style={{ fontSize: '1rem' }}>
            Schedule Your Pet's Spay or Neuter Procedure
          </h2>
          <p className="mb-8" style={{ color: 'white', fontSize: '1rem' }}>
            Professional surgical care with comprehensive pain management and dedicated support
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
              Schedule Consultation
              <MapPin className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default PetSpayNeuter;