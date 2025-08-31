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
  Edit
} from 'lucide-react';

const UrgentCareAppointments = () => {
  const { user, token, isAdmin, canAccessTechnician, canAccessManager, loading: authLoading } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [appointmentToDelete, setAppointmentToDelete] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [showStatusConfirm, setShowStatusConfirm] = useState(false);
  const [statusChange, setStatusChange] = useState({ appointmentId: null, newStatus: '', currentStatus: '' });
  
  // Pagination and filtering states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [filterDays, setFilterDays] = useState('today');
  const [pageSize] = useState(20);

  const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || import.meta.env.REACT_APP_BACKEND_URL || window.location.origin;

  // Status label mapping
  const getStatusLabel = (status) => {
    const statusLabels = {
      'scheduled': 'Scheduled',
      'confirmed': 'Confirmed', 
      'in_progress': 'In Progress',
      'checked_in': 'Checked In',
      'completed': 'Completed',
      'no_show': 'No Show',
      'cancelled': 'Cancelled',
      'abandoned': 'Abandoned'
    };
    return statusLabels[status] || status;
  };
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
    if (!authLoading && canAccessTechnician()) {
      fetchAppointments();
    }
  }, [authLoading, canAccessTechnician, currentPage, filterDays]);

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

  const handleStatusChange = (appointmentId, newStatus, currentStatus) => {
    setStatusChange({ appointmentId, newStatus, currentStatus });
    setShowStatusConfirm(true);
  };

  const confirmStatusChange = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/urgent-care-appointments/${statusChange.appointmentId}/status?status=${statusChange.newStatus}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        let message = `Appointment status updated to ${getStatusLabel(statusChange.newStatus)}.`;
        if (data.freed_slot) {
          message += ` Time slot ${data.freed_slot} is now available for booking.`;
        }
        setMessage({ type: 'success', text: message });
        fetchAppointments(); // Refresh the list
        setShowStatusConfirm(false);
        setStatusChange({ appointmentId: null, newStatus: '', currentStatus: '' });
      } else {
        setMessage({ type: 'error', text: 'Failed to update appointment status' });
      }
    } catch (error) {
      console.error('Error updating appointment status:', error);
      setMessage({ type: 'error', text: 'Failed to update appointment status' });
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
        let message = `Appointment status updated to ${getStatusLabel(newStatus)}.`;
        if (data.freed_slot) {
          message += ` Time slot ${data.freed_slot} is now available for booking.`;
        }
        setMessage({ type: 'success', text: message });
        fetchAppointments(); // Refresh the list
      } else {
        setMessage({ type: 'error', text: 'Failed to update appointment status' });
      }
    } catch (error) {
      console.error('Error updating appointment status:', error);
      setMessage({ type: 'error', text: 'Failed to update appointment status' });
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return '#059669';
      case 'cancelled': return '#dc2626';
      case 'no_show': return '#d97706';
      case 'abandoned': return '#6b7280';
      case 'verified': return '#7c3aed';
      case 'checked_in': return '#059669';
      default: return '#2563eb';
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

  const handleEditAppointment = (appointment) => {
    setEditingAppointment(appointment);
    setEditFormData({
      owner_first_name: appointment.owner_first_name || '',
      owner_last_name: appointment.owner_last_name || '',
      phone: appointment.phone || '',
      email: appointment.email || '',
      pet_name: appointment.pet_name || '',
      pet_type: appointment.pet_type || '',
      pet_age: appointment.pet_age || '',
      reason_for_visit: appointment.reason_for_visit || '',
      appointment_date: appointment.appointment_time ? appointment.appointment_time.split('T')[0] : '',
      appointment_time: appointment.appointment_time ? 
        new Date(appointment.appointment_time).toLocaleTimeString('en-US', { 
          hour12: false, 
          hour: '2-digit', 
          minute: '2-digit' 
        }) : '',
      additional_notes: appointment.additional_notes || ''
    });
    setShowEditModal(true);
  };

  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveEdit = async () => {
    try {
      // Combine date and time for appointment_time
      const appointmentDateTime = `${editFormData.appointment_date}T${editFormData.appointment_time}:00`;
      
      const updateData = {
        owner_first_name: editFormData.owner_first_name,
        owner_last_name: editFormData.owner_last_name,
        phone: editFormData.phone,
        email: editFormData.email,
        pet_name: editFormData.pet_name,
        pet_type: editFormData.pet_type,
        pet_age: editFormData.pet_age,
        reason_for_visit: editFormData.reason_for_visit,
        appointment_time: appointmentDateTime,
        additional_notes: editFormData.additional_notes
      };

      const response = await fetch(`${API_BASE_URL}/api/urgent-care-appointments/${editingAppointment.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData)
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Appointment updated successfully!' });
        setShowEditModal(false);
        setEditingAppointment(null);
        setEditFormData({});
        fetchAppointments(); // Refresh the list
      } else {
        const errorData = await response.json();
        setMessage({ type: 'error', text: errorData.detail || 'Failed to update appointment' });
      }
    } catch (error) {
      console.error('Error updating appointment:', error);
      setMessage({ type: 'error', text: 'Failed to update appointment' });
    }
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

  if (!canAccessTechnician()) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-red-800 mb-2">Access Denied</h2>
            <p className="text-red-600">You need staff privileges (technician, manager, or admin) to view appointments.</p>
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
            <div className="px-4 sm:px-6 py-4 bg-gray-50 border-b border-gray-200">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <h2 className="text-lg font-semibold text-gray-900">
                  Appointments
                </h2>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <select
                    value={filterDays}
                    onChange={(e) => handleFilterChange(e.target.value)}
                    className="flex-1 sm:flex-none pl-4 py-2 pr-10 text-sm font-medium border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white min-w-[160px] appearance-none bg-no-repeat"
                    style={{ 
                      borderColor: primaryColor,
                      backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
                      backgroundSize: '16px',
                      backgroundPosition: 'calc(100% - 20px) center'
                    }}
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
            
            {/* Content Area - Responsive Design */}
            {appointments.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Appointments</h3>
                <p className="text-gray-500">No urgent care appointments found for the selected time period.</p>
              </div>
            ) : (
              <>
                {/* Desktop Table View - Hidden on mobile */}
                <div className="hidden md:block overflow-x-auto">
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
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {appointment.owner_first_name} {appointment.owner_last_name}
                              </div>
                              <div className="text-sm text-gray-500">
                                {appointment.pet_name} ({appointment.pet_type})
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{appointment.phone}</div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-900">{appointment.reason_for_visit}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {formatTimeOnly(appointment.appointment_time)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <select
                              value={appointment.status || 'scheduled'}
                              onChange={(e) => handleStatusChange(appointment.id, e.target.value, appointment.status || 'scheduled')}
                              className="text-sm rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                              style={{ color: getStatusColor(appointment.status || 'scheduled') }}
                            >
                              <option value="scheduled">Scheduled</option>
                              <option value="verified">Verified</option>
                              <option value="checked_in">Checked In</option>
                              <option value="completed">Completed</option>
                              <option value="no_show">No Show</option>
                              <option value="cancelled">Cancelled</option>
                              <option value="abandoned">Abandoned</option>
                            </select>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleEditAppointment(appointment)}
                                className="p-2 rounded hover:bg-green-50"
                                style={{ color: '#16a34a' }}
                                onMouseEnter={(e) => e.target.style.color = '#15803d'}
                                onMouseLeave={(e) => e.target.style.color = '#16a34a'}
                                title="Edit Appointment"
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => fetchAppointmentDetails(appointment.id)}
                                className="p-2 rounded hover:bg-blue-50"
                                style={{ color: '#29add3' }}
                                onMouseEnter={(e) => e.target.style.color = '#2196c7'}
                                onMouseLeave={(e) => e.target.style.color = '#29add3'}
                                title="View Details"
                              >
                                <Eye className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Card View - Visible only on mobile */}
                <div className="md:hidden divide-y divide-gray-200">
                  {appointments.map((appointment, index) => (
                    <div key={appointment.id} className="p-4 hover:bg-gray-50">
                      {/* Card Header */}
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              #{(currentPage - 1) * pageSize + index + 1}
                            </span>
                            <h3 className="text-sm font-semibold text-gray-900">
                              {appointment.owner_first_name} {appointment.owner_last_name}
                            </h3>
                          </div>
                          <p className="text-sm text-gray-600">
                            {appointment.pet_name} ({appointment.pet_type})
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEditAppointment(appointment)}
                            className="p-2 rounded hover:bg-green-50"
                            style={{ color: '#16a34a' }}
                            title="Edit Appointment"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => fetchAppointmentDetails(appointment.id)}
                            className="p-2 rounded hover:bg-blue-50"
                            style={{ color: '#29add3' }}
                            title="View Details"
                          >
                            <Eye className="h-5 w-5" />
                          </button>
                        </div>
                      </div>

                      {/* Card Body */}
                      <div className="space-y-2 mb-3">
                        <div className="flex items-center text-sm text-gray-600">
                          <Phone className="h-4 w-4 mr-2 text-gray-400" />
                          {appointment.phone}
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <Clock className="h-4 w-4 mr-2 text-gray-400" />
                          {formatTimeOnly(appointment.appointment_time)}
                        </div>
                        <div className="text-sm text-gray-600">
                          <span className="font-medium">Reason:</span> {appointment.reason_for_visit}
                        </div>
                      </div>

                      {/* Card Footer - Status */}
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-gray-500 uppercase">Status</span>
                        <select
                          value={appointment.status || 'scheduled'}
                          onChange={(e) => handleStatusChange(appointment.id, e.target.value, appointment.status || 'scheduled')}
                          className="text-sm px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white min-w-[120px]"
                        >
                          <option value="scheduled">Scheduled</option>
                          <option value="verified">Verified</option>
                          <option value="checked_in">Checked In</option>
                          <option value="completed">Completed</option>
                          <option value="no_show">No Show</option>
                          <option value="cancelled">Cancelled</option>
                          <option value="abandoned">Abandoned</option>
                        </select>
                      </div>
                    </div>
                  ))}
                </div>
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-4 sm:px-6 py-4 bg-gray-50 border-t border-gray-200">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-sm text-gray-700 text-center sm:text-left">
                    Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, totalCount)} of {totalCount} results
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="flex items-center px-2 sm:px-3 py-2 text-sm font-medium bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{ color: currentPage === 1 ? '#9ca3af' : '#29add3' }}
                    >
                      <ChevronLeft className="h-4 w-4 mr-1" />
                      <span className="hidden xs:inline">Previous</span>
                    </button>
                    
                    <div className="flex gap-1">
                      {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                        let page;
                        if (totalPages <= 5) {
                          page = i + 1;
                        } else if (currentPage <= 3) {
                          page = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                          page = totalPages - 4 + i;
                        } else {
                          page = currentPage - 2 + i;
                        }
                        
                        return (
                          <button
                            key={page}
                            onClick={() => handlePageChange(page)}
                            className="px-2 sm:px-3 py-2 text-sm font-medium rounded-md"
                            style={{
                              backgroundColor: currentPage === page ? '#29add3' : 'white',
                              color: currentPage === page ? 'white' : '#29add3',
                              border: currentPage === page ? 'none' : '1px solid #d1d5db'
                            }}
                          >
                            {page}
                          </button>
                        );
                      })}
                    </div>
                    
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="flex items-center px-2 sm:px-3 py-2 text-sm font-medium bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{ color: currentPage === totalPages ? '#9ca3af' : '#29add3' }}
                    >
                      <span className="hidden xs:inline">Next</span>
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
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
            {/* Sticky Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 rounded-t-xl" style={{ backgroundColor: primaryColor }}>
              <h3 className="text-lg font-semibold text-white">Appointment Details</h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-white hover:text-gray-200 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto">
              {/* Appointment Time - White Background */}
              <div className="bg-white p-6">
                <div className="text-left mb-4">
                  <h4 className="font-semibold text-gray-900">Appointment Time</h4>
                </div>
                <div className="text-left">
                  <p className="text-gray-800">
                    {formatDate(selectedAppointment.appointment_time)} at {formatTime(selectedAppointment.appointment_time)}
                  </p>
                </div>
              </div>

              {/* Pet Owner Information - Light Grey Background */}
              <div className="bg-gray-50 p-6">
                <div className="text-left mb-4">
                  <h4 className="font-semibold text-gray-900">Pet Owner Information</h4>
                </div>
                <div className="text-left space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Name</label>
                    <p className="text-gray-900">{selectedAppointment.owner_first_name} {selectedAppointment.owner_last_name}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Email</label>
                    <div className="flex items-center">
                      <Mail className="h-4 w-4 text-gray-400 mr-2" />
                      <p className="text-gray-900">{selectedAppointment.email}</p>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Phone</label>
                    <div className="flex items-center">
                      <Phone className="h-4 w-4 text-gray-400 mr-2" />
                      <p className="text-gray-900">{selectedAppointment.phone}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Pet Information - White Background */}
              <div className="bg-white p-6">
                <div className="text-left mb-4">
                  <h4 className="font-semibold text-gray-900">Pet Information</h4>
                </div>
                <div className="text-left space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Pet Name</label>
                    <p className="text-gray-900">{selectedAppointment.pet_name}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Pet Type</label>
                    <p className="text-gray-900 capitalize">{selectedAppointment.pet_type}</p>
                  </div>
                </div>
              </div>

              {/* Medical Information - Light Grey Background */}
              <div className="bg-gray-50 p-6">
                <div className="text-left mb-4">
                  <h4 className="font-semibold text-gray-900">Medical Information</h4>
                </div>
                <div className="text-left space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Reason for Visit</label>
                    <p className="text-gray-900">{selectedAppointment.reason_for_visit}</p>
                  </div>
                  {selectedAppointment.primary_vet_hospital && (
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">Primary Veterinary Hospital</label>
                      <p className="text-gray-900">{selectedAppointment.primary_vet_hospital}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Additional Information - White Background */}
              {selectedAppointment.how_heard_about_us && (
                <div className="bg-white p-6">
                  <div className="text-left mb-4">
                    <h4 className="font-semibold text-gray-900">Additional Information</h4>
                  </div>
                  <div className="text-left">
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">How They Heard About Us</label>
                      <p className="text-gray-900">{selectedAppointment.how_heard_about_us}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Booking Information - Light Grey Background */}
              <div className="bg-gray-50 p-6">
                <div className="text-left mb-4">
                  <h4 className="font-semibold text-gray-900">Booking Information</h4>
                </div>
                <div className="text-left">
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Booked On</label>
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
            
            {/* Sticky Footer */}
            <div className="px-6 py-4 bg-gray-100 border-t border-gray-200 flex justify-between rounded-b-xl">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
              {/* Only show delete button for technicians, managers and admins */}
              {canAccessTechnician() && (
                <button
                  onClick={() => {
                    setShowModal(false);
                    confirmDelete(selectedAppointment);
                  }}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 flex items-center transition-colors"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Appointment
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Status Change Confirmation Modal */}
      {showStatusConfirm && statusChange.appointmentId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
            {/* Header */}
            <div className="p-6 border-b border-gray-200 rounded-t-xl" style={{ backgroundColor: primaryColor }}>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">Confirm Status Change</h3>
                <button
                  onClick={() => setShowStatusConfirm(false)}
                  className="text-white hover:text-gray-200 transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>
            
            {/* Content */}
            <div className="p-6">
              <div className="flex items-center mb-4">
                <AlertCircle className="h-8 w-8 text-orange-500 mr-3" />
                <div>
                  <h4 className="text-lg font-medium text-gray-900">Update Appointment Status</h4>
                  <p className="text-sm text-gray-500">Confirm the status change for this appointment</p>
                </div>
              </div>
              
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-orange-800">
                  Are you sure you want to change the status from <strong className="capitalize">{statusChange.currentStatus}</strong> to <strong className="capitalize">{statusChange.newStatus}</strong>?
                </p>
                {statusChange.newStatus === 'abandoned' && (
                  <p className="text-sm text-orange-700 mt-2">
                    <strong>Note:</strong> Setting status to "Abandoned" will free up the appointment time slot for new bookings.
                  </p>
                )}
              </div>
            </div>
              
            {/* Footer */}
            <div className="px-6 py-4 bg-gray-100 border-t border-gray-200 flex justify-end gap-3 rounded-b-xl">
              <button
                onClick={() => setShowStatusConfirm(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmStatusChange}
                className="px-4 py-2 text-sm font-medium text-white border border-transparent rounded-md transition-colors"
                style={{ backgroundColor: primaryColor }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#2196c7'}
                onMouseLeave={(e) => e.target.style.backgroundColor = primaryColor}
              >
                Confirm Change
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Appointment Modal */}
      {showEditModal && editingAppointment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
            {/* Sticky Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 rounded-t-xl" style={{ backgroundColor: primaryColor }}>
              <h3 className="text-lg font-semibold text-white">Edit Appointment</h3>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingAppointment(null);
                  setEditFormData({});
                }}
                className="text-white hover:text-gray-200 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto">
              {/* Owner Information */}
              <div className="bg-white p-6">
                <h4 className="text-lg font-medium text-gray-900 mb-4">Owner Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      First Name *
                    </label>
                    <input
                      type="text"
                      name="owner_first_name"
                      value={editFormData.owner_first_name}
                      onChange={handleEditFormChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Last Name *
                    </label>
                    <input
                      type="text"
                      name="owner_last_name"
                      value={editFormData.owner_last_name}
                      onChange={handleEditFormChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={editFormData.phone}
                      onChange={handleEditFormChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={editFormData.email}
                      onChange={handleEditFormChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Pet Information */}
              <div className="bg-gray-50 p-6">
                <h4 className="text-lg font-medium text-gray-900 mb-4">Pet Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Pet Name *
                    </label>
                    <input
                      type="text"
                      name="pet_name"
                      value={editFormData.pet_name}
                      onChange={handleEditFormChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Pet Type *
                    </label>
                    <select
                      name="pet_type"
                      value={editFormData.pet_type}
                      onChange={handleEditFormChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Pet Type</option>
                      <option value="Dog">Dog</option>
                      <option value="Cat">Cat</option>
                      <option value="Bird">Bird</option>
                      <option value="Rabbit">Rabbit</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Pet Age
                    </label>
                    <input
                      type="text"
                      name="pet_age"
                      value={editFormData.pet_age}
                      onChange={handleEditFormChange}
                      placeholder="e.g., 2 years, 6 months"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Appointment Information */}
              <div className="bg-white p-6">
                <h4 className="text-lg font-medium text-gray-900 mb-4">Appointment Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Appointment Date *
                    </label>
                    <input
                      type="date"
                      name="appointment_date"
                      value={editFormData.appointment_date}
                      onChange={handleEditFormChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Appointment Time *
                    </label>
                    <input
                      type="time"
                      name="appointment_time"
                      value={editFormData.appointment_time}
                      onChange={handleEditFormChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reason for Visit *
                  </label>
                  <textarea
                    name="reason_for_visit"
                    value={editFormData.reason_for_visit}
                    onChange={handleEditFormChange}
                    required
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Please describe the reason for the urgent care visit..."
                  />
                </div>
              </div>

              {/* Additional Information */}
              <div className="bg-gray-50 p-6">
                <h4 className="text-lg font-medium text-gray-900 mb-4">Additional Information</h4>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Additional Notes
                  </label>
                  <textarea
                    name="additional_notes"
                    value={editFormData.additional_notes}
                    onChange={handleEditFormChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Any additional information..."
                  />
                </div>
              </div>
            </div>
              
            {/* Sticky Footer */}
            <div className="px-6 py-4 bg-gray-100 border-t border-gray-200 flex justify-end gap-3 rounded-b-xl">
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingAppointment(null);
                  setEditFormData({});
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                className="px-4 py-2 text-sm font-medium text-white border border-transparent rounded-md transition-colors"
                style={{ backgroundColor: primaryColor }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#2196c7'}
                onMouseLeave={(e) => e.target.style.backgroundColor = primaryColor}
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && appointmentToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
            {/* Header */}
            <div className="p-6 border-b border-gray-200 rounded-t-xl" style={{ backgroundColor: primaryColor }}>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">Confirm Delete</h3>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="text-white hover:text-gray-200 transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>
            
            {/* Content */}
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
            </div>
              
            {/* Footer */}
            <div className="px-6 py-4 bg-gray-100 border-t border-gray-200 flex justify-end gap-3 rounded-b-xl">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => deleteAppointment(appointmentToDelete.id)}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 transition-colors"
              >
                Delete Appointment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UrgentCareAppointments;