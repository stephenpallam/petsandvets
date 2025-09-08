import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  Settings, 
  Key, 
  Zap, 
  Share2, 
  Image as ImageIcon, 
  Save, 
  AlertCircle, 
  CheckCircle,
  Eye,
  EyeOff,
  RefreshCw,
  Bot,
  Globe,
  Lock
} from 'lucide-react';

const AISettings = () => {
  const { user, token, isAdmin, canAccessManager, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState('llm');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [pageLoading, setPageLoading] = useState(true);
  const [showApiKeys, setShowApiKeys] = useState({});

  // LLM Settings
  const [llmSettings, setLlmSettings] = useState({
    provider: 'emergent',
    emergent_key: '',
    openai_key: '',
    anthropic_key: '',
    google_key: '',
    model: 'gpt-4',
    temperature: 0.7,
    max_tokens: 1000
  });

  // Image Generation Settings
  const [imageSettings, setImageSettings] = useState({
    provider: 'openai',
    openai_key: '',
    stability_key: '',
    google_key: '',
    model: 'dall-e-3',
    quality: 'standard',
    size: '1024x1024'
  });

  // Social Media Settings
  const [socialSettings, setSocialSettings] = useState({
    facebook: {
      app_id: '',
      app_secret: '',
      access_token: '',
      page_id: ''
    },
    instagram: {
      access_token: '',
      user_id: ''
    },
    twitter: {
      api_key: '',
      api_secret: '',
      access_token: '',
      access_token_secret: ''
    },
    whatsapp: {
      business_account_id: '',
      access_token: '',
      phone_number_id: ''
    }
  });

  // News Sources Settings
  const [newsSettings, setNewsSettings] = useState({
    sources: {
      veterinary_news: true,
      pet_health_articles: true,
      animal_welfare_updates: true,
      veterinary_journals: true
    },
    keywords: ['veterinary', 'pet health', 'animal care', 'pet nutrition', 'veterinary medicine'],
    update_frequency: '1' // hours
  });

  const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || import.meta.env.REACT_APP_BACKEND_URL || window.location.origin;

  const tabs = [
    { 
      id: 'llm', 
      label: 'LLM Settings', 
      icon: Bot, 
      color: '#29add3',
      description: 'Configure AI language models'
    },
    { 
      id: 'image', 
      label: 'Image Generation', 
      icon: ImageIcon, 
      color: '#8b5cf6',
      description: 'Set up AI image generation'
    },
    { 
      id: 'social', 
      label: 'Social Media', 
      icon: Share2, 
      color: '#10b981',
      description: 'Connect social media accounts'
    },
    { 
      id: 'news', 
      label: 'News Sources', 
      icon: Globe, 
      color: '#f59e0b',
      description: 'Configure trending news sources'
    }
  ];

  // Auth check
  useEffect(() => {
    if (!authLoading && (!user || !canAccessManager())) {
      window.location.href = '/login';
    } else if (!authLoading) {
      setPageLoading(false);
      fetchSettings();
    }
  }, [user, authLoading, canAccessManager]);

  const fetchSettings = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/ai-settings`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setLlmSettings(prev => ({ ...prev, ...data.llm_settings }));
        setImageSettings(prev => ({ ...prev, ...data.image_settings }));
        setSocialSettings(prev => ({ ...prev, ...data.social_settings }));
        setNewsSettings(prev => ({ ...prev, ...data.news_settings }));
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    }
  };

  const saveSettings = async () => {
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const settingsData = {
        llm_settings: llmSettings,
        image_settings: imageSettings,
        social_settings: socialSettings,
        news_settings: newsSettings
      };

      const response = await fetch(`${API_BASE_URL}/api/ai-settings`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settingsData)
      });

      if (response.ok) {
        setMessage({ 
          type: 'success', 
          text: 'AI settings saved successfully!' 
        });
      } else {
        const errorData = await response.json();
        setMessage({ type: 'error', text: errorData.detail || 'Failed to save settings' });
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      setMessage({ type: 'error', text: 'Network error. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const testConnection = async (service) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/ai-settings/test/${service}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setMessage({ type: 'success', text: `${service} connection successful!` });
      } else {
        const errorData = await response.json();
        setMessage({ type: 'error', text: errorData.detail || `${service} connection failed` });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Connection test failed' });
    } finally {
      setLoading(false);
    }
  };

  const toggleApiKeyVisibility = (key) => {
    setShowApiKeys(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleLlmSettingChange = (field, value) => {
    setLlmSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleImageSettingChange = (field, value) => {
    setImageSettings(prev => {
      const newSettings = { ...prev, [field]: value };
      
      // Auto-select default model when provider changes
      if (field === 'provider') {
        if (value === 'openai') {
          newSettings.model = 'dall-e-3';
        } else if (value === 'stability') {
          newSettings.model = 'stable-diffusion-xl';
        } else if (value === 'google') {
          newSettings.model = 'nano-banana';
        }
      }
      
      return newSettings;
    });
  };

  const handleSocialSettingChange = (platform, field, value) => {
    setSocialSettings(prev => ({
      ...prev,
      [platform]: {
        ...prev[platform],
        [field]: value
      }
    }));
  };

  const handleNewsSettingChange = (field, value) => {
    if (field === 'sources') {
      setNewsSettings(prev => ({
        ...prev,
        sources: {
          ...prev.sources,
          ...value
        }
      }));
    } else {
      setNewsSettings(prev => ({
        ...prev,
        [field]: value
      }));
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
                <Settings className="h-8 w-8 text-purple-600" />
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    AI Settings
                  </h2>
                  <p className="text-sm text-gray-600">
                    Configure AI models, API keys, and integrations
                  </p>
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

            {/* Tab Navigation */}
            <div className="border border-gray-200 rounded-lg mb-4 sm:mb-6">
              <div className="border-b border-gray-200">
                <nav className="flex flex-col sm:flex-row sm:space-x-8 px-3 sm:px-6" aria-label="Tabs">
                  {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className="w-full sm:w-auto py-3 sm:py-4 px-3 sm:px-1 border-b-2 sm:border-l-0 font-medium text-sm transition-colors border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                        style={{
                          borderBottomColor: isActive ? '#29add3' : 'transparent',
                          color: isActive ? '#29add3' : undefined,
                          backgroundColor: isActive ? '#f0fdff' : 'transparent'
                        }}
                      >
                        <div className="flex items-center justify-center sm:justify-start space-x-2">
                          <Icon className="h-4 w-4" style={{ color: isActive ? tab.color : undefined }} />
                          <span>{tab.label}</span>
                        </div>
                      </button>
                    );
                  })}
                </nav>
              </div>

              {/* Tab Content */}
              <div className="p-3 sm:p-6">
                {/* LLM Settings Tab */}
                {activeTab === 'llm' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Provider Selection */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <Bot className="h-4 w-4 inline mr-2" />
                          LLM Provider *
                        </label>
                        <select
                          value={llmSettings.provider}
                          onChange={(e) => handleLlmSettingChange('provider', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="emergent">Emergent LLM (Recommended)</option>
                          <option value="openai">OpenAI</option>
                          <option value="anthropic">Anthropic Claude</option>
                          <option value="google">Google Gemini</option>
                        </select>
                        <p className="text-xs text-gray-500 mt-1">
                          {llmSettings.provider === 'emergent' ? 'Uses your existing Emergent LLM key' : 'Requires separate API key configuration'}
                        </p>
                      </div>

                      {/* Model Selection */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Model *
                        </label>
                        <select
                          value={llmSettings.model}
                          onChange={(e) => handleLlmSettingChange('model', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          {llmSettings.provider === 'openai' && (
                            <>
                              <option value="gpt-4">GPT-4</option>
                              <option value="gpt-4-turbo">GPT-4 Turbo</option>
                              <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                            </>
                          )}
                          {llmSettings.provider === 'anthropic' && (
                            <>
                              <option value="claude-3-opus">Claude 3 Opus</option>
                              <option value="claude-3-sonnet">Claude 3 Sonnet</option>
                              <option value="claude-3-haiku">Claude 3 Haiku</option>
                            </>
                          )}
                          {llmSettings.provider === 'google' && (
                            <>
                              <option value="gemini-pro">Gemini Pro</option>
                              <option value="gemini-pro-vision">Gemini Pro Vision</option>
                            </>
                          )}
                          {llmSettings.provider === 'emergent' && (
                            <option value="auto">Auto-Select Best Model</option>
                          )}
                        </select>
                      </div>
                    </div>

                    {/* API Keys */}
                    {llmSettings.provider !== 'emergent' && (
                      <div className="space-y-4">
                        <h4 className="font-medium text-gray-900">API Configuration</h4>
                        <div className="grid grid-cols-1 gap-4">
                          {llmSettings.provider === 'openai' && (
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                <Key className="h-4 w-4 inline mr-2" />
                                OpenAI API Key *
                              </label>
                              <div className="relative">
                                <input
                                  type={showApiKeys.openai ? 'text' : 'password'}
                                  value={llmSettings.openai_key}
                                  onChange={(e) => handleLlmSettingChange('openai_key', e.target.value)}
                                  className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  placeholder="sk-..."
                                />
                                <button
                                  type="button"
                                  onClick={() => toggleApiKeyVisibility('openai')}
                                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                >
                                  {showApiKeys.openai ? (
                                    <EyeOff className="h-4 w-4 text-gray-400" />
                                  ) : (
                                    <Eye className="h-4 w-4 text-gray-400" />
                                  )}
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Model Parameters */}
                    <div className="space-y-4">
                      <h4 className="font-medium text-gray-900">Model Parameters</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Temperature: {llmSettings.temperature}
                          </label>
                          <input
                            type="range"
                            min="0"
                            max="2"
                            step="0.1"
                            value={llmSettings.temperature}
                            onChange={(e) => handleLlmSettingChange('temperature', parseFloat(e.target.value))}
                            className="w-full"
                          />
                          <div className="flex justify-between text-xs text-gray-500 mt-1">
                            <span>Conservative</span>
                            <span>Creative</span>
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Max Tokens
                          </label>
                          <input
                            type="number"
                            value={llmSettings.max_tokens}
                            onChange={(e) => handleLlmSettingChange('max_tokens', parseInt(e.target.value))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            min="100"
                            max="4000"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Test Connection */}
                    <div className="flex justify-end">
                      <button
                        onClick={() => testConnection('llm')}
                        disabled={loading}
                        className="text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50 flex items-center font-medium mr-3"
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
                        <Zap className="h-4 w-4 mr-2" />
                        Test Connection
                      </button>
                    </div>
                  </div>
                )}

                {/* Image Generation Settings Tab */}
                {activeTab === 'image' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Provider Selection */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <ImageIcon className="h-4 w-4 inline mr-2" />
                          Image Provider *
                        </label>
                        <select
                          value={imageSettings.provider}
                          onChange={(e) => handleImageSettingChange('provider', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="openai">OpenAI DALL-E</option>
                          <option value="stability">Stability AI</option>
                          <option value="google">Google Nano Banana</option>
                        </select>
                      </div>

                      {/* Model Selection */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Model *
                        </label>
                        <select
                          value={imageSettings.model}
                          onChange={(e) => handleImageSettingChange('model', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          {imageSettings.provider === 'openai' && (
                            <>
                              <option value="dall-e-3">DALL-E 3</option>
                              <option value="dall-e-2">DALL-E 2</option>
                            </>
                          )}
                          {imageSettings.provider === 'stability' && (
                            <>
                              <option value="stable-diffusion-xl">Stable Diffusion XL</option>
                              <option value="stable-diffusion-v1-6">Stable Diffusion v1.6</option>
                            </>
                          )}
                          {imageSettings.provider === 'google' && (
                            <>
                              <option value="nano-banana">Nano Banana</option>
                              <option value="imagen-3">Imagen 3</option>
                            </>
                          )}
                        </select>
                      </div>
                    </div>

                    {/* API Key */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <Key className="h-4 w-4 inline mr-2" />
                        {imageSettings.provider === 'openai' ? 'OpenAI API Key' : 
                         imageSettings.provider === 'stability' ? 'Stability AI API Key' : 
                         'Google API Key'} *
                      </label>
                      <div className="relative">
                        <input
                          type={showApiKeys.image ? 'text' : 'password'}
                          value={imageSettings.provider === 'openai' ? imageSettings.openai_key : 
                                imageSettings.provider === 'stability' ? imageSettings.stability_key :
                                imageSettings.google_key}
                          onChange={(e) => handleImageSettingChange(
                            imageSettings.provider === 'openai' ? 'openai_key' : 
                            imageSettings.provider === 'stability' ? 'stability_key' :
                            'google_key', 
                            e.target.value
                          )}
                          className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder={imageSettings.provider === 'openai' ? 'sk-...' : 
                                     imageSettings.provider === 'stability' ? 'sk-...' :
                                     'AIza...'}
                        />
                        <button
                          type="button"
                          onClick={() => toggleApiKeyVisibility('image')}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        >
                          {showApiKeys.image ? (
                            <EyeOff className="h-4 w-4 text-gray-400" />
                          ) : (
                            <Eye className="h-4 w-4 text-gray-400" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Image Parameters */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Quality
                        </label>
                        <select
                          value={imageSettings.quality}
                          onChange={(e) => handleImageSettingChange('quality', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="standard">Standard</option>
                          <option value="hd">HD (Higher Cost)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Size
                        </label>
                        <select
                          value={imageSettings.size}
                          onChange={(e) => handleImageSettingChange('size', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="1024x1024">1024x1024 (Square)</option>
                          <option value="1792x1024">1792x1024 (Landscape)</option>
                          <option value="1024x1792">1024x1792 (Portrait)</option>
                        </select>
                      </div>
                    </div>

                    {/* Test Connection */}
                    <div className="flex justify-end">
                      <button
                        onClick={() => testConnection('image')}
                        disabled={loading}
                        className="text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50 flex items-center font-medium mr-3"
                        style={{ 
                          backgroundColor: loading ? '#94a3b8' : '#8b5cf6'
                        }}
                        onMouseEnter={(e) => {
                          if (!loading) e.target.style.backgroundColor = '#7c3aed';
                        }}
                        onMouseLeave={(e) => {
                          if (!loading) e.target.style.backgroundColor = '#8b5cf6';
                        }}
                      >
                        <ImageIcon className="h-4 w-4 mr-2" />
                        Test Image Generation
                      </button>
                    </div>
                  </div>
                )}

                {/* Social Media Settings Tab */}
                {activeTab === 'social' && (
                  <div className="space-y-8">
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <div className="flex">
                        <AlertCircle className="h-5 w-5 text-yellow-400 mt-0.5 mr-2" />
                        <div>
                          <h4 className="text-sm font-medium text-yellow-800">Coming Soon</h4>
                          <p className="text-sm text-yellow-700 mt-1">
                            Social media API integrations are being developed. For now, you can prepare your API credentials.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Facebook Settings */}
                    <div className="border rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                        📘 Facebook Integration
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">App ID</label>
                          <input
                            type="text"
                            value={socialSettings.facebook.app_id}
                            onChange={(e) => handleSocialSettingChange('facebook', 'app_id', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Your Facebook App ID"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Page ID</label>
                          <input
                            type="text"
                            value={socialSettings.facebook.page_id}
                            onChange={(e) => handleSocialSettingChange('facebook', 'page_id', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Your Facebook Page ID"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Instagram Settings */}
                    <div className="border rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                        📷 Instagram Integration
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Access Token</label>
                          <input
                            type="password"
                            value={socialSettings.instagram.access_token}
                            onChange={(e) => handleSocialSettingChange('instagram', 'access_token', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Instagram Access Token"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">User ID</label>
                          <input
                            type="text"
                            value={socialSettings.instagram.user_id}
                            onChange={(e) => handleSocialSettingChange('instagram', 'user_id', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Instagram User ID"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Twitter/X Settings */}
                    <div className="border rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                        🐦 X (Twitter) Integration
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">API Key</label>
                          <input
                            type="password"
                            value={socialSettings.twitter.api_key}
                            onChange={(e) => handleSocialSettingChange('twitter', 'api_key', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Twitter API Key"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">API Secret</label>
                          <input
                            type="password"
                            value={socialSettings.twitter.api_secret}
                            onChange={(e) => handleSocialSettingChange('twitter', 'api_secret', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Twitter API Secret"
                          />
                        </div>
                      </div>
                    </div>

                    {/* WhatsApp Settings */}
                    <div className="border rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                        💬 WhatsApp Business Integration
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Business Account ID</label>
                          <input
                            type="text"
                            value={socialSettings.whatsapp.business_account_id}
                            onChange={(e) => handleSocialSettingChange('whatsapp', 'business_account_id', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="WhatsApp Business Account ID"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number ID</label>
                          <input
                            type="text"
                            value={socialSettings.whatsapp.phone_number_id}
                            onChange={(e) => handleSocialSettingChange('whatsapp', 'phone_number_id', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="WhatsApp Phone Number ID"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* News Sources Settings Tab */}
                {activeTab === 'news' && (
                  <div className="space-y-6">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex">
                        <Globe className="h-5 w-5 text-blue-400 mt-0.5 mr-2" />
                        <div>
                          <h4 className="text-sm font-medium text-blue-800">Trending News Sources</h4>
                          <p className="text-sm text-blue-700 mt-1">
                            Configure sources for veterinary and pet-specific trending news that AI agents will use for content generation.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* News Sources */}
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">News Sources</h4>
                      <div className="space-y-3">
                        {Object.entries(newsSettings.sources).map(([source, enabled]) => (
                          <label key={source} className="flex items-center">
                            <input
                              type="checkbox"
                              checked={enabled}
                              onChange={(e) => handleNewsSettingChange('sources', { [source]: e.target.checked })}
                              className="mr-3"
                            />
                            <span className="capitalize font-medium">
                              {source.replace(/_/g, ' ')}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Keywords */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Search Keywords
                      </label>
                      <input
                        type="text"
                        value={newsSettings.keywords.join(', ')}
                        onChange={(e) => handleNewsSettingChange('keywords', e.target.value.split(', ').map(k => k.trim()))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="veterinary, pet health, animal care"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Comma-separated keywords for finding relevant trending news
                      </p>
                    </div>

                    {/* Update Frequency */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Update Frequency
                      </label>
                      <select
                        value={newsSettings.update_frequency}
                        onChange={(e) => handleNewsSettingChange('update_frequency', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="1">Every Hour</option>
                        <option value="6">Every 6 Hours</option>
                        <option value="12">Every 12 Hours</option>
                        <option value="24">Daily</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end">
              <button
                onClick={saveSettings}
                disabled={loading}
                className="text-white px-6 py-2 rounded-lg transition-colors disabled:opacity-50 flex items-center font-medium"
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
                {loading ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save All Settings
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AISettings;