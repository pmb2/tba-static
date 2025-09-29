// Security Assessment Modal Component
class SecurityModal {
    constructor() {
        this.currentPage = 1;
        this.totalPages = 4;
        this.assessmentData = {};
        this.init();
    }

    init() {
        this.createModal();
        this.attachEventListeners();
    }

    createModal() {
        const modalHTML = `
        <div class="security-modal" id="securityAssessmentModal" style="display: none;">
            <div class="modal-container">
                <div class="modal-header">
                    <div class="modal-logo">
                        <svg width="60" height="60" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="30" cy="30" r="28" stroke="#ffffff" stroke-width="2"/>
                            <path d="M30 10L35 20H45L37 28L40 38L30 33L20 38L23 28L15 20H25L30 10Z" fill="#ffffff"/>
                        </svg>
                    </div>
                    <h2 class="modal-title">Security Assessment Portal</h2>
                    <p class="modal-subtitle">Comprehensive Security Evaluation</p>
                    <button class="modal-close" onclick="securityModal.close()">&times;</button>
                </div>

                <div class="modal-progress">
                    <div class="progress-bar">
                        <div class="progress-fill" id="progressFill"></div>
                    </div>
                    <div class="progress-text">
                        <span>Step <span id="currentStep">1</span> of <span id="totalSteps">4</span></span>
                    </div>
                </div>

                <div class="modal-content">
                    <!-- Page 1: Contact Information -->
                    <div class="modal-page" id="page1">
                        <h3 class="page-title">Contact Information</h3>
                        <div class="form-grid">
                            <div class="form-group">
                                <label class="form-label">Full Name *</label>
                                <input type="text" class="form-input" id="contactName" placeholder="John Smith" required>
                            </div>
                            <div class="form-group">
                                <label class="form-label">Email Address *</label>
                                <input type="email" class="form-input" id="contactEmail" placeholder="john@company.com" required>
                            </div>
                            <div class="form-group">
                                <label class="form-label">Company Name *</label>
                                <input type="text" class="form-input" id="companyName" placeholder="Acme Corporation" required>
                            </div>
                            <div class="form-group">
                                <label class="form-label">Your Role *</label>
                                <select class="form-select" id="contactRole" required>
                                    <option value="">Select your role</option>
                                    <option value="ceo">CEO/Founder</option>
                                    <option value="cto">CTO/Technical Director</option>
                                    <option value="ciso">CISO/Security Director</option>
                                    <option value="it-manager">IT Manager</option>
                                    <option value="compliance">Compliance Officer</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <!-- Page 2: Company Profile -->
                    <div class="modal-page" id="page2" style="display: none;">
                        <h3 class="page-title">Company Profile</h3>
                        <div class="form-grid">
                            <div class="form-group">
                                <label class="form-label">Company Size *</label>
                                <select class="form-select" id="companySize" required>
                                    <option value="">Select company size</option>
                                    <option value="startup">Startup (1-10 employees)</option>
                                    <option value="small">Small (11-50 employees)</option>
                                    <option value="medium">Medium (51-200 employees)</option>
                                    <option value="large">Large (201-1000 employees)</option>
                                    <option value="enterprise">Enterprise (1000+ employees)</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label class="form-label">Industry *</label>
                                <select class="form-select" id="industry" required>
                                    <option value="">Select industry</option>
                                    <option value="technology">Technology</option>
                                    <option value="healthcare">Healthcare</option>
                                    <option value="finance">Finance</option>
                                    <option value="retail">Retail</option>
                                    <option value="manufacturing">Manufacturing</option>
                                    <option value="education">Education</option>
                                    <option value="government">Government</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label class="form-label">Previous Security Assessment?</label>
                                <select class="form-select" id="previousAssessment">
                                    <option value="no">No, this is our first</option>
                                    <option value="internal">Yes, internal assessment</option>
                                    <option value="external">Yes, external assessment</option>
                                    <option value="both">Yes, both internal and external</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <!-- Page 3: Security Concerns -->
                    <div class="modal-page" id="page3" style="display: none;">
                        <h3 class="page-title">Security Assessment Focus</h3>
                        <div class="form-group">
                            <label class="form-label">Primary Security Concerns (Select all that apply)</label>
                            <div class="checkbox-grid">
                                <label class="checkbox-item">
                                    <input type="checkbox" name="securityConcerns" value="data-protection">
                                    <span class="checkmark"></span>
                                    Data Protection & Privacy
                                </label>
                                <label class="checkbox-item">
                                    <input type="checkbox" name="securityConcerns" value="network-security">
                                    <span class="checkmark"></span>
                                    Network Security
                                </label>
                                <label class="checkbox-item">
                                    <input type="checkbox" name="securityConcerns" value="compliance">
                                    <span class="checkmark"></span>
                                    Regulatory Compliance
                                </label>
                                <label class="checkbox-item">
                                    <input type="checkbox" name="securityConcerns" value="incident-response">
                                    <span class="checkmark"></span>
                                    Incident Response
                                </label>
                                <label class="checkbox-item">
                                    <input type="checkbox" name="securityConcerns" value="employee-training">
                                    <span class="checkmark"></span>
                                    Employee Security Training
                                </label>
                                <label class="checkbox-item">
                                    <input type="checkbox" name="securityConcerns" value="third-party">
                                    <span class="checkmark"></span>
                                    Third-party Risk Management
                                </label>
                            </div>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Any recent security incidents?</label>
                            <select class="form-select" id="recentIncidents">
                                <option value="none">No incidents</option>
                                <option value="minor">Minor security events</option>
                                <option value="moderate">Moderate security incidents</option>
                                <option value="major">Major security breaches</option>
                                <option value="prefer-not-to-say">Prefer not to say</option>
                            </select>
                        </div>
                    </div>

                    <!-- Page 4: Assessment Preferences -->
                    <div class="modal-page" id="page4" style="display: none;">
                        <h3 class="page-title">Assessment Preferences</h3>
                        <div class="form-group">
                            <label class="form-label">Additional Context</label>
                            <textarea class="form-textarea" id="additionalContext"
                                placeholder="Please provide any additional information about your security needs, specific compliance requirements, or particular areas of concern..."></textarea>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Preferred Timeline</label>
                            <select class="form-select" id="timeline">
                                <option value="immediate">Immediate (within 1 week)</option>
                                <option value="urgent">Urgent (within 2 weeks)</option>
                                <option value="standard">Standard (within 1 month)</option>
                                <option value="flexible">Flexible (within 3 months)</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Would you like to schedule a consultation call?</label>
                            <select class="form-select" id="scheduleConsultation">
                                <option value="yes">Yes, schedule a call</option>
                                <option value="email">No, email communication only</option>
                                <option value="later">Maybe later</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div class="modal-navigation">
                    <button class="nav-btn nav-btn-secondary" id="prevBtn" onclick="securityModal.previousPage()" style="display: none;">
                        ← Previous
                    </button>
                    <button class="nav-btn nav-btn-primary" id="nextBtn" onclick="securityModal.nextPage()">
                        Next →
                    </button>
                    <button class="nav-btn nav-btn-primary" id="submitBtn" onclick="securityModal.submitAssessment()" style="display: none;">
                        Submit Assessment
                    </button>
                </div>
            </div>
        </div>`;

        document.body.insertAdjacentHTML('beforeend', modalHTML);
        this.addModalStyles();
    }

