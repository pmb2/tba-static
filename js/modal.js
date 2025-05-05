/**
 * Modal Dialog Component
 * Provides a centered popup modal for forms or other content
 */
(function() {
  // Add style for fixed centering
  const style = document.createElement('style');
  style.textContent = `
    #tba-modal-container {
      display: none;
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: 1000;
      align-items: center;
      justify-content: center;
    }
    #tba-modal-content {
      position: relative;
      transform: translateY(0);
      margin: auto;
    }
  `;
  document.head.appendChild(style);
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
    modalContent.className = 'bg-zinc-900 rounded-xl border border-zinc-700 shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto fixed-center';
    
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
      
      // Add budget dropdown if it doesn't exist
      const subjectField = formClone.querySelector('#subject');
      if (subjectField) {
        // Ensure the subject field is visible and working
        subjectField.style.display = 'block';
        subjectField.style.visibility = 'visible';
        subjectField.style.opacity = '1';
        subjectField.style.appearance = 'menulist';
      }
      
      // Add budget field if it doesn't exist
      if (!formClone.querySelector('#budget')) {
        // Create budget field
        const budgetContainer = document.createElement('div');
        budgetContainer.className = 'space-y-2';
        budgetContainer.innerHTML = `
          <label for="budget" class="text-sm font-medium text-zinc-300">Budget <span class="text-red-500">*</span></label>
          <select name="budget" id="budget" class="flex h-10 w-full rounded-md border px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1 bg-zinc-800 border-zinc-700" required>
            <option value="">Select a budget</option>
            <option value="$5k-$10k">$5k-$10k</option>
            <option value="$10k-$25k">$10k-$25k</option>
            <option value="$25k-$50k">$25k-$50k</option>
            <option value="$50k-$100k">$50k-$100k</option>
            <option value="$100k+">$100k+</option>
          </select>
        `;
        
        // Find where to insert budget field (after phone field)
        const phoneContainer = formClone.querySelector('#phone').parentNode.parentNode;
        if (phoneContainer) {
          phoneContainer.appendChild(budgetContainer);
        }
      }
      
      // Add contact form
      contentWrapper.appendChild(title);
      contentWrapper.appendChild(formClone);
      
      // Open the modal with form
      openModal(contentWrapper);
      
      // Ensure modal is visible and centered
      const modal = document.getElementById('tba-modal-container');
      if (modal) {
        modal.style.display = 'flex';
        modal.style.alignItems = 'center';
        modal.style.justifyContent = 'center';
        
        // Scroll to modal
        window.scrollTo({
          top: 0,
          behavior: 'smooth'
        });
      }
      
      // Set up form submission
      formClone.addEventListener('submit', function(evt) {
        evt.preventDefault();
        
        // Make sure the form has the data-form-type attribute
        if (!formClone.getAttribute('data-form-type')) {
          formClone.setAttribute('data-form-type', 'contact');
        }
        
        // Validate the form
        let isValid = true;
        
        // Check each required field
        formClone.querySelectorAll('[required]').forEach(field => {
          if (!field.value.trim()) {
            field.classList.add('error');
            isValid = false;
          } else {
            field.classList.remove('error');
          }
        });
        
        // Check email format if there is an email field
        const emailField = formClone.querySelector('input[type="email"]');
        if (emailField && emailField.value) {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(emailField.value)) {
            emailField.classList.add('error');
            isValid = false;
          }
        }
        
        if (!isValid) {
          return;
        }
        
        // Collect form data
        const formData = {};
        new FormData(formClone).forEach((value, key) => {
          formData[key] = value;
        });
        
        // Add timestamp and form type
        formData.submitted_at = new Date().toISOString();
        formData.form_type = 'contact';
        
        // Submit to n8n webhook
        const webhookUrl = 'https://n8n.backus.agency/webhook/form_filled';
        
        fetch(webhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        })
        .then(response => {
          if (!response.ok) {
            throw new Error(`Server responded with ${response.status}: ${response.statusText}`);
          }
          return response.json();
        })
        .then(() => {
          // Show success message
          let messageContainer = formClone.querySelector('.form-message');
          
          if (!messageContainer) {
            // Create a message container if it doesn't exist
            messageContainer = document.createElement('div');
            messageContainer.className = 'form-message';
            formClone.appendChild(messageContainer);
          }
          
          // Show success message
          messageContainer.innerHTML = '<p class="success">Thank you for your submission! We\'ll be in touch soon.</p>';
          messageContainer.style.display = 'block';
          
          // Reset form
          formClone.reset();
          
          // Close modal after success (optional)
          setTimeout(() => {
            closeModal();
          }, 3000);
        })
        .catch(error => {
          // Show error message
          let messageContainer = formClone.querySelector('.form-message');
          
          if (!messageContainer) {
            // Create a message container if it doesn't exist
            messageContainer = document.createElement('div');
            messageContainer.className = 'form-message';
            formClone.appendChild(messageContainer);
          }
          
          // Show error message
          messageContainer.innerHTML = `<p class="error">There was a problem submitting the form: ${error.message}</p>`;
          messageContainer.style.display = 'block';
        });
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
    
    // Skip attaching handlers if we're on the pricing page (handled separately)
    if (window.location.pathname.includes('/pricing/')) {
      return;
    }
    
    // Find all "Get Started", "Contact Sales", and "Start a Project" buttons
    const actionButtons = document.querySelectorAll('button, a.button');
    
    for (let i = 0; i < actionButtons.length; i++) {
      const button = actionButtons[i];
      const buttonText = button.textContent && button.textContent.trim();
      
      if (buttonText && !button.getAttribute('data-modal-handler-attached')) {
        // Check if this is a button we should handle
        if (buttonText.includes('Get Started') || 
            buttonText.includes('Contact Sales') || 
            buttonText.includes('Start a Project') ||
            buttonText.includes('Contact Us')) {
          
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
    
    // Re-run the initialization after a short delay to catch any dynamically loaded buttons
    setTimeout(function() {
      // Find buttons that might have been missed in the initial scan
      const allButtons = document.querySelectorAll('button:not([data-modal-handler-attached]), a.button:not([data-modal-handler-attached])');
      
      for (let i = 0; i < allButtons.length; i++) {
        const button = allButtons[i];
        const buttonText = button.textContent && button.textContent.trim();
        
        if (buttonText) {
          // Check for pricing page buttons specifically
          if (buttonText.includes('Get Started') || 
              buttonText.includes('Contact Sales') || 
              buttonText.includes('Start a Project') ||
              buttonText.includes('Contact Us')) {
            
            // Mark as handled
            button.setAttribute('data-modal-handler-attached', 'true');
            
            // Attach click handler
            button.addEventListener('click', function(e) {
              e.preventDefault();
              openContactForm();
            });
          }
        }
      }
    }, 1000);
  }
  
  // Export functions to global scope
  window.TBAModal = {
    open: openModal,
    close: closeModal,
    openContactForm: openContactForm
  };
  
  // Add a page-specific initializer for the pricing page
  function setupPricingPageButtons() {
    // Check if we're on the pricing page
    if (window.location.pathname.includes('/pricing/')) {
      // Find pricing buttons by their container context
      const pricingCards = document.querySelectorAll('.bg-zinc-900.rounded-2xl');
      
      pricingCards.forEach(card => {
        const button = card.querySelector('button');
        if (button) {
          // Remove any existing onclick handlers
          if (button.getAttribute('data-modal-handler-attached') === 'true') {
            // Clone the button to remove all event listeners
            const newButton = button.cloneNode(true);
            button.parentNode.replaceChild(newButton, button);
          }
          
          // Ensure the button redirects to the contact form
          button.onclick = function() {
            window.location.href = '/contact/#contact-form';
            return false;
          };
        }
      });
    }
  }
  
  // Initialize when DOM is ready or when script loads if DOM is already ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      init();
      // Run pricing page setup after a short delay
      setTimeout(setupPricingPageButtons, 500);
    });
  } else {
    init();
    // Run pricing page setup after a short delay
    setTimeout(setupPricingPageButtons, 500);
  }
})();