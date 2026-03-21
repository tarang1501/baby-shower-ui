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
    initializeGallery();
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
    // Set the event date (April 14, 2024, 10:00 AM)
    const eventDate = new Date('April 14, 2024 10:00:00').getTime();
    
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
            attending: formData.get('attending'),
            familySide: formData.get('familySide'),
            note: formData.get('note').trim(),
            timestamp: new Date().toISOString()
        };
        
        // Validate required fields
        if (!validateRSVPForm(guestData)) {
            return;
        }
        
        // Save to localStorage
        try {
            guests.push(guestData);
            localStorage.setItem('babyShowerGuests', JSON.stringify(guests));
            
            // Show success message
            showSuccessMessage();
            
            // Reset form
            form.reset();
            
            // Log for debugging (in production, you might send to a server)
            console.log('RSVP submitted:', guestData);
            
            // TODO: Later replace with Google Sheets API or backend
            // await submitToBackend(guestData);
            
        } catch (error) {
            console.error('Error saving RSVP:', error);
            showError('There was an error saving your RSVP. Please try again.');
        }
    });
}

function validateRSVPForm(data) {
    const errors = [];
    
    if (!data.firstName) errors.push('First name is required');
    if (!data.lastName) errors.push('Last name is required');
    if (!data.phone) errors.push('Phone number is required');
    if (!data.attending) errors.push('Number of guests is required');
    if (!data.familySide) errors.push('Family side is required');
    
    // Validate phone format
    if (data.phone && !isValidPhone(data.phone)) {
        errors.push('Please enter a valid phone number');
    }
    
    // Validate email format if provided
    if (data.email && !isValidEmail(data.email)) {
        errors.push('Please enter a valid email address');
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

function showSuccessMessage() {
    const successMessage = document.getElementById('success-message');
    successMessage.classList.add('show');
    
    // Scroll to success message
    successMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });
    
    // Hide after 5 seconds
    setTimeout(() => {
        successMessage.classList.remove('show');
    }, 5000);
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

// Music Toggle
function initializeMusicToggle() {
    const musicToggle = document.getElementById('music-toggle');
    const backgroundMusic = document.getElementById('background-music');
    
    if (!musicToggle || !backgroundMusic) return;
    
    musicToggle.addEventListener('click', function() {
        if (isPlaying) {
            backgroundMusic.pause();
            musicToggle.classList.remove('playing');
            musicToggle.innerHTML = '<i class="fas fa-music"></i>';
        } else {
            // Note: Autoplay may be blocked by browsers
            backgroundMusic.play().catch(error => {
                console.log('Music autoplay blocked:', error);
                showError('Music playback was blocked by your browser. Click to enable.');
            });
            musicToggle.classList.add('playing');
            musicToggle.innerHTML = '<i class="fas fa-pause"></i>';
        }
        isPlaying = !isPlaying;
    });
    
    // Handle music end
    backgroundMusic.addEventListener('ended', function() {
        isPlaying = false;
        musicToggle.classList.remove('playing');
        musicToggle.innerHTML = '<i class="fas fa-music"></i>';
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

// Gallery Lightbox
function initializeGallery() {
    const galleryItems = document.querySelectorAll('.gallery-item');
    let currentImageIndex = 0;
    
    galleryItems.forEach((item, index) => {
        item.addEventListener('click', function() {
            currentImageIndex = index;
            createLightbox(this.querySelector('img').src, this.querySelector('img').alt);
        });
    });
}

function createLightbox(src, alt) {
    // Create lightbox elements
    const lightbox = document.createElement('div');
    lightbox.className = 'lightbox';
    lightbox.innerHTML = `
        <div class="lightbox-content">
            <img src="${src}" alt="${alt}">
            <button class="lightbox-close">&times;</button>
            <button class="lightbox-prev">&lt;</button>
            <button class="lightbox-next">&gt;</button>
        </div>
    `;
    
    // Add styles
    lightbox.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.9);
        z-index: 10000;
        display: flex;
        align-items: center;
        justify-content: center;
        animation: fadeIn 0.3s ease;
    `;
    
    const content = lightbox.querySelector('.lightbox-content');
    content.style.cssText = `
        position: relative;
        max-width: 90%;
        max-height: 90%;
    `;
    
    const img = lightbox.querySelector('img');
    img.style.cssText = `
        width: 100%;
        height: auto;
        max-height: 90vh;
        object-fit: contain;
    `;
    
    // Button styles
    const buttonStyle = `
        position: absolute;
        background: rgba(255,255,255,0.2);
        border: none;
        color: white;
        font-size: 2rem;
        width: 50px;
        height: 50px;
        border-radius: 50%;
        cursor: pointer;
        transition: all 0.3s ease;
        display: flex;
        align-items: center;
        justify-content: center;
    `;
    
    lightbox.querySelector('.lightbox-close').style.cssText = `
        ${buttonStyle}
        top: 20px;
        right: 20px;
    `;
    
    lightbox.querySelector('.lightbox-prev').style.cssText = `
        ${buttonStyle}
        top: 50%;
        left: 20px;
        transform: translateY(-50%);
    `;
    
    lightbox.querySelector('.lightbox-next').style.cssText = `
        ${buttonStyle}
        top: 50%;
        right: 20px;
        transform: translateY(-50%);
    `;
    
    document.body.appendChild(lightbox);
    document.body.style.overflow = 'hidden';
    
    // Event listeners
    lightbox.querySelector('.lightbox-close').addEventListener('click', closeLightbox);
    lightbox.querySelector('.lightbox-prev').addEventListener('click', previousImage);
    lightbox.querySelector('.lightbox-next').addEventListener('click', nextImage);
    lightbox.addEventListener('click', function(e) {
        if (e.target === lightbox) closeLightbox();
    });
    
    // Keyboard navigation
    document.addEventListener('keydown', handleLightboxKeyboard);
}

function closeLightbox() {
    const lightbox = document.querySelector('.lightbox');
    if (lightbox) {
        lightbox.style.animation = 'fadeOut 0.3s ease';
        setTimeout(() => {
            lightbox.remove();
            document.body.style.overflow = '';
            document.removeEventListener('keydown', handleLightboxKeyboard);
        }, 300);
    }
}

function nextImage() {
    const galleryItems = document.querySelectorAll('.gallery-item');
    currentImageIndex = (currentImageIndex + 1) % galleryItems.length;
    updateLightboxImage();
}

function previousImage() {
    const galleryItems = document.querySelectorAll('.gallery-item');
    currentImageIndex = (currentImageIndex - 1 + galleryItems.length) % galleryItems.length;
    updateLightboxImage();
}

function updateLightboxImage() {
    const galleryItems = document.querySelectorAll('.gallery-item');
    const img = document.querySelector('.lightbox img');
    if (img && galleryItems[currentImageIndex]) {
        const newSrc = galleryItems[currentImageIndex].querySelector('img').src;
        const newAlt = galleryItems[currentImageIndex].querySelector('img').alt;
        img.src = newSrc;
        img.alt = newAlt;
    }
}

function handleLightboxKeyboard(e) {
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowRight') nextImage();
    if (e.key === 'ArrowLeft') previousImage();
}

// Utility functions
function formatPhoneNumber(input) {
    const phoneNumber = input.value.replace(/\D/g, '');
    const phoneNumberLength = phoneNumber.length;
    
    if (phoneNumberLength < 4) return phoneNumber;
    if (phoneNumberLength < 7) return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3)}`;
    return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3, 6)}-${phoneNumber.slice(6, 10)}`;
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
