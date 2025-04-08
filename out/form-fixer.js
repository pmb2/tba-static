// TBA Form Fixer 
// This script fixes form submissions to Google Forms by capturing form submissions, 
// fixing the CORS issue with Google Forms, and providing debugging information.

(function() {
  console.log("Form Fixer script loaded!");

  // Function to create an iframe to handle the form submission
  function createSubmissionFrame(formUrl, formData) {
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

    // Append form to body, submit it, and remove it
    document.body.appendChild(form);
    console.log("Submitting form to: " + formUrl, formData);
    form.submit();
    
    // Show success message
    setTimeout(() => {
      document.body.removeChild(form);
      showSuccessMessage();
    }, 1000);
  }

  // Function to show success message
  function showSuccessMessage() {
    const messageElement = document.createElement('div');
    messageElement.style.position = 'fixed';
    messageElement.style.top = '20px';
    messageElement.style.left = '50%';
    messageElement.style.transform = 'translateX(-50%)';
    messageElement.style.backgroundColor = '#4CAF50';
    messageElement.style.color = 'white';
    messageElement.style.padding = '15px 30px';
    messageElement.style.borderRadius = '5px';
    messageElement.style.zIndex = '1000';
    messageElement.style.boxShadow = '0 4px 8px rgba(0,0,0,0.2)';
    messageElement.textContent = 'Form submitted successfully!';
    
    document.body.appendChild(messageElement);
    
    setTimeout(() => {
      document.body.removeChild(messageElement);
    }, 5000);
  }

  // Handle form submissions
  function interceptFormSubmit() {
    // Get all forms in the document
    const forms = document.querySelectorAll('form');
    
    forms.forEach(form => {
      form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Get form values
        const formData = {};
        const formElements = form.elements;
        
        for (let i = 0; i < formElements.length; i++) {
          const element = formElements[i];
          if (element.name && element.value && element.type !== 'submit') {
            // Map the fields
            switch(element.name) {
              case 'name':
                formData['entry.166753821'] = element.value;
                break;
              case 'email':
                formData['entry.954130076'] = element.value;
                break;  
              case 'phone':
                formData['entry.1263452350'] = element.value;
                break;
              case 'subject':
                formData['entry.1134801428'] = element.value;
                break;
              case 'message':
                formData['entry.1503383050'] = element.value;
                break;
              default:
                // If it's a newsletter form just for email
                if (element.type === 'email') {
                  formData['entry.456327236'] = element.value;
                }
                break;
            }
          }
        }
        
        // Determine which form is being submitted
        let googleFormUrl;
        
        // Check if it's the contact form (in contact page)
        if (form.closest('.bg-zinc-900')) {
          googleFormUrl = 'https://docs.google.com/forms/d/e/1FAIpQLSf9FbCGxDu8BegwDLa9qiLu4mFm4MSilBkoTEo5qWVH-EpS-g/formResponse';
          console.log("Contact form intercepted!");
        } 
        // If this is a newsletter form (just has an email field)
        else if (Object.keys(formData).length === 1 && formData['entry.456327236']) {
          googleFormUrl = 'https://docs.google.com/forms/d/e/1FAIpQLSe5jZ0lDVHf0o5-1T7eJt9vkRk-sYvwNjbcGkBuqP5I09H7ig/formResponse';
          console.log("Newsletter form intercepted!");
        }
        // Default to contact form if can't determine
        else {
          googleFormUrl = 'https://docs.google.com/forms/d/e/1FAIpQLSf9FbCGxDu8BegwDLa9qiLu4mFm4MSilBkoTEo5qWVH-EpS-g/formResponse';
          console.log("Unidentified form intercepted, using default form URL");
        }
        
        // Submit the form through iframe
        createSubmissionFrame(googleFormUrl, formData);
        
        // Clear the form
        form.reset();
      });
    });
  }

  // Call the function when the DOM is loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', interceptFormSubmit);
  } else {
    interceptFormSubmit();
  }
})();