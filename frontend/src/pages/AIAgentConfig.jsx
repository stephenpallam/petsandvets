/* eslint-disable */
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  Bot, 
  Calendar, 
  Clock, 
  Upload, 
  Image as ImageIcon, 
  Settings, 
  Save, 
  AlertCircle, 
  CheckCircle,
  Plus,
  Trash2,
  Edit2,
  Play,
  Pause,
  Target,
  MessageSquare,
  MessageCircle,
  Hash,
  FileText,
  CalendarDays,
  Share2,
  Zap,
  ArrowLeft,
  Eye,
  Timer,
  ClipboardList,
  ClipboardCheck,
  RefreshCw,
  Users,
  User,
  Mail,
  Gift,
  Heart,
  Stethoscope,
  Search,
  Type,
  Globe
} from 'lucide-react';

const AIAgentConfig = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, token, isAdmin, canAccessManager, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState(() => {
    const agentType = searchParams.get('agent_type');
    if (agentType === 'email') {
      return 'email-scheduled'; // Default to scheduled for email agents
    } else if (agentType === 'sms_agent') {
      return 'sms-scheduled'; // Default to scheduled for SMS agents
    } else if (agentType === 'time_sheet') {
      return 'timesheet-recurring'; // Default to recurring for timesheet agents
    }
    return 'social-media-recurring'; // Default for social media agents
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [agents, setAgents] = useState([]);
  const [pageLoading, setPageLoading] = useState(true);

  // Recurring Mode State
  const [recurringMode, setRecurringMode] = useState({
    agentName: '',
    topic: '',
    customTopic: '',
    imageOption: 'ai_generate', // 'ai_generate', 'upload', 'reference', 'none'
    uploadedImages: [],
    scheduleType: 'all_days', // 'all_days' or 'selected_days'
    frequency: '24', // hours (only used when scheduleType is 'all_days')
    socialPlatforms: {
      facebook: false,
      instagram: false,
      twitter: false,
      whatsapp: false
    },
    postTime: '09:00',
    imageText: '',
    wordCount: '100',
    daysOfWeek: {
      monday: false,
      tuesday: false,
      wednesday: false,
      thursday: false,
      friday: false,
      saturday: false,
      sunday: false
    },
    postDestination: 'in_review' // 'auto_post', 'in_review', or 'ready_to_publish'
  });

  // Timesheet-specific state for recurring mode
  const [timesheetRecurringMode, setTimesheetRecurringMode] = useState({
    agentName: '',
    selectedEmployees: [], // Array of employee IDs
    runEveryPayPeriod: 'weekly', // Changed from frequency to runEveryPayPeriod
    daysAfterPeriodEnd: 1, // New field: days after pay period ends to run the agent
    customStartDate: '',
    customEndDate: '',
    includeSummary: true,
    includeBillingRates: true,
    initialStatus: 'in_review', // 'in_review', 'ready_to_publish', 'published'
    emailRecipients: [], // Array of email addresses
    autoEmail: false,
    scheduleTime: '09:00',
    daysOfWeek: {
      monday: true,
      tuesday: false,
      wednesday: false,
      thursday: false,
      friday: false,
      saturday: false,
      sunday: false
    }
  });

  // Timesheet-specific state for adhoc mode
  const [timesheetAdhocMode, setTimesheetAdhocMode] = useState({
    agentName: '',
    selectedEmployees: [], // Array of employee IDs
    reportPeriod: 'current_week',
    customStartDate: '',
    customEndDate: '',
    includeSummary: true,
    includeBillingRates: true,
    initialStatus: 'in_review',
    emailRecipients: [], // Array of email addresses
    autoEmail: false
  });

  // Available employees for selection
  const [availableEmployees, setAvailableEmployees] = useState([]);
  const [newEmailRecipient, setNewEmailRecipient] = useState('');
  
  // Pay period settings
  const [defaultPayPeriods, setDefaultPayPeriods] = useState([]);
  const [pastPayPeriods, setPastPayPeriods] = useState([]);
  const [selectedPayPeriod, setSelectedPayPeriod] = useState(null);
  const [existingTimesheetReports, setExistingTimesheetReports] = useState([]);

  // Email Agent - Scheduled Mode State
  const [emailScheduledMode, setEmailScheduledMode] = useState({
    agentName: '',
    selectedHolidays: [], // Array of holiday IDs
    imageOption: 'ai_generate', // 'ai_generate', 'upload', 'reference', 'none'
    uploadedImages: [],
    imageText: '',
    wordCount: '100',
    useWebResearch: false,
    postTime: '09:00',
    postDestination: 'in_review', // 'auto_send', 'in_review', or 'ready_to_publish'
    useCustomerDatabase: true, // Default to true for customer database integration
    emailContentTemplate: `Dear [CUSTOMER_NAME],

We hope you and [PET_NAME] are doing well! As we celebrate this special holiday season, we wanted to reach out with some exciting news and offers from our veterinary clinic.

Our team is here to provide the best care for [PET_NAME] with:
• Comprehensive health checkups and vaccinations
• Emergency services available 24/7
• Professional grooming and wellness services
• Specialized treatments tailored to your pet's needs

Don't forget to schedule [PET_NAME]'s regular checkup to keep them healthy and happy throughout the year.

Visit our clinic or book your appointment online at our website. We look forward to seeing you and [PET_NAME] soon!

Best regards,
The Veterinary Care Team`,
    useChatGPTFormatting: true // Default to true for ChatGPT formatting
  });

  // Email Agent - Write Email Mode State  
  const [emailWriteMode, setEmailWriteMode] = useState({
    agentName: '',
    emailSubject: '',
    emailContent: `Dear CUSTOMER_NAME,

I hope this message finds you and PET_NAME in great health and spirits!

We wanted to reach out to share some important information and updates from our veterinary clinic that we believe will be valuable for you and PET_NAME.

Our dedicated team continues to provide comprehensive care including:
• Regular health checkups and preventive care
• Vaccination services to keep PET_NAME protected
• Professional grooming and wellness treatments
• Emergency services available when you need us most

We believe that preventive care is the key to keeping PET_NAME healthy and happy for years to come. If it's been a while since PET_NAME's last visit, now would be a great time to schedule a checkup.

Please don't hesitate to contact us if you have any questions about PET_NAME's health or our services. We're always here to help!

Warm regards,
The Veterinary Care Team`,
    emailContentBulk: `Dear [CUSTOMER_NAME],

I hope this message finds you and [PET_NAME] in great health and spirits!

We wanted to reach out to share some important information and updates from our veterinary clinic that we believe will be valuable for you and [PET_NAME].

Our dedicated team continues to provide comprehensive care including:
• Regular health checkups and preventive care
• Vaccination services to keep [PET_NAME] protected
• Professional grooming and wellness treatments
• Emergency services available when you need us most

We believe that preventive care is the key to keeping [PET_NAME] healthy and happy for years to come. If it's been a while since [PET_NAME]'s last visit, now would be a great time to schedule a checkup.

Please don't hesitate to contact us if you have any questions about [PET_NAME]'s health or our services. We're always here to help!

Warm regards,
The Veterinary Care Team`,
    imageOption: 'ai_generate', // 'ai_generate', 'upload', 'reference', 'none'
    uploadedImages: [],
    imageText: '',
    wordCount: '100',
    useChatGPTFormatting: true, // Replace web research with ChatGPT formatting
    emailType: 'bulk', // 'single' or 'bulk'
    selectedCustomer: null, // For single email mode
    postDate: '',
    postTime: '09:00',
    postDestination: 'in_review'
  });

  // Email Agent - Recurring Mode State (schedule-based, similar to scheduled mode)
  const [emailRecurringMode, setEmailRecurringMode] = useState({
    agentName: '',
    topic: '', // Required for recurring email agents  
    customTopic: '', // For custom topic selection
    wordCount: '100',
    // Schedule Selection (replacing holiday selection)
    scheduleType: 'weekly', // 'weekly' or 'monthly'
    // Weekly schedule fields
    daysOfWeek: {
      monday: false,
      tuesday: false,
      wednesday: false,
      thursday: false,
      friday: false,
      saturday: false,
      sunday: false
    },
    // Monthly schedule - simplified to 1st of every month
    monthlySchedule: '1st', // Always 1st day of month for monthly schedules
    // All other fields matching scheduled mode
    emailContentTemplate: `Dear [CUSTOMER_NAME],

I hope this message finds you and [PET_NAME] in great health and spirits!

We wanted to reach out with our regular update and check-in about [PET_NAME]'s care and our services.

Our dedicated team continues to provide comprehensive care including:
• Regular health checkups and preventive care
• Vaccination services to keep [PET_NAME] protected
• Professional grooming and wellness treatments
• Emergency services available when you need us most

We believe that preventive care is the key to keeping [PET_NAME] healthy and happy for years to come. If it's been a while since [PET_NAME]'s last visit, now would be a great time to schedule a checkup.

Please don't hesitate to contact us if you have any questions about [PET_NAME]'s health or our services. We're always here to help!

Warm regards,
The Veterinary Care Team`,
    postTime: '09:00',
    imageOption: 'ai_generate', // 'ai_generate', 'upload', 'reference', 'none'
    uploadedImages: [],
    imageText: '',
    postDestination: 'in_review' // 'in_review', 'ready_to_publish', 'auto_send'
  });

  // Email-specific data
  const [availableHolidays, setAvailableHolidays] = useState([]);
  const [availableCustomers, setAvailableCustomers] = useState([]);

  // SMS Agent - Scheduled Mode State (Holiday-based SMS)
  const [smsScheduledMode, setSmsScheduledMode] = useState({
    agentName: '',
    selectedHolidays: [], // Array of holiday IDs
    smsProvider: 'twilio', // 'twilio' or 'sendgrid'
    useSMSChatGPTFormatting: true, // Default to true for ChatGPT formatting
    smsContentTemplate: `Hi [CUSTOMER_NAME]! Hope [PET_NAME] is doing well. Special holiday offer - 20% off checkups this month. Call us at (555) 123-4567 to book!`,
    postTime: '09:00',
    postDestination: 'in_review', // 'auto_send', 'in_review', or 'ready_to_publish'
    useCustomerDatabase: true, // Default to true for customer database integration
    smsType: 'bulk', // 'single' or 'bulk'
    selectedCustomer: null, // For single SMS mode
    smsCharacterLimit: 160
  });

  // SMS Agent - Write SMS Mode State  
  const [smsWriteMode, setSmsWriteMode] = useState({
    agentName: '',
    smsSubject: '', // Optional SMS title/subject
    smsContent: `Hi [CUSTOMER_NAME]! Hope [PET_NAME] is well. Don't forget your pet's checkup. Call (555) 123-4567 to schedule. Thanks!`,
    smsProvider: 'twilio',
    useSMSChatGPTFormatting: true,
    smsType: 'bulk', // 'single' or 'bulk'
    selectedCustomer: null, // For single SMS mode
    postDate: '',
    postTime: '09:00',
    postDestination: 'in_review',
    smsCharacterLimit: 160
  });

  // SMS Agent - Recurring Mode State
  const [smsRecurringMode, setSmsRecurringMode] = useState({
    agentName: '',
    topic: '', // Required for recurring SMS agents  
    customTopic: '', // For custom topic selection
    // Schedule Selection
    scheduleType: 'weekly', // 'weekly' or 'monthly'
    // Weekly schedule fields
    daysOfWeek: {
      monday: false,
      tuesday: false,
      wednesday: false,
      thursday: false,
      friday: false,
      saturday: false,
      sunday: false
    },
    // Monthly schedule - simplified to 1st of every month
    monthlySchedule: '1st', // Always 1st day of month for monthly schedules
    smsContentTemplate: `Hi [CUSTOMER_NAME]! Regular reminder about [PET_NAME]'s care. Visit us for checkups, vaccines & more. Call (555) 123-4567`,
    postTime: '09:00',
    postDestination: 'in_review',
    smsProvider: 'twilio',
    useSMSChatGPTFormatting: true,
    smsType: 'bulk',
    smsCharacterLimit: 160
  });

  // Adhoc Mode State
  const [adhocMode, setAdhocMode] = useState({
    agentName: '',
    topic: '',
    customTopic: '',
    imageOption: 'ai_generate', // 'ai_generate', 'upload', 'reference', 'none'
    uploadedImages: [],
    socialPlatforms: {
      facebook: false,
      instagram: false,
      twitter: false,
      whatsapp: false
    },
    imageText: '',
    wordCount: '100',
    postDate: '',
    postTime: '09:00',
    postDestination: 'in_review' // 'auto_post', 'in_review', or 'ready_to_publish'
  });

  // Write Your Post Mode State
  const [writePostMode, setWritePostMode] = useState({
    agentName: '',
    postTitle: '', // Post title field
    postContent: '', // Big text area for post details (replacing topic field)
    wordCount: '100',
    postDate: '',
    postTime: '09:00',
    imageText: '',
    imageOption: 'ai_generate', // 'ai_generate', 'upload', 'reference', 'none'
    uploadedImages: [],
    socialPlatforms: {
      facebook: false,
      instagram: false,
      twitter: false,
      whatsapp: false
    },
    useWebResearch: false, // Checkbox for web research
    useChatGPTFormatting: true, // Option to use/not use ChatGPT formatting
    postDestination: 'in_review' // 'auto_post', 'in_review', or 'ready_to_publish'
  });

  const [isFormattingContent, setIsFormattingContent] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isRunMode, setIsRunMode] = useState(false);
  const [editingAgentMode, setEditingAgentMode] = useState(null);
  const [editingAgentData, setEditingAgentData] = useState(null);
  const [showSaveModal, setShowSaveModal] = useState(false);

  const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || import.meta.env.REACT_APP_BACKEND_URL || window.location.origin;

  // Check for edit/run mode and pre-populate form
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const mode = urlParams.get('mode');
    const agentId = urlParams.get('id');

    if ((mode === 'edit' || mode === 'run') && agentId) {
      // Get agent data from localStorage - check both edit and run storage
      const editingAgent = mode === 'edit' 
        ? localStorage.getItem('editingAgent')
        : localStorage.getItem('runningAgent');
      console.log('Raw localStorage data:', editingAgent);
      
      if (editingAgent) {
        try {
          const agentData = JSON.parse(editingAgent);
          console.log('Parsed agent data:', agentData);
          
          if (mode === 'edit') {
            setIsEditMode(true);
          } else if (mode === 'run') {
            setIsRunMode(true);
          }
          setEditingAgentMode(agentData.mode);
          setEditingAgentData(agentData);
          
          // Set the active tab based on agent mode and agent type
          // Handle legacy "auto" mode by mapping it to "recurring"
          const tabMode = agentData.mode === 'auto' ? 'recurring' : agentData.mode;
          
          // Determine the correct tab ID based on agent type and mode
          let correctTabId;
          if (agentData.agent_type === 'time_sheet') {
            correctTabId = tabMode === 'adhoc' ? 'timesheet-adhoc' : 'timesheet-recurring';
          } else if (agentData.agent_type === 'email') {
            if (tabMode === 'write') {
              correctTabId = 'email-write';
            } else if (tabMode === 'recurring' && agentData.selected_holidays?.length > 0) {
              correctTabId = 'email-scheduled'; // Holiday-based emails use scheduled tab
            } else {
              correctTabId = 'email-recurring'; // Topic-based recurring emails
            }
          } else {
            // Social media agents
            correctTabId = `social-media-${tabMode}`;
          }
          
          setActiveTab(correctTabId);
          
          // Pre-populate form fields based on agent mode
          if (agentData.mode === 'auto' || agentData.mode === 'recurring') {
            setRecurringMode({
              agentName: agentData.name || agentData.agent_name || '',
              topic: agentData.topic || '',
              customTopic: agentData.custom_topic || '',
              imageOption: agentData.image_option || 'ai_generate',
              uploadedImages: [],
              frequency: agentData.frequency?.toString() || '24',
              socialPlatforms: {
                facebook: Array.isArray(agentData.social_platforms) 
                  ? agentData.social_platforms.includes('facebook')
                  : agentData.social_platforms?.facebook || false,
                instagram: Array.isArray(agentData.social_platforms)
                  ? agentData.social_platforms.includes('instagram')
                  : agentData.social_platforms?.instagram || false,
                twitter: Array.isArray(agentData.social_platforms)
                  ? agentData.social_platforms.includes('x') || agentData.social_platforms.includes('twitter')
                  : agentData.social_platforms?.twitter || false,
                whatsapp: Array.isArray(agentData.social_platforms)
                  ? agentData.social_platforms.includes('whatsapp')
                  : agentData.social_platforms?.whatsapp || false
              },
              postTime: agentData.post_time || '09:00',
              imageText: agentData.image_text || '',
              wordCount: agentData.word_count?.toString() || '150',
              scheduleType: agentData.schedule_type || (
                // Smart default based on existing data
                agentData.days_of_week && Object.values(agentData.days_of_week).some(day => day) && 
                !Object.values(agentData.days_of_week).every(day => day) 
                  ? 'selected_days' 
                  : 'all_days'
              ),
              daysOfWeek: agentData.days_of_week || { monday: true, tuesday: true, wednesday: true, thursday: true, friday: true, saturday: true, sunday: true },
              postDestination: agentData.auto_post ? 'auto_post' : (agentData.post_destination || 'in_review')
            });
          } else if (agentData.mode === 'adhoc') {
            setAdhocMode({
              agentName: agentData.name || agentData.agent_name || '',
              topic: agentData.topic || '',
              customTopic: agentData.custom_topic || '',
              imageOption: agentData.image_option || 'ai_generate',
              uploadedImages: [],
              socialPlatforms: {
                facebook: Array.isArray(agentData.social_platforms) 
                  ? agentData.social_platforms.includes('facebook')
                  : agentData.social_platforms?.facebook || false,
                instagram: Array.isArray(agentData.social_platforms)
                  ? agentData.social_platforms.includes('instagram')
                  : agentData.social_platforms?.instagram || false,
                twitter: Array.isArray(agentData.social_platforms)
                  ? agentData.social_platforms.includes('x') || agentData.social_platforms.includes('twitter')
                  : agentData.social_platforms?.twitter || false,
                whatsapp: Array.isArray(agentData.social_platforms)
                  ? agentData.social_platforms.includes('whatsapp')
                  : agentData.social_platforms?.whatsapp || false
              },
              wordCount: agentData.word_count?.toString() || '150',
              postDate: agentData.post_date || '',
              postTime: agentData.post_time || '09:00',
              imageText: agentData.image_text || '',
              postDestination: agentData.post_destination || 'in_review'
            });
          } else if (agentData.mode === 'write') {
            setWritePostMode({
              agentName: agentData.name || agentData.agent_name || '',
              postTitle: agentData.post_title || '',
              postContent: agentData.post_content || '',
              wordCount: agentData.word_count?.toString() || '100',
              postDate: agentData.post_date || '',
              postTime: agentData.post_time || '09:00',
              imageText: agentData.image_text || '',
              imageOption: agentData.image_option || 'ai_generate',
              uploadedImages: [],
              socialPlatforms: {
                facebook: Array.isArray(agentData.social_platforms) 
                  ? agentData.social_platforms.includes('facebook')
                  : agentData.social_platforms?.facebook || false,
                instagram: Array.isArray(agentData.social_platforms)
                  ? agentData.social_platforms.includes('instagram')
                  : agentData.social_platforms?.instagram || false,
                twitter: Array.isArray(agentData.social_platforms)
                  ? agentData.social_platforms.includes('x') || agentData.social_platforms.includes('twitter')
                  : agentData.social_platforms?.twitter || false,
                whatsapp: Array.isArray(agentData.social_platforms)
                  ? agentData.social_platforms.includes('whatsapp')
                  : agentData.social_platforms?.whatsapp || false
              },
              useWebResearch: agentData.use_web_research || false,
              postDestination: agentData.post_destination || 'in_review'
            });
          }
          
          // Handle timesheet agent data prepopulation
          if (agentData.agent_type === 'time_sheet') {
            if (agentData.mode === 'recurring') {
              setTimesheetRecurringMode({
                agentName: agentData.name || agentData.agent_name || '',
                selectedEmployees: agentData.selected_employees || [],
                runEveryPayPeriod: agentData.run_every_pay_period || 'weekly',
                daysAfterPeriodEnd: agentData.days_after_period_end || 1,
                scheduleTime: agentData.schedule_time || '09:00',
                includeBillingRates: agentData.include_billing_rates !== undefined ? agentData.include_billing_rates : true,
                autoEmail: agentData.auto_email || false,
                emailRecipients: agentData.email_recipients || [],
                initialStatus: agentData.initial_status || agentData.post_destination || 'in_review',
                daysOfWeek: agentData.days_of_week || { monday: true, tuesday: true, wednesday: true, thursday: true, friday: true, saturday: true, sunday: true }
              });
            } else if (agentData.mode === 'adhoc') {
              setTimesheetAdhocMode({
                agentName: agentData.name || agentData.agent_name || '',
                selectedEmployees: agentData.selected_employees || [],
                reportPeriod: agentData.report_period || 'current_week',
                customStartDate: agentData.custom_start_date || '',
                customEndDate: agentData.custom_end_date || '',
                includeBillingRates: agentData.include_billing_rates !== undefined ? agentData.include_billing_rates : true,
                autoEmail: agentData.auto_email || false,
                emailRecipients: agentData.email_recipients || [],
                initialStatus: agentData.initial_status || agentData.post_destination || 'in_review'
              });
            }
          }
          
          // Handle email agent data prepopulation
          if (agentData.agent_type === 'email') {
            if (agentData.mode === 'recurring' && agentData.selected_holidays && agentData.selected_holidays.length > 0) {
              // This is a scheduled email agent (holiday-based)
              console.log('Email scheduled agent data for edit mode:', {
                use_chatgpt_formatting: agentData.use_chatgpt_formatting,
                email_content_template: agentData.email_content_template,
                email_template: agentData.email_template
              });
              
              setEmailScheduledMode({
                agentName: agentData.name || agentData.agent_name || '',
                selectedHolidays: agentData.selected_holidays || [],
                imageOption: agentData.image_option || 'ai_generate',
                uploadedImages: [],
                imageText: agentData.image_text || '',
                wordCount: agentData.word_count?.toString() || '150',
                postTime: agentData.post_time || '09:00',
                useChatGPTFormatting: agentData.use_chatgpt_formatting !== undefined ? agentData.use_chatgpt_formatting : true,
                postDestination: agentData.post_destination || 'in_review',
                emailContentTemplate: agentData.email_content_template || agentData.email_template || ''
              });
            } else if (agentData.mode === 'recurring') {
              // This is a recurring email agent (topic-based)
              const isCustomTopic = !['Trending Pet Health News', 'Trending Pet Food News', 'Pet Care Tips', 'Veterinary Updates', 'Pet Safety Alerts', 'Seasonal Pet Care', 'Pet Training Tips', 'Pet Nutrition Advice'].includes(agentData.topic);
              setEmailRecurringMode({
                agentName: agentData.name || agentData.agent_name || '',
                topic: isCustomTopic ? 'Custom' : (agentData.topic || ''),
                customTopic: isCustomTopic ? agentData.topic : '',
                wordCount: agentData.word_count?.toString() || '100',
                scheduleType: agentData.schedule_type || 'weekly',
                daysOfWeek: agentData.days_of_week || { monday: false, tuesday: false, wednesday: false, thursday: false, friday: false, saturday: false, sunday: false },
                monthlySchedule: agentData.monthly_schedule || '1st',
                emailContentTemplate: agentData.email_content_template || `Dear [CUSTOMER_NAME],

Hope this message finds you and [PET_NAME] doing well!

[Your business information and content will be inserted here]

Best regards,
[Your Business Name]`,
                postTime: agentData.post_time || '09:00',
                imageOption: agentData.image_option || 'no_images',
                uploadedImages: [],
                selectedImageUrls: agentData.uploaded_images || [],
                imageText: agentData.image_text || '',
                postDestination: agentData.post_destination || 'in_review'
              });
            } else if (agentData.mode === 'write') {
              // This is a write mode email agent
              setEmailWriteMode({
                agentName: agentData.name || agentData.agent_name || '',
                emailContent: agentData.email_content || agentData.post_content || '',
                emailSubject: agentData.email_subject || agentData.post_title || '',
                imageOption: agentData.image_option || 'ai_generate',
                uploadedImages: [],
                imageText: agentData.image_text || '',
                wordCount: agentData.word_count?.toString() || '150',
                useChatGPTFormatting: agentData.use_chatgpt_formatting !== undefined ? agentData.use_chatgpt_formatting : true,
                postDestination: agentData.post_destination || 'in_review',
                postDate: agentData.post_date || '',
                postTime: agentData.post_time || '',
                emailType: agentData.email_type || 'bulk',
                selectedCustomer: agentData.selected_customer || ''
              });
            }
          }

          // Handle SMS agent data prepopulation
          if (agentData.agent_type === 'sms_agent') {
            if (agentData.mode === 'recurring' && agentData.selected_holidays && agentData.selected_holidays.length > 0) {
              // This is a scheduled SMS agent (holiday-based)
              setSmsScheduledMode({
                agentName: agentData.name || agentData.agent_name || '',
                selectedHolidays: agentData.selected_holidays || [],
                smsProvider: agentData.sms_provider || 'twilio',
                useSMSChatGPTFormatting: agentData.use_sms_chatgpt_formatting !== undefined ? agentData.use_sms_chatgpt_formatting : true,
                smsContentTemplate: agentData.sms_template || agentData.sms_content_template || '',
                postTime: agentData.post_time || '09:00',
                postDestination: agentData.post_destination || 'in_review',
                useCustomerDatabase: agentData.use_customer_database !== undefined ? agentData.use_customer_database : true,
                smsType: agentData.sms_type || 'bulk',
                selectedCustomer: agentData.selected_sms_customer || null,
                smsCharacterLimit: agentData.sms_character_limit || 160
              });
            } else if (agentData.mode === 'recurring') {
              // This is a recurring SMS agent (topic-based)
              const isCustomTopic = !['Pet vaccination reminders', 'Appointment reminders', 'Health checkup alerts', 'Special offers', 'Holiday greetings', 'Pet care tips', 'Emergency updates'].includes(agentData.topic);
              setSmsRecurringMode({
                agentName: agentData.name || agentData.agent_name || '',
                topic: isCustomTopic ? 'Custom' : (agentData.topic || ''),
                customTopic: isCustomTopic ? agentData.topic : '',
                scheduleType: agentData.schedule_type || 'weekly',
                daysOfWeek: agentData.days_of_week || { monday: false, tuesday: false, wednesday: false, thursday: false, friday: false, saturday: false, sunday: false },
                monthlySchedule: agentData.monthly_schedule || '1st',
                smsContentTemplate: agentData.sms_template || agentData.sms_content_template || '',
                postTime: agentData.post_time || '09:00',
                postDestination: agentData.post_destination || 'in_review',
                smsProvider: agentData.sms_provider || 'twilio',
                useSMSChatGPTFormatting: agentData.use_sms_chatgpt_formatting !== undefined ? agentData.use_sms_chatgpt_formatting : true,
                smsType: agentData.sms_type || 'bulk',
                smsCharacterLimit: agentData.sms_character_limit || 160
              });
            } else if (agentData.mode === 'write') {
              // This is a write mode SMS agent
              setSmsWriteMode({
                agentName: agentData.name || agentData.agent_name || '',
                smsContent: agentData.sms_content || agentData.post_content || '',
                smsSubject: agentData.sms_subject || agentData.post_title || '',
                smsProvider: agentData.sms_provider || 'twilio',
                useSMSChatGPTFormatting: agentData.use_sms_chatgpt_formatting !== undefined ? agentData.use_sms_chatgpt_formatting : true,
                postDestination: agentData.post_destination || 'in_review',
                postDate: agentData.post_date || '',
                postTime: agentData.post_time || '',
                smsType: agentData.sms_type || 'bulk',
                selectedCustomer: agentData.selected_sms_customer || null,
                smsCharacterLimit: agentData.sms_character_limit || 160
              });
            }
          }
          
          setMessage({ type: 'info', text: `Editing agent: ${agentData.name || agentData.agent_name || 'Unknown Agent'}` });
        } catch (error) {
          console.error('Error parsing agent data:', error);
          setMessage({ type: 'error', text: `Error loading agent data: ${error.message}` });
        }
      } else {
        console.log('No editingAgent found in localStorage');
        setMessage({ type: 'error', text: 'No agent data found for editing. Please try again from the dashboard.' });
      }
    }
  }, []);

  const topicOptions = [
    'Trending Pet Health News',
    'Trending Pet Food News', 
    'Pet Care Tips',
    'Veterinary Updates',
    'Pet Safety Alerts',
    'Seasonal Pet Care',
    'Pet Training Tips',
    'Pet Nutrition Advice',
    'Custom'
  ];

  const wordCountOptions = [
    { value: '50', label: '<50 words' },
    { value: '75', label: '<75 words' },
    { value: '100', label: '<100 words' },
    { value: '150', label: '<150 words' },
    { value: '200', label: '<200 words' }
  ];

  const frequencyOptions = [
    { value: '1', label: 'Every 1 hour' },
    { value: '2', label: 'Every 2 hours' },
    { value: '4', label: 'Every 4 hours' },
    { value: '6', label: 'Every 6 hours' },
    { value: '8', label: 'Every 8 hours' },
    { value: '12', label: 'Every 12 hours' },
    { value: '24', label: 'Every 24 hours' }
  ];

  // Get tabs based on agent type
  const getTabs = () => {
    const agentType = searchParams.get('agent_type');
    
    if (agentType === 'time_sheet') {
      // Timesheet AI Agent tabs
      return [
        { 
          id: 'timesheet-recurring', 
          label: 'Recurring Mode', 
          icon: Timer, 
          color: '#29add3',
          description: 'Generate timesheets automatically on a schedule'
        },
        { 
          id: 'timesheet-adhoc', 
          label: 'Adhoc Mode', 
          icon: ClipboardList, 
          color: '#f59e0b',
          description: 'Generate timesheets on-demand when needed'
        }
      ];
    } else if (agentType === 'email') {
      // Email Agent tabs with specific IDs to avoid conflicts
      return [
        { 
          id: 'email-scheduled', 
          label: 'Scheduled Mode', 
          icon: Calendar, 
          color: '#10b981',
          description: 'Send emails automatically on holidays with personalized content'
        },
        { 
          id: 'email-recurring', 
          label: 'Recurring Mode', 
          icon: RefreshCw, 
          color: '#29add3',
          description: 'Send emails regularly on selected days and frequency'
        },
        { 
          id: 'email-write', 
          label: 'Write Your Email', 
          icon: Edit2, 
          color: '#29add3',
          description: 'Create and send custom emails with subject and content'
        }
      ];
    } else if (agentType === 'sms_agent') {
      // SMS Agent tabs
      return [
        { 
          id: 'sms-scheduled', 
          label: 'Scheduled Mode', 
          icon: Calendar, 
          color: '#10b981',
          description: 'Send SMS automatically on holidays with personalized content'
        },
        { 
          id: 'sms-recurring', 
          label: 'Recurring Mode', 
          icon: RefreshCw, 
          color: '#29add3',
          description: 'Send SMS regularly on selected days and frequency'
        },
        { 
          id: 'sms-write', 
          label: 'Write Your SMS', 
          icon: MessageSquare, 
          color: '#29add3',
          description: 'Create and send custom SMS messages with content'
        }
      ];
    } else {
      // Social Media Agent tabs with specific IDs to avoid conflicts
      return [
        { 
          id: 'social-media-recurring', 
          label: 'Recurring Mode', 
          icon: RefreshCw, 
          color: '#29add3',
          description: 'Automatically generate and post content on a schedule'
        },
        { 
          id: 'social-media-adhoc', 
          label: 'Adhoc Mode', 
          icon: Zap, 
          color: '#f59e0b',
          description: 'Generate content on-demand with custom scheduling'
        },
        { 
          id: 'social-media-write', 
          label: 'Write Your Post', 
          icon: FileText, 
          color: '#29add3',
          description: 'Write your own content and let AI format it for different platforms'
        }
      ];
    }
  };

  const tabs = getTabs();

  // Auth check
  useEffect(() => {
    if (!authLoading && (!user || !canAccessManager())) {
      window.location.href = '/login';
    } else if (!authLoading) {
      setPageLoading(false);
      fetchAgents();
      
      // Fetch employees and pay periods if this is a timesheet agent
      const agentType = searchParams.get('agent_type');
      if (agentType === 'time_sheet') {
        fetchAvailableEmployees();
        fetchDefaultPayPeriods();
      } else if (agentType === 'email') {
        fetchAvailableHolidays();
        fetchAvailableCustomers();
      } else if (agentType === 'sms_agent') {
        fetchAvailableHolidays(); // SMS agents also use holidays for scheduled mode
        fetchAvailableCustomers(); // SMS agents also use customer database
      }
    }
  }, [user, authLoading, canAccessManager, searchParams]);

  // Fetch all pay period settings and existing timesheet reports
  useEffect(() => {
    const fetchTimesheetData = async () => {
      if (searchParams.get('agent_type') === 'time_sheet') {
        try {
          // Fetch existing timesheet reports for adhoc mode
          await fetchExistingTimesheetReports();
        } catch (error) {
          console.error('Error fetching timesheet data:', error);
        }
      }
    };

    if (!authLoading && user && token) {
      fetchTimesheetData();
    }
  }, [user, token, authLoading, searchParams]);

  // Handle agent type changes and set correct default tab
  useEffect(() => {
    const agentType = searchParams.get('agent_type');
    const agentId = searchParams.get('id'); // Fixed: use 'id' not 'agent_id'
    const mode = searchParams.get('mode');
    
    // Only set default tab if we're not editing/running an existing agent
    if (!agentId && mode !== 'edit' && mode !== 'run') {
      if (agentType === 'email') {
        setActiveTab('email-scheduled');
      } else if (agentType === 'sms_agent') {
        setActiveTab('sms-scheduled');
      } else if (agentType === 'time_sheet') {
        setActiveTab('timesheet-recurring');
      } else {
        setActiveTab('social-media-recurring');
      }
    }
  }, [searchParams]);

  const fetchAgents = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/ai-agents`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setAgents(data);
      }
    } catch (error) {
      console.error('Error fetching agents:', error);
    }
  };

  const generateTimeOptions = () => {
    const times = [];
    for (let hour = 1; hour <= 12; hour++) {
      times.push({ value: `${hour.toString().padStart(2, '0')}:00`, label: `${hour}:00 AM` });
      if (hour !== 12) {
        times.push({ value: `${hour.toString().padStart(2, '0')}:30`, label: `${hour}:30 AM` });
      }
    }
    for (let hour = 13; hour <= 24; hour++) {
      const displayHour = hour > 12 ? hour - 12 : hour;
      const ampm = hour >= 12 ? 'PM' : 'AM';
      times.push({ 
        value: `${hour.toString().padStart(2, '0')}:00`, 
        label: `${displayHour}:00 ${ampm}` 
      });
      if (hour !== 24) {
        times.push({ 
          value: `${hour.toString().padStart(2, '0')}:30`, 
          label: `${displayHour}:30 ${ampm}` 
        });
      }
    }
    return times;
  };

  const timeOptions = generateTimeOptions();

  const handleRecurringModeChange = (field, value) => {
    setRecurringMode(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAdhocModeChange = (field, value) => {
    setAdhocMode(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Email Agent handlers
  const handleEmailScheduledModeChange = (field, value) => {
    setEmailScheduledMode(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleEmailWriteModeChange = (field, value) => {
    setEmailWriteMode(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleEmailRecurringModeChange = (field, value) => {
    setEmailRecurringMode(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Toggle holiday selection for scheduled email mode
  const toggleHolidaySelection = (holidayId) => {
    setEmailScheduledMode(prev => ({
      ...prev,
      selectedHolidays: prev.selectedHolidays.includes(holidayId)
        ? prev.selectedHolidays.filter(id => id !== holidayId)
        : [...prev.selectedHolidays, holidayId]
    }));
  };

  // Get category icon for holidays
  const getCategoryIcon = (category) => {
    switch (category) {
      case 'pet': return Heart;
      case 'veterinary': return Stethoscope;
      case 'family': return Gift;
      default: return Calendar;
    }
  };

  const handleWritePostModeChange = (field, value) => {
    setWritePostMode(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSocialPlatformChange = (platform, checked, mode = 'recurring') => {
    console.log(`Social platform change: ${platform} = ${checked}, mode = ${mode}`);
    
    let stateUpdater;
    if (mode === 'recurring') stateUpdater = setRecurringMode;
    else if (mode === 'adhoc') stateUpdater = setAdhocMode;
    else if (mode === 'write') stateUpdater = setWritePostMode;
    
    stateUpdater(prev => {
      const newState = {
        ...prev,
        socialPlatforms: {
          ...prev.socialPlatforms,
          [platform]: checked
        }
      };
      console.log(`Updated ${mode} socialPlatforms:`, newState.socialPlatforms);
      return newState;
    });
  };

  const handleDayOfWeekChange = (day, checked) => {
    setRecurringMode(prev => ({
      ...prev,
      daysOfWeek: {
        ...prev.daysOfWeek,
        [day]: checked
      }
    }));
  };

  // Timesheet-specific handlers
  const handleTimesheetRecurringModeChange = (field, value) => {
    setTimesheetRecurringMode(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleTimesheetAdhocModeChange = (field, value) => {
    setTimesheetAdhocMode(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleTimesheetDayOfWeekChange = (day, checked) => {
    setTimesheetRecurringMode(prev => ({
      ...prev,
      daysOfWeek: {
        ...prev.daysOfWeek,
        [day]: checked
      }
    }));
  };

  const handleEmployeeToggle = (employeeId, mode = 'recurring') => {
    const stateUpdater = mode === 'recurring' ? setTimesheetRecurringMode : setTimesheetAdhocMode;
    stateUpdater(prev => ({
      ...prev,
      selectedEmployees: prev.selectedEmployees.includes(employeeId)
        ? prev.selectedEmployees.filter(id => id !== employeeId)
        : [...prev.selectedEmployees, employeeId]
    }));
  };

  const addEmailRecipient = (mode = 'recurring') => {
    if (newEmailRecipient && newEmailRecipient.includes('@')) {
      const stateUpdater = mode === 'recurring' ? setTimesheetRecurringMode : setTimesheetAdhocMode;
      stateUpdater(prev => ({
        ...prev,
        emailRecipients: [...prev.emailRecipients, newEmailRecipient.trim()]
      }));
      setNewEmailRecipient('');
    }
  };

  const removeEmailRecipient = (index, mode = 'recurring') => {
    const stateUpdater = mode === 'recurring' ? setTimesheetRecurringMode : setTimesheetAdhocMode;
    stateUpdater(prev => ({
      ...prev,
      emailRecipients: prev.emailRecipients.filter((_, i) => i !== index)
    }));
  };

  // Fetch available employees for timesheet agents
  const fetchAvailableEmployees = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/employees`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const employees = await response.json();
        setAvailableEmployees(employees);
      }
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  };

  // Fetch default pay period settings
  const fetchDefaultPayPeriods = async () => {
    try {
      // Get all pay period settings
      const response = await fetch(`${API_BASE_URL}/api/pay-period-settings`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        const allSettings = await response.json();
        
        // Create a Map to ensure only one setting per period_type
        const periodTypeMap = new Map();
        
        // First pass: prioritize default settings
        allSettings.forEach(setting => {
          if (setting.is_default) {
            periodTypeMap.set(setting.period_type, setting);
          }
        });
        
        // Second pass: add non-defaults only if period_type not already exists
        allSettings.forEach(setting => {
          if (!periodTypeMap.has(setting.period_type)) {
            periodTypeMap.set(setting.period_type, setting);
          }
        });
        
        // Convert Map values to array and ensure unique period types
        const uniqueSettings = Array.from(periodTypeMap.values());
        
        setDefaultPayPeriods(uniqueSettings);
        
        // Find the default setting among unique settings
        const defaultSetting = uniqueSettings.find(setting => setting.is_default);
        
        if (defaultSetting) {
          setSelectedPayPeriod(defaultSetting);
          setTimesheetRecurringMode(prev => ({
            ...prev,
            runEveryPayPeriod: defaultSetting.period_type
          }));
        } else if (uniqueSettings.length > 0) {
          // If no default found, use the first unique setting
          setSelectedPayPeriod(uniqueSettings[0]);
          setTimesheetRecurringMode(prev => ({
            ...prev,
            runEveryPayPeriod: uniqueSettings[0].period_type
          }));
        }
      }
    } catch (error) {
      console.error('Error fetching default pay periods:', error);
    }
  };

  // Fetch existing timesheet reports for adhoc mode
  const fetchExistingTimesheetReports = async () => {
    try {
      // Fetch AI posts that are timesheet reports (platform = "timesheet")
      const response = await fetch(`${API_BASE_URL}/api/ai-posts?limit=20`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        const posts = await response.json();
        // Filter for timesheet reports
        const timesheetReports = posts.filter(post => 
          post.platforms && post.platforms.includes('timesheet') && post.timesheet_data
        );
        
        // Transform to the format expected by the adhoc form
        const formattedReports = timesheetReports.map(report => ({
          id: `report_${report.id}`,
          label: `${report.agent_name} - ${formatDateRange(
            new Date(report.timesheet_data.start_date), 
            new Date(report.timesheet_data.end_date)
          )}`,
          start_date: report.timesheet_data.start_date,
          end_date: report.timesheet_data.end_date,
          period_type: report.timesheet_data.report_period || 'custom',
          report_id: report.id,
          agent_name: report.agent_name,
          status: report.status
        }));
        
        setExistingTimesheetReports(formattedReports);
      }
    } catch (error) {
      console.error('Error fetching existing timesheet reports:', error);
    }
  };

  // Fetch available holidays for email agents
  const fetchAvailableHolidays = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/holidays/enabled`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const holidays = await response.json();
        setAvailableHolidays(holidays);
      }
    } catch (error) {
      console.error('Error fetching holidays:', error);
    }
  };

  // Fetch available customers for email agents
  const fetchAvailableCustomers = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/customers`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const customers = await response.json();
        setAvailableCustomers(customers);
      }
    } catch (error) {
      console.error('Error fetching customers:', error);
    }
  };

  // Helper functions
  const getDayNumber = (dayName) => {
    const days = {
      'sunday': 0, 'monday': 1, 'tuesday': 2, 'wednesday': 3,
      'thursday': 4, 'friday': 5, 'saturday': 6
    };
    return days[dayName.toLowerCase()] || 0;
  };

  const formatDateRange = (startDate, endDate) => {
    const options = { month: 'short', day: 'numeric' };
    const start = startDate.toLocaleDateString('en-US', options);
    const end = endDate.toLocaleDateString('en-US', options);
    return `${start} - ${end}`;
  };

  // Auto-calculate dates based on report period
  const calculateDateRange = (period) => {
    const today = new Date();
    let startDate = '';
    let endDate = '';

    switch (period) {
      case 'current_week':
        const currentMonday = new Date(today);
        currentMonday.setDate(today.getDate() - today.getDay() + 1);
        const currentSunday = new Date(currentMonday);
        currentSunday.setDate(currentMonday.getDate() + 6);
        startDate = currentMonday.toISOString().split('T')[0];
        endDate = currentSunday.toISOString().split('T')[0];
        break;
      case 'last_week':
        const lastMonday = new Date(today);
        lastMonday.setDate(today.getDate() - today.getDay() - 6);
        const lastSunday = new Date(lastMonday);
        lastSunday.setDate(lastMonday.getDate() + 6);
        startDate = lastMonday.toISOString().split('T')[0];
        endDate = lastSunday.toISOString().split('T')[0];
        break;
      case 'current_month':
        const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
        const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        startDate = firstDay.toISOString().split('T')[0];
        endDate = lastDay.toISOString().split('T')[0];
        break;
      case 'last_month':
        const firstDayLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        const lastDayLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);
        startDate = firstDayLastMonth.toISOString().split('T')[0];
        endDate = lastDayLastMonth.toISOString().split('T')[0];
        break;
      default:
        break;
    }

    return { startDate, endDate };
  };

  // Update dates when report period changes
  const handleReportPeriodChange = (period, mode = 'recurring') => {
    const { startDate, endDate } = calculateDateRange(period);
    const stateUpdater = mode === 'recurring' ? setTimesheetRecurringMode : setTimesheetAdhocMode;
    
    stateUpdater(prev => ({
      ...prev,
      reportPeriod: period,
      customStartDate: period === 'custom' ? prev.customStartDate : startDate,
      customEndDate: period === 'custom' ? prev.customEndDate : endDate
    }));
  };

  const handleImageUpload = (event, mode = 'recurring') => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    let stateUpdater;
    if (mode === 'recurring') stateUpdater = setRecurringMode;
    else if (mode === 'adhoc') stateUpdater = setAdhocMode;
    else if (mode === 'write') stateUpdater = setWritePostMode;
    else if (mode === 'email_scheduled') stateUpdater = setEmailScheduledMode;
    else if (mode === 'email_recurring') stateUpdater = setEmailRecurringMode;
    else if (mode === 'email_write') stateUpdater = setEmailWriteMode;
    
    // In real implementation, you'd upload to server and get URLs
    const fileArray = Array.from(files);
    const newImages = fileArray.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      name: file.name
    }));

    stateUpdater(prev => ({
      ...prev,
      uploadedImages: [...prev.uploadedImages, ...newImages]
    }));
  };

  const removeUploadedImage = (index, mode = 'recurring') => {
    let stateUpdater;
    if (mode === 'recurring') stateUpdater = setRecurringMode;
    else if (mode === 'adhoc') stateUpdater = setAdhocMode;
    else if (mode === 'write') stateUpdater = setWritePostMode;
    else if (mode === 'email_scheduled') stateUpdater = setEmailScheduledMode;
    else if (mode === 'email_recurring') stateUpdater = setEmailRecurringMode;
    else if (mode === 'email_write') stateUpdater = setEmailWriteMode;
    
    stateUpdater(prev => ({
      ...prev,
      uploadedImages: prev.uploadedImages.filter((_, i) => i !== index)
    }));
  };

  // Helper functions to check if forms are valid (for button state)
  const isTimesheetAdhocModeValid = () => {
    return timesheetAdhocMode.agentName.trim() && 
           (timesheetAdhocMode.reportPeriod !== 'custom' || 
            (timesheetAdhocMode.customStartDate && timesheetAdhocMode.customEndDate)) &&
           (!timesheetAdhocMode.autoEmail || timesheetAdhocMode.emailRecipients.length > 0);
  };

  const isTimesheetRecurringModeValid = () => {
    return timesheetRecurringMode.agentName.trim() && 
           (!timesheetRecurringMode.autoEmail || timesheetRecurringMode.emailRecipients.length > 0);
  };

  // Validation functions for timesheet agents
  const validateTimesheetAdhocMode = () => {
    const errors = [];
    
    // Required fields
    if (!timesheetAdhocMode.agentName.trim()) {
      errors.push("Agent Name is required");
    }
    
    // Custom date range validation
    if (timesheetAdhocMode.reportPeriod === 'custom') {
      if (!timesheetAdhocMode.customStartDate) {
        errors.push("Custom Start Date is required when using custom report period");
      }
      if (!timesheetAdhocMode.customEndDate) {
        errors.push("Custom End Date is required when using custom report period");
      }
      if (timesheetAdhocMode.customStartDate && timesheetAdhocMode.customEndDate) {
        const startDate = new Date(timesheetAdhocMode.customStartDate);
        const endDate = new Date(timesheetAdhocMode.customEndDate);
        if (startDate > endDate) {
          errors.push("Start Date must be before End Date");
        }
      }
    }
    
    // Email validation
    if (timesheetAdhocMode.autoEmail && timesheetAdhocMode.emailRecipients.length === 0) {
      errors.push("At least one email recipient is required when auto-email is enabled");
    }
    
    // Validate email format
    for (const email of timesheetAdhocMode.emailRecipients) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        errors.push(`Invalid email format: ${email}`);
      }
    }
    
    return errors;
  };

  const validateTimesheetRecurringMode = () => {
    const errors = [];
    
    // Required fields
    if (!timesheetRecurringMode.agentName.trim()) {
      errors.push("Agent Name is required");
    }
    
    // Email validation
    if (timesheetRecurringMode.autoEmail && timesheetRecurringMode.emailRecipients.length === 0) {
      errors.push("At least one email recipient is required when auto-email is enabled");
    }
    
    // Validate email format
    for (const email of timesheetRecurringMode.emailRecipients) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        errors.push(`Invalid email format: ${email}`);
      }
    }
    
    return errors;
  };

  const saveAgent = async () => {
    setLoading(true);
    
    // Show loading modal for both create and edit modes
    setShowSaveModal(true);
    setMessage({ type: '', text: '' });

    try {
      let agentData;
      const agentType = searchParams.get('agent_type');
      
      if (agentType === 'time_sheet') {
        // Handle timesheet agents - validate before proceeding
        if (activeTab === 'timesheet-recurring') {
          // Validate timesheet recurring mode
          const validationErrors = validateTimesheetRecurringMode();
          if (validationErrors.length > 0) {
            setMessage({ 
              type: 'error', 
              text: `Please fix the following issues: ${validationErrors.join(', ')}` 
            });
            setLoading(false);
            setShowSaveModal(false);
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
          }
          agentData = {
            agent_type: 'time_sheet',
            mode: 'recurring',
            agent_name: timesheetRecurringMode.agentName,
            // Timesheet specific fields
            selected_employees: timesheetRecurringMode.selectedEmployees,
            run_every_pay_period: timesheetRecurringMode.runEveryPayPeriod,
            days_after_period_end: timesheetRecurringMode.daysAfterPeriodEnd,
            custom_start_date: timesheetRecurringMode.customStartDate,
            custom_end_date: timesheetRecurringMode.customEndDate,
            include_billing_rates: timesheetRecurringMode.includeBillingRates,
            initial_status: timesheetRecurringMode.initialStatus,
            email_recipients: timesheetRecurringMode.emailRecipients,
            auto_email: timesheetRecurringMode.autoEmail,
            frequency: timesheetRecurringMode.runEveryPayPeriod, // Keep backward compatibility
            schedule_time: timesheetRecurringMode.scheduleTime,
            days_of_week: timesheetRecurringMode.daysOfWeek,
            // Required fields for AI agents (defaults for timesheet agents)
            topic: 'Timesheet Report',
            image_option: 'ai_generate',
            social_platforms: {},
            word_count: '100',
            post_destination: timesheetRecurringMode.initialStatus
          };
        } else if (activeTab === 'timesheet-adhoc') {
          // Validate timesheet adhoc mode
          const validationErrors = validateTimesheetAdhocMode();
          if (validationErrors.length > 0) {
            setMessage({ 
              type: 'error', 
              text: `Please fix the following issues: ${validationErrors.join(', ')}` 
            });
            setLoading(false);
            setShowSaveModal(false);
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
          }
          agentData = {
            agent_type: 'time_sheet',
            mode: 'adhoc',
            agent_name: timesheetAdhocMode.agentName,
            // Timesheet specific fields
            selected_employees: timesheetAdhocMode.selectedEmployees,
            report_period: timesheetAdhocMode.reportPeriod,
            custom_start_date: timesheetAdhocMode.customStartDate,
            custom_end_date: timesheetAdhocMode.customEndDate,
            include_billing_rates: timesheetAdhocMode.includeBillingRates,
            initial_status: timesheetAdhocMode.initialStatus,
            email_recipients: timesheetAdhocMode.emailRecipients,
            auto_email: timesheetAdhocMode.autoEmail,
            // Required fields for AI agents (defaults for timesheet agents)
            topic: 'Timesheet Report',
            image_option: 'ai_generate',
            social_platforms: {},
            word_count: '100',
            post_destination: timesheetAdhocMode.initialStatus
          };
        }
      } else if (agentType === 'email') {
        // Handle email agents
        if (activeTab === 'email-scheduled') {
          console.log('Email scheduled mode data being saved:', {
            useChatGPTFormatting: emailScheduledMode.useChatGPTFormatting,
            emailContentTemplate: emailScheduledMode.emailContentTemplate
          });
          
          agentData = {
            agent_type: 'email',
            mode: 'recurring', // Scheduled emails are recurring based on holidays
            agent_name: emailScheduledMode.agentName,
            // No topic required for scheduled email agents - holidays define the context
            selected_holidays: emailScheduledMode.selectedHolidays,
            image_option: emailScheduledMode.imageOption,
            uploaded_images: emailScheduledMode.uploadedImages,
            image_text: emailScheduledMode.imageText,
            word_count: emailScheduledMode.wordCount,
            use_chatgpt_formatting: emailScheduledMode.useChatGPTFormatting, // Updated field name
            post_time: emailScheduledMode.postTime,
            post_destination: emailScheduledMode.postDestination,
            auto_post: emailScheduledMode.postDestination === 'auto_send',
            email_content_template: emailScheduledMode.emailContentTemplate, // Add the template
            use_customer_database: true, // Always true for scheduled mode
          };
        } else if (activeTab === 'email-write') {
          agentData = {
            agent_type: 'email',
            mode: 'write',
            agent_name: emailWriteMode.agentName,
            email_subject: emailWriteMode.emailSubject,
            email_content: emailWriteMode.emailContent,
            image_option: emailWriteMode.imageOption,
            uploaded_images: emailWriteMode.uploadedImages,
            image_text: emailWriteMode.imageText,
            word_count: emailWriteMode.wordCount,
            use_chatgpt_formatting: emailWriteMode.useChatGPTFormatting, // Updated field name
            post_date: emailWriteMode.postDate,
            post_time: emailWriteMode.postTime,
            post_destination: emailWriteMode.postDestination,
            auto_post: emailWriteMode.postDestination === 'auto_post',
            email_type: emailWriteMode.emailType, // Add email type (bulk/single)
            selected_customer: emailWriteMode.selectedCustomer, // Add selected customer for single emails
          };
        } else if (activeTab === 'email-recurring') {
          agentData = {
            agent_type: 'email',
            mode: 'recurring',
            agent_name: emailRecurringMode.agentName,
            topic: emailRecurringMode.topic === 'Custom' ? emailRecurringMode.customTopic : emailRecurringMode.topic, // Use custom topic if selected
            word_count: emailRecurringMode.wordCount,
            // Schedule fields (replacing holiday fields)
            schedule_type: emailRecurringMode.scheduleType,
            days_of_week: emailRecurringMode.daysOfWeek, // For weekly
            monthly_schedule: emailRecurringMode.monthlySchedule, // For monthly  
            email_content_template: emailRecurringMode.emailContentTemplate,
            post_time: emailRecurringMode.postTime,
            image_option: emailRecurringMode.imageOption,
            uploaded_images: emailRecurringMode.uploadedImages,
            image_text: emailRecurringMode.imageText,
            post_destination: emailRecurringMode.postDestination,
            auto_post: emailRecurringMode.postDestination === 'auto_send',
            use_customer_database: true, // Always use customer database for recurring emails
          };
        }
      } else if (agentType === 'sms_agent') {
        // Handle SMS agents
        if (activeTab === 'sms-scheduled') {
          agentData = {
            agent_type: 'sms_agent',
            mode: 'recurring', // Scheduled SMS are recurring based on holidays
            agent_name: smsScheduledMode.agentName,
            selected_holidays: smsScheduledMode.selectedHolidays,
            sms_template: smsScheduledMode.smsContentTemplate,
            sms_provider: smsScheduledMode.smsProvider,
            use_sms_chatgpt_formatting: smsScheduledMode.useSMSChatGPTFormatting,
            post_time: smsScheduledMode.postTime,
            post_destination: smsScheduledMode.postDestination,
            auto_post: smsScheduledMode.postDestination === 'auto_send',
            use_customer_database: smsScheduledMode.useCustomerDatabase,
            sms_type: smsScheduledMode.smsType,
            selected_sms_customer: smsScheduledMode.selectedCustomer,
            sms_character_limit: smsScheduledMode.smsCharacterLimit
          };
        } else if (activeTab === 'sms-write') {
          agentData = {
            agent_type: 'sms_agent',
            mode: 'write',
            agent_name: smsWriteMode.agentName,
            sms_subject: smsWriteMode.smsSubject,
            sms_content: smsWriteMode.smsContent,
            sms_provider: smsWriteMode.smsProvider,
            use_sms_chatgpt_formatting: smsWriteMode.useSMSChatGPTFormatting,
            post_date: smsWriteMode.postDate,
            post_time: smsWriteMode.postTime,
            post_destination: smsWriteMode.postDestination,
            auto_post: smsWriteMode.postDestination === 'auto_post',
            sms_type: smsWriteMode.smsType,
            selected_sms_customer: smsWriteMode.selectedCustomer,
            sms_character_limit: smsWriteMode.smsCharacterLimit
          };
        } else if (activeTab === 'sms-recurring') {
          agentData = {
            agent_type: 'sms_agent',
            mode: 'recurring',
            agent_name: smsRecurringMode.agentName,
            topic: smsRecurringMode.topic === 'Custom' ? smsRecurringMode.customTopic : smsRecurringMode.topic,
            schedule_type: smsRecurringMode.scheduleType,
            days_of_week: smsRecurringMode.daysOfWeek,
            monthly_schedule: smsRecurringMode.monthlySchedule,
            sms_template: smsRecurringMode.smsContentTemplate,
            post_time: smsRecurringMode.postTime,
            post_destination: smsRecurringMode.postDestination,
            auto_post: smsRecurringMode.postDestination === 'auto_send',
            sms_provider: smsRecurringMode.smsProvider,
            use_sms_chatgpt_formatting: smsRecurringMode.useSMSChatGPTFormatting,
            sms_type: smsRecurringMode.smsType,
            sms_character_limit: smsRecurringMode.smsCharacterLimit,
            use_customer_database: true
          };
        }
      } else {
        // Handle social media agents (existing logic)
        if (activeTab === 'social-media-recurring') {
          // For editing existing agents, preserve the original mode (auto/recurring)
          const modeToSend = isEditMode && editingAgentData?.mode === 'auto' ? 'auto' : 'recurring';
          agentData = { ...recurringMode, mode: modeToSend };
        } else if (activeTab === 'social-media-adhoc') {
          agentData = { ...adhocMode, mode: 'adhoc' };
        } else if (activeTab === 'social-media-write') {
          agentData = { ...writePostMode, mode: 'write' };
        }

        // Convert camelCase to snake_case for backend (social media agents only)
        const socialMediaFields = {
          social_platforms: agentData.socialPlatforms,
          post_title: agentData.postTitle,
          post_content: agentData.postContent,
          use_web_research: agentData.useWebResearch,
          image_option: agentData.imageOption,
          uploaded_images: agentData.uploadedImages,
          post_time: agentData.postTime,
          image_text: agentData.imageText,
          word_count: agentData.wordCount,
          days_of_week: agentData.daysOfWeek,
          schedule_type: agentData.scheduleType,
          auto_post: agentData.postDestination === 'auto_post',
          post_destination: agentData.postDestination,
          post_date: agentData.postDate,
          agent_name: agentData.agentName,
          custom_topic: agentData.customTopic
        };

        agentData = { ...agentData, ...socialMediaFields };
        
        // Remove camelCase fields
        delete agentData.socialPlatforms;
        delete agentData.postTitle;
        delete agentData.postContent;
        delete agentData.useWebResearch;
        delete agentData.imageOption;
        delete agentData.uploadedImages;
        delete agentData.postTime;
        delete agentData.imageText;
        delete agentData.wordCount;
        delete agentData.daysOfWeek;
        delete agentData.scheduleType;
        delete agentData.autoPost;
        delete agentData.postDestination;
        delete agentData.postDate;
        delete agentData.agentName;
        delete agentData.customTopic;
      }

      // Debug: Log the data being sent
      console.log('Sending agent data:', agentData);
      console.log('Agent type:', agentType);
      
      // Specific debug for email agents
      if (agentType === 'email' && agentData.use_chatgpt_formatting !== undefined) {
        console.log('EMAIL AGENT DEBUG - Fields being sent:');
        console.log('- use_chatgpt_formatting:', agentData.use_chatgpt_formatting);
        console.log('- email_content_template:', agentData.email_content_template);
      }

      // Determine if we're in edit mode and get agent ID
      const urlParams = new URLSearchParams(window.location.search);
      const agentId = urlParams.get('id');
      const isEditing = isEditMode && agentId;

      // Use unified ai-agents endpoints for all agent types (timesheet, social media, etc.)
      const url = isEditing 
        ? `${API_BASE_URL}/api/ai-agents/${agentId}`
        : `${API_BASE_URL}/api/ai-agents`;
      const method = isEditing ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method: method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(agentData)
      });

      if (response.ok) {
        const agentTypeText = agentType === 'time_sheet' ? 'Timesheet' : 'Social Media';
        const modeText = activeTab === 'recurring' ? 'Recurring' : activeTab === 'adhoc' ? 'Adhoc' : 'Custom Post';
        const actionText = isEditMode ? 'updated' : 'configured';
        setMessage({ 
          type: 'success', 
          text: `${agentTypeText} ${modeText} agent ${actionText} successfully!` 
        });
        fetchAgents();
        
        // Redirect to appropriate dashboard after successful save
        if (isEditMode) {
          // Brief delay to show success message, then redirect
          setTimeout(() => {
            navigate('/ai-agents-dashboard');
            // Keep modal visible during redirect - it will be hidden when component unmounts
          }, 1500);
        } else {
          // For new agents, show success message briefly then redirect to dashboard
          // Add longer delay to ensure database write completes before dashboard loads
          setTimeout(() => {
            navigate('/ai-agents-dashboard');
          }, 2500);
        }
        
        // Reset form only when creating new agents (not when editing)
        // Note: Form reset removed since we now redirect to dashboard
        // Users won't see the form after successful creation
      } else {
        const errorData = await response.json();
        let errorText = 'Failed to save agent configuration';
        
        if (errorData.detail) {
          if (Array.isArray(errorData.detail)) {
            // Handle FastAPI validation errors
            errorText = errorData.detail.map(err => {
              const field = err.loc ? err.loc[err.loc.length - 1] : 'field';
              return `${field}: ${err.msg || 'Invalid value'}`;
            }).join(', ');
          } else if (typeof errorData.detail === 'string') {
            errorText = errorData.detail;
          }
        }
        
        setMessage({ type: 'error', text: errorText });
        
        // Hide loading modal on error
        setShowSaveModal(false);
        
        // Scroll to top to show error message
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch (error) {
      console.error('Error saving agent:', error);
      setMessage({ type: 'error', text: 'Network error. Please try again.' });
      
      // Hide loading modal on error
      setShowSaveModal(false);
      
      // Scroll to top to show error message
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setLoading(false);
    }
  };

  const saveAndRunAgent = async () => {
    if (!editingAgentData) return;
    
    setLoading(true);
    setShowSaveModal(true);
    setMessage({ type: '', text: '' });

    try {
      // First, save/update the agent configuration
      let agentData;
      if (activeTab === 'social-media-recurring') {
        // For editing existing agents, preserve the original mode (auto/recurring)
        const modeToSend = isEditMode && editingAgentData?.mode === 'auto' ? 'auto' : 'recurring';
        agentData = { ...recurringMode, mode: modeToSend };
      } else if (activeTab === 'social-media-adhoc') {
        agentData = { ...adhocMode, mode: 'adhoc' };
      } else if (activeTab === 'social-media-write') {
        agentData = { ...writePostMode, mode: 'write' };
      }

      // Convert camelCase to snake_case for backend
      const backendData = {
        ...agentData,
        social_platforms: agentData.socialPlatforms,
        post_title: agentData.postTitle,
        post_content: agentData.postContent,
        use_web_research: agentData.useWebResearch,
        image_option: agentData.imageOption,
        uploaded_images: agentData.uploadedImages,
        post_time: agentData.postTime,
        image_text: agentData.imageText,
        word_count: agentData.wordCount,
        days_of_week: agentData.daysOfWeek,
        schedule_type: agentData.scheduleType,
        auto_post: agentData.postDestination === 'auto_post',
        post_destination: agentData.postDestination,
        post_date: agentData.postDate,
        agent_name: agentData.agentName,
        custom_topic: agentData.customTopic
      };
      
      // Remove camelCase fields
      delete backendData.socialPlatforms;
      delete backendData.postTitle;
      delete backendData.postContent;
      delete backendData.useWebResearch;
      delete backendData.imageOption;
      delete backendData.uploadedImages;
      delete backendData.postTime;
      delete backendData.imageText;
      delete backendData.wordCount;
      delete backendData.daysOfWeek;
      delete backendData.scheduleType;
      delete backendData.autoPost;
      delete backendData.postDestination;
      delete backendData.postDate;
      delete backendData.agentName;
      delete backendData.customTopic;

      // Update the agent configuration
      const updateResponse = await fetch(`${API_BASE_URL}/api/ai-agents/${editingAgentData.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(backendData)
      });

      if (!updateResponse.ok) {
        throw new Error('Failed to update agent configuration');
      }

      // Then execute the agent with the updated configuration
      const executeResponse = await fetch(`${API_BASE_URL}/api/ai-agents/${editingAgentData.id}/execute`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });

      if (executeResponse.ok) {
        setMessage({ 
          type: 'success', 
          text: 'Agent updated and executed successfully! Check the dashboard for post status.'
        });
        
        // Redirect to dashboard after successful update and run
        setTimeout(() => {
          navigate('/ai-agents-dashboard');
        }, 2000);
      } else {
        const errorData = await executeResponse.json();
        setMessage({ 
          type: 'error', 
          text: `Agent updated but execution failed: ${errorData.detail || 'Unknown error'}` 
        });
      }
    } catch (error) {
      console.error('Error updating and running agent:', error);
      setMessage({ type: 'error', text: 'Failed to update and run agent. Please try again.' });
    } finally {
      setLoading(false);
      setShowSaveModal(false);
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
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        
        {/* Sticky Header */}
        <div className="sticky top-24 z-40 bg-white rounded-xl shadow-lg overflow-hidden mb-6">
          {/* Header */}
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {/* Icon based on agent type */}
                {searchParams.get('agent_type') === 'time_sheet' ? (
                  <Timer className="h-8 w-8 text-blue-600" />
                ) : (
                  <Bot className="h-8 w-8 text-blue-600" />
                )}
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    {(() => {
                      const agentType = searchParams.get('agent_type');
                      if (isRunMode) {
                        return agentType === 'time_sheet' ? 'Run Timesheet AI Agent' : 'Run Social Media AI Agent';
                      } else if (isEditMode) {
                        return agentType === 'time_sheet' ? 'Edit Timesheet AI Agent' : 
                               agentType === 'email' ? 'Edit Email AI Agent' : 'Edit Social Media AI Agent';
                      } else {
                        return agentType === 'time_sheet' ? 'Create New Timesheet Agent' : 
                               agentType === 'email' ? 'Create New Email Agent' : 'Create New Social Media Agent';
                      }
                    })()}
                  </h2>
                  <p className="text-sm text-gray-600">
                    {(() => {
                      const agentType = searchParams.get('agent_type');
                      if (isRunMode) {
                        return agentType === 'time_sheet' 
                          ? 'Make changes and run your timesheet agent' 
                          : agentType === 'email'
                          ? 'Make changes and run your email agent'
                          : 'Make changes and run your social media agent';
                      } else if (isEditMode) {
                        return agentType === 'time_sheet'
                          ? 'Modify your timesheet agent settings'
                          : agentType === 'email'
                          ? 'Modify your email agent settings'
                          : 'Modify your social media agent settings';
                      } else {
                        return agentType === 'time_sheet'
                          ? 'Configure automated timesheet generation with AI-powered reporting'
                          : agentType === 'email'
                          ? 'Configure AI agents for automated email campaigns and customer communication'
                          : 'Configure AI agents for automated social media posting';
                      }
                    })()}
                  </p>
                </div>
              </div>
              {/* Back button - always show */}
              <button
                onClick={() => navigate('/ai-agents-dashboard')}
                className="flex items-center px-4 py-2 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
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

            {/* Tab Navigation */}
            <div className="border border-gray-200 rounded-lg mb-4 sm:mb-6">
              <div className="border-b border-gray-200">
                <nav className="flex flex-col sm:flex-row sm:space-x-8 px-3 sm:px-6" aria-label="Tabs">
                  {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    // In edit mode, disable tabs that don't match the agent being edited
                    const isDisabled = isEditMode && editingAgentMode && tab.id !== activeTab;
                    
                    return (
                      <button
                        key={tab.id}
                        onClick={() => !isDisabled && setActiveTab(tab.id)}
                        disabled={isDisabled}
                        className={`w-full sm:w-auto py-3 sm:py-4 px-3 sm:px-1 border-b-2 sm:border-l-0 font-medium text-sm transition-colors border-transparent ${
                          isDisabled 
                            ? 'text-gray-300 cursor-not-allowed opacity-50' 
                            : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                        style={{
                          borderBottomColor: isActive ? '#29add3' : 'transparent',
                          color: isActive ? '#29add3' : isDisabled ? '#d1d5db' : undefined,
                          backgroundColor: isActive ? '#f0fdff' : 'transparent'
                        }}
                      >
                        <div className="flex items-center justify-center sm:justify-start space-x-2">
                          <Icon className={`h-4 w-4 ${isDisabled ? 'opacity-50' : ''}`} 
                                style={{ color: isActive ? tab.color : isDisabled ? '#d1d5db' : undefined }} />
                          <span>{tab.label}</span>
                          {isDisabled && (
                            <span className="text-xs text-gray-400 ml-1">(disabled)</span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </nav>
              </div>

              {/* Tab Content */}
              <div className="p-3 sm:p-6">
                {/* Recurring Mode Tab - Now handles different agent types with specific IDs */}
                {(activeTab === 'recurring' || activeTab === 'timesheet-recurring' || activeTab === 'social-media-recurring') && (
                  <div className="space-y-6">
                    {/* Check if this is a timesheet agent */}
                    {searchParams.get('agent_type') === 'time_sheet' ? (
                      // Timesheet Recurring Mode Form
                      <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* Agent Name */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              <Timer className="h-4 w-4 inline mr-2" />
                              Agent Name *
                            </label>
                            <input
                              type="text"
                              value={timesheetRecurringMode.agentName}
                              onChange={(e) => handleTimesheetRecurringModeChange('agentName', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="e.g., Weekly Payroll Report Agent"
                              required
                            />
                          </div>

                          {/* Run Every PayPeriod - Based on All Pay Period Settings */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              <Clock className="h-4 w-4 inline mr-2" />
                              Run Every PayPeriod *
                            </label>
                            <select
                              value={timesheetRecurringMode.runEveryPayPeriod}
                              onChange={(e) => {
                                handleTimesheetRecurringModeChange('runEveryPayPeriod', e.target.value);
                                // Update selected pay period when changed
                                const selectedSetting = defaultPayPeriods.find(p => p.period_type === e.target.value);
                                if (selectedSetting) {
                                  setSelectedPayPeriod(selectedSetting);
                                }
                              }}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-100 cursor-not-allowed"
                              disabled
                              required
                            >
                              {defaultPayPeriods.map(period => (
                                <option key={period.id} value={period.period_type}>
                                  {period.period_type === 'weekly' ? 'Weekly' : 
                                   period.period_type === 'bi_weekly' ? 'Bi-Weekly' : 'Monthly'}
                                </option>
                              ))}
                            </select>
                            <p className="text-xs text-gray-500 mt-1">
                              Uses the default pay period configured in Timesheet Configuration. Agent will run after each completed pay period.
                            </p>
                          </div>

                          {/* Days After Period End */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              <Calendar className="h-4 w-4 inline mr-2" />
                              Days After Period End *
                            </label>
                            <select
                              value={timesheetRecurringMode.daysAfterPeriodEnd}
                              onChange={(e) => handleTimesheetRecurringModeChange('daysAfterPeriodEnd', parseInt(e.target.value))}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              required
                            >
                              {Array.from({length: 7}, (_, i) => i + 1).map(day => (
                                <option key={day} value={day}>
                                  {day} day{day > 1 ? 's' : ''} after
                                </option>
                              ))}
                            </select>
                            <p className="text-xs text-gray-500 mt-1">
                              {selectedPayPeriod && (
                                <>
                                  If pay period ends on a {selectedPayPeriod.weekly_config?.end_day || 
                                    selectedPayPeriod.bi_weekly_config?.end_day || 'day'}, 
                                  agent runs {timesheetRecurringMode.daysAfterPeriodEnd} day{timesheetRecurringMode.daysAfterPeriodEnd > 1 ? 's' : ''} later
                                </>
                              )}
                            </p>
                          </div>

                          {/* Schedule Time */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              <Clock className="h-4 w-4 inline mr-2" />
                              Schedule Time
                            </label>
                            <input
                              type="time"
                              value={timesheetRecurringMode.scheduleTime}
                              onChange={(e) => handleTimesheetRecurringModeChange('scheduleTime', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                        </div>

                        {/* Pay Period Configuration Display */}
                        {selectedPayPeriod && (
                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <h4 className="font-medium text-blue-900 mb-2 flex items-center">
                              <Calendar className="h-5 w-5 mr-2" />
                              Selected Pay Period Configuration
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="font-medium text-blue-800">Period Type:</span>
                                <span className="ml-2 text-blue-900">
                                  {selectedPayPeriod.period_type === 'weekly' ? 'Weekly' : 
                                   selectedPayPeriod.period_type === 'bi_weekly' ? 'Bi-Weekly' : 'Monthly'}
                                </span>
                              </div>
                              {selectedPayPeriod.weekly_config && (
                                <div>
                                  <span className="font-medium text-blue-800">Period:</span>
                                  <span className="ml-2 text-blue-900">
                                    {selectedPayPeriod.weekly_config.start_day.charAt(0).toUpperCase() + selectedPayPeriod.weekly_config.start_day.slice(1)} to {' '}
                                    {selectedPayPeriod.weekly_config.end_day.charAt(0).toUpperCase() + selectedPayPeriod.weekly_config.end_day.slice(1)}
                                  </span>
                                </div>
                              )}
                              {selectedPayPeriod.bi_weekly_config && (
                                <div>
                                  <span className="font-medium text-blue-800">Period:</span>
                                  <span className="ml-2 text-blue-900">
                                    {selectedPayPeriod.bi_weekly_config.start_day.charAt(0).toUpperCase() + selectedPayPeriod.bi_weekly_config.start_day.slice(1)} to {' '}
                                    {selectedPayPeriod.bi_weekly_config.end_day.charAt(0).toUpperCase() + selectedPayPeriod.bi_weekly_config.end_day.slice(1)} (Every 2 weeks)
                                  </span>
                                </div>
                              )}
                              {selectedPayPeriod.monthly_config && (
                                <div>
                                  <span className="font-medium text-blue-800">Period:</span>
                                  <span className="ml-2 text-blue-900">
                                    {selectedPayPeriod.monthly_config.start_day === 1 ? '1st' : `${selectedPayPeriod.monthly_config.start_day}th`} to {' '}
                                    {selectedPayPeriod.monthly_config.end_day === -1 ? 'Last Day' : 
                                     selectedPayPeriod.monthly_config.end_day === 1 ? '1st' : `${selectedPayPeriod.monthly_config.end_day}th`}
                                  </span>
                                </div>
                              )}
                            </div>
                            <div className="mt-3 p-2 bg-blue-100 rounded text-sm">
                              <span className="font-semibold text-blue-900">Agent Schedule:</span>
                              <span className="text-blue-800 ml-1">
                                Will run {timesheetRecurringMode.daysAfterPeriodEnd} day{timesheetRecurringMode.daysAfterPeriodEnd > 1 ? 's' : ''} after each pay period ends at {timesheetRecurringMode.scheduleTime}
                              </span>
                            </div>
                          </div>
                        )}

                        {/* Employee Selection - No Email */}
                        <div className="space-y-3">
                          <label className="block text-sm font-medium text-gray-700 mb-3">
                            <Users className="h-4 w-4 inline mr-2" />
                            Employee Selection
                          </label>
                          <p className="text-sm text-gray-600 mb-3">
                            Select specific employees for this report (leave none selected to include all employees)
                          </p>
                          <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-md p-3">
                            {availableEmployees.length > 0 ? (
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                {availableEmployees.map((employee) => (
                                  <label key={employee.id} className="flex items-center p-2 hover:bg-gray-100 rounded">
                                    <input
                                      type="checkbox"
                                      checked={timesheetRecurringMode.selectedEmployees.includes(employee.id)}
                                      onChange={() => handleEmployeeToggle(employee.id, 'recurring')}
                                      className="h-4 w-4 border-gray-300 rounded"
                                      style={{
                                        accentColor: '#29add3',
                                        filter: 'brightness(1) contrast(1)',
                                        colorScheme: 'light'
                                      }}
                                    />
                                    <span className="ml-2 text-sm text-gray-700">
                                      {employee.full_name}
                                    </span>
                                  </label>
                                ))}
                              </div>
                            ) : (
                              <p className="text-sm text-gray-500">No employees found</p>
                            )}
                          </div>
                          <p className="text-xs text-gray-500 mt-2">
                            Selected: {timesheetRecurringMode.selectedEmployees.length > 0 ? timesheetRecurringMode.selectedEmployees.length : 'All'} employees
                          </p>
                        </div>

                        {/* Report Features */}
                        <div className="space-y-3">
                          <label className="block text-sm font-medium text-gray-700 mb-3">
                            <FileText className="h-4 w-4 inline mr-2" />
                            Report Features
                          </label>
                          <div className="grid grid-cols-1 gap-4">
                            <label className="flex items-center">
                              <input
                                type="checkbox"
                                checked={timesheetRecurringMode.includeBillingRates}
                                onChange={(e) => handleTimesheetRecurringModeChange('includeBillingRates', e.target.checked)}
                                className="h-4 w-4 border-gray-300 rounded"
                                style={{
                                  accentColor: '#29add3',
                                  filter: 'brightness(1) contrast(1)',
                                  colorScheme: 'light'
                                }}
                              />
                              <span className="ml-2 text-sm text-gray-700">Include Billing Rates</span>
                            </label>
                          </div>
                        </div>

                        {/* Workflow Settings */}
                        <div className="space-y-3">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            <Eye className="h-4 w-4 inline mr-2" />
                            Initial Report Status
                          </label>
                          <div className="space-y-2">
                            <label className="flex items-center">
                              <input
                                type="radio"
                                name="timesheetInitialStatus"
                                value="in_review"
                                checked={timesheetRecurringMode.initialStatus === 'in_review'}
                                onChange={(e) => handleTimesheetRecurringModeChange('initialStatus', e.target.value)}
                                className="h-4 w-4 border-gray-300"
                                style={{
                                  accentColor: '#29add3',
                                  filter: 'brightness(1) contrast(1)',
                                  colorScheme: 'light'
                                }}
                              />
                              <div className="ml-3">
                                <span className="text-sm font-medium text-gray-900">In Review</span>
                                <p className="text-xs text-gray-600">Reports go to "In Review" for manager approval</p>
                              </div>
                            </label>
                            <label className="flex items-center">
                              <input
                                type="radio"
                                name="timesheetInitialStatus"
                                value="ready_to_publish"
                                checked={timesheetRecurringMode.initialStatus === 'ready_to_publish'}
                                onChange={(e) => handleTimesheetRecurringModeChange('initialStatus', e.target.value)}
                                className="h-4 w-4 border-gray-300"
                                style={{
                                  accentColor: '#29add3',
                                  filter: 'brightness(1) contrast(1)',
                                  colorScheme: 'light'
                                }}
                              />
                              <div className="ml-3">
                                <span className="text-sm font-medium text-gray-900">Ready to Publish</span>
                                <p className="text-xs text-gray-600">Reports go directly to "Ready to Publish"</p>
                              </div>
                            </label>
                            <label className="flex items-center">
                              <input
                                type="radio"
                                name="timesheetInitialStatus"
                                value="published"
                                checked={timesheetRecurringMode.initialStatus === 'published'}
                                onChange={(e) => handleTimesheetRecurringModeChange('initialStatus', e.target.value)}
                                className="h-4 w-4 border-gray-300"
                                style={{
                                  accentColor: '#29add3',
                                  filter: 'brightness(1) contrast(1)',
                                  colorScheme: 'light'
                                }}
                              />
                              <div className="ml-3">
                                <span className="text-sm font-medium text-gray-900">Auto-Publish</span>
                                <p className="text-xs text-gray-600">Reports are automatically published and emailed</p>
                              </div>
                            </label>
                          </div>
                        </div>

                        {/* Email Configuration */}
                        <div className="space-y-4">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            <Mail className="h-4 w-4 inline mr-2" />
                            Email Configuration
                          </label>
                          
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              checked={timesheetRecurringMode.autoEmail}
                              onChange={(e) => handleTimesheetRecurringModeChange('autoEmail', e.target.checked)}
                              className="h-4 w-4 border-gray-300 rounded"
                              style={{
                                accentColor: '#29add3',
                                filter: 'brightness(1) contrast(1)',
                                colorScheme: 'light'
                              }}
                            />
                            <span className="ml-2 text-sm text-gray-700">Automatically email reports when published</span>
                          </label>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Email Recipients
                            </label>
                            <div className="flex space-x-2 mb-2">
                              <input
                                type="email"
                                value={newEmailRecipient}
                                onChange={(e) => setNewEmailRecipient(e.target.value)}
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Enter email address"
                              />
                              <button
                                type="button"
                                onClick={() => addEmailRecipient('recurring')}
                                className="px-4 py-2 text-white rounded-md transition-colors"
                                style={{
                                  backgroundColor: '#29add3'
                                }}
                                onMouseEnter={(e) => {
                                  e.target.style.backgroundColor = '#2196c7';
                                }}
                                onMouseLeave={(e) => {
                                  e.target.style.backgroundColor = '#29add3';
                                }}
                              >
                                Add
                              </button>
                            </div>
                            
                            {/* Email Recipients List */}
                            {timesheetRecurringMode.emailRecipients.length > 0 && (
                              <div className="border border-gray-200 rounded-md p-3 max-h-32 overflow-y-auto">
                                {timesheetRecurringMode.emailRecipients.map((email, index) => (
                                  <div key={index} className="flex items-center justify-between py-1">
                                    <span className="text-sm text-gray-700">{email}</span>
                                    <button
                                      type="button"
                                      onClick={() => removeEmailRecipient(index, 'recurring')}
                                      className="text-red-600 hover:text-red-700 text-sm"
                                    >
                                      Remove
                                    </button>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Save Button for Timesheet Recurring Mode */}
                        <div className="flex justify-end space-x-3 pt-4">
                          <button
                            onClick={isRunMode ? saveAndRunAgent : saveAgent}
                            disabled={loading || (!isEditMode && !isRunMode && !isTimesheetRecurringModeValid())}
                            className="text-white px-6 py-2 rounded-lg transition-colors disabled:opacity-50 flex items-center font-medium"
                            style={{ 
                              backgroundColor: loading ? '#94a3b8' : isRunMode ? '#10b981' : '#29add3'
                            }}
                            onMouseEnter={(e) => {
                              if (!loading) e.target.style.backgroundColor = isRunMode ? '#059669' : '#2196c7';
                            }}
                            onMouseLeave={(e) => {
                              if (!loading) e.target.style.backgroundColor = isRunMode ? '#10b981' : '#29add3';
                            }}
                          >
                            {isRunMode ? <Play className="h-4 w-4 mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                            {loading ? (isRunMode ? 'Updating & Running...' : 'Saving...') : 
                             isRunMode ? 'Update & Run Agent' : 
                             isEditMode ? 'Update Agent Configuration' : 'Save Agent'}
                          </button>
                        </div>
                      </div>
                    ) : (
                      // Social Media Recurring Mode Form
                      <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* Agent Name */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              <User className="h-4 w-4 inline mr-2" />
                              Agent Name *
                            </label>
                            <input
                              type="text"
                              value={recurringMode.agentName}
                              onChange={(e) => handleRecurringModeChange('agentName', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="e.g., Weekly Social Media Agent"
                              required
                            />
                          </div>
                          {/* Topic Selection */}
                                                <div>
                                                  <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    <Target className="h-4 w-4 inline mr-2" />
                                                    Select Topic *
                                                  </label>
                                                  <select
                                                    value={recurringMode.topic}
                                                    onChange={(e) => handleRecurringModeChange('topic', e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    required
                                                  >
                                                    <option value="">Select a topic...</option>
                                                    {topicOptions.map(topic => (
                                                      <option key={topic} value={topic}>{topic}</option>
                                                    ))}
                                                  </select>
                                                  {recurringMode.topic === 'Custom' && (
                                                    <input
                                                      type="text"
                                                      value={recurringMode.customTopic}
                                                      onChange={(e) => handleRecurringModeChange('customTopic', e.target.value)}
                                                      className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                      placeholder="Enter custom topic..."
                                                    />
                                                  )}
                                                </div>
                          
                                                {/* Schedule Selection */}
                                                <div>
                                                  <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    <Calendar className="h-4 w-4 inline mr-2" />
                                                    Schedule Selection *
                                                  </label>
                                                  <select
                                                    value={recurringMode.scheduleType}
                                                    onChange={(e) => handleRecurringModeChange('scheduleType', e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    required
                                                  >
                                                    <option value="all_days">All Days</option>
                                                    <option value="selected_days">Selected Days</option>
                                                  </select>
                                                </div>
                          
                                                {/* Frequency - Only show when All Days is selected */}
                                                {recurringMode.scheduleType === 'all_days' && (
                                                  <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                      <Clock className="h-4 w-4 inline mr-2" />
                                                      Frequency *
                                                    </label>
                                                    <select
                                                      value={recurringMode.frequency}
                                                      onChange={(e) => handleRecurringModeChange('frequency', e.target.value)}
                                                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                      required
                                                    >
                                                      {frequencyOptions.map(option => (
                                                        <option key={option.value} value={option.value}>{option.label}</option>
                                                      ))}
                                                    </select>
                                                  </div>
                                                )}
                          
                                              </div>
                          
                                              {/* Days of Week - Full width section immediately after Schedule Selection */}
                                              {recurringMode.scheduleType === 'selected_days' && (
                                                <div className="space-y-3">
                                                  <label className="block text-sm font-medium text-gray-700 mb-3">
                                                    <Calendar className="h-4 w-4 inline mr-2" />
                                                    Days of Week *
                                                  </label>
                                                  <div className="grid grid-cols-3 md:grid-cols-7 gap-3">
                                                    {Object.entries(recurringMode.daysOfWeek).map(([day, checked]) => (
                                                      <label key={day} className="flex items-center p-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                                                        <input
                                                          type="checkbox"
                                                          checked={checked}
                                                          onChange={(e) => handleDayOfWeekChange(day, e.target.checked)}
                                                          className="mr-2"
                                                        />
                                                        <span className="capitalize text-sm font-medium">
                                                          {day.substring(0, 3)}
                                                        </span>
                                                      </label>
                                                    ))}
                                                  </div>
                                                </div>
                                              )}
                          
                                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                {/* Post Time */}
                                                <div>
                                                  <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    <CalendarDays className="h-4 w-4 inline mr-2" />
                                                    Time of Post Submission *
                                                  </label>
                                                  <select
                                                    value={recurringMode.postTime}
                                                    onChange={(e) => handleRecurringModeChange('postTime', e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    required
                                                  >
                                                    {timeOptions.map(option => (
                                                      <option key={option.value} value={option.value}>{option.label}</option>
                                                    ))}
                                                  </select>
                                                </div>
                          
                                                {/* Word Count */}
                                                <div>
                                                  <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    <Hash className="h-4 w-4 inline mr-2" />
                                                    Word Count *
                                                  </label>
                                                  <select
                                                    value={recurringMode.wordCount}
                                                    onChange={(e) => handleRecurringModeChange('wordCount', e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    required
                                                  >
                                                    {wordCountOptions.map(option => (
                                                      <option key={option.value} value={option.value}>{option.label}</option>
                                                    ))}
                                                  </select>
                                                </div>
                          
                                                {/* Image Text Overlay */}
                                                <div>
                                                  <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    <FileText className="h-4 w-4 inline mr-2" />
                                                    Text to Add on Image
                                                  </label>
                                                  <input
                                                    type="text"
                                                    value={recurringMode.imageText}
                                                    onChange={(e) => handleRecurringModeChange('imageText', e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    placeholder="e.g., Call Now, Order Now, Book Appointment"
                                                  />
                                                </div>
                                              </div>
                          
                                              {/* Image Options */}
                                              <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-3">
                                                  <ImageIcon className="h-4 w-4 inline mr-2" />
                                                  Image Options *
                                                </label>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                  <label className="flex items-center p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                                                    <input
                                                      type="radio"
                                                      name="imageOption"
                                                      value="ai_generate"
                                                      checked={recurringMode.imageOption === 'ai_generate'}
                                                      onChange={(e) => handleRecurringModeChange('imageOption', e.target.value)}
                                                      className="mr-3"
                                                    />
                                                    <div>
                                                      <div className="font-medium">AI Generate</div>
                                                      <div className="text-sm text-gray-500">Create images using AI</div>
                                                    </div>
                                                  </label>
                                                  
                                                  <label className="flex items-center p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                                                    <input
                                                      type="radio"
                                                      name="imageOption"
                                                      value="upload"
                                                      checked={recurringMode.imageOption === 'upload'}
                                                      onChange={(e) => handleRecurringModeChange('imageOption', e.target.value)}
                                                      className="mr-3"
                                                    />
                                                    <div>
                                                      <div className="font-medium">Upload Images</div>
                                                      <div className="text-sm text-gray-500">Use uploaded images</div>
                                                    </div>
                                                  </label>
                                                  
                                                  <label className="flex items-center p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                                                    <input
                                                      type="radio"
                                                      name="imageOption"
                                                      value="reference"
                                                      checked={recurringMode.imageOption === 'reference'}
                                                      onChange={(e) => handleRecurringModeChange('imageOption', e.target.value)}
                                                      className="mr-3"
                                                    />
                                                    <div>
                                                      <div className="font-medium">Use as Reference</div>
                                                      <div className="text-sm text-gray-500">Generate similar images</div>
                                                    </div>
                                                  </label>

                                                  <label className="flex items-center p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                                                    <input
                                                      type="radio"
                                                      name="imageOption"
                                                      value="none"
                                                      checked={recurringMode.imageOption === 'none'}
                                                      onChange={(e) => handleRecurringModeChange('imageOption', e.target.value)}
                                                      className="mr-3"
                                                    />
                                                    <div>
                                                      <div className="font-medium">No Images</div>
                                                      <div className="text-sm text-gray-500">Text-only posts</div>
                                                    </div>
                                                  </label>
                                                </div>
                          
                                                {/* Image Upload Area */}
                                                {(recurringMode.imageOption === 'upload' || recurringMode.imageOption === 'reference') && (
                                                  <div className="mt-4">
                                                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                                                      <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                                                      <label className="cursor-pointer">
                                                        <span className="text-blue-600 font-medium">Upload images</span> or drag and drop
                                                        <input
                                                          type="file"
                                                          multiple
                                                          accept="image/*"
                                                          onChange={(e) => handleImageUpload(e.target.files, 'auto')}
                                                          className="hidden"
                                                        />
                                                      </label>
                                                      <p className="text-xs text-gray-500 mt-1">PNG, JPG, GIF up to 10MB each</p>
                                                    </div>
                                                    
                                                    {/* Uploaded Images Preview */}
                                                    {recurringMode.uploadedImages.length > 0 && (
                                                      <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                                                        {recurringMode.uploadedImages.map((image, index) => (
                                                          <div key={index} className="relative">
                                                            <img 
                                                              src={image.url} 
                                                              alt={image.name}
                                                              className="w-full h-24 object-cover rounded-lg border"
                                                            />
                                                            <button
                                                              onClick={() => removeUploadedImage(index, 'recurring')}
                                                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                                                            >
                                                              <Trash2 className="h-3 w-3" />
                                                            </button>
                                                          </div>
                                                        ))}
                                                      </div>
                                                    )}
                                                  </div>
                                                )}
                                              </div>
                          
                                              {/* Social Media Platforms */}
                                              <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-3">
                                                  <Share2 className="h-4 w-4 inline mr-2" />
                                                  Social Media Platforms *
                                                </label>
                                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                                  {Object.entries(recurringMode.socialPlatforms).map(([platform, checked]) => (
                                                    <label key={platform} className="flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                                                      <input
                                                        type="checkbox"
                                                        checked={checked}
                                                        onChange={(e) => handleSocialPlatformChange(platform, e.target.checked, 'recurring')}
                                                        className="mr-2"
                                                      />
                                                      <span className="capitalize font-medium">
                                                        {platform === 'twitter' ? 'X (Twitter)' : platform}
                                                      </span>
                                                    </label>
                                                  ))}
                                                </div>
                                              </div>
                          
                          
                          
                                              {/* Content Review Workflow */}
                                              <div className="space-y-3">
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                  <Eye className="h-4 w-4 inline mr-2" />
                                                  Content Review Workflow
                                                </label>
                                                <div className="space-y-2">
                                                  <label className="flex items-center">
                                                    <input
                                                      type="radio"
                                                      name="autoPostDestination"
                                                      value="in_review"
                                                      checked={recurringMode.postDestination === 'in_review'}
                                                      onChange={(e) => handleRecurringModeChange('postDestination', e.target.value)}
                                                      className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                                                    />
                                                    <div className="ml-3">
                                                      <span className="text-sm font-medium text-gray-900">In Review First</span>
                                                      <p className="text-xs text-gray-600">Content goes to "In Review" → "Ready to Publish" → Published</p>
                                                    </div>
                                                  </label>
                                                  <label className="flex items-center">
                                                    <input
                                                      type="radio"
                                                      name="autoPostDestination"
                                                      value="ready_to_publish"
                                                      checked={recurringMode.postDestination === 'ready_to_publish'}
                                                      onChange={(e) => handleRecurringModeChange('postDestination', e.target.value)}
                                                      className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                                                    />
                                                    <div className="ml-3">
                                                      <span className="text-sm font-medium text-gray-900">Ready to Publish</span>
                                                      <p className="text-xs text-gray-600">Content goes directly to "Ready to Publish" → Published</p>
                                                    </div>
                                                  </label>
                                                  <label className="flex items-center">
                                                    <input
                                                      type="radio"
                                                      name="autoPostDestination"
                                                      value="auto_post"
                                                      checked={recurringMode.postDestination === 'auto_post'}
                                                      onChange={(e) => handleRecurringModeChange('postDestination', e.target.value)}
                                                      className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                                                    />
                                                    <div className="ml-3">
                                                      <span className="text-sm font-medium text-gray-900">Auto Post</span>
                                                      <p className="text-xs text-gray-600">Content is automatically published without manual review</p>
                                                    </div>
                                                  </label>
                                                </div>
                                              </div>
                          
                                              {/* Save/Run Button */}
                                              <div className="flex justify-end space-x-3">
                                                <button
                                                  onClick={isRunMode ? saveAndRunAgent : saveAgent}
                                                  disabled={loading}
                                                  className="text-white px-6 py-2 rounded-lg transition-colors disabled:opacity-50 flex items-center font-medium"
                                                  style={{ 
                                                    backgroundColor: loading ? '#94a3b8' : isRunMode ? '#10b981' : '#29add3'
                                                  }}
                                                  onMouseEnter={(e) => {
                                                    if (!loading) e.target.style.backgroundColor = isRunMode ? '#059669' : '#2196c7';
                                                  }}
                                                  onMouseLeave={(e) => {
                                                    if (!loading) e.target.style.backgroundColor = isRunMode ? '#10b981' : '#29add3';
                                                  }}
                                                >
                                                  {isRunMode ? <Play className="h-4 w-4 mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                                                  {loading ? (isRunMode ? 'Updating & Running...' : 'Saving...') : 
                                                   isRunMode ? 'Update & Run Agent' : 
                                                   isEditMode ? 'Update Agent Configuration' : 'Save Agent'}
                                                </button>
                                              </div>
                          {/* Additional social media form fields would go here */}
                        
                      </div>
                    )}
                  </div>
                )}

            {/* Adhoc Mode Tab */}
            {(activeTab === 'adhoc' || activeTab === 'timesheet-adhoc' || activeTab === 'social-media-adhoc') && (
              <div className="space-y-6">
                {/* Check if this is a timesheet agent */}
                    {searchParams.get('agent_type') === 'time_sheet' ? (
                      // Timesheet Adhoc Mode Form
                      <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* Agent Name */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              <ClipboardList className="h-4 w-4 inline mr-2" />
                              Agent Name *
                            </label>
                            <input
                              type="text"
                              value={timesheetAdhocMode.agentName}
                              onChange={(e) => handleTimesheetAdhocModeChange('agentName', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="e.g., Monthly Report Agent"
                              required
                            />
                          </div>
                        </div>

                        {/* Report Period - Existing Timesheet Reports + Custom */}
                        <div className="space-y-3">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            <Calendar className="h-4 w-4 inline mr-2" />
                            Report Period *
                          </label>
                          <p className="text-sm text-gray-600 mb-3">
                            Select from existing timesheet reports or choose a custom date range
                          </p>
                          
                          {/* Existing Timesheet Reports */}
                          <div className="space-y-2">
                            <h4 className="text-sm font-medium text-gray-700">Existing Timesheet Reports</h4>
                            <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-md p-3">
                              {existingTimesheetReports.length > 0 ? (
                                <div className="space-y-2">
                                  {existingTimesheetReports.map((report) => (
                                    <label key={report.id} className="flex items-center p-2 hover:bg-gray-50 rounded cursor-pointer">
                                      <input
                                        type="radio"
                                        name="adhocReportPeriod"
                                        value={report.id}
                                        checked={timesheetAdhocMode.reportPeriod === report.id}
                                        onChange={(e) => {
                                          handleTimesheetAdhocModeChange('reportPeriod', e.target.value);
                                          handleTimesheetAdhocModeChange('customStartDate', report.start_date);
                                          handleTimesheetAdhocModeChange('customEndDate', report.end_date);
                                        }}
                                        className="mr-3"
                                      />
                                      <div className="flex-1">
                                        <div className="text-sm font-medium text-gray-900">{report.label}</div>
                                        <div className="text-xs text-gray-500 flex items-center space-x-2">
                                          <span>{report.start_date} to {report.end_date}</span>
                                          <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                                            report.status === 'published' ? 'bg-green-100 text-green-800' :
                                            report.status === 'ready_to_publish' ? 'bg-blue-100 text-blue-800' :
                                            'bg-yellow-100 text-yellow-800'
                                          }`}>
                                            {report.status?.replace('_', ' ') || 'Draft'}
                                          </span>
                                        </div>
                                      </div>
                                    </label>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-sm text-gray-500">No existing timesheet reports found</p>
                              )}
                            </div>
                          </div>

                          {/* Custom Period Option */}
                          <div className="border-t border-gray-200 pt-3">
                            <label className="flex items-center p-2 hover:bg-gray-50 rounded cursor-pointer">
                              <input
                                type="radio"
                                name="adhocReportPeriod"
                                value="custom"
                                checked={timesheetAdhocMode.reportPeriod === 'custom'}
                                onChange={(e) => handleTimesheetAdhocModeChange('reportPeriod', e.target.value)}
                                className="mr-3"
                              />
                              <div>
                                <div className="text-sm font-medium text-gray-900">Custom Date Range</div>
                                <div className="text-xs text-gray-500">Select your own start and end dates</div>
                              </div>
                            </label>

                            {/* Custom Date Range Inputs */}
                            {timesheetAdhocMode.reportPeriod === 'custom' && (
                              <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-4 ml-6">
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Start Date *
                                  </label>
                                  <input
                                    type="date"
                                    value={timesheetAdhocMode.customStartDate}
                                    onChange={(e) => handleTimesheetAdhocModeChange('customStartDate', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                  />
                                </div>

                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">
                                    End Date *
                                  </label>
                                  <input
                                    type="date"
                                    value={timesheetAdhocMode.customEndDate}
                                    onChange={(e) => handleTimesheetAdhocModeChange('customEndDate', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                  />
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Employee Selection - No Email */}
                        <div className="space-y-3">
                          <label className="block text-sm font-medium text-gray-700 mb-3">
                            <Users className="h-4 w-4 inline mr-2" />
                            Employee Selection
                          </label>
                          <p className="text-sm text-gray-600 mb-3">
                            Select specific employees for this report (leave none selected to include all employees)
                          </p>
                          <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-md p-3">
                            {availableEmployees.length > 0 ? (
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                {availableEmployees.map((employee) => (
                                  <label key={employee.id} className="flex items-center p-2 hover:bg-gray-100 rounded">
                                    <input
                                      type="checkbox"
                                      checked={timesheetAdhocMode.selectedEmployees.includes(employee.id)}
                                      onChange={() => handleEmployeeToggle(employee.id, 'adhoc')}
                                      className="h-4 w-4 border-gray-300 rounded"
                                      style={{
                                        accentColor: '#29add3',
                                        filter: 'brightness(1) contrast(1)',
                                        colorScheme: 'light'
                                      }}
                                    />
                                    <span className="ml-2 text-sm text-gray-700">
                                      {employee.full_name}
                                    </span>
                                  </label>
                                ))}
                              </div>
                            ) : (
                              <p className="text-sm text-gray-500">No employees found</p>
                            )}
                          </div>
                          <p className="text-xs text-gray-500 mt-2">
                            Selected: {timesheetAdhocMode.selectedEmployees.length > 0 ? timesheetAdhocMode.selectedEmployees.length : 'All'} employees
                          </p>
                        </div>

                        {/* Report Features */}
                        <div className="space-y-3">
                          <label className="block text-sm font-medium text-gray-700 mb-3">
                            <FileText className="h-4 w-4 inline mr-2" />
                            Report Features
                          </label>
                          <div className="grid grid-cols-1 gap-4">
                            <label className="flex items-center">
                              <input
                                type="checkbox"
                                checked={timesheetAdhocMode.includeBillingRates}
                                onChange={(e) => handleTimesheetAdhocModeChange('includeBillingRates', e.target.checked)}
                                className="h-4 w-4 border-gray-300 rounded"
                                style={{
                                  accentColor: '#29add3',
                                  filter: 'brightness(1) contrast(1)',
                                  colorScheme: 'light'
                                }}
                              />
                              <span className="ml-2 text-sm text-gray-700">Include Billing Rates</span>
                            </label>
                          </div>
                        </div>

                        {/* Workflow Settings */}
                        <div className="space-y-3">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            <Eye className="h-4 w-4 inline mr-2" />
                            Initial Report Status
                          </label>
                          <div className="space-y-2">
                            <label className="flex items-center">
                              <input
                                type="radio"
                                name="timesheetAdhocInitialStatus"
                                value="in_review"
                                checked={timesheetAdhocMode.initialStatus === 'in_review'}
                                onChange={(e) => handleTimesheetAdhocModeChange('initialStatus', e.target.value)}
                                className="h-4 w-4 border-gray-300"
                                style={{
                                  accentColor: '#29add3',
                                  filter: 'brightness(1) contrast(1)',
                                  colorScheme: 'light'
                                }}
                              />
                              <div className="ml-3">
                                <span className="text-sm font-medium text-gray-900">In Review</span>
                                <p className="text-xs text-gray-600">Reports go to "In Review" for manager approval</p>
                              </div>
                            </label>
                            <label className="flex items-center">
                              <input
                                type="radio"
                                name="timesheetAdhocInitialStatus"
                                value="ready_to_publish"
                                checked={timesheetAdhocMode.initialStatus === 'ready_to_publish'}
                                onChange={(e) => handleTimesheetAdhocModeChange('initialStatus', e.target.value)}
                                className="h-4 w-4 border-gray-300"
                                style={{
                                  accentColor: '#29add3',
                                  filter: 'brightness(1) contrast(1)',
                                  colorScheme: 'light'
                                }}
                              />
                              <div className="ml-3">
                                <span className="text-sm font-medium text-gray-900">Ready to Publish</span>
                                <p className="text-xs text-gray-600">Reports go directly to "Ready to Publish"</p>
                              </div>
                            </label>
                            <label className="flex items-center">
                              <input
                                type="radio"
                                name="timesheetAdhocInitialStatus"
                                value="published"
                                checked={timesheetAdhocMode.initialStatus === 'published'}
                                onChange={(e) => handleTimesheetAdhocModeChange('initialStatus', e.target.value)}
                                className="h-4 w-4 border-gray-300"
                                style={{
                                  accentColor: '#29add3',
                                  filter: 'brightness(1) contrast(1)',
                                  colorScheme: 'light'
                                }}
                              />
                              <div className="ml-3">
                                <span className="text-sm font-medium text-gray-900">Auto-Publish</span>
                                <p className="text-xs text-gray-600">Reports are automatically published and emailed</p>
                              </div>
                            </label>
                          </div>
                        </div>

                        {/* Email Configuration */}
                        <div className="space-y-4">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            <Mail className="h-4 w-4 inline mr-2" />
                            Email Configuration
                          </label>
                          
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              checked={timesheetAdhocMode.autoEmail}
                              onChange={(e) => handleTimesheetAdhocModeChange('autoEmail', e.target.checked)}
                              className="h-4 w-4 border-gray-300 rounded"
                              style={{
                                accentColor: '#29add3',
                                filter: 'brightness(1) contrast(1)',
                                colorScheme: 'light'
                              }}
                            />
                            <span className="ml-2 text-sm text-gray-700">Automatically email reports when published</span>
                          </label>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Email Recipients
                            </label>
                            <div className="flex space-x-2 mb-2">
                              <input
                                type="email"
                                value={newEmailRecipient}
                                onChange={(e) => setNewEmailRecipient(e.target.value)}
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Enter email address"
                              />
                              <button
                                type="button"
                                onClick={() => addEmailRecipient('adhoc')}
                                className="px-4 py-2 text-white rounded-md transition-colors"
                                style={{
                                  backgroundColor: '#29add3'
                                }}
                                onMouseEnter={(e) => {
                                  e.target.style.backgroundColor = '#2196c7';
                                }}
                                onMouseLeave={(e) => {
                                  e.target.style.backgroundColor = '#29add3';
                                }}
                              >
                                Add
                              </button>
                            </div>
                            
                            {/* Email Recipients List */}
                            {timesheetAdhocMode.emailRecipients.length > 0 && (
                              <div className="border border-gray-200 rounded-md p-3 max-h-32 overflow-y-auto">
                                {timesheetAdhocMode.emailRecipients.map((email, index) => (
                                  <div key={index} className="flex items-center justify-between py-1">
                                    <span className="text-sm text-gray-700">{email}</span>
                                    <button
                                      type="button"
                                      onClick={() => removeEmailRecipient(index, 'adhoc')}
                                      className="text-red-600 hover:text-red-700 text-sm"
                                    >
                                      Remove
                                    </button>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Save Button for Timesheet Adhoc Mode */}
                        <div className="flex justify-end space-x-3 pt-4">
                          <button
                            onClick={isRunMode ? saveAndRunAgent : saveAgent}
                            disabled={loading || (!isEditMode && !isRunMode && !isTimesheetAdhocModeValid())}
                            className="text-white px-6 py-2 rounded-lg transition-colors disabled:opacity-50 flex items-center font-medium"
                            style={{ 
                              backgroundColor: loading ? '#94a3b8' : isRunMode ? '#10b981' : '#29add3'
                            }}
                            onMouseEnter={(e) => {
                              if (!loading) e.target.style.backgroundColor = isRunMode ? '#059669' : '#2196c7';
                            }}
                            onMouseLeave={(e) => {
                              if (!loading) e.target.style.backgroundColor = isRunMode ? '#10b981' : '#29add3';
                            }}
                          >
                            {isRunMode ? <Play className="h-4 w-4 mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                            {loading ? (isRunMode ? 'Updating & Running...' : 'Saving...') : 
                             isRunMode ? 'Update & Run Agent' : 
                             isEditMode ? 'Update Agent Configuration' : 'Save Agent'}
                          </button>
                        </div>
                      </div>
                    ) : (
                      // Social Media Adhoc Mode Form (existing)
                      <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Agent Name */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <Bot className="h-4 w-4 inline mr-2" />
                          Agent Name *
                        </label>
                        <input
                          type="text"
                          value={adhocMode.agentName}
                          onChange={(e) => handleAdhocModeChange('agentName', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Enter agent name..."
                          required
                        />
                      </div>

                      {/* Topic Selection */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <Target className="h-4 w-4 inline mr-2" />
                          Select Topic *
                        </label>
                        <select
                          value={adhocMode.topic}
                          onChange={(e) => handleAdhocModeChange('topic', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        >
                          <option value="">Select a topic...</option>
                          {topicOptions.map(topic => (
                            <option key={topic} value={topic}>{topic}</option>
                          ))}
                        </select>
                        {adhocMode.topic === 'Custom' && (
                          <input
                            type="text"
                            value={adhocMode.customTopic}
                            onChange={(e) => handleAdhocModeChange('customTopic', e.target.value)}
                            className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter custom topic..."
                          />
                        )}
                      </div>

                      {/* Word Count */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <Hash className="h-4 w-4 inline mr-2" />
                          Word Count *
                        </label>
                        <select
                          value={adhocMode.wordCount}
                          onChange={(e) => handleAdhocModeChange('wordCount', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        >
                          {wordCountOptions.map(option => (
                            <option key={option.value} value={option.value}>{option.label}</option>
                          ))}
                        </select>
                      </div>

                      {/* Post Date */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <Calendar className="h-4 w-4 inline mr-2" />
                          Post Date
                        </label>
                        <input
                          type="date"
                          value={adhocMode.postDate}
                          onChange={(e) => handleAdhocModeChange('postDate', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          min={new Date().toISOString().split('T')[0]}
                        />
                      </div>

                      {/* Post Time */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <Clock className="h-4 w-4 inline mr-2" />
                          Post Time
                        </label>
                        <select
                          value={adhocMode.postTime}
                          onChange={(e) => handleAdhocModeChange('postTime', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          {timeOptions.map(option => (
                            <option key={option.value} value={option.value}>{option.label}</option>
                          ))}
                        </select>
                      </div>

                      {/* Image Text Overlay */}
                      {/* Image Text (conditionally shown) */}
                      {adhocMode.imageOption !== 'none' && (
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            <FileText className="h-4 w-4 inline mr-2" />
                            Text to Add on Image
                          </label>
                          <input
                            type="text"
                            value={adhocMode.imageText}
                            onChange={(e) => handleAdhocModeChange('imageText', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="e.g., Call Now, Order Now, Book Appointment"
                          />
                        </div>
                      )}
                    </div>

                    {/* Image Options - Same as Auto Mode */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        <ImageIcon className="h-4 w-4 inline mr-2" />
                        Image Options *
                      </label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <label className="flex items-center p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                          <input
                            type="radio"
                            name="adhocImageOption"
                            value="ai_generate"
                            checked={adhocMode.imageOption === 'ai_generate'}
                            onChange={(e) => handleAdhocModeChange('imageOption', e.target.value)}
                            className="mr-3"
                          />
                          <div>
                            <div className="font-medium">AI Generate</div>
                            <div className="text-sm text-gray-500">Create images using AI</div>
                          </div>
                        </label>
                        
                        <label className="flex items-center p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                          <input
                            type="radio"
                            name="adhocImageOption"
                            value="upload"
                            checked={adhocMode.imageOption === 'upload'}
                            onChange={(e) => handleAdhocModeChange('imageOption', e.target.value)}
                            className="mr-3"
                          />
                          <div>
                            <div className="font-medium">Upload Images</div>
                            <div className="text-sm text-gray-500">Use uploaded images</div>
                          </div>
                        </label>
                        
                        <label className="flex items-center p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                          <input
                            type="radio"
                            name="adhocImageOption"
                            value="reference"
                            checked={adhocMode.imageOption === 'reference'}
                            onChange={(e) => handleAdhocModeChange('imageOption', e.target.value)}
                            className="mr-3"
                          />
                          <div>
                            <div className="font-medium">Use as Reference</div>
                            <div className="text-sm text-gray-500">Generate similar images</div>
                          </div>
                        </label>

                        <label className="flex items-center p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                          <input
                            type="radio"
                            name="adhocImageOption"
                            value="none"
                            checked={adhocMode.imageOption === 'none'}
                            onChange={(e) => handleAdhocModeChange('imageOption', e.target.value)}
                            className="mr-3"
                          />
                          <div>
                            <div className="font-medium">No Images</div>
                            <div className="text-sm text-gray-500">Text-only posts</div>
                          </div>
                        </label>
                      </div>

                      {/* Image Upload Area - Same as Auto Mode */}
                      {(adhocMode.imageOption === 'upload' || adhocMode.imageOption === 'reference') && (
                        <div className="mt-4">
                          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                            <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                            <label className="cursor-pointer">
                              <span className="text-blue-600 font-medium">Upload images</span> or drag and drop
                              <input
                                type="file"
                                multiple
                                accept="image/*"
                                onChange={(e) => handleImageUpload(e.target.files, 'adhoc')}
                                className="hidden"
                              />
                            </label>
                            <p className="text-xs text-gray-500 mt-1">PNG, JPG, GIF up to 10MB each</p>
                          </div>
                          
                          {/* Uploaded Images Preview */}
                          {adhocMode.uploadedImages.length > 0 && (
                            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                              {adhocMode.uploadedImages.map((image, index) => (
                                <div key={index} className="relative">
                                  <img 
                                    src={image.url} 
                                    alt={image.name}
                                    className="w-full h-24 object-cover rounded-lg border"
                                  />
                                  <button
                                    onClick={() => removeUploadedImage(index, 'adhoc')}
                                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Social Media Platforms - Same as Auto Mode */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        <Share2 className="h-4 w-4 inline mr-2" />
                        Social Media Platforms *
                      </label>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {Object.entries(adhocMode.socialPlatforms).map(([platform, checked]) => (
                          <label key={platform} className="flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={(e) => handleSocialPlatformChange(platform, e.target.checked, 'adhoc')}
                              className="mr-2"
                            />
                            <span className="capitalize font-medium">
                              {platform === 'twitter' ? 'X (Twitter)' : platform}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Content Review Workflow */}
                    <div className="space-y-3">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <Eye className="h-4 w-4 inline mr-2" />
                        Content Review Workflow
                      </label>
                      <div className="space-y-2">
                        <label className="flex items-center">
                          <input
                            type="radio"
                            name="adhocPostDestination"
                            value="in_review"
                            checked={adhocMode.postDestination === 'in_review'}
                            onChange={(e) => handleAdhocModeChange('postDestination', e.target.value)}
                            className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                          />
                          <div className="ml-3">
                            <span className="text-sm font-medium text-gray-900">In Review First</span>
                            <p className="text-xs text-gray-600">Content goes to "In Review" → "Ready to Publish" → Published</p>
                          </div>
                        </label>
                        <label className="flex items-center">
                          <input
                            type="radio"
                            name="adhocPostDestination"
                            value="ready_to_publish"
                            checked={adhocMode.postDestination === 'ready_to_publish'}
                            onChange={(e) => handleAdhocModeChange('postDestination', e.target.value)}
                            className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                          />
                          <div className="ml-3">
                            <span className="text-sm font-medium text-gray-900">Ready to Publish</span>
                            <p className="text-xs text-gray-600">Content goes directly to "Ready to Publish" → Published</p>
                          </div>
                        </label>
                        <label className="flex items-center">
                          <input
                            type="radio"
                            name="adhocPostDestination"
                            value="auto_post"
                            checked={adhocMode.postDestination === 'auto_post'}
                            onChange={(e) => handleAdhocModeChange('postDestination', e.target.value)}
                            className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                          />
                          <div className="ml-3">
                            <span className="text-sm font-medium text-gray-900">Auto Post</span>
                            <p className="text-xs text-gray-606">Content is automatically published without manual review</p>
                          </div>
                        </label>
                      </div>
                    </div>

                    {/* Save/Run Button */}
                    <div className="flex justify-end space-x-3">
                      <button
                        onClick={isRunMode ? saveAndRunAgent : saveAgent}
                        disabled={loading || (!isEditMode && !isRunMode && (!adhocMode.agentName || !adhocMode.topic || Object.values(adhocMode.socialPlatforms).every(v => !v)))}
                        className="text-white px-6 py-2 rounded-lg transition-colors disabled:opacity-50 flex items-center font-medium"
                        style={{ 
                          backgroundColor: loading ? '#94a3b8' : 
                                          isRunMode ? '#10b981' : 
                                          (isEditMode || isRunMode) ? '#29add3' : '#f59e0b'
                        }}
                        onMouseEnter={(e) => {
                          if (!loading && ((isEditMode || isRunMode) || (adhocMode.agentName && adhocMode.topic && Object.values(adhocMode.socialPlatforms).some(v => v)))) {
                            e.target.style.backgroundColor = isRunMode ? '#059669' : (isEditMode || isRunMode) ? '#2196c7' : '#d97706';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!loading) {
                            e.target.style.backgroundColor = isRunMode ? '#10b981' : (isEditMode || isRunMode) ? '#29add3' : '#f59e0b';
                          }
                        }}
                      >
                        {isRunMode ? <Play className="h-4 w-4 mr-2" /> : 
                         (isEditMode || isRunMode) ? <Save className="h-4 w-4 mr-2" /> : <Zap className="h-4 w-4 mr-2" />}
                        {loading ? (isRunMode ? 'Updating & Running...' : (isEditMode || isRunMode) ? 'Saving...' : 'Creating...') : 
                         (isRunMode ? 'Update & Run Agent' : 
                          (isEditMode || isRunMode) ? 'Update Agent Configuration' : 'Generate & Create Post')}
                      </button>
                    </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Write Your Post Tab (Social Media Agents) */}
                {activeTab === 'social-media-write' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Agent Name */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <User className="h-4 w-4 inline mr-2" />
                          Agent Name *
                        </label>
                        <input
                          type="text"
                          value={writePostMode.agentName}
                          onChange={(e) => setWritePostMode(prev => ({ ...prev, agentName: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="e.g., My Custom Post Agent"
                          required
                        />
                      </div>

                      {/* Word Count */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <Hash className="h-4 w-4 inline mr-2" />
                          Word Count *
                        </label>
                        <select
                          value={writePostMode.wordCount}
                          onChange={(e) => setWritePostMode(prev => ({ ...prev, wordCount: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        >
                          {wordCountOptions.map(option => (
                            <option key={option.value} value={option.value}>{option.label}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Post Title */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <FileText className="h-4 w-4 inline mr-2" />
                        Post Title
                      </label>
                      <input
                        type="text"
                        value={writePostMode.postTitle}
                        onChange={(e) => setWritePostMode(prev => ({ ...prev, postTitle: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter a catchy title for your post (optional - AI can generate if left empty)"
                      />
                      <p className="text-sm text-gray-500 mt-2">
                        💡 If left empty, ChatGPT will automatically generate an engaging title based on your content.
                      </p>
                    </div>

                    {/* Post Content - Big Text Area */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <FileText className="h-4 w-4 inline mr-2" />
                        Post Content *
                      </label>
                      <textarea
                        value={writePostMode.postContent}
                        onChange={(e) => setWritePostMode(prev => ({ ...prev, postContent: e.target.value }))}
                        rows={8}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
                        required
                      />
                      <p className="text-sm text-gray-500 mt-2">
                        💡 ChatGPT will be used to format the post content to suit different social media types unless disabled below.
                      </p>
                    </div>

                    {/* Social Platforms */}
                    <div className="space-y-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <Globe className="h-4 w-4 inline mr-2" />
                        Select Social Media Platforms *
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {Object.entries(writePostMode.socialPlatforms).map(([platform, selected]) => (
                          <label
                            key={platform}
                            className={`flex items-center p-3 rounded-lg border cursor-pointer transition-colors ${
                              selected ? 'bg-blue-50 border-blue-200' : 'bg-white border-gray-200 hover:bg-gray-50'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={selected}
                              onChange={(e) => setWritePostMode(prev => ({
                                ...prev,
                                socialPlatforms: {
                                  ...prev.socialPlatforms,
                                  [platform]: e.target.checked
                                }
                              }))}
                              className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mr-3"
                            />
                            <div className="flex items-center">
                              {platform === 'facebook' && <svg className="w-5 h-5 text-blue-600 mr-2" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>}
                              {platform === 'instagram' && <svg className="w-5 h-5 text-pink-600 mr-2" fill="currentColor" viewBox="0 0 24 24"><path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 6.62 5.367 11.987 11.988 11.987 6.62 0 11.987-5.367 11.987-11.987C24.014 5.367 18.637.001 12.017.001zM8.449 16.988c-1.297 0-2.448-.611-3.132-1.551-.315-.43-.501-.957-.501-1.534 0-1.297.611-2.448 1.551-3.132.43-.315.957-.501 1.534-.501 1.297 0 2.448.611 3.132 1.551.315.43.501.957.501 1.534 0 1.297-.611 2.448-1.551 3.132-.43.315-.957.501-1.534.501zm7.5 0c-1.297 0-2.448-.611-3.132-1.551-.315-.43-.501-.957-.501-1.534 0-1.297.611-2.448 1.551-3.132.43-.315.957-.501 1.534-.501 1.297 0 2.448.611 3.132 1.551.315.43.501.957.501 1.534 0 1.297-.611 2.448-1.551 3.132-.43.315-.957.501-1.534.501z"/></svg>}
                              {platform === 'twitter' && <svg className="w-5 h-5 text-blue-400 mr-2" fill="currentColor" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/></svg>}
                              {platform === 'whatsapp' && <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.893 3.488"/></svg>}
                              <span className="capitalize text-sm font-medium">{platform}</span>
                            </div>
                          </label>
                        ))}
                      </div>
                      {!Object.values(writePostMode.socialPlatforms).some(platform => platform) && (
                        <p className="text-sm text-red-600">Please select at least one platform.</p>
                      )}
                    </div>

                    {/* ChatGPT Formatting Option */}
                    <div className="space-y-4">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="useChatGPTFormatting"
                          checked={writePostMode.useChatGPTFormatting}
                          onChange={(e) => setWritePostMode(prev => ({ ...prev, useChatGPTFormatting: e.target.checked }))}
                          className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <label htmlFor="useChatGPTFormatting" className="ml-2 text-sm text-gray-700">
                          <span className="font-medium">Use ChatGPT for formatting</span>
                          <p className="text-xs text-gray-500 mt-1">Let ChatGPT format and optimize your content for each social media platform</p>
                        </label>
                      </div>
                    </div>

                    {/* Web Research Option */}
                    <div className="space-y-4">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="useWebResearch"
                          checked={writePostMode.useWebResearch}
                          onChange={(e) => setWritePostMode(prev => ({ ...prev, useWebResearch: e.target.checked }))}
                          className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <label htmlFor="useWebResearch" className="ml-2 text-sm text-gray-700">
                          <span className="font-medium">Use Web Research</span>
                          <p className="text-xs text-gray-500 mt-1">Enhance and modify content using online web resources based on the provided content</p>
                        </label>
                      </div>
                    </div>

                    {/* Post Date and Time */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <Calendar className="h-4 w-4 inline mr-2" />
                          Post Date *
                        </label>
                        <input
                          type="date"
                          value={writePostMode.postDate}
                          onChange={(e) => setWritePostMode(prev => ({ ...prev, postDate: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <Clock className="h-4 w-4 inline mr-2" />
                          Post Time *
                        </label>
                        <select
                          value={writePostMode.postTime}
                          onChange={(e) => setWritePostMode(prev => ({ ...prev, postTime: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        >
                          {timeOptions.map(option => (
                            <option key={option.value} value={option.value}>{option.label}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Image Options (same as adhoc form) */}
                    <div className="space-y-4">
                      <label className="block text-sm font-medium text-gray-700">
                        <ImageIcon className="h-4 w-4 inline mr-2" />
                        Image Options
                      </label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <label className="flex items-start p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100">
                          <input
                            type="radio"
                            name="writeImageOption"
                            value="ai_generate"
                            checked={writePostMode.imageOption === 'ai_generate'}
                            onChange={(e) => setWritePostMode(prev => ({ ...prev, imageOption: e.target.value }))}
                            className="mr-3"
                          />
                          <div>
                            <div className="font-medium">AI Generate</div>
                            <div className="text-sm text-gray-500">Create unique images using AI</div>
                          </div>
                        </label>
                        <label className="flex items-start p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100">
                          <input
                            type="radio"
                            name="writeImageOption"
                            value="upload"
                            checked={writePostMode.imageOption === 'upload'}
                            onChange={(e) => setWritePostMode(prev => ({ ...prev, imageOption: e.target.value }))}
                            className="mr-3"
                          />
                          <div>
                            <div className="font-medium">Upload Images</div>
                            <div className="text-sm text-gray-500">Use your own images</div>
                          </div>
                        </label>
                        <label className="flex items-start p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100">
                          <input
                            type="radio"
                            name="writeImageOption"
                            value="reference"
                            checked={writePostMode.imageOption === 'reference'}
                            onChange={(e) => setWritePostMode(prev => ({ ...prev, imageOption: e.target.value }))}
                            className="mr-3"
                          />
                          <div>
                            <div className="font-medium">Use as Reference</div>
                            <div className="text-sm text-gray-500">Generate similar images</div>
                          </div>
                        </label>
                        <label className="flex items-start p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100">
                          <input
                            type="radio"
                            name="writeImageOption"
                            value="none"
                            checked={writePostMode.imageOption === 'none'}
                            onChange={(e) => setWritePostMode(prev => ({ ...prev, imageOption: e.target.value }))}
                            className="mr-3"
                          />
                          <div>
                            <div className="font-medium">No Images</div>
                            <div className="text-sm text-gray-500">Text-only posts</div>
                          </div>
                        </label>
                      </div>
                    </div>

                    {/* Image Text */}
                    {writePostMode.imageOption !== 'none' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Text to Add on Image
                        </label>
                        <input
                          type="text"
                          value={writePostMode.imageText}
                          onChange={(e) => setWritePostMode(prev => ({ ...prev, imageText: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="e.g., Follow us for more tips!"
                        />
                      </div>
                    )}

                    {/* Upload Images Section (conditionally shown) */}
                    {writePostMode.imageOption === 'upload' && (
                      <div className="space-y-4">
                        <label className="block text-sm font-medium text-gray-700">
                          <Upload className="h-4 w-4 inline mr-2" />
                          Upload Images
                        </label>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                          <input
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={(e) => handleImageUpload(e, 'write')}
                            className="hidden"
                            id="writeImageUpload"
                          />
                          <label
                            htmlFor="writeImageUpload"
                            className="cursor-pointer flex flex-col items-center"
                          >
                            <Upload className="h-8 w-8 text-gray-400 mb-2" />
                            <span className="text-sm text-gray-600">Click to upload images</span>
                          </label>
                        </div>
                        {writePostMode.uploadedImages.length > 0 && (
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                            {writePostMode.uploadedImages.map((image, index) => (
                              <div key={index} className="relative">
                                <img
                                  src={image.preview}
                                  alt={`Upload ${index + 1}`}
                                  className="w-full h-24 object-cover rounded-lg"
                                />
                                <button
                                  onClick={() => removeUploadedImage(index, 'write')}
                                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                                >
                                  ×
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Content Review Workflow (same as adhoc form) */}
                    <div className="space-y-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Content Review Workflow
                      </label>
                      <div className="space-y-3">
                        <label className="flex items-start">
                          <input
                            type="radio"
                            name="writePostDestination"
                            value="in_review"
                            checked={writePostMode.postDestination === 'in_review'}
                            onChange={(e) => setWritePostMode(prev => ({ ...prev, postDestination: e.target.value }))}
                            className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                          />
                          <div className="ml-3">
                            <span className="text-sm font-medium text-gray-900">In Review First</span>
                            <p className="text-xs text-gray-600">Generated posts go to "In Review" for manager approval</p>
                          </div>
                        </label>
                        <label className="flex items-start">
                          <input
                            type="radio"
                            name="writePostDestination"
                            value="ready_to_publish"
                            checked={writePostMode.postDestination === 'ready_to_publish'}
                            onChange={(e) => setWritePostMode(prev => ({ ...prev, postDestination: e.target.value }))}
                            className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                          />
                          <div className="ml-3">
                            <span className="text-sm font-medium text-gray-900">Ready to Publish</span>
                            <p className="text-xs text-gray-600">Generated posts go directly to "Ready to Publish"</p>
                          </div>
                        </label>
                        <label className="flex items-start">
                          <input
                            type="radio"
                            name="writePostDestination"
                            value="auto_post"
                            checked={writePostMode.postDestination === 'auto_post'}
                            onChange={(e) => setWritePostMode(prev => ({ ...prev, postDestination: e.target.value }))}
                            className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                          />
                          <div className="ml-3">
                            <span className="text-sm font-medium text-gray-900">Auto Post</span>
                            <p className="text-xs text-gray-600">Posts are automatically published without manual review. Schedule date and time selected will be ignored.</p>
                          </div>
                        </label>
                      </div>
                    </div>

                    {/* Save/Update Button */}
                    <div className="flex justify-end pt-6 border-t">
                      <button
                        onClick={isRunMode ? saveAndRunAgent : saveAgent}
                        disabled={loading || (!isEditMode && !isRunMode && (!writePostMode.agentName || !writePostMode.postContent || !Object.values(writePostMode.socialPlatforms).some(platform => platform) || !writePostMode.postDate || !writePostMode.postTime))}
                        className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center"
                        style={{ 
                          backgroundColor: loading ? '#94a3b8' : 
                                          isRunMode ? '#10b981' : '#29add3'
                        }}
                        onMouseEnter={(e) => {
                          if (!loading && (isEditMode || isRunMode || (writePostMode.agentName && writePostMode.postContent && Object.values(writePostMode.socialPlatforms).some(platform => platform) && writePostMode.postDate && writePostMode.postTime))) {
                            e.target.style.backgroundColor = isRunMode ? '#059669' : '#1e88e5';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!loading) {
                            e.target.style.backgroundColor = isRunMode ? '#10b981' : '#29add3';
                          }
                        }}
                      >
                        {isRunMode ? <Play className="h-4 w-4 mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                        {loading ? (isRunMode ? 'Updating & Running...' : 'Saving...') : 
                         isRunMode ? 'Update & Run Agent' : 
                         isEditMode ? 'Update Agent Configuration' : 'Save Agent'}
                      </button>
                    </div>
                  </div>
                )}

                {/* Scheduled Mode Tab (Email Agents) */}
                {activeTab === 'email-scheduled' && (
                  <div className="space-y-6">
                    {searchParams.get('agent_type') === 'email' ? (
                      // Email Scheduled Mode Form
                      <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* Agent Name */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              <Mail className="h-4 w-4 inline mr-2" />
                              Agent Name *
                            </label>
                            <input
                              type="text"
                              value={emailScheduledMode.agentName}
                              onChange={(e) => handleEmailScheduledModeChange('agentName', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="e.g., Holiday Email Campaign"
                              required
                            />
                          </div>

                          {/* Word Count */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              <Hash className="h-4 w-4 inline mr-2" />
                              Word Count *
                            </label>
                            <select
                              value={emailScheduledMode.wordCount}
                              onChange={(e) => handleEmailScheduledModeChange('wordCount', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              required
                            >
                              {wordCountOptions.map(option => (
                                <option key={option.value} value={option.value}>{option.label}</option>
                              ))}
                            </select>
                          </div>
                        </div>

                        {/* Holiday Selection */}
                        <div className="space-y-4">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            <Calendar className="h-4 w-4 inline mr-2" />
                            Select Holidays for Email Campaigns *
                          </label>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-h-64 overflow-y-auto border border-gray-200 rounded-lg p-4">
                            {availableHolidays.map((holiday) => (
                              <label key={holiday.id} className="flex items-center space-x-2 p-2 rounded hover:bg-gray-50">
                                <input
                                  type="checkbox"
                                  checked={emailScheduledMode.selectedHolidays.includes(holiday.id)}
                                  onChange={(e) => {
                                    const selected = [...emailScheduledMode.selectedHolidays];
                                    if (e.target.checked) {
                                      selected.push(holiday.id);
                                    } else {
                                      selected.splice(selected.indexOf(holiday.id), 1);
                                    }
                                    handleEmailScheduledModeChange('selectedHolidays', selected);
                                  }}
                                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                />
                                <span className="text-sm text-gray-700">{holiday.name}</span>
                              </label>
                            ))}
                          </div>
                          {emailScheduledMode.selectedHolidays.length === 0 && (
                            <p className="text-sm text-red-600">Please select at least one holiday.</p>
                          )}
                          <div className="mt-3 p-3 bg-blue-50 rounded-md border-l-4 border-blue-400">
                            <div className="flex">
                              <div className="flex-shrink-0">
                                <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                </svg>
                              </div>
                              <div className="ml-3">
                                <p className="text-sm text-blue-700">
                                  <strong>Missing a holiday?</strong> Configure additional holidays in the <strong>Holiday Management</strong> page.
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Customer Database Integration */}
                        <div className="space-y-4">
                          <div className="p-4 bg-green-50 rounded-lg border-l-4 border-green-400">
                            <div className="flex">
                              <div className="flex-shrink-0">
                                <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                              </div>
                              <div className="ml-3">
                                <div className="font-medium text-green-900">Customer Database Integration</div>
                                <div className="text-sm text-green-700 mt-1">Emails will be automatically sent to customers who have opted in for email communications. Email content will be personalized using customer name and pet information for each specific holiday.</div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Email Content Template */}
                        <div className="space-y-4">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            <FileText className="h-4 w-4 inline mr-2" />
                            Business Information & Email Content Template
                          </label>
                          <textarea
                            value={emailScheduledMode.emailContentTemplate}
                            onChange={(e) => handleEmailScheduledModeChange('emailContentTemplate', e.target.value)}
                            rows={6}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter generic business information and content that should be included in all holiday emails. ChatGPT will use this information along with customer name, pet details, and holiday-specific content to generate personalized emails.

Example:
- Visit our clinic for special holiday offers
- Don't forget your pet's annual checkup
- We offer 24/7 emergency services
- Book appointments online at [website]"
                          />
                          <p className="text-sm text-gray-500 mt-2">
                            {emailScheduledMode.useChatGPTFormatting 
                              ? "ChatGPT will combine this content with holiday messaging and customer details ([CUSTOMER_NAME] and [PET_NAME]) to create personalized emails."
                              : "This content will be used exactly as written with only [CUSTOMER_NAME] and [PET_NAME] being replaced with actual customer details."
                            }
                          </p>
                        </div>

                        {/* Post Time */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              <Clock className="h-4 w-4 inline mr-2" />
                              Email Send Time *
                            </label>
                            <select
                              value={emailScheduledMode.postTime}
                              onChange={(e) => handleEmailScheduledModeChange('postTime', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              required
                            >
                              {timeOptions.map(option => (
                                <option key={option.value} value={option.value}>{option.label}</option>
                              ))}
                            </select>
                          </div>
                        </div>

                        {/* Image Options */}
                        <div className="space-y-4">
                          <label className="block text-sm font-medium text-gray-700">
                            <ImageIcon className="h-4 w-4 inline mr-2" />
                            Image Options
                          </label>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <label className="flex items-start p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100">
                              <input
                                type="radio"
                                name="emailScheduledImageOption"
                                value="ai_generate"
                                checked={emailScheduledMode.imageOption === 'ai_generate'}
                                onChange={(e) => handleEmailScheduledModeChange('imageOption', e.target.value)}
                                className="mr-3"
                              />
                              <div>
                                <div className="font-medium">AI Generate</div>
                                <div className="text-sm text-gray-500">Create holiday-themed images using AI</div>
                              </div>
                            </label>
                            <label className="flex items-start p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100">
                              <input
                                type="radio"
                                name="emailScheduledImageOption"
                                value="upload"
                                checked={emailScheduledMode.imageOption === 'upload'}
                                onChange={(e) => handleEmailScheduledModeChange('imageOption', e.target.value)}
                                className="mr-3"
                              />
                              <div>
                                <div className="font-medium">Upload Images</div>
                                <div className="text-sm text-gray-500">Use your own holiday images</div>
                              </div>
                            </label>
                            <label className="flex items-start p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100">
                              <input
                                type="radio"
                                name="emailScheduledImageOption"
                                value="reference"
                                checked={emailScheduledMode.imageOption === 'reference'}
                                onChange={(e) => handleEmailScheduledModeChange('imageOption', e.target.value)}
                                className="mr-3"
                              />
                              <div>
                                <div className="font-medium">Use as Reference</div>
                                <div className="text-sm text-gray-500">Generate similar holiday images</div>
                              </div>
                            </label>
                            <label className="flex items-start p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100">
                              <input
                                type="radio"
                                name="emailScheduledImageOption"
                                value="none"
                                checked={emailScheduledMode.imageOption === 'none'}
                                onChange={(e) => handleEmailScheduledModeChange('imageOption', e.target.value)}
                                className="mr-3"
                              />
                              <div>
                                <div className="font-medium">No Image Needed</div>
                                <div className="text-sm text-gray-500">Send text-only emails without any images</div>
                              </div>
                            </label>
                          </div>
                        </div>

                        {/* Image Text (conditionally shown) */}
                        {emailScheduledMode.imageOption !== 'none' && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Text to Add on Image
                            </label>
                            <input
                              type="text"
                              value={emailScheduledMode.imageText}
                              onChange={(e) => handleEmailScheduledModeChange('imageText', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="e.g., Special Holiday Offer, Happy Holidays"
                            />
                          </div>
                        )}

                        {/* Upload Images Section (conditionally shown) */}
                        {emailScheduledMode.imageOption === 'upload' && (
                          <div className="space-y-4">
                            <label className="block text-sm font-medium text-gray-700">
                              <Upload className="h-4 w-4 inline mr-2" />
                              Upload Images
                            </label>
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                              <input
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={(e) => handleImageUpload(e, 'email_scheduled')}
                                className="hidden"
                                id="emailScheduledImageUpload"
                              />
                              <label
                                htmlFor="emailScheduledImageUpload"
                                className="cursor-pointer flex flex-col items-center"
                              >
                                <Upload className="h-8 w-8 text-gray-400 mb-2" />
                                <span className="text-sm text-gray-600">Click to upload images</span>
                              </label>
                            </div>
                            {emailScheduledMode.uploadedImages.length > 0 && (
                              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                {emailScheduledMode.uploadedImages.map((image, index) => (
                                  <div key={index} className="relative">
                                    <img
                                      src={image.preview}
                                      alt={`Upload ${index + 1}`}
                                      className="w-full h-24 object-cover rounded-lg"
                                    />
                                    <button
                                      onClick={() => removeUploadedImage(index, 'email_scheduled')}
                                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                                    >
                                      ×
                                    </button>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}

                        {/* ChatGPT Email Formatting */}
                        <div className="space-y-4">
                          <label className="flex items-center p-4 bg-purple-50 rounded-lg">
                            <input
                              type="checkbox"
                              checked={emailScheduledMode.useChatGPTFormatting}
                              onChange={(e) => handleEmailScheduledModeChange('useChatGPTFormatting', e.target.checked)}
                              className="h-4 w-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500 mr-3"
                            />
                            <div>
                              <div className="font-medium text-purple-900">Use ChatGPT Email Formatting</div>
                              <div className="text-sm text-purple-700">Let ChatGPT format and enhance your email content. If unchecked, email content will be used exactly as written with only [CUSTOMER_NAME] and [PET_NAME] replacements.</div>
                            </div>
                          </label>
                        </div>

                        {/* Content Review Workflow */}
                        <div className="space-y-4">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Content Review Workflow
                          </label>
                          <div className="space-y-3">
                            <label className="flex items-start">
                              <input
                                type="radio"
                                name="emailScheduledPostDestination"
                                value="in_review"
                                checked={emailScheduledMode.postDestination === 'in_review'}
                                onChange={(e) => handleEmailScheduledModeChange('postDestination', e.target.value)}
                                className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                              />
                              <div className="ml-3">
                                <span className="text-sm font-medium text-gray-900">In Review First</span>
                                <p className="text-xs text-gray-600">Generated holiday emails go to "In Review" → "Ready to Publish" → Sent to customers</p>
                              </div>
                            </label>
                            <label className="flex items-start">
                              <input
                                type="radio"
                                name="emailScheduledPostDestination"
                                value="ready_to_publish"
                                checked={emailScheduledMode.postDestination === 'ready_to_publish'}
                                onChange={(e) => handleEmailScheduledModeChange('postDestination', e.target.value)}
                                className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                              />
                              <div className="ml-3">
                                <span className="text-sm font-medium text-gray-900">Ready to Publish</span>
                                <p className="text-xs text-gray-600">Generated emails go directly to "Ready to Publish" → Sent to customers</p>
                              </div>
                            </label>
                            <label className="flex items-start">
                              <input
                                type="radio"
                                name="emailScheduledPostDestination"
                                value="auto_send"
                                checked={emailScheduledMode.postDestination === 'auto_send'}
                                onChange={(e) => handleEmailScheduledModeChange('postDestination', e.target.value)}
                                className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                              />
                              <div className="ml-3">
                                <span className="text-sm font-medium text-gray-900">Send Automatically</span>
                                <p className="text-xs text-gray-600">Holiday emails are generated and sent automatically to opted-in customers. Send time settings are ignored.</p>
                              </div>
                            </label>
                          </div>
                        </div>

                        {/* Save Button */}
                        <div className="flex justify-end space-x-3">
                          <button
                            onClick={isRunMode ? saveAndRunAgent : saveAgent}
                            disabled={loading || (!isEditMode && !isRunMode && (!emailScheduledMode.agentName || emailScheduledMode.selectedHolidays.length === 0))}
                            className="text-white px-6 py-2 rounded-lg transition-colors disabled:opacity-50 flex items-center font-medium"
                            style={{ 
                              backgroundColor: loading ? '#94a3b8' : 
                                              isRunMode ? '#10b981' : 
                                              (isEditMode || isRunMode) ? '#29add3' : '#29add3'
                            }}
                            onMouseEnter={(e) => {
                              if (!loading && ((isEditMode || isRunMode) || (emailScheduledMode.agentName && emailScheduledMode.selectedHolidays.length > 0))) {
                                e.target.style.backgroundColor = isRunMode ? '#059669' : (isEditMode || isRunMode) ? '#2196c7' : '#2196c7';
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (!loading) {
                                e.target.style.backgroundColor = isRunMode ? '#10b981' : (isEditMode || isRunMode) ? '#29add3' : '#29add3';
                              }
                            }}
                          >
                            {isRunMode ? <Play className="h-4 w-4 mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                            {loading ? (isRunMode ? 'Updating & Running...' : 'Saving...') : 
                             isRunMode ? 'Update & Run Agent' : 
                             isEditMode ? 'Update Agent Configuration' : 'Save Agent'}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Scheduled Mode</h3>
                        <p className="text-gray-600">Scheduled mode is only available for Email agents.</p>
                      </div>
                    )}
                  </div>
                )}

                                {/* Write Your Email Tab */}
                {activeTab === 'email-recurring' && (
                  <div className="space-y-6">
                    {searchParams.get('agent_type') === 'email' ? (
                      // Email Recurring Mode Form
                      <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* Agent Name */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              <Mail className="h-4 w-4 inline mr-2" />
                              Agent Name *
                            </label>
                            <input
                              type="text"
                              value={emailRecurringMode.agentName}
                              onChange={(e) => handleEmailRecurringModeChange('agentName', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="e.g., Weekly Pet Care Email Agent"
                              required
                            />
                          </div>

                          {/* Topic Selection */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              <Target className="h-4 w-4 inline mr-2" />
                              Select Topic *
                            </label>
                            <select
                              value={emailRecurringMode.topic}
                              onChange={(e) => handleEmailRecurringModeChange('topic', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              required
                            >
                              <option value="">Select a topic...</option>
                              {topicOptions.map(topic => (
                                <option key={topic} value={topic}>{topic}</option>
                              ))}
                            </select>
                            {emailRecurringMode.topic === 'Custom' && (
                              <input
                                type="text"
                                value={emailRecurringMode.customTopic}
                                onChange={(e) => handleEmailRecurringModeChange('customTopic', e.target.value)}
                                className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Enter custom topic..."
                              />
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                           {/* Word Count */}
                                                    <div>
                                                      <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        <Hash className="h-4 w-4 inline mr-2" />
                                                        Word Count *
                                                      </label>
                                                      <select
                                                        value={emailRecurringMode.wordCount}
                                                        onChange={(e) => handleEmailRecurringModeChange('wordCount', e.target.value)}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                        required
                                                      >
                                                        {wordCountOptions.map(option => (
                                                          <option key={option.value} value={option.value}>{option.label}</option>
                                                        ))}
                                                      </select>
                                                    </div>

                        </div>

                                                {/* Schedule Selection (replacing Holiday Selection) */}
                                                <div className="space-y-4">
                                                  <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    <Calendar className="h-4 w-4 inline mr-2" />
                                                    Select Schedule for Email Campaigns *
                                                  </label>
                                                  
                                                  {/* Schedule Type Selection */}
                                                  <div className="space-y-3">
                                                    <label className="flex items-start">
                                                      <input
                                                        type="radio"
                                                        name="scheduleType"
                                                        value="weekly"
                                                        checked={emailRecurringMode.scheduleType === 'weekly'}
                                                        onChange={(e) => handleEmailRecurringModeChange('scheduleType', e.target.value)}
                                                        className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                                                      />
                                                      <div className="ml-3">
                                                        <span className="text-sm font-medium text-gray-900">Weekly Schedule</span>
                                                        <p className="text-xs text-gray-600">Send emails on selected days of the week</p>
                                                      </div>
                                                    </label>
                                                    <label className="flex items-start">
                                                      <input
                                                        type="radio"
                                                        name="scheduleType"
                                                        value="monthly"
                                                        checked={emailRecurringMode.scheduleType === 'monthly'}
                                                        onChange={(e) => handleEmailRecurringModeChange('scheduleType', e.target.value)}
                                                        className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                                                      />
                                                      <div className="ml-3">
                                                        <span className="text-sm font-medium text-gray-900">Monthly Schedule</span>
                                                        <p className="text-xs text-gray-600">1st of every month this agent will run</p>
                                                      </div>
                                                    </label>
                                                  </div>
                        
                                                  {/* Weekly Schedule - Days of Week Selection */}
                                                  {emailRecurringMode.scheduleType === 'weekly' && (
                                                    <div className="mt-4 p-4 border border-gray-200 rounded-lg">
                                                      <label className="block text-sm font-medium text-gray-700 mb-3">
                                                        Select Days of Week *
                                                      </label>
                                                      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
                                                        {Object.entries(emailRecurringMode.daysOfWeek).map(([day, selected]) => (
                                                          <label key={day} className="flex items-center space-x-2 p-2 rounded hover:bg-gray-50 cursor-pointer">
                                                            <input
                                                              type="checkbox"
                                                              checked={selected}
                                                              onChange={(e) => handleEmailRecurringModeChange('daysOfWeek', {
                                                                ...emailRecurringMode.daysOfWeek,
                                                                [day]: e.target.checked
                                                              })}
                                                              className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                                            />
                                                            <span className="text-sm text-gray-700 capitalize">{day}</span>
                                                          </label>
                                                        ))}
                                                      </div>
                                                      {!Object.values(emailRecurringMode.daysOfWeek).some(day => day) && (
                                                        <p className="text-sm text-red-600 mt-2">Please select at least one day.</p>
                                                      )}
                                                    </div>
                                                  )}
                        
                                                  {/* Monthly Schedule - Fixed to 1st of every month */}
                                                  {emailRecurringMode.scheduleType === 'monthly' && (
                                                    <div className="mt-4 p-4 border border-gray-200 rounded-lg bg-blue-50">
                                                      <div className="flex items-center space-x-2">
                                                        <Calendar className="h-5 w-5 text-blue-600" />
                                                        <div>
                                                          <p className="text-sm font-medium text-gray-900">Monthly Schedule</p>
                                                          <p className="text-sm text-gray-600">This agent will run on the <strong>1st of every month</strong> (January 1st, February 1st, March 1st, etc.)</p>
                                                        </div>
                                                      </div>
                                                    </div>
                                                  )}
                                                </div>

                                                                        {/* Customer Database Integration (from scheduled mode) */}
                                                                        <div className="space-y-4">
                                                                          <div className="p-4 bg-green-50 rounded-lg border-l-4 border-green-400">
                                                                            <div className="flex">
                                                                              <div className="flex-shrink-0">
                                                                                <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                                                                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                                                </svg>
                                                                              </div>
                                                                              <div className="ml-3">
                                                                                <div className="font-medium text-green-900">Customer Database Integration</div>
                                                                                <div className="text-sm text-green-700 mt-1">Emails will be automatically sent to customers who have opted in for email communications. Email content will be personalized using customer name and pet information for your selected schedule.</div>
                                                                              </div>
                                                                            </div>
                                                                          </div>
                                                                        </div>
                                                
                                                                        {/* Business Information & Email Content Template (from scheduled mode) */}
                                                                        <div className="space-y-4">
                                                                          <label className="block text-sm font-medium text-gray-700 mb-2">
                                                                            <FileText className="h-4 w-4 inline mr-2" />
                                                                            Business Information & Email Content Template
                                                                          </label>
                                                                          <textarea
                                                                            value={emailRecurringMode.emailContentTemplate}
                                                                            onChange={(e) => handleEmailRecurringModeChange('emailContentTemplate', e.target.value)}
                                                                            rows={6}
                                                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                                            placeholder="Enter generic business information and content that should be included in all recurring emails. ChatGPT will use this information along with customer name, pet details, and your email topic to generate personalized emails.
                                                
                                                Example:
                                                - Visit our clinic for special offers
                                                - Don't forget your pet's annual checkup
                                                - We offer 24/7 emergency services
                                                - Book appointments online at [website]"
                                                                          />
                                                                          <p className="text-sm text-gray-500 mt-2">
                                                                            {emailRecurringMode.useChatGPTFormatting 
                                                                              ? "ChatGPT will combine this content with your email topic and customer details ([CUSTOMER_NAME] and [PET_NAME]) to create personalized emails."
                                                                              : "This content will be used exactly as written with only [CUSTOMER_NAME] and [PET_NAME] being replaced with actual customer details."
                                                                            }
                                                                          </p>
                                                                        </div>
                                                
                                                                        {/* Post Time (from scheduled mode) */}
                                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                                          <div>
                                                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                                              <Clock className="h-4 w-4 inline mr-2" />
                                                                              Email Send Time *
                                                                            </label>
                                                                            <select
                                                                              value={emailRecurringMode.postTime}
                                                                              onChange={(e) => handleEmailRecurringModeChange('postTime', e.target.value)}
                                                                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                                              required
                                                                            >
                                                                              {timeOptions.map(option => (
                                                                                <option key={option.value} value={option.value}>{option.label}</option>
                                                                              ))}
                                                                            </select>
                                                                          </div>
                                                                        </div>
                                                
                                                                        {/* Image Options (2x2 grid from scheduled mode) */}
                                                                        <div className="space-y-4">
                                                                          <label className="block text-sm font-medium text-gray-700">
                                                                            <ImageIcon className="h-4 w-4 inline mr-2" />
                                                                            Image Options
                                                                          </label>
                                                                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                                            <label className="flex items-start p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100">
                                                                              <input
                                                                                type="radio"
                                                                                name="emailRecurringImageOption"
                                                                                value="ai_generate"
                                                                                checked={emailRecurringMode.imageOption === 'ai_generate'}
                                                                                onChange={(e) => handleEmailRecurringModeChange('imageOption', e.target.value)}
                                                                                className="mr-3"
                                                                              />
                                                                              <div>
                                                                                <div className="font-medium">AI Generate</div>
                                                                                <div className="text-sm text-gray-500">Create themed images using AI</div>
                                                                              </div>
                                                                            </label>
                                                                            <label className="flex items-start p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100">
                                                                              <input
                                                                                type="radio"
                                                                                name="emailRecurringImageOption"
                                                                                value="upload"
                                                                                checked={emailRecurringMode.imageOption === 'upload'}
                                                                                onChange={(e) => handleEmailRecurringModeChange('imageOption', e.target.value)}
                                                                                className="mr-3"
                                                                              />
                                                                              <div>
                                                                                <div className="font-medium">Upload Images</div>
                                                                                <div className="text-sm text-gray-500">Use your own images</div>
                                                                              </div>
                                                                            </label>
                                                                            <label className="flex items-start p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100">
                                                                              <input
                                                                                type="radio"
                                                                                name="emailRecurringImageOption"
                                                                                value="reference"
                                                                                checked={emailRecurringMode.imageOption === 'reference'}
                                                                                onChange={(e) => handleEmailRecurringModeChange('imageOption', e.target.value)}
                                                                                className="mr-3"
                                                                              />
                                                                              <div>
                                                                                <div className="font-medium">Use as Reference</div>
                                                                                <div className="text-sm text-gray-500">Generate similar images</div>
                                                                              </div>
                                                                            </label>
                                                                            <label className="flex items-start p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100">
                                                                              <input
                                                                                type="radio"
                                                                                name="emailRecurringImageOption"
                                                                                value="none"
                                                                                checked={emailRecurringMode.imageOption === 'none'}
                                                                                onChange={(e) => handleEmailRecurringModeChange('imageOption', e.target.value)}
                                                                                className="mr-3"
                                                                              />
                                                                              <div>
                                                                                <div className="font-medium">No Image Needed</div>
                                                                                <div className="text-sm text-gray-500">Send text-only emails without any images</div>
                                                                              </div>
                                                                            </label>
                                                                          </div>
                                                                        </div>

                                                                         {/* Image Text (conditionally shown, moved below image options) */}
                        {emailRecurringMode.imageOption !== 'none' && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Text to Add on Image
                            </label>
                            <input
                              type="text"
                              value={emailRecurringMode.imageText}
                              onChange={(e) => handleEmailRecurringModeChange('imageText', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="e.g., Your Pet's Health Matters, Weekly Care Tips"
                            />
                          </div>
                        )}

                                                {/* Upload Images Section (conditionally shown, from scheduled mode) */}
                                                {emailRecurringMode.imageOption === 'upload' && (
                                                  <div className="space-y-4">
                                                    <label className="block text-sm font-medium text-gray-700">
                                                      <Upload className="h-4 w-4 inline mr-2" />
                                                      Upload Images
                                                    </label>
                                                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                                                      <input
                                                        type="file"
                                                        accept="image/*"
                                                        multiple
                                                        onChange={(e) => handleImageUpload(e, 'email_recurring')}
                                                        className="hidden"
                                                        id="emailRecurringImageUpload"
                                                      />
                                                      <label
                                                        htmlFor="emailRecurringImageUpload"
                                                        className="cursor-pointer flex flex-col items-center"
                                                      >
                                                        <Upload className="h-8 w-8 text-gray-400 mb-2" />
                                                        <span className="text-sm text-gray-600">Click to upload images</span>
                                                      </label>
                                                    </div>
                                                    {emailRecurringMode.uploadedImages.length > 0 && (
                                                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                                        {emailRecurringMode.uploadedImages.map((image, index) => (
                                                          <div key={index} className="relative">
                                                            <img
                                                              src={image.preview}
                                                              alt={`Upload ${index + 1}`}
                                                              className="w-full h-24 object-cover rounded-lg"
                                                            />
                                                            <button
                                                              onClick={() => removeUploadedImage(index, 'email_recurring')}
                                                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                                                            >
                                                              ×
                                                            </button>
                                                          </div>
                                                        ))}
                                                      </div>
                                                    )}
                                                  </div>
                                                )}

                        {/* Content Review Workflow (from scheduled mode) */}
                        <div className="space-y-4">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Content Review Workflow
                          </label>
                          <div className="space-y-3">
                            <label className="flex items-start">
                              <input
                                type="radio"
                                name="emailRecurringPostDestination"
                                value="in_review"
                                checked={emailRecurringMode.postDestination === 'in_review'}
                                onChange={(e) => handleEmailRecurringModeChange('postDestination', e.target.value)}
                                className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                              />
                              <div className="ml-3">
                                <span className="text-sm font-medium text-gray-900">In Review First</span>
                                <p className="text-xs text-gray-600">Generated recurring emails go to "In Review" → "Ready to Publish" → Sent to customers</p>
                              </div>
                            </label>
                            <label className="flex items-start">
                              <input
                                type="radio"
                                name="emailRecurringPostDestination"
                                value="ready_to_publish"
                                checked={emailRecurringMode.postDestination === 'ready_to_publish'}
                                onChange={(e) => handleEmailRecurringModeChange('postDestination', e.target.value)}
                                className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                              />
                              <div className="ml-3">
                                <span className="text-sm font-medium text-gray-900">Ready to Publish</span>
                                <p className="text-xs text-gray-600">Generated emails go directly to "Ready to Publish" → Sent to customers</p>
                              </div>
                            </label>
                            <label className="flex items-start">
                              <input
                                type="radio"
                                name="emailRecurringPostDestination"
                                value="auto_send"
                                checked={emailRecurringMode.postDestination === 'auto_send'}
                                onChange={(e) => handleEmailRecurringModeChange('postDestination', e.target.value)}
                                className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                              />
                              <div className="ml-3">
                                <span className="text-sm font-medium text-gray-900">Send Automatically</span>
                                <p className="text-xs text-gray-600">Recurring emails are generated and sent automatically to opted-in customers. Send time settings are ignored.</p>
                              </div>
                            </label>
                          </div>
                        </div>

                                       {/* Save Button (from scheduled mode) */}
                                                <div className="flex justify-end space-x-3">
                                                  <button
                                                    onClick={isRunMode ? saveAndRunAgent : saveAgent}
                                                    disabled={(() => {
                                                      const isDisabled = loading || (!isEditMode && !isRunMode && (
                                                        !emailRecurringMode.agentName || 
                                                        !emailRecurringMode.topic || 
                                                        (emailRecurringMode.topic === 'Custom' && !emailRecurringMode.customTopic) ||
                                                        (emailRecurringMode.scheduleType === 'weekly' && 
                                                         !Object.values(emailRecurringMode.daysOfWeek).some(day => day)) ||
                                                        (emailRecurringMode.scheduleType === 'monthly' && 
                                                         !emailRecurringMode.monthlySchedule)
                                                      ));
                                                      
                                                      // Debug logging to help identify missing fields
                                                      if (!isEditMode && !isRunMode && isDisabled) {
                                                        console.log('🔍 Email Recurring Mode Validation Debug:');
                                                        console.log('  agentName:', emailRecurringMode.agentName);
                                                        console.log('  topic:', emailRecurringMode.topic);
                                                        console.log('  customTopic:', emailRecurringMode.customTopic);
                                                        console.log('  scheduleType:', emailRecurringMode.scheduleType);
                                                        if (emailRecurringMode.scheduleType === 'weekly') {
                                                          console.log('  daysOfWeek:', emailRecurringMode.daysOfWeek);
                                                          console.log('  anyDaySelected:', Object.values(emailRecurringMode.daysOfWeek).some(day => day));
                                                        }
                                                        if (emailRecurringMode.scheduleType === 'monthly') {
                                                          console.log('  monthlySchedule:', emailRecurringMode.monthlySchedule);
                                                        }
                                                      }
                                                      
                                                      return isDisabled;
                                                    })()}
                                                    className="text-white px-6 py-2 rounded-lg transition-colors disabled:opacity-50 flex items-center font-medium"
                                                    style={{ 
                                                      backgroundColor: loading ? '#94a3b8' : 
                                                                      isRunMode ? '#10b981' : '#29add3'
                                                    }}
                                                    onMouseEnter={(e) => {
                                                      if (!loading && ((isEditMode || isRunMode) || (emailRecurringMode.agentName && emailRecurringMode.topic))) {
                                                        e.target.style.backgroundColor = isRunMode ? '#059669' : '#1e88e5';
                                                      }
                                                    }}
                                                    onMouseLeave={(e) => {
                                                      if (!loading) {
                                                        e.target.style.backgroundColor = isRunMode ? '#10b981' : '#29add3';
                                                      }
                                                    }}
                                                  >
                                                    {isRunMode ? <Play className="h-4 w-4 mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                                                    {loading ? (isRunMode ? 'Updating & Running...' : 'Saving...') : 
                                                     isRunMode ? 'Update & Run Agent' : 
                                                     isEditMode ? 'Update Agent Configuration' : 'Save Agent'}
                                                  </button>
                                                </div>
                        
                                                
                        
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Social Media Write Mode</h3>
                        <p className="text-gray-600">Social Media Write Mode form will be available here.</p>
                        <p className="text-sm text-gray-500 mt-2">Currently under development.</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Write Your Email Tab */}
                {activeTab === 'email-write' && (
                  <div className="space-y-6">
                    {searchParams.get('agent_type') === 'email' ? (
                      // Email Write Mode Form
                      <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* Agent Name */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              <Mail className="h-4 w-4 inline mr-2" />
                              Agent Name *
                            </label>
                            <input
                              type="text"
                              value={emailWriteMode.agentName}
                              onChange={(e) => handleEmailWriteModeChange('agentName', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="e.g., Custom Email Agent"
                              required
                            />
                          </div>

                          {/* Word Count */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              <Hash className="h-4 w-4 inline mr-2" />
                              Word Count *
                            </label>
                            <select
                              value={emailWriteMode.wordCount}
                              onChange={(e) => handleEmailWriteModeChange('wordCount', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              required
                            >
                              {wordCountOptions.map(option => (
                                <option key={option.value} value={option.value}>{option.label}</option>
                              ))}
                            </select>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* Email Send Date */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              <Calendar className="h-4 w-4 inline mr-2" />
                              Send Date *
                            </label>
                            <input
                              type="date"
                              value={emailWriteMode.postDate}
                              onChange={(e) => handleEmailWriteModeChange('postDate', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              required
                            />
                          </div>

                          {/* Send Time */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              <Clock className="h-4 w-4 inline mr-2" />
                              Send Time *
                            </label>
                            <select
                              value={emailWriteMode.postTime}
                              onChange={(e) => handleEmailWriteModeChange('postTime', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              required
                            >
                              {timeOptions.map(option => (
                                <option key={option.value} value={option.value}>{option.label}</option>
                              ))}
                            </select>
                          </div>
                        </div>

                        {/* Email Type Selection */}
                        <div className="space-y-4">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Email Delivery Type *
                          </label>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <label className="flex items-start p-4 border-2 border-blue-200 rounded-lg cursor-pointer hover:bg-blue-50 transition-colors">
                              <input
                                type="radio"
                                name="emailType"
                                value="bulk"
                                checked={emailWriteMode.emailType === 'bulk'}
                                onChange={(e) => {
                                  handleEmailWriteModeChange('emailType', e.target.value);
                                  // Update email content based on type
                                  if (e.target.value === 'bulk') {
                                    handleEmailWriteModeChange('emailContent', emailWriteMode.emailContentBulk);
                                  } else {
                                    handleEmailWriteModeChange('emailContent', emailWriteMode.emailContent.replace(/\\[CUSTOMER_NAME\\]/g, 'CUSTOMER_NAME').replace(/\\[PET_NAME\\]/g, 'PET_NAME'));
                                  }
                                }}
                                className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500 mr-3 mt-1"
                              />
                              <div>
                                <div className="font-medium text-blue-900">Bulk Email Campaign</div>
                                <div className="text-sm text-blue-700 mt-1">Send to all opted-in customers using customer database with automatic personalization</div>
                              </div>
                            </label>
                            <label className="flex items-start p-4 border-2 border-green-200 rounded-lg cursor-pointer hover:bg-green-50 transition-colors">
                              <input
                                type="radio"
                                name="emailType"
                                value="single"
                                checked={emailWriteMode.emailType === 'single'}
                                onChange={(e) => {
                                  handleEmailWriteModeChange('emailType', e.target.value);
                                  // Update email content for single email
                                  if (e.target.value === 'single') {
                                    handleEmailWriteModeChange('emailContent', emailWriteMode.emailContent.replace(/\\[CUSTOMER_NAME\\]/g, 'CUSTOMER_NAME').replace(/\\[PET_NAME\\]/g, 'PET_NAME'));
                                  }
                                }}
                                className="h-4 w-4 text-green-600 border-gray-300 focus:ring-green-500 mr-3 mt-1"
                              />
                              <div>
                                <div className="font-medium text-green-900">Single Email</div>
                                <div className="text-sm text-green-700 mt-1">Send to a specific customer selected from database</div>
                              </div>
                            </label>
                          </div>
                        </div>

                        {/* Customer Search (only for single email) */}
                        {emailWriteMode.emailType === 'single' && (
                          <div className="space-y-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              <Search className="h-4 w-4 inline mr-2" />
                              Search Customer
                            </label>
                            <div className="relative">
                              <input
                                type="text"
                                placeholder="Search by customer name, email, or pet name..."
                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 pl-10"
                              />
                              <Search className="h-5 w-5 text-gray-400 absolute left-3 top-2.5" />
                            </div>
                            <div className="text-sm text-gray-500">
                              <strong>Note:</strong> Customer search functionality will be available after creating this Email Agent. Use this agent from the AI Agents Dashboard to search and select customers for personalized emails.
                            </div>
                          </div>
                        )}

                        {/* Email Subject */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            <Mail className="h-4 w-4 inline mr-2" />
                            Email Subject *
                          </label>
                          <input
                            type="text"
                            value={emailWriteMode.emailSubject}
                            onChange={(e) => handleEmailWriteModeChange('emailSubject', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="e.g., Special Offer for Your Pet's Health"
                            required
                          />
                        </div>

                        {/* Email Content */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            <FileText className="h-4 w-4 inline mr-2" />
                            Email Content *
                          </label>
                          <textarea
                            value={emailWriteMode.emailContent}
                            onChange={(e) => handleEmailWriteModeChange('emailContent', e.target.value)}
                            rows={6}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder={emailWriteMode.emailType === 'bulk' 
                              ? "Write your email content here. You can use [CUSTOMER_NAME] and [PET_NAME] for personalization..." 
                              : "Write your email content here. Replace CUSTOMER_NAME and PET_NAME with actual names..."
                            }
                            required
                          />
                          <p className="text-sm text-gray-500 mt-2">
                            {emailWriteMode.emailType === 'bulk' 
                              ? <>Use <strong>[CUSTOMER_NAME]</strong> and <strong>[PET_NAME]</strong> for personalization if you want to use customer database to send emails to everyone</>
                              : <>Replace <strong>CUSTOMER_NAME</strong> and <strong>PET_NAME</strong> with actual customer and pet names for this specific email</>
                            }
                          </p>
                        </div>

                        {/* Image Options */}
                        <div className="space-y-4">
                          <label className="block text-sm font-medium text-gray-700">
                            <ImageIcon className="h-4 w-4 inline mr-2" />
                            Image Options
                          </label>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <label className="flex items-start p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100">
                              <input
                                type="radio"
                                name="emailWriteImageOption"
                                value="ai_generate"
                                checked={emailWriteMode.imageOption === 'ai_generate'}
                                onChange={(e) => handleEmailWriteModeChange('imageOption', e.target.value)}
                                className="mr-3"
                              />
                              <div>
                                <div className="font-medium">AI Generate</div>
                                <div className="text-sm text-gray-500">Create images based on your content using AI</div>
                              </div>
                            </label>
                            <label className="flex items-start p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100">
                              <input
                                type="radio"
                                name="emailWriteImageOption"
                                value="upload"
                                checked={emailWriteMode.imageOption === 'upload'}
                                onChange={(e) => handleEmailWriteModeChange('imageOption', e.target.value)}
                                className="mr-3"
                              />
                              <div>
                                <div className="font-medium">Upload Images</div>
                                <div className="text-sm text-gray-500">Use your own images for the email</div>
                              </div>
                            </label>
                            <label className="flex items-start p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100">
                              <input
                                type="radio"
                                name="emailWriteImageOption"
                                value="reference"
                                checked={emailWriteMode.imageOption === 'reference'}
                                onChange={(e) => handleEmailWriteModeChange('imageOption', e.target.value)}
                                className="mr-3"
                              />
                              <div>
                                <div className="font-medium">Use as Reference</div>
                                <div className="text-sm text-gray-500">Generate similar images based on uploaded ones</div>
                              </div>
                            </label>
                            <label className="flex items-start p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100">
                              <input
                                type="radio"
                                name="emailWriteImageOption"
                                value="none"
                                checked={emailWriteMode.imageOption === 'none'}
                                onChange={(e) => handleEmailWriteModeChange('imageOption', e.target.value)}
                                className="mr-3"
                              />
                              <div>
                                <div className="font-medium">No Image Needed</div>
                                <div className="text-sm text-gray-500">Send text-only emails without any images</div>
                              </div>
                            </label>
                          </div>
                        </div>

                        {/* Image Text (conditionally shown) */}
                        {emailWriteMode.imageOption !== 'none' && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Text to Add on Image
                            </label>
                            <input
                              type="text"
                              value={emailWriteMode.imageText}
                              onChange={(e) => handleEmailWriteModeChange('imageText', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="e.g., Special Offer, Visit Today"
                            />
                          </div>
                        )}

                        {/* ChatGPT Email Formatting */}
                        <div className="space-y-4">
                          <label className="flex items-center p-4 bg-purple-50 rounded-lg">
                            <input
                              type="checkbox"
                              checked={emailWriteMode.useChatGPTFormatting}
                              onChange={(e) => handleEmailWriteModeChange('useChatGPTFormatting', e.target.checked)}
                              className="h-4 w-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500 mr-3"
                            />
                            <div>
                              <div className="font-medium text-purple-900">Use ChatGPT Email Formatting</div>
                              <div className="text-sm text-purple-700">Let ChatGPT format and enhance your email content. If unchecked, your email will be used exactly as written.</div>
                            </div>
                          </label>
                        </div>

                        {/* Content Review Workflow */}
                        <div className="space-y-4">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Content Review Workflow
                          </label>
                          <div className="space-y-3">
                            <label className="flex items-start">
                              <input
                                type="radio"
                                name="emailWritePostDestination"
                                value="in_review"
                                checked={emailWriteMode.postDestination === 'in_review'}
                                onChange={(e) => handleEmailWriteModeChange('postDestination', e.target.value)}
                                className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                              />
                              <div className="ml-3">
                                <span className="text-sm font-medium text-gray-900">In Review First</span>
                                <p className="text-xs text-gray-600">Email goes to "In Review" → "Ready to Publish" → Sent</p>
                              </div>
                            </label>
                            <label className="flex items-start">
                              <input
                                type="radio"
                                name="emailWritePostDestination"
                                value="ready_to_publish"
                                checked={emailWriteMode.postDestination === 'ready_to_publish'}
                                onChange={(e) => handleEmailWriteModeChange('postDestination', e.target.value)}
                                className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                              />
                              <div className="ml-3">
                                <span className="text-sm font-medium text-gray-900">Ready to Publish</span>
                                <p className="text-xs text-gray-600">Email goes directly to "Ready to Publish" → Sent</p>
                              </div>
                            </label>
                            <label className="flex items-start">
                              <input
                                type="radio"
                                name="emailWritePostDestination"
                                value="auto_post"
                                checked={emailWriteMode.postDestination === 'auto_post'}
                                onChange={(e) => handleEmailWriteModeChange('postDestination', e.target.value)}
                                className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                              />
                              <div className="ml-3">
                                <span className="text-sm font-medium text-gray-900">Send Immediately</span>
                                <p className="text-xs text-gray-600">Email is sent immediately without manual review. Send date and time settings are ignored.</p>
                              </div>
                            </label>
                          </div>
                        </div>

                        {/* Upload Images Section (conditionally shown) */}
                        {emailWriteMode.imageOption === 'upload' && (
                          <div className="space-y-4">
                            <label className="block text-sm font-medium text-gray-700">
                              <Upload className="h-4 w-4 inline mr-2" />
                              Upload Images
                            </label>
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                              <input
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={(e) => handleImageUpload(e, 'email_write')}
                                className="hidden"
                                id="emailWriteImageUpload"
                              />
                              <label
                                htmlFor="emailWriteImageUpload"
                                className="cursor-pointer flex flex-col items-center"
                              >
                                <Upload className="h-8 w-8 text-gray-400 mb-2" />
                                <span className="text-sm text-gray-600">Click to upload images</span>
                              </label>
                            </div>
                            {emailWriteMode.uploadedImages.length > 0 && (
                              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                {emailWriteMode.uploadedImages.map((image, index) => (
                                  <div key={index} className="relative">
                                    <img
                                      src={image.preview}
                                      alt={`Upload ${index + 1}`}
                                      className="w-full h-24 object-cover rounded-lg"
                                    />
                                    <button
                                      onClick={() => removeUploadedImage(index, 'email_write')}
                                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                                    >
                                      ×
                                    </button>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}

                        {/* Save/Run Button */}
                        <div className="flex justify-end space-x-3">
                          <button
                            onClick={isRunMode ? saveAndRunAgent : saveAgent}
                            disabled={loading || (!isEditMode && !isRunMode && (!emailWriteMode.agentName || !emailWriteMode.emailSubject || !emailWriteMode.emailContent))}
                            className="text-white px-6 py-2 rounded-lg transition-colors disabled:opacity-50 flex items-center font-medium"
                            style={{ 
                              backgroundColor: loading ? '#94a3b8' : 
                                              isRunMode ? '#10b981' : '#29add3'
                            }}
                            onMouseEnter={(e) => {
                              if (!loading && ((isEditMode || isRunMode) || (emailWriteMode.agentName && emailWriteMode.emailSubject && emailWriteMode.emailContent))) {
                                e.target.style.backgroundColor = isRunMode ? '#059669' : '#1e88e5';
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (!loading) {
                                e.target.style.backgroundColor = isRunMode ? '#10b981' : '#29add3';
                              }
                            }}
                          >
                            {isRunMode ? <Play className="h-4 w-4 mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                            {loading ? (isRunMode ? 'Updating & Running...' : 'Saving...') : 
                             isRunMode ? 'Update & Run Agent' : 
                             isEditMode ? 'Update Agent Configuration' : 'Save Agent'}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Social Media Write Mode</h3>
                        <p className="text-gray-600">Social Media Write Mode form will be available here.</p>
                        <p className="text-sm text-gray-500 mt-2">Currently under development.</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Loading Modal for Save & Redirect */}
      {showSaveModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 shadow-xl max-w-sm mx-4">
            <div className="flex items-center space-x-3">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <div>
                <h3 className="text-lg font-medium text-gray-900">
                  {isEditMode ? 'Updating Agent' : 'Creating Agent'}
                </h3>
                <p className="text-sm text-gray-600">
                  {isEditMode ? 'Saving changes and redirecting...' : 'Setting up your agent and redirecting...'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIAgentConfig;