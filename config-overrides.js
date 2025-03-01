const { override, addWebpackPlugin, addWebpackAlias, babelInclude, disableEsLint } = require('customize-cra');
const webpack = require('webpack');
const path = require('path');

module.exports = override(
  // Ensure React is correctly processed
  babelInclude([
    path.resolve('src'),
    // Include any other directories that need to be transpiled
  ]),
  
  // Disable ESLint
  disableEsLint(),
  
  // Disable source map loading from node_modules
  (config) => {
    if (config.module && config.module.rules) {
      config.module.rules.forEach(rule => {
        if (rule.use && Array.isArray(rule.use)) {
          const sourceMapLoader = rule.use.find(loader => 
            loader === 'source-map-loader' || 
            (typeof loader === 'object' && loader.loader === 'source-map-loader')
          );
          
          if (sourceMapLoader) {
            rule.exclude = /node_modules/;
          }
        }
      });
      
      // Add a specific rule to ignore source maps in node_modules
      config.module.rules.push({
        test: /\.js$/,
        enforce: 'pre',
        loader: 'source-map-loader',
        exclude: /node_modules/,
      });
    }
    return config;
  },
  // Add webpack aliases for node polyfills
  addWebpackAlias({
    "process": "process/browser.js",
    "stream": "stream-browserify",
    "zlib": "browserify-zlib",
    "crypto": "crypto-browserify",
    "http": "stream-http",
    "https": "https-browserify",
    "buffer": "buffer",
    "util": "util",
    "url": "url",
    "path": "path-browserify",
    "fs": false,
    "net": false,
    "tls": false
  }),
  
  // Add webpack plugin to provide polyfills
  addWebpackPlugin(
    new webpack.ProvidePlugin({
      process: 'process/browser.js',
      Buffer: ['buffer', 'Buffer']
    })
  ),
  
  // Override webpack config to handle ESM issues
  (config) => {
    // Handle process/browser BREAKING CHANGE
    config.module.rules.push({
      test: /\.m?js/,
      resolve: {
        fullySpecified: false
      }
    });
    
    // Add fallbacks for node modules
    config.resolve.fallback = {
      ...config.resolve.fallback,
      stream: require.resolve('stream-browserify'),
      crypto: require.resolve('crypto-browserify'),
      buffer: require.resolve('buffer'),
      util: require.resolve('util'),
      process: require.resolve('process/browser.js'),
      zlib: require.resolve('browserify-zlib'),
      path: require.resolve('path-browserify'),
      http: require.resolve('stream-http'),
      https: require.resolve('https-browserify'),
      url: require.resolve('url'),
      vm: require.resolve('vm-browserify'),
      fs: false,
      net: false,
      tls: false
    };
    
    return config;
  }
);