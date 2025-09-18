import React from 'react';
import { X, Eye, MessageSquare, Phone } from 'lucide-react';

const SMSPreviewModal = ({ isOpen, onClose, post }) => {
  if (!isOpen) return null;

  const formatSMSContent = (content) => {
    if (!content) return '';
    
    let formattedContent = content;
    
    // Replace common URLs with user-friendly short forms
    formattedContent = formattedContent
      // Book Now links
      .replace(/https?:\/\/[^\s]*book[^\s]*/gi, '<span class="text-blue-600 underline cursor-pointer font-medium">Book Now</span>')
      // Website/Visit links
      .replace(/https?:\/\/[^\s]*petsandvets[^\s]*/gi, '<span class="text-blue-600 underline cursor-pointer font-medium">Visit Website</span>')
      // General website links
      .replace(/https?:\/\/[^\s]*\.com[^\s]*/gi, '<span class="text-blue-600 underline cursor-pointer font-medium">Visit Website</span>')
      // Phone numbers - make them clickable but keep as-is
      .replace(/(\(\d{3}\)\s?\d{3}-\d{4}|\d{3}-\d{3}-\d{4}|\d{10})/g, '<span class="text-blue-600 underline cursor-pointer font-medium">$1</span>')
      // Any remaining URLs
      .replace(/(https?:\/\/[^\s]+)/g, '<span class="text-blue-600 underline cursor-pointer font-medium">Visit Link</span>')
      // Preserve line breaks
      .replace(/\n/g, '<br/>');
    
    return formattedContent;
  };

  const SMSPreview = () => (
    <div className="bg-gray-100 rounded-lg p-4 max-w-sm mx-auto">
      {/* iPhone-style SMS Interface */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        {/* SMS Header */}
        <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-bold">PV</span>
              </div>
              <div>
                <h3 className="font-semibold text-sm">Pets and Vets Animal Hospital</h3>
                <p className="text-xs text-gray-500">Text Message</p>
              </div>
            </div>
            <Phone className="h-4 w-4 text-blue-500" />
          </div>
        </div>
        
        {/* SMS Conversation Area */}
        <div className="p-4 bg-white" style={{ backgroundImage: 'linear-gradient(45deg, #f8f9fa 25%, transparent 25%), linear-gradient(-45deg, #f8f9fa 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #f8f9fa 75%), linear-gradient(-45deg, transparent 75%, #f8f9fa 75%)', backgroundSize: '20px 20px', backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px' }}>
          {/* SMS Bubble */}
          <div className="flex justify-end mb-2">
            <div className="bg-gray-200 text-gray-900 rounded-2xl rounded-br-md px-4 py-3 max-w-xs shadow-sm">
              <p 
                className="text-sm leading-relaxed"
                dangerouslySetInnerHTML={{ __html: formatSMSContent(post.content) }}
              />
              <div className="flex items-center justify-end mt-1 space-x-1">
                <span className="text-xs text-gray-500">2:30 PM</span>
                <span className="text-blue-500 text-xs">✓</span>
              </div>
            </div>
          </div>
          
          {/* Optional delivery confirmation */}
          <div className="text-center">
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
              Delivered
            </span>
          </div>
        </div>
        
        {/* SMS Input Area (disabled/read-only) */}
        <div className="bg-gray-50 px-4 py-3 border-t border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="flex-1 bg-white rounded-full px-4 py-2 border border-gray-300">
              <span className="text-sm text-gray-400">Text Message</span>
            </div>
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
              <span className="text-white text-sm">→</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const AndroidSMSPreview = () => (
    <div className="bg-gray-900 rounded-lg p-4 max-w-sm mx-auto">
      {/* Android-style SMS Interface */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Android SMS Header */}
        <div className="bg-green-600 px-4 py-3 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                <span className="text-green-600 text-xs font-bold">PV</span>
              </div>
              <div>
                <h3 className="font-semibold text-sm">Pets and Vets Animal Hospital</h3>
                <p className="text-xs opacity-90">SMS • now</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Android SMS Content */}
        <div className="p-4 bg-gray-50">
          <div className="bg-green-100 rounded-lg p-3 border-l-4 border-green-500">
            <p 
              className="text-sm text-gray-800 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: formatSMSContent(post.content) }}
            />
            <div className="flex items-center justify-between mt-2">
              <span className="text-xs text-gray-500">Pets and Vets Animal Hospital</span>
              <span className="text-xs text-gray-500">2:30 PM</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] flex flex-col">
        {/* Sticky Modal Header */}
        <div 
          className="flex items-center justify-between p-4 border-b sticky top-0 rounded-t-lg z-10" 
          style={{ backgroundColor: 'rgb(41, 173, 211)' }}
        >
          <div className="flex items-center space-x-2">
            <MessageSquare className="h-5 w-5 text-white" />
            <h2 className="text-lg font-semibold text-white">SMS Preview</h2>
            <span className="px-2 py-1 bg-white bg-opacity-20 text-white text-xs rounded-full font-medium backdrop-blur-sm">
              Text Message
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
              This is how your SMS will appear on mobile devices
            </p>
          </div>
          
          {/* iPhone Style Preview */}
          <div className="mb-8">
            <h3 className="text-sm font-medium text-gray-700 mb-3 text-center">iOS (iPhone) Style</h3>
            <SMSPreview />
          </div>
          
          {/* Android Style Preview */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-700 mb-3 text-center">Android Style</h3>
            <AndroidSMSPreview />
          </div>
          
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-sm mb-2">SMS Details:</h4>
            <div className="space-y-1 text-xs text-gray-600">
              <p><strong>Content Length:</strong> {post.content?.length || 0} characters</p>
              <p><strong>SMS Limit:</strong> 160 characters per SMS</p>
              <p><strong>Message Count:</strong> {Math.ceil((post.content?.length || 0) / 160)} SMS{Math.ceil((post.content?.length || 0) / 160) !== 1 ? ' messages' : ' message'}</p>
              <p><strong>Type:</strong> {post.sms_personalized === false ? 'Bulk SMS' : 'Personalized SMS'}</p>
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

export default SMSPreviewModal;