import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  Users, 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Shield, 
  ShieldOff, 
  Eye, 
  EyeOff,
  X,
  AlertCircle,
  CheckCircle,
  Filter,
  MoreVertical
} from 'lucide-react';

const UserManagement = () => {
  // Auth and permissions
  const { user, token, canAccessManager, loading: authLoading } = useAuth();
  
  // State management
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [pageSize] = useState(10);
  
  // Filters and search
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  
  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  
  // Forms
  const [createForm, setCreateForm] = useState({
    fullName: '',
    email: '',
    password: '',
    role: 'user'
  });
  const [editForm, setEditForm] = useState({
    fullName: '',
    password: '',
    role: ''
  });
  
  // Messages
  const [message, setMessage] = useState({ text: '', type: '' });
  
  const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || import.meta.env.REACT_APP_BACKEND_URL;

  // Role options based on current user permissions
  const getRoleOptions = () => {
    if (user?.role === 'admin') {
      return [
        { value: 'user', label: 'User' },
        { value: 'technician', label: 'Technician' },
        { value: 'manager', label: 'Manager' },
        { value: 'admin', label: 'Admin' }
      ];
    } else if (user?.role === 'manager') {
      return [
        { value: 'user', label: 'User' },
        { value: 'technician', label: 'Technician' }
      ];
    }
    return [];
  };

  // Fetch users
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        page_size: pageSize.toString(),
        search: searchTerm,
        role_filter: roleFilter
      });

      const response = await fetch(`${API_BASE_URL}/api/users?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUsers(data.users);
        setTotalUsers(data.total);
      } else {
        setError('Failed to fetch users');
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Create user
  const handleCreateUser = async (e) => {
    e.preventDefault();
    
    try {
      // Map camelCase to snake_case for backend
      const userData = {
        email: createForm.email,
        password: createForm.password,
        full_name: createForm.fullName,
        role: createForm.role
      };

      const response = await fetch(`${API_BASE_URL}/api/register`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (response.ok) {
        setMessage({ text: 'User created successfully!', type: 'success' });
        setShowCreateModal(false);
        setCreateForm({ fullName: '', email: '', password: '', role: 'user' });
        fetchUsers();
        
        setTimeout(() => setMessage({ text: '', type: '' }), 5000);
      } else {
        const errorData = await response.json();
        let errorMessage = 'Failed to create user';
        
        if (errorData.detail) {
          if (typeof errorData.detail === 'string') {
            errorMessage = errorData.detail;
          } else if (Array.isArray(errorData.detail)) {
            // Handle FastAPI validation errors
            errorMessage = errorData.detail.map(err => err.msg || err).join(', ');
          } else if (typeof errorData.detail === 'object' && errorData.detail.msg) {
            errorMessage = errorData.detail.msg;
          }
        }
        
        setMessage({ text: errorMessage, type: 'error' });
      }
    } catch (error) {
      console.error('Error creating user:', error);
      setMessage({ text: 'Network error. Please try again.', type: 'error' });
    }
  };

  // Update user
  const handleUpdateUser = async (e) => {
    e.preventDefault();
    
    try {
      const updateData = {};
      if (editForm.fullName) updateData.fullName = editForm.fullName;
      if (editForm.password) updateData.password = editForm.password;
      if (editForm.role && user?.role === 'admin') updateData.role = editForm.role;

      const response = await fetch(`${API_BASE_URL}/api/users/${selectedUser.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      if (response.ok) {
        setMessage({ text: 'User updated successfully!', type: 'success' });
        setShowEditModal(false);
        setSelectedUser(null);
        setEditForm({ fullName: '', password: '', role: '' });
        fetchUsers();
        
        setTimeout(() => setMessage({ text: '', type: '' }), 5000);
      } else {
        const errorData = await response.json();
        let errorMessage = 'Failed to update user';
        
        if (errorData.detail) {
          if (typeof errorData.detail === 'string') {
            errorMessage = errorData.detail;
          } else if (Array.isArray(errorData.detail)) {
            // Handle FastAPI validation errors
            errorMessage = errorData.detail.map(err => err.msg || err).join(', ');
          } else if (typeof errorData.detail === 'object' && errorData.detail.msg) {
            errorMessage = errorData.detail.msg;
          }
        }
        
        setMessage({ text: errorMessage, type: 'error' });
      }
    } catch (error) {
      console.error('Error updating user:', error);
      setMessage({ text: 'Network error. Please try again.', type: 'error' });
    }
  };

  // Block/Unblock user
  const handleBlockUser = async (userId, isBlocked) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/users/${userId}/block`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          isBlocked: !isBlocked,
          reason: !isBlocked ? 'Blocked by admin/manager' : undefined
        }),
      });

      if (response.ok) {
        const action = !isBlocked ? 'blocked' : 'unblocked';
        setMessage({ text: `User ${action} successfully!`, type: 'success' });
        fetchUsers();
        
        setTimeout(() => setMessage({ text: '', type: '' }), 5000);
      } else {
        const errorData = await response.json();
        setMessage({ text: errorData.detail || 'Failed to update user status', type: 'error' });
      }
    } catch (error) {
      console.error('Error blocking/unblocking user:', error);
      setMessage({ text: 'Network error. Please try again.', type: 'error' });
    }
  };

  // Delete user
  const handleDeleteUser = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/users/${selectedUser.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        setMessage({ text: 'User deleted successfully!', type: 'success' });
        setShowDeleteModal(false);
        setSelectedUser(null);
        fetchUsers();
        
        setTimeout(() => setMessage({ text: '', type: '' }), 5000);
      } else {
        const errorData = await response.json();
        setMessage({ text: errorData.detail || 'Failed to delete user', type: 'error' });
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      setMessage({ text: 'Network error. Please try again.', type: 'error' });
    }
  };

  // Open edit modal
  const openEditModal = (user) => {
    setSelectedUser(user);
    setEditForm({
      fullName: user.fullName,
      password: '',
      role: user.role
    });
    setShowEditModal(true);
  };

  // Open delete modal
  const openDeleteModal = (user) => {
    setSelectedUser(user);
    setShowDeleteModal(true);
  };

  // Handle search and filter changes
  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      setCurrentPage(1);
      fetchUsers();
    }, 500);

    return () => clearTimeout(delayedSearch);
  }, [searchTerm, roleFilter]);

  // Fetch users on mount and page change
  useEffect(() => {
    if (!authLoading && canAccessManager()) {
      fetchUsers();
      // Scroll to top when page changes
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [authLoading, canAccessManager, currentPage]);

  // Show loading while authentication is being determined
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Check permissions
  if (!canAccessManager()) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-red-800 mb-2">Access Denied</h2>
            <p className="text-red-600">You need manager or admin privileges to access user management.</p>
          </div>
        </div>
      </div>
    );
  }

  const totalPages = Math.ceil(totalUsers / pageSize);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Header - Inside the main card */}
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                User Management
              </h2>
              <button
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center px-4 py-2 text-white rounded-lg font-medium hover:opacity-90 transition-opacity"
                style={{ backgroundColor: '#29add3' }}
              >
                <Plus className="h-5 w-5 mr-2" />
                Add User
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            <p className="text-gray-600 mb-6">Manage user accounts, roles, and permissions for your veterinary hospital.</p>

            {/* Success/Error Messages */}
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

            {/* Search and Filters */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search users by name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">All Roles</option>
                    <option value="user">Users</option>
                    <option value="technician">Technicians</option>
                    {user?.role === 'admin' && <option value="manager">Managers</option>}
                    {user?.role === 'admin' && <option value="admin">Admins</option>}
                  </select>
                </div>
              </div>
            </div>

            {/* Users Table */}
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Role
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Created
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {loading ? (
                      <tr>
                        <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                          <div className="flex items-center justify-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-3"></div>
                            Loading users...
                          </div>
                        </td>
                      </tr>
                    ) : users.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                          No users found.
                        </td>
                      </tr>
                    ) : (
                      users.map((userItem) => (
                        <tr key={userItem.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{userItem.fullName}</div>
                              <div className="text-sm text-gray-500">{userItem.email}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              userItem.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                              userItem.role === 'manager' ? 'bg-blue-100 text-blue-800' :
                              userItem.role === 'technician' ? 'bg-green-100 text-green-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {userItem.role.charAt(0).toUpperCase() + userItem.role.slice(1)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              userItem.isBlocked ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                            }`}>
                              {userItem.isBlocked ? 'Blocked' : 'Active'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {userItem.createdAt ? new Date(userItem.createdAt).toLocaleDateString() : 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex items-center justify-end space-x-2">
                              <button
                                onClick={() => openEditModal(userItem)}
                                className="text-blue-600 hover:text-blue-900 p-1 rounded"
                                title="Edit user"
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleBlockUser(userItem.id, userItem.isBlocked)}
                                className={`p-1 rounded ${
                                  userItem.isBlocked ? 'text-green-600 hover:text-green-900' : 'text-orange-600 hover:text-orange-900'
                                }`}
                                title={userItem.isBlocked ? 'Unblock user' : 'Block user'}
                              >
                                {userItem.isBlocked ? <Shield className="h-4 w-4" /> : <ShieldOff className="h-4 w-4" />}
                              </button>
                              <button
                                onClick={() => openDeleteModal(userItem)}
                                className="text-red-600 hover:text-red-900 p-1 rounded"
                                title="Delete user"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-700">
                      Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, totalUsers)} of {totalUsers} users
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                      >
                        Previous
                      </button>
                      <span className="px-3 py-1 text-sm text-gray-700">
                        Page {currentPage} of {totalPages}
                      </span>
                      <button
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Create User Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-screen overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Create New User</h3>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>
            <form onSubmit={handleCreateUser} className="px-6 py-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={createForm.fullName}
                  onChange={(e) => setCreateForm(prev => ({...prev, fullName: e.target.value}))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={createForm.email}
                  onChange={(e) => setCreateForm(prev => ({...prev, email: e.target.value}))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  required
                  value={createForm.password}
                  onChange={(e) => setCreateForm(prev => ({...prev, password: e.target.value}))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role
                </label>
                <select
                  value={createForm.role}
                  onChange={(e) => setCreateForm(prev => ({...prev, role: e.target.value}))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {getRoleOptions().map(role => (
                    <option key={role.value} value={role.value}>
                      {role.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-white rounded-lg hover:opacity-90 transition-opacity"
                  style={{ backgroundColor: '#29add3' }}
                >
                  Create User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-screen overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Edit User</h3>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>
            <form onSubmit={handleUpdateUser} className="px-6 py-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={editForm.fullName}
                  onChange={(e) => setEditForm(prev => ({...prev, fullName: e.target.value}))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  New Password (leave blank to keep current)
                </label>
                <input
                  type="password"
                  value={editForm.password}
                  onChange={(e) => setEditForm(prev => ({...prev, password: e.target.value}))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              {user?.role === 'admin' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Role
                  </label>
                  <select
                    value={editForm.role}
                    onChange={(e) => setEditForm(prev => ({...prev, role: e.target.value}))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {getRoleOptions().map(role => (
                      <option key={role.value} value={role.value}>
                        {role.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-white rounded-lg hover:opacity-90 transition-opacity"
                  style={{ backgroundColor: '#29add3' }}
                >
                  Update User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Delete User</h3>
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>
            <div className="px-6 py-4">
              <p className="text-gray-600 mb-4">
                Are you sure you want to delete <strong>{selectedUser.fullName}</strong>? This action cannot be undone.
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteUser}
                  className="px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;