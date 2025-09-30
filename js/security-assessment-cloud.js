// Security Assessment Cloud Storage Handler
(function() {
    'use strict';

    // Configuration - Using JSONBin.io for free cloud storage
    const JSONBIN_API_KEY = '$2b$10$YOUR_API_KEY'; // You'll need to get a free API key from jsonbin.io
    const JSONBIN_BIN_ID = 'YOUR_BIN_ID'; // Will be created on first use
    const FORMSPREE_ENDPOINT = 'https://formspree.io/f/xjkgvqll';
    const STORAGE_KEY = 'security_assessments';

    // For now, let's use a simpler approach with Google Sheets as backend
    // This is the Google Apps Script Web App URL (we'll create this)
    const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwYourScriptId/exec';

    // Get URL parameters
    function getUrlParams() {
        const params = new URLSearchParams(window.location.search);
        return {
            ref: params.get('ref') || '',
            trackingId: params.get('track') || ''
        };
    }

    // Override the original submit function
    window.submitAssessmentSimple = function(assessmentData) {
        // Add timestamp and ID
        assessmentData.submittedAt = new Date().toISOString();
        assessmentData.submissionId = 'SA_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);

        // Add tracking information from URL
        const urlParams = getUrlParams();
        if (urlParams.ref) {
            assessmentData.referenceSource = urlParams.ref;
        }
        if (urlParams.trackingId) {
            assessmentData.trackingId = urlParams.trackingId;
            markLinkUsed(urlParams.trackingId);
        }

        // Add source information
        assessmentData.source = urlParams.trackingId ? 'Unique Link' : 'Direct';
        assessmentData.pageUrl = window.location.href;

        // Save to localStorage first (for immediate feedback)
        saveToLocal(assessmentData);

        // Send to cloud storage (Google Sheets via Apps Script)
        sendToCloud(assessmentData);

        // Send to Formspree
        sendToFormspree(assessmentData);

        return assessmentData;
    };

    // Save to localStorage
    function saveToLocal(data) {
        try {
            let existing = [];
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                try {
                    existing = JSON.parse(stored);
                    if (!Array.isArray(existing)) {
                        existing = [];
                    }
                } catch (e) {
                    existing = [];
                }
            }

            existing.push(data);

            if (existing.length > 50) {
                existing = existing.slice(-50);
            }

            localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
            console.log('Assessment saved locally:', data.submissionId);
            return true;
        } catch (error) {
            console.error('Failed to save locally:', error);
            return false;
        }
    }

    // Send to cloud storage (using Google Sheets as free database)
    function sendToCloud(data) {
        // For now, we'll use a public Google Form as a workaround
        // This will store data in Google Sheets which can be accessed from anywhere
        const googleFormUrl = 'https://docs.google.com/forms/d/e/YOUR_FORM_ID/formResponse';

        // Map your data to Google Form entry IDs
        const formData = new FormData();
        formData.append('entry.1234567890', data.submissionId);
        formData.append('entry.0987654321', data.companyName);
        formData.append('entry.1111111111', data.contactName);
        formData.append('entry.2222222222', data.contactEmail);
        formData.append('entry.3333333333', JSON.stringify(data));

        // Send to Google Form (this will save to Google Sheets)
        fetch(googleFormUrl, {
            method: 'POST',
            mode: 'no-cors',
            body: formData
        })
        .then(() => {
            console.log('Assessment sent to cloud storage');
            localStorage.setItem('cloud_sync_' + data.submissionId, 'success');
        })
        .catch(error => {
            console.error('Failed to send to cloud:', error);
            localStorage.setItem('cloud_sync_' + data.submissionId, 'failed');
        });

        // Alternative: Send to a free service like Pantry Cloud
        sendToPantry(data);
    }

    // Alternative cloud storage using Pantry (free JSON storage)
    function sendToPantry(data) {
        const PANTRY_ID = 'YOUR_PANTRY_ID'; // Get from https://getpantry.cloud/
        const BASKET_NAME = 'assessments';

        fetch(`https://getpantry.cloud/apiv1/pantry/${PANTRY_ID}/basket/${BASKET_NAME}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                [data.submissionId]: data
            })
        })
        .then(response => response.json())
        .then(result => {
            console.log('Saved to Pantry cloud:', result);
        })
        .catch(error => {
            console.error('Pantry error:', error);
        });
    }

    // Send to Formspree
    function sendToFormspree(data) {
        const formData = {
            _subject: `Security Assessment: ${data.companyName}`,
            submission_id: data.submissionId,
            name: data.contactName,
            email: data.contactEmail,
            _replyto: data.contactEmail,
            company: data.companyName,
            role: data.contactRole || 'Not specified',
            industry: data.industry || 'Not specified',
            company_size: data.companySize || 'Not specified',
            maturity_level: data.maturityLevel || 'Not specified',
            previous_assessment: data.previousAssessment || 'Not specified',
            recent_incidents: data.recentIncidents || 'Not specified',
            concerns: Array.isArray(data.concerns) ? data.concerns.join(', ') : (data.concerns || 'None'),
            services: Array.isArray(data.services) ? data.services.join(', ') : (data.services || 'None'),
            timeline: data.timeline || 'Not specified',
            budget: data.budget || 'Not specified',
            additional_context: data.additionalContext || 'None',
            schedule_consultation: data.scheduleConsultation || 'Not specified',
            assessment_score: data.assessmentScore || 0,
            submitted_at: data.submittedAt,
            tracking_id: data.trackingId || 'None',
            reference_source: data.referenceSource || 'Direct'
        };

        fetch(FORMSPREE_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(formData)
        })
        .then(response => {
            if (response.ok) {
                console.log('Assessment sent to Formspree successfully');
                localStorage.setItem('last_sent_' + data.submissionId, 'success');
            } else {
                console.error('Formspree error:', response.status);
                localStorage.setItem('last_sent_' + data.submissionId, 'failed');
            }
        })
        .catch(error => {
            console.error('Failed to send to Formspree:', error);
            localStorage.setItem('last_sent_' + data.submissionId, 'error');
        });
    }

    // Function to retrieve all assessments from cloud
    window.getAllAssessmentsFromCloud = function() {
        const PANTRY_ID = 'YOUR_PANTRY_ID';
        const BASKET_NAME = 'assessments';

        return fetch(`https://getpantry.cloud/apiv1/pantry/${PANTRY_ID}/basket/${BASKET_NAME}`)
            .then(response => response.json())
            .then(data => {
                // Convert object to array
                const assessments = Object.values(data);
                console.log('Retrieved from cloud:', assessments.length, 'assessments');
                return assessments;
            })
            .catch(error => {
                console.error('Failed to retrieve from cloud:', error);
                // Fallback to local storage
                return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
            });
    };

    // Mark link as used
    function markLinkUsed(trackingId) {
        try {
            let links = JSON.parse(localStorage.getItem('assessment_links') || '[]');
            const linkIndex = links.findIndex(l => l.trackingId === trackingId);
            if (linkIndex !== -1) {
                links[linkIndex].used = true;
                links[linkIndex].usedAt = new Date().toISOString();
                localStorage.setItem('assessment_links', JSON.stringify(links));
                console.log('Link marked as used:', trackingId);
            }
        } catch (error) {
            console.error('Error marking link as used:', error);
        }
    }

    // Display tracking info if present
    function displayTrackingInfo() {
        const urlParams = getUrlParams();
        if (urlParams.ref || urlParams.trackingId) {
            console.log('Assessment loaded with tracking:', {
                reference: urlParams.ref,
                trackingId: urlParams.trackingId
            });
        }
    }

    // Initialize
    displayTrackingInfo();
    console.log('Security Assessment Cloud Handler loaded');
    console.log('Note: You need to set up a cloud storage service for cross-location access');
    console.log('Options: 1) Pantry Cloud (free), 2) Google Sheets, 3) JSONBin.io');
})();