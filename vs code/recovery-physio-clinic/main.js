 /**
 * Recovery Physiotherapy Clinic - Main JavaScript
 * Handles form submissions, mobile menu, smooth scrolling, and UI interactions
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize all functions
    initMobileMenu();
    initSmoothScrolling();
    initBackToTop();
    initHeaderScroll();
    initAppointmentForm();
    initContactForm();
    initNewsletterForm();
});

/**
 * Mobile Menu Toggle
 */
function initMobileMenu() {
    const hamburger = document.querySelector('.hamburger');
    const mobileMenu = document.querySelector('.mobile-menu');
    const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');

    if (hamburger && mobileMenu) {
        hamburger.addEventListener('click', function() {
            hamburger.classList.toggle('active');
            mobileMenu.classList.toggle('active');
            document.body.style.overflow = mobileMenu.classList.contains('active') ? 'hidden' : '';
        });

        // Close menu when clicking on a link
        mobileNavLinks.forEach(link => {
            link.addEventListener('click', function() {
                hamburger.classList.remove('active');
                mobileMenu.classList.remove('active');
                document.body.style.overflow = '';
            });
        });

        // Close menu when clicking outside
        document.addEventListener('click', function(e) {
            if (!hamburger.contains(e.target) && !mobileMenu.contains(e.target)) {
                hamburger.classList.remove('active');
                mobileMenu.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    }
}

/**
 * Smooth Scrolling for Navigation Links
 */
function initSmoothScrolling() {
    const navLinks = document.querySelectorAll('.nav-link, .mobile-nav-link, a[href^="#"]');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            
            if (targetId && targetId.startsWith('#') && targetId !== '#') {
                e.preventDefault();
                const targetElement = document.querySelector(targetId);
                
                if (targetElement) {
                    const headerHeight = document.querySelector('.header').offsetHeight;
                    const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - headerHeight;
                    
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                }
            }
        });
    });
}

/**
 * Back to Top Button
 */
function initBackToTop() {
    const backToTopBtn = document.getElementById('backToTop');
    
    if (backToTopBtn) {
        // Show/hide button based on scroll position
        window.addEventListener('scroll', function() {
            if (window.pageYOffset > 300) {
                backToTopBtn.classList.add('show');
            } else {
                backToTopBtn.classList.remove('show');
            }
        });

        // Scroll to top when clicked
        backToTopBtn.addEventListener('click', function() {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
}

/**
 * Header Scroll Effect
 */
function initHeaderScroll() {
    const header = document.querySelector('.header');
    
    if (header) {
        window.addEventListener('scroll', function() {
            if (window.pageYOffset > 50) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        });
    }
}

/**
 * Appointment Form Submission - Redirect to WhatsApp
 */
function initAppointmentForm() {
    const form = document.getElementById('appointmentForm');
    const formSuccess = document.getElementById('formSuccess');
    
    // WhatsApp number (without + or spaces)
    const whatsappNumber = '6352071040';
    
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Clear previous errors
            clearErrors();
            
            // Get form data
            const formData = {
                name: document.getElementById('name').value.trim(),
                email: document.getElementById('email').value.trim(),
                phone: document.getElementById('phone').value.trim(),
                service: document.getElementById('service').value,
                date: document.getElementById('date').value,
                message: document.getElementById('message').value.trim()
            };
            
            // Validate form
            let isValid = true;
            
            if (!formData.name) {
                showError('nameError', 'Please enter your name');
                isValid = false;
            }
            
            if (!formData.email) {
                showError('emailError', 'Please enter your email');
                isValid = false;
            } else if (!isValidEmail(formData.email)) {
                showError('emailError', 'Please enter a valid email');
                isValid = false;
            }
            
            if (!formData.phone) {
                showError('phoneError', 'Please enter your phone number');
                isValid = false;
            }
            
            if (!formData.service) {
                showError('serviceError', 'Please select a service');
                isValid = false;
            }
            
            if (!isValid) return;
            
            // Create WhatsApp message
            const serviceNames = {
                'spine': 'Spine Rehabilitation',
                'sports': 'Sports Therapy',
                'neuro': 'Neuro Rehabilitation',
                'consultation': 'Nutrition Consultations'
            };
            
            const serviceName = serviceNames[formData.service] || formData.service;
            
            const message = `*New Appointment Request*\n\n` +
                `Name: ${formData.name}\n` +
                `Email: ${formData.email}\n` +
                `Phone: ${formData.phone}\n` +
                `Service: ${serviceName}\n` +
                `Preferred Date: ${formData.date || 'Not specified'}\n` +
                `Message: ${formData.message || 'No additional message'}`;
            
            // Redirect to WhatsApp
            const encodedMessage = encodeURIComponent(message);
            const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;
            
            // Open WhatsApp in new tab
            window.open(whatsappUrl, '_blank');
            
            // Show success message
            form.reset();
            formSuccess.classList.add('show');
            
            // Hide success message after 5 seconds
            setTimeout(() => {
                formSuccess.classList.remove('show');
            }, 5000);
        });
    }
}

