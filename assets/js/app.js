// Baby Shower Website Main JavaScript
// Main invitation page functionality

// Global variables
let guests = [];
let isPlaying = false;

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    loadGuests();
    initializeCountdown();
    initializeRSVPForm();
    initializeMusicToggle();
    initializeScrollEffects();
}

// Load guests from localStorage or fallback to JSON
async function loadGuests() {
    try {
        // First try to load from localStorage
        const storedGuests = localStorage.getItem('babyShowerGuests');
        if (storedGuests) {
            guests = JSON.parse(storedGuests);
        } else {
            // Fallback to JSON file (for initial data)
            const response = await fetch('assets/data/guests.json');
            if (response.ok) {
                guests = await response.json();
            }
        }
    } catch (error) {
        console.error('Error loading guests:', error);
        guests = [];
    }
}

// Countdown Timer
function initializeCountdown() {
    // Set the event date (June 28, 2026, 9:30 AM)
    const eventDate = new Date('June 28, 2026 09:30:00').getTime();
    
    function updateCountdown() {
        const now = new Date().getTime();
        const distance = eventDate - now;
        
        if (distance < 0) {
            document.getElementById('days').textContent = '00';
            document.getElementById('hours').textContent = '00';
            document.getElementById('minutes').textContent = '00';
            document.getElementById('seconds').textContent = '00';
            return;
        }
        
        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);
        
        document.getElementById('days').textContent = String(days).padStart(2, '0');
        document.getElementById('hours').textContent = String(hours).padStart(2, '0');
        document.getElementById('minutes').textContent = String(minutes).padStart(2, '0');
        document.getElementById('seconds').textContent = String(seconds).padStart(2, '0');
    }
    
    // Update immediately, then every second
    updateCountdown();
    setInterval(updateCountdown, 1000);
}

// RSVP Form Handling
function initializeRSVPForm() {
    const form = document.getElementById('rsvp-form');
    const successMessage = document.getElementById('success-message');
    
    if (!form) return;
    
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Get form data
        const formData = new FormData(form);
        const guestData = {
            firstName: formData.get('firstName').trim(),
            lastName: formData.get('lastName').trim(),
            phone: formData.get('phone').trim(),
            email: formData.get('email').trim(),
            adults: parseInt(formData.get('adults')) || 0,
            kids: parseInt(formData.get('kids')) || 0,
            note: formData.get('note').trim()
        };
        
        // Validate required fields
        if (!validateRSVPForm(guestData)) {
            return;
        }
        
        // Show loading state
        const submitBtn = form.querySelector('.btn-submit');
        const originalBtnText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';
        submitBtn.disabled = true;
        
        // Submit to Google Apps Script
        try {
            const response = await submitToGoogleSheets(guestData);
            
            if (response.success) {
                // Show success message
                showSuccessMessage(response.message || 'Thank you! Your RSVP has been received.');
                
                // Reset form
                form.reset();
            } else {
                showError(response.message || 'There was an error submitting your RSVP. Please try again.');
            }
            
        } catch (error) {
            console.error('Error submitting RSVP:', error);
            showError('There was an error submitting your RSVP. Please try again.');
        } finally {
            // Restore button state
            submitBtn.innerHTML = originalBtnText;
            submitBtn.disabled = false;
        }
    });
}

// Submit to Google Apps Script Web App
async function submitToGoogleSheets(data) {
    const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyEF842TLjaQfxPp7CZvrAWxD31vt3fFeWzgnb9n14hT_cdjixkTueV22nyfwfoGUuw/exec';
    
    try {
        const response = await fetch(APPS_SCRIPT_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'text/plain;charset=utf-8'
            },
            body: JSON.stringify(data)
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        return result;
        
    } catch (error) {
        console.error('Error submitting to Google Sheets:', error);
        return { success: false, message: 'Network error. Please try again.' };
    }
}

function validateRSVPForm(data) {
    const errors = [];
    
    if (!data.firstName) errors.push('First name is required');
    if (!data.phone) errors.push('Phone number is required');
    
    // Validate phone format
    if (data.phone && !isValidPhone(data.phone)) {
        errors.push('Please enter a valid phone number');
    }
    
    // Validate email format only if email is provided (optional field)
    if (data.email && !isValidEmail(data.email)) {
        errors.push('Please enter a valid email address');
    }
    
    // Validate adults and kids are numbers
    if (typeof data.adults !== 'number' || data.adults < 0) {
        errors.push('Please enter a valid number of adults');
    }
    if (typeof data.kids !== 'number' || data.kids < 0) {
        errors.push('Please enter a valid number of kids');
    }
    
    if (errors.length > 0) {
        showError(errors.join('\n'));
        return false;
    }
    
    return true;
}