    addModalStyles() {
        const styles = `
        <style>
        .security-modal {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.95);
            backdrop-filter: blur(20px);
            z-index: 10000;
            overflow-y: auto;
            padding: 20px;
        }

        .modal-container {
            max-width: 900px;
            margin: 2rem auto;
            background: #141414;
            border: 1px solid rgba(220, 38, 38, 0.1);
            border-radius: 20px;
            overflow: hidden;
            box-shadow: 0 12px 24px rgba(0, 0, 0, 0.8);
        }

        .modal-header {
            background: linear-gradient(135deg, #dc2626 0%, #7f1d1d 100%);
            padding: 2rem;
            text-align: center;
            position: relative;
        }

        .modal-close {
            position: absolute;
            top: 20px;
            right: 20px;
            background: none;
            border: none;
            color: white;
            font-size: 32px;
            cursor: pointer;
            width: 40px;
            height: 40px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 50%;
            transition: background-color 0.3s;
        }

        .modal-close:hover {
            background: rgba(255, 255, 255, 0.1);
        }

        .modal-title {
            color: white;
            font-size: 2rem;
            font-weight: 700;
            margin-bottom: 0.5rem;
        }

        .modal-subtitle {
            color: rgba(255, 255, 255, 0.8);
            font-size: 1.1rem;
        }

        .modal-progress {
            background: #1a1a1a;
            padding: 1.5rem 2rem;
            border-bottom: 1px solid rgba(220, 38, 38, 0.1);
        }

        .progress-bar {
            width: 100%;
            height: 8px;
            background: #333;
            border-radius: 4px;
            overflow: hidden;
            margin-bottom: 1rem;
        }

        .progress-fill {
            height: 100%;
            background: linear-gradient(90deg, #dc2626, #ef4444);
            transition: width 0.3s ease;
            width: 25%;
        }

        .progress-text {
            text-align: center;
            color: #b0b0b0;
            font-size: 0.9rem;
        }

        .modal-content {
            padding: 2rem;
        }

        .page-title {
            color: white;
            font-size: 1.5rem;
            font-weight: 600;
            margin-bottom: 2rem;
            text-align: center;
        }

        .form-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 1.5rem;
        }

        .form-group {
            margin-bottom: 1.5rem;
        }

        .form-label {
            display: block;
            color: #e5e5e5;
            font-weight: 500;
            margin-bottom: 0.5rem;
        }

        .form-input, .form-select, .form-textarea {
            width: 100%;
            background: #0f0f0f;
            border: 1px solid #333;
            border-radius: 8px;
            padding: 12px 16px;
            color: white;
            font-size: 1rem;
            transition: all 0.3s ease;
        }

        .form-input:focus, .form-select:focus, .form-textarea:focus {
            outline: none;
            border-color: #dc2626;
            box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.1);
        }

        .form-textarea {
            min-height: 100px;
            resize: vertical;
        }

        .checkbox-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 1rem;
        }

        .checkbox-item {
            display: flex;
            align-items: center;
            background: #0f0f0f;
            border: 1px solid #333;
            border-radius: 8px;
            padding: 1rem;
            cursor: pointer;
            transition: all 0.3s ease;
        }

        .checkbox-item:hover {
            border-color: #dc2626;
            background: #1a1a1a;
        }

        .checkbox-item input[type="checkbox"] {
            margin-right: 12px;
            accent-color: #dc2626;
        }

        .modal-navigation {
            background: #1a1a1a;
            padding: 1.5rem 2rem;
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-top: 1px solid rgba(220, 38, 38, 0.1);
        }

        .nav-btn {
            padding: 12px 24px;
            border: none;
            border-radius: 8px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            font-size: 1rem;
        }

        .nav-btn-primary {
            background: linear-gradient(135deg, #dc2626, #991b1b);
            color: white;
        }

        .nav-btn-primary:hover {
            background: linear-gradient(135deg, #991b1b, #7f1d1d);
            transform: translateY(-2px);
        }

        .nav-btn-secondary {
            background: #333;
            color: white;
        }

        .nav-btn-secondary:hover {
            background: #444;
            transform: translateY(-2px);
        }

        @media (max-width: 768px) {
            .modal-container {
                margin: 1rem;
            }

            .form-grid {
                grid-template-columns: 1fr;
            }

            .checkbox-grid {
                grid-template-columns: 1fr;
            }
        }
        </style>`;

        document.head.insertAdjacentHTML('beforeend', styles);
    }

