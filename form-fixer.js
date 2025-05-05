/**
 * Form Handler - Cross-browser Compatible
 * This script handles form submissions to n8n webhook
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
    
    // Add timestamp and form type
    formData.submitted_at = new Date().toISOString();
    formData.form_type = formType;
    
    // Submit to n8n webhook
    var webhookUrl = 'https://n8n.backus.agency/webhook/form_filled';
    var messageContainer = form.querySelector('.form-message');
    
    // Show loading state
    if (messageContainer) {
      messageContainer.style.display = 'block';
      messageContainer.innerHTML = '<div style="padding: 12px; background-color: rgba(52, 152, 219, 0.2); border: 1px solid rgba(52, 152, 219, 0.5); border-radius: 6px; color: white; margin-top: 16px;">Submitting your form...</div>';
    }
    
    if (window.fetch) {
      try {
        fetch(webhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        })
        .then(function(response) {
          if (response.ok) {
            return response.json();
          } else {
            throw new Error('Server responded with ' + response.status + ': ' + response.statusText);
          }
        })
        .then(function() {
          showSuccessMessage(form, messageContainer);
          form.reset();
        })
        .catch(function(error) {
          showErrorMessage(form, messageContainer, error.message);
        });
      } catch(e) {
        showErrorMessage(form, messageContainer, e.message);
      }
    } else {
      // For older browsers without fetch, use XMLHttpRequest
      var xhr = new XMLHttpRequest();
      xhr.open('POST', webhookUrl, true);
      xhr.setRequestHeader('Content-Type', 'application/json');
      
      xhr.onload = function() {
        if (xhr.status >= 200 && xhr.status < 300) {
          showSuccessMessage(form, messageContainer);
          form.reset();
        } else {
          showErrorMessage(form, messageContainer, 'Server responded with ' + xhr.status + ': ' + xhr.statusText);
        }
      };
      
      xhr.onerror = function() {
        showErrorMessage(form, messageContainer, 'Failed to submit form. Please try again later.');
      };
      
      xhr.send(JSON.stringify(formData));
    }
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