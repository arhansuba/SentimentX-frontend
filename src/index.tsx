// index.tsx
import './polyfills';

import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { SentinelProvider } from './context/SentinelContext';
import './index.css';
import BigNumber from 'bignumber.js';

// Configure BigNumber formatting
BigNumber.config({
  EXPONENTIAL_AT: [-10, 20],
  DECIMAL_PLACES: 18,
  FORMAT: {
    prefix: '',
    decimalSeparator: '.',
    groupSeparator: ',',
    groupSize: 3,
    secondaryGroupSize: 0,
    fractionGroupSeparator: ' ',
    fractionGroupSize: 0,
    suffix: ''
  }
});

// Make sure this element exists in your HTML
const rootElement = document.getElementById('root');

// Check if the root element exists before mounting
if (rootElement) {
  const root = createRoot(rootElement);
  
  root.render(
    <React.StrictMode>
      <SentinelProvider>
        <App />
      </SentinelProvider>
    </React.StrictMode>
  );
} else {
  console.error('Failed to find the root element. Make sure there is a div with id "root" in your HTML file.');
}

// Add basic CSS for the application
// This assumes you're using Tailwind CSS based on your project structure
const style = document.createElement('style');
style.textContent = `
  /* Base styles before Tailwind loads */
  html, body, #root {
    height: 100%;
    margin: 0;
    padding: 0;
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  }
  
  /* Loading indicator styles */
  .app-loading {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    width: 100vw;
    background-color: #f8fafc;
  }
  
  .app-loading.dark {
    background-color: #0f172a;
  }
  
  .spinner {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    border: 3px solid rgba(115, 113, 252, 0.2);
    border-top-color: #7371fc;
    animation: spin 1s infinite linear;
  }
  
  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
  
  /* Hide content until CSS is loaded */
  .content-hidden {
    opacity: 0;
    transition: opacity 0.3s ease;
  }
  
  .content-visible {
    opacity: 1;
  }
`;

document.head.appendChild(style);

// Add loading indicator to be shown while app initializes
const loadingIndicator = document.createElement('div');
loadingIndicator.className = 'app-loading';
loadingIndicator.innerHTML = '<div class="spinner"></div>';
document.body.appendChild(loadingIndicator);

// Remove loading indicator when app is ready
window.addEventListener('load', () => {
  setTimeout(() => {
    const loadingElement = document.querySelector('.app-loading');
    if (loadingElement) {
      loadingElement.remove();
    }
    
    // Make content visible
    const rootElement = document.getElementById('root');
    if (rootElement) {
      rootElement.classList.add('content-visible');
    }
  }, 300);
});

// Detect if user prefers dark mode
if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
  document.querySelector('.app-loading')?.classList.add('dark');
}