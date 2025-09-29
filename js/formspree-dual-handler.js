/**
 * Formspree Dual Form Handler for The Backus Agency
 * Handles two consolidated forms:
 * 1. Security Forms - All security-related assessments
 * 2. Contact Forms - Contact, newsletter, and get-started forms
 */

(function() {
  // Formspree endpoints using project-based URLs from dashboard
  const FORMSPREE_ENDPOINTS = {
    security: 'https://formspree.io/p/2837001675602918616/f/security',  // The Backus Agency Security Forms
    contact: 'https://formspree.io/p/2837001675602918616/f/contact'     // The Backus Agency Contact Forms
  };

  // Form type mappings
  const SECURITY_FORMS = [
    'security-assessment', 'discovery', 'roadmap', 'proposal',
    'sow', 'ot-assessment', 'authorization', 'checklist',
    'methodology', 'outreach', 'intelligent-assessment'
  ];

  const CONTACT_FORMS = [
    'contact', 'newsletter', 'get-started', 'subscription',
    'inquiry', 'demo-request'
  ];

  // Form type to human-readable name mapping
  const FORM_NAMES = {
    'security-assessment': 'Security Assessment',
    'discovery': 'Discovery Questions',
    'roadmap': 'Security Roadmap',
    'proposal': 'Executive Proposal',
    'sow': 'Statement of Work',
    'ot-assessment': 'OT/Energy Assessment',
    'authorization': 'Authorization Letter',
    'checklist': 'Engagement Checklist',
    'methodology': 'Testing Methodology',
    'outreach': 'Outreach Email',
    'intelligent-assessment': 'Intelligent Security Assessment',
    'contact': 'Contact Form',
    'newsletter': 'Newsletter Subscription',
    'get-started': 'Get Started Request',
    'subscription': 'Email Subscription',
    'inquiry': 'General Inquiry',
    'demo-request': 'Demo Request'
  };

  // Initialize when DOM is ready
  function init() {
    console.log('Formspree Dual Handler initializing...');

    // Find all forms
    const forms = document.querySelectorAll(
      'form[data-form-type], ' +
      '.contact-form, ' +
      '.newsletter-form, ' +
      '.security-form, ' +
      '#contact-form, ' +
      '#newsletter-form, ' +
      '#security-assessment-form'
    );

    console.log(`Found ${forms.length} forms to initialize`);
    forms.forEach(form => setupForm(form));

    // Observe for dynamically added forms
    observeNewForms();
  }

  // Determine which endpoint to use based on form type
  function getFormEndpoint(formType) {
    if (SECURITY_FORMS.includes(formType)) {
      return FORMSPREE_ENDPOINTS.security;
    } else {
      return FORMSPREE_ENDPOINTS.contact;
    }
  }

  // Set up a single form
  function setupForm(form) {
    // Skip if already initialized
    if (form.dataset.formspreeInitialized) return;

    // Mark as initialized
    form.dataset.formspreeInitialized = 'true';

    // Determine form type
    let formType = form.dataset.formType || determineFormType(form);

    console.log(`Setting up form: ${formType || 'unknown'}`);

    // Remove any existing submit handlers
    const newForm = form.cloneNode(true);
    form.parentNode.replaceChild(newForm, form);

    // Add our submit handler
    newForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      e.stopPropagation();
      await handleFormSubmit(newForm, formType);
    });
  }

  // Determine form type from class, ID, or content
  function determineFormType(form) {
    // Check data attribute first
    if (form.dataset.formType) {
      return form.dataset.formType;
    }

    // Check ID
    const formId = form.id ? form.id.toLowerCase() : '';
    if (formId.includes('contact')) return 'contact';
    if (formId.includes('newsletter')) return 'newsletter';
    if (formId.includes('subscribe')) return 'newsletter';
    if (formId.includes('started')) return 'get-started';
    if (formId.includes('security')) return 'security-assessment';
    if (formId.includes('assessment')) return 'security-assessment';

    // Check classes
    const classes = form.className.toLowerCase();
    if (classes.includes('contact')) return 'contact';
    if (classes.includes('newsletter')) return 'newsletter';
    if (classes.includes('subscribe')) return 'newsletter';
    if (classes.includes('started')) return 'get-started';
    if (classes.includes('security')) return 'security-assessment';

    // Check for specific fields to determine type
    const hasMessage = form.querySelector('[name*="message"]');
    const hasEmail = form.querySelector('[type="email"]');
    const hasCompany = form.querySelector('[name*="company"]');
    const hasMaturity = form.querySelector('[name*="maturity"]');

    if (hasMaturity) return 'security-assessment';
    if (hasMessage && hasCompany) return 'contact';
    if (hasEmail && !hasMessage) return 'newsletter';

    return 'contact'; // Default fallback
  }

  // Handle form submission
  async function handleFormSubmit(form, formType) {
    console.log(`Submitting ${formType} form`);

    // Get or create message element
    let messageEl = form.querySelector('.form-message');
    if (!messageEl) {
      messageEl = createMessageElement(form);
    }

    // Clear any previous messages
    messageEl.style.display = 'none';
    messageEl.className = 'form-message';

    // Find and disable submit button
    const submitBtn = form.querySelector('button[type="submit"], input[type="submit"]');
    const originalText = submitBtn ? (submitBtn.textContent || submitBtn.value) : '';
    if (submitBtn) {
      submitBtn.disabled = true;
      if (submitBtn.tagName === 'BUTTON') {
        submitBtn.textContent = 'Sending...';
      } else {
        submitBtn.value = 'Sending...';
      }
    }

    try {
      // Collect form data
      const formData = new FormData(form);

      // Add metadata
      formData.append('form_type', formType);
      formData.append('template_type', FORM_NAMES[formType] || formType);
      formData.append('timestamp', new Date().toISOString());
      formData.append('source_url', window.location.href);

      // Set email subject
      const subject = `${FORM_NAMES[formType] || 'Form Submission'} - ${new Date().toLocaleDateString()}`;
      formData.append('subject', subject);

      // Determine endpoint
      const endpoint = getFormEndpoint(formType);
      console.log(`Submitting to: ${endpoint}`);

      // Submit to Formspree
      const response = await fetch(endpoint, {
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

        // Track submission if analytics available
        if (window.gtag) {
          window.gtag('event', 'form_submit', {
            'form_type': formType,
            'form_category': SECURITY_FORMS.includes(formType) ? 'security' : 'contact'
          });
        }

        console.log(`${formType} form submitted successfully`);

      } else {
        const errorData = await response.text();
        console.error('Formspree response:', errorData);
        throw new Error(`Submission failed: ${response.status}`);
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
        if (submitBtn.tagName === 'BUTTON') {
          submitBtn.textContent = originalText;
        } else {
          submitBtn.value = originalText;
        }
      }
    }
  }

  // Create message element if it doesn't exist
  function createMessageElement(form) {
    const messageEl = document.createElement('div');
    messageEl.className = 'form-message';
    messageEl.style.display = 'none';

    // Insert after submit button or at end of form
    const submitBtn = form.querySelector('button[type="submit"], input[type="submit"]');
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
      'outreach': 'Your outreach request has been submitted. We\'ll be in touch soon.',
      'intelligent-assessment': 'Your intelligent assessment has been processed. We\'ll provide detailed recommendations soon.',
      'subscription': 'You\'ve been successfully subscribed!',
      'inquiry': 'Thank you for your inquiry. We\'ll respond within 24 hours.',
      'demo-request': 'Your demo request has been received. We\'ll schedule a time that works for you.'
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
            if (node.querySelectorAll) {
              const forms = node.querySelectorAll('form');
              forms.forEach(setupForm);
            }
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
    if (document.getElementById('formspree-styles')) return;

    const style = document.createElement('style');
    style.id = 'formspree-styles';
    style.textContent = `
      .form-message {
        margin-top: 15px;
        padding: 12px;
        border-radius: 5px;
        text-align: center;
        font-size: 14px;
        font-weight: 500;
        transition: all 0.3s ease;
      }

      .form-message.success {
        background-color: rgba(212, 237, 218, 0.95);
        color: #155724;
        border: 1px solid #c3e6cb;
      }

      .form-message.error {
        background-color: rgba(248, 215, 218, 0.95);
        color: #721c24;
        border: 1px solid #f5c6cb;
      }

      /* Dark mode support */
      @media (prefers-color-scheme: dark) {
        .form-message.success {
          background-color: rgba(21, 87, 36, 0.95);
          color: #d4edda;
          border: 1px solid #155724;
        }

        .form-message.error {
          background-color: rgba(114, 28, 36, 0.95);
          color: #f8d7da;
          border: 1px solid #721c24;
        }
      }

      form .error {
        border-color: #dc3545 !important;
      }

      button[type="submit"]:disabled,
      input[type="submit"]:disabled {
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

  // Expose for debugging and dynamic updates
  window.FormspreeHandler = {
    init: init,
    setupForm: setupForm,
    updateEndpoints: function(security, contact) {
      FORMSPREE_ENDPOINTS.security = security;
      FORMSPREE_ENDPOINTS.contact = contact;
      console.log('Formspree endpoints updated');
    },
    getEndpoints: function() {
      return FORMSPREE_ENDPOINTS;
    }
  };

  console.log('Formspree Dual Handler loaded');
})();