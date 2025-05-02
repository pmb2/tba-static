/**
 * Form Handler for The Backus Agency
 * Submits form data to n8n webhook endpoint
 */

// Initialize all forms when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  // Get all forms with the data-form-type attribute
  document.querySelectorAll('form[data-form-type]').forEach(setupForm);
});

/**
 * Set up a form with the webhook submission handler
 * @param {HTMLFormElement} form - The form element to set up
 */
function setupForm(form) {
  const formType = form.getAttribute('data-form-type');
  
  if (!formType) {
    console.error('Form is missing data-form-type attribute');
    return;
  }
  
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    
    // Validate the form fields
    if (!validateForm(form)) {
      return;
    }
    
    // Collect form data
    const formData = {};
    new FormData(form).forEach((value, key) => {
      formData[key] = value;
    });
    
    // Add timestamp and form type
    formData.submitted_at = new Date().toISOString();
    formData.form_type = formType;
    
    try {
      await submitFormToWebhook(formData);
      showSuccessMessage(form);
      form.reset();
    } catch (error) {
      console.error('Form submission error:', error);
      showErrorMessage(form, error.message);
    }
  });
}

/**
 * Validate form fields before submission
 * @param {HTMLFormElement} form - The form to validate
 * @returns {boolean} - Whether the form is valid
 */
function validateForm(form) {
  let isValid = true;
  
  // Check each required field
  form.querySelectorAll('[required]').forEach(field => {
    if (!field.value.trim()) {
      field.classList.add('error');
      isValid = false;
    } else {
      field.classList.remove('error');
    }
  });
  
  // Check email format if there is an email field
  const emailField = form.querySelector('input[type="email"]');
  if (emailField && emailField.value) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailField.value)) {
      emailField.classList.add('error');
      isValid = false;
    }
  }
  
  return isValid;
}

/**
 * Submit form data to n8n webhook
 * @param {Object} formData - Form data to submit
 */
async function submitFormToWebhook(formData) {
  const webhookUrl = 'https://n8n.backus.agency/webhook/form_filled';
  
  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    });
    
    if (!response.ok) {
      throw new Error(`Server responded with ${response.status}: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error submitting form:', error);
    throw new Error('Failed to submit form. Please try again later.');
  }
}

/**
 * Show a success message after form submission
 * @param {HTMLFormElement} form - The form that was submitted
 */
function showSuccessMessage(form) {
  // Check if there's already a message container
  let messageContainer = form.querySelector('.form-message');
  
  if (!messageContainer) {
    // Create a message container if it doesn't exist
    messageContainer = document.createElement('div');
    messageContainer.className = 'form-message';
    form.appendChild(messageContainer);
  }
  
  // Show success message
  messageContainer.innerHTML = '<p class="success">Thank you for your submission! We\'ll be in touch soon.</p>';
  messageContainer.style.display = 'block';
  
  // Hide the message after 5 seconds
  setTimeout(() => {
    messageContainer.style.display = 'none';
  }, 5000);
}

/**
 * Show an error message if form submission fails
 * @param {HTMLFormElement} form - The form with the error
 * @param {string} errorMessage - The error message to display
 */
function showErrorMessage(form, errorMessage) {
  // Check if there's already a message container
  let messageContainer = form.querySelector('.form-message');
  
  if (!messageContainer) {
    // Create a message container if it doesn't exist
    messageContainer = document.createElement('div');
    messageContainer.className = 'form-message';
    form.appendChild(messageContainer);
  }
  
  // Show error message
  messageContainer.innerHTML = `<p class="error">There was a problem submitting the form: ${errorMessage}</p>`;
  messageContainer.style.display = 'block';
}
