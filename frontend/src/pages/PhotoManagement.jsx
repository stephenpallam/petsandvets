import React, { useState, useEffect } from 'react';
import { Image, Upload, Trash2, Eye, Camera, Users, Building2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const PhotoManagement = () => {
  const [activeTab, setActiveTab] = useState('homepageslider');
  const [uploadedFiles, setUploadedFiles] = useState({
    homepageslider: [],
    team: [],
    facility: []
  });
  const [teamMembers, setTeamMembers] = useState([]);
  const [showTeamMemberForm, setShowTeamMemberForm] = useState(false);
  const [editingTeamMember, setEditingTeamMember] = useState(null);
  const [teamMemberForm, setTeamMemberForm] = useState({
    name: '',
    title: '',
    bio: '',
    credentials: '',
    photo_url: '',
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

  const handleTeamMemberFormChange = (e) => {
    const { name, value } = e.target;
    setTeamMemberForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

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

  const handleFileUpload = async (category, file) => {
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
        
        setSuccess(`Photo uploaded successfully to ${category}!`);
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
                    {uploadedFiles[tab.id] && uploadedFiles[tab.id].length > 0 && (
                      <span className="ml-2 bg-blue-100 text-blue-600 text-xs px-2 py-0.5 rounded-full">
                        {uploadedFiles[tab.id].length}
                      </span>
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
                <FileUploadSection 
                  category={tab.id} 
                  files={uploadedFiles[tab.id]} 
                />
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