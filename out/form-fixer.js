/**
 * Form Fixer Script for GitHub Pages Static Sites
 * Redirects form submissions to create GitHub issues for handling by GitHub Actions
 */

(function() {
  console.log("Form handler v2 loaded with Microsoft Edge compatibility");
  
  // Detect browser
  const isMSBrowser = /Edge|MSIE|Trident/.test(navigator.userAgent);
  if (isMSBrowser) {
    console.log("Microsoft browser detected, applying compatibility fixes");
  }

  console.log("GitHub Issues Form Handler loaded - v1.0");

  // Helper function to add message containers to forms
  function addMessageContainer(form) {
    let messageContainer = form.querySelector('.form-message');
    if (!messageContainer) {
      messageContainer = document.createElement('div');
      messageContainer.className = 'form-message';
      messageContainer.style.display = 'none';
      messageContainer.style.padding = '15px';
      messageContainer.style.margin = '15px 0';
      messageContainer.style.borderRadius = '5px';
      form.appendChild(messageContainer);
    }
    return messageContainer;
  }

  // Helper function to show success message
  function showSuccessMessage(form) {
    const messageContainer = addMessageContainer(form);
    messageContainer.style.backgroundColor = 'rgba(0, 255, 0, 0.1)';
    messageContainer.style.border = '1px solid rgba(0, 255, 0, 0.3)';
    messageContainer.innerHTML = '<p style="margin: 0; color: #00b300;">Thank you for your submission! We\'ll be in touch soon.</p>';
    messageContainer.style.display = 'block';
    
    // Hide the message after 5 seconds
    setTimeout(() => {
      messageContainer.style.display = 'none';
    }, 5000);
  }

  // Helper function to show error message
  function showErrorMessage(form, message) {
    const messageContainer = addMessageContainer(form);
    messageContainer.style.backgroundColor = 'rgba(255, 0, 0, 0.1)';
    messageContainer.style.border = '1px solid rgba(255, 0, 0, 0.3)';
    messageContainer.innerHTML = `<p style="margin: 0; color: #b30000;">Error: ${message}</p>`;
    messageContainer.style.display = 'block';
  }

  // Helper function to validate form fields
  function validateForm(form) {
    let isValid = true;
    
    // Check all required fields
    form.querySelectorAll('[required]').forEach(field => {
      if (!field.value.trim()) {
        field.style.borderColor = 'red';
        isValid = false;
      } else {
        field.style.borderColor = '';
      }
    });
    
    // Validate email fields
    form.querySelectorAll('input[type="email"]').forEach(emailField => {
      if (emailField.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailField.value)) {
        emailField.style.borderColor = 'red';
        isValid = false;
      }
    });
    
    return isValid;
  }

  // Function to determine form type from form element
  function determineFormType(form) {
    // First check for explicit data-form-type attribute
    let formType = form.getAttribute('data-form-type');
    if (formType) return formType;
    
    // Then check class names
    if (form.classList.contains('newsletter-form')) {
      return 'newsletter';
    }
    
    // Then check for form structure
    if (form.querySelector('textarea[name="message"]') || 
        (form.querySelector('input[name="name"]') && form.querySelector('input[name="email"]'))) {
      return 'contact';
    }
    
    // Then check page URL
    if (window.location.pathname.includes('/contact')) {
      return 'contact';
    }
    
    // Default to contact if unknown
    return 'contact';
  }

  // Get GitHub repository info from meta tags
  function getRepoInfo() {
    const owner = document.querySelector('meta[name="github-repo-owner"]')?.content;
    const repo = document.querySelector('meta[name="github-repo-name"]')?.content;
    
    if (!owner || !repo) {
      console.error('Repository information missing. Add meta tags for github-repo-owner and github-repo-name.');
      return null;
    }
    
    return { owner, repo };
  }

  // Submit form data as a GitHub issue
  function submitFormAsGitHubIssue(form, formData) {
    const repoInfo = getRepoInfo();
    if (!repoInfo) {
      showErrorMessage(form, 'Repository information is missing. Please contact the site administrator.');
      return false;
    }
    
    const formType = determineFormType(form);
    
    // Format the data as YAML for the issue body
    const formDataYaml = Object.entries(formData)
      .map(([key, value]) => `${key}: ${typeof value === 'string' ? `"${value}"` : value}`)
      .join('\n');
    
    // Create GitHub issue URL
    const issueUrl = `https://github.com/${repoInfo.owner}/${repoInfo.repo}/issues/new`;
    
    // Format issue params
    const issueParams = new URLSearchParams({
      title: `Form Submission: ${formType.charAt(0).toUpperCase() + formType.slice(1)} Form`,
      body: formDataYaml,
      labels: `form-submission,${formType}`
    });

    // Open a new window to create the issue
    window.open(`${issueUrl}?${issueParams.toString()}`, '_blank');
    
    return true;
  }

  // Function to handle form submission
  function handleFormSubmission(event) {
    event.preventDefault();
    const form = event.target;
    
    // Validate form
    if (!validateForm(form)) {
      showErrorMessage(form, 'Please fill out all required fields correctly.');
      return;
    }
    
    // Collect form data
    const formData = {};
    new FormData(form).forEach((value, key) => {
      formData[key] = value;
    });
    
    // Add timestamp
    formData.submitted_at = new Date().toISOString();
    
    console.log(`Form submission intercepted:`, formData);
    
    // Submit to GitHub issues
    if (submitFormAsGitHubIssue(form, formData)) {
      showSuccessMessage(form);
      form.reset();
    }
  }

  // Attach handlers to all forms
  function attachFormHandlers() {
    document.querySelectorAll('form').forEach(form => {
      // Skip if already handled
      if (form.getAttribute('data-github-handler')) return;
      
      form.setAttribute('data-github-handler', 'true');
      
      // Check if we're missing the form-type
      if (!form.hasAttribute('data-form-type')) {
        const formType = determineFormType(form);
        form.setAttribute('data-form-type', formType);
      }
      
      // Setup message container
      addMessageContainer(form);
      
      // Attach submit handler
      form.addEventListener('submit', handleFormSubmission);
      
      console.log(`Form handler attached to:`, form);
    });
  }

  // Initialize when DOM is ready
  function initialize() {
    // Check for repository information
    const repoInfo = getRepoInfo();
    if (!repoInfo) {
      console.error('GitHub repository information missing. Add meta tags:');
      console.error('<meta name="github-repo-owner" content="YOUR_GITHUB_USERNAME">');
      console.error('<meta name="github-repo-name" content="YOUR_REPO_NAME">');
      return;
    }
    
    console.log(`GitHub Issues Form Handler initialized for ${repoInfo.owner}/${repoInfo.repo}`);
    
    // Attach handlers to existing forms
    attachFormHandlers();
    
    // Watch for dynamically added forms
    const observer = new MutationObserver(function(mutations) {
      let formsAdded = false;
      
      mutations.forEach(function(mutation) {
        if (mutation.addedNodes && mutation.addedNodes.length > 0) {
          // Check for new forms
          mutation.addedNodes.forEach(node => {
            if (node.nodeName === 'FORM') {
              formsAdded = true;
            } else if (node.querySelectorAll) {
              const forms = node.querySelectorAll('form:not([data-github-handler])');
              if (forms.length > 0) formsAdded = true;
            }
          });
        }
      });
      
      if (formsAdded) {
        console.log('New forms detected, attaching handlers');
        attachFormHandlers();
      }
    });
    
    observer.observe(document.body, { childList: true, subtree: true });
  }

  // Run when DOM is loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize);
  } else {
    initialize();
  }
  
  // Also attach to window load for good measure
  window.addEventListener('load', function() {
    setTimeout(function() {
      // Check if we need to process any forms
      const unprocessedForms = document.querySelectorAll('form:not([data-github-handler])');
      if (unprocessedForms.length > 0) {
        console.log('Found unprocessed forms during window.load, attaching handlers now');
        attachFormHandlers();
      }
    }, 500);
  });
})();