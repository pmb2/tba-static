// TBA Path Fixer
// Fixes navigation paths for static hosting on GitHub Pages

(function() {
  console.log("Path Fixer script v3 loaded!");

  // Detect browser
  const isMSBrowser = /Edge|MSIE|Trident/.test(navigator.userAgent);
  
  // Set browser-specific settings
  if (isMSBrowser) {
    console.log("Microsoft browser detected, applying compatibility fixes");
  }
  
  // Detect if we're in a redirect or loop
  const isInRedirectLoop = (function() {
    // Check if the URL contains multiple occurrences of 'index.html'
    const path = window.location.pathname;
    const indexCount = (path.match(/index\.html/g) || []).length;
    return indexCount > 1;
  })();

  // If we're in a redirect loop, break out of it
  if (isInRedirectLoop) {
    console.warn("Detected redirect loop, redirecting to homepage");
    window.location.href = "/";
    return;
  }
  
  // Remove 'out' from the path if it somehow remains in the URL
  const currentPath = window.location.pathname;
  if (currentPath.startsWith('/out/') || currentPath.includes('/out/')) {
    const newPath = currentPath.replace('/out/', '/');
    console.warn(`Redirecting from ${currentPath} to ${newPath}`);
    window.location.href = newPath;
    return;
  }
  
  // Function to fix all links on the page
  function fixLinks() {
    // Get all links on the page
    const links = document.querySelectorAll('a[href]');
    
    links.forEach(link => {
      const href = link.getAttribute('href');
      
      // Skip external links, anchor links, or already fixed links
      if (!href || href.startsWith('http') || href.startsWith('#') || 
          href.startsWith('mailto:') || href.startsWith('tel:') || 
          href.includes('index.html')) {
        return;
      }
      
      // Remove '/out/' from any links that contain it
      if (href.startsWith('/out/') || href.includes('/out/')) {
        const newHref = href.replace('/out/', '/');
        link.setAttribute('href', newHref);
        console.log(`Removed /out/ from link: ${href} → ${newHref}`);
      }
      
      // Handle root path
      if (href === '/') {
        return; // No need to modify root path
      }
      
      // Handle trailing slashes
      if (href.endsWith('/')) {
        // Convert /path/ to /path/index.html
        const newHref = href + 'index.html';
        link.setAttribute('href', newHref);
        console.log(`Fixed link: ${href} → ${newHref}`);
      } else if (!href.includes('.')) {
        // For paths without extensions and not ending with slash, add /index.html
        const newHref = href + '/index.html';
        link.setAttribute('href', newHref);
        console.log(`Fixed link: ${href} → ${newHref}`);
      }
    });
    
    console.log("All links have been fixed for static hosting");
  }
  
  // Function to check and fix CSS variables
  function fixCssVariables() {
    // Define common CSS variables if they're missing
    const rootStyle = document.documentElement.style;
    if (!rootStyle.getPropertyValue('--primary')) {
      rootStyle.setProperty('--primary', '#3498db');
    }
    if (!rootStyle.getPropertyValue('--primary-foreground')) {
      rootStyle.setProperty('--primary-foreground', '#ffffff');
    }
    if (!rootStyle.getPropertyValue('--secondary')) {
      rootStyle.setProperty('--secondary', '#2ecc71');
    }
    if (!rootStyle.getPropertyValue('--secondary-light')) {
      rootStyle.setProperty('--secondary-light', '#4cd787');
    }
    console.log("CSS variables checked and fixed if needed");
  }
  
  // Initialize after DOM is loaded
  function initialize() {
    fixLinks();
    fixCssVariables();
  }
  
  // Run immediately if DOM is loaded, otherwise wait for DOMContentLoaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize);
  } else {
    initialize();
  }
  
  // Also run when page is fully loaded to catch dynamically added links
  window.addEventListener('load', function() {
    fixLinks();
    
    // Additional fix for Microsoft browsers: ensure all images and resources load correctly
    if (isMSBrowser) {
      document.querySelectorAll('img').forEach(img => {
        const src = img.getAttribute('src');
        if (src && src.startsWith('/out/')) {
          img.src = src.replace('/out/', '/');
        }
      });
    }
  });
})();