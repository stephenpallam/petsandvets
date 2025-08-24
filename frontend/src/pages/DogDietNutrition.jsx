import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Heart, 
  Shield, 
  Activity,
  CheckCircle,
  Clock,
  Phone,
  MapPin,
  Utensils,
  Scale,
  Zap,
  Calendar,
  Award,
  Sparkles
} from 'lucide-react';
import { hospitalInfo } from '../mock';

const DogDietNutrition = () => {
  const primaryColor = '#29add3';
  const primaryLight = '#5bc0db';
  const primaryBg = '#e6f7fb';

  const nutritionBenefits = [
    {
      title: "Weight Management",
      description: "Helps maintain healthy weight and prevents obesity-related conditions",
      icon: Scale,
      color: "#10b981"
    },
    {
      title: "Disease Prevention",
      description: "Proper nutrition helps fight disease and boosts immune system",
      icon: Shield,
      color: "#3b82f6"
    },
    {
      title: "Energy & Vitality",
      description: "Balanced diet increases energy levels and overall quality of life",
      icon: Zap,
      color: "#f59e0b"
    },
    {
      title: "Healthy Aging",
      description: "Supports joint health and cognitive function in senior pets",
      icon: Heart,
      color: "#ef4444"
    }
  ];

  const dietChangeTriggers = [
    {
      trigger: "Life Stage Transitions",
      description: "Puppy to adult, or adult to senior (around age 7)",
      icon: Calendar,
      urgency: "moderate"
    },
    {
      trigger: "Breed & Activity Level",
      description: "Special dietary needs based on size, breed, and lifestyle",
      icon: Activity,
      urgency: "moderate"
    },
    {
      trigger: "Health Conditions",
      description: "Obesity, arthritis, food allergies requiring prescription diets",
      icon: Award,
      urgency: "high"
    }
  ];

  const healthImprovements = [
    "Reduced allergies, itching, and scratching",
    "Improved coat shine and thickness", 
    "Better joint health and reduced arthritis pain",
    "Improved digestive health and intestinal disorders",
    "Enhanced skin and coat condition",
    "Better energy levels and activity"
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-white pt-6" style={{ paddingBottom: '8px' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h1 className="text-xl font-bold text-gray-900 mb-4">
              Diet & Nutrition
            </h1>
            <div className="mb-6">
              <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold text-white" style={{ backgroundColor: primaryColor }}>
                Healthy Life Starts Here
              </span>
            </div>
            <p className="text-base text-gray-600 leading-relaxed max-w-4xl mx-auto">
              A healthy life begins with a healthy diet. Just like people, pets need proper nutrition to thrive. The right food choices not only help your pet fight disease but also maintain a healthy weight, boost energy, and improve their overall quality of life.
            </p>
          </div>
        </div>
      </section>

      {/* Why Nutrition Matters */}
      <section className="bg-[#f8f9fa] py-6">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Why Nutrition Matters</h2>
            <p className="text-base text-gray-600 leading-relaxed max-w-4xl mx-auto mb-6">
              Obesity is one of the most common health concerns in pets. It's easy to overfeed a pet that knows how to beg, but extra weight can lead to arthritis, heart disease, diabetes, and a shorter lifespan. With the right diet and exercise, your pet can stay within a healthy weight range and avoid these risks.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {nutritionBenefits.map((benefit, index) => (
              <div key={index} className="text-center bg-white p-4 rounded-lg shadow-sm">
                <div className="flex items-center justify-center w-12 h-12 rounded-full mx-auto mb-3" style={{ backgroundColor: `${benefit.color}15` }}>
                  <benefit.icon className="h-6 w-6" style={{ color: benefit.color }} />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2 text-base">{benefit.title}</h3>
                <p className="text-sm text-gray-600">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* When to Adjust Diet */}
      <section className="bg-white py-6">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">When to Adjust Your Pet's Diet</h2>
            <p className="text-gray-600 max-w-3xl mx-auto text-sm">
              Your pet's nutritional needs change throughout their life. A diet change may be recommended when:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {dietChangeTriggers.map((trigger, index) => (
              <div key={index} className="bg-gray-50 p-4 rounded-lg shadow-sm">
                <div className="flex items-center justify-center w-12 h-12 rounded-full mb-3 mx-auto" style={{ backgroundColor: '#f8f9fa' }}>
                  <trigger.icon className="h-6 w-6" style={{ color: primaryColor }} />
                </div>
                <h3 className="text-base font-semibold text-gray-900 mb-2 text-center">{trigger.trigger}</h3>
                <p className="text-gray-600 text-sm text-center">{trigger.description}</p>
              </div>
            ))}
          </div>

          <div className="text-center">
            <p className="text-base text-gray-600">
              Our veterinary team can create a customized nutrition plan that fits your pet's stage of life, lifestyle, and health needs.
            </p>
          </div>
        </div>
      </section>

      {/* Benefits of Proper Diet */}
      <section className="bg-[#f8f9fa] py-6">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">The Benefits of Proper Diet & Nutrition</h2>
            <p className="text-gray-600 max-w-3xl mx-auto text-sm">
              A well-balanced diet can make a dramatic difference in your pet's comfort and health. The right nutrition can help reduce or even eliminate:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
            {healthImprovements.map((improvement, index) => (
              <div key={index} className="flex items-center bg-white p-3 rounded-lg">
                <CheckCircle className="h-4 w-4 mr-2 flex-shrink-0" style={{ color: '#10b981' }} />
                <span className="text-gray-700 text-sm">{improvement}</span>
              </div>
            ))}
          </div>

          <div className="p-4 rounded-lg border-l-4 bg-white" style={{ borderColor: primaryColor }}>
            <div className="flex items-center mb-3">
              <Sparkles className="h-5 w-5 mr-2" style={{ color: primaryColor }} />
              <h3 className="text-base font-semibold text-gray-900">Supplements & Support</h3>
            </div>
            <p className="text-gray-600 text-sm">
              Supplements for skin, coat, and joints can also provide added support, especially as pets get older.
            </p>
          </div>
        </div>
      </section>

      {/* Helping Pets Live Longer */}
      <section style={{ backgroundColor: '#f8f9fa', paddingTop: '30px', paddingBottom: '30px' }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Helping Pets Live Longer, Healthier Lives
          </h2>
          <p className="text-gray-600 mb-6 max-w-3xl mx-auto">
            Good nutrition is one of the most effective ways to protect your pet's long-term health and happiness. Our team is here to help guide you in making the best choices for your companion — from everyday diets to specialized plans for pets with unique needs.
          </p>
          <div className="p-6 rounded-xl border-l-4" style={{ backgroundColor: 'white', borderColor: primaryColor }}>
            <p className="text-lg font-medium text-gray-800">
              👉 Ask us today about your pet's nutrition plan and give them the gift of a healthier, happier life.
            </p>
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section style={{ backgroundColor: primaryColor, paddingTop: '30px', paddingBottom: '30px' }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-xl font-bold text-white mb-4">
            Ready to Discuss Your Pet's Nutrition Plan?
          </h2>
          <p className="text-blue-100 mb-8">
            Our experienced veterinary team can help create a customized nutrition plan for your pet's specific needs.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <a
              href={`tel:${hospitalInfo.phone}`}
              className="inline-flex items-center justify-center px-8 py-3 bg-white text-gray-900 font-semibold rounded-lg hover:bg-gray-100 transition-colors"
            >
              <Phone className="mr-2 h-5 w-5" />
              Call {hospitalInfo.phone}
            </a>
            <Link
              to="/reach-us"
              className="inline-flex items-center justify-center px-8 py-3 border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-gray-900 transition-colors"
            >
              <MapPin className="mr-2 h-5 w-5" />
              Visit Our Location
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default DogDietNutrition;