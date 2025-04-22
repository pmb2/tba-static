/**
 * Minimal Form Handler - Cross-browser Compatible
 * This script handles form submissions in a way that works across all major browsers.
 */
(function() {
  // Helper function for older browsers
  function getFormData(form) {
    var data = {};
    var elements = form.elements;
    
    for (var i = 0; i < elements.length; i++) {
      var element = elements[i];
      if (element.name && element.value) {
        data[element.name] = element.value;
      }
    }
    
    return data;
  }
  
  // Function to handle form submission
  function handleFormSubmit(event) {
    event.preventDefault();
    
    var form = event.target;
    var formType = form.getAttribute('data-form-type') || 'contact';
    
    // Get form data - using the most compatible approach
    var formData = {};
    
    if (window.FormData) {
      try {
        var fd = new FormData(form);
        // Use forEach if available, otherwise use iteration
        if (fd.forEach) {
          fd.forEach(function(value, key) {
            formData[key] = value;
          });
        } else {
          formData = getFormData(form);
        }
      } catch (e) {
        // Fallback for older browsers
        formData = getFormData(form);
      }
    } else {
      // Fallback for browsers without FormData
      formData = getFormData(form);
    }
    
    // Get repository info
    var owner = 'TheBackusAgency';
    var repo = 'tba-static';
    
    try {
      var ownerMeta = document.querySelector('meta[name="github-repo-owner"]');
      var repoMeta = document.querySelector('meta[name="github-repo-name"]');
      
      if (ownerMeta && ownerMeta.content) {
        owner = ownerMeta.content;
      }
      
      if (repoMeta && repoMeta.content) {
        repo = repoMeta.content;
      }
    } catch (e) {
      console.error('Error getting repo metadata:', e);
    }
    
    // Format issue data
    var issueEntries = [];
    for (var key in formData) {
      if (formData.hasOwnProperty(key)) {
        issueEntries.push(key + ': "' + formData[key] + '"');
      }
    }
    var issueBody = issueEntries.join('\n');
    
    // Build GitHub issue URL with maximum browser compatibility
    var baseUrl = 'https://github.com/' + owner + '/' + repo + '/issues/new';
    var params = '?title=' + encodeURIComponent('Form Submission: ' + formType + ' Form') + 
                 '&body=' + encodeURIComponent(issueBody) + 
                 '&labels=' + encodeURIComponent('form-submission,' + formType);
    
    var url = baseUrl + params;
    
    // Open in new window with fallbacks for blocked popups
    try {
      var newWindow = window.open(url, '_blank');
      if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
        // Popup was blocked, fallback to current window
        window.location.href = url;
      }
    } catch (e) {
      // Error opening window, use direct navigation
      window.location.href = url;
    }
    
    // Show success message
    try {
      window.alert('Form submitted successfully!');
    } catch (e) {
      console.log('Form submitted successfully!');
    }
    
    // Reset form
    form.reset();
    
    // Show success message if message container exists
    try {
      var messageContainer = form.querySelector('.form-message');
      if (messageContainer) {
        messageContainer.style.display = 'block';
        messageContainer.innerHTML = '<div style="padding: 12px; background-color: rgba(46, 204, 113, 0.2); border: 1px solid rgba(46, 204, 113, 0.5); border-radius: 6px; color: white; margin-top: 16px;">Form submitted successfully!</div>';
        
        // Hide after 5 seconds if supported
        setTimeout(function() {
          messageContainer.style.display = 'none';
        }, 5000);
      }
    } catch (e) {
      console.error('Error showing message:', e);
    }
  }
  
  // Attach event handlers in a cross-browser compatible way
  function initializeForms() {
    // Get all forms
    var forms = document.querySelectorAll('form');
    
    // Attach handlers
    for (var i = 0; i < forms.length; i++) {
      var form = forms[i];
      
      // Check if handler is already attached
      if (!form.getAttribute('data-handler-attached')) {
        // Mark this form as having a handler attached
        form.setAttribute('data-handler-attached', 'true');
        
        // Attach submit event
        if (form.addEventListener) {
          form.addEventListener('submit', handleFormSubmit);
        } else if (form.attachEvent) {
          // For old IE support
          form.attachEvent('onsubmit', handleFormSubmit);
        } else {
          // Fallback
          form.onsubmit = handleFormSubmit;
        }
      }
    }
  }
  
  // Initialize forms when DOM is ready
  function domReady() {
    initializeForms();
  }
  
  // Handle various browser loading scenarios
  if (document.readyState === 'loading') {
    if (document.addEventListener) {
      document.addEventListener('DOMContentLoaded', domReady);
    } else if (document.attachEvent) {
      document.attachEvent('onreadystatechange', function() {
        if (document.readyState !== 'loading') {
          domReady();
        }
      });
    }
  } else {
    // DOM is already ready
    domReady();
  }
  
  // Backup initialization on window load
  if (window.addEventListener) {
    window.addEventListener('load', initializeForms);
  } else if (window.attachEvent) {
    window.attachEvent('onload', initializeForms);
  } else {
    var oldLoad = window.onload;
    window.onload = function() {
      if (oldLoad) oldLoad();
      initializeForms();
    };
  }
})();