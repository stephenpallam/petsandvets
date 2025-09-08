import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Calendar, Clock, Users, Filter, Search, Download, Mail } from 'lucide-react';

const TimesheetReportView = () => {
  const { postId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const from = searchParams.get('from') || 'ready-to-publish';
  
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [employeeFilter, setEmployeeFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

  useEffect(() => {
    fetchTimesheetReport();
  }, [postId]);

  const fetchTimesheetReport = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await axios.get(`${API_BASE_URL}/api/ai-posts/${postId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      setPost(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to load timesheet report');
      console.error('Error fetching timesheet report:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (from === 'ready-to-publish') {
      navigate('/ai-ready-to-publish');
    } else if (from === 'published') {
      navigate('/ai-published-posts');
    } else {
      navigate(-1);
    }
  };

  const filteredEmployees = post?.timesheet_data?.employee_data?.filter(employee => {
    const matchesName = !employeeFilter || 
      employee.user_name.toLowerCase().includes(employeeFilter.toLowerCase());
    return matchesName;
  }) || [];

  const getFilteredEntries = (employee) => {
    if (!dateFilter) return employee.daily_entries || [];
    
    return employee.daily_entries?.filter(entry => 
      entry.date.includes(dateFilter)
    ) || [];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading timesheet report...</p>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'Report not found'}</p>
          <button
            onClick={handleBack}
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const timesheetData = post.timesheet_data || {};

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={handleBack}
              className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to {from === 'ready-to-publish' ? 'Ready to Publish' : 'Previous Page'}
            </button>
            
            <div className="flex items-center space-x-3">
              <button className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                <Download className="h-4 w-4 mr-2" />
                Export
              </button>
              <button className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                <Mail className="h-4 w-4 mr-2" />
                Email Report
              </button>
            </div>
          </div>
          
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{post.topic}</h1>
            <div className="flex items-center space-x-6 text-sm text-gray-600">
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-1" />
                Period: {timesheetData.start_date} to {timesheetData.end_date}
              </div>
              <div className="flex items-center">
                <Users className="h-4 w-4 mr-1" />
                {timesheetData.total_employees} employees
              </div>
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-1" />
                {timesheetData.total_hours?.toFixed(2)} total hours
              </div>
              <div className="text-green-600 font-medium">
                ${timesheetData.total_cost?.toFixed(2)} total cost
              </div>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="text-2xl font-bold text-blue-600">{timesheetData.total_employees}</div>
            <div className="text-sm text-gray-600">Total Employees</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="text-2xl font-bold text-green-600">{timesheetData.total_hours?.toFixed(2)}</div>
            <div className="text-sm text-gray-600">Total Hours</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="text-2xl font-bold text-purple-600">{timesheetData.regular_hours?.toFixed(2)}</div>
            <div className="text-sm text-gray-600">Regular Hours</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="text-2xl font-bold text-orange-600">${timesheetData.total_cost?.toFixed(2)}</div>
            <div className="text-sm text-gray-600">Total Cost</div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Filter by employee name..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={employeeFilter}
                  onChange={(e) => setEmployeeFilter(e.target.value)}
                />
              </div>
            </div>
            <div>
              <input
                type="date"
                className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                placeholder="Filter by date"
              />
            </div>
            {(employeeFilter || dateFilter) && (
              <button
                onClick={() => {
                  setEmployeeFilter('');
                  setDateFilter('');
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>

        {/* Employee Details */}
        <div className="space-y-6">
          {filteredEmployees.map((employee, empIndex) => {
            const filteredEntries = getFilteredEntries(employee);
            
            return (
              <div key={empIndex} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                {/* Employee Header */}
                <div className="bg-blue-50 px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{employee.user_name}</h3>
                      <p className="text-sm text-gray-600">{employee.user_role} • {employee.user_email}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-blue-600">{employee.total_hours?.toFixed(2)} hrs</div>
                      <div className="text-sm text-gray-600">${employee.total_pay?.toFixed(2)}</div>
                    </div>
                  </div>
                </div>

                {/* Employee Daily Table */}
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Regular Hours</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">After Hours</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Hours</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Regular Rate</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">After Hours Rate</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Daily Pay</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredEntries.map((entry, dayIndex) => (
                        <tr key={dayIndex} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {new Date(entry.date).toLocaleDateString('en-US', { 
                              weekday: 'short', 
                              month: 'short', 
                              day: 'numeric' 
                            })}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {entry.regular_hours?.toFixed(2) || '0.00'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {entry.after_hours?.toFixed(2) || '0.00'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {entry.total_hours?.toFixed(2) || '0.00'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            ${employee.hourly_rate?.toFixed(2) || '0.00'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            ${employee.after_hours_rate?.toFixed(2) || '0.00'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            ${((entry.regular_hours * employee.hourly_rate) + (entry.after_hours * employee.after_hours_rate)).toFixed(2)}
                          </td>
                        </tr>
                      ))}
                      
                      {/* Employee Total Row */}
                      <tr className="bg-blue-50 border-t-2 border-blue-200">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-blue-900">Total:</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-blue-900">
                          {employee.regular_hours?.toFixed(2) || '0.00'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-blue-900">
                          {employee.after_hours_hours?.toFixed(2) || '0.00'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-blue-900">
                          {employee.total_hours?.toFixed(2) || '0.00'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">-</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">-</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-blue-900">
                          ${employee.total_pay?.toFixed(2) || '0.00'}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
        </div>

        {filteredEmployees.length === 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <p className="text-gray-500">No employees match the current filters.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TimesheetReportView;