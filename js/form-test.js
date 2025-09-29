/**
 * Form Test Script
 * This script logs form submissions and tests different submission methods
 */
(function() {
  console.log('Form test script loaded');
  
  // Configuration
  const N8N_WEBHOOK = 'https://n8n.backus.agency/webhook/form_filled';
  
  // Create a test div to display results
  function createTestDiv() {
    const existingDiv = document.getElementById('form-test-results');
    if (existingDiv) {
      return existingDiv;
    }
    
    const div = document.createElement('div');
    div.id = 'form-test-results';
    div.style.position = 'fixed';
    div.style.bottom = '10px';
    div.style.right = '10px';
    div.style.width = '300px';
    div.style.maxHeight = '400px';
    div.style.overflowY = 'auto';
    div.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
    div.style.color = 'white';
    div.style.padding = '10px';
    div.style.borderRadius = '5px';
    div.style.fontSize = '12px';
    div.style.zIndex = '9999';
    div.style.fontFamily = 'monospace';
    
    const heading = document.createElement('h3');
    heading.textContent = 'Form Test Results';
    heading.style.margin = '0 0 10px 0';
    heading.style.borderBottom = '1px solid white';
    heading.style.paddingBottom = '5px';
    
    const clearButton = document.createElement('button');
    clearButton.textContent = 'Clear';
    clearButton.style.position = 'absolute';
    clearButton.style.top = '10px';
    clearButton.style.right = '10px';
    clearButton.style.padding = '2px 5px';
    clearButton.style.fontSize = '10px';
    clearButton.style.cursor = 'pointer';
    clearButton.addEventListener('click', function() {
      const results = div.querySelector('.test-results');
      results.innerHTML = '';
    });
    
    const results = document.createElement('div');
    results.className = 'test-results';
    
    div.appendChild(heading);
    div.appendChild(clearButton);
    div.appendChild(results);
    
    document.body.appendChild(div);
    return div;
  }
  
  // Add a log entry to the test div
  function logToTestDiv(message, type = 'info') {
    const div = createTestDiv();
    const results = div.querySelector('.test-results');
    
    const entry = document.createElement('div');
    entry.className = `test-entry test-${type}`;
    entry.style.marginBottom = '5px';
    entry.style.paddingBottom = '5px';
    entry.style.borderBottom = '1px dotted rgba(255, 255, 255, 0.3)';
    
    const timestamp = new Date().toLocaleTimeString();
    const timeSpan = document.createElement('span');
    timeSpan.textContent = `[${timestamp}] `;
    timeSpan.style.opacity = '0.7';
    
    const textSpan = document.createElement('span');
    textSpan.textContent = message;
    
    if (type === 'error') {
      entry.style.color = '#ff6b6b';
    } else if (type === 'success') {
      entry.style.color = '#5dff7f';
    } else if (type === 'warn') {
      entry.style.color = '#ffd96b';
    }
    
    entry.appendChild(timeSpan);
    entry.appendChild(textSpan);
    results.appendChild(entry);
    
    // Auto-scroll to bottom
    results.scrollTop = results.scrollHeight;
  }
  
  // Listen for form submissions
  function listenForFormSubmissions() {
    // Track all form submissions
    document.addEventListener('submit', function(event) {
      const form = event.target;
      logToTestDiv(`Form submission detected: ${form.id || 'unnamed form'}`, 'info');
      
      // Collect form data for logging
      const formData = {};
      for (let i = 0; i < form.elements.length; i++) {
        const element = form.elements[i];
        if (element.name && element.value) {
          if (element.type === 'password') {
            formData[element.name] = '********';
          } else if (element.nodeName === 'SELECT' && element.selectedIndex >= 0) {
            try {
              formData[element.name] = element.options[element.selectedIndex].value;
            } catch (e) {
              formData[element.name] = element.value;
            }
          } else {
            formData[element.name] = element.value;
          }
        }
      }
      
      logToTestDiv(`Form data: ${JSON.stringify(formData)}`, 'info');
    }, true); // Use capture to get the event first
    
    // Override fetch to log webhook submissions
    const originalFetch = window.fetch;
    window.fetch = function(resource, options = {}) {
      let url = resource;
      if (typeof resource === 'object' && resource.url) {
        url = resource.url;
      }
      
      if (typeof url === 'string' && url.includes('n8n.backus.agency')) {
        logToTestDiv(`Fetch to webhook: ${url}`, 'info');
        logToTestDiv(`Fetch options: ${JSON.stringify(options)}`, 'info');
        
        // Test all fetch methods when webhook is called
        testAllSubmissionMethods();
      }
      
      return originalFetch.apply(this, arguments)
        .then(response => {
          if (typeof url === 'string' && url.includes('n8n.backus.agency')) {
            logToTestDiv(`Fetch response status: ${response.status}`, response.ok ? 'success' : 'error');
            
            // Clone the response so we can both read it and return it
            const clone = response.clone();
            
            // Try to read the response body
            clone.text().then(body => {
              try {
                logToTestDiv(`Response body: ${body.substring(0, 100)}${body.length > 100 ? '...' : ''}`, 'info');
              } catch (e) {
                logToTestDiv(`Could not read response body: ${e.message}`, 'error');
              }
            }).catch(error => {
              logToTestDiv(`Error reading response: ${error.message}`, 'error');
            });
          }
          return response;
        })
        .catch(error => {
          if (typeof url === 'string' && url.includes('n8n.backus.agency')) {
            logToTestDiv(`Fetch error: ${error.message}`, 'error');
          }
          throw error;
        });
    };
    
    // Override XMLHttpRequest to log webhook submissions
    const originalOpen = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function(method, url, async, user, password) {
      if (typeof url === 'string' && url.includes('n8n.backus.agency')) {
        this._isWebhookRequest = true;
        logToTestDiv(`XHR to webhook: ${url}`, 'info');
      }
      return originalOpen.apply(this, arguments);
    };
    
    const originalSend = XMLHttpRequest.prototype.send;
    XMLHttpRequest.prototype.send = function(data) {
      if (this._isWebhookRequest) {
        logToTestDiv(`XHR send data: ${data ? data.substring(0, 100) + (data.length > 100 ? '...' : '') : 'none'}`, 'info');
        
        // Add load and error listeners
        this.addEventListener('load', function() {
          logToTestDiv(`XHR response status: ${this.status}`, (this.status >= 200 && this.status < 300) ? 'success' : 'error');
          try {
            logToTestDiv(`XHR response: ${this.responseText.substring(0, 100)}${this.responseText.length > 100 ? '...' : ''}`, 'info');
          } catch (e) {
            logToTestDiv(`Could not read XHR response: ${e.message}`, 'error');
          }
        });
        
        this.addEventListener('error', function() {
          logToTestDiv('XHR network error', 'error');
        });
      }
      return originalSend.apply(this, arguments);
    };
    
    // Override sendBeacon to log webhook submissions
    const originalSendBeacon = navigator.sendBeacon;
    if (originalSendBeacon) {
      navigator.sendBeacon = function(url, data) {
        if (typeof url === 'string' && url.includes('n8n.backus.agency')) {
          logToTestDiv(`sendBeacon to webhook: ${url}`, 'info');
          if (data) {
            try {
              const dataString = data instanceof Blob ? 'Blob data' : 
                                  data instanceof FormData ? 'FormData' : 
                                  data instanceof URLSearchParams ? data.toString() : 
                                  typeof data === 'string' ? data : JSON.stringify(data);
              logToTestDiv(`sendBeacon data: ${dataString.substring(0, 100)}${dataString.length > 100 ? '...' : ''}`, 'info');
            } catch (e) {
              logToTestDiv(`Could not read sendBeacon data: ${e.message}`, 'warn');
            }
          }
        }
        return originalSendBeacon.apply(this, arguments);
      };
    }
  }
  
  // Test all submission methods
  function testAllSubmissionMethods() {
    // Create test data
    const testData = {
      test: true,
      timestamp: new Date().toISOString(),
      method: 'auto-test'
    };
    
    logToTestDiv('Starting auto-test of all submission methods...', 'info');
    
    // Method 1: Fetch with credentials
    logToTestDiv('Testing Method 1: fetch with credentials', 'info');
    fetch(N8N_WEBHOOK, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Origin': window.location.origin
      },
      credentials: 'include',
      body: JSON.stringify({...testData, method: 'fetch-credentials'})
    })
    .then(response => {
      logToTestDiv(`Method 1 response status: ${response.status}`, response.ok ? 'success' : 'error');
      return response.text();
    })
    .then(text => {
      logToTestDiv(`Method 1 response: ${text.substring(0, 100)}${text.length > 100 ? '...' : ''}`, 'info');
    })
    .catch(error => {
      logToTestDiv(`Method 1 error: ${error.message}`, 'error');
    })
    .finally(() => {
      // Method 2: Fetch with no-cors
      logToTestDiv('Testing Method 2: fetch with no-cors', 'info');
      fetch(N8N_WEBHOOK, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        mode: 'no-cors',
        body: JSON.stringify({...testData, method: 'fetch-no-cors'})
      })
      .then(() => {
        // Cannot read response with no-cors
        logToTestDiv('Method 2 completed (cannot read response with no-cors)', 'success');
      })
      .catch(error => {
        logToTestDiv(`Method 2 error: ${error.message}`, 'error');
      })
      .finally(() => {
        // Method 3: XMLHttpRequest
        logToTestDiv('Testing Method 3: XMLHttpRequest', 'info');
        const xhr = new XMLHttpRequest();
        xhr.open('POST', N8N_WEBHOOK, true);
        xhr.setRequestHeader('Content-Type', 'application/json');
        
        xhr.onload = function() {
          logToTestDiv(`Method 3 response status: ${xhr.status}`, (xhr.status >= 200 && xhr.status < 300) ? 'success' : 'error');
          logToTestDiv(`Method 3 response: ${xhr.responseText.substring(0, 100)}${xhr.responseText.length > 100 ? '...' : ''}`, 'info');
        };
        
        xhr.onerror = function() {
          logToTestDiv('Method 3 network error', 'error');
        };
        
        xhr.send(JSON.stringify({...testData, method: 'xhr'}));
        
        // Method 4: sendBeacon
        if (navigator.sendBeacon) {
          logToTestDiv('Testing Method 4: sendBeacon', 'info');
          const blob = new Blob([JSON.stringify({...testData, method: 'sendBeacon'})], {type: 'application/json'});
          const result = navigator.sendBeacon(N8N_WEBHOOK, blob);
          logToTestDiv(`Method 4 result: ${result ? 'accepted' : 'rejected'}`, result ? 'success' : 'error');
        } else {
          logToTestDiv('Method 4: sendBeacon not available in this browser', 'warn');
        }
      });
    });
  }
  
  // Initialize the test environment
  function initialize() {
    logToTestDiv('Form test initialized', 'info');
    
    // // Add a test button to manually trigger tests
    // const button = document.createElement('button');
    // button.textContent = 'Test Submission Methods';
    // button.style.position = 'fixed';
    // button.style.bottom = '420px';  // Position above the test results div
    // button.style.right = '10px';
    // button.style.padding = '5px 10px';
    // button.style.backgroundColor = '#4a90e2';
    // button.style.color = 'white';
    // button.style.border = 'none';
    // button.style.borderRadius = '5px';
    // button.style.cursor = 'pointer';
    // button.style.zIndex = '9999';
    
    button.addEventListener('click', function() {
      testAllSubmissionMethods();
    });
    
    document.body.appendChild(button);
    
    // Set up form submission listeners
    listenForFormSubmissions();
  }
  
  // Run on page load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize);
  } else {
    // DOM already loaded
    initialize();
  }
})();