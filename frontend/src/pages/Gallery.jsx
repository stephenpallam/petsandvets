import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { X, Camera, MapPin, Clock, Phone } from 'lucide-react';
import { hospitalInfo }
import { useBusinessInfo } from '../mock';
import axios from 'axios';

const Gallery = () => {
  const { businessInfo: currentBusinessInfo } = useBusinessInfo();
  const [selectedImage, setSelectedImage] = useState(null);
  const [facilityPhotos, setFacilityPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const primaryColor = '#29add3';
  const primaryLight = '#5bc0db';
  const primaryBg = '#e6f7fb';

  // Fetch facility photos from API
  useEffect(() => {
    const fetchFacilityPhotos = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/facility-photos`);
        if (response.data && response.data.facility_photos) {
          // Sort by order field (ascending) to display in proper order
          const sortedPhotos = response.data.facility_photos.sort((a, b) => (a.order || 0) - (b.order || 0));
          setFacilityPhotos(sortedPhotos);
        }
        setLoading(false);
      } catch (err) {
        console.error('Error fetching facility photos:', err);
        setError('Failed to load facility photos');
        setLoading(false);
      }
    };

    fetchFacilityPhotos();
  }, []);

  const openLightbox = (image) => {
    setSelectedImage(image);
  };

  const closeLightbox = () => {
    setSelectedImage(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section - Mobile Only */}
      <section className="text-white sticky z-40 block md:hidden" style={{ top: '4rem', background: `linear-gradient(135deg, ${primaryColor} 0%, #2196c7 100%)`, paddingTop: '0.5rem', paddingBottom: '0.5rem' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="font-bold" style={{ fontSize: '1.125rem' }}>
              Facility Gallery
            </h1>
          </div>
        </div>
      </section>

      {/* Hero Section */}
      <section className="bg-white">
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center" style={{ paddingTop: '30px', paddingBottom: '15px' }}>
          <h1 className="text-xl font-bold text-gray-900 mb-6">
            Our Facility
          </h1>
          <div className="mb-6">
            <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold text-white" style={{ backgroundColor: primaryColor }}>
              Modern Design • Strategic Location • Efficient Service
            </span>
          </div>
          <p className="text-base text-gray-600 leading-relaxed max-w-3xl mx-auto">
            Our hospital features the latest veterinary technology and comfortable spaces 
            designed with your pet's wellbeing in mind.
          </p>
        </div>
      </section>

      {/* Gallery Grid */}
      <section className="bg-[#f8f9fa] py-6">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl font-bold text-gray-900 mb-8 text-center">
            Facility Gallery
          </h2>
          
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <span className="ml-4 text-gray-600">Loading facility photos...</span>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <Camera className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-xl text-gray-600 mb-4">{error}</p>
              <p className="text-gray-500 text-sm">Please try refreshing the page or contact us if the problem persists.</p>
            </div>
          ) : facilityPhotos.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {facilityPhotos.map((photo) => (
                <div
                  key={photo.id}
                  className="group relative bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-2 cursor-pointer"
                  onClick={() => openLightbox(photo)}
                >
                  <div className="relative overflow-hidden">
                    <div className="w-full h-48 bg-gray-100 overflow-hidden">
                      <img
                        src={photo.photo_url}
                        alt={photo.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                      <div className="hidden w-full h-full items-center justify-center bg-gray-100">
                        <Camera className="h-12 w-12 text-gray-400" />
                      </div>
                    </div>
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <div className="bg-white/20 backdrop-blur-sm rounded-full p-3">
                        <Camera className="h-6 w-6 text-white" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4">
                    <h3 className="text-lg font-bold text-gray-900 mb-2">
                      {photo.title}
                    </h3>
                    <p className="text-gray-600 text-sm">
                      {photo.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Camera className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Facility Photos Coming Soon</h3>
              <p className="text-gray-600">We're updating our facility gallery. Please check back soon to see our modern veterinary facility.</p>
            </div>
          )}
        </div>
      </section>

      {/* Feature Highlights */}
      <section className="bg-white py-6">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl font-bold text-gray-900 mb-8 text-center">
            Modern Facilities & Equipment
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-6 bg-gray-50 rounded-xl shadow-md">
              <div className="flex items-center justify-center w-12 h-12 rounded-full mx-auto mb-4" style={{ backgroundColor: `${primaryColor}15` }}>
                <Camera className="h-6 w-6" style={{ color: primaryColor }} />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Modern Design</h3>
              <p className="text-gray-600 text-sm">
                Clean, contemporary spaces designed to reduce stress for both pets and their families, 
                with natural lighting and calming colors throughout.
              </p>
            </div>

            <div className="text-center p-6 bg-gray-50 rounded-xl shadow-md">
              <div className="flex items-center justify-center w-12 h-12 rounded-full mx-auto mb-4" style={{ backgroundColor: `${primaryColor}15` }}>
                <MapPin className="h-6 w-6" style={{ color: primaryColor }} />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Strategic Location</h3>
              <p className="text-gray-600 text-sm">
                Conveniently located in South Riding with easy access and ample parking, 
                making visits stress-free for you and your pet.
              </p>
            </div>

            <div className="text-center p-6 bg-gray-50 rounded-xl shadow-md">
              <div className="flex items-center justify-center w-12 h-12 rounded-full mx-auto mb-4" style={{ backgroundColor: `${primaryColor}15` }}>
                <Clock className="h-6 w-6" style={{ color: primaryColor }} />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Efficient Service</h3>
              <p className="text-gray-600 text-sm">
                Streamlined processes and well-organized spaces ensure minimal wait times 
                and maximum comfort during your visit.
              </p>
            </div>
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
              href={`tel:${currentBusinessInfo.phone}`}
              className="inline-flex items-center justify-center bg-white px-8 py-3 rounded-lg font-semibold transition-colors duration-200"
              style={{ color: primaryColor }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#f9fafb'}
              onMouseLeave={(e) => e.target.style.backgroundColor = 'white'}
            >
              <Phone className="mr-2 h-5 w-5" />
              Call Now: {currentBusinessInfo.phone}
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
              Reach Us
              <MapPin className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Lightbox Modal */}
      {selectedImage && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4" onClick={closeLightbox}>
          <div className="relative max-w-4xl max-h-full">
            <button
              onClick={closeLightbox}
              className="absolute top-4 right-4 text-white hover:text-gray-300 z-10"
            >
              <X className="h-8 w-8" />
            </button>
            
            <img
              src={selectedImage.photo_url}
              alt={selectedImage.title}
              className="max-w-full max-h-full object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
            
            <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white p-6 rounded-b-lg">
              <h3 className="text-2xl font-bold mb-2">{selectedImage.title}</h3>
              <p className="text-gray-300">{selectedImage.description}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Gallery;