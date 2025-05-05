/**
 * Dropdown Event Handlers
 * This script adds additional event handlers to ensure subject dropdowns work correctly
 */
(function() {
  console.log('[DROPDOWN EVENTS] Setting up dropdown event handlers');
  
  // Run when DOM is fully loaded
  document.addEventListener('DOMContentLoaded', setupEventHandlers);
  window.addEventListener('load', setupEventHandlers);
  
  // Also run on timers to catch late rendering
  setTimeout(setupEventHandlers, 500);
  setTimeout(setupEventHandlers, 1000);
  setTimeout(setupEventHandlers, 2000);
  
  function setupEventHandlers() {
    // Add handlers to all forms
    const forms = document.querySelectorAll('form');
    forms.forEach(form => setupFormHandlers(form));
    
    // Set up subject selects specifically
    const subjectSelects = document.querySelectorAll('select#subject, select[name="subject"]');
    subjectSelects.forEach(select => {
      if (!select.getAttribute('data-events-attached')) {
        addSelectHandlers(select);
      }
    });
    
    // Use mutation observer to detect newly added elements
    setupMutationObserver();
  }
  
  function setupFormHandlers(form) {
    if (form.getAttribute('data-event-handlers-attached')) {
      return; // Already set up
    }
    
    console.log('[DROPDOWN EVENTS] Setting up handlers for form:', form.id || 'unnamed');
    form.setAttribute('data-event-handlers-attached', 'true');
    
    // Collect data on form submit
    form.addEventListener('submit', function(e) {
      // Don't prevent default here, just collect data
      console.log('[DROPDOWN EVENTS] Form submitting, collecting data');
      
      // Create a data object
      const formData = {};
      
      // Special handling for subjects
      const subjectFields = form.querySelectorAll('select#subject, select[name="subject"]');
      subjectFields.forEach(field => {
        if (field && field.selectedIndex >= 0) {
          const value = field.options[field.selectedIndex].value;
          formData.subject = value;
          
          // Store the value as a data attribute on the form
          form.setAttribute('data-subject-value', value);
          console.log('[DROPDOWN EVENTS] Captured subject value:', value);
          
          // Add a hidden input to make sure the subject is included in submissions
          let hiddenSubject = form.querySelector('input[name="subject"][type="hidden"]');
          if (!hiddenSubject) {
            hiddenSubject = document.createElement('input');
            hiddenSubject.type = 'hidden';
            hiddenSubject.name = 'subject';
            form.appendChild(hiddenSubject);
          }
          hiddenSubject.value = value;
          
          // Also update any existing subject input
          const existingSubjectInputs = form.querySelectorAll('input[name="subject"]');
          existingSubjectInputs.forEach(input => {
            input.value = value;
          });
        }
      });
      
      // Store form data in window object for access by other scripts
      window.latestFormData = formData;
      
      // Expose subject value in global scope for other scripts
      window.latestSubjectValue = formData.subject;
      console.log('[DROPDOWN EVENTS] Subject stored globally:', window.latestSubjectValue);
    });
    
    // Intercept form submission to add subject value if it's missing
    const originalSubmit = form.submit;
    form.submit = function() {
      const subjectField = form.querySelector('select#subject');
      if (subjectField && subjectField.selectedIndex >= 0) {
        const value = subjectField.options[subjectField.selectedIndex].value;
        console.log('[DROPDOWN EVENTS] Setting subject value before submit:', value);
        
        // Create a hidden field if needed
        let hiddenSubject = form.querySelector('input[name="subject"][type="hidden"]');
        if (!hiddenSubject) {
          hiddenSubject = document.createElement('input');
          hiddenSubject.type = 'hidden';
          hiddenSubject.name = 'subject';
          form.appendChild(hiddenSubject);
        }
        
        hiddenSubject.value = value;
      }
      
      originalSubmit.apply(this);
    };
  }
  
  function addSelectHandlers(select) {
    if (select.getAttribute('data-events-attached')) {
      return; // Already attached
    }
    
    select.setAttribute('data-events-attached', 'true');
    console.log('[DROPDOWN EVENTS] Adding handlers to select:', select.id || select.name || 'unnamed');
    
    // Log value on change
    select.addEventListener('change', function(e) {
      if (this.selectedIndex >= 0) {
        const value = this.options[this.selectedIndex].value;
        console.log('[DROPDOWN EVENTS] Select changed, value:', value);
        
        // Store in data attribute
        this.setAttribute('data-selected-value', value);
        
        // Store in a global variable for other scripts to access
        window.latestSubjectValue = value;
        
        // Create a custom event to notify other scripts
        const event = new CustomEvent('subjectSelected', { 
          detail: { value: value },
          bubbles: true 
        });
        this.dispatchEvent(event);
      }
    });
    
    // Make sure empty value is never selected except for placeholders
    if (select.selectedIndex === 0 && select.options[0].value === '' && select.options.length > 1) {
      // If first option is empty and there are other options, select the second option
      if (!select.options[0].disabled) {
        select.selectedIndex = 1;
        console.log('[DROPDOWN EVENTS] Auto-selected first non-empty option');
        
        // Trigger change event
        const event = new Event('change', { bubbles: true });
        select.dispatchEvent(event);
      }
    }
  }
  
  function setupMutationObserver() {
    // Set up mutation observer to catch dynamically added elements
    if (window.MutationObserver) {
      const observer = new MutationObserver(mutations => {
        let shouldCheckAgain = false;
        
        mutations.forEach(mutation => {
          if (mutation.addedNodes && mutation.addedNodes.length) {
            for (let i = 0; i < mutation.addedNodes.length; i++) {
              const node = mutation.addedNodes[i];
              
              // Skip non-element nodes
              if (node.nodeType !== 1) continue;
              
              // Check if this is a form or contains a form
              if (node.tagName === 'FORM' || node.querySelector('form')) {
                shouldCheckAgain = true;
              }
              
              // Check if it's a select or contains selects
              if (node.tagName === 'SELECT' || node.querySelector('select')) {
                shouldCheckAgain = true;
              }
            }
          }
        });
        
        if (shouldCheckAgain) {
          console.log('[DROPDOWN EVENTS] New elements detected, setting up handlers');
          setupEventHandlers();
        }
      });
      
      observer.observe(document.body, {
        childList: true,
        subtree: true
      });
      
      console.log('[DROPDOWN EVENTS] Mutation observer set up');
    }
  }
  
  // Global helper functions for other scripts
  window.DropdownEvents = {
    getLatestSubjectValue: function() {
      return window.latestSubjectValue;
    },
    getFormData: function() {
      return window.latestFormData;
    },
    setupSelect: function(select) {
      addSelectHandlers(select);
    }
  };
})();