import React, { useState } from 'react';
import { 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  Send,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { useToast } from '../hooks/use-toast';
import { hospitalInfo, hours, mockAPI } from '../mock';

const Contact = () => {
  const { toast } = useToast();
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    phone: '',
    petName: '',
    message: '',
    serviceType: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const serviceTypes = [
    'General Inquiry',
    'Schedule Appointment',
    'Urgent Care',
    'Surgery Consultation',
    'Dental Care',
    'Wellness Exam',
    'Exotic Pet Care',
    'Other'
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setContactForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await mockAPI.submitContactForm(contactForm);
      
      if (response.success) {
        toast({
          title: "Message Sent Successfully!",
          description: response.message,
          duration: 5000,
        });
        
        // Reset form
        setContactForm({
          name: '',
          email: '',
          phone: '',
          petName: '',
          message: '',
          serviceType: ''
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to send message. Please try again or call us directly.",
        duration: 5000,
      });
    }

    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-emerald-600 to-teal-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Contact Us
            </h1>
            <p className="text-xl md:text-2xl text-emerald-100 max-w-4xl mx-auto leading-relaxed">
              We're here to help with all your pet care needs. Contact us for appointments, 
              emergency care, or any questions about our services.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Info Cards */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {/* Address */}
            <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow text-center">
              <div className="flex items-center justify-center w-16 h-16 bg-emerald-100 rounded-full mx-auto mb-4">
                <MapPin className="h-8 w-8 text-emerald-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Visit Us</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                {hospitalInfo.address}
              </p>
              <p className="text-emerald-600 text-sm mt-2 font-medium">
                (Beside Sweet Frog)
              </p>
            </div>

            {/* Phone */}
            <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow text-center">
              <div className="flex items-center justify-center w-16 h-16 bg-emerald-100 rounded-full mx-auto mb-4">
                <Phone className="h-8 w-8 text-emerald-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Call Us</h3>
              <a 
                href={`tel:${hospitalInfo.phone}`}
                className="text-emerald-600 font-semibold hover:text-emerald-700 transition-colors text-lg"
              >
                {hospitalInfo.phone}
              </a>
              <p className="text-gray-600 text-sm mt-2">
                Call for appointments or emergencies
              </p>
            </div>

            {/* Email */}
            <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow text-center">
              <div className="flex items-center justify-center w-16 h-16 bg-emerald-100 rounded-full mx-auto mb-4">
                <Mail className="h-8 w-8 text-emerald-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Email Us</h3>
              <a 
                href={`mailto:${hospitalInfo.email}`}
                className="text-emerald-600 font-semibold hover:text-emerald-700 transition-colors"
              >
                {hospitalInfo.email}
              </a>
              <p className="text-gray-600 text-sm mt-2">
                Send us your questions
              </p>
            </div>

            {/* Emergency */}
            <div className="bg-red-50 p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow text-center border-2 border-red-200">
              <div className="flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mx-auto mb-4">
                <AlertCircle className="h-8 w-8 text-red-600" />
              </div>
              <h3 className="text-lg font-bold text-red-900 mb-2">Emergency</h3>
              <p className="text-red-700 font-semibold">
                11 AM - 8 PM Daily
              </p>
              <p className="text-red-600 text-sm mt-2">
                Walk-ins welcome for urgent care
              </p>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div className="bg-white p-8 rounded-xl shadow-lg">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Send Us a Message
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                      Your Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      required
                      value={contactForm.name}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                      placeholder="John Doe"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      required
                      value={contactForm.email}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                      placeholder="john@example.com"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={contactForm.phone}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                      placeholder="(555) 123-4567"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="petName" className="block text-sm font-medium text-gray-700 mb-2">
                      Pet's Name
                    </label>
                    <input
                      type="text"
                      id="petName"
                      name="petName"
                      value={contactForm.petName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                      placeholder="Fluffy"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="serviceType" className="block text-sm font-medium text-gray-700 mb-2">
                    Service Type
                  </label>
                  <select
                    id="serviceType"
                    name="serviceType"
                    value={contactForm.serviceType}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                  >
                    <option value="">Select a service...</option>
                    {serviceTypes.map((service) => (
                      <option key={service} value={service}>
                        {service}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                    Message *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    required
                    rows={5}
                    value={contactForm.message}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors resize-none"
                    placeholder="Tell us about your pet's needs or any questions you have..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-emerald-600 text-white px-6 py-4 rounded-lg font-semibold hover:bg-emerald-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-5 w-5" />
                      Send Message
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Hours & Info */}
            <div className="space-y-8">
              {/* Hours */}
              <div className="bg-white p-8 rounded-xl shadow-lg">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                  <Clock className="mr-3 h-6 w-6 text-emerald-600" />
                  Hospital Hours
                </h2>
                
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">General Practice</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Monday - Wednesday, Friday:</span>
                        <span className="font-medium text-gray-900">{hours.generalPractice.monday}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Tuesday:</span>
                        <span className="font-medium text-gray-900">{hours.generalPractice.tuesday}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Thursday:</span>
                        <span className="font-medium text-red-600">{hours.generalPractice.thursday}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Saturday:</span>
                        <span className="font-medium text-gray-900">{hours.generalPractice.saturday}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Sunday:</span>
                        <span className="font-medium text-red-600">{hours.generalPractice.sunday}</span>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-gray-200 pt-6">
                    <h3 className="text-lg font-semibold text-emerald-600 mb-4">Urgent Care</h3>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Every Day:</span>
                      <span className="font-bold text-emerald-600">{hours.urgentCare.everyday}</span>
                    </div>
                    <p className="text-sm text-emerald-600 mt-2 font-medium">
                      Walk-ins welcome • No appointment necessary
                    </p>
                  </div>
                </div>
              </div>

              {/* Emergency Notice */}
              <div className="bg-red-50 border-2 border-red-200 p-6 rounded-xl">
                <div className="flex items-start">
                  <AlertCircle className="h-6 w-6 text-red-600 mt-0.5 mr-3 flex-shrink-0" />
                  <div>
                    <h3 className="text-lg font-bold text-red-900 mb-2">Emergency Care</h3>
                    <p className="text-red-700 mb-3">
                      If your pet is experiencing a life-threatening emergency outside our urgent care hours, 
                      please contact your nearest 24-hour emergency animal hospital immediately.
                    </p>
                    <p className="text-red-600 font-semibold">
                      For urgent care during our hours: Call {hospitalInfo.phone}
                    </p>
                  </div>
                </div>
              </div>

              {/* Directions */}
              <div className="bg-white p-8 rounded-xl shadow-lg">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                  <MapPin className="mr-3 h-6 w-6 text-emerald-600" />
                  Location & Directions
                </h2>
                
                <div className="space-y-4">
                  <div>
                    <p className="text-gray-700 leading-relaxed">
                      {hospitalInfo.address}
                    </p>
                    <p className="text-emerald-600 font-medium mt-1">
                      Located beside Sweet Frog in Peacock Market Plaza
                    </p>
                  </div>
                  
                  <div className="pt-4 border-t border-gray-200">
                    <h4 className="font-semibold text-gray-900 mb-2">Parking</h4>
                    <p className="text-gray-600 text-sm">
                      Ample free parking available in front of the building and throughout the plaza.
                    </p>
                  </div>
                  
                  <button className="w-full bg-emerald-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-emerald-700 transition-colors duration-200">
                    Get Directions
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;