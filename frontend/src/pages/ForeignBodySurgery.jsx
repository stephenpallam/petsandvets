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
  Package
} from 'lucide-react';
import { hospitalInfo } from '../mock';

const ForeignBodySurgery = () => {
  const primaryColor = '#29add3';
  const primaryLight = '#5bc0db';
  const primaryBg = '#e6f7fb';
  const warningColor = '#f59e0b';
  const dangerColor = '#ef4444';

  const symptomsData = [
    {
      symptom: "Frequent Vomiting",
      description: "Persistent vomiting, especially after eating or drinking, is a primary indicator",
      severity: "High Priority",
      icon: XCircle,
      color: dangerColor
    },
    {
      symptom: "Loss of Appetite or Refusal to Eat",
      description: "Complete or partial loss of interest in food, even favorite treats",
      severity: "Concerning", 
      icon: Utensils,
      color: warningColor
    },
    {
      symptom: "Lethargy and Weakness",
      description: "Unusual tiredness, reluctance to play, or decreased activity levels",
      severity: "Monitor Closely",
      icon: Activity,
      color: "#8b5cf6"
    },
    {
      symptom: "Abdominal Pain or Sensitivity",
      description: "Hunched posture, reluctance to be touched, or obvious discomfort",
      severity: "High Priority",
      icon: Target,
      color: dangerColor
    },
    {
      symptom: "Constipation or Diarrhea",  
      description: "Changes in bowel movements, straining, or irregular elimination patterns",
      severity: "Concerning",
      icon: AlertTriangle,
      color: warningColor
    }
  ];

  const diagnosticTools = [
    {
      tool: "Digital X-rays",
      description: "High-resolution imaging to locate foreign objects and assess blockage severity",
      capabilities: ["Object location identification", "Blockage severity assessment", "Digestive tract evaluation", "Size and position analysis"],
      icon: Scan,
      color: primaryColor
    },
    {
      tool: "Ultrasound Imaging", 
      description: "Advanced soft-tissue evaluation for detailed obstruction assessment",
      capabilities: ["Soft tissue visualization", "Organ health evaluation", "Fluid accumulation detection", "Real-time assessment"],
      icon: Monitor,
      color: "#10b981"
    },
    {
      tool: "Comprehensive Bloodwork",
      description: "Laboratory analysis to check for dehydration, infection, or complications",
      capabilities: ["Dehydration assessment", "Infection indicators", "Organ function testing", "Electrolyte balance"],
      icon: TestTube,  
      color: "#f59e0b"
    }
  ];

  const surgicalProcess = [
    {
      phase: "Pre-Surgical Preparation",
      description: "Comprehensive imaging, bloodwork, and tailored anesthesia protocols for safety",
      procedures: ["Advanced imaging review", "Complete bloodwork analysis", "Anesthesia safety planning", "Surgical site preparation"],
      icon: FileText,
      duration: "1-2 hours"
    },
    {
      phase: "Surgical Procedure",
      description: "Careful removal of obstruction with minimal tissue trauma using advanced techniques",
      procedures: ["Enterotomy or gastrotomy", "Foreign object removal", "Tissue integrity assessment", "Surgical site closure"],
      icon: Scissors,
      duration: "2-4 hours"
    },
    {
      phase: "Post-Surgical Recovery",
      description: "Close monitoring, pain management, and customized healing plan",
      procedures: ["Recovery room monitoring", "Pain management protocols", "Vital signs tracking", "Healing assessment"],
      icon: Heart,
      duration: "4-24 hours"
    }
  ];

  const aftercareServices = [
    {
      service: "Follow-up Visits",
      description: "Regular check-ups to track healing progress and ensure complete recovery",
      icon: Calendar
    },
    {
      service: "Special Recovery Diets",
      description: "Customized nutrition plans to support digestive health during healing",
      icon: Utensils
    },
    {
      service: "Prevention Guidance",
      description: "Expert advice on pet-proofing and preventing future foreign body incidents",
      icon: Shield
    },
    {
      service: "Emergency Support",
      description: "24/7 post-surgical support for any concerns during recovery period",
      icon: Phone
    }
  ];

  const preventionTips = [
    {
      tip: "Pet-Proof Your Home",
      description: "Remove or secure small objects, toxic items, and potential hazards",
      icon: Home
    },
    {
      tip: "Supervise Playtime",
      description: "Monitor pets during play and remove broken or damaged toys immediately",
      icon: Eye
    },
    {
      tip: "Provide Safe Chew Toys",
      description: "Offer appropriate, size-suitable toys designed for your pet's chewing habits", 
      icon: Package
    },
    {
      tip: "Regular Dental Care",
      description: "Maintain oral health to reduce destructive chewing behaviors",
      icon: Sparkles
    }
  ];

  const whyChooseUs = [
    {
      feature: "Expert Surgical Team",
      description: "Extensive experience in complex GI obstruction cases with proven success rates",
      icon: Award
    },
    {
      feature: "Advanced Diagnostics & Facilities",
      description: "State-of-the-art imaging and surgical equipment for faster, safer treatment",
      icon: Microscope
    },
    {
      feature: "Comprehensive Care Approach",
      description: "From emergency diagnosis through complete recovery and prevention planning",
      icon: Shield
    },
    {
      feature: "Compassionate Family Care",
      description: "Treating every pet like family with personalized attention and support",
      icon: Heart
    }
  ];

  const serviceAreas = [
    "South Riding", "Aldie", "Ashburn", "Chantilly", "Centreville", "Reston", "Herndon"
  ];

  const commonForeignObjects = [
    "Toys and toy parts",
    "Bones and bone fragments", 
    "Socks and clothing items",
    "Balls and rubber objects",
    "String, rope, or fabric",
    "Household items and debris"
  ];

  return (
    <div className="min-h-screen bg-gray-50">


      {/* Hero Section - Mobile Only */}
      <section className="text-white sticky z-40 block md:hidden" style={{ top: '4rem', background: `linear-gradient(135deg, ${primaryColor} 0%, #2196c7 100%)`, paddingTop: '0.5rem', paddingBottom: '0.5rem' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="font-bold" style={{ fontSize: '1.125rem' }}>
              Foreign Body & GI Obstruction Surgery
            </h1>
          </div>
        </div>
      </section>

      {/* Hero Section */}
      <section className="bg-white">
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center" style={{ paddingTop: '30px', paddingBottom: '15px' }}>
          <h1 className="text-xl font-bold text-gray-900 mb-6">
            Foreign Body & GI Obstruction Surgery
          </h1>
          <div className="mb-6">
            <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold text-white" style={{ backgroundColor: primaryColor }}>
              Life-Saving Foreign Body Removal Surgery
            </span>
          </div>
          <p className="text-base text-gray-600 leading-relaxed max-w-3xl mx-auto">
            At Pets and Vets Animal Hospital in South Riding, VA—also serving Aldie, Ashburn, Chantilly, 
            Centreville, Reston, and Herndon—we know how curious pets can be. Sometimes that curiosity leads 
            them to swallow objects like toys, bones, or household items. Unfortunately, these can cause 
            dangerous gastrointestinal (GI) obstructions that require urgent veterinary attention. Our 
            experienced team is here to provide advanced diagnostics and life-saving surgery when needed.
          </p>
        </div>
      </section>

      {/* What Is a GI Obstruction */}
      <section className="bg-[#f8f9fa] py-6">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">
            What Is a GI Obstruction?
          </h2>
          <div className="max-w-4xl mx-auto">
            <div className="bg-white p-8 rounded-xl shadow-md">
              <div className="flex items-center mb-4">
                <AlertTriangle className="h-8 w-8 mr-4" style={{ color: warningColor }} />
                <h3 className="text-lg font-semibold text-gray-900">Serious Medical Condition</h3>
              </div>
              <p className="text-gray-700 leading-relaxed mb-6">
                A GI obstruction occurs when a foreign object blocks the normal passage of food and water 
                through your pet's digestive tract. Left untreated, this condition can cause severe pain, 
                dehydration, internal damage, and even become life-threatening.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-4 rounded-lg bg-orange-50 border-l-4 border-orange-500">
                  <h4 className="font-semibold text-orange-900 mb-3">Common Foreign Objects</h4>
                  <div className="space-y-2">
                    {commonForeignObjects.map((object, index) => (
                      <div key={index} className="flex items-center">
                        <CircleDot className="h-3 w-3 mr-2 text-orange-600 flex-shrink-0" />
                        <span className="text-orange-800 text-sm">{object}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="p-4 rounded-lg bg-red-50 border-l-4 border-red-500">
                  <h4 className="font-semibold text-red-900 mb-3">Potential Complications</h4>
                  <ul className="text-sm text-red-800 space-y-2">
                    <li className="flex items-center">
                      <AlertTriangle className="h-3 w-3 mr-2 flex-shrink-0" />
                      Severe dehydration and electrolyte imbalance
                    </li>
                    <li className="flex items-center">
                      <AlertTriangle className="h-3 w-3 mr-2 flex-shrink-0" />
                      Intestinal perforation or damage
                    </li>
                    <li className="flex items-center">
                      <AlertTriangle className="h-3 w-3 mr-2 flex-shrink-0" />
                      Tissue death from lack of blood flow
                    </li>
                    <li className="flex items-center">
                      <AlertTriangle className="h-3 w-3 mr-2 flex-shrink-0" />
                      Life-threatening systemic infection
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Symptoms Section */}
      <section className="bg-white py-6">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">
            Symptoms of GI Obstruction in Pets
          </h2>
          <p className="text-center text-gray-600 mb-8">
            <strong>Contact us immediately if your pet shows signs such as:</strong>
          </p>
          
          <div className="space-y-6">
            {symptomsData.map((symptom, index) => (
              <div key={index} className="bg-gray-50 p-6 rounded-xl shadow-md border-l-4" style={{ borderColor: symptom.color }}>
                <div className="flex flex-col lg:flex-row lg:items-start lg:space-x-6">
                  <div className="flex items-center mb-4 lg:mb-0">
                    <div className="flex items-center justify-center w-16 h-16 rounded-full mr-4" style={{ backgroundColor: `${symptom.color}15` }}>
                      <symptom.icon className="h-8 w-8" style={{ color: symptom.color }} />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">{symptom.symptom}</h3>
                      <span className="px-3 py-1 rounded-full text-xs font-medium text-white" style={{ backgroundColor: symptom.color }}>
                        {symptom.severity}
                      </span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-700 leading-relaxed">{symptom.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-8 bg-yellow-50 p-6 rounded-xl border-l-4 border-yellow-500">
            <div className="flex items-center mb-4">
              <Clock className="h-6 w-6 mr-3 text-yellow-600" />
              <h3 className="text-lg font-semibold text-yellow-900">Time-Sensitive Condition</h3>
            </div>
            <p className="text-yellow-800 font-semibold">
              These symptoms can progress quickly—early care is critical. The sooner treatment begins, 
              the better the outcome for your pet.
            </p>
          </div>
        </div>
      </section>

      {/* Diagnostic Methods */}
      <section className="bg-[#f8f9fa] py-6">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">
            How We Diagnose Obstructions
          </h2>
          <p className="text-center text-gray-600 mb-8">
            At Pets and Vets Animal Hospital, we use advanced tools for accurate diagnosis:
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {diagnosticTools.map((tool, index) => (
              <div key={index} className="bg-white p-6 rounded-xl shadow-md">
                <div className="flex items-center mb-4">
                  <div className="flex items-center justify-center w-12 h-12 rounded-full mr-4" style={{ backgroundColor: `${tool.color}15` }}>
                    <tool.icon className="h-6 w-6" style={{ color: tool.color }} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{tool.tool}</h3>
                  </div>
                </div>
                <p className="text-gray-600 text-sm mb-4">{tool.description}</p>
                <div className="space-y-2">
                  <h4 className="font-semibold text-gray-900 text-sm">Capabilities:</h4>
                  <div className="space-y-1">
                    {tool.capabilities.map((capability, capIndex) => (
                      <div key={capIndex} className="flex items-center p-2 rounded-lg" style={{ backgroundColor: `${tool.color}05` }}>
                        <CheckCircle className="h-4 w-4 mr-2 flex-shrink-0" style={{ color: tool.color }} />
                        <span className="text-sm text-gray-700">{capability}</span>
                      </div>
                    ))}
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
                alt="Advanced veterinary diagnostic equipment and surgical preparation"
                className="w-full h-64 object-cover rounded-xl shadow-lg"
              />
              <div className="absolute inset-0 bg-black bg-opacity-10 rounded-xl"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Surgical Treatment */}
      <section className="bg-white py-6">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">
            Surgical Treatment for GI Obstructions
          </h2>
          <p className="text-center text-gray-600 mb-8">
            When foreign objects cannot pass naturally, surgery (enterotomy or gastrotomy) is often necessary. 
            Our skilled surgeons provide precise, safe, and compassionate care:
          </p>
          
          <div className="space-y-6">
            {surgicalProcess.map((phase, index) => (
              <div key={index} className="bg-gray-50 p-6 rounded-xl shadow-md">
                <div className="flex flex-col lg:flex-row lg:items-start lg:space-x-6">
                  <div className="flex items-center mb-4 lg:mb-0">
                    <div className="flex items-center justify-center w-16 h-16 rounded-full mr-4" style={{ backgroundColor: primaryBg }}>
                      <phase.icon className="h-8 w-8" style={{ color: primaryColor }} />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">{phase.phase}</h3>
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                        Duration: {phase.duration}
                      </span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-700 mb-4">{phase.description}</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {phase.procedures.map((procedure, procIndex) => (
                        <div key={procIndex} className="flex items-center p-2 rounded-lg" style={{ backgroundColor: primaryBg }}>
                          <CheckCircle className="h-4 w-4 mr-2 flex-shrink-0" style={{ color: primaryColor }} />
                          <span className="text-sm text-gray-700">{procedure}</span>
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
                src="https://images.pexels.com/photos/7121954/pexels-photo-7121954.jpeg"
                alt="Professional veterinary surgical team performing GI obstruction removal"
                className="w-full h-64 object-cover rounded-xl shadow-lg"
              />
              <div className="absolute inset-0 bg-black bg-opacity-10 rounded-xl"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Aftercare & Prevention */}
      <section className="bg-[#f8f9fa] py-6">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">
            Aftercare & Prevention
          </h2>
          <p className="text-center text-gray-600 mb-8">
            Recovery doesn't end after surgery. We provide comprehensive support:
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {aftercareServices.map((service, index) => (
              <div key={index} className="bg-white p-6 rounded-xl shadow-md text-center">
                <div className="flex items-center justify-center w-16 h-16 rounded-full mx-auto mb-4" style={{ backgroundColor: primaryBg }}>
                  <service.icon className="h-8 w-8" style={{ color: primaryColor }} />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">{service.service}</h3>
                <p className="text-gray-600 text-sm">{service.description}</p>
              </div>
            ))}
          </div>
          
          <h3 className="text-lg font-semibold text-gray-900 mb-6 text-center">Prevention Tips</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {preventionTips.map((tip, index) => (
              <div key={index} className="bg-white p-6 rounded-xl shadow-md text-center">
                <div className="flex items-center justify-center w-16 h-16 rounded-full mx-auto mb-4 bg-green-100">
                  <tip.icon className="h-8 w-8 text-green-600" />
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-3">{tip.tip}</h4>
                <p className="text-gray-600 text-sm">{tip.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="bg-white py-6">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">
            Why Choose Pets and Vets Animal Hospital?
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

      {/* Expert Surgical Care Message */}
      <section className="bg-[#f8f9fa] py-6">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            Expert Surgical Care When Your Pet Needs It Most
          </h2>
          <div className="p-8 rounded-xl" style={{ backgroundColor: primaryBg }}>
            <p className="text-gray-700 leading-relaxed mb-6 text-lg">
              Foreign body obstructions require immediate attention and skilled surgical intervention. Our 
              experienced team combines advanced diagnostic technology with precise surgical techniques to 
              provide the life-saving care your pet needs.
            </p>
            <div className="bg-white p-6 rounded-lg">
              <div className="flex items-center justify-center mb-4">
                <Scissors className="h-8 w-8 mr-3" style={{ color: primaryColor }} />
                <h3 className="text-xl font-semibold text-gray-900">Advanced Surgical Excellence</h3>
              </div>
              <p className="text-gray-800 font-semibold">
                From emergency diagnosis to complete recovery—trust our dedicated surgical team to provide 
                the comprehensive care your pet deserves with compassion and expertise.
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
          <p className="text-gray-600 mb-6">
            We proudly provide expert surgical care to pets and families throughout:
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
            Emergency GI Obstruction Care
          </h2>
          <p className="mb-8" style={{ color: 'white', fontSize: '1rem' }}>
            If your pet shows signs of a GI obstruction, don't wait—call immediately for expert surgical care
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
              Schedule Consultation
              <MapPin className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ForeignBodySurgery;