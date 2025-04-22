// TBA Path Fixer - Cross-browser compatible version
// Fixes navigation paths for static hosting on GitHub Pages

(function() {
  console.log("Path Fixer loaded - browser compatible version!");
  
  // Define CSS variables for consistent styling across browsers
  const rootStyle = document.documentElement.style;
  if (!rootStyle.getPropertyValue('--primary')) {
    rootStyle.setProperty('--primary', '#3498db');
  }
  if (!rootStyle.getPropertyValue('--secondary')) {
    rootStyle.setProperty('--secondary', '#2ecc71');
  }
  if (!rootStyle.getPropertyValue('--secondary-light')) {
    rootStyle.setProperty('--secondary-light', '#4cd787');
  }
  
  // Simple utility to check if a string starts with any of the prefixes
  function startsWithAny(str, prefixes) {
    return prefixes.some(prefix => str.startsWith(prefix));
  }
  
  // Function to fix all links on the page
  function fixLinks() {
    // Get all links on the page
    const links = document.querySelectorAll('a[href]');
    
    links.forEach(link => {
      const href = link.getAttribute('href');
      
      // Skip if href is missing or it's a special type of link
      if (!href || startsWithAny(href, ['http', '#', 'mailto:', 'tel:'])) {
        return;
      }
      
      // Fix /out/ references if they exist
      if (href.includes('/out/')) {
        const newHref = href.replace(/\/out\//g, '/');
        link.setAttribute('href', newHref);
      }
      
      // Don't modify links that already have an extension
      if (href.match(/\.(html|htm|php|aspx|jsp)$/i)) {
        return;
      }
      
      // Handle root path
      if (href === '/') {
        link.setAttribute('href', '/index.html');
        return;
      }
      
      // Handle trailing slashes for directory paths
      let newHref = href;
      if (href.endsWith('/')) {
        newHref = href + 'index.html';
        link.setAttribute('href', newHref);
      } else if (!href.includes('.')) {
        // For paths without extensions and not ending with slash
        newHref = href + '/index.html';
        link.setAttribute('href', newHref);
      }
    });
  }
  
  // Fix image and script sources too
  function fixResourcePaths() {
    // Fix image sources
    document.querySelectorAll('img[src]').forEach(img => {
      const src = img.getAttribute('src');
      if (src && src.includes('/out/')) {
        img.setAttribute('src', src.replace(/\/out\//g, '/'));
      }
    });
    
    // Fix script sources
    document.querySelectorAll('script[src]').forEach(script => {
      const src = script.getAttribute('src');
      if (src && src.includes('/out/')) {
        script.setAttribute('src', src.replace(/\/out\//g, '/'));
      }
    });
  }
  
  // Initialize after DOM is loaded
  function initialize() {
    fixLinks();
    fixResourcePaths();
  }
  
  // Handle current URL if needed
  if (window.location.pathname.includes('/out/')) {
    // Redirect to the corrected path
    window.location.href = window.location.pathname.replace(/\/out\//g, '/');
  }
  
  // Run immediately if DOM is loaded, otherwise wait for DOMContentLoaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize);
  } else {
    initialize();
  }
  
  // Also run when page is fully loaded to catch dynamically added elements
  window.addEventListener('load', initialize);
})();
