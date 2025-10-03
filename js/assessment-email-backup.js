// Assessment Email Backup System
// Ensures you ALWAYS get assessment data via email
(function() {
    'use strict';

    // Formspree configuration - reliable email delivery
    const FORMSPREE_ENDPOINT = 'https://formspree.io/f/xjkgvqll';

    // Your notification email
    const ADMIN_EMAIL = 'admin@backus.agency'; // Change this to your email

    // Send assessment via email immediately
    async function sendAssessmentEmail(assessmentData) {
        console.log('📧 Sending assessment via email...');

        try {
            // Format assessment data for email
            const emailBody = formatAssessmentForEmail(assessmentData);

            // Send via Formspree
            const response = await fetch(FORMSPREE_ENDPOINT, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    _subject: `NEW SECURITY ASSESSMENT: ${assessmentData.companyName}`,
                    _replyto: assessmentData.contactEmail,
                    _cc: ADMIN_EMAIL,

                    // Contact Information
                    company_name: assessmentData.companyName,
                    contact_name: assessmentData.contactName,
                    contact_email: assessmentData.contactEmail,
                    contact_role: assessmentData.contactRole,

                    // Company Profile
                    industry: assessmentData.industry,
                    company_size: assessmentData.companySize,
                    maturity_level: assessmentData.maturityLevel,

                    // Assessment Details
                    previous_assessment: assessmentData.previousAssessment,
                    recent_incidents: assessmentData.recentIncidents,
                    security_concerns: Array.isArray(assessmentData.concerns) ?
                        assessmentData.concerns.join(', ') : assessmentData.concerns,
                    services_interested: Array.isArray(assessmentData.services) ?
                        assessmentData.services.join(', ') : assessmentData.services,

                    // Project Information
                    timeline: assessmentData.timeline,
                    budget: assessmentData.budget,
                    additional_context: assessmentData.additionalContext,
                    schedule_consultation: assessmentData.scheduleConsultation,

                    // Assessment Score
                    assessment_score: assessmentData.assessmentScore || 0,

                    // Metadata
                    submission_id: assessmentData.submissionId,
                    submitted_at: assessmentData.submittedAt,
                    tracking_id: assessmentData.trackingId || 'Direct',
                    reference_source: assessmentData.referenceSource || 'Direct',

                    // Full JSON backup
                    full_data_json: JSON.stringify(assessmentData, null, 2)
                })
            });

            if (response.ok) {
                console.log('✅ Assessment email sent successfully!');
                return { success: true, method: 'email' };
            } else {
                console.error('❌ Email send failed:', response.status);
                return { success: false, error: 'Email send failed' };
            }

        } catch (error) {
            console.error('❌ Email error:', error);
            return { success: false, error: error.message };
        }
    }

    // Format assessment data for readable email
    function formatAssessmentForEmail(data) {
        return `
NEW SECURITY ASSESSMENT SUBMISSION
====================================

CONTACT INFORMATION:
- Company: ${data.companyName}
- Contact: ${data.contactName}
- Email: ${data.contactEmail}
- Role: ${data.contactRole || 'Not specified'}

COMPANY PROFILE:
- Industry: ${data.industry}
- Size: ${data.companySize}
- Security Maturity: ${data.maturityLevel}

ASSESSMENT DETAILS:
- Previous Assessment: ${data.previousAssessment}
- Recent Incidents: ${data.recentIncidents}
- Security Concerns: ${Array.isArray(data.concerns) ? data.concerns.join(', ') : data.concerns}
- Services Interested: ${Array.isArray(data.services) ? data.services.join(', ') : data.services}

PROJECT INFORMATION:
- Timeline: ${data.timeline}
- Budget Range: ${data.budget}
- Additional Context: ${data.additionalContext || 'None provided'}

NEXT STEPS:
- Schedule Consultation: ${data.scheduleConsultation}

ASSESSMENT SCORE: ${data.assessmentScore || 0}

SUBMISSION DETAILS:
- Submission ID: ${data.submissionId}
- Submitted: ${new Date(data.submittedAt).toLocaleString()}
- Tracking ID: ${data.trackingId || 'Direct submission'}
- Reference: ${data.referenceSource || 'Direct'}

====================================
View in admin dashboard: https://backus.agency/admin
`;
    }

    // Make function globally available
    window.sendAssessmentEmail = sendAssessmentEmail;

    console.log('📧 Email backup system loaded');
})();