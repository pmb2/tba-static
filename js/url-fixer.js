/**
 * URL Fixer - Handle transitions from /out/ to root
 * This script ensures URLs work correctly during and after the transition
 */
(function() {
  // Check if we're in the /out/ directory
  if (window.location.pathname.startsWith('/out/')) {
    // Remove /out/ from the path
    const newPath = window.location.pathname.replace('/out/', '/');
    
    // Redirect to the root version of the current page
    window.location.replace(newPath);
  }
  
  // Fix all links on the page
  function fixLinks() {
    const links = document.querySelectorAll('a[href]');
    
    for (let i = 0; i < links.length; i++) {
      const link = links[i];
      const href = link.getAttribute('href');
      
      // Only fix internal links
      if (href && !href.startsWith('http') && !href.startsWith('//') && !href.startsWith('#')) {
        // Fix links that start with /out/
        if (href.startsWith('/out/')) {
          link.setAttribute('href', href.replace('/out/', '/'));
        }
        // Fix relative links to ensure they're absolute
        else if (!href.startsWith('/')) {
          // Use absolute paths for everything
          link.setAttribute('href', '/' + href);
        }
      }
    }
  }
  
  // Fix all image, script, and stylesheet sources
  function fixSources() {
    // Fix images
    const images = document.querySelectorAll('img[src]');
    for (let i = 0; i < images.length; i++) {
      const img = images[i];
      const src = img.getAttribute('src');
      
      if (src && !src.startsWith('http') && !src.startsWith('//') && !src.startsWith('data:')) {
        // Fix sources that start with /out/
        if (src.startsWith('/out/')) {
          img.setAttribute('src', src.replace('/out/', '/'));
        }
        // Fix relative sources to ensure they're absolute
        else if (!src.startsWith('/')) {
          img.setAttribute('src', '/' + src);
        }
      }
    }
    
    // Fix scripts
    const scripts = document.querySelectorAll('script[src]');
    for (let i = 0; i < scripts.length; i++) {
      const script = scripts[i];
      const src = script.getAttribute('src');
      
      if (src && !src.startsWith('http') && !src.startsWith('//')) {
        // Fix sources that start with /out/
        if (src.startsWith('/out/')) {
          script.setAttribute('src', src.replace('/out/', '/'));
        }
        // Fix relative sources to ensure they're absolute
        else if (!src.startsWith('/')) {
          script.setAttribute('src', '/' + src);
        }
      }
    }
    
    // Fix stylesheets
    const links = document.querySelectorAll('link[rel="stylesheet"][href]');
    for (let i = 0; i < links.length; i++) {
      const link = links[i];
      const href = link.getAttribute('href');
      
      if (href && !href.startsWith('http') && !href.startsWith('//')) {
        // Fix sources that start with /out/
        if (href.startsWith('/out/')) {
          link.setAttribute('href', href.replace('/out/', '/'));
        }
        // Fix relative sources to ensure they're absolute
        else if (!href.startsWith('/')) {
          link.setAttribute('href', '/' + href);
        }
      }
    }
  }
  
  // Fix buttons on specific pages
  function fixButtons() {
    // Fix pricing page buttons
    if (window.location.pathname.includes('/pricing/')) {
      // Find all pricing buttons
      setTimeout(function() {
        document.querySelectorAll('.bg-zinc-900.rounded-2xl button').forEach(button => {
          if (!button.getAttribute('data-fixed') && 
              (button.textContent.includes('Get Started') || 
               button.textContent.includes('Contact Sales'))) {
            
            button.setAttribute('data-fixed', 'true');
            button.addEventListener('click', function(e) {
              e.preventDefault();
              // Open contact form if TBAModal is available
              if (window.TBAModal && window.TBAModal.openContactForm) {
                window.TBAModal.openContactForm();
              } else {
                // Fallback to redirect
                window.location.href = '/contact/';
              }
            });
          }
        });
      }, 500);
    }
    
    // Fix our-work page buttons
    if (window.location.pathname.includes('/our-work/')) {
      setTimeout(function() {
        // Find Start a Project button
        const projectBtns = document.querySelectorAll('button');
        projectBtns.forEach(btn => {
          if (!btn.getAttribute('data-fixed') && 
              btn.textContent.includes('Start a Project')) {
            
            btn.setAttribute('data-fixed', 'true');
            btn.addEventListener('click', function(e) {
              e.preventDefault();
              // Open contact form if TBAModal is available
              if (window.TBAModal && window.TBAModal.openContactForm) {
                window.TBAModal.openContactForm();
              } else {
                // Fallback to redirect
                window.location.href = '/contact/';
              }
            });
          }
        });
      }, 500);
    }
  }
  
  // Run the fixers when DOM is loaded
  function init() {
    fixLinks();
    fixSources();
    fixButtons();
  }
  
  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();