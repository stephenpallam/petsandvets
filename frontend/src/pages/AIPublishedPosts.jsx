import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  CheckCircle, 
  ExternalLink, 
  Calendar, 
  Clock, 
  AlertCircle,
  RefreshCw,
  MessageSquare,
  Image as ImageIcon,
  Filter,

  ChevronLeft,
  ChevronRight,
  Trash2,
  X,
  Users,
  Send,
  Hash
} from 'lucide-react';
import { formatDate as utilFormatDate } from '../utils/dateUtils';

// Helper function to convert URLs to clickable links
const formatContentWithLinks = (content) => {
  if (!content) return content;
  
  let formattedContent = content;
  
  // First handle text + URL patterns that should be replaced together
  // Replace "book online: URL" or "book: URL" patterns with just "Book Now"
  formattedContent = formattedContent.replace(
    /(book\s*(?:online|now)?:\s*)(https:\/\/petsandvetsanimalhospital\.com\/book\b[^\s]*)/gi,
    '<a href="https://petsandvetsanimalhospital.com/book" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:text-blue-800 font-medium underline">Book Now</a>'
  );
  
  // Replace "visit: URL" or "website: URL" patterns with just "Visit Our Website"
  formattedContent = formattedContent.replace(
    /(visit|website):\s*(https:\/\/petsandvetsanimalhospital\.com\b[^\s]*)/gi,
    '<a href="https://petsandvetsanimalhospital.com" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:text-blue-800 font-medium underline">Visit Our Website</a>'
  );
  
  // Handle standalone URLs that weren't caught by the above patterns
  // Book links
  formattedContent = formattedContent.replace(
    /\bhttps:\/\/petsandvetsanimalhospital\.com\/book\b[^\s]*/g,
    '<a href="https://petsandvetsanimalhospital.com/book" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:text-blue-800 font-medium underline">Book Now</a>'
  );
  
  // Website links (only if not already replaced)
  formattedContent = formattedContent.replace(
    /\bhttps:\/\/petsandvetsanimalhospital\.com\b(?!\/book)[^\s]*/g,
    '<a href="https://petsandvetsanimalhospital.com" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:text-blue-800 font-medium underline">Visit Our Website</a>'
  );
  
  // Handle other URLs (make them clickable but keep original text)
  formattedContent = formattedContent.replace(
    /\bhttps?:\/\/(?!petsandvetsanimalhospital\.com)[^\s]+/g,
    (match) => `<a href="${match}" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:text-blue-800 underline">${match}</a>`
  );
  
  return formattedContent;
};

// Component to render content with clickable links (for emails)
const ContentWithLinks = ({ content, className = "" }) => {
  const formattedContent = formatContentWithLinks(content);
  
  return (
    <div 
      className={`whitespace-pre-wrap ${className}`}
      dangerouslySetInnerHTML={{ __html: formattedContent }}
    />
  );
};

// Component to render SMS content with clickable links (React elements instead of HTML)
const SMSContentWithLinks = ({ content, className = "" }) => {
  if (!content) return <span className={className}>{content}</span>;
  
  // First handle text + URL patterns that should be replaced together
  let processedContent = content;
  
  // Replace "book online: URL" or "book: URL" patterns with just "Book Now"
  processedContent = processedContent.replace(
    /(book\s*(?:online|now)?:\s*)(https:\/\/petsandvetsanimalhospital\.com\/book\b[^\s]*)/gi,
    'BOOKNOW_PLACEHOLDER'
  );
  
  // Replace "visit: URL" or "website: URL" patterns with just "Visit Our Website"  
  processedContent = processedContent.replace(
    /(visit|website):\s*(https:\/\/petsandvetsanimalhospital\.com\b[^\s]*)/gi,
    'WEBSITE_PLACEHOLDER'
  );
  
  // Split content by URLs and placeholders
  const parts = processedContent.split(/(BOOKNOW_PLACEHOLDER|WEBSITE_PLACEHOLDER|https?:\/\/[^\s]+)/g);
  
  return (
    <span className={className}>
      {parts.map((part, index) => {
        if (part === 'BOOKNOW_PLACEHOLDER') {
          return (
            <a 
              key={index}
              href="https://petsandvetsanimalhospital.com/book" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-white underline hover:text-blue-200 font-medium"
            >
              Book Now
            </a>
          );
        } else if (part === 'WEBSITE_PLACEHOLDER') {
          return (
            <a 
              key={index}
              href="https://petsandvetsanimalhospital.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-white underline hover:text-blue-200 font-medium"
            >
              Visit Our Website
            </a>
          );
        } else if (part.match(/^https?:\/\/[^\s]+$/)) {
          // Handle remaining standalone URLs
          let displayText = part;
          if (part.includes('petsandvetsanimalhospital.com/book')) {
            displayText = 'Book Now';
          } else if (part.includes('petsandvetsanimalhospital.com')) {
            displayText = 'Visit Our Website';
          }
          
          return (
            <a 
              key={index}
              href={part} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-white underline hover:text-blue-200 font-medium"
            >
              {displayText}
            </a>
          );
        } else {
          // Regular text
          return part;
        }
      })}
    </span>
  );
};

