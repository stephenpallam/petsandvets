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
  Eye
} from 'lucide-react';
import { hospitalInfo } from '../mock';

const CatDentalCare = () => {
  const primaryColor = '#29add3';
  const primaryLight = '#5bc0db';
  const primaryBg = '#e6f7fb';

  const symptoms = [
    "Favors one side while chewing or drops food",
    "Has red or painful-looking gums", 
    "Exhibits drooling—possibly blood-tinged—or excessive grooming",
    "Shows bad breath, facial swelling, or paws at their mouth",
    "Experiences vomiting, diarrhea, or unexplained weight loss in advanced cases"
  ];

  const homeCareSteps = [
    {
      title: "Cat-Safe Brushing",
      description: "Use cat-safe toothbrushes or finger brushes with enzymatic toothpaste. Even brushing once or twice a week can benefit dental health."
    },
    {
      title: "Water Additives",
      description: "Try water additives, though some cats may dislike the taste. These help reduce bacterial buildup in the mouth."
    },
    {
      title: "VOHC-Approved Treats & Toys",
      description: "Offer dental treats and toys that help mechanically remove plaque through natural chewing action."
    },
    {
      title: "Dental-Support Nutrition",
      description: "Talk to your vet about specialized diets that promote oral hygiene and support overall dental health."
    },
    {
      title: "Early Introduction",
      description: "Start dental care routines in kittenhood when possible, but any level of at-home care helps at any age."
    }
  ];

  const vetExamSteps = [
    "Physical examination to assess visible oral health and identify red flags",
    "Evaluation of gum condition, tooth structure, and overall mouth health", 
    "If issues are found: full anesthesia-supported dental cleaning",
    "Professional scaling to remove tartar and plaque buildup",
    "Polishing to smooth tooth surfaces and prevent future buildup",
    "Fluoride treatment for strengthened enamel protection",
    "Full-mouth X-rays to detect hidden problems below the gumline",
    "Extractions when necessary for severely damaged teeth"
  ];

  const healthImpacts = [
    {
      title: "Compromised Comfort",
      description: "Poor dental health affects appetite and chewing comfort, making eating painful or difficult.",
      icon: Heart
    },
    {
      title: "Systemic Infection",
      description: "Oral bacteria can enter the bloodstream and impact vital organs like the heart, kidneys, and liver.",
      icon: Activity
    },
    {
      title: "Hidden Chronic Pain",
      description: "Cats are adept at hiding pain, which significantly lowers their quality of life without obvious symptoms.",
      icon: Shield
    }
  ];

  const summaryData = [
    {
      category: "Why It Matters",
      points: "Critical for overall health—undetected pain and bacteria can affect major organs"
    },
    {
      category: "Vet Procedures",
      points: "Exam → anesthesia → cleaning → X-rays → necessary treatments"
    },
    {
      category: "Warning Signs",
      points: "Drooling, chewing hesitation, bad breath, weight loss, oral swelling"
    },
    {
      category: "Home Care",
      points: "Brushing, additives, dental treats/toys, and specialized diets"
    },
    {
      category: "Professional Care",
      points: "Vital for diagnosing hidden problems and preventing complications"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section - Mobile Only */}
      <section className="text-white sticky z-40 block md:hidden" style={{ top: '4rem', background: `linear-gradient(135deg, ${primaryColor} 0%, #2196c7 100%)`, paddingTop: '0.5rem', paddingBottom: '0.5rem' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="font-bold" style={{ fontSize: '1.125rem' }}>
              Cat Dental Care
            </h1>
          </div>
        </div>
      </section>

      {/* Hero Section */}
      <section className="bg-white">
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center" style={{ paddingTop: '30px', paddingBottom: '15px' }}>
          <h1 className="text-xl font-bold text-gray-900 mb-6">
            Cat Dental Care
          </h1>
          <div className="mb-6">
            <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold text-white" style={{ backgroundColor: primaryColor }}>
              Healthy Teeth for Healthy Cats
            </span>
          </div>
          <p className="text-base text-gray-600 leading-relaxed max-w-3xl mx-auto">
            Oral health in cats influences much more than their ability to eat—it affects the entire body. 
            At Pets & Vets Animal Hospital, we understand the critical importance of feline dental health 
            and provide comprehensive care tailored specifically for cats.
          </p>
        </div>
      </section>

      {/* Impact of Oral Health */}
      <section style={{ backgroundColor: '#f8f9fa', paddingTop: '30px', paddingBottom: '15px' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">
            How Oral Health Affects Your Cat's Well-being
          </h2>
          <p className="text-center text-gray-600 mb-8">
            Infection and inflammation in the mouth can have serious consequences:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {healthImpacts.map((impact, index) => (
              <div key={index} className="bg-white p-6 rounded-xl shadow-md">
                <div className="flex items-center mb-4">
                  <impact.icon className="h-6 w-6 mr-3" style={{ color: primaryColor }} />
                  <h3 className="text-lg font-semibold text-gray-900">{impact.title}</h3>
                </div>
                <p className="text-gray-600 text-sm">
                  {impact.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Signs & Symptoms */}
      <section className="bg-white" style={{ paddingTop: '15px', paddingBottom: '15px' }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">
            Signs & Symptoms to Watch For
          </h2>
          <p className="text-center text-gray-600 mb-8">
            Even subtle signs can point to oral discomfort. Notice if your cat:
          </p>
          <div className="space-y-4">
            {symptoms.map((symptom, index) => (
              <div key={index} className="flex items-start p-4 rounded-lg" style={{ backgroundColor: primaryBg }}>
                <Eye className="h-5 w-5 mr-3 flex-shrink-0 mt-0.5" style={{ color: primaryColor }} />
                <span className="text-gray-700">{symptom}</span>
              </div>
            ))}
          </div>
          <div className="mt-8 p-6 rounded-xl border-l-4" style={{ borderColor: primaryColor, backgroundColor: '#fef7ff' }}>
            <p className="text-gray-700 font-medium">
              <strong>Remember:</strong> Cats are masters at hiding pain. Regular dental checkups are essential 
              since many oral conditions develop silently and may not show obvious symptoms until advanced stages.
            </p>
          </div>
        </div>
      </section>

      {/* What to Expect During Vet Exam */}
      <section style={{ backgroundColor: '#f8f9fa', paddingTop: '15px', paddingBottom: '15px' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">
            What to Expect During a Veterinary Dental Exam
          </h2>
          <p className="text-center text-gray-600 mb-8">
            A comprehensive cat dental evaluation includes:
          </p>
          <div className="space-y-4">
            {vetExamSteps.map((step, index) => (
              <div key={index} className="flex items-start p-4 rounded-lg border-l-4" style={{ borderColor: primaryColor, backgroundColor: 'white' }}>
                <div className="flex items-center justify-center w-8 h-8 rounded-full mr-4 flex-shrink-0" style={{ backgroundColor: primaryColor }}>
                  <span className="text-white font-bold text-sm">{index + 1}</span>
                </div>
                <p className="text-gray-700">{step}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Home Care Prevention */}
      <section className="bg-white" style={{ paddingTop: '15px', paddingBottom: '15px' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">
            Home Care: Prevention Starts Early
          </h2>
          <p className="text-center text-gray-600 mb-8">
            Start early—ideally in kittenhood—but any level of at-home dental care helps:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {homeCareSteps.map((step, index) => (
              <div key={index} className="bg-gray-50 p-6 rounded-xl shadow-md">
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

      {/* Professional Care Importance */}
      <section style={{ backgroundColor: '#f8f9fa', paddingTop: '15px', paddingBottom: '15px' }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">
            Professional Care: The Gold Standard
          </h2>
          <div className="bg-white p-8 rounded-xl shadow-lg">
            <div className="flex items-start">
              <Stethoscope className="h-8 w-8 mr-4 flex-shrink-0 mt-1" style={{ color: primaryColor }} />
              <div>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Despite home efforts, professional dental cleaning under anesthesia with full-mouth X-rays 
                  is essential—especially since many dental diseases lurk below the gumline.
                </p>
                <p className="text-gray-700 leading-relaxed">
                  This enables accurate diagnosis and treatment planning, including extractions when needed 
                  to prevent pain and systemic complications.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Impact of Poor Dental Health */}
      <section className="bg-white" style={{ paddingTop: '15px', paddingBottom: '15px' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">
            Impact of Poor Dental Health
          </h2>
          <p className="text-center text-gray-600 mb-8">
            Untreated oral issues can lead to serious complications:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-xl border-l-4" style={{ borderColor: '#ef4444', backgroundColor: '#fef2f2' }}>
              <h3 className="font-semibold text-gray-900 mb-3 text-red-800">Gingivitis & Resorptive Lesions</h3>
              <p className="text-sm text-gray-600">
                Painful conditions often hidden within the tooth structure, causing significant discomfort 
                that cats instinctively conceal.
              </p>
            </div>
            <div className="p-6 rounded-xl border-l-4" style={{ borderColor: '#f59e0b', backgroundColor: '#fffbeb' }}>
              <h3 className="font-semibold text-gray-900 mb-3 text-amber-800">Systemic Illness</h3>
              <p className="text-sm text-gray-600">
                Oral bacteria spread through the bloodstream to vital organs including the kidneys, 
                liver, and heart, causing serious health complications.
              </p>
            </div>
            <div className="p-6 rounded-xl border-l-4" style={{ borderColor: '#8b5cf6', backgroundColor: '#faf5ff' }}>
              <h3 className="font-semibold text-gray-900 mb-3 text-purple-800">Overall Decline</h3>
              <p className="text-sm text-gray-600">
                Chronic pain, weight loss, and behavioral changes that significantly impact your 
                cat's quality of life and happiness.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Summary Table */}
      <section style={{ backgroundColor: '#f8f9fa', paddingTop: '15px', paddingBottom: '15px' }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">
            Quick Overview
          </h2>
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead style={{ backgroundColor: primaryColor }}>
                  <tr>
                    <th className="px-6 py-4 text-left text-white font-semibold">Category</th>
                    <th className="px-6 py-4 text-left text-white font-semibold">Key Takeaways</th>
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

      {/* Final Thoughts */}
      <section className="bg-white" style={{ paddingTop: '15px', paddingBottom: '30px' }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            A Healthy Smile is Essential for Your Cat
          </h2>
          <div className="p-8 rounded-xl" style={{ backgroundColor: primaryBg }}>
            <p className="text-gray-700 leading-relaxed mb-6" style={{ fontSize: '1rem' }}>
              A healthy smile isn't just adorable—it's essential. Consistent at-home care and regular 
              professional cleanings help ensure your cat leads a pain-free, vibrant life.
            </p>
            <p className="text-gray-600 font-medium">
              When in doubt, book a dental evaluation—especially since many oral conditions develop silently. 
              Early detection and treatment can prevent serious complications and ensure your feline friend 
              maintains optimal health and comfort.
            </p>
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section style={{ background: `linear-gradient(135deg, ${primaryColor} 0%, #2196c7 100%)`, paddingTop: '30px', paddingBottom: '30px' }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-bold text-white mb-6" style={{ fontSize: '1rem' }}>
            Schedule Your Cat's Dental Health Evaluation
          </h2>
          <p className="mb-8" style={{ color: 'white', fontSize: '1rem' }}>
            Protect your feline friend's health with professional dental care tailored specifically for cats
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
              Schedule Dental Evaluation
              <MapPin className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default CatDentalCare;