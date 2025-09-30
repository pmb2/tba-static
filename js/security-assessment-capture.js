// Security Assessment Capture System
// This script captures form submissions locally and ensures dual submission

(function() {
    'use strict';

    // Configuration
    const CONFIG = {
        formspreeEndpoint: 'https://formspree.io/f/xjkgvqll',
        localStorageKey: 'security_assessments',
        backupEndpoint: '/api/capture-assessment', // Optional backup endpoint
        maxRetries: 3,
        retryDelay: 2000
    };

    // Enhanced submission function with local capture
    window.enhancedSubmitAssessment = function(assessmentData) {
        // Add metadata
        const enrichedData = {
            ...assessmentData,
            submittedAt: new Date().toISOString(),
            submissionId: generateSubmissionId(),
            userAgent: navigator.userAgent,
            screenResolution: `${screen.width}x${screen.height}`,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            language: navigator.language,
            platform: navigator.platform,
            referrer: document.referrer,
            pageUrl: window.location.href
        };

        // Step 1: Save to local storage immediately
        saveToLocalStorage(enrichedData);

        // Step 2: Save to IndexedDB for better persistence
        saveToIndexedDB(enrichedData);

        // Step 3: Send to Formspree
        sendToFormspree(enrichedData);

        // Step 4: Send to backup endpoint (if available)
        sendToBackupEndpoint(enrichedData);

        // Step 5: Export to downloadable file
        offerDownload(enrichedData);

        return enrichedData;
    };

    // Generate unique submission ID
    function generateSubmissionId() {
        return 'SA_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    // Save to Local Storage
    function saveToLocalStorage(data) {
        try {
            // Get existing assessments
            const existing = JSON.parse(localStorage.getItem(CONFIG.localStorageKey) || '[]');

            // Add new assessment
            existing.push(data);

            // Keep only last 100 assessments to prevent storage overflow
            if (existing.length > 100) {
                existing.shift();
            }

            // Save back to localStorage
            localStorage.setItem(CONFIG.localStorageKey, JSON.stringify(existing));

            console.log('Assessment saved to localStorage:', data.submissionId);
            return true;
        } catch (error) {
            console.error('Failed to save to localStorage:', error);
            return false;
        }
    }

    // Save to IndexedDB for better persistence
    function saveToIndexedDB(data) {
        if (!window.indexedDB) {
            console.warn('IndexedDB not supported');
            return Promise.resolve(false);
        }

        return new Promise((resolve, reject) => {
            const request = indexedDB.open('SecurityAssessments', 1);

            request.onerror = () => {
                console.error('IndexedDB error:', request.error);
                reject(request.error);
            };

            request.onsuccess = (event) => {
                const db = event.target.result;
                const transaction = db.transaction(['assessments'], 'readwrite');
                const store = transaction.objectStore('assessments');

                const addRequest = store.add(data);

                addRequest.onsuccess = () => {
                    console.log('Assessment saved to IndexedDB:', data.submissionId);
                    resolve(true);
                };

                addRequest.onerror = () => {
                    console.error('Failed to save to IndexedDB:', addRequest.error);
                    reject(addRequest.error);
                };
            };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                if (!db.objectStoreNames.contains('assessments')) {
                    const store = db.createObjectStore('assessments', {
                        keyPath: 'submissionId',
                        autoIncrement: false
                    });
                    store.createIndex('email', 'contactEmail', { unique: false });
                    store.createIndex('company', 'companyName', { unique: false });
                    store.createIndex('date', 'submittedAt', { unique: false });
                }
            };
        });
    }

    // Enhanced Formspree submission with retry logic
    function sendToFormspree(data, retryCount = 0) {
        const formData = new FormData();

        // Add all assessment data
        formData.append('_subject', `Security Assessment: ${data.companyName} [${data.submissionId}]`);
        formData.append('submission_id', data.submissionId);
        formData.append('name', data.contactName);
        formData.append('email', data.contactEmail);
        formData.append('company', data.companyName);
        formData.append('role', data.contactRole);
        formData.append('industry', data.industry);
        formData.append('size', data.companySize);
        formData.append('maturity', data.maturityLevel);
        formData.append('previous_assessment', data.previousAssessment);
        formData.append('incidents', data.recentIncidents);
        formData.append('concerns', Array.isArray(data.concerns) ? data.concerns.join(', ') : data.concerns);
        formData.append('services', Array.isArray(data.services) ? data.services.join(', ') : data.services);
        formData.append('timeline', data.timeline);
        formData.append('budget', data.budget);
        formData.append('context', data.additionalContext);
        formData.append('consultation', data.scheduleConsultation);
        formData.append('score', data.assessmentScore);
        formData.append('submitted_at', data.submittedAt);

        // Add metadata
        formData.append('user_agent', data.userAgent);
        formData.append('screen_resolution', data.screenResolution);
        formData.append('timezone', data.timezone);
        formData.append('language', data.language);
        formData.append('referrer', data.referrer);

        fetch(CONFIG.formspreeEndpoint, {
            method: 'POST',
            body: formData,
            headers: {
                'Accept': 'application/json'
            }
        })
        .then(response => {
            if (response.ok) {
                console.log('Assessment sent to Formspree successfully:', data.submissionId);
                markAsSubmitted(data.submissionId, 'formspree');
            } else {
                throw new Error(`Formspree responded with ${response.status}`);
            }
        })
        .catch(error => {
            console.error('Formspree submission error:', error);

            // Retry logic
            if (retryCount < CONFIG.maxRetries) {
                console.log(`Retrying Formspree submission (${retryCount + 1}/${CONFIG.maxRetries})...`);
                setTimeout(() => {
                    sendToFormspree(data, retryCount + 1);
                }, CONFIG.retryDelay * (retryCount + 1));
            } else {
                console.error('Max retries reached for Formspree submission');
                markAsFailed(data.submissionId, 'formspree', error.message);
            }
        });
    }

    // Send to backup endpoint
    function sendToBackupEndpoint(data) {
        // Check if backup endpoint exists
        fetch(CONFIG.backupEndpoint, {
            method: 'HEAD'
        })
        .then(response => {
            if (response.ok) {
                // Endpoint exists, send data
                return fetch(CONFIG.backupEndpoint, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(data)
                });
            }
        })
        .then(response => {
            if (response && response.ok) {
                console.log('Assessment sent to backup endpoint:', data.submissionId);
                markAsSubmitted(data.submissionId, 'backup');
            }
        })
        .catch(error => {
            // Backup endpoint not available, silently fail
            console.debug('Backup endpoint not available:', error.message);
        });
    }

    // Offer download of submission data
    function offerDownload(data) {
        try {
            const blob = new Blob([JSON.stringify(data, null, 2)], {
                type: 'application/json'
            });

            const url = URL.createObjectURL(blob);
            const filename = `security_assessment_${data.companyName.replace(/\s+/g, '_')}_${data.submissionId}.json`;

            // Store download URL for later retrieval
            sessionStorage.setItem('last_assessment_download', JSON.stringify({
                url: url,
                filename: filename,
                submissionId: data.submissionId
            }));

            console.log('Assessment ready for download:', filename);
        } catch (error) {
            console.error('Failed to prepare download:', error);
        }
    }

    // Mark submission as successfully sent
    function markAsSubmitted(submissionId, endpoint) {
        try {
            const key = `submission_${submissionId}_${endpoint}`;
            localStorage.setItem(key, JSON.stringify({
                status: 'submitted',
                timestamp: new Date().toISOString()
            }));
        } catch (error) {
            console.error('Failed to mark as submitted:', error);
        }
    }

    // Mark submission as failed
    function markAsFailed(submissionId, endpoint, errorMessage) {
        try {
            const key = `submission_${submissionId}_${endpoint}`;
            localStorage.setItem(key, JSON.stringify({
                status: 'failed',
                error: errorMessage,
                timestamp: new Date().toISOString()
            }));
        } catch (error) {
            console.error('Failed to mark as failed:', error);
        }
    }

    // Retrieve all stored assessments
    window.retrieveStoredAssessments = function() {
        const assessments = {
            localStorage: [],
            indexedDB: []
        };

        // Get from localStorage
        try {
            assessments.localStorage = JSON.parse(
                localStorage.getItem(CONFIG.localStorageKey) || '[]'
            );
        } catch (error) {
            console.error('Failed to retrieve from localStorage:', error);
        }

        // Get from IndexedDB
        if (window.indexedDB) {
            return new Promise((resolve, reject) => {
                const request = indexedDB.open('SecurityAssessments', 1);

                request.onsuccess = (event) => {
                    const db = event.target.result;

                    if (db.objectStoreNames.contains('assessments')) {
                        const transaction = db.transaction(['assessments'], 'readonly');
                        const store = transaction.objectStore('assessments');
                        const getAllRequest = store.getAll();

                        getAllRequest.onsuccess = () => {
                            assessments.indexedDB = getAllRequest.result;
                            resolve(assessments);
                        };

                        getAllRequest.onerror = () => {
                            console.error('Failed to retrieve from IndexedDB');
                            resolve(assessments);
                        };
                    } else {
                        resolve(assessments);
                    }
                };

                request.onerror = () => {
                    console.error('Failed to open IndexedDB');
                    resolve(assessments);
                };
            });
        }

        return Promise.resolve(assessments);
    };

    // Export all assessments to file
    window.exportAllAssessments = function() {
        window.retrieveStoredAssessments().then(assessments => {
            const blob = new Blob([JSON.stringify(assessments, null, 2)], {
                type: 'application/json'
            });

            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `all_security_assessments_${Date.now()}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            console.log('Exported all assessments');
        });
    };

    // Clear all stored assessments (use with caution)
    window.clearStoredAssessments = function(confirm) {
        if (confirm !== 'CONFIRM_CLEAR_ALL') {
            console.error('Safety check failed. Call with clearStoredAssessments("CONFIRM_CLEAR_ALL")');
            return;
        }

        // Clear localStorage
        localStorage.removeItem(CONFIG.localStorageKey);

        // Clear IndexedDB
        if (window.indexedDB) {
            indexedDB.deleteDatabase('SecurityAssessments');
        }

        console.log('All stored assessments cleared');
    };

    // Initialize periodic backup to prevent data loss
    function initPeriodicBackup() {
        // Every hour, backup assessments to sessionStorage
        setInterval(() => {
            window.retrieveStoredAssessments().then(assessments => {
                if (assessments.localStorage.length > 0 || assessments.indexedDB.length > 0) {
                    const backup = JSON.stringify(assessments);
                    sessionStorage.setItem('assessments_backup_' + Date.now(), backup);
                    console.log('Periodic backup completed');
                }
            });
        }, 3600000); // 1 hour
    }

    // Initialize on page load
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initPeriodicBackup);
    } else {
        initPeriodicBackup();
    }

    console.log('Security Assessment Capture System initialized');
})();