import React from 'react';
import { X, Eye, Heart, MessageCircle, Share, MoreHorizontal, ThumbsUp, Repeat2 } from 'lucide-react';

const SocialMediaPreviewModal = ({ isOpen, onClose, post, platform }) => {
  if (!isOpen) return null;

  const formatContent = (content) => {
    if (!content) return '';
    // Convert hashtags to clickable links
    return content.replace(/#(\w+)/g, '<span class="text-blue-500 hover:underline cursor-pointer">#$1</span>');
  };

  const FacebookPreview = () => (
    <div className="bg-white rounded-lg shadow-lg max-w-md mx-auto">
      {/* Facebook Header */}
      <div className="p-3 border-b">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-sm">PV</span>
          </div>
          <div>
            <h3 className="font-semibold text-sm">Pets and Vets Animal Hospital</h3>
            <p className="text-xs text-gray-500">2 hours ago • 🌍</p>
          </div>
          <div className="ml-auto">
            <MoreHorizontal className="h-5 w-5 text-gray-500" />
          </div>
        </div>
      </div>
      
      {/* Facebook Content */}
      <div className="p-3">
        <p className="text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: formatContent(post.content) }} />
      </div>
      
      {/* Facebook Image */}
      {post.image_url && (
        <div className="w-full">
          <img src={post.image_url} alt="Post content" className="w-full h-64 object-cover" />
        </div>
      )}
      
      {/* Facebook Actions */}
      <div className="p-3 border-t">
        <div className="flex items-center justify-between text-gray-500 mb-3">
          <span className="text-xs">👍❤️ 24 others</span>
          <span className="text-xs">3 comments • 2 shares</span>
        </div>
        <div className="flex items-center justify-around border-t pt-2">
          <button className="flex items-center space-x-2 text-gray-600 hover:bg-gray-100 px-4 py-2 rounded">
            <ThumbsUp className="h-4 w-4" />
            <span className="text-sm">Like</span>
          </button>
          <button className="flex items-center space-x-2 text-gray-600 hover:bg-gray-100 px-4 py-2 rounded">
            <MessageCircle className="h-4 w-4" />
            <span className="text-sm">Comment</span>
          </button>
          <button className="flex items-center space-x-2 text-gray-600 hover:bg-gray-100 px-4 py-2 rounded">
            <Share className="h-4 w-4" />
            <span className="text-sm">Share</span>
          </button>
        </div>
      </div>
    </div>
  );

  const TwitterPreview = () => (
    <div className="bg-white rounded-lg shadow-lg max-w-md mx-auto border">
      <div className="p-3">
        <div className="flex space-x-3">
          <div className="w-12 h-12 bg-blue-400 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-sm">PV</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-1">
              <h3 className="font-bold text-sm">Pets and Vets Animal Hospital</h3>
              <span className="text-blue-500">✓</span>
              <span className="text-gray-500 text-sm">@PetsAndVetsVA</span>
              <span className="text-gray-500">·</span>
              <span className="text-gray-500 text-sm">2h</span>
            </div>
            <p className="text-sm mt-1 leading-relaxed" dangerouslySetInnerHTML={{ __html: formatContent(post.content) }} />
            
            {post.image_url && (
              <div className="mt-3 rounded-2xl overflow-hidden border">
                <img src={post.image_url} alt="Post content" className="w-full h-48 object-cover" />
              </div>
            )}
            
            <div className="flex items-center justify-between mt-3 max-w-md text-gray-500">
              <button className="flex items-center space-x-2 hover:bg-blue-50 hover:text-blue-500 px-2 py-1 rounded-full">
                <MessageCircle className="h-4 w-4" />
                <span className="text-sm">3</span>
              </button>
              <button className="flex items-center space-x-2 hover:bg-green-50 hover:text-green-500 px-2 py-1 rounded-full">
                <Repeat2 className="h-4 w-4" />
                <span className="text-sm">5</span>
              </button>
              <button className="flex items-center space-x-2 hover:bg-red-50 hover:text-red-500 px-2 py-1 rounded-full">
                <Heart className="h-4 w-4" />
                <span className="text-sm">12</span>
              </button>
              <button className="flex items-center space-x-2 hover:bg-blue-50 hover:text-blue-500 px-2 py-1 rounded-full">
                <Share className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const InstagramPreview = () => (
    <div className="bg-white rounded-lg shadow-lg max-w-md mx-auto">
      {/* Instagram Header */}
      <div className="p-3 border-b flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500 rounded-full p-0.5">
            <div className="w-full h-full bg-white rounded-full flex items-center justify-center">
              <span className="text-xs font-bold">PV</span>
            </div>
          </div>
          <span className="font-semibold text-sm">petsandvetsva</span>
        </div>
        <MoreHorizontal className="h-5 w-5" />
      </div>
      
      {/* Instagram Image */}
      {post.image_url && (
        <div className="w-full">
          <img src={post.image_url} alt="Post content" className="w-full h-64 object-cover" />
        </div>
      )}
      
      {/* Instagram Actions */}
      <div className="p-3">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-4">
            <Heart className="h-6 w-6" />
            <MessageCircle className="h-6 w-6" />
            <Share className="h-6 w-6" />
          </div>
        </div>
        
        <p className="text-sm font-semibold mb-1">24 likes</p>
        
        <div className="text-sm">
          <span className="font-semibold">petsandvetsva</span>
          <span className="ml-1" dangerouslySetInnerHTML={{ __html: formatContent(post.content) }} />
        </div>
        
        <p className="text-gray-500 text-xs mt-2">2 HOURS AGO</p>
      </div>
    </div>
  );

  const WhatsAppPreview = () => (
    <div className="bg-gray-100 p-4 rounded-lg max-w-md mx-auto">
      {/* WhatsApp Header */}
      <div className="bg-green-600 text-white p-3 rounded-t-lg flex items-center space-x-3">
        <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
          <span className="text-green-600 text-xs font-bold">PV</span>
        </div>
        <div>
          <h3 className="font-semibold text-sm">Pets and Vets Animal Hospital</h3>
          <p className="text-xs opacity-90">last seen today at 2:30 PM</p>
        </div>
      </div>
      
      {/* WhatsApp Message */}
      <div className="bg-white p-4 rounded-b-lg">
        <div className="bg-green-100 rounded-lg p-3 max-w-xs ml-auto">
          <p className="text-sm" dangerouslySetInnerHTML={{ __html: formatContent(post.content) }} />
          
          {post.image_url && (
            <div className="mt-2 rounded-lg overflow-hidden">
              <img src={post.image_url} alt="Post content" className="w-full h-32 object-cover" />
            </div>
          )}
          
          <div className="flex items-center justify-end mt-1 space-x-1">
            <span className="text-xs text-gray-500">2:30 PM</span>
            <span className="text-blue-500 text-xs">✓✓</span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderPreview = () => {
    switch (platform?.toLowerCase()) {
      case 'facebook':
        return <FacebookPreview />;
      case 'twitter':
      case 'x':
        return <TwitterPreview />;
      case 'instagram':
        return <InstagramPreview />;
      case 'whatsapp':
        return <WhatsAppPreview />;
      default:
        return <div className="text-center p-8">Preview not available for this platform</div>;
    }
  };

  const getPlatformName = () => {
    switch (platform?.toLowerCase()) {
      case 'facebook': return 'Facebook';
      case 'twitter': return 'Twitter/X';
      case 'x': return 'Twitter/X';
      case 'instagram': return 'Instagram';
      case 'whatsapp': return 'WhatsApp';
      default: return platform;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] flex flex-col">
        {/* Sticky Modal Header */}
        <div 
          className="flex items-center justify-between p-4 border-b sticky top-0 rounded-t-lg z-10" 
          style={{ backgroundColor: 'rgb(41, 173, 211)' }}
        >
          <div className="flex items-center space-x-2">
            <Eye className="h-5 w-5 text-white" />
            <h2 className="text-lg font-semibold text-white">Social Media Preview</h2>
            <span className="px-2 py-1 bg-white bg-opacity-20 text-white text-xs rounded-full font-medium backdrop-blur-sm">
              {getPlatformName()}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white hover:bg-opacity-20 rounded-full transition-colors"
          >
            <X className="h-5 w-5 text-white" />
          </button>
        </div>

        {/* Scrollable Modal Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="mb-4 text-center">
            <p className="text-sm text-gray-600">
              This is how your post will appear on {getPlatformName()}
            </p>
          </div>
          
          {renderPreview()}
          
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-sm mb-2">Post Details:</h4>
            <div className="space-y-1 text-xs text-gray-600">
              <p><strong>Platform:</strong> {getPlatformName()}</p>
              <p><strong>Content Length:</strong> {post.content?.length || 0} characters</p>
              <p><strong>Hashtags:</strong> {post.hashtags?.length || 0}</p>
              <p><strong>Image:</strong> {post.image_url ? 'Yes' : 'No'}</p>
            </div>
          </div>
        </div>

        {/* Sticky Modal Footer */}
        <div className="flex justify-end p-4 border-t bg-gray-50 rounded-b-lg sticky bottom-0 z-10">
          <button
            onClick={onClose}
            className="px-6 py-2 text-white rounded-lg transition-colors font-medium"
            style={{ backgroundColor: 'rgb(41, 173, 211)' }}
            onMouseEnter={(e) => e.target.style.backgroundColor = 'rgb(31, 151, 189)'}
            onMouseLeave={(e) => e.target.style.backgroundColor = 'rgb(41, 173, 211)'}
          >
            Close Preview
          </button>
        </div>
      </div>
    </div>
  );
};

export default SocialMediaPreviewModal;