/**
 * Form Interceptor Script
 * This script intercepts any form submissions to forms.gle and redirects them to our n8n webhook
 */
(function() {
  console.log('Form interceptor loaded, watching for submissions to forms.gle');
  
  // Global variable to check if we've already intercepted this load
  if (window._formInterceptorLoaded) {
    console.log('Form interceptor already loaded, skipping');
    return;
  }
  window._formInterceptorLoaded = true;
  
  // Function to intercept form submissions
  function interceptFormSubmission() {
    // Look for any form submissions to forms.gle
    const originalFetch = window.fetch;
    window.fetch = function(url, options) {
      // Check if this is a form.gle submission
      if (url && typeof url === 'string' && (url.includes('forms.gle') || url.includes('docs.google.com/forms'))) {
        console.log('Intercepted form submission to Google Forms:', url);
        
        // Get the form data from the options
        let formData = {};
        if (options && options.body) {
          try {
            // Try to parse as JSON if it's a string
            if (typeof options.body === 'string') {
              try {
                formData = JSON.parse(options.body);
              } catch(e) {
                console.log('Failed to parse body as JSON, using as-is');
                formData = {data: options.body};
              }
            } else if (options.body instanceof FormData) {
              options.body.forEach((value, key) => {
                formData[key] = value;
              });
            } else {
              formData = options.body;
            }
          } catch(e) {
            console.error('Error extracting form data:', e);
          }
        }
        
        // Add timestamp and form type
        formData.submitted_at = new Date().toISOString();
        formData.form_type = 'intercepted';
        
        console.log('Redirecting to n8n webhook with data:', formData);
        
        // Replace with n8n webhook
        url = 'https://n8n.backus.agency/webhook/form_filled';
        options = {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData)
        };
      }
      
      // Call the original fetch with possibly modified URL and options
      return originalFetch.apply(this, [url, options]);
    };
    
    // Also intercept XMLHttpRequest
    const originalXhrOpen = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function(method, url, ...rest) {
      // Check if this is a form.gle submission
      if (url && typeof url === 'string' && (url.includes('forms.gle') || url.includes('docs.google.com/forms'))) {
        console.log('Intercepted XHR to Google Forms:', url);
        // Replace with n8n webhook
        url = 'https://n8n.backus.agency/webhook/form_filled';
      }
      
      // Call the original open with possibly modified URL
      return originalXhrOpen.apply(this, [method, url, ...rest]);
    };
    
    // Intercept form submissions to hidden iframes (common with Google Forms)
    document.addEventListener('submit', function(event) {
      const form = event.target;
      const action = form.getAttribute('action') || '';
      
      if (action.includes('forms.gle') || action.includes('docs.google.com/forms')) {
        console.log('Intercepted form submission to Google Forms via DOM event:', action);
        event.preventDefault();
        event.stopPropagation();
        
        // Collect form data
        const formData = {};
        
        // Special handling for select elements and other form elements
        for (let i = 0; i < form.elements.length; i++) {
          const element = form.elements[i];
          if (element.name && element.value) {
            // For select elements, get the selected option's value
            if (element.nodeName === 'SELECT') {
              formData[element.name] = element.options[element.selectedIndex].value;
              console.log(`Select element ${element.name} value: ${formData[element.name]}`);
            } else {
              formData[element.name] = element.value;
            }
          }
        }
        
        // Also use FormData as a backup
        new FormData(form).forEach((value, key) => {
          if (!formData[key]) {
            formData[key] = value;
          }
        });
        
        // Add timestamp and form type
        formData.submitted_at = new Date().toISOString();
        formData.form_type = form.getAttribute('data-form-type') || 'form_' + (Math.floor(Math.random() * 1000000));
        
        console.log('Submitting to n8n webhook with data:', formData);
        
        // Submit to webhook
        fetch('https://n8n.backus.agency/webhook/form_filled', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData)
        })
        .then(response => {
          if (!response.ok) {
            throw new Error(`Server responded with ${response.status}: ${response.statusText}`);
          }
          return response.json();
        })
        .then(data => {
          console.log('Webhook submission successful:', data);
          
          // Show success message using the site's own message container
          const messageContainer = form.querySelector('.form-message');
          if (messageContainer) {
            messageContainer.innerHTML = '<div style="padding: 12px; background-color: rgba(46, 204, 113, 0.2); border: 1px solid rgba(46, 204, 113, 0.5); border-radius: 6px; color: white; margin-top: 16px;">Thank you! Your form has been submitted successfully.</div>';
            messageContainer.style.display = 'block';
            
            // Hide the message after 5 seconds
            setTimeout(() => {
              messageContainer.style.display = 'none';
            }, 5000);
          } else {
            // Fallback to alert if no message container
            alert('Your form has been submitted successfully!');
          }
          
          // Reset the form
          form.reset();
        })
        .catch(error => {
          console.error('Webhook submission error:', error);
          
          // Show error message
          alert('There was a problem submitting the form: ' + error.message);
        });
        
        return false;
      }
    }, true);
    
    // Intercept iframe creation for Google Forms
    const originalCreateElement = document.createElement;
    document.createElement = function(tagName) {
      const element = originalCreateElement.apply(this, arguments);
      
      if (tagName && tagName.toLowerCase() === 'iframe') {
        // Hook into setting the name or src
        const originalSetAttribute = element.setAttribute;
        element.setAttribute = function(name, value) {
          if ((name === 'name' && value && value.includes('hidden-contact-iframe')) || 
              (name === 'src' && value && (value.includes('forms.gle') || value.includes('docs.google.com/forms')))) {
            console.log('Intercepted iframe for Google Forms');
            // Don't actually set the attribute
            return;
          }
          return originalSetAttribute.apply(this, arguments);
        };
      }
      
      return element;
    };
    
    // Also prevent forms from being created for Google Forms
    const observer = new MutationObserver(mutations => {
      mutations.forEach(mutation => {
        if (mutation.addedNodes && mutation.addedNodes.length) {
          for (let i = 0; i < mutation.addedNodes.length; i++) {
            const node = mutation.addedNodes[i];
            if (node.tagName === 'FORM') {
              const action = node.getAttribute('action') || '';
              if (action.includes('forms.gle') || action.includes('docs.google.com/forms')) {
                console.log('Intercepted dynamic form creation for Google Forms');
                node.setAttribute('action', 'https://n8n.backus.agency/webhook/form_filled');
                node.setAttribute('method', 'POST');
                
                // Override the submit handling
                node.addEventListener('submit', function(event) {
                  event.preventDefault();
                  event.stopPropagation();
                  
                  // Collect form data
                  const formData = {};
                  
                  // Special handling for select elements and other form elements
                  for (let i = 0; i < node.elements.length; i++) {
                    const element = node.elements[i];
                    if (element.name && element.value) {
                      // For select elements, get the selected option's value
                      if (element.nodeName === 'SELECT') {
                        formData[element.name] = element.options[element.selectedIndex].value;
                        console.log(`Select element ${element.name} value: ${formData[element.name]}`);
                      } else {
                        formData[element.name] = element.value;
                      }
                    }
                  }
                  
                  // Also use FormData as a backup
                  new FormData(node).forEach((value, key) => {
                    if (!formData[key]) {
                      formData[key] = value;
                    }
                  });
                  
                  // Add timestamp and form type
                  formData.submitted_at = new Date().toISOString();
                  formData.form_type = node.getAttribute('data-form-type') || 'dynamic_form';
                  
                  console.log('Submitting dynamically created form to n8n webhook with data:', formData);
                  
                  // Submit to webhook
                  fetch('https://n8n.backus.agency/webhook/form_filled', {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(formData)
                  })
                  .then(response => {
                    if (!response.ok) {
                      throw new Error(`Server responded with ${response.status}: ${response.statusText}`);
                    }
                    return response.json();
                  })
                  .then(data => {
                    console.log('Webhook submission successful:', data);
                    
                    // Show success message using the site's own message container
                    const messageContainer = node.querySelector('.form-message');
                    if (messageContainer) {
                      messageContainer.innerHTML = '<div style="padding: 12px; background-color: rgba(46, 204, 113, 0.2); border: 1px solid rgba(46, 204, 113, 0.5); border-radius: 6px; color: white; margin-top: 16px;">Thank you! Your form has been submitted successfully.</div>';
                      messageContainer.style.display = 'block';
                      
                      // Hide the message after 5 seconds
                      setTimeout(() => {
                        messageContainer.style.display = 'none';
                      }, 5000);
                    } else {
                      // Fallback to alert if no message container
                      alert('Your form has been submitted successfully!');
                    }
                    
                    // Reset the form
                    node.reset();
                  })
                  .catch(error => {
                    console.error('Webhook submission error:', error);
                    
                    // Show error message
                    alert('There was a problem submitting the form: ' + error.message);
                  });
                  
                  return false;
                });
              }
            }
          }
        }
      });
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }
  
  // Run the interceptor immediately if the document is already loaded
  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    interceptFormSubmission();
  } else {
    // Otherwise, wait for the document to load
    window.addEventListener('DOMContentLoaded', interceptFormSubmission);
  }
  
  // Also run on load to catch any dynamic form creation
  window.addEventListener('load', interceptFormSubmission);
})();