import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  Calendar, 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  X,
  AlertCircle,
  CheckCircle,
  Gift,
  Heart,
  Stethoscope,
  Sparkles
} from 'lucide-react';

const HolidayManagement = () => {
  const { user, token, loading: authLoading } = useAuth();
  const [holidays, setHolidays] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [message, setMessage] = useState({ type: '', text: '' });
  
  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showRefreshModal, setShowRefreshModal] = useState(false);
  const [selectedHoliday, setSelectedHoliday] = useState(null);
  
  // Form states
  const [formData, setFormData] = useState({
    name: '',
    date: '',
    month_day: '',
    is_recurring: true,
    is_enabled: true,
    category: 'general'
  });

  const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || import.meta.env.REACT_APP_BACKEND_URL || window.location.origin;

  const categories = [
    { value: 'all', label: 'All Categories', icon: Calendar },
    { value: 'general', label: 'General', icon: Calendar },
    { value: 'pet', label: 'Pet Days', icon: Heart },
    { value: 'veterinary', label: 'Veterinary', icon: Stethoscope },
    { value: 'family', label: 'Family', icon: Gift }
  ];

  // Check access permissions
  useEffect(() => {
    if (authLoading) return;
    
    if (!user || !token) {
      setMessage({ type: 'error', text: 'Please log in to access Holiday Management.' });
      return;
    }
    
    if (!['admin', 'manager'].includes(user.role)) {
      setMessage({ type: 'error', text: 'Access denied. Admin or Manager privileges required.' });
      return;
    }
    
    fetchHolidays();
  }, [user, token, authLoading]);

  // Fetch holidays
  const fetchHolidays = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/holidays`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setHolidays(data);
      } else {
        setMessage({ type: 'error', text: 'Failed to fetch holidays.' });
      }
    } catch (error) {
      console.error('Error fetching holidays:', error);
      setMessage({ type: 'error', text: 'Network error. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  // Initialize default holidays
  const initializeDefaults = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/holidays/initialize-defaults`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const result = await response.json();
        setMessage({ type: 'success', text: result.message });
        fetchHolidays();
      } else {
        const errorData = await response.json();
        setMessage({ type: 'error', text: errorData.detail || 'Failed to initialize holidays.' });
      }
    } catch (error) {
      console.error('Error initializing holidays:', error);
      setMessage({ type: 'error', text: 'Network error. Please try again.' });
    }
  };

  // Reset and reinitialize holidays with updated dates
  const resetAndInitialize = async () => {
    if (!window.confirm('This will delete all existing holidays and create new ones with 2025/2026 dates. Are you sure?')) {
      return;
    }
    
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/holidays/reset-and-initialize`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const result = await response.json();
        setMessage({ 
          type: 'success', 
          text: `Successfully updated holidays! Deleted ${result.deleted_count} old holidays and created ${result.created_count} new ones.` 
        });
        fetchHolidays();
      } else {
        const errorData = await response.json();
        setMessage({ type: 'error', text: errorData.detail || 'Failed to reset holidays.' });
      }
    } catch (error) {
      console.error('Error resetting holidays:', error);
      setMessage({ type: 'error', text: 'Network error. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  // Refresh holiday dates based on current date
  const refreshDates = async () => {
    if (!window.confirm('This will update holiday dates based on today\'s date. Passed holidays will move to next year. Continue?')) {
      return;
    }
    
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/holidays/refresh-dates`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const result = await response.json();
        let message = `Successfully refreshed holiday dates! Updated ${result.updated_count} of ${result.total_holidays} holidays.`;
        if (result.errors && result.errors.length > 0) {
          message += ` Some errors occurred: ${result.errors.join(', ')}`;
        }
        setMessage({ type: 'success', text: message });
        fetchHolidays();
      } else {
        const errorData = await response.json();
        setMessage({ type: 'error', text: errorData.detail || 'Failed to refresh holiday dates.' });
      }
    } catch (error) {
      console.error('Error refreshing holiday dates:', error);
      setMessage({ type: 'error', text: 'Network error. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = showEditModal 
        ? `${API_BASE_URL}/api/holidays/${selectedHoliday.id}`
        : `${API_BASE_URL}/api/holidays`;
      
      const method = showEditModal ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setMessage({ 
          type: 'success', 
          text: showEditModal ? 'Holiday updated successfully!' : 'Holiday added successfully!' 
        });
        resetForm();
        fetchHolidays();
      } else {
        const errorData = await response.json();
        setMessage({ type: 'error', text: errorData.detail || 'Failed to save holiday.' });
      }
    } catch (error) {
      console.error('Error saving holiday:', error);
      setMessage({ type: 'error', text: 'Network error. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  // Handle delete
  const handleDelete = async () => {
    if (!selectedHoliday) return;

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/holidays/${selectedHoliday.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Holiday deleted successfully!' });
        setShowDeleteModal(false);
        fetchHolidays();
      } else {
        const errorData = await response.json();
        setMessage({ type: 'error', text: errorData.detail || 'Failed to delete holiday.' });
      }
    } catch (error) {
      console.error('Error deleting holiday:', error);
      setMessage({ type: 'error', text: 'Network error. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      name: '',
      date: '',
      month_day: '',
      is_recurring: true,
      is_enabled: true,
      category: 'general'
    });
    setShowAddModal(false);
    setShowEditModal(false);
    setSelectedHoliday(null);
  };

  // Open edit modal
  const openEditModal = (holiday) => {
    setSelectedHoliday(holiday);
    setFormData({
      name: holiday.name || '',
      date: holiday.date || '',
      month_day: holiday.month_day || '',
      is_recurring: holiday.is_recurring,
      is_enabled: holiday.is_enabled,
      category: holiday.category || 'general'
    });
    setShowEditModal(true);
  };

  // Handle date change
  const handleDateChange = (date) => {
    setFormData(prev => ({
      ...prev,
      date: date,
      month_day: date ? date.substring(5) : '' // Extract MM-DD from YYYY-MM-DD
    }));
  };

  // Get category icon
  const getCategoryIcon = (category) => {
    const categoryObj = categories.find(cat => cat.value === category);
    return categoryObj ? categoryObj.icon : Calendar;
  };

  // Filter holidays
  const filteredHolidays = holidays.filter(holiday => {
    const matchesSearch = holiday.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || holiday.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Access control
  if (!authLoading && (!user || !['admin', 'manager'].includes(user.role))) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">Only administrators and managers can access Holiday Management.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Main Card Container */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Header */}
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Calendar className="h-6 w-6 text-gray-700" />
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Holiday Management</h2>
                  <p className="text-sm text-gray-600">Manage holidays for email agent scheduling</p>
                </div>
              </div>
              <div className="flex space-x-3">
                {holidays.length === 0 ? (
                  <button
                    onClick={initializeDefaults}
                    className="text-white px-4 py-2 rounded-lg transition-colors hover:opacity-90 flex items-center font-medium"
                    style={{ backgroundColor: '#059669' }}
                  >
                    <Sparkles className="h-4 w-4 mr-2" />
                    Initialize Defaults
                  </button>
                ) : (
                  <button
                    onClick={() => setShowRefreshModal(true)}
                    disabled={loading}
                    className="text-white px-4 py-2 rounded-lg transition-colors hover:opacity-90 flex items-center font-medium disabled:opacity-50"
                    style={{ backgroundColor: '#10b981' }}
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    Refresh Dates
                  </button>
                )}
                <button
                  onClick={() => setShowAddModal(true)}
                  className="text-white px-4 py-2 rounded-lg transition-colors hover:opacity-90 flex items-center font-medium"
                  style={{ backgroundColor: 'rgb(41, 173, 211)' }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Holiday
                </button>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Message Display */}
            {message.text && (
              <div className={`mb-6 rounded-lg p-4 ${
                message.type === 'error' 
                  ? 'bg-red-50 border border-red-200' 
                  : 'bg-green-50 border border-green-200'
              }`}>
                <div className="flex">
                  <div className="flex-shrink-0">
                    {message.type === 'error' ? (
                      <AlertCircle className="h-5 w-5 text-red-400" />
                    ) : (
                      <CheckCircle className="h-5 w-5 text-green-400" />
                    )}
                  </div>
                  <div className="ml-3 flex-1">
                    <p className={`text-sm font-medium ${
                      message.type === 'error' ? 'text-red-800' : 'text-green-800'
                    }`}>
                      {message.text}
                    </p>
                  </div>
                  <div className="ml-auto pl-3">
                    <button
                      onClick={() => setMessage({ type: '', text: '' })}
                      className={`inline-flex ${
                        message.type === 'error' ? 'text-red-400 hover:text-red-600' : 'text-green-400 hover:text-green-600'
                      }`}
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Filters */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search holidays..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                />
              </div>
              
              <div className="flex space-x-2">
                {categories.map((category) => {
                  const Icon = category.icon;
                  return (
                    <button
                      key={category.value}
                      onClick={() => setSelectedCategory(category.value)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2 ${
                        selectedCategory === category.value
                          ? 'bg-cyan-100 text-cyan-700'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{category.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Holiday List */}
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500 mx-auto"></div>
                <p className="text-gray-500 mt-4">Loading holidays...</p>
              </div>
            ) : filteredHolidays.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-500 text-lg">No holidays found</p>
                <p className="text-gray-400 text-sm mt-2">
                  {searchTerm || selectedCategory !== 'all' 
                    ? 'Try adjusting your search or filters' 
                    : 'Add your first holiday to get started'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredHolidays.map((holiday) => {
                  const Icon = getCategoryIcon(holiday.category);
                  return (
                    <div key={holiday.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className={`p-2 rounded-full ${
                            holiday.category === 'pet' ? 'bg-pink-100' :
                            holiday.category === 'veterinary' ? 'bg-blue-100' :
                            holiday.category === 'family' ? 'bg-purple-100' :
                            'bg-gray-100'
                          }`}>
                            <Icon className={`h-4 w-4 ${
                              holiday.category === 'pet' ? 'text-pink-600' :
                              holiday.category === 'veterinary' ? 'text-blue-600' :
                              holiday.category === 'family' ? 'text-purple-600' :
                              'text-gray-600'
                            }`} />
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-900">{holiday.name}</h3>
                            <p className="text-sm text-gray-500">{holiday.date}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => openEditModal(holiday)}
                            className="text-cyan-600 hover:text-cyan-800 p-1"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          {user.role === 'admin' && (
                            <button
                              onClick={() => {
                                setSelectedHoliday(holiday);
                                setShowDeleteModal(true);
                              }}
                              className="text-red-600 hover:text-red-800 p-1"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                            holiday.is_enabled 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {holiday.is_enabled ? 'Enabled' : 'Disabled'}
                          </span>
                          <span className="text-xs text-gray-500 capitalize">
                            {holiday.category}
                          </span>
                        </div>
                        {holiday.is_recurring && (
                          <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
                            Recurring
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Add/Edit Holiday Modal */}
        {(showAddModal || showEditModal) && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-md w-full overflow-hidden shadow-2xl">
              {/* Header */}
              <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Calendar className="h-5 w-5 text-gray-700" />
                    <h3 className="text-lg font-semibold text-gray-900">
                      {showEditModal ? 'Edit Holiday' : 'Add New Holiday'}
                    </h3>
                  </div>
                  <button
                    onClick={resetForm}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Form */}
              <div className="p-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Holiday Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                      placeholder="e.g., Christmas Day"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date *
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.date}
                      onChange={(e) => handleDateChange(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Category
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                    >
                      <option value="general">General</option>
                      <option value="pet">Pet Days</option>
                      <option value="veterinary">Veterinary</option>
                      <option value="family">Family</option>
                    </select>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="is_recurring"
                        checked={formData.is_recurring}
                        onChange={(e) => setFormData({ ...formData, is_recurring: e.target.checked })}
                        className="h-4 w-4 text-cyan-600 focus:ring-cyan-500 border-gray-300 rounded"
                      />
                      <label htmlFor="is_recurring" className="ml-2 block text-sm text-gray-700">
                        Recurring (happens every year)
                      </label>
                    </div>

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="is_enabled"
                        checked={formData.is_enabled}
                        onChange={(e) => setFormData({ ...formData, is_enabled: e.target.checked })}
                        className="h-4 w-4 text-cyan-600 focus:ring-cyan-500 border-gray-300 rounded"
                      />
                      <label htmlFor="is_enabled" className="ml-2 block text-sm text-gray-700">
                        Enabled for email scheduling
                      </label>
                    </div>
                  </div>

                  <div className="flex items-center justify-end space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={resetForm}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-4 py-2 text-sm font-medium text-white rounded-lg disabled:opacity-50"
                      style={{ backgroundColor: 'rgb(41, 173, 211)' }}
                    >
                      {loading ? 'Saving...' : (showEditModal ? 'Update Holiday' : 'Add Holiday')}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && selectedHoliday && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-md w-full overflow-hidden shadow-2xl">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Delete Holiday
                  </h3>
                  <button
                    onClick={() => setShowDeleteModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <p className="text-gray-600 mb-6">
                  Are you sure you want to delete <strong>{selectedHoliday.name}</strong>? 
                  This action cannot be undone.
                </p>

                <div className="flex items-center justify-end space-x-3">
                  <button
                    onClick={() => setShowDeleteModal(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={loading}
                    className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50"
                  >
                    {loading ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HolidayManagement;