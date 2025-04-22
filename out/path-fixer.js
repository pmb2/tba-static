// Simple Cross-Browser CSS Variables
(function() {
  // Just define CSS variables and do nothing else
  const rootStyle = document.documentElement.style;
  
  // Define primary and secondary colors if they don't exist
  if (!getComputedStyle(document.documentElement).getPropertyValue('--primary')) {
    rootStyle.setProperty('--primary', '#3498db');
  }
  if (!getComputedStyle(document.documentElement).getPropertyValue('--secondary')) {
    rootStyle.setProperty('--secondary', '#2ecc71');
  }
  if (!getComputedStyle(document.documentElement).getPropertyValue('--secondary-light')) {
    rootStyle.setProperty('--secondary-light', '#4cd787');
  }
  if (!getComputedStyle(document.documentElement).getPropertyValue('--primary-foreground')) {
    rootStyle.setProperty('--primary-foreground', '#ffffff');
  }
})();