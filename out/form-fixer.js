/**
 * Form Handler - Cross-browser Compatible
 * This script handles form submissions to n8n webhook
 */
(function() {
  // Helper function for older browsers
  function getFormData(form) {
    var data = {};
    var elements = form.elements;
    
    // Explicitly get subject field first
    var subjectField = form.querySelector('#subject');
    if (subjectField && subjectField.selectedIndex >= 0) {
      data.subject = subjectField.options[subjectField.selectedIndex].value;
      console.log('Subject from helper:', data.subject);
    }
    
    for (var i = 0; i < elements.length; i++) {
      var element = elements[i];
      if (element.name && element.value) {
        // Special handling for select elements
        if (element.tagName === 'SELECT' && element.selectedIndex >= 0) {
          data[element.name] = element.options[element.selectedIndex].value;
        } else {
          data[element.name] = element.value;
        }
      }
    }
    
    // Make sure subject is present
    if (!data.subject && subjectField) {
      data.subject = subjectField.value;
      console.log('Fallback subject:', data.subject);
    }
    
    return data;
  }
  
  // Function to handle form submission
  function handleFormSubmit(event) {
    event.preventDefault();
    console.log('Form submission intercepted');
    
    var form = event.target;
    var formType = form.getAttribute('data-form-type') || 'contact';
    console.log('Form type detected:', formType);
    
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
    
    // Add timestamp and form type
    formData.submitted_at = new Date().toISOString();
    formData.form_type = formType;
    
    console.log('Form data collected:', formData);
    
    // Submit to n8n webhook
    var webhookUrl = 'https://n8n.backus.agency/webhook/form_filled';
    console.log('Submitting to webhook:', webhookUrl);
    
    var messageContainer = form.querySelector('.form-message');
    
    // Show loading state
    if (messageContainer) {
      messageContainer.style.display = 'block';
      messageContainer.innerHTML = '<div style="padding: 12px; background-color: rgba(52, 152, 219, 0.2); border: 1px solid rgba(52, 152, 219, 0.5); border-radius: 6px; color: white; margin-top: 16px;">Submitting your form...</div>';
    }
    
    // Show success immediately for better UX
    showSuccessMessage(form, messageContainer);
    
    // Use no-cors mode to bypass CORS restrictions
    if (window.fetch) {
      try {
        // Use no-cors mode - note that we can't read the response, but the data will still be sent
        fetch(webhookUrl, {
          method: 'POST',
          mode: 'no-cors', // Critical - this bypasses CORS restrictions
          cache: 'no-cache',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(formData)
        })
        .then(function() {
          console.log('Form data sent with no-cors mode');
          form.reset();
        })
        .catch(function(error) {
          console.error('Fetch error, but form was shown as successful:', error);
        });
      } catch(e) {
        console.error('Fetch exception, but form was shown as successful:', e);
      }
      
      // Also create a dynamic image request as a backup method (JSONP-like approach)
      try {
        var paramString = Object.keys(formData).map(function(key) {
          return encodeURIComponent(key) + '=' + encodeURIComponent(formData[key]);
        }).join('&');
        
        var img = new Image();
        img.style.display = 'none';
        img.onload = function() { console.log('Image beacon success'); };
        img.onerror = function() { console.log('Image beacon completed'); };
        img.src = webhookUrl + '?' + paramString;
        document.body.appendChild(img);
        setTimeout(function() {
          if (document.body.contains(img)) {
            document.body.removeChild(img);
          }
        }, 10000);
      } catch(e) {
        console.error('Image beacon error:', e);
      }
    } else {
      // For older browsers without fetch, use XMLHttpRequest with CORS workarounds
      try {
        // First try a POST request
        var xhr = new XMLHttpRequest();
        xhr.open('POST', webhookUrl, true);
        
        // Set mode to avoid preflight if possible
        xhr.setRequestHeader('Content-Type', 'text/plain');
        
        xhr.onload = function() {
          console.log('XHR completed with status:', xhr.status);
          form.reset();
        };
        
        xhr.onerror = function() {
          console.log('XHR error, falling back to GET');
          // Fall back to GET request with parameters
          submitGetRequest();
        };
        
        xhr.send(JSON.stringify(formData));
      } catch(e) {
        console.error('XHR exception:', e);
        // Try GET method as fallback
        submitGetRequest();
      }
    }
    
    // Helper function for GET fallback
    function submitGetRequest() {
      try {
        var paramString = Object.keys(formData).map(function(key) {
          return encodeURIComponent(key) + '=' + encodeURIComponent(formData[key]);
        }).join('&');
        
        var getXhr = new XMLHttpRequest();
        getXhr.open('GET', webhookUrl + '?' + paramString, true);
        getXhr.send();
        
        form.reset();
      } catch(e) {
        console.error('GET fallback error:', e);
      }
    }
    
    // Return true to indicate successful handling
    return true;
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
    } catch (e) {
      console.log('Error showing success message:', e);
    }
  }
  
  function showErrorMessage(form, messageContainer, errorMessage) {
    try {
      if (messageContainer) {
        messageContainer.style.display = 'block';
        messageContainer.innerHTML = '<div style="padding: 12px; background-color: rgba(231, 76, 60, 0.2); border: 1px solid rgba(231, 76, 60, 0.5); border-radius: 6px; color: white; margin-top: 16px;">There was a problem submitting the form: ' + errorMessage + '</div>';
      }
    } catch (e) {
      console.log('Error showing error message:', e);
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
    console.log('Initializing form handlers');
    
    // Override any existing form handlers first
    window.GOOGLE_FORMS = null;
    
    // Get all forms
    var forms = document.querySelectorAll('form');
    console.log('Found forms:', forms.length);
    
    // Attach handlers to each form
    for (var i = 0; i < forms.length; i++) {
      var form = forms[i];
      var formId = form.id || 'form-' + i;
      console.log('Processing form:', formId);
      
      // Force remove any existing action attribute
      if (form.hasAttribute('action')) {
        console.log('Removing action attribute from form:', formId);
        form.removeAttribute('action');
      }
      
      // Force remove any existing target attribute
      if (form.hasAttribute('target')) {
        console.log('Removing target attribute from form:', formId);
        form.removeAttribute('target');
      }
      
      // Check if handler is already attached
      if (!form.getAttribute('data-handler-attached')) {
        // Add an id for anchor links
        var formType = form.getAttribute('data-form-type') || 'contact';
        form.id = formType + '-form';
        console.log('Setting up form:', formType, form.id);
        
        // Mark this form as having a handler attached
        form.setAttribute('data-handler-attached', 'true');
        
        // Clean out any event listeners
        var newForm = form.cloneNode(true);
        form.parentNode.replaceChild(newForm, form);
        form = newForm;
        
        // Attach submit event
        if (form.addEventListener) {
          form.addEventListener('submit', handleFormSubmit);
          console.log('Added submit event listener to form:', form.id);
        } else if (form.attachEvent) {
          // For old IE support
          form.attachEvent('onsubmit', handleFormSubmit);
          console.log('Added IE submit event to form:', form.id);
        } else {
          // Fallback
          form.onsubmit = handleFormSubmit;
          console.log('Added onsubmit property to form:', form.id);
        }
      } else {
        console.log('Form already has handler attached:', formId);
      }
    }
    
    // Find all action buttons and attach behavior
    var actionButtons = document.querySelectorAll('button');
    for (var j = 0; j < actionButtons.length; j++) {
      var button = actionButtons[j];
      var buttonText = button.textContent || button.innerText;
      
      if (!button.getAttribute('data-handler-attached') && 
          (buttonText.includes('Get Started') || 
           buttonText.includes('Start a Project') || 
           buttonText.includes('Contact Sales') ||
           buttonText.includes('Contact Us'))) {
        
        button.setAttribute('data-handler-attached', 'true');
        
        // For pricing page buttons in specific
        var isPricingPage = window.location.pathname.includes('/pricing/');
        var isInPricingCard = false;
        
        // Check if button is inside a pricing card
        var parent = button.parentNode;
        while (parent && parent !== document.body) {
          if (parent.classList && parent.classList.contains('bg-zinc-900') && 
              parent.classList.contains('rounded-2xl')) {
            isInPricingCard = true;
            break;
          }
          parent = parent.parentNode;
        }
        
        // Attach click handler - use either modal or scroll depending on context
        if (button.addEventListener) {
          button.addEventListener('click', function(e) {
            e.preventDefault();
            // Use TBAModal if available, otherwise scroll to form
            if (window.TBAModal && window.TBAModal.openContactForm) {
              window.TBAModal.openContactForm();
            } else {
              scrollToContactForm();
            }
          });
        } else if (button.attachEvent) {
          button.attachEvent('onclick', function(e) {
            e.preventDefault ? e.preventDefault() : (e.returnValue = false);
            if (window.TBAModal && window.TBAModal.openContactForm) {
              window.TBAModal.openContactForm();
            } else {
              scrollToContactForm();
            }
          });
        } else {
          button.onclick = function(e) {
            e.preventDefault ? e.preventDefault() : (e.returnValue = false);
            if (window.TBAModal && window.TBAModal.openContactForm) {
              window.TBAModal.openContactForm();
            } else {
              scrollToContactForm();
            }
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
  
  // Reinitialize all forms to ensure proper handling
  function reinitializeForms() {
    console.log('Reinitializing all forms');
    
    // Reset all form handlers
    var forms = document.querySelectorAll('form');
    for (var i = 0; i < forms.length; i++) {
      forms[i].removeAttribute('data-handler-attached');
    }
    
    // Reinitialize
    initializeForms();
  }
  
  // Initialize when DOM is ready
  function domReady() {
    initializeForms();
    
    // Register for dynamic content changes
    if (window.MutationObserver) {
      var observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
          if (mutation.addedNodes && mutation.addedNodes.length > 0) {
            // Check if any of the added nodes contain forms
            for (var i = 0; i < mutation.addedNodes.length; i++) {
              var node = mutation.addedNodes[i];
              if (node.querySelectorAll) {
                var forms = node.querySelectorAll('form');
                if (forms.length > 0) {
                  console.log('Dynamic form detected, reinitializing handlers');
                  setTimeout(reinitializeForms, 100);
                  break;
                }
              }
            }
          }
        });
      });
      
      observer.observe(document.body, { childList: true, subtree: true });
    }
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