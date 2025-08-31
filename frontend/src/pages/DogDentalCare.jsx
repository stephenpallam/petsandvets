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
  MapPin
} from 'lucide-react';
import { hospitalInfo } from '../mock';

const DogDentalCare = () => {
  const primaryColor = '#29add3';
  const primaryLight = '#5bc0db';
  const primaryBg = '#e6f7fb';

  const symptoms = [
    "Bad breath",
    "Bleeding, inflamed, or discolored gums", 
    "Loose or broken teeth",
    "Excessive drooling or pawing at the mouth",
    "Trouble chewing, weight loss, reduced appetite",
    "Behavior changes, mouth sensitivity, swelling near the mouth"
  ];

  const homeCareSteps = [
    {
      title: "Brushing",
      description: "Use a soft-bristled, pet-specific toothbrush and enzymatic toothpaste. Introduce gradually and keep it positive."
    },
    {
      title: "Oral Rinses & Water Additives",
      description: "Contain helpful agents—like chlorhexidine or zinc gluconate—to reduce bacterial buildup."
    },
    {
      title: "Dental Wipes",
      description: "Offer a convenient alternative, though slightly less effective than brushing."
    },
    {
      title: "VOHC-approved Diets and Chews",
      description: "Designed to reduce plaque and tartar when added to your routine."
    },
    {
      title: "Routine Veterinary Evaluations",
      description: "Early detection through regular checkups helps prevent progression to more severe conditions."
    }
  ];

  const cleaningSteps = [
    "Pre-procedural nursing assessment and IV catheter placement",
    "Full-mouth dental radiographs to detect hidden disease (over 75% of issues are subgingival)",
    "Scaling (ultrasonic and hand instruments) and polishing to remove plaque/tartar and smooth enamel",
    "Probing and charting to assess each tooth and gum condition",
    "Application of fluoride or dental sealants",
    "Local nerve blocks or extractions as needed, followed by surgical site closure and post-op care",
    "Recovery monitoring with comprehensive aftercare guidance provided to pet owners"
  ];

  const summaryData = [
    {
      category: "Why it matters",
      points: "Prevent pain, systemic disease, and maintain quality of life"
    },
    {
      category: "Signs to watch for",
      points: "Bad breath, inflamed gums, chewing issues, behavior changes"
    },
    {
      category: "Home care essentials",
      points: "Brushing, rinses, wipes, VOHC-approved chews/diets, regular vet checks"
    },
    {
      category: "Professional cleaning steps",
      points: "Anesthesia, X-rays, scaling, polishing, exam, treatment as needed"
    },
    {
      category: "Check-up frequency",
      points: "Annually, or every six months for higher-risk pets"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section - Mobile Only */}
      <section className="text-white sticky z-40 block md:hidden" style={{ top: '4rem', background: `linear-gradient(135deg, ${primaryColor} 0%, #2196c7 100%)`, paddingTop: '0.5rem', paddingBottom: '0.5rem' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="font-bold" style={{ fontSize: '1.125rem' }}>
              Dog Dental Care
            </h1>
          </div>
        </div>
      </section>

      {/* Hero Section */}
      <section className="bg-white">
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center" style={{ paddingTop: '30px', paddingBottom: '15px' }}>
          <h1 className="text-xl font-bold text-gray-900 mb-6">
            Dog Dental Care
          </h1>
          <div className="mb-6">
            <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold text-white" style={{ backgroundColor: primaryColor }}>
              Healthy Smiles for Happy Dogs
            </span>
          </div>
          <p className="text-base text-gray-600 leading-relaxed max-w-3xl mx-auto">
            Oral health is as vital to your dog's overall well-being as their physical health. Neglected dental care can lead to serious complications—such as periodontal disease, tooth loss, and systemic damage—and adversely affect your dog's comfort and quality of life. At Pets & Vets Animal Hospital, we're committed to providing exceptional dental care tailored to your pet's needs.
          </p>
        </div>
      </section>

      {/* How Dental Health Affects Overall Wellness */}
      <section style={{ backgroundColor: '#f8f9fa', paddingTop: '30px', paddingBottom: '15px' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">
            How Dental Health Affects Overall Wellness
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-md">
              <div className="flex items-center mb-4">
                <AlertTriangle className="h-6 w-6 mr-3" style={{ color: primaryColor }} />
                <h3 className="text-lg font-semibold text-gray-900">High Prevalence</h3>
              </div>
              <p className="text-gray-600 text-sm">
                Approximately 80% of dogs are affected by periodontal disease by age three. It begins with plaque, which hardens into tartar that often hides below the gumline, damaging jawbone and connective tissues.
              </p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md">
              <div className="flex items-center mb-4">
                <Activity className="h-6 w-6 mr-3" style={{ color: primaryColor }} />
                <h3 className="text-lg font-semibold text-gray-900">Progressive Complications</h3>
              </div>
              <p className="text-gray-600 text-sm">
                Left unmanaged, periodontal disease causes pain, difficulty eating, bad breath, and may contribute to damage in vital organs such as the heart, liver, and kidneys.
              </p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md">
              <div className="flex items-center mb-4">
                <Shield className="h-6 w-6 mr-3" style={{ color: primaryColor }} />
                <h3 className="text-lg font-semibold text-gray-900">Tooth Fractures</h3>
              </div>
              <p className="text-gray-600 text-sm">
                Common in larger breeds due to hard chewing, and in small breeds due to tooth crowding—especially when baby teeth are retained.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Signs & Symptoms */}
      <section className="bg-white" style={{ paddingTop: '15px', paddingBottom: '15px' }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">
            Signs & Symptoms of Dental Disease
          </h2>
          <p className="text-center text-gray-600 mb-8">
            Watch for these indicators that your dog may need dental attention:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {symptoms.map((symptom, index) => (
              <div key={index} className="flex items-center p-4 rounded-lg" style={{ backgroundColor: primaryBg }}>
                <CheckCircle className="h-5 w-5 mr-3 flex-shrink-0" style={{ color: primaryColor }} />
                <span className="text-gray-700">{symptom}</span>
              </div>
            ))}
          </div>
          <p className="text-center text-gray-600 mt-6 italic">
            Early recognition allows for timely intervention and improved outcomes.
          </p>
        </div>
      </section>

      {/* Home Care */}
      <section style={{ backgroundColor: '#f8f9fa', paddingTop: '15px', paddingBottom: '15px' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">
            How to Care for Your Dog's Teeth at Home
          </h2>
          <p className="text-center text-gray-600 mb-8">
            A proactive at-home dental routine is crucial for maintaining oral health:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {homeCareSteps.map((step, index) => (
              <div key={index} className="bg-white p-6 rounded-xl shadow-md">
                <h3 className="text-lg font-semibold text-gray-900 mb-3" style={{ color: primaryColor }}>
                  {step.title}
                </h3>
                <p className="text-gray-600 text-sm">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Professional Dental Cleaning */}
      <section className="bg-white" style={{ paddingTop: '15px', paddingBottom: '15px' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">
            What a Professional Dental Cleaning Entails
          </h2>
          <p className="text-center text-gray-600 mb-8">
            Performed under general anesthesia, this comprehensive process ensures safety and thoroughness:
          </p>
          <div className="space-y-4">
            {cleaningSteps.map((step, index) => (
              <div key={index} className="flex items-start p-4 rounded-lg border-l-4" style={{ borderColor: primaryColor, backgroundColor: primaryBg }}>
                <div className="flex items-center justify-center w-8 h-8 rounded-full mr-4 flex-shrink-0" style={{ backgroundColor: primaryColor }}>
                  <span className="text-white font-bold text-sm">{index + 1}</span>
                </div>
                <p className="text-gray-700">{step}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Summary Table */}
      <section style={{ backgroundColor: '#f8f9fa', paddingTop: '15px', paddingBottom: '15px' }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">
            Summary Overview
          </h2>
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead style={{ backgroundColor: primaryColor }}>
                  <tr>
                    <th className="px-6 py-4 text-left text-white font-semibold">Category</th>
                    <th className="px-6 py-4 text-left text-white font-semibold">Key Points</th>
                  </tr>
                </thead>
                <tbody>
                  {summaryData.map((row, index) => (
                    <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                      <td className="px-6 py-4 font-semibold text-gray-900">{row.category}</td>
                      <td className="px-6 py-4 text-gray-600">{row.points}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* Final Thoughts & CTA */}
      <section className="bg-white" style={{ paddingTop: '15px', paddingBottom: '30px' }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            Quality Dental Care for Your Dog's Long-term Health
          </h2>
          <p className="text-gray-600 leading-relaxed mb-8">
            Quality dental care isn't just about fresh breath—it's about ensuring your dog's long-term comfort, health, and wellbeing. Regular at-home care, paired with professional cleaning when recommended, can significantly reduce the risk of dental disease and related health complications.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-xl" style={{ backgroundColor: primaryBg }}>
              <h3 className="font-semibold text-gray-900 mb-2">Early Detection Benefits</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Prevent pain and tooth loss</li>
                <li>• Save supporting bone and soft tissues</li>
                <li>• Reduce risk of systemic infections</li>
                <li>• Enable minimally invasive treatments</li>
              </ul>
            </div>
            <div className="p-6 rounded-xl" style={{ backgroundColor: primaryBg }}>
              <h3 className="font-semibold text-gray-900 mb-2">Recommended Frequency</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Annual professional exams for most adult dogs</li>
                <li>• Every six months for senior dogs</li>
                <li>• More frequent care for small breeds</li>
                <li>• Immediate attention for signs of gingivitis</li>
              </ul>
            </div>
            <div className="p-6 rounded-xl" style={{ backgroundColor: primaryBg }}>
              <h3 className="font-semibold text-gray-900 mb-2">Common Dental Issues</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Periodontal disease (most widespread)</li>
                <li>• Tooth fractures from hard objects</li>
                <li>• Congenital issues in small breeds</li>
                <li>• Retained baby teeth complications</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section style={{ background: `linear-gradient(135deg, ${primaryColor} 0%, #2196c7 100%)`, paddingTop: '30px', paddingBottom: '30px' }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-bold text-white mb-6" style={{ fontSize: '1rem' }}>
            Schedule Your Dog's Dental Care Consultation
          </h2>
          <p className="mb-8" style={{ color: 'white', fontSize: '1rem' }}>
            Contact us today to discuss your dog's dental health needs and schedule an examination
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

export default DogDentalCare;