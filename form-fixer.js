/**
 * Form Handler - Cross-browser Compatible
 * This script handles form submissions and creates GitHub Issues
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
    
    // Get form data using the most compatible approach
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
    
    // Format issue data in YAML format for better parsing by the GitHub workflow
    var issueBody = '';
    for (var key in formData) {
      if (formData.hasOwnProperty(key)) {
        // Ensure values with special characters are properly quoted
        issueBody += key + ': "' + formData[key].replace(/"/g, '\\"') + '"\n';
      }
    }
    
    // Create proper form data for backend
    var apiEndpoint = 'https://api.github.com/repos/TheBackusAgency/tba-static/issues';
    
    // Determine the title based on form type
    var issueTitle = '';
    if (formType === 'contact') {
      issueTitle = 'Form Submission: Contact Form';
    } else if (formType === 'newsletter') {
      issueTitle = 'Form Submission: Newsletter Form';
    } else {
      issueTitle = 'Form Submission: ' + formType + ' Form';
    }
    
    // Fallback to the GitHub issues page if fetch doesn't work
    var fallbackUrl = 'https://github.com/TheBackusAgency/tba-static/issues/new?' +
      'title=' + encodeURIComponent(issueTitle) +
      '&body=' + encodeURIComponent(issueBody) +
      '&labels=' + encodeURIComponent('form-submission,' + formType);
    
    // Try to create the issue via GitHub API if possible
    var messageContainer = form.querySelector('.form-message');
    
    if (window.fetch) {
      // Show loading state
      if (messageContainer) {
        messageContainer.style.display = 'block';
        messageContainer.innerHTML = '<div style="padding: 12px; background-color: rgba(52, 152, 219, 0.2); border: 1px solid rgba(52, 152, 219, 0.5); border-radius: 6px; color: white; margin-top: 16px;">Submitting your form...</div>';
      }
      
      // First, try a direct API approach (this will likely fail due to CORS, but worth trying)
      try {
        fetch(apiEndpoint, {
          method: 'POST',
          headers: {
            'Accept': 'application/vnd.github.v3+json'
          },
          body: JSON.stringify({
            title: issueTitle,
            body: issueBody,
            labels: ['form-submission', formType]
          })
        })
        .then(function(response) {
          if (response.ok) {
            showSuccessMessage(form, messageContainer);
          } else {
            // If API call fails, redirect to the GitHub issues page
            redirectToGitHub(fallbackUrl);
          }
        })
        .catch(function() {
          // If fetch fails, redirect to the GitHub issues page
          redirectToGitHub(fallbackUrl); 
        });
      } catch(e) {
        // If an error occurs, redirect to the GitHub issues page
        redirectToGitHub(fallbackUrl);
      }
    } else {
      // For older browsers without fetch, directly redirect to GitHub
      redirectToGitHub(fallbackUrl);
    }
    
    // Reset form immediately for better UX
    form.reset();
  }
  
  function showSuccessMessage(form, messageContainer) {
    // Show success message
    try {
      if (messageContainer) {
        messageContainer.style.display = 'block';
        messageContainer.innerHTML = '<div style="padding: 12px; background-color: rgba(46, 204, 113, 0.2); border: 1px solid rgba(46, 204, 113, 0.5); border-radius: 6px; color: white; margin-top: 16px;">Thank you! Your form has been submitted successfully.</div>';
        
        // Hide after 5 seconds
        setTimeout(function() {
          messageContainer.style.display = 'none';
        }, 5000);
      }
      
      // Also show an alert for immediate feedback
      window.alert('Form submitted successfully!');
    } catch (e) {
      console.log('Error showing success message:', e);
    }
  }
  
  function redirectToGitHub(url) {
    try {
      var newWindow = window.open(url, '_blank');
      if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
        // Popup was blocked, fallback to current window with confirmation
        if (window.confirm('Your form will be submitted via GitHub. Continue?')) {
          window.location.href = url;
        }
      }
    } catch(e) {
      // Last resort: just try to navigate
      window.location.href = url;
    }
  }
  
  // Function to scroll to contact form
  function scrollToContactForm() {
    var contactSection = document.querySelector('form[data-form-type="contact"]');
    if (contactSection) {
      contactSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      // If we're not on the contact page, redirect to it
      window.location.href = '/contact/#contact-form';
    }
  }
  
  // Attach form submission handlers
  function initializeForms() {
    // Get all forms
    var forms = document.querySelectorAll('form');
    
    // Attach handlers to each form
    for (var i = 0; i < forms.length; i++) {
      var form = forms[i];
      
      // Check if handler is already attached
      if (!form.getAttribute('data-handler-attached')) {
        // Add an id for anchor links
        var formType = form.getAttribute('data-form-type') || 'contact';
        form.id = formType + '-form';
        
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
    
    // Find all "Get Started" or "Start a project" buttons and attach scroll/redirect behavior
    var actionButtons = document.querySelectorAll('a[href*="#"], button');
    for (var j = 0; j < actionButtons.length; j++) {
      var button = actionButtons[j];
      var buttonText = button.textContent || button.innerText;
      
      if (!button.getAttribute('data-handler-attached') && 
          (buttonText.includes('Get Started') || buttonText.includes('Start a project'))) {
        button.setAttribute('data-handler-attached', 'true');
        
        // Attach click handler
        if (button.addEventListener) {
          button.addEventListener('click', function(e) {
            e.preventDefault();
            scrollToContactForm();
          });
        } else if (button.attachEvent) {
          button.attachEvent('onclick', function(e) {
            e.preventDefault ? e.preventDefault() : (e.returnValue = false);
            scrollToContactForm();
          });
        } else {
          button.onclick = function(e) {
            e.preventDefault ? e.preventDefault() : (e.returnValue = false);
            scrollToContactForm();
          };
        }
      }
    }
    
    // Check if we need to scroll to a specific form (from URL hash)
    if (window.location.hash) {
      var hash = window.location.hash.substring(1);
      if (hash === 'contact-form' || hash === 'newsletter-form') {
        var targetForm = document.getElementById(hash);
        if (targetForm) {
          setTimeout(function() {
            targetForm.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }, 500);
        }
      }
    }
  }
  
  // Initialize when DOM is ready
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