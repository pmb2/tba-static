/**
 * Cross-Browser Compatibility Script
 * This script ensures CSS variables are properly set across all browsers.
 */
(function() {
  // Older browsers fallback for CSS variables
  try {
    // Check if CSS variables are supported
    var isCSSVarSupported = window.CSS && window.CSS.supports && window.CSS.supports('--a', '0');
    
    if (!isCSSVarSupported) {
      // Add fallback styles directly if CSS vars not supported (IE)
      var style = document.createElement('style');
      style.type = 'text/css';
      style.innerHTML = '.bg-primary { background-color: #3498db !important; }' +
                       '.text-primary { color: #3498db !important; }' +
                       '.bg-secondary { background-color: #2ecc71 !important; }' +
                       '.text-secondary { color: #2ecc71 !important; }' +
                       '.text-primary-foreground { color: #ffffff !important; }';
      document.head.appendChild(style);
    } else {
      // Define variables as a fallback if they are missing
      var rootStyle = document.documentElement.style;
      var computedStyle = getComputedStyle(document.documentElement);
      
      if (!computedStyle.getPropertyValue('--primary').trim()) {
        rootStyle.setProperty('--primary', '#3498db');
      }
      if (!computedStyle.getPropertyValue('--secondary').trim()) {
        rootStyle.setProperty('--secondary', '#2ecc71');
      }
      if (!computedStyle.getPropertyValue('--secondary-light').trim()) {
        rootStyle.setProperty('--secondary-light', '#4cd787');
      }
      if (!computedStyle.getPropertyValue('--primary-foreground').trim()) {
        rootStyle.setProperty('--primary-foreground', '#ffffff');
      }
      if (!computedStyle.getPropertyValue('--primary-light').trim()) {
        rootStyle.setProperty('--primary-light', '#5faee3');
      }
    }
    
    // Fix for Edge/IE image handling
    var images = document.querySelectorAll('img[loading="lazy"]');
    for (var i = 0; i < images.length; i++) {
      var img = images[i];
      if (img.getAttribute('src') && !img.getAttribute('src').startsWith('data:')) {
        // Force load without lazy loading for older browsers
        img.setAttribute('loading', 'eager');
      }
    }
  } catch (e) {
    console.error('CSS variable fallback error:', e);
  }
})();