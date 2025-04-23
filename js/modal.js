/**
 * Modal Dialog Component
 * Provides a centered popup modal for forms or other content
 */
(function() {
  // Create modal container if it doesn't exist
  function createModal() {
    // Check if modal already exists
    if (document.getElementById('tba-modal-container')) {
      return document.getElementById('tba-modal-container');
    }
    
    // Create modal elements
    const modalContainer = document.createElement('div');
    modalContainer.id = 'tba-modal-container';
    modalContainer.className = 'fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm';
    modalContainer.style.display = 'none';
    
    const modalContent = document.createElement('div');
    modalContent.id = 'tba-modal-content';
    modalContent.className = 'bg-zinc-900 rounded-xl border border-zinc-700 shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto';
    
    const closeButton = document.createElement('button');
    closeButton.id = 'tba-modal-close';
    closeButton.className = 'absolute top-4 right-4 text-zinc-400 hover:text-white p-2 rounded-full bg-zinc-800/50';
    closeButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>';
    closeButton.setAttribute('aria-label', 'Close modal');
    
    // Close modal when close button is clicked
    closeButton.addEventListener('click', function() {
      closeModal();
    });
    
    // Close modal when clicking outside
    modalContainer.addEventListener('click', function(event) {
      if (event.target === modalContainer) {
        closeModal();
      }
    });
    
    // Add escape key handler
    document.addEventListener('keydown', function(event) {
      if (event.key === 'Escape') {
        closeModal();
      }
    });
    
    // Assemble modal
    modalContent.appendChild(closeButton);
    modalContainer.appendChild(modalContent);
    document.body.appendChild(modalContainer);
    
    return modalContainer;
  }
  
  // Show modal with content
  function openModal(content) {
    const modal = createModal();
    const modalContent = document.getElementById('tba-modal-content');
    
    // Clear previous content (except close button)
    const closeButton = document.getElementById('tba-modal-close');
    modalContent.innerHTML = '';
    modalContent.appendChild(closeButton);
    
    // Add new content
    modalContent.appendChild(content);
    
    // Show modal
    modal.style.display = 'flex';
    
    // Prevent body scrolling
    document.body.style.overflow = 'hidden';
    
    return modal;
  }
  
  // Close modal
  function closeModal() {
    const modal = document.getElementById('tba-modal-container');
    if (modal) {
      modal.style.display = 'none';
      
      // Restore body scrolling
      document.body.style.overflow = '';
    }
  }
  
  // Open contact form in modal
  function openContactForm() {
    // Check if contact form exists on the page
    let contactForm = document.querySelector('form[data-form-type="contact"]');
    
    if (contactForm) {
      // Clone the form to use in modal
      const formClone = contactForm.cloneNode(true);
      
      // Create content wrapper
      const contentWrapper = document.createElement('div');
      contentWrapper.className = 'p-6';
      
      // Add title
      const title = document.createElement('h3');
      title.className = 'text-2xl font-bold mb-6 text-center';
      title.textContent = 'Contact Us';
      
      // Add contact form
      contentWrapper.appendChild(title);
      contentWrapper.appendChild(formClone);
      
      // Open the modal with form
      openModal(contentWrapper);
      
      // Set up form submission
      formClone.addEventListener('submit', function(event) {
        event.preventDefault();
        
        // Submit form using the form-handler.js logic
        const event = new Event('submit', { bubbles: true, cancelable: true });
        formClone.dispatchEvent(event);
      });
    } else {
      // If form doesn't exist on the page, redirect to contact page
      window.location.href = '/contact/';
    }
  }
  
  // Initialize when DOM is loaded
  function init() {
    // Create modal on load so it's ready when needed
    createModal();
    
    // Find all "Get Started", "Contact Sales", and "Start a Project" buttons
    const actionButtons = document.querySelectorAll('button, a.button');
    
    for (let i = 0; i < actionButtons.length; i++) {
      const button = actionButtons[i];
      const buttonText = button.textContent && button.textContent.trim();
      
      if (buttonText && !button.getAttribute('data-modal-handler-attached')) {
        // Check if this is a button we should handle
        if (buttonText.includes('Get Started') || 
            buttonText.includes('Contact Sales') || 
            buttonText.includes('Start a Project')) {
          
          // Mark this button as having a handler attached
          button.setAttribute('data-modal-handler-attached', 'true');
          
          // Attach click handler
          button.addEventListener('click', function(e) {
            e.preventDefault();
            openContactForm();
          });
        }
      }
    }
  }
  
  // Export functions to global scope
  window.TBAModal = {
    open: openModal,
    close: closeModal,
    openContactForm: openContactForm
  };
  
  // Initialize when DOM is ready or when script loads if DOM is already ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();