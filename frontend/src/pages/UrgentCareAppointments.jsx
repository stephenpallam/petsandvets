import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  Calendar, 
  Clock, 
  User, 
  Heart, 
  Eye, 
  AlertCircle, 
  CheckCircle,
  X,
  Phone,
  Mail,
  Stethoscope,
  Trash2,
  ChevronLeft,
  ChevronRight,
  UserCheck,
  UserX,
  XCircle,
  Ban,
  MoreVertical
} from 'lucide-react';

const UrgentCareAppointments = () => {
  const { user, token, isAdmin, loading: authLoading } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [appointmentToDelete, setAppointmentToDelete] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [showStatusMenu, setShowStatusMenu] = useState({});
  
  // Pagination and filtering states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [filterDays, setFilterDays] = useState('today');
  const [pageSize] = useState(20);

  const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || import.meta.env.REACT_APP_BACKEND_URL;
  const primaryColor = '#29add3';

  const filterOptions = [
    { value: 'today', label: 'Today' },
    { value: 'last_7_days', label: 'Last 7 Days' },
    { value: 'last_15_days', label: 'Last 15 Days' },
    { value: 'last_30_days', label: 'Last 30 Days' },
    { value: 'last_3_months', label: 'Last 3 Months' },
    { value: 'last_6_months', label: 'Last 6 Months' },
    { value: 'last_1_year', label: 'Last 1 Year' }
  ];

  useEffect(() => {
    if (!authLoading && isAdmin()) {
      fetchAppointments();
    }
  }, [authLoading, isAdmin, currentPage, filterDays]);

  // Close status menus when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setShowStatusMenu({});
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/urgent-care-appointments?filter_days=${filterDays}&page=${currentPage}&page_size=${pageSize}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setAppointments(data.appointments);
        setTotalCount(data.total_count);
        setTotalPages(data.total_pages);
      } else {
        setMessage({ type: 'error', text: 'Failed to load appointments' });
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);
      setMessage({ type: 'error', text: 'Failed to load appointments' });
    } finally {
      setLoading(false);
    }
  };

  const fetchAppointmentDetails = async (appointmentId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/urgent-care-appointments/${appointmentId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setSelectedAppointment(data);
        setShowModal(true);
      } else {
        setMessage({ type: 'error', text: 'Failed to load appointment details' });
      }
    } catch (error) {
      console.error('Error fetching appointment details:', error);
      setMessage({ type: 'error', text: 'Failed to load appointment details' });
    }
  };

  const deleteAppointment = async (appointmentId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/urgent-care-appointments/${appointmentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setMessage({ type: 'success', text: `Appointment deleted successfully. Time slot ${data.freed_slot} is now available for booking.` });
        fetchAppointments(); // Refresh the list
        setShowDeleteConfirm(false);
        setAppointmentToDelete(null);
      } else {
        setMessage({ type: 'error', text: 'Failed to delete appointment' });
      }
    } catch (error) {
      console.error('Error deleting appointment:', error);
      setMessage({ type: 'error', text: 'Failed to delete appointment' });
    }
  };

  const handleFilterChange = (newFilter) => {
    setFilterDays(newFilter);
    setCurrentPage(1); // Reset to first page when changing filter
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const updateAppointmentStatus = async (appointmentId, newStatus) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/urgent-care-appointments/${appointmentId}/status?status=${newStatus}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        let message = `Appointment status updated to ${newStatus}.`;
        if (data.freed_slot) {
          message += ` Time slot ${data.freed_slot} is now available for booking.`;
        }
        setMessage({ type: 'success', text: message });
        fetchAppointments(); // Refresh the list
        setShowStatusMenu({}); // Close all menus
      } else {
        setMessage({ type: 'error', text: 'Failed to update appointment status' });
      }
    } catch (error) {
      console.error('Error updating appointment status:', error);
      setMessage({ type: 'error', text: 'Failed to update appointment status' });
    }
  };

  const toggleStatusMenu = (appointmentId, event) => {
    event.stopPropagation();
    setShowStatusMenu(prev => ({
      ...prev,
      [appointmentId]: !prev[appointmentId]
    }));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'no_show': return 'bg-orange-100 text-orange-800';
      case 'abandoned': return 'bg-gray-100 text-gray-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  const formatTimeOnly = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const confirmDelete = (appointment) => {
    setAppointmentToDelete(appointment);
    setShowDeleteConfirm(true);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const isToday = (dateString) => {
    const appointmentDate = new Date(dateString).toDateString();
    const today = new Date().toDateString();
    return appointmentDate === today;
  };

  const isPast = (dateString) => {
    const appointmentTime = new Date(dateString);
    const now = new Date();
    return appointmentTime < now;
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: primaryColor }}></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin()) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-red-800 mb-2">Access Denied</h2>
            <p className="text-red-600">You need administrator privileges to view appointments.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {message.text && (
          <div className={`mb-6 p-4 rounded-lg flex items-center ${
            message.type === 'success' 
              ? 'bg-green-50 text-green-800 border border-green-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}>
            {message.type === 'success' ? (
              <CheckCircle className="h-5 w-5 mr-3" />
            ) : (
              <AlertCircle className="h-5 w-5 mr-3" />
            )}
            {message.text}
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: primaryColor }}></div>
            <p className="text-gray-600">Loading appointments...</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            {/* Header - Always visible */}
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">
                  Appointments
                </h2>
                <div className="flex items-center gap-3">
                  <select
                    value={filterDays}
                    onChange={(e) => handleFilterChange(e.target.value)}
                    className="px-4 py-2 text-sm font-medium border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white min-w-[160px]"
                    style={{ borderColor: primaryColor }}
                  >
                    {filterOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            
            {/* Content Area */}
            {appointments.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Appointments</h3>
                <p className="text-gray-500">No urgent care appointments found for the selected time period.</p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      S.No
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Patient
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Phone Number
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Reason for Visit
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Time
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {appointments.map((appointment, index) => (
                    <tr key={appointment.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {(currentPage - 1) * pageSize + index + 1}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {appointment.owner_first_name} {appointment.owner_last_name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{appointment.pet_name}</div>
                          <div className="text-sm text-gray-500 capitalize">{appointment.pet_type}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{appointment.reason_for_visit}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {formatTimeOnly(appointment.appointment_time)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium relative">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => fetchAppointmentDetails(appointment.id)}
                            className="text-indigo-600 hover:text-indigo-900 p-2 rounded hover:bg-indigo-50"
                            title="View Details"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          
                          <div className="relative">
                            <button
                              onClick={(e) => toggleStatusMenu(appointment.id, e)}
                              className="text-gray-600 hover:text-gray-900 p-2 rounded hover:bg-gray-50"
                              title="Update Status"
                            >
                              <MoreVertical className="h-4 w-4" />
                            </button>
                            
                            {showStatusMenu[appointment.id] && (
                              <div className="absolute right-0 mt-1 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-10">
                                <div className="py-1">
                                  <button
                                    onClick={() => updateAppointmentStatus(appointment.id, 'completed')}
                                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-green-50 hover:text-green-800"
                                  >
                                    <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                                    Completed
                                  </button>
                                  <button
                                    onClick={() => updateAppointmentStatus(appointment.id, 'no_show')}
                                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-800"
                                  >
                                    <UserX className="h-4 w-4 mr-2 text-orange-600" />
                                    No Show
                                  </button>
                                  <button
                                    onClick={() => updateAppointmentStatus(appointment.id, 'cancelled')}
                                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-red-50 hover:text-red-800"
                                  >
                                    <XCircle className="h-4 w-4 mr-2 text-red-600" />
                                    Cancelled
                                  </button>
                                  <button
                                    onClick={() => updateAppointmentStatus(appointment.id, 'abandoned')}
                                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-800"
                                  >
                                    <Ban className="h-4 w-4 mr-2 text-gray-600" />
                                    Abandoned
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                          
                          <button
                            onClick={() => confirmDelete(appointment)}
                            className="text-red-600 hover:text-red-900 p-2 rounded hover:bg-red-50"
                            title="Delete"
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
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-700">
                    Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, totalCount)} of {totalCount} results
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="flex items-center px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft className="h-4 w-4 mr-1" />
                      Previous
                    </button>
                    
                    <div className="flex gap-1">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          className={`px-3 py-2 text-sm font-medium rounded-md ${
                            currentPage === page
                              ? 'bg-indigo-600 text-white'
                              : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          {page}
                        </button>
                      ))}
                    </div>
                    
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="flex items-center px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </button>
                  </div>
                </div>
              </div>
            )}
              </>
            )}
          </div>
        )}
      </div>

      {/* Appointment Details Modal */}
      {showModal && selectedAppointment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Appointment Details</h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Appointment Time */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <Clock className="h-5 w-5 text-blue-600 mr-2" />
                  <h4 className="font-semibold text-blue-900">Appointment Time</h4>
                </div>
                <p className="text-blue-800">
                  {formatDate(selectedAppointment.appointment_time)} at {formatTime(selectedAppointment.appointment_time)}
                </p>
              </div>

              {/* Pet Owner Information */}
              <div>
                <div className="flex items-center mb-3">
                  <User className="h-5 w-5 text-gray-600 mr-2" />
                  <h4 className="font-semibold text-gray-900">Pet Owner Information</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Name</label>
                    <p className="text-gray-900">{selectedAppointment.owner_first_name} {selectedAppointment.owner_last_name}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Email</label>
                    <div className="flex items-center">
                      <Mail className="h-4 w-4 text-gray-400 mr-1" />
                      <p className="text-gray-900">{selectedAppointment.email}</p>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Phone</label>
                    <div className="flex items-center">
                      <Phone className="h-4 w-4 text-gray-400 mr-1" />
                      <p className="text-gray-900">{selectedAppointment.phone}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Pet Information */}
              <div>
                <div className="flex items-center mb-3">
                  <Heart className="h-5 w-5 text-red-500 mr-2" />
                  <h4 className="font-semibold text-gray-900">Pet Information</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Pet Name</label>
                    <p className="text-gray-900">{selectedAppointment.pet_name}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Pet Type</label>
                    <p className="text-gray-900 capitalize">{selectedAppointment.pet_type}</p>
                  </div>
                </div>
              </div>

              {/* Medical Information */}
              <div>
                <div className="flex items-center mb-3">
                  <Stethoscope className="h-5 w-5 text-green-600 mr-2" />
                  <h4 className="font-semibold text-gray-900">Medical Information</h4>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Reason for Visit</label>
                  <p className="text-gray-900">{selectedAppointment.reason_for_visit}</p>
                </div>
                {selectedAppointment.primary_vet_hospital && (
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-500">Primary Veterinary Hospital</label>
                    <p className="text-gray-900">{selectedAppointment.primary_vet_hospital}</p>
                  </div>
                )}
              </div>

              {/* Additional Information */}
              {selectedAppointment.how_heard_about_us && (
                <div>
                  <div className="flex items-center mb-3">
                    <CheckCircle className="h-5 w-5 text-purple-600 mr-2" />
                    <h4 className="font-semibold text-gray-900">Additional Information</h4>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">How They Heard About Us</label>
                    <p className="text-gray-900">{selectedAppointment.how_heard_about_us}</p>
                  </div>
                </div>
              )}

              {/* Booking Information */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <Calendar className="h-5 w-5 text-gray-600 mr-2" />
                  <h4 className="font-semibold text-gray-900">Booking Information</h4>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Booked On</label>
                  <p className="text-gray-900">
                    {new Date(selectedAppointment.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: 'numeric',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && appointmentToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Confirm Delete</h3>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="p-6">
              <div className="flex items-center mb-4">
                <AlertCircle className="h-8 w-8 text-red-500 mr-3" />
                <div>
                  <h4 className="text-lg font-medium text-gray-900">Delete Appointment</h4>
                  <p className="text-sm text-gray-500">This action cannot be undone</p>
                </div>
              </div>
              
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-red-800">
                  Are you sure you want to delete the appointment for <strong>{appointmentToDelete.owner_first_name} {appointmentToDelete.owner_last_name}</strong> and their pet <strong>{appointmentToDelete.pet_name}</strong>?
                </p>
                <p className="text-sm text-red-700 mt-2">
                  <strong>Time:</strong> {formatDate(appointmentToDelete.appointment_time)} at {formatTime(appointmentToDelete.appointment_time)}
                </p>
              </div>
              
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={() => deleteAppointment(appointmentToDelete.id)}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700"
                >
                  Delete Appointment
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UrgentCareAppointments;