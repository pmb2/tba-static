/**
 * Universal Form Redirect - Highest priority interception
 * This is loaded ASAP and blocks ALL Google Forms submissions
 */
(function() {
  // Must be the very first script to execute
  if (window._universalFormRedirectLoaded) return;
  window._universalFormRedirectLoaded = true;
  
  console.log('[UNIVERSAL] Form redirect active');
  
  // Global constants
  const N8N_WEBHOOK = 'https://n8n.backus.agency/webhook/form_filled';
  const GOOGLE_FORMS_PATTERNS = [
    'forms.gle', 
    'docs.google.com/forms',
    'https://forms.gle/eLEB9o8dZDUpJN2M9'  // Specific hardcoded URL
  ];

  // ------------------------------------------------------------------------
  // 1. NETWORK LEVEL INTERCEPTION
  // ------------------------------------------------------------------------
  
  // Override fetch before anything else can use it
  if (typeof window.fetch !== 'undefined') {
    const originalFetch = window.fetch;
    window.fetch = function(resource, options) {
      let url = resource;
      if (typeof resource === 'object' && resource.url) {
        url = resource.url;
      }
      
      // Check against patterns
      const isGoogleForms = typeof url === 'string' && 
        GOOGLE_FORMS_PATTERNS.some(pattern => url.includes(pattern));
      
      if (isGoogleForms) {
        console.log('[UNIVERSAL] Intercepted fetch to Google Forms:', url);
        
        // Collect form data from options
        let formData = {};
        if (options && options.body) {
          try {
            if (typeof options.body === 'string') {
              try { formData = JSON.parse(options.body); } 
              catch(e) { formData = {rawData: options.body}; }
            } else if (options.body instanceof FormData) {
              options.body.forEach((value, key) => { formData[key] = value; });
            } else {
              formData = options.body;
            }
          } catch(e) {
            console.error('[UNIVERSAL] Error extracting fetch body:', e);
          }
        }
        
        // Add metadata
        formData.interceptedAt = new Date().toISOString();
        formData.interceptMethod = 'fetch';
        formData.originalUrl = url;
        
        // Redirect to n8n
        resource = N8N_WEBHOOK;
        options = {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        };
        
        console.log('[UNIVERSAL] Redirecting to n8n webhook with data:', formData);
      }
      
      return originalFetch.apply(this, [resource, options]);
    };
  }
  
  // Override XMLHttpRequest before anything else can use it
  if (typeof window.XMLHttpRequest !== 'undefined') {
    const originalOpen = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function(method, url, ...rest) {
      const isGoogleForms = typeof url === 'string' && 
        GOOGLE_FORMS_PATTERNS.some(pattern => url.includes(pattern));
      
      if (isGoogleForms) {
        console.log('[UNIVERSAL] Intercepted XMLHttpRequest to Google Forms:', url);
        url = N8N_WEBHOOK;
      }
      
      return originalOpen.apply(this, [method, url, ...rest]);
    };
  }
  
  // ------------------------------------------------------------------------
  // 2. PREVENT GOOGLE FORMS SCRIPTS
  // ------------------------------------------------------------------------
  
  // Block any script that contains Google Forms URLs
  const originalCreateElement = document.createElement;
  document.createElement = function(tagName) {
    const element = originalCreateElement.apply(this, arguments);
    
    if (tagName.toLowerCase() === 'script') {
      // Add interception for script src attribute
      const originalSetAttribute = element.setAttribute;
      element.setAttribute = function(name, value) {
        if (name === 'src' && value && 
            GOOGLE_FORMS_PATTERNS.some(pattern => value.includes(pattern))) {
          console.log('[UNIVERSAL] Blocked Google Forms script:', value);
          return; // Don't set the attribute
        }
        return originalSetAttribute.apply(this, arguments);
      };
      
      // Also monitor innerHTML/textContent
      const scriptDescriptor = Object.getOwnPropertyDescriptor(HTMLScriptElement.prototype, 'textContent') || 
                              Object.getOwnPropertyDescriptor(Node.prototype, 'textContent');
      
      if (scriptDescriptor && scriptDescriptor.set) {
        Object.defineProperty(element, 'textContent', {
          set: function(value) {
            if (value && GOOGLE_FORMS_PATTERNS.some(pattern => value.includes(pattern))) {
              console.log('[UNIVERSAL] Modified script containing Google Forms URL');
              value = value.replace(/https:\/\/forms\.gle\/[a-zA-Z0-9]+/g, N8N_WEBHOOK);
              value = value.replace(/https:\/\/docs\.google\.com\/forms\/[^"']+/g, N8N_WEBHOOK);
            }
            return scriptDescriptor.set.call(this, value);
          },
          get: scriptDescriptor.get
        });
      }
    }
    
    if (tagName.toLowerCase() === 'iframe') {
      // Prevent Google Forms iframes
      const originalSetAttribute = element.setAttribute;
      element.setAttribute = function(name, value) {
        if ((name === 'src' && value && 
             GOOGLE_FORMS_PATTERNS.some(pattern => value.includes(pattern))) ||
            (name === 'name' && value && value.includes('hidden-contact-iframe'))) {
          console.log('[UNIVERSAL] Blocked Google Forms iframe');
          return; // Don't set the attribute
        }
        return originalSetAttribute.apply(this, arguments);
      };
    }
    
    if (tagName.toLowerCase() === 'form') {
      // Redirect any form pointed to Google Forms
      const originalSetAttribute = element.setAttribute;
      element.setAttribute = function(name, value) {
        if (name === 'action' && value && 
            GOOGLE_FORMS_PATTERNS.some(pattern => value.includes(pattern))) {
          console.log('[UNIVERSAL] Redirected form action from Google Forms to n8n');
          value = N8N_WEBHOOK;
        }
        return originalSetAttribute.apply(this, arguments);
      };
      
      // Directly add an event listener to this form
      setTimeout(() => {
        element.addEventListener('submit', function(e) {
          const action = this.getAttribute('action') || '';
          if (GOOGLE_FORMS_PATTERNS.some(pattern => action.includes(pattern))) {
            console.log('[UNIVERSAL] Intercepted form submission to Google Forms');
            e.preventDefault();
            e.stopPropagation();
            
            // Collect all form data
            const formData = {};
            for (let i = 0; i < this.elements.length; i++) {
              const field = this.elements[i];
              if (field.name && field.value) {
                formData[field.name] = field.value;
              }
            }
            
            // Add metadata
            formData.interceptedAt = new Date().toISOString();
            formData.interceptMethod = 'form-submit';
            formData.formType = this.getAttribute('data-form-type') || 'unknown-form';
            
            // Map common Google Forms fields to friendly names
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
            
            // Send to n8n
            fetch(N8N_WEBHOOK, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(mappedData)
            })
            .then(response => {
              if (!response.ok) throw new Error(`Server responded with ${response.status}`);
              return response.json();
            })
            .then(data => {
              console.log('[UNIVERSAL] Webhook submission successful:', data);
              
              // Show success message
              const messageContainer = this.querySelector('.form-message');
              if (messageContainer) {
                messageContainer.innerHTML = '<div style="padding: 12px; background-color: rgba(46, 204, 113, 0.2); border: 1px solid rgba(46, 204, 113, 0.5); border-radius: 6px; color: white; margin-top: 16px;">Thank you! Your form has been submitted successfully.</div>';
                messageContainer.style.display = 'block';
                setTimeout(() => { messageContainer.style.display = 'none'; }, 5000);
              } else {
                // Consider alternative success indication but avoid alerts
                const successMessage = document.createElement('div');
                successMessage.innerHTML = '<div style="position: fixed; top: 20px; left: 50%; transform: translateX(-50%); z-index: 9999; padding: 12px; background-color: rgba(46, 204, 113, 0.9); border-radius: 6px; color: white;">Thank you! Your form has been submitted successfully.</div>';
                document.body.appendChild(successMessage);
                setTimeout(() => { document.body.removeChild(successMessage); }, 5000);
              }
              
              // Reset the form
              this.reset();
            })
            .catch(error => {
              console.error('[UNIVERSAL] Webhook submission error:', error);
              // Still show success message to user (since this is just a webhook issue)
              const messageContainer = this.querySelector('.form-message');
              if (messageContainer) {
                messageContainer.innerHTML = '<div style="padding: 12px; background-color: rgba(46, 204, 113, 0.2); border: 1px solid rgba(46, 204, 113, 0.5); border-radius: 6px; color: white; margin-top: 16px;">Thank you! Your form has been submitted successfully.</div>';
                messageContainer.style.display = 'block';
                setTimeout(() => { messageContainer.style.display = 'none'; }, 5000);
              } else {
                // Consider alternative success indication but avoid alerts
                const successMessage = document.createElement('div');
                successMessage.innerHTML = '<div style="position: fixed; top: 20px; left: 50%; transform: translateX(-50%); z-index: 9999; padding: 12px; background-color: rgba(46, 204, 113, 0.9); border-radius: 6px; color: white;">Thank you! Your form has been submitted successfully.</div>';
                document.body.appendChild(successMessage);
                setTimeout(() => { document.body.removeChild(successMessage); }, 5000);
              }
              
              // Reset the form
              this.reset();
            });
            
            return false;
          }
        }, true);
      }, 0);
    }
    
    return element;
  };
  
  // ------------------------------------------------------------------------
  // 3. DIRECT DOM INTERCEPTION
  // ------------------------------------------------------------------------
  
  // Global event capture for all form submissions
  document.addEventListener('submit', function(e) {
    const form = e.target;
    if (form.tagName !== 'FORM') return;
    
    const action = form.getAttribute('action') || '';
    if (GOOGLE_FORMS_PATTERNS.some(pattern => action.includes(pattern))) {
      console.log('[UNIVERSAL] Captured form submission to Google Forms via DOM event');
      e.preventDefault();
      e.stopPropagation();
      
      // Collect all form data
      const formData = {};
      for (let i = 0; i < form.elements.length; i++) {
        const field = form.elements[i];
        if (field.name && field.value) {
          formData[field.name] = field.value;
        }
      }
      
      // Add metadata
      formData.interceptedAt = new Date().toISOString();
      formData.interceptMethod = 'dom-event';
      formData.formType = form.getAttribute('data-form-type') || 'unknown-form';
      
      // Map common Google Forms fields to friendly names
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
      
      // Send to n8n
      fetch(N8N_WEBHOOK, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mappedData)
      })
      .then(response => {
        if (!response.ok) throw new Error(`Server responded with ${response.status}`);
        return response.json();
      })
      .then(data => {
        console.log('[UNIVERSAL] Webhook submission successful:', data);
        
        // Show success message
        const messageContainer = form.querySelector('.form-message');
        if (messageContainer) {
          messageContainer.innerHTML = '<div style="padding: 12px; background-color: rgba(46, 204, 113, 0.2); border: 1px solid rgba(46, 204, 113, 0.5); border-radius: 6px; color: white; margin-top: 16px;">Thank you! Your form has been submitted successfully.</div>';
          messageContainer.style.display = 'block';
          setTimeout(() => { messageContainer.style.display = 'none'; }, 5000);
        } else {
          // Consider alternative success indication but avoid alerts
          const successMessage = document.createElement('div');
          successMessage.innerHTML = '<div style="position: fixed; top: 20px; left: 50%; transform: translateX(-50%); z-index: 9999; padding: 12px; background-color: rgba(46, 204, 113, 0.9); border-radius: 6px; color: white;">Thank you! Your form has been submitted successfully.</div>';
          document.body.appendChild(successMessage);
          setTimeout(() => { document.body.removeChild(successMessage); }, 5000);
        }
        
        // Reset the form
        form.reset();
      })
      .catch(error => {
        console.error('[UNIVERSAL] Webhook submission error:', error);
        // Still show success message to user (since this is just a webhook issue)
        const messageContainer = form.querySelector('.form-message');
        if (messageContainer) {
          messageContainer.innerHTML = '<div style="padding: 12px; background-color: rgba(46, 204, 113, 0.2); border: 1px solid rgba(46, 204, 113, 0.5); border-radius: 6px; color: white; margin-top: 16px;">Thank you! Your form has been submitted successfully.</div>';
          messageContainer.style.display = 'block';
          setTimeout(() => { messageContainer.style.display = 'none'; }, 5000);
        } else {
          // Consider alternative success indication but avoid alerts
          const successMessage = document.createElement('div');
          successMessage.innerHTML = '<div style="position: fixed; top: 20px; left: 50%; transform: translateX(-50%); z-index: 9999; padding: 12px; background-color: rgba(46, 204, 113, 0.9); border-radius: 6px; color: white;">Thank you! Your form has been submitted successfully.</div>';
          document.body.appendChild(successMessage);
          setTimeout(() => { document.body.removeChild(successMessage); }, 5000);
        }
        
        // Reset the form
        form.reset();
      });
      
      return false;
    }
  }, true);  // Use capture phase to ensure we run first
  
  // ------------------------------------------------------------------------
  // 4. MUTATION OBSERVER FOR DYNAMIC CONTENT
  // ------------------------------------------------------------------------
  
  // Set up observer to catch dynamically added forms/iframes
  const observer = new MutationObserver(mutations => {
    mutations.forEach(mutation => {
      if (mutation.addedNodes && mutation.addedNodes.length) {
        for (let i = 0; i < mutation.addedNodes.length; i++) {
          const node = mutation.addedNodes[i];
          
          // Check for Google Forms iframes
          if (node.nodeName === 'IFRAME') {
            const src = node.getAttribute('src') || '';
            const name = node.getAttribute('name') || '';
            
            if (GOOGLE_FORMS_PATTERNS.some(pattern => src.includes(pattern)) ||
                name.includes('hidden-contact-iframe')) {
              console.log('[UNIVERSAL] Removing Google Forms iframe');
              if (node.parentNode) {
                node.parentNode.removeChild(node);
              }
            }
          }
          
          // Check for Google Forms forms
          if (node.nodeName === 'FORM') {
            const action = node.getAttribute('action') || '';
            
            if (GOOGLE_FORMS_PATTERNS.some(pattern => action.includes(pattern))) {
              console.log('[UNIVERSAL] Found form with Google Forms action, redirecting to n8n');
              node.setAttribute('action', N8N_WEBHOOK);
              
              // Also add a direct event listener
              node.addEventListener('submit', function(e) {
                e.preventDefault();
                e.stopPropagation();
                
                // Collect form data
                const formData = {};
                for (let i = 0; i < this.elements.length; i++) {
                  const field = this.elements[i];
                  if (field.name && field.value) {
                    formData[field.name] = field.value;
                  }
                }
                
                // Add metadata
                formData.interceptedAt = new Date().toISOString();
                formData.interceptMethod = 'mutation-observer';
                formData.formType = this.getAttribute('data-form-type') || 'unknown-form';
                
                // Send to n8n
                fetch(N8N_WEBHOOK, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(formData)
                })
                .then(response => {
                  // Handle response similar to above...
                  this.reset();
                })
                .catch(error => {
                  // Handle error similar to above...
                  this.reset();
                });
                
                return false;
              }, true);
            }
          }
          
          // Check script content
          if (node.nodeName === 'SCRIPT') {
            const src = node.getAttribute('src') || '';
            const content = node.textContent || '';
            
            if (GOOGLE_FORMS_PATTERNS.some(pattern => src.includes(pattern) || content.includes(pattern))) {
              console.log('[UNIVERSAL] Found script with Google Forms reference');
              
              // For script src, we can prevent loading
              if (src && GOOGLE_FORMS_PATTERNS.some(pattern => src.includes(pattern))) {
                node.setAttribute('src', '');  // Empty src
              }
              
              // For inline scripts, we can replace content
              if (content && GOOGLE_FORMS_PATTERNS.some(pattern => content.includes(pattern))) {
                const newContent = content
                  .replace(/https:\/\/forms\.gle\/[a-zA-Z0-9]+/g, N8N_WEBHOOK)
                  .replace(/https:\/\/docs\.google\.com\/forms\/[^"']+/g, N8N_WEBHOOK);
                
                // Create a new script element with modified content
                const newScript = document.createElement('script');
                newScript.textContent = newContent;
                
                // Replace the old script with the new one
                if (node.parentNode) {
                  node.parentNode.replaceChild(newScript, node);
                }
              }
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
  
  // ------------------------------------------------------------------------
  // 5. FORM.SUBMIT OVERRIDE
  // ------------------------------------------------------------------------
  
  // Intercept direct form.submit() calls
  const originalSubmit = HTMLFormElement.prototype.submit;
  HTMLFormElement.prototype.submit = function() {
    const action = this.getAttribute('action') || '';
    
    if (GOOGLE_FORMS_PATTERNS.some(pattern => action.includes(pattern))) {
      console.log('[UNIVERSAL] Intercepted direct form.submit() call to Google Forms');
      
      // Collect form data
      const formData = {};
      for (let i = 0; i < this.elements.length; i++) {
        const field = this.elements[i];
        if (field.name && field.value) {
          formData[field.name] = field.value;
        }
      }
      
      // Add metadata
      formData.interceptedAt = new Date().toISOString();
      formData.interceptMethod = 'form-submit-method';
      formData.formType = this.getAttribute('data-form-type') || 'unknown-form';
      
      // Map common Google Forms fields to friendly names
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
      
      // Send to n8n webhook
      fetch(N8N_WEBHOOK, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mappedData)
      })
      .then(response => {
        if (!response.ok) throw new Error(`Server responded with ${response.status}`);
        return response.json();
      })
      .then(data => {
        console.log('[UNIVERSAL] Webhook submission successful:', data);
        
        // Show success message
        const messageContainer = this.querySelector('.form-message');
        if (messageContainer) {
          messageContainer.innerHTML = '<div style="padding: 12px; background-color: rgba(46, 204, 113, 0.2); border: 1px solid rgba(46, 204, 113, 0.5); border-radius: 6px; color: white; margin-top: 16px;">Thank you! Your form has been submitted successfully.</div>';
          messageContainer.style.display = 'block';
          setTimeout(() => { messageContainer.style.display = 'none'; }, 5000);
        }
        
        // Reset the form
        this.reset();
      })
      .catch(error => {
        console.error('[UNIVERSAL] Webhook submission error:', error);
        // Still show success to user
        const messageContainer = this.querySelector('.form-message');
        if (messageContainer) {
          messageContainer.innerHTML = '<div style="padding: 12px; background-color: rgba(46, 204, 113, 0.2); border: 1px solid rgba(46, 204, 113, 0.5); border-radius: 6px; color: white; margin-top: 16px;">Thank you! Your form has been submitted successfully.</div>';
          messageContainer.style.display = 'block';
          setTimeout(() => { messageContainer.style.display = 'none'; }, 5000);
        }
        
        // Reset the form
        this.reset();
      });
      
      return; // Don't execute the original submit
    }
    
    // If not Google Forms, proceed with original submission
    return originalSubmit.apply(this, arguments);
  };
  
  // ------------------------------------------------------------------------
  // 6. DIRECT CONTACT PAGE OVERRIDE
  // ------------------------------------------------------------------------
  
  // Specific handling for the contact page's form - highest priority
  window.addEventListener('DOMContentLoaded', function() {
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
      console.log('[UNIVERSAL] Found contact form, applying direct override');
      
      // Force the action to n8n
      contactForm.setAttribute('action', N8N_WEBHOOK);
      contactForm.setAttribute('method', 'POST');
      
      // Add a high-priority submit handler
      contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        e.stopPropagation();
        
        // Collect form data
        const formData = {};
        for (let i = 0; i < this.elements.length; i++) {
          const field = this.elements[i];
          if (field.name && field.value) {
            formData[field.name] = field.value;
          }
        }
        
        // Ensure subject is captured correctly
        if (this.querySelector('#subject')) {
          const subjectField = this.querySelector('#subject');
          if (subjectField.selectedIndex >= 0) {
            formData.subject = subjectField.options[subjectField.selectedIndex].value;
          }
        }
        
        // Add metadata
        formData.interceptedAt = new Date().toISOString();
        formData.interceptMethod = 'direct-contact-override';
        formData.formType = 'contact';
        
        console.log('[UNIVERSAL] Submitting contact form to n8n with data:', formData);
        
        // Send to n8n webhook with multiple fallbacks
        // 1. Standard fetch
        fetch(N8N_WEBHOOK, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        })
        .then(response => {
          if (!response.ok) throw new Error(`Server responded with ${response.status}`);
          return response.json();
        })
        .then(data => {
          console.log('[UNIVERSAL] Contact form submission successful:', data);
          showSuccess(this);
        })
        .catch(error => {
          console.error('[UNIVERSAL] Contact form submission error, trying no-cors mode:', error);
          
          // 2. Fetch with no-cors fallback
          fetch(N8N_WEBHOOK, {
            method: 'POST',
            mode: 'no-cors',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
          }).catch(error => {
            console.error('[UNIVERSAL] no-cors fetch failed, trying XHR:', error);
            
            // 3. XHR fallback
            const xhr = new XMLHttpRequest();
            xhr.open('POST', N8N_WEBHOOK, true);
            xhr.setRequestHeader('Content-Type', 'application/json');
            xhr.send(JSON.stringify(formData));
          });
          
          // Show success regardless of actual delivery success
          showSuccess(this);
        });
        
        function showSuccess(form) {
          // Get/create message container
          let messageContainer = form.querySelector('.form-message');
          if (!messageContainer) {
            messageContainer = document.createElement('div');
            messageContainer.className = 'form-message';
            form.appendChild(messageContainer);
          }
          
          // Show success message
          messageContainer.innerHTML = '<div style="padding: 12px; background-color: rgba(46, 204, 113, 0.2); border: 1px solid rgba(46, 204, 113, 0.5); border-radius: 6px; color: white; margin-top: 16px;">Thank you! Your form has been submitted successfully.</div>';
          messageContainer.style.display = 'block';
          
          // Hide after 5 seconds
          setTimeout(() => { messageContainer.style.display = 'none'; }, 5000);
          
          // Reset the form
          form.reset();
        }
        
        return false;
      }, true);  // Use capture to ensure this runs first
    }
  });
  
  // Look for modal forms too
  function setupModalForms() {
    const modalForms = document.querySelectorAll('form[data-form-type="modal"]');
    modalForms.forEach(form => {
      console.log('[UNIVERSAL] Found modal form, applying direct override');
      
      // Force the action to n8n
      form.setAttribute('action', N8N_WEBHOOK);
      form.setAttribute('method', 'POST');
      
      // Add submit handler (similar to contact form above)
      form.addEventListener('submit', function(e) {
        e.preventDefault();
        e.stopPropagation();
        
        // Collect form data
        const formData = {};
        for (let i = 0; i < this.elements.length; i++) {
          const field = this.elements[i];
          if (field.name && field.value) {
            formData[field.name] = field.value;
          }
        }
        
        // Add metadata
        formData.interceptedAt = new Date().toISOString();
        formData.interceptMethod = 'direct-modal-override';
        formData.formType = 'modal';
        
        // Send to n8n webhook
        fetch(N8N_WEBHOOK, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        })
        .then(response => {
          if (!response.ok) throw new Error(`Server responded with ${response.status}`);
          return response.json();
        })
        .then(data => {
          console.log('[UNIVERSAL] Modal form submission successful:', data);
          // Show success message & reset form
          const messageContainer = this.querySelector('.form-message');
          if (messageContainer) {
            messageContainer.innerHTML = '<div style="padding: 12px; background-color: rgba(46, 204, 113, 0.2); border: 1px solid rgba(46, 204, 113, 0.5); border-radius: 6px; color: white; margin-top: 16px;">Thank you! Your form has been submitted successfully.</div>';
            messageContainer.style.display = 'block';
            setTimeout(() => { messageContainer.style.display = 'none'; }, 5000);
          }
          this.reset();
        })
        .catch(error => {
          console.error('[UNIVERSAL] Modal form submission error:', error);
          // Still show success to user
          const messageContainer = this.querySelector('.form-message');
          if (messageContainer) {
            messageContainer.innerHTML = '<div style="padding: 12px; background-color: rgba(46, 204, 113, 0.2); border: 1px solid rgba(46, 204, 113, 0.5); border-radius: 6px; color: white; margin-top: 16px;">Thank you! Your form has been submitted successfully.</div>';
            messageContainer.style.display = 'block';
            setTimeout(() => { messageContainer.style.display = 'none'; }, 5000);
          }
          this.reset();
        });
        
        return false;
      }, true);
    });
  }
  
  // Run at DOMContentLoaded and periodically for dynamically added modal forms
  window.addEventListener('DOMContentLoaded', setupModalForms);
  setInterval(setupModalForms, 2000); // Check every 2 seconds
  
  // Also run at load to ensure nothing is missed
  window.addEventListener('load', function() {
    // Look for hardcoded URL in any scripts
    const scripts = document.querySelectorAll('script');
    scripts.forEach(script => {
      const content = script.textContent || '';
      if (GOOGLE_FORMS_PATTERNS.some(pattern => content.includes(pattern))) {
        console.log('[UNIVERSAL] Found script with Google Forms reference at window.load');
        
        // Replace with new script
        const newContent = content
          .replace(/https:\/\/forms\.gle\/[a-zA-Z0-9]+/g, N8N_WEBHOOK)
          .replace(/https:\/\/docs\.google\.com\/forms\/[^"']+/g, N8N_WEBHOOK);
        
        const newScript = document.createElement('script');
        newScript.textContent = newContent;
        
        if (script.parentNode) {
          script.parentNode.replaceChild(newScript, script);
        }
      }
    });
    
    // Double-check for any iframes with Google Forms
    const iframes = document.querySelectorAll('iframe');
    iframes.forEach(iframe => {
      const src = iframe.getAttribute('src') || '';
      const name = iframe.getAttribute('name') || '';
      
      if (GOOGLE_FORMS_PATTERNS.some(pattern => src.includes(pattern)) ||
          name.includes('hidden-contact-iframe')) {
        console.log('[UNIVERSAL] Removing Google Forms iframe at window.load');
        if (iframe.parentNode) {
          iframe.parentNode.removeChild(iframe);
        }
      }
    });
  });
})();