function isValidPhone(phone) {
    // Basic phone validation (can be enhanced)
    const phoneRegex = /^[\d\s\-\+\(\)]+$/;
    return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 10;
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function showSuccessMessage(message = 'Thank you! Your RSVP has been received.') {
    const successMessage = document.getElementById('success-message');
    
    // Update message text
    const messageEl = successMessage.querySelector('p') || successMessage;
    if (messageEl.tagName === 'P') {
        messageEl.textContent = message;
    }
    
    successMessage.classList.add('show');
    
    // Add WhatsApp confirmation button
    addWhatsAppButton();
    
    // Scroll to success message
    successMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });
    
    // Hide after 8 seconds (longer to allow WhatsApp click)
    setTimeout(() => {
        successMessage.classList.remove('show');
        // Remove WhatsApp button when hiding
        const whatsappBtn = document.getElementById('whatsapp-confirm-btn');
        if (whatsappBtn) whatsappBtn.remove();
    }, 8000);
}

function showError(message) {
    // Create error element
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.innerHTML = `
        <i class="fas fa-exclamation-circle"></i>
        <p>${message}</p>
    `;
    
    // Style the error message
    errorDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #f44336;
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 10px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.2);
        z-index: 10000;
        max-width: 400px;
        animation: slideInRight 0.3s ease;
    `;
    
    document.body.appendChild(errorDiv);
    
    // Remove after 5 seconds
    setTimeout(() => {
        errorDiv.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => errorDiv.remove(), 300);
    }, 5000);
}

// Add WhatsApp confirmation button
function addWhatsAppButton() {
    const successMessage = document.getElementById('success-message');
    
    // Remove existing button if any
    const existingBtn = document.getElementById('whatsapp-confirm-btn');
    if (existingBtn) existingBtn.remove();
    
    const whatsappBtn = document.createElement('button');
    whatsappBtn.id = 'whatsapp-confirm-btn';
    whatsappBtn.className = 'btn-whatsapp';
    whatsappBtn.innerHTML = '<i class="fab fa-whatsapp"></i> Send WhatsApp Confirmation';
    whatsappBtn.onclick = openWhatsAppConfirmation;
    
    successMessage.appendChild(whatsappBtn);
}

// Open WhatsApp with confirmation message
function openWhatsAppConfirmation() {
    const message = "Hi, your RSVP for Tarang & Vidhi's Baby Shower on June 28, 2026 at 9:30 AM has been received. Hosted by Malani Family. Thank you!";
    const encodedMessage = encodeURIComponent(message);
    
    // Try to open WhatsApp
    const whatsappUrl = `https://wa.me/?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
}

// Music Toggle
function initializeMusicToggle() {
    const musicToggle = document.getElementById('music-toggle');
    const backgroundMusic = document.getElementById('background-music');
    
    if (!musicToggle || !backgroundMusic) return;
    
    // Try to autoplay on page load
    backgroundMusic.volume = 0.5; // Set volume to 50%
    backgroundMusic.play().then(() => {
        // Autoplay succeeded
        isPlaying = true;
        musicToggle.classList.add('playing');
        musicToggle.innerHTML = '<i class="fas fa-pause"></i>';
    }).catch(error => {
        // Autoplay blocked by browser, wait for user interaction
        console.log('Music autoplay blocked:', error);
    });
    
    musicToggle.addEventListener('click', function() {
        if (isPlaying) {
            backgroundMusic.pause();
            musicToggle.classList.remove('playing');
            musicToggle.innerHTML = '<i class="fas fa-music"></i>';
        } else {
            backgroundMusic.play().catch(error => {
                console.log('Music playback error:', error);
                showError('Music playback was blocked by your browser. Click to enable.');
            });
            musicToggle.classList.add('playing');
            musicToggle.innerHTML = '<i class="fas fa-pause"></i>';
        }
        isPlaying = !isPlaying;
    });
    
    // Handle music end - loop it
    backgroundMusic.addEventListener('ended', function() {
        backgroundMusic.currentTime = 0;
        backgroundMusic.play().catch(() => {});
    });
}

// Scroll Effects
function initializeScrollEffects() {
    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
    
    // Add scroll animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    // Observe sections
    document.querySelectorAll('section').forEach(section => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(30px)';
        section.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(section);
    });
}

// Edit RSVP Lookup - Find existing RSVP by phone and prefill form
async function lookupRSVPByPhone(phone) {
    const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyEF842TLjaQfxPp7CZvrAWxD31vt3fFeWzgnb9n14hT_cdjixkTueV22nyfwfoGUuw/exec';
    
    try {
        const response = await fetch(APPS_SCRIPT_URL, {
            method: 'GET',
            headers: { 'Accept': 'application/json' }
        });
        
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
        const result = await response.json();
        
        if (result.success && Array.isArray(result.rows)) {
            const normalizedPhone = phone.replace(/\D/g, '');
            return result.rows.find(g => g.phone && g.phone.replace(/\D/g, '') === normalizedPhone) || null;
        }
        return null;
    } catch (error) {
        console.error('Error looking up RSVP:', error);
        return null;
    }
}

