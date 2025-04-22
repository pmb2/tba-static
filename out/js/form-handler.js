/**
 * Form Handler for GitHub Pages
 * Submits form data by creating GitHub issues that trigger workflow actions
 */

// Initialize all forms when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  // Get all forms with the data-form-type attribute
  document.querySelectorAll('form[data-form-type]').forEach(setupForm);
});

/**
 * Set up a form with the GitHub issue-based submission handler
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
    
    // Add timestamp
    formData.submitted_at = new Date().toISOString();
    
    try {
      await submitFormAsGitHubIssue(formType, formData);
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
 * Submit form data by creating a GitHub issue
 * @param {string} formType - Type of form (contact, newsletter, etc.)
 * @param {Object} formData - Form data to submit
 */
async function submitFormAsGitHubIssue(formType, formData) {
  // Get repository information from meta tags
  const repoOwner = document.querySelector('meta[name="github-repo-owner"]')?.content;
  const repoName = document.querySelector('meta[name="github-repo-name"]')?.content;
  
  if (!repoOwner || !repoName) {
    throw new Error('Repository information is missing. Add meta tags for github-repo-owner and github-repo-name.');
  }
  
  // Format the data as YAML for the issue body
  const formDataYaml = Object.entries(formData)
    .map(([key, value]) => `${key}: ${typeof value === 'string' ? `"${value}"` : value}`)
    .join('\n');
  
  // Create GitHub issue via endpoint
  const issueUrl = `https://github.com/${repoOwner}/${repoName}/issues/new`;
  
  // Format issue data
  const issueData = {
    title: `Form Submission: ${formType} Form`,
    body: formDataYaml,
    labels: ['form-submission', formType]
  };

  // Open a new window to create the issue
  // We're using this approach because GitHub's API requires authentication
  // This will ask the user to login to GitHub and create the issue
  const issueParams = new URLSearchParams({
    title: issueData.title,
    body: issueData.body,
    labels: issueData.labels.join(',')
  });

  window.open(`${issueUrl}?${issueParams.toString()}`, '_blank');
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
