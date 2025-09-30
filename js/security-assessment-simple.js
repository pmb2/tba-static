// Simple Security Assessment Handler - Production Ready
(function() {
    'use strict';

    // Configuration
    const FORMSPREE_ENDPOINT = 'https://formspree.io/f/xjkgvqll';
    const STORAGE_KEY = 'security_assessments';

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
            // Mark link as used
            markLinkUsed(urlParams.trackingId);
        }

        // Add source information
        assessmentData.source = urlParams.trackingId ? 'Unique Link' : 'Direct';
        assessmentData.pageUrl = window.location.href;

        // Save to localStorage first (always works)
        saveToLocal(assessmentData);

        // Send to Formspree
        sendToFormspree(assessmentData);

        return assessmentData;
    };

    // Save to localStorage
    function saveToLocal(data) {
        try {
            // Get existing data
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

            // Add new submission
            existing.push(data);

            // Keep only last 50 to prevent overflow
            if (existing.length > 50) {
                existing = existing.slice(-50);
            }

            // Save
            localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
            console.log('Assessment saved locally:', data.submissionId);
            return true;
        } catch (error) {
            console.error('Failed to save locally:', error);
            return false;
        }
    }

    // Send to Formspree
    function sendToFormspree(data) {
        // Prepare the data in a format Formspree expects
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
            submitted_at: data.submittedAt
        };

        // Send as JSON
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
                // Mark as sent in localStorage
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

    // Function to clear all assessments
    window.clearAssessments = function() {
        if (confirm('Are you sure you want to clear all stored assessments?')) {
            localStorage.removeItem(STORAGE_KEY);
            console.log('All assessments cleared');
            return true;
        }
        return false;
    };

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
    console.log('Security Assessment Simple Handler loaded');
})();