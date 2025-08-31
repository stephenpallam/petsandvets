import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Star, 
  Globe,
  MapPin,
  Phone,
  ExternalLink,
  MessageSquare,
  Facebook,
  Instagram,
  X,
  MessageCircle
} from 'lucide-react';
import { hospitalInfo } from '../mock';

const ReviewUs = () => {
  const [businessInfo, setBusinessInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const primaryColor = '#29add3';
  const primaryLight = '#5bc0db';
  const primaryBg = '#e6f7fb';

  const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || import.meta.env.REACT_APP_BACKEND_URL || window.location.origin;

  const fetchBusinessInfo = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/business-info`);
      if (response.ok) {
        const data = await response.json();
        setBusinessInfo(data);
      }
    } catch (error) {
      console.error('Error fetching business info:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBusinessInfo();
  }, []);

  // Filter only configured review platforms
  const getConfiguredReviewPlatforms = () => {
    if (!businessInfo) return [];
    
    const platforms = [];
    
    if (businessInfo.google_reviews_link && businessInfo.google_reviews_link.trim()) {
      platforms.push({
        name: 'Google Reviews',
        description: 'Share your experience with other pet owners on Google',
        icon: Globe,
        link: businessInfo.google_reviews_link,
        color: primaryColor, // Using website theme color
        bgColor: primaryBg // Using website theme background
      });
    }
    
    if (businessInfo.yelp_reviews_link && businessInfo.yelp_reviews_link.trim()) {
      platforms.push({
        name: 'Yelp Reviews',
        description: 'Help others discover great pet care on Yelp',
        icon: ExternalLink,
        link: businessInfo.yelp_reviews_link,
        color: '#d32323',
        bgColor: '#ffebee'
      });
    }
    
    if (businessInfo.facebook_reviews_link && businessInfo.facebook_reviews_link.trim()) {
      platforms.push({
        name: 'Facebook Reviews',
        description: 'Share your experience with our Facebook community',
        icon: Globe,
        link: businessInfo.facebook_reviews_link,
        color: '#1877f2',
        bgColor: '#e3f2fd'
      });
    }
    
    return platforms;
  };

  // Get configured social media platforms
  const getConfiguredSocialPlatforms = () => {
    if (!businessInfo) return [];
    
    const platforms = [];
    
    if (businessInfo.facebook_link && businessInfo.facebook_link.trim()) {
      platforms.push({
        name: 'Facebook',
        description: 'Follow us for updates and pet care tips',
        icon: Facebook,
        link: businessInfo.facebook_link,
        color: '#1877f2',
        bgColor: '#e3f2fd',
        buttonText: 'Follow Us'
      });
    }
    
    if (businessInfo.instagram_link && businessInfo.instagram_link.trim()) {
      platforms.push({
        name: 'Instagram',
        description: 'See adorable pets and behind-the-scenes content',
        icon: Instagram,
        link: businessInfo.instagram_link,
        color: '#E4405F',
        bgColor: '#fce4ec',
        buttonText: 'Follow Us'
      });
    }
    
    if (businessInfo.twitter_link && businessInfo.twitter_link.trim()) {
      platforms.push({
        name: 'X (Twitter)',
        description: 'Get quick updates and pet health tips',
        icon: X,
        link: businessInfo.twitter_link,
        color: '#000000',
        bgColor: '#f5f5f5',
        buttonText: 'Follow Us'
      });
    }
    
    if (businessInfo.whatsapp_group_link && businessInfo.whatsapp_group_link.trim()) {
      platforms.push({
        name: 'WhatsApp',
        description: 'Join our community for quick updates and support',
        icon: MessageCircle,
        link: businessInfo.whatsapp_group_link,
        color: '#25D366',
        bgColor: '#e8f5e8',
        buttonText: 'Join Group'
      });
    }
    
    return platforms;
  };

  const serviceAreas = [
    "South Riding", "Chantilly", "Aldie", "Ashburn", "Herndon", "Centreville", "Fairfax"
  ];

  const reviewPlatforms = getConfiguredReviewPlatforms();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: primaryColor }}></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-white">
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center" style={{ paddingTop: '30px', paddingBottom: '15px' }}>
          <h1 className="text-xl font-bold text-gray-900 mb-6">
            Review Us
          </h1>
          <div className="mb-6">
            <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold text-white" style={{ backgroundColor: primaryColor }}>
              Your Voice Matters to Us
            </span>
          </div>
          <p className="text-base text-gray-600 leading-relaxed max-w-3xl mx-auto">
            Every review helps us serve your pets better and guides other pet owners to quality care.
          </p>
        </div>
      </section>

      {/* Review Platforms */}
      {reviewPlatforms.length > 0 ? (
        <section className="bg-[#f8f9fa] py-6">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-xl font-bold text-gray-900 mb-8 text-center">
              Leave a Review on Your Preferred Platform
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 w-full">
              {reviewPlatforms.map((platform, index) => (
                <div key={index} className="p-4 rounded-lg shadow-md text-center border border-gray-200 hover:border-gray-300 transition-colors bg-white">
                  <div className="flex items-center justify-center w-12 h-12 rounded-full mx-auto mb-3" style={{ backgroundColor: platform.bgColor }}>
                    <platform.icon className="h-6 w-6" style={{ color: platform.color }} />
                  </div>
                  <h3 className="text-base font-semibold text-gray-900 mb-2">{platform.name}</h3>
                  <p className="text-gray-600 text-xs leading-relaxed mb-3">{platform.description}</p>
                  <a
                    href={platform.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center px-4 py-2 rounded-md font-medium transition-colors duration-200 text-white text-sm"
                    style={{ backgroundColor: platform.color }}
                    onMouseEnter={(e) => e.target.style.opacity = '0.9'}
                    onMouseLeave={(e) => e.target.style.opacity = '1'}
                  >
                    Write a Review
                    <ExternalLink className="ml-1 h-3 w-3" />
                  </a>
                </div>
              ))}
            </div>
          </div>
        </section>
      ) : (
        <section className="bg-[#f8f9fa] py-6">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="p-8 rounded-xl bg-white">
              <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Review Links Not Configured</h3>
              <p className="text-gray-600">
                Review platform links haven't been set up yet. Please contact us directly to share your feedback.
              </p>
            </div>
          </div>
        </section>
      )}

      {/* Social Media Follow Section */}
      {getConfiguredSocialPlatforms().length > 0 && (
        <section className="bg-white py-6">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-xl font-bold text-gray-900 mb-8 text-center">
              Follow Us
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 w-full">
              {getConfiguredSocialPlatforms().map((platform, index) => (
                <div key={index} className="p-4 rounded-lg shadow-md text-center border border-gray-200 hover:border-gray-300 transition-colors bg-white flex flex-col h-full">
                  <div className="flex items-center justify-center w-12 h-12 rounded-full mx-auto mb-3" style={{ backgroundColor: platform.bgColor }}>
                    <platform.icon className="h-6 w-6" style={{ color: platform.color }} />
                  </div>
                  <h3 className="text-base font-semibold text-gray-900 mb-2">{platform.name}</h3>
                  <p className="text-gray-600 text-xs leading-relaxed mb-3 flex-grow">{platform.description}</p>
                  <a
                    href={platform.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center px-4 py-2 rounded-md font-medium transition-colors duration-200 text-white text-sm mt-auto"
                    style={{ backgroundColor: platform.color }}
                    onMouseEnter={(e) => e.target.style.opacity = '0.9'}
                    onMouseLeave={(e) => e.target.style.opacity = '1'}
                  >
                    {platform.buttonText}
                    <ExternalLink className="ml-1 h-3 w-3" />
                  </a>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Service Areas */}
      <section className="bg-white py-6">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            Proudly Serving Northern Virginia
          </h2>
          <p className="text-gray-600 mb-6">
            Your reviews help pet owners across these communities:
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {serviceAreas.map((area, index) => (
              <span key={index} className="px-4 py-2 rounded-full text-white font-medium" style={{ backgroundColor: primaryColor }}>
                {area}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section style={{ background: `linear-gradient(135deg, ${primaryColor} 0%, #2196c7 100%)`, paddingTop: '30px', paddingBottom: '30px' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-bold text-white mb-4" style={{ fontSize: '1rem' }}>
            Prefer to Share Feedback Directly?
          </h2>
          <p className="mb-8" style={{ color: 'white', fontSize: '1rem' }}>
            We also welcome your feedback through direct communication
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href={`tel:${hospitalInfo.phone}`}
              className="inline-flex items-center justify-center bg-white px-8 py-3 rounded-lg font-semibold transition-colors duration-200"
              style={{ color: primaryColor }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#f9fafb'}
              onMouseLeave={(e) => e.target.style.backgroundColor = 'white'}
            >
              <Phone className="mr-2 h-5 w-5" />
              Call: {hospitalInfo.phone}
            </a>
            <Link
              to="/message-us"
              className="inline-flex items-center justify-center border-2 border-white text-white px-8 py-3 rounded-lg font-semibold transition-colors duration-200"
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = 'white';
                e.target.style.color = primaryColor;
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'transparent';
                e.target.style.color = 'white';
              }}
            >
              <MessageSquare className="mr-2 h-5 w-5" />
              Send Message
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ReviewUs;