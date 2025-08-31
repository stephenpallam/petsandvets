import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Scissors, 
  Heart, 
  Shield, 
  CheckCircle,
  Clock,
  Phone,
  MapPin,
  Stethoscope,
  AlertCircle,
  Star,
  Activity,
  Target,
  Users
} from 'lucide-react';
import { hospitalInfo }
import { useBusinessInfo } from '../hooks/useBusinessInfo';

const DogSurgeries = () => {
  const { businessInfo: currentBusinessInfo } = useBusinessInfo();
  const primaryColor = '#29add3';
  const primaryLight = '#5bc0db';
  const primaryBg = '#e6f7fb';

  const surgeries = [
    {
      name: "Spay (Ovariohysterectomy)",
      description: "Prevents unwanted pregnancies, eliminates heat cycles, and greatly reduces the risk of mammary tumors and uterine infections.",
      icon: Heart,
      color: "#ef4444"
    },
    {
      name: "Neuter (Orchiectomy)",
      description: "Prevents reproduction, reduces prostate disease, and helps with certain behavioral concerns.",
      icon: Shield,
      color: "#3b82f6"
    },
    {
      name: "Growth Removal",
      description: "Safely removes lumps or tumors, with lab testing to determine if they are benign or malignant.",
      icon: Target,
      color: "#8b5cf6"
    },
    {
      name: "Cystotomy",
      description: "Removes bladder stones that can cause pain and urinary blockages, with lab testing to prevent recurrence.",
      icon: Activity,
      color: "#10b981"
    },
    {
      name: "Gastropexy (Stomach Tacking)",
      description: "A preventive surgery for large, deep-chested breeds to stop dangerous stomach twisting (GDV).",
      icon: Star,
      color: "#f59e0b"
    },
    {
      name: "Mammary Mass Removal/Mastectomy",
      description: "Removes mammary tumors, especially in dogs spayed later in life, and often combined with spaying to lower future risks.",
      icon: CheckCircle,
      color: "#ec4899"
    },
    {
      name: "Vulvoplasty (Episioplasty)",
      description: "Corrects recessed vulvas to reduce urinary tract and skin infections.",
      icon: Heart,
      color: "#06b6d4"
    },
    {
      name: "Nares Resection",
      description: "Improves breathing in short-nosed breeds like Pugs, Bulldogs, and Shih Tzus by widening their nostrils.",
      icon: Activity,
      color: "#84cc16"
    }
  ];

  const safetyFeatures = [
    {
      feature: "Pre-Anesthetic Evaluation",
      description: "Thorough health assessment before every surgery",
      icon: Stethoscope,
      color: "#10b981"
    },
    {
      feature: "Advanced Monitoring",
      description: "Continuous monitoring during all procedures",
      icon: Activity,
      color: "#3b82f6"
    },
    {
      feature: "Post-Operative Care",
      description: "Tailored recovery plans for smooth healing",
      icon: Heart,
      color: "#ef4444"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-white">
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center" style={{ paddingTop: '30px', paddingBottom: '15px' }}>
          <h1 className="text-xl font-bold text-gray-900 mb-6">
            Dog Surgeries
          </h1>
          <div className="mb-6">
            <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold text-white" style={{ backgroundColor: primaryColor }}>
              Expert Surgical Care for Your Dog
            </span>
          </div>
          <p className="text-base text-gray-600 leading-relaxed max-w-3xl mx-auto">
            At Pets and Vets Animal Hospital, we perform a wide range of surgical procedures to keep your dog healthy and improve their quality of life. From routine spays and neuters to life-saving operations, our experienced veterinary team ensures your pet receives safe, compassionate, and expert care.
          </p>
        </div>
      </section>

      {/* Common Surgeries */}
      <section style={{ backgroundColor: '#f8f9fa', paddingTop: '30px', paddingBottom: '15px' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Common Surgeries We Perform</h2>
            <p className="text-gray-600 max-w-3xl mx-auto">
              Our skilled surgical team performs a comprehensive range of procedures to address your dog's health needs.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {surgeries.map((surgery, index) => (
              <div key={index} className="bg-white p-6 rounded-xl hover:shadow-md transition-shadow">
                <div className="flex items-start">
                  <div className="flex items-center justify-center w-12 h-12 rounded-full mr-4 flex-shrink-0" style={{ backgroundColor: `${surgery.color}15` }}>
                    <surgery.icon className="h-6 w-6" style={{ color: surgery.color }} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">{surgery.name}</h3>
                    <p className="text-sm text-gray-600">{surgery.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Commitment to Safety */}
      <section className="bg-white" style={{ paddingTop: '15px', paddingBottom: '15px' }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Our Commitment to Safety</h2>
            <p className="text-gray-600 max-w-3xl mx-auto">
              Every surgery includes comprehensive care protocols to ensure the safest possible experience for your dog.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {safetyFeatures.map((feature, index) => (
              <div key={index} className="bg-gray-50 p-6 rounded-xl text-center shadow-md">
                <div className="flex items-center justify-center w-16 h-16 rounded-full mb-4 mx-auto" style={{ backgroundColor: `${feature.color}15` }}>
                  <feature.icon className="h-8 w-8" style={{ color: feature.color }} />
                </div>
                <h3 className="font-semibold text-gray-900 mb-3">{feature.feature}</h3>
                <p className="text-sm text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 text-center">
            <div className="p-6 rounded-xl border-l-4" style={{ backgroundColor: primaryBg, borderColor: primaryColor }}>
              <p className="text-base font-medium text-gray-800">
                Every surgery includes a thorough pre-anesthetic evaluation, advanced monitoring during the procedure, and tailored post-operative care to ensure a smooth recovery.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section style={{ backgroundColor: '#f8f9fa', paddingTop: '15px', paddingBottom: '15px' }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Why Choose Our Surgical Team</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="flex items-center justify-center w-16 h-16 rounded-full mb-4 mx-auto" style={{ backgroundColor: `${primaryColor}15` }}>
                <Users className="h-8 w-8" style={{ color: primaryColor }} />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Experienced Team</h3>
              <p className="text-sm text-gray-600">Skilled veterinary surgeons with years of experience</p>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center w-16 h-16 rounded-full mb-4 mx-auto" style={{ backgroundColor: '#10b98115' }}>
                <Shield className="h-8 w-8" style={{ color: '#10b981' }} />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Safe Procedures</h3>
              <p className="text-sm text-gray-600">State-of-the-art equipment and safety protocols</p>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center w-16 h-16 rounded-full mb-4 mx-auto" style={{ backgroundColor: '#ef444415' }}>
                <Heart className="h-8 w-8" style={{ color: '#ef4444' }} />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Compassionate Care</h3>
              <p className="text-sm text-gray-600">Caring support throughout your dog's surgical journey</p>
            </div>
          </div>
        </div>
      </section>

      {/* Service Areas */}
      <section className="bg-white" style={{ paddingTop: '15px', paddingBottom: '30px' }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Serving Your Community</h2>
            <p className="text-gray-600">
              Professional surgical care for dogs throughout Northern Virginia
            </p>
          </div>
          
          <div className="flex flex-wrap justify-center gap-4">
            {['Chantilly', 'South Riding', 'Aldie', 'Ashburn', 'Centreville', 'Reston', 'Herndon'].map((area, index) => (
              <span
                key={index}
                className="px-4 py-2 rounded-full text-sm font-medium text-white"
                style={{ backgroundColor: primaryColor }}
              >
                {area}, VA
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Request Appointment CTA */}
      <section style={{ backgroundColor: primaryColor, paddingTop: '30px', paddingBottom: '30px' }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center mb-6">
            <Scissors className="h-8 w-8 text-white mr-3" />
            <h2 className="font-bold text-white" style={{ fontSize: '1rem' }}>
              Request an Appointment
            </h2>
          </div>
          <p className="text-blue-100 mb-8" style={{ fontSize: '1rem' }}>
            If your dog needs surgery or you'd like to discuss preventive options, contact us today. Our veterinary team is here to guide you every step of the way so your dog can live a healthier, happier life.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <a
              href={`tel:${currentBusinessInfo.phone}`}
              className="inline-flex items-center justify-center px-8 py-3 bg-white text-gray-900 font-semibold rounded-lg hover:bg-gray-100 transition-colors"
            >
              <Phone className="mr-2 h-5 w-5" />
              Call {currentBusinessInfo.phone}
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

export default DogSurgeries;