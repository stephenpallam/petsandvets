import React, { useState, useEffect } from 'react';
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
import { hospitalInfo } from '../mock';

const OurHours = () => {
  const [hospitalHours, setHospitalHours] = useState(null);
  const [urgentCareHours, setUrgentCareHours] = useState(null);
  const [specialHours, setSpecialHours] = useState([]);
  const [loading, setLoading] = useState(true);

  const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || import.meta.env.REACT_APP_BACKEND_URL;

  const primaryColor = '#29add3';
  const primaryLight = '#5bc0db';
  const primaryBg = '#e6f7fb';

  // Helper function to format time from 24-hour to 12-hour
  const formatTime = (time) => {
    if (!time) return '';
    const [hours, minutes] = time.split(':');
    const hour12 = parseInt(hours) % 12 || 12;
    const ampm = parseInt(hours) >= 12 ? 'PM' : 'AM';
    return `${hour12}:${minutes} ${ampm}`;
  };

  // Helper function to format day hours
  const formatDayHours = (dayData) => {
    if (!dayData || !dayData.is_open) {
      return 'Closed';
    }
    return `${formatTime(dayData.open_time)} - ${formatTime(dayData.close_time)}`;
  };

  // Helper function to get short format for weekly overview
  const getShortTimeFormat = (dayData) => {
    if (!dayData || !dayData.is_open) {
      return 'Closed';
    }
    const openTime = formatTime(dayData.open_time);
    const closeTime = formatTime(dayData.close_time);
    // Convert to shorter format like "8AM-6PM"
    return `${openTime.replace(':00', '').replace(' ', '')}-${closeTime.replace(':00', '').replace(' ', '')}`;
  };

  useEffect(() => {
    const fetchHours = async () => {
      try {
        // Fetch hospital hours
        const hospitalResponse = await fetch(`${API_BASE_URL}/api/hospital-hours`);
        if (hospitalResponse.ok) {
          const hospitalData = await hospitalResponse.json();
          setHospitalHours(hospitalData);
        }

        // Fetch urgent care hours
        const urgentResponse = await fetch(`${API_BASE_URL}/api/urgent-care-hours`);
        if (urgentResponse.ok) {
          const urgentData = await urgentResponse.json();
          setUrgentCareHours(urgentData);
        }

        // Fetch special hours
        const specialResponse = await fetch(`${API_BASE_URL}/api/special-hours`);
        if (specialResponse.ok) {
          const specialData = await specialResponse.json();
          setSpecialHours(specialData);
        }
      } catch (error) {
        console.error('Error fetching hours:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchHours();
  }, []);

  // Default fallback data
  const defaultHours = {
    hospital: {
      monday: { is_open: true, open_time: '09:00', close_time: '18:00' },
      tuesday: { is_open: true, open_time: '09:00', close_time: '19:00' },
      wednesday: { is_open: true, open_time: '09:00', close_time: '18:00' },
      thursday: { is_open: false },
      friday: { is_open: true, open_time: '09:00', close_time: '18:00' },
      saturday: { is_open: true, open_time: '08:00', close_time: '16:00' },
      sunday: { is_open: false }
    },
    urgent: {
      monday: { is_open: true, open_time: '15:00', close_time: '22:00' },
      tuesday: { is_open: true, open_time: '15:00', close_time: '22:00' },
      wednesday: { is_open: true, open_time: '15:00', close_time: '22:00' },
      thursday: { is_open: false },
      friday: { is_open: true, open_time: '15:00', close_time: '22:00' },
      saturday: { is_open: true, open_time: '10:00', close_time: '20:00' },
      sunday: { is_open: true, open_time: '10:00', close_time: '18:00' }
    }
  };

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
      <section className="bg-white">
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center" style={{ paddingTop: '30px', paddingBottom: '15px' }}>
          <h1 className="text-xl font-bold text-gray-900 mb-6">
            Our Hours
          </h1>
          <div className="mb-6">
            <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold text-white" style={{ backgroundColor: primaryColor }}>
              <Clock className="mr-2 h-4 w-4" />
              Always Here When You Need Us
            </span>
          </div>
          <div className="max-w-3xl mx-auto mb-8">
            <p className="text-gray-700 mb-2">
              All services are provided by appointment only - please call ahead to schedule
            </p>
            <p className="text-gray-700">
              Convenient hours to serve your pet's healthcare needs with both general practice and urgent care services
            </p>
          </div>
        </div>
      </section>

      {/* Hours Section */}
      <section style={{ backgroundColor: '#f8f9fa', paddingTop: '40px', paddingBottom: '40px' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-gray-700 mb-2">
              All services are provided by appointment only - please call ahead to schedule
            </p>
            <p className="text-gray-700">
              Convenient hours to serve your pet's healthcare needs with both general practice and urgent care services
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
                  <span className="text-gray-600 font-medium">Monday:</span>
                  <span className={`font-medium ${
                    (urgentCareHours?.monday?.is_open ?? defaultHours.urgent.monday.is_open) ? 'text-red-600' : 'text-red-600'
                  }`}>
                    {urgentCareHours ? formatDayHours(urgentCareHours.monday) : formatDayHours(defaultHours.urgent.monday)}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600 font-medium">Tuesday:</span>
                  <span className={`font-medium ${
                    (urgentCareHours?.tuesday?.is_open ?? defaultHours.urgent.tuesday.is_open) ? 'text-red-600' : 'text-red-600'
                  }`}>
                    {urgentCareHours ? formatDayHours(urgentCareHours.tuesday) : formatDayHours(defaultHours.urgent.tuesday)}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600 font-medium">Wednesday:</span>
                  <span className={`font-medium ${
                    (urgentCareHours?.wednesday?.is_open ?? defaultHours.urgent.wednesday.is_open) ? 'text-red-600' : 'text-red-600'
                  }`}>
                    {urgentCareHours ? formatDayHours(urgentCareHours.wednesday) : formatDayHours(defaultHours.urgent.wednesday)}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600 font-medium">Thursday:</span>
                  <span className={`font-medium ${
                    (urgentCareHours?.thursday?.is_open ?? defaultHours.urgent.thursday.is_open) ? 'text-red-600' : 'text-red-600'
                  }`}>
                    {urgentCareHours ? formatDayHours(urgentCareHours.thursday) : formatDayHours(defaultHours.urgent.thursday)}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600 font-medium">Friday:</span>
                  <span className={`font-medium ${
                    (urgentCareHours?.friday?.is_open ?? defaultHours.urgent.friday.is_open) ? 'text-red-600' : 'text-red-600'
                  }`}>
                    {urgentCareHours ? formatDayHours(urgentCareHours.friday) : formatDayHours(defaultHours.urgent.friday)}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600 font-medium">Saturday:</span>
                  <span className={`font-medium ${
                    (urgentCareHours?.saturday?.is_open ?? defaultHours.urgent.saturday.is_open) ? 'text-red-600' : 'text-red-600'
                  }`}>
                    {urgentCareHours ? formatDayHours(urgentCareHours.saturday) : formatDayHours(defaultHours.urgent.saturday)}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-600 font-medium">Sunday:</span>
                  <span className={`font-medium ${
                    (urgentCareHours?.sunday?.is_open ?? defaultHours.urgent.sunday.is_open) ? 'text-red-600' : 'text-red-600'
                  }`}>
                    {urgentCareHours ? formatDayHours(urgentCareHours.sunday) : formatDayHours(defaultHours.urgent.sunday)}
                  </span>
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
                  <span className="text-gray-600 font-medium">Monday:</span>
                  <span className={`font-medium ${
                    (hospitalHours?.monday?.is_open ?? defaultHours.hospital.monday.is_open) ? 'text-gray-900' : 'text-red-600'
                  }`}>
                    {hospitalHours ? formatDayHours(hospitalHours.monday) : formatDayHours(defaultHours.hospital.monday)}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600 font-medium">Tuesday:</span>
                  <span className={`font-medium ${
                    (hospitalHours?.tuesday?.is_open ?? defaultHours.hospital.tuesday.is_open) ? 'text-gray-900' : 'text-red-600'
                  }`}>
                    {hospitalHours ? formatDayHours(hospitalHours.tuesday) : formatDayHours(defaultHours.hospital.tuesday)}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600 font-medium">Wednesday:</span>
                  <span className={`font-medium ${
                    (hospitalHours?.wednesday?.is_open ?? defaultHours.hospital.wednesday.is_open) ? 'text-gray-900' : 'text-red-600'
                  }`}>
                    {hospitalHours ? formatDayHours(hospitalHours.wednesday) : formatDayHours(defaultHours.hospital.wednesday)}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600 font-medium">Thursday:</span>
                  <span className={`font-medium ${
                    (hospitalHours?.thursday?.is_open ?? defaultHours.hospital.thursday.is_open) ? 'text-gray-900' : 'text-red-600'
                  }`}>
                    {hospitalHours ? formatDayHours(hospitalHours.thursday) : formatDayHours(defaultHours.hospital.thursday)}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600 font-medium">Friday:</span>
                  <span className={`font-medium ${
                    (hospitalHours?.friday?.is_open ?? defaultHours.hospital.friday.is_open) ? 'text-gray-900' : 'text-red-600'
                  }`}>
                    {hospitalHours ? formatDayHours(hospitalHours.friday) : formatDayHours(defaultHours.hospital.friday)}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600 font-medium">Saturday:</span>
                  <span className={`font-medium ${
                    (hospitalHours?.saturday?.is_open ?? defaultHours.hospital.saturday.is_open) ? 'text-gray-900' : 'text-red-600'
                  }`}>
                    {hospitalHours ? formatDayHours(hospitalHours.saturday) : formatDayHours(defaultHours.hospital.saturday)}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-600 font-medium">Sunday:</span>
                  <span className={`font-medium ${
                    (hospitalHours?.sunday?.is_open ?? defaultHours.hospital.sunday.is_open) ? 'text-gray-900' : 'text-red-600'
                  }`}>
                    {hospitalHours ? formatDayHours(hospitalHours.sunday) : formatDayHours(defaultHours.hospital.sunday)}
                  </span>
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
      <section style={{ backgroundColor: '#f8f9fa', paddingTop: '40px', paddingBottom: '40px' }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white p-8 rounded-xl shadow-lg">
            <h3 className="text-xl font-bold text-gray-900 mb-6 text-center">
              Weekly Schedule Overview
              {loading && <span className="ml-2 text-sm text-gray-500">(Loading...)</span>}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-7 gap-4 text-center">
              {[
                { day: 'Mon', key: 'monday' },
                { day: 'Tue', key: 'tuesday' },
                { day: 'Wed', key: 'wednesday' },
                { day: 'Thu', key: 'thursday' },
                { day: 'Fri', key: 'friday' },
                { day: 'Sat', key: 'saturday' },
                { day: 'Sun', key: 'sunday' }
              ].map((schedule, index) => {
                const hospitalDay = hospitalHours?.[schedule.key] ?? defaultHours.hospital[schedule.key];
                const urgentDay = urgentCareHours?.[schedule.key] ?? defaultHours.urgent[schedule.key];
                
                return (
                  <div key={index} className="p-4 rounded-lg bg-gray-50">
                    <h4 className="font-bold text-gray-900 mb-2">{schedule.day}</h4>
                    <div className="space-y-1 text-xs">
                      <p className="text-gray-600">General:</p>
                      <p className={`font-medium ${!hospitalDay?.is_open ? 'text-red-600' : 'text-gray-900'}`}>
                        {getShortTimeFormat(hospitalDay)}
                      </p>
                      <p className="text-gray-600 mt-2">Urgent:</p>
                      <p className={`font-medium ${!urgentDay?.is_open ? 'text-red-600' : 'text-red-600'}`}>
                        {getShortTimeFormat(urgentDay)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Hours Features - Moved to Bottom */}
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