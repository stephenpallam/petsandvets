import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { 
  ArrowLeft,
  Save,
  Edit3,
  Calendar,
  Clock,
  User,
  AlertCircle,
  CheckCircle,
  RefreshCw
} from 'lucide-react';

const TimesheetHoursAdjustment = () => {
  const { postId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, token } = useAuth();
  
  // Get the referrer page from URL parameters
  const searchParams = new URLSearchParams(location.search);
  const fromPage = searchParams.get('from') || 'ready-to-publish'; // Default to ready-to-publish
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [post, setPost] = useState(null);
  const [adjustments, setAdjustments] = useState({});
  const [originalHours, setOriginalHours] = useState({}); // Store the original clock-based hours
  const [timeEntries, setTimeEntries] = useState([]); // Store raw time entries with actual clock times
  const [message, setMessage] = useState({ type: '', text: '' });
  
  // Function to get the correct back navigation path
  const getBackPath = () => {
    switch (fromPage) {
      case 'in-review':
        return '/ai-in-review';
      case 'ready-to-publish':
        return '/ai-ready-to-publish';
      case 'published':
        return '/ai-published-posts';
      default:
        return '/ai-ready-to-publish'; // Default fallback
    }
  };

  const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || import.meta.env.REACT_APP_BACKEND_URL || window.location.origin;

  useEffect(() => {
    if (postId && token) {
      fetchTimesheetPost();
    }
  }, [postId, token]);

  const fetchTimeEntries = async (startDate, endDate) => {
    try {
      const params = new URLSearchParams({
        start_date: startDate,
        end_date: endDate
      });

      const response = await fetch(`${API_BASE_URL}/api/timesheet/all-entries?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setTimeEntries(data); // Same format as TimesheetManagement
        return data;
      } else {
        console.error('Failed to fetch time entries');
        return [];
      }
    } catch (error) {
      console.error('Error fetching time entries:', error);
      return [];
    }
  };

  // Calculate hours from clock times (same logic as TimesheetManagement)
  const calculateHours = (clockInTime, clockOutTime) => {
    if (!clockInTime || !clockOutTime) return 0;
    const clockIn = new Date(clockInTime);
    const clockOut = new Date(clockOutTime);
    return (clockOut - clockIn) / (1000 * 60 * 60); // Convert to hours
  };

  const fetchTimesheetPost = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/ai-posts/${postId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setPost(data);
        
        // Get the pay period dates to fetch time entries (source of truth for original hours)
        const payPeriod = getPayPeriodRange(data.topic);
        if (payPeriod) {
          // Fetch time entries - same as Hours Adjustment table in Timesheet Management
          const timeEntriesData = await fetchTimeEntries(payPeriod.startDate, payPeriod.endDate);
          
          // Initialize original hours from time entries (source of truth) and adjusted hours from timesheet data
          const clockBasedOriginals = {};
          const initialAdjustments = {};
          
          data.timesheet_data?.employee_data?.forEach(employee => {
            employee.daily_entries?.forEach((entry, dayIndex) => {
              const key = `${employee.user_name}-${dayIndex}`;
              
              // Find corresponding time entry (same logic as TimesheetManagement Hours Adjustment table)
              const timeEntry = timeEntriesData.find(te => 
                te.user_id === employee.user_id && 
                new Date(te.clock_in_time).toDateString() === new Date(entry.date).toDateString()
              );
              
              if (timeEntry) {
                // Original hours = what's shown in Hours Adjustment table (calculated from clock times)
                const totalOriginalHours = calculateHours(timeEntry.clock_in_time, timeEntry.clock_out_time);
                
                // Use the same breakdown logic as Hours Adjustment table
                const originalRegular = timeEntry.regular_hours || 0;
                const originalAfterHours = timeEntry.after_hours_hours || 0;
                
                clockBasedOriginals[key] = {
                  regular_hours: originalRegular,
                  after_hours: originalAfterHours,
                  total_hours: totalOriginalHours,
                  date: entry.date,
                  employee_name: employee.user_name,
                  employee_id: employee.user_id
                };
              } else {
                // Fallback: use timesheet entry as both original and adjusted
                clockBasedOriginals[key] = {
                  regular_hours: entry.regular_hours || 0,
                  after_hours: entry.after_hours || 0,
                  total_hours: entry.total_hours || 0,
                  date: entry.date,
                  employee_name: employee.user_name,
                  employee_id: employee.user_id
                };
              }
              
              // Adjusted hours = current values from timesheet report (can be modified)
              initialAdjustments[key] = {
                regular_hours: entry.regular_hours || 0,
                after_hours: entry.after_hours || 0,
                total_hours: entry.total_hours || 0,
                date: entry.date,
                employee_name: employee.user_name,
                employee_id: employee.user_id
              };
            });
          });
          
          setOriginalHours(clockBasedOriginals);
          setAdjustments(initialAdjustments);
        }
      } else {
        setMessage({ type: 'error', text: 'Failed to load timesheet data' });
      }
    } catch (error) {
      console.error('Error fetching timesheet post:', error);
      setMessage({ type: 'error', text: 'Network error. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleHourChange = (key, field, value) => {
    const numValue = parseFloat(value) || 0;
    setAdjustments(prev => {
      const updated = {
        ...prev,
        [key]: {
          ...prev[key],
          [field]: numValue
        }
      };
      
      // Recalculate total hours
      if (field === 'regular_hours' || field === 'after_hours') {
        updated[key].total_hours = updated[key].regular_hours + updated[key].after_hours;
      }
      
      return updated;
    });
  };

  const saveAdjustments = async () => {
    setSaving(true);
    try {
      // Convert adjustments back to the original timesheet data structure
      const updatedEmployeeData = post.timesheet_data.employee_data.map(employee => {
        const updatedEmployee = { ...employee };
        
        // Update daily entries with adjusted values
        updatedEmployee.daily_entries = employee.daily_entries.map((entry, dayIndex) => {
          const key = `${employee.user_name}-${dayIndex}`;
          const adjustment = adjustments[key];
          
          if (adjustment) {
            return {
              ...entry,
              regular_hours: adjustment.regular_hours,
              after_hours: adjustment.after_hours,
              total_hours: adjustment.total_hours
            };
          }
          return entry;
        });
        
        // Recalculate employee totals
        const totalRegular = updatedEmployee.daily_entries.reduce((sum, entry) => sum + (entry.regular_hours || 0), 0);
        const totalAfterHours = updatedEmployee.daily_entries.reduce((sum, entry) => sum + (entry.after_hours || 0), 0);
        const totalHours = totalRegular + totalAfterHours;
        
        updatedEmployee.total_hours = totalHours;
        updatedEmployee.regular_hours = totalRegular;
        updatedEmployee.after_hours = totalAfterHours;
        updatedEmployee.total_pay = (totalRegular * employee.hourly_rate) + (totalAfterHours * employee.after_hours_rate);
        
        return updatedEmployee;
      });

      // Calculate overall totals
      const overallTotals = updatedEmployeeData.reduce((totals, employee) => ({
        total_employees: totals.total_employees + 1,
        total_hours: totals.total_hours + employee.total_hours,
        regular_hours: totals.regular_hours + employee.regular_hours,
        after_hours: totals.after_hours + employee.after_hours,
        total_cost: totals.total_cost + employee.total_pay
      }), { total_employees: 0, total_hours: 0, regular_hours: 0, after_hours: 0, total_cost: 0 });

      const updatedTimesheetData = {
        ...post.timesheet_data,
        employee_data: updatedEmployeeData,
        ...overallTotals
      };

      // Update the post with adjusted data
      const response = await fetch(`${API_BASE_URL}/api/ai-posts/${postId}/adjust-hours`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          timesheet_data: updatedTimesheetData
        })
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Hours adjusted successfully!' });
        // Refresh the data
        await fetchTimesheetPost();
      } else {
        const errorData = await response.json();
        setMessage({ type: 'error', text: errorData.detail || 'Failed to save adjustments' });
      }
    } catch (error) {
      console.error('Error saving adjustments:', error);
      setMessage({ type: 'error', text: 'Network error. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const getPayPeriodRange = (topic) => {
    const dateRangeMatch = topic?.match(/(\d{4}-\d{2}-\d{2})\s+to\s+(\d{4}-\d{2}-\d{2})/);
    if (dateRangeMatch) {
      const [, startDate, endDate] = dateRangeMatch;
      return { startDate, endDate };
    }
    return null;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-12 w-12 mx-auto text-blue-600 animate-spin mb-4" />
          <p className="text-gray-600">Loading timesheet data...</p>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 mx-auto text-red-600 mb-4" />
          <p className="text-gray-600">Timesheet data not found</p>
          <button
            onClick={() => navigate('/ai-ready-to-publish')}
            className="mt-4 inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Ready to Publish
          </button>
        </div>
      </div>
    );
  }

  const payPeriod = getPayPeriodRange(post.topic);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        {/* Sticky Header */}
        <div className="sticky top-24 z-40 bg-white rounded-xl shadow-lg overflow-hidden mb-6">
          <div className="px-6 py-4 bg-blue-50 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Adjust Hours</h1>
                <p className="text-sm text-gray-600">
                  Modify hours for pay period: {payPeriod ? `${formatDate(payPeriod.startDate)} - ${formatDate(payPeriod.endDate)}` : 'Unknown period'}
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => navigate(getBackPath())}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </button>
                <button
                  onClick={saveAdjustments}
                  disabled={saving}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  {saving ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Message */}
        {message.text && (
          <div className={`mb-6 p-4 rounded-lg border ${
            message.type === 'success' 
              ? 'bg-green-50 border-green-200 text-green-800' 
              : 'bg-red-50 border-red-200 text-red-800'
          }`}>
            <div className="flex items-center">
              {message.type === 'success' ? (
                <CheckCircle className="h-5 w-5 mr-2" />
              ) : (
                <AlertCircle className="h-5 w-5 mr-2" />
              )}
              {message.text}
            </div>
          </div>
        )}

        {/* Employee Hours Tables */}
        <div className="space-y-6">
          {post.timesheet_data?.employee_data?.map((employee, empIndex) => (
            <div key={empIndex} className="bg-white rounded-xl shadow-lg overflow-hidden">
              {/* Employee Header */}
              <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{employee.user_name}</h3>
                    <p className="text-sm text-gray-600">{employee.user_role?.charAt(0).toUpperCase() + employee.user_role?.slice(1).toLowerCase()}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-blue-600">
                      {Object.values(adjustments)
                        .filter(adj => adj.employee_name === employee.user_name)
                        .reduce((sum, adj) => sum + (adj.total_hours || 0), 0)
                        .toFixed(2)} hrs
                    </div>
                    <div className="text-sm text-gray-600">Adjusted Total Hours</div>
                    
                    {/* Show original total for comparison */}
                    <div className="text-sm text-gray-500 mt-1">
                      Original: {Object.values(originalHours)
                        .filter(orig => orig.employee_name === employee.user_name)
                        .reduce((sum, orig) => sum + (orig.total_hours || 0), 0)
                        .toFixed(2)} hrs
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Daily Hours Table */}
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Original Regular</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Adjusted Regular</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Original After Hours</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Adjusted After Hours</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Original Total</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Adjusted Total</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Daily Pay</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {employee.daily_entries?.map((entry, dayIndex) => {
                      const key = `${employee.user_name}-${dayIndex}`;
                      const adjustment = adjustments[key] || {};
                      const original = originalHours[key] || {};
                      
                      // Original values from clock times (never change)
                      const originalRegular = original.regular_hours || 0;
                      const originalAfterHours = original.after_hours || 0;
                      const originalTotal = original.total_hours || 0;
                      
                      // Current adjusted values
                      const adjustedRegular = adjustment.regular_hours || 0;
                      const adjustedAfterHours = adjustment.after_hours || 0;
                      const adjustedTotal = adjustment.total_hours || 0;
                      
                      // Check if values have been changed from original clock times
                      const regularChanged = adjustedRegular !== originalRegular;
                      const afterHoursChanged = adjustedAfterHours !== originalAfterHours;
                      const totalChanged = adjustedTotal !== originalTotal;
                      
                      return (
                        <tr key={dayIndex} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            <div className="flex items-center">
                              <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                              {formatDate(entry.date)}
                            </div>
                          </td>
                          
                          {/* Original Regular Hours */}
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            <span className={regularChanged ? 'line-through text-gray-400' : ''}>
                              {originalRegular.toFixed(2)}h
                            </span>
                          </td>
                          
                          {/* Adjusted Regular Hours */}
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            <input
                              type="number"
                              min="0"
                              step="0.25"
                              value={adjustedRegular}
                              onChange={(e) => handleHourChange(key, 'regular_hours', e.target.value)}
                              className={`w-20 px-2 py-1 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                regularChanged ? 'border-orange-300 bg-orange-50' : 'border-gray-300'
                              }`}
                            />
                          </td>
                          
                          {/* Original After Hours */}
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            <span className={afterHoursChanged ? 'line-through text-gray-400' : ''}>
                              {originalAfterHours.toFixed(2)}h
                            </span>
                          </td>
                          
                          {/* Adjusted After Hours */}
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            <input
                              type="number"
                              min="0"
                              step="0.25"
                              value={adjustedAfterHours}
                              onChange={(e) => handleHourChange(key, 'after_hours', e.target.value)}
                              className={`w-20 px-2 py-1 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                afterHoursChanged ? 'border-orange-300 bg-orange-50' : 'border-gray-300'
                              }`}
                            />
                          </td>
                          
                          {/* Original Total */}
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            <span className={totalChanged ? 'line-through text-gray-400' : ''}>
                              {originalTotal.toFixed(2)}h
                            </span>
                          </td>
                          
                          {/* Adjusted Total */}
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            <span className={totalChanged ? 'text-orange-600 font-semibold' : ''}>
                              {adjustedTotal.toFixed(2)}h
                            </span>
                          </td>
                          
                          {/* Daily Pay */}
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            ${(adjustedRegular * employee.hourly_rate + adjustedAfterHours * employee.after_hours_rate).toFixed(2)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TimesheetHoursAdjustment;