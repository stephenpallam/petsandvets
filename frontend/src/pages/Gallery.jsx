import React, { useState } from 'react';
import { X, Camera, MapPin, Clock } from 'lucide-react';
import { facilityImages } from '../mock';

const Gallery = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [filter, setFilter] = useState('all');

  const categories = [
    { id: 'all', name: 'All Facilities' },
    { id: 'reception', name: 'Reception Area' },
    { id: 'exam', name: 'Exam Rooms' },
    { id: 'surgery', name: 'Surgery Suite' },
    { id: 'equipment', name: 'Medical Equipment' }
  ];

  const getImageCategory = (title) => {
    if (title.toLowerCase().includes('reception') || title.toLowerCase().includes('seating')) return 'reception';
    if (title.toLowerCase().includes('exam')) return 'exam';
    if (title.toLowerCase().includes('surgery')) return 'surgery';
    return 'equipment';
  };

  const filteredImages = filter === 'all' 
    ? facilityImages 
    : facilityImages.filter(img => getImageCategory(img.title) === filter);

  const openLightbox = (image) => {
    setSelectedImage(image);
  };

  const closeLightbox = () => {
    setSelectedImage(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-emerald-600 to-teal-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center mb-6">
              <Camera className="h-12 w-12 text-emerald-200 mr-4" />
              <h1 className="text-4xl md:text-6xl font-bold">
                Facility Gallery
              </h1>
            </div>
            <p className="text-xl md:text-2xl text-emerald-100 max-w-4xl mx-auto leading-relaxed">
              Take a virtual tour of our modern, state-of-the-art veterinary facility 
              designed for your pet's comfort and care.
            </p>
          </div>
        </div>
      </section>

      {/* Filter Tabs */}
      <section className="py-8 bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap justify-center gap-4">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setFilter(category.id)}
                className={`px-6 py-3 rounded-full font-medium transition-all duration-200 ${
                  filter === category.id
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery Grid */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {filteredImages.length === 0 ? (
            <div className="text-center py-12">
              <Camera className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-xl text-gray-600">No images found for this category.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredImages.map((image) => (
                <div
                  key={image.id}
                  className="group relative bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-2 cursor-pointer"
                  onClick={() => openLightbox(image)}
                >
                  <div className="relative overflow-hidden">
                    <img
                      src={image.url}
                      alt={image.title}
                      className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <div className="bg-white/20 backdrop-blur-sm rounded-full p-3">
                        <Camera className="h-6 w-6 text-white" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      {image.title}
                    </h3>
                    <p className="text-gray-600 text-sm">
                      {image.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Feature Highlights */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Modern Facilities & Equipment
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our hospital features the latest veterinary technology and comfortable spaces 
              designed with your pet's wellbeing in mind.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6 bg-gray-50 rounded-xl">
              <div className="flex items-center justify-center w-16 h-16 bg-emerald-100 rounded-full mx-auto mb-6">
                <Camera className="h-8 w-8 text-emerald-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Modern Design</h3>
              <p className="text-gray-600">
                Clean, contemporary spaces designed to reduce stress for both pets and their families, 
                with natural lighting and calming colors throughout.
              </p>
            </div>

            <div className="text-center p-6 bg-gray-50 rounded-xl">
              <div className="flex items-center justify-center w-16 h-16 bg-emerald-100 rounded-full mx-auto mb-6">
                <MapPin className="h-8 w-8 text-emerald-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Strategic Location</h3>
              <p className="text-gray-600">
                Conveniently located in South Riding with easy access and ample parking, 
                making visits stress-free for you and your pet.
              </p>
            </div>

            <div className="text-center p-6 bg-gray-50 rounded-xl">
              <div className="flex items-center justify-center w-16 h-16 bg-emerald-100 rounded-full mx-auto mb-6">
                <Clock className="h-8 w-8 text-emerald-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Efficient Service</h3>
              <p className="text-gray-600">
                Streamlined processes and well-organized spaces ensure minimal wait times 
                and maximum comfort during your visit.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-emerald-600 to-teal-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Visit Our Facility?
          </h2>
          <p className="text-xl text-emerald-100 mb-8">
            Experience our modern, comfortable environment designed for exceptional pet care
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white text-emerald-600 px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-colors duration-200">
              Schedule a Tour
            </button>
            <button className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-emerald-600 transition-colors duration-200">
              Contact Us
            </button>
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
              src={selectedImage.url}
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