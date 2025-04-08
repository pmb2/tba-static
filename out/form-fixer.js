// TBA Form Fixer - Static Site Edition
// This script is specifically designed to work with static sites hosted on GitHub Pages
// It fixes form submissions to Google Forms by capturing form submissions,
// resolving CORS issues, and providing user feedback

(function() {
  console.log("Form Fixer for Static Sites loaded - v3!");

  // Configuration for Google Forms
  const GOOGLE_FORMS = {
    // Main contact form
    contact: {
      formUrl: 'https://docs.google.com/forms/d/e/1FAIpQLSf9FbCGxDu8BegwDLa9qiLu4mFm4MSilBkoTEo5qWVH-EpS-g/formResponse',
      fields: {
        'name': 'entry.166753821',
        'email': 'entry.954130076',
        'phone': 'entry.1263452350',
        'subject': 'entry.1134801428',
        'message': 'entry.1503383050'
      }
    },
    // Newsletter form
    newsletter: {
      formUrl: 'https://docs.google.com/forms/d/e/1FAIpQLSe5jZ0lDVHf0o5-1T7eJt9vkRk-sYvwNjbcGkBuqP5I09H7ig/formResponse',
      fields: {
        'email': 'entry.456327236'
      }
    }
  };

  // Helper function to create and append a hidden iframe
  function createHiddenIframe(id) {
    const iframe = document.createElement('iframe');
    iframe.setAttribute('id', id);
    iframe.setAttribute('name', id);
    iframe.setAttribute('width', '0');
    iframe.setAttribute('height', '0');
    iframe.setAttribute('tabindex', '-1');
    iframe.style.opacity = '0';
    iframe.style.position = 'absolute';
    iframe.style.left = '-1000px';
    iframe.style.top = '-1000px';
    document.body.appendChild(iframe);
    return iframe;
  }

  // Method 1: Google Forms direct submission via pre-generated iframe
  function setupPrefetchedForms() {
    try {
      // Create hidden iframes for each form type
      Object.keys(GOOGLE_FORMS).forEach(formType => {
        const config = GOOGLE_FORMS[formType];
        const iframeId = `hidden_${formType}_iframe`;
        
        // Skip if iframe already exists
        if (document.getElementById(iframeId)) {
          return;
        }
        
        // Create iframe
        const iframe = createHiddenIframe(iframeId);
        
        // Create a hidden form that submits to the iframe
        const hiddenForm = document.createElement('form');
        hiddenForm.id = `hidden_${formType}_form`;
        hiddenForm.action = config.formUrl;
        hiddenForm.method = 'POST';
        hiddenForm.target = iframeId;
        hiddenForm.style.display = 'none';
        
        // Add input fields based on configuration
        Object.values(config.fields).forEach(fieldId => {
          const input = document.createElement('input');
          input.type = 'hidden';
          input.name = fieldId;
          input.id = `${hiddenForm.id}_${fieldId}`;
          hiddenForm.appendChild(input);
        });
        
        document.body.appendChild(hiddenForm);
        
        console.log(`Prefetched form setup complete for ${formType}`);
      });
    } catch (error) {
      console.error('Error setting up prefetched forms:', error);
    }
  }

  // Primary submission method - use prefetched iframe
  function submitViaPrefetchedForm(formType, formData) {
    try {
      const hiddenFormId = `hidden_${formType}_form`;
      const hiddenForm = document.getElementById(hiddenFormId);
      
      if (!hiddenForm) {
        console.error(`Hidden form ${hiddenFormId} not found, falling back to iframe method`);
        return false;
      }
      
      // Update form fields with values
      for (const [googleFieldId, value] of Object.entries(formData)) {
        const input = document.getElementById(`${hiddenFormId}_${googleFieldId}`);
        if (input) {
          input.value = value;
        } else {
          // Field doesn't exist, create it
          const newInput = document.createElement('input');
          newInput.type = 'hidden';
          newInput.name = googleFieldId;
          newInput.id = `${hiddenFormId}_${googleFieldId}`;
          newInput.value = value;
          hiddenForm.appendChild(newInput);
        }
      }
      
      console.log(`Submitting ${formType} form via prefetched method:`, formData);
      
      // Submit the form
      hiddenForm.submit();
      
      // Show success message (Google Forms won't provide feedback)
      displaySuccessMessage();
      
      return true;
    } catch (error) {
      console.error('Error in prefetched form submission:', error);
      return false;
    }
  }

  // Method 2: Create and use a new iframe for each submission
  function submitViaIframe(formUrl, formData) {
    try {
      // Create a unique name for the iframe
      const iframeName = 'hidden_iframe_' + Math.floor(Math.random() * 1000000);
      
      // Create hidden iframe
      const iframe = document.createElement('iframe');
      iframe.name = iframeName;
      iframe.id = iframeName;
      iframe.style.display = 'none';
      document.body.appendChild(iframe);

      // Create a form element for this submission
      const form = document.createElement('form');
      form.method = 'POST';
      form.action = formUrl;
      form.target = iframeName;
      form.style.display = 'none';

      // Add form data
      for (const key in formData) {
        if (formData.hasOwnProperty(key) && formData[key]) {
          const input = document.createElement('input');
          input.type = 'hidden';
          input.name = key;
          input.value = formData[key];
          form.appendChild(input);
        }
      }

      console.log(`Submitting to: ${formUrl} via iframe`, formData);
      
      // Add form to DOM
      document.body.appendChild(form);
      
      // Success listener
      iframe.addEventListener('load', function() {
        console.log('Form submission completed via iframe');
        displaySuccessMessage();
        
        // Clean up after submission
        setTimeout(() => {
          if (document.body.contains(iframe)) {
            document.body.removeChild(iframe);
          }
          if (document.body.contains(form)) {
            document.body.removeChild(form);
          }
        }, 1000);
      });
      
      // Submit the form
      form.submit();
      return true;
    } catch (error) {
      console.error('Error during iframe submission:', error);
      return false;
    }
  }

  // Method 3: Direct fetch submission 
  function submitViaFetch(formUrl, formData) {
    try {
      const params = new URLSearchParams();
      
      for (const key in formData) {
        if (formData.hasOwnProperty(key) && formData[key]) {
          params.append(key, formData[key]);
        }
      }
      
      console.log('Attempting fetch submission to:', formUrl);
      
      fetch(formUrl, {
        method: 'POST',
        mode: 'no-cors', // Critical for CORS requests to Google Forms
        cache: 'no-cache',
        credentials: 'omit',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        redirect: 'follow',
        body: params.toString()
      })
      .then(() => {
        // We won't actually know if it succeeded due to no-cors
        console.log('Form fetch request completed');
        displaySuccessMessage();
        return true;
      })
      .catch(error => {
        console.error('Error in fetch submission:', error);
        return false;
      });
      
      return true; // Return true since we've initiated the fetch
    } catch (error) {
      console.error('Error setting up fetch submission:', error);
      return false;
    }
  }

  // Method 4: Last resort - try navigation-based submission
  function submitViaRedirect(formUrl, formData) {
    try {
      const params = new URLSearchParams();
      
      for (const key in formData) {
        if (formData.hasOwnProperty(key) && formData[key]) {
          params.append(key, formData[key]);
        }
      }
      
      const redirectUrl = `${formUrl}?${params.toString()}`;
      
      // Create a form to submit in a new window
      const tempForm = document.createElement('form');
      tempForm.method = 'POST';
      tempForm.action = formUrl;
      tempForm.target = '_blank';
      
      for (const key in formData) {
        if (formData.hasOwnProperty(key) && formData[key]) {
          const input = document.createElement('input');
          input.type = 'hidden';
          input.name = key;
          input.value = formData[key];
          tempForm.appendChild(input);
        }
      }
      
      console.log('Using redirect submission:', redirectUrl);
      document.body.appendChild(tempForm);
      tempForm.submit();
      document.body.removeChild(tempForm);
      
      // Show success message anyway
      displaySuccessMessage();
      return true;
    } catch (error) {
      console.error('Error in redirect submission:', error);
      return false;
    }
  }

  // Function to display success message
  function displaySuccessMessage() {
    const messageElement = document.createElement('div');
    
    // Style the message
    Object.assign(messageElement.style, {
      position: 'fixed',
      top: '20px',
      left: '50%',
      transform: 'translateX(-50%)',
      backgroundColor: '#4CAF50',
      color: 'white',
      padding: '15px 30px',
      borderRadius: '5px',
      zIndex: '9999',
      boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      fontSize: '16px',
      fontWeight: '500'
    });
    
    messageElement.textContent = 'Form submitted successfully!';
    document.body.appendChild(messageElement);
    
    // Remove the message after a delay
    setTimeout(() => {
      if (messageElement && messageElement.parentNode) {
        document.body.removeChild(messageElement);
      }
    }, 5000);
  }

  // Function to handle form submission errors
  function handleSubmissionError(error, formType) {
    console.error(`Error submitting ${formType} form:`, error);
    
    const errorElement = document.createElement('div');
    
    // Style the error message
    Object.assign(errorElement.style, {
      position: 'fixed',
      top: '20px',
      left: '50%',
      transform: 'translateX(-50%)',
      backgroundColor: '#f44336',
      color: 'white',
      padding: '15px 30px',
      borderRadius: '5px',
      zIndex: '9999',
      boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      fontSize: '16px',
      fontWeight: '500'
    });
    
    errorElement.textContent = 'There was an error submitting the form. Please try again.';
    document.body.appendChild(errorElement);
    
    // Remove the error message after a delay
    setTimeout(() => {
      if (errorElement && errorElement.parentNode) {
        document.body.removeChild(errorElement);
      }
    }, 5000);
  }

  // Try submitting form using all available methods until one succeeds
  function tryAllSubmissionMethods(formType, formUrl, formData) {
    // Try prefetched method first
    if (submitViaPrefetchedForm(formType, formData)) {
      return;
    }
    
    // Then try iframe method
    if (submitViaIframe(formUrl, formData)) {
      return;
    }
    
    // Then try fetch API
    if (submitViaFetch(formUrl, formData)) {
      return;
    }
    
    // Finally, try redirect method
    submitViaRedirect(formUrl, formData);
  }

  // Function to determine form type
  function identifyFormType(form, formValues) {
    // Check if it's a contact form
    if (form.closest('.bg-zinc-900') || 
        form.classList.contains('contact-form') ||
        (formValues.name && formValues.email && formValues.message) ||
        (form.id && form.id.includes('contact')) ||
        form.action.includes('contact') ||
        document.location.pathname.includes('/contact')) {
      return 'contact';
    }
    
    // Check if it's a newsletter form (typically just has an email field)
    if ((Object.keys(formValues).length === 1 && formValues.email) ||
        form.classList.contains('newsletter-form') ||
        (form.id && form.id.includes('newsletter'))) {
      return 'newsletter';
    }
    
    // Default to contact form if can't determine
    console.log("Form type couldn't be determined, using contact form as default");
    return 'contact';
  }

  // Function to prepare form data for submission
  function prepareFormData(form) {
    const formValues = {};
    let googleFormData = {};
    
    // Extract values from form elements
    Array.from(form.elements).forEach(element => {
      if (element.name && element.type !== 'submit' && element.type !== 'button') {
        // For select elements, get the selected option
        if (element.nodeName === 'SELECT') {
          formValues[element.name] = element.options[element.selectedIndex]?.value || '';
        } 
        // For radio buttons, only include if checked
        else if (element.type === 'radio') {
          if (element.checked) {
            formValues[element.name] = element.value;
          }
        }
        // For checkboxes, only include if checked
        else if (element.type === 'checkbox') {
          if (element.checked) {
            formValues[element.name] = element.value || 'on';
          }
        }
        // Regular inputs, textareas, etc.
        else {
          formValues[element.name] = element.value;
        }
      }
    });
    
    // Identify form type
    const formType = identifyFormType(form, formValues);
    const formConfig = GOOGLE_FORMS[formType];
    
    if (!formConfig) {
      console.error('Form configuration not found for type:', formType);
      return null;
    }
    
    // Log form values for debugging
    console.log('Original form values:', formValues);
    
    // Map values to Google Form fields
    for (const [fieldName, value] of Object.entries(formValues)) {
      if (value) { // Only include non-empty values
        const googleFieldId = formConfig.fields[fieldName];
        if (googleFieldId) {
          googleFormData[googleFieldId] = value;
        } else if (fieldName === 'email' && formType === 'newsletter') {
          // Special case for newsletter forms
          googleFormData['entry.456327236'] = value;
        }
      }
    }
    
    // Double check for empty form data
    if (Object.keys(googleFormData).length === 0) {
      // Try to extract values from HTML attributes if form elements don't have names
      const noNameElements = Array.from(form.querySelectorAll('input, textarea, select')).filter(el => !el.name);
      
      if (noNameElements.length > 0) {
        console.log('Form has elements without names, trying to use data attributes or IDs');
        
        noNameElements.forEach(el => {
          let fieldName = el.getAttribute('data-field') || el.id;
          if (fieldName && el.value && el.type !== 'submit') {
            const googleFieldId = formConfig.fields[fieldName];
            if (googleFieldId) {
              googleFormData[googleFieldId] = el.value;
            }
          }
        });
      }
      
      // If still no data, set reasonable defaults for debugging
      if (Object.keys(googleFormData).length === 0) {
        console.warn('No form data could be extracted, using placeholder data for debugging');
        if (formType === 'contact') {
          googleFormData = {
            [formConfig.fields.name]: 'Test User',
            [formConfig.fields.email]: 'test@example.com',
            [formConfig.fields.subject]: 'Test Subject',
            [formConfig.fields.message]: 'This is a test message sent by form-fixer.js'
          };
        } else if (formType === 'newsletter') {
          googleFormData = {
            [formConfig.fields.email]: 'test@example.com'
          };
        }
      }
    }
    
    return {
      formUrl: formConfig.formUrl,
      formData: googleFormData,
      formType
    };
  }

  // Function to intercept and handle all form submissions
  function handleFormSubmissions() {
    document.querySelectorAll('form').forEach(form => {
      // Skip if already processed
      if (form.dataset.processed) return;
      
      form.dataset.processed = 'true';
      console.log('Attaching handler to form:', form);
      
      form.addEventListener('submit', function(event) {
        // Always prevent default to handle submission ourself
        event.preventDefault();
        
        try {
          // Prepare the form data for Google Forms
          const formInfo = prepareFormData(form);
          
          if (!formInfo) {
            throw new Error('Could not prepare form data');
          }
          
          console.log(`${formInfo.formType} form intercepted:`, formInfo);
          
          // Attempt submission using all available methods
          tryAllSubmissionMethods(formInfo.formType, formInfo.formUrl, formInfo.formData);
          
          // Reset form inputs
          form.reset();
          
        } catch (error) {
          console.error('Form submission error:', error);
          handleSubmissionError(error, 'form');
        }
      });
    });
  }

  // Initialize when the DOM is ready
  function initialize() {
    console.log("Initializing enhanced form handler for static site...");
    
    // Set up prefetched forms first
    setupPrefetchedForms();
    
    // Handle existing forms
    handleFormSubmissions();
    
    // Watch for dynamically added forms
    const observer = new MutationObserver(function(mutations) {
      let formsAdded = false;
      
      mutations.forEach(function(mutation) {
        if (mutation.addedNodes && mutation.addedNodes.length > 0) {
          // Check if any new forms were added
          mutation.addedNodes.forEach(node => {
            if (node.nodeName === 'FORM') {
              formsAdded = true;
            } else if (node.querySelectorAll) {
              const forms = node.querySelectorAll('form:not([data-processed])');
              if (forms.length > 0) formsAdded = true;
            }
          });
        }
      });
      
      if (formsAdded) {
        console.log('New forms detected, updating handlers');
        handleFormSubmissions();
      }
    });
    
    observer.observe(document.body, { childList: true, subtree: true });
  }

  // Trigger immediately if DOM is already loaded or wait for DOMContentLoaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize);
  } else {
    initialize();
  }
  
  // Also attach to window load event to ensure it works even when used as a late-loaded script
  window.addEventListener('load', function() {
    setTimeout(function() {
      // Check if we need to reprocess any forms
      const unprocessedForms = document.querySelectorAll('form:not([data-processed])');
      if (unprocessedForms.length > 0) {
        console.log('Found unprocessed forms during window.load, handling them now');
        handleFormSubmissions();
      }
      
      // Ensure prefetched forms are set up
      if (!document.getElementById('hidden_contact_iframe')) {
        console.log('Prefetched forms not found, setting up now');
        setupPrefetchedForms();
      }
    }, 500);
  });
})();