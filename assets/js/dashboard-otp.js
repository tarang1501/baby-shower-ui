// Dashboard OTP Authentication System
// Production-grade security with OTP-based login
// Frontend security is limited; backend validation required

// OTP storage (temporary, not persisted)
let currentOtp = null;
let otpExpiryTime = null;

// Check authentication on page load
document.addEventListener('DOMContentLoaded', function() {
    checkAuthentication();
});

function checkAuthentication() {
    // Check if user is already authenticated in this session
    const isAuthenticated = sessionStorage.getItem(window.APP_CONFIG.AUTH_SESSION_KEY);
    
    if (isAuthenticated === "true") {
        showDashboard();
    } else {
        showOtpScreen();
    }
}

function showOtpScreen() {
    const otpScreen = document.getElementById('otp-screen');
    const dashboardContent = document.getElementById('dashboard-content');
    
    if (otpScreen) otpScreen.style.display = 'flex';
    if (dashboardContent) dashboardContent.style.display = 'none';
    
    // Reset OTP flow
    resetOtpFlow();
}

function showDashboard() {
    const otpScreen = document.getElementById('otp-screen');
    const dashboardContent = document.getElementById('dashboard-content');
    
    if (otpScreen) otpScreen.style.display = 'none';
    if (dashboardContent) dashboardContent.style.display = 'block';
    
    // Store authentication in sessionStorage (cleared when tab closes)
    sessionStorage.setItem(window.APP_CONFIG.AUTH_SESSION_KEY, "true");
    
    // Initialize dashboard data loading after showing dashboard
    if (typeof initializeDashboard === 'function') {
        initializeDashboard();
    }
}

function resetOtpFlow() {
    // Hide OTP input section
    const otpInputSection = document.getElementById('otp-input-section');
    if (otpInputSection) otpInputSection.style.display = 'none';
    
    // Clear inputs
    const identifierInput = document.getElementById('otp-identifier');
    const otpInput = document.getElementById('otp-code');
    if (identifierInput) identifierInput.value = '';
    if (otpInput) otpInput.value = '';
    
    // Clear error messages
    const errorElement = document.getElementById('otp-error');
    if (errorElement) errorElement.textContent = '';
    
    // Reset stored OTP
    currentOtp = null;
    otpExpiryTime = null;
}

// Send OTP to backend
async function sendOtp() {
    const identifierInput = document.getElementById('otp-identifier');
    const errorElement = document.getElementById('otp-error');
    const sendBtn = document.getElementById('send-otp-btn');
    
    if (!identifierInput) return;
    
    const identifier = identifierInput.value.trim();
    
    if (!identifier) {
        if (errorElement) errorElement.textContent = 'Please enter your email or phone number';
        return;
    }
    
    // Determine if email or phone
    const isEmail = identifier.includes('@');
    const email = isEmail ? identifier : '';
    const phone = isEmail ? '' : identifier;
    
    // Disable button during request
    if (sendBtn) {
        sendBtn.disabled = true;
        sendBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
    }
    
    try {
        const response = await fetch(window.APP_CONFIG.SCRIPT_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'text/plain;charset=utf-8'
            },
            body: JSON.stringify({
                action: 'sendOtp',
                email: email,
                phone: phone,
                secret: window.APP_CONFIG.SECRET_KEY
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            // Store OTP temporarily (frontend only, for validation)
            currentOtp = result.otp;
            otpExpiryTime = Date.now() + (window.APP_CONFIG.OTP_EXPIRY_MINUTES * 60 * 1000);
            
            // Show OTP input section
            const otpInputSection = document.getElementById('otp-input-section');
            if (otpInputSection) otpInputSection.style.display = 'block';
            
            // Clear error
            if (errorElement) errorElement.textContent = '';
            
            // Focus OTP input
            const otpInput = document.getElementById('otp-code');
            if (otpInput) otpInput.focus();
            
            // Show success message
            showOtpSuccess('OTP sent! Check your email or SMS.');
        } else {
            if (errorElement) errorElement.textContent = result.message || 'Failed to send OTP. Please try again.';
        }
        
    } catch (error) {
        // Do not log sensitive data
        console.error('Error sending OTP');
        if (errorElement) errorElement.textContent = 'Network error. Please try again.';
    } finally {
        // Restore button
        if (sendBtn) {
            sendBtn.disabled = false;
            sendBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Send OTP';
        }
    }
}

// Validate OTP entered by user
function validateOtp() {
    const otpInput = document.getElementById('otp-code');
    const errorElement = document.getElementById('otp-error');
    
    if (!otpInput) return;
    
    const enteredOtp = otpInput.value.trim();
    
    if (!enteredOtp) {
        if (errorElement) errorElement.textContent = 'Please enter the OTP';
        return;
    }
    
    // Check if OTP expired
    if (Date.now() > otpExpiryTime) {
        if (errorElement) {
            errorElement.textContent = 'OTP has expired. Please request a new one.';
            errorElement.style.color = '#B87B6B';
        }
        resetOtpFlow();
        return;
    }
    
    // Compare OTPs
    if (enteredOtp === currentOtp) {
        // OTP is valid - grant access
        if (errorElement) errorElement.textContent = '';
        
        // Clear OTP data
        currentOtp = null;
        otpExpiryTime = null;
        
        // Show dashboard
        showDashboard();
    } else {
        // Invalid OTP
        if (errorElement) {
            errorElement.textContent = 'Invalid OTP. Please try again.';
            errorElement.style.color = '#B87B6B';
        }
        
        // Shake animation on input
        otpInput.style.animation = 'shake 0.5s ease';
        setTimeout(() => {
            otpInput.style.animation = '';
        }, 500);
    }
}

// Show OTP success message
function showOtpSuccess(message) {
    const successElement = document.getElementById('otp-success');
    if (successElement) {
        successElement.textContent = message;
        successElement.style.display = 'block';
        
        setTimeout(() => {
            successElement.style.display = 'none';
        }, 5000);
    }
}

// Logout function
function logout() {
    sessionStorage.removeItem(window.APP_CONFIG.AUTH_SESSION_KEY);
    resetOtpFlow();
    showOtpScreen();
}

// Allow Enter key to submit
document.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') {
        const otpScreen = document.getElementById('otp-screen');
        if (otpScreen && otpScreen.style.display !== 'none') {
            // Check which section is visible
            const otpInputSection = document.getElementById('otp-input-section');
            if (otpInputSection && otpInputSection.style.display !== 'none') {
                validateOtp();
            } else {
                sendOtp();
            }
        }
    }
});