function prefillRSVPForm(guestData) {
    const form = document.getElementById('rsvp-form');
    if (!form || !guestData) return;
    
    form.querySelector('[name="firstName"]').value = guestData.firstName || '';
    form.querySelector('[name="lastName"]').value = guestData.lastName || '';
    form.querySelector('[name="phone"]').value = guestData.phone || '';
    form.querySelector('[name="email"]').value = guestData.email || '';
    form.querySelector('[name="adults"]').value = guestData.adults || 0;
    form.querySelector('[name="kids"]').value = guestData.kids || 0;
    form.querySelector('[name="note"]').value = guestData.note || '';
    
    form.scrollIntoView({ behavior: 'smooth', block: 'center' });
    showUpdateModeIndicator();
}

function showUpdateModeIndicator() {
    const existing = document.getElementById('update-mode-indicator');
    if (existing) existing.remove();
    
    const indicator = document.createElement('div');
    indicator.id = 'update-mode-indicator';
    indicator.className = 'update-mode-indicator';
    indicator.innerHTML = '<i class="fas fa-edit"></i> Update Mode: Editing existing RSVP';
    
    const form = document.getElementById('rsvp-form');
    if (form) form.insertBefore(indicator, form.firstChild);
}

// Edit RSVP UI Handlers
function showEditLookup(event) {
    event.preventDefault();
    const lookupForm = document.getElementById('edit-lookup-form');
    if (lookupForm) {
        lookupForm.style.display = lookupForm.style.display === 'none' ? 'flex' : 'none';
    }
}

async function handleEditLookup() {
    const phoneInput = document.getElementById('lookup-phone');
    const phone = phoneInput.value.trim();
    
    if (!phone) {
        showError('Please enter your phone number');
        return;
    }
    
    // Show loading
    const btn = document.querySelector('#edit-lookup-form button');
    const originalText = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Looking up...';
    btn.disabled = true;
    
    try {
        const guestData = await lookupRSVPByPhone(phone);
        
        if (guestData) {
            prefillRSVPForm(guestData);
            document.getElementById('edit-lookup-form').style.display = 'none';
            phoneInput.value = '';
            showSuccessMessage('RSVP found! You can now update your details.');
        } else {
            showError('No RSVP found with that phone number. Please submit a new RSVP.');
        }
    } catch (error) {
        console.error('Error looking up RSVP:', error);
        showError('Error looking up RSVP. Please try again.');
    } finally {
        btn.innerHTML = originalText;
        btn.disabled = false;
    }
}


// Utility functions
function formatPhoneNumber(input) {
    const phoneNumber = input.value.replace(/\D/g, '');
    const phoneNumberLength = phoneNumber.length;
    
    if (phoneNumberLength < 4) return phoneNumber;
    if (phoneNumberLength < 7) return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3)}`;
    return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3, 6)}-${phoneNumber.slice(6, 10)}`;
}

// Counter input function for adults/kids +/- buttons
function updateCounter(fieldId, change) {
    const input = document.getElementById(fieldId);
    if (!input) return;
    
    let value = parseInt(input.value) || 0;
    const min = parseInt(input.min) || 0;
    const max = parseInt(input.max) || 20;
    
    value += change;
    
    // Enforce min/max limits
    if (value < min) value = min;
    if (value > max) value = max;
    
    input.value = value;
}

// Add phone formatting to input
document.addEventListener('DOMContentLoaded', function() {
    const phoneInput = document.getElementById('phone');
    if (phoneInput) {
        phoneInput.addEventListener('input', function(e) {
            e.target.value = formatPhoneNumber(e.target);
        });
    }
});

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
    }
    
    @keyframes fadeOut {
        from { opacity: 1; }
        to { opacity: 0; }
    }
    
    @keyframes slideInRight {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOutRight {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
    
    .error-message {
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }
    
    .error-message i {
        font-size: 1.2rem;
    }
    
    .error-message p {
        margin: 0;
        line-height: 1.4;
    }
`;
document.head.appendChild(style);

// TODO: Backend integration functions
// These functions can be implemented later to connect to Google Sheets or a backend API

/*
async function submitToBackend(guestData) {
    // Example: Submit to Google Sheets API
    try {
        const response = await fetch('YOUR_GOOGLE_SHEETS_API_ENDPOINT', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(guestData)
        });
        
        if (!response.ok) {
            throw new Error('Failed to submit to backend');
        }
        
        return await response.json();
    } catch (error) {
        console.error('Backend submission error:', error);
        throw error;
    }
}

async function syncWithBackend() {
    // Example: Sync data with backend
    try {
        const response = await fetch('YOUR_SYNC_ENDPOINT');
        if (response.ok) {
            const backendGuests = await response.json();
            localStorage.setItem('babyShowerGuests', JSON.stringify(backendGuests));
            guests = backendGuests;
        }
    } catch (error) {
        console.error('Sync error:', error);
    }
}
*/