    open() {
        const modal = document.getElementById('securityAssessmentModal');
        if (modal) {
            modal.style.display = 'block';
            document.body.style.overflow = 'hidden';
            this.updateProgress();
        }
    }

    close() {
        const modal = document.getElementById('securityAssessmentModal');
        if (modal) {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
            this.resetForm();
        }
    }

    nextPage() {
        if (this.validateCurrentPage()) {
            this.collectCurrentPageData();
            this.currentPage++;
            this.updateDisplay();
        }
    }

    previousPage() {
        if (this.currentPage > 1) {
            this.currentPage--;
            this.updateDisplay();
        }
    }

    updateDisplay() {
        // Hide all pages
        for (let i = 1; i <= this.totalPages; i++) {
            const page = document.getElementById(`page${i}`);
            if (page) {
                page.style.display = 'none';
            }
        }

        // Show current page
        const currentPageEl = document.getElementById(`page${this.currentPage}`);
        if (currentPageEl) {
            currentPageEl.style.display = 'block';
        }

        // Update navigation buttons
        const prevBtn = document.getElementById('prevBtn');
        const nextBtn = document.getElementById('nextBtn');
        const submitBtn = document.getElementById('submitBtn');

        if (prevBtn) prevBtn.style.display = this.currentPage > 1 ? 'block' : 'none';
        if (nextBtn) nextBtn.style.display = this.currentPage < this.totalPages ? 'block' : 'none';
        if (submitBtn) submitBtn.style.display = this.currentPage === this.totalPages ? 'block' : 'none';

        this.updateProgress();
    }

