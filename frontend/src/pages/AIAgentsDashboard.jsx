import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { formatScheduledDate } from '../utils/dateUtils';
import { 
  Bot, 
  Calendar, 
  Clock, 
  Edit2, 
  Trash2, 
  Play, 
  Pause, 
  AlertCircle,
  CheckCircle,

  Plus,
  BarChart3,
  Settings,
  Zap,
  FileText,
  Eye,
  RefreshCw,
  Share2,
  X,
  XCircle,
  Users,
  Mail
} from 'lucide-react';

const AIAgentsDashboard = () => {
  const navigate = useNavigate();
  const { user, token, isAdmin, canAccessManager, loading: authLoading } = useAuth();
  const [agents, setAgents] = useState([]);
  const [allAgents, setAllAgents] = useState([]); // Store all agents for stats
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [pageLoading, setPageLoading] = useState(true);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [processingAgent, setProcessingAgent] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'active', 'paused'
  const [agentTypeFilter, setAgentTypeFilter] = useState('all'); // 'all', 'time_sheet', 'email', 'social_media'
  const [showAgentTypeModal, setShowAgentTypeModal] = useState(false);
  const [agentTypes, setAgentTypes] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [payPeriodSettings, setPayPeriodSettings] = useState([]);
  const [originalStartDate, setOriginalStartDate] = useState(null);
  const [businessTimezone, setBusinessTimezone] = useState(null);
  const [businessTime, setBusinessTime] = useState(null);
  const [agentToDelete, setAgentToDelete] = useState(null);
  const [runningAgent, setRunningAgent] = useState(null);
  const [showRunModal, setShowRunModal] = useState(false);
  const [runStatus, setRunStatus] = useState('');
  const [runMessage, setRunMessage] = useState('');
  const [showDuplicateTimesheetModal, setShowDuplicateTimesheetModal] = useState(false);
  const [duplicateTimesheetInfo, setDuplicateTimesheetInfo] = useState(null);
  const [pendingAgentRun, setPendingAgentRun] = useState(null);
  const [holidays, setHolidays] = useState([]);

  const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || import.meta.env.REACT_APP_BACKEND_URL || window.location.origin;

  // Auth check - simplified approach
  useEffect(() => {
    if (!authLoading && user && token && canAccessManager()) {
      console.log('Dashboard loading with token, fetching data...');
      setPageLoading(false);
      fetchAgents();
      fetchHolidays();
      fetchEmployees();
      fetchPayPeriodSettings();
      fetchBusinessInfo(); // Fetch business timezone
      fetchTimesheetConfig().then(startDate => setOriginalStartDate(startDate));
    } else if (!authLoading) {
      setPageLoading(false);
    }
  }, [user, authLoading, canAccessManager, token]);

  // Add window focus listener to refresh data when returning to dashboard
  useEffect(() => {
    const handleFocus = () => {
      if (user && token && canAccessManager()) {
        console.log('Window focused, refreshing agents data...');
        fetchAgents();
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [user, token]);

  // Fetch holidays
  const fetchHolidays = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/holidays`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setHolidays(data);
      } else {
        console.error('Failed to fetch holidays');
      }
    } catch (error) {
      console.error('Error fetching holidays:', error);
    }
  };

  const fetchAgents = async () => {
    setLoading(true);
    try {
      // Fetch all agents from unified ai_agents endpoint (includes all agent types)
      const response = await fetch(`${API_BASE_URL}/api/ai-agents`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const allAgents = await response.json();
        setAllAgents(allAgents);
        
        // Filter agents based on current filters
        let filteredAgents = allAgents;
        
        // Apply status filter
        if (statusFilter === 'active') {
          filteredAgents = filteredAgents.filter(agent => agent.is_active);
        } else if (statusFilter === 'paused') {
          filteredAgents = filteredAgents.filter(agent => !agent.is_active);
        }
        
        // Apply agent type filter
        if (agentTypeFilter !== 'all') {
          filteredAgents = filteredAgents.filter(agent => agent.agent_type === agentTypeFilter);
        }
        
        setAgents(filteredAgents);
      } else {
        setMessage({ type: 'error', text: 'Failed to fetch agents' });
      }
    } catch (error) {
      console.error('Error fetching agents:', error);
      setMessage({ type: 'error', text: 'Network error. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  // Format time from 24-hour to 12-hour AM/PM format
  const formatTime = (time24) => {
    if (!time24) return '';
    const [hours, minutes] = time24.split(':');
    const hour24 = parseInt(hours);
    const hour12 = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24;
    const ampm = hour24 >= 12 ? 'PM' : 'AM';
    return `${hour12}:${minutes} ${ampm}`;
  };

  const applyFilters = (newStatusFilter = statusFilter, newAgentTypeFilter = agentTypeFilter) => {
    let filteredAgents = allAgents;
    
    // Apply status filter
    if (newStatusFilter === 'active') {
      filteredAgents = filteredAgents.filter(agent => agent.is_active);
    } else if (newStatusFilter === 'paused') {
      filteredAgents = filteredAgents.filter(agent => !agent.is_active);
    }
    
    // Apply agent type filter
    if (newAgentTypeFilter !== 'all') {
      filteredAgents = filteredAgents.filter(agent => agent.agent_type === newAgentTypeFilter);
    }
    
    setAgents(filteredAgents);
  };

  const handleStatusFilterChange = (newFilter) => {
    setStatusFilter(newFilter);
    applyFilters(newFilter, agentTypeFilter);
  };

  const handleAgentTypeFilterChange = (newFilter) => {
    setAgentTypeFilter(newFilter);
    applyFilters(statusFilter, newFilter);
  };

  const fetchAgentTypes = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/ai-agent-types`);
      if (response.ok) {
        const types = await response.json();
        setAgentTypes(types);
      }
    } catch (error) {
      console.error('Error fetching agent types:', error);
    }
  };

  const handleNewAgentClick = () => {
    setShowAgentTypeModal(true);
    fetchAgentTypes();
  };

  const handleAgentTypeSelect = (agentType) => {
    setShowAgentTypeModal(false);
    // Navigate to config with agent type
    navigate(`/ai-agent-config?agent_type=${agentType.value}`);
  };

  const handleEditAgent = (agent) => {
    try {
      console.log('Editing agent data:', agent);
      
      // Store the agent data in localStorage for the edit page to use
      localStorage.setItem('editingAgent', JSON.stringify(agent));
      
      // Verify storage
      const stored = localStorage.getItem('editingAgent');
      console.log('Stored in localStorage:', stored);
      
      // Navigate to the AI agent configuration page with agent type parameter
      const agentType = agent.agent_type || 'social_media'; // Default to social_media if not specified
      navigate(`/ai-agent-config?mode=edit&id=${agent.id}&agent_type=${agentType}`);
    } catch (error) {
      console.error('Error navigating to edit agent:', error);
      setMessage({ type: 'error', text: 'Failed to open edit page. Please try again.' });
    }
  };

  const handleRunAgent = (agent) => {
    try {
      console.log('Running agent data:', agent);
      
      // Check for existing timesheets if it's a timesheet agent
      if (agent.agent_type === 'time_sheet') {
        checkForExistingTimesheet(agent);
      } else {
        // All other agents use the unified modal approach
        runAgentWithModal(agent);
      }
    } catch (error) {
      console.error('Error running agent:', error);
      setMessage({ type: 'error', text: 'Failed to run agent. Please try again.' });
    }
  };

  // Check for existing timesheet for the same period
  const checkForExistingTimesheet = async (agent) => {
    try {
      console.log('=== DUPLICATE TIMESHEET CHECK ===');
      console.log('Checking for existing timesheets for agent:', agent.id);
      
      // Calculate the period dates based on agent settings
      const periodInfo = calculatePayPeriodAndRunDate(agent);
      console.log('Period info calculated:', periodInfo);
      
      if (!periodInfo || !periodInfo.payPeriodRange || periodInfo.payPeriodRange.includes('Error') || periodInfo.payPeriodRange.includes('Set foundation date')) {
        console.log('Cannot calculate period, proceeding with agent run');
        // If we can't calculate the period, proceed with running the agent
        runAgentWithModal(agent);
        return;
      }

      // Search for existing timesheet posts from all workflow states
      console.log('Fetching existing posts from all workflow states...');
      
      const [inReviewResponse, readyToPublishResponse, publishedResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/api/ai-posts/in-review?page=1&limit=50`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`${API_BASE_URL}/api/ai-posts/ready-to-publish?page=1&limit=50`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`${API_BASE_URL}/api/ai-posts/published?page=1&limit=50`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);
      
      let allPosts = [];
      
      if (inReviewResponse.ok) {
        const inReviewData = await inReviewResponse.json();
        const inReviewPosts = inReviewData.posts || [];
        console.log('In Review posts:', inReviewPosts.length);
        allPosts = allPosts.concat(inReviewPosts);
      }
      
      if (readyToPublishResponse.ok) {
        const readyData = await readyToPublishResponse.json();
        const readyPosts = readyData.posts || [];
        console.log('Ready to Publish posts:', readyPosts.length);
        allPosts = allPosts.concat(readyPosts);
      }
      
      if (publishedResponse.ok) {
        const publishedData = await publishedResponse.json();
        const publishedPosts = publishedData.posts || [];
        console.log('Published posts:', publishedPosts.length);
        allPosts = allPosts.concat(publishedPosts);
      }
      
      console.log('Total posts from all endpoints:', allPosts.length);
      console.log('Total posts from all endpoints:', allPosts.length);
      
      // Filter for timesheet posts from this agent
      const timesheetPosts = allPosts.filter(post => {
        const isTimesheet = post.agent_type === 'time_sheet';
        const isFromThisAgent = post.agent_id === agent.id;
        const isInWorkflow = post.status === 'in_review' || post.status === 'ready_to_publish' || post.status === 'published';
        
        console.log(`Post ${post.id}: agent_type=${post.agent_type}, agent_id=${post.agent_id}, status=${post.status}`);
        console.log(`  - isTimesheet: ${isTimesheet}, isFromThisAgent: ${isFromThisAgent}, isInWorkflow: ${isInWorkflow}`);
        
        return isTimesheet && isFromThisAgent && isInWorkflow;
      });
      
      console.log('Filtered timesheet posts:', timesheetPosts.length, timesheetPosts);

      if (timesheetPosts.length > 0) {
        // Find the most recent one
        const existingTimesheet = timesheetPosts[0];
        console.log('Found existing timesheet:', existingTimesheet);
        
        setDuplicateTimesheetInfo({
          existingTimesheet,
          period: periodInfo.payPeriodRange,
          status: existingTimesheet.status
        });
        setPendingAgentRun(agent);
        setShowDuplicateTimesheetModal(true);
        console.log('Showing duplicate timesheet modal');
      } else {
        console.log('No duplicate timesheets found, proceeding with agent run');
        // No duplicates found, proceed with running
        runAgentWithModal(agent);
      }
    } catch (error) {
      console.error('Error checking for existing timesheet:', error);
      // If check fails, proceed with running (better than blocking)
      runAgentWithModal(agent);
    }
    
    console.log('=================================');
  };

  // Handle user's choice about duplicate timesheet
  const handleDuplicateTimesheetChoice = async (continueWithRun) => {
    setShowDuplicateTimesheetModal(false);
    
    if (continueWithRun && pendingAgentRun && duplicateTimesheetInfo) {
      try {
        // Delete the existing timesheet post first
        const existingPostId = duplicateTimesheetInfo.existingTimesheet.id;
        console.log(`Deleting existing timesheet post: ${existingPostId}`);
        
        const deleteResponse = await fetch(`${API_BASE_URL}/api/ai-posts/${existingPostId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        
        if (deleteResponse.ok) {
          console.log('Existing timesheet deleted successfully');
          // Now run the agent to create new timesheet
          runAgentWithModal(pendingAgentRun);
        } else {
          console.error('Failed to delete existing timesheet');
          setMessage({ type: 'error', text: 'Failed to delete existing timesheet. Please try again.' });
        }
      } catch (error) {
        console.error('Error deleting existing timesheet:', error);
        setMessage({ type: 'error', text: 'Error deleting existing timesheet. Please try again.' });
      }
    }
    
    // Reset states
    setDuplicateTimesheetInfo(null);
    setPendingAgentRun(null);
  };

  const runAgentWithModal = async (agent) => {
    setRunningAgent(agent);
    setShowRunModal(true);
    setRunStatus('running');
    setRunMessage('Agent is running...');

    try {
      // For timesheet agents, calculate the current pay period to send to backend
      let requestBody = {};
      
      if (agent.agent_type === 'time_sheet') {
        const periodInfo = calculatePayPeriodAndRunDate(agent);
        if (periodInfo && periodInfo.currentPeriodStart && periodInfo.currentPeriodEnd) {
          // Use the actual calculated start and end dates
          const startDate = new Date(periodInfo.currentPeriodStart);
          const endDate = new Date(periodInfo.currentPeriodEnd);
          
          // Format as YYYY-MM-DD in business timezone, avoiding timezone shifts
          const formatDateForBackend = (date) => {
            // Use UTC methods to avoid timezone conversion issues
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            const formatted = `${year}-${month}-${day}`;
            console.log(`Formatting date ${date} as ${formatted}`);
            return formatted;
          };
          
          requestBody = {
            custom_period: {
              start_date: formatDateForBackend(startDate),
              end_date: formatDateForBackend(endDate)
            }
          };
          console.log('=== FRONTEND PAY PERIOD DEBUG ===');
          console.log('Dashboard calculated start date:', startDate);
          console.log('Dashboard calculated end date:', endDate);
          console.log('Formatted start_date for backend:', formatDateForBackend(startDate));
          console.log('Formatted end_date for backend:', formatDateForBackend(endDate));
          console.log('Sending timesheet period to backend:', requestBody);
          console.log('===================================');
        }
      }
      
      // Call unified backend API to run any agent type
      const response = await fetch(`${API_BASE_URL}/api/ai-agents/${agent.id}/run`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: Object.keys(requestBody).length > 0 ? JSON.stringify(requestBody) : undefined
      });

      if (response.ok) {
        const result = await response.json();
        setRunStatus('completed');
        
        // Customize success message based on agent mode
        let successMessage = 'Content generated successfully!';
        if (agent.mode === 'auto' || agent.mode === 'recurring') {
          successMessage = 'Recurring agent executed successfully! Content generated based on your schedule.';
        } else if (agent.mode === 'adhoc') {
          successMessage = 'Adhoc agent executed successfully! Content generated and ready for review.';
        } else if (agent.mode === 'write') {
          successMessage = 'Write Your Post agent executed successfully! Your content has been generated.';
        }
        
        setRunMessage(successMessage + ' Check the In Review or Ready to Publish pages.');
        
        setTimeout(() => {
          setShowRunModal(false);
          setRunningAgent(null);
          setRunStatus('');
          setRunMessage('');
        }, 3000);
      } else {
        const errorData = await response.json();
        setRunStatus('error');
        setRunMessage(errorData.detail || 'Failed to generate content');
      }
    } catch (error) {
      console.error('Error running agent:', error);
      setRunStatus('error');
      setRunMessage('Network error. Please check your connection.');
    }
  };

  const openDeleteModal = (agent) => {
    setAgentToDelete(agent);
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setAgentToDelete(null);
  };

  const confirmDeleteAgent = async () => {
    if (!agentToDelete) return;

    setProcessingAgent(agentToDelete.id);
    setShowDeleteModal(false);
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/ai-agents/${agentToDelete.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'AI agent deleted successfully!' });
        fetchAgents();
      } else {
        const errorData = await response.json();
        setMessage({ type: 'error', text: errorData.detail || 'Failed to delete agent' });
      }
    } catch (error) {
      console.error('Error deleting agent:', error);
      setMessage({ type: 'error', text: 'Network error. Please try again.' });
    } finally {
      setProcessingAgent(null);
      setAgentToDelete(null);
    }
  };

  const toggleAgentStatus = async (agentId, currentStatus) => {
    setProcessingAgent(agentId);
    try {
      const response = await fetch(`${API_BASE_URL}/api/ai-agents/${agentId}/toggle`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setMessage({ 
          type: 'success', 
          text: `AI agent ${currentStatus ? 'paused' : 'activated'} successfully!` 
        });
        fetchAgents();
      } else {
        const errorData = await response.json();
        setMessage({ type: 'error', text: errorData.detail || 'Failed to update agent status' });
      }
    } catch (error) {
      console.error('Error updating agent:', error);
      setMessage({ type: 'error', text: 'Network error. Please try again.' });
    } finally {
      setProcessingAgent(null);
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

  const getModeIcon = (mode) => {
    const icons = {
      auto: Bot,
      adhoc: Zap,
      write: FileText
    };
    return icons[mode] || Bot;
  };

  const getModeColor = (mode) => {
    const colors = {
      auto: '#29add3',
      adhoc: '#f59e0b',
      write: '#8b5cf6'
    };
    return colors[mode] || '#29add3';
  };

  const getModeLabel = (mode, agentType, selectedHolidays) => {
    // Special case for SMS and Email agents with holidays (scheduled mode)
    if ((agentType === 'sms_agent' || agentType === 'email') && mode === 'recurring' && selectedHolidays && selectedHolidays.length > 0) {
      return 'Scheduled Mode';
    }
    
    const labels = {
      auto: 'Recurring Mode',  // Legacy support
      recurring: 'Recurring Mode',
      adhoc: 'Adhoc Mode',
      write: 'Custom Post Mode'
    };
    return labels[mode] || mode;
  };

  // Helper function to get the "Runs Every" frequency for timesheet agents
  const getRunsEveryLabel = (agent) => {
    if (agent.agent_type !== 'time_sheet' || !agent.run_every_pay_period) {
      return 'Not set';
    }
    
    const frequency = agent.run_every_pay_period;
    const labels = {
      'weekly': 'Weekly',
      'current_week': 'Weekly',
      'bi_weekly': 'Bi-weekly',
      'biweekly': 'Bi-weekly',
      'monthly': 'Monthly',
      'current_month': 'Monthly'
    };
    
    return labels[frequency] || frequency;
  };

  // Calculate next run time for recurring agents (non-timesheet)
  const calculateNextRunForRecurringAgent = (agent) => {
    if (agent.mode !== 'recurring' && agent.mode !== 'auto') {
      return null;
    }

    if (agent.agent_type === 'time_sheet') {
      return null; // Timesheet agents use their own calculation
    }

    try {
      // Get current time in business timezone (fallback to local if not loaded)
      const now = businessTime ? new Date(businessTime) : new Date();
      const scheduleTime = agent.post_time || '09:00';
      const [hours, minutes] = scheduleTime.split(':').map(Number);

      // Get selected days of the week
      const daysOfWeek = agent.days_of_week || {};
      const selectedDays = Object.entries(daysOfWeek)
        .filter(([day, selected]) => selected)
        .map(([day]) => day);

      if (selectedDays.length === 0) {
        return {
          nextRunDate: 'No days selected',
          lastRunDate: agent.last_manual_run ? formatDate(agent.last_manual_run) : 'Never run manually'
        };
      }

      // Map day names to JavaScript day numbers (0 = Sunday, 1 = Monday, etc.)
      const dayMap = {
        'sunday': 0, 'monday': 1, 'tuesday': 2, 'wednesday': 3,
        'thursday': 4, 'friday': 5, 'saturday': 6
      };

      const selectedDayNumbers = selectedDays.map(day => dayMap[day.toLowerCase()]).filter(num => num !== undefined);

      if (selectedDayNumbers.length === 0) {
        return {
          nextRunDate: 'Invalid days configuration',
          lastRunDate: agent.last_manual_run ? formatDate(agent.last_manual_run) : 'Never run manually'
        };
      }

      // Find the next run date
      let nextRunDate = new Date(now);
      let daysToAdd = 0;
      const maxDaysToCheck = 14; // Check up to 2 weeks ahead

      while (daysToAdd < maxDaysToCheck) {
        const checkDate = new Date(now);
        checkDate.setDate(now.getDate() + daysToAdd);
        
        const dayOfWeek = checkDate.getDay();
        
        if (selectedDayNumbers.includes(dayOfWeek)) {
          // Set the time for this date
          checkDate.setHours(hours, minutes, 0, 0);
          
          // If it's today, make sure the time hasn't passed yet
          if (daysToAdd === 0 && checkDate <= now) {
            daysToAdd++;
            continue;
          }
          
          nextRunDate = checkDate;
          break;
        }
        
        daysToAdd++;
      }

      // Format the next run date
      const nextRunStr = nextRunDate.toLocaleDateString('en-US', { 
        weekday: 'short',
        month: 'short', 
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true 
      });

      return {
        nextRunDate: nextRunStr,
        lastRunDate: agent.last_manual_run ? formatDate(agent.last_manual_run) : 'Never run manually',
        selectedDays: selectedDays.map(day => day.charAt(0).toUpperCase() + day.slice(1)).join(', ')
      };

    } catch (error) {
      console.error('Error calculating next run for recurring agent:', error);
      return {
        nextRunDate: 'Error calculating next run',
        lastRunDate: agent.last_manual_run ? formatDate(agent.last_manual_run) : 'Never run manually'
      };
    }
  };

  const isReadyForNextPost = (agent) => {
    // Check if agent is adhoc or write mode, has no scheduled date/time, but has published a post before
    return (agent.mode === 'adhoc' || agent.mode === 'write') && 
           !agent.post_date && 
           !agent.post_time && 
           agent.last_post_published;
  };

  const formatAgentSchedule = (agent) => {
    // Check if agent is ready for next post
    if (isReadyForNextPost(agent)) {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded text-xs font-medium bg-green-100 text-green-700">
          Ready for Next Post
        </span>
      );
    }
    
    // If agent has immediate flag set to true
    if (agent.immediate) {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded text-xs font-medium bg-blue-100 text-blue-700">
          Immediate
        </span>
      );
    }
    
    // If agent has post_date and post_time, combine them for user-friendly formatting
    if (agent.post_date && agent.post_time) {
      try {
        // Create a datetime string from post_date and post_time
        const datetimeString = `${agent.post_date}T${agent.post_time}:00`;
        return formatScheduledDate(datetimeString);
      } catch (error) {
        // Fallback to original format if parsing fails
        return `${agent.post_date} ${agent.post_time}`;
      }
    }
    
    // If no schedule info available
    return 'Not scheduled';
  };

  const getPlatformIcon = (platform) => {
    const icons = {
      facebook: '📘',
      instagram: '📷',
      twitter: '𝕏',
      whatsapp: '💬'
    };
    return icons[platform] || '📱';
  };

  const getEnabledPlatforms = (socialPlatforms) => {
    if (!socialPlatforms) return [];
    return Object.entries(socialPlatforms)
      .filter(([platform, enabled]) => enabled)
      .map(([platform, enabled]) => platform);
  };

  const getWorkflowMode = (agent) => {
    // Check post_destination field first (newer agents)
    if (agent.post_destination) {
      switch (agent.post_destination) {
        case 'in_review':
          return 'In Review → Ready to Publish → Publish';
        case 'ready_to_publish':
          return 'Ready to Publish → Publish';
        case 'auto_post':
          return 'Directly Publish';
        default:
          return 'In Review → Ready to Publish → Publish';
      }
    }
    
    // Fallback to auto_post field (legacy agents)
    if (agent.auto_post) {
      return 'Directly Publish';
    } else {
      return 'In Review → Ready to Publish → Publish';
    }
  };

  // Helper function to format image option display
  const formatImageOption = (agent) => {
    if (!agent.image_option) {
      return 'AI Generate';
    }
    
    // For social media agents, show "Text only post" when no image is selected
    if (agent.agent_type === 'social_media' && agent.image_option === 'none') {
      return 'Text only post';
    }
    
    // For email agents, show "Text only email" when no image is selected
    if (agent.agent_type === 'email' && agent.image_option === 'none') {
      return 'Text only email';
    }
    
    // For other cases, format normally
    return agent.image_option.replace('_', ' ');
  };

  // Helper function to get next scheduled holiday for email and SMS agents
  const getNextScheduledHoliday = (agent) => {
    if ((agent.agent_type !== 'email' && agent.agent_type !== 'sms_agent') || !agent.selected_holidays || agent.selected_holidays.length === 0) {
      return { nextRun: 'No holidays selected', holidayName: '' };
    }
    
    if (!holidays || holidays.length === 0) {
      return { nextRun: 'Loading holidays...', holidayName: '' };
    }
    
    const today = new Date();
    const postTime = agent.post_time || '09:00';
    let nextHoliday = null;
    let minDiff = Infinity;
    
    // Find the next upcoming holiday from selected holidays
    agent.selected_holidays.forEach(holidayId => {
      const holiday = holidays.find(h => h.id === holidayId);
      if (holiday) {
        const holidayDate = new Date(`${holiday.date}T${postTime}:00`);
        const timeDiff = holidayDate.getTime() - today.getTime();
        
        if (timeDiff > 0 && timeDiff < minDiff) {
          minDiff = timeDiff;
          nextHoliday = {
            name: holiday.name,
            date: holidayDate,
            postTime: postTime
          };
        }
      }
    });
    
    if (nextHoliday) {
      // Format date in user-friendly format like "Nov 23rd, 2025"
      const formatDate = (date) => {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                       'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const day = date.getDate();
        const month = months[date.getMonth()];
        const year = date.getFullYear();
        
        // Add ordinal suffix (st, nd, rd, th)
        const getOrdinalSuffix = (day) => {
          if (day > 3 && day < 21) return 'th';
          switch (day % 10) {
            case 1: return 'st';
            case 2: return 'nd';
            case 3: return 'rd';
            default: return 'th';
          }
        };
        
        return `${month} ${day}${getOrdinalSuffix(day)}, ${year}`;
      };
      
      // Format time from 24-hour to 12-hour AM/PM format
      const formatTime = (time24) => {
        const [hours, minutes] = time24.split(':');
        const hour24 = parseInt(hours);
        const hour12 = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24;
        const ampm = hour24 >= 12 ? 'PM' : 'AM';
        return `${hour12}:${minutes} ${ampm}`;
      };
      
      return {
        nextRun: `${formatDate(nextHoliday.date)} at ${formatTime(nextHoliday.postTime)}`,
        holidayName: nextHoliday.name
      };
    }
    
    const holidayCount = agent.selected_holidays.length;
    return { 
      nextRun: `No upcoming holidays this year (${holidayCount} selected)`, 
      holidayName: '' 
    };
  };

  // Helper function to format ChatGPT enabled status
  const formatChatGPTStatus = (agent) => {
    // Check all possible field names for ChatGPT formatting (prioritize the field actually saved)
    return (agent.use_chatgpt_formatting || agent.useChatGPTFormatting || agent.use_chatgpt_email_formatting) ? 'Yes' : 'No';
  };

  // Fetch employees for name mapping
  const fetchEmployees = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/employees`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        const employeesData = await response.json();
        setEmployees(employeesData);
      }
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  };

  // Fetch business timezone and info
  const fetchBusinessInfo = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/business-info`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        const businessInfo = await response.json();
        
        // Set timezone - it might be in timezone field or need fallback
        const timezone = businessInfo.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone;
        setBusinessTimezone(timezone);
        
        // Parse the current time properly
        if (businessInfo.current_time) {
          const currentTime = new Date(businessInfo.current_time);
          if (!isNaN(currentTime.getTime())) {
            setBusinessTime(currentTime);
            console.log('Business timezone loaded:', timezone, 'Current time:', currentTime);
          } else {
            console.error('Invalid business time received:', businessInfo.current_time);
            setBusinessTime(new Date()); // Fallback to current time
          }
        } else {
          console.warn('No current_time in business info, using current time');
          setBusinessTime(new Date()); // Fallback if no current_time
        }
      } else {
        console.error('Failed to fetch business info:', response.status);
        // Fallback to system timezone and current time
        setBusinessTimezone(Intl.DateTimeFormat().resolvedOptions().timeZone);
        setBusinessTime(new Date());
      }
    } catch (error) {
      console.error('Error fetching business info:', error);
      // Fallback to system timezone and current time
      setBusinessTimezone(Intl.DateTimeFormat().resolvedOptions().timeZone);
      setBusinessTime(new Date());
    }
  };

  // Fetch pay period settings for next run calculation
  const fetchPayPeriodSettings = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/pay-period-settings`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        const settings = await response.json();
        setPayPeriodSettings(settings);
      }
    } catch (error) {
      console.error('Error fetching pay period settings:', error);
    }
  };

  // Fetch timesheet configuration for original start date
  const fetchTimesheetConfig = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/timesheet-config`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        const config = await response.json();
        return config.original_pay_period_start_date;
      }
    } catch (error) {
      console.error('Error fetching timesheet config:', error);
    }
    return null;
  };

  // Get employee name by ID
  const getEmployeeName = (employeeId) => {
    const employee = employees.find(emp => emp.id === employeeId);
    return employee ? (employee.full_name || employee.name || employeeId) : employeeId;
  };

  // Calculate next run date and pay period details for timesheet agent
  const calculatePayPeriodAndRunDate = (agent) => {
    if (!agent || agent.agent_type !== 'time_sheet' || agent.mode !== 'recurring') {
      return null;
    }

    if (!originalStartDate) {
      return {
        payPeriodRange: 'Set foundation date in Timesheet Configuration',
        nextRunDate: 'Cannot calculate without foundation date',
        daysAfter: agent.days_after_period_end || 1
      };
    }

    if (!businessTimezone || !businessTime) {
      // If business info isn't loaded yet, use current time as fallback
      const payPeriodType = agent.run_every_pay_period || 'weekly';
      const periodMapping = {
        'current_week': 'weekly',
        'weekly': 'weekly', 
        'bi_weekly': 'bi_weekly',
        'biweekly': 'bi_weekly',
        'current_month': 'monthly',
        'monthly': 'monthly'
      };
      
      const normalizedType = periodMapping[payPeriodType] || payPeriodType;
      
      return {
        payPeriodRange: `Loading ${normalizedType} period...`,
        nextRunDate: 'Loading next run date...',
        daysAfter: agent.days_after_period_end || 1
      };
    }

    try {
      // Handle different period type formats and map them correctly
      let payPeriodType = agent.run_every_pay_period || 'weekly';
      
      // Normalize period types
      const periodMapping = {
        'current_week': 'weekly',
        'weekly': 'weekly',
        'bi_weekly': 'bi_weekly',
        'biweekly': 'bi_weekly',
        'current_month': 'monthly',
        'monthly': 'monthly'
      };
      
      payPeriodType = periodMapping[payPeriodType] || payPeriodType;
      
      const daysAfterPeriodEnd = agent.days_after_period_end || 1;
      const scheduleTime = agent.schedule_time || '09:00';
      
      // Parse the original start date using business timezone
      const foundationStart = new Date(originalStartDate + 'T00:00:00');
      
      // Validate foundation date
      if (isNaN(foundationStart.getTime())) {
        console.error('Invalid foundation start date:', originalStartDate);
        return {
          payPeriodRange: 'Invalid foundation date',
          nextRunDate: 'Check Timesheet Configuration',
          daysAfter: agent.days_after_period_end || 1
        };
      }
      
      // Use business time with fallback to current time
      let now = new Date();
      if (businessTime && !isNaN(businessTime.getTime())) {
        now = new Date(businessTime);
      } else {
        console.warn('Using fallback current time for calculations');
        now = new Date();
      }
      
      let currentPeriodStart, nextPeriodEnd;

      if (payPeriodType === 'weekly') {
        // Calculate weeks since foundation date
        const msPerWeek = 7 * 24 * 60 * 60 * 1000;
        const weeksSinceFoundation = Math.floor((now - foundationStart) / msPerWeek);
        
        // Find the current pay period start
        currentPeriodStart = new Date(foundationStart);
        currentPeriodStart.setDate(foundationStart.getDate() + (weeksSinceFoundation * 7));
        
        const currentPeriodEnd = new Date(currentPeriodStart);
        currentPeriodEnd.setDate(currentPeriodStart.getDate() + 6); // 7 days - 1
        currentPeriodEnd.setHours(23, 59, 59, 999); // End of day
        
        // Check if we need to move to next period
        if (now > currentPeriodEnd) {
          // We're in the next weekly period
          currentPeriodStart.setDate(currentPeriodStart.getDate() + 7);
          const newPeriodEnd = new Date(currentPeriodStart);
          newPeriodEnd.setDate(currentPeriodStart.getDate() + 6);
          newPeriodEnd.setHours(23, 59, 59, 999);
          nextPeriodEnd = newPeriodEnd;
        } else {
          // We're still in current period, next run is for this period
          nextPeriodEnd = currentPeriodEnd;
        }
        
      } else if (payPeriodType === 'bi_weekly') {
        // Calculate bi-weeks since foundation date
        const msPerBiWeek = 14 * 24 * 60 * 60 * 1000;
        const biWeeksSinceFoundation = Math.floor((now - foundationStart) / msPerBiWeek);
        
        // Find the current pay period start
        currentPeriodStart = new Date(foundationStart);
        currentPeriodStart.setDate(foundationStart.getDate() + (biWeeksSinceFoundation * 14));
        
        const currentPeriodEnd = new Date(currentPeriodStart);
        currentPeriodEnd.setDate(currentPeriodStart.getDate() + 13); // 14 days - 1
        currentPeriodEnd.setHours(23, 59, 59, 999); // End of day
        
        // Check if we need to move to next period
        if (now > currentPeriodEnd) {
          // We're in the next bi-weekly period
          currentPeriodStart.setDate(currentPeriodStart.getDate() + 14);
          const newPeriodEnd = new Date(currentPeriodStart);
          newPeriodEnd.setDate(currentPeriodStart.getDate() + 13);
          newPeriodEnd.setHours(23, 59, 59, 999);
          nextPeriodEnd = newPeriodEnd;
        } else {
          // We're still in current period, next run is for this period
          nextPeriodEnd = currentPeriodEnd;
        }
        
      } else if (payPeriodType === 'monthly') {
        // Calculate months since foundation date
        const foundationMonth = foundationStart.getMonth();
        const foundationYear = foundationStart.getFullYear();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();
        
        const monthsElapsed = (currentYear - foundationYear) * 12 + (currentMonth - foundationMonth);
        
        // Find current period
        const currentPeriodStartYear = foundationYear + Math.floor((foundationMonth + monthsElapsed) / 12);
        const currentPeriodStartMonth = (foundationMonth + monthsElapsed) % 12;
        
        currentPeriodStart = new Date(currentPeriodStartYear, currentPeriodStartMonth, foundationStart.getDate());
        
        // End of current month period
        const currentPeriodEnd = new Date(currentPeriodStartYear, currentPeriodStartMonth + 1, 0); // Last day of month
        currentPeriodEnd.setHours(23, 59, 59, 999);
        
        // If current period has ended, get next period
        if (now > currentPeriodEnd) {
          currentPeriodStart = new Date(currentPeriodStartYear, currentPeriodStartMonth + 1, foundationStart.getDate());
          nextPeriodEnd = new Date(currentPeriodStartYear, currentPeriodStartMonth + 2, 0); // Next month end
          nextPeriodEnd.setHours(23, 59, 59, 999);
        } else {
          nextPeriodEnd = currentPeriodEnd;
        }
      } else {
        return {
          payPeriodRange: `${payPeriodType} period (custom)`,
          nextRunDate: `Next ${payPeriodType} period + ${daysAfterPeriodEnd} days at ${scheduleTime}`,
          daysAfter: daysAfterPeriodEnd
        };
      }

      // Calculate the next run date (period end + days after)
      const nextRunDate = new Date(nextPeriodEnd);
      nextRunDate.setDate(nextPeriodEnd.getDate() + daysAfterPeriodEnd);
      
      // Reset to beginning of day, then add schedule time
      nextRunDate.setHours(0, 0, 0, 0);
      const [hours, minutes] = scheduleTime.split(':');
      nextRunDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);

      // Format the pay period range
      const periodStartStr = currentPeriodStart.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: currentPeriodStart.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
      });
      const periodEndStr = nextPeriodEnd.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: nextPeriodEnd.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
      });

      // Format the next run date
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);

      let runDateStr;
      if (nextRunDate.toDateString() === today.toDateString()) {
        runDateStr = 'Today';
      } else if (nextRunDate.toDateString() === tomorrow.toDateString()) {
        runDateStr = 'Tomorrow';
      } else {
        runDateStr = nextRunDate.toLocaleDateString('en-US', { 
          weekday: 'short', 
          month: 'short', 
          day: 'numeric',
          year: nextRunDate.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
        });
      }

      const timeStr = nextRunDate.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      });

      return {
        payPeriodRange: `${periodStartStr} - ${periodEndStr}`,
        nextRunDate: `${runDateStr} at ${timeStr}`,
        daysAfter: daysAfterPeriodEnd,
        // Include raw dates for backend usage
        currentPeriodStart: currentPeriodStart,
        currentPeriodEnd: nextPeriodEnd
      };
    } catch (error) {
      console.error('Error calculating pay period and run date:', error);
      
      // Emergency fallback calculation using simple logic
      try {
        const payPeriodType = agent.run_every_pay_period || 'weekly';
        const now = new Date();
        const daysAfterPeriodEnd = agent.days_after_period_end || 1;
        
        let startDate, endDate;
        
        if (payPeriodType.includes('bi') || payPeriodType.includes('weekly')) {
          // Simple bi-weekly calculation
          const currentDate = now.getDate();
          const currentMonth = now.getMonth();
          const currentYear = now.getFullYear();
          
          // Simple approximation - start from 1st or 15th of month
          if (currentDate <= 14) {
            startDate = new Date(currentYear, currentMonth, 1);
            endDate = new Date(currentYear, currentMonth, 14);
          } else {
            startDate = new Date(currentYear, currentMonth, 15);
            endDate = new Date(currentYear, currentMonth + 1, 0); // Last day of month
          }
        } else {
          // Simple weekly calculation
          const dayOfWeek = now.getDay();
          const monday = new Date(now);
          monday.setDate(now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1));
          
          startDate = monday;
          endDate = new Date(monday);
          endDate.setDate(monday.getDate() + 6);
        }
        
        const formatSimpleDate = (date) => {
          const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                         'Jul', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'];
          const month = months[date.getMonth()];
          const day = date.getDate();
          const getDaySuffix = (day) => {
            if (day >= 11 && day <= 13) return 'th';
            switch (day % 10) {
              case 1: return 'st';
              case 2: return 'nd';
              case 3: return 'rd';
              default: return 'th';
            }
          };
          return `${month} ${day}${getDaySuffix(day)}`;
        };
        
        const startFormatted = formatSimpleDate(startDate);
        const endFormatted = formatSimpleDate(endDate);
        const year = endDate.getFullYear();
        
        return {
          payPeriodRange: `${startFormatted} - ${endFormatted}, ${year}`,
          nextRunDate: 'Calculation pending...',
          daysAfter: daysAfterPeriodEnd,
          currentPeriodStart: startDate,
          currentPeriodEnd: endDate
        };
        
      } catch (fallbackError) {
        console.error('Even fallback calculation failed:', fallbackError);
        return {
          payPeriodRange: 'Error calculating pay period',
          nextRunDate: 'Error calculating run date',
          daysAfter: agent.days_after_period_end || 1
        };
      }
    }
  };

  if (authLoading || pageLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Show login prompt if not authenticated
  if (!user || !canAccessManager()) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
          <div className="text-center">
            <BarChart3 className="mx-auto h-12 w-12 text-blue-600" />
            <h2 className="mt-4 text-xl font-semibold text-gray-900">AI Agents Dashboard</h2>
            <p className="mt-2 text-sm text-gray-600">
              Please log in with manager or admin privileges to access the dashboard.
            </p>
            <button
              onClick={() => navigate('/login')}
              className="mt-4 w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Go to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Header */}
          <div className="px-4 sm:px-6 py-4 bg-gray-50 border-b border-gray-200">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex items-center space-x-3">
                <BarChart3 className="h-8 w-8 text-blue-600 flex-shrink-0" />
                <div className="min-w-0">
                  <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
                    AI Agents Dashboard
                  </h2>
                  <p className="text-sm text-gray-600">
                    Manage and monitor your AI agents (Social Media, Email, Timesheet)
                  </p>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:space-x-3">
                {/* Mobile-first responsive controls */}
                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                  {/* Status Filter */}
                  <select
                    value={statusFilter}
                    onChange={(e) => handleStatusFilterChange(e.target.value)}
                    className="text-white px-4 py-2 rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-1 transition-colors appearance-none pr-10 w-full sm:w-auto"
                    style={{ 
                      backgroundColor: '#7c3aed',
                      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%23ffffff' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E")`,
                      backgroundPosition: 'right 8px center',
                      backgroundRepeat: 'no-repeat',
                      backgroundSize: '16px'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = '#6d28d9';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = '#7c3aed';
                    }}
                  >
                    <option value="all" style={{ backgroundColor: 'white', color: 'black' }}>All Agents</option>
                    <option value="active" style={{ backgroundColor: 'white', color: 'black' }}>Active Only</option>
                    <option value="paused" style={{ backgroundColor: 'white', color: 'black' }}>Paused Only</option>
                  </select>
                  
                  <div className="flex gap-3">
                    <select
                      value={agentTypeFilter}
                      onChange={(e) => handleAgentTypeFilterChange(e.target.value)}
                      className="text-white px-4 py-2 rounded-lg transition-colors font-medium flex-1 sm:flex-initial cursor-pointer"
                      style={{ 
                        backgroundColor: '#16a34a',
                        minWidth: '160px'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.backgroundColor = '#15803d';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.backgroundColor = '#16a34a';
                      }}
                    >
                      <option value="all" style={{ backgroundColor: 'white', color: 'black' }}>All Agent Types</option>
                      <option value="time_sheet" style={{ backgroundColor: 'white', color: 'black' }}>Timesheet Agents</option>
                      <option value="email" style={{ backgroundColor: 'white', color: 'black' }}>Email Agents</option>
                      <option value="social_media" style={{ backgroundColor: 'white', color: 'black' }}>Social Media Agents</option>
                    </select>
                    <button
                      onClick={handleNewAgentClick}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg transition-colors hover:bg-green-700 flex items-center justify-center font-medium flex-1 sm:flex-initial"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      <span className="hidden sm:inline">New Agent</span>
                      <span className="sm:hidden">New Agent</span>
                    </button>
                  </div>
                </div>
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

            {/* Stats Cards */}
            {allAgents.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex items-center">
                    <Bot className="h-8 w-8 text-blue-600" />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-blue-600">Total Agents</p>
                      <p className="text-2xl font-bold text-blue-900">{allAgents.length}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-green-50 rounded-lg p-4">
                  <div className="flex items-center">
                    <Play className="h-8 w-8 text-green-600" />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-green-600">Active</p>
                      <p className="text-2xl font-bold text-green-900">
                        {allAgents.filter(agent => agent.is_active).length}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-orange-50 rounded-lg p-4">
                  <div className="flex items-center">
                    <Clock className="h-8 w-8 text-orange-600" />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-orange-600">Recurring Mode</p>
                      <p className="text-2xl font-bold text-orange-900">
                        {allAgents.filter(agent => agent.mode === 'auto' || agent.mode === 'recurring').length}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-purple-50 rounded-lg p-4">
                  <div className="flex items-center">
                    <FileText className="h-8 w-8 text-purple-600" />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-purple-600">Adhoc Agents</p>
                      <p className="text-2xl font-bold text-purple-900">
                        {allAgents.filter(agent => agent.mode === 'adhoc' || agent.mode === 'write').length}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Agents List */}
            {loading ? (
              <div className="text-center py-12">
                <RefreshCw className="h-8 w-8 animate-spin mx-auto text-gray-400 mb-4" />
                <p className="text-gray-500">Loading AI agents...</p>
              </div>
            ) : allAgents.length === 0 ? (
              <div className="text-center py-12">
                <Bot className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-500 text-lg">No AI agents created yet</p>
                <p className="text-gray-400 text-sm mt-2">Create your first AI agent to get started</p>
                <a
                  href="/ai-agent-config"
                  className="inline-flex items-center mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create AI Agent
                </a>
              </div>
            ) : (
              <div className="space-y-4">
                {agents.map((agent) => {
                  const ModeIcon = getModeIcon(agent.mode);
                  
                  return (
                    <div key={agent.id} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                      <div className="p-6">
                        {/* Agent Header */}
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center space-x-3">
                                <ModeIcon 
                                  className="h-6 w-6" 
                                  style={{ color: getModeColor(agent.mode) }} 
                                />
                                <div className="flex flex-col">
                                  <h3 className="text-lg font-semibold text-gray-900">
                                    {agent.agent_name || agent.name || `${getModeLabel(agent.mode, agent.agent_type, agent.selected_holidays)} Agent`}
                                  </h3>
                                  <div className="flex items-center space-x-2 mt-1">
                                    <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                                      agent.mode === 'auto' 
                                        ? 'bg-blue-100 text-blue-700' 
                                        : agent.mode === 'adhoc' 
                                        ? 'bg-orange-100 text-orange-700'
                                        : 'bg-purple-100 text-purple-700'
                                    }`}>
                                      {getModeLabel(agent.mode, agent.agent_type, agent.selected_holidays)} Agent
                                    </span>
                                    <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                                      agent.agent_type === 'time_sheet' ? 'bg-purple-100 text-purple-700' : 'bg-teal-100 text-teal-700'
                                    }`}>
                                      {agent.agent_type === 'time_sheet' ? 'Time Sheet' : 
                                       agent.agent_type === 'email' || agent.agent_type === 'email_agent' ? 'Email' : 
                                       agent.agent_type === 'sms_agent' ? 'SMS' :
                                       'Social Media'}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <span 
                                className={`inline-flex items-center px-3 py-1 rounded text-xs font-medium ${
                                  agent.is_active 
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-gray-100 text-gray-800'
                                }`}
                              >
                                {agent.is_active ? 'Active' : 'Paused'}
                              </span>
                            </div>
                            

                          </div>
                          

                        </div>

                        {/* Agent Details - Improved Layout */}
                        <div className="bg-gray-50 rounded-lg p-4 mb-4">
                          {agent.agent_type === 'time_sheet' ? (
                            // Timesheet Agent Display
                            <div className="space-y-4">
                              {/* Row 1: Runs Every and Workflow Mode */}
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="flex flex-col">
                                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Runs Every</span>
                                  <p className="text-sm text-gray-900 mt-1">{getRunsEveryLabel(agent)}</p>
                                </div>
                                <div className="flex flex-col">
                                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Workflow Mode</span>
                                  <p className="text-sm text-gray-900 mt-1">
                                    {getWorkflowMode(agent)}
                                  </p>
                                </div>
                              </div>

                              {/* Row 2: Selected Employees and Email Recipients */}
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="flex flex-col">
                                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Selected Employees</span>
                                  <div className="mt-1">
                                    {agent.selected_employees && agent.selected_employees.length > 0 ? (
                                      <div className="flex flex-wrap gap-2">
                                        {agent.selected_employees.slice(0, 3).map((employeeId, index) => (
                                          <span 
                                            key={index}
                                            className="text-sm text-gray-900"
                                          >
                                            {getEmployeeName(employeeId)}{index < Math.min(agent.selected_employees.length, 3) - 1 ? ',' : ''}
                                          </span>
                                        ))}
                                        {agent.selected_employees.length > 3 && (
                                          <span className="text-sm text-gray-600">
                                            and {agent.selected_employees.length - 3} more
                                          </span>
                                        )}
                                      </div>
                                    ) : (
                                      <span className="text-sm text-gray-600">All employees</span>
                                    )}
                                  </div>
                                </div>
                                <div className="flex flex-col">
                                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Email Recipients</span>
                                  <div className="mt-1">
                                    {agent.email_recipients && agent.email_recipients.length > 0 ? (
                                      <div className="flex flex-wrap gap-2">
                                        {agent.email_recipients.slice(0, 2).map((email, index) => (
                                          <span 
                                            key={index}
                                            className="text-sm text-gray-900"
                                          >
                                            {email}{index < Math.min(agent.email_recipients.length, 2) - 1 ? ',' : ''}
                                          </span>
                                        ))}
                                        {agent.email_recipients.length > 2 && (
                                          <span className="text-sm text-gray-600">
                                            and {agent.email_recipients.length - 2} more
                                          </span>
                                        )}
                                      </div>
                                    ) : (
                                      <span className="text-sm text-gray-600">No email recipients</span>
                                    )}
                                  </div>
                                </div>
                              </div>

                              {/* Pay Period & Next Run - Combined with Last Manual Run */}
                              {((agent.mode === 'auto' || agent.mode === 'recurring') && agent.agent_type === 'time_sheet') && (
                                <div className="flex flex-col pt-3 border-t border-gray-100">
                                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Pay Period & Next Run</span>
                                  <div className="mt-1 grid grid-cols-1 lg:grid-cols-2 gap-4">
                                    {/* Left Column: Pay Period Info */}
                                    <div className="p-3 bg-orange-50 border border-orange-200 rounded-md">
                                      {(() => {
                                        const periodInfo = calculatePayPeriodAndRunDate(agent);
                                        if (!periodInfo) return null;
                                        
                                        return (
                                          <div className="space-y-2">
                                            <div>
                                              <label className="text-xs font-semibold text-orange-700 uppercase tracking-wide">Current Pay Period</label>
                                              <p className="text-sm font-medium text-orange-900">
                                                {periodInfo.payPeriodRange}
                                              </p>
                                            </div>
                                            <div>
                                              <label className="text-xs font-semibold text-orange-700 uppercase tracking-wide">Next Run</label>
                                              <p className="text-sm font-medium text-orange-900">
                                                {periodInfo.nextRunDate}
                                              </p>
                                              <p className="text-xs text-orange-600 mt-1">
                                                Run {periodInfo.daysAfter} day(s) after pay period end
                                              </p>
                                            </div>
                                          </div>
                                        );
                                      })()}
                                    </div>
                                    
                                    {/* Right Column: Last Manual Run */}
                                    <div className="p-3 bg-gray-50 border border-gray-200 rounded-md">
                                      <div className="space-y-2">
                                        <div>
                                          <label className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Last Manual Run</label>
                                          <p className="text-sm font-medium text-gray-900">
                                            {agent.last_manual_run ? formatDate(agent.last_manual_run) : 'Never run manually'}
                                          </p>
                                        </div>
                                        <div>
                                          <label className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Run Status</label>
                                          <p className="text-sm font-medium text-gray-900">
                                            {agent.last_manual_run ? 'Completed' : 'Not run yet'}
                                          </p>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )}
                              
                              {/* Next Run & Last Run for Adhoc Timesheet Agents */}
                              {agent.mode === 'adhoc' && agent.agent_type === 'time_sheet' && (
                                <div className="pt-3 border-t border-gray-100">
                                  <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-lg p-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                      <div className="flex flex-col">
                                        <span className="text-xs font-semibold text-purple-700 uppercase tracking-wide">Next Run</span>
                                        <div className="mt-1">
                                          {agent.post_date && agent.post_time ? (
                                            // Agent has scheduled date/time - show formatted date with past date logic
                                            (() => {
                                              try {
                                                const date = new Date(agent.post_date);
                                                const [hours, minutes] = agent.post_time.split(':');
                                                date.setHours(parseInt(hours), parseInt(minutes), 0, 0);
                                                const now = new Date();
                                                
                                                const formattedDate = date.toLocaleDateString('en-US', {
                                                  weekday: 'short',
                                                  month: 'short',
                                                  day: 'numeric',
                                                  year: 'numeric'
                                                });
                                                
                                                if (date < now) {
                                                  // Past date - show suggestion message
                                                  return (
                                                    <div>
                                                      <p className="text-sm text-gray-500 line-through">
                                                        {formattedDate} at {formatTime(agent.post_time)}
                                                      </p>
                                                      <p className="text-xs text-amber-600 mt-1 italic">
                                                        Schedule your next run or run it adhoc when you need
                                                      </p>
                                                    </div>
                                                  );
                                                } else {
                                                  // Future date - show normally
                                                  return (
                                                    <p className="text-sm text-gray-900">
                                                      {formattedDate} at {formatTime(agent.post_time)}
                                                    </p>
                                                  );
                                                }
                                              } catch (error) {
                                                console.error('Error formatting date:', error);
                                                return (
                                                  <p className="text-sm text-gray-900">
                                                    {agent.post_date} at {formatTime(agent.post_time)}
                                                  </p>
                                                );
                                              }
                                            })()
                                          ) : (
                                            // No scheduled date/time - show manual options
                                            <p className="text-sm text-gray-900">Manual trigger only</p>
                                          )}
                                        </div>
                                      </div>
                                      <div className="flex flex-col">
                                        <span className="text-xs font-semibold text-purple-700 uppercase tracking-wide">Last Run</span>
                                        <p className="text-sm text-gray-900 mt-1">
                                          {(() => {
                                            // For write mode agents, prioritize actual manual run time over scheduled dates
                                            if (agent.last_manual_run) {
                                              return formatDate(agent.last_manual_run);
                                            }
                                            
                                            // If no manual run time, check if there's a scheduled date in the past as fallback
                                            if (agent.post_date && agent.post_time) {
                                              try {
                                                const scheduledDate = new Date(agent.post_date);
                                                const [hours, minutes] = agent.post_time.split(':');
                                                scheduledDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
                                                const now = new Date();
                                                
                                                if (scheduledDate < now) {
                                                  // Past scheduled date - show as fallback
                                                  const formattedDate = scheduledDate.toLocaleDateString('en-US', {
                                                    weekday: 'short',
                                                    month: 'short',
                                                    day: 'numeric',
                                                    year: 'numeric'
                                                  });
                                                  return `${formattedDate} at ${formatTime(agent.post_time)}`;
                                                }
                                              } catch (error) {
                                                console.error('Error parsing scheduled date:', error);
                                              }
                                            }
                                            
                                            // Final fallback
                                            return agent.last_manual_run ? formatDate(agent.last_manual_run) : 'Never run';
                                          })()}
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          ) : (
                            // Email, SMS vs Social Media Agent Display
                            <>
                              {agent.agent_type === 'email' ? (
                                // Email Agent Display (scheduled and recurring modes)
                                (agent.mode === 'auto' || agent.mode === 'recurring') && (
                                  <div className="space-y-4">
                                    {/* Row 1: Email Recipients/Topic and Image Option */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                      <div className="flex flex-col">
                                        {agent.mode === 'recurring' && agent.selected_holidays && agent.selected_holidays.length > 0 ? (
                                          // Holiday-based email agent (scheduled mode)
                                          <>
                                            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Email Will Be Sent To</span>
                                            <p className="text-sm text-gray-900 mt-1">All customers in database</p>
                                          </>
                                        ) : agent.mode === 'recurring' ? (
                                          // Topic-based recurring email agent
                                          <>
                                            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Topic</span>
                                            <p className="text-sm text-gray-900 mt-1">{agent.topic || 'No topic specified'}</p>
                                          </>
                                        ) : (
                                          // Other email modes
                                          <>
                                            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Email Will Be Sent To</span>
                                            <p className="text-sm text-gray-900 mt-1">All customers in database</p>
                                          </>
                                        )}
                                      </div>
                                      <div className="flex flex-col">
                                        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Image Option</span>
                                        <p className="text-sm text-gray-900 mt-1 capitalize">{formatImageOption(agent)}</p>
                                      </div>
                                    </div>
                                    
                                    {/* Row 2: Workflow Mode and Schedule Info */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                      <div className="flex flex-col">
                                        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Workflow Mode</span>
                                        <p className="text-sm text-gray-900 mt-1">
                                          {getWorkflowMode(agent)}
                                        </p>
                                      </div>
                                      <div className="flex flex-col">
                                        {agent.mode === 'recurring' ? (
                                          <>
                                            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Use ChatGPT to create Email</span>
                                            <p className="text-sm text-gray-900 mt-1">Yes</p>
                                          </>
                                        ) : (
                                          <>
                                            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Email Type</span>
                                            <p className="text-sm text-gray-900 mt-1">Holiday-based</p>
                                          </>
                                        )}
                                      </div>
                                    </div>
                                    
                                    {/* Row 3: Next Scheduled Run and Last Manual Run for Holiday-based Email agents */}
                                    {agent.selected_holidays && agent.selected_holidays.length > 0 && (
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {/* Next Scheduled Run - Left Column */}
                                        <div className="flex flex-col p-4 bg-blue-50 rounded-lg border border-blue-200">
                                          <span className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-2">
                                            🗓️ Next Scheduled Run
                                          </span>
                                          <div className="space-y-1">
                                            <p className="text-sm font-medium text-blue-900">
                                              {(() => {
                                                const holidayInfo = getNextScheduledHoliday(agent);
                                                return holidayInfo.holidayName || 'Next Holiday';
                                              })()}
                                            </p>
                                            <p className="text-sm text-blue-800">
                                              {(() => {
                                                const holidayInfo = getNextScheduledHoliday(agent);
                                                return holidayInfo.nextRun;
                                              })()}
                                            </p>
                                          </div>
                                        </div>
                                        
                                        {/* Last Manual Run - Right Column */}
                                        <div className="flex flex-col p-4 bg-gray-50 rounded-lg border border-gray-200">
                                          <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">
                                            📝 Last Manual Run
                                          </span>
                                          <p className="text-sm text-gray-900">
                                            {agent.last_manual_run ? 
                                              new Date(agent.last_manual_run).toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                month: 'short',
                                                day: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                              }) : 
                                              'Never run manually'
                                            }
                                          </p>
                                        </div>
                                      </div>
                                    )}
                                    
                                    {/* Row 3: Next Run and Last Run for Topic-based Recurring Email agents */}
                                    {agent.mode === 'recurring' && (!agent.selected_holidays || agent.selected_holidays.length === 0) && (
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {/* Next Scheduled Run - Left Column */}
                                        <div className="flex flex-col p-4 bg-green-50 rounded-lg border border-green-200">
                                          <span className="text-xs font-semibold text-green-600 uppercase tracking-wide mb-2">
                                            📅 Next Scheduled Run
                                          </span>
                                          <div className="space-y-1">
                                            <p className="text-sm font-medium text-green-900">
                                              {(() => {
                                                const runInfo = calculateNextRunForRecurringAgent(agent);
                                                return runInfo ? runInfo.nextRunDate : 'Not scheduled';
                                              })()}
                                            </p>
                                            {(() => {
                                              const runInfo = calculateNextRunForRecurringAgent(agent);
                                              return runInfo && runInfo.selectedDays ? (
                                                <p className="text-xs text-green-600">
                                                  {runInfo.selectedDays} at {agent.post_time || '09:00'}
                                                </p>
                                              ) : null;
                                            })()}
                                          </div>
                                        </div>
                                        
                                        {/* Last Manual Run - Right Column */}
                                        <div className="flex flex-col p-4 bg-gray-50 rounded-lg border border-gray-200">
                                          <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">
                                            📝 Last Manual Run
                                          </span>
                                          <p className="text-sm text-gray-900">
                                            {agent.last_manual_run ? 
                                              new Date(agent.last_manual_run).toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                month: 'short',
                                                day: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                              }) : 
                                              'Never run manually'
                                            }
                                          </p>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                )
                              ) : agent.agent_type === 'sms_agent' ? (
                                // SMS Agent Display (scheduled and recurring modes)
                                (agent.mode === 'auto' || agent.mode === 'recurring') && (
                                  <div className="space-y-4">
                                    {/* Row 1: SMS Recipients/Topic and Workflow Mode */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                      <div className="flex flex-col">
                                        {agent.selected_holidays && agent.selected_holidays.length > 0 ? (
                                          // Holiday-based SMS agent (scheduled mode)
                                          <>
                                            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">SMS Will Be Sent To</span>
                                            <p className="text-sm text-gray-900 mt-1">All customers in database</p>
                                          </>
                                        ) : (
                                          // Topic-based recurring SMS agent
                                          <>
                                            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Topic</span>
                                            <p className="text-sm text-gray-900 mt-1">{agent.topic || 'No topic specified'}</p>
                                          </>
                                        )}
                                      </div>
                                      <div className="flex flex-col">
                                        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Use ChatGPT to Format SMS</span>
                                        <p className="text-sm text-gray-900 mt-1">
                                          {(agent.use_sms_chatgpt_formatting || agent.useSMSChatGPTFormatting || agent.use_chatgpt_sms_formatting) ? 'Yes' : 'No'}
                                        </p>
                                      </div>
                                    </div>
                                    
                                    {/* Row 2: Workflow Mode and Link */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                      <div className="flex flex-col">
                                        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Workflow Mode</span>
                                        <p className="text-sm text-gray-900 mt-1">
                                          {getWorkflowMode(agent)}
                                        </p>
                                      </div>
                                      <div className="flex flex-col">
                                        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Link</span>
                                        <p className="text-sm text-gray-900 mt-1">
                                          {agent.sms_link || 'No Link Provided'}
                                        </p>
                                      </div>
                                    </div>

                                    {/* Row 3: Next Scheduled Run and Last Manual Run for Holiday-based SMS agents */}
                                    {agent.selected_holidays && agent.selected_holidays.length > 0 && (
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {/* Next Scheduled Run - Left Column */}
                                        <div className="flex flex-col p-4 bg-blue-50 rounded-lg border border-blue-200">
                                          <span className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-2">
                                            🗓️ Next Scheduled Run
                                          </span>
                                          <div className="space-y-1">
                                            <p className="text-sm font-medium text-blue-900">
                                              {(() => {
                                                const holidayInfo = getNextScheduledHoliday(agent);
                                                return holidayInfo.holidayName || 'Next Holiday';
                                              })()}
                                            </p>
                                            <p className="text-sm text-blue-800">
                                              {(() => {
                                                const holidayInfo = getNextScheduledHoliday(agent);
                                                return holidayInfo.nextRun;
                                              })()}
                                            </p>
                                          </div>
                                        </div>
                                        
                                        {/* Last Manual Run - Right Column */}
                                        <div className="flex flex-col p-4 bg-gray-50 rounded-lg border border-gray-200">
                                          <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">
                                            📝 Last Manual Run
                                          </span>
                                          <p className="text-sm text-gray-900">
                                            {agent.last_manual_run ? 
                                              new Date(agent.last_manual_run).toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                month: 'short',
                                                day: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                              }) : 
                                              'Never run manually'
                                            }
                                          </p>
                                        </div>
                                      </div>
                                    )}

                                    {/* Row 3: Next Run and Last Run for Topic-based Recurring SMS agents */}
                                    {(!agent.selected_holidays || agent.selected_holidays.length === 0) && (
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {/* Next Scheduled Run - Left Column */}
                                        <div className="flex flex-col p-4 bg-purple-50 rounded-lg border border-purple-200">
                                          <span className="text-xs font-semibold text-purple-600 uppercase tracking-wide mb-2">
                                            📅 Next Scheduled Run
                                          </span>
                                          <div className="space-y-1">
                                            <p className="text-sm font-medium text-purple-900">
                                              {(() => {
                                                const runInfo = calculateNextRunForRecurringAgent(agent);
                                                return runInfo ? runInfo.nextRunDate : 'Not scheduled';
                                              })()}
                                            </p>
                                            {(() => {
                                              const runInfo = calculateNextRunForRecurringAgent(agent);
                                              return runInfo && runInfo.selectedDays ? (
                                                <p className="text-xs text-purple-600">
                                                  {runInfo.selectedDays} at {agent.post_time || '09:00'}
                                                </p>
                                              ) : null;
                                            })()}
                                          </div>
                                        </div>
                                        
                                        {/* Last Manual Run - Right Column */}
                                        <div className="flex flex-col p-4 bg-gray-50 rounded-lg border border-gray-200">
                                          <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">
                                            📝 Last Manual Run
                                          </span>
                                          <p className="text-sm text-gray-900">
                                            {agent.last_manual_run ? 
                                              new Date(agent.last_manual_run).toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                month: 'short',
                                                day: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                              }) : 
                                              'Never run manually'
                                            }
                                          </p>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                )
                              ) : (
                                // Social Media Agent Display (original logic)
                                (agent.mode === 'auto' || agent.mode === 'recurring') && (
                                  <div className="space-y-4">
                                    {/* Row 1: Topic and Image Option */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                      <div className="flex flex-col">
                                        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Topic</span>
                                        <p className="text-sm text-gray-900 mt-1">{agent.topic}</p>
                                      </div>
                                      <div className="flex flex-col">
                                        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Image Option</span>
                                        <p className="text-sm text-gray-900 mt-1 capitalize">{formatImageOption(agent)}</p>
                                      </div>
                                    </div>
                                    
                                    {/* Row 2: Workflow Mode and Social Media Platforms */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                      <div className="flex flex-col">
                                        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Workflow Mode</span>
                                        <p className="text-sm text-gray-900 mt-1">
                                          {getWorkflowMode(agent)}
                                        </p>
                                      </div>
                                      <div className="flex flex-col">
                                        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Social Media Platforms</span>
                                        <p className="text-sm text-gray-900 mt-1">
                                          {getEnabledPlatforms(agent.social_platforms).length > 0 ? (
                                            getEnabledPlatforms(agent.social_platforms)
                                              .map(platform => platform === 'twitter' ? 'X (Twitter)' : platform.charAt(0).toUpperCase() + platform.slice(1))
                                              .join(', ')
                                          ) : (
                                            'None selected'
                                          )}
                                        </p>
                                      </div>
                                    </div>
                                    
                                    {/* Row 3: Next Run and Last Run for Social Media Recurring Agents */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                      {/* Next Scheduled Run - Left Column */}
                                      <div className="flex flex-col p-4 bg-purple-50 rounded-lg border border-purple-200">
                                        <span className="text-xs font-semibold text-purple-600 uppercase tracking-wide mb-2">
                                          📅 Next Scheduled Run
                                        </span>
                                        <div className="space-y-1">
                                          <p className="text-sm font-medium text-purple-900">
                                            {(() => {
                                              const runInfo = calculateNextRunForRecurringAgent(agent);
                                              return runInfo ? runInfo.nextRunDate : 'Not scheduled';
                                            })()}
                                          </p>
                                          {(() => {
                                            const runInfo = calculateNextRunForRecurringAgent(agent);
                                            return runInfo && runInfo.selectedDays ? (
                                              <p className="text-xs text-purple-600">
                                                {runInfo.selectedDays} at {agent.post_time || '09:00'}
                                              </p>
                                            ) : null;
                                          })()}
                                        </div>
                                      </div>
                                      
                                      {/* Last Manual Run - Right Column */}
                                      <div className="flex flex-col p-4 bg-gray-50 rounded-lg border border-gray-200">
                                        <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">
                                          📝 Last Manual Run
                                        </span>
                                        <p className="text-sm text-gray-900">
                                          {agent.last_manual_run ? 
                                            new Date(agent.last_manual_run).toLocaleDateString('en-US', {
                                              year: 'numeric',
                                              month: 'short',
                                              day: 'numeric',
                                              hour: '2-digit',
                                              minute: '2-digit'
                                            }) : 
                                            'Never run manually'
                                          }
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                )
                              )}
                          
                              {agent.mode === 'adhoc' && (
                                agent.agent_type === 'email' ? (
                                  // Email Agent Adhoc Display
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Left Column */}
                                    <div className="space-y-3">
                                      <div className="flex flex-col">
                                        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Email</span>
                                        <p className="text-sm text-gray-900 mt-1">Opt In Customers</p>
                                      </div>

                                      <div className="flex flex-col">
                                        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Image Option</span>
                                        <p className="text-sm text-gray-900 mt-1 capitalize">{formatImageOption(agent)}</p>
                                      </div>
                                    </div>
                                    
                                    {/* Right Column */}
                                    <div className="space-y-3">
                                      <div className="flex flex-col">
                                        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Use ChatGPT to Format Email</span>
                                        <p className="text-sm text-gray-900 mt-1">
                                          {formatChatGPTStatus(agent)}
                                        </p>
                                      </div>
                                      <div className="flex flex-col">
                                        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Word Count</span>
                                        <p className="text-sm text-gray-900 mt-1">{agent.word_count || 'Not specified'}</p>
                                      </div>
                                    </div>
                                  </div>
                                ) : agent.agent_type === 'sms_agent' ? (
                                  // SMS Agent Adhoc Display - Custom Post Mode
                                  <div className="space-y-4">
                                    {/* Row 1: SMS Recipients and Link */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                      <div className="flex flex-col">
                                        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">SMS Recipients</span>
                                        <p className="text-sm text-gray-900 mt-1">
                                          {agent.recipient_type === 'single' ? 
                                            `Single Customer: ${agent.customer_name || 'Selected Customer'}` : 
                                            'All customers in database'
                                          }
                                        </p>
                                      </div>
                                      <div className="flex flex-col">
                                        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Link</span>
                                        <p className="text-sm text-gray-900 mt-1">
                                          {agent.sms_link || 'No Link Provided'}
                                        </p>
                                      </div>
                                    </div>

                                    {/* Row 2: Workflow Mode and Use ChatGPT */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                      <div className="flex flex-col">
                                        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Workflow Mode</span>
                                        <p className="text-sm text-gray-900 mt-1">
                                          {getWorkflowMode(agent)}
                                        </p>
                                      </div>
                                      <div className="flex flex-col">
                                        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Use ChatGPT to Format SMS</span>
                                        <p className="text-sm text-gray-900 mt-1">
                                          {(agent.use_sms_chatgpt_formatting || agent.useSMSChatGPTFormatting || agent.use_chatgpt_sms_formatting) ? 'Yes' : 'No'}
                                        </p>
                                      </div>
                                    </div>

                                    {/* Row 3: SMS Content Template */}
                                    {agent.sms_content && (
                                      <div className="grid grid-cols-1 gap-4">
                                        <div className="flex flex-col">
                                          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">SMS Content Template</span>
                                          <div className="mt-1 bg-orange-50 border border-orange-200 rounded p-3">
                                            <p className="text-sm text-gray-900 whitespace-pre-wrap">{agent.sms_content}</p>
                                            <div className="mt-2 text-xs text-orange-600">
                                              Character count: {agent.sms_content.length} / 160
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                ) : (
                                  // Social Media Agent Adhoc Display
                                  <div className="space-y-4">
                                    {/* Row 1: Topic and Workflow Mode */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                      <div className="flex flex-col">
                                        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Topic</span>
                                        <p className="text-sm text-gray-900 mt-1">{agent.topic}</p>
                                      </div>
                                      <div className="flex flex-col">
                                        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Workflow Mode</span>
                                        <p className="text-sm text-gray-900 mt-1">
                                          {getWorkflowMode(agent)}
                                        </p>
                                      </div>
                                    </div>

                                    {/* Row 2: Image Option and Use ChatGPT for Creating Post */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                      <div className="flex flex-col">
                                        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Image Option</span>
                                        <p className="text-sm text-gray-900 mt-1 capitalize">{formatImageOption(agent)}</p>
                                      </div>
                                      <div className="flex flex-col">
                                        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Use ChatGPT for Creating Post</span>
                                        <p className="text-sm text-gray-900 mt-1">Yes</p>
                                      </div>
                                    </div>

                                    {/* Next Run & Last Run for Adhoc Agents */}
                                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4">
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="flex flex-col">
                                          <span className="text-xs font-semibold text-green-700 uppercase tracking-wide">Next Run</span>
                                          <div className="mt-1">
                                            {agent.post_date && agent.post_time ? (
                                              // Agent has scheduled date/time - show formatted date with past date logic
                                              (() => {
                                                try {
                                                  const date = new Date(agent.post_date);
                                                  const [hours, minutes] = agent.post_time.split(':');
                                                  date.setHours(parseInt(hours), parseInt(minutes), 0, 0);
                                                  const now = new Date();
                                                  
                                                  const formattedDate = date.toLocaleDateString('en-US', {
                                                    weekday: 'short',
                                                    month: 'short',
                                                    day: 'numeric',
                                                    year: 'numeric'
                                                  });
                                                  
                                                  if (date < now) {
                                                    // Past date - show suggestion message
                                                    return (
                                                      <div>
                                                        <p className="text-sm text-gray-500 line-through">
                                                          {formattedDate} at {formatTime(agent.post_time)}
                                                        </p>
                                                        <p className="text-xs text-amber-600 mt-1 italic">
                                                          Schedule your next run or run it adhoc when you need
                                                        </p>
                                                      </div>
                                                    );
                                                  } else {
                                                    // Future date - show normally
                                                    return (
                                                      <p className="text-sm text-gray-900">
                                                        {formattedDate} at {formatTime(agent.post_time)}
                                                      </p>
                                                    );
                                                  }
                                                } catch (error) {
                                                  console.error('Error formatting date:', error);
                                                  return (
                                                    <p className="text-sm text-gray-900">
                                                      {agent.post_date} at {formatTime(agent.post_time)}
                                                    </p>
                                                  );
                                                }
                                              })()
                                            ) : (
                                              // No scheduled date/time - show manual options
                                              <div>
                                                {isReadyForNextPost(agent) ? (
                                                  <div>
                                                    <span className="text-sm text-green-700 font-medium">Ready for Next Post</span>
                                                    <p className="text-xs text-green-600 mt-1 italic">
                                                      Ready to create your next post. Click 'Run Agent' to generate new content.
                                                    </p>
                                                  </div>
                                                ) : (
                                                  <p className="text-sm text-gray-900">Manual trigger only</p>
                                                )}
                                              </div>
                                            )}
                                          </div>
                                        </div>
                                        <div className="flex flex-col">
                                          <span className="text-xs font-semibold text-green-700 uppercase tracking-wide">Last Run</span>
                                          <p className="text-sm text-gray-900 mt-1">
                                            {(() => {
                                              // For adhoc agents, prioritize actual manual run time over scheduled dates
                                              if (agent.last_manual_run) {
                                                return formatDate(agent.last_manual_run);
                                              }
                                              
                                              // If no manual run time, check if there's a scheduled date in the past as fallback
                                              if (agent.post_date && agent.post_time) {
                                                try {
                                                  const scheduledDate = new Date(agent.post_date);
                                                  const [hours, minutes] = agent.post_time.split(':');
                                                  scheduledDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
                                                  const now = new Date();
                                                  
                                                  if (scheduledDate < now) {
                                                    // Past scheduled date - show as fallback
                                                    const formattedDate = scheduledDate.toLocaleDateString('en-US', {
                                                      weekday: 'short',
                                                      month: 'short',
                                                      day: 'numeric',
                                                      year: 'numeric'
                                                    });
                                                    return `${formattedDate} at ${formatTime(agent.post_time)}`;
                                                  }
                                                } catch (error) {
                                                  console.error('Error parsing scheduled date:', error);
                                                }
                                              }
                                              
                                              // Final fallback
                                              return agent.last_manual_run ? formatDate(agent.last_manual_run) : 'Never run';
                                            })()}
                                          </p>
                                        </div>
                                      </div>
                                    </div>

                                    {/* Social Media Platforms */}
                                    <div className="flex flex-col pt-3 border-t border-gray-100">
                                      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Social Media Platforms</span>
                                      <p className="text-sm text-gray-900 mt-1">
                                        {getEnabledPlatforms(agent.social_platforms).length > 0 ? (
                                          getEnabledPlatforms(agent.social_platforms)
                                            .map(platform => platform === 'twitter' ? 'X (Twitter)' : platform.charAt(0).toUpperCase() + platform.slice(1))
                                            .join(', ')
                                        ) : (
                                          'None selected'
                                        )}
                                      </p>
                                    </div>
                                  </div>
                                )
                              )}
                          
                          {agent.mode === 'write' && (
                            <div className="space-y-4">
                              {/* Row 1: Email Subject and Use ChatGPT Formatting for Email Agents */}
                              {agent.agent_type === 'email' && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div className="flex flex-col">
                                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Email Subject</span>
                                    <p className="text-sm text-gray-900 mt-1 font-medium">
                                      {agent.email_subject || 'No subject specified'}
                                    </p>
                                  </div>
                                  <div className="flex flex-col">
                                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Use ChatGPT to Format Email</span>
                                    <p className="text-sm text-gray-900 mt-1">
                                      {agent.use_chatgpt_formatting ? 'Yes' : 'No'}
                                    </p>
                                  </div>
                                </div>
                              )}
                              
                              {/* Row 1: Post Title and Workflow Mode for Social Media Agents */}
                              {agent.agent_type !== 'email' && agent.agent_type !== 'time_sheet' && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div className="flex flex-col">
                                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Post Title</span>
                                    <p className="text-sm text-gray-900 mt-1 font-medium">
                                      {agent.post_title || 'No title specified'}
                                    </p>
                                  </div>
                                  <div className="flex flex-col">
                                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Workflow Mode</span>
                                    <p className="text-sm text-gray-900 mt-1">
                                      {getWorkflowMode(agent)}
                                    </p>
                                  </div>
                                </div>
                              )}
                              
                              {/* Row 2: Email Recipients and Workflow Mode for Email Agents */}
                              {agent.agent_type === 'email' && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div className="flex flex-col">
                                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Email Recipients</span>
                                    <p className="text-sm text-gray-900 mt-1 capitalize">
                                      {agent.email_type === 'single' ? 'Single Customer' : 'Bulk Customer Emails'}
                                    </p>
                                  </div>
                                  <div className="flex flex-col">
                                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Workflow Mode</span>
                                    <p className="text-sm text-gray-900 mt-1">
                                      {getWorkflowMode(agent)}
                                    </p>
                                  </div>
                                </div>
                              )}
                              
                              {/* Content Preview - Full Width */}
                              <div className="flex flex-col">
                                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Content Preview</span>
                                <div className="mt-2 p-3 bg-white rounded-md border border-gray-200">
                                  <p className="text-sm text-gray-900 line-clamp-3">
                                    {agent.agent_type === 'email' ? agent.email_content : agent.post_content}
                                  </p>
                                </div>
                              </div>
                              
                              {/* Web Research and ChatGPT Formatting for Social Media Agents */}
                              {agent.agent_type !== 'email' && agent.agent_type !== 'time_sheet' && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div className="flex flex-col">
                                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Use Web Research</span>
                                    <p className="text-sm text-gray-900 mt-1">
                                      {agent.use_web_research ? 'Yes' : 'No'}
                                    </p>
                                  </div>
                                  <div className="flex flex-col">
                                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Use ChatGPT for formatting</span>
                                    <p className="text-sm text-gray-900 mt-1">
                                      {agent.use_chatgpt_formatting ? 'Yes' : 'No'}
                                    </p>
                                  </div>
                                </div>
                              )}
                              
                              {/* Next Run & Last Run for Scheduled Write Mode Agents */}
                              {agent.post_date && agent.post_time && (
                                <div className="space-y-4">
                                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="flex flex-col">
                                      <span className="text-xs font-semibold text-blue-700 uppercase tracking-wide">Next Run</span>
                                      <div className="mt-1">
                                        {(() => {
                                          try {
                                            const date = new Date(agent.post_date);
                                            const [hours, minutes] = agent.post_time.split(':');
                                            date.setHours(parseInt(hours), parseInt(minutes), 0, 0);
                                            const now = new Date();
                                            
                                            const formattedDate = date.toLocaleDateString('en-US', {
                                              weekday: 'short',
                                              month: 'short',
                                              day: 'numeric',
                                              year: 'numeric'
                                            });
                                            
                                            if (date < now) {
                                              // Past date - show suggestion message
                                              return (
                                                <div>
                                                  <p className="text-sm text-gray-500 line-through">
                                                    {formattedDate} at {formatTime(agent.post_time)}
                                                  </p>
                                                  <p className="text-xs text-amber-600 mt-1 italic">
                                                    Schedule your next run or run it adhoc when you need
                                                  </p>
                                                </div>
                                              );
                                            } else {
                                              // Future date - show normally
                                              return (
                                                <p className="text-sm text-gray-900">
                                                  {formattedDate} at {formatTime(agent.post_time)}
                                                </p>
                                              );
                                            }
                                          } catch (error) {
                                            console.error('Error formatting date:', error);
                                            return (
                                              <p className="text-sm text-gray-900">
                                                {agent.post_date} at {formatTime(agent.post_time)}
                                              </p>
                                            );
                                          }
                                        })()}
                                      </div>
                                    </div>
                                    <div className="flex flex-col">
                                      <span className="text-xs font-semibold text-blue-700 uppercase tracking-wide">Last Run</span>
                                      <p className="text-sm text-gray-900 mt-1">
                                        {(() => {
                                          // For adhoc agents, prioritize actual manual run time over scheduled dates
                                          if (agent.last_manual_run) {
                                            return formatDate(agent.last_manual_run);
                                          }
                                          
                                          // If no manual run time, check if there's a scheduled date in the past as fallback
                                          if (agent.post_date && agent.post_time) {
                                            try {
                                              const scheduledDate = new Date(agent.post_date);
                                              const [hours, minutes] = agent.post_time.split(':');
                                              scheduledDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
                                              const now = new Date();
                                              
                                              if (scheduledDate < now) {
                                                // Past scheduled date - show as fallback
                                                const formattedDate = scheduledDate.toLocaleDateString('en-US', {
                                                  weekday: 'short',
                                                  month: 'short',
                                                  day: 'numeric',
                                                  year: 'numeric'
                                                });
                                                return `${formattedDate} at ${formatTime(agent.post_time)}`;
                                              }
                                            } catch (error) {
                                              console.error('Error parsing scheduled date:', error);
                                            }
                                          }
                                          
                                          // Final fallback
                                          return agent.last_manual_run ? formatDate(agent.last_manual_run) : 'Never run';
                                        })()}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              )}
                              
                              {/* Social Media Platforms - Only for Social Media Write Mode Agents */}
                              {agent.agent_type !== 'email' && agent.agent_type !== 'time_sheet' && (
                                <div className="flex flex-col pt-3 border-t border-gray-100">
                                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Social Media Platforms</span>
                                  <p className="text-sm text-gray-900 mt-1">
                                    {getEnabledPlatforms(agent.social_platforms).length > 0 ? (
                                      getEnabledPlatforms(agent.social_platforms)
                                        .map(platform => platform === 'twitter' ? 'X (Twitter)' : platform.charAt(0).toUpperCase() + platform.slice(1))
                                        .join(', ')
                                    ) : (
                                      'None selected'
                                    )}
                                  </p>
                                </div>
                              )}
                              
                              {/* Last Manual Run - Only for Email Write Agents without scheduled date/time */}
                              {agent.agent_type === 'email' && (!agent.post_date || !agent.post_time) && (
                                <div className="bg-gradient-to-r from-gray-50 to-slate-50 border border-gray-200 rounded-lg p-4">
                                  <div className="flex flex-col">
                                    <span className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Last Manual Run</span>
                                    <p className="text-sm text-gray-900 mt-1">
                                      {agent.last_manual_run ? formatDate(agent.last_manual_run) : 'Never run manually'}
                                    </p>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                          
                            </>
                          )}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
                          <button
                            onClick={() => setSelectedAgent(agent)}
                            className="flex items-center px-3 py-2 text-blue-600 border border-blue-300 rounded-lg hover:bg-blue-50 transition-colors text-sm font-medium"
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </button>
                          
                          <button
                            onClick={() => handleEditAgent(agent)}
                            className="flex items-center px-3 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                          >
                            <Edit2 className="h-4 w-4 mr-1" />
                            Edit
                          </button>

                          {agent.is_active && (
                            <button
                              onClick={() => handleRunAgent(agent)}
                              className="flex items-center px-3 py-2 text-green-600 border border-green-300 rounded-lg hover:bg-green-50 transition-colors text-sm font-medium"
                            >
                              <Play className="h-4 w-4 mr-1" />
                              Run Agent
                            </button>
                          )}

                          <button
                            onClick={() => toggleAgentStatus(agent.id, agent.is_active)}
                            disabled={processingAgent === agent.id}
                            className={`flex items-center px-3 py-2 border rounded-lg transition-colors text-sm font-medium ${
                              agent.is_active
                                ? 'text-orange-600 border-orange-300 hover:bg-orange-50'
                                : 'text-green-600 border-green-300 hover:bg-green-50'
                            }`}
                          >
                            {processingAgent === agent.id ? (
                              <RefreshCw className="h-4 w-4 mr-1 animate-spin" />
                            ) : agent.is_active ? (
                              <Pause className="h-4 w-4 mr-1" />
                            ) : (
                              <Play className="h-4 w-4 mr-1" />
                            )}
                            {agent.is_active ? 'Pause' : 'Activate'}
                          </button>

                          <button
                            onClick={() => openDeleteModal(agent)}
                            disabled={processingAgent === agent.id}
                            className="flex items-center px-3 py-2 text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition-colors text-sm font-medium"
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Agent Type Selection Modal */}
      {showAgentTypeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] flex flex-col">
            {/* Sticky Header */}
            <div className="px-6 py-4 border-b border-gray-200 flex-shrink-0" style={{ backgroundColor: '#29add3' }}>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-white">Select Agent Type</h3>
                <button
                  onClick={() => setShowAgentTypeModal(false)}
                  className="text-white hover:text-gray-200 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
            
            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <p className="text-sm text-gray-600 mb-6">
                Choose the type of AI agent you want to create:
              </p>
              
              <div className="space-y-3">
                {agentTypes.map((type) => (
                  <button
                    key={type.value}
                    onClick={() => handleAgentTypeSelect(type)}
                    className="w-full text-left p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors group"
                  >
                    <div className="flex items-start">
                      <div className="flex-shrink-0 mr-3 mt-1">
                        {type.value === 'social_media' ? (
                          <Share2 className="h-5 w-5 text-blue-600" />
                        ) : (
                          <Clock className="h-5 w-5 text-purple-600" />
                        )}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 group-hover:text-blue-700">
                          {type.label}
                        </h4>
                        <p className="text-sm text-gray-600 mt-1">
                          {type.description}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
            
            {/* Sticky Footer */}
            <div className="px-6 py-4 border-t border-gray-200 flex-shrink-0" style={{ backgroundColor: '#f8fafc' }}>
              <div className="flex justify-end">
                <button
                  onClick={() => setShowAgentTypeModal(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Agent Details Modal - User Friendly Display */}
      {selectedAgent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-2xl max-w-5xl w-full max-h-[90vh] flex flex-col">
            {/* Sticky Header */}
            <div className="px-6 py-4 border-b border-gray-200 rounded-t-lg" style={{ backgroundColor: '#29add3' }}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-lg bg-white bg-opacity-20">
                    {selectedAgent.agent_type === 'time_sheet' ? (
                      <Clock className="h-6 w-6 text-white" />
                    ) : (
                      <Share2 className="h-6 w-6 text-white" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white">
                      {selectedAgent.name || selectedAgent.agent_name || 'Unnamed Agent'}
                    </h3>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="inline-flex items-center px-3 py-1 rounded text-xs font-medium bg-white bg-opacity-20 text-white">
                        {selectedAgent.agent_type === 'time_sheet' ? 'Time Sheet Agent' : 
                         selectedAgent.agent_type === 'email' || selectedAgent.agent_type === 'email_agent' ? 'Email Agent' :
                         selectedAgent.agent_type === 'sms_agent' ? 'SMS Agent' :
                         selectedAgent.agent_type === 'marketing_agent' ? 'Marketing Agent' :
                         'Social Media Agent'}
                      </span>
                      <span className={`inline-flex items-center px-3 py-1 rounded text-xs font-medium ${
                        selectedAgent.is_active 
                          ? 'bg-green-500 bg-opacity-20 text-green-100' 
                          : 'bg-gray-500 bg-opacity-20 text-gray-100'
                      }`}>
                        {selectedAgent.is_active ? 'Active' : 'Paused'}
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedAgent(null)}
                  className="text-white hover:text-red-200 transition-colors p-1 rounded-full hover:bg-white hover:bg-opacity-20"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto px-6 py-6">
              
              {/* Agent Configuration Display */}
              <div className="space-y-6">
                
                {/* Conditional rendering based on agent type */}
                {selectedAgent.agent_type === 'time_sheet' ? (
                  // Timesheet Agent View
                  <>
                    {/* Basic Information */}
                    <section>
                      <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                        <Eye className="h-5 w-5 text-blue-600 mr-2" />
                        Basic Information
                      </h4>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          <div>
                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Agent Type</label>
                            <p className="text-sm text-gray-900 mt-1">Timesheet Agent</p>
                          </div>
                          <div>
                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Mode</label>
                            <p className="text-sm text-gray-900 mt-1">{getModeLabel(selectedAgent.mode, selectedAgent.agent_type, selectedAgent.selected_holidays)}</p>
                          </div>
                          <div>
                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</label>
                            <p className="text-sm text-gray-900 mt-1">
                              <span className={`inline-flex items-center px-3 py-1 rounded text-xs font-medium ${
                                selectedAgent.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                              }`}>
                                {selectedAgent.is_active ? 'Active' : 'Inactive'}
                              </span>
                            </p>
                          </div>
                        </div>
                      </div>
                    </section>

                    {/* Employee Selection */}
                    <section>
                      <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                        <Users className="h-5 w-5 text-purple-600 mr-2" />
                        Selected Employees
                      </h4>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="flex flex-wrap gap-2">
                          {selectedAgent.selected_employees && selectedAgent.selected_employees.length > 0 ? (
                            selectedAgent.selected_employees.map((employeeId, index) => (
                              <span 
                                key={index}
                                className="inline-flex items-center px-3 py-2 rounded text-sm font-medium bg-purple-100 text-purple-700 border border-purple-200"
                              >
                                {getEmployeeName(employeeId)}
                              </span>
                            ))
                          ) : (
                            <span className="text-sm text-gray-500">All employees selected</span>
                          )}
                        </div>
                      </div>
                    </section>

                    {/* Timesheet Configuration */}
                    <section>
                      <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                        <Calendar className="h-5 w-5 text-green-600 mr-2" />
                        Timesheet Configuration
                      </h4>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {selectedAgent.mode === 'recurring' && selectedAgent.run_every_pay_period && (
                            <div>
                              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Pay Period</label>
                              <p className="text-sm text-gray-900 mt-1 capitalize">
                                {selectedAgent.run_every_pay_period.replace('_', ' ')}
                              </p>
                            </div>
                          )}
                          {selectedAgent.mode === 'adhoc' && selectedAgent.report_period && (
                            <div>
                              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Report Period</label>
                              <p className="text-sm text-gray-900 mt-1 capitalize">
                                {selectedAgent.report_period.replace('_', ' ')}
                              </p>
                            </div>
                          )}
                          {selectedAgent.schedule_time && (
                            <div>
                              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Schedule Time</label>
                              <p className="text-sm text-gray-900 mt-1">{selectedAgent.schedule_time}</p>
                            </div>
                          )}
                          {selectedAgent.days_after_period_end && (
                            <div>
                              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Days After Period End</label>
                              <p className="text-sm text-gray-900 mt-1">{selectedAgent.days_after_period_end} days</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </section>

                    {/* Next Run Schedule for Recurring Agents */}
                    {selectedAgent.mode === 'recurring' && selectedAgent.is_active && (
                      <section>
                        <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                          <Clock className="h-5 w-5 text-orange-600 mr-2" />
                          Next Run Schedule
                          <button
                            onClick={() => {
                              fetchEmployees();
                              fetchPayPeriodSettings();
                              fetchTimesheetConfig().then(startDate => setOriginalStartDate(startDate));
                            }}
                            className="ml-2 px-2 py-1 text-xs bg-orange-100 text-orange-700 rounded hover:bg-orange-200 transition-colors"
                          >
                            Refresh Data
                          </button>
                        </h4>
                        <div className="bg-gradient-to-r from-orange-50 to-yellow-50 border border-orange-200 rounded-lg p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <label className="text-xs font-semibold text-orange-700 uppercase tracking-wide">Next Execution</label>
                              {(() => {
                                const periodInfo = calculatePayPeriodAndRunDate(selectedAgent);
                                if (!periodInfo) {
                                  return <p className="text-lg font-semibold text-orange-900 mt-1">Calculating...</p>;
                                }
                                
                                return (
                                  <div className="mt-1 space-y-1">
                                    <div>
                                      <p className="text-xs text-orange-600">Pay Period:</p>
                                      <p className="text-sm font-medium text-orange-800">{periodInfo.payPeriodRange}</p>
                                    </div>
                                    <div>
                                      <p className="text-xs text-orange-600">Next Run:</p>
                                      <p className="text-lg font-semibold text-orange-900">{periodInfo.nextRunDate}</p>
                                    </div>
                                  </div>
                                );
                              })()}
                              <p className="text-xs text-orange-600 mt-1">
                                Based on pay period end + {selectedAgent.days_after_period_end || 1} day(s)
                              </p>
                              <div className="text-xs text-orange-500 mt-2">
                                Debug: Employees loaded: {employees.length}, Foundation date: {originalStartDate || 'Not set'}
                              </div>
                            </div>
                            <div className="flex-shrink-0">
                              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                                <Clock className="h-6 w-6 text-orange-600" />
                              </div>
                            </div>
                          </div>
                        </div>
                      </section>
                    )}

                    {/* Report Features */}
                    <section>
                      <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                        <FileText className="h-5 w-5 text-indigo-600 mr-2" />
                        Report Features
                      </h4>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Include AI Summary</label>
                            <p className="text-sm text-gray-900 mt-1">
                              <span className={`inline-flex items-center px-3 py-1 rounded text-xs font-medium ${
                                selectedAgent.include_summary ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                              }`}>
                                {selectedAgent.include_summary ? 'Yes' : 'No'}
                              </span>
                            </p>
                          </div>
                          <div>
                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Include Billing Rates</label>
                            <p className="text-sm text-gray-900 mt-1">
                              <span className={`inline-flex items-center px-3 py-1 rounded text-xs font-medium ${
                                selectedAgent.include_billing_rates ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                              }`}>
                                {selectedAgent.include_billing_rates ? 'Yes' : 'No'}
                              </span>
                            </p>
                          </div>
                          <div>
                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Initial Status</label>
                            <p className="text-sm text-gray-900 mt-1 capitalize">
                              {selectedAgent.initial_status ? selectedAgent.initial_status.replace('_', ' ') : 'In Review'}
                            </p>
                          </div>
                          <div>
                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Auto Email</label>
                            <p className="text-sm text-gray-900 mt-1">
                              <span className={`inline-flex items-center px-3 py-1 rounded text-xs font-medium ${
                                selectedAgent.auto_email ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                              }`}>
                                {selectedAgent.auto_email ? 'Enabled' : 'Disabled'}
                              </span>
                            </p>
                          </div>
                        </div>
                      </div>
                    </section>

                    {/* Email Recipients */}
                    {selectedAgent.email_recipients && selectedAgent.email_recipients.length > 0 && (
                      <section>
                        <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                          <Mail className="h-5 w-5 text-red-600 mr-2" />
                          Email Recipients
                        </h4>
                        <div className="bg-gray-50 rounded-lg p-4">
                          <div className="flex flex-wrap gap-2">
                            {selectedAgent.email_recipients.map((email, index) => (
                              <span 
                                key={index}
                                className="inline-flex items-center px-3 py-2 rounded text-sm font-medium bg-red-100 text-red-700 border border-red-200"
                              >
                                {email}
                              </span>
                            ))}
                          </div>
                        </div>
                      </section>
                    )}
                  </>
                ) : (
                  // Social Media Agent View (existing content)
                  <>
                    {/* Basic Information */}
                    <section>
                      <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                        <Eye className="h-5 w-5 text-blue-600 mr-2" />
                        Basic Information
                      </h4>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          <div>
                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Mode</label>
                            <p className="text-sm text-gray-900 mt-1">{getModeLabel(selectedAgent.mode, selectedAgent.agent_type, selectedAgent.selected_holidays)}</p>
                          </div>
                          {selectedAgent.topic && (
                            <div>
                              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Topic</label>
                              <p className="text-sm text-gray-900 mt-1">{selectedAgent.topic}</p>
                            </div>
                          )}
                          {selectedAgent.word_count && (
                            <div>
                              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Word Count</label>
                              <p className="text-sm text-gray-900 mt-1">Less than {selectedAgent.word_count} words</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </section>

                    {/* Social Media Configuration or Email Recipients */}
                    <section>
                      <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                        <Share2 className="h-5 w-5 text-blue-600 mr-2" />
                        {selectedAgent.agent_type === 'email' ? 'Email Recipients' : 
                         selectedAgent.agent_type === 'sms_agent' ? 'SMS Recipients' : 
                         'Social Media Platforms'}
                      </h4>
                      <div className="bg-gray-50 rounded-lg p-4">
                        {selectedAgent.agent_type === 'email' ? (
                          <div className="flex flex-wrap gap-2">
                            <span className="inline-flex items-center px-3 py-2 rounded text-sm font-medium bg-purple-100 text-purple-700 border border-purple-200">
                              {selectedAgent.email_type === 'single' ? 'Single Customer' : 'Bulk Customer Emails'}
                            </span>
                          </div>
                        ) : selectedAgent.agent_type === 'sms_agent' ? (
                          <div className="flex flex-wrap gap-2">
                            <span className="inline-flex items-center px-3 py-2 rounded text-sm font-medium bg-orange-100 text-orange-700 border border-orange-200">
                              {selectedAgent.recipient_type === 'single' ? 
                                `Single Customer: ${selectedAgent.customer_name || 'Selected Customer'}` : 
                                'All customers in database'
                              }
                            </span>
                          </div>
                        ) : (
                          <div className="flex flex-wrap gap-2">
                            {getEnabledPlatforms(selectedAgent.social_platforms).length > 0 ? (
                              getEnabledPlatforms(selectedAgent.social_platforms).map((platform) => (
                                <span 
                                  key={platform}
                                  className="inline-flex items-center px-3 py-2 rounded text-sm font-medium bg-blue-100 text-blue-700 border border-blue-200"
                                >
                                  {getPlatformIcon(platform)} {platform === 'twitter' ? 'X (Twitter)' : platform}
                                </span>
                              ))
                            ) : (
                              <span className="text-sm text-gray-500">No platforms selected</span>
                            )}
                          </div>
                        )}
                      </div>
                    </section>

                    {/* Scheduling & Timing */}
                    {(selectedAgent.frequency || selectedAgent.post_time || selectedAgent.post_date) && (
                      <section>
                        <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                          <Calendar className="h-5 w-5 text-green-600 mr-2" />
                          Scheduling & Timing
                        </h4>
                        <div className="bg-gray-50 rounded-lg p-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {(selectedAgent.schedule_type === 'all_days' && selectedAgent.frequency) && (
                              <div>
                                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Frequency</label>
                                <p className="text-sm text-gray-900 mt-1">Every {selectedAgent.frequency} hours</p>
                              </div>
                            )}
                            {selectedAgent.schedule_type === 'selected_days' && (
                              <div>
                                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Selected Days</label>
                                <p className="text-sm text-gray-900 mt-1">
                                  {Object.entries(selectedAgent.days_of_week || {})
                                    .filter(([day, enabled]) => enabled)
                                    .map(([day]) => day.charAt(0).toUpperCase() + day.slice(1))
                                    .join(', ') || 'None selected'}
                                </p>
                              </div>
                            )}
                            {(selectedAgent.post_time || selectedAgent.post_date || selectedAgent.immediate !== undefined) && (
                              <div>
                                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Schedule</label>
                                <p className="text-sm text-gray-900 mt-1">
                                  {formatAgentSchedule(selectedAgent)}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      </section>
                    )}

                    {/* Content Configuration */}
                    <section>
                      <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                        <FileText className="h-5 w-5 text-purple-600 mr-2" />
                        Content Configuration
                      </h4>
                      <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {selectedAgent.image_option && (
                            <div>
                              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Image Option</label>
                              <p className="text-sm text-gray-900 mt-1 capitalize">
                                {formatImageOption(selectedAgent)}
                              </p>
                            </div>
                          )}
                          {selectedAgent.image_text && (
                            <div>
                              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Image Text</label>
                              <p className="text-sm text-gray-900 mt-1">{selectedAgent.image_text}</p>
                            </div>
                          )}
                          <div>
                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Workflow Mode</label>
                            <p className="text-sm text-gray-900 mt-1">
                              {getWorkflowMode(selectedAgent)}
                            </p>
                          </div>
                          {selectedAgent.use_web_research !== undefined && selectedAgent.agent_type !== 'email' && selectedAgent.agent_type !== 'sms_agent' && (
                            <div>
                              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Web Research</label>
                              <p className="text-sm text-gray-900 mt-1">
                                <span className={`inline-flex items-center px-3 py-1 rounded text-xs font-medium ${
                                  selectedAgent.use_web_research ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                                }`}>
                                  {selectedAgent.use_web_research ? 'Enabled' : 'Disabled'}
                                </span>
                              </p>
                            </div>
                          )}
                          {selectedAgent.agent_type === 'email' && selectedAgent.use_chatgpt_formatting !== undefined && (
                            <div>
                              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Use ChatGPT to Format Email</label>
                              <p className="text-sm text-gray-900 mt-1">
                                {selectedAgent.use_chatgpt_formatting ? 'Yes' : 'No'}
                              </p>
                            </div>
                          )}
                        </div>
                        
                        {/* Content Preview for Write Mode */}
                        {selectedAgent.mode === 'write' && (
                          <div>
                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Content Preview</label>
                            <div className="mt-2 p-3 bg-white rounded-md border border-gray-200">
                              <p className="text-sm text-gray-900 whitespace-pre-wrap">
                                {selectedAgent.agent_type === 'email' ? selectedAgent.email_content : selectedAgent.post_content}
                              </p>
                            </div>
                          </div>
                        )}
                        
                        {/* Email Subject for Email Agents */}
                        {selectedAgent.agent_type === 'email' && selectedAgent.email_subject && (
                          <div>
                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Email Subject</label>
                            <div className="mt-2 p-3 bg-blue-50 rounded-md border border-blue-200">
                              <p className="text-sm text-blue-900 font-medium">{selectedAgent.email_subject}</p>
                            </div>
                          </div>
                        )}
                        
                      </div>
                    </section>

                    {/* Days Configuration for Recurring Mode */}
                    {(selectedAgent.mode === 'auto' || selectedAgent.mode === 'recurring') && selectedAgent.days_of_week && (
                      <section>
                        <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                          <Calendar className="h-5 w-5 text-indigo-600 mr-2" />
                          Active Days
                        </h4>
                        <div className="bg-gray-50 rounded-lg p-4">
                          <div className="flex flex-wrap gap-2">
                            {Object.entries(selectedAgent.days_of_week || {}).map(([day, enabled]) => (
                              <span 
                                key={day}
                                className={`inline-flex items-center px-3 py-1 rounded text-xs font-medium ${
                                  enabled 
                                    ? 'bg-green-100 text-green-700 border border-green-200' 
                                    : 'bg-gray-100 text-gray-500 border border-gray-200'
                                }`}
                              >
                                {day.charAt(0).toUpperCase() + day.slice(1)}
                              </span>
                            ))}
                          </div>
                        </div>
                      </section>
                    )}
                  </>
                )}
              </div>

            </div>

            {/* Sticky Footer */}
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-lg">
              <div className="flex justify-end">
                <button
                  onClick={() => setSelectedAgent(null)}
                  className="px-6 py-2 text-white rounded-lg transition-colors font-medium"
                  style={{ backgroundColor: '#29add3' }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = '#2196c7';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = '#29add3';
                  }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && agentToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-2xl max-w-md w-full">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-200 rounded-t-lg" style={{ backgroundColor: '#29add3' }}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-lg bg-white bg-opacity-20">
                    <Trash2 className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white">
                      Delete AI Agent
                    </h3>
                    <p className="text-white text-opacity-80 text-sm mt-1">
                      This action cannot be undone
                    </p>
                  </div>
                </div>
                <button
                  onClick={closeDeleteModal}
                  className="text-white hover:text-white hover:text-opacity-80 transition-colors p-1 rounded-full hover:bg-white hover:bg-opacity-20"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="px-6 py-6">
              <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                  <Trash2 className="h-6 w-6 text-red-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Are you sure you want to delete this agent?
                </h3>
                <p className="text-sm text-gray-500 mb-4">
                  You are about to permanently delete <strong>"{agentToDelete.name || agentToDelete.agent_name || 'Unnamed Agent'}"</strong>. 
                  This will remove all associated data and cannot be undone.
                </p>
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                  <div className="flex items-start">
                    <AlertCircle className="h-5 w-5 text-red-400 mt-0.5 mr-2" />
                    <div className="text-sm text-red-700">
                      <p className="font-medium">This action will:</p>
                      <ul className="mt-1 list-disc list-inside">
                        <li>Permanently delete the agent</li>
                        <li>Remove all agent configurations</li>
                        <li>Stop any scheduled posts</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-lg">
              <div className="flex justify-end space-x-3">
                <button
                  onClick={closeDeleteModal}
                  className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDeleteAgent}
                  disabled={processingAgent === agentToDelete.id}
                  className="px-4 py-2 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center"
                  style={{ 
                    backgroundColor: processingAgent === agentToDelete.id ? '#94a3b8' : '#29add3'
                  }}
                  onMouseEnter={(e) => {
                    if (processingAgent !== agentToDelete.id) {
                      e.target.style.backgroundColor = '#2196c7';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (processingAgent !== agentToDelete.id) {
                      e.target.style.backgroundColor = '#29add3';
                    }
                  }}
                >
                  {processingAgent === agentToDelete.id ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Agent
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Run Agent Modal */}
      {showRunModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center">
                <Bot className="h-6 w-6 text-blue-600 mr-3" />
                <h3 className="text-lg font-semibold text-gray-900">
                  Running Agent: {runningAgent?.agent_name || runningAgent?.name || 'AI Agent'}
                </h3>
              </div>
            </div>
            <div className="px-6 py-6">
              <div className="flex items-center space-x-4">
                {runStatus === 'running' && (
                  <RefreshCw className="h-8 w-8 text-blue-600 animate-spin" />
                )}
                {runStatus === 'completed' && (
                  <CheckCircle className="h-8 w-8 text-green-600" />
                )}
                {runStatus === 'error' && (
                  <XCircle className="h-8 w-8 text-red-600" />
                )}
                <div className="flex-1">
                  <p className="text-gray-900 font-medium">
                    {runStatus === 'running' && 'Generating Content...'}
                    {runStatus === 'completed' && 'Content Generated!'}
                    {runStatus === 'error' && 'Generation Failed'}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    {runMessage}
                  </p>
                </div>
              </div>
            </div>
            {runStatus === 'error' && (
              <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-lg">
                <div className="flex justify-end">
                  <button
                    onClick={() => {
                      setShowRunModal(false);
                      setRunningAgent(null);
                      setRunStatus('');
                      setRunMessage('');
                    }}
                    className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Duplicate Timesheet Warning Modal */}
      {showDuplicateTimesheetModal && duplicateTimesheetInfo && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full mx-4">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center">
                <AlertCircle className="h-6 w-6 text-amber-600 mr-3" />
                <h3 className="text-lg font-semibold text-gray-900">
                  Replace Existing Timesheet?
                </h3>
              </div>
            </div>
            <div className="px-6 py-6">
              <div className="space-y-4">
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5 mr-3 flex-shrink-0" />
                    <div>
                      <h4 className="text-sm font-medium text-amber-800 mb-1">
                        Timesheet Already Exists
                      </h4>
                      <p className="text-sm text-amber-700">
                        A timesheet for this pay period already exists and is currently <strong className="capitalize">{duplicateTimesheetInfo.status.replace('_', ' ')}</strong>.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <h5 className="text-sm font-medium text-gray-900 mb-2">Existing Timesheet Details:</h5>
                    <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Pay Period:</span>
                        <span className="text-sm font-medium text-gray-900">{duplicateTimesheetInfo.period}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Current Status:</span>
                        <span className={`text-sm font-medium capitalize ${
                          duplicateTimesheetInfo.status === 'published' ? 'text-green-700' :
                          duplicateTimesheetInfo.status === 'ready_to_publish' ? 'text-blue-700' :
                          'text-amber-700'
                        }`}>
                          {duplicateTimesheetInfo.status.replace('_', ' ')}
                        </span>
                      </div>
                      {duplicateTimesheetInfo.existingTimesheet.created_at && (
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Created:</span>
                          <span className="text-sm font-medium text-gray-900">
                            {new Date(duplicateTimesheetInfo.existingTimesheet.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-start">
                      <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 mr-3 flex-shrink-0" />
                      <div>
                        <p className="text-sm text-red-700">
                          <strong>If you continue:</strong>
                        </p>
                        <ul className="text-sm text-red-700 mt-1 list-disc list-inside">
                          <li>The existing timesheet will be <strong>permanently deleted</strong></li>
                          <li>A new timesheet will be generated with current data</li>
                          <li>The new timesheet will start in "In Review" status</li>
                          <li>This action cannot be undone</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-lg">
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => handleDuplicateTimesheetChoice(false)}
                  className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDuplicateTimesheetChoice(true)}
                  className="px-4 py-2 text-white bg-red-600 border border-red-600 rounded-lg hover:bg-red-700 transition-colors font-medium"
                >
                  Delete & Replace
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIAgentsDashboard;