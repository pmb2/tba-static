/**
 * Native Select Fix - Complete dropdown replacement
 * This script completely replaces all custom stylized select elements with native browser selects
 */
(function() {
  console.log('[NATIVE SELECT] Starting native select replacement fix');
  
  // Force immediate execution
  fixAllSelects();
  
  // Also run when DOM is fully loaded
  document.addEventListener('DOMContentLoaded', fixAllSelects);
  window.addEventListener('load', fixAllSelects);
  
  // Run again after timeout in case of dynamic content
  setTimeout(fixAllSelects, 500);
  setTimeout(fixAllSelects, 1000);
  setTimeout(fixAllSelects, 2000);
  
  function fixAllSelects() {
    console.log('[NATIVE SELECT] Searching for all select elements to fix');
    
    // Find all select elements including customized ones
    const allSelects = document.querySelectorAll('select');
    const customSelects = document.querySelectorAll('[role="combobox"], [role="listbox"], .select, .dropdown');
    
    console.log(`[NATIVE SELECT] Found ${allSelects.length} standard selects and ${customSelects.length} custom selects`);
    
    // First fix all standard select elements
    allSelects.forEach((selectElement, index) => {
      if (selectElement.getAttribute('data-native-fixed')) {
        return; // Already fixed
      }
      
      console.log(`[NATIVE SELECT] Fixing standard select #${index}: ${selectElement.id || selectElement.name || 'unnamed'}`);
      
      // Create replacement native select
      const newSelect = createNativeSelect(selectElement);
      
      // Replace the original select
      selectElement.parentNode.insertBefore(newSelect, selectElement);
      selectElement.setAttribute('data-replaced', 'true');
      selectElement.style.display = 'none';
      
      // Mark as fixed
      newSelect.setAttribute('data-native-fixed', 'true');
    });
    
    // Then look for custom select components and replace them
    customSelects.forEach((customSelect, index) => {
      // Skip if this is part of an already fixed select or is a native select
      if (customSelect.tagName === 'SELECT' || 
          customSelect.getAttribute('data-native-fixed') ||
          customSelect.closest('[data-native-fixed]')) {
        return;
      }
      
      console.log(`[NATIVE SELECT] Fixing custom select component #${index}`);
      
      // Try to find the actual select it might be controlling
      let associatedSelect = null;
      
      // Try to find by aria attributes
      const selectId = customSelect.getAttribute('aria-controls') || 
                      customSelect.getAttribute('aria-owns') ||
                      customSelect.getAttribute('data-select-id');
      
      if (selectId) {
        associatedSelect = document.getElementById(selectId);
      }
      
      // Try to find in siblings
      if (!associatedSelect) {
        const parentEl = customSelect.parentNode;
        associatedSelect = parentEl.querySelector('select');
      }
      
      // If we found an associated select, replace it
      if (associatedSelect && !associatedSelect.getAttribute('data-native-fixed')) {
        console.log('[NATIVE SELECT] Found associated select element to replace');
        
        // Create replacement native select
        const newSelect = createNativeSelect(associatedSelect);
        
        // Replace the original
        associatedSelect.parentNode.insertBefore(newSelect, associatedSelect);
        associatedSelect.setAttribute('data-replaced', 'true');
        associatedSelect.style.display = 'none';
        
        // Hide the custom component
        customSelect.style.display = 'none';
        
        // Mark as fixed
        newSelect.setAttribute('data-native-fixed', 'true');
      } else {
        // Try to create a select from scratch based on the custom component
        let selectName = '';
        if (customSelect.id) {
          selectName = customSelect.id.replace(/[^a-zA-Z0-9]/g, '');
        } else if (customSelect.className) {
          const classNames = customSelect.className.split(' ');
          for (const cls of classNames) {
            if (cls.includes('select') || cls.includes('dropdown')) {
              selectName = cls.replace(/[^a-zA-Z0-9]/g, '');
              break;
            }
          }
        }
        
        if (!selectName) {
          selectName = 'customSelect' + index;
        }
        
        // Create a new native select
        const newSelect = document.createElement('select');
        newSelect.id = selectName;
        newSelect.name = selectName;
        newSelect.className = 'native-select-replacement';
        newSelect.setAttribute('data-native-fixed', 'true');
        
        // Style it to match the website
        applyNativeSelectStyles(newSelect);
        
        // Try to extract options from custom component
        const optionElements = customSelect.querySelectorAll('li, div[role="option"], [data-option]');
        
        if (optionElements.length > 0) {
          // Add a default option
          const defaultOption = document.createElement('option');
          defaultOption.value = '';
          defaultOption.text = 'Select an option';
          defaultOption.disabled = true;
          defaultOption.selected = true;
          newSelect.appendChild(defaultOption);
          
          // Add options from custom elements
          optionElements.forEach(optionEl => {
            const option = document.createElement('option');
            option.value = optionEl.getAttribute('data-value') || 
                          optionEl.getAttribute('value') || 
                          optionEl.textContent.trim().toLowerCase().replace(/\s+/g, '-');
            option.text = optionEl.textContent.trim();
            newSelect.appendChild(option);
          });
        } else {
          // Can't extract options, add some defaults based on context
          if (selectName.includes('subject')) {
            addDefaultSubjectOptions(newSelect);
          } else if (selectName.includes('budget')) {
            addDefaultBudgetOptions(newSelect);
          } else {
            // Generic options
            const defaultOption = document.createElement('option');
            defaultOption.value = '';
            defaultOption.text = 'Select an option';
            defaultOption.disabled = true;
            defaultOption.selected = true;
            newSelect.appendChild(defaultOption);
            
            const option1 = document.createElement('option');
            option1.value = 'option1';
            option1.text = 'Option 1';
            newSelect.appendChild(option1);
            
            const option2 = document.createElement('option');
            option2.value = 'option2';
            option2.text = 'Option 2';
            newSelect.appendChild(option2);
          }
        }
        
        // Insert the native select before the custom component
        customSelect.parentNode.insertBefore(newSelect, customSelect);
        
        // Hide the custom component
        customSelect.style.display = 'none';
        
        console.log(`[NATIVE SELECT] Created new native select with id ${newSelect.id}`);
      }
    });
    
    // Special processing for specific forms
    fixContactForm();
    
    // Special fix for modals
    fixModalSelects();
  }
  
  function createNativeSelect(originalSelect) {
    // Create a new native select element
    const newSelect = document.createElement('select');
    
    // Copy attributes
    for (let i = 0; i < originalSelect.attributes.length; i++) {
      const attr = originalSelect.attributes[i];
      if (attr.name !== 'style' && attr.name !== 'class' && !attr.name.startsWith('data-')) {
        newSelect.setAttribute(attr.name, attr.value);
      }
    }
    
    // Add our identifier
    newSelect.setAttribute('data-native-fixed', 'true');
    newSelect.className = 'native-select-replacement';
    
    // Copy options
    for (let i = 0; i < originalSelect.options.length; i++) {
      const originalOption = originalSelect.options[i];
      const newOption = document.createElement('option');
      
      // Copy option attributes
      for (let j = 0; j < originalOption.attributes.length; j++) {
        const attr = originalOption.attributes[j];
        newOption.setAttribute(attr.name, attr.value);
      }
      
      newOption.text = originalOption.text;
      newOption.value = originalOption.value;
      newOption.selected = originalOption.selected;
      newOption.disabled = originalOption.disabled;
      
      newSelect.appendChild(newOption);
    }
    
    // If no options, add defaults based on id/name
    if (newSelect.options.length === 0) {
      const selectId = newSelect.id?.toLowerCase() || '';
      const selectName = newSelect.name?.toLowerCase() || '';
      
      if (selectId.includes('subject') || selectName.includes('subject')) {
        addDefaultSubjectOptions(newSelect);
      } else if (selectId.includes('budget') || selectName.includes('budget')) {
        addDefaultBudgetOptions(newSelect);
      } else {
        // Add a generic placeholder
        const defaultOption = document.createElement('option');
        defaultOption.value = '';
        defaultOption.text = 'Select an option';
        defaultOption.disabled = true;
        defaultOption.selected = true;
        newSelect.appendChild(defaultOption);
      }
    }
    
    // Style the select to look nice
    applyNativeSelectStyles(newSelect);
    
    // Add event listener to sync with original
    newSelect.addEventListener('change', function() {
      // Sync value with original select
      if (originalSelect) {
        const selectedIndex = this.selectedIndex;
        if (selectedIndex >= 0 && originalSelect.options.length > selectedIndex) {
          originalSelect.selectedIndex = selectedIndex;
          
          // Trigger change event on original
          const event = new Event('change', { bubbles: true });
          originalSelect.dispatchEvent(event);
        }
      }
      
      console.log(`[NATIVE SELECT] Change event on ${this.id || this.name}: ${this.value}`);
    });
    
    return newSelect;
  }
  
  function applyNativeSelectStyles(selectElement) {
    // Apply styling to make it match the site aesthetic
    selectElement.style.display = 'block';
    selectElement.style.width = '100%';
    selectElement.style.height = '40px';
    selectElement.style.padding = '8px 12px';
    selectElement.style.backgroundColor = '#333';
    selectElement.style.color = 'white';
    selectElement.style.border = '1px solid #555';
    selectElement.style.borderRadius = '6px';
    selectElement.style.appearance = 'auto';  // Critical to ensure native dropdown behavior
    selectElement.style.WebkitAppearance = 'menulist'; // For Safari
    selectElement.style.MozAppearance = 'menulist'; // For Firefox
    selectElement.style.cursor = 'pointer';
    selectElement.style.fontFamily = 'inherit';
    selectElement.style.fontSize = '14px';
    selectElement.style.zIndex = '100';
    selectElement.style.position = 'relative';
    selectElement.style.opacity = '1';
    selectElement.style.visibility = 'visible';
  }
  
  function addDefaultSubjectOptions(selectElement) {
    // Add placeholder
    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.text = 'Select a subject';
    defaultOption.disabled = true;
    defaultOption.selected = true;
    selectElement.appendChild(defaultOption);
    
    // Add standard subject options
    const subjects = [
      { value: 'general', text: 'General Inquiry' },
      { value: 'sales', text: 'Sales' },
      { value: 'support', text: 'Support' },
      { value: 'partnership', text: 'Partnership' },
      { value: 'other', text: 'Other' }
    ];
    
    subjects.forEach(subject => {
      const option = document.createElement('option');
      option.value = subject.value;
      option.text = subject.text;
      selectElement.appendChild(option);
    });
  }
  
  function addDefaultBudgetOptions(selectElement) {
    // Add placeholder
    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.text = 'Select a budget';
    defaultOption.disabled = true;
    defaultOption.selected = true;
    selectElement.appendChild(defaultOption);
    
    // Add standard budget options
    const budgets = [
      { value: '$5k-$10k', text: '$5k-$10k' },
      { value: '$10k-$25k', text: '$10k-$25k' },
      { value: '$25k-$50k', text: '$25k-$50k' },
      { value: '$50k-$100k', text: '$50k-$100k' },
      { value: '$100k+', text: '$100k+' }
    ];
    
    budgets.forEach(budget => {
      const option = document.createElement('option');
      option.value = budget.value;
      option.text = budget.text;
      selectElement.appendChild(option);
    });
  }
  
  function fixContactForm() {
    // Get the contact form specifically
    const contactForm = document.getElementById('contact-form');
    if (!contactForm) {
      console.log('[NATIVE SELECT] Contact form not found on page');
      return;
    }
    
    console.log('[NATIVE SELECT] Found contact form, applying special fixes');
    
    // Make sure it has special handling for submission
    if (contactForm.getAttribute('data-submission-fixed')) {
      console.log('[NATIVE SELECT] Contact form submission already fixed');
      return;
    }
    
    contactForm.setAttribute('data-submission-fixed', 'true');
    
    // Ensure subject select exists and is working
    let subjectSelect = contactForm.querySelector('select#subject');
    if (!subjectSelect || subjectSelect.style.display === 'none') {
      console.log('[NATIVE SELECT] Subject select missing or hidden, creating new one');
      
      // Find where the subject field should be
      const subjectField = contactForm.querySelector('div:has(label[for="subject"])') ||
                         contactForm.querySelector('div:has(#subject)');
      
      if (subjectField) {
        // Create new select
        subjectSelect = document.createElement('select');
        subjectSelect.id = 'subject';
        subjectSelect.name = 'subject';
        subjectSelect.required = true;
        subjectSelect.className = 'native-select-replacement';
        subjectSelect.setAttribute('data-native-fixed', 'true');
        
        // Style it
        applyNativeSelectStyles(subjectSelect);
        
        // Add options
        addDefaultSubjectOptions(subjectSelect);
        
        // Clear field and add our select
        subjectField.innerHTML = '';
        
        // Add label back
        const label = document.createElement('label');
        label.setAttribute('for', 'subject');
        label.className = 'text-sm font-medium text-zinc-300';
        label.innerHTML = 'Subject <span class="text-red-500">*</span>';
        subjectField.appendChild(label);
        
        // Add select
        subjectField.appendChild(subjectSelect);
        
        console.log('[NATIVE SELECT] Created new subject select field');
      }
    } else {
      console.log('[NATIVE SELECT] Subject select exists');
      
      // Make sure it's visible and working
      if (!subjectSelect.getAttribute('data-native-fixed')) {
        applyNativeSelectStyles(subjectSelect);
        subjectSelect.setAttribute('data-native-fixed', 'true');
      }
    }
    
    // Add direct form submission handling
    contactForm.addEventListener('submit', function(event) {
      event.preventDefault();
      
      console.log('[NATIVE SELECT] Handling contact form submission');
      
      // Get all form values with special handling for selects
      const formData = {};
      const formElements = this.elements;
      
      for (let i = 0; i < formElements.length; i++) {
        const element = formElements[i];
        if (element.name && element.tagName !== 'BUTTON') {
          if (element.tagName === 'SELECT') {
            if (element.selectedIndex >= 0) {
              formData[element.name] = element.options[element.selectedIndex].value;
              console.log(`[NATIVE SELECT] Form field ${element.name}: ${formData[element.name]}`);
            }
          } else {
            formData[element.name] = element.value;
          }
        }
      }
      
      // Add metadata
      formData.form_type = 'contact';
      formData.submitted_at = new Date().toISOString();
      
      // Find message container or create one
      let messageContainer = contactForm.querySelector('.form-message');
      if (!messageContainer) {
        messageContainer = document.createElement('div');
        messageContainer.className = 'form-message';
        contactForm.appendChild(messageContainer);
      }
      
      // Show loading message
      messageContainer.innerHTML = '<div style="padding: 12px; background-color: rgba(52, 152, 219, 0.2); border: 1px solid rgba(52, 152, 219, 0.5); border-radius: 6px; color: white; margin-top: 16px;">Submitting your form...</div>';
      messageContainer.style.display = 'block';
      
      // Submit to webhook
      fetch('https://n8n.backus.agency/webhook/form_filled', {
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
      .then(data => {
        console.log('[NATIVE SELECT] Form submission successful:', data);
        
        // Show success message
        messageContainer.innerHTML = '<div style="padding: 12px; background-color: rgba(46, 204, 113, 0.2); border: 1px solid rgba(46, 204, 113, 0.5); border-radius: 6px; color: white; margin-top: 16px; font-weight: bold;">Thank you! Your message has been sent successfully.</div>';
        messageContainer.style.display = 'block';
        
        // Reset form
        contactForm.reset();
      })
      .catch(error => {
        console.error('[NATIVE SELECT] Form submission error:', error);
        
        // Show error message
        messageContainer.innerHTML = '<div style="padding: 12px; background-color: rgba(231, 76, 60, 0.2); border: 1px solid rgba(231, 76, 60, 0.5); border-radius: 6px; color: white; margin-top: 16px;">Error submitting form: ' + error.message + '</div>';
        messageContainer.style.display = 'block';
      });
    });
    
    console.log('[NATIVE SELECT] Contact form fully fixed');
  }
  
  function fixModalSelects() {
    // Watch for any modal that might open
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.addedNodes && mutation.addedNodes.length) {
          for (let i = 0; i < mutation.addedNodes.length; i++) {
            const node = mutation.addedNodes[i];
            if (node.nodeType === 1) { // ELEMENT_NODE
              // Check if this is a modal or contains selects
              const isModal = node.id === 'tba-modal-container' || 
                            node.classList.contains('modal') || 
                            node.querySelector('.modal');
              
              if (isModal || node.querySelector('select')) {
                console.log('[NATIVE SELECT] Detected new modal or select elements added');
                setTimeout(fixAllSelects, 100);
                break;
              }
            }
          }
        }
      });
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
    
    // Also hook into modal system if available
    if (window.TBAModal) {
      console.log('[NATIVE SELECT] Detected TBAModal system, adding hooks');
      
      const originalOpenModal = window.TBAModal.open;
      window.TBAModal.open = function() {
        const result = originalOpenModal.apply(this, arguments);
        console.log('[NATIVE SELECT] Modal opened, fixing selects');
        setTimeout(fixAllSelects, 100);
        return result;
      };
      
      // Specifically for contact form modal
      if (window.TBAModal.openContactForm) {
        const originalOpenContactForm = window.TBAModal.openContactForm;
        window.TBAModal.openContactForm = function() {
          const result = originalOpenContactForm.apply(this, arguments);
          
          console.log('[NATIVE SELECT] Contact form modal opened, applying fixes');
          setTimeout(() => {
            // Find the contact form in the modal
            const modalContainer = document.getElementById('tba-modal-container');
            if (modalContainer) {
              const modalForm = modalContainer.querySelector('form');
              if (modalForm) {
                // Ensure it has a subject field
                let subjectSelect = modalForm.querySelector('select#subject');
                if (!subjectSelect || subjectSelect.style.display === 'none') {
                  console.log('[NATIVE SELECT] Modal subject select missing or hidden, creating new one');
                  
                  // Find where the subject field should be
                  const subjectField = modalForm.querySelector('div:has(label[for="subject"])') ||
                                    modalForm.querySelector('div:has(#subject)');
                  
                  if (subjectField) {
                    // Create new select
                    subjectSelect = document.createElement('select');
                    subjectSelect.id = 'subject';
                    subjectSelect.name = 'subject';
                    subjectSelect.required = true;
                    subjectSelect.className = 'native-select-replacement';
                    subjectSelect.setAttribute('data-native-fixed', 'true');
                    
                    // Style it
                    applyNativeSelectStyles(subjectSelect);
                    
                    // Add options
                    addDefaultSubjectOptions(subjectSelect);
                    
                    // Clear field and add our select
                    subjectField.innerHTML = '';
                    
                    // Add label back
                    const label = document.createElement('label');
                    label.setAttribute('for', 'subject');
                    label.className = 'text-sm font-medium text-zinc-300';
                    label.innerHTML = 'Subject <span class="text-red-500">*</span>';
                    subjectField.appendChild(label);
                    
                    // Add select
                    subjectField.appendChild(subjectSelect);
                    
                    console.log('[NATIVE SELECT] Created new subject select field in modal');
                  }
                }
                
                // Add budget field if it doesn't exist
                let budgetSelect = modalForm.querySelector('select#budget');
                if (!budgetSelect) {
                  console.log('[NATIVE SELECT] Budget select missing in modal, creating new one');
                  
                  // Find where to insert it (after phone field if it exists)
                  const phoneField = modalForm.querySelector('div:has(#phone)');
                  
                  if (phoneField) {
                    // Create container div
                    const budgetField = document.createElement('div');
                    budgetField.className = 'space-y-2';
                    
                    // Create label
                    const label = document.createElement('label');
                    label.setAttribute('for', 'budget');
                    label.className = 'text-sm font-medium text-zinc-300';
                    label.innerHTML = 'Budget <span class="text-red-500">*</span>';
                    
                    // Create select
                    budgetSelect = document.createElement('select');
                    budgetSelect.id = 'budget';
                    budgetSelect.name = 'budget';
                    budgetSelect.required = true;
                    budgetSelect.className = 'native-select-replacement';
                    budgetSelect.setAttribute('data-native-fixed', 'true');
                    
                    // Style it
                    applyNativeSelectStyles(budgetSelect);
                    
                    // Add options
                    addDefaultBudgetOptions(budgetSelect);
                    
                    // Assemble and insert
                    budgetField.appendChild(label);
                    budgetField.appendChild(budgetSelect);
                    
                    // Add to form in the right place
                    const fieldContainer = phoneField.parentNode;
                    fieldContainer.appendChild(budgetField);
                    
                    console.log('[NATIVE SELECT] Created new budget select field in modal');
                  }
                }
              }
            }
          }, 200);
          
          return result;
        };
      }
    }
    
    console.log('[NATIVE SELECT] Modal observers and hooks in place');
  }
})();