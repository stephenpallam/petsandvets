import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Clock, 
  Phone, 
  Calendar,
  AlertCircle,
  CheckCircle,
  MapPin,
  Info
} from 'lucide-react';
import { hospitalInfo, hours } from '../mock';

const OurHours = () => {
  const primaryColor = '#29add3';
  const primaryLight = '#5bc0db';
  const primaryBg = '#e6f7fb';

  const hoursFeatures = [
    {
      title: "Flexible Scheduling",
      description: "Both general practice and urgent care available by appointment",
      icon: Calendar,
      color: "#10b981"
    },
    {
      title: "Urgent Care Available",
      description: "Extended hours for urgent veterinary needs",
      icon: Clock,
      color: "#ef4444"
    },
    {
      title: "Professional Service",
      description: "Quality care during all operating hours",
      icon: CheckCircle,
      color: "#3b82f6"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden" style={{ background: `linear-gradient(135deg, ${primaryBg} 0%, #ffffff 50%, #f0fdff 100%)` }}>
        <div className="absolute inset-0 bg-white/40"></div>
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center" style={{ paddingTop: '40px', paddingBottom: '40px' }}>
          <div className="flex items-center justify-center mb-6">
            <div className="flex items-center justify-center w-16 h-16 rounded-full mr-4" style={{ backgroundColor: primaryBg }}>
              <Clock className="h-8 w-8" style={{ color: primaryColor }} />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
              Our Hours
            </h1>
          </div>
          <p className="text-lg text-gray-700 leading-relaxed max-w-3xl mx-auto">
            Convenient hours to serve your pet's healthcare needs with both general practice and urgent care services
          </p>
        </div>
      </section>

      {/* Hours Features */}
      <section className="bg-white" style={{ paddingTop: '40px', paddingBottom: '40px' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Designed Around Your Schedule
            </h2>
            <p className="text-gray-600 max-w-3xl mx-auto">
              We offer comprehensive hours to accommodate both routine care and urgent medical needs
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {hoursFeatures.map((feature, index) => (
              <div key={index} className="bg-gray-50 p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow text-center">
                <div className="flex items-center justify-center w-16 h-16 rounded-full mx-auto mb-6" style={{ backgroundColor: `${feature.color}15` }}>
                  <feature.icon className="h-8 w-8" style={{ color: feature.color }} />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-700 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Main Hours Display */}
      <section style={{ backgroundColor: primaryBg, paddingTop: '40px', paddingBottom: '40px' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Operating Hours
            </h2>
            <p className="text-gray-700">
              All services are provided by appointment only - please call ahead to schedule
            </p>
          </div>

          {/* Hours Grid - Side by Side */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Urgent Care Hours - Left Side */}
            <div className="bg-white p-8 rounded-xl shadow-lg border-2 border-red-200">
              <h3 className="text-2xl font-bold text-red-900 mb-4 flex items-center">
                <Clock className="mr-3 h-6 w-6 text-red-600" />
                Urgent Care Hours
              </h3>
              <div className="bg-red-50 p-4 rounded-lg mb-6">
                <p className="text-sm font-medium text-red-700 flex items-center">
                  <Info className="w-4 h-4 mr-2" />
                  By Appointment Only
                </p>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600 font-medium">Monday - Friday:</span>
                  <span className="font-bold text-red-600">3:00 PM - 10:00 PM</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600 font-medium">Thursday:</span>
                  <span className="font-medium text-red-600">Closed</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600 font-medium">Saturday:</span>
                  <span className="font-bold text-red-600">10:00 AM - 8:00 PM</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-600 font-medium">Sunday:</span>
                  <span className="font-bold text-red-600">10:00 AM - 6:00 PM</span>
                </div>
              </div>

              <div className="mt-6 p-4 bg-red-50 rounded-lg">
                <p className="text-sm text-red-700">
                  <strong>Urgent Care:</strong> For non-life-threatening conditions that need prompt attention
                </p>
              </div>
            </div>

            {/* General Practice Hours - Right Side */}
            <div className="bg-white p-8 rounded-xl shadow-lg border-2" style={{ borderColor: primaryColor }}>
              <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                <Clock className="mr-3 h-6 w-6" style={{ color: primaryColor }} />
                General Practice Hours
              </h3>
              <div className="p-4 rounded-lg mb-6" style={{ backgroundColor: primaryBg }}>
                <p className="text-sm font-medium flex items-center" style={{ color: primaryColor }}>
                  <Info className="w-4 h-4 mr-2" />
                  By Appointment Only
                </p>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600 font-medium">Monday - Wednesday, Friday:</span>
                  <span className="font-medium text-gray-900">{hours.generalPractice.monday}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600 font-medium">Tuesday:</span>
                  <span className="font-medium text-gray-900">{hours.generalPractice.tuesday}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600 font-medium">Thursday:</span>
                  <span className="font-medium text-red-600">{hours.generalPractice.thursday}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600 font-medium">Saturday:</span>
                  <span className="font-medium text-gray-900">{hours.generalPractice.saturday}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-600 font-medium">Sunday:</span>
                  <span className="font-medium text-red-600">{hours.generalPractice.sunday}</span>
                </div>
              </div>

              <div className="mt-6 p-4 rounded-lg" style={{ backgroundColor: primaryBg }}>
                <p className="text-sm text-gray-700">
                  <strong>General Practice:</strong> Routine checkups, vaccinations, wellness exams, and preventive care
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Important Information */}
      <section className="bg-white" style={{ paddingTop: '40px', paddingBottom: '40px' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Important Information
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Appointment Information */}
            <div className="bg-blue-50 border-2 border-blue-200 p-8 rounded-xl">
              <div className="flex items-start">
                <Calendar className="h-6 w-6 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
                <div>
                  <h3 className="text-lg font-bold text-blue-900 mb-3">Scheduling Appointments</h3>
                  <div className="space-y-2 text-blue-700">
                    <p>• All services require appointments - no walk-ins</p>
                    <p>• Call ahead to secure your preferred time slot</p>
                    <p>• Same-day appointments may be available for urgent care</p>
                    <p>• Please arrive 15 minutes early for your appointment</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Emergency Information */}
            <div className="bg-red-50 border-2 border-red-200 p-8 rounded-xl">
              <div className="flex items-start">
                <AlertCircle className="h-6 w-6 text-red-600 mt-0.5 mr-3 flex-shrink-0" />
                <div>
                  <h3 className="text-lg font-bold text-red-900 mb-3">After-Hours Emergencies</h3>
                  <p className="text-red-700 mb-3">
                    For life-threatening emergencies outside our operating hours, please contact:
                  </p>
                  <div className="bg-red-100 p-3 rounded-lg">
                    <p className="text-red-600 font-semibold">
                      VCA SouthPaws Veterinary Specialists<br />
                      Emergency Center: (703) 752-9100
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Weekly Schedule Overview */}
      <section style={{ backgroundColor: primaryBg, paddingTop: '40px', paddingBottom: '40px' }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white p-8 rounded-xl shadow-lg">
            <h3 className="text-xl font-bold text-gray-900 mb-6 text-center">Weekly Schedule Overview</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-7 gap-4 text-center">
              {[
                { day: 'Mon', general: '8AM-6PM', urgent: '3PM-10PM' },
                { day: 'Tue', general: '8AM-7PM', urgent: '3PM-10PM' },
                { day: 'Wed', general: '8AM-6PM', urgent: '3PM-10PM' },
                { day: 'Thu', general: 'Closed', urgent: 'Closed' },
                { day: 'Fri', general: '8AM-6PM', urgent: '3PM-10PM' },
                { day: 'Sat', general: '8AM-4PM', urgent: '10AM-8PM' },
                { day: 'Sun', general: 'Closed', urgent: '10AM-6PM' }
              ].map((schedule, index) => (
                <div key={index} className="p-4 rounded-lg bg-gray-50">
                  <h4 className="font-bold text-gray-900 mb-2">{schedule.day}</h4>
                  <div className="space-y-1 text-xs">
                    <p className="text-gray-600">General:</p>
                    <p className={`font-medium ${schedule.general === 'Closed' ? 'text-red-600' : 'text-gray-900'}`}>
                      {schedule.general}
                    </p>
                    <p className="text-gray-600 mt-2">Urgent:</p>
                    <p className={`font-medium ${schedule.urgent === 'Closed' ? 'text-red-600' : 'text-red-600'}`}>
                      {schedule.urgent}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section style={{ background: `linear-gradient(135deg, ${primaryColor} 0%, #2196c7 100%)`, paddingTop: '40px', paddingBottom: '40px' }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-bold text-white mb-4 text-xl">
            Ready to Schedule Your Appointment?
          </h2>
          <p className="mb-8 text-white text-lg">
            Call us during our operating hours to book your pet's visit
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
              to="/reach-us"
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

export default OurHours;