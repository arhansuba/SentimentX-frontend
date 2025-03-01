const webpack = require('webpack');

module.exports = {
  webpack: {
    configure: {
      resolve: {
        fallback: {
          crypto: require.resolve('crypto-browserify'),
          stream: require.resolve('stream-browserify'),
          buffer: require.resolve('buffer'),
          process: require.resolve('process/browser'),
          zlib: require.resolve('browserify-zlib'),
          path: require.resolve('path-browserify'),
          assert: require.resolve('assert'),
          util: require.resolve('util/'),
          fs: false,
          net: false,
          tls: false,
          http: false,
          https: false,
        },
      },
    },
    plugins: {
      add: [
        new webpack.ProvidePlugin({
          process: 'process/browser',
          Buffer: ['buffer', 'Buffer'],
        }),
      ],
    },
  },
};