// Security Assessment Firebase Handler - Cross-Location Storage Solution
(function() {
    'use strict';

    // Firebase configuration - Using Realtime Database for free tier
    // You need to create a Firebase project at https://console.firebase.google.com
    const firebaseConfig = {
        apiKey: "YOUR_API_KEY",
        authDomain: "YOUR_PROJECT.firebaseapp.com",
        databaseURL: "https://YOUR_PROJECT.firebaseio.com",
        projectId: "YOUR_PROJECT",
        storageBucket: "YOUR_PROJECT.appspot.com",
        messagingSenderId: "YOUR_SENDER_ID",
        appId: "YOUR_APP_ID"
    };

    // Initialize Firebase (will be done after adding Firebase SDK)
    let database = null;

    // Configuration
    const FORMSPREE_ENDPOINT = 'https://formspree.io/f/xjkgvqll';
    const STORAGE_KEY = 'security_assessments';

    // Initialize Firebase when SDK is loaded
    function initFirebase() {
        if (typeof firebase !== 'undefined') {
            firebase.initializeApp(firebaseConfig);
            database = firebase.database();
            console.log('Firebase initialized successfully');
        } else {
            console.error('Firebase SDK not loaded');
        }
    }

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

        // Save to Firebase (cloud storage)
        if (database) {
            saveToFirebase(assessmentData);
        } else {
            console.warn('Firebase not initialized, using localStorage only');
        }

        // Send to Formspree
        sendToFormspree(assessmentData);

        return assessmentData;
    };

    // Save to Firebase
    function saveToFirebase(data) {
        if (!database) {
            console.error('Firebase database not initialized');
            return;
        }

        // Save to Firebase Realtime Database
        database.ref('assessments/' + data.submissionId).set(data)
            .then(() => {
                console.log('Assessment saved to Firebase:', data.submissionId);
                localStorage.setItem('firebase_sync_' + data.submissionId, 'success');
            })
            .catch(error => {
                console.error('Firebase save error:', error);
                localStorage.setItem('firebase_sync_' + data.submissionId, 'failed');
            });
    }

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
            submitted_at: data.submittedAt
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

    // Function to retrieve all assessments from Firebase
    window.getAllAssessmentsFromFirebase = function() {
        return new Promise((resolve, reject) => {
            if (!database) {
                console.error('Firebase not initialized');
                // Fallback to localStorage
                resolve(JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'));
                return;
            }

            database.ref('assessments').once('value')
                .then(snapshot => {
                    const data = snapshot.val();
                    if (data) {
                        const assessments = Object.values(data);
                        console.log('Retrieved from Firebase:', assessments.length, 'assessments');
                        resolve(assessments);
                    } else {
                        resolve([]);
                    }
                })
                .catch(error => {
                    console.error('Firebase retrieval error:', error);
                    // Fallback to localStorage
                    resolve(JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'));
                });
        });
    };

    // Delete assessment from Firebase
    window.deleteAssessmentFromFirebase = function(submissionId) {
        if (!database) {
            console.error('Firebase not initialized');
            return Promise.reject('Firebase not initialized');
        }

        return database.ref('assessments/' + submissionId).remove()
            .then(() => {
                console.log('Assessment deleted from Firebase:', submissionId);
            })
            .catch(error => {
                console.error('Firebase delete error:', error);
                throw error;
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

                // Also save to Firebase
                if (database) {
                    database.ref('links/' + trackingId).update({
                        used: true,
                        usedAt: new Date().toISOString()
                    });
                }

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

    // Wait for Firebase SDK to load then initialize
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(initFirebase, 1000);
        });
    } else {
        setTimeout(initFirebase, 1000);
    }

    // Initialize
    displayTrackingInfo();
    console.log('Security Assessment Firebase Handler loaded');
})();