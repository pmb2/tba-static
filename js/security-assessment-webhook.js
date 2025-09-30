// Security Assessment Webhook Handler - Works Across All Locations
(function() {
    'use strict';

    // Configuration
    const FORMSPREE_ENDPOINT = 'https://formspree.io/f/xjkgvqll';
    const STORAGE_KEY = 'security_assessments';

    // Free webhook service that stores data (no setup required)
    // Using webhook.site for testing, or n8n.io webhook for production
    const WEBHOOK_ENDPOINT = 'https://webhook.site/YOUR-UNIQUE-ID'; // Get free ID from webhook.site

    // Alternative: Use a free service like Pipedream
    const PIPEDREAM_WEBHOOK = 'https://YOUR-ID.m.pipedream.net'; // Get from pipedream.com

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

        // Send to webhook for cross-location storage
        sendToWebhook(assessmentData);

        // Send to Formspree (this already works and sends emails)
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

    // Send to webhook for centralized storage
    function sendToWebhook(data) {
        // Send to webhook endpoint
        fetch(WEBHOOK_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            mode: 'no-cors', // Important for cross-origin requests
            body: JSON.stringify(data)
        })
        .then(() => {
            console.log('Assessment sent to webhook');
            localStorage.setItem('webhook_sync_' + data.submissionId, 'sent');
        })
        .catch(error => {
            console.error('Webhook error:', error);
            // Don't worry if webhook fails, we still have Formspree
        });
    }

    // Enhanced Formspree submission that ensures data is captured
    function sendToFormspree(data) {
        // Create a more detailed submission for Formspree
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
            reference_source: data.referenceSource || 'Direct',
            // Add full JSON backup in a hidden field
            full_data: JSON.stringify(data)
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

                // Show success message to user
                if (window.showSuccessMessage) {
                    window.showSuccessMessage('Your assessment has been submitted successfully!');
                }
            } else {
                console.error('Formspree error:', response.status);
                localStorage.setItem('last_sent_' + data.submissionId, 'failed');

                // Still save the data locally
                saveBackupData(data);
            }
        })
        .catch(error => {
            console.error('Failed to send to Formspree:', error);
            localStorage.setItem('last_sent_' + data.submissionId, 'error');

            // Save backup data
            saveBackupData(data);
        });
    }

    // Save backup data when online submission fails
    function saveBackupData(data) {
        const backupKey = 'assessment_backup_' + Date.now();
        localStorage.setItem(backupKey, JSON.stringify(data));
        console.log('Assessment saved as backup:', backupKey);

        // Try to send when back online
        window.addEventListener('online', () => {
            resendBackups();
        });
    }

    // Resend backed up assessments when online
    function resendBackups() {
        const keys = Object.keys(localStorage);
        const backupKeys = keys.filter(k => k.startsWith('assessment_backup_'));

        backupKeys.forEach(key => {
            const data = JSON.parse(localStorage.getItem(key));
            if (data) {
                sendToFormspree(data);
                sendToWebhook(data);
                // Remove backup after sending
                localStorage.removeItem(key);
            }
        });
    }

    // Function to retrieve all assessments
    window.getAllAssessments = function() {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                return JSON.parse(stored);
            }
        } catch (error) {
            console.error('Error retrieving assessments:', error);
        }
        return [];
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

    // Export function
    window.exportAssessments = function() {
        const assessments = window.getAllAssessments();
        const blob = new Blob([JSON.stringify(assessments, null, 2)], {type: 'application/json'});
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'security_assessments_' + Date.now() + '.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        console.log('Exported ' + assessments.length + ' assessments');
    };

    // Check for offline backups on load
    if (navigator.onLine) {
        resendBackups();
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
    console.log('Security Assessment Webhook Handler loaded');
    console.log('Data is sent to Formspree for email notifications');
    console.log('Check your Formspree dashboard at https://formspree.io/forms/xjkgvqll/submissions');
})();