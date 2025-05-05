/**
 * Dropdown Fix - Specifically targets and fixes all SELECT elements
 * This script will ensure that all dropdown select elements are properly displayed and functional
 */
(function() {
  console.log('[DROPDOWN FIX] Starting dropdown fix script');
  
  function fixAllDropdowns() {
    console.log('[DROPDOWN FIX] Looking for all SELECT elements');
    
    // Find all select elements on the page
    const allSelects = document.querySelectorAll('select');
    
    if (!allSelects || allSelects.length === 0) {
      console.log('[DROPDOWN FIX] No select elements found yet, will retry');
      return;
    }
    
    console.log(`[DROPDOWN FIX] Found ${allSelects.length} select elements`);
    
    // Process each select element
    allSelects.forEach((select, index) => {
      // Skip if already fixed
      if (select.getAttribute('data-dropdown-fixed')) {
        return;
      }
      
      console.log(`[DROPDOWN FIX] Fixing select #${index + 1} with id=${select.id || 'no-id'}`);
      
      // Flag that we've fixed this select
      select.setAttribute('data-dropdown-fixed', 'true');
      
      // Ensure the select element is visible
      select.style.display = 'block';
      select.style.visibility = 'visible';
      select.style.opacity = '1';
      select.style.pointerEvents = 'auto';
      
      // Fix potential z-index issues
      select.style.zIndex = '50';
      select.style.position = 'relative';
      
      // Make sure it has a proper appearance
      select.style.WebkitAppearance = 'menulist';
      select.style.MozAppearance = 'menulist';
      select.style.appearance = 'menulist';
      
      // Ensure proper colors with sufficient contrast
      select.style.color = 'white';
      select.style.backgroundColor = '#333';
      
      // Clone the element to remove any problematic event listeners
      const parent = select.parentNode;
      const nextSibling = select.nextSibling;
      const clone = select.cloneNode(true);
      
      // Remove the original
      select.remove();
      
      // Add the clone
      if (nextSibling) {
        parent.insertBefore(clone, nextSibling);
      } else {
        parent.appendChild(clone);
      }
      
      // Get the fresh reference
      const newSelect = parent.querySelector(`select[id="${select.id}"]`) || 
                     parent.querySelector(`select[name="${select.name}"]`) ||
                     parent.lastElementChild;
      
      if (!newSelect) {
        console.error('[DROPDOWN FIX] Failed to get reference to new select element');
        return;
      }
      
      // Add event listeners for debugging
      newSelect.addEventListener('click', function(e) {
        console.log(`[DROPDOWN FIX] Select clicked: ${this.id || 'no-id'}`);
      });
      
      newSelect.addEventListener('focus', function(e) {
        console.log(`[DROPDOWN FIX] Select focused: ${this.id || 'no-id'}`);
      });
      
      newSelect.addEventListener('change', function(e) {
        const selectedOption = this.options[this.selectedIndex];
        console.log(`[DROPDOWN FIX] Select changed: ${this.id || 'no-id'}, New value: ${this.value}, Text: ${selectedOption ? selectedOption.text : 'unknown'}`);
      });
      
      // Add an empty option if none exists and make sure it shows a prompt
      if (newSelect.options.length === 0 || (newSelect.options[0].value === '' && !newSelect.options[0].text)) {
        const placeholderOption = document.createElement('option');
        placeholderOption.value = '';
        placeholderOption.text = 'Please select...';
        placeholderOption.disabled = true;
        placeholderOption.selected = true;
        newSelect.insertBefore(placeholderOption, newSelect.firstChild);
      }
      
      console.log(`[DROPDOWN FIX] Fixed select element: ${newSelect.id || 'no-id'}`);
      
      // Verify options
      if (newSelect.options.length > 0) {
        console.log(`[DROPDOWN FIX] Select has ${newSelect.options.length} options`);
        for (let i = 0; i < newSelect.options.length; i++) {
          console.log(`[DROPDOWN FIX] Option ${i}: value=${newSelect.options[i].value}, text=${newSelect.options[i].text}`);
        }
      } else {
        console.error(`[DROPDOWN FIX] Select has no options!`);
        
        // Add some default options if none exist
        if (newSelect.id === 'subject' || newSelect.name === 'subject') {
          const options = ['General Inquiry', 'Sales', 'Support', 'Partnership', 'Other'];
          options.forEach(opt => {
            const option = document.createElement('option');
            option.value = opt.toLowerCase().replace(/\s+/g, '-');
            option.text = opt;
            newSelect.appendChild(option);
          });
          console.log('[DROPDOWN FIX] Added default subject options');
        } else if (newSelect.id === 'budget' || newSelect.name === 'budget') {
          const options = ['$5k-$10k', '$10k-$25k', '$25k-$50k', '$50k-$100k', '$100k+'];
          options.forEach(opt => {
            const option = document.createElement('option');
            option.value = opt.toLowerCase().replace(/\s+/g, '-');
            option.text = opt;
            newSelect.appendChild(option);
          });
          console.log('[DROPDOWN FIX] Added default budget options');
        }
      }
      
      // Force browser to redraw/repaint
      newSelect.style.display = 'none';
      setTimeout(() => {
        newSelect.style.display = 'block';
      }, 10);
    });
  }
  
  // Execute our fix function
  function initDropdownFix() {
    console.log('[DROPDOWN FIX] Initializing dropdown fix');
    fixAllDropdowns();
    
    // Monitor for any new select elements that might be added to the DOM
    const observer = new MutationObserver(mutations => {
      let shouldCheck = false;
      
      mutations.forEach(mutation => {
        if (mutation.addedNodes && mutation.addedNodes.length) {
          for (let i = 0; i < mutation.addedNodes.length; i++) {
            const node = mutation.addedNodes[i];
            if (node.nodeType === 1) { // ELEMENT_NODE
              if (node.tagName === 'SELECT') {
                shouldCheck = true;
              } else if (node.querySelector && node.querySelector('select')) {
                shouldCheck = true;
              }
            }
          }
        }
      });
      
      if (shouldCheck) {
        console.log('[DROPDOWN FIX] New SELECT elements detected, applying fixes');
        fixAllDropdowns();
      }
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
    
    // Also fix dropdowns when modals are opened
    if (window.TBAModal) {
      const originalOpenModal = window.TBAModal.open;
      window.TBAModal.open = function() {
        const result = originalOpenModal.apply(this, arguments);
        
        // Fix dropdowns in the modal after a slight delay
        setTimeout(fixAllDropdowns, 100);
        
        return result;
      };
      
      console.log('[DROPDOWN FIX] Hooked into modal system');
    }
    
    // Fix dropdowns periodically to catch any that might have been missed
    setTimeout(fixAllDropdowns, 1000);
    setTimeout(fixAllDropdowns, 2000);
    setTimeout(fixAllDropdowns, 5000);
  }
  
  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initDropdownFix);
  } else {
    // DOM is already ready, call directly
    initDropdownFix();
  }
  
  // Also initialize on window load
  window.addEventListener('load', initDropdownFix);
})();