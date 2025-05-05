/**
 * Emergency Direct Form Fix - Last Resort Solution
 * This overrides all form handling for the contact form
 */

// Execute immediately
(function() {
  console.log('[DIRECT FIX] Starting emergency form fix');
  
  // Force immediate execution on page load
  window.addEventListener('load', emergencyFormFix);
  window.addEventListener('DOMContentLoaded', emergencyFormFix);
  document.addEventListener('DOMContentLoaded', emergencyFormFix);
  
  // Also try immediately
  setTimeout(emergencyFormFix, 0);
  setTimeout(emergencyFormFix, 100);
  setTimeout(emergencyFormFix, 500);
  setTimeout(emergencyFormFix, 1000);
  setTimeout(emergencyFormFix, 2000);
  
  function emergencyFormFix() {
    // Find the contact form
    console.log('[DIRECT FIX] Looking for contact form');
    const form = document.getElementById('contact-form');
    if (!form) {
      console.log('[DIRECT FIX] Form not found yet, will retry');
      return; 
    }
    
    // Check if we already applied the fix
    if (form.getAttribute('data-emergency-fix-applied')) {
      console.log('[DIRECT FIX] Emergency fix already applied');
      return;
    }
    
    console.log('[DIRECT FIX] Found contact form, applying emergency fix');
    
    // Flag that we've applied the fix
    form.setAttribute('data-emergency-fix-applied', 'true');
    
    // Find the submit button and subject dropdown for direct access
    const submitBtn = form.querySelector('button[type="submit"]');
    const subjectDropdown = form.querySelector('#subject');
    
    // Ensure the message container exists
    let messageContainer = form.querySelector('.form-message');
    if (!messageContainer) {
      console.log('[DIRECT FIX] Creating message container');
      messageContainer = document.createElement('div');
      messageContainer.className = 'form-message';
      form.appendChild(messageContainer);
    }
    
    // Make sure we can find the message container
    messageContainer.setAttribute('id', 'emergency-message-container');
    messageContainer.style.marginTop = '20px';
    
    // Add direct click handler to the submit button
    if (submitBtn) {
      console.log('[DIRECT FIX] Adding direct click handler to submit button');
      
      // Clone to remove existing handlers
      const newSubmitBtn = submitBtn.cloneNode(true);
      submitBtn.parentNode.replaceChild(newSubmitBtn, submitBtn);
      
      // Add our direct handler
      newSubmitBtn.addEventListener('click', function(event) {
        event.preventDefault();
        event.stopPropagation();
        console.log('[DIRECT FIX] Submit button clicked, handling submission directly');
        
        // Collect form data
        const formData = {};
        
        // Get all input fields by ID with direct DOM access
        const firstNameInput = document.getElementById('firstName');
        const lastNameInput = document.getElementById('lastName');
        const emailInput = document.getElementById('email');
        const phoneInput = document.getElementById('phone');
        const messageInput = document.getElementById('message');
        const subjectSelect = document.getElementById('subject');
        
        // Gather the data
        if (firstNameInput) formData.firstName = firstNameInput.value;
        if (lastNameInput) formData.lastName = lastNameInput.value;
        if (emailInput) formData.email = emailInput.value;
        if (phoneInput) formData.phone = phoneInput.value;
        if (messageInput) formData.message = messageInput.value;
        
        // Special handling for subject dropdown
        if (subjectSelect && subjectSelect.options && subjectSelect.selectedIndex >= 0) {
          formData.subject = subjectSelect.options[subjectSelect.selectedIndex].value;
          console.log('[DIRECT FIX] Subject value:', formData.subject);
          
          // Alert for debugging
          if (!formData.subject) {
            alert('ERROR: Subject is empty! selectedIndex=' + subjectSelect.selectedIndex);
          }
        }
        
        // Add metadata
        formData.submitted_at = new Date().toISOString();
        formData.form_type = 'contact';
        formData.submission_method = 'emergency_direct_fix';
        
        console.log('[DIRECT FIX] Submitting form data:', formData);
        
        // Show loading state
        messageContainer.innerHTML = '<div style="padding: 12px; background-color: rgba(52, 152, 219, 0.2); border: 1px solid rgba(52, 152, 219, 0.5); border-radius: 6px; color: white; margin-top: 16px;">Submitting your form...</div>';
        messageContainer.style.display = 'block';
        
        // Submit to webhook with raw XHR for maximum compatibility
        const xhr = new XMLHttpRequest();
        xhr.open('POST', 'https://n8n.backus.agency/webhook/form_filled', true);
        xhr.setRequestHeader('Content-Type', 'application/json');
        
        xhr.onload = function() {
          if (xhr.status >= 200 && xhr.status < 300) {
            console.log('[DIRECT FIX] Submission successful:', xhr.responseText);
            
            // Show success message
            messageContainer.innerHTML = '<div style="padding: 12px; background-color: rgba(46, 204, 113, 0.2); border: 1px solid rgba(46, 204, 113, 0.5); border-radius: 6px; color: white; margin-top: 16px; font-weight: bold;">Thank you! Your message has been sent successfully.</div>';
            messageContainer.style.display = 'block';
            
            // Clear form
            form.reset();
            
            // Alert for debugging in case message container is hidden
            console.log('[DIRECT FIX] Submission successful');
          } else {
            console.error('[DIRECT FIX] Error submitting form:', xhr.status, xhr.statusText);
            
            // Show error message
            messageContainer.innerHTML = '<div style="padding: 12px; background-color: rgba(231, 76, 60, 0.2); border: 1px solid rgba(231, 76, 60, 0.5); border-radius: 6px; color: white; margin-top: 16px;">Error submitting form: ' + xhr.status + ' ' + xhr.statusText + '</div>';
            messageContainer.style.display = 'block';
            
            // Alert for debugging in case message container is hidden
            console.log('[DIRECT FIX] Submission failed');
          }
        };
        
        xhr.onerror = function() {
          console.error('[DIRECT FIX] Network error with form submission');
          
          // Show error message
          messageContainer.innerHTML = '<div style="padding: 12px; background-color: rgba(231, 76, 60, 0.2); border: 1px solid rgba(231, 76, 60, 0.5); border-radius: 6px; color: white; margin-top: 16px;">Network error when submitting form. Please try again later.</div>';
          messageContainer.style.display = 'block';
        };
        
        // Send the data
        xhr.send(JSON.stringify(formData));
        
        return false;
      });
    } else {
      console.error('[DIRECT FIX] Submit button not found!');
    }
    
    // Direct fix for the subject dropdown visibility
    if (subjectDropdown) {
      console.log('[DIRECT FIX] Found subject dropdown, ensuring it works correctly');
      
      // Make sure the dropdown is visible and styled properly
      subjectDropdown.style.display = 'block';
      subjectDropdown.style.visibility = 'visible';
      subjectDropdown.style.opacity = '1';
      
      // Force the dropdown to show its options when clicked
      subjectDropdown.addEventListener('click', function(e) {
        console.log('[DIRECT FIX] Subject dropdown clicked');
        
        // Try to ensure the dropdown opens
        subjectDropdown.focus();
        
        // Log current value
        if (subjectDropdown.selectedIndex >= 0) {
          console.log('[DIRECT FIX] Current subject value:', 
            subjectDropdown.options[subjectDropdown.selectedIndex].value);
        }
      });
      
      // Log when value changes
      subjectDropdown.addEventListener('change', function(e) {
        console.log('[DIRECT FIX] Subject dropdown changed to:', 
          subjectDropdown.options[subjectDropdown.selectedIndex].value);
      });
    } else {
      console.error('[DIRECT FIX] Subject dropdown not found!');
    }
    
    // Also completely override the main form submit event
    const newForm = form.cloneNode(true);
    form.parentNode.replaceChild(newForm, form);
    
    // Add our direct handler to the new form
    document.getElementById('contact-form').addEventListener('submit', function(event) {
      event.preventDefault();
      event.stopPropagation();
      console.log('[DIRECT FIX] Form submit event captured');
      
      // Trigger a click on the submit button to use our handler
      const submitBtn = this.querySelector('button[type="submit"]');
      if (submitBtn) {
        submitBtn.click();
      }
      
      return false;
    });
    
    console.log('[DIRECT FIX] Emergency form fix applied successfully');
  }
})();