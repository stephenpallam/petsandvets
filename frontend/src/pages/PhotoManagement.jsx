import React, { useState, useEffect, useCallback } from 'react';
import { Image, Upload, Trash2, Eye, Camera, Users, Building2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

// Slider Image Management Section Component
const SliderSection = ({ 
  sliderImages, 
  showSliderForm, 
  setShowSliderForm,
  editingSlider,
  setEditingSlider,
  sliderForm,
  handleSliderFormChange,
  handleSliderUpload,
  handleUpdateSlider,
  handleDeleteSlider,
  startEditSlider,
  uploading,
  error,
  setError,
  API_BASE_URL
}) => (
  <div className="space-y-6">
    {/* Add New Slider Image */}
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-medium text-blue-900">Add New Slider Image</h3>
          <p className="text-sm text-blue-700">Upload an image for the home page hero carousel with title and description</p>
        </div>
        <button
          onClick={() => setShowSliderForm(!showSliderForm)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          {showSliderForm ? 'Cancel' : 'Add Slider Image'}
        </button>
      </div>

      {showSliderForm && (
        <div className="mt-4 bg-white rounded-lg p-4 border border-blue-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
              <input
                key="slider-title-input"
                type="text"
                name="title"
                value={sliderForm.title}
                onChange={handleSliderFormChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Professional Veterinary Care"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Display Order</label>
              <input
                key="slider-order-input"
                type="number"
                name="order"
                value={sliderForm.order}
                onChange={handleSliderFormChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0"
                min="0"
              />
            </div>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
            <textarea
              key="slider-description-input"
              name="description"
              value={sliderForm.description}
              onChange={handleSliderFormChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Compassionate veterinary care for your beloved pets with state-of-the-art facilities"
              required
            />
          </div>

          <div className="border-2 border-dashed border-blue-300 rounded-lg p-4 text-center">
            <Image className="h-8 w-8 mx-auto text-blue-400 mb-2" />
            <p className="text-sm text-blue-700 mb-2">Upload Slider Image</p>
            <p className="text-xs text-blue-600 mb-3">Recommended size: 1920x800px for best results</p>
            
            {/* Check if all required fields are filled */}
            {sliderForm.title && sliderForm.description ? (
              <label className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors cursor-pointer">
                <Upload className="h-4 w-4 mr-2" />
                {uploading ? 'Creating Slider Image...' : 'Choose Image & Create'}
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files[0]) {
                      handleSliderUpload(e.target.files[0], true);
                      e.target.value = '';
                    }
                  }}
                  disabled={uploading}
                  className="hidden"
                />
              </label>
            ) : (
              <div>
                <button
                  disabled
                  className="inline-flex items-center px-4 py-2 bg-gray-300 text-gray-500 rounded-md cursor-not-allowed"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Choose Image & Create
                </button>
                <p className="text-xs text-red-600 mt-2">Please fill in title and description first</p>
              </div>
            )}
            
            {uploading && (
              <div className="mt-2 flex items-center justify-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                <span className="text-xs text-blue-600">Uploading and creating slider image...</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>

    {/* Existing Slider Images */}
    {sliderImages && sliderImages.length > 0 ? (
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Slider Images ({sliderImages.length})
        </h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {sliderImages.map((image) => (
            <div key={`slider-image-${image.id}`} className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
              {editingSlider === image.id ? (
                /* Edit Form */
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                      <input
                        key={`edit-slider-title-${image.id}`}
                        type="text"
                        name="title"
                        value={sliderForm.title}
                        onChange={handleSliderFormChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Order</label>
                      <input
                        key={`edit-slider-order-${image.id}`}
                        type="number"
                        name="order"
                        value={sliderForm.order}
                        onChange={handleSliderFormChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        min="0"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                      key={`edit-slider-description-${image.id}`}
                      name="description"
                      value={sliderForm.description}
                      onChange={handleSliderFormChange}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  {/* Current Image and Replacement */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Current Image</label>
                    <div className="flex items-center space-x-4">
                      <div className="w-24 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                        <img
                          src={image.image_url}
                          alt={image.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                        <div className="hidden w-full h-full items-center justify-center bg-gray-100">
                          <Image className="h-6 w-6 text-gray-400" />
                        </div>
                      </div>
                      <div>
                        <label className="inline-flex items-center px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded cursor-pointer hover:bg-blue-200 transition-colors">
                          <Upload className="h-3 w-3 mr-1" />
                          Replace Image
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              if (e.target.files[0]) {
                                handleSliderImageReplace(e.target.files[0]);
                                e.target.value = '';
                              }
                            }}
                            className="hidden"
                          />
                        </label>
                        <p className="text-xs text-gray-500 mt-1">Recommended: 1920x800px</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-between">
                    <button
                      onClick={() => handleDeleteSlider(image.id)}
                      className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                    >
                      Delete Image
                    </button>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setEditingSlider(null)}
                        className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleUpdateSlider(image.id)}
                        className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                      >
                        Save
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                /* Display Mode */
                <div className="flex items-start space-x-4">
                  <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                    <img
                      src={image.image_url}
                      alt={image.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                    <div className="hidden w-full h-full items-center justify-center bg-gray-100">
                      <Image className="h-8 w-8 text-gray-400" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-lg font-medium text-gray-900">{image.title}</h4>
                    <p className="text-gray-600 text-sm mb-2 line-clamp-3">{image.description}</p>
                    <p className="text-gray-500 text-xs">Order: {image.order || 0}</p>
                  </div>
                  <div className="flex flex-col space-y-1">
                    <button
                      onClick={() => startEditSlider(image)}
                      className="p-1 text-blue-600 hover:text-blue-700 transition-colors"
                      title="Edit"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteSlider(image.id)}
                      className="p-1 text-red-600 hover:text-red-700 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    ) : (
      <div className="text-center py-12 bg-gray-50 rounded-lg">
        <Image className="h-16 w-16 mx-auto text-gray-300 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No slider images added yet</h3>
        <p className="text-gray-600">Add your first slider image to get started</p>
      </div>
    )}
  </div>
);

// Facility Photo Management Section Component
const FacilitySection = ({ 
  facilityPhotos, 
  showFacilityForm, 
  setShowFacilityForm,
  editingFacility,
  setEditingFacility,
  facilityForm,
  handleFacilityFormChange,
  handleFacilityUpload,
  handleUpdateFacility,
  handleDeleteFacility,
  startEditFacility,
  error,
  setError,
  API_BASE_URL
}) => (
  <div className="space-y-6">
    {/* Add New Facility Photo */}
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-medium text-blue-900">Add New Facility Photo</h3>
          <p className="text-sm text-blue-700">Upload a photo and add title and description</p>
        </div>
        <button
          onClick={() => setShowFacilityForm(!showFacilityForm)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          {showFacilityForm ? 'Cancel' : 'Add Photo'}
        </button>
      </div>

      {showFacilityForm && (
        <div className="mt-4 bg-white rounded-lg p-4 border border-blue-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
              <input
                key="title-input"
                type="text"
                name="title"
                value={facilityForm.title}
                onChange={handleFacilityFormChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Reception Area"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Display Order</label>
              <input
                key="order-input"
                type="number"
                name="order"
                value={facilityForm.order}
                onChange={handleFacilityFormChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0"
                min="0"
              />
            </div>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <textarea
              key="description-input"
              name="description"
              value={facilityForm.description}
              onChange={handleFacilityFormChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Simple & elegant barn style reception area"
              required
            />
          </div>

          <div className="border-2 border-dashed border-blue-300 rounded-lg p-4 text-center">
            <Building2 className="h-8 w-8 mx-auto text-blue-400 mb-2" />
            <p className="text-sm text-blue-700 mb-2">Upload Facility Photo</p>
            <p className="text-xs text-blue-600 mb-3">Recommended size: 400x300px (4:3 aspect ratio) for best results</p>
            <label className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors cursor-pointer">
              <Upload className="h-4 w-4 mr-2" />
              Choose Photo & Create
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  if (e.target.files[0] && facilityForm.title && facilityForm.description) {
                    handleFacilityUpload(e.target.files[0], true);
                    e.target.value = '';
                  } else {
                    setError('Please fill in title and description before uploading photo');
                  }
                }}
                className="hidden"
              />
            </label>
            <p className="text-xs text-blue-600 mt-1">Fill title and description first</p>
          </div>
        </div>
      )}
    </div>

    {/* Existing Facility Photos */}
    {facilityPhotos && facilityPhotos.length > 0 ? (
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Facility Photos ({facilityPhotos.length})
        </h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {facilityPhotos.map((photo) => (
            <div key={`facility-photo-${photo.id}`} className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
              {editingFacility === photo.id ? (
                /* Edit Form */
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                      <input
                        key={`edit-title-${photo.id}`}
                        type="text"
                        name="title"
                        value={facilityForm.title}
                        onChange={handleFacilityFormChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Order</label>
                      <input
                        key={`edit-order-${photo.id}`}
                        type="number"
                        name="order"
                        value={facilityForm.order}
                        onChange={handleFacilityFormChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        min="0"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                      key={`edit-description-${photo.id}`}
                      name="description"
                      value={facilityForm.description}
                      onChange={handleFacilityFormChange}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  {/* Current Image and Replacement */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Current Image</label>
                    <div className="flex items-center space-x-4">
                      <div className="w-24 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                        <img
                          src={photo.photo_url}
                          alt={photo.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                        <div className="hidden w-full h-full items-center justify-center bg-gray-100">
                          <Building2 className="h-6 w-6 text-gray-400" />
                        </div>
                      </div>
                      <div>
                        <label className="inline-flex items-center px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded cursor-pointer hover:bg-blue-200 transition-colors">
                          <Upload className="h-3 w-3 mr-1" />
                          Replace Image
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              if (e.target.files[0]) {
                                handleFacilityImageReplace(e.target.files[0]);
                                e.target.value = '';
                              }
                            }}
                            className="hidden"
                          />
                        </label>
                        <p className="text-xs text-gray-500 mt-1">Recommended: 400x300px</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-between">
                    <button
                      onClick={() => handleDeleteFacility(photo.id)}
                      className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                    >
                      Delete Photo
                    </button>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setEditingFacility(null)}
                        className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleUpdateFacility(photo.id)}
                        className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                      >
                        Save
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                /* Display Mode */
                <div className="flex items-start space-x-4">
                  <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                    <img
                      src={photo.photo_url}
                      alt={photo.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                    <div className="hidden w-full h-full items-center justify-center bg-gray-100">
                      <Building2 className="h-8 w-8 text-gray-400" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-lg font-medium text-gray-900">{photo.title}</h4>
                    <p className="text-gray-600 text-sm mb-2 line-clamp-3">{photo.description}</p>
                    <p className="text-gray-500 text-xs">Order: {photo.order || 0}</p>
                  </div>
                  <div className="flex flex-col space-y-1">
                    <button
                      onClick={() => startEditFacility(photo)}
                      className="p-1 text-blue-600 hover:text-blue-700 transition-colors"
                      title="Edit"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteFacility(photo.id)}
                      className="p-1 text-red-600 hover:text-red-700 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    ) : (
      <div className="text-center py-12 bg-gray-50 rounded-lg">
        <Building2 className="h-16 w-16 mx-auto text-gray-300 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No facility photos added yet</h3>
        <p className="text-gray-600">Add your first facility photo to get started</p>
      </div>
    )}
  </div>
);

// Team Member Management Section Component (outside main component to prevent re-creation)
const TeamMemberSection = ({ 
  teamMembers, 
  showTeamMemberForm, 
  setShowTeamMemberForm,
  editingTeamMember,
  setEditingTeamMember,
  teamMemberForm,
  handleTeamMemberFormChange,
  handleFileUpload,
  handleUpdateTeamMember,
  handleDeleteTeamMember,
  startEditTeamMember,
  uploading,
  error,
  setError,
  API_BASE_URL
}) => (
  <div className="space-y-6">
    {/* Add New Team Member */}
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-medium text-blue-900">Add New Team Member</h3>
          <p className="text-sm text-blue-700">Upload a photo and fill in team member details</p>
        </div>
        <button
          onClick={() => setShowTeamMemberForm(!showTeamMemberForm)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          {showTeamMemberForm ? 'Cancel' : 'Add Team Member'}
        </button>
      </div>

      {showTeamMemberForm && (
        <div className="mt-4 bg-white rounded-lg p-4 border border-blue-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Name *</label>
              <input
                key="name-input"
                type="text"
                name="name"
                value={teamMemberForm.name}
                onChange={handleTeamMemberFormChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Dr. Jennifer Smith"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
              <input
                key="title-input"
                type="text"
                name="title"
                value={teamMemberForm.title}
                onChange={handleTeamMemberFormChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Lead Veterinarian"
                required
              />
            </div>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Bio *</label>
            <textarea
              key="bio-input"
              name="bio"
              value={teamMemberForm.bio}
              onChange={handleTeamMemberFormChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Dr. Smith has over 15 years of experience in veterinary medicine and specializes in internal medicine and surgery."
              required
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Credentials *</label>
            <input
              key="credentials-input"
              type="text"
              name="credentials"
              value={teamMemberForm.credentials}
              onChange={handleTeamMemberFormChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="DVM from Virginia Tech"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Display Order</label>
            <input
              key="order-input"
              type="number"
              name="order"
              value={teamMemberForm.order}
              onChange={handleTeamMemberFormChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="0"
              min="0"
            />
          </div>

          <div className="border-2 border-dashed border-blue-300 rounded-lg p-4 text-center">
            <Users className="h-8 w-8 mx-auto text-blue-400 mb-2" />
            <p className="text-sm text-blue-700 mb-2">Upload Team Member Photo</p>
            <p className="text-xs text-blue-600 mb-3">Recommended size: 400x300px (4:3 aspect ratio) for best results</p>
            
            {/* Check if all required fields are filled */}
            {teamMemberForm.name && teamMemberForm.title && teamMemberForm.bio && teamMemberForm.credentials ? (
              <label className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors cursor-pointer">
                <Upload className="h-4 w-4 mr-2" />
                {uploading ? 'Creating Team Member...' : 'Choose Photo & Create Team Member'}
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files[0]) {
                      handleFileUpload('team', e.target.files[0], true);
                      e.target.value = '';
                    }
                  }}
                  disabled={uploading}
                  className="hidden"
                />
              </label>
            ) : (
              <div>
                <button
                  disabled
                  className="inline-flex items-center px-4 py-2 bg-gray-300 text-gray-500 rounded-md cursor-not-allowed"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Choose Photo & Create Team Member
                </button>
                <p className="text-xs text-red-600 mt-2">Please fill in all required fields (*) above first</p>
              </div>
            )}
            
            {uploading && (
              <div className="mt-2 flex items-center justify-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                <span className="text-xs text-blue-600">Uploading and creating team member...</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>

    {/* Existing Team Members */}
    {teamMembers && teamMembers.length > 0 ? (
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Team Members ({teamMembers.length})
        </h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {teamMembers.map((member) => (
            <div key={`team-member-${member.id}`} className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
              {editingTeamMember === member.id ? (
                /* Edit Form */
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                      <input
                        key={`edit-name-${member.id}`}
                        type="text"
                        name="name"
                        value={teamMemberForm.name}
                        onChange={handleTeamMemberFormChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                      <input
                        key={`edit-title-${member.id}`}
                        type="text"
                        name="title"
                        value={teamMemberForm.title}
                        onChange={handleTeamMemberFormChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                    <textarea
                      key={`edit-bio-${member.id}`}
                      name="bio"
                      value={teamMemberForm.bio}
                      onChange={handleTeamMemberFormChange}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Credentials</label>
                    <input
                      key={`edit-credentials-${member.id}`}
                      type="text"
                      name="credentials"
                      value={teamMemberForm.credentials}
                      onChange={handleTeamMemberFormChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  {/* Current Image and Replacement */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Current Photo</label>
                    <div className="flex items-center space-x-4">
                      <div className="w-24 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                        <img
                          src={member.photo_url}
                          alt={member.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                        <div className="hidden w-full h-full items-center justify-center bg-gray-100">
                          <Users className="h-6 w-6 text-gray-400" />
                        </div>
                      </div>
                      <div>
                        <label className="inline-flex items-center px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded cursor-pointer hover:bg-blue-200 transition-colors">
                          <Upload className="h-3 w-3 mr-1" />
                          Replace Photo
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              if (e.target.files[0]) {
                                handleTeamImageReplace(e.target.files[0]);
                                e.target.value = '';
                              }
                            }}
                            className="hidden"
                          />
                        </label>
                        <p className="text-xs text-gray-500 mt-1">Recommended: 400x300px</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-between">
                    <button
                      onClick={() => handleDeleteTeamMember(member.id)}
                      className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                    >
                      Delete Team Member
                    </button>
                    <div className="flex space-x-2">
                    <button
                      onClick={() => setEditingTeamMember(null)}
                      className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleUpdateTeamMember(member.id)}
                      className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      Save
                    </button>
                  </div>
                </div>
              ) : (
                /* Display Mode */
                <div className="flex items-start space-x-4">
                  <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                    <img
                      src={member.photo_url}
                      alt={member.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                    <div className="hidden w-full h-full items-center justify-center bg-gray-100">
                      <Users className="h-8 w-8 text-gray-400" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-lg font-medium text-gray-900">{member.name}</h4>
                    <p className="text-blue-600 text-sm font-medium mb-2">{member.title}</p>
                    <p className="text-gray-600 text-sm mb-2 line-clamp-2">{member.bio}</p>
                    <p className="text-gray-500 text-xs">{member.credentials}</p>
                  </div>
                  <div className="flex flex-col space-y-1">
                    <button
                      onClick={() => startEditTeamMember(member)}
                      className="p-1 text-blue-600 hover:text-blue-700 transition-colors"
                      title="Edit"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteTeamMember(member.id)}
                      className="p-1 text-red-600 hover:text-red-700 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    ) : (
      <div className="text-center py-12 bg-gray-50 rounded-lg">
        <Users className="h-16 w-16 mx-auto text-gray-300 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No team members added yet</h3>
        <p className="text-gray-600">Add your first team member to get started</p>
      </div>
    )}
  </div>
);

const PhotoManagement = () => {
  const [activeTab, setActiveTab] = useState('homepageslider');
  const [uploadedFiles, setUploadedFiles] = useState({
    homepageslider: [],
    team: [],
    facility: []
  });
  const [teamMembers, setTeamMembers] = useState([]);
  const [facilityPhotos, setFacilityPhotos] = useState([]);
  const [sliderImages, setSliderImages] = useState([]);
  const [showTeamMemberForm, setShowTeamMemberForm] = useState(false);
  const [showFacilityForm, setShowFacilityForm] = useState(false);
  const [showSliderForm, setShowSliderForm] = useState(false);
  const [editingTeamMember, setEditingTeamMember] = useState(null);
  const [editingFacility, setEditingFacility] = useState(null);
  const [editingSlider, setEditingSlider] = useState(null);
  const [teamMemberForm, setTeamMemberForm] = useState({
    name: '',
    title: '',
    bio: '',
    credentials: '',
    photo_url: '',
    order: 0
  });
  const [facilityForm, setFacilityForm] = useState({
    title: '',
    description: '',
    photo_url: '',
    order: 0
  });
  const [sliderForm, setSliderForm] = useState({
    title: '',
    description: '',
    image_url: '',
    order: 0
  });
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const { user, token, isAdmin } = useAuth();
  const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || import.meta.env.REACT_APP_BACKEND_URL;

  const tabs = [
    {
      id: 'homepageslider',
      name: 'Home Page Slider',
      icon: Camera,
      description: 'Manage images for the home page hero carousel'
    },
    {
      id: 'team',
      name: 'Team',
      icon: Users,
      description: 'Upload and manage team member photos'
    },
    {
      id: 'facility',
      name: 'Facility',
      icon: Building2,
      description: 'Manage photos of your clinic and facilities'
    }
  ];

  const fetchUploadedFiles = async () => {
    const categories = ['homepageslider', 'team', 'facility'];
    const files = {};
    
    for (const category of categories) {
      try {
        const response = await fetch(`${API_BASE_URL}/api/files/${category}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          files[category] = data.files || [];
        } else {
          files[category] = [];
        }
      } catch (err) {
        console.error(`Error fetching ${category} files:`, err);
        files[category] = [];
      }
    }
    
    setUploadedFiles(files);
  };

  const fetchTeamMembers = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/team-members`);
      if (response.ok) {
        const data = await response.json();
        setTeamMembers(data.team_members || []);
      }
    } catch (err) {
      console.error('Error fetching team members:', err);
      setTeamMembers([]);
    }
  };

  useEffect(() => {
    if (user && isAdmin()) {
      const loadData = async () => {
        await fetchUploadedFiles();
        await fetchTeamMembers();
        await fetchFacilityPhotos();
        await fetchSliderImages();
        setLoading(false);
      };
      loadData();
    } else if (user && !isAdmin()) {
      setError('Access denied. Admin privileges required.');
      setLoading(false);
    } else {
      setError('Please log in as an admin to manage photos.');
      setLoading(false);
    }
  }, [user]);

  const handleTeamMemberFormChange = useCallback((e) => {
    const { name, value } = e.target;
    setTeamMemberForm(prev => ({
      ...prev,
      [name]: value
    }));
  }, []);

  const handleFacilityFormChange = useCallback((e) => {
    const { name, value } = e.target;
    setFacilityForm(prev => ({
      ...prev,
      [name]: value
    }));
  }, []);

  const handleSliderFormChange = useCallback((e) => {
    const { name, value } = e.target;
    setSliderForm(prev => ({
      ...prev,
      [name]: value
    }));
  }, []);

  const handleCreateTeamMember = async (photoUrl) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/team-members`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...teamMemberForm,
          photo_url: photoUrl
        })
      });

      if (response.ok) {
        await fetchTeamMembers();
        setTeamMemberForm({
          name: '',
          title: '',
          bio: '',
          credentials: '',
          photo_url: '',
          order: 0
        });
        setShowTeamMemberForm(false);
        setSuccess('Team member created successfully!');
        setTimeout(() => setSuccess(null), 3000);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to create team member');
      }
    } catch (err) {
      setError(`Failed to create team member: ${err.message}`);
    }
  };

  const handleUpdateTeamMember = async (memberId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/team-members/${memberId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(teamMemberForm)
      });

      if (response.ok) {
        await fetchTeamMembers();
        setEditingTeamMember(null);
        setTeamMemberForm({
          name: '',
          title: '',
          bio: '',
          credentials: '',
          photo_url: '',
          order: 0
        });
        setSuccess('Team member updated successfully!');
        setTimeout(() => setSuccess(null), 3000);
      } else {
        throw new Error('Failed to update team member');
      }
    } catch (err) {
      setError(`Failed to update team member: ${err.message}`);
    }
  };

  const handleDeleteTeamMember = async (memberId) => {
    if (!window.confirm('Are you sure you want to delete this team member?')) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/team-members/${memberId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        await fetchTeamMembers();
        setSuccess('Team member deleted successfully!');
        setTimeout(() => setSuccess(null), 3000);
      } else {
        throw new Error('Failed to delete team member');
      }
    } catch (err) {
      setError(`Failed to delete team member: ${err.message}`);
    }
  };

  const startEditTeamMember = (member) => {
    setEditingTeamMember(member.id);
    setTeamMemberForm({
      name: member.name,
      title: member.title,
      bio: member.bio,
      credentials: member.credentials,
      photo_url: member.photo_url,
      order: member.order
    });
  };

  // Facility Photo Management Functions
  const fetchFacilityPhotos = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/facility-photos`);
      if (response.ok) {
        const data = await response.json();
        setFacilityPhotos(data.facility_photos || []);
      }
    } catch (err) {
      console.error('Error fetching facility photos:', err);
      setFacilityPhotos([]);
    }
  };

  const handleCreateFacilityPhoto = async (photoUrl) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/facility-photos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...facilityForm,
          photo_url: photoUrl
        })
      });

      if (response.ok) {
        await fetchFacilityPhotos();
        setFacilityForm({
          title: '',
          description: '',
          photo_url: '',
          order: 0
        });
        setShowFacilityForm(false);
        setSuccess('Facility photo created successfully!');
        setTimeout(() => setSuccess(null), 3000);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to create facility photo');
      }
    } catch (err) {
      setError(`Failed to create facility photo: ${err.message}`);
    }
  };

  const handleUpdateFacility = async (photoId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/facility-photos/${photoId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(facilityForm)
      });

      if (response.ok) {
        await fetchFacilityPhotos();
        setEditingFacility(null);
        setFacilityForm({
          title: '',
          description: '',
          photo_url: '',
          order: 0
        });
        setSuccess('Facility photo updated successfully!');
        setTimeout(() => setSuccess(null), 3000);
      } else {
        throw new Error('Failed to update facility photo');
      }
    } catch (err) {
      setError(`Failed to update facility photo: ${err.message}`);
    }
  };

  const handleDeleteFacility = async (photoId) => {
    if (!window.confirm('Are you sure you want to delete this facility photo?')) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/facility-photos/${photoId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        await fetchFacilityPhotos();
        setSuccess('Facility photo deleted successfully!');
        setTimeout(() => setSuccess(null), 3000);
      } else {
        throw new Error('Failed to delete facility photo');
      }
    } catch (err) {
      setError(`Failed to delete facility photo: ${err.message}`);
    }
  };

  const startEditFacility = (photo) => {
    setEditingFacility(photo.id);
    setFacilityForm({
      title: photo.title,
      description: photo.description,
      photo_url: photo.photo_url,
      order: photo.order
    });
  };

  const handleFacilityUpload = async (file, createFacilityPhoto = false) => {
    setUploading(true);
    setError(null);
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch(`${API_BASE_URL}/api/upload/facility`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      
      if (response.ok) {
        const result = await response.json();
        
        // Update the uploaded files list
        setUploadedFiles(prev => ({
          ...prev,
          facility: [...prev.facility, result]
        }));
        
        // If this is for a facility photo with metadata, create the facility photo record
        if (createFacilityPhoto) {
          const photoUrl = `${API_BASE_URL}${result.url}`;
          await handleCreateFacilityPhoto(photoUrl);
        } else {
          setSuccess(`Photo uploaded successfully to facility!`);
          setTimeout(() => setSuccess(null), 3000);
        }
      } else {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Upload failed');
      }
    } catch (err) {
      setError(`Upload failed: ${err.message}`);
    } finally {
      setUploading(false);
    }
  };

  // Slider Image Management Functions
  const fetchSliderImages = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/slider-images`);
      if (response.ok) {
        const data = await response.json();
        setSliderImages(data.slider_images || []);
      }
    } catch (err) {
      console.error('Error fetching slider images:', err);
      setSliderImages([]);
    }
  };

  const handleCreateSliderImage = async (imageUrl) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/slider-images`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...sliderForm,
          image_url: imageUrl
        })
      });

      if (response.ok) {
        await fetchSliderImages();
        setSliderForm({
          title: '',
          description: '',
          image_url: '',
          order: 0
        });
        setShowSliderForm(false);
        setSuccess('Slider image created successfully!');
        setTimeout(() => setSuccess(null), 3000);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to create slider image');
      }
    } catch (err) {
      setError(`Failed to create slider image: ${err.message}`);
    }
  };

  const handleUpdateSlider = async (imageId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/slider-images/${imageId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(sliderForm)
      });

      if (response.ok) {
        await fetchSliderImages();
        setEditingSlider(null);
        setSliderForm({
          title: '',
          description: '',
          image_url: '',
          order: 0
        });
        setSuccess('Slider image updated successfully!');
        setTimeout(() => setSuccess(null), 3000);
      } else {
        throw new Error('Failed to update slider image');
      }
    } catch (err) {
      setError(`Failed to update slider image: ${err.message}`);
    }
  };

  const handleDeleteSlider = async (imageId) => {
    if (!window.confirm('Are you sure you want to delete this slider image?')) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/slider-images/${imageId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        await fetchSliderImages();
        setSuccess('Slider image deleted successfully!');
        setTimeout(() => setSuccess(null), 3000);
      } else {
        throw new Error('Failed to delete slider image');
      }
    } catch (err) {
      setError(`Failed to delete slider image: ${err.message}`);
    }
  };

  const startEditSlider = (image) => {
    setEditingSlider(image.id);
    setSliderForm({
      title: image.title,
      description: image.description,
      image_url: image.image_url,
      order: image.order
    });
  };

  const handleSliderUpload = async (file, createSliderImage = false) => {
    setUploading(true);
    setError(null);
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch(`${API_BASE_URL}/api/upload/homepageslider`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      
      if (response.ok) {
        const result = await response.json();
        
        // Update the uploaded files list
        setUploadedFiles(prev => ({
          ...prev,
          homepageslider: [...prev.homepageslider, result]
        }));
        
        // If this is for a slider image with metadata, create the slider image record
        if (createSliderImage) {
          const imageUrl = `${API_BASE_URL}${result.url}`;
          await handleCreateSliderImage(imageUrl);
        } else {
          setSuccess(`Image uploaded successfully to slider!`);
          setTimeout(() => setSuccess(null), 3000);
        }
      } else {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Upload failed');
      }
    } catch (err) {
      setError(`Upload failed: ${err.message}`);
    } finally {
      setUploading(false);
    }
  };

  const handleFileUpload = async (category, file, createTeamMember = false) => {
    setUploading(true);
    setError(null);
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch(`${API_BASE_URL}/api/upload/${category}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      
      if (response.ok) {
        const result = await response.json();
        
        // Update the uploaded files list
        setUploadedFiles(prev => ({
          ...prev,
          [category]: [...prev[category], result]
        }));
        
        // If this is for a team member, create the team member with the photo
        if (createTeamMember && category === 'team') {
          const photoUrl = `${API_BASE_URL}${result.url}`;
          await handleCreateTeamMember(photoUrl);
        } else {
          setSuccess(`Photo uploaded successfully to ${category}!`);
          setTimeout(() => setSuccess(null), 3000);
        }
      } else {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Upload failed');
      }
    } catch (err) {
      setError(`Upload failed: ${err.message}`);
    } finally {
      setUploading(false);
    }
  };

  const handleFileDelete = async (category, filename) => {
    if (!window.confirm('Are you sure you want to delete this photo?')) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/files/${category}/${filename}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        // Remove from uploaded files
        setUploadedFiles(prev => ({
          ...prev,
          [category]: prev[category].filter(file => file.filename !== filename)
        }));
        
        setSuccess('Photo deleted successfully!');
        setTimeout(() => setSuccess(null), 3000);
      } else {
        throw new Error('Failed to delete photo');
      }
    } catch (err) {
      setError(`Delete failed: ${err.message}`);
    }
  };

  // Image replacement functions for edit mode
  const handleSliderImageReplace = async (file) => {
    setUploading(true);
    setError(null);
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch(`${API_BASE_URL}/api/upload/homepageslider`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      
      if (response.ok) {
        const result = await response.json();
        const newImageUrl = `${API_BASE_URL}${result.url}`;
        
        // Update the slider form with new image URL
        setSliderForm(prev => ({
          ...prev,
          image_url: newImageUrl
        }));
        
        setSuccess('Image replaced successfully!');
        setTimeout(() => setSuccess(null), 3000);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Upload failed');
      }
    } catch (err) {
      setError(`Upload failed: ${err.message}`);
    } finally {
      setUploading(false);
    }
  };

  const handleFacilityImageReplace = async (file) => {
    setUploading(true);
    setError(null);
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch(`${API_BASE_URL}/api/upload/facility`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      
      if (response.ok) {
        const result = await response.json();
        const newImageUrl = `${API_BASE_URL}${result.url}`;
        
        // Update the facility form with new image URL
        setFacilityForm(prev => ({
          ...prev,
          photo_url: newImageUrl
        }));
        
        setSuccess('Image replaced successfully!');
        setTimeout(() => setSuccess(null), 3000);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Upload failed');
      }
    } catch (err) {
      setError(`Upload failed: ${err.message}`);
    } finally {
      setUploading(false);
    }
  };

  const handleTeamImageReplace = async (file) => {
    setUploading(true);
    setError(null);
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch(`${API_BASE_URL}/api/upload/team`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      
      if (response.ok) {
        const result = await response.json();
        const newImageUrl = `${API_BASE_URL}${result.url}`;
        
        // Update the team member form with new image URL
        setTeamMemberForm(prev => ({
          ...prev,
          photo_url: newImageUrl
        }));
        
        setSuccess('Image replaced successfully!');
        setTimeout(() => setSuccess(null), 3000);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Upload failed');
      }
    } catch (err) {
      setError(`Upload failed: ${err.message}`);
    } finally {
      setUploading(false);
    }
  };

  // FileUploadSection component  
  const FileUploadSection = ({ category, files }) => (
    <div className="space-y-6">
      {/* Upload Area */}
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center bg-gray-50 hover:bg-gray-100 transition-colors">
        <Image className="h-12 w-12 mx-auto text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Upload New Photos</h3>
        <p className="text-sm text-gray-600 mb-4">
          Drag and drop files here or click to browse
        </p>
        <label className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer">
          <Upload className="h-5 w-5 mr-2" />
          Choose Files
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={(e) => {
              Array.from(e.target.files).forEach(file => {
                handleFileUpload(category, file);
              });
              e.target.value = ''; // Reset input
            }}
            className="hidden"
          />
        </label>
        <p className="text-xs text-gray-500 mt-2">
          Supported formats: JPG, PNG, GIF, WebP (Max: 10MB each)
        </p>
      </div>

      {/* Upload Progress */}
      {uploading && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-3"></div>
            <span className="text-blue-700">Uploading photo...</span>
          </div>
        </div>
      )}

      {/* Photos Grid */}
      {files && files.length > 0 ? (
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Uploaded Photos ({files.length})
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {files.map((file, index) => (
              <div key={index} className="relative bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                <div className="aspect-square bg-gray-100 overflow-hidden">
                  <img
                    src={`${API_BASE_URL}${file.url}`}
                    alt={file.filename}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                  <div className="hidden w-full h-full items-center justify-center bg-gray-100">
                    <Image className="h-8 w-8 text-gray-400" />
                  </div>
                </div>
                
                <div className="p-3">
                  <p className="text-sm font-medium text-gray-900 truncate mb-1">{file.filename}</p>
                  <p className="text-xs text-gray-500 mb-3">
                    {(file.size / 1024).toFixed(1)} KB
                  </p>
                  
                  <div className="flex justify-between">
                    <a
                      href={`${API_BASE_URL}${file.url}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                    >
                      <Eye className="h-3 w-3 mr-1" />
                      View
                    </a>
                    <button
                      type="button"
                      onClick={() => handleFileDelete(category, file.filename)}
                      className="inline-flex items-center px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                    >
                      <Trash2 className="h-3 w-3 mr-1" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <Image className="h-16 w-16 mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No photos uploaded yet</h3>
          <p className="text-gray-600">Upload your first photo to get started</p>
        </div>
      )}
    </div>
  );

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-lg shadow-sm border border-gray-200">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Authentication Required</h1>
          <p className="text-gray-600 mb-4">You must be logged in as an admin to manage photos.</p>
          <p className="text-sm text-gray-500">Please log in using the login button in the top navigation bar.</p>
        </div>
      </div>
    );
  }

  if (user && !isAdmin()) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-lg shadow-sm border border-gray-200">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-4">Admin privileges are required to manage photos.</p>
          <p className="text-sm text-gray-500">Please contact an administrator if you need access.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading photos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-center">
            <Camera className="h-8 w-8 text-blue-600 mr-4" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Photo Management</h1>
              <p className="mt-2 text-gray-600">
                Upload and manage photos for your website including home page slider, team, and facility images
              </p>
            </div>
          </div>
        </div>

        {/* Success Alert */}
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6">
            {success}
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6" aria-label="Tabs">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center transition-colors`}
                  >
                    <Icon className="h-5 w-5 mr-2" />
                    {tab.name}
                    {tab.id === 'homepageslider' ? (
                      sliderImages && sliderImages.length > 0 && (
                        <span className="ml-2 bg-blue-100 text-blue-600 text-xs px-2 py-0.5 rounded-full">
                          {sliderImages.length}
                        </span>
                      )
                    ) : tab.id === 'team' ? (
                      teamMembers && teamMembers.length > 0 && (
                        <span className="ml-2 bg-blue-100 text-blue-600 text-xs px-2 py-0.5 rounded-full">
                          {teamMembers.length}
                        </span>
                      )
                    ) : tab.id === 'facility' ? (
                      facilityPhotos && facilityPhotos.length > 0 && (
                        <span className="ml-2 bg-blue-100 text-blue-600 text-xs px-2 py-0.5 rounded-full">
                          {facilityPhotos.length}
                        </span>
                      )
                    ) : (
                      uploadedFiles[tab.id] && uploadedFiles[tab.id].length > 0 && (
                        <span className="ml-2 bg-blue-100 text-blue-600 text-xs px-2 py-0.5 rounded-full">
                          {uploadedFiles[tab.id].length}
                        </span>
                      )
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {tabs.map((tab) => (
              <div key={tab.id} className={activeTab === tab.id ? 'block' : 'hidden'}>
                <div className="mb-6">
                  <h2 className="text-lg font-medium text-gray-900 mb-2">{tab.name}</h2>
                  <p className="text-gray-600">{tab.description}</p>
                </div>
                {tab.id === 'homepageslider' ? (
                  <SliderSection 
                    sliderImages={sliderImages}
                    showSliderForm={showSliderForm}
                    setShowSliderForm={setShowSliderForm}
                    editingSlider={editingSlider}
                    setEditingSlider={setEditingSlider}
                    sliderForm={sliderForm}
                    handleSliderFormChange={handleSliderFormChange}
                    handleSliderUpload={handleSliderUpload}
                    handleUpdateSlider={handleUpdateSlider}
                    handleDeleteSlider={handleDeleteSlider}
                    startEditSlider={startEditSlider}
                    uploading={uploading}
                    error={error}
                    setError={setError}
                    API_BASE_URL={API_BASE_URL}
                  />
                ) : tab.id === 'team' ? (
                  <TeamMemberSection 
                    teamMembers={teamMembers}
                    showTeamMemberForm={showTeamMemberForm}
                    setShowTeamMemberForm={setShowTeamMemberForm}
                    editingTeamMember={editingTeamMember}
                    setEditingTeamMember={setEditingTeamMember}
                    teamMemberForm={teamMemberForm}
                    handleTeamMemberFormChange={handleTeamMemberFormChange}
                    handleFileUpload={handleFileUpload}
                    handleUpdateTeamMember={handleUpdateTeamMember}
                    handleDeleteTeamMember={handleDeleteTeamMember}
                    startEditTeamMember={startEditTeamMember}
                    uploading={uploading}
                    error={error}
                    setError={setError}
                    API_BASE_URL={API_BASE_URL}
                  />
                ) : tab.id === 'facility' ? (
                  <FacilitySection 
                    facilityPhotos={facilityPhotos}
                    showFacilityForm={showFacilityForm}
                    setShowFacilityForm={setShowFacilityForm}
                    editingFacility={editingFacility}
                    setEditingFacility={setEditingFacility}
                    facilityForm={facilityForm}
                    handleFacilityFormChange={handleFacilityFormChange}
                    handleFacilityUpload={handleFacilityUpload}
                    handleUpdateFacility={handleUpdateFacility}
                    handleDeleteFacility={handleDeleteFacility}
                    startEditFacility={startEditFacility}
                    error={error}
                    setError={setError}
                    API_BASE_URL={API_BASE_URL}
                  />
                ) : (
                  <FileUploadSection 
                    category={tab.id} 
                    files={uploadedFiles[tab.id]} 
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Information Note */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <Camera className="h-5 w-5 text-blue-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">
                Photo Management Tips
              </h3>
              <div className="mt-2 text-sm text-blue-700">
                <ul className="list-disc list-inside space-y-1">
                  <li><strong>Home Page Slider:</strong> Use high-quality images (1920x800px recommended) for best results</li>
                  <li><strong>Team Photos:</strong> Professional headshots work best, consistent lighting and backgrounds preferred</li>
                  <li><strong>Facility Photos:</strong> Showcase your clinic, equipment, and treatment areas</li>
                  <li><strong>File Formats:</strong> JPG, PNG, GIF, and WebP are supported (Max: 10MB per file)</li>
                  <li><strong>Multiple Upload:</strong> You can select multiple files at once for faster uploading</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PhotoManagement;