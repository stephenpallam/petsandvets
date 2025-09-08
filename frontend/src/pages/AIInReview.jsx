import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  Clock, 
  AlertTriangle, 
  Edit3, 
  Calendar, 
  RefreshCw,
  MessageSquare,
  Image as ImageIcon,
  AlertCircle,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Save,
  X,
  ThumbsUp,
  Eye,
  Trash2,
  Users,
  Send,
  Hash
} from 'lucide-react';
import { formatDate, formatScheduledDate } from '../utils/dateUtils';

const AIInReview = () => {
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
  const [showLoadingModal, setShowLoadingModal] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [savedScrollPosition, setSavedScrollPosition] = useState(0);
  const [showDeleteModal, setShowDeleteModal] = useState(false);  
  const [deletingPost, setDeletingPost] = useState(null);
  const [postToDelete, setPostToDelete] = useState(null);
  const [selectedEmployee, setSelectedEmployee] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    total_pages: 0,
    total_count: 0,
    has_next: false,
    has_prev: false
  });

  const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || import.meta.env.REACT_APP_BACKEND_URL || window.location.origin;

  // Auth check
  useEffect(() => {
    if (!authLoading && (!user || !canAccessManager())) {
      window.location.href = '/login';
    } else if (!authLoading) {
      setPageLoading(false);
      // Run all loading operations in parallel
      Promise.all([
        fetchPosts(1, true), // isInitialLoad = true
        fetchAgentTypes()
      ]).then(() => {
        // Mark data as loaded
        setDataLoaded(true);
      }).catch((error) => {
        console.error('Error loading page:', error);
        // Even on error, mark as loaded to prevent infinite loading
        setDataLoaded(true);
      });
    }
  }, [user, authLoading, canAccessManager]);

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
              ? { ...p, content: result.new_content, updated_at: new Date().toISOString() }
              : p
          )
        );
        setMessage({ type: 'success', text: 'Content regenerated successfully! You can now edit further or complete review.' });
        
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

  const reviewComplete = async (postId) => {
    setProcessingPost(postId);
    try {
      const response = await fetch(`${API_BASE_URL}/api/ai-posts/${postId}/review-complete`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Post moved to Ready to Publish successfully!' });
        fetchPosts(); // Refresh the list
      } else {
        const errorData = await response.json();
        setMessage({ type: 'error', text: errorData.detail || 'Failed to complete review' });
      }
    } catch (error) {
      console.error('Error completing review:', error);
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
      
      const url = `${API_BASE_URL}/api/ai-posts/in-review?${params.toString()}`;
        
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



  const getPlatformIcon = (platform) => {
    const icons = {
      facebook: '📘',
      instagram: '📷',
      twitter: '❌',
      whatsapp: '💬'
    };
    return icons[platform] || '📱';
  };

  if (authLoading || pageLoading || !dataLoaded || !pageReady) {
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
                    <Clock className="h-8 w-8 text-orange-600" />
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900">
                        In Review
                      </h2>
                      <p className="text-sm text-gray-600">
                        Review AI-generated posts before moving to Ready to Publish
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
                  <Clock className="h-8 w-8 text-orange-600" />
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">
                      In Review
                    </h2>
                    <p className="text-sm text-gray-600">
                      Review AI-generated posts before moving to Ready to Publish
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
                  <p className="text-gray-500 text-lg">No posts in review</p>
                  <p className="text-gray-400 text-sm mt-2">Posts will appear here when AI agents generate content</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {posts.map((post) => (
                    <div key={post.id} className="border border-gray-200 rounded-lg overflow-hidden">
                      <div className="p-4">
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
                        ) : (
                          // Social Media Post Rendering
                          <div>
                            {/* Social Media Post Header */}
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-2">
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
                                    {post.updated_at && post.updated_at !== post.created_at ? 
                                      `Updated: ${formatDate(post.updated_at)}` : 
                                      `Created: ${formatDate(post.created_at)}`
                                    }
                                  </div>
                                  {post.scheduled_for && (
                                    <div className="flex items-center">
                                      <Clock className="h-4 w-4 mr-1" />
                                      Scheduled: {formatScheduledDate(post.scheduled_for)}
                                    </div>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                {post.platforms.map((platform) => (
                                  <span 
                                    key={platform} 
                                    className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-700"
                                  >
                                    {getPlatformIcon(platform)} {platform === 'twitter' ? 'X' : platform}
                                  </span>
                                ))}
                              </div>
                            </div>

                            {/* Social Media Post Content */}
                            <div className="prose max-w-none">
                              <div className="whitespace-pre-wrap text-gray-900 leading-relaxed">
                                {post.content}
                              </div>
                              
                              {post.image_url && (
                                <div className="mt-4">
                                  <img 
                                    src={post.image_url} 
                                    alt="Post content" 
                                    className="rounded-lg max-w-full h-auto"
                                    onLoad={() => {
                                      // Check if all images have loaded and set imagesLoaded state
                                      const allImages = document.querySelectorAll('img');
                                      const loadedImages = Array.from(allImages).filter(img => img.complete);
                                      if (loadedImages.length === allImages.length) {
                                        setImagesLoaded(true);
                                      }
                                    }}
                                  />
                                </div>
                              )}
                              
                              {post.hashtags && post.hashtags.length > 0 && (
                                <div className="mt-4 flex flex-wrap gap-2">
                                  {post.hashtags.map((hashtag, index) => (
                                    <span 
                                      key={index}
                                      className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-700"
                                    >
                                      #{hashtag}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>

                        )}

                        {/* Action Buttons */}
                        <div className="flex items-center justify-end space-x-3 mt-6 pt-4 border-t border-gray-200">
                          {post.agent_type === 'time_sheet' ? (
                            /* Timesheet Actions */
                            <>
                              <button
                                onClick={() => openDeleteModal(post)}
                                disabled={!pageReady}
                                className="flex items-center px-4 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </button>
                              <button
                                onClick={() => window.location.href = `/timesheet-hours-adjustment/${post.id}?from=in-review`}
                                disabled={!pageReady}
                                className="flex items-center px-4 py-2 border border-orange-300 text-orange-700 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                              >
                                <Edit3 className="h-4 w-4 mr-2" />
                                Adjust Hours
                              </button>
                              <button
                                onClick={() => reviewComplete(post.id)}
                                disabled={processingPost === post.id || !pageReady}
                                className="flex items-center px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                              >
                                {processingPost === post.id ? (
                                  <>
                                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                    Processing...
                                  </>
                                ) : (
                                  <>
                                    <ThumbsUp className="h-4 w-4 mr-2" />
                                    Review Complete
                                  </>
                                )}
                              </button>
                            </>
                          ) : (
                            /* Regular Social Media Actions */
                            <>
                              <button
                                onClick={() => regenerateContent(post.id)}
                                disabled={showLoadingModal || !pageReady}
                                className="flex items-center px-4 py-2 border border-blue-300 text-blue-700 rounded-lg hover:bg-blue-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                              >
                                <MessageSquare className="h-4 w-4 mr-2" />
                                Regenerate Content
                              </button>
                              <button
                                onClick={() => openEditModal(post)}
                                disabled={!pageReady}
                                className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                              >
                                <Edit3 className="h-4 w-4 mr-2" />
                                Edit
                              </button>
                              <button
                                onClick={() => openDeleteModal(post)}
                                disabled={!pageReady}
                                className="flex items-center px-4 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </button>
                              <button
                                onClick={() => reviewComplete(post.id)}
                                disabled={processingPost === post.id || !pageReady}
                                className="flex items-center px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                              >
                                {processingPost === post.id ? (
                                  <>
                                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                    Processing...
                                  </>
                                ) : (
                                  <>
                                    <ThumbsUp className="h-4 w-4 mr-2" />
                                    Review Complete
                                  </>
                                )}
                              </button>
                            </>
                          )}
                        </div>
                      </div>
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
                        Modify content and settings
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
      </div>
    </>
  );
};

export default AIInReview;