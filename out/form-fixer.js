// TBA Form Fixer - Static Site Edition
// This script is specifically designed to work with static sites hosted on GitHub Pages
// It fixes form submissions to Google Forms by capturing form submissions,
// resolving CORS issues, and providing user feedback

(function() {
  console.log("Form Fixer for Static Sites loaded - v2!");

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

  // Function to create an iframe for submission (avoids CORS issues)
  function submitViaIframe(formUrl, formData) {
    try {
      // Create a hidden iframe to handle the submission
      const iframe = document.createElement('iframe');
      iframe.name = 'hidden_iframe_' + Math.floor(Math.random() * 1000);
      iframe.id = iframe.name;
      iframe.style.display = 'none';
      document.body.appendChild(iframe);

      // Create a form element and submit it in the iframe
      const form = document.createElement('form');
      form.method = 'POST';
      form.action = formUrl;
      form.target = iframe.name;
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

      // Log for debugging
      console.log(`Submitting to: ${formUrl}`, formData);
      
      // Add to DOM, submit, and remove
      document.body.appendChild(form);
      
      // Add a success listener to the iframe
      iframe.addEventListener('load', function() {
        console.log('Form submission completed');
        displaySuccessMessage();
        
        // Clean up after submission with a delay
        setTimeout(() => {
          if (iframe && iframe.parentNode) {
            document.body.removeChild(iframe);
          }
          if (form && form.parentNode) {
            document.body.removeChild(form);
          }
        }, 1000);
      });
      
      form.submit();
    } catch (error) {
      console.error('Error during form submission:', error);
      handleSubmissionError(error, 'form');
    }
  }

  // Direct form submission as backup method
  function submitDirectly(formUrl, formData) {
    try {
      const params = new URLSearchParams();
      
      for (const key in formData) {
        if (formData.hasOwnProperty(key) && formData[key]) {
          params.append(key, formData[key]);
        }
      }
      
      console.log('Using direct submission method');
      
      fetch(formUrl, {
        method: 'POST',
        mode: 'no-cors', // This is important for cross-origin requests
        cache: 'no-cache',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params.toString()
      })
      .then(() => {
        console.log('Form submitted successfully via fetch');
        displaySuccessMessage();
      })
      .catch(error => {
        console.error('Error in direct submission:', error);
        // Fall back to window.open method
        submitViaRedirect(formUrl, formData);
      });
    } catch (error) {
      console.error('Error setting up direct submission:', error);
      // Fall back to window.open method
      submitViaRedirect(formUrl, formData);
    }
  }

  // Last resort method - redirect in new tab
  function submitViaRedirect(formUrl, formData) {
    try {
      // Build query string
      const queryParams = [];
      for (const key in formData) {
        if (formData.hasOwnProperty(key) && formData[key]) {
          queryParams.push(`${encodeURIComponent(key)}=${encodeURIComponent(formData[key])}`);
        }
      }
      
      const fullUrl = `${formUrl}?${queryParams.join('&')}`;
      console.log('Using redirect submission method:', fullUrl);
      
      // Open in a new tab but keep focus on current page
      const newTab = window.open('', '_blank');
      if (newTab) {
        newTab.location.href = fullUrl;
        setTimeout(() => {
          displaySuccessMessage();
        }, 500);
      } else {
        console.warn('Pop-up blocked. Trying direct location change');
        // Create a temporary form and submit it in a new window
        const tempForm = document.createElement('form');
        tempForm.method = 'GET';
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
        
        document.body.appendChild(tempForm);
        tempForm.submit();
        document.body.removeChild(tempForm);
        displaySuccessMessage();
      }
    } catch (error) {
      console.error('All submission methods failed:', error);
      handleSubmissionError(error, 'all methods');
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

  // Function to determine form type
  function identifyFormType(form, formValues) {
    // Check if it's a contact form (has name, email, message fields or is in a container with bg-zinc-900 class)
    if (form.closest('.bg-zinc-900') || 
        (formValues.name && formValues.email && formValues.message) ||
        (form.id && form.id.includes('contact'))) {
      return 'contact';
    }
    
    // Check if it's a newsletter form (just has an email field)
    if (Object.keys(formValues).length === 1 && formValues.email) {
      return 'newsletter';
    }
    
    // Default to contact form if can't determine
    console.log("Form type couldn't be determined, using contact form as default");
    return 'contact';
  }

  // Function to prepare form data for submission
  function prepareFormData(form) {
    const formValues = {};
    const formData = {};
    
    // Extract values from form elements
    Array.from(form.elements).forEach(element => {
      if (element.name && element.value && element.type !== 'submit') {
        formValues[element.name] = element.value;
      }
    });
    
    // Identify form type
    const formType = identifyFormType(form, formValues);
    const formConfig = GOOGLE_FORMS[formType];
    
    if (!formConfig) {
      console.error('Form configuration not found for type:', formType);
      return null;
    }
    
    // Map values to Google Form fields
    for (const [fieldName, value] of Object.entries(formValues)) {
      const googleFieldId = formConfig.fields[fieldName];
      if (googleFieldId) {
        formData[googleFieldId] = value;
      } else if (fieldName === 'email' && formType === 'newsletter') {
        // Special case for newsletter forms
        formData['entry.456327236'] = value;
      }
    }
    
    return {
      formUrl: formConfig.formUrl,
      formData,
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
        event.preventDefault();
        
        try {
          const formInfo = prepareFormData(form);
          
          if (!formInfo) {
            throw new Error('Could not prepare form data');
          }
          
          console.log(`${formInfo.formType} form intercepted:`, formInfo);
          
          // Try iframe submission first
          submitViaIframe(formInfo.formUrl, formInfo.formData);
          
          // Reset form
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
    console.log("Initializing form handler for static site...");
    handleFormSubmissions();
    
    // Watch for dynamically added forms
    const observer = new MutationObserver(function(mutations) {
      mutations.forEach(function(mutation) {
        if (mutation.addedNodes && mutation.addedNodes.length > 0) {
          // Check if any new forms were added
          let formsAdded = false;
          mutation.addedNodes.forEach(node => {
            if (node.nodeName === 'FORM') {
              formsAdded = true;
            } else if (node.querySelectorAll) {
              const forms = node.querySelectorAll('form:not([data-processed])');
              if (forms.length > 0) formsAdded = true;
            }
          });
          
          if (formsAdded) {
            console.log('New forms detected, updating handlers');
            handleFormSubmissions();
          }
        }
      });
    });
    
    observer.observe(document.body, { childList: true, subtree: true });
  }

  // Trigger immediately if DOM is already loaded or wait for DOMContentLoaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize);
  } else {
    initialize();
  }
  
  // Backup: also attach to window load event to ensure it works even when used as a late-loaded script
  window.addEventListener('load', function() {
    setTimeout(handleFormSubmissions, 500); // Try again after a delay
  });
})();