/**
 * Contact Form Submission - Redirect to WhatsApp
 */
function initContactForm() {
    const form = document.getElementById('contactForm');
    
    // WhatsApp number (without + or spaces)
    const whatsappNumber = '6352071040';
    
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form data
            const formData = {
                name: document.getElementById('contact-name').value.trim(),
                email: document.getElementById('contact-email').value.trim(),
                subject: document.getElementById('contact-subject').value.trim(),
                message: document.getElementById('contact-message').value.trim()
            };
            
            // Validate form
            if (!formData.name || !formData.email || !formData.message) {
                alert('Please fill in all required fields.');
                return;
            }
            
            if (!isValidEmail(formData.email)) {
                alert('Please enter a valid email address.');
                return;
            }
            
            // Create WhatsApp message
            const message = `*New Contact Form Message*\n\n` +
                `Name: ${formData.name}\n` +
                `Email: ${formData.email}\n` +
                `Subject: ${formData.subject || 'No subject'}\n` +
                `Message: ${formData.message}`;
            
            // Redirect to WhatsApp
            const encodedMessage = encodeURIComponent(message);
            const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;
            
            // Open WhatsApp in new tab
            window.open(whatsappUrl, '_blank');
            
            // Show success message
            alert('Message prepared for WhatsApp! We will get back to you soon.');
            form.reset();
        });
    }
}

/**
 * Newsletter Form Submission - Redirect to WhatsApp
 */
function initNewsletterForm() {
    const forms = document.querySelectorAll('.newsletter-form');
    
    // WhatsApp number (without + or spaces)
    const whatsappNumber = '6352071040';
    
    forms.forEach(form => {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const emailInput = form.querySelector('input[type="email"]');
            const email = emailInput.value.trim();
            
            if (!email) {
                alert('Please enter your email address.');
                return;
            }
            
            if (!isValidEmail(email)) {
                alert('Please enter a valid email address.');
                return;
            }
            
            // Create WhatsApp message
            const message = `*New Newsletter Subscription*\n\n` +
                `Email: ${email}`;
            
            // Redirect to WhatsApp
            const encodedMessage = encodeURIComponent(message);
            const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;
            
            // Open WhatsApp in new tab
            window.open(whatsappUrl, '_blank');
            
            // Show success message
            alert('Thank you for subscribing to our newsletter!');
            emailInput.value = '';
        });
    });
}

/**
 * Helper Functions
 */
function showError(elementId, message) {
    const errorElement = document.getElementById(elementId);
    if (errorElement) {
        errorElement.textContent = message;
    }
}

function clearErrors() {
    const errorElements = document.querySelectorAll('.error-message');
    errorElements.forEach(el => el.textContent = '');
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Active Navigation Link on Scroll
 */
window.addEventListener('scroll', function() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');
    
    let current = '';
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        
        if (pageYOffset >= (sectionTop - 200)) {
            current = section.getAttribute('id');
        }
    });
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === '#' + current) {
            link.classList.add('active');
        }
    });
});
