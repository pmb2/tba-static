/**
 * Minimal Form Handler - Cross-browser Compatible
 */
(function() {
  // Function to handle form submission
  function handleFormSubmit(event) {
    event.preventDefault();
    
    const form = event.target;
    const formType = form.getAttribute('data-form-type') || 'contact';
    
    // Get form data
    const formData = {};
    new FormData(form).forEach((value, key) => {
      formData[key] = value;
    });
    
    // Get repository info
    const owner = document.querySelector('meta[name="github-repo-owner"]')?.content || 'TheBackusAgency';
    const repo = document.querySelector('meta[name="github-repo-name"]')?.content || 'tba-static';
    
    // Format issue data
    const issueBody = Object.entries(formData)
      .map(([key, value]) => `${key}: "${value}"`)
      .join('\n');
    
    // Build GitHub issue URL
    const url = `https://github.com/${owner}/${repo}/issues/new?title=Form Submission: ${formType} Form&body=${encodeURIComponent(issueBody)}&labels=form-submission,${formType}`;
    
    // Open in new window
    window.open(url, '_blank');
    
    // Show success message
    alert('Form submitted successfully!');
    
    // Reset form
    form.reset();
  }
  
  // Attach handlers to forms
  document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('form').forEach(form => {
      if (!form.getAttribute('data-handler-attached')) {
        form.setAttribute('data-handler-attached', 'true');
        form.addEventListener('submit', handleFormSubmit);
      }
    });
  });
  
  // Also run when page is loaded
  if (document.readyState !== 'loading') {
    document.querySelectorAll('form').forEach(form => {
      if (!form.getAttribute('data-handler-attached')) {
        form.setAttribute('data-handler-attached', 'true');
        form.addEventListener('submit', handleFormSubmit);
      }
    });
  }
})();