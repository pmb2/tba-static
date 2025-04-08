// TBA Form Fixer - Static Site Edition
// This script is specifically designed to work with static sites hosted on GitHub Pages
// It fixes form submissions to Google Forms by capturing form submissions,
// resolving CORS issues, and providing user feedback

(function() {
  console.log("Form Fixer for Static Sites loaded!");

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
    // Create a hidden iframe to handle the submission
    const iframe = document.createElement('iframe');
    iframe.name = 'hidden_iframe';
    iframe.id = 'hidden_iframe';
    iframe.style.display = 'none';
    document.body.appendChild(iframe);

    // Create a form element and submit it in the iframe
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = formUrl;
    form.target = 'hidden_iframe';

    // Add form data
    for (const key in formData) {
      if (formData.hasOwnProperty(key)) {
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
    form.submit();
    
    // Show success message and clean up after submission
    setTimeout(() => {
      if (iframe && iframe.parentNode) {
        document.body.removeChild(iframe);
      }
      if (form && form.parentNode) {
        document.body.removeChild(form);
      }
      displaySuccessMessage();
    }, 1000);
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
      form.addEventListener('submit', function(event) {
        event.preventDefault();
        
        try {
          const formInfo = prepareFormData(form);
          
          if (!formInfo) {
            throw new Error('Could not prepare form data');
          }
          
          // Submit form data
          submitViaIframe(formInfo.formUrl, formInfo.formData);
          
          // Reset form
          form.reset();
          
          console.log(`${formInfo.formType} form submitted successfully`);
        } catch (error) {
          handleSubmissionError(error, 'form');
        }
      });
    });
  }

  // Initialize when the DOM is ready
  function initialize() {
    console.log("Initializing form handler for static site...");
    handleFormSubmissions();
  }

  // Trigger immediately if DOM is already loaded or wait for DOMContentLoaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize);
  } else {
    initialize();
  }
  
  // Backup: also attach to window load event to ensure it works even when used as a late-loaded script
  window.addEventListener('load', function() {
    if (!document.querySelector('form')) {
      console.log("No forms found on initial load. Checking again...");
      setTimeout(handleFormSubmissions, 1000); // Try again after a delay
    }
  });
})();