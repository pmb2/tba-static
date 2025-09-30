// Global Initialization Script - Loads on ALL pages
(function() {
    'use strict';

    console.log('🌐 Global Init Starting...');

    // Load Universal Form Tracker on all pages
    function loadUniversalTracker() {
        const script = document.createElement('script');
        script.src = '/js/universal-form-tracker.js';
        script.async = true;
        document.head.appendChild(script);
        console.log('📊 Universal tracker loaded');
    }

    // Load JSONBin handler for assessments on assessment pages
    function loadAssessmentHandler() {
        if (window.location.pathname.includes('security') ||
            window.location.pathname.includes('assessment')) {
            const script = document.createElement('script');
            script.src = '/js/security-assessment-jsonbin.js';
            script.async = true;
            document.head.appendChild(script);
            console.log('🔒 Assessment handler loaded');
        }
    }

    // Initialize
    function init() {
        loadUniversalTracker();
        loadAssessmentHandler();
    }

    // Start when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();