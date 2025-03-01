// Import polyfills safely
try {
    // Import buffer and process
    const processPolyfill = require('process/browser.js');
    const { Buffer } = require('buffer');
    
    // Assign globals safely
    if (typeof window !== 'undefined') {
      window.process = window.process || processPolyfill;
      window.Buffer = window.Buffer || Buffer;
    }
  } catch (error) {
    console.error('Error loading polyfills:', error);
  }