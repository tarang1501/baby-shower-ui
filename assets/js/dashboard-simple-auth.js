// Dashboard Password Authentication
// Frontend sends password to backend for validation
// No password or hash stored in frontend

// Check authentication on page load
document.addEventListener('DOMContentLoaded', function() {
    checkAuthentication();
});

function checkAuthentication() {
    const isAuthenticated = sessionStorage.getItem('dashboardAuthenticated');
    
    if (isAuthenticated === "true") {
        showDashboard();
    } else {
        showPasswordScreen();
    }
}

function showPasswordScreen() {
    const passwordScreen = document.getElementById('password-screen');
    const dashboardContent = document.getElementById('dashboard-content');
    
    if (passwordScreen) passwordScreen.style.display = 'flex';
    if (dashboardContent) dashboardContent.style.display = 'none';
}

function showDashboard() {
    const passwordScreen = document.getElementById('password-screen');
    const dashboardContent = document.getElementById('dashboard-content');
    
    if (passwordScreen) passwordScreen.style.display = 'none';
    if (dashboardContent) dashboardContent.style.display = 'block';
    
    sessionStorage.setItem('dashboardAuthenticated', "true");
    
    if (typeof initializeDashboard === 'function') {
        initializeDashboard();
    }
}

// Send password to backend for validation
async function checkPassword() {
    const passwordInput = document.getElementById('dashboard-password');
    const errorElement = document.getElementById('password-error');
    const submitBtn = document.querySelector('#password-screen .btn-primary');
    
    if (!passwordInput) return;
    
    const enteredPassword = passwordInput.value.trim();
    
    if (!enteredPassword) {
        if (errorElement) errorElement.textContent = 'Please enter a password';
        return;
    }
    
    // Show loading state
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Validating...';
    }
    
    try {
        // Send password to backend for validation
        const response = await fetch(window.APP_CONFIG.SCRIPT_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'text/plain;charset=utf-8'
            },
            body: JSON.stringify({
                action: 'login',
                password: enteredPassword,
                secret: window.APP_CONFIG.SECRET_KEY
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            // Password validated by backend
            if (errorElement) errorElement.textContent = '';
            passwordInput.value = '';
            showDashboard();
        } else {
            // Invalid password
            if (errorElement) {
                errorElement.textContent = result.message || 'Incorrect password. Please try again.';
                errorElement.style.color = '#B87B6B';
            }
            
            // Shake animation
            passwordInput.style.animation = 'shake 0.5s ease';
            setTimeout(() => {
                passwordInput.style.animation = '';
            }, 500);
        }
        
    } catch (error) {
        console.error('Error validating password');
        if (errorElement) {
            errorElement.textContent = 'Network error. Please try again.';
        }
    } finally {
        // Restore button
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Access Dashboard';
        }
    }
}

// Logout function
function logout() {
    sessionStorage.removeItem('dashboardAuthenticated');
    showPasswordScreen();
}

// Allow Enter key to submit
document.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') {
        const passwordScreen = document.getElementById('password-screen');
        if (passwordScreen && passwordScreen.style.display !== 'none') {
            checkPassword();
        }
    }
});
