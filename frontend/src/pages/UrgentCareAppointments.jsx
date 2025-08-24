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
  ChevronRight
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
        {/* Filter Section */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <label className="text-sm font-medium text-gray-700">Filter by:</label>
              <select
                value={filterDays}
                onChange={(e) => handleFilterChange(e.target.value)}
                className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
              >
                {filterOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="text-sm text-gray-500">
              Total: {totalCount} appointments
            </div>
          </div>
        </div>
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
        ) : appointments.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Appointments</h3>
            <p className="text-gray-500">No urgent care appointments have been booked yet.</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                All Appointments ({appointments.length})
              </h2>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Client Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Pet Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Reason for Visit
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Time of Appointment
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
                  {appointments.map((appointment) => (
                    <tr key={appointment.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <User className="h-5 w-5 text-gray-400 mr-3" />
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {appointment.owner_first_name} {appointment.owner_last_name}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Heart className="h-5 w-5 text-red-400 mr-2" />
                          <div>
                            <div className="text-sm font-medium text-gray-900">{appointment.pet_name}</div>
                            <div className="text-sm text-gray-500 capitalize">{appointment.pet_type}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{appointment.reason_for_visit}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 text-gray-400 mr-2" />
                          <div>
                            <div className={`text-sm font-medium ${isToday(appointment.appointment_time) ? 'text-blue-600' : 'text-gray-900'}`}>
                              {isToday(appointment.appointment_time) ? 'Today' : formatDate(appointment.appointment_time)}
                            </div>
                            <div className="text-sm text-gray-500">
                              {formatTime(appointment.appointment_time)}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          isPast(appointment.appointment_time) 
                            ? 'bg-gray-100 text-gray-800'
                            : isToday(appointment.appointment_time)
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {isPast(appointment.appointment_time) ? 'Past' : 
                           isToday(appointment.appointment_time) ? 'Today' : 'Scheduled'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => fetchAppointmentDetails(appointment.id)}
                          className="flex items-center text-indigo-600 hover:text-indigo-900"
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
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
    </div>
  );
};

export default UrgentCareAppointments;