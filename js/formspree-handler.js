/**
 * Formspree Universal Form Handler for The Backus Agency
 * Handles all form types through a single Formspree endpoint
 */

(function() {
  // Formspree endpoint for the universal form
  const FORMSPREE_ENDPOINT = 'https://formspree.io/f/universal';

  // Form type mappings for better email subjects
  const FORM_TYPES = {
    'contact': 'Contact Form Submission',
    'newsletter': 'Newsletter Subscription',
    'get-started': 'Get Started Request',
    'security-assessment': 'Security Assessment',
    'discovery': 'Discovery Questions',
    'roadmap': 'Security Roadmap Request',
    'proposal': 'Executive Proposal Request',
    'sow': 'Statement of Work Request',
    'ot-assessment': 'OT/Energy Assessment',
    'authorization': 'Authorization Letter Request',
    'checklist': 'Engagement Checklist',
    'methodology': 'Testing Methodology',
    'outreach': 'Outreach Email'
  };

  // Initialize when DOM is ready
  function init() {
    // Find all forms and set them up
    const forms = document.querySelectorAll('form[data-form-type], .contact-form, .newsletter-form, #contact-form');

    forms.forEach(form => {
      setupForm(form);
    });

    // Also intercept any dynamically added forms
    observeNewForms();
  }

  // Set up a single form
  function setupForm(form) {
    // Skip if already initialized
    if (form.dataset.formspreeInitialized) return;

    // Mark as initialized
    form.dataset.formspreeInitialized = 'true';

    // Determine form type
    let formType = form.dataset.formType;

    if (!formType) {
      // Try to determine form type from class or ID
      if (form.classList.contains('contact-form') || form.id === 'contact-form') {
        formType = 'contact';
      } else if (form.classList.contains('newsletter-form')) {
        formType = 'newsletter';
      } else if (form.classList.contains('get-started-form')) {
        formType = 'get-started';
      } else if (form.classList.contains('security-form')) {
        formType = 'security-assessment';
      }
    }

    // Add submit handler
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      await handleFormSubmit(form, formType);
    });
  }

  // Handle form submission
  async function handleFormSubmit(form, formType) {
    // Get form message element
    const messageEl = form.querySelector('.form-message') || createMessageElement(form);

    // Clear any previous messages
    messageEl.style.display = 'none';
    messageEl.className = 'form-message';

    // Disable submit button
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn ? submitBtn.textContent : '';
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Sending...';
    }

    try {
      // Collect form data
      const formData = new FormData(form);

      // Add form type to identify the submission
      formData.append('form_type', formType || 'unknown');

      // Add timestamp
      formData.append('timestamp', new Date().toISOString());

      // Add page URL for context
      formData.append('source_url', window.location.href);

      // Format the subject based on form type
      const subject = FORM_TYPES[formType] || 'Form Submission';
      formData.append('_subject', `${subject} - ${new Date().toLocaleDateString()}`);

      // Submit to Formspree
      const response = await fetch(FORMSPREE_ENDPOINT, {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json'
        }
      });

      if (response.ok) {
        // Show success message
        messageEl.className = 'form-message success';
        messageEl.innerHTML = getSuccessMessage(formType);
        messageEl.style.display = 'block';

        // Reset form
        form.reset();

        // Track successful submission
        if (window.gtag) {
          window.gtag('event', 'form_submit', {
            'form_type': formType,
            'form_id': form.id
          });
        }
      } else {
        throw new Error('Form submission failed');
      }

    } catch (error) {
      console.error('Form submission error:', error);

      // Show error message
      messageEl.className = 'form-message error';
      messageEl.innerHTML = 'There was an error submitting the form. Please try again or contact us directly at support@backus.agency';
      messageEl.style.display = 'block';

    } finally {
      // Re-enable submit button
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
      }
    }
  }

  // Create message element if it doesn't exist
  function createMessageElement(form) {
    const messageEl = document.createElement('div');
    messageEl.className = 'form-message';
    messageEl.style.display = 'none';
    messageEl.style.marginTop = '15px';
    messageEl.style.padding = '10px';
    messageEl.style.borderRadius = '5px';
    messageEl.style.textAlign = 'center';

    // Insert after submit button or at end of form
    const submitBtn = form.querySelector('button[type="submit"]');
    if (submitBtn && submitBtn.parentNode) {
      submitBtn.parentNode.insertBefore(messageEl, submitBtn.nextSibling);
    } else {
      form.appendChild(messageEl);
    }

    return messageEl;
  }

  // Get success message based on form type
  function getSuccessMessage(formType) {
    const messages = {
      'contact': 'Thank you for your message! We\'ll get back to you within 24 hours.',
      'newsletter': 'You\'ve been successfully subscribed to our newsletter!',
      'get-started': 'Thank you for your interest! We\'ll contact you soon to discuss your project.',
      'security-assessment': 'Your security assessment has been submitted. Our team will review it and contact you shortly.',
      'discovery': 'Thank you for providing this information. We\'ll analyze your requirements and get back to you.',
      'roadmap': 'Your roadmap request has been received. We\'ll prepare a customized plan for you.',
      'proposal': 'Your proposal request has been submitted. We\'ll prepare a detailed proposal for your review.',
      'sow': 'Your SOW request has been received. We\'ll draft the statement of work and send it to you.',
      'ot-assessment': 'Your OT/Energy assessment request has been submitted. Our specialists will contact you soon.',
      'authorization': 'Your authorization letter request has been received. We\'ll prepare the documentation.',
      'checklist': 'Your engagement checklist has been submitted. We\'ll review and follow up.',
      'methodology': 'Your testing methodology request has been received. We\'ll share our approach with you.',
      'outreach': 'Your outreach request has been submitted. We\'ll be in touch soon.'
    };

    return messages[formType] || 'Thank you! Your submission has been received.';
  }

  // Observe for dynamically added forms
  function observeNewForms() {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === 1) { // Element node
            // Check if it's a form
            if (node.tagName === 'FORM') {
              setupForm(node);
            }
            // Check for forms within the added element
            const forms = node.querySelectorAll ? node.querySelectorAll('form') : [];
            forms.forEach(setupForm);
          }
        });
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  // Add styles for messages
  function addStyles() {
    const style = document.createElement('style');
    style.textContent = `
      .form-message {
        font-size: 14px;
        font-weight: 500;
        transition: all 0.3s ease;
      }

      .form-message.success {
        background-color: #d4edda;
        color: #155724;
        border: 1px solid #c3e6cb;
      }

      .form-message.error {
        background-color: #f8d7da;
        color: #721c24;
        border: 1px solid #f5c6cb;
      }

      form .error {
        border-color: #dc3545 !important;
      }

      button[type="submit"]:disabled {
        opacity: 0.7;
        cursor: not-allowed;
      }
    `;
    document.head.appendChild(style);
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      addStyles();
      init();
    });
  } else {
    addStyles();
    init();
  }

  // Expose for debugging
  window.FormspreeHandler = {
    init: init,
    setupForm: setupForm,
    FORMSPREE_ENDPOINT: FORMSPREE_ENDPOINT
  };
})();