// Simple Contact Form Handler - No console spam
(function() {
    'use strict';

    // Wait for DOM to be ready
    function initializeForm() {
        const contactForm = document.getElementById('contact-form');
        const newsletterForm = document.querySelector('.newsletter-form');

        if (contactForm) {
            // Remove any existing action attribute
            contactForm.removeAttribute('action');

            // Handle form submission
            contactForm.addEventListener('submit', function(e) {
                e.preventDefault();

                // Get form data
                const formData = new FormData(contactForm);
                const data = {};
                formData.forEach((value, key) => {
                    data[key] = value;
                });

                // Get message container
                let messageDiv = contactForm.querySelector('.form-message');
                if (!messageDiv) {
                    messageDiv = document.createElement('div');
                    messageDiv.className = 'form-message';
                    contactForm.appendChild(messageDiv);
                }

                // Show loading state
                messageDiv.style.display = 'block';
                messageDiv.className = 'form-message text-yellow-500 mt-4';
                messageDiv.textContent = 'Sending message...';

                // Submit to Formspree
                fetch('https://formspree.io/f/xkgwbjpq', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify(data)
                })
                .then(response => {
                    if (response.ok) {
                        messageDiv.className = 'form-message text-green-500 mt-4';
                        messageDiv.textContent = 'Thank you! Your message has been sent successfully.';
                        contactForm.reset();
                    } else {
                        throw new Error('Form submission failed');
                    }
                })
                .catch(error => {
                    messageDiv.className = 'form-message text-red-500 mt-4';
                    messageDiv.textContent = 'Sorry, there was an error sending your message. Please try again.';
                });
            });
        }

        if (newsletterForm) {
            newsletterForm.addEventListener('submit', function(e) {
                e.preventDefault();

                const formData = new FormData(newsletterForm);
                const data = {};
                formData.forEach((value, key) => {
                    data[key] = value;
                });

                let messageDiv = newsletterForm.querySelector('.form-message');
                if (!messageDiv) {
                    messageDiv = document.createElement('div');
                    messageDiv.className = 'form-message';
                    newsletterForm.appendChild(messageDiv);
                }

                messageDiv.style.display = 'block';
                messageDiv.className = 'form-message text-yellow-500 mt-2';
                messageDiv.textContent = 'Subscribing...';

                fetch('https://formspree.io/f/mjkbvvgr', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify(data)
                })
                .then(response => {
                    if (response.ok) {
                        messageDiv.className = 'form-message text-green-500 mt-2';
                        messageDiv.textContent = 'Thank you for subscribing!';
                        newsletterForm.reset();
                    } else {
                        throw new Error('Subscription failed');
                    }
                })
                .catch(error => {
                    messageDiv.className = 'form-message text-red-500 mt-2';
                    messageDiv.textContent = 'Sorry, there was an error. Please try again.';
                });
            });
        }
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeForm);
    } else {
        initializeForm();
    }
})();