// Production Configuration - Baby Shower RSVP System
// All sensitive config centralized here
// Frontend security is limited; backend validation required

window.APP_CONFIG = {
    // Google Apps Script Web App URL
    SCRIPT_URL: "https://script.google.com/macros/s/AKfycbzc8rO36NNIHHnD98sTyTt3eLCvw4xEkl2r2A4VGLVU2vWRiGjXWtoqWcgZ_pq0Hkvp/exec",
    
    // Secret key for API validation (backend must validate)
    SECRET_KEY: "MALANI_RSVP_2026_SECURE",
    
    // Event details
    EVENT_DATE: "2026-06-28T10:00:00",
    EVENT_TITLE: "Tarang & Vidhi Baby Shower",
    
    // Dashboard auth session key
    AUTH_SESSION_KEY: "babyShowerAuth",
    
    // Reminder schedule (in days before event)
    REMINDER_SCHEDULE: [30, 7, 1]
};

Object.freeze(window.APP_CONFIG);
