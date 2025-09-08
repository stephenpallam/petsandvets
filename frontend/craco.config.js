// Load configuration from environment or config file
const path = require('path');

// Environment variable overrides
const config = {
  disableHotReload: process.env.DISABLE_HOT_RELOAD === 'true',
};

module.exports = {
  devServer: {
    historyApiFallback: {
      // Serve index.html for all routes that don't match files
      disableDotRule: true,
      // Handle specific routes
      rewrites: [
        { from: /^\/ai-agents-dashboard/, to: '/index.html' },
        { from: /^\/ai-agent-config/, to: '/index.html' },
        { from: /^\/ai-ready-to-publish/, to: '/index.html' },
        { from: /^\/ai-published-posts/, to: '/index.html' },
        { from: /^\/ai-in-review/, to: '/index.html' },
        { from: /^\/ai-settings/, to: '/index.html' },
      ]
    }
  },
  webpack: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
    configure: (webpackConfig) => {
      
      // Disable hot reload completely if environment variable is set
      if (config.disableHotReload) {
        // Remove hot reload related plugins
        webpackConfig.plugins = webpackConfig.plugins.filter(plugin => {
          return !(plugin.constructor.name === 'HotModuleReplacementPlugin');
        });
        
        // Disable watch mode
        webpackConfig.watch = false;
        webpackConfig.watchOptions = {
          ignored: /.*/, // Ignore all files
        };
      } else {
        // Add ignored patterns to reduce watched directories
        webpackConfig.watchOptions = {
          ...webpackConfig.watchOptions,
          ignored: [
            '**/node_modules/**',
            '**/.git/**',
            '**/build/**',
            '**/dist/**',
            '**/coverage/**',
            '**/public/**',
          ],
        };
      }
      
      return webpackConfig;
    },
  },
};