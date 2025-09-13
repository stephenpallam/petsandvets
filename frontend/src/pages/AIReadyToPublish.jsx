import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  Eye, 
  CheckCircle, 
  XCircle, 
  Edit3, 
  Share2, 
  Calendar, 
  Clock, 
  AlertCircle,
  RefreshCw,
  MessageSquare,
  Image as ImageIcon,
  ThumbsUp,
  ChevronLeft,
  ChevronRight,
  Save,
  X,
  Trash2,
  Users,
  Send,
  Loader,
  Hash
} from 'lucide-react';
import { formatDate, formatScheduledDate } from '../utils/dateUtils';

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

// SMS Content Preview Component for Ready to Publish
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


const AIReadyToPublish = () => {
  const { user, token, isAdmin, canAccessManager, loading: authLoading } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshLoading, setRefreshLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [pageReady, setPageReady] = useState(false);
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [pageLoading, setPageLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState(null);
  const [approving, setApproving] = useState(null);
  const [processingPost, setProcessingPost] = useState(null);
  const [filterAgentType, setFilterAgentType] = useState('all');
  const [agentTypes, setAgentTypes] = useState([]);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [editForm, setEditForm] = useState({
    content: '',
    image_text: '',
    topic: ''
  });
  const [regeneratingImage, setRegeneratingImage] = useState(false);
  const [regeneratingContent, setRegeneratingContent] = useState(false);
  const [showLoadingModal, setShowLoadingModal] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState('all');
  const [employeeFilters, setEmployeeFilters] = useState({});
  const [showAdjustHoursModal, setShowAdjustHoursModal] = useState(false);
  const [savedScrollPosition, setSavedScrollPosition] = useState(0);
  const [showDeleteModal, setShowDeleteModal] = useState(false);  
  const [deletingPost, setDeletingPost] = useState(null);
  const [postToDelete, setPostToDelete] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    total_pages: 0,
    total_count: 0,
    has_next: false,
    has_prev: false
  });

  const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || import.meta.env.REACT_APP_BACKEND_URL || window.location.origin;

  // Parse employee data from timesheet content
  const parseEmployeeData = (content) => {
    const lines = content.split('\n');
    const employeeData = [];
    
    lines.forEach(line => {
      // Look for employee data patterns with name, email, role, and hours
      const match = line.match(/(\w+\s+\w+).*?(\w+@[\w\.]+).*?(\w+).*?(\d+\.?\d*)\s*hours/i);
      if (match) {
        const [, name, email, role, hours] = match;
        employeeData.push({
          name: name.trim(),
          email: email.trim(),
          role: role.charAt(0).toUpperCase() + role.slice(1).toLowerCase(), // Capitalize first letter
          totalHours: parseFloat(hours) || 0,
          regularHours: parseFloat(hours) * 0.8 || 0, // Approximation
          afterHours: parseFloat(hours) * 0.2 || 0   // Approximation
        });
      }
    });
    
    return employeeData;
  };

  // Delete timesheet post
  const deleteTimesheetPost = async (postId) => {
    const post = posts.find(p => p.id === postId);
    setPostToDelete(post);
    setShowDeleteModal(true);
  };

  // Format pay period date range
  const formatPayPeriodRange = (topic) => {
    if (!topic) return 'Pay Period';
    
    // Look for date patterns like "2025-09-01 to 2025-09-07"
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
      
      return `${startFormatted} to ${endFormatted}, ${year}`;
    }
    
    return topic;
  };

  // Auth check
  useEffect(() => {
    if (!authLoading && (!user || !canAccessManager())) {
      window.location.href = '/login';
    } else if (!authLoading && user && token) {
      console.log('Starting to load data with token:', token ? 'present' : 'missing');
      setPageLoading(false);
      // Run all loading operations in parallel
      Promise.all([
        fetchPosts(1, true), // isInitialLoad = true
        fetchAgentTypes()
      ]).then(() => {
        console.log('Data loading completed successfully');
        // Mark data as loaded
        setDataLoaded(true);
      }).catch((error) => {
        console.error('Error loading page:', error);
        // Even on error, mark as loaded to prevent infinite loading
        setDataLoaded(true);
      });
    }
  }, [user, authLoading, canAccessManager, token]);

  // Track when posts are actually loaded and available
  useEffect(() => {
    if (dataLoaded && posts !== undefined) {
      // Data is loaded, posts state is ready (even if empty array)
      setImagesLoaded(true); // Will be overridden by image loading logic if there are images
    }
  }, [dataLoaded, posts]);

  // Only set page ready when both data and any images are loaded
  useEffect(() => {
    if (dataLoaded && imagesLoaded && !pageLoading) {
      const timer = setTimeout(() => {
        setPageReady(true);
      }, 100); // Very small delay just to ensure smooth rendering
      
      return () => clearTimeout(timer);
    }
  }, [dataLoaded, imagesLoaded, pageLoading]);

  // Refetch posts when filter changes (but only if page is ready)
  useEffect(() => {
    if (!pageLoading && pageReady) {
      // Reset loading states when filter changes
      setDataLoaded(false);
      setImagesLoaded(false);
      setPageReady(false);
      
      setCurrentPage(1);
      fetchPosts(1).then(() => {
        setDataLoaded(true);
      });
    }
  }, [filterAgentType]);

  // Track image loading
  useEffect(() => {
    if (dataLoaded && posts !== undefined) {
      // Only start image loading detection after data is loaded
      const images = document.querySelectorAll('img[src*="api/files"], img[src*="data:image"]');
      if (images.length === 0) {
        // No images to load, we're ready
        setImagesLoaded(true);
        return;
      }

      let loadedCount = 0;
      const totalImages = images.length;

      const handleImageLoad = () => {
        loadedCount++;
        if (loadedCount === totalImages) {
          setImagesLoaded(true);
        }
      };

      const handleImageError = () => {
        loadedCount++;
        if (loadedCount === totalImages) {
          setImagesLoaded(true);
        }
      };

      images.forEach(img => {
        if (img.complete) {
          handleImageLoad();
        } else {
          img.addEventListener('load', handleImageLoad);
          img.addEventListener('error', handleImageError);
        }
      });

      // Cleanup
      return () => {
        images.forEach(img => {
          img.removeEventListener('load', handleImageLoad);
          img.removeEventListener('error', handleImageError);
        });
      };
    }
  }, [dataLoaded, posts]);

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
        return Promise.resolve();
      } else {
        return Promise.reject('Failed to fetch agent types');
      }
    } catch (error) {
      console.error('Error fetching agent types:', error);
      return Promise.reject(error);
    }
  };

  const handlePageChange = (page) => {
    // Show loading while changing pages
    setDataLoaded(false);
    setImagesLoaded(false);
    setPageReady(false);
    
    setCurrentPage(page);
    fetchPosts(page).then(() => {
      setDataLoaded(true);
    });
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

  const openEditModal = (post) => {
    setEditingPost(post);
    setEditForm({
      content: post.content || '',
      image_text: post.image_text || '',
      topic: post.topic || ''
    });
    setShowEditModal(true);
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setEditingPost(null);
    setEditForm({ content: '', image_text: '', topic: '' });
  };

  const handleEditFormChange = (field, value) => {
    setEditForm(prev => ({ ...prev, [field]: value }));
  };

  const saveEditedPost = async () => {
    if (!editingPost) return;

    // Save scroll position if modal is open
    const currentScrollPosition = window.scrollY;

    setSaveLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/ai-posts/${editingPost.id}/edit`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editForm)
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Post updated successfully!' });
        closeEditModal();
        await fetchPosts();
        
        // Restore scroll position after modal closes and data refreshes
        setTimeout(() => {
          window.scrollTo({ top: currentScrollPosition, behavior: 'smooth' });
        }, 300);
      } else {
        const errorData = await response.json();
        setMessage({ type: 'error', text: errorData.detail || 'Failed to update post' });
      }
    } catch (error) {
      console.error('Error updating post:', error);
      setMessage({ type: 'error', text: 'Network error. Please try again.' });
    } finally {
      setSaveLoading(false);
    }
  };

  const regenerateImage = async (postId) => {
    // Save current scroll position
    setSavedScrollPosition(window.scrollY);
    
    setShowLoadingModal(true);
    setLoadingMessage('Regenerating image using AI...');
    try {
      const response = await fetch(`${API_BASE_URL}/api/ai-posts/${postId}/regenerate-image`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: editForm.content,
          image_text: editForm.image_text
        })
      });

      if (response.ok) {
        const result = await response.json();
        setMessage({ type: 'success', text: 'Image regenerated successfully!' });
        
        // Refresh posts to get the new image
        await fetchPosts();
        
        // Wait for images to load, then restore scroll position
        setTimeout(() => {
          // Check if images are loaded
          const checkImagesLoaded = () => {
            const images = document.querySelectorAll('img[src*="api/files"], img[src*="data:image"]');
            let allLoaded = true;
            
            images.forEach(img => {
              if (!img.complete || img.naturalHeight === 0) {
                allLoaded = false;
              }
            });
            
            if (allLoaded) {
              window.scrollTo({ top: savedScrollPosition, behavior: 'smooth' });
              setShowLoadingModal(false);
              setLoadingMessage('');
            } else {
              // Check again in 200ms
              setTimeout(checkImagesLoaded, 200);
            }
          };
          
          checkImagesLoaded();
        }, 300);
        
      } else {
        const errorData = await response.json();
        setMessage({ type: 'error', text: errorData.detail || 'Failed to regenerate image' });
        setShowLoadingModal(false);
        setLoadingMessage('');
      }
    } catch (error) {
      console.error('Error regenerating image:', error);
      setMessage({ type: 'error', text: 'Network error. Please try again.' });
      setShowLoadingModal(false);
      setLoadingMessage('');
    }
  };

  const regenerateContent = async (postId) => {
    // Save current scroll position
    setSavedScrollPosition(window.scrollY);
    
    setShowLoadingModal(true);
    setLoadingMessage('Regenerating content using AI...');
    try {
      // Find the post to get its current content
      const post = posts.find(p => p.id === postId);
      if (!post) {
        setMessage({ type: 'error', text: 'Post not found' });
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/ai-posts/${postId}/regenerate-content`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          current_content: post.content,
          topic: post.topic || 'social media post'
        })
      });

      if (response.ok) {
        const result = await response.json();
        // Update the post content in the local state
        setPosts(prevPosts => 
          prevPosts.map(p => 
            p.id === postId 
              ? { ...p, content: result.new_content, updated_at: new Date().toISOString(), reviewed_at: null }
              : p
          )
        );
        setMessage({ type: 'success', text: 'Content regenerated successfully! You can now edit further or approve.' });
        
        // Wait a bit for the UI to update, then restore scroll position
        setTimeout(() => {
          window.scrollTo({ top: savedScrollPosition, behavior: 'smooth' });
          setShowLoadingModal(false);
          setLoadingMessage('');
        }, 500);
      } else {
        const errorData = await response.json();
        setMessage({ type: 'error', text: errorData.detail || 'Failed to regenerate content' });
        setShowLoadingModal(false);
        setLoadingMessage('');
      }
    } catch (error) {
      console.error('Error regenerating content:', error);
      setMessage({ type: 'error', text: 'Network error. Please try again.' });
      setShowLoadingModal(false);
      setLoadingMessage('');
    }
  };

  const regenerateContentInModal = async (postId) => {
    setShowLoadingModal(true);
    setLoadingMessage('Regenerating content using AI...');
    try {
      const response = await fetch(`${API_BASE_URL}/api/ai-posts/${postId}/regenerate-content`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          current_content: editForm.content,
          topic: editForm.topic || 'social media post'
        })
      });

      if (response.ok) {
        const result = await response.json();
        // Update the edit form with the new content
        handleEditFormChange('content', result.new_content);
        setMessage({ type: 'success', text: 'Content regenerated successfully!' });
        
        // Wait a bit for the UI to update
        setTimeout(() => {
          setShowLoadingModal(false);
          setLoadingMessage('');
        }, 500);
      } else {
        const errorData = await response.json();
        setMessage({ type: 'error', text: errorData.detail || 'Failed to regenerate content' });
        setShowLoadingModal(false);
        setLoadingMessage('');
      }
    } catch (error) {
      console.error('Error regenerating content:', error);
      setMessage({ type: 'error', text: 'Network error. Please try again.' });
      setShowLoadingModal(false);
      setLoadingMessage('');
    }
  };

  const backToReview = async (postId) => {
    setProcessingPost(postId);
    try {
      const response = await fetch(`${API_BASE_URL}/api/ai-posts/${postId}/back-to-review`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Post moved back to In Review successfully!' });
        fetchPosts(); // Refresh the list
      } else {
        const errorData = await response.json();
        setMessage({ type: 'error', text: errorData.detail || 'Failed to move post back to review' });
      }
    } catch (error) {
      console.error('Error moving post back to review:', error);
      setMessage({ type: 'error', text: 'Network error. Please try again.' });
    } finally {
      setProcessingPost(null);
    }
  };

  const fetchPosts = async (page = currentPage, isInitialLoad = false) => {
    if (!isInitialLoad) setRefreshLoading(true);
    
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10'
      });
      
      if (filterAgentType !== 'all') {
        params.append('agent_type', filterAgentType);
      }
      
      const url = `${API_BASE_URL}/api/ai-posts/ready-to-publish?${params.toString()}`;
        
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
        return Promise.resolve();
      } else {
        setMessage({ type: 'error', text: 'Failed to fetch posts' });
        return Promise.reject('Failed to fetch posts');
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
      setMessage({ type: 'error', text: 'Network error. Please try again.' });
      return Promise.reject(error);
    } finally {
      if (!isInitialLoad) setRefreshLoading(false);
    }
  };

  const openDeleteModal = (post) => {
    setPostToDelete(post);
    setShowDeleteModal(true);  
  };

  const closeDeleteModal = () => {
    setPostToDelete(null);
    setShowDeleteModal(false);
  };

  const confirmDeletePost = async () => {
    if (!postToDelete) return;
    
    setDeletingPost(postToDelete.id);
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
      closeDeleteModal();
    }
  };

  const approvePost = async (postId) => {
    setApproving(postId);
    try {
      const response = await fetch(`${API_BASE_URL}/api/ai-posts/${postId}/approve`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Post approved and published successfully!' });
        fetchPosts(); // Refresh the list
      } else {
        const errorData = await response.json();
        setMessage({ type: 'error', text: errorData.detail || 'Failed to approve post' });
      }
    } catch (error) {
      console.error('Error approving post:', error);
      setMessage({ type: 'error', text: 'Network error. Please try again.' });
    } finally {
      setApproving(null);
    }
  };

  // Handle adjust hours button click
  const handleAdjustHours = (post) => {
    setShowAdjustHoursModal(true);
  };

  const handlePublishPost = async (postId) => {
    try {
      setApproving(postId);
      setMessage({ type: '', text: '' });

      const response = await fetch(`${API_BASE_URL}/api/ai-posts/${postId}/approve`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        // Remove the published post from the current list
        setPosts(prevPosts => prevPosts.filter(p => p.id !== postId));
        setMessage({ type: 'success', text: 'Timesheet report published successfully!' });
        
        // Clear success message after 3 seconds
        setTimeout(() => {
          setMessage({ type: '', text: '' });
        }, 3000);
      } else {
        const errorData = await response.json();
        setMessage({ type: 'error', text: errorData.detail || 'Failed to publish post' });
      }
    } catch (error) {
      console.error('Error publishing post:', error);
      setMessage({ type: 'error', text: 'Network error. Please try again.' });
    } finally {
      setApproving(null);
    }
  };

  const getPlatformIcon = (platform) => {
    const icons = {
      facebook: '📘',
      instagram: '📷',
      twitter: '❌',
      whatsapp: '💬'
    };
    return icons[platform] || '📱';
  };

  if (authLoading || !user || !token || !dataLoaded) {
    return (
      <>
        {/* Show the page content with disabled interactions */}
        <div className={`min-h-screen bg-gray-50 ${!pageReady ? 'pointer-events-none opacity-60' : ''}`}>
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              {/* Header */}
              <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Eye className="h-8 w-8 text-green-600" />
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900">
                        Ready to Publish
                      </h2>
                      <p className="text-sm text-gray-600">
                        Review and approve AI-generated posts before publishing
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="text-white px-4 py-2 pr-8 rounded-lg bg-gray-300">
                      Loading filters...
                    </div>
                    <div className="text-white px-4 py-2 rounded-lg bg-gray-300">
                      <RefreshCw className="h-4 w-4 animate-spin mr-2 inline" />
                      Loading...
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Loading content area */}
              <div className="p-6">
                <div className="text-center py-12">
                  <RefreshCw className="h-12 w-12 mx-auto text-blue-600 animate-spin mb-4" />
                  <p className="text-gray-600 text-lg mb-2">Loading your posts...</p>
                  <p className="text-gray-500 text-sm">Please wait while we fetch your AI-generated content</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Compact Loading Modal Popup */}
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-2xl p-6 max-w-sm w-full mx-4">
            <div className="text-center">
              <div className="mb-3">
                <RefreshCw className="h-12 w-12 mx-auto text-blue-600 animate-spin" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">Loading</h3>
              <p className="text-gray-600 text-sm mb-2">Preparing your content...</p>
              <div className="text-xs text-gray-500">
                Please wait
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Header */}
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Eye className="h-8 w-8 text-green-600" />
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    Ready to Publish
                  </h2>
                  <p className="text-sm text-gray-600">
                    Review and approve AI-generated posts before publishing
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <select
                  value={filterAgentType}
                  onChange={(e) => setFilterAgentType(e.target.value)}
                  disabled={!pageReady}
                  className="text-white px-4 py-2 pr-8 rounded-lg transition-colors flex items-center font-medium appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ 
                    backgroundColor: !pageReady ? '#94a3b8' : '#29add3',
                    backgroundImage: 'url("data:image/svg+xml,%3csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 20 20\'%3e%3cpath stroke=\'%23ffffff\' stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'1.5\' d=\'M6 8l4 4 4-4\'/%3e%3c/svg%3e")',
                    backgroundPosition: 'right 8px center',
                    backgroundRepeat: 'no-repeat',
                    backgroundSize: '16px'
                  }}
                  onMouseEnter={(e) => {
                    if (pageReady) e.target.style.backgroundColor = '#2196c7';
                  }}
                  onMouseLeave={(e) => {
                    if (pageReady) e.target.style.backgroundColor = '#29add3';
                  }}
                >
                  <option value="all">All Agent Types</option>
                  {agentTypes.map((type) => (
                    <option key={type.value} value={type.value} style={{ color: 'black' }}>
                      {type.label}
                    </option>
                  ))}
                </select>
                
                <button
                  onClick={() => {
                    // Reset loading states for refresh
                    setDataLoaded(false);
                    setImagesLoaded(false);
                    setPageReady(false);
                    
                    fetchPosts().then(() => {
                      setDataLoaded(true);
                    });
                  }}
                  disabled={refreshLoading || !pageReady}
                  className="text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center font-medium"
                  style={{ 
                    backgroundColor: (refreshLoading || !pageReady) ? '#94a3b8' : '#29add3'
                  }}
                  onMouseEnter={(e) => {
                    if (!refreshLoading && pageReady) e.target.style.backgroundColor = '#2196c7';
                  }}
                  onMouseLeave={(e) => {
                    if (!refreshLoading && pageReady) e.target.style.backgroundColor = '#29add3';
                  }}
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${refreshLoading ? 'animate-spin' : ''}`} />
                  Refresh
                </button>
              </div>
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


            {/* Posts List */}
            {refreshLoading ? (
              <div className="text-center py-12">
                <RefreshCw className="h-8 w-8 animate-spin mx-auto text-gray-400 mb-4" />
                <p className="text-gray-500">Loading posts...</p>
              </div>
            ) : posts.length === 0 ? (
              <div className="text-center py-12">
                <MessageSquare className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-500 text-lg">No posts ready for review</p>
                <p className="text-gray-400 text-sm mt-2">Posts will appear here when AI agents generate content</p>
              </div>
            ) : (
              <div className="space-y-6">
                {posts.map((post) => (
                  <div key={post.id} className="border border-gray-200 rounded-lg overflow-hidden">
                    {post.agent_type === 'time_sheet' ? (
                      // Pay Period Rendering
                      <div className="p-6">
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
                                Created: {formatDate(post.created_at)}
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
                                {formatPayPeriodRange(post.topic)}
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

                        {/* Employee Dropdown and Actions */}
                        <div className="flex items-center justify-between mb-4">
                          <div>
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
                          
                          {/* Actions moved to this level */}
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => window.location.href = `/timesheet-hours-adjustment/${post.id}?from=ready-to-publish`}
                              className="inline-flex items-center px-4 py-2 border border-orange-300 text-sm font-medium rounded-md text-orange-700 bg-orange-50 hover:bg-orange-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                            >
                              <Edit3 className="h-4 w-4 mr-2" />
                              Adjust Hours
                            </button>
                            <button
                              onClick={() => deleteTimesheetPost(post.id)}
                              className="inline-flex items-center px-4 py-2 border border-red-300 text-sm font-medium rounded-md text-red-700 bg-red-50 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </button>
                            <button
                              onClick={() => handlePublishPost(post.id)}
                              disabled={approving === post.id}
                              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                            >
                              {approving === post.id ? (
                                <Loader className="h-4 w-4 mr-2 animate-spin" />
                              ) : (
                                <Send className="h-4 w-4 mr-2" />
                              )}
                              Publish
                            </button>
                          </div>
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
                    ) : (
                      // Regular Social Media Post Rendering
                      <div className="p-6">
                        {/* Post Header */}
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <span className="inline-flex items-center px-3 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                {post.agent_name || 'AI Agent'}
                              </span>
                              {post.status === 'scheduled' && (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-700">
                                  <Clock className="h-3 w-3 mr-1" />
                                  Scheduled
                                </span>
                              )}
                              {post.agent_type && (
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium ${
                                  post.agent_type === 'social_media' ? 'bg-teal-100 text-teal-700' :
                                  post.agent_type === 'email' ? 'bg-purple-100 text-purple-700' :
                                  post.agent_type === 'email_agent' ? 'bg-purple-100 text-purple-700' :
                                  post.agent_type === 'sms_agent' ? 'bg-orange-100 text-orange-700' :
                                  post.agent_type === 'marketing_agent' ? 'bg-pink-100 text-pink-700' :
                                  post.agent_type === 'time_sheet' ? 'bg-green-100 text-green-700' :
                                  'bg-gray-100 text-gray-700'
                                }`}>
                                  {post.agent_type === 'social_media' ? 'Social Media' :
                                   post.agent_type === 'email' ? 'Email' :
                                   post.agent_type === 'email_agent' ? 'Email' :
                                   post.agent_type === 'sms_agent' ? 'SMS' :
                                   post.agent_type === 'marketing_agent' ? 'Marketing' :
                                   post.agent_type === 'time_sheet' ? 'Time Sheet' :
                                   post.agent_type}
                                </span>
                              )}
                              <span className="text-gray-500 text-sm">•</span>
                              <span className="text-gray-500 text-sm">{post.topic}</span>
                            </div>
                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                              <div className="flex items-center">
                                <Calendar className="h-4 w-4 mr-1" />
                                {post.agent_type === 'time_sheet' ? (
                                  post.reviewed_at && post.workflow_origin === 'in_review' ? 
                                    `Reviewed: ${formatDate(post.reviewed_at)}` :
                                    post.updated_at && post.updated_at !== post.created_at ? 
                                    `Updated: ${formatDate(post.updated_at)}` : 
                                    `Created: ${formatDate(post.created_at)}`
                                ) : (
                                  post.reviewed_at && post.workflow_origin === 'in_review' ? 
                                    `Reviewed: ${formatDate(post.reviewed_at)}` :
                                    post.updated_at && post.updated_at !== post.created_at ? 
                                    `Updated: ${formatDate(post.updated_at)}` : 
                                    `Created: ${formatDate(post.created_at)}`
                                )}
                              </div>
                              {post.scheduled_for && (
                                <div className="flex items-center">
                                  <Clock className="h-4 w-4 mr-1" />
                                  Scheduled: {formatScheduledDate(post.scheduled_for)}
                                </div>
                              )}
                            </div>
                          </div>
                          
                          {/* Actions */}
                          <div className="flex items-center space-x-2">
                            {post.platforms && post.platforms.map((platform) => (
                              <span 
                                key={platform} 
                                className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-700"
                              >
                                {getPlatformIcon(platform)} {platform === 'twitter' ? 'X' : platform.charAt(0).toUpperCase() + platform.slice(1)}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Post Content */}
                        <div className="bg-gray-50 rounded-lg p-4 mb-4">
                          <div className="space-y-3">
                            {post.agent_type === 'time_sheet' ? (
                              /* Pay Period Summary */
                              <div>
                                <h4 className="text-sm font-medium text-gray-900 mb-2">Pay Period:</h4>
                                
                                {/* Employee Dropdown Filter */}
                                <div className="mb-4">
                                  <select
                                    value={selectedEmployee}
                                    onChange={(e) => setSelectedEmployee(e.target.value)}
                                    className="w-full sm:w-auto px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                  >
                                    <option value="all">All Employees</option>
                                    {(() => {
                                      const employeeData = parseEmployeeData(post.content || '');
                                      return employeeData.map((employee, index) => (
                                        <option key={index} value={employee.name}>
                                          {employee.name}
                                        </option>
                                      ));
                                    })()}
                                  </select>
                                </div>

                                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                                  <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                      <thead className="bg-gray-50">
                                        <tr>
                                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Employee
                                          </th>
                                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Role
                                          </th>
                                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Total Hours
                                          </th>
                                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Regular Hours
                                          </th>
                                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            After Hours
                                          </th>
                                        </tr>
                                      </thead>
                                      <tbody className="bg-white divide-y divide-gray-200">
                                        {(() => {
                                          try {
                                            const employeeData = parseEmployeeData(post.content || '');

                                            // Filter based on selected employee
                                            const filteredData = selectedEmployee === 'all' 
                                              ? employeeData 
                                              : employeeData.filter(emp => emp.name === selectedEmployee);

                                            // If no data found, show placeholder
                                            if (filteredData.length === 0) {
                                              return (
                                                <tr>
                                                  <td colSpan="5" className="px-4 py-3 text-center text-sm text-gray-500">
                                                    No employee data available
                                                  </td>
                                                </tr>
                                              );
                                            }

                                            return filteredData.map((employee, index) => (
                                              <tr key={index}>
                                                <td className="px-4 py-2 text-sm font-medium text-gray-900">
                                                  {employee.name}
                                                </td>
                                                <td className="px-4 py-2 text-sm text-gray-700">
                                                  {employee.role}
                                                </td>
                                                <td className="px-4 py-2 text-sm text-gray-700">
                                                  {employee.totalHours.toFixed(1)}h
                                                </td>
                                                <td className="px-4 py-2 text-sm text-gray-700">
                                                  {employee.regularHours.toFixed(1)}h
                                                </td>
                                                <td className="px-4 py-2 text-sm text-gray-700">
                                                  {employee.afterHours.toFixed(1)}h
                                                </td>
                                              </tr>
                                            ));
                                          } catch (error) {
                                            console.error('Error parsing employee data:', error);
                                            return (
                                              <tr>
                                                <td colSpan="5" className="px-4 py-3 text-center text-sm text-red-500">
                                                  Error loading employee data
                                                </td>
                                              </tr>
                                            );
                                          }
                                        })()}
                                      </tbody>
                                    </table>
                                  </div>
                                </div>
                              </div>
                            ) : post.agent_type === 'email' ? (
                              /* Email Post Content - Match review page styling exactly */
                              <div>
                                {/* Email Subject Line */}
                                {post.email_subject && (
                                  <div className="mb-4 p-3 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                                    <div className="text-sm font-medium text-blue-800 mb-1">Email Subject:</div>
                                    <div className="text-blue-900 font-semibold">{post.email_subject}</div>
                                  </div>
                                )}
                                
                                <h4 className="text-sm font-medium text-gray-900 mb-2">Content:</h4>
                                <p className="text-gray-900 whitespace-pre-wrap leading-relaxed">
                                  {post.content}
                                </p>
                                <div className="mt-2 text-xs text-gray-500">
                                  {post.content.split(' ').length} words
                                </div>
                              </div>
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
                                          (post.sample_customer_name ? 
                                            `${post.sample_customer_name} <${post.sample_customer_name.toLowerCase().replace(/\s+/g, '.')}@email.com>` : 
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
                            ) : post.agent_type === 'sms_agent' ? (
                              /* SMS Post Content with Customer Preview */
                              <div>
                                <SMSContentPreview post={post} />
                              </div>
                            ) : (
                              /* Regular Social Media Post Content - Match review page styling */
                              <div>
                                <h4 className="text-sm font-medium text-gray-900 mb-2">Content:</h4>
                                <p className="text-gray-900 whitespace-pre-wrap leading-relaxed">
                                  {post.content}
                                </p>
                              </div>
                            )}
                            
                            {/* Only show images for posts that have them - email posts without images won't show image placeholder */}
                            {post.agent_type !== 'time_sheet' && post.image_url && (
                              <div>
                                <h4 className="text-sm font-medium text-gray-900 mb-2">Image:</h4>
                                <img 
                                  src={post.image_url} 
                                  alt="Post image" 
                                  className="max-w-full h-auto rounded-lg border border-gray-200"
                                  style={{ maxHeight: '300px' }}
                                />
                                {post.image_text && (
                                  <p className="text-xs text-gray-600 mt-2 italic">
                                    Alt text: {post.image_text}
                                  </p>
                                )}
                              </div>
                            )}
                            
                            {/* Only show hashtags for social media posts (not email posts) */}
                            {post.agent_type !== 'time_sheet' && post.agent_type !== 'email' && post.hashtags && post.hashtags.length > 0 && (
                              <div>
                                <h4 className="text-sm font-medium text-gray-900 mb-2">Hashtags:</h4>
                                <div className="flex flex-wrap gap-1">
                                  {post.hashtags.map((hashtag, index) => (
                                    <span key={index} className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-700">
                                      <Hash className="h-3 w-3 mr-1" />
                                      {hashtag}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                          <div className="flex items-center space-x-3">
                            {post.agent_type === 'time_sheet' ? (
                              /* Pay Period Actions */
                              <>
                                <button
                                  onClick={() => window.location.href = `/timesheet-report/${post.id}`}
                                  className="inline-flex items-center px-4 py-2 border border-blue-300 text-sm font-medium rounded-md text-blue-700 bg-blue-50 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                >
                                  <Eye className="h-4 w-4 mr-2" />
                                  View Full Report
                                </button>
                                
                                <button
                                  onClick={() => window.location.href = '/timesheet'}
                                  className="inline-flex items-center px-4 py-2 border border-orange-300 text-sm font-medium rounded-md text-orange-700 bg-orange-50 hover:bg-orange-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                                >
                                  <Edit3 className="h-4 w-4 mr-2" />
                                  Adjust Hours
                                </button>
                                
                                <button
                                  onClick={() => deleteTimesheetPost(post.id)}
                                  className="inline-flex items-center px-4 py-2 border border-red-300 text-sm font-medium rounded-md text-red-700 bg-red-50 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete
                                </button>
                              </>
                            ) : (
                              /* Regular Social Media Post Actions */
                              <>
                                <button
                                  onClick={() => regenerateContent(post.id)}
                                  disabled={showLoadingModal}
                                  className="inline-flex items-center px-3 py-1.5 border border-blue-300 text-sm leading-4 font-medium rounded-md text-blue-700 bg-blue-50 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                                >
                                  {showLoadingModal ? (
                                    <>
                                      <RefreshCw className="h-4 w-4 mr-1 animate-spin" />
                                      Generating...
                                    </>
                                  ) : (
                                    <>
                                      <RefreshCw className="h-4 w-4 mr-1" />
                                      Regenerate Content
                                    </>
                                  )}
                                </button>
                                
                                <button
                                  onClick={() => openEditModal(post)}
                                  className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                >
                                  Edit Content
                                </button>
                                
                                <button
                                  onClick={() => openDeleteModal(post)}
                                  className="inline-flex items-center px-3 py-1.5 border border-red-300 text-sm leading-4 font-medium rounded-md text-red-700 bg-red-50 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                                >
                                  <Trash2 className="h-4 w-4 mr-1" />
                                  Delete
                                </button>
                              </>
                            )}
                          </div>
                          
                          <button
                            onClick={() => approvePost(post.id)}
                            disabled={approving === post.id}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                          >
                            {approving === post.id ? (
                              <>
                                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                Publishing...
                              </>
                            ) : (
                              <>
                                <Send className="h-4 w-4 mr-2" />
                                Publish Now
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {posts.length > 0 && pagination.total_pages > 1 && (
              <div className="mt-8 flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  Showing {((currentPage - 1) * 10) + 1} to {Math.min(currentPage * 10, pagination.total_count)} of {pagination.total_count} posts
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
      </div>

      {/* Edit Modal with Sticky Header/Footer */}
      {showEditModal && editingPost && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col">
            {/* Sticky Header */}
            <div className="px-6 py-4 border-b border-gray-200 rounded-t-lg" style={{ backgroundColor: '#29add3' }}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-lg bg-white bg-opacity-20">
                    <Edit3 className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white">
                      Edit Post
                    </h3>
                    <p className="text-white text-opacity-80 text-sm mt-1">
                      Modify content and regenerate image
                    </p>
                  </div>
                </div>
                <button
                  onClick={closeEditModal}
                  className="text-white hover:text-white hover:text-opacity-80 transition-colors p-1 rounded-full hover:bg-white hover:bg-opacity-20"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto px-6 py-6">
              <div className="space-y-6">
                {/* Topic */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Topic</label>
                  <input
                    type="text"
                    value={editForm.topic}
                    onChange={(e) => handleEditFormChange('topic', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Post topic"
                  />
                </div>

                {/* Content */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700">Content</label>
                    <button
                      onClick={() => regenerateContentInModal(editingPost.id)}
                      disabled={showLoadingModal}
                      className="flex items-center px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                    >
                      <MessageSquare className="h-3 w-3 mr-1.5" />
                      Regenerate Content
                    </button>
                  </div>
                  <textarea
                    value={editForm.content}
                    onChange={(e) => handleEditFormChange('content', e.target.value)}
                    rows={8}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Post content"
                  />
                </div>

                {/* Image Text Overlay */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Text Overlay on Image
                    <span className="text-gray-500 text-xs ml-1">(appears as semi-transparent box)</span>
                  </label>
                  <input
                    type="text"
                    value={editForm.image_text}
                    onChange={(e) => handleEditFormChange('image_text', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Call Now, Book Appointment, etc."
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    This text will appear in a semi-transparent dark box over the image (like 'Call Now' button text)
                  </p>
                </div>
              </div>
            </div>

            {/* Sticky Footer */}
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-lg">
              <div className="flex justify-end space-x-3">
                <button
                  onClick={closeEditModal}
                  className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={saveEditedPost}
                  disabled={saveLoading}
                  className="px-6 py-2 text-white rounded-lg transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  style={{ backgroundColor: saveLoading ? '#94a3b8' : '#29add3' }}
                  onMouseEnter={(e) => {
                    if (!saveLoading) e.target.style.backgroundColor = '#2196c7';
                  }}
                  onMouseLeave={(e) => {
                    if (!saveLoading) e.target.style.backgroundColor = '#29add3';
                  }}
                >
                  {saveLoading ? (
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
      )}

      {/* Compact AI Operation Loading Modal */}
      {showLoadingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]">
          <div className="bg-white rounded-lg shadow-2xl p-6 max-w-sm w-full mx-4">
            <div className="text-center">
              <div className="mb-3">
                <RefreshCw className="h-10 w-10 mx-auto text-blue-600 animate-spin" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">Processing</h3>
              <p className="text-gray-600 text-sm mb-2">{loadingMessage}</p>
              {loadingMessage.includes('image') && (
                <p className="text-xs text-gray-500 mb-2">
                  Waiting for new image to load...
                </p>
              )}
              <div className="text-xs text-gray-500">
                Please wait - this may take a few moments
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && postToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Delete Post</h3>
            </div>
            <div className="px-6 py-4">
              <p className="text-gray-600 mb-4">
                Are you sure you want to delete this post? This action cannot be undone.
              </p>
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="font-medium text-gray-900 text-sm">{postToDelete.topic}</p>
                <p className="text-gray-500 text-sm mt-1 line-clamp-2">{postToDelete.content}</p>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-lg">
              <div className="flex justify-end space-x-3">
                <button
                  onClick={closeDeleteModal}
                  className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDeletePost}
                  disabled={deletingPost === postToDelete.id}
                  className="px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center"
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
        </div>
      )}
    </>
  );
};

export default AIReadyToPublish;