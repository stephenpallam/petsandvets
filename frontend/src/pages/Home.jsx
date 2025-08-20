import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Phone, 
  MapPin, 
  Clock, 
  Star, 
  CheckCircle, 
  ArrowRight,
  Heart,
  Shield,
  Award,
  Users
} from 'lucide-react';
import { hospitalInfo, services, specialOffers, testimonials, heroImages } from '../mock';

const Home = () => {
  const [currentHeroImage, setCurrentHeroImage] = useState(0);

  // Auto-rotate hero images
  React.useEffect(() => {
    const interval = setInterval(() => {
      setCurrentHeroImage((prev) => (prev + 1) % heroImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const primaryColor = '#29add3';
  const primaryLight = '#5bc0db';
  const primaryBg = '#e6f7fb';

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden" style={{ background: `linear-gradient(135deg, ${primaryBg} 0%, #ffffff 50%, #f0fdff 100%)` }}>
        <div className="absolute inset-0 bg-white/40"></div>
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-4" style={{ paddingBottom: '20px' }}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            {/* Left Content */}
            <div className="space-y-8">
              <div className="space-y-4">
                <div className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium" style={{ backgroundColor: primaryBg, color: primaryColor }}>
                  <Heart className="h-4 w-4 mr-2" />
                  FREE First Office Visit for New Patients
                </div>
                <h1 className="font-bold text-gray-900 leading-tight" style={{ fontSize: '2rem' }}>
                  Compassionate Care for Your
                  <span className="block" style={{ color: primaryColor }}>Beloved Pets</span>
                </h1>
                <p className="text-gray-600 leading-relaxed" style={{ fontSize: '1rem' }}>
                  Quality veterinary care and urgent care services for dogs, cats, and exotic pets. 
                  Modern facilities, experienced veterinarians, and affordable pricing.
                </p>
              </div>

              {/* Quick Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center space-x-3 bg-white/60 backdrop-blur-sm p-4 rounded-lg">
                  <Clock className="h-5 w-5" style={{ color: primaryColor }} />
                  <div>
                    <p className="font-semibold text-gray-900">Urgent Care</p>
                    <p className="text-sm text-gray-600">11 AM - 8 PM Daily</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 bg-white/60 backdrop-blur-sm p-4 rounded-lg">
                  <MapPin className="h-5 w-5" style={{ color: primaryColor }} />
                  <div>
                    <p className="font-semibold text-gray-900">South Riding</p>
                    <p className="text-sm text-gray-600">Walk-ins Welcome</p>
                  </div>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/contact"
                  className="inline-flex items-center justify-center text-white px-8 py-4 rounded-lg font-semibold transition-all duration-200 shadow-lg hover:shadow-xl group"
                  style={{ backgroundColor: primaryColor }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#2196c7'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = primaryColor}
                >
                  Emergency Care Now
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  to="/services"
                  className="inline-flex items-center justify-center border-2 px-8 py-4 rounded-lg font-semibold transition-all duration-200"
                  style={{ 
                    borderColor: primaryColor, 
                    color: primaryColor 
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = primaryColor;
                    e.target.style.color = 'white';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = 'transparent';
                    e.target.style.color = primaryColor;
                  }}
                >
                  View All Services
                </Link>
              </div>
            </div>

            {/* Right Content - Hero Image */}
            <div className="relative">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                <img
                  src={heroImages[currentHeroImage]}
                  alt="Veterinary Care"
                  className="w-full object-cover transition-opacity duration-1000"
                  style={{ height: '28rem' }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
              </div>
              
              {/* Image indicators */}
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                {heroImages.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentHeroImage(index)}
                    className={`w-3 h-3 rounded-full transition-all duration-200 ${
                      currentHeroImage === index 
                        ? 'bg-white' 
                        : 'bg-white/50 hover:bg-white/75'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Special Offers Section */}
      <section className="pb-16" style={{ backgroundColor: primaryColor, paddingTop: '30px' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center" style={{ marginBottom: '20px' }}>
            <h2 className="font-bold text-white mb-4" style={{ fontSize: '1rem' }}>
              Special Offers & Packages
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {specialOffers.map((offer) => (
              <div
                key={offer.id}
                className={`relative p-6 rounded-xl transition-all duration-200 hover:scale-105 ${
                  offer.highlight
                    ? 'bg-white text-gray-900 shadow-xl'
                    : 'text-white'
                }`}
                style={{
                  backgroundColor: offer.highlight ? 'white' : '#2196c7'
                }}
              >
                {offer.highlight && (
                  <div className="absolute -top-3 left-6 bg-yellow-400 text-gray-900 px-3 py-1 rounded-full text-xs font-bold">
                    POPULAR
                  </div>
                )}
                <CheckCircle className={`h-8 w-8 mb-4`} style={{ color: offer.highlight ? primaryColor : primaryLight }} />
                <h3 className="font-bold mb-2" style={{ fontSize: '1rem' }}>{offer.title}</h3>
                <p className={offer.highlight ? 'text-gray-600' : 'text-blue-100'}>
                  {offer.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Preview */}
      <section className="pb-16 bg-gray-50" style={{ paddingTop: '30px' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center" style={{ marginBottom: '20px' }}>
            <h2 className="font-bold text-gray-900 mb-4" style={{ fontSize: '1rem' }}>
              Comprehensive Pet Care Services
            </h2>
            <p className="text-gray-600 max-w-3xl mx-auto" style={{ fontSize: '1rem' }}>
              From routine wellness to emergency care, we provide complete veterinary services for your pet's health and happiness.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.slice(0, 6).map((service) => (
              <div
                key={service.id}
                className="bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition-all duration-200 hover:-translate-y-1"
              >
                <div className="flex items-center justify-center w-16 h-16 rounded-full mb-6" style={{ backgroundColor: primaryBg }}>
                  <Heart className="h-8 w-8" style={{ color: primaryColor }} />
                </div>
                <h3 className="font-bold text-gray-900 mb-3" style={{ fontSize: '1rem' }}>{service.name}</h3>
                <p className="text-gray-600 mb-4">{service.description}</p>
                <Link
                  to="/services"
                  className="inline-flex items-center font-semibold transition-colors"
                  style={{ color: primaryColor }}
                  onMouseEnter={(e) => e.target.style.color = '#2196c7'}
                  onMouseLeave={(e) => e.target.style.color = primaryColor}
                >
                  Learn More
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link
              to="/services"
              className="inline-flex items-center text-white px-8 py-4 rounded-lg font-semibold transition-colors duration-200"
              style={{ backgroundColor: primaryColor }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#2196c7'}
              onMouseLeave={(e) => e.target.style.backgroundColor = primaryColor}
            >
              View All Services
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center" style={{ marginBottom: '20px' }}>
            <h2 className="font-bold text-gray-900 mb-4" style={{ fontSize: '1rem' }}>
              What Pet Parents Say
            </h2>
            <p className="text-gray-600" style={{ fontSize: '1rem' }}>
              Don't just take our word for it - hear from our satisfied clients
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial) => (
              <div
                key={testimonial.id}
                className="bg-gray-50 p-6 rounded-xl"
              >
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 mb-4 italic">"{testimonial.text}"</p>
                <div>
                  <p className="font-semibold text-gray-900">{testimonial.name}</p>
                  <p className="text-sm text-gray-600">Pet parent to {testimonial.petName}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-16" style={{ background: `linear-gradient(135deg, ${primaryColor} 0%, #2196c7 100%)` }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-bold text-white mb-4" style={{ fontSize: '1rem' }}>
            Ready to Give Your Pet the Best Care?
          </h2>
          <p className="mb-8" style={{ color: primaryLight, fontSize: '1rem' }}>
            Contact us today to schedule an appointment or for emergency care
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
              Get Directions
              <MapPin className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;