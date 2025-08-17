import React from 'react';
import { 
  Heart, 
  Stethoscope, 
  Activity, 
  Search, 
  Smile, 
  HeartHandshake, 
  Bird,
  CheckCircle,
  Clock,
  DollarSign
} from 'lucide-react';
import { services, specialOffers } from '../mock';

const Services = () => {
  const iconMap = {
    stethoscope: Stethoscope,
    heart: Heart,
    activity: Activity,
    search: Search,
    smile: Smile,
    'heart-handshake': HeartHandshake,
    bird: Bird
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-emerald-600 to-teal-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Comprehensive Pet Care Services
            </h1>
            <p className="text-xl md:text-2xl text-emerald-100 max-w-4xl mx-auto leading-relaxed">
              From routine wellness to emergency care, we provide complete veterinary services 
              with modern equipment and compassionate care.
            </p>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service) => {
              const IconComponent = iconMap[service.icon] || Heart;
              return (
                <div
                  key={service.id}
                  className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 overflow-hidden"
                >
                  <div className="p-8">
                    <div className="flex items-center justify-center w-16 h-16 bg-emerald-100 rounded-full mb-6">
                      <IconComponent className="h-8 w-8 text-emerald-600" />
                    </div>
                    
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">
                      {service.name}
                    </h3>
                    
                    <p className="text-gray-600 mb-4 leading-relaxed">
                      {service.description}
                    </p>
                    
                    <div className="border-t border-gray-200 pt-4">
                      <p className="text-sm text-gray-700">
                        {service.details}
                      </p>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 px-8 py-4">
                    <button className="text-emerald-600 font-semibold hover:text-emerald-700 transition-colors text-sm">
                      Learn More →
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Special Services Highlight */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose Our Services?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We combine modern medical technology with compassionate care to provide the best possible outcomes for your pets.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="flex items-center justify-center w-16 h-16 bg-emerald-100 rounded-full mx-auto mb-6">
                <Clock className="h-8 w-8 text-emerald-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Walk-In Urgent Care</h3>
              <p className="text-gray-600">
                No appointment necessary for urgent care. We're here when your pet needs immediate attention, 
                7 days a week from 11 AM to 8 PM.
              </p>
            </div>

            <div className="text-center p-6">
              <div className="flex items-center justify-center w-16 h-16 bg-emerald-100 rounded-full mx-auto mb-6">
                <Activity className="h-8 w-8 text-emerald-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Modern Equipment</h3>
              <p className="text-gray-600">
                State-of-the-art diagnostic equipment including VETSCAN HM5 analyzer, iM3 Pro-2000 dental machine, 
                and advanced surgical facilities.
              </p>
            </div>

            <div className="text-center p-6">
              <div className="flex items-center justify-center w-16 h-16 bg-emerald-100 rounded-full mx-auto mb-6">
                <DollarSign className="h-8 w-8 text-emerald-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Affordable Pricing</h3>
              <p className="text-gray-600">
                Quality care at affordable prices with special discounts for seniors, veterans, 
                first responders, and service animals.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing & Packages */}
      <section className="py-16 bg-emerald-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Affordable Care Packages
            </h2>
            <p className="text-xl text-gray-600">
              We believe quality veterinary care should be accessible to all pet families
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {specialOffers.map((offer) => (
              <div
                key={offer.id}
                className={`p-6 rounded-xl transition-all duration-200 hover:scale-105 ${
                  offer.highlight
                    ? 'bg-emerald-600 text-white shadow-xl'
                    : 'bg-white text-gray-900 shadow-md'
                }`}
              >
                {offer.highlight && (
                  <div className="text-center mb-4">
                    <span className="bg-yellow-400 text-gray-900 px-3 py-1 rounded-full text-xs font-bold">
                      MOST POPULAR
                    </span>
                  </div>
                )}
                
                <div className="flex items-center mb-4">
                  <CheckCircle className={`h-6 w-6 mr-3 ${offer.highlight ? 'text-emerald-200' : 'text-emerald-600'}`} />
                  <h3 className="text-xl font-bold">{offer.title}</h3>
                </div>
                
                <p className={`mb-6 ${offer.highlight ? 'text-emerald-100' : 'text-gray-600'}`}>
                  {offer.description}
                </p>
                
                <button className={`w-full py-3 px-6 rounded-lg font-semibold transition-colors ${
                  offer.highlight
                    ? 'bg-white text-emerald-600 hover:bg-gray-100'
                    : 'bg-emerald-600 text-white hover:bg-emerald-700'
                }`}>
                  Learn More
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-emerald-600 to-teal-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Schedule Your Pet's Care?
          </h2>
          <p className="text-xl text-emerald-100 mb-8">
            Contact us today to discuss your pet's needs or for emergency care
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white text-emerald-600 px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-colors duration-200">
              Schedule Appointment
            </button>
            <button className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-emerald-600 transition-colors duration-200">
              Emergency Care
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Services;