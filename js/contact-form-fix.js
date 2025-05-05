/**
 * Direct Contact Form Fix
 * This script directly patches the contact form to ensure proper handling
 */
(function() {
  console.log('Contact form fix loaded - direct patching of contact form');
  
  // Function to handle the contact form specifically
  function fixContactForm() {
    console.log('Looking for contact form to fix');
    
    // Find the contact form
    const contactForm = document.getElementById('contact-form');
    if (!contactForm) {
      console.log('Contact form not found, will try again later');
      return;
    }
    
    console.log('Found contact form, applying direct fix');
    
    // Remove any existing action or target
    contactForm.removeAttribute('action');
    contactForm.removeAttribute('target');
    
    // Flag to prevent multiple handlers
    if (contactForm.getAttribute('data-direct-fix-applied')) {
      console.log('Direct fix already applied to contact form');
      return;
    }
    
    contactForm.setAttribute('data-direct-fix-applied', 'true');
    
    // Clean out any existing event listeners by cloning
    const newForm = contactForm.cloneNode(true);
    contactForm.parentNode.replaceChild(newForm, contactForm);
    
    // Get the new form reference
    const form = document.getElementById('contact-form');
    console.log('Form replaced to clear event listeners');
    
    // Find the subject dropdown
    const subjectDropdown = form.querySelector('#subject');
    if (subjectDropdown) {
      console.log('Found subject dropdown:', subjectDropdown);
      
      // Make sure it has no event listeners that might interfere
      const newSubject = subjectDropdown.cloneNode(true);
      subjectDropdown.parentNode.replaceChild(newSubject, subjectDropdown);
      
      // Add an event listener to log when the subject changes
      document.getElementById('subject').addEventListener('change', function(e) {
        console.log('Subject changed to:', e.target.value);
      });
    } else {
      console.warn('Subject dropdown not found!');
    }
    
    // Find the form message container
    const messageContainer = form.querySelector('.form-message');
    if (messageContainer) {
      console.log('Found message container:', messageContainer);
    } else {
      console.warn('Message container not found!');
      // Create one if it doesn't exist
      const msgContainer = document.createElement('div');
      msgContainer.className = 'form-message';
      msgContainer.style.display = 'none';
      form.appendChild(msgContainer);
      console.log('Created message container');
    }
    
    // Add direct submit handler
    form.addEventListener('submit', function(event) {
      console.log('Contact form submit intercepted');
      event.preventDefault();
      event.stopPropagation();
      
      // Collect form data manually to ensure we get everything
      const formData = {};
      
      // First, manually extract each input by name/id
      const firstName = form.querySelector('#firstName');
      const lastName = form.querySelector('#lastName');
      const email = form.querySelector('#email');
      const phone = form.querySelector('#phone');
      const subject = form.querySelector('#subject');
      const message = form.querySelector('#message');
      
      if (firstName) formData.firstName = firstName.value;
      if (lastName) formData.lastName = lastName.value;
      if (email) formData.email = email.value;
      if (phone) formData.phone = phone.value;
      if (message) formData.message = message.value;
      
      // Special handling for subject
      if (subject && subject.options && subject.selectedIndex >= 0) {
        formData.subject = subject.options[subject.selectedIndex].value;
        console.log('Subject value captured:', formData.subject);
      } else if (subject) {
        formData.subject = subject.value;
        console.log('Subject direct value:', formData.subject);
      }
      
      // Also iterate through all form elements as a backup
      for (let i = 0; i < form.elements.length; i++) {
        const element = form.elements[i];
        if (element.name && element.value && !formData[element.name]) {
          if (element.nodeName === 'SELECT') {
            try {
              formData[element.name] = element.options[element.selectedIndex].value;
              console.log(`Select element ${element.name} value: ${formData[element.name]}`);
            } catch (e) {
              formData[element.name] = element.value;
              console.error('Error getting select value:', e);
            }
          } else {
            formData[element.name] = element.value;
          }
        }
      }
      
      // Add metadata
      formData.submitted_at = new Date().toISOString();
      formData.form_type = 'contact';
      formData.page_url = window.location.href;
      
      console.log('Submitting contact form data:', formData);
      
      // Show a loading state
      const messageContainer = form.querySelector('.form-message');
      if (messageContainer) {
        messageContainer.innerHTML = '<div style="padding: 12px; background-color: rgba(52, 152, 219, 0.2); border: 1px solid rgba(52, 152, 219, 0.5); border-radius: 6px; color: white; margin-top: 16px;">Submitting your form...</div>';
        messageContainer.style.display = 'block';
      }
      
      // Submit to webhook
      fetch('https://n8n.backus.agency/webhook/form_filled', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      })
      .then(response => {
        console.log('Response status:', response.status);
        if (!response.ok) {
          throw new Error(`Server responded with ${response.status}: ${response.statusText}`);
        }
        return response.json();
      })
      .then(data => {
        console.log('Webhook submission successful:', data);
        
        // Show success message
        if (messageContainer) {
          messageContainer.innerHTML = '<div style="padding: 12px; background-color: rgba(46, 204, 113, 0.2); border: 1px solid rgba(46, 204, 113, 0.5); border-radius: 6px; color: white; margin-top: 16px;">Thank you! Your form has been submitted successfully.</div>';
          messageContainer.style.display = 'block';
          
          // Ensure visibility of message container
          messageContainer.scrollIntoView({ behavior: 'smooth' });
          
          // Hide after 5 seconds
          setTimeout(() => {
            messageContainer.style.display = 'none';
          }, 5000);
        } else {
          // Fallback to alert if no message container
          alert('Thank you! Your form has been submitted successfully.');
        }
        
        // Reset the form
        form.reset();
      })
      .catch(error => {
        console.error('Webhook submission error:', error);
        
        // Show error message
        if (messageContainer) {
          messageContainer.innerHTML = '<div style="padding: 12px; background-color: rgba(231, 76, 60, 0.2); border: 1px solid rgba(231, 76, 60, 0.5); border-radius: 6px; color: white; margin-top: 16px;">There was a problem submitting the form: ' + error.message + '</div>';
          messageContainer.style.display = 'block';
          
          // Ensure visibility of error message
          messageContainer.scrollIntoView({ behavior: 'smooth' });
        } else {
          // Fallback to alert if no message container
          alert('There was a problem submitting the form: ' + error.message);
        }
      });
      
      return false;
    });
    
    console.log('Direct contact form fix applied successfully');
  }
  
  // Try to fix the form immediately if the document is already loaded
  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    fixContactForm();
  }
  
  // Also try on DOMContentLoaded
  document.addEventListener('DOMContentLoaded', fixContactForm);
  
  // And on window load
  window.addEventListener('load', fixContactForm);
  
  // Also retry after a short delay for good measure
  setTimeout(fixContactForm, 1000);
  setTimeout(fixContactForm, 2000);
})();