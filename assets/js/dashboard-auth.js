// Dashboard Authentication - Password Protection
// Configurable password - change this value
const DASHBOARD_PASSWORD = "MalaniBaby@2026!";
const SESSION_KEY = "dashboardAuthenticated";

// Check authentication on page load
document.addEventListener('DOMContentLoaded', function() {
    checkAuthentication();
});

function checkAuthentication() {
    // Check if user is already authenticated in this session
    const isAuthenticated = sessionStorage.getItem(SESSION_KEY);
    
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
    
    // Store authentication in sessionStorage (cleared when tab closes)
    sessionStorage.setItem(SESSION_KEY, "true");
    
    // Initialize dashboard data loading after showing dashboard
    if (typeof initializeDashboard === 'function') {
        initializeDashboard();
    }
}

function checkPassword() {
    const passwordInput = document.getElementById('dashboard-password');
    const errorElement = document.getElementById('password-error');
    
    if (!passwordInput) return;
    
    const enteredPassword = passwordInput.value;
    
    if (enteredPassword === DASHBOARD_PASSWORD) {
        // Clear error message
        if (errorElement) errorElement.textContent = '';
        
        // Show dashboard
        showDashboard();
        
        // Clear password input
        passwordInput.value = '';
    } else {
        // Show error message
        if (errorElement) {
            errorElement.textContent = 'Incorrect password. Please try again.';
            errorElement.style.color = '#B87B6B';
        }
        
        // Shake animation on input
        passwordInput.style.animation = 'shake 0.5s ease';
        setTimeout(() => {
            passwordInput.style.animation = '';
        }, 500);
    }
}

// Allow Enter key to submit password
document.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' && document.getElementById('password-screen').style.display !== 'none') {
        checkPassword();
    }
});

// Logout function (optional - can be called from a logout button)
function logout() {
    sessionStorage.removeItem(SESSION_KEY);
    showPasswordScreen();
}
