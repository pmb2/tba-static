// Security Assessment JSONBin.io Cloud Storage Handler
// This enables cross-location access to all assessments
(function() {
    'use strict';

    // JSONBin.io Configuration
    const JSONBIN_API_KEY = '$2a$10$wiqbQnJrm29tc73dCO/xcOWvjVbXfUAZsPAYGqGCJ8pIXAOPaIuYS';
    const JSONBIN_BASE_URL = 'https://api.jsonbin.io/v3';
    // FIXED: Use a single shared bin ID for ALL assessments
    const JSONBIN_BIN_ID = '68e00e49d0ea881f40944538'; // Single shared bin for all assessments

    // Formspree Configuration
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

    // No bin creation needed - using fixed shared bin ID

    // Fetch assessments from JSONBin
    async function fetchFromJsonBin() {
        const binId = JSONBIN_BIN_ID;

        try {
            const response = await fetch(`${JSONBIN_BASE_URL}/b/${binId}/latest`, {
                method: 'GET',
                headers: {
                    'X-Master-Key': JSONBIN_API_KEY
                }
            });

            if (response.ok) {
                const data = await response.json();
                return data.record.assessments || [];
            }
        } catch (error) {
            console.error('Failed to fetch from JSONBin:', error);
        }

        return [];
    }

    // Save assessment to JSONBin
    async function saveToJsonBin(newAssessment) {
        const binId = JSONBIN_BIN_ID;

        console.log('💾 Saving assessment to cloud:', newAssessment.submissionId);

        try {
            // Fetch existing assessments
            const existingAssessments = await fetchFromJsonBin();

            // Add new assessment
            existingAssessments.push(newAssessment);

            // Keep only last 100 assessments
            const assessmentsToSave = existingAssessments.slice(-100);

            // Update the bin
            const response = await fetch(`${JSONBIN_BASE_URL}/b/${binId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Master-Key': JSONBIN_API_KEY
                },
                body: JSON.stringify({
                    assessments: assessmentsToSave,
                    lastUpdated: new Date().toISOString(),
                    totalCount: assessmentsToSave.length
                })
            });

            if (response.ok) {
                console.log('Assessment saved to JSONBin cloud storage');
                localStorage.setItem('jsonbin_sync_' + newAssessment.submissionId, 'success');
                return true;
            }
        } catch (error) {
            console.error('Failed to save to JSONBin:', error);
            localStorage.setItem('jsonbin_sync_' + newAssessment.submissionId, 'failed');
        }

        return false;
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
        assessmentData.submittedFrom = window.location.hostname;

        // Save to localStorage first (immediate feedback)
        saveToLocal(assessmentData);

        // Save to JSONBin cloud storage (async)
        saveToJsonBin(assessmentData).then(success => {
            if (success) {
                console.log('✅ Assessment saved to cloud successfully');
                // Update UI if needed
                if (window.updateSyncStatus) {
                    window.updateSyncStatus('synced');
                }
            } else {
                console.warn('⚠️ Cloud save failed - assessment saved locally only');
            }
        }).catch(error => {
            console.error('❌ Cloud save error:', error);
            console.log('Assessment still saved locally');
        });

        // Send email notification (if available)
        if (typeof window.sendAssessmentEmail === 'function') {
            window.sendAssessmentEmail(assessmentData).then(result => {
                if (result.success) {
                    console.log('✅ Assessment email sent successfully');
                } else {
                    console.warn('⚠️ Email send failed:', result.error);
                }
            });
        }

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
            submitted_from: data.submittedFrom || 'Unknown'
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

    // Get all assessments (combines local and cloud)
    window.getAllAssessments = async function() {
        try {
            // Get cloud assessments
            const cloudAssessments = await fetchFromJsonBin();
            console.log('Fetched', cloudAssessments.length, 'assessments from cloud');

            // Get local assessments
            const localAssessments = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');

            // Merge and deduplicate by submissionId
            const allAssessments = [...cloudAssessments];
            const existingIds = new Set(cloudAssessments.map(a => a.submissionId));

            localAssessments.forEach(assessment => {
                if (!existingIds.has(assessment.submissionId)) {
                    allAssessments.push(assessment);
                }
            });

            // Sort by date (newest first)
            allAssessments.sort((a, b) =>
                new Date(b.submittedAt || b.assessmentDate) - new Date(a.submittedAt || a.assessmentDate)
            );

            return allAssessments;
        } catch (error) {
            console.error('Error retrieving assessments:', error);
            // Fallback to local storage
            return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
        }
    };

    // Delete assessment from cloud and local
    window.deleteAssessmentFromCloud = async function(submissionId) {
        try {
            // Get all assessments
            const allAssessments = await fetchFromJsonBin();

            // Filter out the deleted assessment
            const updatedAssessments = allAssessments.filter(a => a.submissionId !== submissionId);

            // Update JSONBin
            const binId = await ensureJsonBin();
            const response = await fetch(`${JSONBIN_BASE_URL}/b/${binId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Master-Key': JSONBIN_API_KEY
                },
                body: JSON.stringify({
                    assessments: updatedAssessments,
                    lastUpdated: new Date().toISOString(),
                    totalCount: updatedAssessments.length
                })
            });

            if (response.ok) {
                console.log('Assessment deleted from cloud:', submissionId);

                // Also remove from local storage
                const localAssessments = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
                const filteredLocal = localAssessments.filter(a => a.submissionId !== submissionId);
                localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredLocal));

                return true;
            }
        } catch (error) {
            console.error('Failed to delete from cloud:', error);
        }

        return false;
    };

    // Sync local assessments to cloud (for migration)
    window.syncLocalToCloud = async function() {
        const localAssessments = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
        let synced = 0;

        for (const assessment of localAssessments) {
            const syncKey = 'jsonbin_sync_' + assessment.submissionId;
            if (localStorage.getItem(syncKey) !== 'success') {
                const success = await saveToJsonBin(assessment);
                if (success) {
                    synced++;
                }
            }
        }

        console.log(`Synced ${synced} assessments to cloud`);
        return synced;
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
    window.exportAssessments = async function() {
        const assessments = await window.getAllAssessments();
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
    console.log('Security Assessment JSONBin Cloud Handler loaded');
    console.log('Cloud storage enabled - assessments accessible from any location');
    console.log('Using shared bin:', JSONBIN_BIN_ID);

    // Auto-sync on load for admin pages
    if (window.location.pathname.includes('admin')) {
        syncLocalToCloud();
    }
})();