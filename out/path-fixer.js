// TBA Path Fixer
// Fixes navigation paths for static hosting on GitHub Pages

(function() {
  console.log("Path Fixer script loaded!");

  // Create a base URL reference
  const baseUrl = window.location.origin;
  
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
  
  // Initialize after DOM is loaded
  function initialize() {
    fixLinks();
  }
  
  // Run immediately if DOM is loaded, otherwise wait for DOMContentLoaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize);
  } else {
    initialize();
  }
  
  // Also run when page is fully loaded to catch dynamically added links
  window.addEventListener('load', fixLinks);
  
  // Run again after a short delay to catch any dynamic content
  setTimeout(fixLinks, 1000);
})();