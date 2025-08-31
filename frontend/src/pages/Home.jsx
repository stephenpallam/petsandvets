import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Phone, 
  MapPin, 
  Clock, 
  Star, 
  CheckCircle, 
  ArrowRight,
  ChevronRight,
  Heart,
  Shield,
  Award,
  Users,
  Eye,
  Radio,
  Sparkles,
  Scissors,
  Stethoscope,
  Plane
} from 'lucide-react';
import { hospitalInfo, services, specialOffers } from '../mock';
import { useBusinessInfo } from '../hooks/useBusinessInfo';
import axios from 'axios';

const Home = () => {
  const [currentHeroImage, setCurrentHeroImage] = useState(0);
  const [heroImages, setHeroImages] = useState([]);
  const [heroImagesLoading, setHeroImagesLoading] = useState(true);
  const [hospitalHours, setHospitalHours] = useState(null);
  const [urgentCareHours, setUrgentCareHours] = useState(null);
  const [hoursLoading, setHoursLoading] = useState(true);
  const [testimonials, setTestimonials] = useState([]);
  const [testimonialsLoading, setTestimonialsLoading] = useState(true);

  const { businessInfo: currentBusinessInfo } = useBusinessInfo();
  const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || import.meta.env.REACT_APP_BACKEND_URL || window.location.origin;

  // Fetch slider images from API
  useEffect(() => {
    const fetchSliderImages = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/slider-images`);
        if (response.data && response.data.slider_images) {
          // Sort by order field (ascending) to display in proper order
          const sortedImages = response.data.slider_images.sort((a, b) => (a.order || 0) - (b.order || 0));
          setHeroImages(sortedImages);
        }
        setHeroImagesLoading(false);
      } catch (err) {
        console.error('Error fetching slider images:', err);
        // Fallback to static images if API fails
        setHeroImages([
          {
            id: 1,
            title: "Professional Veterinary Care",
            description: "Compassionate care for your beloved pets",
            image_url: "https://customer-assets.emergentagent.com/job_peacock-pet-care/artifacts/ulwulpak_emilee.png",
            order: 0
          },
          {
            id: 2,
            title: "State-of-the-Art Facility",
            description: "Modern equipment and comfortable environment",
            image_url: "https://customer-assets.emergentagent.com/job_peacock-pet-care/artifacts/ej59vv47_vanama.png",
            order: 1
          }
        ]);
        setHeroImagesLoading(false);
      }
    };

    fetchSliderImages();
  }, []);

  // Auto-rotate hero images
  React.useEffect(() => {
    if (heroImages.length > 0) {
      const interval = setInterval(() => {
        setCurrentHeroImage((prev) => (prev + 1) % heroImages.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [heroImages]);

  // Fetch hours from database
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
      } catch (error) {
        console.error('Error fetching hours:', error);
      } finally {
        setHoursLoading(false);
      }
    };

    fetchHours();
  }, []);

  // Fetch reviews from database
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/reviews`);
        if (response.ok) {
          const data = await response.json();
          setTestimonials(data.reviews || []);
        } else {
          // Fallback to empty array if API fails
          setTestimonials([]);
        }
      } catch (error) {
        console.error('Error fetching reviews:', error);
        // Fallback to empty array if API fails
        setTestimonials([]);
      } finally {
        setTestimonialsLoading(false);
      }
    };

    fetchReviews();
  }, []);

  // Helper function to get current day of week
  const getCurrentDay = () => {
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    return days[new Date().getDay()];
  };

  // Helper function to get next open day
  const getNextOpenDay = (hoursData, startFromDay = null) => {
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    
    const startIndex = startFromDay ? days.indexOf(startFromDay) : new Date().getDay();
    
    for (let i = 1; i <= 7; i++) {
      const dayIndex = (startIndex + i) % 7;
      const dayKey = days[dayIndex];
      if (hoursData[dayKey]?.is_open) {
        const dayName = dayNames[dayIndex];
        const openTime = formatTime(hoursData[dayKey].open_time);
        return { day: dayName, time: openTime, isToday: i === 0, isTomorrow: i === 1 };
      }
    }
    return null;
  };

  // Helper function to format time from 24-hour to 12-hour
  const formatTime = (time) => {
    if (!time) return '';
    const [hours, minutes] = time.split(':');
    const hour12 = parseInt(hours) % 12 || 12;
    const ampm = parseInt(hours) >= 12 ? 'PM' : 'AM';
    return `${hour12}:${minutes} ${ampm}`;
  };

  // Helper function to check if currently open
  const isCurrentlyOpen = (dayData) => {
    if (!dayData?.is_open || !dayData.open_time || !dayData.close_time) return false;
    
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes(); // minutes since midnight
    
    const [openHour, openMin] = dayData.open_time.split(':').map(Number);
    const [closeHour, closeMin] = dayData.close_time.split(':').map(Number);
    
    const openTime = openHour * 60 + openMin;
    const closeTime = closeHour * 60 + closeMin;
    
    return currentTime >= openTime && currentTime < closeTime;
  };

  // Helper function to check if opening soon (within 1 hour)
  const isOpeningSoon = (dayData) => {
    if (!dayData?.is_open || !dayData.open_time) return false;
    
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    
    const [openHour, openMin] = dayData.open_time.split(':').map(Number);
    const openTime = openHour * 60 + openMin;
    
    const timeDiff = openTime - currentTime;
    return timeDiff > 0 && timeDiff <= 60; // opening within 1 hour
  };

  // Generate status message for hours display
  const getHoursStatus = (hoursData, type) => {
    if (!hoursData || hoursLoading) {
      return type === 'urgent' ? '3 PM - 10 PM Daily' : '9:00 AM - 6:00 PM Today';
    }

    const currentDay = getCurrentDay();
    const todayHours = hoursData[currentDay];

    if (!todayHours?.is_open) {
      const nextOpen = getNextOpenDay(hoursData);
      if (nextOpen) {
        if (nextOpen.isTomorrow) {
          return `Closed today • Opens tomorrow at ${nextOpen.time}`;
        } else {
          return `Closed today • Opens ${nextOpen.day} at ${nextOpen.time}`;
        }
      }
      return 'Closed today';
    }

    if (isCurrentlyOpen(todayHours)) {
      return `Open now • Closes at ${formatTime(todayHours.close_time)}`;
    }

    if (isOpeningSoon(todayHours)) {
      return `Opening soon at ${formatTime(todayHours.open_time)}`;
    }

    return `${formatTime(todayHours.open_time)} - ${formatTime(todayHours.close_time)} Today`;
  };

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
            <div className="space-y-4">
              <div className="space-y-4">
                <div className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium" style={{ backgroundColor: primaryBg, color: primaryColor }}>
                  <Heart className="h-4 w-4 mr-2" />
                  Where Every Paw Finds Care
                </div>
                <h1 className="font-bold text-gray-900 leading-tight" style={{ fontSize: '2rem' }}>
                  Compassionate Care for Your
                  <span className="block" style={{ color: primaryColor }}>Beloved Pets</span>
                </h1>
                <p className="text-gray-600 leading-relaxed" style={{ fontSize: '1rem' }}>
                  Quality veterinary care and urgent care services for dogs and cats. 
                  Modern facilities, experienced veterinarians, and extended hours to serve all pet owners throughout Northern Virginia.
                </p>
              </div>

              {/* Info and CTA Compartments */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Left Compartment - Urgent Care */}
                <div className="flex flex-col h-full">
                  <div className="flex items-start space-x-3 bg-white/60 backdrop-blur-sm py-4 pr-4 pl-0 rounded-lg h-20 mb-4 flex-shrink-0">
                    <Clock className="h-5 w-5 mt-1" style={{ color: primaryColor }} />
                    <div className="text-left flex-1">
                      <p className="font-semibold text-gray-900">Urgent Care</p>
                      <p className="text-sm text-gray-600 leading-tight">
                        {hoursLoading ? (
                          <span className="animate-pulse">Loading hours...</span>
                        ) : (
                          getHoursStatus(urgentCareHours, 'urgent')
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="flex-1 flex items-end">
                    <Link
                      to="/urgent-care-booking"
                      className="inline-flex items-center justify-center border-2 px-8 py-4 rounded-lg font-semibold transition-all duration-200 w-full"
                      style={{ 
                        borderColor: primaryColor, 
                        color: primaryColor,
                        height: '56px'
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
                      Check In Online
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                  </div>
                </div>

                {/* Right Compartment - General Practice */}
                <div className="flex flex-col h-full">
                  <div className="flex items-start space-x-3 bg-white/60 backdrop-blur-sm py-4 pr-4 pl-0 rounded-lg h-20 mb-4 flex-shrink-0">
                    <MapPin className="h-5 w-5 mt-1" style={{ color: primaryColor }} />
                    <div className="text-left flex-1">
                      <p className="font-semibold text-gray-900">General Practice</p>
                      <p className="text-sm text-gray-600 leading-tight">
                        {hoursLoading ? (
                          <span className="animate-pulse">Loading hours...</span>
                        ) : (
                          getHoursStatus(hospitalHours, 'general')
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="flex-1 flex items-end">
                    <a
                      href={`tel:${currentBusinessInfo.phone}`}
                      className="inline-flex items-center justify-center text-white px-8 py-4 rounded-lg font-semibold transition-all duration-200 shadow-lg hover:shadow-xl group w-full"
                      style={{ backgroundColor: primaryColor, height: '56px' }}
                      onMouseEnter={(e) => e.target.style.backgroundColor = '#2196c7'}
                      onMouseLeave={(e) => e.target.style.backgroundColor = primaryColor}
                    >
                      Call Now
                      <Phone className="ml-2 h-5 w-5 group-hover:scale-110 transition-transform" />
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Content - Hero Image */}
            <div className="relative">
              {heroImagesLoading ? (
                <div className="relative rounded-2xl overflow-hidden shadow-2xl bg-gray-100 flex items-center justify-center" style={{ height: '25rem' }}>
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
              ) : heroImages.length > 0 ? (
                <>
                  <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                    {/* Image Stack for Smooth Transitions */}
                    <div className="relative w-full" style={{ height: '25rem' }}>
                      {heroImages.map((image, index) => (
                        <div
                          key={image.id}
                          className={`absolute inset-0 transition-all duration-1000 ease-in-out transform ${
                            index === currentHeroImage 
                              ? 'opacity-100 scale-100 translate-x-0' 
                              : 'opacity-0 scale-105 translate-x-4'
                          }`}
                        >
                          <img
                            src={image.image_url}
                            alt={image.title}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'flex';
                            }}
                          />
                          <div className="hidden w-full h-full items-center justify-center bg-gray-100 absolute inset-0">
                            <div className="text-center text-gray-500">
                              <Users className="h-16 w-16 mx-auto mb-2" />
                              <p>Image not available</p>
                            </div>
                          </div>
                          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                          
                          {/* Image title and description overlay */}
                          <div className={`absolute bottom-6 left-6 right-6 text-white transition-all duration-700 delay-300 ${
                            index === currentHeroImage 
                              ? 'opacity-100 translate-y-0' 
                              : 'opacity-0 translate-y-4'
                          }`}>
                            <h3 className="text-xl font-bold mb-2">{image.title}</h3>
                            <p className="text-sm opacity-90">{image.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {/* Slider Indicators */}
                    {heroImages.length > 1 && (
                      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                        {heroImages.map((_, index) => (
                          <button
                            key={index}
                            onClick={() => setCurrentHeroImage(index)}
                            className={`w-2 h-2 rounded-full transition-all duration-300 ${
                              index === currentHeroImage 
                                ? 'bg-white scale-125' 
                                : 'bg-white/50 hover:bg-white/75'
                            }`}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                  

                </>
              ) : (
                <div className="relative rounded-2xl overflow-hidden shadow-2xl bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center" style={{ height: '25rem' }}>
                  <div className="text-center text-blue-600">
                    <Users className="h-16 w-16 mx-auto mb-4" />
                    <h3 className="text-xl font-bold mb-2">Professional Veterinary Care</h3>
                    <p className="text-sm opacity-75">Compassionate care for your beloved pets</p>
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>
      </section>

      {/* Urgent Care Section */}
      <section style={{ backgroundColor: primaryColor, paddingTop: '30px', paddingBottom: '30px' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center" style={{ marginBottom: '20px' }}>
            <div className="inline-flex items-center justify-center mb-4">
              <div className="h-px bg-white/30 flex-grow max-w-24"></div>
              <div className="mx-4 px-6 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20">
                <h2 className="font-bold text-white text-lg tracking-wide">
                  Urgent Care
                </h2>
              </div>
              <div className="h-px bg-white/30 flex-grow max-w-24"></div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="relative p-6 rounded-xl transition-all duration-200 hover:scale-105 bg-white text-gray-900 shadow-xl">
              <CheckCircle className="h-8 w-8 mb-4" style={{ color: primaryColor }} />
              <h3 className="font-bold mb-2" style={{ fontSize: '1rem' }}>Poison or Toxin Exposure</h3>
              <p className="text-gray-600">
                Rapid treatment including safe induced vomiting and detox protocols
              </p>
            </div>

            <div className="relative p-6 rounded-xl transition-all duration-200 hover:scale-105 text-white" style={{ backgroundColor: '#2196c7' }}>
              <CheckCircle className="h-8 w-8 mb-4" style={{ color: primaryLight }} />
              <h3 className="font-bold mb-2" style={{ fontSize: '1rem' }}>Upper Respiratory Infections</h3>
              <p className="text-blue-100">
                Our team will diagnose the issue and recommend the best treatment to help your pet breathe easier and recover quickly
              </p>
            </div>

            <div className="relative p-6 rounded-xl transition-all duration-200 hover:scale-105 bg-white text-gray-900 shadow-xl">
              <CheckCircle className="h-8 w-8 mb-4" style={{ color: primaryColor }} />
              <h3 className="font-bold mb-2" style={{ fontSize: '1rem' }}>Urinary Concerns</h3>
              <p className="text-gray-600">
                Evaluation and care for straining, blood, or frequent attempts
              </p>
            </div>

            <div className="relative p-6 rounded-xl transition-all duration-200 hover:scale-105 text-white" style={{ backgroundColor: '#2196c7' }}>
              <CheckCircle className="h-8 w-8 mb-4" style={{ color: primaryLight }} />
              <h3 className="font-bold mb-2" style={{ fontSize: '1rem' }}>Diarrhea & Vomiting</h3>
              <p className="text-blue-100">
                We quickly diagnose and treat pet GI issues like vomiting and diarrhea—bringing relief to your pet and peace of mind to you
              </p>
            </div>

            <div className="relative p-6 rounded-xl transition-all duration-200 hover:scale-105 bg-white text-gray-900 shadow-xl">
              <CheckCircle className="h-8 w-8 mb-4" style={{ color: primaryColor }} />
              <h3 className="font-bold mb-2" style={{ fontSize: '1rem' }}>Coughing & Sneezing</h3>
              <p className="text-gray-600">
                Diagnostics and treatment plans tailored to breed and symptoms for persistent coughing and sneezing episodes
              </p>
            </div>

            <div className="relative p-6 rounded-xl transition-all duration-200 hover:scale-105 text-white" style={{ backgroundColor: '#2196c7' }}>
              <CheckCircle className="h-8 w-8 mb-4" style={{ color: primaryLight }} />
              <h3 className="font-bold mb-2" style={{ fontSize: '1rem' }}>Allergic Reactions</h3>
              <p className="text-blue-100">
                Treatment for hives, facial swelling, and itching
              </p>
            </div>
          </div>

          {/* All Urgent Care Services Button */}
          <div className="text-center mt-8">
            <Link
              to="/urgent-care"
              className="inline-flex items-center justify-center px-8 py-3 bg-white text-gray-900 font-semibold rounded-lg hover:bg-gray-100 transition-colors duration-200 shadow-lg"
            >
              View All Services
              <ChevronRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* General Practice Pet Care */}
      <section className="bg-gray-50" style={{ paddingTop: '30px', paddingBottom: '30px' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center" style={{ marginBottom: '20px' }}>
            <div className="inline-flex items-center justify-center mb-4">
              <div className="h-px bg-gray-300 flex-grow max-w-24"></div>
              <div className="mx-4 px-6 py-2 bg-white backdrop-blur-sm rounded-full border border-gray-200 shadow-sm">
                <h2 className="font-bold text-gray-900 text-lg tracking-wide">
                  General Practice Pet Care
                </h2>
              </div>
              <div className="h-px bg-gray-300 flex-grow max-w-24"></div>
            </div>
            <p className="text-gray-600 max-w-3xl mx-auto" style={{ fontSize: '1rem' }}>
              Comprehensive preventive and routine veterinary services to keep your pet healthy throughout their life.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Vaccinations */}
            <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition-all duration-200 hover:-translate-y-1">
              <div className="flex items-center justify-center w-16 h-16 rounded-full mb-6" style={{ backgroundColor: '#10b98115' }}>
                <Shield className="h-8 w-8" style={{ color: '#10b981' }} />
              </div>
              <h3 className="font-bold text-gray-900 mb-3" style={{ fontSize: '1rem' }}>Vaccinations</h3>
              <p className="text-gray-600 mb-4">Essential immunizations to protect your pet from serious diseases like parvovirus, distemper, and rabies with tailored vaccination schedules.</p>
              <Link
                to="/pet-vaccinations"
                className="inline-flex items-center font-semibold transition-colors"
                style={{ color: '#10b981' }}
                onMouseEnter={(e) => e.target.style.color = '#059669'}
                onMouseLeave={(e) => e.target.style.color = '#10b981'}
              >
                Learn More
                <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </div>

            {/* Wellness Exams */}
            <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition-all duration-200 hover:-translate-y-1">
              <div className="flex items-center justify-center w-16 h-16 rounded-full mb-6" style={{ backgroundColor: primaryBg }}>
                <Stethoscope className="h-8 w-8" style={{ color: primaryColor }} />
              </div>
              <h3 className="font-bold text-gray-900 mb-3" style={{ fontSize: '1rem' }}>Wellness Exams</h3>
              <p className="text-gray-600 mb-4">Comprehensive physical assessments including eye exams, heart screening, and full body evaluations to detect health issues early.</p>
              <Link
                to="/preventive-pet-care"
                className="inline-flex items-center font-semibold transition-colors"
                style={{ color: primaryColor }}
                onMouseEnter={(e) => e.target.style.color = '#2196c7'}
                onMouseLeave={(e) => e.target.style.color = primaryColor}
              >
                Learn More
                <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </div>

            {/* Microchipping */}
            <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition-all duration-200 hover:-translate-y-1">
              <div className="flex items-center justify-center w-16 h-16 rounded-full mb-6" style={{ backgroundColor: '#3b82f615' }}>
                <Radio className="h-8 w-8" style={{ color: '#3b82f6' }} />
              </div>
              <h3 className="font-bold text-gray-900 mb-3" style={{ fontSize: '1rem' }}>Microchipping</h3>
              <p className="text-gray-600 mb-4">Permanent identification system using a tiny electronic chip to help reunite you with your lost pet quickly and safely.</p>
              <Link
                to="/pet-microchipping"
                className="inline-flex items-center font-semibold transition-colors"
                style={{ color: '#3b82f6' }}
                onMouseEnter={(e) => e.target.style.color = '#2563eb'}
                onMouseLeave={(e) => e.target.style.color = '#3b82f6'}
              >
                Learn More
                <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </div>

            {/* Dental Cleaning */}
            <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition-all duration-200 hover:-translate-y-1">
              <div className="flex items-center justify-center w-16 h-16 rounded-full mb-6" style={{ backgroundColor: '#f59e0b15' }}>
                <Sparkles className="h-8 w-8" style={{ color: '#f59e0b' }} />
              </div>
              <h3 className="font-bold text-gray-900 mb-3" style={{ fontSize: '1rem' }}>Dental Cleaning</h3>
              <p className="text-gray-600 mb-4">Professional dental care including plaque removal, dental X-rays, and comprehensive oral examinations for optimal dental health.</p>
              <Link
                to="/dental-cleanings"
                className="inline-flex items-center font-semibold transition-colors"
                style={{ color: '#f59e0b' }}
                onMouseEnter={(e) => e.target.style.color = '#d97706'}
                onMouseLeave={(e) => e.target.style.color = '#f59e0b'}
              >
                Learn More
                <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </div>

            {/* Travel Certificates */}
            <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition-all duration-200 hover:-translate-y-1">
              <div className="flex items-center justify-center w-16 h-16 rounded-full mb-6" style={{ backgroundColor: '#8b5cf615' }}>
                <Plane className="h-8 w-8" style={{ color: '#8b5cf6' }} />
              </div>
              <h3 className="font-bold text-gray-900 mb-3" style={{ fontSize: '1rem' }}>Travel Certificates</h3>
              <p className="text-gray-600 mb-4">Domestic Health Certificates for safe pet travel by air, road, or sea. Federally accredited veterinarian certification within 10 days of departure.</p>
              <Link
                to="/pet-travel-certificates"
                className="inline-flex items-center font-semibold transition-colors"
                style={{ color: '#8b5cf6' }}
                onMouseEnter={(e) => e.target.style.color = '#7c3aed'}
                onMouseLeave={(e) => e.target.style.color = '#8b5cf6'}
              >
                Learn More
                <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </div>

            {/* Spay & Neuter */}
            <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition-all duration-200 hover:-translate-y-1">
              <div className="flex items-center justify-center w-16 h-16 rounded-full mb-6" style={{ backgroundColor: '#8b5cf615' }}>
                <Scissors className="h-8 w-8" style={{ color: '#8b5cf6' }} />
              </div>
              <h3 className="font-bold text-gray-900 mb-3" style={{ fontSize: '1rem' }}>Spay & Neuter</h3>
              <p className="text-gray-600 mb-4">Safe surgical procedures to prevent diseases, reduce behavioral issues, and support responsible pet ownership with health and community benefits.</p>
              <Link
                to="/pet-spay-neuter"
                className="inline-flex items-center font-semibold transition-colors"
                style={{ color: '#8b5cf6' }}
                onMouseEnter={(e) => e.target.style.color = '#7c3aed'}
                onMouseLeave={(e) => e.target.style.color = '#8b5cf6'}
              >
                Learn More
                <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </div>
          </div>

          {/* View All Button */}
          <div className="text-center mt-8">
            <Link
              to="/services"
              className="inline-flex items-center justify-center px-8 py-3 font-semibold rounded-lg transition-colors duration-200 shadow-lg hover:shadow-xl"
              style={{ 
                backgroundColor: primaryColor,
                color: 'white'
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#2196c7'}
              onMouseLeave={(e) => e.target.style.backgroundColor = primaryColor}
            >
              View All Services
              <ChevronRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-white" style={{ paddingTop: '30px', paddingBottom: '30px' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center" style={{ marginBottom: '20px' }}>
            <div className="inline-flex items-center justify-center mb-4">
              <div className="h-px bg-gray-300 flex-grow max-w-24"></div>
              <div className="mx-4 px-6 py-2 bg-white backdrop-blur-sm rounded-full border border-gray-200 shadow-sm">
                <h2 className="font-bold text-gray-900 text-lg tracking-wide">
                  What Pet Parents Say
                </h2>
              </div>
              <div className="h-px bg-gray-300 flex-grow max-w-24"></div>
            </div>
            <p className="text-gray-600" style={{ fontSize: '1rem' }}>
              Don't just take our word for it - hear from our satisfied clients
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonialsLoading ? (
              // Loading state
              [...Array(3)].map((_, i) => (
                <div key={i} className="bg-gray-50 p-6 rounded-xl animate-pulse">
                  <div className="flex items-center mb-4">
                    {[...Array(5)].map((_, j) => (
                      <div key={j} className="h-5 w-5 bg-gray-300 rounded mr-1"></div>
                    ))}
                  </div>
                  <div className="h-4 bg-gray-300 rounded mb-2"></div>
                  <div className="h-4 bg-gray-300 rounded mb-4"></div>
                  <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                </div>
              ))
            ) : testimonials.length > 0 ? (
              // Display testimonials
              testimonials.map((testimonial) => (
                <div
                  key={testimonial.id}
                  className="bg-gray-50 p-6 rounded-xl"
                >
                  <div className="flex items-center mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-gray-700 mb-4 italic">"{testimonial.text}"</p>
                  <div>
                    <p className="font-semibold text-gray-900">{testimonial.owner_name}</p>
                    <p className="text-sm text-gray-600">Pet parent to {testimonial.pet_name}</p>
                  </div>
                </div>
              ))
            ) : (
              // No testimonials available
              <div className="col-span-full text-center py-8">
                <p className="text-gray-500">No customer reviews available yet.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section style={{ background: `linear-gradient(135deg, ${primaryColor} 0%, #2196c7 100%)`, paddingTop: '30px', paddingBottom: '30px' }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-bold text-white mb-4" style={{ fontSize: '1rem' }}>
            Ready to Give Your Pet the Best Care?
          </h2>
          <p className="mb-8" style={{ color: 'white', fontSize: '1rem' }}>
            Contact us today to schedule an appointment or for urgent care
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

export default Home;