    updateProgress() {
        const progressFill = document.getElementById('progressFill');
        const currentStep = document.getElementById('currentStep');
        const totalSteps = document.getElementById('totalSteps');

        if (progressFill) {
            const percentage = (this.currentPage / this.totalPages) * 100;
            progressFill.style.width = `${percentage}%`;
        }

        if (currentStep) currentStep.textContent = this.currentPage;
        if (totalSteps) totalSteps.textContent = this.totalPages;
    }

    validateCurrentPage() {
        const currentPageEl = document.getElementById(`page${this.currentPage}`);
        if (!currentPageEl) return false;

        const requiredFields = currentPageEl.querySelectorAll('[required]');
        for (let field of requiredFields) {
            if (!field.value.trim()) {
                field.focus();
                field.style.borderColor = '#dc2626';
                setTimeout(() => {
                    field.style.borderColor = '#333';
                }, 3000);
                return false;
            }
        }
        return true;
    }

    collectCurrentPageData() {
        const currentPageEl = document.getElementById(`page${this.currentPage}`);
        if (!currentPageEl) return;

        const inputs = currentPageEl.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            if (input.type === 'checkbox') {
                if (!this.assessmentData.securityConcerns) {
                    this.assessmentData.securityConcerns = [];
                }
                if (input.checked && !this.assessmentData.securityConcerns.includes(input.value)) {
                    this.assessmentData.securityConcerns.push(input.value);
                }
            } else {
                this.assessmentData[input.id] = input.value;
            }
        });
    }

    submitAssessment() {
        if (!this.validateCurrentPage()) return;

        this.collectCurrentPageData();

        // Prepare form data for Formspree
        const formData = new FormData();
        formData.append('form_type', 'security_assessment');
        formData.append('source_url', window.location.href);
        formData.append('timestamp', new Date().toISOString());

        // Add all assessment data
        Object.keys(this.assessmentData).forEach(key => {
            if (Array.isArray(this.assessmentData[key])) {
                formData.append(key, this.assessmentData[key].join(', '));
            } else {
                formData.append(key, this.assessmentData[key]);
            }
        });

        // Submit to Formspree security endpoint
        fetch('https://formspree.io/p/2837001675602918616/f/security', {
            method: 'POST',
            body: formData,
            headers: {
                'Accept': 'application/json'
            }
        })
        .then(response => response.json())
        .then(data => {
            this.showSuccessMessage();
            setTimeout(() => {
                this.close();
            }, 3000);
        })
        .catch(error => {
            console.error('Error:', error);
            this.showErrorMessage();
        });
    }

    showSuccessMessage() {
        const content = document.querySelector('.modal-content');
        if (content) {
            content.innerHTML = `
                <div style="text-align: center; padding: 3rem;">
                    <div style="color: #10b981; font-size: 3rem; margin-bottom: 1rem;">✓</div>
                    <h3 style="color: white; margin-bottom: 1rem;">Assessment Submitted Successfully!</h3>
                    <p style="color: #b0b0b0;">Thank you for your submission. Our security team will review your assessment and contact you within 24-48 hours with a customized security plan.</p>
                </div>
            `;
        }
    }

    showErrorMessage() {
        const content = document.querySelector('.modal-content');
        if (content) {
            content.innerHTML = `
                <div style="text-align: center; padding: 3rem;">
                    <div style="color: #dc2626; font-size: 3rem; margin-bottom: 1rem;">✗</div>
                    <h3 style="color: white; margin-bottom: 1rem;">Submission Error</h3>
                    <p style="color: #b0b0b0;">There was an error submitting your assessment. Please try again or contact us directly at security@backus.agency</p>
                    <button class="nav-btn nav-btn-primary" onclick="securityModal.close()" style="margin-top: 2rem;">Close</button>
                </div>
            `;
        }
    }

    resetForm() {
        this.currentPage = 1;
        this.assessmentData = {};
        this.updateDisplay();

        // Reset all form fields
        const modal = document.getElementById('securityAssessmentModal');
        if (modal) {
            const inputs = modal.querySelectorAll('input, select, textarea');
            inputs.forEach(input => {
                if (input.type === 'checkbox') {
                    input.checked = false;
                } else {
                    input.value = '';
                }
            });
        }
    }

    attachEventListeners() {
        // Close modal when clicking outside
        document.addEventListener('click', (e) => {
            const modal = document.getElementById('securityAssessmentModal');
            if (e.target === modal) {
                this.close();
            }
        });

        // Close modal with escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.close();
            }
        });
    }
}

// Initialize the security modal
let securityModal;
document.addEventListener('DOMContentLoaded', () => {
    securityModal = new SecurityModal();
});

// Export for global access
window.securityModal = securityModal;