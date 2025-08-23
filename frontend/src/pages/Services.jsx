import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Heart, 
  Stethoscope, 
  Activity, 
  Search, 
  Smile, 
  HeartHandshake, 
  CheckCircle,
  Clock,
  Phone,
  MapPin,
  ArrowRight,
  Shield,
  Eye,
  Bug,
  Thermometer,
  Camera,
  Monitor,
  Syringe,
  Radio,
  Sparkles,
  Scissors,
  Target,
  Zap,
  Droplets,
  Utensils,
  Home,
  Users
} from 'lucide-react';
import { hospitalInfo } from '../mock';

const Services = () => {
  const primaryColor = '#29add3';
  const primaryLight = '#5bc0db';
  const primaryBg = '#e6f7fb';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section - Mobile Only */}
      <section className="text-white sticky z-40 block md:hidden" style={{ top: '4rem', background: `linear-gradient(135deg, ${primaryColor} 0%, #2196c7 100%)`, paddingTop: '0.5rem', paddingBottom: '0.5rem' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="font-bold" style={{ fontSize: '1.125rem' }}>
              Our Services
            </h1>
          </div>
        </div>
      </section>

      {/* Dog Services */}
      <section className="bg-white" style={{ paddingTop: '30px', paddingBottom: '30px' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Dog Services</h2>
            <p className="text-gray-600 max-w-3xl mx-auto">Specialized veterinary care tailored to meet the unique health needs of dogs at every life stage.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition-all duration-200 hover:-translate-y-1 border">
              <div className="flex items-center justify-center w-16 h-16 rounded-full mb-6" style={{ backgroundColor: '#10b98115' }}>
                <Sparkles className="h-8 w-8" style={{ color: '#10b981' }} />
              </div>
              <h3 className="font-bold text-gray-900 mb-3">Dog Dental Care</h3>
              <p className="text-gray-600 mb-4">Professional dental cleanings, oral examinations, and preventive dental care to maintain your dog's oral health and prevent dental disease.</p>
              <Link to="/dog-dental-care" className="inline-flex items-center font-semibold transition-colors" style={{ color: '#10b981' }}>
                Learn More <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition-all duration-200 hover:-translate-y-1 border">
              <div className="flex items-center justify-center w-16 h-16 rounded-full mb-6" style={{ backgroundColor: '#f59e0b15' }}>
                <Bug className="h-8 w-8" style={{ color: '#f59e0b' }} />
              </div>
              <h3 className="font-bold text-gray-900 mb-3">Dog Dermatology</h3>
              <p className="text-gray-600 mb-4">Comprehensive skin care including allergy treatment, parasite control, and management of skin conditions like hot spots and dermatitis.</p>
              <Link to="/dog-skin-care" className="inline-flex items-center font-semibold transition-colors" style={{ color: '#f59e0b' }}>
                Learn More <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition-all duration-200 hover:-translate-y-1 border">
              <div className="flex items-center justify-center w-16 h-16 rounded-full mb-6" style={{ backgroundColor: '#3b82f615' }}>
                <Syringe className="h-8 w-8" style={{ color: '#3b82f6' }} />
              </div>
              <h3 className="font-bold text-gray-900 mb-3">Dog Vaccinations</h3>
              <p className="text-gray-600 mb-4">Essential immunizations including core vaccines for rabies, DHPP, and lifestyle-based vaccines tailored to your dog's individual needs.</p>
              <Link to="/dog-vaccinations" className="inline-flex items-center font-semibold transition-colors" style={{ color: '#3b82f6' }}>
                Learn More <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition-all duration-200 hover:-translate-y-1 border">
              <div className="flex items-center justify-center w-16 h-16 rounded-full mb-6" style={{ backgroundColor: primaryBg }}>
                <Stethoscope className="h-8 w-8" style={{ color: primaryColor }} />
              </div>
              <h3 className="font-bold text-gray-900 mb-3">Dog Wellness</h3>
              <p className="text-gray-600 mb-4">Comprehensive wellness examinations including physical assessments, preventive care recommendations, and early disease detection.</p>
              <Link to="/dog-wellness-exams" className="inline-flex items-center font-semibold transition-colors" style={{ color: primaryColor }}>
                Learn More <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition-all duration-200 hover:-translate-y-1 border">
              <div className="flex items-center justify-center w-16 h-16 rounded-full mb-6" style={{ backgroundColor: '#ef444415' }}>
                <Eye className="h-8 w-8" style={{ color: '#ef4444' }} />
              </div>
              <h3 className="font-bold text-gray-900 mb-3">Dog Eye Care</h3>
              <p className="text-gray-600 mb-4">Specialized eye examinations and treatment for conditions like conjunctivitis, dry eye, and corneal ulcers in dogs.</p>
              <Link to="/dog-eye-care" className="inline-flex items-center font-semibold transition-colors" style={{ color: '#ef4444' }}>
                Learn More <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition-all duration-200 hover:-translate-y-1 border">
              <div className="flex items-center justify-center w-16 h-16 rounded-full mb-6" style={{ backgroundColor: '#8b5cf615' }}>
                <Utensils className="h-8 w-8" style={{ color: '#8b5cf6' }} />
              </div>
              <h3 className="font-bold text-gray-900 mb-3">Diet & Nutrition</h3>
              <p className="text-gray-600 mb-4">Customized nutrition plans and dietary guidance to maintain healthy weight, boost energy, and improve your dog's overall quality of life.</p>
              <Link to="/dog-diet-nutrition" className="inline-flex items-center font-semibold transition-colors" style={{ color: '#8b5cf6' }}>
                Learn More <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Cat Services */}
      <section style={{ backgroundColor: '#f8f9fa', paddingTop: '30px', paddingBottom: '30px' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Cat Services</h2>
            <p className="text-gray-600 max-w-3xl mx-auto">Feline-focused veterinary care designed to address the specific health needs and behaviors of cats.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition-all duration-200 hover:-translate-y-1">
              <div className="flex items-center justify-center w-16 h-16 rounded-full mb-6" style={{ backgroundColor: '#10b98115' }}>
                <Sparkles className="h-8 w-8" style={{ color: '#10b981' }} />
              </div>
              <h3 className="font-bold text-gray-900 mb-3">Cat Dental Care</h3>
              <p className="text-gray-600 mb-4">Feline dental health services including cleanings, extractions, and treatment for periodontal disease common in cats.</p>
              <Link to="/cat-dental-care" className="inline-flex items-center font-semibold transition-colors" style={{ color: '#10b981' }}>
                Learn More <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition-all duration-200 hover:-translate-y-1">
              <div className="flex items-center justify-center w-16 h-16 rounded-full mb-6" style={{ backgroundColor: '#8b5cf615' }}>
                <Camera className="h-8 w-8" style={{ color: '#8b5cf6' }} />
              </div>
              <h3 className="font-bold text-gray-900 mb-3">Cat Diagnostic Imaging</h3>
              <p className="text-gray-600 mb-4">Advanced imaging including X-rays and ultrasounds to diagnose internal conditions, bone fractures, and organ problems in cats.</p>
              <Link to="/cat-diagnostic-imaging" className="inline-flex items-center font-semibold transition-colors" style={{ color: '#8b5cf6' }}>
                Learn More <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition-all duration-200 hover:-translate-y-1">
              <div className="flex items-center justify-center w-16 h-16 rounded-full mb-6" style={{ backgroundColor: '#3b82f615' }}>
                <Syringe className="h-8 w-8" style={{ color: '#3b82f6' }} />
              </div>
              <h3 className="font-bold text-gray-900 mb-3">Cat Vaccinations</h3>
              <p className="text-gray-600 mb-4">Essential feline vaccines including FVRCP, rabies, and lifestyle vaccines like FeLV based on your cat's risk factors and environment.</p>
              <Link to="/cat-vaccinations" className="inline-flex items-center font-semibold transition-colors" style={{ color: '#3b82f6' }}>
                Learn More <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* General Services */}
      <section className="bg-white" style={{ paddingTop: '30px', paddingBottom: '30px' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">General Services</h2>
            <p className="text-gray-600 max-w-3xl mx-auto">Comprehensive veterinary services for both dogs and cats, covering all aspects of preventive and medical care.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition-all duration-200 hover:-translate-y-1 border">
              <div className="flex items-center justify-center w-16 h-16 rounded-full mb-6" style={{ backgroundColor: '#10b98115' }}>
                <Shield className="h-8 w-8" style={{ color: '#10b981' }} />
              </div>
              <h3 className="font-bold text-gray-900 mb-3">Vaccinations</h3>
              <p className="text-gray-600 mb-4">Essential immunizations for dogs and cats to protect against serious diseases with customized vaccination schedules.</p>
              <Link to="/pet-vaccinations" className="inline-flex items-center font-semibold transition-colors" style={{ color: '#10b981' }}>
                Learn More <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition-all duration-200 hover:-translate-y-1 border">
              <div className="flex items-center justify-center w-16 h-16 rounded-full mb-6" style={{ backgroundColor: primaryBg }}>
                <Stethoscope className="h-8 w-8" style={{ color: primaryColor }} />
              </div>
              <h3 className="font-bold text-gray-900 mb-3">Wellness Exams</h3>
              <p className="text-gray-600 mb-4">Comprehensive physical examinations and preventive care to detect health issues early and maintain optimal pet health.</p>
              <Link to="/preventive-pet-care" className="inline-flex items-centers font-semibold transition-colors" style={{ color: primaryColor }}>
                Learn More <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition-all duration-200 hover:-translate-y-1 border">
              <div className="flex items-center justify-center w-16 h-16 rounded-full mb-6" style={{ backgroundColor: '#8b5cf615' }}>
                <Monitor className="h-8 w-8" style={{ color: '#8b5cf6' }} />
              </div>
              <h3 className="font-bold text-gray-900 mb-3">Ultrasounds</h3>
              <p className="text-gray-600 mb-4">Advanced ultrasound imaging for detailed examination of internal organs, pregnancy monitoring, and diagnostic imaging.</p>
              <Link to="/ultrasound-exams" className="inline-flex items-center font-semibold transition-colors" style={{ color: '#8b5cf6' }}>
                Learn More <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition-all duration-200 hover:-translate-y-1 border">
              <div className="flex items-center justify-center w-16 h-16 rounded-full mb-6" style={{ backgroundColor: '#f59e0b15' }}>
                <Search className="h-8 w-8" style={{ color: '#f59e0b' }} />
              </div>
              <h3 className="font-bold text-gray-900 mb-3">Diagnostic Laboratory</h3>
              <p className="text-gray-600 mb-4">Comprehensive laboratory testing including blood work, urinalysis, and specialized diagnostic tests for accurate health assessment.</p>
              <Link to="/veterinary-diagnostic-services" className="inline-flex items-center font-semibold transition-colors" style={{ color: '#f59e0b' }}>
                Learn More <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition-all duration-200 hover:-translate-y-1 border">
              <div className="flex items-center justify-center w-16 h-16 rounded-full mb-6" style={{ backgroundColor: '#ef444415' }}>
                <Bug className="h-8 w-8" style={{ color: '#ef4444' }} />
              </div>
              <h3 className="font-bold text-gray-900 mb-3">Pet Dermatology & Allergy Care</h3>
              <p className="text-gray-600 mb-4">Specialized treatment for skin conditions, allergies, and dermatological issues affecting dogs and cats.</p>
              <Link to="/pet-dermatology-allergy-care" className="inline-flex items-center font-semibold transition-colors" style={{ color: '#ef4444' }}>
                Learn More <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition-all duration-200 hover:-translate-y-1 border">
              <div className="flex items-center justify-center w-16 h-16 rounded-full mb-6" style={{ backgroundColor: '#10b98115' }}>
                <Camera className="h-8 w-8" style={{ color: '#10b981' }} />
              </div>
              <h3 className="font-bold text-gray-900 mb-3">Digital Radiology</h3>
              <p className="text-gray-600 mb-4">Advanced digital X-ray technology for quick, accurate diagnosis of bone, organ, and tissue conditions with enhanced image quality.</p>
              <Link to="/digital-veterinary-x-rays" className="inline-flex items-center font-semibold transition-colors" style={{ color: '#10b981' }}>
                Learn More <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition-all duration-200 hover:-translate-y-1 border">
              <div className="flex items-center justify-center w-16 h-16 rounded-full mb-6" style={{ backgroundColor: '#3b82f615' }}>
                <Radio className="h-8 w-8" style={{ color: '#3b82f6' }} />
              </div>
              <h3 className="font-bold text-gray-900 mb-3">Pet Microchipping</h3>
              <p className="text-gray-600 mb-4">Permanent pet identification with microchip implantation for quick reunification if your pet becomes lost.</p>
              <Link to="/pet-microchipping" className="inline-flex items-center font-semibold transition-colors" style={{ color: '#3b82f6' }}>
                Learn More <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition-all duration-200 hover:-translate-y-1 border">
              <div className="flex items-center justify-center w-16 h-16 rounded-full mb-6" style={{ backgroundColor: '#8b5cf615' }}>
                <Heart className="h-8 w-8" style={{ color: '#8b5cf6' }} />
              </div>
              <h3 className="font-bold text-gray-900 mb-3">End of Life Care</h3>
              <p className="text-gray-600 mb-4">Compassionate end-of-life services including quality of life assessments and peaceful euthanasia when the time is right.</p>
              <Link to="/end-of-life-care" className="inline-flex items-center font-semibold transition-colors" style={{ color: '#8b5cf6' }}>
                Learn More <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition-all duration-200 hover:-translate-y-1 border">
              <div className="flex items-center justify-center w-16 h-16 rounded-full mb-6" style={{ backgroundColor: '#f59e0b15' }}>
                <Activity className="h-8 w-8" style={{ color: '#f59e0b' }} />
              </div>
              <h3 className="font-bold text-gray-900 mb-3">On Site Pharmacy</h3>
              <p className="text-gray-600 mb-4">Complete on-site pharmacy with prescription medications, preventive treatments, and expert consultation for your pet's needs.</p>
              <Link to="/on-site-pharmacy" className="inline-flex items-center font-semibold transition-colors" style={{ color: '#f59e0b' }}>
                Learn More <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition-all duration-200 hover:-translate-y-1 border">
              <div className="flex items-center justify-center w-16 h-16 rounded-full mb-6" style={{ backgroundColor: '#8b5cf615' }}>
                <Sparkles className="h-8 w-8" style={{ color: '#8b5cf6' }} />
              </div>
              <h3 className="font-bold text-gray-900 mb-3">Pet Travel Certificates</h3>
              <p className="text-gray-600 mb-4">Domestic Health Certificates for safe pet travel by air, road, or sea. Federally accredited veterinarian certification within 10 days of departure.</p>
              <Link to="/pet-travel-certificates" className="inline-flex items-center font-semibold transition-colors" style={{ color: '#8b5cf6' }}>
                Learn More <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Dental Services */}
      <section style={{ backgroundColor: '#f8f9fa', paddingTop: '30px', paddingBottom: '30px' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Dental Services</h2>
            <p className="text-gray-600 max-w-3xl mx-auto">Professional dental care services to maintain your pet's oral health and prevent dental disease.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition-all duration-200 hover:-translate-y-1">
              <div className="flex items-center justify-center w-16 h-16 rounded-full mb-6" style={{ backgroundColor: '#10b98115' }}>
                <Sparkles className="h-8 w-8" style={{ color: '#10b981' }} />
              </div>
              <h3 className="font-bold text-gray-900 mb-3">Dental Cleaning</h3>
              <p className="text-gray-600 mb-4">Professional dental cleanings including plaque removal, dental X-rays, and comprehensive oral health examinations.</p>
              <Link to="/dental-cleanings" className="inline-flex items-center font-semibold transition-colors" style={{ color: '#10b981' }}>
                Learn More <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition-all duration-200 hover:-translate-y-1">
              <div className="flex items-center justify-center w-16 h-16 rounded-full mb-6" style={{ backgroundColor: '#ef444415' }}>
                <Target className="h-8 w-8" style={{ color: '#ef4444' }} />
              </div>
              <h3 className="font-bold text-gray-900 mb-3">Tooth Extractions</h3>
              <p className="text-gray-600 mb-4">Safe and effective tooth extraction procedures for damaged, diseased, or problematic teeth with comprehensive pain management.</p>
              <Link to="/pet-tooth-extraction" className="inline-flex items-center font-semibold transition-colors" style={{ color: '#ef4444' }}>
                Learn More <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Eye Care */}
      <section className="bg-white" style={{ paddingTop: '30px', paddingBottom: '30px' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Eye Care</h2>
            <p className="text-gray-600 max-w-3xl mx-auto">Specialized ophthalmology services for comprehensive eye health and vision care.</p>
          </div>
          <div className="flex justify-center">
            <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition-all duration-200 hover:-translate-y-1 border max-w-md">
              <div className="flex items-center justify-center w-16 h-16 rounded-full mb-6 mx-auto" style={{ backgroundColor: '#ef444415' }}>
                <Eye className="h-8 w-8" style={{ color: '#ef4444' }} />
              </div>
              <h3 className="font-bold text-gray-900 mb-3 text-center">Pet Ocular Services</h3>
              <p className="text-gray-600 mb-4 text-center">Comprehensive eye examinations including tear production tests, corneal staining, and specialized treatments for eye conditions.</p>
              <div className="text-center">
                <Link to="/pet-ocular-services" className="inline-flex items-center font-semibold transition-colors" style={{ color: '#ef4444' }}>
                  Learn More <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Surgical Services */}
      <section style={{ backgroundColor: '#f8f9fa', paddingTop: '30px', paddingBottom: '30px' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Surgical Services</h2>
            <p className="text-gray-600 max-w-3xl mx-auto">Safe and professional surgical procedures performed in our state-of-the-art surgical suite.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition-all duration-200 hover:-translate-y-1">
              <div className="flex items-center justify-center w-16 h-16 rounded-full mb-6" style={{ backgroundColor: '#8b5cf615' }}>
                <Scissors className="h-8 w-8" style={{ color: '#8b5cf6' }} />
              </div>
              <h3 className="font-bold text-gray-900 mb-3">Spay & Neuter</h3>
              <p className="text-gray-600 mb-4">Routine spaying and neutering procedures to prevent diseases, reduce behavioral issues, and support responsible pet ownership.</p>
              <Link to="/pet-spay-neuter" className="inline-flex items-center font-semibold transition-colors" style={{ color: '#8b5cf6' }}>
                Learn More <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition-all duration-200 hover:-translate-y-1">
              <div className="flex items-center justify-center w-16 h-16 rounded-full mb-6" style={{ backgroundColor: '#f59e0b15' }}>
                <Target className="h-8 w-8" style={{ color: '#f59e0b' }} />
              </div>
              <h3 className="font-bold text-gray-900 mb-3">Bladder Stone Removal</h3>
              <p className="text-gray-600 mb-4">Surgical removal of bladder stones and urinary blockages to restore normal urination and prevent complications.</p>
              <Link to="/pet-bladder-stone-removal" className="inline-flex items-center font-semibold transition-colors" style={{ color: '#f59e0b' }}>
                Learn More <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition-all duration-200 hover:-translate-y-1">
              <div className="flex items-center justify-center w-16 h-16 rounded-full mb-6" style={{ backgroundColor: '#ef444415' }}>
                <Zap className="h-8 w-8" style={{ color: '#ef4444' }} />
              </div>
              <h3 className="font-bold text-gray-900 mb-3">Blocked Cat / PU Surgery</h3>
              <p className="text-gray-600 mb-4">Urgent surgical intervention for male cats with urinary blockages, including perineal urethrostomy when needed.</p>
              <Link to="/blocked-cats-urgent-care" className="inline-flex items-center font-semibold transition-colors" style={{ color: '#ef4444' }}>
                Learn More <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition-all duration-200 hover:-translate-y-1">
              <div className="flex items-center justify-center w-16 h-16 rounded-full mb-6" style={{ backgroundColor: '#10b98115' }}>
                <Search className="h-8 w-8" style={{ color: '#10b981' }} />
              </div>
              <h3 className="font-bold text-gray-900 mb-3">Foreign Body / Obstruction Surgery</h3>
              <p className="text-gray-600 mb-4">Emergency surgical removal of foreign objects and intestinal obstructions to prevent serious complications.</p>
              <Link to="/foreign-body-surgery" className="inline-flex items-center font-semibold transition-colors" style={{ color: '#10b981' }}>
                Learn More <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section style={{ backgroundColor: primaryColor, paddingTop: '40px', paddingBottom: '40px' }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">
            Ready to Schedule Your Pet's Appointment?
          </h2>
          <p className="text-blue-100 mb-8">
            Our experienced veterinary team is here to provide the best care for your beloved pet. Contact us today!
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
              to="/contact"
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

export default Services;