// Component for SMS customer preview with proper link styling
const SMSCustomerContentWithLinks = ({ content, className = "" }) => {
  if (!content) return <span className={className}>{content}</span>;
  
  // First handle text + URL patterns that should be replaced together
  let processedContent = content;
  
  // Replace "book online: URL" or "book: URL" patterns with just "Book Now"
  processedContent = processedContent.replace(
    /(book\s*(?:online|now)?:\s*)(https:\/\/petsandvetsanimalhospital\.com\/book\b[^\s]*)/gi,
    'BOOKNOW_PLACEHOLDER'
  );
  
  // Replace "visit: URL" or "website: URL" patterns with just "Visit Our Website"  
  processedContent = processedContent.replace(
    /(visit|website):\s*(https:\/\/petsandvetsanimalhospital\.com\b[^\s]*)/gi,
    'WEBSITE_PLACEHOLDER'
  );
  
  // Split content by URLs and placeholders
  const parts = processedContent.split(/(BOOKNOW_PLACEHOLDER|WEBSITE_PLACEHOLDER|https?:\/\/[^\s]+)/g);
  
  return (
    <span className={className}>
      {parts.map((part, index) => {
        if (part === 'BOOKNOW_PLACEHOLDER') {
          return (
            <a 
              key={index}
              href="https://petsandvetsanimalhospital.com/book" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 font-medium underline"
            >
              Book Now
            </a>
          );
        } else if (part === 'WEBSITE_PLACEHOLDER') {
          return (
            <a 
              key={index}
              href="https://petsandvetsanimalhospital.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 font-medium underline"
            >
              Visit Our Website
            </a>
          );
        } else if (part.match(/^https?:\/\/[^\s]+$/)) {
          // Handle remaining standalone URLs
          let displayText = part;
          if (part.includes('petsandvetsanimalhospital.com/book')) {
            displayText = 'Book Now';
          } else if (part.includes('petsandvetsanimalhospital.com')) {
            displayText = 'Visit Our Website';
          }
          
          return (
            <a 
              key={index}
              href={part} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 font-medium underline"
            >
              {displayText}
            </a>
          );
        } else {
          // Regular text
          return part;
        }
      })}
    </span>
  );
};

