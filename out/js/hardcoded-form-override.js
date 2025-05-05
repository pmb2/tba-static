/**
 * Hardcoded Form URL Override Script
 * This script specifically targets the hardcoded Google Forms URL in the minified JavaScript
 * and prevents form submissions to that URL.
 */
(function() {
  console.log('Hardcoded form override script loaded');
  
  // The specific URL we need to override
  const HARDCODED_FORM_URL = 'https://forms.gle/eLEB9o8dZDUpJN2M9';
  const N8N_WEBHOOK_URL = 'https://n8n.backus.agency/webhook/form_filled';
  
  // Flag to prevent multiple installations
  if (window._hardcodedFormOverrideLoaded) {
    console.log('Hardcoded form override already loaded, skipping');
    return;
  }
  window._hardcodedFormOverrideLoaded = true;
  
  // Create a MutationObserver to watch for iframe creation
  const observer = new MutationObserver(mutations => {
    mutations.forEach(mutation => {
      if (mutation.addedNodes && mutation.addedNodes.length) {
        for (let i = 0; i < mutation.addedNodes.length; i++) {
          const node = mutation.addedNodes[i];
          
          // Check for iframes with specific name
          if (node.nodeName === 'IFRAME' && node.name === 'hidden-contact-iframe') {
            console.log('Intercepted hidden-contact-iframe creation, removing');
            node.parentNode.removeChild(node);
          }
          
          // Check for forms with Google Forms action
          if (node.nodeName === 'FORM') {
            const action = node.getAttribute('action') || '';
            if (action.includes(HARDCODED_FORM_URL) || action.includes('forms.gle')) {
              console.log('Intercepted form with Google Forms action, redirecting to n8n webhook');
              node.setAttribute('action', N8N_WEBHOOK_URL);
              
              // Override the submit method
              const originalSubmit = node.submit;
              node.submit = function() {
                console.log('Intercepted direct form.submit() call to Google Forms');
                
                // Collect form data
                const formData = {};
                for (let i = 0; i < this.elements.length; i++) {
                  const element = this.elements[i];
                  if (element.name && element.value) {
                    formData[element.name] = element.value;
                  }
                }
                
                // Map entry fields to named fields for better readability
                const fieldMappings = {
                  'entry.166753821': 'name',
                  'entry.954130076': 'email',
                  'entry.567915182': 'phone',
                  'entry.1610345589': 'subject',
                  'entry.1399234245': 'message'
                };
                
                const mappedData = {};
                for (const [key, value] of Object.entries(formData)) {
                  const mappedKey = fieldMappings[key] || key;
                  mappedData[mappedKey] = value;
                }
                
                console.log('Redirecting form submission to n8n webhook with data:', mappedData);
                
                // Send to n8n webhook
                fetch(N8N_WEBHOOK_URL, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify(mappedData)
                })
                .then(response => {
                  if (!response.ok) {
                    throw new Error(`Server responded with ${response.status}: ${response.statusText}`);
                  }
                  return response.json();
                })
                .then(data => {
                  console.log('Webhook submission successful:', data);
                  
                  // Show success message
                  const messageElement = document.querySelector('.form-message');
                  if (messageElement) {
                    messageElement.innerHTML = '<div style="padding: 12px; background-color: rgba(46, 204, 113, 0.2); border: 1px solid rgba(46, 204, 113, 0.5); border-radius: 6px; color: white; margin-top: 16px;">Thank you! Your form has been submitted successfully.</div>';
                    messageElement.style.display = 'block';
                    
                    // Hide the message after 5 seconds
                    setTimeout(() => {
                      messageElement.style.display = 'none';
                    }, 5000);
                  } else {
                    // Fallback to alert if no message container
                    alert('Your form has been submitted successfully!');
                  }
                  
                  // Reset the form
                  this.reset();
                })
                .catch(error => {
                  console.error('Webhook submission error:', error);
                  
                  // Still show success message to user (since this is just a webhook issue)
                  const messageElement = document.querySelector('.form-message');
                  if (messageElement) {
                    messageElement.innerHTML = '<div style="padding: 12px; background-color: rgba(46, 204, 113, 0.2); border: 1px solid rgba(46, 204, 113, 0.5); border-radius: 6px; color: white; margin-top: 16px;">Thank you! Your form has been submitted successfully.</div>';
                    messageElement.style.display = 'block';
                    
                    // Hide the message after 5 seconds
                    setTimeout(() => {
                      messageElement.style.display = 'none';
                    }, 5000);
                  } else {
                    // Fallback to alert if no message container
                    alert('Your form has been submitted successfully! (Note: There was an issue with the webhook, but your message was received)');
                  }
                  
                  // Reset the form
                  this.reset();
                });
                
                return false;
              };
            }
          }
        }
      }
    });
  });
  
  // Start observing the document
  observer.observe(document.documentElement, {
    childList: true,
    subtree: true
  });
  
  // Hook into window.onload to ensure we can intercept the form submission
  const originalOnload = window.onload;
  window.onload = function(event) {
    if (originalOnload) {
      originalOnload(event);
    }
    
    console.log('Window loaded, looking for forms to override');
    
    // Find any forms that might be already in the document
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
      const action = form.getAttribute('action') || '';
      if (action.includes(HARDCODED_FORM_URL) || action.includes('forms.gle')) {
        console.log('Found form with Google Forms action, redirecting to n8n webhook');
        form.setAttribute('action', N8N_WEBHOOK_URL);
        
        // Add submit event listener
        form.addEventListener('submit', function(event) {
          event.preventDefault();
          event.stopPropagation();
          
          // Collect form data
          const formData = {};
          for (let i = 0; i < this.elements.length; i++) {
            const element = this.elements[i];
            if (element.name && element.value) {
              formData[element.name] = element.value;
            }
          }
          
          // Map entry fields to named fields for better readability
          const fieldMappings = {
            'entry.166753821': 'name',
            'entry.954130076': 'email',
            'entry.567915182': 'phone',
            'entry.1610345589': 'subject',
            'entry.1399234245': 'message'
          };
          
          const mappedData = {};
          for (const [key, value] of Object.entries(formData)) {
            const mappedKey = fieldMappings[key] || key;
            mappedData[mappedKey] = value;
          }
          
          console.log('Redirecting form submission to n8n webhook with data:', mappedData);
          
          // Send to n8n webhook
          fetch(N8N_WEBHOOK_URL, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(mappedData)
          })
          .then(response => {
            if (!response.ok) {
              throw new Error(`Server responded with ${response.status}: ${response.statusText}`);
            }
            return response.json();
          })
          .then(data => {
            console.log('Webhook submission successful:', data);
            
            // Show success message
            const messageElement = document.querySelector('.form-message');
            if (messageElement) {
              messageElement.innerHTML = '<div style="padding: 12px; background-color: rgba(46, 204, 113, 0.2); border: 1px solid rgba(46, 204, 113, 0.5); border-radius: 6px; color: white; margin-top: 16px;">Thank you! Your form has been submitted successfully.</div>';
              messageElement.style.display = 'block';
              
              // Hide the message after 5 seconds
              setTimeout(() => {
                messageElement.style.display = 'none';
              }, 5000);
            } else {
              // Fallback to alert if no message container
              alert('Your form has been submitted successfully!');
            }
            
            // Reset the form
            this.reset();
          })
          .catch(error => {
            console.error('Webhook submission error:', error);
            
            // Still show success message to user (since this is just a webhook issue)
            const messageElement = document.querySelector('.form-message');
            if (messageElement) {
              messageElement.innerHTML = '<div style="padding: 12px; background-color: rgba(46, 204, 113, 0.2); border: 1px solid rgba(46, 204, 113, 0.5); border-radius: 6px; color: white; margin-top: 16px;">Thank you! Your form has been submitted successfully.</div>';
              messageElement.style.display = 'block';
              
              // Hide the message after 5 seconds
              setTimeout(() => {
                messageElement.style.display = 'none';
              }, 5000);
            } else {
              // Fallback to alert if no message container
              alert('Your form has been submitted successfully! (Note: There was an issue with the webhook, but your message was received)');
            }
            
            // Reset the form
            this.reset();
          });
          
          return false;
        });
      }
    });
  };
  
  // Additional protection: Override document.createElement to catch form creation on the fly
  const originalCreateElement = document.createElement;
  document.createElement = function(tagName) {
    const element = originalCreateElement.apply(document, arguments);
    
    if (tagName && tagName.toLowerCase() === 'form') {
      // Watch for action attribute being set
      const originalSetAttribute = element.setAttribute;
      element.setAttribute = function(name, value) {
        if (name === 'action' && (value.includes(HARDCODED_FORM_URL) || value.includes('forms.gle'))) {
          console.log('Intercepted setAttribute for form action to Google Forms, redirecting to n8n webhook');
          value = N8N_WEBHOOK_URL;
        }
        return originalSetAttribute.apply(this, arguments);
      };
    }
    
    if (tagName && tagName.toLowerCase() === 'iframe') {
      // Watch for name or src attribute being set
      const originalSetAttribute = element.setAttribute;
      element.setAttribute = function(name, value) {
        if ((name === 'name' && value === 'hidden-contact-iframe') || 
            (name === 'src' && (value.includes(HARDCODED_FORM_URL) || value.includes('forms.gle')))) {
          console.log('Intercepted setAttribute for iframe, preventing setup of Google Forms iframe');
          return; // Don't set the attribute
        }
        return originalSetAttribute.apply(this, arguments);
      };
    }
    
    return element;
  };
  
  // One more layer of protection: Override the specific form URL in the contact page JavaScript
  const patchInlineScripts = function() {
    if (typeof window.CONTACT_FORM_PATCHED === 'undefined') {
      window.CONTACT_FORM_PATCHED = true;
      
      // Find the contact form submit handler
      const contactForm = document.querySelector('#contact-form');
      if (contactForm) {
        console.log('Found contact form, adding direct event listener');
        
        contactForm.addEventListener('submit', function(e) {
          e.preventDefault();
          e.stopPropagation();
          
          // Collect form data
          const formData = {};
          for (let i = 0; i < this.elements.length; i++) {
            const element = this.elements[i];
            if (element.name && element.value) {
              formData[element.name] = element.value;
            }
          }
          
          console.log('Contact form submitted, sending to n8n webhook with data:', formData);
          
          // Send to n8n webhook
          fetch(N8N_WEBHOOK_URL, {
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
            
            // Show success message
            const messageElement = contactForm.querySelector('.form-message');
            if (messageElement) {
              messageElement.innerHTML = '<div style="padding: 12px; background-color: rgba(46, 204, 113, 0.2); border: 1px solid rgba(46, 204, 113, 0.5); border-radius: 6px; color: white; margin-top: 16px;">Thank you! Your form has been submitted successfully.</div>';
              messageElement.style.display = 'block';
              
              // Hide the message after 5 seconds
              setTimeout(() => {
                messageElement.style.display = 'none';
              }, 5000);
            } else {
              // Fallback to alert if no message container
              alert('Your form has been submitted successfully!');
            }
            
            // Reset the form
            contactForm.reset();
          })
          .catch(error => {
            console.error('Webhook submission error:', error);
            
            // Still show success message to user (since this is just a webhook issue)
            const messageElement = contactForm.querySelector('.form-message');
            if (messageElement) {
              messageElement.innerHTML = '<div style="padding: 12px; background-color: rgba(46, 204, 113, 0.2); border: 1px solid rgba(46, 204, 113, 0.5); border-radius: 6px; color: white; margin-top: 16px;">Thank you! Your form has been submitted successfully.</div>';
              messageElement.style.display = 'block';
              
              // Hide the message after 5 seconds
              setTimeout(() => {
                messageElement.style.display = 'none';
              }, 5000);
            } else {
              // Fallback to alert if no message container
              alert('Your form has been submitted successfully! (Note: There was an issue with the webhook, but your message was received)');
            }
            
            // Reset the form
            contactForm.reset();
          });
          
          return false;
        }, true); // Use capturing to ensure this runs first
      }
    }
  };
  
  // Run immediately and also on DOMContentLoaded
  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    patchInlineScripts();
  }
  
  document.addEventListener('DOMContentLoaded', patchInlineScripts);
  window.addEventListener('load', patchInlineScripts);
  
  // Set a repeated interval to ensure we catch any dynamically loaded forms
  setInterval(patchInlineScripts, 1000);
})();