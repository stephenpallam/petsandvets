import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  Users, 
  Plus, 
  Search, 
  Upload, 
  Edit2, 
  Trash2, 
  X,
  AlertCircle,
  CheckCircle,
  Phone,
  Mail,
  MessageSquare,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

const Customers = () => {
  const { user, token, loading: authLoading } = useAuth();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCustomers, setTotalCustomers] = useState(0);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  
  // Form states
  const [formData, setFormData] = useState({
    name: '',
    pets: [{ name: '' }], // Array of pets, start with one empty pet
    phone: '',
    email: '',
    sms_opt_in: true,
    email_subscribed: true
  });
  
  // Import states
  const [csvFile, setCsvFile] = useState(null);
  const [importing, setImporting] = useState(false);
  
  // Pet management functions
  const addPet = () => {
    setFormData({
      ...formData,
      pets: [...formData.pets, { name: '' }]
    });
  };
  
  const removePet = (index) => {
    const newPets = formData.pets.filter((_, i) => i !== index);
    // Ensure at least one pet entry remains
    setFormData({
      ...formData,
      pets: newPets.length > 0 ? newPets : [{ name: '' }]
    });
  };
  
  const updatePetName = (index, name) => {
    const newPets = [...formData.pets];
    newPets[index] = { name };
    setFormData({
      ...formData,
      pets: newPets
    });
  };

  const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || import.meta.env.REACT_APP_BACKEND_URL || window.location.origin;

  // Fetch customers
  const fetchCustomers = async (page = 1, search = '') => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20'
      });
      
      if (search.trim()) {
        params.append('search', search.trim());
      }

      const url = `${API_BASE_URL}/api/customers?${params}`;
      console.log('Fetching customers from:', url);
      console.log('Using token:', token ? 'Token available' : 'No token');

      const response = await fetch(url, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        setCustomers(data.customers);
        setTotalPages(data.total_pages);
        setTotalCustomers(data.total);
        setCurrentPage(page);
        console.log('Successfully fetched', data.customers.length, 'customers');
        // Clear any previous error messages
        setMessage({ type: '', text: '' });
      } else {
        if (response.status === 401) {
          setMessage({ 
            type: 'error', 
            text: 'Session expired. Please log in again.' 
          });
          // Redirect to login after a short delay
          setTimeout(() => {
            window.location.href = '/login';
          }, 2000);
        } else if (response.status === 403) {
          setMessage({ type: 'error', text: 'Access denied. You may not have permission to view customers.' });
        } else {
          const errorData = await response.json().catch(() => ({}));
          setMessage({ 
            type: 'error', 
            text: errorData.detail || `Failed to fetch customers (Status: ${response.status})` 
          });
        }
      }
    } catch (error) {
      console.error('Error fetching customers:', error);
      setMessage({ type: 'error', text: 'Network error. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  // Search with debounce
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      fetchCustomers(1, searchTerm);
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchTerm]);

  // Initial load
  useEffect(() => {
    // Wait for auth to finish loading
    if (authLoading) {
      return;
    }
    
    if (token && user) {
      console.log('User authenticated:', user.email, 'Role:', user.role);
      fetchCustomers();
    } else {
      console.log('User authentication status:', { token: !!token, user: !!user, authLoading });
      if (!authLoading && !token) {
        setMessage({ type: 'error', text: 'Please log in to access customers.' });
      }
    }
  }, [token, user, authLoading]);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = showEditModal 
        ? `${API_BASE_URL}/api/customers/${selectedCustomer.id}`
        : `${API_BASE_URL}/api/customers`;
      
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
          text: showEditModal ? 'Customer updated successfully!' : 'Customer added successfully!' 
        });
        resetForm();
        fetchCustomers(currentPage, searchTerm);
      } else {
        const errorData = await response.json();
        setMessage({ type: 'error', text: errorData.detail || 'Failed to save customer' });
      }
    } catch (error) {
      console.error('Error saving customer:', error);
      setMessage({ type: 'error', text: 'Network error. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  // Handle delete
  const handleDelete = async () => {
    if (!selectedCustomer) return;

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/customers/${selectedCustomer.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Customer deleted successfully!' });
        setShowDeleteModal(false);
        fetchCustomers(currentPage, searchTerm);
      } else {
        const errorData = await response.json();
        setMessage({ type: 'error', text: errorData.detail || 'Failed to delete customer' });
      }
    } catch (error) {
      console.error('Error deleting customer:', error);
      setMessage({ type: 'error', text: 'Network error. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  // Handle CSV import
  const handleImport = async (e) => {
    e.preventDefault();
    if (!csvFile) return;

    setImporting(true);
    try {
      const formData = new FormData();
      formData.append('file', csvFile);

      const response = await fetch(`${API_BASE_URL}/api/customers/import`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });

      if (response.ok) {
        const result = await response.json();
        setMessage({ 
          type: 'success', 
          text: `${result.message}${result.error_count > 0 ? ` (${result.error_count} errors)` : ''}` 
        });
        setShowImportModal(false);
        setCsvFile(null);
        fetchCustomers(currentPage, searchTerm);
      } else {
        const errorData = await response.json();
        setMessage({ type: 'error', text: errorData.detail || 'Failed to import customers' });
      }
    } catch (error) {
      console.error('Error importing customers:', error);
      setMessage({ type: 'error', text: 'Network error. Please try again.' });
    } finally {
      setImporting(false);
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      name: '',
      pets: [{ name: '' }], // Reset to one empty pet
      phone: '',
      email: '',
      sms_opt_in: true,
      email_subscribed: true
    });
    setShowAddModal(false);
    setShowEditModal(false);
    setSelectedCustomer(null);
  };

  // Open edit modal
  const openEditModal = (customer) => {
    setSelectedCustomer(customer);
    
    // Convert existing pet_name to pets array or use existing pets array
    let pets = [{ name: '' }]; // Default to one empty pet
    
    if (customer.pets && Array.isArray(customer.pets)) {
      // Customer already has pets array (new format)
      pets = customer.pets.length > 0 ? customer.pets : [{ name: '' }];
    } else if (customer.pet_name) {
      // Customer has old pet_name format - convert to array
      const petNames = customer.pet_name.split(',').map(name => name.trim()).filter(name => name);
      pets = petNames.length > 0 ? petNames.map(name => ({ name })) : [{ name: '' }];
    }
    
    setFormData({
      name: customer.name || '',
      pets: pets,
      phone: customer.phone || '',
      email: customer.email || '',
      sms_opt_in: customer.sms_opt_in,
      email_subscribed: customer.email_subscribed
    });
    setShowEditModal(true);
  };

  // Open delete modal
  const openDeleteModal = (customer) => {
    setSelectedCustomer(customer);
    setShowDeleteModal(true);
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Handle pagination
  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      fetchCustomers(page, searchTerm);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Show loading while auth is initializing */}
        {authLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
            <p className="text-gray-500 mt-4">Loading...</p>
          </div>
        ) : (
        
        <>
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="px-4 sm:px-6 py-4 bg-gray-50 border-b border-gray-200">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex items-center space-x-3">
                <Users className="h-8 w-8 text-blue-600 flex-shrink-0" />
                <div className="min-w-0">
                  <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
                    Customer Management
                  </h2>
                  <p className="text-sm text-gray-600">
                    Manage your customer database
                  </p>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:space-x-3">
                <button
                  onClick={() => setShowImportModal(true)}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg transition-colors hover:bg-green-700 flex items-center justify-center font-medium"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Import CSV
                </button>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="text-white px-4 py-2 rounded-lg transition-colors hover:opacity-90 flex items-center justify-center font-medium"
                  style={{ backgroundColor: 'rgb(41, 173, 211)' }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Customer
                </button>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Message Display */}
            {message.text && (
              <div className={`mb-6 rounded-md p-4 ${
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
                    {message.type === 'error' && message.text.includes('Session expired') && (
                      <div className="mt-2">
                        <button
                          onClick={() => window.location.href = '/login'}
                          className="text-sm text-red-600 hover:text-red-800 underline"
                        >
                          Go to Login →
                        </button>
                      </div>
                    )}
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

            {/* Search and Stats */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search customers by name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="text-sm text-gray-600">
                Total: {totalCustomers} customers
              </div>
            </div>

            {/* Customer List */}
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                <p className="text-gray-500 mt-4">Loading customers...</p>
              </div>
            ) : customers.length === 0 ? (
              <div className="text-center py-12">
                <Users className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-500 text-lg">No customers found</p>
                <p className="text-gray-400 text-sm mt-2">
                  {searchTerm ? 'Try adjusting your search terms' : 'Add your first customer to get started'}
                </p>
              </div>
            ) : (
              <>
                {/* Desktop Table */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Customer & Pet
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Contact
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Preferences
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Added
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {customers.map((customer) => (
                        <tr key={customer.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10">
                                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                  <span className="text-blue-600 font-medium text-sm">
                                    {customer.name.charAt(0).toUpperCase()}
                                  </span>
                                </div>
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">
                                  {customer.name}
                                </div>
                                {((customer.pets && customer.pets.length > 0) || customer.pet_name) && (
                                  <div className="text-sm text-gray-500">
                                    Pet(s): {
                                      customer.pets && customer.pets.length > 0 
                                        ? customer.pets.map(pet => pet.name).filter(name => name).join(', ')
                                        : customer.pet_name
                                    }
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="space-y-1">
                              {customer.phone && (
                                <div className="flex items-center text-sm text-gray-600">
                                  <Phone className="h-3 w-3 mr-1" />
                                  {customer.phone}
                                </div>
                              )}
                              {customer.email && (
                                <div className="flex items-center text-sm text-gray-600">
                                  <Mail className="h-3 w-3 mr-1" />
                                  {customer.email}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex space-x-2">
                              <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                                customer.sms_opt_in 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                <MessageSquare className="h-3 w-3 mr-1" />
                                SMS {customer.sms_opt_in ? 'Yes' : 'No'}
                              </span>
                              <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                                customer.email_subscribed 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                <Mail className="h-3 w-3 mr-1" />
                                Email {customer.email_subscribed ? 'Yes' : 'No'}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(customer.created_at)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex items-center justify-end space-x-2">
                              <button
                                onClick={() => openEditModal(customer)}
                                className="text-blue-600 hover:text-blue-900 p-1"
                              >
                                <Edit2 className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => openDeleteModal(customer)}
                                className="text-red-600 hover:text-red-900 p-1"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Cards */}
                <div className="md:hidden space-y-4">
                  {customers.map((customer) => (
                    <div key={customer.id} className="bg-white border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                              <span className="text-blue-600 font-medium text-sm">
                                {customer.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {customer.name}
                            </div>
                            {((customer.pets && customer.pets.length > 0) || customer.pet_name) && (
                              <div className="text-xs text-gray-500">
                                Pet(s): {
                                  customer.pets && customer.pets.length > 0 
                                    ? customer.pets.map(pet => pet.name).filter(name => name).join(', ')
                                    : customer.pet_name
                                }
                              </div>
                            )}
                            <div className="text-xs text-gray-500">
                              Added {formatDate(customer.created_at)}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => openEditModal(customer)}
                            className="text-blue-600 hover:text-blue-900 p-1"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => openDeleteModal(customer)}
                            className="text-red-600 hover:text-red-900 p-1"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                      
                      <div className="mt-3 space-y-2">
                        {customer.phone && (
                          <div className="flex items-center text-sm text-gray-600">
                            <Phone className="h-3 w-3 mr-2" />
                            {customer.phone}
                          </div>
                        )}
                        {customer.email && (
                          <div className="flex items-center text-sm text-gray-600">
                            <Mail className="h-3 w-3 mr-2" />
                            {customer.email}
                          </div>
                        )}
                      </div>
                      
                      <div className="mt-3 flex flex-wrap gap-2">
                        <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                          customer.sms_opt_in 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          <MessageSquare className="h-3 w-3 mr-1" />
                          SMS {customer.sms_opt_in ? 'Yes' : 'No'}
                        </span>
                        <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                          customer.email_subscribed 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          <Mail className="h-3 w-3 mr-1" />
                          Email {customer.email_subscribed ? 'Yes' : 'No'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-6 flex items-center justify-between">
                    <div className="text-sm text-gray-500">
                      Page {currentPage} of {totalPages}
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage <= 1}
                        className="p-2 rounded-lg border border-gray-300 text-gray-500 hover:text-gray-700 hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </button>
                      
                      {/* Page numbers */}
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum;
                        if (totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (currentPage <= 3) {
                          pageNum = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                          pageNum = totalPages - 4 + i;
                        } else {
                          pageNum = currentPage - 2 + i;
                        }
                        
                        return (
                          <button
                            key={pageNum}
                            onClick={() => handlePageChange(pageNum)}
                            className={`px-3 py-2 rounded-lg text-sm font-medium ${
                              pageNum === currentPage
                                ? 'bg-blue-600 text-white'
                                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                      
                      <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage >= totalPages}
                        className="p-2 rounded-lg border border-gray-300 text-gray-500 hover:text-gray-700 hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Add/Edit Customer Modal */}
        {(showAddModal || showEditModal) && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-hidden shadow-2xl">
              {/* Sticky Header */}
              <div className="sticky top-0 z-10 px-6 py-4" style={{ background: 'linear-gradient(to right, rgb(41, 173, 211), rgb(31, 163, 201))' }}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="bg-white bg-opacity-20 rounded-full p-2">
                      <Users className="h-5 w-5 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-white">
                      {showEditModal ? 'Edit Customer' : 'Add New Customer'}
                    </h3>
                  </div>
                  <button
                    onClick={resetForm}
                    className="text-white hover:text-blue-100 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full p-2 transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Scrollable Content */}
              <div className="px-6 py-4 max-h-[calc(90vh-140px)] overflow-y-auto">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Customer Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none transition-colors"
                      style={{ 
                        '--tw-ring-color': 'rgb(41, 173, 211)',
                        '--tw-border-opacity': '1'
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = 'rgb(41, 173, 211)';
                        e.target.style.boxShadow = '0 0 0 2px rgba(41, 173, 211, 0.2)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = '#d1d5db';
                        e.target.style.boxShadow = 'none';
                      }}
                      placeholder="Enter customer name"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-semibold text-gray-700">
                        Pet Names
                      </label>
                      <button
                        type="button"
                        onClick={addPet}
                        className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add Pet
                      </button>
                    </div>
                    
                    <div className="space-y-2">
                      {formData.pets.map((pet, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <input
                            type="text"
                            value={pet.name}
                            onChange={(e) => updatePetName(index, e.target.value)}
                            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none transition-colors"
                            style={{ 
                              '--tw-ring-color': 'rgb(41, 173, 211)',
                              '--tw-border-opacity': '1'
                            }}
                            onFocus={(e) => {
                              e.target.style.borderColor = 'rgb(41, 173, 211)';
                              e.target.style.boxShadow = '0 0 0 2px rgba(41, 173, 211, 0.2)';
                            }}
                            onBlur={(e) => {
                              e.target.style.borderColor = '#d1d5db';
                              e.target.style.boxShadow = 'none';
                            }}
                            placeholder={`Pet ${index + 1} name`}
                          />
                          {formData.pets.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removePet(index)}
                              className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none transition-colors"
                      style={{ 
                        '--tw-ring-color': 'rgb(41, 173, 211)',
                        '--tw-border-opacity': '1'
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = 'rgb(41, 173, 211)';
                        e.target.style.boxShadow = '0 0 0 2px rgba(41, 173, 211, 0.2)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = '#d1d5db';
                        e.target.style.boxShadow = 'none';
                      }}
                      placeholder="(555) 123-4567"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none transition-colors"
                      style={{ 
                        '--tw-ring-color': 'rgb(41, 173, 211)',
                        '--tw-border-opacity': '1'
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = 'rgb(41, 173, 211)';
                        e.target.style.boxShadow = '0 0 0 2px rgba(41, 173, 211, 0.2)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = '#d1d5db';
                        e.target.style.boxShadow = 'none';
                      }}
                      placeholder="customer@example.com"
                    />
                  </div>

                  <div className="space-y-4 pt-2">
                    <h4 className="text-sm font-semibold text-gray-700 border-b border-gray-200 pb-2">
                      Communication Preferences
                    </h4>
                    
                    <div className="space-y-3">
                      <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                        <input
                          type="checkbox"
                          id="sms_opt_in"
                          checked={formData.sms_opt_in}
                          onChange={(e) => setFormData({ ...formData, sms_opt_in: e.target.checked })}
                          className="h-4 w-4 border-gray-300 rounded"
                          style={{ 
                            accentColor: 'rgb(41, 173, 211)'
                          }}
                        />
                        <label htmlFor="sms_opt_in" className="ml-3 flex items-center text-sm text-gray-700">
                          <MessageSquare className="h-4 w-4 mr-2" style={{ color: 'rgb(41, 173, 211)' }} />
                          <div>
                            <div className="font-medium">SMS Notifications</div>
                            <div className="text-xs text-gray-500">Receive text message updates</div>
                          </div>
                        </label>
                      </div>

                      <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                        <input
                          type="checkbox"
                          id="email_subscribed"
                          checked={formData.email_subscribed}
                          onChange={(e) => setFormData({ ...formData, email_subscribed: e.target.checked })}
                          className="h-4 w-4 border-gray-300 rounded"
                          style={{ 
                            accentColor: 'rgb(41, 173, 211)'
                          }}
                        />
                        <label htmlFor="email_subscribed" className="ml-3 flex items-center text-sm text-gray-700">
                          <Mail className="h-4 w-4 mr-2" style={{ color: 'rgb(41, 173, 211)' }} />
                          <div>
                            <div className="font-medium">Email Newsletter</div>
                            <div className="text-xs text-gray-500">Receive email updates and newsletters</div>
                          </div>
                        </label>
                      </div>
                    </div>
                  </div>
                </form>
              </div>

              {/* Sticky Footer */}
              <div className="sticky bottom-0 bg-gray-50 px-6 py-4 border-t border-gray-200">
                <div className="flex items-center justify-end space-x-3">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-6 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="px-6 py-2.5 text-sm font-medium text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl flex items-center"
                    style={{ 
                      background: loading ? 'rgb(100, 100, 100)' : 'linear-gradient(to right, rgb(41, 173, 211), rgb(31, 163, 201))',
                      ':hover': { background: 'linear-gradient(to right, rgb(31, 163, 201), rgb(21, 153, 191))' }
                    }}
                    onMouseEnter={(e) => {
                      if (!loading) {
                        e.target.style.background = 'linear-gradient(to right, rgb(31, 163, 201), rgb(21, 153, 191))';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!loading) {
                        e.target.style.background = 'linear-gradient(to right, rgb(41, 173, 211), rgb(31, 163, 201))';
                      }
                    }}
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        {showEditModal ? 'Updating...' : 'Adding...'}
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        {showEditModal ? 'Update Customer' : 'Add Customer'}
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && selectedCustomer && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-md w-full overflow-hidden shadow-2xl">
              {/* Header */}
              <div className="bg-gradient-to-r from-red-600 to-red-700 px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="bg-white bg-opacity-20 rounded-full p-2">
                      <AlertCircle className="h-5 w-5 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-white">
                      Delete Customer
                    </h3>
                  </div>
                  <button
                    onClick={() => setShowDeleteModal(false)}
                    className="text-white hover:text-red-100 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full p-2 transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="px-6 py-6">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="bg-red-100 rounded-full p-3">
                      <Trash2 className="h-6 w-6 text-red-600" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-lg font-medium text-gray-900 mb-2">
                      Are you sure you want to delete this customer?
                    </h4>
                    <div className="bg-gray-50 rounded-lg p-3 mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="bg-blue-100 rounded-full p-2">
                          <span className="text-blue-600 font-medium text-sm">
                            {selectedCustomer.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{selectedCustomer.name}</p>
                          {selectedCustomer.pet_name && (
                            <p className="text-sm text-gray-500">Pet: {selectedCustomer.pet_name}</p>
                          )}
                        </div>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600">
                      This action cannot be undone. All customer information will be permanently removed.
                    </p>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
                <div className="flex items-center justify-end space-x-3">
                  <button
                    onClick={() => setShowDeleteModal(false)}
                    className="px-6 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={loading}
                    className="px-6 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-red-600 to-red-700 rounded-lg hover:from-red-700 hover:to-red-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl flex items-center"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Deleting...
                      </>
                    ) : (
                      <>
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Customer
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* CSV Import Modal */}
        {showImportModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-hidden shadow-2xl">
              {/* Sticky Header */}
              <div className="sticky top-0 z-10 bg-gradient-to-r from-green-600 to-green-700 px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="bg-white bg-opacity-20 rounded-full p-2">
                      <Upload className="h-5 w-5 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-white">
                      Import Customers from CSV
                    </h3>
                  </div>
                  <button
                    onClick={() => {
                      setShowImportModal(false);
                      setCsvFile(null);
                    }}
                    className="text-white hover:text-green-100 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full p-2 transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Scrollable Content */}
              <div className="px-6 py-4 max-h-[calc(90vh-140px)] overflow-y-auto">
                <div className="mb-6">
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
                    <h4 className="text-sm font-semibold text-blue-800 mb-3 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-2" />
                      CSV Format Requirements:
                    </h4>
                    <div className="text-sm text-blue-700 space-y-2">
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-blue-600 rounded-full mr-2"></div>
                        <span><strong>Required:</strong> name</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-blue-400 rounded-full mr-2"></div>
                        <span><strong>Optional:</strong> pet_name, phone, email, sms_opt_in, email_subscribed</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                        <span><strong>Default:</strong> SMS/Email opt-in = Yes</span>
                      </div>
                    </div>
                  </div>
                </div>

                <form onSubmit={handleImport} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Select CSV File
                    </label>
                    <div className="relative">
                      <input
                        type="file"
                        accept=".csv"
                        onChange={(e) => setCsvFile(e.target.files[0])}
                        className="w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
                        required
                      />
                      {csvFile && (
                        <div className="mt-2 text-sm text-green-600 flex items-center">
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Selected: {csvFile.name}
                        </div>
                      )}
                    </div>
                  </div>
                </form>
              </div>

              {/* Sticky Footer */}
              <div className="sticky bottom-0 bg-gray-50 px-6 py-4 border-t border-gray-200">
                <div className="flex items-center justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowImportModal(false);
                      setCsvFile(null);
                    }}
                    className="px-6 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleImport}
                    disabled={importing || !csvFile}
                    className="px-6 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-green-600 to-green-700 rounded-lg hover:from-green-700 hover:to-green-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl flex items-center"
                  >
                    {importing ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Importing...
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4 mr-2" />
                        Import Customers
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        </>
        )}
      </div>
    </div>
  );
};

export default Customers;