// Production Configuration - Baby Shower RSVP System
// All sensitive config centralized here
// Frontend security is limited; backend validation required

window.APP_CONFIG = {
    // Google Apps Script Web App URL
    SCRIPT_URL: "https://script.google.com/macros/s/AKfycbzA3LG567hFlkAaF7UAvMCAo7vsZy-kVxi24ZOarrO0hUy-vHkkZsKLmcFlfSlIxsYd/exec",
    
    // Secret key for API validation (backend must validate)
    SECRET_KEY: "MALANI_RSVP_2026_SECURE",
    
    // Event details
    EVENT_DATE: "2026-06-28T09:30:00",
    EVENT_TITLE: "Tarang & Vidhi Baby Shower",
    
    // OTP settings
    OTP_EXPIRY_MINUTES: 10,
    
    // Dashboard auth session key
    AUTH_SESSION_KEY: "babyShowerAuth",
    
    // Reminder schedule (in days before event)
    REMINDER_SCHEDULE: [30, 7, 1]
};

// Prevent modification of config
Object.freeze(window.APP_CONFIG);
