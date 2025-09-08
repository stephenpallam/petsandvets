import React, { useState } from 'react';
import { RefreshCw, MessageSquare, Eye } from 'lucide-react';

const LoadingDemo = () => {
  const [showCompactLoading, setShowCompactLoading] = useState(false);
  const [showPageLoading, setShowPageLoading] = useState(false);
  const [showNoPosts, setShowNoPosts] = useState(false);
  const [showPostsAfterDelay, setShowPostsAfterDelay] = useState(false);

  const triggerNoPostsThenPosts = () => {
    setShowNoPosts(true);
    setShowPostsAfterDelay(false);
    setTimeout(() => {
      setShowPostsAfterDelay(true);
    }, 3000);
  };

  const triggerCompactLoading = () => {
    setShowCompactLoading(true);
    setTimeout(() => setShowCompactLoading(false), 3000);
  };

  const triggerPageLoading = () => {
    setShowPageLoading(true);
    setTimeout(() => setShowPageLoading(false), 3000);
  };

  return (
    <>
      {/* Main Page Content */}
      <div className={`min-h-screen bg-gray-50 ${showPageLoading ? 'pointer-events-none opacity-60' : ''}`}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Eye className="h-8 w-8 text-green-600" />
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">
                      Loading Demo - Ready to Publish
                    </h2>
                    <p className="text-sm text-gray-600">
                      Demo of compact loading modals
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <select className="text-white px-4 py-2 pr-8 rounded-lg bg-blue-500">
                    <option>All Agent Types</option>
                  </select>
                  <button className="text-white px-4 py-2 rounded-lg bg-blue-500">
                    Refresh
                  </button>
                </div>
              </div>
            </div>
            
            {/* Demo Controls */}
            <div className="p-6">
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-4">Loading Modal Demo</h3>
                <div className="space-x-4">
                  <button
                    onClick={triggerNoPostsThenPosts}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                  >
                    Demo: "No Posts" Issue
                  </button>
                  <button
                    onClick={triggerCompactLoading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Show AI Operation Loading
                  </button>
                  <button
                    onClick={triggerPageLoading}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    Show Page Loading
                  </button>
                </div>
              </div>

              {/* Sample Post Cards */}
              {showNoPosts && !showPostsAfterDelay ? (
                <div className="text-center py-12">
                  <MessageSquare className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-500 text-lg">No posts ready for review</p>
                  <p className="text-gray-400 text-sm mt-2">Posts will appear here when AI agents generate content</p>
                </div>
              ) : showNoPosts && showPostsAfterDelay ? (
                <div className="space-y-6">
                  <div className="text-center mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-green-700 font-medium">✅ Fixed! Posts now load properly without showing "No posts" message first</p>
                  </div>
                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <span className="inline-flex items-center px-3 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
                              AI Agent
                            </span>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium bg-teal-100 text-teal-700">
                              Social Media
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="font-medium mb-2">Generated Content:</h4>
                          <div className="bg-gray-50 rounded-lg p-4">
                            <p className="text-gray-900">Sample AI-generated post content about veterinary care...</p>
                          </div>
                        </div>
                        <div>
                          <h4 className="font-medium mb-2">Generated Image:</h4>
                          <div className="w-full h-48 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
                            <p className="text-gray-500 text-sm">Sample Image Placeholder</p>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-end space-x-3 mt-6 pt-4 border-t border-gray-200">
                        <button 
                          onClick={triggerCompactLoading}
                          className="flex items-center px-4 py-2 border border-blue-300 text-blue-700 rounded-lg hover:bg-blue-50 transition-colors font-medium"
                        >
                          <MessageSquare className="h-4 w-4 mr-2" />
                          Regenerate Content
                        </button>
                        <button className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium">
                          Edit
                        </button>
                        <button className="flex items-center px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium">
                          Approve & Publish
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <span className="inline-flex items-center px-3 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
                              AI Agent
                            </span>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium bg-teal-100 text-teal-700">
                              Social Media
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="font-medium mb-2">Generated Content:</h4>
                          <div className="bg-gray-50 rounded-lg p-4">
                            <p className="text-gray-900">Sample AI-generated post content about veterinary care...</p>
                          </div>
                        </div>
                        <div>
                          <h4 className="font-medium mb-2">Generated Image:</h4>
                          <div className="w-full h-48 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
                            <p className="text-gray-500 text-sm">Sample Image Placeholder</p>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-end space-x-3 mt-6 pt-4 border-t border-gray-200">
                        <button 
                          onClick={triggerCompactLoading}
                          className="flex items-center px-4 py-2 border border-blue-300 text-blue-700 rounded-lg hover:bg-blue-50 transition-colors font-medium"
                        >
                          <MessageSquare className="h-4 w-4 mr-2" />
                          Regenerate Content
                        </button>
                        <button className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium">
                          Edit
                        </button>
                        <button className="flex items-center px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium">
                          Approve & Publish
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Page Loading Modal (shows content behind with disabled interactions) */}
      {showPageLoading && (
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
      )}

      {/* Compact AI Operation Loading Modal */}
      {showCompactLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]">
          <div className="bg-white rounded-lg shadow-2xl p-6 max-w-sm w-full mx-4">
            <div className="text-center">
              <div className="mb-3">
                <RefreshCw className="h-10 w-10 mx-auto text-blue-600 animate-spin" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">Processing</h3>
              <p className="text-gray-600 text-sm mb-2">Regenerating content using AI...</p>
              <div className="text-xs text-gray-500">
                This may take a few moments...
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default LoadingDemo;