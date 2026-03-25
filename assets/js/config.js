// Production Configuration - Baby Shower RSVP System
// All sensitive config centralized here
// Frontend security is limited; backend validation required

window.APP_CONFIG = {
    // Google Apps Script Web App URL - Replace with your deployed script URL
    SCRIPT_URL: "YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE",
    
    // Secret key for API validation (backend must validate)
    // Change this in both frontend and backend to match
    SECRET_KEY: "YOUR_SECRET_KEY_HERE",
    
    // Event details - Update these for your event
    EVENT_DATE: "YYYY-MM-DDTHH:MM:SS",
    EVENT_TITLE: "Your Event Title",
    
    // Dashboard auth session key
    AUTH_SESSION_KEY: "yourEventAuth",
    
    // Reminder schedule (in days before event)
    REMINDER_SCHEDULE: [30, 7, 1]
};

Object.freeze(window.APP_CONFIG);