const SMSContentPreview = ({ post }) => {
  const [customerPreview, setCustomerPreview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCustomerPreview = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/customers?limit=1`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (response.ok) {
          const customerData = await response.json();
          // Handle paginated response format from API
          if (customerData && customerData.customers && customerData.customers.length > 0) {
            setCustomerPreview(customerData.customers[0]);
          } else if (customerData && Array.isArray(customerData) && customerData.length > 0) {
            // Handle direct array format (fallback)
            setCustomerPreview(customerData[0]);
          } else {
            setError('No customers found in database');
          }
        } else {
          setError('Failed to fetch customer data');
        }
      } catch (error) {
        console.error('Error fetching customer preview:', error);
        setError('Error loading customer data');
      } finally {
        setLoading(false);
      }
    };

    fetchCustomerPreview();
  }, []);

  const getPreviewContent = () => {
    if (!post.content) return 'No content available';
    
    let previewContent = post.content;
    
    if (customerPreview) {
      // Replace customer name placeholder with actual customer data
      // Handle different customer name field formats
      const customerName = customerPreview.customer_name || 
                           customerPreview.name || 
                           customerPreview.owner_first_name || 
                           customerPreview.first_name || 
                           'Customer';
      previewContent = previewContent.replace(/\[CUSTOMER_NAME\]/g, customerName);
      
      // Replace pet placeholders with actual pet data
      let petNames = 'Pet';
      
      // Handle pets array format (new format)
      if (customerPreview.pets && Array.isArray(customerPreview.pets) && customerPreview.pets.length > 0) {
        const petNamesList = customerPreview.pets
          .map(pet => pet.pet_name || pet.name || pet.petName)
          .filter(Boolean);
        if (petNamesList.length > 0) {
          if (petNamesList.length === 1) {
            petNames = petNamesList[0];
          } else if (petNamesList.length === 2) {
            petNames = `${petNamesList[0]} and ${petNamesList[1]}`;
          } else {
            petNames = `${petNamesList.slice(0, -1).join(', ')}, and ${petNamesList[petNamesList.length - 1]}`;
          }
        }
      }
      // Handle legacy pet_name format (fallback)
      else if (customerPreview.pet_name && customerPreview.pet_name.trim()) {
        petNames = customerPreview.pet_name.trim();
      }
      // Handle other pet field formats
      else if (customerPreview.petName && customerPreview.petName.trim()) {
        petNames = customerPreview.petName.trim();
      }
      
      previewContent = previewContent.replace(/\[PET_NAME\]/g, petNames);
      previewContent = previewContent.replace(/\[PET_NAMES\]/g, petNames);
    } else {
      // No customer data available - show message instead of dummy data
      return 'No customer data available for preview. Please add customers to the database to see personalized preview.';
    }
    
    // Replace link placeholder with actual SMS link
    const smsLink = post.sms_link || 'https://petsandvetsanimalhospital.com';
    previewContent = previewContent.replace(/\[LINK\]/g, smsLink);
    
    // Replace global placeholders with actual business information
    previewContent = previewContent.replace(/\[BUSINESS_NAME\]/g, 'Pets and Vets Animal Hospital');
    previewContent = previewContent.replace(/\[PHONE_NUMBER\]/g, '(703) 957-3297');
    previewContent = previewContent.replace(/\[WEBSITE_LINK\]/g, 'https://petsandvetsanimalhospital.com');
    previewContent = previewContent.replace(/\[BOOK_NOW_LINK\]/g, 'https://petsandvetsanimalhospital.com/book');
    previewContent = previewContent.replace(/\[BUSINESS_ADDRESS\]/g, '43114 Peacock Market Plaza, Suite F110\nSouth Riding, VA 20152');
    
    return previewContent;
  };

  if (loading) {
    return (
      <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
        <div className="text-sm text-orange-600 mb-2">📱 SMS Preview</div>
        <div className="text-gray-500">Loading customer data from database...</div>
      </div>
    );
  }

  if (error || !customerPreview) {
    // For non-personalized SMS or when no customer data available
    const isPersonalized = post.marketing_sms_personalized !== false && 
                          (post.content && (post.content.includes('[CUSTOMER_NAME]') || 
                                           post.content.includes('[PET_NAME]') || 
                                           post.content.includes('[PET_NAMES]')));
    
    return (
      <div className="space-y-4">
        {/* Show SMS content directly for non-personalized messages */}
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="text-sm text-orange-600 mb-2 font-medium">
            📱 {isPersonalized ? 'SMS Preview Unavailable' : 'SMS Preview Content'}
          </div>
          {isPersonalized ? (
            <div className="text-orange-800 text-sm">
              {error || 'No customers found in database. Please add customers to see personalized SMS preview.'}
            </div>
          ) : (
            <div className="bg-white p-3 rounded border">
              <SMSCustomerContentWithLinks 
                content={post.content} 
                className="text-gray-900 leading-relaxed"
              />
            </div>
          )}
        </div>
      </div>
    );
  }

  // Check if this is a personalized SMS
  const isPersonalized = post.marketing_sms_personalized !== false && 
                        (post.content && (post.content.includes('[CUSTOMER_NAME]') || 
                                         post.content.includes('[PET_NAME]') || 
                                         post.content.includes('[PET_NAMES]')));

  return (
    <div className="space-y-4">
      {/* SMS Preview with Real Customer Data */}
      <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
        <div className="text-sm text-orange-600 mb-2 font-medium">
          📱 {isPersonalized ? 'SMS Preview (First Customer)' : 'SMS Preview Content'}
        </div>
        <div className="bg-white p-3 rounded border">
          <SMSCustomerContentWithLinks 
            content={getPreviewContent()} 
            className="text-gray-900 leading-relaxed"
          />
        </div>
        {isPersonalized && (
          <div className="mt-2 text-xs text-orange-600">
            Preview for: {customerPreview.customer_name || 
                        customerPreview.name || 
                        customerPreview.owner_first_name || 
                        customerPreview.first_name || 
                        'Customer'} 
            {customerPreview.phone_number || 
             customerPreview.phone || 
             customerPreview.owner_phone ? 
              ` (${customerPreview.phone_number || customerPreview.phone || customerPreview.owner_phone})` : 
              ' (No phone number)'
            }
          </div>
        )}
      </div>
    </div>
  );
};

const AIPublishedPosts = () => {
  const { user, token, isAdmin, canAccessManager, loading: authLoading } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [pageLoading, setPageLoading] = useState(true);

  const [filterPlatform, setFilterPlatform] = useState('all');
  const [filterDateRange, setFilterDateRange] = useState('all');
  const [filterAgentType, setFilterAgentType] = useState('all');
  const [agentTypes, setAgentTypes] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    total_pages: 0,
    total_count: 0,
    has_next: false,
    has_prev: false
  });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [postToDelete, setPostToDelete] = useState(null);
  const [deletingPost, setDeletingPost] = useState(null);
  const [selectedEmployee, setSelectedEmployee] = useState('all');

  const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || import.meta.env.REACT_APP_BACKEND_URL || window.location.origin;

  // Auth check
  useEffect(() => {
    if (!authLoading && (!user || !canAccessManager())) {
      window.location.href = '/login';
    } else if (!authLoading) {
      setPageLoading(false);
      fetchPosts();
      fetchAgentTypes();
    }
  }, [user, authLoading, canAccessManager]);

  // Refetch posts when filter changes
  useEffect(() => {
    if (!pageLoading) {
      setCurrentPage(1);
      fetchPosts(1);
    }
  }, [filterAgentType]);

  const fetchAgentTypes = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/ai-agent-types`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setAgentTypes(data);
      }
    } catch (error) {
      console.error('Error fetching agent types:', error);
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    fetchPosts(page);
  };

  const handlePrevPage = () => {
    if (pagination.has_prev) {
      handlePageChange(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (pagination.has_next) {
      handlePageChange(currentPage + 1);
    }
  };

  const fetchPosts = async (page = currentPage) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10'
      });
      
      if (filterAgentType !== 'all') {
        params.append('agent_type', filterAgentType);
      }
      
      const url = `${API_BASE_URL}/api/ai-posts/published?${params.toString()}`;
        
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setPosts(data.posts);
        setPagination(data.pagination);
        setCurrentPage(data.pagination.current_page);
      } else {
        setMessage({ type: 'error', text: 'Failed to fetch published posts' });
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
      setMessage({ type: 'error', text: 'Network error. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getPlatformIcon = (platform) => {
    const icons = {
      facebook: '📘',
      instagram: '📷',
      twitter: '🐦',
      whatsapp: '💬'
    };
    return icons[platform] || '📱';
  };

  const getPostStats = (post) => {
    // Mock stats - in real implementation, these would come from social media APIs
    return {
      views: Math.floor(Math.random() * 1000),
      likes: Math.floor(Math.random() * 50),
      shares: Math.floor(Math.random() * 20),
      comments: Math.floor(Math.random() * 10)
    };
  };

  const filteredPosts = posts.filter(post => {
    const matchesPlatform = filterPlatform === 'all' || 
                           post.platforms.includes(filterPlatform);
    
    const matchesAgentType = filterAgentType === 'all' || 
                            post.agent_type === filterAgentType;
    
    const matchesDate = filterDateRange === 'all' || (() => {
      const postDate = new Date(post.published_at);
      const now = new Date();
      const daysDiff = (now - postDate) / (1000 * 60 * 60 * 24);
      
      switch(filterDateRange) {
        case 'today': return daysDiff <= 1;
        case 'week': return daysDiff <= 7;
        case 'month': return daysDiff <= 30;
        default: return true;
      }
    })();
    
    return matchesPlatform && matchesAgentType && matchesDate;
  });

  // Delete functions
  const openDeleteModal = (post) => {
    setPostToDelete(post);
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setPostToDelete(null);
  };

  const confirmDeletePost = async () => {
    if (!postToDelete) return;

    setDeletingPost(postToDelete.id);
    setShowDeleteModal(false);
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/ai-posts/${postToDelete.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Post deleted successfully!' });
        fetchPosts(); // Refresh the posts list
      } else {
        const errorData = await response.json();
        setMessage({ type: 'error', text: errorData.detail || 'Failed to delete post' });
      }
    } catch (error) {
      console.error('Error deleting post:', error);
      setMessage({ type: 'error', text: 'Network error. Please try again.' });
    } finally {
      setDeletingPost(null);
      setPostToDelete(null);
    }
  };

  if (authLoading || pageLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Header */}
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-8 w-8 text-green-600" />
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    Published
                  </h2>
                  <p className="text-sm text-gray-600">
                    View all published AI-generated social media posts
                  </p>
                </div>
              </div>
              <button
                onClick={fetchPosts}
                disabled={loading}
                className="text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50 flex items-center font-medium"
                style={{ 
                  backgroundColor: loading ? '#94a3b8' : '#29add3'
                }}
                onMouseEnter={(e) => {
                  if (!loading) e.target.style.backgroundColor = '#2196c7';
                }}
                onMouseLeave={(e) => {
                  if (!loading) e.target.style.backgroundColor = '#29add3';
                }}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>
          </div>

          {/* Content Area */}
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
                  <div className="ml-3">
                    <p className={`text-sm font-medium ${
                      message.type === 'error' ? 'text-red-800' : 'text-green-800'
                    }`}>
                      {message.text}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Filters */}
            <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Platform</label>
                <select
                  value={filterPlatform}
                  onChange={(e) => setFilterPlatform(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Platforms</option>
                  <option value="facebook">Facebook</option>
                  <option value="instagram">Instagram</option>
                  <option value="twitter">X (Twitter)</option>
                  <option value="whatsapp">WhatsApp</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
                <select
                  value={filterDateRange}
                  onChange={(e) => setFilterDateRange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Time</option>
                  <option value="today">Today</option>
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Agent Type</label>
                <select
                  value={filterAgentType}
                  onChange={(e) => setFilterAgentType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Types</option>
                  {agentTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>
              

            </div>

            {/* Posts List */}
            {loading ? (
              <div className="text-center py-12">
                <RefreshCw className="h-8 w-8 animate-spin mx-auto text-gray-400 mb-4" />
                <p className="text-gray-500">Loading posts...</p>
              </div>
            ) : posts.length === 0 ? (
              <div className="text-center py-12">
                <MessageSquare className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-500 text-lg">No published posts found</p>
                <p className="text-gray-400 text-sm mt-2">
                  {posts.length === 0 ? 'Posts will appear here after they are published' : 'Try adjusting your filters'}
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {posts.map((post) => {
                  const stats = getPostStats(post);
                  return (
                    <div key={post.id} className="border border-gray-200 rounded-lg overflow-hidden">
                      <div className="p-6">
                        {/* Post Header - Only show for non-timesheet posts */}
                        {post.agent_type !== 'time_sheet' && (
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-2">
                                <span className="inline-flex items-center px-3 py-1 rounded text-xs font-medium bg-green-100 text-green-800">
                                  Published
                                </span>
                                <span className="inline-flex items-center px-3 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                  {post.agent_name || 'AI Agent'}
                                </span>
                                {post.agent_type && (
                                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium ${
                                    post.agent_type === 'social_media' ? 'bg-teal-100 text-teal-700' :
                                    post.agent_type === 'email' ? 'bg-purple-100 text-purple-700' :
                                    post.agent_type === 'email_agent' ? 'bg-purple-100 text-purple-700' :
                                    post.agent_type === 'sms_agent' ? 'bg-orange-100 text-orange-700' :
                                    post.agent_type === 'marketing_agent' ? 'bg-pink-100 text-pink-700' :
                                    'bg-gray-100 text-gray-700'
                                  }`}>
                                    {post.agent_type === 'social_media' ? 'Social Media' :
                                     post.agent_type === 'email' ? 'Email' :
                                     post.agent_type === 'email_agent' ? 'Email' :
                                     post.agent_type === 'sms_agent' ? 'SMS' :
                                     post.agent_type === 'marketing_agent' ? 'Marketing' :
                                     post.agent_type}
                                  </span>
                                )}
                                <span className="text-gray-500 text-sm">•</span>
                                <span className="text-gray-500 text-sm">{post.topic}</span>
                              </div>
                              <div className="flex items-center space-x-4 text-sm text-gray-500">
                                <div className="flex items-center">
                                  <Calendar className="h-4 w-4 mr-1" />
                                  Published: {formatDate(post.published_at)}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              {post.platforms && post.platforms.map((platform) => (
                                <span 
                                  key={platform} 
                                  className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-700"
                                >
                                  {getPlatformIcon(platform)} {platform.charAt(0).toUpperCase() + platform.slice(1)}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Post Content */}
                        {post.agent_type === 'time_sheet' ? (
                          // Timesheet Post Rendering
                          <div>
                            {/* Timesheet Header */}
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-2">
                                  <span className="inline-flex items-center px-3 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                    {post.agent_name || 'Timesheet Agent'}
                                  </span>
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium bg-green-100 text-green-700">
                                    <Clock className="h-3 w-3 mr-1" />
                                    Time Sheet
                                  </span>
                                </div>
                                <div className="flex items-center space-x-4 text-sm text-gray-500">
                                  <div className="flex items-center">
                                    <Calendar className="h-4 w-4 mr-1" />
                                    Published: {formatDate(post.published_at)}
                                  </div>
                                </div>
                              </div>
                              
                              {/* Pay Period Date Range */}
                              <div className="text-right">
                                <div className="flex items-center justify-end space-x-2">
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-700">
                                    Pay Period
                                  </span>
                                  <span className="text-sm text-gray-900">
                                    {(() => {
                                      const topic = post.topic || '';
                                      const dateRangeMatch = topic.match(/(\d{4}-\d{2}-\d{2})\s+to\s+(\d{4}-\d{2}-\d{2})/);
                                      if (dateRangeMatch) {
                                        const [, startDate, endDate] = dateRangeMatch;
                                        
                                        // Format dates directly from string without creating Date objects
                                        const formatDateFromString = (dateStr) => {
                                          const [year, month, day] = dateStr.split('-');
                                          const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                                                             'Jul', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'];
                                          const monthName = monthNames[parseInt(month) - 1];
                                          const dayNum = parseInt(day);
                                          
                                          const getDaySuffix = (day) => {
                                            if (day >= 11 && day <= 13) return 'th';
                                            switch (day % 10) {
                                              case 1: return 'st';
                                              case 2: return 'nd';
                                              case 3: return 'rd';
                                              default: return 'th';
                                            }
                                          };
                                          
                                          return `${monthName} ${dayNum}${getDaySuffix(dayNum)}`;
                                        };
                                        
                                        const startFormatted = formatDateFromString(startDate);
                                        const endFormatted = formatDateFromString(endDate);
                                        const year = startDate.split('-')[0];
                                        
                                        return `${startFormatted} - ${endFormatted}, ${year}`;
                                      }
                                      return topic.replace('Timesheet Report: ', '');
                                    })()}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Pay Period Summary */}
                            <div className="bg-gray-50 rounded-lg p-4 mb-4">
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                                <div>
                                  <div className="text-2xl font-bold text-blue-600">{post.timesheet_data?.total_employees || 0}</div>
                                  <div className="text-sm text-gray-600">Employees</div>
                                </div>
                                <div>
                                  <div className="text-2xl font-bold text-green-600">{post.timesheet_data?.total_hours?.toFixed(2) || '0.00'}</div>
                                  <div className="text-sm text-gray-600">Total Hours</div>
                                </div>
                                <div>
                                  <div className="text-2xl font-bold text-purple-600">{post.timesheet_data?.regular_hours?.toFixed(2) || '0.00'}</div>
                                  <div className="text-sm text-gray-600">Regular Hours</div>
                                </div>
                                <div>
                                  <div className="text-2xl font-bold text-orange-600">${post.timesheet_data?.total_cost?.toFixed(2) || '0.00'}</div>
                                  <div className="text-sm text-gray-600">Total Pay</div>
                                </div>
                              </div>
                            </div>

                            {/* Employee Dropdown */}
                            <div className="mb-4">
                              <select
                                value={selectedEmployee}
                                onChange={(e) => setSelectedEmployee(e.target.value)}
                                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              >
                                <option value="all">All Employees</option>
                                {post.timesheet_data?.employee_data?.map((employee, index) => (
                                  <option key={index} value={employee.user_name}>
                                    {employee.user_name}
                                  </option>
                                ))}
                              </select>
                            </div>

                            {/* Employee Tables */}
                            <div className="space-y-6">
                              {selectedEmployee === 'all' ? (
                                /* All Employees Summary View */
                                <div className="border border-gray-200 rounded-lg overflow-hidden">
                                  {/* Summary Header */}
                                  <div className="bg-green-50 px-4 py-3 border-b border-gray-200">
                                    <div className="flex items-center justify-between">
                                      <div>
                                        <h4 className="text-lg font-semibold text-gray-900">All Employees Summary</h4>
                                        <p className="text-sm text-gray-600">Daily hours breakdown for all employees</p>
                                      </div>
                                      <div className="text-right">
                                        <div className="text-lg font-bold text-green-600">
                                          {post.timesheet_data?.total_hours?.toFixed(2) || '0.00'} hrs
                                        </div>
                                        <div className="text-sm text-gray-600">
                                          ${post.timesheet_data?.total_cost?.toFixed(2) || '0.00'}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                  
                                  {/* Summary Daily Table */}
                                  <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                      <thead className="bg-gray-50">
                                        <tr>
                                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Employees</th>
                                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Hours</th>
                                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Regular Hours</th>
                                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">After Hours</th>
                                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Daily Cost</th>
                                        </tr>
                                      </thead>
                                      <tbody className="bg-white divide-y divide-gray-200">
                                        {(() => {
                                          // Create summary by date
                                          const dailySummary = {};
                                          
                                          post.timesheet_data?.employee_data?.forEach(employee => {
                                            employee.daily_entries?.forEach(entry => {
                                              const date = entry.date;
                                              if (!dailySummary[date]) {
                                                dailySummary[date] = {
                                                  date: date,
                                                  employeeCount: 0,
                                                  totalHours: 0,
                                                  regularHours: 0,
                                                  afterHours: 0,
                                                  dailyCost: 0
                                                };
                                              }
                                              
                                              dailySummary[date].employeeCount += 1;
                                              dailySummary[date].totalHours += entry.total_hours || 0;
                                              dailySummary[date].regularHours += entry.regular_hours || 0;  
                                              dailySummary[date].afterHours += entry.after_hours || 0;
                                              dailySummary[date].dailyCost += ((entry.regular_hours || 0) * employee.hourly_rate) + ((entry.after_hours || 0) * employee.after_hours_rate);
                                            });
                                          });
                                          
                                          return Object.values(dailySummary).map((daySummary, index) => (
                                            <tr key={index} className="hover:bg-gray-50">
                                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                {new Date(daySummary.date).toLocaleDateString()}
                                              </td>
                                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                                {daySummary.employeeCount}
                                              </td>
                                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                {daySummary.totalHours.toFixed(2)}h
                                              </td>
                                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                                {daySummary.regularHours.toFixed(2)}h
                                              </td>
                                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                                {daySummary.afterHours.toFixed(2)}h
                                              </td>
                                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                                ${daySummary.dailyCost.toFixed(2)}
                                              </td>
                                            </tr>
                                          ));
                                        })()}
                                      </tbody>
                                    </table>
                                  </div>
                                </div>
                              ) : (
                                /* Individual Employee View */
                                post.timesheet_data?.employee_data?.filter(emp => emp.user_name === selectedEmployee).map((employee, empIndex) => (
                                  <div key={empIndex} className="border border-gray-200 rounded-lg overflow-hidden">
                                    {/* Employee Header */}
                                    <div className="bg-blue-50 px-4 py-3 border-b border-gray-200">
                                      <div className="flex items-center justify-between">
                                        <div>
                                          <h4 className="text-lg font-semibold text-gray-900">{employee.user_name}</h4>
                                          <p className="text-sm text-gray-600">{employee.user_role ? employee.user_role.charAt(0).toUpperCase() + employee.user_role.slice(1).toLowerCase() : 'Employee'}</p>
                                        </div>
                                        <div className="text-right">
                                          <div className="text-lg font-bold text-blue-600">{employee.total_hours?.toFixed(2) || '0.00'} hrs</div>
                                          <div className="text-sm text-gray-600">${employee.total_pay?.toFixed(2) || '0.00'}</div>
                                        </div>
                                      </div>
                                    </div>
                                    
                                    {/* Daily Hours Table */}
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
                                          {employee.daily_entries?.map((entry, dayIndex) => (
                                            <tr key={dayIndex} className="hover:bg-gray-50">
                                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                {new Date(entry.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                                              </td>
                                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{entry.regular_hours?.toFixed(2) || '0.00'}</td>
                                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{entry.after_hours?.toFixed(2) || '0.00'}</td>
                                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{entry.total_hours?.toFixed(2) || '0.00'}</td>
                                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${employee.hourly_rate?.toFixed(2) || '0.00'}</td>
                                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${employee.after_hours_rate?.toFixed(2) || '0.00'}</td>
                                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                ${((entry.regular_hours * employee.hourly_rate) + (entry.after_hours * employee.after_hours_rate)).toFixed(2)}
                                              </td>
                                            </tr>
                                          ))}
                                          {/* Employee Total Row */}
                                          <tr className="bg-blue-50 border-t-2 border-blue-200">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-blue-900">Total:</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-blue-900">{employee.regular_hours?.toFixed(2) || '0.00'}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-blue-900">{employee.after_hours_hours?.toFixed(2) || '0.00'}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-blue-900">{employee.total_hours?.toFixed(2) || '0.00'}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">-</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">-</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-blue-900">${employee.total_pay?.toFixed(2) || '0.00'}</td>
                                          </tr>
                                        </tbody>
                                      </table>
                                    </div>
                                  </div>
                                )))}
                            </div>
                          </div>
                        ) : post.agent_type === 'email' ? (
                          // Email Post Rendering - Match review page styling exactly
                          post.image_url ? (
                            // Email with image - use grid layout
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                              {/* Text Content */}
                              <div className="md:col-span-2">
                                {/* Email Subject Line */}
                                {post.email_subject && (
                                  <div className="mb-4 p-3 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                                    <div className="text-sm font-medium text-blue-800 mb-1">Email Subject:</div>
                                    <div className="text-blue-900 font-semibold">{post.email_subject}</div>
                                  </div>
                                )}
                                
                                <h4 className="font-medium mb-2">Content:</h4>
                                <div className="bg-gray-50 rounded-lg p-4">
                                  <p className="text-gray-900 whitespace-pre-wrap">{post.content}</p>
                                  <div className="mt-2 text-xs text-gray-500">
                                    {post.content.split(' ').length} words
                                  </div>
                                </div>
                              </div>

                              {/* Image area */}
                              <div>
                                <div className="relative mb-4">
                                  <img 
                                    src={post.image_url} 
                                    alt="Email content"
                                    className="w-full h-32 object-cover rounded-lg border"
                                  />
                                  {post.image_text && (
                                    <div className="absolute bottom-2 left-2 bg-black bg-opacity-75 text-white px-2 py-1 rounded text-xs">
                                      {post.image_text}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          ) : (
                            // Email without image - use full width like review page
                            <div>
                              {/* Email Subject Line */}
                              {post.email_subject && (
                                <div className="mb-4 p-3 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                                  <div className="text-sm font-medium text-blue-800 mb-1">Email Subject:</div>
                                  <div className="text-blue-900 font-semibold">{post.email_subject}</div>
                                </div>
                              )}
                              
                              <h4 className="font-medium mb-2">Content:</h4>
                              <div className="bg-gray-50 rounded-lg p-4">
                                <p className="text-gray-900 whitespace-pre-wrap">{post.content}</p>
                                <div className="mt-2 text-xs text-gray-500">
                                  {post.content.split(' ').length} words
                                </div>
                              </div>
                            </div>
                          )
                        ) : post.agent_type === 'marketing_agent' && post.marketing_channel === 'email' ? (
                          /* Marketing Agent Email Post */
                          <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                            <div className="flex items-center space-x-2 mb-3">
                              <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                              <span className="text-sm font-medium text-gray-700">Email Preview</span>
                            </div>
                            
                            {/* Email Header (like real email clients) */}
                            <div className="bg-gray-50 rounded-t-lg border border-gray-200 px-4 py-3">
                              <div className="space-y-2 text-sm">
                                <div className="flex">
                                  <span className="text-gray-500 font-medium w-16">From:</span>
                                  <span className="text-gray-900">Pets and Vets Animal Hospital &lt;vet@petsandvetsanimalhospital.com&gt;</span>
                                </div>
                                <div className="flex">
                                  <span className="text-gray-500 font-medium w-16">To:</span>
                                  <span className="text-gray-900">
                                    {post.marketing_email_personalized === false ? 
                                      'All Customers' : 
                                      (post.sample_customer_name && post.sample_customer_email ? 
                                        `${post.sample_customer_name} <${post.sample_customer_email}>` : 
                                        'All Customers'
                                      )
                                    }
                                  </span>
                                </div>
                                <div className="flex items-start">
                                  <span className="text-gray-500 font-medium w-16">Subject:</span>
                                  <div className="flex-1">
                                    <span className="text-gray-900 font-medium">
                                      {post.email_subject || 'No Subject'}
                                    </span>
                                    {post.email_subject && post.email_subject.length > 100 && (
                                      <span className="text-orange-500 text-xs ml-2">
                                        ({post.email_subject.length} chars - may be truncated)
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                            
                            {/* Email Body */}
                            <div className="bg-white rounded-b-lg border-x border-b border-gray-200 p-4">
                              <ContentWithLinks 
                                content={post.content} 
                                className="text-gray-900 leading-relaxed"
                              />
                            </div>
                          </div>
                        ) : post.agent_type === 'marketing_agent' && post.marketing_channel === 'sms' ? (
                          /* Marketing Agent SMS Post */
                          <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                            <div className="flex items-center space-x-2 mb-3">
                              <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                              <span className="text-sm font-medium text-gray-700">SMS Preview</span>
                            </div>
                            <div className="bg-gray-900 rounded-lg p-4 max-w-xs">
                              <div className="bg-blue-500 text-white rounded-2xl rounded-bl-md px-4 py-2 text-sm">
                                <SMSContentWithLinks 
                                  content={post.content} 
                                  className=""
                                />
                              </div>
                              <div className="text-xs text-gray-400 mt-1 text-right">
                                {post.content ? `${post.content.length}/160` : '0/160'}
                              </div>
                            </div>
                            
                            {/* Show personalized preview if available */}
                            <SMSContentPreview post={post} />
                          </div>
                        ) : (post.agent_type === 'email' || post.agent_type === 'email_agent') ? (
                          /* Email Agent Post Rendering - Professional email display */
                          <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                            <div className="flex items-center space-x-2 mb-3">
                              <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                              <span className="text-sm font-medium text-gray-700">Email Preview</span>
                            </div>
                            
                            {/* Email Header (like real email clients) */}
                            <div className="bg-gray-50 rounded-t-lg border border-gray-200 px-4 py-3">
                              <div className="space-y-2 text-sm">
                                <div className="flex">
                                  <span className="text-gray-500 font-medium w-16">From:</span>
                                  <span className="text-gray-900">Pets and Vets Animal Hospital &lt;vet@petsandvetsanimalhospital.com&gt;</span>
                                </div>
                                <div className="flex">
                                  <span className="text-gray-500 font-medium w-16">To:</span>
                                  <span className="text-gray-900">
                                    {post.sms_personalized === false || post.email_personalized === false ? 
                                      'All Customers' : 
                                      (post.sample_customer_name && post.sample_customer_email ? 
                                        `${post.sample_customer_name} <${post.sample_customer_email}>` : 
                                        'All Customers'
                                      )
                                    }
                                  </span>
                                </div>
                                <div className="flex items-start">
                                  <span className="text-gray-500 font-medium w-16">Subject:</span>
                                  <div className="flex-1">
                                    <span className="text-gray-900 font-medium">
                                      {post.email_subject || 'No Subject'}
                                    </span>
                                    {post.email_subject && post.email_subject.length > 100 && (
                                      <span className="text-orange-500 text-xs ml-2">
                                        ({post.email_subject.length} chars - may be truncated)
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                            
                            {/* Email Body */}
                            <div className="bg-white rounded-b-lg border-x border-b border-gray-200 p-4">
                              <ContentWithLinks 
                                content={post.content} 
                                className="text-gray-900 leading-relaxed"
                              />
                            </div>
                          </div>
                        ) : post.agent_type === 'sms_agent' ? (
                          // SMS Post Rendering with improved display
                          <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                            <div className="flex items-center space-x-2 mb-3">
                              <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                              <span className="text-sm font-medium text-gray-700">SMS Preview</span>
                            </div>
                            <div className="bg-gray-900 rounded-lg p-4 max-w-xs">
                              <div className="bg-blue-500 text-white rounded-2xl rounded-bl-md px-4 py-2 text-sm">
                                <SMSContentWithLinks 
                                  content={post.content} 
                                  className=""
                                />
                              </div>
                              <div className="text-xs text-gray-400 mt-1 text-right">
                                {post.content ? `${post.content.length}/160` : '0/160'}
                              </div>
                            </div>
                            
                            {/* Show personalized preview if available */}
                            <SMSContentPreview post={post} />
                          </div>
                        ) : (
                          // Regular Social Media Post Rendering  
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Text Content */}
                            <div className="md:col-span-2">
                              <h4 className="font-medium mb-2">Content:</h4>
                              <div className="bg-gray-50 rounded-lg p-4">
                                <p className="text-gray-900 whitespace-pre-wrap line-clamp-4">{post.content}</p>
                                <div className="mt-2 text-xs text-gray-500">
                                  {post.content.split(' ').length} words
                                </div>
                              </div>
                              {post.hashtags && (
                                <div className="mt-3">
                                  <h5 className="text-sm font-medium mb-1">Hashtags:</h5>
                                  <div className="flex flex-wrap gap-1">
                                    {post.hashtags.slice(0, 5).map((tag, index) => (
                                      <span key={index} className="inline-block bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded">
                                        #{tag}
                                      </span>
                                    ))}
                                    {post.hashtags.length > 5 && (
                                      <span className="text-xs text-gray-500">+{post.hashtags.length - 5} more</span>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* Image & Stats */}
                            <div>
                              {post.image_url ? (
                                <div className="relative mb-4">
                                  <img 
                                    src={post.image_url} 
                                    alt="Published content"
                                    className="w-full h-32 object-cover rounded-lg border"
                                  />
                                  {post.image_text && (
                                    <div className="absolute bottom-2 left-2 bg-black bg-opacity-75 text-white px-2 py-1 rounded text-xs">
                                      {post.image_text}
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <div className="w-full h-32 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center mb-4">
                                  <ImageIcon className="h-6 w-6 text-gray-400" />
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Action Buttons - Always show border */}
                        <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
                          <div className="flex items-center space-x-3">
                            {post.social_media_links && post.social_media_links.map((link, index) => (
                              <a
                                key={index}
                                href={link.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                              >
                                <ExternalLink className="h-4 w-4 mr-2" />
                                View on {link.platform}
                              </a>
                            ))}
                          </div>
                          
                          {/* Delete Button for All Posts */}
                          <button
                            onClick={() => openDeleteModal(post)}
                            disabled={deletingPost === post.id}
                            className="flex items-center px-4 py-2 text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Pagination */}
            {posts.length > 0 && pagination.total_pages > 1 && (
              <div className="mt-8 flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  Page {currentPage} of {pagination.total_pages}
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handlePrevPage}
                    disabled={!pagination.has_prev}
                    className="flex items-center px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Previous
                  </button>
                  
                  <div className="flex items-center space-x-1">
                    {Array.from({ length: Math.min(5, pagination.total_pages) }, (_, i) => {
                      const page = i + 1;
                      return (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          className={`px-3 py-2 text-sm rounded-lg transition-colors ${
                            currentPage === page
                              ? 'bg-blue-600 text-white'
                              : 'text-gray-600 hover:bg-gray-100'
                          }`}
                        >
                          {page}
                        </button>
                      );
                    })}
                    {pagination.total_pages > 5 && (
                      <>
                        <span className="px-2 text-gray-500">...</span>
                        <button
                          onClick={() => handlePageChange(pagination.total_pages)}
                          className={`px-3 py-2 text-sm rounded-lg transition-colors ${
                            currentPage === pagination.total_pages
                              ? 'bg-blue-600 text-white'
                              : 'text-gray-600 hover:bg-gray-100'
                          }`}
                        >
                          {pagination.total_pages}
                        </button>
                      </>
                    )}
                  </div>
                  
                  <button
                    onClick={handleNextPage}
                    disabled={!pagination.has_next}
                    className="flex items-center px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Next
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Delete Confirmation Modal */}
      {showDeleteModal && postToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-2xl max-w-md w-full">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                    <Trash2 className="h-5 w-5 text-red-600" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Delete Published Post
                    </h3>
                    <p className="text-sm text-gray-600">
                      This action cannot be undone
                    </p>
                  </div>
                </div>
                <button
                  onClick={closeDeleteModal}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="px-6 py-4">
              <div className="flex items-center mb-4">
                <div className="flex-shrink-0 w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <Trash2 className="h-6 w-6 text-red-600" />
                </div>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Are you sure you want to delete this post?
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                You are about to permanently delete this published post. This will remove it from your records but won't affect posts already published on social media platforms.
              </p>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                <div className="flex">
                  <AlertCircle className="h-5 w-5 text-yellow-600 mr-2 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-yellow-700">
                    <p className="font-medium">Note:</p>
                    <p className="mt-1">This only removes the post from your dashboard. The actual social media posts will remain live on the platforms.</p>
                  </div>
                </div>
              </div>
              
              {/* Post Preview */}
              <div className="bg-gray-50 rounded-lg p-3 mb-4">
                <p className="text-sm text-gray-600 line-clamp-3">
                  {postToDelete.content}
                </p>
                <div className="flex items-center mt-2 space-x-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span className="text-xs text-gray-500">
                    Published: {formatDate(postToDelete.published_at)}
                  </span>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={closeDeleteModal}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeletePost}
                disabled={deletingPost === postToDelete.id}
                className="px-4 py-2 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center"
                style={{ 
                  backgroundColor: deletingPost === postToDelete.id ? '#94a3b8' : '#dc2626'
                }}
                onMouseEnter={(e) => {
                  if (!deletingPost) e.target.style.backgroundColor = '#b91c1c';
                }}
                onMouseLeave={(e) => {
                  if (!deletingPost) e.target.style.backgroundColor = '#dc2626';
                }}
              >
                {deletingPost === postToDelete.id ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Post
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIPublishedPosts;