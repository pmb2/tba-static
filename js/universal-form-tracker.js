// Universal Form Tracker - Captures ALL form submissions across the entire site
// Stores them in JSONBin cloud for cross-location access
(function() {
    'use strict';

    // JSONBin.io Configuration (same as assessment tracker)
    const JSONBIN_API_KEY = '$2a$10$wiqbQnJrm29tc73dCO/xcOWvjVbXfUAZsPAYGqGCJ8pIXAOPaIuYS';
    const JSONBIN_BASE_URL = 'https://api.jsonbin.io/v3';
    let UNIVERSAL_BIN_ID = localStorage.getItem('jsonbin_universal_tracker_bin_id') || null;

    // Configuration
    const STORAGE_KEY = 'site_interactions';
    const FORMSPREE_ENDPOINT = 'https://formspree.io/f/xjkgvqll'; // Backup endpoint

    console.log('🔍 Universal Form Tracker Initialized');

    // Create or get JSONBin bin for all interactions
    async function ensureUniversalBin() {
        if (UNIVERSAL_BIN_ID) {
            return UNIVERSAL_BIN_ID;
        }

        try {
            // Create a new bin for all site interactions
            const response = await fetch(`${JSONBIN_BASE_URL}/b`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Master-Key': JSONBIN_API_KEY,
                    'X-Bin-Name': 'Site Interactions Tracker',
                    'X-Bin-Private': 'false'
                },
                body: JSON.stringify({
                    interactions: [],
                    forms: [],
                    clicks: [],
                    lastUpdated: new Date().toISOString()
                })
            });

            if (response.ok) {
                const data = await response.json();
                UNIVERSAL_BIN_ID = data.metadata.id;
                localStorage.setItem('jsonbin_universal_tracker_bin_id', UNIVERSAL_BIN_ID);
                console.log('Created Universal Tracker Bin:', UNIVERSAL_BIN_ID);
                return UNIVERSAL_BIN_ID;
            }
        } catch (error) {
            console.error('Failed to create Universal Bin:', error);
        }

        // Fallback bin ID
        UNIVERSAL_BIN_ID = '678d4b9cad19ca34f8dd6d8e';
        return UNIVERSAL_BIN_ID;
    }

    // Fetch all interactions from JSONBin
    async function fetchInteractions() {
        const binId = await ensureUniversalBin();

        try {
            const response = await fetch(`${JSONBIN_BASE_URL}/b/${binId}/latest`, {
                method: 'GET',
                headers: {
                    'X-Master-Key': JSONBIN_API_KEY
                }
            });

            if (response.ok) {
                const data = await response.json();
                return data.record || { interactions: [], forms: [], clicks: [] };
            }
        } catch (error) {
            console.error('Failed to fetch interactions:', error);
        }

        return { interactions: [], forms: [], clicks: [] };
    }

    // Save interaction to JSONBin
    async function saveInteraction(interaction) {
        const binId = await ensureUniversalBin();

        try {
            // Fetch existing data
            const existingData = await fetchInteractions();

            // Add new interaction
            existingData.interactions.push(interaction);

            // Also categorize by type
            if (interaction.type === 'form_submission') {
                existingData.forms.push(interaction);
            } else if (interaction.type === 'button_click') {
                existingData.clicks.push(interaction);
            }

            // Keep only last 200 interactions
            existingData.interactions = existingData.interactions.slice(-200);
            existingData.forms = existingData.forms.slice(-100);
            existingData.clicks = existingData.clicks.slice(-100);

            // Update the bin
            const response = await fetch(`${JSONBIN_BASE_URL}/b/${binId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Master-Key': JSONBIN_API_KEY
                },
                body: JSON.stringify({
                    ...existingData,
                    lastUpdated: new Date().toISOString(),
                    totalCount: existingData.interactions.length
                })
            });

            if (response.ok) {
                console.log('✅ Interaction saved to cloud');
                return true;
            }
        } catch (error) {
            console.error('Failed to save interaction:', error);
        }

        return false;
    }

    // Capture form data
    function captureFormData(form) {
        const formData = new FormData(form);
        const data = {};

        // Extract all form fields
        for (let [key, value] of formData.entries()) {
            // Handle multiple values for same key (like checkboxes)
            if (data[key]) {
                if (Array.isArray(data[key])) {
                    data[key].push(value);
                } else {
                    data[key] = [data[key], value];
                }
            } else {
                data[key] = value;
            }
        }

        // Add form metadata
        data._formId = form.id || 'unnamed_form';
        data._formClass = form.className || '';
        data._formAction = form.action || '';
        data._formMethod = form.method || 'GET';

        return data;
    }

    // Get user's IP address using free service
    async function getUserIP() {
        try {
            const response = await fetch('https://api.ipify.org?format=json');
            const data = await response.json();
            return data.ip;
        } catch (error) {
            console.error('Failed to get IP:', error);
            return 'Unknown';
        }
    }

    // Get user's location from IP
    async function getUserLocation(ip) {
        try {
            // Using free IP geolocation service
            const response = await fetch(`https://ipapi.co/${ip}/json/`);
            const data = await response.json();
            return {
                ip: ip,
                city: data.city || 'Unknown',
                region: data.region || 'Unknown',
                country: data.country_name || 'Unknown',
                countryCode: data.country_code || 'XX',
                postal: data.postal || 'Unknown',
                latitude: data.latitude || 0,
                longitude: data.longitude || 0,
                timezone: data.timezone || 'Unknown',
                org: data.org || 'Unknown'
            };
        } catch (error) {
            console.error('Failed to get location:', error);
            return {
                ip: ip,
                city: 'Unknown',
                region: 'Unknown',
                country: 'Unknown',
                countryCode: 'XX'
            };
        }
    }

    // Cache IP and location data
    let cachedIPData = null;
    let ipFetchPromise = null;

    async function getIPAndLocation() {
        if (cachedIPData) {
            return cachedIPData;
        }

        if (!ipFetchPromise) {
            ipFetchPromise = (async () => {
                const ip = await getUserIP();
                const location = await getUserLocation(ip);
                cachedIPData = location;
                return location;
            })();
        }

        return ipFetchPromise;
    }

    // Track form submission
    async function trackFormSubmission(form, eventType = 'submit') {
        const formData = captureFormData(form);

        // Get IP and location data
        const locationData = await getIPAndLocation();

        // Create interaction record
        const interaction = {
            id: 'INT_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
            type: 'form_submission',
            timestamp: new Date().toISOString(),
            page: window.location.pathname,
            pageTitle: document.title,
            pageUrl: window.location.href,
            referrer: document.referrer,
            formData: formData,
            eventType: eventType,
            userAgent: navigator.userAgent,
            screenResolution: `${screen.width}x${screen.height}`,
            language: navigator.language,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            // IP and Location data
            ipAddress: locationData.ip,
            location: {
                city: locationData.city,
                region: locationData.region,
                country: locationData.country,
                countryCode: locationData.countryCode,
                postal: locationData.postal,
                coordinates: {
                    lat: locationData.latitude,
                    lng: locationData.longitude
                }
            },
            network: locationData.org
        };

        // Save to localStorage
        saveToLocal(interaction);

        // Save to cloud
        saveInteraction(interaction).then(success => {
            if (success) {
                console.log('📊 Form tracked:', interaction.id);
            }
        });

        // Also send critical contact forms to Formspree
        if (formData.email || formData.phone || formData.contact) {
            sendToFormspree(interaction);
        }

        return interaction;
    }

    // Save to localStorage
    function saveToLocal(interaction) {
        try {
            let existing = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
            existing.push(interaction);

            // Keep only last 50
            if (existing.length > 50) {
                existing = existing.slice(-50);
            }

            localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
            return true;
        } catch (error) {
            console.error('Failed to save locally:', error);
            return false;
        }
    }

    // Send important forms to Formspree as backup
    function sendToFormspree(interaction) {
        const formData = {
            _subject: `Site Interaction: ${interaction.page}`,
            interaction_id: interaction.id,
            type: interaction.type,
            page: interaction.page,
            timestamp: interaction.timestamp,
            data: JSON.stringify(interaction.formData)
        };

        fetch(FORMSPREE_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(formData)
        }).catch(error => {
            console.error('Formspree backup failed:', error);
        });
    }

    // Track button clicks
    function trackButtonClick(button) {
        const interaction = {
            id: 'BTN_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
            type: 'button_click',
            timestamp: new Date().toISOString(),
            page: window.location.pathname,
            pageUrl: window.location.href,
            buttonText: button.textContent || button.innerText || '',
            buttonClass: button.className || '',
            buttonId: button.id || '',
            buttonHref: button.href || button.getAttribute('data-href') || ''
        };

        saveToLocal(interaction);
        saveInteraction(interaction);

        return interaction;
    }

    // Intercept all form submissions
    function interceptForms() {
        // Track traditional form submits
        document.addEventListener('submit', function(event) {
            const form = event.target;

            // Skip if it's our own assessment form (already tracked)
            if (form.id === 'assessmentForm' || form.classList.contains('assessment-form')) {
                return;
            }

            console.log('📝 Form submission detected:', form);
            trackFormSubmission(form, 'submit');

            // For AJAX forms, don't prevent default
            // For traditional forms, we still let them submit normally
        }, true);

        // Track form changes for abandoned forms
        let formChangeTimers = new Map();

        document.addEventListener('change', function(event) {
            const form = event.target.closest('form');
            if (!form) return;

            // Clear existing timer
            if (formChangeTimers.has(form)) {
                clearTimeout(formChangeTimers.get(form));
            }

            // Set new timer - if no activity for 30 seconds, consider it abandoned
            const timer = setTimeout(() => {
                const interaction = trackFormSubmission(form, 'abandoned');
                interaction.type = 'form_abandoned';
                console.log('⚠️ Form abandoned:', form);
            }, 30000);

            formChangeTimers.set(form, timer);
        }, true);

        // Clear timers when form is submitted
        document.addEventListener('submit', function(event) {
            const form = event.target;
            if (formChangeTimers.has(form)) {
                clearTimeout(formChangeTimers.get(form));
                formChangeTimers.delete(form);
            }
        }, true);
    }

    // Intercept AJAX requests (for modern forms)
    function interceptAjax() {
        // Intercept Fetch API
        const originalFetch = window.fetch;
        window.fetch = function(...args) {
            const [url, options] = args;

            // Track if this looks like a form submission
            if (options && options.method && options.method.toUpperCase() === 'POST') {
                if (options.body) {
                    let bodyData = {};
                    try {
                        if (typeof options.body === 'string') {
                            bodyData = JSON.parse(options.body);
                        } else if (options.body instanceof FormData) {
                            for (let [key, value] of options.body.entries()) {
                                bodyData[key] = value;
                            }
                        }
                    } catch (e) {
                        bodyData = { raw: options.body };
                    }

                    const interaction = {
                        id: 'AJAX_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
                        type: 'ajax_submission',
                        timestamp: new Date().toISOString(),
                        page: window.location.pathname,
                        pageUrl: window.location.href,
                        endpoint: url,
                        method: 'POST',
                        data: bodyData
                    };

                    saveToLocal(interaction);
                    saveInteraction(interaction);
                    console.log('🔄 AJAX submission tracked:', url);
                }
            }

            return originalFetch.apply(this, args);
        };

        // Intercept XMLHttpRequest
        const originalOpen = XMLHttpRequest.prototype.open;
        const originalSend = XMLHttpRequest.prototype.send;

        XMLHttpRequest.prototype.open = function(method, url) {
            this._trackingMethod = method;
            this._trackingUrl = url;
            return originalOpen.apply(this, arguments);
        };

        XMLHttpRequest.prototype.send = function(data) {
            if (this._trackingMethod && this._trackingMethod.toUpperCase() === 'POST') {
                let bodyData = {};
                try {
                    if (typeof data === 'string') {
                        bodyData = JSON.parse(data);
                    }
                } catch (e) {
                    bodyData = { raw: data };
                }

                const interaction = {
                    id: 'XHR_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
                    type: 'xhr_submission',
                    timestamp: new Date().toISOString(),
                    page: window.location.pathname,
                    pageUrl: window.location.href,
                    endpoint: this._trackingUrl,
                    method: 'POST',
                    data: bodyData
                };

                saveToLocal(interaction);
                saveInteraction(interaction);
                console.log('📡 XHR submission tracked:', this._trackingUrl);
            }

            return originalSend.apply(this, arguments);
        };
    }

    // Track important button clicks
    function trackButtons() {
        document.addEventListener('click', function(event) {
            const target = event.target;

            // Track CTA buttons
            if (target.tagName === 'BUTTON' || target.tagName === 'A') {
                const isImportant =
                    target.classList.contains('cta') ||
                    target.classList.contains('btn-primary') ||
                    target.classList.contains('submit') ||
                    target.textContent.toLowerCase().includes('started') ||
                    target.textContent.toLowerCase().includes('contact') ||
                    target.textContent.toLowerCase().includes('demo') ||
                    target.textContent.toLowerCase().includes('trial');

                if (isImportant) {
                    trackButtonClick(target);
                    console.log('🎯 Important button clicked:', target.textContent);
                }
            }
        }, true);
    }

    // Public API for manual tracking
    window.trackInteraction = function(type, data) {
        const interaction = {
            id: 'MANUAL_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
            type: type || 'manual',
            timestamp: new Date().toISOString(),
            page: window.location.pathname,
            pageUrl: window.location.href,
            data: data
        };

        saveToLocal(interaction);
        saveInteraction(interaction);

        return interaction;
    };

    // Get all tracked interactions
    window.getAllInteractions = async function() {
        const cloudData = await fetchInteractions();
        const localData = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');

        // Merge and deduplicate
        const allInteractions = [...cloudData.interactions];
        const existingIds = new Set(cloudData.interactions.map(i => i.id));

        localData.forEach(interaction => {
            if (!existingIds.has(interaction.id)) {
                allInteractions.push(interaction);
            }
        });

        return allInteractions.sort((a, b) =>
            new Date(b.timestamp) - new Date(a.timestamp)
        );
    };

    // Initialize tracking
    function init() {
        // Ensure bin exists
        ensureUniversalBin().then(binId => {
            if (binId) {
                console.log('✅ Universal tracking ready:', binId);
            }
        });

        // Start intercepting
        interceptForms();
        interceptAjax();
        trackButtons();

        console.log('🚀 Universal Form Tracker Active');
        console.log('Tracking: Forms, AJAX calls, Button clicks');
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();